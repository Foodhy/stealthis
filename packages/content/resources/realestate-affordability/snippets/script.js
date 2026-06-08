(function () {
  "use strict";

  /* ---------- helpers ---------- */
  var fmt0 = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  function money(n) {
    if (!isFinite(n) || n < 0) n = 0;
    return fmt0.format(Math.round(n));
  }

  function compact(n) {
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
    if (n >= 1000) return "$" + Math.round(n / 1000) + "k";
    return money(n);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function num(id) {
    var el = document.getElementById(id);
    var v = parseFloat(el.value);
    return isNaN(v) ? 0 : v;
  }

  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- range fill paint ---------- */
  function paintRange(el) {
    var min = parseFloat(el.min),
      max = parseFloat(el.max),
      val = parseFloat(el.value);
    var pct = ((val - min) / (max - min)) * 100;
    el.style.setProperty("--fill", pct + "%");
  }

  /* ---------- sample listings ---------- */
  var LISTINGS = [
    {
      title: "The Aldergrove",
      addr: "42 Harlowe Terrace · Westhaven",
      price: 489000,
      beds: 3,
      baths: 2,
      sqft: 1980,
      agent: "Priya Ackerman",
      grad: "linear-gradient(135deg,#c9b79a 0%,#a8895f 45%,#6d5436 100%)",
      overlay: "radial-gradient(120% 90% at 20% 0%,rgba(255,245,225,.55),transparent 55%)",
    },
    {
      title: "Linnea Row House",
      addr: "7 Cobble Mews · Briarpoint",
      price: 575000,
      beds: 4,
      baths: 3,
      sqft: 2340,
      agent: "Marcus Vela",
      grad: "linear-gradient(135deg,#2f4a40 0%,#3c6053 50%,#243a32 100%)",
      overlay: "radial-gradient(130% 100% at 80% 10%,rgba(176,141,87,.4),transparent 60%)",
    },
    {
      title: "Calder Courtyard Flat",
      addr: "300 Vinewood Ave · Westhaven",
      price: 612000,
      beds: 2,
      baths: 2,
      sqft: 1640,
      agent: "Dora Whitfield",
      grad: "linear-gradient(135deg,#b7704f 0%,#8a4f37 50%,#5c3322 100%)",
      overlay: "radial-gradient(120% 90% at 30% 100%,rgba(255,230,200,.5),transparent 55%)",
    },
    {
      title: "Marlowe Hill Estate",
      addr: "18 Crestline Loop · Highmoor",
      price: 845000,
      beds: 5,
      baths: 4,
      sqft: 3420,
      agent: "Theo Brandt",
      grad: "linear-gradient(135deg,#3a3f52 0%,#566079 50%,#2a2f3e 100%)",
      overlay: "radial-gradient(130% 100% at 70% 0%,rgba(200,210,235,.4),transparent 60%)",
    },
  ];

  /* ---------- core affordability math ---------- */
  function monthlyPI(principal, annualRate, years) {
    var r = annualRate / 100 / 12;
    var n = years * 12;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }

  // Given a target monthly P&I, invert to find affordable loan principal.
  function loanFromPI(pi, annualRate, years) {
    var r = annualRate / 100 / 12;
    var n = years * 12;
    if (r === 0) return pi * n;
    return (pi * (1 - Math.pow(1 + r, -n))) / r;
  }

  var TAX_RATE = 0.0115; // annual property tax as % of price
  var INS_HOA_MONTHLY_PER_1000 = 0.55; // insurance + HOA per $1000 of price / month

  function compute() {
    var income = num("income");
    var debts = num("debts");
    var down = num("down");
    var rate = num("rate");
    var dti = num("dti");
    var term = parseInt(
      document.querySelector('input[name="term"]:checked').value,
      10
    );

    // Max monthly housing the lender allows under DTI.
    var maxTotalDebt = (income / 12) * (dti / 100);
    var maxHousing = Math.max(0, maxTotalDebt - debts);

    // Solve price iteratively: housing = P&I(price-down) + tax + ins/hoa.
    // tax & ins scale with price, so we converge.
    var price = (down + loanFromPI(maxHousing, rate, term)); // first guess ignoring escrow
    for (var i = 0; i < 24; i++) {
      var taxM = (price * TAX_RATE) / 12;
      var insM = (price / 1000) * INS_HOA_MONTHLY_PER_1000;
      var availPI = Math.max(0, maxHousing - taxM - insM);
      var loan = loanFromPI(availPI, rate, term);
      var newPrice = loan + down;
      if (Math.abs(newPrice - price) < 50) {
        price = newPrice;
        break;
      }
      price = newPrice;
    }
    price = Math.max(down, price);

    var loan = Math.max(0, price - down);
    var pi = monthlyPI(loan, rate, term);
    var taxM = (price * TAX_RATE) / 12;
    var insM = (price / 1000) * INS_HOA_MONTHLY_PER_1000;
    var housing = pi + taxM + insM;
    var downPct = price > 0 ? (down / price) * 100 : 0;

    // "Comfort" assessment vs. how aggressive the DTI target is.
    var tone, label;
    if (dti <= 33 && downPct >= 18) {
      tone = "ok";
      label = "Comfortable";
    } else if (dti <= 40) {
      tone = "warn";
      label = "Stretch";
    } else {
      tone = "danger";
      label = "Aggressive";
    }
    if (housing <= 0) {
      tone = "danger";
      label = "Debts too high";
    }

    return {
      income: income,
      down: down,
      dti: dti,
      price: price,
      loan: loan,
      pi: pi,
      taxM: taxM,
      insM: insM,
      housing: housing,
      downPct: downPct,
      tone: tone,
      label: label,
    };
  }

  /* ---------- gauge ---------- */
  var GAUGE_LEN = 283; // length of the semicircle arc path
  var GAUGE_MIN = 150000;
  var GAUGE_MAX = 1500000;

  function setGauge(price) {
    var t = clamp((price - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN), 0, 1);
    var fill = document.getElementById("gauge-fill");
    fill.style.strokeDashoffset = String(GAUGE_LEN - GAUGE_LEN * t);
    var needle = document.getElementById("gauge-needle");
    var deg = -90 + t * 180;
    needle.style.transform = "rotate(" + deg + "deg)";
  }

  /* ---------- render results ---------- */
  function set(id, txt) {
    document.getElementById(id).textContent = txt;
  }

  var lastMaxPrice = 0;

  function render() {
    var r = compute();
    lastMaxPrice = r.price;

    // headline
    set("max-price", money(r.price));
    var low = r.price * 0.85;
    set("price-range", "Sweet spot " + compact(low) + " – " + compact(r.price));

    // gauge
    setGauge(r.price);

    // status chip
    var chip = document.getElementById("status-chip");
    chip.textContent = r.label;
    chip.setAttribute("data-tone", r.tone);

    // metrics
    set("m-payment", money(r.housing));
    set("m-payment-sub", "at " + r.dti + "% DTI");
    set("m-loan", money(r.loan));
    set("m-income", money(r.income));
    set("m-down", Math.round(r.downPct) + "%");
    set("m-down-sub", money(r.down) + " cash");

    // breakdown
    var total = r.housing > 0 ? r.housing : 1;
    document.getElementById("bar-pi").style.width =
      (r.pi / total) * 100 + "%";
    document.getElementById("bar-tax").style.width =
      (r.taxM / total) * 100 + "%";
    document.getElementById("bar-ins").style.width =
      (r.insM / total) * 100 + "%";
    set("val-pi", money(r.pi));
    set("val-tax", money(r.taxM));
    set("val-ins", money(r.insM));

    renderCards(r.price);
  }

  /* ---------- listing cards ---------- */
  var cardsEl = document.getElementById("cards");

  function payForPrice(price) {
    // quick payment preview using current rate/term and current down (capped).
    var rate = num("rate");
    var term = parseInt(
      document.querySelector('input[name="term"]:checked').value,
      10
    );
    var down = Math.min(num("down"), price * 0.4);
    var loan = Math.max(0, price - down);
    var pi = monthlyPI(loan, rate, term);
    var taxM = (price * TAX_RATE) / 12;
    var insM = (price / 1000) * INS_HOA_MONTHLY_PER_1000;
    return pi + taxM + insM;
  }

  function renderCards(maxPrice) {
    cardsEl.innerHTML = "";
    var fits = 0;
    LISTINGS.forEach(function (l) {
      var inRange = l.price <= maxPrice + 1;
      if (inRange) fits++;
      var card = document.createElement("article");
      card.className = "card" + (inRange ? "" : " out-of-range");

      var pay = payForPrice(l.price);
      var badgeHtml = inRange
        ? '<span class="badge fit">In your range</span>'
        : '<span class="badge over">Over by ' +
          compact(l.price - maxPrice) +
          "</span>";

      card.innerHTML =
        '<div class="photo" style="background:' +
        l.grad +
        ";background-image:" +
        l.overlay +
        "," +
        l.grad +
        '">' +
        '<div class="photo-badges">' +
        badgeHtml +
        '<span class="badge price">' +
        compact(l.price) +
        "</span>" +
        "</div></div>" +
        '<div class="card-body">' +
        '<h3 class="card-title">' +
        l.title +
        "</h3>" +
        '<p class="card-addr">' +
        l.addr +
        "</p>" +
        '<div class="card-meta">' +
        '<span class="chip">' +
        l.beds +
        " bd</span>" +
        '<span class="chip">' +
        l.baths +
        " ba</span>" +
        '<span class="chip">' +
        l.sqft.toLocaleString() +
        " sqft</span>" +
        "</div>" +
        '<div class="card-foot">' +
        '<span class="agent">Listed by <strong>' +
        l.agent +
        "</strong></span>" +
        '<span class="pay-note">~' +
        money(pay) +
        "/mo</span>" +
        "</div>" +
        "</div>";

      cardsEl.appendChild(card);
    });

    var summary = document.getElementById("match-summary");
    summary.textContent =
      fits +
      " of " +
      LISTINGS.length +
      " listings fit your recommended price.";
  }

  /* ---------- bind number <-> range pairs + outputs ---------- */
  function bindPair(numId, rangeId, outId, formatter) {
    var n = document.getElementById(numId);
    var rng = document.getElementById(rangeId);

    function syncFromNum() {
      var v = clamp(parseFloat(n.value) || 0, parseFloat(rng.min), parseFloat(rng.max));
      rng.value = String(v);
      paintRange(rng);
      document.getElementById(outId).textContent = formatter(parseFloat(n.value) || 0);
      render();
    }
    function syncFromRange() {
      n.value = rng.value;
      paintRange(rng);
      document.getElementById(outId).textContent = formatter(parseFloat(rng.value));
      render();
    }

    n.addEventListener("input", syncFromNum);
    rng.addEventListener("input", syncFromRange);
    paintRange(rng);
  }

  bindPair("income", "income-range", "income-out", money);
  bindPair("debts", "debts-range", "debts-out", money);
  bindPair("down", "down-range", "down-out", money);

  // standalone sliders (rate, dti)
  var rateEl = document.getElementById("rate");
  rateEl.addEventListener("input", function () {
    paintRange(rateEl);
    set("rate-out", parseFloat(rateEl.value).toFixed(2) + "%");
    render();
  });
  paintRange(rateEl);

  var dtiEl = document.getElementById("dti");
  dtiEl.addEventListener("input", function () {
    paintRange(dtiEl);
    set("dti-out", Math.round(parseFloat(dtiEl.value)) + "%");
    render();
  });
  paintRange(dtiEl);

  // term radios
  Array.prototype.forEach.call(
    document.querySelectorAll('input[name="term"]'),
    function (el) {
      el.addEventListener("change", render);
    }
  );

  /* ---------- reset ---------- */
  var DEFAULTS = {
    income: 140000,
    debts: 650,
    down: 90000,
    rate: 6.5,
    dti: 36,
    term: "30",
  };

  document.getElementById("reset-btn").addEventListener("click", function () {
    document.getElementById("income").value = DEFAULTS.income;
    document.getElementById("income-range").value = DEFAULTS.income;
    document.getElementById("debts").value = DEFAULTS.debts;
    document.getElementById("debts-range").value = DEFAULTS.debts;
    document.getElementById("down").value = DEFAULTS.down;
    document.getElementById("down-range").value = DEFAULTS.down;
    document.getElementById("rate").value = DEFAULTS.rate;
    document.getElementById("dti").value = DEFAULTS.dti;
    document.querySelector(
      'input[name="term"][value="' + DEFAULTS.term + '"]'
    ).checked = true;

    set("income-out", money(DEFAULTS.income));
    set("debts-out", money(DEFAULTS.debts));
    set("down-out", money(DEFAULTS.down));
    set("rate-out", DEFAULTS.rate.toFixed(2) + "%");
    set("dti-out", DEFAULTS.dti + "%");

    ["income-range", "debts-range", "down-range", "rate", "dti"].forEach(
      function (id) {
        paintRange(document.getElementById(id));
      }
    );
    render();
    toast("Reset to sample buyer profile");
  });

  /* ---------- save ---------- */
  document.getElementById("save-btn").addEventListener("click", function () {
    toast("Estimate saved — " + money(lastMaxPrice) + " max. Scroll to your matches.");
    document.getElementById("listings").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- init ---------- */
  render();
})();
