/* Vaultex — Crypto Exchange (CEX) landing.
   UI-only simulation: mock data, fictional tokens, no real trading or network calls. */
(function () {
  "use strict";

  var fmtUSD = function (n, dp) {
    if (dp == null) dp = n >= 1000 ? 2 : n >= 1 ? 3 : 5;
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  };
  var fmtPct = function (n) { return (n >= 0 ? "+" : "") + n.toFixed(2) + "%"; };
  var fmtVol = function (n) {
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    return "$" + Math.round(n).toLocaleString("en-US");
  };

  /* ---------- Mock market data (fictional assets) ---------- */
  var COINS = [
    { sym: "NOVA", name: "Novabit",   c: "#f0b90b", price: 0.2841,  change: 2.31,  vol: 4.82e9 },
    { sym: "LMN",  name: "Lumen",     c: "#16c784", price: 142.50,  change: -1.12, vol: 2.14e9 },
    { sym: "ZEPH", name: "Zephyr",    c: "#7c5cff", price: 18.337,  change: 5.74,  vol: 1.96e9 },
    { sym: "ORBT", name: "Orbital",   c: "#00e0c6", price: 1.0042,  change: 0.04,  vol: 3.51e9 },
    { sym: "FLUX", name: "Fluxchain", c: "#ff9f1c", price: 0.00734, change: -3.88, vol: 880e6  },
    { sym: "AXON", name: "Axon",      c: "#ff4d6d", price: 64.218,  change: 1.47,  vol: 1.22e9 },
    { sym: "QUBE", name: "Qubit",     c: "#4ea8ff", price: 9.6051,  change: 8.02,  vol: 760e6  },
    { sym: "HELO", name: "Helios",    c: "#ffd23f", price: 3.2218,  change: -0.63, vol: 540e6  }
  ];
  COINS.forEach(function (c) { c.spark = makeSpark(c.change); });

  function makeSpark(bias) {
    var pts = [], v = 50;
    for (var i = 0; i < 24; i++) {
      v += (Math.random() - 0.5) * 14 + bias * 0.18;
      v = Math.max(10, Math.min(90, v));
      pts.push(v);
    }
    return pts;
  }

  function sparkSVG(pts, up) {
    var w = 88, h = 28, max = Math.max.apply(null, pts), min = Math.min.apply(null, pts);
    var rng = max - min || 1;
    var d = pts.map(function (p, i) {
      var x = (i / (pts.length - 1)) * w;
      var y = h - ((p - min) / rng) * (h - 4) - 2;
      return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
    var col = up ? "var(--pos)" : "var(--neg)";
    return '<svg class="spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h +
      '" fill="none" aria-hidden="true"><path d="' + d + '" stroke="' + col +
      '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  /* ---------- Ticker tape ---------- */
  (function ticker() {
    var track = document.getElementById("tickerTrack");
    if (!track) return;
    function itemHTML(c) {
      var up = c.change >= 0;
      return '<span class="ticker-item"><span class="sym">' + c.sym +
        '</span><span class="px">' + fmtUSD(c.price) +
        '</span><span class="chg ' + (up ? "pos" : "neg") + '">' + fmtPct(c.change) + "</span></span>";
    }
    // duplicate the set so the CSS marquee loops seamlessly
    var html = COINS.map(itemHTML).join("");
    track.innerHTML = html + html;
  })();

  /* ---------- Markets table ---------- */
  var tbody = document.getElementById("marketsBody");
  var sortKey = "vol", sortDir = -1, filter = "all";

  function rowHTML(c) {
    var up = c.change >= 0;
    return '<tr data-sym="' + c.sym + '">' +
      '<td><div class="pair-name-wrap" style="display:flex;align-items:center;gap:10px">' +
        '<span class="coin-dot" style="--c:' + c.c + '">' + c.sym.charAt(0) + '</span>' +
        '<span class="pair-name"><b>' + c.sym + '<span class="quote"> / USDQ</span></b>' +
        '<small>' + c.name + '</small></span></div></td>' +
      '<td class="num-cell price-cell">' + fmtUSD(c.price) + '</td>' +
      '<td class="num-cell"><span class="chg-pill ' + (up ? "pos" : "neg") + '">' + fmtPct(c.change) + '</span></td>' +
      '<td class="num-cell vol-cell hide-sm">' + fmtVol(c.vol) + '</td>' +
      '<td class="spark-col hide-sm">' + sparkSVG(c.spark, up) + '</td>' +
      '<td class="action-col"><button class="trade-btn" type="button" data-trade="' + c.sym + '">Trade</button></td>' +
      '</tr>';
  }

  function visibleCoins() {
    return COINS.filter(function (c) {
      if (filter === "gainers") return c.change >= 0;
      if (filter === "losers") return c.change < 0;
      return true;
    });
  }

  function sortedCoins() {
    var arr = visibleCoins().slice();
    arr.sort(function (a, b) {
      var x, y;
      if (sortKey === "sym") { x = a.sym; y = b.sym; return x < y ? -sortDir : x > y ? sortDir : 0; }
      if (sortKey === "price") { x = a.price; y = b.price; }
      else if (sortKey === "change") { x = a.change; y = b.change; }
      else { x = a.vol; y = b.vol; }
      return (x - y) * sortDir;
    });
    return arr;
  }

  function renderTable() {
    if (!tbody) return;
    tbody.innerHTML = sortedCoins().map(rowHTML).join("");
  }
  renderTable();

  // Sort handlers
  Array.prototype.forEach.call(document.querySelectorAll(".sort-btn"), function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-sort");
      if (key === sortKey) sortDir = -sortDir;
      else { sortKey = key; sortDir = key === "sym" ? 1 : -1; }
      // reset aria-sort on all headers, set on this one
      Array.prototype.forEach.call(document.querySelectorAll(".markets-table th"), function (th) {
        th.setAttribute("aria-sort", "none");
      });
      var th = btn.closest("th");
      if (th) th.setAttribute("aria-sort", sortDir === 1 ? "ascending" : "descending");
      renderTable();
    });
  });

  // Filter tabs
  Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (tab) {
    tab.addEventListener("click", function () {
      filter = tab.getAttribute("data-filter");
      Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (t) {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      renderTable();
    });
  });

  // Trade button -> toast (no real trading)
  if (tbody) {
    tbody.addEventListener("click", function (e) {
      var b = e.target.closest("[data-trade]");
      if (b) toast("Order ticket for " + b.getAttribute("data-trade") + "/USDQ is simulated — no trade is placed.");
    });
  }

  /* ---------- Live-ish price jitter ---------- */
  function jitter() {
    var changed = COINS[Math.floor(Math.random() * COINS.length)];
    var n = 1 + Math.floor(Math.random() * 3);
    for (var k = 0; k < n; k++) {
      var c = COINS[Math.floor(Math.random() * COINS.length)];
      var delta = (Math.random() - 0.5) * 0.004; // ±0.2%
      var prev = c.price;
      c.price = Math.max(0.000001, c.price * (1 + delta));
      c.change = +(c.change + (Math.random() - 0.5) * 0.18).toFixed(2);
      c.dir = c.price >= prev ? 1 : -1;
    }
    renderTable();
    // flash the price cell of changed rows
    COINS.forEach(function (c) {
      if (!c.dir) return;
      var row = tbody && tbody.querySelector('tr[data-sym="' + c.sym + '"]');
      if (!row) return;
      var cell = row.querySelector(".price-cell");
      if (cell) {
        cell.classList.remove("flash-up", "flash-down", "up", "down");
        void cell.offsetWidth;
        cell.classList.add(c.dir > 0 ? "flash-up" : "flash-down", c.dir > 0 ? "up" : "down");
      }
      c.dir = 0;
    });
    // refresh ticker prices in place (no DOM rebuild to keep marquee smooth)
    Array.prototype.forEach.call(document.querySelectorAll("#tickerTrack .ticker-item"), function (el, i) {
      var c = COINS[i % COINS.length];
      var up = c.change >= 0;
      var px = el.querySelector(".px"), chg = el.querySelector(".chg");
      if (px) px.textContent = fmtUSD(c.price);
      if (chg) { chg.textContent = fmtPct(c.change); chg.className = "chg " + (up ? "pos" : "neg"); }
    });
  }
  var jitterTimer = setInterval(jitter, 2000);
  // pause jitter when tab hidden
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { clearInterval(jitterTimer); }
    else { jitterTimer = setInterval(jitter, 2000); }
  });

  /* ---------- Count-up stats (animate on view) ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var dp = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var start = performance.now(), dur = 1400;
    function frame(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = target * eased;
      el.textContent = prefix + val.toLocaleString("en-US", {
        minimumFractionDigits: dp, maximumFractionDigits: dp
      }) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var nums = Array.prototype.slice.call(document.querySelectorAll(".num[data-count]"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { io.observe(el); });
  } else {
    nums.forEach(countUp);
  }

  /* ---------- Supported assets wall ---------- */
  (function assets() {
    var wall = document.getElementById("assetWall");
    if (!wall) return;
    var extra = [
      ["USDQ", "Quote Dollar"], ["VLTX", "Vaultex Token"], ["KORE", "Korex"],
      ["PIXL", "Pixelnet"], ["TIDE", "Tidal"], ["GLDR", "Glider"],
      ["MANT", "Mantle Bay"], ["VOLT", "Voltage"], ["CRUX", "Cruxchain"],
      ["NEBU", "Nebula"], ["RUNE", "Runefi"], ["ECHO", "Echoswap"]
    ];
    var palette = ["#f0b90b", "#16c784", "#7c5cff", "#00e0c6", "#ff9f1c", "#4ea8ff", "#ff4d6d", "#ffd23f"];
    var list = COINS.map(function (c) { return [c.sym, c.name, c.c]; }).concat(
      extra.map(function (e, i) { return [e[0], e[1], palette[i % palette.length]]; })
    );
    wall.innerHTML = list.map(function (a) {
      return '<li><span class="coin-dot" style="--c:' + a[2] + '">' + a[0].charAt(0) +
        '</span><span class="asset-name"><b>' + a[0] + '</b><small>' + a[1] + "</small></span></li>";
    }).join("");
  })();

  /* ---------- Phone chart (mock bars) ---------- */
  (function phoneChart() {
    var chart = document.getElementById("phoneChart");
    if (!chart) return;
    var bars = 16, html = "";
    var trend = 0;
    for (var i = 0; i < bars; i++) {
      trend += (Math.random() - 0.45);
      var up = trend >= 0;
      var hpx = 20 + Math.random() * 70;
      html += '<span class="bar' + (up ? "" : " down") + '" style="height:' + hpx.toFixed(0) + '%"></span>';
    }
    chart.innerHTML = html;
  })();

  /* ---------- Signup form ---------- */
  var form = document.getElementById("signupForm");
  if (form) {
    var input = document.getElementById("emailInput");
    var hint = document.getElementById("formHint");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (input.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        input.setAttribute("aria-invalid", "true");
        if (hint) hint.textContent = "Please enter a valid email address.";
        input.focus();
        return;
      }
      input.removeAttribute("aria-invalid");
      if (hint) hint.textContent = "Demo only — no account was created and no email was sent.";
      input.value = "";
      toast("Welcome to the demo, " + val.split("@")[0] + "! (Simulated — no real account.)");
    });
  }

  /* ---------- Generic data-toast buttons ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-toast]"), function (el) {
    el.addEventListener("click", function (e) {
      if (el.tagName === "A") e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, 3200);
  }
})();
