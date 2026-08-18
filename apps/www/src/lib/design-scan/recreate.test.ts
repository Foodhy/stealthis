import { describe, expect, test } from "bun:test";
import { applyTokens, buildPreviewDocument, paletteOf } from "./recreate";
import type { Frontmatter } from "./tokens";

const front: Frontmatter = {
  version: "alpha",
  name: "Acme",
  colors: {
    surface: "#0b1020",
    "on-surface": "#e2e8f0",
    primary: "#5b21b6",
    outline: "#334155",
  },
  typography: { "body-md": { fontFamily: "Inter", fontSize: "16px" } },
  rounded: { sm: "4px", md: "12px", full: "9999px" },
};

describe("los roles de nuestra paleta", () => {
  test("se reconocen aunque la página los llame de otra forma", () => {
    const p = paletteOf({
      version: "alpha",
      name: "X",
      colors: { background: "#ffffff", text: "#000000", accent: "#ff0000" },
    });

    expect(p.surface).toBe("#ffffff");
    expect(p.onSurface).toBe("#000000");
    expect(p.primary).toBe("#ff0000");
  });
});

describe("vestir un snippet con los tokens", () => {
  const snippet = `
    .card { background-color: #ffffff; color: #111827; border-radius: 6px; font-family: Georgia, serif; }
    .card__cta { background-color: #2563eb; color: #ffffff; border-radius: 999px; }
  `;

  test("el fondo dominante del snippet pasa a ser nuestra superficie", () => {
    const { css } = applyTokens(snippet, front);
    expect(css).toContain("#0b1020");
    expect(css).not.toContain("#ffffff");
  });

  test("el texto dominante pasa a nuestro on-surface", () => {
    const { css } = applyTokens(snippet, front);
    expect(css).toContain("#e2e8f0");
  });

  test("el acento del snippet pasa a nuestro primary", () => {
    const { css } = applyTokens(snippet, front);
    expect(css).toContain("#5b21b6");
    expect(css).not.toContain("#2563eb");
  });

  test("la tipografía es la de la página escaneada, no la del catálogo", () => {
    const { css } = applyTokens(snippet, front);
    expect(css).toContain("font-family: Inter");
    expect(css).not.toContain("Georgia");
  });

  test("cada radio va al escalón más cercano de NUESTRA escala", () => {
    const { css } = applyTokens(snippet, front);
    // 6px está entre 4 y 12: gana 4. Y 999px se va a full.
    expect(css).toContain("border-radius: 4px");
    expect(css).toContain("border-radius: 9999px");
  });

  test("se explica qué se cambió, en vez de parecer magia", () => {
    const { swaps } = applyTokens(snippet, front);
    const reasons = swaps.map((s) => s.reason);

    expect(reasons).toContain("dominant background → surface");
    expect(reasons).toContain("accent → primary");
    expect(swaps.every((s) => s.from !== s.to)).toBe(true);
  });

  test("no quedan colores del catálogo mezclados con los nuestros", () => {
    const conExtras = `${snippet} .badge { background: #f59e0b; } .note { color: #64748b; }`;
    const { css } = applyTokens(conExtras, front);

    const restantes = [...css.matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0].toLowerCase());
    const nuestros = Object.values(front.colors ?? {}).map((c) => c.toLowerCase());

    for (const color of restantes) expect(nuestros, `${color} no es nuestro`).toContain(color);
  });

  test("las formas cortas del mismo color también se sustituyen", () => {
    const { css } = applyTokens(".a { color: #fff; background: #FFFFFF; }", front);
    expect(css).not.toMatch(/#fff\b/i);
  });

  test("un frontmatter sin colores no revienta ni inventa", () => {
    const flaco: Frontmatter = { version: "alpha", name: "X" };
    const { css, swaps } = applyTokens(snippet, flaco);

    expect(css).toContain("#ffffff"); // se queda como estaba
    expect(swaps).toEqual([]);
  });
});

describe("el documento de la vista previa", () => {
  const doc = buildPreviewDocument({
    html: "<div class='modal' hidden>oculto</div>",
    css: ".modal { display: grid; }",
    tokensCss: ":root { --color-primary: #5b21b6; }",
  });

  test("restaura [hidden] por encima del CSS del recurso", () => {
    // Sin esto, el `display: grid` del recurso gana al atributo hidden y el
    // modal sale abierto tapando la vista previa. Es el bug #1 del repo.
    expect(doc).toContain("[hidden] { display: none !important; }");
  });

  test("los tokens van antes que el CSS del recurso", () => {
    expect(doc.indexOf("--color-primary")).toBeLessThan(doc.indexOf(".modal { display: grid; }"));
  });

  test("es un documento completo, no un fragmento", () => {
    expect(doc.startsWith("<!doctype html>")).toBe(true);
    expect(doc).toContain("<body>");
  });
});

describe("los radios extremos", () => {
  test("una píldora sigue siendo una píldora, no el escalón más cercano", () => {
    // Por distancia numérica 999px caería en 12px, que es lo correcto en
    // aritmética y absurdo en diseño.
    const { css } = applyTokens(".pill { border-radius: 999px; }", front);
    expect(css).toContain("border-radius: 9999px");
  });

  test("50% también es una píldora", () => {
    const { css } = applyTokens(".avatar { border-radius: 50%; }", front);
    expect(css).toContain("border-radius: 9999px");
  });
});

describe("qué cuenta como acento", () => {
  test("el fondo oscuro de un modal NO es el acento", () => {
    // Salió con un recurso real del catálogo: el telón de fondo #101322 se
    // llevaba el papel de acento y acababa pintado del color de marca.
    const css = `
      .modal { background: #ffffff; color: #333333; }
      .backdrop { background: #101322; }
    `;
    const { swaps } = applyTokens(css, front);
    const accent = swaps.find((s) => s.reason === "accent → primary");

    expect(accent).toBeUndefined();
  });

  test("un botón de color sí es el acento", () => {
    const css = `
      .card { background: #ffffff; color: #333333; }
      .cta { background: #e11d48; }
    `;
    const { swaps } = applyTokens(css, front);
    const accent = swaps.find((s) => s.reason === "accent → primary");

    expect(accent?.from).toBe("#e11d48");
  });
});
