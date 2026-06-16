(function () {
  "use strict";

  /* ---------------- Toast helper ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }
  window.toast = toast;

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Mobile nav drawer ---------------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");
  var navScrim = document.getElementById("navScrim");

  function setNav(open) {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (navScrim) navScrim.hidden = !open;
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });
  }
  if (navScrim) navScrim.addEventListener("click", function () { setNav(false); });
  if (primaryNav) {
    primaryNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
  }

  /* ---------------- Hero parallax ---------------- */
  var heroScene = document.getElementById("heroScene");
  var layers = heroScene ? Array.prototype.slice.call(heroScene.querySelectorAll(".layer[data-depth]")) : [];
  if (heroScene && layers.length && !prefersReduced) {
    var rafPending = false;
    var px = 0, py = 0;
    function applyParallax() {
      rafPending = false;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute("data-depth")) || 0;
        l.style.transform = "translate(" + (px * d * -40) + "px," + (py * d * -24) + "px)";
      });
    }
    var hero = document.querySelector(".hero");
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (!rafPending) { rafPending = true; requestAnimationFrame(applyParallax); }
    });
    window.addEventListener("scroll", function () {
      var sc = window.scrollY || 0;
      if (sc > 620) return;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute("data-depth")) || 0;
        l.style.setProperty("--sy", (sc * d * 0.3) + "px");
      });
    }, { passive: true });
  }

  /* ---------------- Animated stat counters ---------------- */
  var statNums = document.querySelectorAll(".stat__num[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (prefersReduced) { el.textContent = target.toLocaleString(); return; }
    var start = performance.now();
    var dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); statObs.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    statNums.forEach(function (n) { statObs.observe(n); });
  } else {
    statNums.forEach(animateCount);
  }

  /* ---------------- Featured character rotator ---------------- */
  var featured = [
    {
      art: "seraphine",
      kicker: "CHARACTER · HOUSE VALE",
      name: "Seraphine Vale",
      role: "The Ashbound Heir · Wielder of the Glass Crown",
      desc: "Last scion of the fallen House Vale, Seraphine bound her soul to the Ember Vow to survive the Sundering. Equal parts diplomat and warlord, she unifies the broken duchies under a single thorned banner.",
      meta: [
        ["Allegiance", "The Thornwood Pact"],
        ["First seen", "Vol. I — Ashes of Vale"],
        ["Status", "Alive (Reign of Glass)"]
      ]
    },
    {
      art: "kaelen",
      kicker: "CHARACTER · TIDE WARDENS",
      name: "Kaelen Drift",
      role: "Warden of the Drowned Vaults · Keeper of Tides",
      desc: "A reluctant prophet pulled from the Mire of Echoes, Kaelen hears the drowned kings whispering futures no one wants. His loyalty to Seraphine is the thread holding the coastal duchies in the Pact.",
      meta: [
        ["Allegiance", "Tide Wardens"],
        ["First seen", "Vol. II — The Drowned Court"],
        ["Status", "Alive (Reign of Glass)"]
      ]
    },
    {
      art: "morwen",
      kicker: "CHARACTER · THE SILENT CHOIR",
      name: "Morwen Thorne",
      role: "Mistress of the Silent Choir · Architect of the Sundering",
      desc: "Once tutor to the Vale heirs, Morwen shattered the old world to remake it in her image. Brilliant and unknowable, she commands the Silent Choir — sorcerers who trade their voices for power.",
      meta: [
        ["Allegiance", "The Silent Choir"],
        ["First seen", "Vol. I — Ashes of Vale"],
        ["Status", "Unknown (last seen at Glass Spire)"]
      ]
    }
  ];

  var hlArt = document.getElementById("hlArt");
  var hlKicker = document.getElementById("hlKicker");
  var hlName = document.getElementById("hlName");
  var hlRole = document.getElementById("hlRole");
  var hlDesc = document.getElementById("hlDesc");
  var hlMeta = document.getElementById("hlMeta");
  var hlCard = document.getElementById("hlCard");
  var dotsWrap = document.getElementById("rotDots");
  var current = 0;
  var rotTimer;

  function buildDots() {
    if (!dotsWrap) return;
    featured.forEach(function (f, i) {
      var b = document.createElement("button");
      b.className = "rot-dot";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Show " + f.name);
      b.addEventListener("click", function () { show(i, true); });
      dotsWrap.appendChild(b);
    });
  }

  function render(i) {
    var f = featured[i];
    if (hlArt) hlArt.setAttribute("data-art", f.art);
    if (hlKicker) hlKicker.textContent = f.kicker;
    if (hlName) hlName.textContent = f.name;
    if (hlRole) hlRole.textContent = f.role;
    if (hlDesc) hlDesc.textContent = f.desc;
    if (hlMeta) {
      hlMeta.innerHTML = "";
      f.meta.forEach(function (m) {
        var s = document.createElement("span");
        var strong = document.createElement("strong");
        strong.textContent = m[0];
        s.appendChild(strong);
        s.appendChild(document.createTextNode(m[1]));
        hlMeta.appendChild(s);
      });
    }
    if (dotsWrap) {
      dotsWrap.querySelectorAll(".rot-dot").forEach(function (d, di) {
        d.setAttribute("aria-selected", String(di === i));
      });
    }
  }

  function show(i, userAction) {
    current = (i + featured.length) % featured.length;
    if (hlCard && !prefersReduced) {
      hlCard.animate(
        [{ opacity: 0.35 }, { opacity: 1 }],
        { duration: 300, easing: "ease-out" }
      );
    }
    render(current);
    if (userAction) restartAuto();
  }

  function restartAuto() {
    clearInterval(rotTimer);
    if (prefersReduced) return;
    rotTimer = setInterval(function () { show(current + 1, false); }, 6500);
  }

  if (hlCard) {
    buildDots();
    render(0);
    if (dotsWrap) dotsWrap.querySelector(".rot-dot").setAttribute("aria-selected", "true");
    restartAuto();
    var prev = document.getElementById("rotPrev");
    var next = document.getElementById("rotNext");
    if (prev) prev.addEventListener("click", function () { show(current - 1, true); });
    if (next) next.addEventListener("click", function () { show(current + 1, true); });
    var editBtn = document.getElementById("hlEditBtn");
    if (editBtn) editBtn.addEventListener("click", function () { toast("Editing is disabled in this demo"); });
    // pause on hover
    hlCard.addEventListener("mouseenter", function () { clearInterval(rotTimer); });
    hlCard.addEventListener("mouseleave", restartAuto);
  }

  /* ---------------- Search preview ---------------- */
  var INDEX = [
    { t: "Seraphine Vale", s: "Character · The Ashbound Heir", k: "character" },
    { t: "Kaelen Drift", s: "Character · Warden of the Drowned Vaults", k: "character" },
    { t: "Morwen Thorne", s: "Character · Architect of the Sundering", k: "character" },
    { t: "The Glass Crown", s: "Relic · The throne-bound artifact", k: "item" },
    { t: "The Ember Vow", s: "Relic · A pact written in soulfire", k: "item" },
    { t: "Thornwood Canopy", s: "Location · The living capital", k: "location" },
    { t: "Mire of Echoes", s: "Location · Where the drowned kings speak", k: "location" },
    { t: "Glass Spire", s: "Location · Seat of the Silent Choir", k: "location" },
    { t: "The Thornwood Pact", s: "Faction · Seraphine's coalition of duchies", k: "faction" },
    { t: "The Silent Choir", s: "Faction · Voice-traded sorcerers", k: "faction" },
    { t: "Tide Wardens", s: "Faction · Keepers of the coastal vaults", k: "faction" },
    { t: "House Vale", s: "Faction · The fallen royal house", k: "faction" },
    { t: "The Sundering", s: "Event · The shattering of the old world", k: "event" },
    { t: "Reign of Glass", s: "Event · The current age of the Empire", k: "event" },
    { t: "Vault of Drowned Kings", s: "Location · A sunken hall of relics", k: "location" }
  ];

  var input = document.getElementById("searchInput");
  var preview = document.getElementById("searchPreview");
  var form = document.getElementById("searchForm");
  var activeIdx = -1;
  var results = [];

  function esc(s) { return s.replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function highlight(text, q) {
    if (!q) return esc(text);
    var idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return esc(text);
    return esc(text.slice(0, idx)) + "<mark>" + esc(text.slice(idx, idx + q.length)) + "</mark>" + esc(text.slice(idx + q.length));
  }

  function openPreview() {
    if (!preview) return;
    preview.hidden = false;
    if (input) input.setAttribute("aria-expanded", "true");
  }
  function closePreview() {
    if (!preview) return;
    preview.hidden = true;
    activeIdx = -1;
    if (input) input.setAttribute("aria-expanded", "false");
  }

  function renderResults(q) {
    if (!preview) return;
    var ql = q.trim().toLowerCase();
    results = ql
      ? INDEX.filter(function (r) { return r.t.toLowerCase().indexOf(ql) > -1 || r.s.toLowerCase().indexOf(ql) > -1; }).slice(0, 6)
      : [];
    preview.innerHTML = "";
    activeIdx = -1;
    if (!ql) { closePreview(); return; }
    if (!results.length) {
      var li = document.createElement("li");
      li.className = "sp-empty";
      li.textContent = 'No lore pages match "' + q + '" — try another name.';
      preview.appendChild(li);
      openPreview();
      return;
    }
    results.forEach(function (r, i) {
      var li = document.createElement("li");
      li.className = "sp-item";
      li.id = "sp-opt-" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      li.innerHTML =
        '<span class="sp-item__badge badge--' + r.k + '">' + r.k + '</span>' +
        '<span class="sp-item__main">' +
        '<span class="sp-item__title">' + highlight(r.t, q) + '</span>' +
        '<span class="sp-item__sub">' + esc(r.s) + '</span></span>';
      li.addEventListener("click", function () { choose(r); });
      li.addEventListener("mousemove", function () { setActive(i); });
      preview.appendChild(li);
    });
    openPreview();
  }

  function setActive(i) {
    var items = preview.querySelectorAll(".sp-item");
    items.forEach(function (el, idx) { el.setAttribute("aria-selected", String(idx === i)); });
    activeIdx = i;
    if (input) input.setAttribute("aria-activedescendant", i > -1 ? "sp-opt-" + i : "");
    if (items[i]) items[i].scrollIntoView({ block: "nearest" });
  }

  function choose(r) {
    if (input) input.value = r.t;
    closePreview();
    toast("Opening “" + r.t + "” (demo)");
  }

  if (input) {
    input.addEventListener("input", function () { renderResults(input.value); });
    input.addEventListener("focus", function () { if (input.value.trim()) renderResults(input.value); });
    input.addEventListener("keydown", function (e) {
      if (preview.hidden && (e.key === "ArrowDown")) { renderResults(input.value); return; }
      if (preview.hidden) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(Math.min(activeIdx + 1, results.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(activeIdx - 1, 0)); }
      else if (e.key === "Enter") {
        if (activeIdx > -1 && results[activeIdx]) { e.preventDefault(); choose(results[activeIdx]); }
      } else if (e.key === "Escape") { closePreview(); }
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input ? input.value.trim() : "";
      if (!q) { toast("Type a name to search the compendium"); return; }
      if (results.length && activeIdx > -1) { choose(results[activeIdx]); return; }
      if (results.length) { choose(results[0]); return; }
      toast('Searching for "' + q + '"… (demo)');
      closePreview();
    });
  }

  document.addEventListener("click", function (e) {
    if (form && !form.contains(e.target)) closePreview();
  });

  /* ---------------- Popular chips ---------------- */
  document.querySelectorAll(".chip[data-q]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (!input) return;
      input.value = chip.getAttribute("data-q");
      input.focus();
      renderResults(input.value);
    });
  });

  /* ---------------- Global "/" to focus search ---------------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== input) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      if (input) { input.focus(); input.select(); }
    }
  });

  /* ---------------- Random page ---------------- */
  var randomBtn = document.getElementById("randomBtn");
  if (randomBtn) {
    randomBtn.addEventListener("click", function () {
      var r = INDEX[Math.floor(Math.random() * INDEX.length)];
      toast("Random page → " + r.t);
    });
  }

  /* ---------------- Community buttons ---------------- */
  var discordBtn = document.getElementById("discordBtn");
  if (discordBtn) discordBtn.addEventListener("click", function () { toast("Discord invite is a demo — no real link"); });
  var newsletterBtn = document.getElementById("newsletterBtn");
  if (newsletterBtn) newsletterBtn.addEventListener("click", function () { toast("Subscribed to the lore digest (demo)"); });

  /* ---------------- Live activity feed ticker ---------------- */
  var feed = document.getElementById("activityFeed");
  var editors = [
    { n: "Lorekeeper_Vael", c: "a", l: "L" },
    { n: "MireWalker", c: "b", l: "M" },
    { n: "ThornScribe", c: "c", l: "T" },
    { n: "AshboundAria", c: "d", l: "A" },
    { n: "GlassEcho", c: "e", l: "G" },
    { n: "DuchessOfMire", c: "a", l: "D" }
  ];
  var actions = [
    ["edited", "The Glass Crown", "pos", "+"],
    ["created", "Spire of the Choir", "pos", "+"],
    ["edited", "Reign of Glass", "pos", "+"],
    ["reverted", "Tide Wardens", "neg", "−"],
    ["edited", "Seraphine Vale", "pos", "+"],
    ["uploaded", "sigil-house-vale.svg", "pos", "+"]
  ];
  function randInt(n) { return Math.floor(Math.random() * n); }
  function pushActivity() {
    if (!feed || prefersReduced) return;
    var ed = editors[randInt(editors.length)];
    var ac = actions[randInt(actions.length)];
    var amount = ac[3] + (randInt(900) + 40).toLocaleString();
    var li = document.createElement("li");
    li.className = "feed__item is-new";
    li.innerHTML =
      '<span class="feed__avatar" data-c="' + ed.c + '">' + ed.l + '</span>' +
      '<div class="feed__body"><p><strong>' + ed.n + '</strong> ' + ac[0] +
      ' <a href="#" onclick="return false">' + ac[1] + '</a></p>' +
      '<span class="feed__meta"><em class="feed__diff feed__diff--' + ac[2] + '">' + amount + '</em> · just now</span></div>';
    feed.insertBefore(li, feed.firstChild);
    while (feed.children.length > 5) feed.removeChild(feed.lastChild);
  }
  setInterval(pushActivity, 5200);

})();
