import { describe, expect, test } from "bun:test";
import {
  type CatalogEntry,
  MIN_SCORE,
  matchComponents,
  parseSearchResponse,
  queryVariants,
  scoreCandidate,
  toQuery,
} from "./mcp";

const entry = (over: Partial<CatalogEntry> = {}): CatalogEntry => ({
  slug: "x",
  title: "X",
  description: "",
  category: "ui-components",
  ...over,
});

describe("leer la respuesta de /tools/search", () => {
  test("corta el prefijo de texto que mete el servidor", () => {
    // Esta es la trampa que motivó el archivo: no es JSON limpio.
    const raw = 'Found 2 result(s) for "button":\n\n[{"slug":"a","title":"A"}]';
    expect(parseSearchResponse(raw)).toEqual([{ slug: "a", title: "A" }] as CatalogEntry[]);
  });

  test("si algún día devolviera JSON limpio, sigue funcionando", () => {
    expect(parseSearchResponse('[{"slug":"a"}]')).toHaveLength(1);
  });

  test("una respuesta sin array no revienta", () => {
    expect(parseSearchResponse("No results found.")).toEqual([]);
    expect(parseSearchResponse("Found 1 result:\n\n[roto")).toEqual([]);
  });
});

describe("de componente a búsqueda", () => {
  test("las variantes de estado no cambian qué se busca", () => {
    expect(toQuery("button-primary-hover")).toBe("button primary");
    expect(toQuery("input-field-focus")).toBe("input field");
    expect(toQuery("card")).toBe("card");
  });
});

describe("puntuar candidatos", () => {
  test("un componente gana a una página entera que lo menciona", () => {
    const componente = scoreCandidate(
      "card",
      entry({ slug: "card-hover", title: "Card", category: "ui-components" })
    );
    const pagina = scoreCandidate(
      "card",
      entry({
        slug: "diy-projects-grid",
        title: "Projects grid",
        description: "a page full of card elements",
        category: "pages",
      })
    );

    expect(componente).toBeGreaterThan(pagina);
  });

  test("el slug pesa más que la descripción", () => {
    const enSlug = scoreCandidate("button", entry({ slug: "button-magnetic", title: "Magnetic" }));
    const enDescripcion = scoreCandidate(
      "button",
      entry({ slug: "hero-banner", title: "Hero", description: "with a button inside" })
    );

    expect(enSlug).toBeGreaterThan(enDescripcion);
  });

  test("un slug idéntico a lo buscado gana a todo", () => {
    const exacto = scoreCandidate("input field", entry({ slug: "input-field", title: "Input" }));
    const parcial = scoreCandidate(
      "input field",
      entry({ slug: "input-field-masked-extra", title: "Masked input field" })
    );

    expect(exacto).toBeGreaterThan(parcial);
  });

  test("las palabras cortas se ignoran para no puntuar por ruido", () => {
    expect(scoreCandidate("of", entry({ slug: "of-something" }))).toBe(0);
  });

  test("un recurso sin relación se queda por debajo del umbral", () => {
    const score = scoreCandidate("modal", entry({ slug: "gradient-mesh", title: "Gradient mesh" }));
    expect(score).toBeLessThan(MIN_SCORE);
  });
});

