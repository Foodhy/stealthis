(function () {
  "use strict";

  /* ---- Subject property ---- */
  var SUBJECT = { sqft: 2480, beds: 4, baths: 2.5 };

  /* ---- Comparable sales (fictional). adj = total dollar adjustment
     applied to the comp's sold price to make it comparable to the subject.
     Positive = subject superior (comp raised); negative = comp superior. ---- */
  var COMPS = [
    { id: "c1", addr: "388 Magnolia Crescent", area: "Brookhaven Park", price: 742000, sqft: 2410, beds: 4, baths: 2.5, sold: "2026-05-02", dist: 0.2, adj:  16000, on: true },
    { id: "c2", addr: "1207 Sycamore Hollow",   area: "Maple Ridge",     price: 805000, sqft: 2690, beds: 4, baths: 3,   sold: "2026-04-18", dist: 0.8, adj: -34000, on: true },
    { id: "c3", addr: "54 Linden Court",        area: "Brookhaven Park", price: 698000, sqft: 2280, beds: 3, baths: 2.5, sold: "2026-03-29", dist: 0.5, adj:  41000, on: true },
    { id: "c4", addr: "920 Cedar Bluff Lane",   area: "Maple Ridge",     price: 769000, sqft: 2520, beds: 4, baths: 2.5, sold: "2026-05-21", dist: 1.1, adj:  -7000, on: true },
    { id: "c5", addr: "33 Willow Bend",         area: "Orchard Glen",    price: 712000, sqft: 2350, beds: 4, baths: 2,   sold: "2026-02-14", dist: 1.6, adj:  28000, on: true },
    { id: "c6", addr: "1488 Hawthorne Row",     area: "Maple Ridge",     price: 884000, sqft: 3010, beds: 5, baths: 3.5, sold: "2026-04-05", dist: 2.0, adj: -96000, on: false }
  ];

  /* ---- Formatters ---- */
  var fmtMoney = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };
  var fmtMoneyShort = function (n) {
    return "$" + (Math.round(n / 1000)).toLocaleString("en-US") + "K";
  };
  var fmtSigned = function (n) {
    var s = n > 0 ? "+" : n < 0 ? "−" : "±";
    return s + "$" + Math.abs(Math.round(n)).toLocaleString("en-US");
  };
  var fmtDate = function (iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  };

  /* ---- DOM refs ---- */
  var body = document.getElementById("comps-body");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---- Build table rows ---- */
  function buildRows() {
    var html = "";
    COMPS.forEach(function (c) {
      var ppsf = c.price / c.sqft;
      var adjPrice = c.price + c.adj;
      var pillCls = c.adj > 0 ? "adj-pill--up" : c.adj < 0 ? "adj-pill--down" : "adj-pill--zero";
      html +=
        '<tr data-id="' + c.id + '" class="' + (c.on ? "" : "is-excluded") + '">' +
          '<td class="col-toggle">' +
            '<input type="checkbox" class="cb" ' + (c.on ? "checked" : "") +
              ' aria-label="Include ' + c.addr + ' in analysis" data-id="' + c.id + '">' +
          "</td>" +
          '<td class="col-addr">' +
            '<span class="comp-addr">' + c.addr + "</span>" +
            '<span class="comp-area">' + c.area + " · " + c.sqft.toLocaleString("en-US") + " sq ft</span>" +
          "</td>" +
          '<td class="num">' + fmtMoney(c.price) + "</td>" +
          '<td class="num">$' + Math.round(ppsf) + "</td>" +
          "<td>" + c.beds + " / " + c.baths + "</td>" +
          "<td>" + fmtDate(c.sold) + "</td>" +
          '<td class="num">' + c.dist.toFixed(1) + " mi</td>" +
          '<td class="num"><span class="adj-pill ' + pillCls + '">' + fmtSigned(c.adj) + "</span></td>" +
          '<td class="num"><strong>' + fmtMoney(adjPrice) + "</strong></td>" +
        "</tr>";
    });
    body.innerHTML = html;

    body.querySelectorAll(".cb").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var comp = COMPS.find(function (c) { return c.id === cb.getAttribute("data-id"); });
        if (!comp) return;
        comp.on = cb.checked;
        cb.closest("tr").classList.toggle("is-excluded", !cb.checked);
        recalc();
        toast(cb.checked ? comp.addr.split(" ").slice(0, 2).join(" ") + " included" :
                           comp.addr.split(" ").slice(0, 2).join(" ") + " excluded");
      });
    });
  }

  /* ---- Recalculate suggested range, footer and chart ---- */
  function recalc() {
    var active = COMPS.filter(function (c) { return c.on; });
    var n = active.length;

    var lowEl = document.getElementById("range-low");
    var midEl = document.getElementById("range-mid");
    var highEl = document.getElementById("range-high");
    var ppsfEl = document.getElementById("range-ppsf");
    var activeCountEl = document.getElementById("active-count");

    activeCountEl.textContent = String(n);

    if (n === 0) {
      lowEl.textContent = midEl.textContent = highEl.textContent = "—";
      ppsfEl.textContent = "select a comp";
      document.getElementById("foot-price").textContent = "—";
      document.getElementById("foot-ppsf").textContent = "—";
      document.getElementById("foot-adj").textContent = "—";
      document.getElementById("foot-count").textContent = "(0 of " + COMPS.length + ")";
      document.getElementById("range-bar-fill").style.width = "0%";
      renderChart(0, 0);
      return;
    }

    var adjPrices = active.map(function (c) { return c.price + c.adj; });
    var sumAdj = adjPrices.reduce(function (a, b) { return a + b; }, 0);
    var sumRaw = active.reduce(function (a, c) { return a + c.price; }, 0);
    var sumSqft = active.reduce(function (a, c) { return a + c.sqft; }, 0);

    var avgAdj = sumAdj / n;
    var blendedPpsf = sumAdj / sumSqft; // $/sqft on adjusted basis

    // Subject-implied value from blended adjusted $/sqft.
    var subjectValue = blendedPpsf * SUBJECT.sqft;

    // Target reconciles the adjusted average with the $/sqft-implied value.
    var target = avgAdj * 0.6 + subjectValue * 0.4;

    // Range band: tighten/widen with comp dispersion (std dev), clamped.
    var variance = adjPrices.reduce(function (a, p) { return a + Math.pow(p - avgAdj, 2); }, 0) / n;
    var std = Math.sqrt(variance);
    var band = Math.min(Math.max(std * 0.85, target * 0.025), target * 0.07);

    var low = roundTo(target - band, 1000);
    var high = roundTo(target + band, 1000);
    var mid = roundTo(target, 500);

    lowEl.textContent = fmtMoney(low);
    midEl.textContent = fmtMoney(mid);
    highEl.textContent = fmtMoney(high);
    ppsfEl.textContent = "$" + Math.round(mid / SUBJECT.sqft) + " / sq ft";

    // Footer (adjusted average row)
    document.getElementById("foot-price").textContent = fmtMoney(sumRaw / n);
    document.getElementById("foot-ppsf").textContent = "$" + Math.round(blendedPpsf);
    document.getElementById("foot-adj").textContent = fmtMoney(avgAdj);
    document.getElementById("foot-count").textContent = "(" + n + " of " + COMPS.length + ")";

    updateRangeBar(low, mid, high);
    renderChart(low, high);
  }

  function roundTo(n, step) { return Math.round(n / step) * step; }

  /* ---- Range bar geometry ---- */
  function updateRangeBar(low, mid, high) {
    var span = high - low;
    var pad = span * 0.9;
    var scaleMin = low - pad;
    var scaleMax = high + pad;
    var total = scaleMax - scaleMin;

    var pct = function (v) { return ((v - scaleMin) / total) * 100; };

    var fill = document.getElementById("range-bar-fill");
    fill.style.left = pct(low) + "%";
    fill.style.width = (pct(high) - pct(low)) + "%";

    document.getElementById("range-bar-marker").style.left = pct(mid) + "%";
    document.getElementById("scale-min").textContent = fmtMoneyShort(scaleMin);
    document.getElementById("scale-max").textContent = fmtMoneyShort(scaleMax);
  }

  /* ---- Distribution chart ---- */
  var chartEl = document.getElementById("chart");

  function renderChart(low, high) {
    var values = COMPS.map(function (c) { return c.price + c.adj; });
    // Include the subject target as a reference bar.
    var midTarget = (low + high) / 2;
    var all = values.concat([midTarget]);
    var max = Math.max.apply(null, all) * 1.06;
    var min = Math.min.apply(null, all) * 0.9;
    var range = max - min || 1;
    var pctH = function (v) { return Math.max(6, ((v - min) / range) * 100); };

    chartEl.innerHTML = "";

    COMPS.forEach(function (c) {
      var v = c.price + c.adj;
      var bar = document.createElement("div");
      bar.className = "bar" + (c.on ? "" : " is-excluded");

      var val = document.createElement("span");
      val.className = "bar-value";
      val.textContent = fmtMoneyShort(v);

      var col = document.createElement("div");
      col.className = "bar-col";
      col.style.height = pctH(v) + "%";

      var lbl = document.createElement("span");
      lbl.className = "bar-label";
      lbl.textContent = c.addr.split(" ").slice(0, 2).join(" ");

      bar.appendChild(val);
      bar.appendChild(col);
      bar.appendChild(lbl);
      chartEl.appendChild(bar);
    });

    // Subject target bar
    var sBar = document.createElement("div");
    sBar.className = "bar is-subject";
    var sVal = document.createElement("span");
    sVal.className = "bar-value";
    sVal.textContent = fmtMoneyShort(midTarget);
    var sCol = document.createElement("div");
    sCol.className = "bar-col";
    sCol.style.height = pctH(midTarget) + "%";
    var sLbl = document.createElement("span");
    sLbl.className = "bar-label";
    sLbl.textContent = "Subject target";
    sBar.appendChild(sVal);
    sBar.appendChild(sCol);
    sBar.appendChild(sLbl);
    chartEl.appendChild(sBar);
  }

  /* ---- Print ---- */
  document.getElementById("btn-print").addEventListener("click", function () {
    toast("Opening print dialog…");
    setTimeout(function () { window.print(); }, 250);
  });

  /* ---- Init ---- */
  buildRows();
  recalc();
})();
