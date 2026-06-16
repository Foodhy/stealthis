/* VOIDLINGS — NFT collection landing (UI simulation only). No wallet/RPC/on-chain calls. */
(function () {
  "use strict";

  /* ---------- config / mock state ---------- */
  var TOTAL = 8888;
  var PRICE = 0.069;          // ◇ per mint
  var MAX_PER_WALLET = 5;
  var state = {
    minted: 6213,
    qty: 1,
    connected: false,
    minting: false,
  };

  var $ = function (id) { return document.getElementById(id); };
  var nf = new Intl.NumberFormat("en-US");

  /* ---------- toast ---------- */
  function toast(msg, ok) {
    var host = $("toastHost");
    var el = document.createElement("div");
    el.className = "toast" + (ok ? " ok" : "");
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
  }

  /* ---------- deterministic pseudo-random from seed ---------- */
  function rng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  /* ---------- generative PFP (CSS-drawn) ---------- */
  var BG_DUOS = [
    ["#ff4d8d", "#b86bff"], ["#3fd0ff", "#7c5cff"], ["#ff4d8d", "#3fd0ff"],
    ["#b86bff", "#3fd0ff"], ["#ff6ec7", "#ffb347"], ["#7c5cff", "#ff4d8d"],
  ];
  function buildPfp(seed) {
    var r = rng(seed);
    var duo = BG_DUOS[Math.floor(r() * BG_DUOS.length)];
    var angle = Math.floor(r() * 360);
    var el = document.createElement("div");
    el.style.background = "linear-gradient(" + angle + "deg," + duo[0] + "," + duo[1] + ")";
    el.style.position = "relative";
    el.style.width = "100%";
    el.style.height = "100%";
    // face plate
    var face = document.createElement("div");
    var fs = 44 + Math.floor(r() * 14);
    face.style.cssText = "position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);" +
      "width:" + fs + "%;height:" + (fs + 6) + "%;border-radius:" + (18 + r() * 30) + "%;" +
      "background:rgba(13,6,24,0.78);box-shadow:0 0 16px rgba(0,0,0,0.4) inset;";
    el.appendChild(face);
    // eyes
    var eyeColors = ["#3fd0ff", "#ff4d8d", "#26d07c", "#ffb347", "#fff"];
    var ec = eyeColors[Math.floor(r() * eyeColors.length)];
    var ew = 9 + Math.floor(r() * 7);
    function eye(left) {
      var e = document.createElement("div");
      e.style.cssText = "position:absolute;top:42%;" + (left ? "left:33%" : "right:33%") +
        ";width:" + ew + "%;aspect-ratio:1;border-radius:50%;background:" + ec +
        ";box-shadow:0 0 10px " + ec + ";transform:translateY(-50%);";
      face.appendChild(e);
    }
    eye(true); eye(false);
    // mouth glitch bar
    var mouth = document.createElement("div");
    mouth.style.cssText = "position:absolute;left:50%;bottom:22%;transform:translateX(-50%);" +
      "width:" + (24 + r() * 22) + "%;height:" + (4 + r() * 5) + "%;border-radius:2px;background:" +
      ec + ";opacity:0.85;";
    face.appendChild(mouth);
    // scanline glitch
    var sl = document.createElement("div");
    sl.style.cssText = "position:absolute;inset:0;background:repeating-linear-gradient(0deg," +
      "rgba(255,255,255,0.05) 0 1px,transparent 1px 4px);mix-blend-mode:overlay;";
    el.appendChild(sl);
    return el;
  }

  /* ---------- marquee ---------- */
  function buildMarquee() {
    var wrap = $("marquee");
    if (!wrap) return;
    var n = 12;
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < n; i++) {
        var card = document.createElement("div");
        card.className = "pfp";
        card.appendChild(buildPfp(1000 + i * 37));
        wrap.appendChild(card);
      }
    }
  }

  /* ---------- rarity grid ---------- */
  var RARITY = [
    { name: "Void #0042", tier: "Legendary", traits: { Base: "Phantom", Eyes: "Singularity", Glitch: "Total", Score: "9.8" } },
    { name: "Void #1180", tier: "Rare", traits: { Base: "Plasma", Eyes: "Cyan Burn", Glitch: "Heavy", Score: "7.2" } },
    { name: "Void #3391", tier: "Common", traits: { Base: "Static", Eyes: "Dim", Glitch: "Light", Score: "3.1" } },
    { name: "Void #5567", tier: "Rare", traits: { Base: "Aurora", Eyes: "Pink Pulse", Glitch: "Heavy", Score: "6.9" } },
    { name: "Void #0777", tier: "Legendary", traits: { Base: "Genesis", Eyes: "Twin Sun", Glitch: "Corrupted", Score: "9.4" } },
    { name: "Void #6620", tier: "Common", traits: { Base: "Ash", Eyes: "Void", Glitch: "Faint", Score: "2.6" } },
    { name: "Void #2048", tier: "Rare", traits: { Base: "Neon", Eyes: "Strobe", Glitch: "Medium", Score: "5.8" } },
    { name: "Void #8888", tier: "Legendary", traits: { Base: "Omega", Eyes: "Eclipse", Glitch: "Maxed", Score: "10.0" } },
  ];
  function buildRarity() {
    var grid = $("rarityGrid");
    if (!grid) return;
    RARITY.forEach(function (item, idx) {
      var card = document.createElement("article");
      card.className = "rarity-card";
      card.tabIndex = 0;
      var art = document.createElement("div");
      art.className = "rarity-art";
      art.appendChild(buildPfp(7 + idx * 311));
      var overlay = document.createElement("div");
      overlay.className = "rarity-overlay";
      Object.keys(item.traits).forEach(function (k) {
        var row = document.createElement("div");
        row.className = "trait-row";
        row.innerHTML = "<span>" + k + "</span><span>" + item.traits[k] + "</span>";
        overlay.appendChild(row);
      });
      art.appendChild(overlay);
      var meta = document.createElement("div");
      meta.className = "rarity-meta";
      meta.innerHTML = '<span class="rarity-name">' + item.name + '</span>' +
        '<span class="rarity-tier tier-' + item.tier + '">' + item.tier.toUpperCase() + '</span>';
      card.appendChild(art);
      card.appendChild(meta);
      grid.appendChild(card);
    });
  }

  /* ---------- team ---------- */
  var TEAM = [
    { name: "0xNULL", role: "Founder / Static Architect", handle: "@0xnull" },
    { name: "Hex", role: "Generative Engine", handle: "@hex_renders" },
    { name: "Mira Vex", role: "Community / Swarm Ops", handle: "@miravex" },
    { name: "Glitchwizard", role: "Smart Contracts", handle: "@gwiz.eth" },
  ];
  function buildTeam() {
    var grid = $("teamGrid");
    if (!grid) return;
    TEAM.forEach(function (m, idx) {
      var card = document.createElement("div");
      card.className = "team-card";
      var ava = document.createElement("div");
      ava.className = "team-ava";
      ava.appendChild(buildPfp(900 + idx * 53));
      ava.firstChild.style.borderRadius = "50%";
      card.appendChild(ava);
      var info = document.createElement("div");
      info.innerHTML = '<div class="team-name">' + m.name + '</div>' +
        '<div class="team-role">' + m.role + '</div>' +
        '<div class="team-handle">' + m.handle + '</div>';
      card.appendChild(info);
      grid.appendChild(card);
    });
  }

  /* ---------- faq ---------- */
  var FAQ = [
    { q: "What is a Voidling?", a: "A Voidling is a fully on-chain-seeded generative PFP minted on Lumen Chain. Each one is derived from your mint block hash, so no two glitches are alike." },
    { q: "How much does it cost to mint?", a: "Public mint is 0.069 ◇ per Voidling, with a maximum of 5 per wallet. Gas is paid in $LUMEN. This demo charges nothing — it is a UI simulation." },
    { q: "When is the reveal?", a: "Art reveals 24 hours after the public mint sells out, using an on-chain RNG seed so the order can be verified by anyone." },
    { q: "What utility do holders get?", a: "Voidnet access, $NOISE staking emissions, mutation labs, and gated seasonal void drops. Roadmap phases 02 and 03 unlock these." },
    { q: "Is the art CC0?", a: "Yes. Remix, print, animate, or fork your Voidling anywhere. The static belongs to the swarm." },
  ];
  function buildFaq() {
    var list = $("faq-list");
    if (!list) return;
    FAQ.forEach(function (item) {
      var wrap = document.createElement("div");
      wrap.className = "faq-item";
      var btn = document.createElement("button");
      btn.className = "faq-q";
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = '<span>' + item.q + '</span><span class="chev" aria-hidden="true">+</span>';
      var ans = document.createElement("div");
      ans.className = "faq-a";
      ans.innerHTML = "<p>" + item.a + "</p>";
      btn.addEventListener("click", function () {
        var open = wrap.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        ans.style.maxHeight = open ? ans.scrollHeight + "px" : "0";
      });
      wrap.appendChild(btn);
      wrap.appendChild(ans);
      list.appendChild(wrap);
    });
  }

  /* ---------- animated count-up (hero stats) ---------- */
  function animateCounts() {
    document.querySelectorAll(".stat-num[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
      var start = performance.now();
      var dur = 1400;
      function tick(now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        var val = target * eased;
        el.textContent = dec ? val.toFixed(dec) : nf.format(Math.round(val));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- progress ---------- */
  function renderProgress() {
    var pct = (state.minted / TOTAL) * 100;
    $("progressFill").style.width = pct.toFixed(2) + "%";
    $("mintedLabel").textContent = nf.format(state.minted) + " / " + nf.format(TOTAL) + " minted";
    $("pctLabel").textContent = pct.toFixed(1) + "%";
    var bar = $("progressBar");
    bar.setAttribute("aria-valuenow", String(state.minted));
  }

  /* ---------- qty + cost ---------- */
  function renderCost() {
    $("qtyVal").textContent = String(state.qty);
    $("costVal").textContent = (state.qty * PRICE).toFixed(3) + " ◇";
    $("qtyMinus").disabled = state.qty <= 1 || state.minting;
    $("qtyPlus").disabled = state.qty >= MAX_PER_WALLET || state.minting;
  }

  /* ---------- countdown ---------- */
  function startCountdown() {
    var end = Date.now() + (2 * 24 * 3600 + 7 * 3600 + 41 * 60 + 12) * 1000;
    function pad(n) { return String(n).padStart(2, "0"); }
    function tick() {
      var diff = Math.max(0, end - Date.now());
      var s = Math.floor(diff / 1000);
      $("cd-d").textContent = pad(Math.floor(s / 86400));
      $("cd-h").textContent = pad(Math.floor((s % 86400) / 3600));
      $("cd-m").textContent = pad(Math.floor((s % 3600) / 60));
      $("cd-s").textContent = pad(s % 60);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- mint flow (simulated) ---------- */
  function doMint() {
    if (state.minting) return;
    if (!state.connected) {
      toast("Connect your wallet to mint.");
      return;
    }
    if (state.minted + state.qty > TOTAL) {
      toast("Not enough supply left for that quantity.");
      return;
    }
    state.minting = true;
    var btn = $("mintBtn");
    var label = btn.querySelector(".mint-btn-label");
    btn.disabled = true;
    label.innerHTML = '<span class="spinner"></span> Confirm in wallet…';
    renderCost();

    // simulated signing + confirmation
    setTimeout(function () {
      label.textContent = "Minting on Lumen Chain…";
    }, 900);

    setTimeout(function () {
      var n = state.qty;
      state.minted += n;
      renderProgress();
      state.minting = false;
      btn.classList.add("is-done");
      label.textContent = "✓ Minted " + n + " Voidling" + (n > 1 ? "s" : "") + "!";
      toast("Success — minted " + n + " Voidling" + (n > 1 ? "s" : "") + ". Reveal in 24h.", true);
      setTimeout(function () {
        btn.classList.remove("is-done");
        btn.disabled = false;
        label.textContent = "Mint now";
        renderCost();
      }, 2600);
    }, 2100);
  }

  /* ---------- wallet connect (simulated) ---------- */
  function connectWallet() {
    if (state.connected) {
      toast("Wallet already connected: 0x4f2a…9e1b");
      return;
    }
    var btn = $("connectBtn");
    btn.textContent = "Connecting…";
    setTimeout(function () {
      state.connected = true;
      btn.textContent = "0x4f2a…9e1b";
      btn.classList.add("connected");
      toast("Wallet connected on Lumen Chain.", true);
    }, 800);
  }

  /* ---------- wire up ---------- */
  function init() {
    buildMarquee();
    buildRarity();
    buildTeam();
    buildFaq();
    renderProgress();
    renderCost();
    startCountdown();
    animateCounts();

    $("qtyMinus").addEventListener("click", function () {
      if (state.qty > 1) { state.qty--; renderCost(); }
    });
    $("qtyPlus").addEventListener("click", function () {
      if (state.qty < MAX_PER_WALLET) { state.qty++; renderCost(); }
      else toast("Max " + MAX_PER_WALLET + " per wallet.");
    });
    $("mintBtn").addEventListener("click", doMint);
    $("connectBtn").addEventListener("click", connectWallet);

    var addr = $("contractAddr");
    function copyAddr() {
      var full = "0x7a3f4b2c9d8e1f0a6b5c4d3e2f1a0b9c8d7e6f5a";
      if (navigator.clipboard) navigator.clipboard.writeText(full).catch(function () {});
      toast("Contract address copied.", true);
    }
    addr.addEventListener("click", copyAddr);
    addr.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copyAddr(); }
    });

    document.querySelectorAll("[data-social]").forEach(function (b) {
      b.addEventListener("click", function () {
        toast("Opening " + b.getAttribute("data-social") + " (demo — no real link).");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
