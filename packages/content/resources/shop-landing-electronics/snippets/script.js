/* ============================================================
   Voltaic — Electronics store landing
   Vanilla JS: cart drawer, qty, compare selector,
   animated counters, deal countdown, email validation
   ============================================================ */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  var money = function (n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- cart state ---------- */
  var cart = []; // { id, name, price, qty }

  var cartCountEl = document.getElementById("cartCount");
  var cartItemsEl = document.getElementById("cartItems");
  var cartEmptyEl = document.getElementById("cartEmpty");
  var cartTotalEl = document.getElementById("cartTotal");
  var drawer = document.getElementById("cartDrawer");
  var overlay = document.getElementById("drawerOverlay");

  function findItem(id) {
    for (var i = 0; i < cart.length; i++) if (cart[i].id === id) return cart[i];
    return null;
  }

  function addToCart(id, name, price) {
    var item = findItem(id);
    if (item) {
      item.qty += 1;
    } else {
      cart.push({ id: id, name: name, price: Number(price), qty: 1 });
    }
    renderCart();
    bumpCount();
    toast(name + " added to cart");
  }

  function setQty(id, delta) {
    var item = findItem(id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(function (c) { return c.id !== id; });
    }
    renderCart();
    bumpCount();
  }

  function removeItem(id) {
    cart = cart.filter(function (c) { return c.id !== id; });
    renderCart();
    bumpCount();
  }

  function totalQty() {
    return cart.reduce(function (s, c) { return s + c.qty; }, 0);
  }
  function totalPrice() {
    return cart.reduce(function (s, c) { return s + c.qty * c.price; }, 0);
  }

  function bumpCount() {
    var q = totalQty();
    if (!cartCountEl) return;
    cartCountEl.textContent = String(q);
    cartCountEl.classList.toggle("show", q > 0);
  }

  function renderCart() {
    if (!cartItemsEl) return;
    // clear everything except the empty message node
    cartItemsEl.querySelectorAll(".cart-item").forEach(function (n) { n.remove(); });

    if (cart.length === 0) {
      if (cartEmptyEl) cartEmptyEl.hidden = false;
    } else {
      if (cartEmptyEl) cartEmptyEl.hidden = true;
      var frag = document.createDocumentFragment();
      cart.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML =
          '<div class="cart-item-thumb" aria-hidden="true">🎧</div>' +
          '<div class="cart-item-info">' +
            "<h4></h4>" +
            '<div class="ci-price"></div>' +
            '<div class="qty-ctl">' +
              '<button type="button" class="qty-dec" aria-label="Decrease quantity">−</button>' +
              "<span></span>" +
              '<button type="button" class="qty-inc" aria-label="Increase quantity">+</button>' +
              '<button type="button" class="ci-remove">Remove</button>' +
            "</div>" +
          "</div>" +
          '<div class="ci-line"></div>';
        row.querySelector("h4").textContent = item.name;
        row.querySelector(".ci-price").textContent = money(item.price) + " each";
        row.querySelector(".qty-ctl span").textContent = String(item.qty);
        row.querySelector(".ci-line").textContent = money(item.price * item.qty);
        row.querySelector(".qty-dec").addEventListener("click", function () { setQty(item.id, -1); });
        row.querySelector(".qty-inc").addEventListener("click", function () { setQty(item.id, 1); });
        row.querySelector(".ci-remove").addEventListener("click", function () { removeItem(item.id); });
        frag.appendChild(row);
      });
      cartItemsEl.appendChild(frag);
    }
    if (cartTotalEl) cartTotalEl.textContent = money(totalPrice());
  }

  /* ---------- drawer open/close ---------- */
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    if (overlay) overlay.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = document.getElementById("closeCart");
    if (closeBtn) closeBtn.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = "";
  }

  var cartBtn = document.getElementById("cartBtn");
  var closeCart = document.getElementById("closeCart");
  if (cartBtn) cartBtn.addEventListener("click", openDrawer);
  if (closeCart) closeCart.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  var searchBtn = document.getElementById("searchBtn");
  if (searchBtn) searchBtn.addEventListener("click", function () {
    toast("Search is demo-only — browse the deals below");
  });

  var checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) checkoutBtn.addEventListener("click", function () {
    if (cart.length === 0) { toast("Add an item first"); return; }
    toast("Checkout is illustrative only ✨");
  });

  /* ---------- add-to-cart buttons (delegated) ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".add-cart");
    if (!btn) return;
    var id = btn.getAttribute("data-id");
    var name = btn.getAttribute("data-name");
    var price = btn.getAttribute("data-price");
    addToCart(id, name, price);
    // brief confirmation state
    if (!btn.classList.contains("added")) {
      var orig = btn.textContent;
      btn.classList.add("added");
      btn.textContent = "Added ✓";
      setTimeout(function () {
        btn.classList.remove("added");
        btn.textContent = orig;
      }, 1100);
    }
  });

  /* ---------- compare selector ---------- */
  var compareCards = Array.prototype.slice.call(document.querySelectorAll(".compare-card"));
  var selectedNameEl = document.getElementById("selectedName");
  var selectedPriceEl = document.getElementById("selectedPrice");
  var compareAdd = document.getElementById("compareAdd");

  function selectCompare(card) {
    compareCards.forEach(function (c) {
      var on = c === card;
      c.setAttribute("aria-checked", on ? "true" : "false");
      var hint = c.querySelector(".select-hint");
      if (hint) hint.textContent = on ? "Selected" : "Select";
    });
    var name = card.getAttribute("data-name");
    var price = card.getAttribute("data-price");
    if (selectedNameEl) selectedNameEl.textContent = name;
    if (selectedPriceEl) selectedPriceEl.textContent = money(price);
    if (compareAdd) {
      compareAdd.setAttribute("data-id", card.getAttribute("data-id"));
      compareAdd.setAttribute("data-name", name);
      compareAdd.setAttribute("data-price", price);
    }
  }

  compareCards.forEach(function (card) {
    card.addEventListener("click", function () { selectCompare(card); });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectCompare(card);
      }
      // arrow navigation within radiogroup
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        var idx = compareCards.indexOf(card);
        var dir = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : -1;
        var next = compareCards[(idx + dir + compareCards.length) % compareCards.length];
        next.focus();
        selectCompare(next);
      }
    });
  });

  /* ---------- animated counters (IntersectionObserver) ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(eased * target);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(step);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll(".count"));
  if ("IntersectionObserver" in window && counters.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = (c.getAttribute("data-prefix") || "") + (c.getAttribute("data-target") || "") + (c.getAttribute("data-suffix") || "");
    });
  }

  /* ---------- deal countdown ---------- */
  var tH = document.getElementById("tH");
  var tM = document.getElementById("tM");
  var tS = document.getElementById("tS");
  if (tH && tM && tS) {
    // start 2h 0m 0s from now
    var remaining = 2 * 3600;
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var tick = function () {
      if (remaining < 0) remaining = 2 * 3600; // loop for demo
      var h = Math.floor(remaining / 3600);
      var m = Math.floor((remaining % 3600) / 60);
      var s = remaining % 60;
      tH.textContent = pad(h);
      tM.textContent = pad(m);
      tS.textContent = pad(s);
      remaining--;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- notify form ---------- */
  var form = document.getElementById("notifyForm");
  var emailInput = document.getElementById("ctaEmail");
  var formError = document.getElementById("formError");
  if (form && emailInput) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = emailInput.value.trim();
      if (!emailRe.test(val)) {
        emailInput.classList.add("invalid");
        if (formError) formError.hidden = false;
        emailInput.focus();
        return;
      }
      emailInput.classList.remove("invalid");
      if (formError) formError.hidden = true;
      emailInput.value = "";
      toast("You're on the list — launch updates incoming");
    });
    emailInput.addEventListener("input", function () {
      emailInput.classList.remove("invalid");
      if (formError) formError.hidden = true;
    });
  }

  // initial render
  renderCart();
  bumpCount();
})();
