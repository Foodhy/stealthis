import { describe, expect, test } from "bun:test";
import {
  BODY_SECTIONS,
  buildPrompt,
  detectComponents,
  parseJsonResponse,
  renderBody,
  validate,
} from "./prose";
import type { Frontmatter } from "./tokens";

const front: Frontmatter = {
  version: "alpha",
  name: "Acme",
  colors: { primary: "#2563eb", surface: "#ffffff", "on-surface": "#111827" },
  typography: { "body-md": { fontFamily: "Inter", fontSize: "16px" } },
  rounded: { md: "8px" },
  spacing: { base: "8px" },
};

const goodResponse = {
  sections: Object.fromEntries(BODY_SECTIONS.map((s) => [s, `Text for ${s}.`])),
  components: {
    "button-primary": {
      backgroundColor: "{colors.primary}",
      textColor: "{colors.surface}",
      rounded: "{rounded.md}",
    },
  },
};

describe("detectar componentes en el HTML", () => {
  test("reconoce lo que hay y no inventa lo que no", () => {
    const html = `<button>ok</button><input type="text"><nav><a href="/">x</a></nav>`;
    const found = detectComponents(html);

    expect(found).toContain("button-primary");
    expect(found).toContain("input-field");
    expect(found).toContain("nav-link");
    expect(found).not.toContain("modal");
    expect(found).not.toContain("table-cell");
  });

  test("una página sin nada devuelve lista vacía", () => {
    expect(detectComponents("<p>hola</p>")).toEqual([]);
  });
});

describe("el prompt", () => {
  test("manda los tokens, NO el CSS: es lo que abarata la llamada", () => {
    const [, user] = buildPrompt(front, ["button-primary"], "https://acme.dev/");

    expect(user.content).toContain("primary");
    expect(user.content).toContain("#2563eb");
    expect(user.content).toContain("button-primary");
    // Nada de CSS crudo ni de HTML en el prompt.
    expect(user.content).not.toContain("<html");
    expect(user.content).not.toContain("border-radius:");
  });

  test("el sistema exige las ocho secciones y prohíbe inventar tokens", () => {
    const [system] = buildPrompt(front, [], "https://acme.dev/");
    for (const s of BODY_SECTIONS) expect(system.content).toContain(s);
    expect(system.content).toContain("Never invent tokens");
  });
});

describe("leer la respuesta del modelo", () => {
  test("JSON limpio", () => {
    expect(parseJsonResponse('{"a":1}')).toEqual({ a: 1 });
  });

  test("JSON dentro de un fence de markdown", () => {
    expect(parseJsonResponse('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  test("JSON con cháchara alrededor", () => {
    expect(parseJsonResponse('Sure! Here it is:\n{"a":1}\nHope it helps.')).toEqual({ a: 1 });
  });

  test("una respuesta sin JSON falla con un mensaje que se entiende", () => {
    expect(() => parseJsonResponse("no puedo ayudarte con eso")).toThrow(/did not return JSON/);
  });
});

describe("validar lo que devuelve el modelo", () => {
  test("una respuesta buena pasa entera", () => {
    const r = validate(front, goodResponse);
    expect(Object.keys(r.sections)).toHaveLength(8);
    expect(r.components["button-primary"].backgroundColor).toBe("{colors.primary}");
    expect(r.discarded).toEqual([]);
  });

  test("una referencia a un token que NO existe se descarta", () => {
    const r = validate(front, {
      ...goodResponse,
      components: { card: { backgroundColor: "{colors.inventado}" } },
    });

    expect(r.components.card).toBeUndefined();
    expect(r.discarded.join(" ")).toContain("does not exist");
  });

  test("un literal legítimo sí se conserva", () => {
    const r = validate(front, {
      ...goodResponse,
      components: { glass: { backgroundColor: "rgba(255,255,255,0.1)" } },
    });
    expect(r.components.glass.backgroundColor).toBe("rgba(255,255,255,0.1)");
  });

  test("una propiedad que no está en la spec se descarta", () => {
    const r = validate(front, {
      ...goodResponse,
      components: { card: { borderColor: "{colors.primary}", rounded: "{rounded.md}" } },
    });

    expect(r.components.card.borderColor).toBeUndefined();
    expect(r.components.card.rounded).toBe("{rounded.md}");
    expect(r.discarded.join(" ")).toContain("not a component property");
  });

  test("una sección vacía se anota en vez de colarse", () => {
    const r = validate(front, {
      sections: { Overview: "algo", Colors: "   " },
      components: {},
    });

    expect(r.sections.Overview).toBe("algo");
    expect(r.sections.Colors).toBeUndefined();
    expect(r.discarded.filter((d) => d.includes("came back empty"))).toHaveLength(7);
  });

  test("basura absoluta no revienta", () => {
    const r = validate(front, { sections: "no es un objeto", components: 42 });
    expect(r.components).toEqual({});
  });
});

describe("montar el cuerpo", () => {
  test("las ocho secciones, en el orden de la spec, SIEMPRE", () => {
    // Aunque el modelo devuelva solo dos, la estructura la ponemos nosotros.
    const body = renderBody({ Overview: "uno", Shapes: "dos" });
    const headings = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

    expect(headings).toEqual([...BODY_SECTIONS]);
  });

  test("lo que falta se marca, no se deja en blanco", () => {
    expect(renderBody({})).toContain("_Nothing to say for this design system._");
  });

  test("el texto del modelo va bajo su encabezado", () => {
    const body = renderBody({ Colors: "El acento solo para la acción principal." });
    expect(body).toContain("## Colors\n\nEl acento solo para la acción principal.");
  });
});

describe("alias de secciones que la spec permite", () => {
  test('"Layout & Spacing" cuenta como Layout', () => {
    const r = validate(front, {
      sections: { "Layout & Spacing": "Rejilla de 12 columnas." },
      components: {},
    });
    expect(r.sections.Layout).toBe("Rejilla de 12 columnas.");
  });

  test('"Elevation" y "Brand & Style" también', () => {
    const r = validate(front, {
      sections: { Elevation: "Sin sombras.", "Brand & Style": "Sobrio." },
      components: {},
    });
    expect(r.sections["Elevation & Depth"]).toBe("Sin sombras.");
    expect(r.sections.Overview).toBe("Sobrio.");
  });

  test("una clave inventada por el modelo se ignora", () => {
    const r = validate(front, { sections: { Iconography: "algo" }, components: {} });
    expect(Object.keys(r.sections)).toHaveLength(0);
  });
});
