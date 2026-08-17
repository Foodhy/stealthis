# Supply-chain security

How this repo defends against malicious dependency updates — the npm/registry supply-chain
attack pattern, where an attacker publishes a compromised version of a real package and your
next `install` pulls (and historically, runs) it.

Four layers, all active in this **bun** monorepo:

| Layer | What it does | Where |
| --- | --- | --- |
| **Install cooldown** | Refuses versions published < 3 days ago | `bunfig.toml` → `minimumReleaseAge` |
| **Pre-install scanner** | Scans every package against Socket before install | `bunfig.toml` → `[install.security]` |
| **No postinstall scripts** | bun blocks lifecycle scripts by default | built-in (allow-list = `trustedDependencies`) |
| **Worm-marker scan** | Flags unexpected install hooks / payload files in `node_modules` | `scripts/security-verify.mjs` |

Plus on-demand vuln scanning (`bun audit`) and the `/pkg-audit` command for routine review.

> **Requires bun ≥ 1.3.** Older bun silently ignores `minimumReleaseAge` and `[install.security]`.
> Check with `bun --version`.

---

## 1. Install cooldown (`minimumReleaseAge`)

Malware in a hijacked release is almost always caught within hours. By refusing any version
younger than the cooldown, we sit out that danger window. Configured in `bunfig.toml`:

```toml
[install]
minimumReleaseAge = 259200          # 3 days — VALUE IS IN SECONDS
minimumReleaseAgeExclude = []        # escape hatch (see below)
```

- A version published less than 3 days ago will **not be resolved** — bun picks the newest version
  that *is* old enough.
- Existing pinned versions in `bun.lock` are untouched; this only affects *new* resolutions
  (adding a dep, bumping a range).
- **Emergency override:** to pull a fix immediately (e.g. a CVE patch published an hour ago), add
  the package to `minimumReleaseAgeExclude`:
  ```toml
  minimumReleaseAgeExclude = ["some-pkg"]
  ```
  Remove it again once you're past the incident.

## 2. Socket security scanner

