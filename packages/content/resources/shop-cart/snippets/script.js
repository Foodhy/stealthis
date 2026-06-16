(function () {
  "use strict";

  /* ---------- config ---------- */
  var TAX_RATE = 0.0825;          // 8.25% estimated tax
  var SHIP_FLAT = 6.95;           // standard shipping
  var FREE_SHIP_THRESHOLD = 75;   // free shipping over this subtotal

  var PROMOS = {
    SAVE15:   { kind: "percent", value: 0.15, label: "15% off" },
    FREESHIP: { kind: "freeship", value: 0,    label: "Free shipping" }
  };

  /* ---------- product silhouette art (inline SVG, no images) ---------- */
  function art(kind, c1, c2) {
    var shapes = {
      headphones:
        '<path d="M5 13a7 7 0 0 1 14 0" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>' +
        '<rect x="3.5" y="12.5" width="3.6" height="6.5" rx="1.6" fill="#fff"/>' +
        '<rect x="16.9" y="12.5" width="3.6" height="6.5" rx="1.6" fill="#fff"/>',
      speaker:
        '<rect x="7.5" y="3.5" width="9" height="17" rx="3" fill="none" stroke="#fff" stroke-width="1.8"/>' +
        '<circle cx="12" cy="14" r="3" fill="#fff"/>' +
        '<circle cx="12" cy="7.5" r="1.1" fill="#fff"/>',
      watch:
        '<rect x="8" y="8" width="8" height="8" rx="2.4" fill="#fff"/>' +
        '<path d="M9.5 8l.6-3h3.8l.6 3M9.5 16l.6 3h3.8l.6-3" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>',
      lamp:
        '<path d="M12 4l5 7H7l5-7z" fill="#fff"/>' +
        '<rect x="11.2" y="11" width="1.6" height="7" fill="#fff"/>' +
        '<rect x="8.5" y="18" width="7" height="1.8" rx=".9" fill="#fff"/>'
    };
    return (
      '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">' +
      (shapes[kind] || shapes.speaker) +
      "</svg>"
    );
  }

  /* ---------- state ---------- */
  var cart = [
    { id: "p1", name: "Aero Wireless Headphones", variant: "Midnight · Over-ear", price: 189.00, was: 219.00, qty: 1, stock: 12, art: "headphones", g1: "#3457ff", g2: "#7b5bff" },
    { id: "p2", name: "Pebble Portable Speaker",  variant: "Sage · 12h battery",  price: 64.50,  was: null,   qty: 2, stock: 3,  art: "speaker",    g1: "#1f9d55", g2: "#36c97c" },
    { id: "p3", name: "Lumen Desk Lamp",          variant: "Warm white · USB-C",  price: 42.00,  was: 52.00,  qty: 1, stock: 24, art: "lamp",       g1: "#e0245e", g2: "#ff6f91" }
  ];

  var promo = null; // { code, kind, value, label }
  var undoStash = null;
  var undoTimer = null;
  var toastTimer = null;

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }

  function compute() {
    var subtotal = cart.reduce(function (s, it) { return s + it.price * it.qty; }, 0);
    var discount = 0;
    var freeShipPromo = false;

    if (promo) {
      if (promo.kind === "percent") discount = subtotal * promo.value;
      else if (promo.kind === "freeship") freeShipPromo = true;
    }

    var taxedBase = Math.max(0, subtotal - discount);
    var qualifiesFree = subtotal >= FREE_SHIP_THRESHOLD || freeShipPromo;
    var shipping = cart.length === 0 ? 0 : (qualifiesFree ? 0 : SHIP_FLAT);
    var tax = taxedBase * TAX_RATE;
    var total = taxedBase + shipping + tax;

    return {
      subtotal: subtotal,
      discount: discount,
      shipping: shipping,
      tax: tax,
      total: total,
      qualifiesFree: qualifiesFree,
      freeShipPromo: freeShipPromo
    };
  }

  /* ---------- render line items ---------- */
  function renderItems() {
    var list = $("list");
    var empty = $("empty");

    if (cart.length === 0) {
      list.innerHTML = "";
      empty.hidden = false;
      $("shipBanner").hidden = true;
      return;
    }
    empty.hidden = true;
    $("shipBanner").hidden = false;

    list.innerHTML = cart.map(function (it) {
      var line = it.price * it.qty;
      var lowStock = it.stock <= 5;
      var stockTxt = lowStock ? ("Only " + it.stock + " left") : "In stock";
      var was = it.was
        ? '<span class="item__was">' + money(it.was * it.qty) + "</span>"
        : "";

      return (
        '<li class="item" data-id="' + it.id + '">' +
          '<span class="thumb" style="background:linear-gradient(135deg,' + it.g1 + ',' + it.g2 + ')">' +
            art(it.art) +
          "</span>" +
          '<div class="item__main">' +
            '<span class="item__title">' + it.name + "</span>" +
            '<span class="item__variant">' + it.variant + "</span>" +
            '<span class="item__stock' + (lowStock ? " is-low" : "") + '">' + stockTxt + "</span>" +
            '<div class="item__controls">' +
              '<div class="stepper" role="group" aria-label="Quantity for ' + it.name + '">' +
                '<button type="button" class="dec" data-id="' + it.id + '" aria-label="Decrease quantity"' +
                  (it.qty <= 1 ? " disabled" : "") + ">&minus;</button>" +
                '<output aria-live="polite">' + it.qty + "</output>" +
                '<button type="button" class="inc" data-id="' + it.id + '" aria-label="Increase quantity"' +
                  (it.qty >= it.stock ? " disabled" : "") + ">&plus;</button>" +
              "</div>" +
              '<button type="button" class="link-btn rm" data-id="' + it.id + '">Remove</button>' +
            "</div>" +
          "</div>" +
          '<div class="item__price">' +
            '<span class="item__line">' + money(line) + "</span>" +
            was +
            '<span class="item__unit">' + money(it.price) + " each</span>" +
          "</div>" +
        "</li>"
      );
    }).join("");
  }

  /* ---------- render totals + ship bar ---------- */
  function renderSummary() {
    var t = compute();
    var count = cart.reduce(function (s, it) { return s + it.qty; }, 0);

    $("navCount").textContent = count;
    $("headCount").textContent = plural(count, "item");

    $("subtotal").textContent = money(t.subtotal);
    $("shipping").textContent = (cart.length && t.shipping === 0) ? "Free" : money(t.shipping);
    $("tax").textContent = money(t.tax);
    $("total").textContent = money(t.total);
    $("ctaTotal").textContent = money(t.total);

    var dRow = $("discountRow");
    if (t.discount > 0) {
      dRow.hidden = false;
      $("discount").textContent = "−" + money(t.discount);
      $("discountTag").textContent = promo ? promo.code : "";
    } else {
      dRow.hidden = true;
    }

    // free-shipping progress bar
    var banner = $("shipBanner");
    var fill = $("shipFill");
    var msg = $("shipMsg");
    var truck = $("shipTruck");
    var pct, remaining;

    if (t.freeShipPromo) {
      pct = 100;
      msg.innerHTML = "Promo applied — <strong>free shipping</strong> unlocked 🎉";
    } else if (t.subtotal >= FREE_SHIP_THRESHOLD) {
      pct = 100;
      msg.innerHTML = "You've unlocked <strong>free shipping</strong> 🎉";
    } else {
      remaining = FREE_SHIP_THRESHOLD - t.subtotal;
      pct = Math.min(100, (t.subtotal / FREE_SHIP_THRESHOLD) * 100);
      msg.innerHTML = "Add <strong>" + money(remaining) + "</strong> more for <strong>free shipping</strong>";
    }

    fill.style.width = pct + "%";
    banner.classList.toggle("is-free", pct >= 100);
    truck.classList.toggle("is-on", pct >= 100);
    banner.querySelector(".ship__track").setAttribute("aria-valuenow", Math.round(pct));

    $("checkout").disabled = cart.length === 0;
  }

  function renderAll() {
    renderItems();
    renderSummary();
  }

  /* ---------- toast ---------- */
  function toast(msg, withUndo) {
    var el = $("toast");
    $("toastMsg").textContent = msg;
    $("toastBtn").hidden = !withUndo;
    el.hidden = false;
    // force reflow so transition runs
    void el.offsetWidth;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, withUndo ? 5000 : 2600);
  }
  function hideToast() {
    var el = $("toast");
    el.classList.remove("is-show");
    setTimeout(function () { el.hidden = true; }, 220);
  }

  /* ---------- quantity ---------- */
  function changeQty(id, delta) {
    var it = cart.find(function (x) { return x.id === id; });
    if (!it) return;
    var next = it.qty + delta;
    if (next < 1 || next > it.stock) return;
    it.qty = next;
    renderAll();
  }

  /* ---------- remove + undo ---------- */
  function removeItem(id) {
    var li = document.querySelector('.item[data-id="' + id + '"]');
    var idx = cart.findIndex(function (x) { return x.id === id; });
    if (idx < 0) return;

    undoStash = { item: cart[idx], index: idx };

    function commit() {
      cart.splice(idx, 1);
      renderAll();
      toast('"' + undoStash.item.name + '" removed', true);
      clearTimeout(undoTimer);
      undoTimer = setTimeout(function () { undoStash = null; }, 5000);
    }

    if (li) {
      li.classList.add("is-removing");
      li.addEventListener("animationend", commit, { once: true });
    } else {
      commit();
    }
  }

  function undoRemove() {
    if (!undoStash) return;
    var idx = Math.min(undoStash.index, cart.length);
    cart.splice(idx, 0, undoStash.item);
    undoStash = null;
    clearTimeout(undoTimer);
    renderAll();
    hideToast();
  }

  /* ---------- promo ---------- */
  function applyPromo(raw) {
    var code = (raw || "").trim().toUpperCase();
    var msg = $("promoMsg");
    msg.className = "promo__msg";

    if (!code) {
      msg.textContent = "Enter a promo code.";
      msg.classList.add("is-err");
      return;
    }
    if (promo && promo.code === code) {
      msg.textContent = code + " is already applied.";
      msg.classList.add("is-ok");
      return;
    }
    var found = PROMOS[code];
    if (!found) {
      msg.textContent = "“" + code + "” isn't a valid code.";
      msg.classList.add("is-err");
      return;
    }
    promo = { code: code, kind: found.kind, value: found.value, label: found.label };
    msg.textContent = "✓ " + found.label + " applied!";
    msg.classList.add("is-ok");
    renderSummary();
    toast(found.label + " applied", false);
  }

  /* ---------- events ---------- */
  function bind() {
    // delegated clicks inside the items list
    $("list").addEventListener("click", function (e) {
      var inc = e.target.closest(".inc");
      var dec = e.target.closest(".dec");
      var rm = e.target.closest(".rm");
      if (inc) changeQty(inc.dataset.id, +1);
      else if (dec) changeQty(dec.dataset.id, -1);
      else if (rm) removeItem(rm.dataset.id);
    });

    // promo form
    $("promoForm").addEventListener("submit", function (e) {
      e.preventDefault();
      applyPromo($("promo").value);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (chip) {
      chip.addEventListener("click", function () {
        $("promo").value = chip.dataset.fill;
        applyPromo(chip.dataset.fill);
      });
    });

    // toast undo
    $("toastBtn").addEventListener("click", undoRemove);

    // checkout (simulated)
    $("checkout").addEventListener("click", function () {
      var btn = this;
      if (btn.disabled) return;
      btn.classList.add("is-loading");
      btn.querySelector("span").textContent = "Processing…";
      setTimeout(function () {
        btn.classList.remove("is-loading");
        btn.querySelector("span").textContent = "Secure checkout";
        toast("Demo only — no real checkout 🔒", false);
      }, 1200);
    });

    // empty-state browse → reset demo cart
    $("browse").addEventListener("click", function () {
      location.reload();
    });
  }

  /* ---------- init ---------- */
  renderAll();
  bind();
})();
