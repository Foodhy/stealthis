"use strict";

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const stars = (r) => "★★★★★".slice(0, Math.round(r)) + "☆☆☆☆☆".slice(0, 5 - Math.round(r));

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-on"), 2200);
}

/* ---------- data ---------- */
const TINTS = ["#eef1ff", "#fff1f5", "#eafaf0", "#fff7e6", "#f3eeff", "#e8f7ff"];

const CATEGORIES = [
  { name: "Electronics", icon: "🎧", count: "82k items", tint: "#eef1ff" },
  { name: "Home & Living", icon: "🛋️", count: "61k items", tint: "#eafaf0" },
  { name: "Fashion", icon: "👟", count: "94k items", tint: "#fff1f5" },
  { name: "Handmade", icon: "🕯️", count: "38k items", tint: "#fff7e6" },
  { name: "Beauty", icon: "💄", count: "27k items", tint: "#f3eeff" },
  { name: "Toys & Games", icon: "🎲", count: "19k items", tint: "#e8f7ff" },
  { name: "Garden", icon: "🪴", count: "22k items", tint: "#eafaf0" },
  { name: "Sports", icon: "🏀", count: "31k items", tint: "#eef1ff" },
  { name: "Kitchen", icon: "🍳", count: "44k items", tint: "#fff7e6" },
  { name: "Pets", icon: "🐾", count: "12k items", tint: "#fff1f5" },
  { name: "Books", icon: "📚", count: "70k items", tint: "#f3eeff" },
  { name: "Stationery", icon: "✏️", count: "9k items", tint: "#e8f7ff" },
];

const DEALS = [
  { id: "d1", icon: "🎧", vendor: "Aurora Audio", title: "Aurora Buds Pro — noise cancelling earbuds", price: 59, was: 129, rate: 4.8, reviews: 2140, badge: "-54%" },
  { id: "d2", icon: "⌚", vendor: "Tempo", title: "Tempo Fit smartwatch with GPS", price: 79, was: 159, rate: 4.6, reviews: 980, badge: "-50%" },
  { id: "d3", icon: "💡", vendor: "Halo Home", title: "Halo LED desk lamp, dimmable", price: 28, was: 49, rate: 4.7, reviews: 612, badge: "-43%" },
  { id: "d4", icon: "🔊", vendor: "BassBox", title: "BassBox mini bluetooth speaker", price: 34, was: 69, rate: 4.5, reviews: 1455, badge: "-51%" },
  { id: "d5", icon: "🧴", vendor: "GlowLab", title: "GlowLab vitamin C serum bundle", price: 22, was: 40, rate: 4.9, reviews: 3320, badge: "-45%" },
  { id: "d6", icon: "🪑", vendor: "NestWork", title: "NestWork ergonomic seat cushion", price: 31, was: 55, rate: 4.4, reviews: 410, badge: "-44%" },
];

const TOP = [
  { id: "t1", icon: "👟", vendor: "StridelLab", title: "Cloudstep running sneakers", price: 89, rate: 4.7, reviews: 5210, ship: "Free shipping" },
  { id: "t2", icon: "☕", vendor: "Potterly", title: "Hand-thrown ceramic mug, set of 2", price: 32, rate: 4.9, reviews: 1880, ship: "Free shipping" },
  { id: "t3", icon: "🎒", vendor: "Roamwell", title: "Everyday 22L commuter backpack", price: 64, rate: 4.6, reviews: 940, ship: "Free shipping" },
  { id: "t4", icon: "🕯️", vendor: "Emberly", title: "Soy candle trio — citrus & cedar", price: 27, rate: 4.8, reviews: 2010, ship: "Ships in 2 days" },
  { id: "t5", icon: "⌨️", vendor: "KeyForge", title: "Mechanical 65% keyboard, hot-swap", price: 119, rate: 4.7, reviews: 760, ship: "Free shipping" },
  { id: "t6", icon: "🪴", vendor: "Sprout & Co", title: "Self-watering planter, medium", price: 24, rate: 4.5, reviews: 530, ship: "Ships in 3 days" },
  { id: "t7", icon: "🧦", vendor: "Cozyfeet", title: "Merino wool crew socks, 3-pack", price: 19, rate: 4.8, reviews: 3120, ship: "Free shipping" },
];

