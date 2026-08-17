import { describe, expect, test } from "bun:test";
import {
  EXPORT_TARGETS,
  checkContrast,
  contrastRatio,
  toCssVariables,
  toDtcg,
  toTailwindV3,
  toTailwindV4,
} from "./export";
import type { Frontmatter } from "./tokens";

const front: Frontmatter = {
  version: "alpha",
  name: "Acme",
  colors: { primary: "#2563eb", surface: "#ffffff", "on-surface": "#111827" },
  typography: {
    "display-lg": {
      fontFamily: "Inter",
      fontSize: "48px",
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
    },
    "body-md": { fontFamily: "Inter", fontSize: "16px" },
  },
  rounded: { md: "8px", full: "9999px" },
  spacing: { base: "8px", lg: "40px" },
};

describe("contraste WCAG", () => {
  test("los extremos conocidos", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
  });

  test("da igual el orden de los argumentos", () => {
    expect(contrastRatio("#2563eb", "#ffffff")).toBe(contrastRatio("#ffffff", "#2563eb"));
  });

  test("un par que NO llega a AA se marca", () => {
    // Gris claro sobre blanco: legible para un diseñador, no para WCAG.
    const findings = checkContrast(front, {
      flojo: { backgroundColor: "#ffffff", textColor: "#aaaaaa" },
    });

    expect(findings).toHaveLength(1);
    expect(findings[0].passesAA).toBe(false);
    expect(findings[0].ratio).toBeLessThan(4.5);
  });

  test("resuelve las referencias a tokens, no solo los literales", () => {
    const findings = checkContrast(front, {
      "button-primary": { backgroundColor: "{colors.primary}", textColor: "{colors.surface}" },
    });

    expect(findings[0].background).toBe("#2563eb");
    expect(findings[0].text).toBe("#ffffff");
    expect(findings[0].passesAA).toBe(true);
  });

  test("lo que no se puede juzgar NO se juzga", () => {
    // Un translúcido no tiene luminancia calculable sin renderizarlo; inventarla
    // sería peor que callarse.
    const findings = checkContrast(front, {
      glass: { backgroundColor: "rgba(255,255,255,0.1)", textColor: "{colors.surface}" },
      "sin-texto": { backgroundColor: "{colors.primary}" },
    });

    expect(findings).toHaveLength(0);
  });

  test("se ordenan de peor a mejor: lo urgente primero", () => {
    const findings = checkContrast(front, {
      bueno: { backgroundColor: "#000000", textColor: "#ffffff" },
      malo: { backgroundColor: "#ffffff", textColor: "#eeeeee" },
    });

    expect(findings[0].component).toBe("malo");
  });
});

describe("Tailwind v3", () => {
  const out = toTailwindV3(front);

  test("va bajo theme.extend, no bajo theme", () => {
    // Sustituir `theme` borraría la escala de Tailwind y rompería el proyecto.
    expect(out).toContain("theme: { extend:");
  });

  test("lleva colores, tamaños, radios y espaciado", () => {
    expect(out).toContain('"primary": "#2563eb"');
    expect(out).toContain('"on-surface"');
    expect(out).toContain("48px");
    expect(out).toContain("9999px");
  });

  test("el tamaño con interlineado sale como par [size, {...}]", () => {
    expect(out).toMatch(/"display-lg":\s*\[\s*"48px"/);
    expect(out).toContain('"lineHeight": "1.1"');
  });

  test("es JavaScript válido y evaluable", () => {
    const module = { exports: {} as { theme?: { extend?: Record<string, unknown> } } };
    new Function("module", out)(module);
    expect(module.exports.theme?.extend?.colors).toMatchObject({ primary: "#2563eb" });
  });
});

describe("Tailwind v4", () => {
  const out = toTailwindV4(front);

  test("emite un bloque @theme con las variables que Tailwind reconoce", () => {
    expect(out).toContain("@theme {");
    expect(out).toContain("--color-primary: #2563eb;");
    expect(out).toContain("--radius-md: 8px;");
    expect(out).toContain("--spacing-base: 8px;");
    expect(out).toContain("--text-display-lg: 48px;");
  });

  test("los modificadores de tipografía usan la sintaxis de v4", () => {
    expect(out).toContain("--text-display-lg--line-height: 1.1;");
    expect(out).toContain("--text-display-lg--font-weight: 700;");
  });

  test("abre y cierra bien", () => {
    expect(out.match(/\{/g)).toHaveLength(1);
    expect(out.match(/\}/g)).toHaveLength(1);
  });
});

describe("DTCG (W3C)", () => {
  const parsed = JSON.parse(toDtcg(front));

  test("cada grupo declara su $type", () => {
    expect(parsed.color.$type).toBe("color");
    expect(parsed.typography.$type).toBe("typography");
    expect(parsed.radius.$type).toBe("dimension");
  });

  test("cada token lleva su $value", () => {
    expect(parsed.color.primary.$value).toBe("#2563eb");
    expect(parsed.typography["display-lg"].$value.fontSize).toBe("48px");
  });

  test("es JSON válido", () => {
    expect(() => JSON.parse(toDtcg(front))).not.toThrow();
  });
});

describe("variables CSS", () => {
  test("planas y con los prefijos que espera STL-031", () => {
    const out = toCssVariables(front);
    expect(out).toContain(":root {");
    expect(out).toContain("--color-primary: #2563eb;");
    expect(out).toContain("--font-body-md: Inter;");
  });
});

describe("un frontmatter con secciones omitidas", () => {
  const flaco: Frontmatter = { version: "alpha", name: "Flaco", colors: { primary: "#000000" } };

  test("ningún exportador revienta por lo que falta", () => {
    for (const target of EXPORT_TARGETS) {
      expect(() => target.build(flaco), target.id).not.toThrow();
      expect(target.build(flaco).length, target.id).toBeGreaterThan(0);
    }
  });

  test("y no inventan secciones vacías", () => {
    expect(toTailwindV3(flaco)).not.toContain("borderRadius");
    expect(JSON.parse(toDtcg(flaco)).radius).toBeUndefined();
  });
});

describe("el config de Tailwind es de verdad usable", () => {
  test("trae `content` ya puesto, que es lo único que Tailwind exige aparte del tema", () => {
    const out = toTailwindV3(front);
    expect(out).toContain("content: []");
    expect(out).toContain("Point this at your own templates");
  });
});
