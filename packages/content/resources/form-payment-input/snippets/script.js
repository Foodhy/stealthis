/* Card / payment input group — vanilla JS demo.
   Live formatting, brand detection, Luhn check, animated card preview. */
(function () {
  "use strict";

  var form = document.getElementById("pay");
  if (!form) return;

  var numberEl = document.getElementById("cc-number");
  var nameEl = document.getElementById("cc-name");
  var expEl = document.getElementById("cc-exp");
  var cvcEl = document.getElementById("cc-cvc");
  var zipEl = document.getElementById("cc-zip");
  var submitBtn = document.getElementById("submit");

  // Preview nodes
  var cardInner = document.querySelector("[data-card-inner]");
  var pvNumber = document.querySelector("[data-pv-number]");
  var pvName = document.querySelector("[data-pv-name]");
  var pvExp = document.querySelector("[data-pv-exp]");
  var pvCvc = document.querySelector("[data-pv-cvc]");
  var brandMark = document.querySelector("[data-brand-mark]");
  var brandIcon = document.querySelector("[data-brand-icon]");

  // Done overlay
  var doneEl = document.getElementById("done");
  var doneCard = document.querySelector("[data-done-card]");
  var resetBtn = document.getElementById("reset");

  // Toast
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg, isError) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.toggle("is-error", !!isError);
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ── Brand detection by prefix ── */
  // Returns { id, label, glyph(color), gaps, lengths, cvc }
  var BRANDS = {
    visa: { label: "VISA", lengths: [16, 19], cvc: 3 },
    mastercard: { label: "Mastercard", lengths: [16], cvc: 3 },
    amex: { label: "AMEX", lengths: [15], cvc: 4 },
    discover: { label: "Discover", lengths: [16, 19], cvc: 3 },
  };

  function detectBrand(digits) {
    if (/^4/.test(digits)) return "visa";
    if (/^3[47]/.test(digits)) return "amex";
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
    if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
    return null;
  }

  // Inline SVG marks (mono / colored), no external assets.
  function brandSvg(id, light) {
    var stroke = light ? "#ffffff" : "currentColor";
    if (id === "visa") {
      return (
        '<svg viewBox="0 0 48 16" aria-hidden="true">' +
        '<text x="0" y="13" font-family="Inter, sans-serif" font-size="14" font-style="italic" ' +
        'font-weight="800" letter-spacing="0.5" fill="' +
        (light ? "#ffffff" : "#1a1f71") +
        '">VISA</text></svg>'
      );
    }
    if (id === "mastercard") {
      return (
        '<svg viewBox="0 0 40 24" aria-hidden="true">' +
        '<circle cx="15" cy="12" r="10" fill="#eb001b"/>' +
        '<circle cx="25" cy="12" r="10" fill="#f79e1b"/>' +
        '<path d="M20 4.6a10 10 0 0 0 0 14.8 10 10 0 0 0 0-14.8z" fill="#ff5f00"/></svg>'
      );
    }
    if (id === "amex") {
      return (
        '<svg viewBox="0 0 48 16" aria-hidden="true">' +
        '<rect x="0" y="1" width="48" height="14" rx="2" fill="' +
        (light ? "rgba(255,255,255,0.18)" : "#2e77bb") +
        '"/>' +
        '<text x="24" y="11.5" text-anchor="middle" font-family="Inter, sans-serif" font-size="7.5" ' +
        'font-weight="800" letter-spacing="0.5" fill="#ffffff">AMEX</text></svg>'
      );
    }
    if (id === "discover") {
      return (
        '<svg viewBox="0 0 56 16" aria-hidden="true">' +
        '<text x="0" y="13" font-family="Inter, sans-serif" font-size="11" font-weight="800" ' +
        'fill="' +
        (light ? "#ffffff" : "#101322") +
        '">DISC</text>' +
        '<circle cx="50" cy="9" r="5" fill="#f76b1c"/></svg>'
      );
    }
    // generic card glyph
    return (
      '<svg viewBox="0 0 24 18" aria-hidden="true">' +
      '<rect x="1" y="1" width="22" height="16" rx="3" fill="none" stroke="' +
      stroke +
      '" stroke-width="1.6"/>' +
      '<rect x="1" y="5" width="22" height="3" fill="' +
      stroke +
      '"/></svg>'
    );
  }

  function gapsFor(brand) {
    return brand === "amex" ? [4, 10] : [4, 8, 12, 16];
  }
  function maxDigitsFor(brand) {
    if (brand === "amex") return 15;
    var b = BRANDS[brand];
    return b ? Math.max.apply(null, b.lengths) : 16;
  }
  function cvcLenFor(brand) {
    var b = BRANDS[brand];
    return b ? b.cvc : 3;
  }

  /* ── Luhn check ── */
  function luhnValid(digits) {
    if (digits.length < 12) return false;
    var sum = 0;
    var alt = false;
    for (var i = digits.length - 1; i >= 0; i--) {
      var n = parseInt(digits.charAt(i), 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  /* ── Formatting helpers ── */
  function onlyDigits(s) {
    return (s || "").replace(/\D+/g, "");
  }

  function formatCardNumber(digits, brand) {
    var gaps = gapsFor(brand);
    var out = "";
    for (var i = 0; i < digits.length; i++) {
      if (gaps.indexOf(i) !== -1 && i !== 0) out += " ";
      out += digits.charAt(i);
    }
    return out;
  }

  function formatExpiry(digits) {
    digits = digits.slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }

  /* ── State ── */
  var state = { number: false, name: false, exp: false, cvc: false, zip: false };
  var touched = {};
  var currentBrand = null;

  function fieldEl(name) {
    return document.querySelector('.field[data-field="' + name + '"]');
  }
  function helpEl(name) {
    return document.getElementById(name + "-help");
  }
  var DEFAULT_HELP = {
    number: "Visa, Mastercard and Amex are detected automatically.",
    name: "Exactly as printed on the card.",
    exp: "Month / year.",
    cvc: "3 digits on the back.",
    zip: "5 digits, ZIP+4 accepted.",
  };

  function setState(name, input, ok, errMsg, okMsg) {
    state[name] = ok;
    var fe = fieldEl(name);
    var he = helpEl(name);
    var showError = touched[name] && !ok;
    fe.classList.toggle("is-error", showError);
    fe.classList.toggle("is-valid", ok);
    input.setAttribute("aria-invalid", showError ? "true" : "false");
    if (he) {
      if (showError) {
        he.textContent = errMsg;
        he.className = "help is-error";
        he.setAttribute("role", "alert");
      } else if (ok && okMsg) {
        he.textContent = okMsg;
        he.className = "help is-ok";
        he.removeAttribute("role");
      } else {
        he.textContent = DEFAULT_HELP[name];
        he.className = "help";
        he.removeAttribute("role");
      }
    }
    refreshSubmit();
  }

  function refreshSubmit() {
    var allOk = state.number && state.name && state.exp && state.cvc && state.zip;
    submitBtn.disabled = !allOk;
  }

  /* ── Validators ── */
  function validateNumber() {
    var digits = onlyDigits(numberEl.value);
    var brand = detectBrand(digits);
    applyBrand(brand);
    var lengths = brand && BRANDS[brand] ? BRANDS[brand].lengths : [13, 14, 15, 16, 17, 18, 19];
    var lengthOk = lengths.indexOf(digits.length) !== -1;
    var ok = lengthOk && luhnValid(digits);
    var msg;
    if (digits.length === 0) msg = "Enter the long number on the front of your card.";
    else if (!lengthOk) msg = "Card number looks incomplete.";
    else if (!luhnValid(digits)) msg = "This card number is invalid (checksum failed).";
    setState("number", numberEl, ok, msg, brand ? BRANDS[brand].label + " card recognised." : "Looks good.");
    return ok;
  }

  function validateName() {
    var v = nameEl.value.trim();
    var ok = v.length >= 2 && /^[\p{L}][\p{L} '.-]*$/u.test(v);
    var msg = v.length === 0 ? "Add the name printed on the card." : "Use letters, spaces, apostrophes or hyphens.";
    setState("name", nameEl, ok, msg);
    return ok;
  }

  function validateExp() {
    var digits = onlyDigits(expEl.value);
    var ok = false;
    var msg = "Use the MM/YY format.";
    if (digits.length === 4) {
      var mm = parseInt(digits.slice(0, 2), 10);
      var yy = parseInt(digits.slice(2), 10);
      if (mm >= 1 && mm <= 12) {
        var now = new Date();
        var curY = now.getFullYear() % 100;
        var curM = now.getMonth() + 1;
        if (yy > curY || (yy === curY && mm >= curM)) {
          ok = true;
        } else {
          msg = "That date is in the past.";
        }
      } else {
        msg = "Month must be 01-12.";
      }
    } else if (digits.length === 0) {
      msg = "Enter the expiry date.";
    }
    setState("exp", expEl, ok, msg);
    return ok;
  }

  function validateCvc() {
    var need = cvcLenFor(currentBrand);
    var digits = onlyDigits(cvcEl.value);
    var ok = digits.length === need;
    var msg = digits.length === 0 ? "Enter the security code." : "CVC must be " + need + " digits for this card.";
    setState("cvc", cvcEl, ok, msg);
    return ok;
  }

  function validateZip() {
    var v = zipEl.value.trim();
    var ok = /^\d{5}(-?\d{4})?$/.test(v);
    var msg = v.length === 0 ? "Enter your billing ZIP." : "Use 5 digits, or ZIP+4 (12345-6789).";
    setState("zip", zipEl, ok, msg);
    return ok;
  }

  /* ── Brand application (icon + preview + CVC mask) ── */
  function applyBrand(brand) {
    if (brand === currentBrand) {
      updateBrandIconState();
      return;
    }
    currentBrand = brand;
    var iconSvg = brandSvg(brand || "generic", false);
    brandIcon.innerHTML = iconSvg;
    brandMark.innerHTML = brand ? brandSvg(brand, true) : "";
    // Re-mask CVC for new brand width
    cvcEl.maxLength = brand === "amex" ? 4 : 4; // allow up to 4; validate exact
    cvcEl.placeholder = cvcLenFor(brand) === 4 ? "1234" : "123";
    var cvcHelp = helpEl("cvc");
    if (cvcHelp && !touched.cvc) {
      DEFAULT_HELP.cvc = cvcLenFor(brand) === 4 ? "4 digits on the front." : "3 digits on the back.";
      cvcHelp.textContent = DEFAULT_HELP.cvc;
    } else {
      DEFAULT_HELP.cvc = cvcLenFor(brand) === 4 ? "4 digits on the front." : "3 digits on the back.";
    }
  }

  function updateBrandIconState() {
    // keep icon color in sync with error state handled by CSS
  }

  /* ── Preview sync ── */
  function syncPreview() {
    var digits = onlyDigits(numberEl.value);
    var formatted = formatCardNumber(digits, currentBrand);
    var max = maxDigitsFor(currentBrand);
    // build masked display: typed digits then bullets to fill the brand template
    var template = currentBrand === "amex" ? "•••• •••••• •••••" : "•••• •••• •••• ••••";
    var display = formatted;
    if (formatted.length === 0) {
      display = template;
    } else {
      // pad remaining with bullets matching the group layout
      var remainingDigits = max - digits.length;
      if (remainingDigits > 0) {
        var pad = formatCardNumber(digits + Array(remainingDigits + 1).join("0"), currentBrand);
        // replace the padded zeros (after the real digits) with bullets
        var realLen = formatted.length;
        display = formatted + pad.slice(realLen).replace(/0/g, "•");
      }
    }
    pvNumber.textContent = display;
    pvName.textContent = nameEl.value.trim() ? nameEl.value.trim().toUpperCase() : "FULL NAME";
    pvExp.textContent = expEl.value ? formatExpiry(onlyDigits(expEl.value)).padEnd(5, "·").slice(0, 5) : "MM/YY";
    var cvcDigits = onlyDigits(cvcEl.value);
    pvCvc.textContent = cvcDigits ? cvcDigits.replace(/./g, "•") : "•••";
  }

  /* ── Input wiring ── */
  numberEl.addEventListener("input", function () {
    var digits = onlyDigits(numberEl.value);
    var brand = detectBrand(digits);
    var max = maxDigitsFor(brand);
    digits = digits.slice(0, max);
    var caretAtEnd = numberEl.selectionStart === numberEl.value.length;
    numberEl.value = formatCardNumber(digits, brand);
    applyBrand(brand);
    if (touched.number) validateNumber();
    else updateBrandLabelOnly(brand);
    syncPreview();
    if (caretAtEnd) {
      numberEl.selectionStart = numberEl.selectionEnd = numberEl.value.length;
    }
  });

  function updateBrandLabelOnly(brand) {
    // when not yet touched/blurred, just keep helper informative
    var he = helpEl("number");
    if (he && !touched.number) {
      he.textContent = brand
        ? BRANDS[brand].label + " detected."
        : DEFAULT_HELP.number;
    }
  }

  expEl.addEventListener("input", function () {
    expEl.value = formatExpiry(onlyDigits(expEl.value));
    if (touched.exp) validateExp();
    syncPreview();
  });

  cvcEl.addEventListener("input", function () {
    var need = cvcLenFor(currentBrand);
    cvcEl.value = onlyDigits(cvcEl.value).slice(0, need);
    if (touched.cvc) validateCvc();
    syncPreview();
  });

  nameEl.addEventListener("input", function () {
    if (touched.name) validateName();
    syncPreview();
  });

  zipEl.addEventListener("input", function () {
    if (touched.zip) validateZip();
  });

  // Validate on blur (mark touched)
  function bindBlur(el, name, fn) {
    el.addEventListener("blur", function () {
      touched[name] = true;
      fn();
    });
  }
  bindBlur(numberEl, "number", validateNumber);
  bindBlur(nameEl, "name", validateName);
  bindBlur(expEl, "exp", validateExp);
  bindBlur(cvcEl, "cvc", validateCvc);
  bindBlur(zipEl, "zip", validateZip);

  // Flip card when focusing CVC (mirrors the physical card)
  cvcEl.addEventListener("focus", function () {
    cardInner.classList.add("is-flipped");
  });
  cvcEl.addEventListener("blur", function () {
    cardInner.classList.remove("is-flipped");
  });

  /* ── Submit ── */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    // Mark all touched and validate everything
    ["number", "name", "exp", "cvc", "zip"].forEach(function (n) {
      touched[n] = true;
    });
    var results = [
      validateNumber(),
      validateName(),
      validateExp(),
      validateCvc(),
      validateZip(),
    ];
    if (results.indexOf(false) !== -1) {
      // focus first invalid
      var order = [numberEl, nameEl, expEl, cvcEl, zipEl];
      var keys = ["number", "name", "exp", "cvc", "zip"];
      for (var i = 0; i < keys.length; i++) {
        if (!state[keys[i]]) {
          order[i].focus();
          break;
        }
      }
      toast("Please fix the highlighted fields.", true);
      return;
    }

    // Simulate processing
    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");
    var label = submitBtn.querySelector(".submit__label");
    var prevLabel = label.textContent;
    label.textContent = "Processing…";

    setTimeout(function () {
      submitBtn.classList.remove("is-loading");
      label.textContent = prevLabel;
      var last4 = onlyDigits(numberEl.value).slice(-4);
      var brandLabel = currentBrand ? BRANDS[currentBrand].label : "card";
      if (doneCard) doneCard.textContent = brandLabel + " •••• " + last4;
      doneEl.hidden = false;
      var title = doneEl.querySelector(".done__title");
      if (title) title.focus();
      toast("Payment confirmed (demo).");
    }, 1100);
  });

  resetBtn.addEventListener("click", function () {
    form.reset();
    doneEl.hidden = true;
    touched = {};
    state = { number: false, name: false, exp: false, cvc: false, zip: false };
    currentBrand = null;
    ["number", "name", "exp", "cvc", "zip"].forEach(function (n) {
      var fe = fieldEl(n);
      var he = helpEl(n);
      fe.classList.remove("is-error", "is-valid");
      if (he) {
        he.textContent = DEFAULT_HELP[n];
        he.className = "help";
        he.removeAttribute("role");
      }
    });
    brandIcon.innerHTML = brandSvg("generic", false);
    brandMark.innerHTML = "";
    cardInner.classList.remove("is-flipped");
    syncPreview();
    refreshSubmit();
    numberEl.focus();
  });

  /* ── Init ── */
  brandIcon.innerHTML = brandSvg("generic", false);
  refreshSubmit();
  syncPreview();
})();
