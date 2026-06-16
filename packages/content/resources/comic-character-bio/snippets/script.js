(function () {
  "use strict";

  /** Fictional roster. All data is illustrative. */
  var ROSTER = [
    {
      id: "neon-ronin",
      name: "Neon Ronin",
      alias: "a.k.a. Kaede Mori",
      role: "hero",
      affiliation: "The Lantern Order",
      base: "Static City, Sector 9",
      issue: "#001",
      quote: "The city only sleeps when I let it.",
      sfx: "FWOOSH!",
      colors: { bg: "#2e6bff", skin: "#ffd9b5", hair: "#16161d", accent: "#ff2e4d" },
      stats: { power: 78, speed: 92, tech: 70, resolve: 88 }
    },
    {
      id: "iron-vanguard",
      name: "Iron Vanguard",
      alias: "a.k.a. Dov Reyes",
      role: "hero",
      affiliation: "The Lantern Order",
      base: "Forge Bay 12",
      issue: "#003",
      quote: "Hold the line. Always hold the line.",
      sfx: "KLANG!",
      colors: { bg: "#c9402e", skin: "#c98a5b", hair: "#3a2417", accent: "#ffd23f" },
      stats: { power: 96, speed: 48, tech: 84, resolve: 95 }
    },
    {
      id: "lady-static",
      name: "Lady Static",
      alias: "a.k.a. Mira Voss",
      role: "anti-hero",
      affiliation: "Unaffiliated",
      base: "The Undergrid",
      issue: "#007",
      quote: "Rules are just sparks waiting to jump the gap.",
      sfx: "BZZT!",
      colors: { bg: "#7a2eff", skin: "#f0c9a8", hair: "#e8e8ef", accent: "#2effc7" },
      stats: { power: 81, speed: 74, tech: 90, resolve: 66 }
    },
    {
      id: "the-grin",
      name: "The Grin",
      alias: "a.k.a. unknown",
      role: "villain",
      affiliation: "The Hollow Syndicate",
      base: "Last known: Pier 0",
      issue: "#002",
      quote: "Smile. The punchline is always you.",
      sfx: "HAHA!",
      colors: { bg: "#1d8f3b", skin: "#d6e0c2", hair: "#1a1a22", accent: "#ff2e4d" },
      stats: { power: 70, speed: 66, tech: 88, resolve: 99 }
    },
    {
      id: "ember-fox",
      name: "Ember Fox",
      alias: "a.k.a. Suki Tran",
      role: "hero",
      affiliation: "Lantern Order (cadet)",
      base: "Static City, Sector 4",
      issue: "#011",
      quote: "Light a match, watch the night flinch.",
      sfx: "WHUMP!",
      colors: { bg: "#ff6a1a", skin: "#e8b08a", hair: "#2a1410", accent: "#ffd23f" },
      stats: { power: 64, speed: 88, tech: 58, resolve: 80 }
    },
    {
      id: "warden-null",
      name: "Warden Null",
      alias: "a.k.a. Unit-0",
      role: "villain",
      affiliation: "The Hollow Syndicate",
      base: "Cold Vault",
      issue: "#009",
      quote: "Compliance is the only freedom I permit.",
      sfx: "THOOM!",
      colors: { bg: "#3a3a48", skin: "#9aa0b0", hair: "#0a0a10", accent: "#2e6bff" },
      stats: { power: 90, speed: 40, tech: 95, resolve: 92 }
    }
  ];

  var ROLE_LABEL = { hero: "Hero", villain: "Villain", "anti-hero": "Anti-Hero" };

  // ---- Element refs ----
  var profile = document.getElementById("profile");
  var portrait = document.getElementById("portrait");
  var portraitFace = document.getElementById("portraitFace");
  var portraitSfx = document.getElementById("portraitSfx");
  var roleBadge = document.getElementById("roleBadge");
  var issueBadge = document.getElementById("issueBadge");
  var charName = document.getElementById("charName");
  var charAlias = document.getElementById("charAlias");
  var charAffiliation = document.getElementById("charAffiliation");
  var charBase = document.getElementById("charBase");
  var charQuote = document.getElementById("charQuote");
  var statFills = document.querySelectorAll(".stat__fill");
  var statNums = document.querySelectorAll(".stat__num");
  var castStrip = document.getElementById("castStrip");
  var toastEl = document.getElementById("toast");

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1900);
  }

  // ---- Build cast strip ----
  ROSTER.forEach(function (c, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "castcard";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.dataset.id = c.id;
    btn.style.setProperty("--c-bg", c.colors.bg);
    btn.style.setProperty("--c-skin", c.colors.skin);
    btn.style.setProperty("--c-hair", c.colors.hair);

    var av = document.createElement("span");
    av.className = "castcard__avatar";
    var nm = document.createElement("span");
    nm.className = "castcard__name";
    nm.textContent = c.name;
    btn.appendChild(av);
    btn.appendChild(nm);

    btn.addEventListener("click", function () {
      select(c.id);
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var dir = e.key === "ArrowRight" ? 1 : -1;
      var next = (i + dir + ROSTER.length) % ROSTER.length;
      var nextBtn = castStrip.children[next];
      nextBtn.focus();
      select(ROSTER[next].id);
    });

    castStrip.appendChild(btn);
  });

  var current = null;

  function animateStats(stats) {
    statNums.forEach(function (el) {
      el.textContent = "0";
    });
    statFills.forEach(function (fill) {
      fill.style.width = "0%";
    });
    // force reflow so the transition replays
    void profile.offsetWidth;
    statFills.forEach(function (fill) {
      var key = fill.getAttribute("data-stat");
      fill.style.width = stats[key] + "%";
    });
    statNums.forEach(function (el) {
      var key = el.getAttribute("data-num");
      countUp(el, stats[key]);
    });
  }

  function countUp(el, target) {
    var start = performance.now();
    var dur = 850;
    function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function render(c) {
    roleBadge.textContent = ROLE_LABEL[c.role] || c.role;
    roleBadge.setAttribute("data-role", c.role);
    issueBadge.textContent = "First seen · " + c.issue;
    charName.textContent = c.name;
    charAlias.textContent = c.alias;
    charAffiliation.textContent = c.affiliation;
    charBase.textContent = c.base;
    charQuote.textContent = "“" + c.quote + "”";
    portraitSfx.textContent = c.sfx;

    portrait.style.setProperty("--portrait-bg", c.colors.bg);
    portraitFace.style.setProperty("--skin", c.colors.skin);
    portraitFace.style.setProperty("--hair", c.colors.hair);
    document.querySelector(".portrait__visor").style.setProperty("--accent", c.colors.accent);

    animateStats(c.stats);
  }

  function select(id) {
    if (id === current) return;
    var c = ROSTER.find(function (x) {
      return x.id === id;
    });
    if (!c) return;
    current = id;

    // update tab selection
    Array.prototype.forEach.call(castStrip.children, function (btn) {
      btn.setAttribute("aria-selected", btn.dataset.id === id ? "true" : "false");
    });

    // swap animation
    portrait.classList.add("is-swapping");
    window.setTimeout(function () {
      render(c);
      portrait.classList.remove("is-swapping");
    }, 200);

    toast("Loaded dossier: " + c.name);
  }

  // initial selection (no toast on first paint)
  (function init() {
    var first = ROSTER[0];
    current = first.id;
    castStrip.children[0].setAttribute("aria-selected", "true");
    render(first);
  })();
})();
