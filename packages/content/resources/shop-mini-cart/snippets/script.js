(function () {
  "use strict";

  /* ---------- Demo catalog (fictional) ---------- */
  var PRODUCTS = [
    { id: "p1", title: "Aria Ceramic Mug", cat: "Kitchen", price: 18.0, was: 24.0, rating: 4.8, reviews: 214, badge: "Sale", tint: ["#fde7ef", "#fbcfe0"], ink: "#e0245e", shape: "mug" },
    { id: "p2", title: "Linen Throw Blanket", cat: "Home", price: 64.0, was: null, rating: 4.9, reviews: 88, badge: null, tint: ["#e7efff", "#cfe0ff"], ink: "#3457ff", shape: "blanket" },
    { id: "p3", title: "Maple Wall Clock", cat: "Decor", price: 42.0, was: 52.0, rating: 4.6, reviews: 137, badge: "Sale", tint: ["#fff4e2", "#ffe6bf"], ink: "#d97706", shape: "clock" },
    { id: "p4", title: "Terra Plant Pot", cat: "Garden", price: 29.0, was: null, rating: 4.7, reviews: 309, badge: "New", tint: ["#e6f7ee", "#c7efd9"], ink: "#1f9d55", shape: "pot" },
    { id: "p5", title: "Soy Candle — Cedar", cat: "Scent", price: 22.0, was: null, rating: 4.9, reviews: 451, badge: null, tint: ["#f1eeff", "#ddd6fe"], ink: "#7c3aed", shape: "candle" },
    { id: "p6", title: "Brass Desk Lamp", cat: "Lighting", price: 96.0, was: 120.0, rating: 4.5, reviews: 62, badge: "Sale", tint: ["#fff7da", "#ffeeb0"], ink: "#ca8a04", shape: "lamp" }
  ];

  var SHIP_THRESHOLD = 75;
  var MAX_QTY = 9;

  /* ---------- SVG product silhouettes ---------- */
  function svgFor(shape, color) {
    var s = '<svg viewBox="0 0 48 48" fill="none" stroke="' + color + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    var paths = {
      mug: '<path d="M12 16h22v16a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V16z"/><path d="M34 20h4a4 4 0 0 1 0 12h-4"/><path d="M18 10v3M24 10v3M30 10v3"/>',
      blanket: '<rect x="9" y="12" width="30" height="24" rx="3"/><path d="M9 20h30M9 28h30M16 12v24M24 12v24M32 12v24"/>',
      clock: '<circle cx="24" cy="24" r="14"/><path d="M24 16v8l6 4"/>',
      pot: '<path d="M14 20h20l-2.5 16a3 3 0 0 1-3 2.6H19.5a3 3 0 0 1-3-2.6L14 20z"/><path d="M12 16h24v4H12z"/><path d="M24 16c0-5 4-7 4-10"/>',
      candle: '<rect x="16" y="18" width="16" height="22" rx="2"/><path d="M24 18v-3"/><path d="M24 8c2 2 3 4 0 7-3-3-2-5 0-7z" fill="' + color + '" stroke="none"/>',
      lamp: '<path d="M14 16h20l-4 10H18l-4-10z"/><path d="M24 26v12"/><path d="M16 40h16"/><path d="M24 16v-6h6"/>'
    };
    return s + (paths[shape] || paths.mug) + "</svg>";
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function stars(r) {
    var full = Math.round(r);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }

  /* ---------- State ---------- */
  var cart = []; // { id, qty }

  /* ---------- DOM refs ---------- */
  var grid = document.getElementById("productGrid");
  var cartBtn = document.getElementById("cartBtn");
  var cartCount = document.getElementById("cartCount");
  var cartLive = document.getElementById("cartLive");
  var overlay = document.getElementById("overlay");
  var drawer = document.getElementById("miniCart");
  var closeBtn = document.getElementById("closeCart");
  var emptyClose = document.getElementById("emptyClose");
  var linesEl = document.getElementById("lines");
  var drawerCount = document.getElementById("drawerCount");
  var subtotalEl = document.getElementById("subtotal");
  var shipMsg = document.getElementById("shipMsg");
  var shipFill = document.getElementById("shipFill");
  var shipBar = document.getElementById("shipBar");
  var toastEl = document.getElementById("toast");
  var viewCart = document.getElementById("viewCart");
  var checkout = document.getElementById("checkout");

  var lastFocused = null;
  var toastTimer = null;

  /* ---------- Toast ---------- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- Render product grid ---------- */
  function renderProducts() {
    PRODUCTS.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "card";
      var was = p.was ? '<span class="price__was">' + money(p.was) + "</span>" : "";
      var badge = p.badge ? '<span class="card__badge">' + p.badge + "</span>" : "";
      card.innerHTML =
        '<div class="card__media" style="background:linear-gradient(150deg,' + p.tint[0] + "," + p.tint[1] + ')">' +
          badge + svgFor(p.shape, p.ink) +
        "</div>" +
        '<div class="card__body">' +
          '<span class="card__cat">' + p.cat + "</span>" +
          '<h3 class="card__title">' + p.title + "</h3>" +
          '<span class="rating"><span class="rating__stars" aria-hidden="true">' + stars(p.rating) + "</span>" +
            "<span>" + p.rating.toFixed(1) + " · " + p.reviews + " reviews</span></span>" +
          '<div class="card__foot">' +
            '<span class="price"><span class="price__now">' + money(p.price) + "</span>" + was + "</span>" +
            '<button class="add-btn" type="button" data-add="' + p.id + '" aria-label="Add ' + p.title + ' to cart">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>Add' +
            "</button>" +
          "</div>" +
        "</div>";
      grid.appendChild(card);
    });
  }

  /* ---------- Cart helpers ---------- */
  function findProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }
  function cartLine(id) {
    for (var i = 0; i < cart.length; i++) if (cart[i].id === id) return cart[i];
    return null;
  }
  function totalQty() {
    return cart.reduce(function (s, l) { return s + l.qty; }, 0);
  }
  function subtotal() {
    return cart.reduce(function (s, l) {
      var p = findProduct(l.id);
      return s + (p ? p.price * l.qty : 0);
    }, 0);
  }

  /* ---------- Add to cart ---------- */
  function addToCart(id) {
    var p = findProduct(id);
    if (!p) return;
    var line = cartLine(id);
    if (line) {
      if (line.qty >= MAX_QTY) { toast("Max quantity reached"); return; }
      line.qty += 1;
    } else {
      cart.push({ id: id, qty: 1 });
    }
    updateBadge(true);
    renderLines();
    updateTotals();
    toast(p.title + " added to cart");
    openDrawer();
  }

  /* ---------- Badge ---------- */
  function updateBadge(bump) {
    var q = totalQty();
    cartCount.textContent = q;
    cartBtn.setAttribute("data-has-items", q > 0 ? "true" : "false");
    cartBtn.setAttribute("aria-label", q > 0 ? "Cart, " + q + " item" + (q === 1 ? "" : "s") : "Cart, empty");
    cartLive.textContent = q > 0 ? q + " item" + (q === 1 ? "" : "s") + " in cart" : "Cart is empty";
    if (bump) {
      cartBtn.classList.remove("bump");
      void cartBtn.offsetWidth; // reflow to restart animation
      cartBtn.classList.add("bump");
    }
  }

  /* ---------- Render line items ---------- */
  function renderLines() {
    linesEl.innerHTML = "";
    cart.forEach(function (l) {
      var p = findProduct(l.id);
      if (!p) return;
      var li = document.createElement("li");
      li.className = "line";
      li.dataset.id = p.id;
      li.innerHTML =
        '<div class="line__thumb" style="background:linear-gradient(150deg,' + p.tint[0] + "," + p.tint[1] + ')">' +
          svgFor(p.shape, p.ink) +
        "</div>" +
        '<div class="line__main">' +
          '<p class="line__title">' + p.title + "</p>" +
          '<span class="line__unit">' + money(p.price) + " each</span>" +
          '<div class="stepper" aria-label="Quantity for ' + p.title + '">' +
            '<button type="button" data-dec="' + p.id + '" aria-label="Decrease quantity"' + (l.qty <= 1 ? " disabled" : "") + ">&minus;</button>" +
            '<output aria-live="polite">' + l.qty + "</output>" +
            '<button type="button" data-inc="' + p.id + '" aria-label="Increase quantity"' + (l.qty >= MAX_QTY ? " disabled" : "") + ">+</button>" +
          "</div>" +
        "</div>" +
        '<div class="line__side">' +
          '<span class="line__price">' + money(p.price * l.qty) + "</span>" +
          '<button class="line__remove" type="button" data-remove="' + p.id + '">Remove</button>' +
        "</div>";
      linesEl.appendChild(li);
    });
    drawer.setAttribute("data-empty", cart.length === 0 ? "true" : "false");
  }

  /* ---------- Totals + free shipping bar ---------- */
  function updateTotals() {
    var q = totalQty();
    var sub = subtotal();
    drawerCount.textContent = "(" + q + ")";
    subtotalEl.textContent = money(sub);

    var pct = Math.min(100, (sub / SHIP_THRESHOLD) * 100);
    shipFill.style.width = pct + "%";
    var track = shipBar.querySelector(".ship__track");
    track.setAttribute("aria-valuenow", Math.min(sub, SHIP_THRESHOLD).toFixed(0));

    if (sub >= SHIP_THRESHOLD) {
      shipMsg.innerHTML = "🎉 You unlocked <strong>free shipping!</strong>";
      shipMsg.classList.add("done");
      shipFill.classList.add("done");
    } else {
      var remain = SHIP_THRESHOLD - sub;
      shipMsg.innerHTML = "Add <strong>" + money(remain) + "</strong> more for free shipping.";
      shipMsg.classList.remove("done");
      shipFill.classList.remove("done");
    }
  }

  /* ---------- Qty + remove ---------- */
  function changeQty(id, delta) {
    var line = cartLine(id);
    if (!line) return;
    line.qty += delta;
    if (line.qty < 1) { removeLine(id); return; }
    if (line.qty > MAX_QTY) { line.qty = MAX_QTY; toast("Max quantity reached"); }
    updateBadge(delta > 0);
    renderLines();
    updateTotals();
  }

  function removeLine(id) {
    var p = findProduct(id);
    var li = linesEl.querySelector('.line[data-id="' + id + '"]');
    var commit = function () {
      cart = cart.filter(function (l) { return l.id !== id; });
      updateBadge(false);
      renderLines();
      updateTotals();
      if (p) toast(p.title + " removed");
    };
    if (li) {
      li.classList.add("removing");
      var done = false;
      var finish = function () { if (done) return; done = true; commit(); };
      li.addEventListener("animationend", finish, { once: true });
      setTimeout(finish, 400);
    } else {
      commit();
    }
  }

  /* ---------- Drawer open/close + focus trap ---------- */
  function getFocusable() {
    return Array.prototype.slice.call(
      drawer.querySelectorAll('button, [href], input, output, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
  }

  function openDrawer() {
    if (drawer.classList.contains("open")) return;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add("show"); });
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    cartBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      var f = getFocusable();
      (f[0] || closeBtn).focus();
    }, 60);
    document.addEventListener("keydown", onKeydown);
  }

  function closeDrawer() {
    if (!drawer.classList.contains("open")) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.classList.remove("show");
    cartBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    setTimeout(function () { overlay.hidden = true; }, 300);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") { e.preventDefault(); closeDrawer(); return; }
    if (e.key === "Tab") {
      var f = getFocusable();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* ---------- Event wiring ---------- */
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add]");
    if (btn) addToCart(btn.getAttribute("data-add"));
  });

  linesEl.addEventListener("click", function (e) {
    var inc = e.target.closest("[data-inc]");
    var dec = e.target.closest("[data-dec]");
    var rm = e.target.closest("[data-remove]");
    if (inc) changeQty(inc.getAttribute("data-inc"), 1);
    else if (dec) changeQty(dec.getAttribute("data-dec"), -1);
    else if (rm) removeLine(rm.getAttribute("data-remove"));
  });

  cartBtn.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  if (emptyClose) emptyClose.addEventListener("click", closeDrawer);
  viewCart.addEventListener("click", function () { toast("Full cart page is illustrative only"); });
  checkout.addEventListener("click", function () {
    if (cart.length === 0) { toast("Your cart is empty"); return; }
    toast("Demo checkout — no real payment. Subtotal " + money(subtotal()));
  });

  /* ---------- Init ---------- */
  renderProducts();
  renderLines();
  updateBadge(false);
  updateTotals();
})();
