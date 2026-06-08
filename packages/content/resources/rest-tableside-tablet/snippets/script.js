const TAX_RATE = 0.0825;

const CATS = {
  apps: {
    title: "Para empezar",
    icon: "🥖",
    items: [
      { id: "pan", name: "Pan masa madre", desc: "Sourdough, smoked oil", price: 8, glyph: "🥖" },
      {
        id: "burrata",
        name: "Burrata huerta",
        desc: "Heirloom tomato, basil",
        price: 16,
        glyph: "🍅",
      },
      { id: "pulpo", name: "Pulpo brasa", desc: "Smoked paprika potato", price: 19, glyph: "🐙" },
      { id: "croq", name: "Croquetas jamón", desc: "Six pieces", price: 14, glyph: "🥟" },
    ],
  },
  mains: {
    title: "Principales",
    icon: "🥩",
    items: [
      {
        id: "ribeye",
        name: "Ribeye 14oz",
        desc: "Marrow butter, chimichurri",
        price: 48,
        glyph: "🥩",
      },
      { id: "branzino", name: "Branzino", desc: "Fennel, preserved lemon", price: 38, glyph: "🐟" },
      {
        id: "risotto",
        name: "Risotto hongos",
        desc: "Wild mushroom, parmesan",
        price: 26,
        glyph: "🍚",
      },
      { id: "pollo", name: "Pollo carbón", desc: "Charred lemon, garlic", price: 28, glyph: "🍗" },
      {
        id: "pappardelle",
        name: "Pappardelle ragú",
        desc: "Lamb shoulder, gremolata",
        price: 24,
        glyph: "🍝",
      },
      {
        id: "huerto",
        name: "Plato del huerto",
        desc: "Seasonal vegetables",
        price: 22,
        glyph: "🥗",
      },
    ],
  },
  drinks: {
    title: "Bebidas",
    icon: "🍷",
    items: [
      { id: "vermut", name: "Vermut casa", desc: "On tap", price: 9, glyph: "🥃" },
      {
        id: "negroni",
        name: "Negroni sbagliato",
        desc: "Campari, prosecco",
        price: 14,
        glyph: "🍸",
      },
      {
        id: "tinto",
        name: "Tinto natural",
        desc: "Glass, ask your server",
        price: 12,
        glyph: "🍷",
      },
      { id: "agua", name: "Agua mineral", desc: "Still or sparkling", price: 5, glyph: "💧" },
      { id: "cafe", name: "Espresso", desc: "Single shot", price: 4, glyph: "☕" },
    ],
  },
  dessert: {
    title: "Postres",
    icon: "🍰",
    items: [
      {
        id: "tarta",
        name: "Tarta de queso",
        desc: "Basque burnt, salted caramel",
        price: 11,
        glyph: "🍰",
      },
      {
        id: "olive",
        name: "Olive oil cake",
        desc: "Crème fraîche, citrus",
        price: 10,
        glyph: "🍋",
      },
      {
        id: "ganache",
        name: "Chocolate ganache",
        desc: "Hazelnut praline",
        price: 12,
        glyph: "🍫",
      },
      { id: "sorbete", name: "Sorbete cítrico", desc: "Citrus, mint", price: 9, glyph: "🍧" },
    ],
  },
  extras: {
    title: "Extras",
    icon: "🌿",
    items: [
      { id: "fries", name: "Patatas truffle", desc: "Parmesan, parsley", price: 8, glyph: "🍟" },
      {
        id: "verduras",
        name: "Verduras a la brasa",
        desc: "Charred, lemon oil",
        price: 9,
        glyph: "🥦",
      },
      { id: "pan-extra", name: "Pan extra", desc: "Plus butter", price: 4, glyph: "🥯" },
    ],
  },
};

const CAT_ORDER = ["apps", "mains", "drinks", "dessert", "extras"];

let activeCat = "mains";
let ticket = []; // { id, name, price, qty, glyph }

const catBar = document.getElementById("catBar");
const menuGrid = document.getElementById("menuGrid");
const catTitle = document.getElementById("catTitle");
const ticketLines = document.getElementById("ticketLines");
const ticketEmpty = document.getElementById("ticketEmpty");
const ticketMeta = document.getElementById("ticketMeta");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");
const sendBtn = document.getElementById("sendBtn");
const callBtn = document.getElementById("callBtn");
const billBtn = document.getElementById("billBtn");
const toast = document.getElementById("toast");
const billOverlay = document.getElementById("billOverlay");
const billCancel = document.getElementById("billCancel");
const billConfirm = document.getElementById("billConfirm");
const billTotal = document.getElementById("billTotal");
const splitEven = document.getElementById("splitEven");
const splitOne = document.getElementById("splitOne");

function money(v) {
  return `$${v.toFixed(2)}`;
}

function renderCatBar() {
  catBar.innerHTML = CAT_ORDER.map(
    (id) => `<button class="cat-chip ${id === activeCat ? "is-active" : ""}" data-cat="${id}">
      <span class="cat-chip-icon">${CATS[id].icon}</span><span>${CATS[id].title}</span>
    </button>`
  ).join("");
}

