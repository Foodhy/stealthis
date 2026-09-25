import { describe, expect, test } from "bun:test";
import { buildReplicaPrompt, parseReplicaResponse, sanitize } from "./replica";
import type { PageStructure } from "./structure";
import type { Frontmatter } from "./tokens";
import { emptyBrief } from "./types";

const front: Frontmatter = {
  version: "alpha",
  name: "Foodhy",
  colors: { surface: "#ffffff", "on-surface": "#046635", primary: "#8ac14c" },
  typography: { "display-lg": { fontFamily: "Fraunces", fontSize: "60px" } },
  rounded: { md: "12px" },
  spacing: { lg: "40px" },
};

const structure: PageStructure = {
  title: "Foodhy",
  headline: "Come mejor sin pensarlo",
  nav: ["Pilares", "Precios"],
  sections: [
    { heading: "Los cuatro pilares", level: 2, repeated: 4, excerpt: "Nutrición, ejercicio…" },
  ],
  formFields: ["email"],
  submitLabels: ["Empieza gratis"],
  hasFooter: true,
  components: [{ name: "card", evidence: "4 repeated blocks" }],
  warnings: [],
};

describe("el prompt de la réplica", () => {
  test("lleva la estructura real de la página, no el HTML crudo", () => {
    const [, user] = buildReplicaPrompt(front, structure, emptyBrief(), "");

    expect(user.content).toContain("Come mejor sin pensarlo");
    expect(user.content).toContain("Pilares · Precios");
    expect(user.content).toContain("4 repeated blocks");
    expect(user.content).not.toContain("<html");
  });

  test("lista las variables CSS que existen de verdad", () => {
    const [, user] = buildReplicaPrompt(front, structure, emptyBrief(), "");

    expect(user.content).toContain("--color-primary");
    expect(user.content).toContain("--text-display-lg");
    expect(user.content).toContain("--spacing-lg");
  });

  test("lo que dice el usuario va al final y con prioridad explícita", () => {
    const brief = { ...emptyBrief(), notes: "el hero lleva dos botones" };
    const [, user] = buildReplicaPrompt(front, structure, brief, "");

    expect(user.content).toContain("follow it over your own judgement");
    expect(user.content).toContain("el hero lleva dos botones");
    // Después de la estructura: es lo último que lee el modelo.
    expect(user.content.indexOf("dos botones")).toBeGreaterThan(
      user.content.indexOf("Los cuatro pilares")
    );
  });

  test("el HTML de referencia pegado también llega", () => {
    const brief = { ...emptyBrief(), reference: "<section class='hero'>x</section>" };
    const [, user] = buildReplicaPrompt(front, structure, brief, "");
    expect(user.content).toContain("hero");
  });

  test("el sistema prohíbe colores a pelo y scripts", () => {
    const [system] = buildReplicaPrompt(front, structure, emptyBrief(), "");
    expect(system.content).toContain("Never hardcode");
    expect(system.content).toContain("No <script>");
  });

  test("incluye snippets del catálogo cuando hay piezas", () => {
    const [, user] = buildReplicaPrompt(front, structure, emptyBrief(), "", [
      { role: "search-field", slug: "search-bar", html: "<form><input></form>", css: ".x{}" },
    ]);
    expect(user.content).toContain("search-field");
    expect(user.content).toContain("search-bar");
  });
});

describe("leer la respuesta", () => {
  test("JSON con html y css", () => {
    const r = parseReplicaResponse('{"html":"<main>x</main>","css":"main{}"}');
    expect(r.html).toBe("<main>x</main>");
  });

  test("dentro de un fence, o con cháchara alrededor", () => {
    expect(parseReplicaResponse('```json\n{"html":"<p>a</p>","css":""}\n```').html).toBe(
      "<p>a</p>"
    );
    expect(parseReplicaResponse('Claro:\n{"html":"<p>b</p>","css":""}\nlisto').html).toBe(
      "<p>b</p>"
    );
  });

  test("sin JSON, falla con un mensaje que se entiende", () => {
    expect(() => parseReplicaResponse("no puedo")).toThrow(/did not return JSON/);
  });
});

describe("limpiar lo que no debe salir", () => {
  test("los scripts se quitan y se dice cuántos", () => {
    const r = sanitize("<main>ok</main><script>alert(1)</script>", "");
    expect(r.html).not.toContain("script");
    expect(r.stripped.join(" ")).toContain("1 <script>");
  });

  test("los manejadores en línea también", () => {
    const r = sanitize('<button onclick="hack()">x</button>', "");
    expect(r.html).not.toContain("onclick");
    expect(r.stripped.join(" ")).toContain("inline event handler");
  });

  test("un recurso externo se neutraliza: delataría al visitante", () => {
    const r = sanitize('<img src="https://tracker.example/pixel.gif">', "");
    expect(r.html).not.toContain("tracker.example");
    expect(r.stripped.join(" ")).toContain("external URL");
  });

  test("@import y url() externos del CSS", () => {
    const r = sanitize(
      "<p>x</p>",
      '@import url("https://fonts.example/x.css"); a{background:url(https://x.dev/i.png)}'
    );
    expect(r.css).not.toContain("@import");
    expect(r.css).not.toContain("https://x.dev");
    expect(r.stripped.length).toBe(2);
  });

  test("el envoltorio sobra: se devuelve solo el cuerpo", () => {
    const r = sanitize("<!doctype html><html><body><main>x</main></body></html>", "");
    expect(r.html).toBe("<main>x</main>");
  });

  test("una respuesta limpia no se toca ni se anota nada", () => {
    const r = sanitize("<main><h1>Hola</h1></main>", "main { color: var(--color-primary); }");
    expect(r.html).toBe("<main><h1>Hola</h1></main>");
    expect(r.stripped).toEqual([]);
  });
});
