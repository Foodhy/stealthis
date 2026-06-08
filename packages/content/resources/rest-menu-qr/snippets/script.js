const TAX_RATE = 0.0825;

const SECTIONS = [
  {
    id: "entradas",
    title: "Entradas",
    items: [
      {
        id: "pan",
        name: "Pan masa madre",
        desc: "Sourdough, smoked olive oil, sea salt.",
        price: 8,
        chips: [{ label: "Veg", tone: "veg" }],
      },
      {
        id: "burrata",
        name: "Burrata huerta",
        desc: "Heirloom tomato, garden basil, focaccia crumble.",
        price: 16,
        chips: [{ label: "Veg", tone: "veg" }],
      },
      {
        id: "pulpo",
        name: "Pulpo brasa",
        desc: "Charred octopus, smoked paprika potato.",
        price: 19,
        chips: [{ label: "GF", tone: "gf" }],
      },
      {
        id: "croquetas",
        name: "Croquetas jamón",
        desc: "Six pieces, lemon aioli.",
        price: 14,
        chips: [],
      },
    ],
  },
  {
    id: "principales",
    title: "Principales",
    items: [
      {
        id: "ribeye",
        name: "Ribeye 14oz",
        desc: "Dry-aged 28 days, bone marrow butter.",
        price: 48,
        chips: [{ label: "GF", tone: "gf" }],
      },
      {
        id: "branzino",
        name: "Branzino entero",
        desc: "Whole sea bass, fennel, preserved lemon.",
        price: 38,
        chips: [{ label: "GF", tone: "gf" }],
      },
      {
        id: "risotto",
        name: "Risotto hongos",
        desc: "Carnaroli rice, wild mushrooms, parmesan.",
        price: 26,
        chips: [{ label: "Veg", tone: "veg" }],
      },
      {
        id: "pollo",
        name: "Pollo carbón",
        desc: "Half free-range chicken, garlic confit.",
        price: 28,
        chips: [{ label: "GF", tone: "gf" }],
      },
      {
        id: "pappardelle",
        name: "Pappardelle ragú",
        desc: "Hand-cut pasta, slow lamb shoulder.",
        price: 24,
        chips: [{ label: "Spicy", tone: "hot" }],
      },
    ],
  },
  {
    id: "postres",
    title: "Postres",
    items: [
      {
        id: "tarta",
        name: "Tarta de queso quemada",
        desc: "Basque burnt cheesecake, salted caramel.",
        price: 11,
        chips: [{ label: "Veg", tone: "veg" }],
      },
      {
        id: "olive",
        name: "Olive oil cake",
        desc: "Crème fraîche, candied orange.",
        price: 10,
        chips: [{ label: "Veg", tone: "veg" }],
      },
      {
        id: "ganache",
        name: "Chocolate ganache",
        desc: "Hazelnut praline, espresso ice.",
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
    items: [
      {
        id: "vermut",
        name: "Vermut casa",
        desc: "House vermouth on tap.",
        price: 9,
        chips: [],
      },
      {
        id: "negroni",
        name: "Negroni sbagliato",
        desc: "Campari, sweet vermouth, sparkling wine.",
        price: 14,
        chips: [],
      },
      {
        id: "spritz",
        name: "Spritz",
        desc: "Aperol, prosecco, soda.",
        price: 13,
        chips: [],
      },
      {
        id: "tinto",
        name: "Tinto natural",
        desc: "Rotating natural red, ask your server.",
        price: 12,
        chips: [],
      },
    ],
  },
];

const listEl = document.getElementById("list");
const tabs = document.querySelectorAll(".qr-tab");
const cartPill = document.getElementById("cartPill");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const sheet = document.getElementById("sheet");
const sheetOverlay = document.getElementById("sheetOverlay");
const sheetLines = document.getElementById("sheetLines");
const sheetClose = document.getElementById("sheetClose");
const sheetCta = document.getElementById("sheetCta");
const sSubtotal = document.getElementById("sSubtotal");
const sTax = document.getElementById("sTax");
const sTotal = document.getElementById("sTotal");

let cart = []; // { id, name, price, qty }

function money(v) {
  return `$${v.toFixed(2)}`;
}

function renderList() {
  listEl.innerHTML = SECTIONS.map(
    (section) => `
    <section class="qr-section" id="${section.id}" data-section>
      <h2 class="qr-section-title">${section.title}</h2>
      ${section.items
        .map(
          (item) => `
        <article class="dish">
          <div>
            <div class="dish-row">
              <span class="dish-name">${item.name}</span>
              <span class="dish-price">$${item.price.toFixed(2)}</span>
            </div>
            <p class="dish-desc">${item.desc}</p>
            ${
              item.chips.length
                ? `<div class="dish-chips">${item.chips
                    .map((c) => `<span class="chip" data-tone="${c.tone}">${c.label}</span>`)
                    .join("")}</div>`
                : ""
            }
          </div>
          <button class="add-btn" data-id="${item.id}" data-name="${item.name}"
            data-price="${item.price}" aria-label="Add ${item.name}">+</button>
        </article>`
        )
        .join("")}
    </section>`
  ).join("");
}

function renderCart() {
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  cartCount.textContent = count;
  cartTotal.textContent = money(subtotal + tax);
  cartPill.hidden = count === 0;

  sSubtotal.textContent = money(subtotal);
  sTax.textContent = money(tax);
  sTotal.textContent = money(subtotal + tax);

  sheetLines.innerHTML = cart
    .map(
      (l) => `
      <li class="sheet-line" data-id="${l.id}">
        <div>
          <p class="sheet-line-name">${l.name}</p>
          <p class="sheet-line-meta">${money(l.price)} each</p>
        </div>
        <div class="sheet-line-qty">
          <button data-action="dec" aria-label="Decrease">−</button>
          <span>${l.qty}</span>
          <button data-action="inc" aria-label="Increase">+</button>
        </div>
        <span class="sheet-line-price">${money(l.price * l.qty)}</span>
      </li>`
    )
    .join("");
}

listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-id]");
  if (!btn || !btn.classList.contains("add-btn")) return;
  const id = btn.dataset.id;
  const existing = cart.find((l) => l.id === id);
  if (existing) existing.qty += 1;
  else
    cart.push({
      id,
      name: btn.dataset.name,
      price: Number(btn.dataset.price),
      qty: 1,
    });
  btn.classList.remove("is-flash");
  void btn.offsetWidth;
  btn.classList.add("is-flash");
  renderCart();
});

