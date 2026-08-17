#!/usr/bin/env bun
/**
 * Supply-chain security verifier.
 *
 * Re-checks that every defense layer described in SUPPLY_CHAIN_SECURITY.md is
 * still wired and reports the current vulnerability / blocked-script state.
 * Writes a timestamped report to SECURITY_REPORT.md.
 *
 * Run before pulling new deps, before deploys, or routinely:
 *   bun run security:verify
 *
 * Exit code is 0 even when CVEs exist (transitive dev-dep advisories are
 * expected); it is non-zero only when a DEFENSE LAYER is missing/broken —
 * that is the signal that the repo is no longer hardened.
 */

import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => {
  try {
    return readFileSync(join(root, p), "utf8");
  } catch {
    return "";
  }
};
const run = (cmd) => {
  try {
    return execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    // bun audit exits non-zero when vulns exist; we still want its stdout.
    return `${e.stdout ?? ""}${e.stderr ?? ""}`;
  }
};

const checks = [];
const add = (name, ok, detail) => checks.push({ name, ok, detail });

// 1. bun >= 1.3 (older bun silently ignores the hardening keys)
const bunVer = run("bun --version").trim();
const [maj, min] = bunVer.split(".").map(Number);
add("bun >= 1.3", maj > 1 || (maj === 1 && min >= 3), `found ${bunVer || "unknown"}`);

// 2. Install cooldown configured
const bunfig = read("bunfig.toml");
const cooldownMatch = bunfig.match(/minimumReleaseAge\s*=\s*(\d+)/);
add(
  "Install cooldown (minimumReleaseAge)",
  Boolean(cooldownMatch),
  cooldownMatch
    ? `${cooldownMatch[1]}s (${(Number(cooldownMatch[1]) / 86400).toFixed(0)} days)`
    : "MISSING from bunfig.toml"
);

// 3. Socket scanner configured + installed
const scannerConfigured =
  /\[install\.security\][\s\S]*scanner\s*=\s*"@socketsecurity\/bun-security-scanner"/.test(bunfig);
const pkg = JSON.parse(read("package.json") || "{}");
const scannerInstalled = Boolean(pkg.devDependencies?.["@socketsecurity/bun-security-scanner"]);
add(
  "Socket pre-install scanner",
  scannerConfigured && scannerInstalled,
  `${scannerConfigured ? "configured" : "NOT configured"} / ${scannerInstalled ? "installed" : "NOT installed"}`
);

// 4. No reckless blanket trust
const trusted = pkg.trustedDependencies ?? [];
add(
  "Postinstall scripts not blanket-trusted",
  !trusted.includes("*") && !trusted.includes("--all"),
  trusted.length
    ? `${trusted.length} explicitly trusted`
    : "none explicitly trusted (bun default allow-list only)"
);

// 5. No install-time worm markers in the installed tree.
//
// Generic detector for the class of attack seen in the keyv/cacheable compromise
// (2026-08-04): the worm appends `"preinstall": "node setup.mjs"` to every
// package.json it poisons and ships `setup.mjs` + `Math_Symbol.js` alongside.
// We flag ANY install-time lifecycle script in a dependency, plus those two
// filenames, rather than pinning to that one campaign's package names.
const WORM_FILES = new Set(["setup.mjs", "Math_Symbol.js"]);
const INSTALL_HOOKS = ["preinstall", "install", "postinstall"];
// Dependencies we have reviewed and expect to declare an install hook (native
// binary downloads / platform builds). Anything OUTSIDE this list that grows a
// hook is the signal worth acting on — keep the list tight and re-review on add.
const EXPECTED_HOOK_PKGS = new Set(["@biomejs/biome", "@swc/core", "esbuild", "sharp", "workerd"]);
const wormHits = [];
const expectedHooks = new Set();

const scanPackageDir = (dir, rel) => {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isFile() && WORM_FILES.has(e.name))
      wormHits.push(`${rel}/${e.name} (worm payload filename)`);
  }
  if (!entries.some((e) => e.isFile() && e.name === "package.json")) return;
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  } catch {
    return; // unparseable package.json — not our concern here
  }
  const scripts = manifest.scripts ?? {};
  for (const hook of INSTALL_HOOKS) {
    if (!scripts[hook]) continue;
    if (EXPECTED_HOOK_PKGS.has(manifest.name))
      expectedHooks.add(`${manifest.name} → "${hook}": ${scripts[hook]}`);
    else wormHits.push(`${rel} → "${hook}": ${JSON.stringify(scripts[hook])}`);
  }
};

// Walk every node_modules tree, visiting each package root once.
//
// A "modules dir" holds package dirs, not packages: `node_modules` itself,
// scope dirs (`@scope`), and bun's content store (`.bun/`, whose children are
// `pkg@version/` — again containers, each holding a `node_modules/`).
// Everything else is a package root. Entries may be symlinks into the store,
// so resolve with statSync rather than trusting the dirent type.
const seen = new Set();
const isModulesDir = (name) =>
  name === "node_modules" || name === ".bun" || name.startsWith("@") || name.includes("@");

