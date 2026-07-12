import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadChallenges, loadLessons } from "../packages/schema/src/loader";

const root = process.cwd();
const contentDir = join(root, "packages", "content");
const lessonsRoot = join(contentDir, "challenges", "_lessons");
const MAX_CHALLENGES = 5;

const TYPE_ORDER: Record<string, number> = {
  quiz: 0,
  complete: 1,
  identify: 2,
  fix: 3,
  animation: 4,
};

function pickChallenges(slugs: { slug: string; type: string; difficulty: number }[]): string[] {
  const sorted = [...slugs].sort(
    (a, b) =>
      a.difficulty - b.difficulty ||
      (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9) ||
      a.slug.localeCompare(b.slug)
  );

  const picked: string[] = [];
  const seenTypes = new Set<string>();

  for (const c of sorted) {
    if (picked.length >= MAX_CHALLENGES) break;
    if (!seenTypes.has(c.type)) {
      picked.push(c.slug);
      seenTypes.add(c.type);
    }
  }

  for (const c of sorted) {
    if (picked.length >= MAX_CHALLENGES) break;
    if (!picked.includes(c.slug)) picked.push(c.slug);
  }

  return picked;
}

function toYaml(lesson: {
  slug: string;
  topic: string;
  title: string;
  description: string;
  order: number;
  challenges: string[];
}): string {
  const lines = [
    `slug: ${lesson.slug}`,
    `topic: ${JSON.stringify(lesson.topic)}`,
    `title: ${JSON.stringify(lesson.title)}`,
    `description: ${JSON.stringify(lesson.description)}`,
    `order: ${lesson.order}`,
    "challenges:",
    ...lesson.challenges.map((s) => `  - ${s}`),
    "",
  ];
  return lines.join("\n");
}

async function main() {
  const [challenges, existingLessons] = await Promise.all([
    loadChallenges(contentDir),
    loadLessons(contentDir),
  ]);

  const topicsWithLessons = new Set(existingLessons.map((l) => l.topic));
  const published = challenges.filter((c) => c.quality === "published");

  const byTopic = new Map<string, typeof published>();
  for (const c of published) {
    const list = byTopic.get(c.topic) ?? [];
    list.push(c);
    byTopic.set(c.topic, list);
  }

  let written = 0;
  for (const [topic, topicChallenges] of [...byTopic.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    if (topicsWithLessons.has(topic)) {
      console.log(`[arcade] skip ${topic}: hand-authored lessons exist`);
      continue;
    }
    if (topicChallenges.length === 0) continue;

    const slugList = pickChallenges(
      topicChallenges.map((c) => ({ slug: c.slug, type: c.type, difficulty: c.difficulty }))
    );
    if (slugList.length === 0) continue;

    const dir = join(lessonsRoot, topic);
    const file = join(dir, "practice.yaml");
    if (existsSync(file)) {
      console.log(`[arcade] skip ${topic}: practice.yaml already exists`);
      continue;
    }

    await mkdir(dir, { recursive: true });
    await writeFile(
      file,
      toYaml({
        slug: "practice",
        topic,
        title: "Practice",
        description: "Fix real snippets from the stealthis library.",
        order: 1,
        challenges: slugList,
      }),
      "utf8"
    );
    written += 1;
    console.log(`[arcade] created ${topic}/practice.yaml (${slugList.length} challenges)`);
  }

  console.log(`[arcade] lessons written: ${written}`);
}

main().catch((err) => {
  console.error("[arcade] generate-lessons failed", err);
  process.exit(1);
});
