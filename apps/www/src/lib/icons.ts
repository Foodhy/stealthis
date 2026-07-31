import type { ResourceCollection } from "@lib/collections";

/**
 * Unicode glyph icons shared by the homepage category grid, the library sidebar,
 * and the collection explorer. Plain text characters — they inherit color and
 * font-size from CSS, so no SVG sprite or icon package is needed.
 *
 * Render with: <span aria-hidden="true">{CATEGORY_ICONS[slug]}</span>
 */
export const CATEGORY_ICONS: Record<string, string> = {
  "web-animations": "✦",
  "web-pages": "◻",
  pages: "▭",
  "ui-components": "◈",
  components: "▧",
  patterns: "◎",
  remotion: "▶",
  "database-schemas": "⌬",
  prompts: "✺",
  music: "♫",
  architectures: "⚙",
  boilerplates: "▦",
  "3d-models": "⬡",
  "3d-interactions": "◇",
  plugins: "⊞",
  recommendations: "★",
  "design-styles": "◑",
  "ultra-high-definition-pages": "◉",
  skills: "◐",
  "mcp-servers": "⌘",
};

/** Fallback glyph for ids not present in the maps. */
export const FALLBACK_ICON = "◆";

export function getCategoryIcon(id: string): string {
  return CATEGORY_ICONS[id] ?? FALLBACK_ICON;
}

/**
 * One glyph per library collection. Grouped by theme to keep the visual
 * language coherent: verticals lean pictographic, technical collections lean
 * geometric.
 */
export const COLLECTION_ICONS: Record<ResourceCollection, string> = {
  // Core / technical
  saas: "◈",
  motion: "✦",
  hero: "▲",
  cards: "▧",
  dashboard: "▦",
  remotion: "▶",
  effects: "✧",
  "mobile-nav": "☰",
  charts: "▮",
  patterns: "◎",
  "modern-css": "◐",
  webgl: "⬡",
  accessibility: "◉",
  devtools: "⚙",
  design: "◑",
  video: "▷",
  mobile: "▯",
  ai: "✺",
  "ai-product": "✹",
  web3: "⬢",
  storybook: "▤",

  // Industry verticals
  restaurant: "♨",
  clinic: "✚",
  gym: "▬",
  salon: "✂",
  realestate: "⌂",
  travel: "✈",
  ecommerce: "▣",
  agency: "◭",
  d2c: "◫",
  fintech: "₿",
  delivery: "➤",
  streaming: "▸",
  jobs: "▤",
  events: "◇",
  nonprofit: "♡",
  creator: "◍",
  hotel: "⌸",
  airline: "✈",
  cowork: "▩",
  auto: "◐",
  legal: "⚖",
  insurance: "⛨",
  construction: "▰",
  vet: "❋",
  photography: "◎",
  dental: "✧",
  wedding: "❀",
  podcast: "◉",
  dating: "♥",
  coach: "◈",
  interior: "▨",
  diy: "⚒",

  // Editorial / knowledge
  editorial: "▤",
  comics: "◧",
  music: "♫",
  wiki: "▭",
  science: "⚛",
  cookbook: "☰",
  museum: "◭",
  elearning: "✎",
  gamedev: "◆",
  portfolio: "▪",
};

export function getCollectionIcon(id: string): string {
  return COLLECTION_ICONS[id as ResourceCollection] ?? FALLBACK_ICON;
}
