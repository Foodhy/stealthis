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
  | "remotion"
  | "database-schemas"
  | "ultra-high-definition-pages";

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
  | "boilerplate"
  | "schema";

export type ResourceDifficulty = "easy" | "med" | "hard";

export type ResourceTarget =
  | "html"
  | "react"
  | "next"
  | "vue"
  | "svelte"
  | "astro"
  | "react-native"
  | "expo"
  | "typescript"
  | "python"
  | "markdown"
  | "yaml"
  | "json"
  | "sql"
  | "mermaid"
  | "dbml";

export type ResourceCollection =
  | "saas"
  | "motion"
  | "hero"
  | "cards"
  | "dashboard"
  | "remotion"
  | "effects"
  | "mobile-nav"
  | "charts";

export interface ResourceAuthor {
  name: string;
  src: string;
}

export interface ResourceMeta {
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  tags: string[];
  collections: ResourceCollection[];
  tech: string[];
  difficulty: ResourceDifficulty;
  targets: ResourceTarget[];
  preview?: string;
  labRoute?: string;
  license: string;
  author?: ResourceAuthor;
  createdAt: string;
  updatedAt: string;
}
