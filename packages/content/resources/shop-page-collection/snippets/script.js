(function () {
  "use strict";

  /* ---------- Inline SVG "product photography" ---------- */
  function svgGarment(stops) {
    return (
      '<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img">' +
      '<defs><linearGradient id="g' + stops.id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + stops.a + '"/><stop offset="1" stop-color="' + stops.b + '"/></linearGradient></defs>' +
      '<rect width="200" height="250" fill="url(#g' + stops.id + ')"/>' +
      '<g fill="rgba(255,255,255,.5)" stroke="rgba(27,29,34,.18)" stroke-width="1.5">' +
      stops.shape +
      "</g></svg>"
    );
  }

  var SHAPES = {
    shirt:
      '<path d="M70 70 55 84 45 74 70 56h60l25 18-10 10-15-14v110H70Z"/>',
    knit:
      '<path d="M64 64 50 82l12 12 8-8v100h60V98l8 8 12-12-14-18h-26l-6 8h-8l-6-8Z"/>',
    tote:
      '<rect x="62" y="92" width="76" height="96" rx="8"/><path d="M82 92c0-22 36-22 36 0" fill="none" stroke-width="6"/>',
    mug:
      '<rect x="62" y="96" width="58" height="78" rx="10"/><path d="M120 116c26 0 26 42 0 42" fill="none" stroke-width="8"/>',
    apron:
      '<path d="M78 70h44l4 18-8 6v94H82V94l-8-6Z"/><path d="M88 70 100 56l12 14" fill="none"/>',
  };

  /* ---------- Catalog ---------- */
  var PRODUCTS = {
    "linen-shirt": {
      name: "Salt Linen Overshirt", tag: "Tops · Unisex", price: 148, was: 178,
      rating: 4.8, reviews: 126, stock: "In stock", low: false,
      desc: "A breezy washed-linen overshirt with a relaxed shoulder and shell buttons. Throws over everything, gets softer with every wash.",
      shape: "shirt", ramps: [["#ece3d2", "#cdbf9f"], ["#e7d8bf", "#bda77f"], ["#f1ead9", "#d8c8a3"]],
    },
    "wool-knit": {
      name: "Fisher Wool Knit", tag: "Knitwear · Unisex", price: 192, was: null,
      rating: 4.9, reviews: 88, stock: "Only 4 left", low: true,
      desc: "Chunky lambswool sweater knit on the Portuguese coast. Ribbed cuffs, dropped shoulders, the kind of warm you keep forever.",
      shape: "knit", ramps: [["#b6c7c0", "#6f9286"], ["#a8bdb4", "#5d8074"], ["#c2d1cb", "#7fa093"]],
    },
    "canvas-tote": {
      name: "Harbour Canvas Tote", tag: "Bags", price: 64, was: null,
      rating: 4.7, reviews: 211, stock: "In stock", low: false,
      desc: "Heavyweight cotton canvas with a flat leather base and an inner pocket. Carries the market haul and the beach towels alike.",
      shape: "tote", ramps: [["#d8c7a6", "#ab8d5d"], ["#e0d2b3", "#b89a6a"], ["#cdb992", "#9c7e4f"]],
    },
    "stoneware-mug": {
      name: "Tide Stoneware Mug", tag: "Home · Ceramics", price: 28, was: 36,
      rating: 4.9, reviews: 304, stock: "In stock", low: false,
      desc: "Hand-thrown stoneware in a speckled tide glaze, no two alike. Holds a generous pour and feels good in cold hands.",
      shape: "mug", ramps: [["#cfe0db", "#7faa9c"], ["#d8e6e1", "#8db5a8"], ["#c3d6d0", "#6f9b8d"]],
    },
    "linen-apron": {
      name: "Baker's Linen Apron", tag: "Home · Kitchen", price: 54, was: null,
      rating: 4.6, reviews: 73, stock: "Only 6 left", low: true,
      desc: "Full-length linen apron with a roomy front pocket and crossed back straps. Flour-dusted by design.",
      shape: "apron", ramps: [["#e3d6c4", "#c9b59a"], ["#ecdfcd", "#d3bfa3"], ["#dccdb8", "#bda484"]],
    },
    "wool-scarf": {
      name: "Headland Wool Scarf", tag: "Accessories", price: 72, was: 88,
      rating: 4.8, reviews: 142, stock: "In stock", low: false,
      desc: "A double-faced merino scarf in coastal heather, long enough to wrap twice against the wind.",
      shape: "knit", ramps: [["#c9b6c4", "#8a6f86"], ["#d2c0cd", "#9b819a"], ["#bda6ba", "#7c6478"]],
    },
  };

  // Grid order
  var GRID_ORDER = ["linen-shirt", "wool-knit", "canvas-tote", "stoneware-mug", "linen-apron", "wool-scarf"];

  // Bundle / shop the look
  var LOOK = ["linen-shirt", "wool-knit", "canvas-tote"];
  var LOOK_DISCOUNT = 0.15;

  var money = function (n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var stars = function (r) {
    var full = Math.round(r);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  };

  /* ---------- Toast ---------- */
  var toastHost = document.getElementById("toastHost");
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    toastHost.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      t.addEventListener("animationend", function () { t.remove(); });
    }, 2200);
  }

  /* ---------- Cart state ---------- */
  var cart = {}; // id -> qty
  var cartBtn = document.getElementById("cartBtn");
  var cartCount = document.getElementById("cartCount");

  function cartItemCount() {
    return Object.keys(cart).reduce(function (s, id) { return s + cart[id]; }, 0);
  }
  function cartSubtotal() {
    return Object.keys(cart).reduce(function (s, id) { return s + PRODUCTS[id].price * cart[id]; }, 0);
  }
  function updateCount() {
    var n = cartItemCount();
    cartCount.textContent = n;
    cartCount.setAttribute("aria-label", n + (n === 1 ? " item" : " items") + " in bag");
    cartCount.classList.remove("pulse");
    void cartCount.offsetWidth;
    cartCount.classList.add("pulse");
  }
  function addToCart(id, qty) {
    qty = qty || 1;
    cart[id] = (cart[id] || 0) + qty;
    updateCount();
    renderDrawer();
  }

  /* ---------- Product grid ---------- */
  var grid = document.getElementById("productGrid");
  GRID_ORDER.forEach(function (id) {
    var p = PRODUCTS[id];
    var card = document.createElement("article");
    card.className = "card";
    var saleBadge = p.was ? '<span class="card-badge">Sale</span>' : "";
    var wasHtml = p.was ? '<span class="was">' + money(p.was) + "</span>" : "";
    var cardArt = svgGarment({ id: "card-" + id, a: p.ramps[0][0], b: p.ramps[0][1], shape: SHAPES[p.shape] });
    card.innerHTML =
      '<div class="card-art">' + saleBadge + cardArt + "</div>" +
      '<div class="card-body">' +
      '<span class="card-tag">' + p.tag + "</span>" +
      '<h3 class="card-name">' + p.name + "</h3>" +
      '<div class="card-rating"><span class="stars" aria-hidden="true">' + stars(p.rating) + "</span>" +
      "<span>" + p.rating.toFixed(1) + " · " + p.reviews + " reviews</span></div>" +
      '<div class="card-foot"><span class="price">' + wasHtml + money(p.price) + "</span>" +
      '<button class="card-add" data-add="' + id + '" aria-label="Add ' + p.name + ' to bag">+</button></div>' +
      "</div>";
    grid.appendChild(card);

    card.querySelector(".card-name").addEventListener("click", function () { openPopover(id, card.querySelector(".card-name")); });
    card.querySelector(".card-art").style.cursor = "pointer";
    card.querySelector(".card-art").addEventListener("click", function () { openPopover(id, card.querySelector(".card-art")); });
  });

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add]");
    if (!btn) return;
    var id = btn.getAttribute("data-add");
    addToCart(id, 1);
    toast(PRODUCTS[id].name + " added to bag");
  });

  /* ---------- Product popover ---------- */
  var popOverlay = document.getElementById("popOverlay");
  var popover = document.getElementById("popover");
  var popArt = document.getElementById("popArt");
  var popThumbs = document.getElementById("popThumbs");
  var popName = document.getElementById("popName");
  var popTag = document.getElementById("popTag");
  var popRating = document.getElementById("popRating");
  var popPrice = document.getElementById("popPrice");
  var popDesc = document.getElementById("popDesc");
  var popStock = document.getElementById("popStock");
  var popAdd = document.getElementById("popAdd");
  var popClose = document.getElementById("popClose");
  var popTrigger = null;
  var popCurrent = null;

  function setPopArt(id, idx) {
    var p = PRODUCTS[id];
    var ramp = p.ramps[idx] || p.ramps[0];
    popArt.innerHTML = svgGarment({ id: "pop", a: ramp[0], b: ramp[1], shape: SHAPES[p.shape] });
    Array.prototype.forEach.call(popThumbs.children, function (t, i) {
      t.setAttribute("aria-selected", String(i === idx));
    });
  }

  function openPopover(id, trigger) {
    var p = PRODUCTS[id];
    popCurrent = id;
    popTrigger = trigger || null;
    popTag.textContent = p.tag;
    popName.textContent = p.name;
    popRating.innerHTML = '<span class="stars" aria-hidden="true">' + stars(p.rating) + "</span> " +
      p.rating.toFixed(1) + " · " + p.reviews + " reviews";
    popPrice.innerHTML = (p.was ? '<span class="was">' + money(p.was) + "</span>" : "") + money(p.price);
    popDesc.textContent = p.desc;
    popStock.textContent = p.stock;
    popStock.className = "pop-stock" + (p.low ? " low" : "");

    // thumbs
    popThumbs.innerHTML = "";
    p.ramps.forEach(function (ramp, i) {
      var b = document.createElement("button");
      b.className = "pop-thumb";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "View " + (i + 1));
      b.innerHTML = svgGarment({ id: "th" + i, a: ramp[0], b: ramp[1], shape: SHAPES[p.shape] });
      b.addEventListener("click", function () { setPopArt(id, i); });
      popThumbs.appendChild(b);
    });
    setPopArt(id, 0);

    popOverlay.hidden = false;
    popover.hidden = false;
    document.body.style.overflow = "hidden";
    if (popHotspot) popHotspot.setAttribute("aria-expanded", "true");
    popClose.focus();
    document.addEventListener("keydown", onPopKey);
  }
  var popHotspot = null;

  function closePopover() {
    popOverlay.hidden = true;
    popover.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onPopKey);
    if (popHotspot) { popHotspot.setAttribute("aria-expanded", "false"); popHotspot = null; }
    if (popTrigger && popTrigger.focus) popTrigger.focus();
    popCurrent = null;
  }
  function onPopKey(e) {
    if (e.key === "Escape") closePopover();
    if (e.key === "Tab") trapFocus(e, popover);
  }
  popClose.addEventListener("click", closePopover);
  popOverlay.addEventListener("click", closePopover);
  popAdd.addEventListener("click", function () {
    if (!popCurrent) return;
    addToCart(popCurrent, 1);
    toast(PRODUCTS[popCurrent].name + " added to bag");
    closePopover();
  });

  /* ---------- Hotspots in the story ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".hotspot"), function (h) {
    h.setAttribute("aria-expanded", "false");
    h.addEventListener("click", function () {
      var id = h.getAttribute("data-product");
      popHotspot = h;
      openPopover(id, h);
    });
  });

  /* ---------- Cart drawer ---------- */
  var drawer = document.getElementById("cartDrawer");
  var drawerOverlay = document.getElementById("drawerOverlay");
  var drawerBody = document.getElementById("drawerBody");
  var drawerSubtotal = document.getElementById("drawerSubtotal");
  var drawerClose = document.getElementById("drawerClose");

  function renderDrawer() {
    var ids = Object.keys(cart).filter(function (id) { return cart[id] > 0; });
    if (!ids.length) {
      drawerBody.innerHTML = '<p class="drawer-empty">Your bag is empty.<br/>Add something from the collection.</p>';
      drawerSubtotal.textContent = money(0);
      return;
    }
    drawerBody.innerHTML = "";
    ids.forEach(function (id) {
      var p = PRODUCTS[id];
      var q = cart[id];
      var line = document.createElement("div");
      line.className = "line";
      var ramp = p.ramps[0];
      line.innerHTML =
        '<div class="line-art" style="background:linear-gradient(160deg,' + ramp[0] + "," + ramp[1] + ')"></div>' +
        "<div><div class=\"line-name\">" + p.name + "</div>" +
        '<div class="line-tag">' + p.tag + "</div>" +
        '<div class="qty"><button data-dec="' + id + '" aria-label="Decrease quantity">−</button>' +
        "<span>" + q + "</span>" +
        '<button data-inc="' + id + '" aria-label="Increase quantity">+</button></div></div>' +
        '<div class="line-right"><div class="line-price">' + money(p.price * q) + "</div>" +
        '<button class="line-remove" data-rm="' + id + '">Remove</button></div>';
      drawerBody.appendChild(line);
    });
    drawerSubtotal.textContent = money(cartSubtotal());
  }

  drawerBody.addEventListener("click", function (e) {
    var inc = e.target.closest("[data-inc]");
    var dec = e.target.closest("[data-dec]");
    var rm = e.target.closest("[data-rm]");
    if (inc) { cart[inc.getAttribute("data-inc")]++; updateCount(); renderDrawer(); }
    else if (dec) {
      var idd = dec.getAttribute("data-dec");
      cart[idd] = Math.max(0, cart[idd] - 1);
      if (cart[idd] === 0) delete cart[idd];
      updateCount(); renderDrawer();
    } else if (rm) {
      var idr = rm.getAttribute("data-rm");
      delete cart[idr];
      updateCount(); renderDrawer();
      toast("Removed from bag");
    }
  });

  var drawerTrigger = null;
  function openDrawer() {
    drawerTrigger = document.activeElement;
    renderDrawer();
    drawerOverlay.hidden = false;
    drawer.hidden = false;
    document.body.style.overflow = "hidden";
    drawerClose.focus();
    document.addEventListener("keydown", onDrawerKey);
  }
  function closeDrawer() {
    drawerOverlay.hidden = true;
    drawer.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onDrawerKey);
    if (drawerTrigger && drawerTrigger.focus) drawerTrigger.focus();
  }
  function onDrawerKey(e) {
    if (e.key === "Escape") closeDrawer();
    if (e.key === "Tab") trapFocus(e, drawer);
  }
  cartBtn.addEventListener("click", openDrawer);
  drawerClose.addEventListener("click", closeDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);
  document.getElementById("checkoutBtn").addEventListener("click", function () {
    if (cartItemCount() === 0) { toast("Your bag is empty"); return; }
    toast("Demo only — no real checkout. Thanks for browsing!");
  });

  /* ---------- Shop the look bundle ---------- */
  var bundleList = document.getElementById("bundleList");
  LOOK.forEach(function (id) {
    var p = PRODUCTS[id];
    var ramp = p.ramps[0];
    var li = document.createElement("li");
    li.innerHTML =
      '<span class="bundle-swatch" style="background:linear-gradient(160deg,' + ramp[0] + "," + ramp[1] + ')"></span>' +
      "<span><span class=\"bundle-li-name\">" + p.name + "</span><br/>" +
      '<span class="bundle-li-tag">' + p.tag + "</span></span>" +
      '<span class="bundle-li-price">' + money(p.price) + "</span>";
    bundleList.appendChild(li);
  });
  var lookFull = LOOK.reduce(function (s, id) { return s + PRODUCTS[id].price; }, 0);
  var lookNow = Math.round(lookFull * (1 - LOOK_DISCOUNT) * 100) / 100;
  document.getElementById("bundleWas").textContent = money(lookFull);
  document.getElementById("bundleNow").textContent = money(lookNow);
  document.getElementById("bundleSave").textContent = "Save " + money(lookFull - lookNow);

  document.getElementById("addLook").addEventListener("click", function () {
    LOOK.forEach(function (id) { addToCart(id, 1); });
    toast("The Coastline Capsule added — 3 pieces");
  });

  /* ---------- Focus trap util ---------- */
  function trapFocus(e, container) {
    var f = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    f = Array.prototype.filter.call(f, function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // init
  updateCount();
  renderDrawer();
})();
