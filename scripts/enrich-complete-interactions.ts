import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadChallenges } from "../packages/schema/src/loader";
import { buildSelectOptions, isIdentifierAnswer } from "./lib/blank-distractors";

const root = process.cwd();
const contentDir = join(root, "packages", "content");

async function listMdxFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listMdxFiles(full)));
    } else if (entry.name === "index.mdx") {
      out.push(full);
    }
  }
  return out;
}

function upsertInteractionBlock(source: string, interactionYaml: string): string {
  if (source.includes("interaction:")) return source;
  const end = source.indexOf("\n---", 4);
  if (end === -1) return source;
  return `${source.slice(0, end)}\ninteraction:\n${interactionYaml}${source.slice(end)}`;
}

function formatInteractionYaml(entries: Record<string, { mode: string; options: string[] }>): string {
  const lines: string[] = [];
  for (const [key, val] of Object.entries(entries)) {
    lines.push(`  ${key}:`);
    lines.push(`    mode: ${val.mode}`);
    lines.push(`    options:`);
    for (const opt of val.options) {
      lines.push(`      - ${JSON.stringify(opt)}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const challenges = await loadChallenges(contentDir);
  const complete = challenges.filter((c) => c.type === "complete");
  const roots = [
    join(contentDir, "challenges", "_generated"),
    join(contentDir, "challenges"),
  ];

  let updated = 0;
  let skipped = 0;

  for (const c of complete) {
    if (c.interaction && Object.keys(c.interaction).length > 0) {
      skipped += 1;
      continue;
    }

    const interaction: Record<string, { mode: string; options: string[] }> = {};
    for (const [key, answer] of Object.entries(c.answers)) {
      if (isIdentifierAnswer(answer)) {
        interaction[key] = { mode: "select", options: buildSelectOptions(answer, 4) };
      }
    }
    if (Object.keys(interaction).length === 0) continue;

    for (const rootDir of roots) {
      const files = await listMdxFiles(rootDir);
      const file = files.find((f) => f.includes(`/${c.slug}/index.mdx`));
      if (!file) continue;
      const raw = await readFile(file, "utf8");
      if (raw.includes("interaction:")) continue;
      const next = upsertInteractionBlock(raw, formatInteractionYaml(interaction));
      if (next !== raw) {
        await writeFile(file, next, "utf8");
        updated += 1;
      }
      break;
    }
  }

  console.log(`[enrich-complete-interactions] updated ${updated}, skipped ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
