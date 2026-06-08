/* Mortgage Calculator — Aldercrest & Vine
   Vanilla JS. Recomputes an amortized monthly payment on every input change. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var els = {
    price: $("price"),
    downAmt: $("downAmt"),
    downPct: $("downPct"),
    downRange: $("downRange"),
    downHint: $("downHint"),
    rate: $("rate"),
    term: $("term"),
    tax: $("tax"),
    ins: $("ins"),
    hoa: $("hoa"),

    photoPrice: $("photoPrice"),
    monthlyTotal: $("monthlyTotal"),
    donutCenter: $("donutCenter"),
    rowPI: $("rowPI"),
    rowTax: $("rowTax"),
    rowIns: $("rowIns"),
    rowHOA: $("rowHOA"),
    loanAmt: $("loanAmt"),
    totalInterest: $("totalInterest"),
    totalPaid: $("totalPaid"),

    reset: $("reset")
  };

  var DEFAULTS = {
    price: 845000,
    downPct: 20,
    rate: 6.45,
    term: 30,
    tax: 9200,
    ins: 1740,
    hoa: 145
  };

  var R = 52; // donut radius (matches SVG)
  var CIRC = 2 * Math.PI * R;
  var segEls = Array.prototype.slice.call(document.querySelectorAll(".donut-seg"));

  /* ---------- formatting ---------- */
  var fmt0 = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0
  });

  function money(n) {
    if (!isFinite(n) || n < 0) n = 0;
    return fmt0.format(Math.round(n));
  }

  function num(el) {
    var v = parseFloat(el.value);
    return isFinite(v) ? v : 0;
  }

  /* ---------- toast helper ---------- */
  var toastEl = $("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- core math ---------- */
  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  // Standard amortized monthly principal + interest.
  function monthlyPI(principal, annualRate, years) {
    if (principal <= 0) return 0;
    var n = years * 12;
    var r = annualRate / 100 / 12;
    if (r === 0) return principal / n;
    var f = Math.pow(1 + r, n);
    return (principal * r * f) / (f - 1);
  }

  function compute() {
    var price = clamp(num(els.price), 0, 1e9);
    var downPct = clamp(num(els.downPct), 0, 100);
    var down = price * (downPct / 100);

    var rate = clamp(num(els.rate), 0, 25);
    var years = parseInt(els.term.value, 10) || 30;
    var taxYr = Math.max(0, num(els.tax));
    var insYr = Math.max(0, num(els.ins));
    var hoaMo = Math.max(0, num(els.hoa));

    var loan = Math.max(0, price - down);
    var pi = monthlyPI(loan, rate, years);
    var taxMo = taxYr / 12;
    var insMo = insYr / 12;

    var total = pi + taxMo + insMo + hoaMo;
    var n = years * 12;
    var totalInterest = pi * n - loan;
    var totalPaid = total * n + down;

    return {
      price: price, down: down, loan: loan,
      pi: pi, taxMo: taxMo, insMo: insMo, hoaMo: hoaMo,
      total: total,
      totalInterest: Math.max(0, totalInterest),
      totalPaid: totalPaid
    };
  }

  /* ---------- donut rendering ---------- */
  function paintDonut(d) {
    var parts = [
      { el: segEls[0], v: d.pi },
      { el: segEls[1], v: d.taxMo },
      { el: segEls[2], v: d.insMo },
      { el: segEls[3], v: d.hoaMo }
    ];
    var sum = d.total || 1;
    var offset = 0;
    parts.forEach(function (p) {
      var frac = p.v / sum;
      var len = frac * CIRC;
      // tiny gap between visible segments for definition
      var gap = len > 1.5 ? 1.2 : 0;
      p.el.setAttribute("stroke-dasharray", Math.max(0, len - gap) + " " + (CIRC - Math.max(0, len - gap)));
      p.el.setAttribute("stroke-dashoffset", -offset);
      offset += len;
    });
  }

  /* ---------- render ---------- */
  function render() {
    var d = compute();

    els.photoPrice.textContent = money(d.price);
    els.monthlyTotal.textContent = money(d.total);
    els.donutCenter.textContent = money(d.total);

    els.rowPI.textContent = money(d.pi);
    els.rowTax.textContent = money(d.taxMo);
    els.rowIns.textContent = money(d.insMo);
    els.rowHOA.textContent = money(d.hoaMo);

    els.loanAmt.textContent = money(d.loan);
    els.totalInterest.textContent = money(d.totalInterest);
    els.totalPaid.textContent = money(d.totalPaid);

    paintDonut(d);
  }

  /* ---------- down-payment sync (amount <-> percent <-> slider) ---------- */
  function setDownPct(pct, source) {
    pct = clamp(pct, 0, 100);
    var price = Math.max(0, num(els.price));
    var rounded = Math.round(pct * 10) / 10;

    if (source !== "pct") els.downPct.value = rounded;
    if (source !== "range") els.downRange.value = Math.round(pct);
    if (source !== "amt") els.downAmt.value = Math.round(price * (pct / 100));

    els.downHint.textContent = rounded + "% down";
  }

  function syncFromAmount() {
    var price = Math.max(0, num(els.price));
    var amt = clamp(num(els.downAmt), 0, price);
    var pct = price > 0 ? (amt / price) * 100 : 0;
    setDownPct(pct, "amt");
    render();
  }

  function syncFromPct() {
    setDownPct(num(els.downPct), "pct");
    render();
  }

  function syncFromRange() {
    setDownPct(num(els.downRange), "range");
    render();
  }

  function syncFromPrice() {
    // keep the percentage fixed, recompute the dollar amount
    setDownPct(num(els.downPct), "price");
    render();
  }

  /* ---------- wiring ---------- */
  els.price.addEventListener("input", syncFromPrice);
  els.downAmt.addEventListener("input", syncFromAmount);
  els.downPct.addEventListener("input", syncFromPct);
  els.downRange.addEventListener("input", syncFromRange);

  [els.rate, els.term, els.tax, els.ins, els.hoa].forEach(function (el) {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  els.reset.addEventListener("click", function () {
    els.price.value = DEFAULTS.price;
    els.rate.value = DEFAULTS.rate;
    els.term.value = String(DEFAULTS.term);
    els.tax.value = DEFAULTS.tax;
    els.ins.value = DEFAULTS.ins;
    els.hoa.value = DEFAULTS.hoa;
    setDownPct(DEFAULTS.downPct, null);
    render();
    toast("Restored listing defaults");
  });

  /* ---------- init ---------- */
  setDownPct(DEFAULTS.downPct, null); // populate amount, percent and slider together
  render();
})();