function renderMenu() {
  const cat = CATS[activeCat];
  catTitle.textContent = cat.title;
  menuGrid.innerHTML = cat.items
    .map(
      (
        i
      ) => `<button class="tile" data-id="${i.id}" data-name="${i.name}" data-price="${i.price}" data-glyph="${i.glyph}">
        <span class="tile-glyph">${i.glyph}</span>
        <span class="tile-name">${i.name}</span>
        <span class="tile-desc">${i.desc}</span>
        <span class="tile-price">${money(i.price)}</span>
      </button>`
    )
    .join("");
}

function renderTicket() {
  const count = ticket.reduce((n, l) => n + l.qty, 0);
  ticketMeta.textContent = count === 0 ? "0 items" : `${count} ${count === 1 ? "item" : "items"}`;
  ticketEmpty.hidden = ticket.length > 0;
  ticketLines.innerHTML = ticket
    .map(
      (l) => `<li data-id="${l.id}">
        <div class="l-name">${l.name}</div>
        <div class="l-qty">
          <button data-action="dec">−</button>
          <span>${l.qty}</span>
          <button data-action="inc">+</button>
        </div>
        <span class="l-price">${money(l.price * l.qty)}</span>
      </li>`
    )
    .join("");
  const subtotal = ticket.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  subtotalEl.textContent = money(subtotal);
  taxEl.textContent = money(tax);
  totalEl.textContent = money(total);
  sendBtn.disabled = ticket.length === 0;
  billTotal.textContent = money(total * 1.18);
  splitEven.textContent = `${money((total * 1.18) / 2)} each`;
  splitOne.textContent = money(total * 1.18);
}

function addItem(id, name, price, glyph, tile) {
  const existing = ticket.find((l) => l.id === id);
  if (existing) existing.qty += 1;
  else ticket.push({ id, name, price: Number(price), glyph, qty: 1 });
  renderTicket();
  if (tile) {
    tile.classList.remove("is-flash");
    void tile.offsetWidth;
    tile.classList.add("is-flash");
  }
}

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

catBar.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  activeCat = btn.dataset.cat;
  renderCatBar();
  renderMenu();
});

menuGrid.addEventListener("click", (e) => {
  const tile = e.target.closest("[data-id]");
  if (!tile) return;
  addItem(tile.dataset.id, tile.dataset.name, tile.dataset.price, tile.dataset.glyph, tile);
});

ticketLines.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const li = btn.closest("[data-id]");
  if (!li) return;
  const line = ticket.find((l) => l.id === li.dataset.id);
  if (!line) return;
  if (btn.dataset.action === "inc") line.qty += 1;
  if (btn.dataset.action === "dec") {
    line.qty -= 1;
    if (line.qty <= 0) ticket = ticket.filter((l) => l.id !== line.id);
  }
  renderTicket();
});

sendBtn.addEventListener("click", () => {
  if (ticket.length === 0) return;
  const items = ticket.reduce((n, l) => n + l.qty, 0);
  showToast(`Sent ${items} item${items > 1 ? "s" : ""} to the kitchen.`);
  // Visually mark mains complete after second send for the demo
  document.querySelector(".progress .is-current")?.classList.remove("is-current");
});

callBtn.addEventListener("click", () => {
  callBtn.classList.add("is-called");
  showToast("We let your server know — they're on their way.");
  setTimeout(() => callBtn.classList.remove("is-called"), 4000);
});

billBtn.addEventListener("click", () => {
  billOverlay.hidden = false;
});
billCancel.addEventListener("click", () => {
  billOverlay.hidden = true;
});
billOverlay.addEventListener("click", (e) => {
  if (e.target === billOverlay) billOverlay.hidden = true;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") billOverlay.hidden = true;
});
document.querySelectorAll(".bill-opt").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".bill-opt").forEach((x) => x.classList.remove("is-picked"));
    b.classList.add("is-picked");
  })
);
document.querySelectorAll(".tip-btn").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".tip-btn").forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    const tip = Number(b.dataset.tip) / 100;
    const subtotal = ticket.reduce((s, l) => s + l.price * l.qty, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + subtotal * tip;
    billTotal.textContent = money(total);
    splitEven.textContent = `${money(total / 2)} each`;
    splitOne.textContent = money(total);
  })
);
billConfirm.addEventListener("click", () => {
  billOverlay.hidden = true;
  showToast("Your server is bringing the bill.");
});

// Seed an in-progress order so the ticket has something
ticket = [
  { id: "burrata", name: "Burrata huerta", price: 16, qty: 1, glyph: "🍅" },
  { id: "pulpo", name: "Pulpo brasa", price: 19, qty: 1, glyph: "🐙" },
  { id: "ribeye", name: "Ribeye 14oz", price: 48, qty: 1, glyph: "🥩" },
  { id: "tinto", name: "Tinto natural", price: 12, qty: 2, glyph: "🍷" },
];

renderCatBar();
renderMenu();
renderTicket();
