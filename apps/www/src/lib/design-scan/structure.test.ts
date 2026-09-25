import { describe, expect, test } from "bun:test";
import { readNav, readSections, readStructure } from "./structure";

const GOOGLE_LIKE = `
<html><head><title>Google</title></head>
<body>
  <div id="top">
    <a href="/about">About</a><a href="/store">Store</a>
    <a href="https://mail.google.com">Gmail</a><a href="/images">Images</a>
    <a class="gb_b">Sign in</a>
  </div>
  <center>
    <img src="/logo.png" alt="Google">
    <form action="/search">
      <input type="text" name="q" aria-label="Search">
      <input type="submit" value="Google Search">
      <input type="submit" value="I'm Feeling Lucky">
    </form>
    <p>Google offered in: <a href="#">Español</a></p>
  </center>
  <footer><a href="/ads">Advertising</a><a href="/privacy">Privacy</a></footer>
</body></html>`;

const PAGINA = `
<html><head><title>Foodhy — nutrición</title></head>
<body>
  <header><nav>
    <a href="/"><img src="logo.svg"></a>
    <a href="/pilares">Pilares</a><a href="/precios">Precios</a><a href="/blog">Blog</a>
  </nav></header>
  <h1>Come mejor sin pensarlo</h1>
  <p>Planes de nutrición que se adaptan a ti.</p>
  <button class="cta">Empieza gratis</button>
  <a href="/demo" class="btn">Ver demo</a>
  <h2>Los cuatro pilares</h2>
  <div class="grid">
    <article class="pillar">Nutrición</article>
    <article class="pillar">Ejercicio</article>
    <article class="pillar">Sueño</article>
    <article class="pillar">Mental</article>
  </div>
  <h2>Escríbenos</h2>
  <form><input type="email"><textarea></textarea></form>
  <footer>© Foodhy</footer>
</body></html>`;

describe("la navegación", () => {
  test("saca los enlaces con texto y descarta el logo", () => {
    expect(readNav(PAGINA)).toEqual(["Pilares", "Precios", "Blog"]);
  });

  test("una página sin nav no revienta", () => {
    expect(readNav("<body><p>hola</p></body>")).toEqual([]);
  });
});

describe("las secciones", () => {
  test("se parten por encabezados, no por etiquetas <section>", () => {
    const s = readSections(PAGINA);
    expect(s.map((x) => x.heading)).toEqual([
      "Come mejor sin pensarlo",
      "Los cuatro pilares",
      "Escríbenos",
    ]);
  });

  test("cuenta los bloques repetidos, que es lo que delata una rejilla", () => {
    const pilares = readSections(PAGINA).find((s) => s.heading === "Los cuatro pilares");
    expect(pilares?.repeated).toBe(4);
  });

  test("una sección de prosa no tiene repetición", () => {
    const contacto = readSections(PAGINA).find((s) => s.heading === "Escríbenos");
    expect(contacto?.repeated).toBe(0);
  });
});

describe("los componentes salen de la evidencia", () => {
  const { components } = readStructure(PAGINA);
  const nombres = components.map((c) => c.name);

  test("cada uno viene con el motivo por el que se propone", () => {
    expect(components.every((c) => c.evidence.length > 0)).toBe(true);
  });

  test("la tarjeta se justifica por repetición, no por la palabra card", () => {
    const card = components.find((c) => c.name === "card");
    expect(card?.evidence).toContain("4 repeated blocks");
  });

  test("reconoce botones, navegación, formulario y pie", () => {
    expect(nombres).toContain("button-primary");
    expect(nombres).toContain("nav-link");
    expect(nombres).toContain("email-field");
    expect(nombres).toContain("textarea");
    expect(nombres).toContain("footer");
  });

  test("NO inventa un table-cell por tener una tabla", () => {
    // El fallo real: Google traía un <table> y salía `table-cell`, que luego
    // emparejaba con una tabla de precios sin ninguna relación.
    const conTabla = readStructure("<body><table><tr><td>1</td></tr></table></body>");
    expect(conTabla.components.map((c) => c.name)).not.toContain("table-cell");
  });

  test("NO inventa nada por el nombre de una clase", () => {
    // Foodhy tenía clases con "pillar" y el modelo se sacó un `pillar-tag`.
    const conClase = readStructure('<body><div class="pillar-thing">x</div></body>');
    expect(conClase.components).toEqual([]);
  });
});

describe("cuando la página no da material", () => {
  test("una app que se pinta con JavaScript se DICE, no se rellena", () => {
    const cascaron =
      '<html><body><div id="root"></div><script src="app.js"></script></body></html>';
    const s = readStructure(cascaron);

    expect(s.warnings.join(" ")).toContain("rendered by JavaScript");
    expect(s.components).toEqual([]);
    expect(s.sections).toEqual([]);
  });

  test("se avisa de cada cosa que falta por separado", () => {
    const s = readStructure(
      "<body><p>solo un párrafo bastante largo para pasar el umbral de texto que exige el aviso de página vacía, así que aquí hay palabras de sobra para llegar.</p></body>"
    );
    expect(s.warnings.some((w) => w.includes("No headings"))).toBe(true);
    expect(s.warnings.some((w) => w.includes("No navigation"))).toBe(true);
  });
});

describe("homepage tipo Google", () => {
  test("detecta buscador, botones submit, nav y footer sin depender de <nav>", () => {
    const s = readStructure(GOOGLE_LIKE);
    const names = s.components.map((c) => c.name);
    expect(names).toContain("search-field");
    expect(names).toContain("button-primary");
    expect(names).toContain("nav-link");
    expect(names).toContain("footer");
    expect(names).toContain("logo");
    expect(s.submitLabels).toContain("Google Search");
    expect(s.nav.length).toBeGreaterThanOrEqual(2);
  });
});

describe("la cabecera de la página", () => {
  test("título y titular", () => {
    const s = readStructure(PAGINA);
    expect(s.title).toBe("Foodhy — nutrición");
    expect(s.headline).toBe("Come mejor sin pensarlo");
    expect(s.hasFooter).toBe(true);
  });
});