const VENDORS = [
  { name: "Potterly", icon: "🏺", cover: "linear-gradient(120deg,#f59e0b,#e0245e)", avatar: "#fff7e6", rate: 4.9, sales: "12.4k sales" },
  { name: "Aurora Audio", icon: "🎧", cover: "linear-gradient(120deg,#3457ff,#7d5cff)", avatar: "#eef1ff", rate: 4.8, sales: "48k sales" },
  { name: "Emberly", icon: "🕯️", cover: "linear-gradient(120deg,#e0245e,#f59e0b)", avatar: "#fff1f5", rate: 4.9, sales: "9.1k sales" },
  { name: "Sprout & Co", icon: "🪴", cover: "linear-gradient(120deg,#1f9d55,#3457ff)", avatar: "#eafaf0", rate: 4.7, sales: "6.8k sales" },
];

/* ---------- product card factory ---------- */
function productCard(p, i) {
  const tint = TINTS[i % TINTS.length];
  const el = document.createElement("article");
  el.className = "card";
  const off = p.was ? `<span class="card__off">${Math.round((1 - p.price / p.was) * 100)}% off</span>` : "";
  const was = p.was ? `<span class="card__was">${money(p.was)}</span>` : "";
  const badge = p.badge ? `<span class="card__badge">${p.badge}</span>` : "";
  const ship = p.ship ? `<span class="card__ship">🚚 ${p.ship}</span>` : `<span class="card__ship">🚚 Free shipping</span>`;
  el.innerHTML = `
    <div class="card__media" style="background:${tint}">
      ${badge}
      <button class="card__fav" type="button" aria-pressed="false" aria-label="Save to favorites">🤍</button>
      <span aria-hidden="true">${p.icon}</span>
    </div>
    <div class="card__body">
      <span class="card__vendor">${p.vendor}</span>
      <h3 class="card__title">${p.title}</h3>
      <div class="card__rate"><span class="card__stars" aria-hidden="true">${stars(p.rate)}</span>${p.rate} (${p.reviews.toLocaleString("en-US")})</div>
      <div class="card__priceline"><span class="card__price">${money(p.price)}</span>${was}${off}</div>
      ${ship}
      <button class="card__add" type="button">Add to cart</button>
    </div>`;

  const fav = $(".card__fav", el);
  fav.addEventListener("click", () => {
    const on = fav.classList.toggle("is-on");
    fav.setAttribute("aria-pressed", String(on));
    fav.textContent = on ? "❤️" : "🤍";
    toast(on ? `Saved ${p.vendor} item to favorites` : "Removed from favorites");
  });

  const add = $(".card__add", el);
  add.addEventListener("click", () => {
    addToCart(p);
    add.textContent = "✓ Added";
    add.classList.add("is-added");
    setTimeout(() => { add.textContent = "Add to cart"; add.classList.remove("is-added"); }, 1100);
  });
  return el;
}

/* ---------- render ---------- */
function render() {
  const cg = $("#catGrid");
  CATEGORIES.forEach((c) => {
    const el = document.createElement("button");
    el.className = "cat";
    el.type = "button";
    el.innerHTML = `<div class="cat__tile" style="background:${c.tint}">${c.icon}</div><div class="cat__name">${c.name}</div><div class="cat__count">${c.count}</div>`;
    el.addEventListener("click", () => toast(`Browsing ${c.name}`));
    cg.appendChild(el);
  });

  const dr = $("#dealsRail");
  DEALS.forEach((p, i) => dr.appendChild(productCard(p, i)));

  const tr = $("#topRail");
  TOP.forEach((p, i) => tr.appendChild(productCard(p, i)));

  const vg = $("#vendorGrid");
  VENDORS.forEach((v) => {
    const el = document.createElement("article");
    el.className = "vendor";
    el.innerHTML = `
      <div class="vendor__cover" style="background:${v.cover}"></div>
      <div class="vendor__body">
        <div class="vendor__avatar" style="background:${v.avatar}">${v.icon}</div>
        <div class="vendor__name">${v.name}</div>
        <div class="vendor__meta"><span class="vendor__star">★ ${v.rate}</span> · ${v.sales}</div>
        <button class="vendor__follow" type="button" aria-pressed="false">+ Follow</button>
      </div>`;
    const f = $(".vendor__follow", el);
    f.addEventListener("click", () => {
      const on = f.classList.toggle("is-on");
      f.setAttribute("aria-pressed", String(on));
      f.textContent = on ? "✓ Following" : "+ Follow";
      toast(on ? `Following ${v.name}` : `Unfollowed ${v.name}`);
    });
    vg.appendChild(el);
  });
}

/* ---------- cart state ---------- */
const cart = new Map();

function addToCart(p) {
  const row = cart.get(p.id);
  if (row) row.qty++;
  else cart.set(p.id, { ...p, qty: 1 });
  paintCart();
  bumpCount();
  toast(`Added “${p.title.slice(0, 28)}…” to cart`);
}

function bumpCount() {
  const c = $("#cartCount");
  c.classList.remove("is-bump");
  void c.offsetWidth;
  c.classList.add("is-bump");
}

