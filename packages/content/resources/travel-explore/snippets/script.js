(function () {
  "use strict";

  // ---- Fictional destination data -----------------------------------------
  // priceFrom in USD (illustrative). budget tier 1=$ 2=$$ 3=$$$.
  // gradients are pure CSS — no external images.
  var DESTINATIONS = [
    { id: "lisbon", name: "Lisbon", country: "Portugal", region: "Europe", vibe: "city",
      rating: 4.8, reviews: 2140, priceFrom: 620, budget: 2, months: ["Apr", "May", "Sep", "Oct"], popularity: 98,
      blurb: "Tiled hills, custard tarts and tram-yellow afternoons.",
      g: "linear-gradient(135deg,#f0a07a,#e8623f 55%,#9a3b6f)" },
    { id: "kyoto", name: "Kyoto", country: "Japan", region: "Asia", vibe: "city",
      rating: 4.9, reviews: 3180, priceFrom: 940, budget: 3, months: ["Mar", "Apr", "Nov"], popularity: 96,
      blurb: "Lantern lanes, moss gardens and slow temple mornings.",
      g: "linear-gradient(135deg,#f4c4c0,#d76a8a 55%,#6e3b8a)" },
    { id: "santorini", name: "Santorini", country: "Greece", region: "Europe", vibe: "beach",
      rating: 4.6, reviews: 1870, priceFrom: 880, budget: 3, months: ["May", "Jun", "Sep"], popularity: 91,
      blurb: "White cliffs over a caldera the colour of deep ink.",
      g: "linear-gradient(135deg,#9fd0e8,#3f86c4 55%,#1f3d8a)" },
    { id: "queenstown", name: "Queenstown", country: "New Zealand", region: "Oceania", vibe: "nature",
      rating: 4.7, reviews: 1320, priceFrom: 1150, budget: 3, months: ["Dec", "Jan", "Feb"], popularity: 84,
      blurb: "Alpine lakes, jet boats and wide southern skies.",
      g: "linear-gradient(135deg,#bfe6c8,#2f9e7a 55%,#1c5a6e)" },
    { id: "marrakech", name: "Marrakech", country: "Morocco", region: "Africa", vibe: "city",
      rating: 4.5, reviews: 1640, priceFrom: 410, budget: 1, months: ["Mar", "Apr", "Oct", "Nov"], popularity: 88,
      blurb: "Spice-stall colour, riad courtyards and rooftop dusk.",
      g: "linear-gradient(135deg,#f3c969,#e8623f 55%,#a8323b)" },
    { id: "tulum", name: "Tulum", country: "Mexico", region: "Americas", vibe: "beach",
      rating: 4.4, reviews: 1990, priceFrom: 560, budget: 2, months: ["Jan", "Feb", "Mar", "Dec"], popularity: 87,
      blurb: "Jungle-edge cenotes and a long, soft Caribbean shore.",
      g: "linear-gradient(135deg,#a8e6d4,#1f8a8a 55%,#1d4f5e)" },
    { id: "banff", name: "Banff", country: "Canada", region: "Americas", vibe: "nature",
      rating: 4.8, reviews: 1450, priceFrom: 720, budget: 2, months: ["Jun", "Jul", "Aug", "Sep"], popularity: 82,
      blurb: "Glacier-fed lakes mirroring a wall of dark pines.",
      g: "linear-gradient(135deg,#bfe2ee,#3f86c4 55%,#244a6e)" },
    { id: "bali", name: "Ubud, Bali", country: "Indonesia", region: "Asia", vibe: "nature",
      rating: 4.6, reviews: 2760, priceFrom: 380, budget: 1, months: ["Apr", "May", "Jun", "Sep"], popularity: 93,
      blurb: "Terraced rice fields and incense-scented mornings.",
      g: "linear-gradient(135deg,#d6e89a,#5aa83b 55%,#1f6e4a)" },
    { id: "cinque", name: "Cinque Terre", country: "Italy", region: "Europe", vibe: "beach",
      rating: 4.7, reviews: 1710, priceFrom: 690, budget: 2, months: ["May", "Jun", "Sep"], popularity: 85,
      blurb: "Pastel cliff villages stitched by a coastal trail.",
      g: "linear-gradient(135deg,#f6b486,#e8623f 55%,#1f6e7a)" },
    { id: "capetown", name: "Cape Town", country: "South Africa", region: "Africa", vibe: "city",
      rating: 4.6, reviews: 1580, priceFrom: 540, budget: 2, months: ["Nov", "Dec", "Jan", "Feb"], popularity: 80,
      blurb: "A flat-topped mountain above two restless oceans.",
      g: "linear-gradient(135deg,#f3c969,#1f8a8a 55%,#23406e)" },
    { id: "hoian", name: "Hoi An", country: "Vietnam", region: "Asia", vibe: "city",
      rating: 4.7, reviews: 2230, priceFrom: 320, budget: 1, months: ["Feb", "Mar", "Apr"], popularity: 86,
      blurb: "Lantern-lit old town reflected in a slow river.",
      g: "linear-gradient(135deg,#f7d27a,#e8623f 55%,#7a2f6e)" },
    { id: "reykjavik", name: "Reykjavík", country: "Iceland", region: "Europe", vibe: "nature",
      rating: 4.5, reviews: 1240, priceFrom: 980, budget: 3, months: ["Jun", "Jul", "Sep"], popularity: 78,
      blurb: "Geysers, black sand and a sky that barely sleeps.",
      g: "linear-gradient(135deg,#b8c8e8,#3f5fc4 55%,#1c2a5e)" },
    { id: "maui", name: "Maui", country: "USA", region: "Oceania", vibe: "beach",
      rating: 4.7, reviews: 2410, priceFrom: 1090, budget: 3, months: ["Apr", "May", "Sep", "Oct"], popularity: 89,
      blurb: "Volcano roads down to a quiet, sun-warmed lagoon.",
      g: "linear-gradient(135deg,#9fe2d4,#1f8a8a 55%,#1d5a6e)" },
    { id: "cartagena", name: "Cartagena", country: "Colombia", region: "Americas", vibe: "city",
      rating: 4.5, reviews: 1360, priceFrom: 430, budget: 1, months: ["Jan", "Feb", "Mar"], popularity: 81,
      blurb: "Walled city of bougainvillea and warm night plazas.",
      g: "linear-gradient(135deg,#f6a8c0,#e8623f 55%,#9a3b6f)" },
    { id: "lapland", name: "Lapland", country: "Finland", region: "Europe", vibe: "nature",
      rating: 4.6, reviews: 980, priceFrom: 860, budget: 3, months: ["Dec", "Jan", "Feb"], popularity: 76,
      blurb: "Snow-hushed forests under a green-ribboned sky.",
      g: "linear-gradient(135deg,#c4d8ee,#2f9ea8 55%,#1c2e5e)" },
    { id: "zanzibar", name: "Zanzibar", country: "Tanzania", region: "Africa", vibe: "beach",
      rating: 4.5, reviews: 1120, priceFrom: 590, budget: 2, months: ["Jun", "Jul", "Aug", "Sep"], popularity: 79,
      blurb: "Spice-island sails on water like pale jade glass.",
      g: "linear-gradient(135deg,#a8e6d4,#2f9e7a 55%,#1f5a6e)" }
  ];

  var TIER = { 1: "$", 2: "$$", 3: "$$$" };
  var VIBE_LABEL = { beach: "Beach", city: "City", nature: "Nature" };

  // ---- State ---------------------------------------------------------------
  var state = {
    q: "",
    region: "all",
    vibe: "all",
    budget: "all",
    month: "all",
    sort: "popular",
    saved: Object.create(null)
  };

  // ---- DOM refs ------------------------------------------------------------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var grid = $("#grid");
  var empty = $("#empty");
  var resultCount = $("#resultCount");
  var resetBtn = $("#resetBtn");
  var searchInput = $("#searchInput");
  var searchClear = $("#searchClear");
  var monthSelect = $("#monthSelect");
  var sortSelect = $("#sortSelect");
  var tripCount = $("#tripCount");
  var savedList = $("#savedList");
  var savedEmpty = $("#savedEmpty");

  // ---- Toast ---------------------------------------------------------------
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // ---- Filtering / sorting -------------------------------------------------
  function matches(d) {
    if (state.region !== "all" && d.region !== state.region) return false;
    if (state.vibe !== "all" && d.vibe !== state.vibe) return false;
    if (state.budget !== "all" && String(d.budget) !== state.budget) return false;
    if (state.month !== "all" && d.months.indexOf(state.month) === -1) return false;
    if (state.q) {
      var hay = (d.name + " " + d.country + " " + d.region + " " + d.vibe + " " + d.blurb).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function sortList(list) {
    var arr = list.slice();
    switch (state.sort) {
      case "rating": arr.sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; }); break;
      case "price-asc": arr.sort(function (a, b) { return a.priceFrom - b.priceFrom; }); break;
      case "price-desc": arr.sort(function (a, b) { return b.priceFrom - a.priceFrom; }); break;
      default: arr.sort(function (a, b) { return b.popularity - a.popularity; });
    }
    return arr;
  }

  function isFiltered() {
    return state.q || state.region !== "all" || state.vibe !== "all" ||
      state.budget !== "all" || state.month !== "all";
  }

  // ---- Card rendering ------------------------------------------------------
  function stars(rating) {
    return '<span class="star" aria-hidden="true">★</span>' +
      '<span>' + rating.toFixed(1) + '</span>';
  }

  function cardHtml(d) {
    var saved = !!state.saved[d.id];
    var bestMonth = d.months[0];
    return '' +
      '<li class="card" data-id="' + d.id + '">' +
        '<div class="card-hero">' +
          '<div class="scene" style="background:' + d.g + '"></div>' +
          '<div class="card-badges">' +
            '<span class="badge vibe">' + VIBE_LABEL[d.vibe] + '</span>' +
            '<span class="badge month">Best in ' + bestMonth + '</span>' +
          '</div>' +
          '<button class="save-btn" type="button" data-id="' + d.id + '" ' +
            'aria-pressed="' + saved + '" ' +
            'aria-label="' + (saved ? "Remove " : "Save ") + d.name + (saved ? " from" : " to") + ' your trip">' +
            '<svg viewBox="0 0 24 24" width="20" height="20" fill="' + (saved ? "currentColor" : "none") +
              '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-2 5 5 0 0 1 9 2c-2 4.6-9 9-9 9z"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-place">' +
            '<h3 class="card-name">' + d.name + '</h3>' +
            '<span class="card-country">' + d.country + '</span>' +
          '</div>' +
          '<p class="card-blurb">' + d.blurb + '</p>' +
          '<div class="card-meta">' +
            '<span class="rating">' + stars(d.rating) +
              '<span class="reviews">(' + d.reviews.toLocaleString() + ')</span></span>' +
            '<span class="price"><span class="from">From</span>' +
              '<span class="amount">$' + d.priceFrom + '<span class="tier">' + TIER[d.budget] + '</span></span></span>' +
          '</div>' +
        '</div>' +
      '</li>';
  }

  function render() {
    var visible = sortList(DESTINATIONS.filter(matches));

    if (visible.length === 0) {
      grid.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      grid.innerHTML = visible.map(cardHtml).join("");
    }

    // Result count message
    var total = DESTINATIONS.length;
    if (!isFiltered()) {
      resultCount.innerHTML = "Showing all <b>" + total + "</b> destinations";
    } else if (visible.length === 0) {
      resultCount.innerHTML = "<b>0</b> destinations match";
    } else {
      resultCount.innerHTML = "<b>" + visible.length + "</b> of " + total + " destinations";
    }

    resetBtn.hidden = !isFiltered();
  }

  // ---- Chip groups ---------------------------------------------------------
  $$(".chips").forEach(function (group) {
    var key = group.getAttribute("data-group");
    group.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn || !group.contains(btn)) return;
      state[key] = btn.getAttribute("data-value");
      $$(".chip", group).forEach(function (c) {
        var on = c === btn;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      render();
    });
  });

  // ---- Search --------------------------------------------------------------
  function applySearch() {
    state.q = searchInput.value.trim().toLowerCase();
    searchClear.hidden = state.q.length === 0;
    render();
  }
  searchInput.addEventListener("input", applySearch);
  $("#searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    applySearch();
    document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  searchClear.addEventListener("click", function () {
    searchInput.value = "";
    applySearch();
    searchInput.focus();
  });

  // ---- Month + sort --------------------------------------------------------
  monthSelect.addEventListener("change", function () {
    state.month = monthSelect.value;
    render();
  });
  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    render();
  });

  // ---- Reset ---------------------------------------------------------------
  function resetFilters() {
    state.q = ""; state.region = "all"; state.vibe = "all"; state.budget = "all"; state.month = "all";
    searchInput.value = "";
    searchClear.hidden = true;
    monthSelect.value = "all";
    $$(".chips").forEach(function (group) {
      $$(".chip", group).forEach(function (c, i) {
        var on = i === 0;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
    });
    render();
    toast("Filters cleared");
  }
  resetBtn.addEventListener("click", resetFilters);
  $("#emptyReset").addEventListener("click", resetFilters);

  // ---- Save / trip drawer --------------------------------------------------
  function destById(id) {
    for (var i = 0; i < DESTINATIONS.length; i++) if (DESTINATIONS[i].id === id) return DESTINATIONS[i];
    return null;
  }

  function updateTrip() {
    var ids = Object.keys(state.saved);
    tripCount.textContent = String(ids.length);
    if (ids.length === 0) {
      savedList.innerHTML = "";
      savedEmpty.hidden = false;
      return;
    }
    savedEmpty.hidden = true;
    savedList.innerHTML = ids.map(function (id) {
      var d = destById(id);
      return '' +
        '<li class="saved-item" data-id="' + id + '">' +
          '<span class="saved-thumb" style="background:' + d.g + '"></span>' +
          '<span class="saved-text"><strong>' + d.name + '</strong><span>' + d.country +
            ' · from $' + d.priceFrom + '</span></span>' +
          '<button class="saved-remove" type="button" data-id="' + id + '" ' +
            'aria-label="Remove ' + d.name + ' from your trip">&times;</button>' +
        '</li>';
    }).join("");
  }

  function toggleSave(id) {
    var d = destById(id);
    if (state.saved[id]) {
      delete state.saved[id];
      toast("Removed " + d.name + " from your trip");
    } else {
      state.saved[id] = true;
      toast("Saved " + d.name + " to your trip ♥");
    }
    // sync any visible save buttons for this id
    $$('.save-btn[data-id="' + id + '"]').forEach(function (btn) {
      var on = !!state.saved[id];
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", (on ? "Remove " : "Save ") + d.name + (on ? " from" : " to") + " your trip");
      var path = btn.querySelector("svg");
      if (path) path.setAttribute("fill", on ? "currentColor" : "none");
    });
    updateTrip();
  }

  // delegated save clicks in grid
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".save-btn");
    if (btn) { toggleSave(btn.getAttribute("data-id")); }
  });

  // delegated remove clicks in drawer
  savedList.addEventListener("click", function (e) {
    var btn = e.target.closest(".saved-remove");
    if (btn) { toggleSave(btn.getAttribute("data-id")); }
  });

  // ---- Drawer open/close ---------------------------------------------------
  var drawer = $("#drawer");
  var scrim = $("#drawerScrim");
  var tripBtn = $("#tripBtn");
  var drawerClose = $("#drawerClose");
  var lastFocus = null;

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    drawerClose.focus();
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  tripBtn.addEventListener("click", openDrawer);
  drawerClose.addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });

  // ---- Boot ----------------------------------------------------------------
  render();
  updateTrip();
})();
