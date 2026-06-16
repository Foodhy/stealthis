(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Tiered / stepped pricing model for Northwind Cloud (API calls).
   * Each tier defines:
   *   - id, label
   *   - from / to: the usage window (calls) where this tier is the
   *     "current" tier shown to the user
   *   - base: monthly base fee for that plan
   *   - included: calls included in the base fee (no overage)
   *   - rate: $ per call charged on usage ABOVE `included`
   *   - popular: highlight flag
   * ------------------------------------------------------------------ */
  var TIERS = [
    { id: "starter",    label: "Starter",    from: 0,      to: 50000,   base: 0,    included: 50000,  rate: 0.00220, popular: false },
    { id: "pro",        label: "Pro",        from: 50000,  to: 250000,  base: 99,   included: 50000,  rate: 0.00196, popular: true  },
    { id: "scale",      label: "Scale",      from: 250000, to: 750000,  base: 399,  included: 250000, rate: 0.00150, popular: false },
    { id: "enterprise", label: "Enterprise", from: 750000, to: Infinity, base: 1200, included: 750000, rate: 0.00110, popular: false }
  ];

  var MAX = 1000000;

  /* ----- DOM ----- */
  var slider      = document.getElementById("usage");
  var usageOut    = document.getElementById("usageOut");
  var fill        = document.querySelector("[data-fill]");
  var ticksWrap   = document.querySelector("[data-ticks]");
  var priceLive   = document.getElementById("priceLive");
  var priceEl     = document.querySelector("[data-price]");
  var priceNote   = document.querySelector("[data-price-note]");
  var tierNameEls = document.querySelectorAll("[data-tier-name]");
  var popularBadge = document.getElementById("popularBadge");

  var baseLabel   = document.querySelector("[data-base-label]");
  var baseEl      = document.querySelector("[data-base]");
  var includedEl  = document.querySelector("[data-included]");
  var includedPriceEl = document.querySelector("[data-included-price]");
  var overageRow  = document.querySelector("[data-overage-row]");
  var overageDetail = document.querySelector("[data-overage-detail]");
  var overageEl   = document.querySelector("[data-overage]");
  var totalEl     = document.querySelector("[data-total]");
  var rateEl      = document.querySelector("[data-rate]");

  var tierStrip   = document.getElementById("tierStrip");
  var refCards    = document.querySelectorAll(".ref-card");
  var startBtn    = document.getElementById("startBtn");
  var toastEl     = document.getElementById("toast");

  /* ----- formatters ----- */
  var nf = new Intl.NumberFormat("en-US");
  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function moneyRound(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  function rateStr(r) {
    return "$" + r.toFixed(5);
  }

  /* ----- find the active tier for a usage value ----- */
  function tierFor(usage) {
    for (var i = 0; i < TIERS.length; i++) {
      if (usage >= TIERS[i].from && usage < TIERS[i].to) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }

  /* ----- compute price for usage within its tier ----- */
  function compute(usage) {
    var t = tierFor(usage);
    var overUnits = Math.max(0, usage - t.included);
    var overageCost = overUnits * t.rate;
    var total = t.base + overageCost;
    return {
      tier: t,
      overUnits: overUnits,
      overageCost: overageCost,
      total: total
    };
  }

  /* ----- ticks at each tier boundary ----- */
  function buildTicks() {
    var bounds = [50000, 250000, 750000];
    bounds.forEach(function (b) {
      var span = document.createElement("span");
      span.className = "slider__tick";
      span.style.left = (b / MAX) * 100 + "%";
      span.dataset.at = String(b);
      ticksWrap.appendChild(span);
    });
  }

  /* ----- toast helper ----- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    /* reflow to restart transition */
    void toastEl.offsetWidth;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
      setTimeout(function () { toastEl.hidden = true; }, 250);
    }, 2600);
  }

  /* ----- render ----- */
  var lastTierId = null;
  function render(bump) {
    var usage = parseInt(slider.value, 10) || 0;
    var pct = (usage / MAX) * 100;
    var r = compute(usage);
    var t = r.tier;

    /* slider visuals */
    fill.style.width = pct + "%";
    Array.prototype.forEach.call(ticksWrap.children, function (tick) {
      var at = parseInt(tick.dataset.at, 10);
      tick.classList.toggle("slider__tick--passed", usage >= at);
    });

    /* usage label */
    var usageLabel = usage >= MAX ? nf.format(MAX) + "+" : nf.format(usage);
    usageOut.textContent = usageLabel;

    /* price */
    priceEl.textContent = moneyRound(r.total).replace("$", "");
    priceNote.textContent = "Estimated for " + usageLabel + " monthly API calls";

    /* tier name + popular badge */
    tierNameEls.forEach(function (el) { el.textContent = t.label; });
    popularBadge.hidden = !t.popular;

    /* breakdown */
    baseLabel.textContent = t.label + " base fee";
    baseEl.textContent = money(t.base);
    includedEl.textContent = nf.format(t.included) + " calls included";
    includedPriceEl.textContent = money(0);

    if (r.overUnits > 0) {
      overageRow.hidden = false;
      overageDetail.textContent = nf.format(r.overUnits) + " × " + rateStr(t.rate);
      overageEl.textContent = money(r.overageCost);
    } else {
      overageRow.hidden = true;
    }

    totalEl.textContent = money(r.total);
    rateEl.textContent = rateStr(t.rate);

    /* tier strip + reference highlight */
    Array.prototype.forEach.call(tierStrip.children, function (li) {
      li.classList.toggle("is-active", li.dataset.tier === t.id);
    });
    refCards.forEach(function (card) {
      card.classList.toggle("is-active", card.dataset.ref === t.id);
    });

    /* ARIA on slider */
    slider.setAttribute("aria-valuenow", String(usage));
    var valueText =
      usageLabel + " monthly API calls — " +
      t.label + " plan, " + money(r.total) + " per month";
    slider.setAttribute("aria-valuetext", valueText);

    /* price bump micro-animation */
    if (bump) {
      priceLive.classList.remove("price--bump");
      void priceLive.offsetWidth;
      priceLive.classList.add("price--bump");
    }

    /* announce tier changes (debounced via lastTierId) */
    if (lastTierId !== null && lastTierId !== t.id) {
      toast("Now on the " + t.label + " tier · " + money(r.total) + "/mo");
    }
    lastTierId = t.id;
  }

  /* ----- events ----- */
  var rafPending = false;
  slider.addEventListener("input", function () {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      render(true);
    });
  });

  /* keyboard: PageUp/Pagedown jump a tier-friendly step (native), but
     add Home/End helpers + announce on change handled by render() */
  slider.addEventListener("change", function () { render(true); });

  /* clicking a reference card or tier chip snaps the slider into that
     tier's range (midpoint of the included→to window) */
  function snapToTier(id) {
    var t = TIERS.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    var hi = t.to === Infinity ? MAX : t.to;
    var mid = Math.round((t.from + hi) / 2 / 5000) * 5000;
    slider.value = String(Math.min(MAX, mid));
    render(true);
    slider.focus();
  }

  refCards.forEach(function (card) {
    card.addEventListener("click", function () { snapToTier(card.dataset.ref); });
  });
  Array.prototype.forEach.call(tierStrip.children, function (li) {
    li.style.cursor = "pointer";
    li.setAttribute("role", "button");
    li.setAttribute("tabindex", "0");
    li.addEventListener("click", function () { snapToTier(li.dataset.tier); });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        snapToTier(li.dataset.tier);
      }
    });
  });

  startBtn.addEventListener("click", function () {
    var usage = parseInt(slider.value, 10) || 0;
    var r = compute(usage);
    toast(
      "Trial started on " + r.tier.label + " — est. " +
      money(r.total) + "/mo for " + nf.format(usage) + " calls"
    );
  });

  /* ----- init ----- */
  buildTicks();
  render(false);
})();
