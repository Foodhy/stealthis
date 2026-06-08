const TAX_RATE = 0.0825;

const CATS = [
  { id: "bowls", name: "Grain bowls", glyph: "🥗", desc: "Build your own · 6 bases" },
  { id: "tacos", name: "Tacos", glyph: "🌮", desc: "3 per order · 8 fillings" },
  { id: "sandwiches", name: "Sandwiches", glyph: "🥖", desc: "Sourdough, ciabatta, focaccia" },
  { id: "sides", name: "Sides", glyph: "🥔", desc: "Fries, salads, soups" },
  { id: "drinks", name: "Drinks", glyph: "🍹", desc: "Aguas frescas, juice, soda" },
  { id: "sweets", name: "Sweets", glyph: "🍰", desc: "Cake, ice, cookies" },
];

const ITEMS = {
  bowls: [
    {
      id: "bowl-1",
      name: "Pollo asado bowl",
      desc: "Rice, beans, salsa verde, avocado.",
      price: 14,
      glyph: "🥗",
    },
    {
      id: "bowl-2",
      name: "Carnitas bowl",
      desc: "Slow-cooked pork, pickled onion, lime.",
      price: 15,
      glyph: "🥑",
    },
    {
      id: "bowl-3",
      name: "Roasted veg bowl",
      desc: "Seasonal vegetables, romesco, almonds.",
      price: 13,
      glyph: "🥕",
    },
    {
      id: "bowl-4",
      name: "Chickpea bowl",
      desc: "Spiced chickpea, herb yoghurt, sumac.",
      price: 12,
      glyph: "🫘",
    },
  ],
  tacos: [
    {
      id: "taco-1",
      name: "Al pastor · 3 pcs",
      desc: "Achiote pork, pineapple, cilantro.",
      price: 12,
      glyph: "🌮",
    },
    {
      id: "taco-2",
      name: "Baja fish · 3 pcs",
      desc: "Crispy cod, chipotle slaw, lime.",
      price: 14,
      glyph: "🐟",
    },
    {
      id: "taco-3",
      name: "Carnitas · 3 pcs",
      desc: "Slow pork, salsa verde, queso fresco.",
      price: 13,
      glyph: "🐖",
    },
    {
      id: "taco-4",
      name: "Hongos · 3 pcs",
      desc: "Wild mushroom, garlic, jalapeño.",
      price: 12,
      glyph: "🍄",
    },
  ],
  sandwiches: [
    {
      id: "s-1",
      name: "Roasted veg ciabatta",
      desc: "Aubergine, pepper, pesto.",
      price: 11,
      glyph: "🥪",
    },
    {
      id: "s-2",
      name: "Pulled pork bun",
      desc: "Slow shoulder, pickled onion.",
      price: 13,
      glyph: "🍔",
    },
    {
      id: "s-3",
      name: "Chicken focaccia",
      desc: "Aioli, rocket, sun tomato.",
      price: 12,
      glyph: "🥖",
    },
  ],
  sides: [
    { id: "side-1", name: "Truffle fries", desc: "Parmesan, parsley.", price: 8, glyph: "🍟" },
    { id: "side-2", name: "Charred broccoli", desc: "Lemon, chilli oil.", price: 7, glyph: "🥦" },
    { id: "side-3", name: "Tomato soup", desc: "Basil, crème fraîche.", price: 7, glyph: "🍅" },
    {
      id: "side-4",
      name: "House salad",
      desc: "Leaves, herbs, vinaigrette.",
      price: 8,
      glyph: "🥬",
    },
  ],
  drinks: [
    { id: "d-1", name: "Hibiscus agua fresca", desc: "Sweetened lightly.", price: 5, glyph: "🌺" },
    { id: "d-2", name: "Tamarind agua fresca", desc: "Salt-rim available.", price: 5, glyph: "🥤" },
    { id: "d-3", name: "Sparkling water", desc: "Local, on tap.", price: 3, glyph: "💧" },
    {
      id: "d-4",
      name: "Cold brew coffee",
      desc: "From Tuesday-fresh beans.",
      price: 4,
      glyph: "☕",
    },
  ],
  sweets: [
    { id: "sw-1", name: "Tres leches cake", desc: "Cinnamon dust.", price: 7, glyph: "🍰" },
    {
      id: "sw-2",
      name: "Sorbete cítrico",
      desc: "Citrus, mint, today's batch.",
      price: 6,
      glyph: "🍧",
    },
    { id: "sw-3", name: "Olive oil cookie", desc: "Sea salt, two pieces.", price: 4, glyph: "🍪" },
  ],
};

