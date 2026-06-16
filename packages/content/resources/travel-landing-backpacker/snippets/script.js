/* Driftpack — Backpacker / Budget Travel Landing
   Vanilla JS only. Renders routes/hostels/wall, save-to-trip drawer, filters,
   search, animated counters, marquee clone, join form, toast. */
(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var toastEl = $("[data-toast]");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* simple inline SVG mini-map with a dotted route + pins */
  function miniMap(seed, color) {
    var pts = [];
    var n = 4;
    var rnd = seed;
    function next() { rnd = (rnd * 9301 + 49297) % 233280; return rnd / 233280; }
    for (var i = 0; i < n; i++) {
      pts.push([20 + (next() * 0.7 + i / n * 0.25) * 280, 30 + next() * 110]);
    }
    var path = "M" + pts.map(function (p) { return p[0].toFixed(0) + " " + p[1].toFixed(0); }).join(" L");
    var pins = pts.map(function (p, i) {
      var fill = i === 0 || i === pts.length - 1 ? "#ffffff" : color;
      return '<circle cx="' + p[0].toFixed(0) + '" cy="' + p[1].toFixed(0) + '" r="6" fill="' + fill + '" stroke="' + color + '" stroke-width="3"/>';
    }).join("");
    return '<svg viewBox="0 0 320 180" preserveAspectRatio="none" role="img" aria-label="Route map">' +
      '<defs><linearGradient id="mg' + seed + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + color + '" stop-opacity="0.18"/>' +
      '<stop offset="1" stop-color="' + color + '" stop-opacity="0.05"/></linearGradient></defs>' +
      '<rect width="320" height="180" fill="url(#mg' + seed + ')"/>' +
      '<g opacity="0.18" stroke="' + color + '" stroke-width="1">' +
      '<path d="M0 60 H320 M0 120 H320 M80 0 V180 M160 0 V180 M240 0 V180"/></g>' +
      '<path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="2 12"/>' +
      pins + "</svg>";
  }

  /* ---------- data ---------- */
  var ROUTES = [
    { id: "r1", region: "asia", title: "Banana Pancake Trail", badge: "Classic", price: 28, days: 21, stops: ["Bangkok", "Chiang Mai", "Luang Prabang", "Hanoi"], rating: 4.8, color: "#15a3a3" },
    { id: "r2", region: "europe", title: "Iberian Sun Run", badge: "Cheap eats", price: 41, days: 14, stops: ["Lisbon", "Sevilla", "Granada", "Valencia"], rating: 4.7, color: "#ff7a3c" },
    { id: "r3", region: "latam", title: "Andes Gringo Loop", badge: "Epic views", price: 33, days: 18, stops: ["Cusco", "La Paz", "Uyuni", "Atacama"], rating: 4.9, color: "#ef5a78" },
    { id: "r4", region: "asia", title: "Island Hopper Lite", badge: "Beachy", price: 36, days: 12, stops: ["Bali", "Gili T", "Lombok", "Flores"], rating: 4.6, color: "#2b4d8f" },
    { id: "r5", region: "europe", title: "Balkan Bargain Belt", badge: "Underrated", price: 26, days: 16, stops: ["Split", "Mostar", "Kotor", "Tirana"], rating: 4.8, color: "#7b5cff" },
    { id: "r6", region: "latam", title: "Caribbean Coast Crawl", badge: "Warm", price: 30, days: 15, stops: ["Cartagena", "Santa Marta", "Tayrona", "Palomino"], rating: 4.5, color: "#15a3a3" }
  ];

  var HOSTELS = [
    { id: "h1", name: "The Surf Shack", loc: "Lisbon, PT", price: 16, rating: 4.7, tag: "Free breakfast", emoji: "🏄" },
    { id: "h2", name: "Mango Tree Dorms", loc: "Chiang Mai, TH", price: 8, rating: 4.9, tag: "Rooftop bar", emoji: "🌴" },
    { id: "h3", name: "Condor Nest", loc: "Cusco, PE", price: 11, rating: 4.6, tag: "Mountain view", emoji: "🏔️" },
    { id: "h4", name: "Blue Door Hostel", loc: "Kotor, ME", price: 14, rating: 4.8, tag: "Old town", emoji: "🚪" },
    { id: "h5", name: "Gecko Garden", loc: "Gili T, ID", price: 12, rating: 4.5, tag: "Hammocks", emoji: "🦎" },
    { id: "h6", name: "Salt & Sand", loc: "Palomino, CO", price: 10, rating: 4.4, tag: "Beachfront", emoji: "🏝️" }
  ];

  var WALL = [
    { emoji: "🏞️", user: "@maya.roams", likes: 213 },
    { emoji: "🛶", user: "@nomad_finn", likes: 98 },
    { emoji: "🌋", user: "@trekzoe", likes: 341 },
    { emoji: "🐘", user: "@goeswest", likes: 156 },
    { emoji: "🏜️", user: "@dune.diary", likes: 77 },
    { emoji: "🚲", user: "@pedalpaolo", likes: 122 },
    { emoji: "⛺", user: "@tentlife", likes: 64 },
    { emoji: "🌅", user: "@sunchaser", likes: 289 }
  ];

  /* ---------- trip state ---------- */
  var STORE_KEY = "driftpack-trip";
  var trip = loadTrip();

  function loadTrip() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveTrip() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(trip)); } catch (e) { /* private mode */ }
  }
  function inTrip(id) { return Object.prototype.hasOwnProperty.call(trip, id); }

  function findItem(id) {
    var r = ROUTES.filter(function (x) { return x.id === id; })[0];
    if (r) return { id: r.id, name: r.title, sub: r.days + "-day route", price: r.price, emoji: "🧭" };
    var h = HOSTELS.filter(function (x) { return x.id === id; })[0];
    if (h) return { id: h.id, name: h.name, sub: h.loc, price: h.price, emoji: h.emoji };
    return null;
  }

  function toggleSave(id) {
    if (inTrip(id)) { delete trip[id]; }
    else {
      var item = findItem(id);
      if (item) trip[id] = item;
    }
    saveTrip();
    syncHearts();
    renderDrawer();
  }

  function syncHearts() {
    $$("[data-save]").forEach(function (btn) {
      var on = inTrip(btn.getAttribute("data-save"));
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.textContent = on ? "❤" : "♡";
    });
    var count = Object.keys(trip).length;
    $$("[data-saved-count]").forEach(function (el) { el.textContent = count; });
  }

  /* ---------- render routes ---------- */
  var routesEl = $("[data-routes]");
  function renderRoutes(filter) {
    if (!routesEl) return;
    var list = filter && filter !== "all" ? ROUTES.filter(function (r) { return r.region === filter; }) : ROUTES;
    routesEl.innerHTML = list.map(function (r, i) {
      return '' +
        '<article class="route">' +
          '<div class="route__map">' +
            miniMap(i + 7, r.color) +
            '<span class="route__badge">' + esc(r.badge) + "</span>" +
            '<span class="route__price">$' + r.price + "/day</span>" +
          "</div>" +
          '<div class="route__body">' +
            '<h3 class="route__title">' + esc(r.title) + "</h3>" +
            '<div class="route__meta">' +
              "<span>🗓️ " + r.days + " days</span>" +
              "<span>📍 " + r.stops.length + " stops</span>" +
            "</div>" +
            '<div class="route__stops">' +
              r.stops.map(function (s) { return '<span class="route__stop">' + esc(s) + "</span>"; }).join("") +
            "</div>" +
            '<div class="route__foot">' +
              '<span class="route__rating"><span class="star">★</span> ' + r.rating.toFixed(1) + "</span>" +
              '<button class="heart" type="button" data-save="' + r.id + '" aria-pressed="false" aria-label="Add ' + esc(r.title) + ' to trip">♡</button>' +
            "</div>" +
          "</div>" +
        "</article>";
    }).join("");
    syncHearts();
  }

  /* ---------- render hostels ---------- */
  var hostelsEl = $("[data-hostels]");
  function renderHostels() {
    if (!hostelsEl) return;
    var grads = [
      "linear-gradient(135deg,#ffd3a5,#fd9a6e)",
      "linear-gradient(135deg,#a1ffce,#5ad6c0)",
      "linear-gradient(135deg,#c2e0ff,#7aa6e8)",
      "linear-gradient(135deg,#ffc1d8,#ef5a78)",
      "linear-gradient(135deg,#e2d1ff,#9d7bff)",
      "linear-gradient(135deg,#ffe8a3,#ffc23d)"
    ];
    hostelsEl.innerHTML = HOSTELS.map(function (h, i) {
      return '' +
        '<article class="hostel">' +
          '<div class="hostel__pic" style="background:' + grads[i % grads.length] + '">' +
            "<span>" + h.emoji + "</span>" +
            '<span class="hostel__tag">' + esc(h.tag) + "</span>" +
            '<button class="heart hostel__heart" type="button" data-save="' + h.id + '" aria-pressed="false" aria-label="Add ' + esc(h.name) + ' to trip">♡</button>' +
          "</div>" +
          '<div class="hostel__body">' +
            '<h3 class="hostel__name">' + esc(h.name) + "</h3>" +
            '<span class="hostel__loc">📍 ' + esc(h.loc) + "</span>" +
            '<div class="hostel__foot">' +
              '<span class="hostel__price">$' + h.price + ' <span>/ night</span></span>' +
              '<span class="hostel__rate"><span class="star">★</span> ' + h.rating.toFixed(1) + "</span>" +
            "</div>" +
          "</div>" +
        "</article>";
    }).join("");
    syncHearts();
  }

  /* ---------- render wall ---------- */
  var wallEl = $("[data-wall]");
  function renderWall() {
    if (!wallEl) return;
    var grads = [
      "linear-gradient(135deg,#2b4d8f,#15a3a3)",
      "linear-gradient(135deg,#ff7a3c,#ef5a78)",
      "linear-gradient(135deg,#ffc23d,#ff7a3c)",
      "linear-gradient(135deg,#15a3a3,#2b4d8f)",
      "linear-gradient(135deg,#ef5a78,#9d7bff)",
      "linear-gradient(135deg,#7aa6e8,#2b4d8f)",
      "linear-gradient(135deg,#5ad6c0,#15a3a3)",
      "linear-gradient(135deg,#ffd3a5,#ef5a78)"
    ];
    wallEl.innerHTML = WALL.map(function (w, i) {
      return '' +
        '<button class="tile" type="button" style="background:' + grads[i % grads.length] + '" aria-label="Photo by ' + esc(w.user) + '">' +
          "<span>" + w.emoji + "</span>" +
          '<span class="tile__like" data-like aria-pressed="false">❤ <b>' + w.likes + "</b></span>" +
          '<span class="tile__user">' + esc(w.user) + "</span>" +
        "</button>";
    }).join("");
  }

  /* ---------- drawer ---------- */
  var drawer = $("[data-drawer]");
  var drawerList = $("[data-drawer-list]");
  var drawerEmpty = $("[data-drawer-empty]");
  var drawerTotal = $("[data-drawer-total]");
  var lastFocused = null;

  function renderDrawer() {
    if (!drawerList) return;
    var ids = Object.keys(trip);
    if (!ids.length) {
      drawerList.innerHTML = "";
      if (drawerEmpty) drawerEmpty.style.display = "block";
    } else {
      if (drawerEmpty) drawerEmpty.style.display = "none";
      drawerList.innerHTML = ids.map(function (id) {
        var it = trip[id];
        return '' +
          '<li class="drawer__row">' +
            '<span class="drawer__emoji" aria-hidden="true">' + (it.emoji || "📍") + "</span>" +
            '<span class="drawer__info"><strong>' + esc(it.name) + "</strong><span>" + esc(it.sub || "") + "</span></span>" +
            '<span class="drawer__price">$' + it.price + "</span>" +
            '<button class="drawer__remove" type="button" data-remove="' + esc(id) + '" aria-label="Remove ' + esc(it.name) + '">✕</button>' +
          "</li>";
      }).join("");
    }
    var total = ids.reduce(function (sum, id) { return sum + (trip[id].price || 0); }, 0);
    if (drawerTotal) drawerTotal.textContent = "$" + total;
  }

  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    drawer.hidden = false;
    document.body.style.overflow = "hidden";
    var x = $(".drawer__x", drawer);
    if (x) x.focus();
    document.addEventListener("keydown", onDrawerKey);
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onDrawerKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  function onDrawerKey(e) {
    if (e.key === "Escape") closeDrawer();
    if (e.key === "Tab" && !drawer.hidden) {
      var f = $$("button, a, input", drawer).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* ---------- counters ---------- */
  function animateCounters() {
    $$("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var prefix = el.getAttribute("data-prefix") || "";
      var start = null, dur = 1100;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- marquee: clone for seamless loop ---------- */
  (function setupMarquee() {
    var track = $("[data-deals-track]");
    if (!track) return;
    track.innerHTML += track.innerHTML; // duplicate set for -50% translate loop
  })();

  /* ---------- wire global events (delegation) ---------- */
  document.addEventListener("click", function (e) {
    var saveBtn = e.target.closest("[data-save]");
    if (saveBtn) {
      var id = saveBtn.getAttribute("data-save");
      var wasIn = inTrip(id);
      toggleSave(id);
      saveBtn.classList.remove("pop");
      void saveBtn.offsetWidth;
      saveBtn.classList.add("pop");
      var item = findItem(id);
      toast(wasIn ? "Removed from your trip" : "Added " + (item ? item.name : "") + " to your trip 🎒");
      return;
    }

    var likeBtn = e.target.closest("[data-like]");
    if (likeBtn) {
      e.preventDefault();
      var on = likeBtn.getAttribute("aria-pressed") === "true";
      var b = likeBtn.querySelector("b");
      var num = parseInt(b.textContent, 10) || 0;
      likeBtn.setAttribute("aria-pressed", on ? "false" : "true");
      b.textContent = on ? num - 1 : num + 1;
      return;
    }

    if (e.target.closest("[data-open-saved]")) { openDrawer(); return; }
    if (e.target.closest("[data-drawer-close]")) { closeDrawer(); return; }

    var rm = e.target.closest("[data-remove]");
    if (rm) {
      var rid = rm.getAttribute("data-remove");
      delete trip[rid];
      saveTrip(); syncHearts(); renderDrawer();
      toast("Removed from your trip");
      return;
    }

    if (e.target.closest("[data-clear-trip]")) {
      if (!Object.keys(trip).length) { toast("Your trip is already empty"); return; }
      trip = {};
      saveTrip(); syncHearts(); renderDrawer();
      toast("Trip cleared — fresh start ✨");
      return;
    }
  });

  /* filter chips */
  $$("[data-filter]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$("[data-filter]").forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      renderRoutes(chip.getAttribute("data-filter"));
    });
  });

  /* search */
  var searchForm = $("[data-search]");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var where = (searchForm.where.value || "").trim();
      var budget = searchForm.budget.value;
      if (where) {
        toast('Searching trips to "' + where + '" under $' + budget + "/day…");
        var routesSection = $("#routes");
        if (routesSection) routesSection.scrollIntoView({ behavior: "smooth" });
      } else {
        toast("Tell us where you're headed 🌍");
        var input = searchForm.querySelector('input[name="where"]');
        if (input) input.focus();
      }
    });
  }

  /* join form */
  var joinForm = $("[data-join]");
  var joinMsg = $("[data-join-msg]");
  if (joinForm) {
    joinForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (joinForm.email.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast("Pop in a valid email to get the kit");
        joinForm.email.focus();
        return;
      }
      joinForm.reset();
      if (joinMsg) joinMsg.textContent = "Boom — starter kit is flying to your inbox ✈️";
      toast("You're in! Check your inbox 🎒");
    });
  }

  /* hamburger */
  var hamburger = $("[data-hamburger]");
  var mobileNav = $("[data-mobile-nav]");
  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", function () {
      var open = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", open ? "false" : "true");
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { hamburger.setAttribute("aria-expanded", "false"); mobileNav.hidden = true; }
    });
  }

  /* ---------- boot ---------- */
  renderRoutes("all");
  renderHostels();
  renderWall();
  renderDrawer();
  syncHearts();

  if ("IntersectionObserver" in window) {
    var hero = $(".hero__stats");
    if (hero) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { animateCounters(); io.disconnect(); }
        });
      }, { threshold: 0.4 });
      io.observe(hero);
    } else { animateCounters(); }
  } else {
    animateCounters();
  }
})();
