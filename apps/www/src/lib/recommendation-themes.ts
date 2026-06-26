export interface RecommendationThemeResource {
  data: { slug: string };
}

export const RECOMMENDATION_THEME_IDS = [
  "ai",
  "software",
  "infra",
  "design",
  "learning",
  "business",
] as const;

export type RecommendationThemeId = (typeof RECOMMENDATION_THEME_IDS)[number];

export type RecommendationThemeLabelKey =
  | "recommendations.theme.ai"
  | "recommendations.theme.software"
  | "recommendations.theme.infra"
  | "recommendations.theme.design"
  | "recommendations.theme.learning"
  | "recommendations.theme.business";

export interface RecommendationTheme {
  id: RecommendationThemeId;
  labelKey: RecommendationThemeLabelKey;
  order: number;
}

export const RECOMMENDATION_THEMES: RecommendationTheme[] = [
  { id: "ai", labelKey: "recommendations.theme.ai", order: 1 },
  { id: "software", labelKey: "recommendations.theme.software", order: 2 },
  { id: "infra", labelKey: "recommendations.theme.infra", order: 3 },
  { id: "design", labelKey: "recommendations.theme.design", order: 4 },
  { id: "learning", labelKey: "recommendations.theme.learning", order: 5 },
  { id: "business", labelKey: "recommendations.theme.business", order: 6 },
];

/** Library navigation buckets — distinct from `recommendationKind` (card badge). */
export const RECOMMENDATION_THEME_BY_SLUG: Record<string, RecommendationThemeId> = {
  // AI
  "ai-models-providers": "ai",
  "free-ai-apis": "ai",
  "ai-agent-tooling": "ai",
  "ai-coding-agents": "ai",
  "ai-code-editors": "ai",
  "ai-app-builders": "ai",
  "ai-image-generation": "ai",
  "ai-video-generation": "ai",
  "open-image-models": "ai",
  "3d-generation": "ai",
  "run-llms-locally": "ai",
  "speech-voice-ai": "ai",
  "mcp-servers-directory": "ai",
  "ml-ai-hubs": "ai",
  "vector-databases": "ai",
  "computer-vision-libraries": "ai",
  "ocr-tools": "ai",
  "claude-code-skill-directories": "ai",
  // Software
  "developer-documentation": "software",
  "headless-cms": "software",
  "product-analytics": "software",
  "chart-libraries": "software",
  "state-data-fetching": "software",
  "e2e-testing-tools": "software",
  "api-layer-tools": "software",
  "mobile-frameworks": "software",
  "maps-libraries": "software",
  "3d-web-libraries": "software",
  "game-engines": "software",
  "unity-assets": "software",
  "godot-pixel-art-tools": "software",
  "public-apis": "software",
  "robotics-js-libraries": "software",
  "graphics-rendering-apis": "software",
  "localization-platforms": "software",
  // Infra
  "hosting-deploy": "infra",
  "backend-as-a-service": "infra",
  "payment-processors": "infra",
  "media-optimization": "infra",
  "auth-providers": "infra",
  "email-sms-providers": "infra",
  "serverless-databases": "infra",
  "search-services": "infra",
  "realtime-services": "infra",
  "error-monitoring": "infra",
  "background-jobs": "infra",
  "feature-flags": "infra",
  "orm-query-builders": "infra",
  "object-storage": "infra",
  "ci-cd-platforms": "infra",
  "caching-kv": "infra",
  "logging-platforms": "infra",
  "webhook-platforms": "infra",
  "status-pages": "infra",
  "secrets-management": "infra",
  "apm-tracing": "infra",
  "web-performance-tools": "infra",
  "push-notification-services": "infra",
  "mobile-analytics": "infra",
  "dns-domain-registrars": "infra",
  // Design
  "design-assets": "design",
  "design-dev-tools": "design",
  "icons-and-fonts": "design",
  "ui-component-libraries": "design",
  "css-frameworks": "design",
  "web-animation-libraries": "design",
  "design-software": "design",
  "prototyping-tools": "design",
  "accessibility-tools": "design",
  "design-tokens-tools": "design",
  // Learning
  "developer-roadmaps": "learning",
  "learn-to-code-platforms": "learning",
  "learn-ux-design": "learning",
  "coding-practice-platforms": "learning",
  "hackathon-platforms": "learning",
  "internship-programs": "learning",
  "tech-coding-books": "learning",
  "learn-system-design": "learning",
  "open-source-contributor-programs": "learning",
  "dev-podcasts-newsletters": "learning",
  "interview-prep-platforms": "learning",
  "learn-english": "learning",
  "startup-accelerators": "learning",
  "self-learning-platforms": "learning",
  // Business
  "open-business-apps": "business",
  "business-strategy-books": "business",
  "entrepreneurship-books": "business",
  "venture-investing-books": "business",
  "customer-support-tools": "business",
  "scheduling-booking": "business",
  "forms-surveys": "business",
  "privacy-consent-tools": "business",
  "legal-document-tools": "business",
  "email-marketing-tools": "business",
  "crm-sales-tools": "business",
  "invoicing-accounting-tools": "business",
};

const DEFAULT_THEME: RecommendationThemeId = "ai";

export function getRecommendationTheme(slug: string): RecommendationThemeId {
  return RECOMMENDATION_THEME_BY_SLUG[slug] ?? DEFAULT_THEME;
}

export function groupRecommendationsByTheme<T extends RecommendationThemeResource>(
  resources: T[]
): Map<RecommendationThemeId, T[]> {
  const grouped = new Map<RecommendationThemeId, T[]>();
  for (const theme of RECOMMENDATION_THEME_IDS) {
    grouped.set(theme, []);
  }
  for (const resource of resources) {
    const theme = getRecommendationTheme(resource.data.slug);
    const bucket = grouped.get(theme);
    if (bucket) bucket.push(resource);
  }
  return grouped;
}
