import type { CollectionEntry } from "astro:content";

export interface CollectionResource {
  slug: string;
  title: string;
  description: string;
  category: string;
  type: string;
  tags: string[];
  tech: string[];
  difficulty: string;
  targets: string[];
  labRoute: string | null;
  preview: string | null;
}

export interface StyleForgeCollectionGroup {
  id: string;
  name: string;
  description: string;
  source: "explicit" | "category";
  itemCount: number;
  resources: CollectionResource[];
  tags: string[];
}

function toCollectionResource(entry: CollectionEntry<"resources">): CollectionResource {
  return {
    slug: entry.data.slug,
    title: entry.data.title,
    description: entry.data.description,
    category: entry.data.category,
    type: entry.data.type,
    tags: entry.data.tags,
    tech: entry.data.tech,
    difficulty: entry.data.difficulty,
    targets: entry.data.targets,
    labRoute: entry.data.labRoute ?? null,
    preview: entry.data.preview ?? null,
  };
}

const COLLECTION_META: Record<string, { name: string; description: string }> = {
  saas: { name: "SaaS", description: "SaaS product interfaces and landing pages." },
  motion: { name: "Motion", description: "Animated and motion-rich experiences." },
  hero: { name: "Hero Sections", description: "High-impact hero and above-the-fold layouts." },
  cards: { name: "Cards", description: "Card-based UI patterns and layouts." },
  dashboard: { name: "Dashboard", description: "Dashboard layouts and data-driven interfaces." },
  remotion: { name: "Remotion", description: "Programmatic video compositions with Remotion." },
  effects: { name: "Effects", description: "Visual effects and interactive animations." },
};

const CATEGORY_META: Record<string, { name: string; description: string }> = {
  "ui-components": {
    name: "UI Components",
    description: "Reusable interface building blocks — buttons, cards, modals, forms, and more.",
  },
  "web-animations": {
    name: "Web Animations",
    description: "Scroll effects, parallax, GSAP, Three.js, and SVG animations.",
  },
  patterns: {
    name: "Interaction Patterns",
    description: "UX patterns like pagination, infinite scroll, drag-and-drop.",
  },
  pages: {
    name: "Full Pages",
    description: "Complete page designs — landing, portfolio, dashboard layouts.",
  },
  "web-pages": {
    name: "Website Pages",
    description: "Complete website implementations and page templates.",
  },
  "design-styles": {
    name: "Design Styles",
    description: "CSS design system implementations — glassmorphism, brutalism, neumorphism.",
  },
  prompts: { name: "Prompts", description: "AI system prompts and instruction templates." },
  remotion: {
    name: "Remotion Compositions",
    description: "Programmatic video generation with Remotion.",
  },
  "database-schemas": {
    name: "Database Schemas",
    description: "Database schema designs for CMS, CRM, ecommerce, and more.",
  },
  components: { name: "Components", description: "Standalone component implementations." },
  "ultra-high-definition-pages": {
    name: "Ultra HD Pages",
    description: "Premium high-fidelity page designs.",
  },
  plugins: { name: "Plugins", description: "Skills, MCP servers & AI tool extensions." },
  architectures: {
    name: "Architectures",
    description: "System architecture patterns and designs.",
  },
  boilerplates: { name: "Boilerplates", description: "Starter templates and project scaffolds." },
};

export function buildCollections(resources: CollectionEntry<"resources">[]): {
  explicit: StyleForgeCollectionGroup[];
  byCategory: StyleForgeCollectionGroup[];
} {
  const sorted = [...resources].sort((a, b) => {
    const aDate = new Date(a.data.updatedAt ?? a.data.createdAt).getTime();
    const bDate = new Date(b.data.updatedAt ?? b.data.createdAt).getTime();
    return bDate - aDate;
  });

  // 1. Explicit collections (from the `collections` frontmatter field)
  const explicitMap = new Map<string, CollectionEntry<"resources">[]>();
  for (const entry of sorted) {
    const colls = entry.data.collections ?? [];
    for (const c of colls) {
      if (!explicitMap.has(c)) explicitMap.set(c, []);
      explicitMap.get(c)!.push(entry);
    }
  }

  const explicit: StyleForgeCollectionGroup[] = [];
  for (const [id, entries] of explicitMap) {
    const meta = COLLECTION_META[id] ?? { name: id, description: "" };
    const resources = entries.map(toCollectionResource);
    const tagSet = new Set<string>();
    for (const r of resources) for (const t of r.tags) tagSet.add(t);
    explicit.push({
      id,
      name: meta.name,
      description: meta.description,
      source: "explicit",
      itemCount: resources.length,
      resources,
      tags: [...tagSet].slice(0, 20),
    });
  }
  explicit.sort((a, b) => b.itemCount - a.itemCount);

  // 2. Category-based collections
  const catMap = new Map<string, CollectionEntry<"resources">[]>();
  for (const entry of sorted) {
    const cat = entry.data.category;
    if (!catMap.has(cat)) catMap.set(cat, []);
    catMap.get(cat)!.push(entry);
  }

  const byCategory: StyleForgeCollectionGroup[] = [];
  for (const [cat, entries] of catMap) {
    const meta = CATEGORY_META[cat] ?? { name: cat, description: "" };
    const resources = entries.map(toCollectionResource);
    const tagSet = new Set<string>();
    for (const r of resources) for (const t of r.tags) tagSet.add(t);
    byCategory.push({
      id: `cat-${cat}`,
      name: meta.name,
      description: meta.description,
      source: "category",
      itemCount: resources.length,
      resources,
      tags: [...tagSet].slice(0, 20),
    });
  }
  byCategory.sort((a, b) => b.itemCount - a.itemCount);

  return { explicit, byCategory };
}

export function searchResources(
  resources: CollectionEntry<"resources">[],
  query: string,
  filters?: { type?: string; category?: string }
): CollectionResource[] {
  const q = query.toLowerCase().trim();

  let filtered = resources;

  if (filters?.type) {
    filtered = filtered.filter((r) => r.data.type === filters.type);
  }
  if (filters?.category) {
    filtered = filtered.filter((r) => r.data.category === filters.category);
  }

  if (!q) {
    return filtered.slice(0, 60).map(toCollectionResource);
  }

  const scored = filtered
    .map((entry) => {
      let score = 0;
      const title = entry.data.title.toLowerCase();
      const desc = entry.data.description.toLowerCase();
      const tags = entry.data.tags.map((t) => t.toLowerCase());
      const slug = entry.data.slug.toLowerCase();

      if (title === q) score += 100;
      else if (title.startsWith(q)) score += 60;
      else if (title.includes(q)) score += 40;

      if (slug.includes(q)) score += 30;
      if (desc.includes(q)) score += 20;
      if (tags.some((t) => t.includes(q))) score += 25;

      return { entry, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 60);

  return scored.map((s) => toCollectionResource(s.entry));
}
