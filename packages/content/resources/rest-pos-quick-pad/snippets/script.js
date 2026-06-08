const TAX_RATE = 0.0825;

const MENU = {
  entradas: {
    title: "Entradas",
    icon: "🥖",
    items: [
      { id: "pan", name: "Pan masa madre", price: 8 },
      { id: "burrata", name: "Burrata", price: 16 },
      { id: "pulpo", name: "Pulpo brasa", price: 19 },
      { id: "croquetas", name: "Croquetas jamón", price: 14 },
      { id: "ensalada", name: "Ensalada huerta", price: 13 },
      { id: "anchoas", name: "Anchoas Cantábrico", price: 17 },
    ],
  },
  principales: {
    title: "Principales",
    icon: "🥩",
    items: [
      { id: "ribeye", name: "Ribeye 14oz", price: 48 },
      { id: "branzino", name: "Branzino entero", price: 38 },
      { id: "risotto", name: "Risotto hongos", price: 26 },
      { id: "pollo", name: "Pollo carbón", price: 28 },
      { id: "pappardelle", name: "Pappardelle ragú", price: 24 },
      { id: "salmon", name: "Salmón a la plancha", price: 32 },
      { id: "cordero", name: "Costilla cordero", price: 42 },
      { id: "vegetariano", name: "Plato del huerto", price: 22 },
    ],
  },
  postres: {
    title: "Postres",
    icon: "🍰",
    items: [
      { id: "tarta", name: "Tarta de queso", price: 11 },
      { id: "olive", name: "Olive oil cake", price: 10 },
      { id: "ganache", name: "Chocolate ganache", price: 12 },
      { id: "sorbete", name: "Sorbete cítrico", price: 9 },
    ],
  },
  bebidas: {
    title: "Bebidas",
    icon: "🍷",
    items: [
      { id: "vermut", name: "Vermut casa", price: 9 },
      { id: "negroni", name: "Negroni sbagliato", price: 14 },
      { id: "spritz", name: "Spritz", price: 13 },
      { id: "tinto", name: "Tinto natural", price: 12 },
      { id: "blanco", name: "Blanco copa", price: 11 },
      { id: "agua", name: "Agua mineral", price: 5 },
      { id: "cafe", name: "Café espresso", price: 4 },
    ],
  },
};

const catsEl = document.getElementById("cats");
const gridEl = document.getElementById("grid");
const catTitle = document.getElementById("catTitle");
const linesEl = document.getElementById("lines");
const emptyEl = document.getElementById("empty");
const ticketMeta = document.getElementById("ticketMeta");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");
const payTotalEl = document.getElementById("payTotal");
const payBtn = document.getElementById("pay");
const clearBtn = document.getElementById("clear");
const holdBtn = document.getElementById("hold");

let activeCat = "entradas";
let ticket = []; // { id, name, price, qty }

function money(v) {
  return `$${v.toFixed(2)}`;
}

function renderCats() {
  catsEl.innerHTML = Object.entries(MENU)
    .map(
      ([key, c]) => `
      <button class="cat-btn ${key === activeCat ? "is-active" : ""}" data-cat="${key}">
        <span class="cat-icon">${c.icon}</span>
        <span>${c.title}</span>
      </button>`
    )
    .join("");
}

function renderGrid() {
  const cat = MENU[activeCat];
  catTitle.textContent = cat.title;
  gridEl.innerHTML = cat.items
    .map(
      (item) => `
      <button class="tile" data-item="${item.id}" data-name="${item.name}" data-price="${item.price}">
        <span class="tile-name">${item.name}</span>
        <span class="tile-price">$${item.price.toFixed(2)}</span>
      </button>`
    )
    .join("");
}

function renderTicket() {
  const itemCount = ticket.reduce((n, l) => n + l.qty, 0);
  ticketMeta.textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  if (ticket.length === 0) {
    linesEl.innerHTML = "";
    emptyEl.style.display = "";
  } else {
    emptyEl.style.display = "none";
    linesEl.innerHTML = ticket
      .map(
        (l) => `
        <li class="line" data-id="${l.id}">
          <div class="line-qty">
            <button data-action="dec" aria-label="Decrease">−</button>
            <span>${l.qty}</span>
            <button data-action="inc" aria-label="Increase">+</button>
          </div>
          <span class="line-name">${l.name}</span>
          <span class="line-price">${money(l.price * l.qty)}</span>
        </li>`
      )
      .join("");
  }

  const subtotal = ticket.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  subtotalEl.textContent = money(subtotal);
  taxEl.textContent = money(tax);
  totalEl.textContent = money(total);
  payTotalEl.textContent = money(total);
  payBtn.disabled = ticket.length === 0;
}

function addItem(id, name, price, tile) {
  const existing = ticket.find((l) => l.id === id);
  if (existing) existing.qty += 1;
  else ticket.push({ id, name, price, qty: 1 });
  renderTicket();
  if (tile) {
    tile.classList.remove("is-flash");
    void tile.offsetWidth; // restart animation
    tile.classList.add("is-flash");
  }
}

catsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  activeCat = btn.dataset.cat;
  renderCats();
  renderGrid();
});

gridEl.addEventListener("click", (e) => {
  const tile = e.target.closest("[data-item]");
  if (!tile) return;
  addItem(tile.dataset.item, tile.dataset.name, Number(tile.dataset.price), tile);
});

linesEl.addEventListener("click", (e) => {
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

clearBtn.addEventListener("click", () => {
  if (ticket.length === 0) return;
  ticket = [];
  renderTicket();
});

holdBtn.addEventListener("click", () => {
  holdBtn.textContent = "Held ✓";
  setTimeout(() => (holdBtn.textContent = "Hold"), 1400);
});

payBtn.addEventListener("click", () => {
  const txt = payBtn.querySelector("span").textContent;
  payBtn.querySelector("span").textContent = "Sent ✓";
  setTimeout(() => {
    payBtn.querySelector("span").textContent = txt;
    ticket = [];
    renderTicket();
  }, 900);
});

renderCats();
renderGrid();
renderTicket();