const STEP_LABELS = {
  welcome: "Welcome",
  categories: "Step 1 of 3 · Categories",
  items: "Step 2 of 3 · Choose dishes",
  cart: "Step 3 of 3 · Review",
  pay: "Pay",
  reveal: "Order placed",
};

let currentScreen = "welcome";
let currentCat = null;
let cart = []; // { id, name, price, qty, glyph }

const stepLabel = document.getElementById("stepLabel");
const catGrid = document.getElementById("catGrid");
const itemGrid = document.getElementById("itemGrid");
const catTitle = document.getElementById("catTitle");
const catSub = document.getElementById("catSub");
const cartLines = document.getElementById("cartLines");
const cartEmpty = document.getElementById("cartEmpty");
const cartCountSub = document.getElementById("cartCountSub");
const cartCount = document.getElementById("cartCount");
const cartBtn = document.getElementById("cartBtn");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");
const payTotalEl = document.getElementById("payTotal");
const goPayBtn = document.getElementById("goPay");
const goCart = document.getElementById("goCart");
const goCart2 = document.getElementById("goCart2");
const clearBtn = document.getElementById("clear");

function money(v) {
  return `$${v.toFixed(2)}`;
}

function go(screen) {
  if (screen === currentScreen) return;
  currentScreen = screen;
  document.querySelectorAll("[data-screen]").forEach((el) => {
    el.hidden = el.dataset.screen !== screen;
  });
  stepLabel.textContent = STEP_LABELS[screen] || screen;
  // Cart icon only visible after at least one item is added.
  cartBtn.hidden = cart.length === 0 || screen === "welcome" || screen === "reveal";
  if (screen === "categories") renderCats();
  if (screen === "items") renderItems();
  if (screen === "cart") renderCart();
}

function totals() {
  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
}

function renderCats() {
  catGrid.innerHTML = CATS.map((c) => {
    const picks = cart
      .filter((line) => ITEMS[c.id]?.some((i) => i.id === line.id))
      .reduce((n, l) => n + l.qty, 0);
    return `<button class="cat-tile ${picks > 0 ? "is-picked" : ""}" data-cat="${c.id}">
      <div class="cat-tile-row">
        <span class="cat-glyph">${c.glyph}</span>
        ${picks > 0 ? `<span class="cat-pick-count">${picks}</span>` : ""}
      </div>
      <div>
        <p class="cat-name">${c.name}</p>
        <p class="cat-desc">${c.desc}</p>
      </div>
    </button>`;
  }).join("");
  const count = cart.reduce((n, l) => n + l.qty, 0);
  goCart.disabled = count === 0;
  goCart.textContent = count === 0 ? "Pick a dish to continue" : `Review order →  ${count}`;
}

function renderItems() {
  const cat = CATS.find((c) => c.id === currentCat);
  if (!cat) return;
  catTitle.textContent = cat.name;
  catSub.textContent = cat.desc;
  itemGrid.innerHTML = ITEMS[currentCat]
    .map((i) => {
      const line = cart.find((l) => l.id === i.id);
      const qty = line ? line.qty : 0;
      return `<article class="item-row">
        <div class="item-art">${i.glyph}</div>
        <div class="item-body">
          <p class="item-name">${i.name}</p>
          <p class="item-desc">${i.desc}</p>
          <p class="item-price">${money(i.price)}</p>
        </div>
        <div class="item-qty" data-id="${i.id}" data-name="${i.name}" data-price="${i.price}" data-glyph="${i.glyph}">
          <button data-action="dec" aria-label="One fewer" ${qty === 0 ? "disabled" : ""}>−</button>
          <span>${qty}</span>
          <button class="add" data-action="inc" aria-label="One more">+</button>
        </div>
      </article>`;
    })
    .join("");
}

