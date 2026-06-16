(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    if (!toastWrap) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2200);
  }

  /* ---------- squish on press + optional toast ---------- */
  document.querySelectorAll("[data-squish]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.classList.remove("squish");
      // reflow to restart animation
      void btn.offsetWidth;
      btn.classList.add("squish");
      var msg = btn.getAttribute("data-toast");
      if (msg) toast(msg);
    });
    btn.addEventListener("animationend", function () {
      btn.classList.remove("squish");
    });
  });

  /* ---------- candy grid ---------- */
  var grid = document.getElementById("grid");
  var scoreEl = document.getElementById("score");
  var CANDIES = [
    { c: "c1", e: "🍓" },
    { c: "c2", e: "🍋" },
    { c: "c3", e: "🫐" },
    { c: "c4", e: "🍏" },
    { c: "c5", e: "🍇" }
  ];
  var COLS = 6, ROWS = 6;
  var score = 12480;

  function randCandy() { return CANDIES[Math.floor(Math.random() * CANDIES.length)]; }

  function makeTile() {
    var k = randCandy();
    var t = document.createElement("button");
    t.className = "tile " + k.c;
    t.type = "button";
    t.textContent = k.e;
    t.tabIndex = -1;
    t.addEventListener("click", function () { popTile(t); });
    return t;
  }

  function buildGrid() {
    if (!grid) return;
    grid.innerHTML = "";
    for (var i = 0; i < COLS * ROWS; i++) grid.appendChild(makeTile());
  }

  function setTile(t) {
    var k = randCandy();
    t.className = "tile " + k.c;
    t.textContent = k.e;
  }

  function bumpScore(n) {
    score += n;
    if (scoreEl) scoreEl.textContent = score.toLocaleString();
  }

  function popTile(t) {
    t.classList.remove("pop");
    void t.offsetWidth;
    t.classList.add("pop");
    bumpScore(40 + Math.floor(Math.random() * 60));
    setTimeout(function () { setTile(t); }, 200);
  }

  buildGrid();

  /* ---------- ambient auto-bounce of random tiles ---------- */
  var autoTimer = setInterval(function () {
    if (!grid || document.hidden) return;
    var tiles = grid.querySelectorAll(".tile");
    if (!tiles.length) return;
    var pick = tiles[Math.floor(Math.random() * tiles.length)];
    pick.classList.remove("pop");
    void pick.offsetWidth;
    pick.classList.add("pop");
    setTimeout(function () { setTile(pick); }, 200);
  }, 1100);

  /* ---------- shuffle button ---------- */
  var shuffle = document.getElementById("shuffle");
  if (shuffle) {
    shuffle.addEventListener("click", function () {
      grid.querySelectorAll(".tile").forEach(function (t, idx) {
        setTimeout(function () { popTile(t); }, idx * 14);
      });
      toast("Board shuffled! 🔀");
    });
  }

  /* ---------- download count-up (on view) ---------- */
  var dlEl = document.getElementById("dlCount");
  function formatBig(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return Math.round(n / 1e3) + "K";
    return String(n);
  }
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var dur = 1600, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatBig(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatBig(target);
    }
    requestAnimationFrame(step);
  }

  /* ---------- progress bar fill + count-up via observer ---------- */
  var barFill = document.getElementById("barFill");
  var dlDone = false, barDone = false;

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        if (en.target === dlEl && !dlDone) { dlDone = true; countUp(dlEl); }
        if (en.target === barFill && !barDone) { barDone = true; barFill.style.width = "68%"; }
      });
    }, { threshold: 0.4 });
    if (dlEl) io.observe(dlEl);
    if (barFill) io.observe(barFill);
  } else {
    if (dlEl) countUp(dlEl);
    if (barFill) barFill.style.width = "68%";
  }

  /* ---------- swappable phone screen ---------- */
  var SCREENS = [
    {
      build: function (scr) {
        scr.innerHTML = MATCH_HTML;
        grid = scr.querySelector("#grid");
        scoreEl = scr.querySelector("#score");
        buildGrid();
        var sh = scr.querySelector("#shuffle");
        if (sh) sh.addEventListener("click", function () {
          grid.querySelectorAll(".tile").forEach(function (t, idx) {
            setTimeout(function () { popTile(t); }, idx * 14);
          });
          toast("Board shuffled! 🔀");
        });
      }
    },
    {
      build: function (scr) {
        scr.innerHTML =
          '<div class="game-hud"><div class="hud-chip">🗺</div><div class="hud-score">Adventure <strong>Berry Beach</strong></div><div class="hud-chip">⭐ 612</div></div>' +
          '<div class="map-mini">' +
          ['done','done','done','now','locked','locked','locked','locked','locked']
            .map(function (s, i) { return '<span class="map-node ' + s + '">' + (s === 'now' ? '📍' : (s === 'locked' ? '🔒' : (i + 1))) + '</span>'; })
            .join('') +
          '</div>' +
          '<div class="game-foot"><div class="goal">Next: <strong>District 5</strong></div></div>';
      }
    },
    {
      build: function (scr) {
        scr.innerHTML =
          '<div class="game-hud"><div class="hud-chip">🎁</div><div class="hud-score">Daily <strong>Rewards</strong></div><div class="hud-chip">🔥 4</div></div>' +
          '<div class="reward-mini">' +
          ['🍬','💰','🪄','🎁','🍭','💎','👑'].map(function (e, i) {
            var cls = i < 3 ? 'got' : (i === 3 ? 'cur' : '');
            return '<span class="rw-node ' + cls + '"><b>D' + (i + 1) + '</b>' + e + '</span>';
          }).join('') +
          '</div>' +
          '<div class="game-foot"><div class="goal">Day 7: <strong>Legendary 👑</strong></div></div>';
      }
    }
  ];

  var phoneScreen = document.querySelector(".phone-screen");
  var MATCH_HTML = phoneScreen ? phoneScreen.innerHTML : "";

  // inject mini-screen styles once
  var style = document.createElement("style");
  style.textContent =
    ".map-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;flex:1;align-content:center;padding:8px}" +
    ".map-node{aspect-ratio:1;display:grid;place-items:center;border-radius:18px;font-weight:800;font-family:'Baloo 2',sans-serif;background:#fff;box-shadow:0 4px 10px rgba(42,33,64,.12)}" +
    ".map-node.done{background:linear-gradient(135deg,#fff6da,#ffe9d2)}" +
    ".map-node.now{background:linear-gradient(135deg,#ff5ea0,#ff9ac6);color:#fff;animation:pulse 1.6s ease-in-out infinite}" +
    ".map-node.locked{opacity:.55}" +
    ".reward-mini{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex:1;align-content:center;padding:8px}" +
    ".rw-node{display:flex;flex-direction:column;align-items:center;gap:2px;background:#fff;border-radius:14px;padding:8px 4px;font-size:20px;box-shadow:0 4px 10px rgba(42,33,64,.12);opacity:.6}" +
    ".rw-node b{font-size:10px;color:#7b738f}" +
    ".rw-node.got{opacity:1}" +
    ".rw-node.cur{opacity:1;outline:2px solid #ff5ea0;animation:pulse 1.6s ease-in-out infinite}";
  document.head.appendChild(style);

  var dots = document.querySelectorAll(".dot");
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var idx = parseInt(dot.getAttribute("data-screen"), 10) || 0;
      dots.forEach(function (d) {
        var on = d === dot;
        d.classList.toggle("is-active", on);
        d.setAttribute("aria-selected", on ? "true" : "false");
      });
      if (phoneScreen && SCREENS[idx]) SCREENS[idx].build(phoneScreen);
    });
  });

  window.addEventListener("beforeunload", function () { clearInterval(autoTimer); });
})();
