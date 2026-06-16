(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        mobileNav.hidden = true;
      });
    });
  }

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Packages data + render ---------- */
  var packages = [
    { id: "kyoto", region: "Japan", name: "Kyoto & Osaka Loop", scene: "scene-kyoto", days: 9, rating: 4.9, reviews: 412, best: "Best: Mar–Apr", price: 2480 },
    { id: "iceland", region: "Iceland", name: "Ring Road Adventure", scene: "scene-iceland", days: 8, rating: 4.8, reviews: 318, best: "Best: Jun–Aug", price: 2890 },
    { id: "santorini", region: "Greece", name: "Cyclades Island Hop", scene: "scene-santorini", days: 7, rating: 4.9, reviews: 524, best: "Best: May–Sep", price: 1990 },
    { id: "morocco", region: "Morocco", name: "Marrakech Discovery", scene: "scene-morocco", days: 6, rating: 4.7, reviews: 276, best: "Best: Oct–Apr", price: 1540 },
    { id: "lisbon", region: "Portugal", name: "Lisbon & Sintra Escape", scene: "scene-lisbon", days: 5, rating: 4.8, reviews: 389, best: "Best: Apr–Oct", price: 1320 },
    { id: "nz", region: "New Zealand", name: "Queenstown Highlands", scene: "scene-nz", days: 11, rating: 4.9, reviews: 201, best: "Best: Nov–Mar", price: 3650 }
  ];

  var savedTrips = new Set();
  var grid = document.getElementById("packageGrid");

  var heartSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.8-10-9.3C.4 8.6 2 5.2 5.2 5c2-.1 3.4 1 3.8 2 .4-1 1.8-2.1 3.8-2 3.2.2 4.8 3.6 3.2 6.7C19.5 16.2 12 21 12 21z"/></svg>';

  function fmtPrice(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function renderPackages() {
    if (!grid) return;
    grid.innerHTML = "";
    packages.forEach(function (p, i) {
      var card = document.createElement("article");
      card.className = "package-card reveal";
      card.style.transitionDelay = (i % 3) * 0.06 + "s";
      var saved = savedTrips.has(p.id);
      card.innerHTML =
        '<div class="package-media">' +
          '<div class="scene ' + p.scene + '"></div>' +
          '<span class="best-badge">' + p.best + '</span>' +
          '<button type="button" class="save-btn" data-id="' + p.id + '" aria-pressed="' + saved + '" ' +
            'aria-label="' + (saved ? "Remove " : "Save ") + p.name + ' to trips">' + heartSvg + '</button>' +
        '</div>' +
        '<div class="package-body">' +
          '<span class="package-region">' + p.region + '</span>' +
          '<h3 class="package-name">' + p.name + '</h3>' +
          '<div class="package-meta">' +
            '<span class="rating">★ ' + p.rating.toFixed(1) + '</span>' +
            '<span>' + p.reviews + ' reviews</span>' +
            '<span>' + p.days + ' days</span>' +
          '</div>' +
          '<div class="package-foot">' +
            '<div class="price-block">' +
              '<span class="from">from</span>' +
              '<span class="price">' + fmtPrice(p.price) + '</span>' +
              '<span class="per"> / person</span>' +
            '</div>' +
            '<button type="button" class="btn btn-coral book-btn" data-id="' + p.id + '">Book now</button>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });
    observeReveals();
  }

  if (grid) {
    grid.addEventListener("click", function (e) {
      var saveBtn = e.target.closest(".save-btn");
      if (saveBtn) {
        var id = saveBtn.getAttribute("data-id");
        var pkg = packages.find(function (p) { return p.id === id; });
        var now = !savedTrips.has(id);
        if (now) savedTrips.add(id); else savedTrips.delete(id);
        saveBtn.setAttribute("aria-pressed", String(now));
        saveBtn.setAttribute("aria-label", (now ? "Remove " : "Save ") + pkg.name + " to trips");
        saveBtn.classList.remove("pulse");
        void saveBtn.offsetWidth; // reflow to restart animation
        saveBtn.classList.add("pulse");
        toast(now ? "Saved “" + pkg.name + "” to your trips" : "Removed from your trips");
        return;
      }
      var bookBtn = e.target.closest(".book-btn");
      if (bookBtn) {
        var bid = bookBtn.getAttribute("data-id");
        var bpkg = packages.find(function (p) { return p.id === bid; });
        var destInput = document.getElementById("dest");
        if (destInput) destInput.value = bpkg.name + ", " + bpkg.region;
        toast("Great pick! We pre-filled the " + bpkg.region + " trip — pick your dates above.");
        var hero = document.querySelector(".hero");
        if (hero) hero.scrollIntoView({ behavior: "smooth", block: "start" });
        if (destInput) setTimeout(function () { destInput.focus(); }, 500);
      }
    });
  }

  renderPackages();

  /* ---------- Traveler stepper ---------- */
  var travInput = document.getElementById("travelers");
  var travMinus = document.getElementById("travMinus");
  var travPlus = document.getElementById("travPlus");
  var MIN_TRAV = 1, MAX_TRAV = 12;
  function updateStepperState() {
    var v = parseInt(travInput.value, 10) || MIN_TRAV;
    travMinus.disabled = v <= MIN_TRAV;
    travPlus.disabled = v >= MAX_TRAV;
  }
  if (travInput && travMinus && travPlus) {
    travMinus.addEventListener("click", function () {
      var v = parseInt(travInput.value, 10) || MIN_TRAV;
      if (v > MIN_TRAV) { travInput.value = v - 1; updateStepperState(); }
    });
    travPlus.addEventListener("click", function () {
      var v = parseInt(travInput.value, 10) || MIN_TRAV;
      if (v < MAX_TRAV) { travInput.value = v + 1; updateStepperState(); }
    });
    updateStepperState();
  }

  /* ---------- Date defaults ---------- */
  function toISO(d) { return d.toISOString().split("T")[0]; }
  var today = new Date();
  var depart = document.getElementById("depart");
  var ret = document.getElementById("return");
  if (depart) depart.min = toISO(today);
  if (ret) ret.min = toISO(today);

  /* ---------- Field validation helpers ---------- */
  function setError(input, errId, msg) {
    var field = input.closest(".field");
    var err = document.getElementById(errId);
    if (msg) {
      if (field) field.classList.add("invalid");
      input.setAttribute("aria-invalid", "true");
      if (err) err.textContent = msg;
    } else {
      if (field) field.classList.remove("invalid");
      input.removeAttribute("aria-invalid");
      if (err) err.textContent = "";
    }
  }

  /* ---------- Search form ---------- */
  var searchForm = document.getElementById("searchForm");
  var searchBtn = document.getElementById("searchBtn");
  var searchResult = document.getElementById("searchResult");

  if (searchForm) {
    var destEl = document.getElementById("dest");
    [destEl, depart, ret].forEach(function (el) {
      if (el) el.addEventListener("input", function () {
        setError(el, el.id + "-err", "");
      });
    });

    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var firstBad = null;

      if (!destEl.value.trim()) {
        setError(destEl, "dest-err", "Tell us where you'd like to go.");
        ok = false; firstBad = firstBad || destEl;
      }
      if (!depart.value) {
        setError(depart, "depart-err", "Pick a departure date.");
        ok = false; firstBad = firstBad || depart;
      }
      if (!ret.value) {
        setError(ret, "return-err", "Pick a return date.");
        ok = false; firstBad = firstBad || ret;
      }
      if (depart.value && ret.value && ret.value < depart.value) {
        setError(ret, "return-err", "Return must be after departure.");
        ok = false; firstBad = firstBad || ret;
      }

      if (!ok) {
        if (firstBad) firstBad.focus();
        searchResult.hidden = true;
        return;
      }

      // "Searching…" state
      searchBtn.setAttribute("aria-busy", "true");
      searchBtn.disabled = true;
      searchBtn.querySelector(".btn-label").textContent = "Searching…";
      searchResult.hidden = false;
      searchResult.classList.add("searching");
      searchResult.innerHTML = '<div class="res-head"><span class="spinner"></span> Searching live trips…</div>';

      var dest = destEl.value.trim();
      var travelers = travInput ? travInput.value : "2";
      var d1 = new Date(depart.value);
      var d2 = new Date(ret.value);
      var nights = Math.max(1, Math.round((d2 - d1) / 86400000));

      setTimeout(function () {
        var matches = 6 + Math.floor(Math.random() * 20);
        var lead = 1490 + Math.floor(Math.random() * 1200);
        searchBtn.removeAttribute("aria-busy");
        searchBtn.disabled = false;
        searchBtn.querySelector(".btn-label").textContent = "Search trips";
        searchResult.classList.remove("searching");
        searchResult.innerHTML =
          '<div class="res-head">✅ ' + matches + ' trips to <strong>' + escapeHtml(dest) + '</strong></div>' +
          '<div>' + nights + ' nights · ' + travelers + ' traveler' + (travelers === "1" ? "" : "s") +
          ' · from <strong>' + fmtPrice(lead) + '</strong>/person. A trip designer will tailor the rest.</div>';
        toast("Found " + matches + " trips to " + dest + " ✈");
      }, 1400);
    });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- CTA form ---------- */
  var ctaForm = document.getElementById("ctaForm");
  if (ctaForm) {
    var emailEl = document.getElementById("email");
    emailEl.addEventListener("input", function () { setError(emailEl, "email-err", ""); });
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = emailEl.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!val) { setError(emailEl, "email-err", "Please enter your email."); emailEl.focus(); return; }
      if (!valid) { setError(emailEl, "email-err", "That email doesn't look right."); emailEl.focus(); return; }
      setError(emailEl, "email-err", "");
      ctaForm.reset();
      toast("Thanks! A trip designer will email you within one business day.");
    });
  }

  /* ---------- Stat counters ---------- */
  var countersDone = false;
  function runCounters() {
    if (countersDone) return;
    countersDone = true;
    document.querySelectorAll(".stat strong[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var start = performance.now();
      var dur = 1300;
      function tick(now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        var val = target * eased;
        el.textContent = decimals
          ? val.toFixed(decimals)
          : Math.round(val).toLocaleString("en-US");
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString("en-US");
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- Reveal on scroll + counters ---------- */
  var io;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            if (entry.target.classList.contains("stat-band")) runCounters();
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.16 });
    }
    document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { io.observe(el); });
  }

  // Mark sections for reveal
  document.querySelectorAll(".section-head, .why-card, .review-card, .stat-band, .cta-inner").forEach(function (el) {
    el.classList.add("reveal");
  });
  observeReveals();
})();
