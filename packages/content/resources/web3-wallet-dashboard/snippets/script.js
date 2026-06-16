/* Lumen Wallet — UI-only simulation. No real wallet, RPC, or on-chain calls. */
(function () {
  "use strict";

  /* ---------------- Mock data ---------------- */
  var ADDRESS = "0x7a3f9d2b8c4e1f0a6b5d3e2c9f87a14d3b21c41d";

  var NETWORKS = {
    lumen: { label: "Lumen Chain" },
    nebula: { label: "Nebula" },
    aurora: { label: "Aurora Testnet" },
    solara: { label: "Solara" },
  };

  var TOKENS = [
    { sym: "NOVA", name: "Nova Protocol", color: "#7c5cff", price: 12.4, chg: 2.71, bal: 1820.42 },
    { sym: "USDL", name: "Lumen USD", color: "#00e0c6", price: 1.0, chg: 0.01, bal: 9640.0 },
    { sym: "ETHR", name: "Ether (wrapped)", color: "#8da2ff", price: 1842.6, chg: -1.34, bal: 4.812 },
    { sym: "PULSE", name: "Pulse", color: "#ffb347", price: 0.284, chg: 6.92, bal: 21450.0 },
    { sym: "GLOW", name: "Glow Finance", color: "#ff6ad5", price: 3.18, chg: -3.08, bal: 612.5 },
    { sym: "AQUA", name: "Aqua", color: "#46c8ff", price: 0.0412, chg: 0.42, bal: 88200.0 },
    { sym: "ORBIT", name: "Orbit DAO", color: "#9d6bff", price: 7.65, chg: 1.18, bal: 96.3 },
  ];

  var NFTS = [
    { name: "Voidwalker #214", coll: "Lumen Genesis", price: 4.2, floor: 3.8, g: ["#7c5cff", "#00e0c6"], shape: "rings" },
    { name: "Prism Cat #07", coll: "Neon Felines", price: 1.05, floor: 0.92, g: ["#ff6ad5", "#ffb347"], shape: "tri" },
    { name: "Aurora Key", coll: "Solara Vaults", price: 12.0, floor: 9.4, g: ["#46c8ff", "#7c5cff"], shape: "grid" },
    { name: "Glitch Bloom", coll: "Static Garden", price: 0.74, floor: 0.6, g: ["#26d07c", "#00e0c6"], shape: "blob" },
    { name: "Mono Mask #88", coll: "Faceless", price: 2.3, floor: 2.1, g: ["#ffb347", "#ff4d6d"], shape: "tri" },
    { name: "Deep Signal", coll: "Lumen Genesis", price: 5.6, floor: 4.9, g: ["#9d6bff", "#ff6ad5"], shape: "rings" },
  ];

  var ACTIVITY = [
    { type: "recv", title: "Received NOVA", from: "0x4d21…9af3", amt: "+120.00 NOVA", sub: "2m ago", status: "confirmed", pos: true },
    { type: "swap", title: "Swap ETHR → USDL", from: "Lumen DEX", amt: "+1,842.60 USDL", sub: "31m ago", status: "confirmed", pos: true },
    { type: "send", title: "Sent USDL", from: "0x91be…02cc", amt: "-450.00 USDL", sub: "1h ago", status: "pending" },
    { type: "mint", title: "Minted Voidwalker #214", from: "Lumen Genesis", amt: "-4.20 NOVA", sub: "4h ago", status: "confirmed" },
    { type: "send", title: "Sent GLOW", from: "0x7f08…12ba", amt: "-60.00 GLOW", sub: "Yesterday", status: "failed" },
    { type: "recv", title: "Received PULSE", from: "0x2a55…cd71", amt: "+9,000 PULSE", sub: "Yesterday", status: "confirmed", pos: true },
  ];

  /* ---------------- Helpers ---------------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function fmt(n, d) {
    return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function truncAddr(a) { return a.slice(0, 6) + "…" + a.slice(-4); }

  var toastWrap = $("#toastWrap");
  function toast(msg, mono) {
    var t = el("div", "toast");
    t.innerHTML = '<span class="t-dot"></span><span>' + msg + "</span>" +
      (mono ? '<span class="t-mono">' + mono + "</span>" : "");
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 320);
    }, 2600);
  }

  /* ---------------- Animated number ---------------- */
  function animateNum(node, target, decimals, prefix) {
    var start = 0;
    var dur = 1100;
    var t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      var v = start + (target - start) * e;
      node.textContent = (prefix || "") + fmt(v, decimals);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------------- Render: hero ---------------- */
  var totalValue = TOKENS.reduce(function (s, t) { return s + t.price * t.bal; }, 0);
  var heroNum = $("#heroNum");
  var heroDec = $("#heroDec");
  var whole = Math.floor(totalValue);
  var dec = Math.round((totalValue - whole) * 100);
  heroDec.textContent = "." + String(dec).padStart(2, "0");
  animateNum(heroNum, whole, 0);

  /* ---------------- Render: allocation donut ---------------- */
  var grouped = TOKENS.map(function (t) { return { sym: t.sym, color: t.color, val: t.price * t.bal }; })
    .sort(function (a, b) { return b.val - a.val; });
  var top = grouped.slice(0, 3);
  var otherVal = grouped.slice(3).reduce(function (s, x) { return s + x.val; }, 0);
  var segs = top.concat([{ sym: "Other", color: "#ff6ad5", val: otherVal }]);
  var R = 48;
  var CIRC = 2 * Math.PI * R;
  var offset = 0;
  var segNodes = document.querySelectorAll(".donut-seg");
  var legend = $("#allocLegend");
  segs.forEach(function (s, i) {
    var pct = s.val / totalValue;
    var len = pct * CIRC;
    var node = segNodes[i];
    // gap of 2px between segments
    var gap = 2;
    node.style.strokeDashoffset = -offset;
    setTimeout(function () {
      node.style.strokeDasharray = Math.max(0, len - gap) + " " + (CIRC - len + gap);
    }, 80 + i * 90);
    offset += len;

    var li = el("li");
    li.innerHTML =
      '<span class="lg-dot" style="background:' + s.color + '"></span>' +
      '<span class="lg-name">' + s.sym + "</span>" +
      '<span class="lg-pct mono">' + (pct * 100).toFixed(1) + "%</span>";
    legend.appendChild(li);
  });

  /* ---------------- Render: tokens ---------------- */
  var tokenList = $("#tokenList");
  TOKENS.slice().sort(function (a, b) { return b.price * b.bal - a.price * a.bal; }).forEach(function (t) {
    var value = t.price * t.bal;
    var up = t.chg >= 0;
    var balDecimals = t.bal >= 1000 ? 2 : 4;
    var li = el("li", "token-row");
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.innerHTML =
      '<div class="tk-asset">' +
        '<span class="tk-logo" style="background:' + t.color + '">' + t.sym.slice(0, 3) + "</span>" +
        "<span><div class=\"tk-name\">" + t.sym + "</div><div class=\"tk-full\">" + t.name + "</div></span>" +
      "</div>" +
      '<div class="tk-price">' +
        '<div class="tk-price-v mono">$' + fmt(t.price, t.price < 1 ? 4 : 2) + "</div>" +
        '<div class="tk-chg ' + (up ? "up" : "down") + ' mono">' + (up ? "+" : "") + t.chg.toFixed(2) + "%</div>" +
      "</div>" +
      '<div class="tk-bal">' +
        '<div class="mono">' + fmt(t.bal, balDecimals) + "</div>" +
        '<div class="tk-bal-sub mono">' + t.sym + "</div>" +
      "</div>" +
      '<div class="tk-val mono">$' + fmt(value, 2) + "</div>";
    li.addEventListener("click", function () { toast("Opening " + t.sym + " details", truncAddr(ADDRESS)); });
    li.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); } });
    tokenList.appendChild(li);
  });

  /* ---------------- Render: NFTs ---------------- */
  var nftGrid = $("#nftGrid");
  function artInner(n) {
    var g = "linear-gradient(135deg," + n.g[0] + "," + n.g[1] + ")";
    var deco = "";
    if (n.shape === "rings") {
      deco = '<span style="position:absolute;inset:18%;border:2px solid rgba(255,255,255,.6);border-radius:50%"></span>' +
             '<span style="position:absolute;inset:34%;border:2px solid rgba(255,255,255,.45);border-radius:50%"></span>' +
             '<span style="position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px;background:#fff;border-radius:50%;opacity:.85"></span>';
    } else if (n.shape === "tri") {
      deco = '<span style="position:absolute;left:50%;top:54%;transform:translate(-50%,-50%);width:0;height:0;border-left:30px solid transparent;border-right:30px solid transparent;border-bottom:52px solid rgba(255,255,255,.78)"></span>';
    } else if (n.shape === "grid") {
      deco = '<span style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 13px,rgba(255,255,255,.28) 13px 15px),repeating-linear-gradient(90deg,transparent 0 13px,rgba(255,255,255,.28) 13px 15px)"></span>';
    } else {
      deco = '<span style="position:absolute;inset:24%;background:rgba(255,255,255,.78);border-radius:46% 54% 38% 62%/52% 40% 60% 48%"></span>';
    }
    return '<div class="nft-art" style="background:' + g + '">' + deco + "</div>";
  }
  NFTS.forEach(function (n) {
    var card = el("div", "nft-card");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.innerHTML =
      artInner(n) +
      '<div class="nft-meta">' +
        '<div class="nft-name">' + n.name + "</div>" +
        '<div class="nft-coll">' + n.coll + "</div>" +
        '<div class="nft-price"><b class="mono">' + n.price.toFixed(2) + "</b> NOVA" +
          '<span class="nft-floor mono">floor ' + n.floor.toFixed(2) + "</span></div>" +
      "</div>";
    card.addEventListener("click", function () { toast("Viewing " + n.name, n.price.toFixed(2) + " NOVA"); });
    card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); } });
    nftGrid.appendChild(card);
  });

  /* ---------------- Render: activity ---------------- */
  var ICONS = {
    send: '<path d="M10 16V5m0 0L5.5 9.5M10 5l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    recv: '<path d="M10 4v11m0 0 4.5-4.5M10 15l-4.5-4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    swap: '<path d="M5 7h9m0 0-3-3m3 3-3 3M15 13H6m0 0 3 3m-3-3 3-3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    mint: '<path d="M10 5v10M5 10h10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  };
  var actList = $("#actList");
  ACTIVITY.forEach(function (a) {
    var li = el("li", "act-item");
    li.innerHTML =
      '<span class="act-ico ' + a.type + '"><svg viewBox="0 0 20 20" aria-hidden="true">' + ICONS[a.type] + "</svg></span>" +
      '<div class="act-body">' +
        '<div class="act-title">' + a.title + "</div>" +
        '<div class="act-sub"><span class="mono">' + a.from + "</span><span>·</span><span>" + a.sub + "</span></div>" +
      "</div>" +
      "<div>" +
        '<div class="act-amt ' + (a.pos ? "pos" : "neg") + ' mono">' + a.amt + "</div>" +
        '<div style="text-align:right;margin-top:4px"><span class="act-status ' + a.status + '">' + a.status + "</span></div>" +
      "</div>";
    actList.appendChild(li);
  });

  /* ---------------- Tabs ---------------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var ink = $("#tabInk");
  function moveInk(tab) {
    ink.style.left = tab.offsetLeft + "px";
    ink.style.width = tab.offsetWidth + "px";
  }
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".tabpanel").forEach(function (p) {
      var on = p.getAttribute("data-panel") === tab.getAttribute("data-tab");
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
    moveInk(tab);
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () { selectTab(t); });
  });
  // init ink after layout
  requestAnimationFrame(function () { moveInk($(".tab.is-active")); });
  window.addEventListener("resize", function () { moveInk($(".tab.is-active")); });

  /* ---------------- Hide / show balances ---------------- */
  var app = $("#app");
  var eyeBtn = $("#eyeBtn");
  eyeBtn.addEventListener("click", function () {
    var hidden = app.classList.toggle("is-hidden");
    eyeBtn.setAttribute("aria-pressed", hidden ? "true" : "false");
    eyeBtn.setAttribute("aria-label", hidden ? "Show balances" : "Hide balances");
    toast(hidden ? "Balances hidden" : "Balances visible");
  });

  /* ---------------- Address copy ---------------- */
  $("#addrChip").addEventListener("click", function () {
    var done = function () { toast("Address copied", truncAddr(ADDRESS)); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ADDRESS).then(done, done);
    } else { done(); }
  });

  /* ---------------- Network switcher ---------------- */
  var netBtn = $("#netBtn");
  var netMenu = $("#netMenu");
  var netLabel = $("#netLabel");
  var netDot = $("#netDot");
  var heroChain = $("#heroChain");

  function closeNet() {
    netMenu.hidden = true;
    netBtn.setAttribute("aria-expanded", "false");
  }
  netBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = netMenu.hidden;
    netMenu.hidden = !open;
    netBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  netMenu.querySelectorAll("li").forEach(function (li) {
    function pick() {
      var key = li.getAttribute("data-net");
      netMenu.querySelectorAll("li").forEach(function (x) { x.classList.remove("is-active"); });
      li.classList.add("is-active");
      netDot.setAttribute("data-net", key);
      netLabel.textContent = NETWORKS[key].label;
      heroChain.textContent = NETWORKS[key].label;
      closeNet();
      toast("Switched to " + NETWORKS[key].label);
    }
    li.addEventListener("click", pick);
    li.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  document.addEventListener("click", function (e) {
    if (!$("#netSwitch").contains(e.target)) closeNet();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNet(); });

  /* ---------------- Action buttons ---------------- */
  document.querySelectorAll(".act[data-act]").forEach(function (b) {
    b.addEventListener("click", function () {
      var a = b.getAttribute("data-act");
      if (a === "Swap") { openSwap(); return; }
      toast(a + " — opening flow", truncAddr(ADDRESS));
    });
  });

  /* ---------------- Swap modal ---------------- */
  var swapModal = $("#swapModal");
  var payAmt = $("#payAmt");
  var getAmt = $("#getAmt");
  var swapRate = $("#swapRate");
  var swapConfirm = $("#swapConfirm");
  var RATE = 12.4;
  var swapState = { from: "NOVA", to: "USDL" };

  function recalc() {
    var v = parseFloat(payAmt.value) || 0;
    var out = swapState.from === "NOVA" ? v * RATE : v / RATE;
    getAmt.value = fmt(out, 2);
    var r = swapState.from === "NOVA"
      ? "1 NOVA = " + RATE.toFixed(2) + " USDL"
      : "1 USDL = " + (1 / RATE).toFixed(4) + " NOVA";
    swapRate.textContent = r;
  }
  function openSwap() {
    swapModal.hidden = false;
    recalc();
    setTimeout(function () { payAmt.focus(); payAmt.select(); }, 60);
  }
  function closeSwap() { swapModal.hidden = true; }

  swapModal.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", closeSwap); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !swapModal.hidden) closeSwap(); });
  payAmt.addEventListener("input", recalc);

  $("#swapFlip").addEventListener("click", function () {
    var fromTok = $(".swap-row:first-child .swap-tok");
    var toTok = $(".swap-row:last-child .swap-tok");
    var tmp = swapState.from; swapState.from = swapState.to; swapState.to = tmp;
    fromTok.textContent = swapState.from;
    toTok.textContent = swapState.to;
    recalc();
  });

  swapConfirm.addEventListener("click", function () {
    if (swapConfirm.classList.contains("is-loading")) return;
    swapConfirm.classList.add("is-loading");
    setTimeout(function () {
      swapConfirm.classList.remove("is-loading");
      closeSwap();
      var hash = "0x" + Math.random().toString(16).slice(2, 6) + "…" + Math.random().toString(16).slice(2, 6);
      toast("Swap submitted (simulated)", hash);
    }, 1700);
  });

  /* ---------------- Live PnL drift (cosmetic) ---------------- */
  var pnlPctNode = $("#heroPnl .pnl-pct");
  var pnlValNode = $("#heroPnlVal");
  var pnlWrap = $("#heroPnl");
  var pnlPct = 2.74;
  setInterval(function () {
    if (app.classList.contains("is-hidden")) return;
    pnlPct += (Math.random() - 0.48) * 0.18;
    var pnlVal = totalValue * (pnlPct / 100);
    var up = pnlPct >= 0;
    pnlPctNode.textContent = (up ? "+" : "") + pnlPct.toFixed(2) + "%";
    pnlValNode.textContent = (up ? "+$" : "-$") + fmt(Math.abs(pnlVal), 2);
    pnlWrap.classList.toggle("pnl-pos", up);
    pnlWrap.classList.toggle("pnl-neg", !up);
  }, 6000);
})();
