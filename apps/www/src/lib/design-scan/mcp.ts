/**
 * Fase 4 — emparejar los componentes del DESIGN.md con el catálogo de stealthis.
 *
 * El servidor MCP tiene CORS abierto, así que el navegador lo llama directo sin
 * pasar por el proxy de captura.
 *
 * Dos cosas del servidor condicionan este archivo:
 *
 *  · `/tools/search` NO devuelve JSON limpio: devuelve texto con el prefijo
 *    "Found N result(s) for ...:" y detrás el array. Pasa igual por JSON-RPC,
 *    donde el mismo texto viene dentro de `content[0].text`. Se corta el
 *    prefijo, y se hace explícito en un sitio en vez de a ojo en cada llamada.
 *  · La búsqueda es muy laxa — "card" devuelve 631 resultados porque también
 *    mira la descripción. Sin ordenar, el primero es basura. El ranking es
 *    tanto trabajo como la propia llamada.
 */

const MCP_URL = import.meta.env.PUBLIC_MCP_URL ?? "https://mcp.stealthis.dev";

export type CatalogEntry = {
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty?: string;
  targets?: string[];
  resourceUrl?: string;
};

export type Candidate = CatalogEntry & { score: number };

export type ComponentMatch = {
  /** Nombre tal cual sale del DESIGN.md, variante incluida. */
  component: string;
  /** Lo que se buscó de verdad, ya sin la variante. */
  query: string;
  candidates: Candidate[];
  /** Motivo por el que no se cubrió, si no se cubrió. */
  uncovered?: string;
};

export type MatchResult = {
  matches: ComponentMatch[];
  /** Componentes sin ningún candidato decente. */
  uncovered: string[];
  /** Recursos ya traídos, listos para STL-031. */
  snippets: Record<string, { html?: string; css?: string }>;
};

/**
 * Quita el prefijo de texto y devuelve el array. Si el servidor cambiara y
 * empezara a mandar JSON limpio, esto sigue funcionando.
 */
export function parseSearchResponse(raw: string): CatalogEntry[] {
  const start = raw.indexOf("[");
  if (start === -1) return [];
  try {
    const parsed = JSON.parse(raw.slice(start));
    return Array.isArray(parsed) ? (parsed as CatalogEntry[]) : [];
  } catch {
    return [];
  }
}

/** Variantes de estado que no cambian QUÉ componente es. */
const VARIANT_SUFFIX = /-(hover|active|focus|pressed|disabled|selected|open|checked)$/;

/** `button-primary-hover` → `button primary`. Es lo que se manda a buscar. */
export function toQuery(component: string): string {
  return component.replace(VARIANT_SUFFIX, "").replace(/-/g, " ").trim();
}

/**
 * Las consultas a probar, en orden.
 *
 * El buscador del MCP casa la FRASE, no las palabras: "button" devuelve 279
 * recursos y "button primary" devuelve cero. Con una sola consulta, la mitad de
 * los componentes se quedaban sin candidatos teniendo el catálogo lleno de
 * ellos. Por eso, si la frase no da para elegir, se prueba palabra por palabra
 * y se juntan los resultados; el ranking ya se encarga de ordenarlos.
 */
export function queryVariants(query: string): string[] {
  const words = query.split(/\s+/).filter((w) => w.length > 2);
  const variants = [query];
  // La palabra más larga suele ser el sustantivo: "field" antes que "input".
  for (const word of [...words].sort((a, b) => b.length - a.length)) {
    if (!variants.includes(word)) variants.push(word);
  }
  return variants;
}

/**
 * Categorías por utilidad para este trabajo. Una página entera puede contener
 * un botón, pero no es un botón: si sale la primera, el emparejamiento no vale.
 */
const CATEGORY_WEIGHT: Record<string, number> = {
  "ui-components": 40,
  components: 35,
  patterns: 15,
  "web-animations": 5,
  "design-styles": 5,
  pages: -20,
  "web-pages": -20,
  "ultra-high-definition-pages": -25,
  remotion: -30,
};

/**
 * Puntúa un recurso contra el componente buscado. Lo que más pesa es que el
 * nombre aparezca en el slug o el título: la descripción menciona de todo.
 */
