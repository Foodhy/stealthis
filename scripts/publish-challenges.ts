import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadChallenges } from "../packages/schema/src/loader";

const root = process.cwd();
const contentDir = join(root, "packages", "content");
const generatedRoot = join(contentDir, "challenges", "_generated");

function parseArgs(): { topics: Set<string> | null; minPerTopic: number } {
  const topicsArg = process.argv.find((a) => a.startsWith("--topics="));
  const topics = topicsArg
    ? new Set(
        topicsArg
          .slice("--topics=".length)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    : null;
  const minArg = process.argv.find((a) => a.startsWith("--min="));
  const minPerTopic = minArg ? Number(minArg.slice("--min=".length)) : 3;
  return { topics, minPerTopic };
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

async function main() {
  const { topics, minPerTopic } = parseArgs();
  const challenges = await loadChallenges(contentDir);
  const generated = challenges.filter((c) => c.slug.includes("-") && c.tags.includes("generated"));

  const byTopic = new Map<string, typeof generated>();
  for (const c of generated) {
    if (topics && !topics.has(c.topic)) continue;
    const list = byTopic.get(c.topic) ?? [];
    list.push(c);
    byTopic.set(c.topic, list);
  }

  const slugToFile = new Map<string, string>();
  for (const file of await listMdxFiles(generatedRoot)) {
    const slug = file.split("/_generated/")[1]?.replace("/index.mdx", "");
    if (slug) slugToFile.set(slug, file);
  }

  let published = 0;
  for (const [topic, topicChallenges] of byTopic) {
    if (topicChallenges.length < minPerTopic) {
      console.log(`[arcade] skip ${topic}: ${topicChallenges.length} < ${minPerTopic}`);
      continue;
    }
    for (const c of topicChallenges) {
      const file = slugToFile.get(c.slug);
      if (!file) continue;
      const raw = await readFile(file, "utf8");
      if (c.quality === "published") continue;
      const updated = raw
        .replace(/^quality:\s*"?draft"?\s*$/m, 'quality: "published"')
        .replace(/^quality:\s*draft\s*$/m, 'quality: "published"');
      if (updated === raw) continue;
      await writeFile(file, updated, "utf8");
      published += 1;
    }
    console.log(`[arcade] published ${topicChallenges.length} challenges for ${topic}`);
  }

  console.log(`[arcade] total published: ${published}`);
}

main().catch((err) => {
  console.error("[arcade] publish failed", err);
  process.exit(1);
});
