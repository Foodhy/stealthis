(function () {
  "use strict";

  /* ---------- Cart data (fictional) ---------- */
  var CART = [
    { id: "p1", name: "Aurora Field Pack 32L", variant: "Slate / Regular", price: 168.0, qty: 1, emoji: "🎒", tint: "#eef1ff" },
    { id: "p2", name: "Drift Merino Crew", variant: "Moss / M", price: 64.0, qty: 2, emoji: "👕", tint: "#e7f6ee" },
    { id: "p3", name: "Trail Bottle 750ml", variant: "Ember", price: 28.0, qty: 1, emoji: "🍶", tint: "#fdecf1" }
  ];
  var TAX_RATE = 0.0825;
  var PROMO = { code: "TRAIL10", rate: 0.1 };

  var state = { step: 1, ship: 0, shipName: "Standard", shipEta: "5–7 business days", discount: 0 };

  /* ---------- Helpers ---------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = function (n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- Render cart + totals ---------- */
  function subtotal() {
    return CART.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  }

  function renderCart() {
    var list = $("#cartList");
    list.innerHTML = "";
    CART.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML =
        '<span class="cart-thumb" style="background:' + item.tint + '">' + item.emoji +
        '<span class="cart-qty">' + item.qty + '</span></span>' +
        '<span class="cart-info"><span class="cart-name">' + item.name + '</span>' +
        '<span class="cart-var">' + item.variant + '</span></span>' +
        '<span class="cart-price">' + money(item.price * item.qty) + '</span>';
      list.appendChild(li);
    });
  }

  function recalc() {
    var sub = subtotal();
    var disc = state.discount ? sub * state.discount : 0;
    var taxable = sub - disc;
    var tax = taxable * TAX_RATE;
    var total = taxable + tax + state.ship;

    $("#sumSubtotal").textContent = money(sub);
    $("#sumShipping").textContent = state.ship === 0 ? "FREE" : money(state.ship);
    $("#sumTax").textContent = money(tax);
    $("#sumTotal").textContent = money(total);
    $("#toggleTotal").textContent = money(total);
    $("#placeTotal").textContent = money(total);

    var dRow = $("#discountRow");
    if (disc > 0) {
      dRow.hidden = false;
      $("#sumDiscount").textContent = "−" + money(disc);
    } else {
      dRow.hidden = true;
    }
    return total;
  }

  /* ---------- Validation ---------- */
  function setError(id, msg) {
    var input = $("#" + id);
    var field = input.closest(".field");
    var err = $("#" + id + "-err");
    if (msg) {
      if (field) field.classList.add("invalid");
      if (err) err.textContent = msg;
      input.setAttribute("aria-invalid", "true");
    } else {
      if (field) field.classList.remove("invalid");
      if (err) err.textContent = "";
      input.removeAttribute("aria-invalid");
    }
  }

  var validators = {
    1: function () {
      var ok = true;
      var email = $("#email").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError("email", "Enter a valid email address."); ok = false; }
      else setError("email", "");
      var phone = $("#phone").value.replace(/\D/g, "");
      if (phone.length < 10) { setError("phone", "Enter a 10-digit phone number."); ok = false; }
      else setError("phone", "");
      return ok;
    },
    2: function () {
      var ok = true;
      [["first", "First name is required."], ["last", "Last name is required."], ["address", "Street address is required."], ["city", "City is required."]].forEach(function (f) {
        if (!$("#" + f[0]).value.trim()) { setError(f[0], f[1]); ok = false; } else setError(f[0], "");
      });
      if (!$("#state").value) { setError("state", "Select a state."); ok = false; } else setError("state", "");
      if (!/^\d{5}$/.test($("#zip").value.trim())) { setError("zip", "Enter a 5-digit ZIP."); ok = false; } else setError("zip", "");
      return ok;
    },
    3: function () {
      var ok = true;
      if (!$("#cardname").value.trim()) { setError("cardname", "Name on card is required."); ok = false; } else setError("cardname", "");
      var num = $("#cardnum").value.replace(/\s/g, "");
      if (num.length < 15 || !luhn(num)) { setError("cardnum", "Enter a valid card number."); ok = false; } else setError("cardnum", "");
      var exp = $("#exp").value.trim();
      if (!validExpiry(exp)) { setError("exp", "Enter a valid future expiry."); ok = false; } else setError("exp", "");
      var cvc = $("#cvc").value.trim();
      if (!/^\d{3,4}$/.test(cvc)) { setError("cvc", "3–4 digits."); ok = false; } else setError("cvc", "");
      return ok;
    },
    4: function () {
      if (!$("#terms").checked) { $("#terms-err").textContent = "Please accept the terms to continue."; return false; }
      $("#terms-err").textContent = "";
      return true;
    }
  };

  function luhn(num) {
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var d = parseInt(num.charAt(i), 10);
      if (isNaN(d)) return false;
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function validExpiry(v) {
    var m = /^(\d{2})\/(\d{2})$/.exec(v);
    if (!m) return false;
    var mm = parseInt(m[1], 10), yy = parseInt(m[2], 10);
    if (mm < 1 || mm > 12) return false;
    var now = new Date();
    var fullYear = 2000 + yy;
    var curY = now.getFullYear(), curM = now.getMonth() + 1;
    if (fullYear < curY || (fullYear === curY && mm < curM)) return false;
    return true;
  }

  /* ---------- Input formatting ---------- */
  $("#cardnum").addEventListener("input", function (e) {
    var v = e.target.value.replace(/\D/g, "").slice(0, 16);
    e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
    var prev = $("#cardNumPreview");
    prev.textContent = (v + "••••••••••••••••").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    var brand = detectBrand(v);
    $("#cardBrand").textContent = brand;
  });

  function detectBrand(v) {
    if (/^4/.test(v)) return "VISA";
    if (/^5[1-5]/.test(v) || /^2[2-7]/.test(v)) return "MASTERCARD";
    if (/^3[47]/.test(v)) return "AMEX";
    if (/^6/.test(v)) return "DISCOVER";
    return "CARD";
  }

  $("#exp").addEventListener("input", function (e) {
    var v = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
    e.target.value = v;
    $("#cardExpPreview").textContent = v || "MM/YY";
  });

  $("#cvc").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
  });

  $("#cardname").addEventListener("input", function (e) {
    $("#cardHolderPreview").textContent = (e.target.value.trim() || "YOUR NAME").toUpperCase();
  });

  $("#zip").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 5);
  });

  $("#phone").addEventListener("input", function (e) {
    var v = e.target.value.replace(/\D/g, "").slice(0, 10);
    if (v.length > 6) e.target.value = "(" + v.slice(0, 3) + ") " + v.slice(3, 6) + "-" + v.slice(6);
    else if (v.length > 3) e.target.value = "(" + v.slice(0, 3) + ") " + v.slice(3);
    else if (v.length > 0) e.target.value = "(" + v;
    else e.target.value = v;
  });

  /* ---------- Shipping radios ---------- */
  $$('input[name="ship"]').forEach(function (r) {
    r.addEventListener("change", function () {
      $$(".ship-opt").forEach(function (o) { o.classList.remove("is-selected"); });
      r.closest(".ship-opt").classList.add("is-selected");
      state.ship = parseFloat(r.dataset.price);
      state.shipName = r.closest(".ship-opt").querySelector(".ship-name").childNodes[0].textContent.trim();
      state.shipEta = r.dataset.eta;
      recalc();
    });
  });

  /* ---------- Promo ---------- */
  $("#applyPromo").addEventListener("click", function () {
    var input = $("#promo");
    var msg = $("#promoMsg");
    var code = input.value.trim().toUpperCase();
    if (!code) { msg.textContent = "Enter a code to apply."; msg.className = "promo-msg bad"; return; }
    if (code === PROMO.code) {
      state.discount = PROMO.rate;
      msg.textContent = "✓ TRAIL10 applied — 10% off your gear.";
      msg.className = "promo-msg ok";
      toast("Promo code applied");
    } else {
      state.discount = 0;
      msg.textContent = "That code isn't valid. Try TRAIL10.";
      msg.className = "promo-msg bad";
    }
    recalc();
  });

  /* ---------- Step navigation ---------- */
  var NEXT_LABEL = { 1: "Continue to shipping", 2: "Continue to payment", 3: "Review order" };

  function goto(step) {
    state.step = step;
    $$(".panel").forEach(function (p) {
      var n = parseInt(p.dataset.panel, 10);
      p.hidden = n !== step;
      p.classList.toggle("is-active", n === step);
    });
    $$(".step").forEach(function (s) {
      var n = parseInt(s.dataset.step, 10);
      s.classList.toggle("is-active", n === step);
      s.classList.toggle("is-done", n < step);
      if (n === step) s.setAttribute("aria-current", "step");
      else s.removeAttribute("aria-current");
    });

    $("#backBtn").hidden = step === 1;
    if (step === 4) {
      $("#nextBtn").hidden = true;
      $("#placeBtn").hidden = false;
      fillReview();
    } else {
      $("#nextBtn").hidden = false;
      $("#placeBtn").hidden = true;
      $("#nextBtn").textContent = NEXT_LABEL[step];
    }
    var panel = $('.panel[data-panel="' + step + '"]');
    var firstInput = panel.querySelector("input, select");
    if (firstInput) firstInput.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function fillReview() {
    $("#rv-contact").textContent = $("#email").value + "\n" + $("#phone").value;
    $("#rv-ship").textContent =
      $("#first").value + " " + $("#last").value + "\n" +
      $("#address").value + ($("#address2").value ? " " + $("#address2").value : "") + "\n" +
      $("#city").value + ", " + $("#state").value + " " + $("#zip").value;
    $("#rv-method").textContent = state.shipName + "\nArrives in " + state.shipEta + "\n" + (state.ship === 0 ? "FREE" : money(state.ship));
    var num = $("#cardnum").value.replace(/\s/g, "");
    $("#rv-pay").textContent = detectBrand(num) + " ending " + (num.slice(-4) || "····") + "\n" + ($("#cardname").value || "—");
  }

  $("#nextBtn").addEventListener("click", function () {
    var ok = validators[state.step] ? validators[state.step]() : true;
    if (!ok) {
      var firstInvalid = $('.panel[data-panel="' + state.step + '"] .invalid input, .panel[data-panel="' + state.step + '"] .invalid select');
      if (firstInvalid) firstInvalid.focus();
      toast("Please fix the highlighted fields");
      return;
    }
    if (state.step < 4) goto(state.step + 1);
  });

  $("#backBtn").addEventListener("click", function () {
    if (state.step > 1) goto(state.step - 1);
  });

  $$('[data-goto]').forEach(function (b) {
    b.addEventListener("click", function () { goto(parseInt(b.dataset.goto, 10)); });
  });

  /* Allow Enter on stepper steps that are already completed */
  $$(".step").forEach(function (s) {
    s.addEventListener("click", function () {
      var n = parseInt(s.dataset.step, 10);
      if (n < state.step) goto(n);
    });
  });

  /* ---------- Place order ---------- */
  $("#checkoutForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validators[4]()) { toast("Please accept the terms"); return; }
    var btn = $("#placeBtn");
    btn.classList.add("is-loading");
    var total = recalc();
    setTimeout(function () {
      btn.classList.remove("is-loading");
      showSuccess(total);
    }, 1400);
  });

  function showSuccess(total) {
    var order = "#NW-" + String(Math.floor(100000 + Math.random() * 899999));
    var d = new Date();
    var addDays = state.shipName === "Overnight" ? 1 : state.shipName === "Express" ? 2 : 6;
    d.setDate(d.getDate() + addDays);
    var eta = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    $("#successName").textContent = $("#first").value.trim() || "friend";
    $("#successEmail").textContent = $("#email").value.trim() || "your inbox";
    $("#successOrder").textContent = order;
    $("#successTotal").textContent = money(total);
    $("#successEta").textContent = eta;

    var ov = $("#success");
    ov.hidden = false;
    $("#successDone").focus();
  }

  $("#successDone").addEventListener("click", function () {
    $("#success").hidden = true;
    toast("Demo reset — happy trails!");
    goto(1);
    $("#checkoutForm").reset();
    state.ship = 0; state.discount = 0; state.shipName = "Standard"; state.shipEta = "5–7 business days";
    $$(".ship-opt").forEach(function (o, i) { o.classList.toggle("is-selected", i === 0); });
    $("#promoMsg").textContent = "";
    $("#cardNumPreview").textContent = "•••• •••• •••• ••••";
    $("#cardExpPreview").textContent = "MM/YY";
    $("#cardHolderPreview").textContent = "YOUR NAME";
    $("#cardBrand").textContent = "CARD";
    recalc();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("#success").hidden) $("#successDone").click();
  });

  /* ---------- Mobile summary toggle ---------- */
  $("#summaryToggle").addEventListener("click", function () {
    var sum = this.closest(".summary");
    var open = sum.classList.toggle("is-open");
    this.setAttribute("aria-expanded", String(open));
  });

  /* ---------- Init ---------- */
  renderCart();
  recalc();
  goto(1);
})();