export function scoreCandidate(query: string, entry: CatalogEntry): number {
  const words = query.split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return 0;

  const slug = entry.slug.toLowerCase();
  const title = entry.title.toLowerCase();
  const description = (entry.description ?? "").toLowerCase();

  let score = CATEGORY_WEIGHT[entry.category] ?? 0;
  let namedHit = false;

  for (const word of words) {
    if (slug === word || slug.endsWith(`-${word}`)) {
      score += 45;
      namedHit = true;
    } else if (slug.includes(word)) {
      score += 30;
      namedHit = true;
    }
    if (title.includes(word)) {
      score += 20;
      namedHit = true;
    }
    if (description.includes(word)) score += 3;
  }

  // Que la descripción mencione la palabra no basta: media biblioteca menciona
  // "button" en su texto sin ser un botón. Sin acierto en el slug ni en el
  // título, esto no es un candidato — es ruido con buena puntuación.
  if (!namedHit) return 0;

  // Un recurso cuyo slug es literalmente lo buscado gana a cualquier otro.
  if (slug === words.join("-")) score += 50;

  // Preferimos lo simple: para vestirlo con otros tokens, cuanto menos traiga
  // de su propio contexto, mejor.
  if (entry.difficulty === "easy") score += 8;
  if (entry.difficulty === "hard") score -= 8;

  return score;
}

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

type SearchOptions = {
  fetchImpl?: FetchLike;
  signal?: AbortSignal;
};

export async function searchCatalog(
  query: string,
  options: SearchOptions = {}
): Promise<CatalogEntry[]> {
  const doFetch = options.fetchImpl ?? fetch;
  const res = await doFetch(`${MCP_URL}/tools/search?q=${encodeURIComponent(query)}`, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  if (!res.ok) throw new Error(`The catalog responded ${res.status}.`);
  return parseSearchResponse(await res.text());
}

export async function getSnippet(
  slug: string,
  target: "html" | "css",
  options: SearchOptions = {}
): Promise<string | null> {
  const doFetch = options.fetchImpl ?? fetch;
  const res = await doFetch(`${MCP_URL}/tools/get_snippet/${slug}/${target}`, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  if (!res.ok) return null; // no todos los recursos traen los dos targets
  return res.text();
}

/** Por debajo de esto, proponer un recurso es peor que decir que no hay. */
export const MIN_SCORE = 45;

/** Cuántos candidatos se guardan por componente. */
export const KEEP_CANDIDATES = 3;

export type MatchOptions = SearchOptions & {
  /** Se llama al empezar cada componente, para poder pintar el progreso. */
  onProgress?: (component: string, index: number, total: number) => void;
};

export async function matchComponents(
  components: string[],
  options: MatchOptions = {}
): Promise<MatchResult> {
  const matches: ComponentMatch[] = [];
  const uncovered: string[] = [];
  const snippets: MatchResult["snippets"] = {};

  // Las variantes comparten búsqueda: `button-primary` y `button-primary-hover`
  // son el mismo recurso del catálogo, y buscar dos veces sería tirar peticiones.
  const cache = new Map<string, CatalogEntry[]>();

  for (const [index, component] of components.entries()) {
    options.onProgress?.(component, index, components.length);
    const query = toQuery(component);

    let results = cache.get(query);
    if (!results) {
      const collected: CatalogEntry[] = [];
      const seen = new Set<string>();

      // Se prueban TODAS las variantes, sin cortar por cantidad. Cortar al
      // llenar un cupo hacía que "button primary" se quedara con los resultados
      // de "primary" y no llegara nunca a buscar "button", que era justo el que
      // tenía los 279 botones del catálogo.
      for (const variant of queryVariants(query)) {
        try {
          for (const entry of await searchCatalog(variant, options)) {
            if (seen.has(entry.slug)) continue;
            seen.add(entry.slug);
            collected.push(entry);
          }
        } catch {
          // Una variante que falla no invalida las demás.
        }
      }

      results = collected;
      cache.set(query, results);
    }

    const candidates = results
      .map((entry) => ({ ...entry, score: scoreCandidate(query, entry) }))
      .filter((c) => c.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, KEEP_CANDIDATES);

    if (candidates.length === 0) {
      // Se dice que no hay, en vez de colocar el primer resultado que salga.
      // Un recurso que no encaja contamina todo lo que se construya con él.
      matches.push({
        component,
        query,
        candidates: [],
        uncovered: "no close match in the catalog",
      });
      uncovered.push(component);
      continue;
    }

    matches.push({ component, query, candidates });

    // Solo se descarga el ganador, y una vez por slug: el resultado entero
    // acaba en localStorage, que tiene techo.
    const best = candidates[0].slug;
    if (!snippets[best]) {
      const [html, css] = await Promise.all([
        getSnippet(best, "html", options).catch(() => null),
        getSnippet(best, "css", options).catch(() => null),
      ]);
      snippets[best] = {
        ...(html ? { html } : {}),
        ...(css ? { css } : {}),
      };
    }
  }

  return { matches, uncovered, snippets };
}