function renderCart() {
  const count = cart.reduce((n, l) => n + l.qty, 0);
  cartCountSub.textContent = count === 0 ? "0 items" : `${count} ${count === 1 ? "item" : "items"}`;
  cartCount.textContent = count;
  cartEmpty.hidden = cart.length > 0;
  cartLines.innerHTML = cart
    .map(
      (l) => `<li class="cart-row" data-id="${l.id}">
      <div class="item-art">${l.glyph}</div>
      <div>
        <p class="cart-name">${l.name}</p>
      </div>
      <div class="cart-qty">
        <button data-action="dec">−</button>
        <span>${l.qty}</span>
        <button data-action="inc">+</button>
      </div>
      <span class="cart-row-price">${money(l.price * l.qty)}</span>
    </li>`
    )
    .join("");
  const t = totals();
  subtotalEl.textContent = money(t.subtotal);
  taxEl.textContent = money(t.tax);
  totalEl.textContent = money(t.total);
  payTotalEl.textContent = money(t.total);
  goPayBtn.disabled = cart.length === 0;
}

function changeQty(id, delta, src) {
  const existing = cart.find((l) => l.id === id);
  if (delta > 0) {
    if (existing) existing.qty += 1;
    else if (src)
      cart.push({
        id,
        name: src.name,
        price: Number(src.price),
        glyph: src.glyph,
        qty: 1,
      });
  } else if (existing) {
    existing.qty -= 1;
    if (existing.qty <= 0) cart = cart.filter((l) => l.id !== id);
  }
  // Reflect cart count in topbar
  const count = cart.reduce((n, l) => n + l.qty, 0);
  cartCount.textContent = count;
  cartBtn.hidden = count === 0 || currentScreen === "welcome" || currentScreen === "reveal";
  if (currentScreen === "items") renderItems();
  if (currentScreen === "cart") renderCart();
  if (currentScreen === "categories") renderCats();
}

// Click delegation for screen navigation
document.body.addEventListener("click", (e) => {
  const goBtn = e.target.closest("[data-go]");
  if (goBtn) {
    if (goBtn.dataset.go === "welcome") {
      cart = [];
      cartCount.textContent = 0;
    }
    go(goBtn.dataset.go);
    return;
  }
  // Cart button in topbar
  if (e.target.closest("#cartBtn")) {
    go("cart");
    return;
  }
});

catGrid.addEventListener("click", (e) => {
  const tile = e.target.closest("[data-cat]");
  if (!tile) return;
  currentCat = tile.dataset.cat;
  go("items");
});

itemGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const wrap = btn.closest("[data-id]");
  const id = wrap.dataset.id;
  changeQty(id, btn.dataset.action === "inc" ? 1 : -1, {
    name: wrap.dataset.name,
    price: wrap.dataset.price,
    glyph: wrap.dataset.glyph,
  });
});

cartLines.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const row = btn.closest("[data-id]");
  if (!row) return;
  changeQty(row.dataset.id, btn.dataset.action === "inc" ? 1 : -1);
});

clearBtn.addEventListener("click", () => {
  if (cart.length === 0) return;
  cart = [];
  renderCart();
  cartCount.textContent = 0;
  cartBtn.hidden = true;
});

[goCart, goCart2].forEach((btn) =>
  btn.addEventListener("click", () => {
    if (cart.length === 0) return;
    go("cart");
  })
);
goPayBtn.addEventListener("click", () => {
  if (cart.length === 0) return;
  go("pay");
});

// Pay choices
document.querySelectorAll("[data-pay]").forEach((card) =>
  card.addEventListener("click", () => {
    const t = totals();
    const orderNo = `#${String(Math.floor(100 + Math.random() * 900))}`;
    document.getElementById("orderNo").textContent = orderNo;
    document.getElementById("revealItems").textContent = cart.reduce((n, l) => n + l.qty, 0);
    document.getElementById("revealTotal").textContent = money(t.total);
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + 9);
    document.getElementById("revealEta").textContent =
      `${String(eta.getHours()).padStart(2, "0")}:${String(eta.getMinutes()).padStart(2, "0")}`;
    const method = card.dataset.pay;
    document.getElementById("revealSub").textContent =
      method === "counter"
        ? "Take your number to the counter to pay · we'll plate while you do."
        : method === "apple"
          ? "Payment approved · pickup at the counter when called."
          : "Payment approved · enjoy.";
    go("reveal");
  })
);

// Language switcher (visual only)
document.querySelectorAll(".lang").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".lang").forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
  })
);

renderCats();
