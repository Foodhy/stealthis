import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const ROOT = "/Volumes/ExternalDisk/experimentalLabs/stealthis";
const SRC = join(ROOT, "packages/content/recommendations");
const DST = join(ROOT, "packages/content/resources");

const toYMD = (v) =>
  v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10);

const dirs = readdirSync(SRC, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let count = 0;
for (const slug of dirs) {
  const file = join(SRC, slug, "index.mdx");
  if (!existsSync(file)) continue;
  const raw = readFileSync(file, "utf-8");
  const { data, content } = matter(raw);

  const kind = data.category; // e.g. "agent-frameworks"
  const tags = Array.from(new Set([kind, ...(Array.isArray(data.tags) ? data.tags : [])]));

  const newData = {
    slug: data.slug,
    title: data.title,
    description: data.description,
    category: "recommendations",
    type: "recommendation",
    recommendationKind: kind,
    tags,
    tech: [],
    difficulty: "easy",
    targets: [],
    externalUrl: data.url,
    ...(data.logo ? { logo: data.logo } : {}),
    bestFor: data.bestFor,
    pros: Array.isArray(data.pros) ? data.pros : [],
    cons: Array.isArray(data.cons) ? data.cons : [],
    license: "MIT",
    createdAt: toYMD(data.createdAt),
    updatedAt: toYMD(data.updatedAt),
  };

  // Clean the body: drop the trailing "**Best for:** ..." line (now shown structurally),
  // and prepend a byline for books/authored entries.
  let body = content
    .split("\n")
    .filter((line) => !/^\s*\*\*Best for:\*\*/i.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (data.author) body = `_By ${data.author}_\n\n${body}`;

  const out = matter.stringify(`\n${body}\n`, newData);
  const dstDir = join(DST, slug);
  mkdirSync(dstDir, { recursive: true });
  writeFileSync(join(dstDir, "index.mdx"), out, "utf-8");
  count++;
}

rmSync(SRC, { recursive: true, force: true });
console.log(`Migrated ${count} recommendations into resources; removed ${SRC}`);
