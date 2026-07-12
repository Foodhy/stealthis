import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadChallenges } from "../packages/schema/src/loader";

const root = process.cwd();
const contentDir = join(root, "packages", "content");

const HOOKS: Record<string, string> = {
  "remove-css-property": "A one-line CSS change breaks layout in prod.",
  "blank-identifier": "Missing one property — users see a broken UI.",
  "delete-closing-tag": "Unclosed tags collapse your whole component.",
  "wrong-value-mcq": "Wrong value in CSS — looks fine locally, fails on mobile.",
  fix: "Ship day bug: the preview works, production doesn't.",
  complete: "Fill the blank — this is the fix your PM asked for at 4pm.",
  identify: "Spot the line that caused the regression.",
  quiz: "Quick check before you push to main.",
  animation: "Motion that feels wrong usually starts with bad CSS.",
};

function inferStrategy(tags: string[], type: string): string {
  for (const tag of tags) {
    if (HOOKS[tag]) return tag;
  }
  if (tags.some((t) => t.includes("remove-css"))) return "remove-css-property";
  if (tags.some((t) => t.includes("blank"))) return "blank-identifier";
  if (tags.some((t) => t.includes("mcq"))) return "wrong-value-mcq";
  return type;
}

function hookForChallenge(topic: string, title: string, type: string, tags: string[]): string {
  const strategy = inferStrategy(tags, type);
  const base = HOOKS[strategy] ?? HOOKS[type] ?? "Real bug from a stealthis component.";
  const topicHint = topic.replace(/-/g, " ");
  if (title.toLowerCase().includes("nav")) return "Your navbar collapses on mobile — sound familiar?";
  if (title.toLowerCase().includes("form")) return "Users can't submit — the form looks fine though.";
  if (topic === "404" || topic === "500") return "Error page went live without anyone testing it.";
  if (topic === "accessibility") return "Accessibility audit flagged this exact pattern.";
  return `${base} (${topicHint})`;
}

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

function upsertFrontmatterField(source: string, key: string, value: string): string {
  if (source.includes(`${key}:`)) return source;
  const end = source.indexOf("\n---", 4);
  if (end === -1) return source;
  const hookLine = `${key}: ${JSON.stringify(value)}\n`;
  return `${source.slice(0, end)}\n${hookLine}${source.slice(end)}`;
}

async function main() {
  const challenges = await loadChallenges(contentDir);
  const challengeMap = new Map(challenges.map((c) => [c.slug, c]));
  const roots = [
    join(contentDir, "challenges", "_generated"),
    join(contentDir, "challenges"),
  ];

  let updated = 0;
  let skipped = 0;

  for (const rootDir of roots) {
    const files = await listMdxFiles(rootDir);
    for (const file of files) {
      if (file.includes("_generated") === false && file.includes("/challenges/") && !file.includes("_generated")) {
        const rel = file.replace(contentDir, "");
        if (rel.includes("/_lessons/") || rel.includes("/_paths/")) continue;
      }
      const raw = await readFile(file, "utf8");
      if (raw.includes("realWorldHook:")) {
        skipped += 1;
        continue;
      }
      const slugMatch = raw.match(/^slug:\s*"?([^"\n]+)"?/m);
      if (!slugMatch) continue;
      const slug = slugMatch[1]!.trim();
      const meta = challengeMap.get(slug);
      if (!meta) continue;
      const hook = hookForChallenge(meta.topic, meta.title, meta.type, meta.tags);
      const next = upsertFrontmatterField(raw, "realWorldHook", hook);
      if (next !== raw) {
        await writeFile(file, next, "utf8");
        updated += 1;
      }
    }
  }

  console.log(`[enrich-challenges] updated ${updated}, skipped ${skipped} (already had hook)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