sheetLines.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const li = btn.closest("[data-id]");
  if (!li) return;
  const line = cart.find((l) => l.id === li.dataset.id);
  if (!line) return;
  if (btn.dataset.action === "inc") line.qty += 1;
  if (btn.dataset.action === "dec") {
    line.qty -= 1;
    if (line.qty <= 0) cart = cart.filter((l) => l.id !== line.id);
  }
  renderCart();
  if (cart.length === 0) closeSheet();
});

function openSheet() {
  if (cart.length === 0) return;
  sheet.hidden = false;
  sheetOverlay.hidden = false;
}
function closeSheet() {
  sheet.hidden = true;
  sheetOverlay.hidden = true;
}
cartPill.addEventListener("click", openSheet);
sheetClose.addEventListener("click", closeSheet);
sheetOverlay.addEventListener("click", closeSheet);
sheetCta.addEventListener("click", () => {
  sheetCta.textContent = "Sent ✓";
  setTimeout(() => {
    cart = [];
    sheetCta.textContent = "Send to kitchen";
    renderCart();
    closeSheet();
  }, 900);
});

tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    const target = document.getElementById(tab.dataset.target);
    if (!target) return;
    tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
    listEl.scrollTo({
      top: target.offsetTop - 8,
      behavior: "smooth",
    });
  })
);

// Scroll spy: active tab follows current section
function spy() {
  const sections = listEl.querySelectorAll("[data-section]");
  const top = listEl.scrollTop;
  let active = sections[0];
  sections.forEach((s) => {
    if (s.offsetTop - 16 <= top + 80) active = s;
  });
  if (active) tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.target === active.id));
}
listEl.addEventListener("scroll", spy);

renderList();
renderCart();
