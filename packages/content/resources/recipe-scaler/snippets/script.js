(function () {
  "use strict";

  var BASE_SERVINGS = 4;
  var MIN_SERVINGS = 1;
  var MAX_SERVINGS = 24;

  // Each ingredient: qty (base amount for BASE_SERVINGS) or qty + qtyTo for a range.
  // fixed: true  -> never scales (to taste, a pinch, a single pan...)
  // unit is appended after the formatted number.
  var INGREDIENTS = [
    { qty: 1.5, unit: "cups", name: "orzo pasta" },
    { qty: 2, unit: "tbsp", name: "olive oil" },
    { qty: 12, qtyTo: 14, unit: "oz", name: "cherry tomatoes", note: "halved" },
    { qty: 3, unit: "cloves", name: "garlic", note: "thinly sliced" },
    { qty: 0.25, unit: "tsp", name: "saffron threads" },
    { qty: 3, unit: "cups", name: "vegetable stock", note: "warm" },
    { qty: 2, unit: "tbsp", name: "unsalted butter" },
    { qty: 0.5, unit: "", name: "lemon", note: "juiced" },
    { qty: null, unit: "", name: "fresh basil", note: "to taste", fixed: true },
    { qty: null, unit: "", name: "shaved pecorino", note: "to finish", fixed: true },
    { qty: 1, unit: "", name: "wide deep skillet or saute pan", fixed: true, integer: true }
  ];

  var state = { servings: BASE_SERVINGS };

  var els = {
    list: document.getElementById("ingList"),
    mults: Array.prototype.slice.call(document.querySelectorAll(".mult")),
    count: document.getElementById("servingsCount"),
    stepUp: document.getElementById("stepUp"),
    stepDown: document.getElementById("stepDown"),
    base: document.getElementById("baseServings"),
    target: document.getElementById("targetServings"),
    multReadout: document.getElementById("multReadout"),
    reset: document.getElementById("resetBtn"),
    toast: document.getElementById("toast")
  };

  /* ---------- fraction-friendly formatting ---------- */
  var FRACTIONS = [
    { v: 0, g: "" },
    { v: 1 / 8, g: "⅛" },
    { v: 1 / 4, g: "¼" },
    { v: 1 / 3, g: "⅓" },
    { v: 3 / 8, g: "⅜" },
    { v: 1 / 2, g: "½" },
    { v: 5 / 8, g: "⅝" },
    { v: 2 / 3, g: "⅔" },
    { v: 3 / 4, g: "¾" },
    { v: 7 / 8, g: "⅞" },
    { v: 1, g: "", carry: 1 }
  ];

  function nearestFraction(frac) {
    var best = FRACTIONS[0];
    var bestDist = Infinity;
    for (var i = 0; i < FRACTIONS.length; i++) {
      var d = Math.abs(FRACTIONS[i].v - frac);
      if (d < bestDist) { bestDist = d; best = FRACTIONS[i]; }
    }
    return best;
  }

  // Format a scaled numeric quantity into a cook-friendly string.
  function formatQty(value, integer) {
    if (integer) {
      return String(Math.max(1, Math.round(value)));
    }
    // Larger amounts: round to a sensible decimal, no fractions needed.
    if (value >= 10) {
      return String(Math.round(value));
    }
    var whole = Math.floor(value);
    var frac = value - whole;
    var match = nearestFraction(frac);
    if (match.carry) { whole += 1; }
    var glyph = match.carry ? "" : match.g;

    if (whole === 0 && glyph === "") {
      // Very small amount that rounded to zero — show one decimal instead.
      var d = Math.round(value * 100) / 100;
      if (d === 0) { d = 0.01; }
      return trimDecimal(d);
    }
    if (whole === 0) { return glyph; }
    if (glyph === "") { return String(whole); }
    return whole + " " + glyph; // narrow no-break space between whole and fraction
  }

  function trimDecimal(n) {
    return String(parseFloat(n.toFixed(2)));
  }

  /* ---------- rendering ---------- */
  function buildList() {
    els.list.innerHTML = "";
    INGREDIENTS.forEach(function (ing, idx) {
      var li = document.createElement("li");
      if (ing.fixed) { li.classList.add("is-fixed"); }

      var qty = document.createElement("span");
      qty.className = "ing-qty";
      qty.dataset.idx = String(idx);

      var name = document.createElement("span");
      name.className = "ing-name";
      var html = ing.name;
      if (ing.note) { html += ' <span class="ing-note">(' + ing.note + ")</span>"; }
      name.innerHTML = html;

      li.appendChild(qty);
      li.appendChild(name);
      els.list.appendChild(li);
    });
  }

  function qtyText(ing, factor) {
    if (ing.qty == null) { return ing.fixed && !ing.note ? "" : "—"; }
    var lo = formatQty(ing.qty * factor, ing.integer);
    var unit = ing.unit ? " " + ing.unit : "";
    if (ing.qtyTo != null) {
      var hi = formatQty(ing.qtyTo * factor, ing.integer);
      return lo + "–" + hi + unit;
    }
    return lo + unit;
  }

  function render(flash) {
    var factor = state.servings / BASE_SERVINGS;
    var multStr = trimDecimal(factor);

    INGREDIENTS.forEach(function (ing, idx) {
      var el = els.list.querySelector('.ing-qty[data-idx="' + idx + '"]');
      if (!el) { return; }
      var next = ing.fixed ? qtyText(ing, 1) : qtyText(ing, factor);
      if (el.textContent !== next) {
        el.textContent = next;
        if (flash && !ing.fixed) {
          el.classList.remove("flash");
          // reflow to restart animation
          void el.offsetWidth;
          el.classList.add("flash");
        }
      }
    });

    els.count.textContent = String(state.servings);
    els.target.textContent = String(state.servings);
    els.base.textContent = String(BASE_SERVINGS);
    els.multReadout.textContent = multStr + "×";

    // sync multiplier radiogroup
    els.mults.forEach(function (btn) {
      var active = Math.abs(parseFloat(btn.dataset.mult) - factor) < 0.001;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-checked", active ? "true" : "false");
    });

    els.stepDown.disabled = state.servings <= MIN_SERVINGS;
    els.stepUp.disabled = state.servings >= MAX_SERVINGS;
  }

  function setServings(n, flash) {
    n = Math.max(MIN_SERVINGS, Math.min(MAX_SERVINGS, Math.round(n)));
    state.servings = n;
    render(flash);
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    if (!els.toast) { return; }
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 1800);
  }

  /* ---------- events ---------- */
  els.mults.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      var mult = parseFloat(btn.dataset.mult);
      setServings(BASE_SERVINGS * mult, true);
      toast("Scaled to " + state.servings + " servings (" + btn.textContent.trim() + ")");
    });
    // arrow-key navigation within the radiogroup
    btn.addEventListener("keydown", function (e) {
      var dir = 0;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { dir = 1; }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { dir = -1; }
      if (!dir) { return; }
      e.preventDefault();
      var next = (i + dir + els.mults.length) % els.mults.length;
      els.mults[next].focus();
      els.mults[next].click();
    });
  });

  els.stepUp.addEventListener("click", function () {
    setServings(state.servings + 1, true);
  });
  els.stepDown.addEventListener("click", function () {
    setServings(state.servings - 1, true);
  });

  els.reset.addEventListener("click", function () {
    setServings(BASE_SERVINGS, true);
    toast("Reset to base (" + BASE_SERVINGS + " servings)");
  });

  /* ---------- init ---------- */
  buildList();
  render(false);
})();
