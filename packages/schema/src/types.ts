// Phase 1 categories
export type ResourceCategoryPhase1 = "web-animations" | "web-pages" | "ui-components" | "patterns";
// Phase 2 categories
export type ResourceCategoryPhase2 =
  | "components"
  | "pages"
  | "prompts"
  | "skills"
  | "mcp-servers"
  | "architectures"
  | "boilerplates"
  | "remotion";

export type ResourceCategory = ResourceCategoryPhase1 | ResourceCategoryPhase2;

export type ResourceType =
  | "animation"
  | "page"
  | "component"
  | "pattern"
  | "prompt"
  | "skill"
  | "mcp-server"
  | "architecture"
  | "boilerplate";

export type ResourceDifficulty = "easy" | "med" | "hard";

export type ResourceTarget =
  | "html"
  | "react"
  | "next"
  | "vue"
  | "svelte"
  | "astro"
  | "typescript"
  | "python"
  | "markdown"
  | "yaml"
  | "json";

export interface ResourceMeta {
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  tags: string[];
  tech: string[];
  difficulty: ResourceDifficulty;
  targets: ResourceTarget[];
  preview?: string;
  labRoute?: string;
  license: string;
  createdAt: string;
  updatedAt: string;
}
