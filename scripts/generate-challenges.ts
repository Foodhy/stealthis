import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ChallengeMetaSchema } from "../packages/schema/src/schema";

type ResourceMeta = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
};

type GeneratedChallenge = Record<string, unknown>;

type StrategyResult = {
  challenge: GeneratedChallenge;
  strategy: string;
};

const root = process.cwd();
const contentRoot = join(root, "packages", "content");
const resourcesRoot = join(contentRoot, "resources");
const generatedRoot = join(contentRoot, "challenges", "_generated");
const today = new Date().toISOString().slice(0, 10);
const MAX_PER_TOPIC = 12;
const MAX_TOTAL = 360;

function stableHash(input: string): string {
  return createHash("sha1").update(input).digest("hex").slice(0, 8);
}

function toTopic(meta: ResourceMeta): string {
  const fromTag = meta.tags?.[0]?.trim();
  if (fromTag && fromTag.length > 0) return fromTag;
  return meta.category;
}

function codeBlockToText(value: string): string {
  if (value.includes("\n")) {
    return `|\n${value
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n")}`;
  }
  return JSON.stringify(value);
}

function yamlScalar(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function toMdxFrontmatter(challenge: GeneratedChallenge): string {
  const entries = Object.entries(challenge);
  const lines: string[] = ["---"];

  for (const [key, value] of entries) {
    if (typeof value === "string" && (key === "starter" || key === "solution" || key === "template" || key === "code" || key === "explanation")) {
      lines.push(`${key}: ${codeBlockToText(value)}`);
      continue;
    }

    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${yamlScalar(item)}`);
      continue;
    }

    if (value && typeof value === "object") {
      lines.push(`${key}:`);
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        lines.push(`  ${k}: ${yamlScalar(v)}`);
      }
      continue;
    }

    lines.push(`${key}: ${yamlScalar(value)}`);
  }

  lines.push("---", "", "Generated challenge.", "");
  return lines.join("\n");
}

function readSnippetMap(dir: string): Promise<Record<string, string>> {
  return readdir(dir, { withFileTypes: true }).then(async (entries) => {
    const out: Record<string, string> = {};
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const file = entry.name;
      const full = join(dir, file);
      const content = await readFile(full, "utf8");
      out[file] = content;
    }
    return out;
  });
}

function firstCssDeclaration(css: string): { line: number; prop: string; value: string } | null {
  const lines = css.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith("/*") || trimmed.startsWith("*")) continue;
    const match = trimmed.match(/^([a-zA-Z-]+)\s*:\s*([^;]+);/);
    if (match) {
      return { line: i, prop: match[1], value: match[2].trim() };
    }
  }
  return null;
}

function firstClosingTagLine(html: string): number {
  const lines = html.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (/<\/[a-zA-Z][^>]*>/.test(lines[i])) return i;
  }
  return -1;
}

function makeDocument(html: string, css?: string, js?: string): string {
  const head = css ? `<style>\n${css}\n</style>\n` : "";
  const script = js ? `\n<script>\n${js}\n</script>` : "";
  return `${head}${html}${script}`.trim();
}

function removeCssPropertyStrategy(meta: ResourceMeta, html: string, css: string, js?: string): StrategyResult | null {
  const decl = firstCssDeclaration(css);
  if (!decl) return null;

  const lines = css.split("\n");
  const removed = [...lines];
  removed.splice(decl.line, 1);

  const slug = `${meta.slug}-remove-css-property-${stableHash(`${meta.slug}:${decl.prop}:${decl.value}`)}`;
  const challenge: GeneratedChallenge = {
    slug,
    topic: toTopic(meta),
    title: `Restore missing CSS property in ${meta.title}`,
    type: "fix",
    difficulty: 1,
    resourceSlug: meta.slug,
    estimatedSeconds: 30,
    quality: "draft",
    tags: ["generated", "css", "debugging"],
    createdAt: today,
    updatedAt: today,
    criterion: "dom-equal",
    starter: makeDocument(html, removed.join("\n"), js),
    solution: makeDocument(html, css, js),
    explanation: `The declaration \`${decl.prop}: ${decl.value};\` was removed from the stylesheet. Add it back to recover the expected layout/behavior.`,
  };

  return { challenge, strategy: "remove-css-property" };
}

function blankIdentifierStrategy(meta: ResourceMeta, css: string): StrategyResult | null {
  const decl = firstCssDeclaration(css);
  if (!decl) return null;

  const marker = "{{BLANK_1}}";
  const template = css.replace(new RegExp(`\\b${decl.prop}\\b`), marker);
  if (template === css) return null;

  const slug = `${meta.slug}-blank-identifier-${stableHash(`${meta.slug}:${decl.prop}`)}`;
  const challenge: GeneratedChallenge = {
    slug,
    topic: toTopic(meta),
    title: `Complete the missing property in ${meta.title}`,
    type: "complete",
    difficulty: 1,
    resourceSlug: meta.slug,
    estimatedSeconds: 25,
    quality: "draft",
    tags: ["generated", "css", "complete"],
    createdAt: today,
    updatedAt: today,
    template,
    answers: { BLANK_1: decl.prop },
    caseSensitive: false,
    explanation: `Use the property name that should set the value \`${decl.value}\` in this rule.`,
  };

  return { challenge, strategy: "blank-identifier" };
}

function deleteClosingTagStrategy(meta: ResourceMeta, html: string, css?: string, js?: string): StrategyResult | null {
  const lineIdx = firstClosingTagLine(html);
  if (lineIdx === -1) return null;

  const lines = html.split("\n");
  const broken = [...lines];
  broken[lineIdx] = broken[lineIdx].replace(/<\/[a-zA-Z][^>]*>/, "");
  if (broken.join("\n") === html) return null;

  const slug = `${meta.slug}-delete-closing-tag-${stableHash(`${meta.slug}:${lineIdx}`)}`;
  const challenge: GeneratedChallenge = {
    slug,
    topic: toTopic(meta),
    title: `Fix the broken HTML structure in ${meta.title}`,
    type: "fix",
    difficulty: 2,
    resourceSlug: meta.slug,
    estimatedSeconds: 35,
    quality: "draft",
    tags: ["generated", "html", "debugging"],
    createdAt: today,
    updatedAt: today,
    criterion: "dom-equal",
    starter: makeDocument(broken.join("\n"), css, js),
    solution: makeDocument(html, css, js),
    explanation: "A required closing tag was removed. Restore valid nesting so the output matches the expected structure.",
  };

  return { challenge, strategy: "delete-closing-tag" };
}

function wrongValueMcqStrategy(meta: ResourceMeta, css: string): StrategyResult | null {
  const decl = firstCssDeclaration(css);
  if (!decl) return null;

  const wrongValue = (() => {
    if (decl.value.includes("grid")) return decl.value.replace("grid", "block");
    if (decl.value.includes("flex")) return decl.value.replace("flex", "block");
    if (decl.value.includes("1fr")) return decl.value.replace("1fr", "auto");
    if (decl.value.match(/\d/)) return decl.value.replace(/\d+/, "0");
    return `${decl.value}-wrong`;
  })();

  const brokenCode = css.replace(decl.value, wrongValue);
  if (brokenCode === css) return null;

  const slug = `${meta.slug}-wrong-value-mcq-${stableHash(`${meta.slug}:${decl.prop}:${wrongValue}`)}`;
  const challenge: GeneratedChallenge = {
    slug,
    topic: toTopic(meta),
    title: `Spot the wrong CSS value in ${meta.title}`,
    type: "identify",
    difficulty: 1,
    resourceSlug: meta.slug,
    estimatedSeconds: 20,
    quality: "draft",
    tags: ["generated", "css", "identify"],
    createdAt: today,
    updatedAt: today,
    code: brokenCode,
    options: [
      `\`${decl.prop}: ${wrongValue};\` should be \`${decl.prop}: ${decl.value};\``,
      `The selector should be removed entirely`,
      `The declaration should use !important`,
      `Nothing is wrong`,
    ],
    answer: 0,
    explanation: `The mutated value \`${wrongValue}\` is incorrect for this snippet.`,
  };

  return { challenge, strategy: "wrong-value-mcq" };
}

async function parseResourceMeta(resourceDir: string): Promise<ResourceMeta | null> {
  const indexFile = join(resourceDir, "index.mdx");
  if (!existsSync(indexFile)) return null;

  const raw = await readFile(indexFile, "utf8");
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];

  const pick = (key: string): string | null => {
    const line = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    if (!line) return null;
    return line[1].trim().replace(/^["']|["']$/g, "");
  };

  const tagsRaw = pick("tags");
  const tags =
    tagsRaw && tagsRaw.startsWith("[") && tagsRaw.endsWith("]")
      ? tagsRaw
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean)
      : [];

  const slug = pick("slug");
  const title = pick("title");
  const category = pick("category");
  if (!slug || !title || !category) return null;

  return {
    slug,
    title,
    category,
    tags,
  };
}

async function main() {
  await rm(generatedRoot, { recursive: true, force: true });
  await mkdir(generatedRoot, { recursive: true });

  const resourceDirs = (await readdir(resourcesRoot, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => join(resourcesRoot, d.name));

  const generated: StrategyResult[] = [];

  for (const resourceDir of resourceDirs) {
    const meta = await parseResourceMeta(resourceDir);
    if (!meta) continue;

    const snippetsDir = join(resourceDir, "snippets");
    if (!existsSync(snippetsDir)) continue;

    const snippets = await readSnippetMap(snippetsDir);
    const html = snippets["html.html"];
    const css = snippets["style.css"];
    const js = snippets["script.js"];

    if (html && css) {
      const r1 = removeCssPropertyStrategy(meta, html, css, js);
      if (r1) generated.push(r1);
    }

    if (css) {
      const r2 = blankIdentifierStrategy(meta, css);
      if (r2) generated.push(r2);

      const r3 = wrongValueMcqStrategy(meta, css);
      if (r3) generated.push(r3);
    }

    if (html) {
      const r4 = deleteClosingTagStrategy(meta, html, css, js);
      if (r4) generated.push(r4);
    }
  }

  let written = 0;
  const perTopic = new Map<string, number>();
  for (const { challenge } of generated) {
    if (written >= MAX_TOTAL) break;
    const topic = String(challenge.topic);
    const currentForTopic = perTopic.get(topic) ?? 0;
    if (currentForTopic >= MAX_PER_TOPIC) continue;

    const parsed = ChallengeMetaSchema.safeParse(challenge);
    if (!parsed.success) continue;

    const slug = String(challenge.slug);
    const dir = join(generatedRoot, slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.mdx"), toMdxFrontmatter(challenge), "utf8");
    written += 1;
    perTopic.set(topic, currentForTopic + 1);
  }

  const writtenTopicCounts = new Map<string, number>();
  for (const entry of await readdir(generatedRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const raw = await readFile(join(generatedRoot, entry.name, "index.mdx"), "utf8");
    const topicLine = raw.match(/^topic:\s*(.+)$/m);
    if (!topicLine) continue;
    const topic = topicLine[1].trim().replace(/^["']|["']$/g, "");
    writtenTopicCounts.set(topic, (writtenTopicCounts.get(topic) ?? 0) + 1);
  }

  const byStrategy = new Map<string, number>();
  for (const g of generated) {
    byStrategy.set(g.strategy, (byStrategy.get(g.strategy) ?? 0) + 1);
  }

  console.log(`[arcade] generated challenges: ${written}`);
  console.log(`[arcade] topics covered: ${writtenTopicCounts.size}`);
  console.log("[arcade] by strategy:");
  for (const [strategy, count] of [...byStrategy.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  - ${strategy}: ${count}`);
  }
  console.log(`[arcade] output: ${generatedRoot}`);
}

main().catch((err) => {
  console.error("[arcade] generate failed", err);
  process.exit(1);
});
