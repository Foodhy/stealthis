(function () {
  "use strict";

  /* ---------- Data: fictional Maple Grove, OR listings ---------- */
  var LISTINGS = [
    { id: "L1", price: 689000, beds: 3, baths: 2, sqft: 1840, type: "House", status: "New",
      addr: "412 Larkspur Lane", agent: "Nora Avery", img: 0, featured: 9, days: 2, x: 22, y: 55 },
    { id: "L2", price: 1245000, beds: 4, baths: 3, sqft: 2960, type: "House", status: "For sale",
      addr: "8 Wren Hollow Court", agent: "Desmond Hale", img: 1, featured: 7, days: 11, x: 64, y: 28 },
    { id: "L3", price: 472500, beds: 2, baths: 2, sqft: 1180, type: "Condo", status: "Open house",
      addr: "210 Cedar Mill Rd, #4B", agent: "Priya Mehta", img: 3, featured: 6, days: 5, x: 41, y: 70 },
    { id: "L4", price: 815000, beds: 3, baths: 2, sqft: 2110, type: "Townhouse", status: "For sale",
      addr: "57 Aspen Ridge Way", agent: "Marcus Boone", img: 2, featured: 5, days: 18, x: 78, y: 60 },
    { id: "L5", price: 1590000, beds: 5, baths: 3, sqft: 3680, type: "House", status: "New",
      addr: "1 Heron Bluff Estate", agent: "Eleanor Frost", img: 5, featured: 10, days: 1, x: 30, y: 22 },
    { id: "L6", price: 539000, beds: 2, baths: 1, sqft: 980, type: "Loft", status: "For sale",
      addr: "94 Foundry St, Loft 3", agent: "Theo Salas", img: 4, featured: 4, days: 24, x: 53, y: 44 },
    { id: "L7", price: 725000, beds: 3, baths: 2, sqft: 1720, type: "House", status: "Pending",
      addr: "330 Willowmere Drive", agent: "Nora Avery", img: 1, featured: 3, days: 32, x: 15, y: 38 },
    { id: "L8", price: 968000, beds: 4, baths: 3, sqft: 2540, type: "House", status: "Open house",
      addr: "6 Briarwood Crescent", agent: "Desmond Hale", img: 0, featured: 8, days: 4, x: 70, y: 80 },
    { id: "L9", price: 419000, beds: 1, baths: 1, sqft: 760, type: "Condo", status: "For sale",
      addr: "188 Maple Square, #12", agent: "Priya Mehta", img: 3, featured: 2, days: 40, x: 47, y: 18 }
  ];

  var STATUS_CLASS = { "New": "badge--new", "Open house": "badge--open", "Pending": "badge--pending", "For sale": "" };

  /* ---------- DOM ---------- */
  var grid = document.getElementById("grid");
  var pinsWrap = document.getElementById("pins");
  var emptyEl = document.getElementById("empty");
  var countNum = document.getElementById("countNum");
  var toastEl = document.getElementById("toast");

  var fPrice = document.getElementById("fPrice");
  var fBeds = document.getElementById("fBeds");
  var fBaths = document.getElementById("fBaths");
  var fType = document.getElementById("fType");
  var fSqft = document.getElementById("fSqft");
  var sortSel = document.getElementById("sortSel");
  var statusBoxes = Array.prototype.slice.call(document.querySelectorAll('input[name="status"]'));

  var activeId = null;
  var favs = {};

  /* ---------- Helpers ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2600);
  }

  function money(n) {
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 2).replace(/\.?0+$/, "") + "M";
    return "$" + n.toLocaleString("en-US");
  }
  function fullMoney(n) { return "$" + n.toLocaleString("en-US"); }

  /* ---------- Filtering + sorting ---------- */
  function getFiltered() {
    var priceRange = fPrice.value;
    var minBeds = parseInt(fBeds.value, 10);
    var minBaths = parseInt(fBaths.value, 10);
    var type = fType.value;
    var minSqft = parseInt(fSqft.value, 10);
    var allowedStatus = statusBoxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });

    var lo = 0, hi = Infinity;
    if (priceRange !== "any") { var p = priceRange.split("-"); lo = +p[0]; hi = +p[1]; }

    var out = LISTINGS.filter(function (l) {
      if (l.price < lo || l.price > hi) return false;
      if (l.beds < minBeds) return false;
      if (l.baths < minBaths) return false;
      if (type !== "any" && l.type !== type) return false;
      if (l.sqft < minSqft) return false;
      if (allowedStatus.indexOf(l.status) === -1) return false;
      return true;
    });

    var s = sortSel.value;
    out.sort(function (a, b) {
      switch (s) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "beds-desc": return b.beds - a.beds || b.price - a.price;
        case "sqft-desc": return b.sqft - a.sqft;
        case "newest": return a.days - b.days;
        default: return b.featured - a.featured;
      }
    });
    return out;
  }

  /* ---------- Rendering ---------- */
  function render() {
    var items = getFiltered();
    countNum.textContent = items.length;
    grid.innerHTML = "";
    pinsWrap.innerHTML = "";

    if (!items.length) {
      emptyEl.hidden = false;
      grid.hidden = true;
      return;
    }
    emptyEl.hidden = true;
    grid.hidden = false;

    items.forEach(function (l) {
      grid.appendChild(buildCard(l));
      pinsWrap.appendChild(buildPin(l));
    });

    if (activeId && !items.some(function (l) { return l.id === activeId; })) activeId = null;
    syncActive();
  }

  function buildCard(l) {
    var card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.dataset.id = l.id;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", money(l.price) + ", " + l.beds + " bed " + l.type + " at " + l.addr);

    var badgeClass = STATUS_CLASS[l.status] || "";
    var isFav = !!favs[l.id];

    card.innerHTML =
      '<div class="card__photo" data-img="' + l.img + '">' +
        '<span class="badge ' + badgeClass + '">' + l.status + '</span>' +
        '<button class="fav' + (isFav ? ' is-fav' : '') + '" type="button" aria-pressed="' + isFav + '" aria-label="Save listing">' +
          '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="card__body">' +
        '<div class="card__price">' + fullMoney(l.price) + '</div>' +
        '<div class="card__specs">' +
          '<span><b>' + l.beds + '</b>&nbsp;bd</span>' +
          '<span><b>' + l.baths + '</b>&nbsp;ba</span>' +
          '<span><b>' + l.sqft.toLocaleString("en-US") + '</b>&nbsp;sqft</span>' +
        '</div>' +
        '<div class="card__addr">' + l.addr + ', Maple Grove, OR</div>' +
        '<div class="card__meta">' +
          '<span class="card__type">' + l.type + '</span>' +
          '<span class="card__agent">Listed by ' + l.agent + '</span>' +
        '</div>' +
      '</div>';

    var fav = card.querySelector(".fav");
    fav.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleFav(l, fav);
    });

    card.addEventListener("click", function () { setActive(l.id, true); });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(l.id, true); }
    });
    card.addEventListener("mouseenter", function () { highlightPin(l.id, true); });
    card.addEventListener("mouseleave", function () { if (activeId !== l.id) highlightPin(l.id, false); });
    return card;
  }

  function buildPin(l) {
    var pin = document.createElement("button");
    pin.type = "button";
    pin.className = "pin";
    pin.dataset.id = l.id;
    pin.style.left = l.x + "%";
    pin.style.top = l.y + "%";
    pin.textContent = money(l.price);
    pin.setAttribute("aria-label", money(l.price) + " at " + l.addr);
    pin.addEventListener("click", function () { setActive(l.id, false); });
    pin.addEventListener("mouseenter", function () { highlightCard(l.id, true); });
    pin.addEventListener("mouseleave", function () { if (activeId !== l.id) highlightCard(l.id, false); });
    return pin;
  }

  /* ---------- Favorites ---------- */
  function toggleFav(l, btn) {
    favs[l.id] = !favs[l.id];
    btn.classList.toggle("is-fav", favs[l.id]);
    btn.setAttribute("aria-pressed", String(favs[l.id]));
    toast(favs[l.id] ? "Saved " + l.addr + " to favorites" : "Removed from favorites");
  }

  /* ---------- Active sync (cards <-> pins) ---------- */
  function setActive(id, fromCard) {
    activeId = (activeId === id) ? null : id;
    syncActive();
    if (activeId) {
      var sel = activeId;
      if (fromCard) {
        var pin = pinsWrap.querySelector('.pin[data-id="' + sel + '"]');
        if (pin) pin.focus({ preventScroll: true });
      } else {
        var card = grid.querySelector('.card[data-id="' + sel + '"]');
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  function syncActive() {
    Array.prototype.forEach.call(grid.querySelectorAll(".card"), function (c) {
      c.classList.toggle("is-active", c.dataset.id === activeId);
    });
    Array.prototype.forEach.call(pinsWrap.querySelectorAll(".pin"), function (p) {
      p.classList.toggle("is-active", p.dataset.id === activeId);
    });
  }

  function highlightCard(id, on) {
    var c = grid.querySelector('.card[data-id="' + id + '"]');
    if (c) c.classList.toggle("is-active", on || activeId === id);
  }
  function highlightPin(id, on) {
    var p = pinsWrap.querySelector('.pin[data-id="' + id + '"]');
    if (p) p.classList.toggle("is-active", on || activeId === id);
  }

  /* ---------- More filters toggle ---------- */
  var moreBtn = document.getElementById("moreFiltersBtn");
  var morePanel = document.getElementById("moreFilters");
  moreBtn.addEventListener("click", function () {
    var open = morePanel.hasAttribute("hidden");
    if (open) morePanel.removeAttribute("hidden"); else morePanel.setAttribute("hidden", "");
    moreBtn.setAttribute("aria-expanded", String(open));
  });

  /* ---------- Save search ---------- */
  var saveBtn = document.getElementById("saveSearchBtn");
  var searchSaved = false;
  saveBtn.addEventListener("click", function () {
    searchSaved = !searchSaved;
    saveBtn.classList.toggle("is-saved", searchSaved);
    saveBtn.lastChild.textContent = searchSaved ? " Search saved" : " Save search";
    var n = getFiltered().length;
    toast(searchSaved ? "Search saved — we'll alert you when new homes match (" + n + " now)" : "Saved search removed");
  });

  /* ---------- Reset ---------- */
  document.getElementById("resetBtn").addEventListener("click", function () {
    fPrice.value = "any"; fBeds.value = "0"; fBaths.value = "0";
    fType.value = "any"; fSqft.value = "0"; sortSel.value = "featured";
    statusBoxes.forEach(function (b) { b.checked = true; });
    activeId = null;
    render();
    toast("Filters reset");
  });

  /* ---------- Wire up live filtering ---------- */
  [fPrice, fBeds, fBaths, fType, fSqft, sortSel].forEach(function (el) {
    el.addEventListener("change", render);
  });
  statusBoxes.forEach(function (b) { b.addEventListener("change", render); });

  /* ---------- Init ---------- */
  render();
})();