describe("emparejar contra un catálogo simulado", () => {
  const catalogo: CatalogEntry[] = [
    entry({ slug: "button-magnetic", title: "Magnetic button", category: "ui-components" }),
    entry({ slug: "button-ripple", title: "Ripple button", category: "components" }),
    entry({
      slug: "landing-saas",
      title: "SaaS landing",
      description: "button",
      category: "pages",
    }),
    entry({ slug: "card-tilt", title: "Tilt card", category: "ui-components" }),
  ];

  const fakeFetch = (calls: string[] = []) =>
    (async (url: string) => {
      calls.push(url);
      if (url.includes("/tools/search")) {
        const q = decodeURIComponent(new URL(url).searchParams.get("q") ?? "");
        const hits = catalogo.filter((c) =>
          q.split(" ").some((w) => c.slug.includes(w) || (c.description ?? "").includes(w))
        );
        return new Response(
          `Found ${hits.length} result(s) for "${q}":\n\n${JSON.stringify(hits)}`
        );
      }
      if (url.includes("/tools/get_snippet")) return new Response("<button>ok</button>");
      return new Response("", { status: 404 });
    }) as unknown as typeof fetch;

  test("propone candidatos ordenados y descarta la página", async () => {
    const r = await matchComponents(["button-primary"], { fetchImpl: fakeFetch() });
    const slugs = r.matches[0].candidates.map((c) => c.slug);

    expect(slugs[0]).toMatch(/^button-/);
    expect(slugs).not.toContain("landing-saas");
  });

  test("lo que no tiene equivalente se marca como no cubierto", async () => {
    const r = await matchComponents(["modal"], { fetchImpl: fakeFetch() });

    expect(r.uncovered).toEqual(["modal"]);
    expect(r.matches[0].candidates).toHaveLength(0);
    expect(r.matches[0].uncovered).toContain("no close match");
  });

  test("una variante de estado NO repite las búsquedas del componente base", async () => {
    const solo: string[] = [];
    await matchComponents(["button-primary"], { fetchImpl: fakeFetch(solo) });

    const conVariante: string[] = [];
    await matchComponents(["button-primary", "button-primary-hover"], {
      fetchImpl: fakeFetch(conVariante),
    });

    const cuenta = (calls: string[]) => calls.filter((c) => c.includes("/tools/search")).length;
    // Añadir la variante no cuesta ni una petición más: comparten caché.
    expect(cuenta(conVariante)).toBe(cuenta(solo));
  });

  test("solo se descarga el ganador, y una vez por slug", async () => {
    const calls: string[] = [];
    await matchComponents(["button-primary", "button-primary-hover"], {
      fetchImpl: fakeFetch(calls),
    });

    const snippetCalls = calls.filter((c) => c.includes("/tools/get_snippet"));
    // html + css de UN solo recurso, aunque sean dos componentes.
    expect(snippetCalls).toHaveLength(2);
  });

  test("si el catálogo falla, el componente queda sin cubrir en vez de romper", async () => {
    const roto = (async () => {
      throw new Error("sin red");
    }) as unknown as typeof fetch;

    const r = await matchComponents(["card"], { fetchImpl: roto });
    expect(r.uncovered).toEqual(["card"]);
  });

  test("informa del progreso para poder pintarlo", async () => {
    const vistos: string[] = [];
    const parciales: number[] = [];
    await matchComponents(["card-tilt", "button-primary"], {
      fetchImpl: fakeFetch(),
      onProgress: (c) => vistos.push(c),
      onMatch: (p) => parciales.push(p.matches.length),
    });

    expect(vistos).toEqual(["card-tilt", "button-primary"]);
    expect(parciales).toEqual([1, 2]);
  });

  test("no elige un input de clínica para search-field", () => {
    const clinic = scoreCandidate(
      "search bar",
      entry({ slug: "clinic-vitals-input", title: "Vitals input", category: "ui-components" }),
      { component: "search-field", siteHint: "https://www.google.com" }
    );
    const search = scoreCandidate(
      "search bar",
      entry({ slug: "search-bar", title: "Search bar", category: "ui-components" }),
      { component: "search-field", siteHint: "https://www.google.com" }
    );
    expect(clinic).toBeLessThan(MIN_SCORE);
    expect(search).toBeGreaterThan(clinic);
  });
});

describe("respaldo por palabras — el buscador del MCP casa la frase", () => {
  test('"button primary" prueba la frase y "primary", no la palabra suelta "button"', () => {
    expect(queryVariants("button primary")).toEqual(["button primary", "primary"]);
  });

  test("una sola palabra no genera consultas de más", () => {
    expect(queryVariants("card")).toEqual(["card"]);
  });

  test("las palabras de dos letras o menos no se buscan sueltas", () => {
    // "of" y "x" no aportan nada como consulta; "tab" sí.
    expect(queryVariants("tab of x")).toEqual(["tab of x", "tab"]);
  });
});

describe("un acierto solo en la descripción no es un acierto", () => {
  test("un recurso que solo MENCIONA la palabra puntúa cero", () => {
    // Media biblioteca menciona "button" en su descripción sin ser un botón.
    const score = scoreCandidate(
      "button",
      entry({
        slug: "onb-empty-first-use",
        title: "Empty first-use state",
        description: "an empty state with a button to get started",
      })
    );
    expect(score).toBe(0);
  });

  test("con acierto en el título sí puntúa", () => {
    expect(
      scoreCandidate("button", entry({ slug: "shimmer-cta", title: "Shimmer button" }))
    ).toBeGreaterThan(MIN_SCORE);
  });
});

describe("un recurso fijado a mano", () => {
  const fetchPinned = (calls: string[]) =>
    (async (url: string) => {
      calls.push(url);
      if (url.includes("/tools/get_snippet")) return new Response("<div>fijado</div>");
      return new Response('Found 0 result(s) for "x":\n\n[]');
    }) as unknown as typeof fetch;

  test("se usa tal cual y NO se busca en el catálogo", async () => {
    const calls: string[] = [];
    const r = await matchComponents(["card"], {
      fetchImpl: fetchPinned(calls),
      pinned: { card: "dental-appointment-card" },
    });

    expect(r.matches[0].candidates[0].slug).toBe("dental-appointment-card");
    expect(calls.some((c) => c.includes("/tools/search"))).toBe(false);
    expect(r.uncovered).toEqual([]);
  });

  test("su snippet sí se descarga, que es lo que hace falta para recrear", async () => {
    const calls: string[] = [];
    await matchComponents(["card"], {
      fetchImpl: fetchPinned(calls),
      pinned: { card: "mi-recurso" },
    });
    expect(calls.filter((c) => c.includes("/tools/get_snippet"))).toHaveLength(2);
  });

  test("los componentes sin fijar siguen buscándose", async () => {
    const calls: string[] = [];
    await matchComponents(["card", "button-primary"], {
      fetchImpl: fetchPinned(calls),
      pinned: { card: "mi-recurso" },
    });
    expect(calls.some((c) => c.includes("/tools/search"))).toBe(true);
  });
});
