(function () {
  "use strict";

  /* ----------------------------------------------------------------
   * Data — fictional Adriatic & Alps catalogue of POIs.
   * x/y are normalized (0..1) map coordinates for the SVG route map.
   * ---------------------------------------------------------------- */
  var CATALOG = [
    { id: "old-town",   name: "Stari Grad Walls",   place: "Dubrovnik",   cat: "sight",  emoji: "🏰", color: "#e8623f", price: 38,  rating: 5, best: "Spring", x: 0.30, y: 0.78 },
    { id: "kayak",      name: "Sea-Cave Kayaking",  place: "Lokrum Bay",  cat: "nature", emoji: "🛶", color: "#1f8a8a", price: 55,  rating: 4, best: "Summer", x: 0.42, y: 0.70 },
    { id: "konoba",     name: "Konoba Mareta",      place: "Cavtat",      cat: "food",   emoji: "🍝", color: "#c98a2b", price: 44,  rating: 5, best: "Anytime", x: 0.36, y: 0.86 },
    { id: "split",      name: "Diocletian Palace",  place: "Split",       cat: "sight",  emoji: "🏛", color: "#e8623f", price: 22,  rating: 4, best: "Autumn", x: 0.24, y: 0.58 },
    { id: "plitvice",   name: "Plitvice Lakes",     place: "Lika",        cat: "nature", emoji: "💧", color: "#1f8a8a", price: 40,  rating: 5, best: "Spring", x: 0.18, y: 0.40 },
    { id: "truffle",    name: "Istrian Truffle Hunt", place: "Motovun",   cat: "food",   emoji: "🍄", color: "#c98a2b", price: 78,  rating: 5, best: "Autumn", x: 0.10, y: 0.30 },
    { id: "harbor-inn", name: "Harbor View Suite",  place: "Rovinj",      cat: "stay",   emoji: "🛏", color: "#6b6259", price: 165, rating: 4, best: "Summer", x: 0.08, y: 0.24 },
    { id: "ljub",       name: "Triple Bridge Walk", place: "Ljubljana",   cat: "sight",  emoji: "🌉", color: "#e8623f", price: 0,   rating: 4, best: "Anytime", x: 0.30, y: 0.18 },
    { id: "bled",       name: "Lake Bled Rowboat",  place: "Bled",        cat: "nature", emoji: "⛵", color: "#1f8a8a", price: 30,  rating: 5, best: "Summer", x: 0.40, y: 0.10 },
    { id: "vintgar",    name: "Vintgar Gorge",      place: "Gorje",       cat: "nature", emoji: "⛰", color: "#1f8a8a", price: 12,  rating: 4, best: "Spring", x: 0.52, y: 0.08 },
    { id: "chalet",     name: "Alpine Chalet Stay", place: "Kranjska Gora", cat: "stay", emoji: "🏔", color: "#6b6259", price: 210, rating: 5, best: "Winter", x: 0.62, y: 0.14 },
    { id: "potica",     name: "Potica Bakery Class", place: "Bled",       cat: "food",   emoji: "🥐", color: "#c98a2b", price: 35,  rating: 4, best: "Anytime", x: 0.46, y: 0.16 },
    { id: "soca",       name: "Soča River Raft",    place: "Bovec",       cat: "nature", emoji: "🚣", color: "#1f8a8a", price: 62,  rating: 5, best: "Summer", x: 0.70, y: 0.22 },
    { id: "postojna",   name: "Postojna Cave",      place: "Postojna",    cat: "sight",  emoji: "🦇", color: "#e8623f", price: 31,  rating: 4, best: "Anytime", x: 0.24, y: 0.30 },
    { id: "gelato",     name: "Piazza Gelateria",   place: "Piran",       cat: "food",   emoji: "🍦", color: "#c98a2b", price: 9,   rating: 5, best: "Summer", x: 0.18, y: 0.52 },
    { id: "salt",       name: "Sečovlje Salt Pans", place: "Piran",       cat: "nature", emoji: "🧂", color: "#1f8a8a", price: 14,  rating: 3, best: "Autumn", x: 0.14, y: 0.46 }
  ];

  var CAT_LABEL = { sight: "Sight", nature: "Nature", food: "Food", stay: "Stay" };
  var STORAGE_KEY = "wanderatlas.trip.v1";

  /* ----------------------------------------------------------------
   * State
   * ---------------------------------------------------------------- */
  var state = {
    title: "Coast to Summit Escape",
    // days: array of arrays of POI ids (in order)
    days: [[], [], []]
  };

  var byId = {};
  CATALOG.forEach(function (p) { byId[p.id] = p; });

  /* ----------------------------------------------------------------
   * Element refs
   * ---------------------------------------------------------------- */
  var els = {
    search: document.getElementById("searchInput"),
    filters: document.querySelectorAll(".chip"),
    poiList: document.getElementById("poiList"),
    poiEmpty: document.getElementById("poiEmpty"),
    days: document.getElementById("days"),
    addDay: document.getElementById("addDayBtn"),
    saveBtn: document.getElementById("saveBtn"),
    clearBtn: document.getElementById("clearBtn"),
    title: document.getElementById("tripTitle"),
    statDays: document.getElementById("statDays"),
    statStops: document.getElementById("statStops"),
    statBudget: document.getElementById("statBudget"),
    statPerDay: document.getElementById("statPerDay"),
    pinLayer: document.getElementById("pinLayer"),
    routeLayer: document.getElementById("routeLayer"),
    mapEmpty: document.getElementById("mapEmpty"),
    budgetList: document.getElementById("budgetList"),
    budgetTotal: document.getElementById("budgetTotal"),
    toast: document.getElementById("toast")
  };

  var SVGNS = "http://www.w3.org/2000/svg";
  var activeFilter = "all";

  /* ----------------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------------- */
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function freeOr(n) { return n === 0 ? "Free" : money(n); }

  var toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove("show"); }, 2200);
  }

  function addedIds() {
    var s = {};
    state.days.forEach(function (d) { d.forEach(function (id) { s[id] = true; }); });
    return s;
  }

  function stars(n) {
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }

  /* ----------------------------------------------------------------
   * Render: POI explore list
   * ---------------------------------------------------------------- */
  function renderPois() {
    var q = els.search.value.trim().toLowerCase();
    var added = addedIds();
    els.poiList.innerHTML = "";
    var shown = 0;

    CATALOG.forEach(function (p) {
      if (activeFilter !== "all" && p.cat !== activeFilter) return;
      if (q && (p.name + " " + p.place + " " + p.cat).toLowerCase().indexOf(q) === -1) return;
      shown++;

      var li = document.createElement("li");
      li.className = "poi" + (added[p.id] ? " is-added" : "");

      var thumb = document.createElement("div");
      thumb.className = "poi__thumb";
      thumb.style.background = "linear-gradient(135deg," + p.color + "," + shade(p.color) + ")";
      thumb.textContent = p.emoji;

      var body = document.createElement("div");
      body.className = "poi__body";
      var name = document.createElement("p");
      name.className = "poi__name";
      name.textContent = p.name;
      var meta = document.createElement("p");
      meta.className = "poi__meta";
      meta.innerHTML =
        "<span>" + escapeHtml(p.place) + "</span>" +
        '<span class="rating" aria-label="' + p.rating + ' out of 5">' + stars(p.rating) + "</span>" +
        '<span class="poi__price">' + freeOr(p.price) + "</span>" +
        '<span class="poi__best">' + escapeHtml(p.best) + "</span>";
      body.appendChild(name);
      body.appendChild(meta);

      var add = document.createElement("button");
      add.className = "poi__add";
      add.type = "button";
      add.setAttribute("aria-label",
        (added[p.id] ? "Already in trip: " : "Add to trip: ") + p.name);
      add.textContent = added[p.id] ? "✓" : "+";
      if (!added[p.id]) {
        add.addEventListener("click", function () { addStop(p.id); });
      } else {
        add.disabled = true;
      }

      li.appendChild(thumb);
      li.appendChild(body);
      li.appendChild(add);
      els.poiList.appendChild(li);
    });

    els.poiEmpty.hidden = shown !== 0;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // darken a hex color for gradients
  function shade(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, (n >> 16) - 38);
    var g = Math.max(0, ((n >> 8) & 255) - 38);
    var b = Math.max(0, (n & 255) - 38);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  /* ----------------------------------------------------------------
   * Render: itinerary days + drag/drop
   * ---------------------------------------------------------------- */
  function renderDays() {
    els.days.innerHTML = "";

    state.days.forEach(function (dayStops, di) {
      var dayCost = dayStops.reduce(function (sum, id) { return sum + byId[id].price; }, 0);

      var day = document.createElement("div");
      day.className = "day";
      day.dataset.day = di;

      var head = document.createElement("div");
      head.className = "day__head";
      head.innerHTML =
        '<span class="day__num">' + (di + 1) + "</span>" +
        '<span class="day__title">Day ' + (di + 1) + "</span>" +
        '<span class="day__cost">' + freeOr(dayCost) + "</span>";

      var rm = document.createElement("button");
      rm.className = "day__remove";
      rm.type = "button";
      rm.innerHTML = "✕";
      rm.title = "Remove day";
      rm.setAttribute("aria-label", "Remove day " + (di + 1));
      rm.addEventListener("click", function () { removeDay(di); });
      head.appendChild(rm);

      var list = document.createElement("ul");
      list.className = "day__list";
      list.dataset.day = di;

      if (dayStops.length === 0) {
        var empty = document.createElement("li");
        empty.className = "day__empty";
        empty.textContent = "Drag spots here, or add from the left.";
        list.appendChild(empty);
      } else {
        dayStops.forEach(function (id, si) {
          list.appendChild(buildStop(id, di, si));
        });
      }

      // drop-target wiring on the list
      wireDrop(list, day, di);

      day.appendChild(head);
      day.appendChild(list);
      els.days.appendChild(day);
    });
  }

  function buildStop(id, di, si) {
    var p = byId[id];
    var li = document.createElement("li");
    li.className = "stop";
    li.draggable = true;
    li.dataset.id = id;
    li.dataset.day = di;
    li.dataset.idx = si;

    li.innerHTML =
      '<span class="stop__grip" aria-hidden="true">⠿</span>' +
      '<span class="stop__pin" style="background:linear-gradient(135deg,' + p.color + "," + shade(p.color) + ')">' + p.emoji + "</span>" +
      '<span class="stop__name">' + escapeHtml(p.name) +
        '<br><span class="stop__sub">' + escapeHtml(p.place) + " · " + CAT_LABEL[p.cat] + "</span></span>" +
      '<span class="stop__cost">' + freeOr(p.price) + "</span>";

    var del = document.createElement("button");
    del.className = "stop__del";
    del.type = "button";
    del.innerHTML = "✕";
    del.setAttribute("aria-label", "Remove " + p.name + " from trip");
    del.addEventListener("click", function (e) {
      e.stopPropagation();
      removeStop(di, id);
    });
    li.appendChild(del);

    li.addEventListener("dragstart", function (e) {
      drag = { id: id, fromDay: di };
      li.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", id); } catch (err) {}
    });
    li.addEventListener("dragend", function () {
      li.classList.remove("dragging");
      drag = null;
      clearDropHints();
    });

    return li;
  }

  var drag = null;

  function wireDrop(list, dayEl, di) {
    list.addEventListener("dragover", function (e) {
      if (!drag) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      dayEl.classList.add("is-drop");
    });
    list.addEventListener("dragleave", function (e) {
      if (!list.contains(e.relatedTarget)) dayEl.classList.remove("is-drop");
    });
    list.addEventListener("drop", function (e) {
      if (!drag) return;
      e.preventDefault();
      dayEl.classList.remove("is-drop");

      // find insertion index based on pointer position
      var after = getDropIndex(list, e.clientY);
      moveStop(drag.id, drag.fromDay, di, after);
    });
  }

  function getDropIndex(list, y) {
    var stops = Array.prototype.slice.call(list.querySelectorAll(".stop:not(.dragging)"));
    for (var i = 0; i < stops.length; i++) {
      var box = stops[i].getBoundingClientRect();
      if (y < box.top + box.height / 2) return i;
    }
    return stops.length;
  }

  function clearDropHints() {
    var ds = els.days.querySelectorAll(".day.is-drop");
    Array.prototype.forEach.call(ds, function (d) { d.classList.remove("is-drop"); });
  }

  /* ----------------------------------------------------------------
   * Mutations
   * ---------------------------------------------------------------- */
  function addStop(id) {
    if (addedIds()[id]) return;
    // add to the day with the fewest stops (keeps things balanced)
    var target = 0, min = Infinity;
    state.days.forEach(function (d, i) {
      if (d.length < min) { min = d.length; target = i; }
    });
    state.days[target].push(id);
    toast(byId[id].name + " → Day " + (target + 1));
    update();
  }

  function removeStop(di, id) {
    var idx = state.days[di].indexOf(id);
    if (idx > -1) state.days[di].splice(idx, 1);
    update();
  }

  function moveStop(id, fromDay, toDay, insertIdx) {
    var from = state.days[fromDay];
    var fi = from.indexOf(id);
    if (fi === -1) return;
    from.splice(fi, 1);

    var dest = state.days[toDay];
    // if moving within same day and removing earlier item shifts indices
    if (fromDay === toDay && fi < insertIdx) insertIdx--;
    if (insertIdx < 0) insertIdx = 0;
    if (insertIdx > dest.length) insertIdx = dest.length;
    dest.splice(insertIdx, 0, id);
    update();
  }

  function addDay() {
    state.days.push([]);
    toast("Day " + state.days.length + " added");
    update();
  }

  function removeDay(di) {
    if (state.days.length <= 1) { toast("Keep at least one day"); return; }
    state.days.splice(di, 1);
    update();
  }

  /* ----------------------------------------------------------------
   * Render: route map (SVG pins + connecting route)
   * ---------------------------------------------------------------- */
  function renderMap() {
    els.pinLayer.innerHTML = "";
    els.routeLayer.innerHTML = "";

    // flatten in day → order sequence
    var seq = [];
    state.days.forEach(function (d) { d.forEach(function (id) { seq.push(id); }); });

    if (seq.length === 0) {
      els.mapEmpty.style.display = "grid";
      return;
    }
    els.mapEmpty.style.display = "none";

    var W = 320, H = 360, PAD = 28;
    var pts = seq.map(function (id) {
      var p = byId[id];
      return { p: p, x: PAD + p.x * (W - PAD * 2), y: PAD + p.y * (H - PAD * 2) };
    });

    // route polyline
    if (pts.length > 1) {
      var d = "M " + pts.map(function (pt) { return pt.x.toFixed(1) + " " + pt.y.toFixed(1); }).join(" L ");
      var path = document.createElementNS(SVGNS, "path");
      path.setAttribute("d", d);
      els.routeLayer.appendChild(path);
    }

    // pins (numbered)
    pts.forEach(function (pt, i) {
      var g = document.createElementNS(SVGNS, "g");

      var teardrop = document.createElementNS(SVGNS, "path");
      teardrop.setAttribute("d",
        "M " + pt.x + " " + (pt.y + 11) +
        " C " + (pt.x - 9) + " " + (pt.y - 2) + " " + (pt.x - 9) + " " + (pt.y - 14) + " " + pt.x + " " + (pt.y - 14) +
        " C " + (pt.x + 9) + " " + (pt.y - 14) + " " + (pt.x + 9) + " " + (pt.y - 2) + " " + pt.x + " " + (pt.y + 11) + " Z");
      teardrop.setAttribute("fill", pt.p.color);
      teardrop.setAttribute("stroke", "#fff");
      teardrop.setAttribute("stroke-width", "1.4");

      var num = document.createElementNS(SVGNS, "text");
      num.setAttribute("class", "map__pin-num");
      num.setAttribute("x", pt.x);
      num.setAttribute("y", pt.y - 4.5);
      num.setAttribute("text-anchor", "middle");
      num.textContent = i + 1;

      var label = document.createElementNS(SVGNS, "text");
      label.setAttribute("class", "map__pin-label");
      label.setAttribute("x", pt.x);
      label.setAttribute("y", pt.y + 22);
      label.setAttribute("text-anchor", "middle");
      label.textContent = pt.p.place;

      var t = document.createElementNS(SVGNS, "title");
      t.textContent = (i + 1) + ". " + pt.p.name + " (" + pt.p.place + ")";
      g.appendChild(t);

      g.appendChild(teardrop);
      g.appendChild(num);
      g.appendChild(label);
      els.pinLayer.appendChild(g);
    });
  }

  /* ----------------------------------------------------------------
   * Render: stats + budget breakdown
   * ---------------------------------------------------------------- */
  function renderStats() {
    var added = addedIds();
    var ids = Object.keys(added);
    var total = ids.reduce(function (s, id) { return s + byId[id].price; }, 0);
    var nDays = state.days.length;

    els.statDays.textContent = nDays;
    els.statStops.textContent = ids.length;
    els.statBudget.textContent = money(total);
    els.statPerDay.textContent = money(nDays ? total / nDays : 0);

    // budget by category
    var cats = { sight: 0, nature: 0, food: 0, stay: 0 };
    ids.forEach(function (id) { cats[byId[id].cat] += byId[id].price; });

    var catMeta = {
      sight: { label: "Sights", color: "#e8623f" },
      nature: { label: "Nature", color: "#1f8a8a" },
      food: { label: "Food", color: "#c98a2b" },
      stay: { label: "Stays", color: "#6b6259" }
    };

    els.budgetList.innerHTML = "";
    if (total === 0) {
      var li = document.createElement("li");
      li.className = "budget__empty";
      li.textContent = "No costs yet — add a spot to start your budget.";
      els.budgetList.appendChild(li);
    } else {
      Object.keys(catMeta).forEach(function (cat) {
        var val = cats[cat];
        if (val === 0) return;
        var pct = Math.round((val / total) * 100);
        var row = document.createElement("li");
        row.className = "budget__row";
        row.innerHTML =
          '<span class="budget__cat">' + catMeta[cat].label + "</span>" +
          '<span class="budget__bar"><span class="budget__fill" style="width:' + pct + "%;background:" + catMeta[cat].color + '"></span></span>' +
          '<span class="budget__val">' + money(val) + "</span>";
        els.budgetList.appendChild(row);
      });
    }
    els.budgetTotal.textContent = money(total);
  }

  /* ----------------------------------------------------------------
   * Persistence
   * ---------------------------------------------------------------- */
  function save(announce) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ title: state.title, days: state.days }));
      if (announce) toast("Trip saved to this browser ✓");
    } catch (e) {
      if (announce) toast("Couldn't save (storage blocked)");
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (data && Array.isArray(data.days)) {
        // sanitize ids against current catalog
        state.days = data.days.map(function (d) {
          return (Array.isArray(d) ? d : []).filter(function (id) { return byId[id]; });
        });
        if (state.days.length === 0) state.days = [[]];
        if (typeof data.title === "string" && data.title.trim()) {
          state.title = data.title.trim();
          els.title.textContent = state.title;
        }
      }
    } catch (e) { /* ignore corrupt state */ }
  }

  function clearTrip() {
    if (Object.keys(addedIds()).length === 0) { toast("Trip is already empty"); return; }
    state.days = [[], [], []];
    update();
    toast("Trip cleared");
  }

  /* ----------------------------------------------------------------
   * Master update — re-render everything + autosave
   * ---------------------------------------------------------------- */
  function update() {
    renderPois();
    renderDays();
    renderMap();
    renderStats();
    save(false);
  }

  /* ----------------------------------------------------------------
   * Events
   * ---------------------------------------------------------------- */
  els.search.addEventListener("input", renderPois);

  Array.prototype.forEach.call(els.filters, function (chip) {
    chip.addEventListener("click", function () {
      Array.prototype.forEach.call(els.filters, function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      activeFilter = chip.dataset.cat;
      renderPois();
    });
  });

  els.addDay.addEventListener("click", addDay);
  els.saveBtn.addEventListener("click", function () { save(true); });
  els.clearBtn.addEventListener("click", clearTrip);

  els.title.addEventListener("blur", function () {
    var t = els.title.textContent.replace(/\s+/g, " ").trim();
    if (!t) { t = "Untitled Trip"; els.title.textContent = t; }
    state.title = t;
    save(false);
  });
  els.title.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); els.title.blur(); }
  });

  /* ----------------------------------------------------------------
   * Boot
   * ---------------------------------------------------------------- */
  load();
  update();
})();
