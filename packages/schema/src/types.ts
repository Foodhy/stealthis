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
  | "plugins"
  | "recommendations";

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
  | "schema"
  | "recommendation";

export type RecommendationKind =
  | "agent-frameworks"
  | "ai-models"
  | "creative-apps"
  | "books"
  | "practice-platforms"
  | "hackathons-events"
  | "internships"
  | "app-builders"
  | "payments"
  | "libraries"
  | "platforms"
  | "learning"
  | "editors"
  | "backend"
  | "local-ai"
  | "vector-db"
  | "agent-tools"
  | "audio"
  | "3d"
  | "business-apps"
  | "design-assets"
  | "media"
  | "mcp"
  | "game-dev"
  | "hosting"
  | "design-tools"
  | "graphics"
  | "auth"
  | "email"
  | "databases"
  | "analytics"
  | "cms"
  | "search"
  | "realtime"
  | "monitoring"
  | "jobs"
  | "feature-flags"
  | "storage";

export interface RecommendationOption {
  name: string;
  description?: string;
  url?: string;
  docs?: string;
  demo?: string;
  github?: string;
  video?: string;
  logo?: string;
  bestFor?: string;
  pros: string[];
  cons: string[];
  highlight: boolean;
  attributes: Record<string, string>;
}

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
  | "hotel"
  | "clinic"
  | "gym"
  | "salon"
  | "realestate"
  | "editorial"
  | "comics"
  | "music"
  | "wiki"
  | "patterns"
  | "web3"
  | "gamedev"
  | "storybook"
  | "travel"
  | "portfolio"
  | "ecommerce"
  | "science"
  | "museum"
  | "cookbook"
  | "agency"
  | "d2c"
  | "ai-product"
  | "fintech"
  | "elearning"
  | "delivery"
  | "streaming"
  | "jobs"
  | "events"
  | "nonprofit"
  | "creator"
  | "airline"
  | "cowork"
  | "auto"
  | "legal"
  | "insurance"
  | "construction"
  | "vet"
  | "photography"
  | "dental"
  | "wedding"
  | "podcast"
  | "dating"
  | "coach"
  | "interior"
  | "video"
  | "mobile"
  | "modern-css"
  | "webgl"
  | "accessibility"
  | "ai"
  | "devtools"
  | "diy";

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
  // Recommendation fields (only used when type === "recommendation")
  externalUrl?: string;
  logo?: string;
  recommendationKind?: RecommendationKind;
  bestFor?: string;
  pros: string[];
  cons: string[];
  options: RecommendationOption[];
  comparison: string[];
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
  realWorldHook?: string;
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

export interface BlankInteraction {
  mode: "select" | "type" | "bank" | "drag";
  options?: string[];
}

export interface CompleteChallenge extends ChallengeBase {
  type: "complete";
  template: string;
  answers: Record<string, string>;
  caseSensitive: boolean;
  interaction?: Record<string, BlankInteraction>;
  explanation?: string;
}

export interface FixHint {
  label: string;
  search?: string;
  insert: string;
}

export interface FixChallenge extends ChallengeBase {
  type: "fix";
  starter: string;
  solution: string;
  criterion: "dom-equal" | "regex" | "visual";
  regexPattern?: string;
  hints?: FixHint[];
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

export interface PathUnit {
  title: string;
  preview: string;
  topic: string;
  lessons: string[];
}

export type PathAccent = "emerald" | "sky" | "violet" | "amber" | "rose" | "cyan";

export interface LearningPath {
  slug: string;
  title: string;
  tagline: string;
  mascotIntro?: string;
  order: number;
  accent: PathAccent;
  units: PathUnit[];
}
