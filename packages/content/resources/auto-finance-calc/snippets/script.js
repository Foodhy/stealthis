(function () {
  "use strict";

  var DEFAULTS = { price: 42850, down: 9000, trade: 6500, apr: 6.4, term: 72, residual: 58 };
  var TAX_RATE = 0.0825;     // sales tax on the financed/cap-cost basis
  var LEASE_FEES = 895;      // acquisition + doc fees rolled into a lease
  var mode = "finance";
  var locked = false;

  var $ = function (id) { return document.getElementById(id); };

  var els = {
    price: $("price"), priceR: $("price-r"),
    down: $("down"), downR: $("down-r"), downPct: $("down-pct"),
    trade: $("trade"), tradeR: $("trade-r"),
    aprR: $("apr-r"), aprTag: $("apr-tag"),
    termR: $("term-r"), termTag: $("term-tag"),
    residualR: $("residual-r"), residualPct: $("residual-pct"),
    monthly: $("monthly"), payoutSub: $("payout-sub"),
    dealLabel: $("deal-label"), dealDot: $("deal-dot"),
    segP: $("seg-principal"), segI: $("seg-interest"),
    lgPrincipal: $("lg-principal"), lgInterest: $("lg-interest"), lgRent: $("lg-rent"),
    bFinanced: $("b-financed"), bTotal: $("b-total"), bInterest: $("b-interest"),
    bSigning: $("b-signing"), bCredit: $("b-credit"),
    spAff: $("sp-affordable"), spAffVal: $("sp-aff-val"),
    apply: $("apply"), reset: $("reset"),
    toast: $("toast")
  };

  // ---------- helpers ----------
  function money(n) {
    n = Math.max(0, Math.round(n));
    return "$" + n.toLocaleString("en-US");
  }
  function money2(n) {
    return "$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function num(el) { var v = parseFloat(el.value); return isFinite(v) ? v : 0; }

  var toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove("show"); }, 2600);
  }

  // ---------- core math ----------
  function compute() {
    var price = num(els.price);
    var down = Math.min(num(els.down), price);
    var trade = num(els.trade);
    var apr = num(els.aprR);
    var term = num(els.termR);
    var residualPct = num(els.residualR);

    var out;
    if (mode === "finance") {
      // Sales tax applied to price minus trade-in credit.
      var taxable = Math.max(0, price - trade);
      var tax = taxable * TAX_RATE;
      var financed = Math.max(0, price + tax - down - trade);
      var r = apr / 100 / 12;
      var monthly = term > 0
        ? (r > 0 ? financed * r / (1 - Math.pow(1 + r, -term)) : financed / term)
        : 0;
      var totalPayments = monthly * term;
      var interest = Math.max(0, totalPayments - financed);
      out = {
        monthly: monthly,
        financed: financed,
        total: totalPayments,
        interest: interest,
        signing: down,
        credit: interest,
        principalShare: totalPayments > 0 ? financed / totalPayments : 1,
        rentLabel: false
      };
    } else {
      // Lease: payment = depreciation + rent charge, on a capitalized cost.
      var residual = price * (residualPct / 100);
      var capCost = Math.max(residual, price - down - trade + LEASE_FEES);
      var depreciation = (capCost - residual) / term;
      var mf = (apr / 100) / 24;                 // money factor from APR
      var rent = (capCost + residual) * mf;
      var monthlyL = depreciation + rent;
      var totalL = monthlyL * term + down;
      var rentTotal = rent * term + LEASE_FEES;
      out = {
        monthly: monthlyL,
        financed: capCost,
        total: totalL,
        interest: rentTotal,
        signing: down + monthlyL,              // first payment + down at signing
        credit: rentTotal,
        principalShare: monthlyL > 0 ? depreciation / monthlyL : 0.7,
        rentLabel: true,
        residual: residual
      };
    }
    return { o: out, price: price, down: down, apr: apr, term: term, residualPct: residualPct };
  }

  function render() {
    var c = compute();
    var o = c.o;

    // headline
    els.monthly.textContent = Math.round(o.monthly).toLocaleString("en-US");
    els.payoutSub.textContent = mode === "finance"
      ? "over " + c.term + " months · " + c.apr.toFixed(2) + "% APR"
      : "over " + c.term + " months · " + c.residualPct + "% residual";

    // composition bar
    var pShare = Math.max(0.04, Math.min(0.96, o.principalShare));
    els.segP.style.width = (pShare * 100).toFixed(1) + "%";
    els.segI.style.width = ((1 - pShare) * 100).toFixed(1) + "%";
    els.lgPrincipal.textContent = money(o.total - o.interest);
    if (o.rentLabel) {
      els.lgRent.textContent = money(o.interest);
    } else {
      els.lgInterest.textContent = money(o.interest);
    }

    // breakdown
    els.bFinanced.textContent = money(o.financed);
    els.bTotal.textContent = money(o.total);
    els.bInterest.textContent = money(o.interest);
    els.bSigning.textContent = money(o.signing);
    els.bCredit.textContent = money(o.credit);

    // tags
    var dp = c.price > 0 ? Math.round((c.down / c.price) * 100) : 0;
    els.downPct.textContent = dp + "%";
    els.aprTag.textContent = c.apr.toFixed(2) + "%";
    els.termTag.textContent = c.term + " mo";
    els.residualPct.textContent = c.residualPct + "%";

    // affordability gauge (rule of thumb: payment vs a $5,600/mo budget band)
    var ratio = o.monthly / 5600;
    var aff = els.spAff;
    aff.classList.remove("sp-on", "sp-warn");
    if (ratio <= 0.13) { aff.classList.add("sp-on"); els.spAffVal.textContent = "Comfortable"; }
    else if (ratio <= 0.2) { aff.classList.add("sp-warn"); els.spAffVal.textContent = "Stretch"; }
    else { aff.classList.add("sp-warn"); els.spAffVal.textContent = "Over budget"; }
  }

  // ---------- sync input <-> range pairs ----------
  function pair(input, range) {
    input.addEventListener("input", function () {
      range.value = input.value;
      render();
    });
    range.addEventListener("input", function () {
      input.value = range.value;
      render();
    });
  }
  pair(els.price, els.priceR);
  pair(els.down, els.downR);
  pair(els.trade, els.tradeR);

  els.aprR.addEventListener("input", render);
  els.residualR.addEventListener("input", render);

  els.termR.addEventListener("input", function () {
    syncTermChips(num(els.termR));
    render();
  });

  // ---------- term chips ----------
  var chips = Array.prototype.slice.call(document.querySelectorAll("#term-chips .chip"));
  function syncTermChips(term) {
    chips.forEach(function (ch) {
      ch.classList.toggle("is-on", parseInt(ch.dataset.term, 10) === term);
    });
  }
  chips.forEach(function (ch) {
    ch.addEventListener("click", function () {
      var t = parseInt(ch.dataset.term, 10);
      els.termR.value = t;
      syncTermChips(t);
      render();
    });
  });

  // ---------- finance / lease tabs ----------
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  function setMode(next) {
    mode = next;
    tabs.forEach(function (t) {
      var on = t.dataset.mode === next;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    var isLease = next === "lease";
    document.querySelectorAll(".lbl-finance").forEach(function (e) { e.hidden = isLease; });
    document.querySelectorAll(".lbl-lease").forEach(function (e) { e.hidden = !isLease; });
    document.querySelectorAll(".lease-only").forEach(function (e) { e.hidden = !isLease; });
    els.dealLabel.textContent = isLease
      ? "Estimated monthly lease payment"
      : "Estimated monthly finance payment";
    els.dealDot.classList.toggle("lease", isLease);
    render();
    toast(isLease ? "Switched to lease — residual & money factor applied" : "Switched to finance — APR amortization");
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () { setMode(t.dataset.mode); });
  });

  // ---------- reset ----------
  els.reset.addEventListener("click", function () {
    els.price.value = els.priceR.value = DEFAULTS.price;
    els.down.value = els.downR.value = DEFAULTS.down;
    els.trade.value = els.tradeR.value = DEFAULTS.trade;
    els.aprR.value = DEFAULTS.apr;
    els.termR.value = DEFAULTS.term;
    els.residualR.value = DEFAULTS.residual;
    syncTermChips(DEFAULTS.term);
    render();
    toast("Reset to MSRP defaults");
  });

  // ---------- lock quote ----------
  els.apply.addEventListener("click", function () {
    if (locked) return;
    locked = true;
    els.apply.classList.add("locked");
    var c = compute();
    els.apply.textContent = "Quote locked · " + money2(c.o.monthly) + "/mo";
    toast("Quote locked for 72 hours — ref #RD-" + (Math.floor(Math.random() * 9000) + 1000));
    setTimeout(function () {
      locked = false;
      els.apply.classList.remove("locked");
      els.apply.textContent = "Lock this quote";
    }, 4200);
  });

  // initial paint
  syncTermChips(DEFAULTS.term);
  render();
})();
