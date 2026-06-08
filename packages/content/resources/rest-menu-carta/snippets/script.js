const MENU = [
  {
    id: "entradas",
    title: "Entradas",
    note: "To start · for the table",
    items: [
      {
        name: "Pan de masa madre",
        desc: "Sourdough loaf, smoked olive oil, sea salt.",
        price: 8,
        chips: [{ label: "Veg", tone: "veg" }],
      },
      {
        name: "Burrata de la huerta",
        desc: "Heirloom tomato, garden basil, aged balsamic, focaccia crumble.",
        price: 16,
        chips: [
          { label: "Veg", tone: "veg" },
          { label: "Signature", tone: "signature" },
        ],
        featured: true,
      },
      {
        name: "Pulpo a la brasa",
        desc: "Charred octopus, smoked paprika potato, salsa verde.",
        price: 19,
        chips: [{ label: "GF", tone: "gf" }],
      },
      {
        name: "Croquetas de jamón",
        desc: "Iberico ham croquettes, six pieces, lemon aioli.",
        price: 14,
        chips: [],
      },
    ],
  },
  {
    id: "principales",
    title: "Principales",
    note: "Mains · stone-fired",
    items: [
      {
        name: "Ribeye 14oz",
        desc: "Dry-aged 28 days, bone marrow butter, chimichurri.",
        price: 48,
        chips: [
          { label: "GF", tone: "gf" },
          { label: "Signature", tone: "signature" },
        ],
        featured: true,
      },
      {
        name: "Branzino entero",
        desc: "Whole roasted sea bass, fennel, preserved lemon, herb oil.",
        price: 38,
        chips: [{ label: "GF", tone: "gf" }],
      },
      {
        name: "Risotto de hongos",
        desc: "Carnaroli rice, wild mushrooms, brown butter, parmesan.",
        price: 26,
        chips: [{ label: "Veg", tone: "veg" }],
      },
      {
        name: "Pollo al carbón",
        desc: "Half free-range chicken, charred lemon, garlic confit, herb salad.",
        price: 28,
        chips: [{ label: "GF", tone: "gf" }],
      },
      {
        name: "Pappardelle al ragú",
        desc: "Hand-cut pasta, slow-braised lamb shoulder, gremolata.",
        price: 24,
        chips: [{ label: "Spicy", tone: "hot" }],
      },
    ],
  },
  {
    id: "postres",
    title: "Postres",
    note: "Made in-house",
    items: [
      {
        name: "Tarta de queso quemada",
        desc: "Basque burnt cheesecake, salted caramel, sea salt.",
        price: 11,
        chips: [
          { label: "Veg", tone: "veg" },
          { label: "Signature", tone: "signature" },
        ],
        featured: true,
      },
      {
        name: "Olive oil cake",
        desc: "Citrus olive oil cake, crème fraîche, candied orange.",
        price: 10,
        chips: [{ label: "Veg", tone: "veg" }],
      },
      {
        name: "Chocolate ganache",
        desc: "Bittersweet dark chocolate, hazelnut praline, espresso ice.",
        price: 12,
        chips: [
          { label: "Veg", tone: "veg" },
          { label: "GF", tone: "gf" },
        ],
      },
    ],
  },
  {
    id: "bebidas",
    title: "Bebidas",
    note: "Natural wine · craft cocktails",
    items: [
      {
        name: "Vermut de la casa",
        desc: "House vermouth on tap, orange peel, green olive.",
        price: 9,
        chips: [],
      },
      {
        name: "Negroni sbagliato",
        desc: "Campari, sweet vermouth, sparkling wine.",
        price: 14,
        chips: [],
      },
      {
        name: "Spritz de naranja sanguina",
        desc: "Blood orange, Aperol, prosecco, soda.",
        price: 13,
        chips: [],
      },
      {
        name: "Tinto natural (copa)",
        desc: "Rotating natural red, ask your server.",
        price: 12,
        chips: [],
      },
    ],
  },
];

const carta = document.getElementById("carta");
const search = document.getElementById("search");
const tabs = document.querySelectorAll(".cat-tab");
const empty = document.getElementById("empty");

function render() {
  carta.innerHTML = MENU.map(
    (section) => `
    <section class="section" id="${section.id}" data-section>
      <header class="section-head">
        <h2 class="section-title">${section.title}</h2>
        <p class="section-note">${section.note}</p>
      </header>
      <div class="grid">
        ${section.items
          .map(
            (item) => `
          <article class="dish ${item.featured ? "is-featured" : ""}" data-dish
            data-name="${item.name.toLowerCase()}"
            data-desc="${item.desc.toLowerCase()}">
            <div class="dish-row">
              <h3 class="dish-name">${item.name}</h3>
              <span class="dish-price">$${item.price.toFixed(2)}</span>
            </div>
            <p class="dish-desc">${item.desc}</p>
            ${
              item.chips.length
                ? `<div class="dish-meta">${item.chips
                    .map((c) => `<span class="chip" data-tone="${c.tone}">${c.label}</span>`)
                    .join("")}</div>`
                : ""
            }
          </article>`
          )
          .join("")}
      </div>
    </section>`
  ).join("");
}

function filter(query) {
  const q = query.trim().toLowerCase();
  let anyVisible = false;
  carta.querySelectorAll("[data-section]").forEach((section) => {
    let sectionVisible = false;
    section.querySelectorAll("[data-dish]").forEach((d) => {
      const match = !q || d.dataset.name.includes(q) || d.dataset.desc.includes(q);
      d.hidden = !match;
      if (match) sectionVisible = true;
    });
    section.hidden = !sectionVisible;
    if (sectionVisible) anyVisible = true;
  });
  empty.hidden = anyVisible;
}

function activateTab(id) {
  tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.target === id));
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = document.getElementById(tab.dataset.target);
    if (!target) return;
    activateTab(tab.dataset.target);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

search.addEventListener("input", (e) => filter(e.target.value));

// Scroll-spy: highlight the section currently in view.
const spy = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) activateTab(visible.target.id);
  },
  { rootMargin: "-80px 0px -60% 0px", threshold: [0.1, 0.5] }
);

render();
carta.querySelectorAll("[data-section]").forEach((s) => spy.observe(s));
