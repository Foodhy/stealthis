/* Aperture Editions — fine art print store
   Vanilla JS, single in-memory state array, re-render on change. */

(function () {
  "use strict";

  /* ---------- Data ---------- */
  const SIZES = [
    { id: "a4", label: "A4", dim: "21×30cm", mult: 1 },
    { id: "a3", label: "A3", dim: "30×42cm", mult: 1.7 },
    { id: "a2", label: "A2", dim: "42×59cm", mult: 2.6 },
    { id: "a1", label: "A1", dim: "59×84cm", mult: 4.1 },
  ];

  const FRAMES = [
    { id: "none", label: "Unframed", add: 0 },
    { id: "oak", label: "Natural Oak", add: 65 },
    { id: "black", label: "Matte Black", add: 55 },
  ];

  const PRINTS = [
    { id: "dunes", title: "Saharan Dunes", author: "Lina Marchetti", badge: "New", edition: "Edition of 50", base: 48,
      img: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80" },
    { id: "fjord", title: "Nordic Fjord", author: "Kasper Holt", badge: "Bestseller", edition: "Edition of 35", base: 62,
      img: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=800&q=80" },
    { id: "canyon", title: "Red Canyon Light", author: "Sofia Reyes", badge: "Limited", edition: "Edition of 25", base: 74,
      img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80" },
    { id: "mist", title: "Forest in Mist", author: "Jonas Frei", badge: "New", edition: "Edition of 50", base: 45,
      img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80" },
    { id: "wave", title: "Pacific Break", author: "Ana Okoye", badge: "Bestseller", edition: "Edition of 40", base: 58,
      img: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=800&q=80" },
    { id: "peaks", title: "Alpine Silence", author: "Rúben Costa", badge: "Limited", edition: "Edition of 20", base: 80,
      img: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80" },
  ];

  const SHIP_FRAMED = 18;
  const PROMOS = { GALLERY10: 0.10, STUDIO20: 0.20 };

  /* per-card current selection */
  const selection = {};
  PRINTS.forEach((p) => { selection[p.id] = { size: "a3", frame: "none" }; });

  /* cart line items */
  let cart = [];
  let promo = null;

  /* ---------- Helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

  function unitPrice(print, sizeId, frameId) {
    const size = SIZES.find((s) => s.id === sizeId);
    const frame = FRAMES.find((f) => f.id === frameId);
    return print.base * size.mult + frame.add;
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ---------- Render catalogue ---------- */
  function renderGrid() {
    const grid = $("#grid");
    grid.innerHTML = "";
    PRINTS.forEach((print) => {
      const sel = selection[print.id];
      const card = document.createElement("article");
      card.className = "card";

      const sizePills = SIZES.map((s) =>
        `<button class="pill" role="button" data-kind="size" data-print="${print.id}" data-val="${s.id}" aria-pressed="${s.id === sel.size}">${s.label}<small>${s.dim}</small></button>`
      ).join("");

      const framePills = FRAMES.map((f) =>
        `<button class="pill" data-kind="frame" data-print="${print.id}" data-val="${f.id}" aria-pressed="${f.id === sel.frame}">${f.label}${f.add ? `<small>+${money(f.add)}</small>` : `<small>incl.</small>`}</button>`
      ).join("");

      card.innerHTML = `
        <div class="card-media" style="background-image:url('${print.img}')">
          <span class="card-badge">${print.badge}</span>
          <span class="card-edition">${print.edition}</span>
        </div>
        <div class="card-body">
          <div>
            <h3 class="card-title">${print.title}</h3>
            <p class="card-meta">by ${print.author}</p>
          </div>
          <div>
            <p class="opt-label">Size</p>
            <div class="pill-row" data-row="size">${sizePills}</div>
          </div>
          <div>
            <p class="opt-label">Framing</p>
            <div class="pill-row" data-row="frame">${framePills}</div>
          </div>
          <div class="card-foot">
            <div class="price"><span class="price-cur">$</span><span data-price="${print.id}"></span></div>
            <button class="add-btn" data-add="${print.id}">Add to cart</button>
          </div>
        </div>`;
      grid.appendChild(card);
      updatePrice(print.id);
    });
  }

  function updatePrice(printId) {
    const print = PRINTS.find((p) => p.id === printId);
    const sel = selection[printId];
    const el = document.querySelector(`[data-price="${printId}"]`);
    if (el) el.textContent = Math.round(unitPrice(print, sel.size, sel.frame)).toLocaleString("en-US");
  }

  /* ---------- Grid interactions ---------- */
  $("#grid").addEventListener("click", (e) => {
    const pill = e.target.closest(".pill");
    if (pill) {
      const { kind, print, val } = pill.dataset;
      selection[print][kind] = val;
      const row = pill.parentElement;
      row.querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", p === pill ? "true" : "false"));
      updatePrice(print);
      return;
    }
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) addToCart(addBtn.dataset.add);
  });

  /* ---------- Cart logic ---------- */
  function addToCart(printId) {
    const print = PRINTS.find((p) => p.id === printId);
    const sel = selection[printId];
    const key = `${printId}-${sel.size}-${sel.frame}`;
    const existing = cart.find((l) => l.key === key);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        key, printId, img: print.img, title: print.title,
        size: sel.size, frame: sel.frame,
        unit: unitPrice(print, sel.size, sel.frame), qty: 1,
      });
    }
    const size = SIZES.find((s) => s.id === sel.size);
    toast(`${print.title} · ${size.label} added`);
    bumpCount();
    renderCart();
    openDrawer();
  }

  function bumpCount() {
    const badge = $("#cartCount");
    badge.classList.remove("bump");
    void badge.offsetWidth;
    badge.classList.add("bump");
  }

  function renderCart() {
    const wrap = $("#cartItems");
    const empty = $("#cartEmpty");
    const foot = $("#cartFoot");
    const count = cart.reduce((n, l) => n + l.qty, 0);
    $("#cartCount").textContent = count;

    if (!cart.length) {
      wrap.innerHTML = "";
      empty.hidden = false;
      foot.hidden = true;
      return;
    }
    empty.hidden = true;
    foot.hidden = false;

    wrap.innerHTML = cart.map((l) => {
      const size = SIZES.find((s) => s.id === l.size);
      const frame = FRAMES.find((f) => f.id === l.frame);
      return `
        <div class="line">
          <div class="line-thumb" style="background-image:url('${l.img}')"></div>
          <div class="line-info">
            <span class="line-title">${l.title}</span>
            <span class="line-spec">${size.label} · ${size.dim} · ${frame.label}</span>
            <div class="line-ctrls">
              <div class="stepper" role="group" aria-label="Quantity for ${l.title}">
                <button data-step="dec" data-key="${l.key}" aria-label="Decrease quantity">−</button>
                <span>${l.qty}</span>
                <button data-step="inc" data-key="${l.key}" aria-label="Increase quantity">+</button>
              </div>
              <div class="line-right">
                <span class="line-total">${money(l.unit * l.qty)}</span>
                <button class="line-remove" data-remove="${l.key}">Remove</button>
              </div>
            </div>
          </div>
        </div>`;
    }).join("");

    renderTotals();
  }

  function renderTotals() {
    const subtotal = cart.reduce((n, l) => n + l.unit * l.qty, 0);
    const hasFramed = cart.some((l) => l.frame !== "none");
    const shipping = hasFramed ? SHIP_FRAMED : 0;
    const discRow = $("#discountRow");
    let discount = 0;
    if (promo && PROMOS[promo]) {
      discount = subtotal * PROMOS[promo];
      discRow.hidden = false;
      $("#promoTag").textContent = promo;
      $("#discount").textContent = "-" + money(discount);
    } else {
      discRow.hidden = true;
    }
    $("#subtotal").textContent = money(subtotal);
    $("#shipping").textContent = shipping ? money(shipping) : "Free";
    $("#grandTotal").textContent = money(subtotal + shipping - discount);
  }

  $("#cartItems").addEventListener("click", (e) => {
    const step = e.target.closest("[data-step]");
    if (step) {
      const line = cart.find((l) => l.key === step.dataset.key);
      if (!line) return;
      line.qty += step.dataset.step === "inc" ? 1 : -1;
      if (line.qty <= 0) cart = cart.filter((l) => l !== line);
      renderCart();
      return;
    }
    const rm = e.target.closest("[data-remove]");
    if (rm) {
      cart = cart.filter((l) => l.key !== rm.dataset.remove);
      toast("Removed from cart");
      renderCart();
    }
  });

  /* ---------- Promo ---------- */
  $("#applyPromo").addEventListener("click", () => {
    const code = $("#promoInput").value.trim().toUpperCase();
    if (!cart.length) { toast("Cart is empty"); return; }
    if (PROMOS[code]) {
      promo = code;
      toast(`Promo ${code} applied · ${PROMOS[code] * 100}% off`);
    } else {
      promo = null;
      toast("Invalid promo code");
    }
    $("#promoInput").value = "";
    renderTotals();
  });

  $("#checkout").addEventListener("click", () => {
    toast("Demo checkout — order placed. Thank you!");
  });

  /* ---------- Drawer ---------- */
  const drawer = $("#cartDrawer");
  const scrim = $("#scrim");

  function openDrawer() {
    scrim.hidden = false;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    $("#closeCart").focus();
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    $("#cartBtn").focus();
  }

  $("#cartBtn").addEventListener("click", openDrawer);
  $("#closeCart").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  $("#emptyBrowse").addEventListener("click", () => {
    closeDrawer();
    document.getElementById("grid").scrollIntoView();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
  });

  /* ---------- Init ---------- */
  renderGrid();
  renderCart();
})();
