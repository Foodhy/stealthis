import { describe, expect, test } from "bun:test";
import { luminance, normalizeColor, readRootVariables, toPx } from "./css";
import { type CaptureInput, extractFrontmatter } from "./tokens";

const capture = (css: string, url = "https://acme.dev/"): CaptureInput => ({
  finalUrl: url,
  html: "<html></html>",
  inlineStyles: [css],
  stylesheets: [],
});

describe("normalizar colores", () => {
  test("las cuatro formas del mismo blanco colapsan en una", () => {
    for (const v of ["#fff", "#ffffff", "rgb(255,255,255)", "white", "hsl(0, 0%, 100%)"])
      expect(normalizeColor(v), v).toBe("#ffffff");
  });

  test("rgb con porcentajes y con espacios modernos", () => {
    expect(normalizeColor("rgb(100% 0% 0%)")).toBe("#ff0000");
    expect(normalizeColor("rgba(255, 0, 0, 0.5)")).toBe("#ff0000");
  });

  test("hsl se convierte de verdad, no se copia", () => {
    expect(normalizeColor("hsl(210, 100%, 50%)")).toBe("#0080ff");
  });

  test("los valores que no son de paleta se descartan", () => {
    for (const v of ["transparent", "inherit", "currentColor", "none", ""])
      expect(normalizeColor(v), v).toBeNull();
  });

  test("oklch se conserva tal cual: la spec lo acepta", () => {
    expect(normalizeColor("oklch(0.7 0.1 200)")).toBe("oklch(0.7 0.1 200)");
  });

  test("el alfa del hex de 8 dígitos se descarta, no rompe", () => {
    expect(normalizeColor("#ff000080")).toBe("#ff0000");
  });
});

describe("dimensiones", () => {
  test("rem y em se asumen a 16px", () => {
    expect(toPx("1rem")).toBe(16);
    expect(toPx("1.5rem")).toBe(24);
    expect(toPx("24px")).toBe(24);
  });

  test("un número suelto solo vale si es 0", () => {
    expect(toPx("0")).toBe(0);
    expect(toPx("12")).toBeNull();
    expect(toPx("50%")).toBeNull();
  });
});

describe("colores desde las variables del :root", () => {
  const css = `
    :root {
      --brand-primary: #5b21b6;
      --surface: #0b1020;
      --text: rgb(226, 232, 240);
      --radius: 8px;
      --font: Inter;
    }
    body { color: var(--text); }
  `;

  test("solo las variables que son colores entran en la paleta", () => {
    const vars = readRootVariables(css);
    expect(vars.size).toBe(5);

    const front = extractFrontmatter(capture(css));
    expect(front.colors).toBeDefined();
    // --radius y --font no son colores y no deben colarse.
    expect(Object.keys(front.colors ?? {}).sort()).toEqual([
      "brand-primary",
      "primary",
      "surface",
      "text",
    ]);
  });

  test("se respeta el nombre que puso la página, no se renombra", () => {
    const front = extractFrontmatter(capture(css));
    expect(front.colors?.["brand-primary"]).toBe("#5b21b6");
    expect(front.colors?.text).toBe("#e2e8f0"); // normalizado desde rgb()
  });

  test("siempre acaba habiendo un `primary`, que la spec lo exige", () => {
    expect(extractFrontmatter(capture(css)).colors?.primary).toBeDefined();
  });
});

describe("colores por rol cuando no hay variables", () => {
  const css = `
    body { background-color: #ffffff; color: #111827; }
    p { color: #111827; }
    .card { background-color: #ffffff; border-color: #e5e7eb; }
    .cta { background-color: #2563eb; color: #ffffff; }
    .cta:hover { background-color: #2563eb; }
  `;

  test("el fondo más repetido es la superficie", () => {
    expect(extractFrontmatter(capture(css)).colors?.surface).toBe("#ffffff");
  });

  test("el texto dominante es on-surface", () => {
    expect(extractFrontmatter(capture(css)).colors?.["on-surface"]).toBe("#111827");
  });

  test("el acento vivo es primary, no el gris del borde", () => {
    expect(extractFrontmatter(capture(css)).colors?.primary).toBe("#2563eb");
  });
});

describe("typography", () => {
  const css = `
    h1 { font-family: Inter, sans-serif; font-size: 48px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
    h2 { font-family: Inter; font-size: 32px; font-weight: 600; }
    body { font-family: Inter; font-size: 16px; font-weight: 400; line-height: 1.6; }
    small { font-family: Inter; font-size: 12px; }
  `;

  test("un nivel por combinación, con la forma de la spec", () => {
    const t = extractFrontmatter(capture(css)).typography ?? {};
    const display = t["display-lg"];

    expect(display?.fontFamily).toBe("Inter"); // sin la pila de respaldo
    expect(display?.fontSize).toBe("48px");
    expect(display?.fontWeight).toBe(700);
    expect(display?.lineHeight).toBe(1.1); // sin unidad: multiplicador
    expect(display?.letterSpacing).toBe("-0.02em");
  });

  test("los niveles se nombran por tamaño con la convención de la spec", () => {
    const t = extractFrontmatter(capture(css)).typography ?? {};
    expect(Object.keys(t)).toContain("display-lg");
    expect(Object.keys(t)).toContain("headline-lg");
    expect(Object.keys(t)).toContain("body-md");
  });

  test("40 tamaños distintos NO producen 40 niveles", () => {
    const ruido = Array.from({ length: 40 }, (_, i) => `.x${i} { font-size: ${10 + i}px; }`).join(
      "\n"
    );
    const t = extractFrontmatter(capture(ruido)).typography ?? {};
    expect(Object.keys(t).length).toBeLessThanOrEqual(12);
  });
});

