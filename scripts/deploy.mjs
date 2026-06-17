#!/usr/bin/env bun
// Deploy every Pages app in parallel, then the MCP worker.
//
// Why a script instead of a chained `&&` in package.json:
//   - `&&` short-circuits: if the first app fails, none of the rest deploy.
//     We want every app attempted, with a per-app pass/fail summary at the end.
//   - The 7 deploys are independent → run them concurrently (~7x faster).
//   - `--commit-dirty=true` silences the "working directory has uncommitted
//     changes" warning (deploys are cut from the built dist, not git).
//
// Cloudflare Pages limits to keep in mind (per deployment):
//   - 20,000 files max
//   - 25 MiB max per file
// If a deploy fails on those, fix the build output — not this script.

import { $ } from "bun";

/** Pages apps: dist dir is apps/<name>/dist, project is stealthis-<name>. */
const PAGES_APPS = ["www", "docs", "lab", "build", "styleforge", "dbviz", "prompt-designer"];

async function deployPages(app) {
  try {
    await $`bunx wrangler pages deploy apps/${app}/dist --project-name stealthis-${app} --branch main --commit-dirty=true`;
    return { app, ok: true };
  } catch (err) {
    return { app, ok: false, code: err?.exitCode ?? 1 };
  }
}

console.log(`Deploying ${PAGES_APPS.length} Pages apps in parallel…\n`);
const results = await Promise.all(PAGES_APPS.map(deployPages));

console.log("\n── Pages deploy summary ──");
for (const r of results) {
  console.log(`${r.ok ? "✓" : "✗"} stealthis-${r.app}${r.ok ? "" : ` (exit ${r.code})`}`);
}

const failed = results.filter((r) => !r.ok).map((r) => r.app);
if (failed.length > 0) {
  console.error(`\n✗ Failed: ${failed.join(", ")}. MCP worker NOT deployed.`);
  process.exit(1);
}

console.log("\nAll Pages apps deployed. Deploying MCP worker…");
await $`bun run deploy:mcp`;
console.log("✓ Done.");