function paintCart() {
  let count = 0, total = 0;
  cart.forEach((r) => { count += r.qty; total += r.qty * r.price; });
  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = money(total);

  const body = $("#cartItems");
  body.innerHTML = "";
  if (cart.size === 0) {
    body.innerHTML = `<p class="drawer__empty">🛒 Your cart is empty.<br>Add some deals to get started!</p>`;
    return;
  }
  let i = 0;
  cart.forEach((r) => {
    const tint = TINTS[i++ % TINTS.length];
    const el = document.createElement("div");
    el.className = "citem";
    el.innerHTML = `
      <div class="citem__media" style="background:${tint}">${r.icon}</div>
      <div class="citem__info">
        <div class="citem__title">${r.title}</div>
        <div class="citem__vendor">${r.vendor}</div>
        <div class="qty" role="group" aria-label="Quantity">
          <button type="button" data-act="dec" aria-label="Decrease">−</button>
          <span>${r.qty}</span>
          <button type="button" data-act="inc" aria-label="Increase">+</button>
        </div>
        <button class="citem__rm" type="button">Remove</button>
      </div>
      <div class="citem__price">${money(r.price * r.qty)}</div>`;
    $('[data-act="inc"]', el).addEventListener("click", () => { r.qty++; paintCart(); bumpCount(); });
    $('[data-act="dec"]', el).addEventListener("click", () => { r.qty--; if (r.qty < 1) cart.delete(r.id); paintCart(); bumpCount(); });
    $(".citem__rm", el).addEventListener("click", () => { cart.delete(r.id); paintCart(); bumpCount(); toast("Removed from cart"); });
    body.appendChild(el);
  });
}

/* ---------- cart drawer ---------- */
const drawer = $("#cartDrawer");
let lastFocus = null;
function openCart() {
  lastFocus = document.activeElement;
  drawer.hidden = false;
  document.body.style.overflow = "hidden";
  $(".drawer__x", drawer).focus();
}
function closeCart() {
  drawer.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
$("#cartBtn").addEventListener("click", openCart);
$$("[data-close]", drawer).forEach((b) => b.addEventListener("click", closeCart));
$("#checkoutBtn").addEventListener("click", () => {
  if (cart.size === 0) { toast("Your cart is empty"); return; }
  toast("🔒 Checkout is disabled in this demo");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!drawer.hidden) closeCart();
    if (!$("#megaMenu").hidden) closeMega();
  }
});

/* ---------- mega menu ---------- */
const mega = $("#megaMenu");
const megaToggle = $("#megaToggle");
function closeMega() { mega.hidden = true; megaToggle.setAttribute("aria-expanded", "false"); }
megaToggle.addEventListener("click", () => {
  const open = mega.hidden;
  mega.hidden = !open;
  megaToggle.setAttribute("aria-expanded", String(open));
});
document.addEventListener("click", (e) => {
  if (!mega.hidden && !mega.contains(e.target) && e.target !== megaToggle && !megaToggle.contains(e.target)) closeMega();
});

/* ---------- search ---------- */
$("#searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $("#searchInput").value.trim();
  toast(q ? `Searching for “${q}”…` : "Type something to search");
});
$$(".chip").forEach((c) => c.addEventListener("click", () => {
  $("#searchInput").value = c.dataset.q;
  $("#searchInput").focus();
  toast(`Searching for “${c.dataset.q}”…`);
}));

/* ---------- rail nav buttons ---------- */
$$(".railbtn").forEach((b) => b.addEventListener("click", () => {
  const rail = $("#" + b.dataset.rail);
  rail.scrollBy({ left: Number(b.dataset.dir) * 320, behavior: "smooth" });
}));

/* ---------- misc buttons ---------- */
$("#accountBtn").addEventListener("click", () => toast("Sign in is disabled in this demo"));
$("#sellBtn").addEventListener("click", () => toast("✨ Vendor onboarding is disabled in this demo"));

/* ---------- countdown ---------- */
function startCountdown() {
  const end = Date.now() + (3 * 3600 + 47 * 60 + 12) * 1000; // ~3h47m
  const h = $("#cdH"), m = $("#cdM"), s = $("#cdS");
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    let left = Math.max(0, Math.floor((end - Date.now()) / 1000));
    h.textContent = pad(Math.floor(left / 3600));
    m.textContent = pad(Math.floor((left % 3600) / 60));
    s.textContent = pad(left % 60);
    if (left > 0) setTimeout(tick, 1000);
    else toast("⚡ Flash sale ended!");
  }
  tick();
}

/* ---------- init ---------- */
render();
paintCart();
startCountdown();
