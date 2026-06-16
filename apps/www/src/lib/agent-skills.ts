import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export interface AgentSkill {
  id: string;
  name: string;
  title: string;
  description: string;
  tags: string[];
  repoPath: string;
  whenToUse: string[];
}

const SKILLS_ROOT = path.resolve(process.cwd(), "../../.agents/skills");

function parseFrontmatter(content: string) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return { name: undefined, description: undefined, tags: [] as string[] };
  }

  const yaml = match[1];
  const name = yaml.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = yaml.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  const tagsLine = yaml.match(/^\s+tags:\s*(.+)$/m)?.[1]?.trim();
  const tags = tagsLine ? tagsLine.split(",").map((tag) => tag.trim()) : [];

  return { name, description, tags };
}

function parseWhenToUse(content: string): string[] {
  const section = content.match(/## When to use\r?\n+([\s\S]*?)(?=\r?\n## |\s*$)/);
  if (!section) return [];

  return section[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

export function loadAgentSkills(): AgentSkill[] {
  const entries = readdirSync(SKILLS_ROOT, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const id = entry.name;
      const skillFile = path.join(SKILLS_ROOT, id, "SKILL.md");
      const content = readFileSync(skillFile, "utf-8");
      const frontmatter = parseFrontmatter(content);
      const title = content.match(/^# (.+)$/m)?.[1] ?? id;

      return {
        id,
        name: frontmatter.name ?? id,
        title,
        description: frontmatter.description ?? "",
        tags: frontmatter.tags,
        repoPath: `.agents/skills/${id}/SKILL.md`,
        whenToUse: parseWhenToUse(content),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}
