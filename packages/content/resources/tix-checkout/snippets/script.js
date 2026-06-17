(function () {
  "use strict";

  var FEE_RATE = 0.08;
  var FACILITY = 6.0;
  var MAX_PER_TIER = 8;

  // Promo codes (clearly fictional)
  var PROMOS = {
    PULSE15: { type: "pct", value: 0.15, label: "15% off" },
    EARLYBIRD: { type: "flat", value: 40, label: "$40 off" },
    FANCLUB: { type: "pct", value: 0.1, label: "10% off" }
  };

  var state = { promo: null };

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var money = function (n) {
    return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  /* ---------- Toast ---------- */
  function toast(msg, kind) {
    var stack = $("#toastStack");
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
  }

  /* ---------- Totals ---------- */
  function lineSubtotal() {
    var sum = 0;
    $$(".line").forEach(function (line) {
      var price = parseFloat(line.dataset.price);
      var qty = parseInt(line.dataset.qty, 10);
      sum += price * qty;
    });
    return sum;
  }

  function ticketCount() {
    return $$(".line").reduce(function (acc, line) {
      return acc + parseInt(line.dataset.qty, 10);
    }, 0);
  }

  function recompute() {
    // update per-line totals + qty UI
    $$(".line").forEach(function (line) {
      var price = parseFloat(line.dataset.price);
      var qty = parseInt(line.dataset.qty, 10);
      $(".line-total", line).textContent = money(price * qty);
      $(".qnum", line).textContent = String(qty);
      var dec = $('[data-act="dec"]', line);
      var inc = $('[data-act="inc"]', line);
      if (dec) dec.disabled = qty <= 0;
      if (inc) inc.disabled = qty >= MAX_PER_TIER;
    });

    var subtotal = lineSubtotal();
    var discount = 0;
    if (state.promo) {
      var p = PROMOS[state.promo];
      discount = p.type === "pct" ? subtotal * p.value : Math.min(p.value, subtotal);
    }
    var discounted = subtotal - discount;
    var fee = discounted * FEE_RATE;
    var facility = subtotal > 0 ? FACILITY : 0;
    var grand = discounted + fee + facility;

    $("#tSubtotal").textContent = money(subtotal);
    $("#tFee").textContent = money(fee);
    $("#tFacility").textContent = money(facility);
    $("#tGrand").textContent = money(grand);
    $("#payBtnAmount").textContent = money(grand);

    var dRow = $("#discountRow");
    if (discount > 0) {
      dRow.hidden = false;
      $("#tDiscount").textContent = "−" + money(discount);
      $("#discountTag").textContent = PROMOS[state.promo].label;
    } else {
      dRow.hidden = true;
    }

    // stock badge based on GA Pit qty
    var pit = $$(".line")[0];
    var badge = $("#stockBadge");
    if (pit) {
      var left = 14 - parseInt(pit.dataset.qty, 10) + 2;
      if (parseInt(pit.dataset.qty, 10) >= MAX_PER_TIER) {
        badge.textContent = "Max " + MAX_PER_TIER + " per order at this tier";
        badge.className = "badge badge-out";
      } else {
        badge.textContent = "Only " + left + " left at this tier";
        badge.className = "badge badge-low";
      }
    }

    return { subtotal: subtotal, grand: grand, count: ticketCount() };
  }

  /* ---------- Qty buttons ---------- */
  $("#orderLines").addEventListener("click", function (e) {
    var btn = e.target.closest(".qbtn");
    if (!btn) return;
    var line = btn.closest(".line");
    var qty = parseInt(line.dataset.qty, 10);
    if (btn.dataset.act === "inc") {
      if (qty >= MAX_PER_TIER) { toast("Max " + MAX_PER_TIER + " tickets per tier", "err"); return; }
      qty++;
    } else {
      if (qty <= 0) return;
      qty--;
    }
    line.dataset.qty = qty;
    recompute();
  });

  /* ---------- Promo ---------- */
  function applyPromo() {
    var input = $("#promoInput");
    var msg = $("#promoMsg");
    var btn = $("#promoBtn");
    var code = input.value.trim().toUpperCase();
    if (!code) { msg.className = "field-error"; msg.textContent = "Enter a code first."; return; }
    if (state.promo === code) { msg.className = "field-error ok"; msg.textContent = "Already applied."; return; }
    if (PROMOS[code]) {
      state.promo = code;
      msg.className = "field-error ok";
      msg.textContent = "Code applied — " + PROMOS[code].label + "!";
      btn.textContent = "Applied ✓";
      btn.classList.add("applied");
      recompute();
      toast(PROMOS[code].label + " applied", "ok");
    } else {
      state.promo = null;
      msg.className = "field-error";
      msg.textContent = "That code isn't valid.";
      btn.textContent = "Apply";
      btn.classList.remove("applied");
      recompute();
      toast("Invalid promo code", "err");
    }
  }
  $("#promoBtn").addEventListener("click", applyPromo);
  $("#promoInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); applyPromo(); }
    var btn = $("#promoBtn");
    if (state.promo) { state.promo = null; btn.textContent = "Apply"; btn.classList.remove("applied"); $("#promoMsg").textContent = ""; recompute(); }
  });

  /* ---------- Input formatting ---------- */
  var cardInput = $('input[name="card"]');
  cardInput.addEventListener("input", function () {
    var v = this.value.replace(/\D/g, "").slice(0, 16);
    this.value = v.replace(/(.{4})/g, "$1 ").trim();
  });
  var expInput = $('input[name="exp"]');
  expInput.addEventListener("input", function () {
    var v = this.value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
    this.value = v;
  });
  $('input[name="cvc"]').addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 4);
  });

  /* ---------- Validation ---------- */
  var validators = {
    firstName: function (v) { return v.trim().length >= 1 || "Enter your first name."; },
    lastName: function (v) { return v.trim().length >= 1 || "Enter your last name."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter a valid email."; },
    phone: function (v) { return v.replace(/\D/g, "").length >= 7 || "Enter a valid mobile number."; },
    card: function (v) { return v.replace(/\s/g, "").length === 16 || "Card number must be 16 digits."; },
    exp: function (v) {
      if (!/^\d{2}\/\d{2}$/.test(v)) return "Use MM/YY.";
      var m = parseInt(v.slice(0, 2), 10);
      return (m >= 1 && m <= 12) || "Invalid month.";
    },
    cvc: function (v) { return v.length >= 3 || "CVC must be 3-4 digits."; }
  };

  function setError(name, msg) {
    var input = $('[name="' + name + '"]');
    var field = input.closest(".field");
    var err = $('.field-error[data-for="' + name + '"]');
    if (msg) {
      field.classList.add("invalid");
      if (err) err.textContent = msg;
    } else {
      field.classList.remove("invalid");
      if (err) err.textContent = "";
    }
  }

  Object.keys(validators).forEach(function (name) {
    var input = $('[name="' + name + '"]');
    input.addEventListener("blur", function () {
      var res = validators[name](input.value);
      setError(name, res === true ? null : res);
    });
    input.addEventListener("input", function () {
      if (input.closest(".field").classList.contains("invalid")) {
        var res = validators[name](input.value);
        if (res === true) setError(name, null);
      }
    });
  });

  function validateAll() {
    var ok = true;
    var firstBad = null;
    Object.keys(validators).forEach(function (name) {
      var input = $('[name="' + name + '"]');
      var res = validators[name](input.value);
      if (res !== true) { ok = false; setError(name, res); if (!firstBad) firstBad = input; }
      else setError(name, null);
    });
    var terms = $('[name="terms"]');
    if (!terms.checked) { ok = false; toast("Please accept the policy to continue", "err"); if (!firstBad) firstBad = terms; }
    if (firstBad) firstBad.focus();
    return ok;
  }

  /* ---------- Hold countdown ---------- */
  var holdSeconds = 10 * 60;
  var holdEl = $("#holdTime");
  var holdWrap = $(".hold");
  var holdTimer = setInterval(function () {
    holdSeconds--;
    if (holdSeconds < 0) {
      clearInterval(holdTimer);
      holdEl.textContent = "00:00";
      toast("Your seat hold expired — reselect to continue", "err");
      holdWrap.classList.remove("warn");
      $(".hold-label").textContent = "Hold expired";
      return;
    }
    var m = Math.floor(holdSeconds / 60);
    var s = holdSeconds % 60;
    holdEl.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    if (holdSeconds <= 60) holdWrap.classList.add("warn");
  }, 1000);

  /* ---------- Event countdown ---------- */
  var eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 66);
  function tickEvent() {
    var diff = eventDate - new Date();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var mi = Math.floor((diff % 3600000) / 60000);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    $("#cdDays").textContent = pad(d);
    $("#cdHours").textContent = pad(h);
    $("#cdMins").textContent = pad(mi);
  }
  tickEvent();
  setInterval(tickEvent, 30000);

  /* ---------- QR placeholder ---------- */
  function buildQR(seed) {
    var grid = $("#qrGrid");
    grid.innerHTML = "";
    var n = 121;
    var s = seed || 7;
    for (var i = 0; i < n; i++) {
      var cell = document.createElement("span");
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      var on = (s >> 16) % 100 < 52;
      // finder-pattern corners always on
      var r = Math.floor(i / 11), c = i % 11;
      var corner = (r < 3 && c < 3) || (r < 3 && c > 7) || (r > 7 && c < 3);
      if (!on && !corner) cell.className = "off";
      grid.appendChild(cell);
    }
  }

  /* ---------- Submit ---------- */
  $("#checkoutForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (holdSeconds <= 0) { toast("Seat hold expired", "err"); return; }
    if (!validateAll()) { toast("Please fix the highlighted fields", "err"); return; }
    var totals = recompute();
    if (totals.count === 0) { toast("Add at least one ticket", "err"); return; }

    var btn = $("#payBtn");
    btn.classList.add("loading");
    btn.disabled = true;
    $(".btn-pay-label").textContent = "Processing…";

    setTimeout(function () {
      clearInterval(holdTimer);
      var ref = "#NP-" + String(Math.floor(100000 + Math.random() * 899999));
      $("#orderRef").textContent = ref;
      $("#tsCount").textContent = totals.count + (totals.count === 1 ? " ticket" : " tickets");
      $("#tsPaid").textContent = money(totals.grand);
      $("#tsEmail").textContent = $('[name="email"]').value.trim() || "your inbox";
      buildQR(Date.now() % 1000 + 1);
      var overlay = $("#overlay");
      overlay.hidden = false;
      $("#doneBtn").focus();
      toast("Payment confirmed", "ok");
    }, 1400);
  });

  $("#doneBtn").addEventListener("click", function () {
    $("#overlay").hidden = true;
    var btn = $("#payBtn");
    btn.classList.remove("loading");
    btn.disabled = false;
    $(".btn-pay-label").textContent = "Place order";
    toast("Tickets saved to your account", "ok");
  });

  // init
  recompute();
})();