Every `bun install` scans all packages against [Socket](https://socket.dev) before anything lands.

```toml
[install.security]
scanner = "@socketsecurity/bun-security-scanner"
```

Installed as a dev dependency (`@socketsecurity/bun-security-scanner`).

- **Fatal** advisory → install is **aborted**.
- **Warn** advisory → prompts in a terminal; **auto-cancels in CI** / non-interactive shells.
- Runs in **free mode** by default (public Socket API, no account). To inherit your org's policy,
  export `SOCKET_API_KEY` (read automatically from the env var or the Socket CLI settings file).
- The scan adds time to installs (~45s for this tree's 1300+ packages). Worth it.

## 3. Postinstall scripts blocked by default

bun does **not** run `postinstall` / lifecycle scripts of dependencies — this is the vector most
supply-chain payloads use. To see what was blocked and decide case by case:

```bash
bun run security:trust   # alias for: bun pm untrusted
bun pm trust <pkg>       # allow ONE package you actually depend on and recognize
```

Add genuinely-needed build deps (native addons, `sharp`, etc. — bun already ships a ~366-pkg
default allow-list) to `trustedDependencies` in the root `package.json`. **Never `bun pm trust --all`.**

## 4. Worm-marker scan of the installed tree

The first three layers stop a poisoned version from *landing*. This one asks whether something
already landed. `bun run security:verify` walks every `node_modules` tree in the monorepo
(13 of them, bun content store included) and flags:

- any dependency declaring `preinstall` / `install` / `postinstall`, **except** the reviewed
  list in `EXPECTED_HOOK_PKGS` (`@biomejs/biome`, `@swc/core`, `esbuild`, `sharp`, `workerd` —
  all native-binary downloads);
- the payload filenames `setup.mjs` and `Math_Symbol.js` at a package root.

An unexpected hook fails the check. That is a prompt to **read the script it points at**, not
proof of malware — if it is legitimate, add the package to `EXPECTED_HOOK_PKGS` in
`scripts/security-verify.mjs` so the list stays a reviewed allow-list rather than noise.

---

## Incident log

### 2026-08-04 — `keyv` / `cacheable` worm (a.k.a. ChainDrop / "mini Shai-Hulud") — **not affected**

The maintainer's GitHub account behind `keyv` (~127M downloads/week) was compromised; the
attacker pushed to `main` and cut releases, so ~2,234 poisoned versions across 444 package names
shipped **with valid GitHub Actions provenance** — signature verification was not a usable signal.
Each poisoned package gained `"preinstall": "node setup.mjs"` plus `setup.mjs` / `Math_Symbol.js`,
which downloaded a standalone Bun runtime and ran a 728 KB obfuscated stealer (`.npmrc` tokens,
`gh` CLI tokens, AWS creds, Vault tokens, kubeconfigs, crypto wallets) and tampered with Claude
Code and VS Code configuration. Seed versions: `keyv@6.0.0`, `cacheable@2.5.1`, `flat-cache@6.1.24`,
`file-entry-cache@11.1.6`, `cacheable-request@13.0.20`, `cache-manager@7.2.10`,
`@cacheable/utils@2.5.1`, `@cacheable/memory@2.2.1`, `@cacheable/node-cache@2.0.4`.

Audit of this repo on 2026-08-05 — **clean**:

- `bun.lock` pins `keyv@4.5.4`, `flat-cache@4.0.1`, `file-entry-cache@8.0.0` (transitive, via
  eslint-family tooling) — all far below the seed versions. No `cacheable*` / `cache-manager` /
  `@cacheable/*` anywhere in the tree.
- Zero `setup.mjs` / `Math_Symbol.js` / unexpected install hooks across all 13 `node_modules`
  trees, and no poisoned tarballs in `~/.bun/install/cache`. (A `Math_Symbol` string match inside
  `workerd`/`miniflare` is the Unicode property table for `\p{Math_Symbol}` — false positive.)

**Why we were fine:** the 3-day cooldown plus a committed `bun.lock`. A `bun install` run on
2026-08-05 could not have resolved anything published on 2026-08-04. No credential rotation was
needed because the payload never executed. Layer 4 above was added in response to this incident.

Unrelated finding from the same audit: local Node was `v22.22.3`, below the **2026-07-29** security
release (11 CVEs — 3 High). Patched lines: `22.23.2` / `24.18.1` / `26.5.1`.

---

## Daily / routine workflow

```bash
bun run security:verify  # one-shot: checks every defense layer + writes SECURITY_REPORT.md
bun run audit            # bun audit — known CVEs in the lockfile
bun run outdated         # bun outdated --filter '*' — outdated across all 14 workspaces
bun run security:trust   # review blocked postinstall scripts
```

**`bun run security:verify`** (`scripts/security-verify.mjs`) is the "are we still hardened /
not compromised?" check. It confirms bun ≥ 1.3, the cooldown, the Socket scanner, that
postinstall scripts aren't blanket-trusted, and that no unexpected install hooks or worm payload
files sit in `node_modules`; counts known CVEs and blocked install scripts; and
writes a timestamped **`SECURITY_REPORT.md`**. It exits non-zero **only when a defense layer is
broken** — known transitive CVEs don't fail it. Run it before pulling new deps, before a deploy,
and routinely.

Or run **`/pkg-audit`** — it bundles audit/outdated/trust, cross-references the cooldown window,
and hands back a prioritized "update now / clear / wait / review scripts" report.

---

## Recipes for new projects

### New **bun** project

1. Copy `bunfig.toml` (cooldown + scanner) to the repo root.
2. `bun add -d @socketsecurity/bun-security-scanner`
3. Add scripts to `package.json`:
   ```json
   {
     "scripts": {
       "audit": "bun audit",
       "outdated": "bun outdated --filter '*'",
       "security:trust": "bun pm untrusted"
     }
   }
   ```

### New **pnpm** project (pnpm ≥ 10)

Same ideas, different file and **different unit — pnpm uses MINUTES, bun uses SECONDS.**
3 days = `259200` seconds (bun) = `4320` minutes (pnpm).

`pnpm-workspace.yaml`:
```yaml
minimumReleaseAge: 4320            # 3 days IN MINUTES
minimumReleaseAgeExclude: []        # escape hatch
onlyBuiltDependencies: []           # allow-list for build scripts (pnpm blocks them by default in v10+)
```
- `pnpm 11` ships `minimumReleaseAge: 1440` (1 day) on by default; bump it to `4320` to match.
- Routine: `pnpm audit`, `pnpm outdated -r` (recursive across the workspace).

### npm / yarn (note)

No native release-age cooldown on older versions — lean on a scanner (Socket etc.), `npm audit` /
`yarn audit`, `overrides`/`resolutions` to pin transitive deps, and a lockfile in CI
(`npm ci` / `--frozen-lockfile`). Prefer bun or pnpm where you can.

---

## CI caveat

The scanner **auto-cancels installs on *warning*-level advisories in non-TTY** (CI) environments,
because there's no human to confirm. A brand-new advisory on an existing dep can therefore fail a
build that previously passed. Options: set `SOCKET_API_KEY` + a tuned Socket org policy, or treat
the failure as the signal it is and triage the flagged package.

---

## Future hardening (not yet done)

- Dependabot / Renovate for automated, cooldown-respecting update PRs.
- Pin Node/bun versions (`engines`, `.nvmrc` / `.tool-versions`).
- Promote `/pkg-audit` to a machine-wide skill (`~/.claude/skills/`) to reuse across repos.
