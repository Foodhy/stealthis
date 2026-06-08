// Dishes labelled with what they CONTAIN and what diets they are SUITABLE for.
// contains: any of dairy, nuts, shellfish, eggs, pork, gluten, spicy
// diet: vegan / vegetarian / gluten-free (it's safe for that diet)
const DISHES = [
  {
    name: "Pan masa madre",
    price: 8,
    desc: "Sourdough, smoked oil, sea salt.",
    contains: ["gluten"],
    diet: ["vegan", "vegetarian"],
    tags: [{ label: "Vegan", tone: "vegan" }],
  },
  {
    name: "Burrata huerta",
    price: 16,
    desc: "Heirloom tomato, garden basil, focaccia.",
    contains: ["dairy", "gluten"],
    diet: ["vegetarian"],
    tags: [{ label: "Veg", tone: "veg" }],
  },
  {
    name: "Pulpo a la brasa",
    price: 19,
    desc: "Charred octopus, paprika potato.",
    contains: ["shellfish"],
    diet: ["gluten-free"],
    tags: [{ label: "GF", tone: "gf" }],
  },
  {
    name: "Croquetas de jamón",
    price: 14,
    desc: "Iberico ham croquettes, lemon aioli.",
    contains: ["pork", "dairy", "gluten", "eggs"],
    diet: [],
    tags: [],
  },
  {
    name: "Ensalada huerta",
    price: 13,
    desc: "Garden lettuces, radish, lemon vinaigrette.",
    contains: [],
    diet: ["vegan", "vegetarian", "gluten-free"],
    tags: [
      { label: "Vegan", tone: "vegan" },
      { label: "GF", tone: "gf" },
    ],
  },
  {
    name: "Pappardelle al ragú",
    price: 24,
    desc: "Hand-cut pasta, slow lamb shoulder.",
    contains: ["gluten", "dairy", "eggs"],
    diet: [],
    tags: [],
  },
  {
    name: "Risotto de hongos",
    price: 26,
    desc: "Carnaroli rice, wild mushrooms, parmesan.",
    contains: ["dairy"],
    diet: ["vegetarian", "gluten-free"],
    tags: [
      { label: "Veg", tone: "veg" },
      { label: "GF", tone: "gf" },
    ],
  },
  {
    name: "Spaghetti alle vongole",
    price: 28,
    desc: "Clams, white wine, parsley.",
    contains: ["shellfish", "gluten"],
    diet: [],
    tags: [],
  },
  {
    name: "Ribeye 14oz",
    price: 48,
    desc: "Dry-aged 28 days, marrow butter, chimichurri.",
    contains: ["dairy"],
    diet: ["gluten-free"],
    tags: [
      { label: "GF", tone: "gf" },
      { label: "Signature", tone: "signature" },
    ],
  },
  {
    name: "Branzino entero",
    price: 38,
    desc: "Whole sea bass, fennel, preserved lemon.",
    contains: [],
    diet: ["gluten-free"],
    tags: [{ label: "GF", tone: "gf" }],
  },
  {
    name: "Pollo al carbón",
    price: 28,
    desc: "Half free-range chicken, garlic confit.",
    contains: [],
    diet: ["gluten-free"],
    tags: [{ label: "GF", tone: "gf" }],
  },
  {
    name: "Costilla de cordero",
    price: 42,
    desc: "Lamb ribs, honey-mint, charred onion.",
    contains: [],
    diet: ["gluten-free"],
    tags: [{ label: "GF", tone: "gf" }],
  },
  {
    name: "Plato del huerto",
    price: 22,
    desc: "Seasonal vegetables, chilli oil.",
    contains: ["spicy"],
    diet: ["vegan", "vegetarian", "gluten-free"],
    tags: [
      { label: "Vegan", tone: "vegan" },
      { label: "GF", tone: "gf" },
    ],
  },
  {
    name: "Tarta de queso quemada",
    price: 11,
    desc: "Basque burnt cheesecake.",
    contains: ["dairy", "eggs", "gluten"],
    diet: ["vegetarian"],
    tags: [
      { label: "Veg", tone: "veg" },
      { label: "Signature", tone: "signature" },
    ],
  },
  {
    name: "Olive oil cake",
    price: 10,
    desc: "Citrus, crème fraîche.",
    contains: ["dairy", "eggs", "gluten"],
    diet: ["vegetarian"],
    tags: [{ label: "Veg", tone: "veg" }],
  },
  {
    name: "Chocolate ganache",
    price: 12,
    desc: "Dark chocolate, hazelnut praline.",
    contains: ["dairy", "nuts"],
    diet: ["vegetarian", "gluten-free"],
    tags: [
      { label: "Veg", tone: "veg" },
      { label: "GF", tone: "gf" },
    ],
  },
];

const list = document.getElementById("list");
const okEl = document.getElementById("ok");
const hiddenEl = document.getElementById("hidden");

const AVOID_LABEL = {
  dairy: "Contains dairy",
  nuts: "Contains nuts",
  shellfish: "Contains shellfish",
  eggs: "Contains eggs",
  pork: "Contains pork",
  spicy: "Spicy",
  gluten: "Contains gluten",
};
const DIET_LABEL = {
  vegan: "not vegan",
  vegetarian: "not vegetarian",
  "gluten-free": "not gluten-free",
};

function evaluate() {
  const wants = [...document.querySelectorAll('input[name="diet"]:checked')].map((c) => c.value);
  const avoids = [...document.querySelectorAll('input[name="avoid"]:checked')].map((c) => c.value);

  let ok = 0;
  let hidden = 0;
  DISHES.forEach((d, i) => {
    const reasons = [];
    // Diet check: if user wants vegan, the dish must be vegan.
    wants.forEach((w) => {
      if (!d.diet.includes(w)) reasons.push(DIET_LABEL[w]);
    });
    // Avoid check
    avoids.forEach((a) => {
      if (d.contains.includes(a)) reasons.push(AVOID_LABEL[a]);
    });
    // GF avoid = also avoid gluten as an avoid
    if (wants.includes("gluten-free") && d.contains.includes("gluten")) {
      // already accounted for via diet; do nothing
    }
    const el = document.querySelector(`[data-i="${i}"]`);
    if (!el) return;
    const r = el.querySelector(".d-reason");
    if (reasons.length === 0) {
      el.classList.remove("is-hidden");
      if (r) r.textContent = "";
      ok += 1;
    } else {
      el.classList.add("is-hidden");
      if (r) r.textContent = `Why hidden · ${reasons.slice(0, 2).join(" · ")}`;
      hidden += 1;
    }
  });
  okEl.textContent = ok;
  hiddenEl.textContent = hidden;
}

function render() {
  list.innerHTML = DISHES.map(
    (d, i) => `<article class="dish" data-i="${i}">
      <div class="d-top">
        <span class="d-name">${d.name}</span>
        <span class="d-price">$${d.price.toFixed(2)}</span>
      </div>
      <p class="d-desc">${d.desc}</p>
      ${
        d.tags.length
          ? `<div class="d-tags">${d.tags.map((t) => `<span class="d-tag" data-tone="${t.tone}">${t.label}</span>`).join("")}</div>`
          : ""
      }
      <p class="d-reason"></p>
    </article>`
  ).join("");
}

document
  .querySelectorAll('input[type="checkbox"]')
  .forEach((cb) => cb.addEventListener("change", evaluate));
document.getElementById("reset").addEventListener("click", () => {
  document.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
  evaluate();
});

render();
evaluate();
