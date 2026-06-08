(function () {
  "use strict";

  /* ---------------- DATA ---------------- */
  var CATALOG = {
    services: [
      { id: "s1", name: "Signature Cut & Style", price: 95, tag: "Hair", desc: "Consultation, cut, blow-dry finish." },
      { id: "s2", name: "Lumière Balayage", price: 220, tag: "Color", desc: "Hand-painted, freehand highlights." },
      { id: "s3", name: "Gloss & Tone", price: 65, tag: "Color", desc: "Shine-boosting demi-permanent glaze." },
      { id: "s4", name: "Keratin Smoothing", price: 180, tag: "Treatment", desc: "Frizz-taming, 12-week result." },
      { id: "s5", name: "Bridal Updo", price: 140, tag: "Styling", desc: "Pinned, lacquered, photo-ready." },
      { id: "s6", name: "Scalp Ritual Facial", price: 78, tag: "Spa", desc: "Detox massage & serum infusion." },
      { id: "s7", name: "Gel Manicure", price: 52, tag: "Nails", desc: "Shaped, cuticle care, gel polish." },
      { id: "s8", name: "Brow Architecture", price: 38, tag: "Brows", desc: "Map, wax, tint & set." }
    ],
    retail: [
      { id: "r1", name: "Ritual Repair Mask", price: 46, tag: "Hair", desc: "Bond-building weekly treatment." },
      { id: "r2", name: "Argan Gloss Oil", price: 34, tag: "Hair", desc: "Weightless finishing shine." },
      { id: "r3", name: "Velvet Hold Spray", price: 28, tag: "Styling", desc: "Flexible, brushable hold." },
      { id: "r4", name: "Rose Quartz Comb", price: 22, tag: "Tools", desc: "Static-free wide-tooth comb." },
      { id: "r5", name: "Cuticle Elixir", price: 19, tag: "Nails", desc: "Nourishing nail & cuticle oil." },
      { id: "r6", name: "Silk Pillow Wrap", price: 58, tag: "Home", desc: "Mulberry silk, frizz-saving." }
    ]
  };

  var PROMOS = {
    LUMIERE10: { type: "pct", value: 0.1, label: "10% off" },
    WELCOME20: { type: "pct", value: 0.2, label: "20% off" },
    ROSE15: { type: "flat", value: 15, label: "$15 off" }
  };

  var TAX_RATE = 0.085;

  /* ---------------- STATE ---------------- */
  var state = {
    tab: "services",
    query: "",
    cart: {}, // id -> { item, qty }
    tipMode: "pct", // "pct" | "custom"
    tipPct: 18,
    tipCustom: 0,
    promo: null, // { code, ...promoDef }
    pay: "card",
    tendered: 0
  };

  /* ---------------- HELPERS ---------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function money(n) {
    var neg = n < 0;
    var v = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (neg ? "−$" : "$") + v;
  }

  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-show"); }, 2600);
  }

  function findItem(id) {
    var all = CATALOG.services.concat(CATALOG.retail);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  /* ---------------- RENDER GRID ---------------- */
  function renderGrid() {
    var grid = $("#grid");
    var q = state.query.trim().toLowerCase();
    var list = CATALOG[state.tab].filter(function (it) {
      if (!q) return true;
      return (it.name + " " + it.tag + " " + it.desc).toLowerCase().indexOf(q) !== -1;
    });

    $("#gridEmpty").hidden = list.length !== 0;

    grid.innerHTML = list.map(function (it) {
      var inCart = state.cart[it.id];
      return (
        '<button class="item' + (inCart ? " is-in" : "") + '" type="button" data-id="' + it.id + '" aria-label="Add ' + it.name + ', ' + money(it.price) + '">' +
        '<span class="item__inCart" aria-hidden="true">' + (inCart ? inCart.qty : "") + "</span>" +
        '<span class="item__top">' +
        '<span class="item__name">' + it.name + "</span>" +
        '<span class="item__price">' + money(it.price) + "</span>" +
        "</span>" +
        '<span class="item__desc">' + it.desc + "</span>" +
        '<span class="item__tag">' + it.tag + "</span>" +
        "</button>"
      );
    }).join("");
  }

  /* ---------------- CART OPS ---------------- */
  function addToCart(id) {
    var item = findItem(id);
    if (!item) return;
    if (state.cart[id]) state.cart[id].qty += 1;
    else state.cart[id] = { item: item, qty: 1 };
    renderCart();
    renderGrid();
    flashItem(id);
  }

  function setQty(id, delta) {
    var entry = state.cart[id];
    if (!entry) return;
    entry.qty += delta;
    if (entry.qty <= 0) delete state.cart[id];
    renderCart();
    renderGrid();
  }

  function removeFromCart(id) {
    delete state.cart[id];
    renderCart();
    renderGrid();
  }

  function flashItem(id) {
    var el = $('.item[data-id="' + id + '"]');
    if (!el) return;
    el.classList.remove("is-flash");
    void el.offsetWidth;
    el.classList.add("is-flash");
  }

  /* ---------------- TOTALS ---------------- */
  function calc() {
    var subtotal = 0;
    Object.keys(state.cart).forEach(function (id) {
      var e = state.cart[id];
      subtotal += e.item.price * e.qty;
    });

    var discount = 0;
    if (state.promo) {
      discount = state.promo.type === "pct" ? subtotal * state.promo.value : Math.min(state.promo.value, subtotal);
    }

    var taxable = Math.max(0, subtotal - discount);

    var tip = 0;
    if (state.tipMode === "custom") tip = state.tipCustom;
    else tip = taxable * (state.tipPct / 100);

    var tax = taxable * TAX_RATE;
    var grand = taxable + tax + tip;

    return {
      subtotal: subtotal,
      discount: discount,
      tip: tip,
      tax: tax,
      grand: grand
    };
  }

  /* ---------------- RENDER CART ---------------- */
  function renderCart() {
    var cartEl = $("#cart");
    var ids = Object.keys(state.cart);
    var empty = ids.length === 0;

    $("#cartEmpty").hidden = !empty;
    $("#tillBody").hidden = empty;

    cartEl.innerHTML = ids.map(function (id) {
      var e = state.cart[id];
      var lineTotal = e.item.price * e.qty;
      return (
        '<li class="line">' +
        '<span class="line__name">' + e.item.name + "</span>" +
        '<span class="line__total">' + money(lineTotal) + "</span>" +
        '<span class="line__unit">' + money(e.item.price) + " each</span>" +
        '<span></span>' +
        '<span class="line__ctrl">' +
        '<span class="stepper">' +
        '<button type="button" data-act="dec" data-id="' + id + '" aria-label="Decrease quantity of ' + e.item.name + '">−</button>' +
        '<span class="stepper__qty" aria-live="polite">' + e.qty + "</span>" +
        '<button type="button" data-act="inc" data-id="' + id + '" aria-label="Increase quantity of ' + e.item.name + '">+</button>' +
        "</span>" +
        '<button class="line__remove" type="button" data-act="rm" data-id="' + id + '">Remove</button>' +
        "</span>" +
        "</li>"
      );
    }).join("");

    renderTotals();
  }

  function renderTotals() {
    var t = calc();
    $("#subtotal").textContent = money(t.subtotal);

    var discRow = $("#discRow");
    if (t.discount > 0) {
      discRow.hidden = false;
      $("#discount").textContent = money(-t.discount);
      $("#discLabel").textContent = state.promo ? "· " + state.promo.code : "";
    } else {
      discRow.hidden = true;
    }

    $("#tax").textContent = money(t.tax);
    $("#tipLine").textContent = money(t.tip);
    $("#tipAmt").textContent = money(t.tip);
    $("#grand").textContent = money(t.grand);
    $("#chargeAmt").textContent = money(t.grand);

    var charge = $("#charge");
    charge.disabled = t.grand <= 0;
  }

  /* ---------------- TIP ---------------- */
  function setTipPct(pct) {
    state.tipMode = "pct";
    state.tipPct = pct;
    state.tipCustom = 0;
    $("#tipCustom").value = "";
    $all(".tip__chip").forEach(function (c) {
      var on = Number(c.dataset.tip) === pct;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    renderTotals();
  }

  function setTipCustom(val) {
    var n = parseFloat(val);
    state.tipMode = "custom";
    state.tipCustom = isNaN(n) || n < 0 ? 0 : n;
    $all(".tip__chip").forEach(function (c) {
      c.classList.remove("is-active");
      c.setAttribute("aria-pressed", "false");
    });
    renderTotals();
  }

  /* ---------------- PROMO ---------------- */
  function applyPromo() {
    var input = $("#promo");
    var msg = $("#promoMsg");
    var code = input.value.trim().toUpperCase();
    msg.className = "promo__msg";

    if (!code) {
      msg.textContent = "Enter a promo code to apply.";
      msg.classList.add("is-err");
      return;
    }
    if (state.promo && state.promo.code === code) {
      msg.textContent = "That code is already applied.";
      msg.classList.add("is-ok");
      return;
    }
    var def = PROMOS[code];
    if (!def) {
      state.promo = null;
      msg.textContent = "Code “" + code + "” is not valid.";
      msg.classList.add("is-err");
      renderTotals();
      return;
    }
    state.promo = { code: code, type: def.type, value: def.value, label: def.label };
    msg.textContent = def.label + " applied.";
    msg.classList.add("is-ok");
    renderTotals();
    toast(def.label + " applied");
  }

  /* ---------------- PAYMENT ---------------- */
  function setPay(method) {
    state.pay = method;
    $all(".pay__chip").forEach(function (c) {
      var on = c.dataset.pay === method;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    $("#cashPanel").hidden = method !== "cash";
  }

  /* ---------------- CHARGE ---------------- */
  function charge() {
    var t = calc();
    if (t.grand <= 0) return;

    if (state.pay === "cash") {
      var tendered = parseFloat($("#tendered").value);
      if (isNaN(tendered) || tendered < t.grand) {
        toast("Cash tendered must cover " + money(t.grand));
        $("#tendered").focus();
        return;
      }
    }

    var btn = $("#charge");
    btn.classList.add("is-loading");
    btn.disabled = true;

    setTimeout(function () {
      btn.classList.remove("is-loading");
      showSuccess(t);
    }, 750);
  }

  function showSuccess(t) {
    var methodLabel = { card: "Visa •••• 4471", cash: "Cash", gift: "Gift card •••• 8820" }[state.pay];
    $("#paidTitle").textContent = money(t.grand);
    $("#paidMethod").textContent = "Paid with " + methodLabel + " · Ticket #ML-2048";

    var changeWrap = $("#paidChange");
    if (state.pay === "cash") {
      var tendered = parseFloat($("#tendered").value) || 0;
      $("#changeDue").textContent = money(tendered - t.grand);
      changeWrap.hidden = false;
    } else {
      changeWrap.hidden = true;
    }

    $("#paid").hidden = false;
    toast("Payment approved · " + money(t.grand));
  }

  function newSale() {
    state.cart = {};
    state.promo = null;
    state.tendered = 0;
    $("#promo").value = "";
    $("#promoMsg").textContent = "";
    $("#promoMsg").className = "promo__msg";
    $("#tendered").value = "";
    setTipPct(18);
    setPay("card");
    $("#paid").hidden = true;
    $("#charge").disabled = false;
    renderCart();
    renderGrid();
    toast("Ready for the next guest");
  }

  /* ---------------- EVENTS ---------------- */
  function bind() {
    // tabs
    $all(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        state.tab = tab.dataset.tab;
        $all(".tab").forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", String(on));
        });
        $("#grid").setAttribute("aria-labelledby", tab.id);
        renderGrid();
      });
    });

    // search
    $("#search").addEventListener("input", function (e) {
      state.query = e.target.value;
      renderGrid();
    });

    // grid delegation
    $("#grid").addEventListener("click", function (e) {
      var card = e.target.closest(".item");
      if (card) addToCart(card.dataset.id);
    });

    // cart delegation
    $("#cart").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) return;
      var id = btn.dataset.id;
      if (btn.dataset.act === "inc") setQty(id, 1);
      else if (btn.dataset.act === "dec") setQty(id, -1);
      else if (btn.dataset.act === "rm") removeFromCart(id);
    });

    // tip presets
    $all(".tip__chip").forEach(function (chip) {
      chip.addEventListener("click", function () { setTipPct(Number(chip.dataset.tip)); });
    });
    $("#tipCustom").addEventListener("input", function (e) { setTipCustom(e.target.value); });

    // promo
    $("#applyPromo").addEventListener("click", applyPromo);
    $("#promo").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); applyPromo(); }
    });

    // payment chips
    $all(".pay__chip").forEach(function (chip) {
      chip.addEventListener("click", function () { setPay(chip.dataset.pay); });
    });

    // cash quick
    $all(".btn-quick").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = calc();
        var val = b.dataset.cash === "exact" ? t.grand : Number(b.dataset.cash);
        $("#tendered").value = val.toFixed(2);
        $("#tendered").focus();
      });
    });

    // charge + new sale
    $("#charge").addEventListener("click", charge);
    $("#newSale").addEventListener("click", newSale);

    // close overlay on backdrop / escape
    $("#paid").addEventListener("click", function (e) {
      if (e.target === $("#paid")) newSale();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$("#paid").hidden) newSale();
    });
  }

  /* ---------------- INIT ---------------- */
  function init() {
    bind();
    setTipPct(18);
    setPay("card");
    renderGrid();
    renderCart();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