const walkModules = (nmDir, rel, depth = 0) => {
  if (depth > 10 || seen.has(nmDir)) return;
  seen.add(nmDir);
  let entries;
  try {
    entries = readdirSync(nmDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const child = join(nmDir, e.name);
    const childRel = `${rel}/${e.name}`;
    try {
      if (!statSync(child).isDirectory()) continue;
    } catch {
      continue; // broken symlink
    }
    if (isModulesDir(e.name)) {
      walkModules(child, childRel, depth + 1);
      continue;
    }
    if (seen.has(child)) continue;
    seen.add(child);
    scanPackageDir(child, childRel);
    walkModules(join(child, "node_modules"), `${childRel}/node_modules`, depth + 1);
  }
};

const workspaceRoots = ["."];
for (const group of ["apps", "packages"]) {
  try {
    for (const d of readdirSync(join(root, group), { withFileTypes: true })) {
      if (d.isDirectory()) workspaceRoots.push(`${group}/${d.name}`);
    }
  } catch {
    /* group missing */
  }
}
let scannedTrees = 0;
for (const ws of workspaceRoots) {
  const nm = join(root, ws, "node_modules");
  try {
    if (!statSync(nm).isDirectory()) continue;
  } catch {
    continue;
  }
  scannedTrees++;
  walkModules(nm, `${ws}/node_modules`);
}
add(
  "No install-time worm markers in node_modules",
  wormHits.length === 0,
  wormHits.length
    ? `${wormHits.length} unexpected marker(s) across ${scannedTrees} tree(s) — see report`
    : `clean across ${scannedTrees} node_modules tree(s) (${expectedHooks.size} reviewed hook(s) ignored)`
);

// --- on-demand scans -------------------------------------------------------

const auditOut = run("bun audit");
const vulnLine =
  auditOut.match(/(\d+) vulnerabilities?.*$/m)?.[0] ?? "audit produced no summary line";
const vulnCount = Number(auditOut.match(/(\d+) vulnerabilities/)?.[1] ?? 0);

const untrustedOut = run("bun pm untrusted");
const blockedPkgs = [...untrustedOut.matchAll(/^\.\/node_modules\/(.+?)\s/gm)].map((m) => m[1]);

// --- verdict ---------------------------------------------------------------

const defensesOk = checks.every((c) => c.ok);
const ts = new Date().toISOString();

const md = `# Security report

> Generated by \`bun run security:verify\` (\`scripts/security-verify.mjs\`).
> Regenerate before pulling new dependencies, before a deploy, or routinely.
> See **SUPPLY_CHAIN_SECURITY.md** for what each layer does.

- **Generated:** ${ts}
- **Defense layers:** ${defensesOk ? "✅ ALL ACTIVE" : "❌ ONE OR MORE BROKEN — repo not hardened"}
- **Known CVEs in lockfile:** ${vulnCount} (transitive dev-dep advisories expected; not malware)
- **Blocked postinstall scripts:** ${blockedPkgs.length}

## Defense layers (must all pass)

| Layer | Status | Detail |
| --- | --- | --- |
${checks.map((c) => `| ${c.name} | ${c.ok ? "✅" : "❌"} | ${c.detail} |`).join("\n")}

## Known vulnerabilities (\`bun audit\`)

\`${vulnLine.trim()}\`

These are almost always **transitive** advisories inside dev tooling (astro, vite,
their glob/parse deps). Triage with \`/pkg-audit\`; fix with \`bun update\` once a
patched version clears the 3-day cooldown. CVEs here do **not** mean the repo is
compromised — the cooldown + Socket scanner are what guard against malicious
*new* releases.

## Install-time worm markers in \`node_modules\`

Scanned ${scannedTrees} \`node_modules\` tree(s) for the markers used by the
keyv/cacheable worm class: install-time lifecycle hooks (\`preinstall\`,
\`install\`, \`postinstall\`) declared by dependencies, plus the payload filenames
\`setup.mjs\` / \`Math_Symbol.js\` at a package root.

Hooks from reviewed packages (\`EXPECTED_HOOK_PKGS\` in the script — native binary
downloads) are ignored; this run ignored ${expectedHooks.size}:

${
  [...expectedHooks]
    .sort()
    .map((h) => `- \`${h}\``)
    .join("\n") || "- _(none)_"
}

${
  wormHits.length
    ? `⚠️ **${wormHits.length} UNEXPECTED marker(s) — investigate each before running \`bun install\` again:**\n\n${wormHits.map((h) => `- \`${h}\``).join("\n")}\n\nA hook alone is not proof of malware. Read the script it points at; if it is legitimate, add the package to \`EXPECTED_HOOK_PKGS\`.`
    : "No unexpected markers found."
}

## Blocked postinstall scripts (\`bun pm untrusted\`)

${
  blockedPkgs.length
    ? `bun blocked lifecycle scripts for:\n\n${blockedPkgs.map((p) => `- \`${p}\``).join("\n")}\n\nReview each. Trust ONE you recognize with \`bun pm trust <pkg>\`. **Never \`bun pm trust --all\`.**`
    : "None blocked this run."
}

---

_Re-run: \`bun run security:verify\`. Routine triage: \`/pkg-audit\`._
`;

writeFileSync(join(root, "SECURITY_REPORT.md"), md);

// Console summary
console.log(`\nSupply-chain verify @ ${ts}`);
for (const c of checks) console.log(`  ${c.ok ? "✅" : "❌"} ${c.name} — ${c.detail}`);
console.log(`  • ${vulnLine.trim()}`);
console.log(`  • ${blockedPkgs.length} blocked postinstall script(s)`);
console.log(`\nReport written to SECURITY_REPORT.md`);

if (!defensesOk) {
  console.error("\n❌ A defense layer is missing — repo is NOT hardened. See report.");
  process.exit(1);
}
console.log("\n✅ All defense layers active.");
