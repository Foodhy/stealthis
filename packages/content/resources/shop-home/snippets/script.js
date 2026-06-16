/* ===== Nimbus storefront — vanilla JS ===== */
(function () {
  "use strict";

  const money = (n) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* Product silhouettes as inline SVG (no external images) */
  const SHAPES = {
    mug: '<svg viewBox="0 0 64 64" fill="none"><rect x="14" y="20" width="28" height="30" rx="6" fill="#16181d" opacity=".82"/><path d="M42 26h6a7 7 0 0 1 0 14h-6" stroke="#16181d" stroke-width="4" opacity=".82"/></svg>',
    lamp: '<svg viewBox="0 0 64 64" fill="none"><path d="M22 14h20l6 14H16l6-14Z" fill="#16181d" opacity=".82"/><rect x="30" y="28" width="4" height="20" fill="#16181d" opacity=".82"/><rect x="20" y="48" width="24" height="5" rx="2.5" fill="#16181d" opacity=".82"/></svg>',
    bottle: '<svg viewBox="0 0 64 64" fill="none"><rect x="26" y="10" width="12" height="8" rx="2" fill="#16181d" opacity=".82"/><path d="M24 18h16v30a8 8 0 0 1-8 8 8 8 0 0 1-8-8V18Z" fill="#16181d" opacity=".82"/></svg>',
    headphones: '<svg viewBox="0 0 64 64" fill="none"><path d="M14 36v-4a18 18 0 0 1 36 0v4" stroke="#16181d" stroke-width="4" opacity=".82"/><rect x="10" y="34" width="10" height="16" rx="5" fill="#16181d" opacity=".82"/><rect x="44" y="34" width="10" height="16" rx="5" fill="#16181d" opacity=".82"/></svg>',
    pot: '<svg viewBox="0 0 64 64" fill="none"><path d="M18 28h28l-3 20a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4l-3-20Z" fill="#16181d" opacity=".82"/><path d="M28 28c0-8 8-8 8-16" stroke="#1f9d55" stroke-width="4" opacity=".82" fill="none"/></svg>',
    notebook: '<svg viewBox="0 0 64 64" fill="none"><rect x="18" y="12" width="28" height="40" rx="4" fill="#16181d" opacity=".82"/><rect x="14" y="16" width="6" height="32" rx="3" fill="#3457ff" opacity=".82"/></svg>',
    clock: '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="34" r="18" fill="#16181d" opacity=".82"/><path d="M32 34V24M32 34l8 5" stroke="#fff" stroke-width="3"/></svg>',
    speaker: '<svg viewBox="0 0 64 64" fill="none"><rect x="20" y="12" width="24" height="40" rx="6" fill="#16181d" opacity=".82"/><circle cx="32" cy="40" r="7" fill="#fff" opacity=".4"/><circle cx="32" cy="22" r="3" fill="#fff" opacity=".4"/></svg>',
  };

  const TINTS = ["#e7ecff", "#ffe9d6", "#d9f3ea", "#f3e0ff", "#e6f0ff", "#fff0e0"];

  const PRODUCTS = [
    { id: "p1", name: "Aero Ceramic Mug", cat: "Kitchen", shape: "mug", price: 24, was: 32, rating: 4.8, reviews: 412, badge: "sale", stock: "ok" },
    { id: "p2", name: "Halo Desk Lamp", cat: "Lighting", shape: "lamp", price: 89, was: null, rating: 4.9, reviews: 238, badge: "new", stock: "ok" },
    { id: "p3", name: "Trail Steel Bottle", cat: "Everyday", shape: "bottle", price: 29, was: null, rating: 4.7, reviews: 956, badge: null, stock: "low" },
    { id: "p4", name: "Drift Wireless Headphones", cat: "Audio", shape: "headphones", price: 129, was: 169, rating: 4.6, reviews: 188, badge: "sale", stock: "ok" },
    { id: "p5", name: "Sprout Planter Set", cat: "Home", shape: "pot", price: 42, was: null, rating: 4.9, reviews: 321, badge: "new", stock: "ok" },
    { id: "p6", name: "Field Lined Notebook", cat: "Desk", shape: "notebook", price: 18, was: 24, rating: 4.8, reviews: 740, badge: "sale", stock: "ok" },
    { id: "p7", name: "Orbit Desk Clock", cat: "Desk", shape: "clock", price: 56, was: null, rating: 4.7, reviews: 154, badge: null, stock: "low" },
    { id: "p8", name: "Pulse Mini Speaker", cat: "Audio", shape: "speaker", price: 74, was: 94, rating: 4.5, reviews: 209, badge: "sale", stock: "ok" },
  ];

  /* ---------- Toast ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  /* ---------- Cart state ---------- */
  const cart = new Map(); // id -> qty
  const cartCountEl = document.getElementById("cartCount");
  const cartBtn = document.getElementById("cartBtn");
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("overlay");
  const drawerItems = document.getElementById("drawerItems");
  const drawerEmpty = document.getElementById("drawerEmpty");
  const drawerTotal = document.getElementById("drawerTotal");

  const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

  function cartQty() {
    let n = 0;
    cart.forEach((q) => (n += q));
    return n;
  }
  function cartSubtotal() {
    let t = 0;
    cart.forEach((q, id) => (t += findProduct(id).price * q));
    return t;
  }

  function syncHeader() {
    const n = cartQty();
    cartCountEl.textContent = n;
    cartBtn.setAttribute("aria-label", `Open cart, ${n} item${n === 1 ? "" : "s"}`);
    cartCountEl.classList.remove("pulse");
    // force reflow to restart animation
    void cartCountEl.offsetWidth;
    cartCountEl.classList.add("pulse");
  }

  function addToCart(id) {
    cart.set(id, (cart.get(id) || 0) + 1);
    syncHeader();
    renderDrawer();
    toast(`${findProduct(id).name} added to cart`);
  }

  function setQty(id, delta) {
    const next = (cart.get(id) || 0) + delta;
    if (next <= 0) cart.delete(id);
    else cart.set(id, next);
    syncHeader();
    renderDrawer();
  }

  function removeItem(id) {
    cart.delete(id);
    syncHeader();
    renderDrawer();
  }

  function renderDrawer() {
    drawerItems.innerHTML = "";
    if (cart.size === 0) {
      drawerEmpty.hidden = false;
    } else {
      drawerEmpty.hidden = true;
      let i = 0;
      cart.forEach((qty, id) => {
        const p = findProduct(id);
        const li = document.createElement("li");
        li.className = "d-item";
        li.innerHTML = `
          <span class="d-thumb" style="background:${TINTS[i % TINTS.length]}">${SHAPES[p.shape]}</span>
          <div class="d-info">
            <div class="d-name">${p.name}</div>
            <div class="d-price">${money(p.price)} each</div>
            <div class="qty">
              <button type="button" data-act="dec" aria-label="Decrease quantity of ${p.name}">−</button>
              <span aria-label="Quantity">${qty}</span>
              <button type="button" data-act="inc" aria-label="Increase quantity of ${p.name}">+</button>
              <button type="button" class="d-remove" data-act="rm">Remove</button>
            </div>
          </div>
          <div class="d-line">${money(p.price * qty)}</div>`;
        li.querySelector('[data-act="dec"]').addEventListener("click", () => setQty(id, -1));
        li.querySelector('[data-act="inc"]').addEventListener("click", () => setQty(id, 1));
        li.querySelector('[data-act="rm"]').addEventListener("click", () => removeItem(id));
        drawerItems.appendChild(li);
        i++;
      });
    }
    drawerTotal.textContent = money(cartSubtotal());
  }

  /* ---------- Drawer open/close ---------- */
  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("show"));
    drawer.focus();
  }
  function closeCart() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.classList.remove("show");
    setTimeout(() => (overlay.hidden = true), 260);
    if (lastFocus) lastFocus.focus();
  }
  cartBtn.addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeCart();
  });
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (cart.size === 0) {
      toast("Your cart is empty");
      return;
    }
    toast("Checkout is disabled in this demo");
  });

  /* ---------- Render product cards ---------- */
  const rail = document.getElementById("rail");
  PRODUCTS.forEach((p, idx) => {
    const li = document.createElement("li");
    li.className = "card";
    const onSale = p.was && p.was > p.price;
    let badge = "";
    if (p.badge === "sale" && onSale) {
      const pct = Math.round((1 - p.price / p.was) * 100);
      badge = `<span class="badge sale">−${pct}%</span>`;
    } else if (p.badge === "new") {
      badge = `<span class="badge new">New</span>`;
    }
    const stockChip = p.stock === "low" ? `<span class="badge low">Low stock</span>` : "";
    const stars = "★★★★★".slice(0, Math.round(p.rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(p.rating));

    li.innerHTML = `
      <div class="card-media" style="background:${TINTS[idx % TINTS.length]}">
        ${badge || stockChip}
        <button class="wish" type="button" aria-label="Add ${p.name} to wishlist" aria-pressed="false">♥</button>
        ${SHAPES[p.shape]}
      </div>
      <div class="card-body">
        <span class="card-cat">${p.cat}</span>
        <h3 class="card-name">${p.name}</h3>
        <div class="rating">
          <span class="stars" aria-hidden="true">${stars}</span>
          <span>${p.rating.toFixed(1)} · ${p.reviews} reviews</span>
        </div>
        <div class="price-row">
          <span class="price ${onSale ? "is-sale" : ""}">${money(p.price)}</span>
          ${onSale ? `<span class="price-was">${money(p.was)}</span>` : ""}
        </div>
        <button class="add-btn" type="button">Add to cart</button>
      </div>`;

    const addBtn = li.querySelector(".add-btn");
    addBtn.addEventListener("click", () => {
      addToCart(p.id);
      addBtn.classList.add("added");
      addBtn.textContent = "Added ✓";
      setTimeout(() => {
        addBtn.classList.remove("added");
        addBtn.textContent = "Add to cart";
      }, 1100);
    });

    const wish = li.querySelector(".wish");
    wish.addEventListener("click", () => {
      const on = wish.classList.toggle("on");
      wish.setAttribute("aria-pressed", String(on));
      toast(on ? `Saved ${p.name} to wishlist` : `Removed ${p.name} from wishlist`);
    });

    rail.appendChild(li);
  });

  /* ---------- Carousel scroll ---------- */
  function railStep() {
    const card = rail.querySelector(".card");
    if (!card) return 280;
    const gap = parseFloat(getComputedStyle(rail).columnGap || "18") || 18;
    return card.getBoundingClientRect().width + gap;
  }
  document.getElementById("prevBtn").addEventListener("click", () => {
    rail.scrollBy({ left: -railStep() * 2, behavior: "smooth" });
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    rail.scrollBy({ left: railStep() * 2, behavior: "smooth" });
  });

  /* ---------- Countdown ---------- */
  const cdH = document.getElementById("cdH");
  const cdM = document.getElementById("cdM");
  const cdS = document.getElementById("cdS");
  // End 8h 45m from load — a moving but stable target for the session.
  let remaining = 8 * 3600 + 45 * 60 + 12;
  const pad = (n) => String(n).padStart(2, "0");
  function tickCountdown() {
    if (remaining <= 0) remaining = 8 * 3600 + 45 * 60; // loop the sale
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    cdH.textContent = pad(h);
    cdM.textContent = pad(m);
    cdS.textContent = pad(s);
    remaining--;
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- Search (filters the rail by name/category) ---------- */
  const searchInput = document.getElementById("search");
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    let shown = 0;
    rail.querySelectorAll(".card").forEach((card, idx) => {
      const p = PRODUCTS[idx];
      const match = !q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q);
      card.style.display = match ? "" : "none";
      if (match) shown++;
    });
    if (q && shown === 0) toast(`No products match "${searchInput.value.trim()}"`);
  });

  /* ---------- Newsletter ---------- */
  document.getElementById("newsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("newsEmail");
    toast(`Thanks — ${email.value} is on the list`);
    email.value = "";
  });

  /* init */
  renderDrawer();
})();