describe("rounded", () => {
  test("los radios se agrupan en escala, no se vuelcan todos", () => {
    const css = Array.from({ length: 12 }, (_, i) => `.r${i} { border-radius: ${i + 1}px; }`).join(
      "\n"
    );
    const r = extractFrontmatter(capture(css)).rounded ?? {};
    expect(Object.keys(r).length).toBeLessThanOrEqual(6);
  });

  test("50% y 9999px se reconocen como `full`", () => {
    const r = extractFrontmatter(capture(".a{border-radius:50%} .b{border-radius:4px}")).rounded;
    expect(r?.full).toBe("9999px");
  });

  test("una página sin esquinas redondeadas NO inventa la escala", () => {
    const front = extractFrontmatter(capture("body{color:#000}"));
    expect(front.rounded).toBeUndefined();
    expect(front.omitted?.some((o) => o.section === "rounded")).toBe(true);
  });
});

describe("spacing", () => {
  test("deduce la unidad base de 8 y construye la escala", () => {
    const css = `.a{padding:8px} .b{margin:16px} .c{gap:24px} .d{padding:32px}`;
    const s = extractFrontmatter(capture(css)).spacing ?? {};
    expect(s.base).toBe("8px");
    expect(s.xs).toBe("8px");
    expect(s.sm).toBe("16px");
  });

  test("una página con escala de 4 no se fuerza a 8", () => {
    const css = `.a{padding:4px} .b{margin:12px} .c{gap:20px} .d{padding:28px} .e{gap:36px}`;
    expect(extractFrontmatter(capture(css)).spacing?.base).toBe("4px");
  });
});

describe("lo que no se puede extraer", () => {
  test("va a `omitted` con su motivo, no inventado", () => {
    const front = extractFrontmatter(capture("/* vacío */"));
    const secciones = (front.omitted ?? []).map((o) => o.section).sort();

    expect(secciones).toEqual(["colors", "components", "rounded", "spacing", "typography"]);
    expect(front.omitted?.every((o) => o.reason.length > 0)).toBe(true);
    expect(front.colors).toBeUndefined();
  });

  test("`components` siempre queda omitido: lo llena la fase de prosa", () => {
    const front = extractFrontmatter(capture("body{color:#fff;font-size:16px}"));
    expect(front.omitted?.some((o) => o.section === "components")).toBe(true);
  });
});

describe("cabecera", () => {
  test("version, name y description salidos de la propia página", () => {
    const front = extractFrontmatter(capture("body{color:#000}", "https://www.stealthis.dev/"));
    expect(front.version).toBe("alpha");
    expect(front.name).toBe("Stealthis"); // sin el www., capitalizado
    expect(front.description).toContain("stealthis.dev");
  });
});

describe("luminancia", () => {
  test("blanco y negro en los extremos", () => {
    expect(luminance("#ffffff")).toBeCloseTo(1, 2);
    expect(luminance("#000000")).toBeCloseTo(0, 2);
  });
});

describe("la superficie sale del documento, no del recuento", () => {
  test("un sitio oscuro con utilidades NO acaba con superficie blanca", () => {
    // Caso real de stealthis.dev: el fondo se declara una vez en html, y el CSS
    // trae docenas de .bg-white que ganaban por frecuencia.
    const css = `
      html { background-color: rgb(3 7 18 / var(--tw-bg-opacity, 1)); }
      .bg-white { background-color: #ffffff; }
      .bg-white\\/10 { background-color: #ffffff; }
      .bg-white\\/5 { background-color: #ffffff; }
      .a { background-color: #ffffff; }
      .b { background-color: #ffffff; }
      p { color: #e2e8f0; }
    `;
    const front = extractFrontmatter(capture(css));

    expect(front.colors?.surface).toBe("#030712");
    expect(front.colors?.surface).not.toBe("#ffffff");
  });

  test("un sitio claro sigue saliendo claro", () => {
    const css = `body { background: #ffffff; } p { color: #111827; }`;
    expect(extractFrontmatter(capture(css)).colors?.surface).toBe("#ffffff");
  });

  test("on-surface se elige por contraste contra la superficie, no por frecuencia", () => {
    // El gris se usa más, pero es ilegible sobre el fondo oscuro.
    const css = `
      html { background: #030712; }
      .a { color: #333333; } .b { color: #333333; } .c { color: #333333; }
      .d { color: #e2e8f0; }
    `;
    expect(extractFrontmatter(capture(css)).colors?.["on-surface"]).toBe("#e2e8f0");
  });
});
