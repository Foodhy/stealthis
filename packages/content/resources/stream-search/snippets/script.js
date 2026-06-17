(function () {
  "use strict";

  /* ---------- Data (fictional catalog) ---------- */
  var CATALOG = [
    { t: "Neon Harbor", genre: "Sci-Fi", year: 2025, rating: 8.7, match: 97, q: "4K", g1: "#1b2a4a", g2: "#5a3cff", tag: "new" },
    { t: "The Quiet Mile", genre: "Drama", year: 2024, rating: 8.2, match: 91, q: "HD", g1: "#3a2a1a", g2: "#b5651d" },
    { t: "Crimson Static", genre: "Thriller", year: 2025, rating: 7.9, match: 88, q: "4K", g1: "#3a0d12", g2: "#e50914", tag: "new" },
    { t: "Paper Lanterns", genre: "Romance", year: 2023, rating: 7.6, match: 84, q: "HD", g1: "#3a1230", g2: "#ff6ad5" },
    { t: "Glass Continent", genre: "Documentary", year: 2024, rating: 8.5, match: 79, q: "4K", g1: "#0d2a2a", g2: "#16a085" },
    { t: "Howl & Hollow", genre: "Horror", year: 2025, rating: 7.1, match: 73, q: "HD", g1: "#1a0d1a", g2: "#7c2cff", tag: "new" },
    { t: "Midnight Cartographer", genre: "Sci-Fi", year: 2022, rating: 8.0, match: 90, q: "HD", g1: "#10233f", g2: "#2f80ed" },
    { t: "Salt & Vinegar Club", genre: "Comedy", year: 2024, rating: 7.4, match: 81, q: "HD", g1: "#2a2a0d", g2: "#f1c40f" },
    { t: "Ironwood", genre: "Drama", year: 2021, rating: 8.9, match: 95, q: "4K", g1: "#1d2a1a", g2: "#27ae60" },
    { t: "Velvet Frequency", genre: "Thriller", year: 2023, rating: 7.8, match: 86, q: "4K", g1: "#2a0d2a", g2: "#9b59b6" },
    { t: "The Last Aurora", genre: "Sci-Fi", year: 2025, rating: 8.4, match: 93, q: "4K", g1: "#0d2030", g2: "#00d2d3", tag: "new" },
    { t: "Sundown Diner", genre: "Romance", year: 2022, rating: 7.3, match: 77, q: "HD", g1: "#3a1d0d", g2: "#e67e22" },
    { t: "Hollow Tide", genre: "Horror", year: 2024, rating: 7.0, match: 70, q: "HD", g1: "#0d1a2a", g2: "#34495e" },
    { t: "Bureau of Lost Stars", genre: "Documentary", year: 2025, rating: 8.6, match: 82, q: "4K", g1: "#1a1a3a", g2: "#5a6bff", tag: "new" },
    { t: "Carousel of Crows", genre: "Thriller", year: 2021, rating: 7.7, match: 85, q: "HD", g1: "#1a0d0d", g2: "#c0392b" },
    { t: "Two Left Feet", genre: "Comedy", year: 2023, rating: 7.2, match: 80, q: "HD", g1: "#0d2a1d", g2: "#2ecc71" },
    { t: "Cathedral of Wires", genre: "Sci-Fi", year: 2024, rating: 8.1, match: 89, q: "4K", g1: "#1a103a", g2: "#8e44ff" },
    { t: "The Ash Garden", genre: "Drama", year: 2025, rating: 8.3, match: 92, q: "4K", g1: "#2a1a0d", g2: "#d35400", tag: "new" },
    { t: "Whisper Network", genre: "Thriller", year: 2022, rating: 7.5, match: 83, q: "HD", g1: "#0d1a1a", g2: "#1abc9c" },
    { t: "Marigold Heist", genre: "Comedy", year: 2024, rating: 7.6, match: 78, q: "HD", g1: "#2a230d", g2: "#f39c12" },
    { t: "Beneath the Pier", genre: "Horror", year: 2023, rating: 6.9, match: 68, q: "HD", g1: "#0d1530", g2: "#34568b" },
    { t: "Orbit & Ember", genre: "Romance", year: 2025, rating: 7.9, match: 87, q: "4K", g1: "#3a0d24", g2: "#ff5e8a", tag: "new" },
    { t: "The Tideglass Files", genre: "Documentary", year: 2022, rating: 8.0, match: 75, q: "HD", g1: "#0d2a26", g2: "#16c79a" },
    { t: "Nightshade Avenue", genre: "Thriller", year: 2024, rating: 8.2, match: 90, q: "4K", g1: "#1a0d2a", g2: "#6c5ce7" }
  ];

  var GENRES = ["All", "Sci-Fi", "Thriller", "Drama", "Romance", "Comedy", "Horror", "Documentary"];

  /* ---------- State ---------- */
  var state = { query: "", genre: "All", sort: "trending", active: -1 };

  /* ---------- Elements ---------- */
  var $ = function (s) { return document.querySelector(s); };
  var els = {
    search: $("#search"),
    clear: $("#clear"),
    suggest: $("#suggest"),
    chips: $("#chips"),
    sort: $("#sort"),
    grid: $("#results"),
    title: $("#results-title"),
    count: $("#count"),
    empty: $("#empty"),
    reset: $("#reset"),
    topnav: $("#topnav"),
    toast: $("#toast")
  };

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove("show"); }, 2200);
  }

  /* ---------- Helpers ---------- */
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function highlight(text, q) {
    if (!q) return esc(text);
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  }

  function filtered() {
    var q = state.query.trim().toLowerCase();
    var list = CATALOG.filter(function (m) {
      var byGenre = state.genre === "All" || m.genre === state.genre;
      var byQuery = !q || m.t.toLowerCase().indexOf(q) >= 0 || m.genre.toLowerCase().indexOf(q) >= 0;
      return byGenre && byQuery;
    });
    var s = state.sort;
    list.sort(function (a, b) {
      if (s === "rating") return b.rating - a.rating;
      if (s === "year") return b.year - a.year;
      if (s === "az") return a.t.localeCompare(b.t);
      return b.match - a.match; // trending
    });
    return list;
  }

  /* ---------- Chips ---------- */
  function buildChips() {
    GENRES.forEach(function (g) {
      var b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.textContent = g;
      b.setAttribute("aria-selected", g === state.genre ? "true" : "false");
      b.addEventListener("click", function () {
        state.genre = g;
        Array.prototype.forEach.call(els.chips.children, function (c) {
          c.setAttribute("aria-selected", c.textContent === g ? "true" : "false");
        });
        renderWithLoading();
      });
      els.chips.appendChild(b);
    });
  }

  /* ---------- Cards ---------- */
  function cardHTML(m) {
    var badges = '<span class="qbadge">' + m.q + "</span>";
    if (m.tag === "new") badges += '<span class="qbadge new">NEW</span>';
    return (
      '<article class="card" tabindex="0" role="button" aria-label="' + esc(m.t) + ', ' + m.genre + ', rated ' + m.rating + '">' +
        '<div class="poster" style="background:linear-gradient(150deg,' + m.g1 + ',' + m.g2 + ')">' +
          '<div class="badges">' + badges + "</div>" +
          '<div class="poster-title">' + esc(m.t) + "</div>" +
          '<div class="hover-meta">' +
            '<button class="play-btn" type="button" aria-label="Play ' + esc(m.t) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button>' +
            '<span class="match">' + m.match + "% match</span>" +
          "</div>" +
        "</div>" +
        '<div class="info">' +
          '<span class="t">' + esc(m.t) + "</span>" +
          '<span class="sub"><span class="rating">★ ' + m.rating.toFixed(1) + "</span><span class=\"dot\"></span>" + m.year + '<span class="dot"></span>' + m.genre + "</span>" +
        "</div>" +
      "</article>"
    );
  }

  function skeletonHTML() {
    return '<article class="card skeleton"><div class="poster"></div><div class="info"><span class="t"></span><span class="sub"></span></div></article>';
  }

  /* ---------- Render ---------- */
  function render() {
    var list = filtered();
    if (!list.length) {
      els.grid.innerHTML = "";
      els.empty.hidden = false;
    } else {
      els.empty.hidden = true;
      els.grid.innerHTML = list.map(cardHTML).join("");
    }
    els.grid.setAttribute("aria-busy", "false");

    var q = state.query.trim();
    els.title.textContent = q ? 'Results for "' + q + '"' : (state.genre === "All" ? "Browse everything" : state.genre);
    els.count.textContent = list.length + (list.length === 1 ? " title" : " titles");

    Array.prototype.forEach.call(els.grid.querySelectorAll(".card"), function (card, i) {
      var title = list[i].t;
      card.addEventListener("click", function (e) {
        if (e.target.closest(".play-btn")) { toast("▶ Playing “" + title + "”"); return; }
        toast("Opening “" + title + "”");
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toast("Opening “" + title + "”"); }
      });
    });
  }

  var loadTimer;
  function renderWithLoading() {
    closeSuggest();
    els.grid.setAttribute("aria-busy", "true");
    els.empty.hidden = true;
    var n = Math.max(filtered().length, 6);
    var skel = "";
    for (var i = 0; i < Math.min(n, 12); i++) skel += skeletonHTML();
    els.grid.innerHTML = skel;
    clearTimeout(loadTimer);
    loadTimer = setTimeout(render, 320);
  }

  /* ---------- Suggestions ---------- */
  function suggestions() {
    var q = state.query.trim().toLowerCase();
    if (!q) return [];
    var out = [];
    GENRES.forEach(function (g) {
      if (g !== "All" && g.toLowerCase().indexOf(q) >= 0) out.push({ label: g, type: "genre" });
    });
    CATALOG.forEach(function (m) {
      if (m.t.toLowerCase().indexOf(q) >= 0) out.push({ label: m.t, type: "title", meta: m.year + " · " + m.genre });
    });
    return out.slice(0, 7);
  }

  function ICON(type) {
    if (type === "genre") return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg>';
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M16 4v16M3 9h5M16 9h5M3 15h5M16 15h5"/></svg>';
  }

  function renderSuggest() {
    var items = suggestions();
    state.active = -1;
    if (!items.length) { closeSuggest(); return; }
    var q = state.query.trim();
    els.suggest.innerHTML = items.map(function (it, i) {
      return '<li role="option" id="opt-' + i + '" aria-selected="false">' +
        '<span class="s-ico">' + ICON(it.type) + "</span>" +
        "<span>" + highlight(it.label, q) + "</span>" +
        (it.meta ? '<span class="s-meta">' + esc(it.meta) + "</span>" : '<span class="s-meta">Genre</span>') +
      "</li>";
    }).join("");
    els.suggest.hidden = false;
    els.search.setAttribute("aria-expanded", "true");

    Array.prototype.forEach.call(els.suggest.children, function (li, i) {
      li.addEventListener("mousedown", function (e) {
        e.preventDefault();
        chooseSuggestion(items[i]);
      });
    });
  }

  function chooseSuggestion(it) {
    if (it.type === "genre") {
      els.search.value = "";
      state.query = "";
      state.genre = it.label;
      Array.prototype.forEach.call(els.chips.children, function (c) {
        c.setAttribute("aria-selected", c.textContent === it.label ? "true" : "false");
      });
    } else {
      els.search.value = it.label;
      state.query = it.label;
    }
    els.clear.hidden = !els.search.value;
    renderWithLoading();
  }

  function closeSuggest() {
    els.suggest.hidden = true;
    els.suggest.innerHTML = "";
    els.search.setAttribute("aria-expanded", "false");
    state.active = -1;
  }

  function moveActive(dir) {
    var opts = els.suggest.querySelectorAll("li");
    if (!opts.length) return;
    if (opts[state.active]) opts[state.active].setAttribute("aria-selected", "false");
    state.active = (state.active + dir + opts.length) % opts.length;
    opts[state.active].setAttribute("aria-selected", "true");
    els.search.setAttribute("aria-activedescendant", "opt-" + state.active);
    opts[state.active].scrollIntoView({ block: "nearest" });
  }

  /* ---------- Events ---------- */
  var debTimer;
  els.search.addEventListener("input", function () {
    state.query = els.search.value;
    els.clear.hidden = !els.search.value;
    renderSuggest();
    clearTimeout(debTimer);
    debTimer = setTimeout(renderWithLoading, 220);
  });

  els.search.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (els.suggest.hidden) renderSuggest(); else moveActive(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
    else if (e.key === "Enter") {
      var opts = els.suggest.querySelectorAll("li");
      if (state.active >= 0 && opts[state.active]) {
        e.preventDefault();
        opts[state.active].dispatchEvent(new MouseEvent("mousedown"));
      } else {
        clearTimeout(debTimer);
        renderWithLoading();
      }
    } else if (e.key === "Escape") {
      if (!els.suggest.hidden) { closeSuggest(); }
      else if (els.search.value) { els.search.value = ""; state.query = ""; els.clear.hidden = true; renderWithLoading(); }
    }
  });

  els.search.addEventListener("blur", function () { setTimeout(closeSuggest, 120); });

  els.clear.addEventListener("click", function () {
    els.search.value = "";
    state.query = "";
    els.clear.hidden = true;
    closeSuggest();
    els.search.focus();
    renderWithLoading();
  });

  els.sort.addEventListener("change", function () {
    state.sort = els.sort.value;
    renderWithLoading();
    toast("Sorted by " + els.sort.options[els.sort.selectedIndex].text.toLowerCase());
  });

  els.reset.addEventListener("click", function () {
    state.query = "";
    state.genre = "All";
    state.sort = "trending";
    els.search.value = "";
    els.clear.hidden = true;
    els.sort.value = "trending";
    Array.prototype.forEach.call(els.chips.children, function (c) {
      c.setAttribute("aria-selected", c.textContent === "All" ? "true" : "false");
    });
    renderWithLoading();
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-wrap")) closeSuggest();
  });

  window.addEventListener("scroll", function () {
    els.topnav.classList.toggle("scrolled", window.scrollY > 12);
  }, { passive: true });

  /* ---------- Init ---------- */
  buildChips();
  render();
})();
