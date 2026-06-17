(function () {
  "use strict";

  // --- Config / state ---------------------------------------------------
  var CURRENCIES = [
    { code: "EUR", sym: "€" },
    { code: "USD", sym: "$" },
    { code: "GBP", sym: "£" }
  ];
  var BALANCE = 4820.0; // available balance in current currency units
  var MAX_INTEGER_DIGITS = 7;

  var raw = "";        // user-entered string, e.g. "12" or "12." or "12.5"
  var curIdx = 0;      // index into CURRENCIES

  // --- Elements ---------------------------------------------------------
  var el = {
    amount: document.getElementById("amount"),
    value: document.getElementById("amountValue"),
    cents: document.getElementById("amountCents"),
    curSym: document.getElementById("curSym"),
    curBtn: document.getElementById("curBtn"),
    balanceHint: document.getElementById("balanceHint"),
    balanceVal: document.getElementById("balanceVal"),
    maxBtn: document.getElementById("maxBtn"),
    chips: Array.prototype.slice.call(document.querySelectorAll(".chip")),
    keys: Array.prototype.slice.call(document.querySelectorAll(".key")),
    cta: document.getElementById("sendBtn"),
    ctaLabel: document.getElementById("ctaLabel"),
    toast: document.getElementById("toast")
  };

  // --- Helpers ----------------------------------------------------------
  var toastTimer;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.toast.classList.remove("is-on");
    }, 2400);
  }

  function sym() { return CURRENCIES[curIdx].sym; }
  function code() { return CURRENCIES[curIdx].code; }

  // Numeric value of the current input
  function numericValue() {
    var n = parseFloat(raw);
    return isNaN(n) ? 0 : n;
  }

  // Group the integer part with thousands separators
  function groupInt(intStr) {
    return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Format a number as a full currency string for hints
  function fmt(n) {
    return sym() + groupInt(Math.floor(n).toString()) + "." +
      (Math.round((n - Math.floor(n)) * 100)).toString().padStart(2, "0");
  }

  // --- Render -----------------------------------------------------------
  function render() {
    var hasDot = raw.indexOf(".") !== -1;
    var intPart = hasDot ? raw.slice(0, raw.indexOf(".")) : raw;
    var decPart = hasDot ? raw.slice(raw.indexOf(".") + 1) : "";

    if (intPart === "" || intPart === "0") {
      // show 0 but keep entered leading zero if any
      el.value.textContent = intPart === "" ? "0" : "0";
    } else {
      el.value.textContent = groupInt(intPart);
    }

    var isZero = raw === "" || numericValue() === 0;
    el.value.classList.toggle("is-zero", isZero && !hasDot);

    if (hasDot) {
      el.cents.textContent = "." + decPart;
    } else {
      el.cents.textContent = "";
    }
    el.value.setAttribute("aria-label", sym() + " " + (raw || "0"));

    // currency symbol
    el.curSym.textContent = sym();

    // balance over-limit state
    var over = numericValue() > BALANCE;
    el.balanceHint.classList.toggle("is-over", over);

    // CTA state
    var v = numericValue();
    if (v <= 0) {
      el.cta.disabled = true;
      el.ctaLabel.textContent = "Enter an amount";
    } else if (over) {
      el.cta.disabled = true;
      el.ctaLabel.textContent = "Amount exceeds balance";
    } else {
      el.cta.disabled = false;
      el.ctaLabel.textContent = "Send " + fmt(v);
    }

    // chip active sync
    el.chips.forEach(function (chip) {
      var match = parseFloat(chip.getAttribute("data-amount")) === v && v > 0;
      chip.classList.toggle("is-active", match);
    });
  }

  function flashInvalid() {
    el.amount.classList.remove("is-invalid");
    // force reflow so the animation can replay
    void el.amount.offsetWidth;
    el.amount.classList.add("is-invalid");
  }
  el.amount.addEventListener("animationend", function () {
    el.amount.classList.remove("is-invalid");
  });

  // --- Input handling ---------------------------------------------------
  function press(k) {
    if (k === "back") {
      if (raw.length === 0) { return; }
      raw = raw.slice(0, -1);
      render();
      return;
    }

    if (k === ".") {
      if (raw.indexOf(".") !== -1) { flashInvalid(); return; }
      raw = raw === "" ? "0." : raw + ".";
      render();
      return;
    }

    // digit
    var dotPos = raw.indexOf(".");
    if (dotPos !== -1) {
      // already 2 decimals -> reject
      if (raw.length - dotPos - 1 >= 2) { flashInvalid(); return; }
    } else {
      // integer length cap (ignore a single leading 0)
      var intLen = raw === "0" ? 0 : raw.length;
      if (intLen >= MAX_INTEGER_DIGITS) { flashInvalid(); return; }
      // prevent multiple leading zeros
      if (raw === "0") { raw = ""; }
    }

    raw += k;
    render();
  }

  // Keypad clicks + press feedback
  el.keys.forEach(function (btn) {
    btn.addEventListener("click", function () {
      press(btn.getAttribute("data-key"));
    });
  });

  // --- Quick chips ------------------------------------------------------
  el.chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      raw = parseFloat(chip.getAttribute("data-amount")).toString();
      render();
    });
  });

  // --- Max / balance ----------------------------------------------------
  el.maxBtn.addEventListener("click", function () {
    raw = BALANCE.toFixed(2);
    render();
    toast("Filled with full balance");
  });

  // --- Currency switch --------------------------------------------------
  el.curBtn.addEventListener("click", function () {
    curIdx = (curIdx + 1) % CURRENCIES.length;
    el.balanceVal.textContent = fmt(BALANCE);
    render();
    el.curBtn.setAttribute("aria-expanded", "false");
    toast("Currency set to " + code());
  });

  // --- Send -------------------------------------------------------------
  el.cta.addEventListener("click", function () {
    var v = numericValue();
    if (v <= 0 || v > BALANCE) { flashInvalid(); return; }
    el.ctaLabel.textContent = "Sending…";
    el.cta.disabled = true;
    setTimeout(function () {
      toast("Sent " + fmt(v) + " to Mara Reyes · pending");
      raw = "";
      render();
    }, 650);
  });

  // --- Physical keyboard ------------------------------------------------
  document.addEventListener("keydown", function (e) {
    var k = null;
    if (e.key >= "0" && e.key <= "9") { k = e.key; }
    else if (e.key === "." || e.key === ",") { k = "."; }
    else if (e.key === "Backspace") { k = "back"; }
    else if (e.key === "Enter") { el.cta.click(); return; }
    if (k === null) { return; }
    e.preventDefault();
    press(k);
    // visual feedback on the matching key
    var btn = document.querySelector('.key[data-key="' + k + '"]');
    if (btn) {
      btn.classList.add("is-press");
      setTimeout(function () { btn.classList.remove("is-press"); }, 120);
    }
  });

  // --- Init -------------------------------------------------------------
  el.balanceVal.textContent = fmt(BALANCE);
  render();
})();
