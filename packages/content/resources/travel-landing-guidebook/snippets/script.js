/* ============================================================
   Meridian — Classic Guidebook Landing
   Vanilla JS. No libs. Every interaction works.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- toast ---------- */
  const toastEl = $("#toast");
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- smooth scroll for [data-scroll] ---------- */
  function scrollToTarget(target) {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  }

  $$("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => scrollToTarget(btn.dataset.scroll));
  });

  /* ---------- mobile nav ---------- */
  const navToggle = $(".nav-toggle");
  const mobileNav = $("#mobileNav");
  function closeMobileNav() {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("open");
    mobileNav.hidden = true;
  }
  function toggleMobileNav() {
    if (!navToggle || !mobileNav) return;
    const open = navToggle.getAttribute("aria-expanded") === "true";
    if (open) {
      closeMobileNav();
    } else {
      navToggle.setAttribute("aria-expanded", "true");
      mobileNav.hidden = false;
      requestAnimationFrame(() => mobileNav.classList.add("open"));
    }
  }
  if (navToggle) navToggle.addEventListener("click", toggleMobileNav);
  if (mobileNav) {
    $$("a", mobileNav).forEach((a) =>
      a.addEventListener("click", closeMobileNav)
    );
  }
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMobileNav();
  });

  /* ---------- count-up stats ---------- */
  function formatNumber(n) {
    return n.toLocaleString("en-US");
  }
  function countUp(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (prefersReduced) {
      el.textContent = formatNumber(target);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNumber(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = formatNumber(target);
    }
    requestAnimationFrame(tick);
  }

  const counters = $$("[data-count]");
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              countUp(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach((c) => io.observe(c));
    } else {
      counters.forEach(countUp);
    }
  }

  /* ============================================================
     GUIDE DATA + RENDERING
     ============================================================ */
  const GUIDES = [
    {
      id: "lisbon",
      title: "Lisbon & the Algarve",
      region: "europe",
      regionLabel: "Europe",
      country: "Portugal",
      blurb:
        "Tram 28 done right, the tascas locals queue for, and a coast walk that ends in grilled sardines.",
      rating: 4.9,
      reviews: 2140,
      price: "$24",
      best: "Apr–Jun",
      c1: "#f4c9a3",
      c2: "#e8623f",
      scene: "coast",
    },
    {
      id: "kyoto",
      title: "Kyoto & Kansai",
      region: "asia",
      regionLabel: "Asia",
      country: "Japan",
      blurb:
        "Back-route temple walks before the crowds, the ryokan that kept its old onsen, and a kaiseki worth saving for.",
      rating: 4.8,
      reviews: 3015,
      price: "$28",
      best: "Mar & Nov",
      c1: "#7fb8b3",
      c2: "#1f6a68",
      scene: "mountain",
    },
    {
      id: "oaxaca",
      title: "Oaxaca & the South",
      region: "americas",
      regionLabel: "Americas",
      country: "Mexico",
      blurb:
        "Mezcalerías with no sign on the door, market stalls by name, and hand-drawn maps of every barrio.",
      rating: 4.9,
      reviews: 1680,
      price: "$22",
      best: "Oct–Dec",
      c1: "#e8a98a",
      c2: "#caa23a",
      scene: "city",
    },
    {
      id: "kerry",
      title: "West Ireland Coast",
      region: "europe",
      regionLabel: "Europe",
      country: "Ireland",
      blurb:
        "The Wild Atlantic Way without the tour buses — sea cliffs, trad sessions, and where to wait out the rain.",
      rating: 4.7,
      reviews: 980,
      price: "$21",
      best: "May–Sep",
      c1: "#5a7d3c",
      c2: "#1f8a8a",
      scene: "coast",
    },
    {
      id: "hanoi",
      title: "Hanoi & the North",
      region: "asia",
      regionLabel: "Asia",
      country: "Vietnam",
      blurb:
        "A cheap-eats map that pays for itself by lunch, the sleeper train to Sa Pa, and tea hills above the clouds.",
      rating: 4.8,
      reviews: 2530,
      price: "$23",
      best: "Sep–Nov",
      c1: "#7fb8b3",
      c2: "#5a7d3c",
      scene: "mountain",
    },
    {
      id: "patagonia",
      title: "Patagonia Crossing",
      region: "americas",
      regionLabel: "Americas",
      country: "Chile & Argentina",
      blurb:
        "The W trek paced for real legs, border crossings without the headache, and which refugio to book first.",
      rating: 4.9,
      reviews: 1420,
      price: "$29",
      best: "Nov–Mar",
      c1: "#4f9591",
      c2: "#1b5b5a",
      scene: "mountain",
    },
  ];

  function coverSVG(g) {
    const gid = "g_" + g.id;
    const scenes = {
      coast:
        '<path d="M0 78 Q40 70 80 78 T160 78 T240 78 T320 78 L320 200 L0 200 Z" fill="rgba(255,255,255,.18)"/>' +
        '<path d="M0 92 Q60 84 120 92 T240 92 T360 92 L360 200 L0 200 Z" fill="rgba(20,40,40,.28)"/>',
      mountain:
        '<path d="M0 120 L70 60 L120 100 L180 40 L250 110 L320 70 L320 200 L0 200 Z" fill="rgba(20,40,40,.32)"/>' +
        '<path d="M150 70 L180 40 L210 70 Z" fill="rgba(255,255,255,.55)"/>',
      city:
        '<g fill="rgba(20,30,40,.32)">' +
        '<rect x="30" y="90" width="34" height="80"/>' +
        '<rect x="72" y="60" width="30" height="110"/>' +
        '<rect x="110" y="100" width="40" height="70"/>' +
        '<rect x="158" y="48" width="26" height="122"/>' +
        '<rect x="192" y="84" width="36" height="86"/>' +
        '<rect x="236" y="66" width="30" height="104"/>' +
        '<rect x="274" y="96" width="34" height="74"/></g>',
    };
    return (
      '<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' +
      g.country +
      ' cover illustration">' +
      '<defs><linearGradient id="' +
      gid +
      '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' +
      g.c1 +
      '"/><stop offset="1" stop-color="' +
      g.c2 +
      '"/></linearGradient></defs>' +
      '<rect width="320" height="200" fill="url(#' +
      gid +
      ')"/>' +
      '<circle cx="262" cy="44" r="22" fill="rgba(255,253,233,.85)"/>' +
      (scenes[g.scene] || scenes.mountain) +
      "</svg>"
    );
  }

  function stars(rating) {
    const full = Math.round(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  const tripSet = new Set();
  const favSet = new Set();

  function guideCard(g) {
    const li = document.createElement("article");
    li.className = "guide";
    li.dataset.region = g.region;
    li.dataset.id = g.id;
    li.innerHTML =
      '<div class="guide-cover">' +
      coverSVG(g) +
      '<span class="best-badge">Best: ' +
      g.best +
      "</span>" +
      '<button class="guide-fav" type="button" aria-pressed="false" aria-label="Save ' +
      g.title +
      ' to favorites">♥</button>' +
      '<span class="cover-label">' +
      g.title +
      "</span>" +
      "</div>" +
      '<div class="guide-body">' +
      '<p class="guide-meta">' +
      g.country +
      '<span class="dot"></span>' +
      g.regionLabel +
      "</p>" +
      '<p class="guide-blurb">' +
      g.blurb +
      "</p>" +
      '<div class="guide-foot">' +
      '<span class="guide-rating"><span class="stars" aria-hidden="true">' +
      stars(g.rating) +
      "</span>" +
      g.rating.toFixed(1) +
      ' <span class="sr-only">out of 5 from ' +
      g.reviews +
      ' reviews</span></span>' +
      '<span class="guide-price">' +
      g.price +
      "</span>" +
      "</div>" +
      '<button class="add-trip" type="button">+ Add to trip</button>' +
      "</div>";

    const fav = $(".guide-fav", li);
    fav.addEventListener("click", () => {
      const on = fav.getAttribute("aria-pressed") === "true";
      fav.setAttribute("aria-pressed", String(!on));
      if (!on) {
        favSet.add(g.id);
        fav.classList.add("beat");
        setTimeout(() => fav.classList.remove("beat"), 400);
        toast("Saved " + g.title + " to favorites");
      } else {
        favSet.delete(g.id);
        toast("Removed " + g.title + " from favorites");
      }
    });

    const add = $(".add-trip", li);
    add.addEventListener("click", () => {
      if (tripSet.has(g.id)) {
        tripSet.delete(g.id);
        add.classList.remove("added");
        add.textContent = "+ Add to trip";
        toast("Removed " + g.title + " from your trip");
      } else {
        tripSet.add(g.id);
        add.classList.add("added");
        add.textContent = "✓ In your trip";
        toast("Added " + g.title + " to your trip");
      }
      updateTripCount();
    });

    return li;
  }

  const grid = $("#guideGrid");
  const emptyState = $("#emptyState");
  function renderGuides(filter) {
    if (!grid) return;
    grid.innerHTML = "";
    const list =
      filter && filter !== "all"
        ? GUIDES.filter((g) => g.region === filter)
        : GUIDES.slice();
    list.forEach((g, i) => {
      const card = guideCard(g);
      if (favSet.has(g.id)) {
        $(".guide-fav", card).setAttribute("aria-pressed", "true");
      }
      if (tripSet.has(g.id)) {
        const add = $(".add-trip", card);
        add.classList.add("added");
        add.textContent = "✓ In your trip";
      }
      card.style.animationDelay = (prefersReduced ? 0 : i * 60) + "ms";
      grid.appendChild(card);
    });
    if (emptyState) emptyState.hidden = list.length > 0;
  }
  renderGuides("all");

  $$(".filter .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$(".filter .chip").forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      renderGuides(chip.dataset.filter);
    });
  });

  /* ---------- trip count badge ---------- */
  const tripCountEl = $("#tripCount");
  function updateTripCount() {
    if (!tripCountEl) return;
    tripCountEl.textContent = String(tripSet.size);
    tripCountEl.classList.remove("pulse");
    void tripCountEl.offsetWidth;
    tripCountEl.classList.add("pulse");
  }

  /* ============================================================
     HERO SEARCH — live suggestions
     ============================================================ */
  const PLACES = [
    { name: "Lisbon", region: "Europe", id: "lisbon" },
    { name: "Porto", region: "Europe", id: "lisbon" },
    { name: "Kyoto", region: "Asia", id: "kyoto" },
    { name: "Osaka", region: "Asia", id: "kyoto" },
    { name: "Oaxaca", region: "Americas", id: "oaxaca" },
    { name: "Mexico City", region: "Americas", id: "oaxaca" },
    { name: "Dingle", region: "Europe", id: "kerry" },
    { name: "Galway", region: "Europe", id: "kerry" },
    { name: "Hanoi", region: "Asia", id: "hanoi" },
    { name: "Sa Pa", region: "Asia", id: "hanoi" },
    { name: "Torres del Paine", region: "Americas", id: "patagonia" },
    { name: "El Chaltén", region: "Americas", id: "patagonia" },
  ];

  const destInput = $("#dest");
  const suggestBox = $("#suggest");
  const searchBtn = $("#searchBtn");
  let activeIdx = -1;
  let currentMatches = [];

  function closeSuggest() {
    if (!suggestBox) return;
    suggestBox.hidden = true;
    suggestBox.innerHTML = "";
    activeIdx = -1;
    currentMatches = [];
    if (destInput) destInput.setAttribute("aria-expanded", "false");
  }

  function highlightActive() {
    if (!suggestBox) return;
    $$("button", suggestBox).forEach((b, i) => {
      b.classList.toggle("active", i === activeIdx);
      if (i === activeIdx) b.scrollIntoView({ block: "nearest" });
    });
  }

  function pickPlace(place) {
    if (destInput) destInput.value = place.name;
    closeSuggest();
    toast("Opening the " + place.name + " guide");
    scrollToTarget("#guides");
    const card = grid && grid.querySelector('[data-id="' + place.id + '"]');
    if (card && !prefersReduced) {
      card.animate(
        [
          { boxShadow: "0 0 0 0 rgba(31,138,138,0)" },
          { boxShadow: "0 0 0 4px rgba(31,138,138,.45)" },
          { boxShadow: "0 0 0 0 rgba(31,138,138,0)" },
        ],
        { duration: 1200, easing: "ease-out" }
      );
    }
  }

  function renderSuggest(query) {
    if (!suggestBox) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      closeSuggest();
      return;
    }
    currentMatches = PLACES.filter((p) =>
      p.name.toLowerCase().includes(q)
    ).slice(0, 6);
    if (!currentMatches.length) {
      suggestBox.innerHTML =
        '<button type="button" disabled style="cursor:default;color:var(--muted)">No match — try Lisbon, Kyoto or Oaxaca</button>';
      suggestBox.hidden = false;
      activeIdx = -1;
      return;
    }
    suggestBox.innerHTML = currentMatches
      .map(
        (p) =>
          '<button type="button"><span aria-hidden="true">📍</span> ' +
          p.name +
          '<span class="s-region">' +
          p.region +
          "</span></button>"
      )
      .join("");
    $$("button", suggestBox).forEach((b, i) => {
      if (currentMatches[i]) {
        b.addEventListener("click", () => pickPlace(currentMatches[i]));
        b.addEventListener("mousemove", () => {
          activeIdx = i;
          highlightActive();
        });
      }
    });
    suggestBox.hidden = false;
    activeIdx = -1;
    if (destInput) destInput.setAttribute("aria-expanded", "true");
  }

  function runSearch() {
    if (!destInput) return;
    const q = destInput.value.trim();
    if (!q) {
      toast("Type a city, country or trail to search");
      destInput.focus();
      return;
    }
    if (activeIdx >= 0 && currentMatches[activeIdx]) {
      pickPlace(currentMatches[activeIdx]);
      return;
    }
    if (currentMatches.length) {
      pickPlace(currentMatches[0]);
      return;
    }
    toast('No guide for "' + q + '" yet — browse the collection');
    scrollToTarget("#guides");
    closeSuggest();
  }

  if (destInput) {
    destInput.setAttribute("role", "combobox");
    destInput.setAttribute("aria-autocomplete", "list");
    destInput.setAttribute("aria-expanded", "false");
    destInput.setAttribute("aria-controls", "suggest");

    destInput.addEventListener("input", () => renderSuggest(destInput.value));
    destInput.addEventListener("keydown", (e) => {
      if (suggestBox.hidden || !currentMatches.length) {
        if (e.key === "Enter") {
          e.preventDefault();
          runSearch();
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIdx = (activeIdx + 1) % currentMatches.length;
        highlightActive();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIdx =
          (activeIdx - 1 + currentMatches.length) % currentMatches.length;
        highlightActive();
      } else if (e.key === "Enter") {
        e.preventDefault();
        runSearch();
      } else if (e.key === "Escape") {
        closeSuggest();
      }
    });
  }
  if (searchBtn) searchBtn.addEventListener("click", runSearch);

  document.addEventListener("click", (e) => {
    if (suggestBox && !suggestBox.hidden) {
      if (!e.target.closest(".hero-search")) closeSuggest();
    }
  });

  /* ============================================================
     NEWSLETTER — inline validation
     ============================================================ */
  const newsForm = $("#newsForm");
  const emailInput = $("#email");
  const newsMsg = $("#newsMsg");
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setNews(kind, msg) {
    if (!newsMsg) return;
    newsMsg.textContent = msg;
    newsMsg.className = "news-msg" + (kind ? " " + kind : "");
  }

  if (newsForm && emailInput && newsMsg) {
    newsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = emailInput.value.trim();
      if (!val) {
        setNews("err", "Pop in an email so we know where to send it.");
        emailInput.classList.add("invalid");
        emailInput.focus();
        return;
      }
      if (!EMAIL_RE.test(val)) {
        setNews("err", "That email looks off — mind checking it?");
        emailInput.classList.add("invalid");
        emailInput.focus();
        return;
      }
      emailInput.classList.remove("invalid");
      setNews("ok", "You're in — the next dispatch lands this Friday. ✉");
      toast("Subscribed to The Dispatch");
      newsForm.reset();
    });

    emailInput.addEventListener("input", () => {
      if (emailInput.classList.contains("invalid")) {
        emailInput.classList.remove("invalid");
        setNews("", "");
      }
    });
  }

  /* ---------- scroll-spy ---------- */
  const navLinkMap = {};
  $$(".nav-links a").forEach((a) => {
    const id = a.getAttribute("href");
    if (id && id.startsWith("#")) navLinkMap[id.slice(1)] = a;
  });
  const spyTargets = ["guides", "experts", "community", "newsletter"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (spyTargets.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = navLinkMap[entry.target.id];
          if (link) link.classList.toggle("is-current", entry.isIntersecting);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    spyTargets.forEach((t) => spy.observe(t));
  }
})();
