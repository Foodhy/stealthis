(function () {
  "use strict";

  /* ----------------------------------------------------------------
   * Data — fictional points of interest around "Cala Verdana".
   * x/y are coordinates inside the 1000x700 SVG viewBox.
   * ---------------------------------------------------------------- */
  var GRADIENTS = {
    stay: "linear-gradient(150deg,#f3b07a,#e8623f)",
    eat: "linear-gradient(150deg,#f6cd6b,#d9a441)",
    beach: "linear-gradient(150deg,#8fd6d8,#1f8a8a)",
    trail: "linear-gradient(150deg,#bcd98c,#6f9a4a)",
    sight: "linear-gradient(150deg,#caa6e0,#8a5fb0)",
  };
  var CAT_LABEL = {
    stay: "Stay",
    eat: "Eat",
    beach: "Beach",
    trail: "Trail",
    sight: "Sight",
  };

  var PLACES = [
    { id: "p1", name: "Casa Marejada", cat: "stay", area: "Old Harbour", rating: 4.9, reviews: 214, price: 4, nightly: 186, best: "May–Sep", x: 372, y: 612 },
    { id: "p2", name: "The Salt Table", cat: "eat", area: "Fishermen's Row", rating: 4.7, reviews: 388, price: 3, nightly: 0, best: "Dinner", x: 430, y: 540 },
    { id: "p3", name: "Verdana Cove", cat: "beach", area: "South Shore", rating: 4.8, reviews: 902, price: 1, nightly: 0, best: "Morning", x: 352, y: 470 },
    { id: "p4", name: "Mirador del Pino", cat: "sight", area: "Pine Ridge", rating: 4.6, reviews: 156, price: 1, nightly: 0, best: "Golden hour", x: 700, y: 250 },
    { id: "p5", name: "Sendero Azul", cat: "trail", area: "Pine Ridge", rating: 4.5, reviews: 73, price: 1, nightly: 0, best: "Apr–Jun", x: 612, y: 330 },
    { id: "p6", name: "Villa Olivar", cat: "stay", area: "Hillside", rating: 4.8, reviews: 97, price: 4, nightly: 240, best: "Year-round", x: 560, y: 412 },
    { id: "p7", name: "Brasa & Brine", cat: "eat", area: "Old Harbour", rating: 4.4, reviews: 521, price: 2, nightly: 0, best: "Lunch", x: 398, y: 588 },
    { id: "p8", name: "Lighthouse Point", cat: "sight", area: "North Cape", rating: 4.7, reviews: 264, price: 2, nightly: 0, best: "Sunset", x: 858, y: 240 },
    { id: "p9", name: "Cala Secreta", cat: "beach", area: "North Cape", rating: 4.9, reviews: 145, price: 1, nightly: 0, best: "Low tide", x: 770, y: 318 },
    { id: "p10", name: "Aloja Pinar", cat: "stay", area: "Pine Ridge", rating: 4.3, reviews: 58, price: 2, nightly: 92, best: "Spring", x: 648, y: 296 },
    { id: "p11", name: "Cresta Trail", cat: "trail", area: "Hillside", rating: 4.6, reviews: 41, price: 1, nightly: 0, best: "Sunrise", x: 506, y: 360 },
    { id: "p12", name: "Café Onda", cat: "eat", area: "South Shore", rating: 4.5, reviews: 312, price: 1, nightly: 0, best: "Breakfast", x: 460, y: 432 },
  ];

  /* ----------------------------------------------------------------
   * State
   * ---------------------------------------------------------------- */
  var state = {
    category: "all",
    maxPrice: 4,
    query: "",
    savedOnly: false,
    active: null,
    saved: {},
    zoom: 1,
    panX: 0,
    panY: 0,
  };

  var SVG_NS = "http://www.w3.org/2000/svg";

  /* ----------------------------------------------------------------
   * DOM refs
   * ---------------------------------------------------------------- */
  var cardsEl = document.getElementById("cards");
  var pinsEl = document.getElementById("pins");
  var mapCanvas = document.getElementById("mapCanvas");
  var resultCount = document.getElementById("resultCount");
  var emptyState = document.getElementById("emptyState");
  var mapPop = document.getElementById("mapPop");
  var split = document.querySelector(".split");
  var listPane = document.getElementById("poi-list");
  var savedCountEl = document.getElementById("savedCount");

  var cardById = {};
  var pinById = {};

  /* ----------------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-shown");
    }, 2000);
  }

  function priceTier(n) {
    var on = "$".repeat(n);
    var off = "$".repeat(4 - n);
    return "<strong>" + on + "</strong><em>" + off + "</em>";
  }

  function stars(r) {
    var full = Math.round(r);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  function matches(p) {
    if (state.category !== "all" && p.cat !== state.category) return false;
    if (p.price > state.maxPrice) return false;
    if (state.savedOnly && !state.saved[p.id]) return false;
    if (state.query) {
      var q = state.query.toLowerCase();
      if (
        p.name.toLowerCase().indexOf(q) === -1 &&
        p.area.toLowerCase().indexOf(q) === -1 &&
        CAT_LABEL[p.cat].toLowerCase().indexOf(q) === -1
      )
        return false;
    }
    return true;
  }

  /* ----------------------------------------------------------------
   * Render: list cards
   * ---------------------------------------------------------------- */
  function buildCards() {
    cardsEl.innerHTML = "";
    cardById = {};
    PLACES.forEach(function (p, i) {
      var li = document.createElement("li");
      li.className = "card";
      li.dataset.id = p.id;
      li.setAttribute("tabindex", "0");
      li.setAttribute("role", "button");
      li.setAttribute(
        "aria-label",
        p.name + ", " + p.area + ", rated " + p.rating + " of 5"
      );

      var priceLine =
        p.nightly > 0
          ? '<span class="card__price">$' + p.nightly + " <span>/ night</span></span>"
          : '<span class="card__price">Free <span>entry</span></span>';

      li.innerHTML =
        '<div class="card__media" style="background:' + GRADIENTS[p.cat] + '">' +
        '<span class="card__num">' + (i + 1) + "</span>" +
        '<span class="card__cat">' + CAT_LABEL[p.cat] + "</span>" +
        '<button class="heart" type="button" aria-label="Save ' + p.name + '" aria-pressed="false">♥</button>' +
        "</div>" +
        '<div class="card__body">' +
        '<div class="card__top">' +
        "<div>" +
        '<div class="card__title">' + p.name + "</div>" +
        '<div class="card__area">' + p.area + "</div>" +
        "</div>" +
        priceLine +
        "</div>" +
        '<div class="card__meta">' +
        '<span class="rating">' + p.rating.toFixed(1) + " <span>★ (" + p.reviews + ")</span></span>" +
        '<span class="price-tier">' + priceTier(p.price) + "</span>" +
        "</div>" +
        '<span class="best-badge">🕑 Best: ' + p.best + "</span>" +
        "</div>";

      cardsEl.appendChild(li);
      cardById[p.id] = li;

      var heart = li.querySelector(".heart");

      function activate() {
        setActive(p.id, true);
      }
      li.addEventListener("click", activate);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
      li.addEventListener("mouseenter", function () {
        hoverPin(p.id, true);
      });
      li.addEventListener("mouseleave", function () {
        if (state.active !== p.id) hoverPin(p.id, false);
      });

      heart.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleSave(p.id);
      });
    });
  }

  /* ----------------------------------------------------------------
   * Render: SVG pins
   * ---------------------------------------------------------------- */
  function buildPins() {
    pinsEl.innerHTML = "";
    pinById = {};
    PLACES.forEach(function (p, i) {
      var g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "pin");
      g.setAttribute("transform", "translate(" + p.x + "," + p.y + ")");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", p.name + ", pin " + (i + 1));

      // teardrop shape, anchored at the bottom tip (0,0)
      var path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("class", "pin__shape");
      path.setAttribute(
        "d",
        "M0 0 C -14 -22 -18 -30 -18 -38 A 18 18 0 1 1 18 -38 C 18 -30 14 -22 0 0 Z"
      );

      var txt = document.createElementNS(SVG_NS, "text");
      txt.setAttribute("class", "pin__num");
      txt.setAttribute("x", "0");
      txt.setAttribute("y", "-32");
      txt.textContent = String(i + 1);

      g.appendChild(path);
      g.appendChild(txt);
      pinsEl.appendChild(g);
      pinById[p.id] = g;

      g.addEventListener("click", function () {
        setActive(p.id, false);
      });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setActive(p.id, false);
        }
      });
      g.addEventListener("mouseenter", function () {
        hoverPin(p.id, true);
        showPop(p);
      });
      g.addEventListener("mouseleave", function () {
        if (state.active !== p.id) {
          hoverPin(p.id, false);
          hidePop();
        }
      });
      g.addEventListener("focus", function () {
        showPop(p);
      });
      g.addEventListener("blur", hidePop);
    });
  }

  /* ----------------------------------------------------------------
   * Map popover (anchored to pin in screen space)
   * ---------------------------------------------------------------- */
  function showPop(p) {
    var pin = pinById[p.id];
    if (!pin) return;
    var pinRect = pin.getBoundingClientRect();
    var mapRect = document.getElementById("map").getBoundingClientRect();
    mapPop.innerHTML =
      '<div class="pop__media" style="background:' + GRADIENTS[p.cat] + '"></div>' +
      '<div class="pop__body">' +
      '<div class="pop__title">' + p.name + "</div>" +
      '<div class="pop__meta"><span>' + p.area + "</span><strong>" +
      (p.nightly > 0 ? "$" + p.nightly : "Free") + "</strong></div>" +
      "</div>";
    mapPop.hidden = false;
    var x = pinRect.left + pinRect.width / 2 - mapRect.left;
    var y = pinRect.top - mapRect.top;
    mapPop.style.left = x + "px";
    mapPop.style.top = y + "px";
  }
  function hidePop() {
    mapPop.hidden = true;
  }

  /* ----------------------------------------------------------------
   * Hover sync (no fly, no scroll)
   * ---------------------------------------------------------------- */
  function hoverPin(id, on) {
    var pin = pinById[id];
    if (!pin) return;
    // never toggle the highlight off the currently selected pin
    if (state.active === id) return;
    pin.classList.toggle("is-active", on);
  }

  /* ----------------------------------------------------------------
   * Select / activate a place — syncs both panes + flies the map.
   * scrollList=true when activation came from the map (scroll the card
   * into view); when it came from a card we don't auto-scroll the list.
   * ---------------------------------------------------------------- */
  function setActive(id, fromCard) {
    if (state.active && cardById[state.active])
      cardById[state.active].classList.remove("is-active");
    if (state.active && pinById[state.active])
      pinById[state.active].classList.remove("is-active");

    state.active = id;
    var p = byId(id);

    var card = cardById[id];
    var pin = pinById[id];
    if (card) card.classList.add("is-active");
    if (pin) pin.classList.add("is-active");

    flyTo(p);
    showPop(p);

    if (!fromCard && card) {
      // came from the map -> bring the card into view in the list
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function byId(id) {
    for (var i = 0; i < PLACES.length; i++) if (PLACES[i].id === id) return PLACES[i];
    return null;
  }

  /* ----------------------------------------------------------------
   * "Fly" the map: pan + zoom so the place sits centred.
   * Implemented with a CSS transform on the SVG canvas.
   * ---------------------------------------------------------------- */
  function flyTo(p) {
    state.zoom = 1.9;
    centreOn(p.x, p.y);
  }

  function centreOn(vx, vy) {
    // SVG uses preserveAspectRatio="slice": derive the effective scale
    var rect = mapCanvas.getBoundingClientRect();
    var scale = Math.max(rect.width / 1000, rect.height / 700);
    // place (vx,vy) in viewBox -> px within the *unscaled* canvas
    var px = vx * scale;
    var py = vy * scale;
    var z = state.zoom;
    state.panX = rect.width / 2 - px * z;
    state.panY = rect.height / 2 - py * z;
    applyTransform();
  }

  function applyTransform() {
    mapCanvas.style.transform =
      "translate(" + state.panX + "px," + state.panY + "px) scale(" + state.zoom + ")";
  }

  function resetView() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    applyTransform();
  }

  /* ----------------------------------------------------------------
   * Filtering -> show/hide cards + pins
   * ---------------------------------------------------------------- */
  function applyFilters() {
    var visible = 0;
    PLACES.forEach(function (p) {
      var ok = matches(p);
      if (ok) visible++;
      var card = cardById[p.id];
      var pin = pinById[p.id];
      if (card) card.style.display = ok ? "" : "none";
      if (pin) pin.style.display = ok ? "" : "none";
    });

    emptyState.hidden = visible !== 0;
    var word = visible === 1 ? "place" : "places";
    resultCount.textContent = state.savedOnly
      ? visible + " saved " + word
      : visible + " " + word + " on the map";

    // if active place got filtered out, clear selection
    if (state.active && !matches(byId(state.active))) {
      var prev = state.active;
      state.active = null;
      if (cardById[prev]) cardById[prev].classList.remove("is-active");
      if (pinById[prev]) pinById[prev].classList.remove("is-active");
      hidePop();
      resetView();
    }
  }

  /* ----------------------------------------------------------------
   * Saving
   * ---------------------------------------------------------------- */
  function toggleSave(id) {
    state.saved[id] = !state.saved[id];
    var card = cardById[id];
    var heart = card.querySelector(".heart");
    heart.classList.toggle("is-saved", state.saved[id]);
    heart.setAttribute("aria-pressed", state.saved[id] ? "true" : "false");
    var n = Object.keys(state.saved).filter(function (k) {
      return state.saved[k];
    }).length;
    savedCountEl.textContent = n;
    toast(state.saved[id] ? "Saved " + byId(id).name + " to your trip" : "Removed from your trip");
    if (state.savedOnly) applyFilters();
  }

  /* ----------------------------------------------------------------
   * Controls wiring
   * ---------------------------------------------------------------- */
  function wireFilters() {
    // category chips
    document.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll(".chip").forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        state.category = chip.dataset.filter;
        applyFilters();
      });
    });

    // price slider
    var price = document.getElementById("price");
    var priceOut = document.getElementById("priceOut");
    price.addEventListener("input", function () {
      state.maxPrice = +price.value;
      priceOut.textContent = "$".repeat(state.maxPrice);
      applyFilters();
    });

    // search
    var search = document.getElementById("search");
    search.addEventListener("input", function () {
      state.query = search.value.trim();
      applyFilters();
    });

    // saved toggle
    var savedToggle = document.getElementById("savedToggle");
    savedToggle.addEventListener("click", function () {
      state.savedOnly = !state.savedOnly;
      savedToggle.classList.toggle("is-active", state.savedOnly);
      savedToggle.setAttribute("aria-pressed", state.savedOnly ? "true" : "false");
      applyFilters();
    });
  }

  function wireMapControls() {
    document.getElementById("zoomIn").addEventListener("click", function () {
      state.zoom = Math.min(3, state.zoom + 0.4);
      if (state.active) centreOn(byId(state.active).x, byId(state.active).y);
      else applyTransform();
    });
    document.getElementById("zoomOut").addEventListener("click", function () {
      state.zoom = Math.max(1, state.zoom - 0.4);
      if (state.zoom === 1) resetView();
      else if (state.active) centreOn(byId(state.active).x, byId(state.active).y);
      else applyTransform();
    });
    document.getElementById("zoomReset").addEventListener("click", function () {
      resetView();
      hidePop();
      toast("Map reset");
    });
  }

  function wireViewToggle() {
    var toggle = document.getElementById("viewToggle");
    toggle.addEventListener("click", function () {
      var next = split.dataset.view === "list" ? "map" : "list";
      split.dataset.view = next;
      toggle.setAttribute("aria-pressed", next === "map" ? "true" : "false");
      if (next === "map") {
        // recompute centring now the map has real dimensions
        if (state.active) centreOn(byId(state.active).x, byId(state.active).y);
        if (state.active) showPop(byId(state.active));
      }
    });
  }

  // keep popover anchored when the list scrolls or window resizes
  function refreshPop() {
    if (state.active && !mapPop.hidden) showPop(byId(state.active));
  }
  listPane.addEventListener("scroll", function () {
    if (state.active) refreshPop();
  });
  window.addEventListener("resize", function () {
    if (state.active) {
      centreOn(byId(state.active).x, byId(state.active).y);
      refreshPop();
    }
  });

  /* ----------------------------------------------------------------
   * Init
   * ---------------------------------------------------------------- */
  buildCards();
  buildPins();
  wireFilters();
  wireMapControls();
  wireViewToggle();
  applyFilters();
})();
