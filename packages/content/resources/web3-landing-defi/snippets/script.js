// Luminal — DeFi protocol landing (UI-only simulation).
// No wallet, RPC or on-chain calls. All data is mock/fictional.
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast helper ---------- */
  var toastStack = document.getElementById("toastStack");
  function toast(msg, ms) {
    if (!toastStack) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastStack.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, ms || 2600);
  }

  /* ---------- Number formatting ---------- */
  function fmtUsd(n) {
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return "$" + n.toFixed(2);
  }
  function fmtInt(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  /* ---------- Count-up stats on scroll ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var fmt = el.getAttribute("data-format");
    var dur = 1600;
    var start = performance.now();
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var v = target * ease(p);
      el.textContent = fmt === "usd" ? fmtUsd(v) : fmtInt(v);
      if (p < 1) requestAnimationFrame(tick);
    }
    if (reduceMotion) {
      el.textContent = fmt === "usd" ? fmtUsd(target) : fmtInt(target);
    } else {
      requestAnimationFrame(tick);
    }
  }

  var statsRow = document.getElementById("statsRow");
  var statsDone = false;
  if (statsRow) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !statsDone) {
          statsDone = true;
          statsRow.querySelectorAll(".stat-num").forEach(countUp);
          statObs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statObs.observe(statsRow);
  }

  /* ---------- Generic reveal-on-scroll ---------- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(function (el) { revealObs.observe(el); });

  /* ---------- Markets table ---------- */
  var markets = [
    { sym: "NOVA",  name: "Nova Token",      chain: "Lumen Chain", color: "#7c5cff", price: 4.182,   supply: 3.5,  borrow: 6.1,  tvl: 842.1e6, util: 71 },
    { sym: "lmETH", name: "Lumen ETH",       chain: "Lumen Chain", color: "#00e0c6", price: 3128.40,  supply: 2.7,  borrow: 4.4,  tvl: 1240.6e6, util: 64 },
    { sym: "USDx",  name: "USD Stable",      chain: "Driftlane",   color: "#26d07c", price: 1.0001,   supply: 8.9,  borrow: 11.2, tvl: 612.3e6, util: 88 },
    { sym: "wBTL",  name: "Wrapped Bitlume", chain: "ZenithBridge", color: "#ffb347", price: 61840.0,  supply: 1.4,  borrow: 2.9,  tvl: 498.7e6, util: 42 },
    { sym: "stNOVA", name: "Staked NOVA",    chain: "Lumen Chain", color: "#b48cff", price: 4.510,    supply: 5.2,  borrow: 7.8,  tvl: 327.9e6, util: 79 }
  ];

  function shortPrice(p) {
    if (p >= 1000) return "$" + p.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (p >= 1) return "$" + p.toFixed(2);
    return "$" + p.toFixed(4);
  }

  var marketsBody = document.getElementById("marketsBody");
  function renderMarkets() {
    if (!marketsBody) return;
    marketsBody.innerHTML = "";
    markets.forEach(function (m) {
      var tr = document.createElement("tr");
      var hot = m.util >= 85 ? " hot" : "";
      tr.innerHTML =
        '<td><div class="asset-cell">' +
          '<span class="asset-icon" style="background:' + m.color + '">' + m.sym.slice(0, 2) + '</span>' +
          '<span><span class="asset-name">' + m.sym + '</span>' +
          '<span class="asset-chain">' + m.chain + '</span></span>' +
        '</div></td>' +
        '<td class="num">' + shortPrice(m.price) + '</td>' +
        '<td class="num pos" data-apr="supply">' + m.supply.toFixed(2) + '%</td>' +
        '<td class="num" data-apr="borrow">' + m.borrow.toFixed(2) + '%</td>' +
        '<td class="num hide-sm">' + fmtUsd(m.tvl) + '</td>' +
        '<td class="num hide-sm"><span class="util-wrap">' +
          '<span class="util-bar"><span class="util-fill' + hot + '" style="width:' + m.util + '%"></span></span>' +
          m.util + '%</span></td>' +
        '<td class="action-col"><button class="row-action" type="button" data-sym="' + m.sym + '">Supply</button></td>';
      marketsBody.appendChild(tr);
    });
  }
  renderMarkets();

  // Live-ish APR drift every few seconds with a flash.
  if (!reduceMotion) {
    setInterval(function () {
      var i = Math.floor(Math.random() * markets.length);
      var m = markets[i];
      m.supply = Math.max(0.3, +(m.supply + (Math.random() - 0.5) * 0.4).toFixed(2));
      m.borrow = Math.max(m.supply + 0.5, +(m.borrow + (Math.random() - 0.5) * 0.4).toFixed(2));
      var row = marketsBody.children[i];
      if (!row) return;
      var sCell = row.querySelector('[data-apr="supply"]');
      var bCell = row.querySelector('[data-apr="borrow"]');
      sCell.textContent = m.supply.toFixed(2) + "%";
      bCell.textContent = m.borrow.toFixed(2) + "%";
      [sCell, bCell].forEach(function (c) {
        c.classList.remove("apr-flash");
        void c.offsetWidth;
        c.classList.add("apr-flash");
      });
    }, 3200);
  }

  if (marketsBody) {
    marketsBody.addEventListener("click", function (e) {
      var btn = e.target.closest(".row-action");
      if (!btn) return;
      toast("Connect a wallet to supply " + btn.getAttribute("data-sym") + " — demo only.");
    });
  }

  /* ---------- Price ticker ---------- */
  var tickerTrack = document.getElementById("tickerTrack");
  var tickerTokens = [
    { sym: "NOVA", price: 4.18, chg: 4.2 },
    { sym: "lmETH", price: 3128.40, chg: 1.8 },
    { sym: "USDx", price: 1.00, chg: 0.01 },
    { sym: "wBTL", price: 61840, chg: -0.9 },
    { sym: "stNOVA", price: 4.51, chg: 2.6 },
    { sym: "LUMI", price: 0.842, chg: 9.4 },
    { sym: "ZEN", price: 12.07, chg: -2.1 },
    { sym: "DRFT", price: 0.318, chg: 5.7 }
  ];
  function tickerItem(t) {
    var cls = t.chg >= 0 ? "pos" : "neg";
    var arrow = t.chg >= 0 ? "▲" : "▼";
    var price = t.price >= 1000 ? t.price.toLocaleString("en-US") : t.price.toFixed(t.price < 1 ? 3 : 2);
    return '<span class="ticker-item">' +
      '<span class="ticker-sym">' + t.sym + '</span>' +
      '<span class="ticker-price">$' + price + '</span>' +
      '<span class="' + cls + '">' + arrow + " " + Math.abs(t.chg).toFixed(1) + '%</span>' +
      '</span>';
  }
  function renderTicker() {
    if (!tickerTrack) return;
    var html = tickerTokens.map(tickerItem).join("");
    tickerTrack.innerHTML = html + html; // duplicate for seamless loop
  }
  renderTicker();
  if (!reduceMotion) {
    setInterval(function () {
      tickerTokens.forEach(function (t) {
        var drift = (Math.random() - 0.5) * 0.012;
        t.price = +(t.price * (1 + drift)).toFixed(t.price < 1 ? 4 : 2);
        t.chg = +(t.chg + (Math.random() - 0.5) * 0.6).toFixed(1);
      });
      renderTicker();
    }, 4000);
  }

  /* ---------- Copy contract address ---------- */
  var copyAddr = document.getElementById("copyAddr");
  if (copyAddr) {
    copyAddr.addEventListener("click", function () {
      var full = "0x7a3f9c2e4b8d1a06f5e3c2b7a9d8e1f40c41d";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(full).then(
          function () { toast("Contract address copied"); },
          function () { toast("Copy failed — select manually"); }
        );
      } else {
        toast("Clipboard unavailable in this context");
      }
    });
  }

  /* ---------- Launch-app confirm modal (risk gate) ---------- */
  var modal = document.getElementById("launchModal");
  var riskCheck = document.getElementById("riskCheck");
  var modalConfirm = document.getElementById("modalConfirm");
  var modalCancel = document.getElementById("modalCancel");
  var lastFocus = null;

  function openModal(trigger) {
    if (!modal) return;
    lastFocus = trigger || document.activeElement;
    modal.hidden = false;
    if (riskCheck) riskCheck.checked = false;
    if (modalConfirm) modalConfirm.disabled = true;
    document.body.style.overflow = "hidden";
    (modalCancel || modal).focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll("[data-launch]").forEach(function (b) {
    b.addEventListener("click", function () { openModal(b); });
  });
  if (riskCheck) {
    riskCheck.addEventListener("change", function () {
      if (modalConfirm) modalConfirm.disabled = !riskCheck.checked;
    });
  }
  if (modalCancel) modalCancel.addEventListener("click", closeModal);
  if (modalConfirm) {
    modalConfirm.addEventListener("click", function () {
      closeModal();
      toast("Entering Luminal app… (demo — no real app to open)");
    });
  }
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  /* ---------- Misc buttons ---------- */
  var docsBtn = document.getElementById("docsBtn");
  if (docsBtn) docsBtn.addEventListener("click", function () { toast("Docs are part of the demo — nothing to open."); });
  var govBtn = document.getElementById("govBtn");
  if (govBtn) govBtn.addEventListener("click", function () { toast("Proposal LIP-042 is a simulated example."); });

  /* ---------- Animated mesh / gradient hero ---------- */
  var canvas = document.getElementById("mesh");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var blobs = [
      { x: 0.25, y: 0.30, r: 0.42, c: [124, 92, 255], vx: 0.00010, vy: 0.00014 },
      { x: 0.72, y: 0.40, r: 0.40, c: [0, 224, 198], vx: -0.00013, vy: 0.00009 },
      { x: 0.50, y: 0.70, r: 0.36, c: [180, 120, 255], vx: 0.00008, vy: -0.00012 }
    ];
    var W = 0, H = 0;
    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = Math.max(1, rect.width * dpr);
      H = canvas.height = Math.max(1, rect.height * dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    var t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      blobs.forEach(function (b, i) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0.1 || b.x > 0.9) b.vx *= -1;
        if (b.y < 0.1 || b.y > 0.9) b.vy *= -1;
        var wob = Math.sin(t / 60 + i) * 0.04;
        var cx = b.x * W, cy = b.y * H, rad = (b.r + wob) * Math.max(W, H);
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, "rgba(" + b.c[0] + "," + b.c[1] + "," + b.c[2] + ",0.55)");
        g.addColorStop(1, "rgba(" + b.c[0] + "," + b.c[1] + "," + b.c[2] + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
      t++;
      requestAnimationFrame(draw);
    }
    draw();
  } else if (canvas) {
    // Static fallback gradient for reduced motion.
    canvas.style.background =
      "radial-gradient(40% 50% at 30% 35%, rgba(124,92,255,.4), transparent), " +
      "radial-gradient(40% 50% at 72% 45%, rgba(0,224,198,.35), transparent)";
  }
})();
