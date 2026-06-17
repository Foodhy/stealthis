(function () {
  "use strict";

  /* ---------- Data ---------- */
  var holdings = [
    { ticker: "VOO",  name: "Vanguard S&P 500 ETF", color: "#3b6ef6", shares: 92,    price: 512.34, chgPct: 0.84 },
    { ticker: "AAPL", name: "Apple Inc.",            color: "#0fb5a6", shares: 140,   price: 231.18, chgPct: 1.62 },
    { ticker: "MSFT", name: "Microsoft Corp.",       color: "#7c5cff", shares: 58,    price: 448.90, chgPct: -0.41 },
    { ticker: "NVDA", name: "NVIDIA Corp.",          color: "#d9982b", shares: 96,    price: 128.55, chgPct: 3.27 },
    { ticker: "BTC",  name: "Bitcoin",               color: "#16264d", shares: 0.42,  price: 64210.0, chgPct: -1.18 }
  ];

  var buyingPower = 6540.0;

  var fmt = function (n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var fmt0 = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };
  var pct = function (n) {
    return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
  };
  var val = function (h) { return h.shares * h.price; };

  /* ---------- Toast ---------- */
  var toastHost = document.getElementById("toastHost");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      setTimeout(function () { el.remove(); }, 320);
    }, 2400);
  }

  /* ---------- Render holdings ---------- */
  var holdingsBody = document.getElementById("holdingsBody");
  function renderHoldings() {
    holdingsBody.innerHTML = "";
    holdings.forEach(function (h, i) {
      var v = val(h);
      var row = document.createElement("div");
      row.className = "hrow";
      row.setAttribute("role", "row");
      row.tabIndex = 0;
      var up = h.chgPct >= 0;
      row.innerHTML =
        '<div class="asset">' +
          '<div class="tkr-badge" style="background:' + h.color + '">' + h.ticker.slice(0, 4) + "</div>" +
          '<div class="asset-meta">' +
            '<div class="asset-ticker">' + h.ticker + "</div>" +
            '<div class="asset-name">' + h.name + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="num shares">' + (h.shares < 1 ? h.shares.toFixed(2) : h.shares) + "</div>" +
        '<div class="num value">' + fmt(v) + "</div>" +
        '<div class="num chg ' + (up ? "up" : "down") + '">' + pct(h.chgPct) + "</div>";
      row.addEventListener("click", function () { openDetail(i); });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDetail(i); }
      });
      holdingsBody.appendChild(row);
    });
    document.getElementById("holdingsCount").textContent = holdings.length + " positions";
  }

  /* ---------- Portfolio summary ---------- */
  function totalValue() {
    return holdings.reduce(function (s, h) { return s + val(h); }, 0);
  }
  function renderSummary() {
    var holdVal = totalValue();
    var port = holdVal + buyingPower;
    // weighted day change
    var dayGain = holdings.reduce(function (s, h) {
      var v = val(h);
      return s + v - v / (1 + h.chgPct / 100);
    }, 0);
    var dayPct = (dayGain / (holdVal - dayGain)) * 100;
    document.getElementById("portfolioValue").textContent = fmt(port);
    var d = document.getElementById("portfolioDelta");
    var up = dayGain >= 0;
    d.className = "delta " + (up ? "up" : "down");
    document.getElementById("portfolioDeltaAmt").textContent = (up ? "+" : "-") + fmt(Math.abs(dayGain)).replace("$", "$");
    document.getElementById("portfolioDeltaPct").textContent = pct(dayPct);
    document.getElementById("donutTotal").textContent = fmt0(holdVal);
  }

  /* ---------- Allocation donut ---------- */
  var donut = document.getElementById("donut");
  var legend = document.getElementById("legend");
  function renderDonut() {
    var total = totalValue();
    var R = 52, C = 60, circ = 2 * Math.PI * R;
    donut.innerHTML = "";
    legend.innerHTML = "";
    var offset = 0;
    holdings.forEach(function (h) {
      var frac = val(h) / total;
      var len = frac * circ;
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("class", "seg");
      c.setAttribute("cx", C); c.setAttribute("cy", C); c.setAttribute("r", R);
      c.setAttribute("fill", "none");
      c.setAttribute("stroke", h.color);
      c.setAttribute("stroke-width", "13");
      c.setAttribute("stroke-dasharray", len + " " + (circ - len));
      c.setAttribute("stroke-dashoffset", -offset);
      var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = h.ticker + " — " + (frac * 100).toFixed(1) + "%";
      c.appendChild(title);
      donut.appendChild(c);
      offset += len;

      var li = document.createElement("li");
      li.innerHTML =
        '<span class="dot" style="background:' + h.color + '"></span>' +
        '<span class="lg-name">' + h.ticker + "</span>" +
        '<span class="lg-pct">' + (frac * 100).toFixed(1) + "%</span>";
      legend.appendChild(li);
    });
  }

  /* ---------- Line chart ---------- */
  var chartLine = document.getElementById("chartLine");
  var chartArea = document.getElementById("chartArea");
  var chartDot = document.getElementById("chartDot");
  var chartTip = document.getElementById("chartTip");
  var chartSvg = document.getElementById("chart");
  var W = 600, H = 200;

  var rangeMeta = {
    "1D": { n: 24,  vol: 0.4,  drift: 2.2,  seed: 11, label: "today" },
    "1W": { n: 28,  vol: 0.9,  drift: 2.2,  seed: 23, label: "this week" },
    "1M": { n: 30,  vol: 1.4,  drift: 4.0,  seed: 31, label: "past month" },
    "6M": { n: 26,  vol: 2.6,  drift: 9.0,  seed: 47, label: "past 6 months" },
    "1Y": { n: 24,  vol: 3.4,  drift: 14.0, seed: 53, label: "past year" },
    "ALL":{ n: 30,  vol: 4.2,  drift: 26.0, seed: 67, label: "all time" }
  };

  function seeded(seed) {
    var s = seed;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  var currentPoints = [];
  function buildSeries(range) {
    var m = rangeMeta[range];
    var rnd = seeded(m.seed);
    var base = totalValue() / (1 + m.drift / 100);
    var pts = [];
    var v = base;
    for (var i = 0; i < m.n; i++) {
      var t = i / (m.n - 1);
      var trend = base * (m.drift / 100) * t;
      var noise = (rnd() - 0.45) * base * (m.vol / 100);
      v = base + trend + noise;
      pts.push(v);
    }
    pts[pts.length - 1] = totalValue(); // anchor to current
    return pts;
  }

  function pathFor(pts) {
    var min = Math.min.apply(null, pts);
    var max = Math.max.apply(null, pts);
    var pad = (max - min) * 0.18 || 1;
    min -= pad; max += pad;
    var coords = pts.map(function (p, i) {
      var x = (i / (pts.length - 1)) * W;
      var y = H - ((p - min) / (max - min)) * H;
      return [x, y];
    });
    var line = coords.map(function (c, i) {
      return (i === 0 ? "M" : "L") + c[0].toFixed(1) + " " + c[1].toFixed(1);
    }).join(" ");
    var area = line + " L" + W + " " + H + " L0 " + H + " Z";
    return { line: line, area: area, coords: coords };
  }

  function drawChart(range) {
    currentPoints = buildSeries(range);
    var p = pathFor(currentPoints);
    chartLine.setAttribute("d", p.line);
    chartArea.setAttribute("d", p.area);
    chartLine._coords = p.coords;
    var up = currentPoints[currentPoints.length - 1] >= currentPoints[0];
    chartLine.style.stroke = up ? "var(--accent)" : "var(--danger)";
    var m = rangeMeta[range];
    document.getElementById("portfolioDeltaPeriod").textContent = m.label;
  }

  // hover scrubbing
  function onMove(evt) {
    var coords = chartLine._coords;
    if (!coords) return;
    var rect = chartSvg.getBoundingClientRect();
    var clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    var relX = (clientX - rect.left) / rect.width;
    var idx = Math.round(relX * (coords.length - 1));
    idx = Math.max(0, Math.min(coords.length - 1, idx));
    var c = coords[idx];
    var px = (c[0] / W) * rect.width;
    var py = (c[1] / H) * rect.height;
    chartDot.setAttribute("cx", c[0]);
    chartDot.setAttribute("cy", c[1]);
    chartDot.style.opacity = "1";
    chartTip.hidden = false;
    chartTip.textContent = fmt(currentPoints[idx]);
    chartTip.style.left = px + "px";
    chartTip.style.top = py + "px";
  }
  function onLeave() {
    chartDot.style.opacity = "0";
    chartTip.hidden = true;
  }
  chartSvg.addEventListener("mousemove", onMove);
  chartSvg.addEventListener("mouseleave", onLeave);
  chartSvg.addEventListener("touchmove", function (e) { onMove(e); }, { passive: true });
  chartSvg.addEventListener("touchend", onLeave);

  // timeframe tabs
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("is-active"); t.removeAttribute("aria-selected"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      drawChart(tab.dataset.range);
    });
  });

  /* ---------- Trade panel ---------- */
  var tradeSide = "buy";
  var tradeAsset = document.getElementById("tradeAsset");
  var tradeShares = document.getElementById("tradeShares");
  var tradeEst = document.getElementById("tradeEst");
  var estSide = document.getElementById("estSide");

  function fillAssetSelect() {
    tradeAsset.innerHTML = "";
    holdings.forEach(function (h, i) {
      var o = document.createElement("option");
      o.value = i;
      o.textContent = h.ticker + " · " + fmt(h.price);
      tradeAsset.appendChild(o);
    });
  }

  function selectedHolding() { return holdings[+tradeAsset.value] || holdings[0]; }

  function updateEst() {
    var h = selectedHolding();
    var sh = parseFloat(tradeShares.value) || 0;
    tradeEst.textContent = fmt(sh * h.price);
    estSide.textContent = tradeSide === "buy" ? "cost" : "proceeds";
  }

  document.querySelectorAll(".seg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".seg-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      tradeSide = btn.dataset.side;
      updateEst();
    });
  });
  tradeAsset.addEventListener("change", updateEst);
  tradeShares.addEventListener("input", updateEst);

  /* ---------- Trade modal ---------- */
  var tradeModal = document.getElementById("tradeModal");
  var confirmRows = document.getElementById("confirmRows");
  var lastClicked = null;

  function openModal(modal, opener) {
    lastClicked = opener || document.activeElement;
    modal.hidden = false;
    var f = modal.querySelector(".btn.primary, .modal-x");
    if (f) f.focus();
  }
  function closeModal(modal) {
    modal.hidden = true;
    if (lastClicked && lastClicked.focus) lastClicked.focus();
  }

  document.getElementById("reviewBtn").addEventListener("click", function () {
    var h = selectedHolding();
    var sh = parseFloat(tradeShares.value) || 0;
    if (sh <= 0) { toast("Enter a share amount", "sell"); return; }
    var amount = sh * h.price;
    if (tradeSide === "buy" && amount > buyingPower) {
      toast("Insufficient buying power", "sell"); return;
    }
    if (tradeSide === "sell" && sh > h.shares) {
      toast("You only hold " + h.shares + " " + h.ticker, "sell"); return;
    }
    var fee = Math.max(0, amount * 0.0005);
    confirmRows.innerHTML =
      crow("Side", (tradeSide === "buy" ? "Buy" : "Sell")) +
      crow("Asset", h.ticker + " — " + h.name) +
      crow("Shares", String(sh)) +
      crow("Market price", fmt(h.price)) +
      crow("Est. fee", fmt(fee)) +
      crow(tradeSide === "buy" ? "Total cost" : "Net proceeds",
        fmt(tradeSide === "buy" ? amount + fee : amount - fee), true);
    openModal(tradeModal, this);
  });

  function crow(label, value, total) {
    return '<div class="crow' + (total ? " total" : "") + '"><span>' + label + "</span><strong>" + value + "</strong></div>";
  }

  document.getElementById("tradeConfirm").addEventListener("click", function () {
    var h = selectedHolding();
    var sh = parseFloat(tradeShares.value) || 0;
    var amount = sh * h.price;
    if (tradeSide === "buy") {
      h.shares += sh;
      buyingPower -= amount;
      toast("Bought " + sh + " " + h.ticker + " for " + fmt(amount), "ok");
    } else {
      h.shares = Math.max(0, h.shares - sh);
      buyingPower += amount;
      toast("Sold " + sh + " " + h.ticker + " for " + fmt(amount), "sell");
    }
    document.querySelector(".bp-amount").textContent = fmt(buyingPower);
    closeModal(tradeModal);
    renderHoldings();
    renderSummary();
    renderDonut();
    fillAssetSelect();
    updateEst();
    drawChart(document.querySelector(".tab.is-active").dataset.range);
  });

  document.getElementById("tradeClose").addEventListener("click", function () { closeModal(tradeModal); });
  document.getElementById("tradeCancel").addEventListener("click", function () { closeModal(tradeModal); });

  /* ---------- Holding detail modal ---------- */
  var detailModal = document.getElementById("detailModal");
  function openDetail(i) {
    var h = holdings[i];
    var v = val(h);
    var costBasis = h.price / (1 + (h.chgPct + 4.6) / 100); // fictional avg cost
    var totalGain = (h.price - costBasis) * h.shares;
    var totalGainPct = ((h.price - costBasis) / costBasis) * 100;
    var badge = document.getElementById("detailBadge");
    badge.style.background = h.color;
    badge.textContent = h.ticker.slice(0, 4);
    document.getElementById("detailTitle").textContent = h.ticker;
    document.getElementById("detailName").textContent = h.name;
    var up = h.chgPct >= 0, tup = totalGain >= 0;
    document.getElementById("detailGrid").innerHTML =
      dcell("Market value", fmt(v)) +
      dcell("Shares", String(h.shares)) +
      dcell("Last price", fmt(h.price)) +
      dcell("Today", pct(h.chgPct), up) +
      dcell("Avg cost", fmt(costBasis)) +
      dcell("Total gain", (tup ? "+" : "-") + fmt(Math.abs(totalGain)) + " (" + pct(totalGainPct) + ")", tup);
    tradeAsset.value = i;
    updateEst();
    openModal(detailModal);
  }
  function dcell(label, value, up) {
    var cls = up === undefined ? "" : (up ? " up" : " down");
    return '<div class="dcell"><div class="dlabel">' + label + '</div><div class="dval' + cls + '">' + value + "</div></div>";
  }
  document.getElementById("detailClose").addEventListener("click", function () { closeModal(detailModal); });

  /* ---------- Global modal dismiss ---------- */
  [tradeModal, detailModal].forEach(function (m) {
    m.addEventListener("click", function (e) { if (e.target === m) closeModal(m); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!tradeModal.hidden) closeModal(tradeModal);
      if (!detailModal.hidden) closeModal(detailModal);
    }
  });

  document.getElementById("lockBtn").addEventListener("click", function () {
    toast("Session secured · 2FA active", "ok");
  });

  /* ---------- Init ---------- */
  renderHoldings();
  renderSummary();
  renderDonut();
  fillAssetSelect();
  updateEst();
  drawChart("1W");
})();
