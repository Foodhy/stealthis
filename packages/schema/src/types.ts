// Phase 1 categories
export type ResourceCategoryPhase1 = "web-animations" | "web-pages" | "ui-components" | "patterns";
// Phase 2 categories
export type ResourceCategoryPhase2 =
  | "components"
  | "pages"
  | "prompts"
  | "architectures"
  | "boilerplates"
  | "remotion"
  | "database-schemas"
  | "ultra-high-definition-pages"
  | "music"
  | "3d-models"
  | "3d-interactions"
  | "plugins";

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
  | "charts"
  | "restaurant"
  | "hotel";

export interface ResourceAuthor {
  name: string;
  src: string;
}

export interface CodePenExample {
  id: string;
  title: string;
  penUrl: string;
  description?: string;
  height?: number;
  defaultTab?: "result" | "html,result" | "css,result" | "js,result";
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
  codepenExamples?: CodePenExample[];
  createdAt: string;
  updatedAt: string;
}

// Arcade — Challenges & Lessons

export type ChallengeType = "quiz" | "complete" | "fix" | "identify" | "animation";
export type ChallengeQuality = "draft" | "published";

interface ChallengeBase {
  slug: string;
  topic: string;
  title: string;
  difficulty: number;
  resourceSlug?: string;
  estimatedSeconds: number;
  quality: ChallengeQuality;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizChallenge extends ChallengeBase {
  type: "quiz";
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface CompleteChallenge extends ChallengeBase {
  type: "complete";
  template: string;
  answers: Record<string, string>;
  caseSensitive: boolean;
  explanation?: string;
}

export interface FixChallenge extends ChallengeBase {
  type: "fix";
  starter: string;
  solution: string;
  criterion: "dom-equal" | "regex" | "visual";
  regexPattern?: string;
  explanation?: string;
}

export interface IdentifyChallenge extends ChallengeBase {
  type: "identify";
  code: string;
  answer: number | string;
  options?: string[];
  explanation?: string;
}

export interface AnimationChallenge extends ChallengeBase {
  type: "animation";
  component?: string;
  embed?: string;
  followUp?: {
    question: string;
    options: string[];
    answer: number;
  };
  explanation?: string;
}

export type ChallengeMeta =
  | QuizChallenge
  | CompleteChallenge
  | FixChallenge
  | IdentifyChallenge
  | AnimationChallenge;

export interface Lesson {
  slug: string;
  topic: string;
  title: string;
  description?: string;
  order: number;
  challenges: string[];
}
