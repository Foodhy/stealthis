(function () {
  "use strict";

  /* ---------------------------------------------------------------
   * Fictional 5-day Amalfi Coast itinerary.
   * Each stop carries a map point {x,y} in a 0..320 SVG viewBox.
   * ------------------------------------------------------------- */
  var TRIP = [
    {
      id: "d1",
      label: "Day 1",
      city: "Sorrento",
      title: "Arrival in Sorrento",
      sub: "Settle in, cliff-top sunset, first taste of limoncello.",
      distance: "9 km",
      walk: "3.1 km",
      cost: "€120",
      stops: [
        { time: "13:00", name: "Hotel Bellavista check-in", cat: "Stay", icon: "🛎", rating: 4, price: "€€", best: "Anytime", pt: { x: 70, y: 110 }, leg: null,
          note: "Drop bags, grab the room with the sea balcony. <strong>Ask reception for the ferry timetable</strong> — schedules shift after October." },
        { time: "14:30", name: "Lunch at Trattoria da Emilia", cat: "Food", icon: "🍝", rating: 5, price: "€€", best: "Lunch", pt: { x: 120, y: 150 }, leg: { mode: "🚶", text: "8 min walk" },
          note: "Order the gnocchi alla sorrentina. Cash-only; tables on the quay book out by 13:30 in summer." },
        { time: "17:00", name: "Villa Comunale Gardens", cat: "View", icon: "🌅", rating: 4, price: "Free", best: "Golden hour", pt: { x: 96, y: 196 }, leg: { mode: "🚶", text: "12 min walk" },
          note: "Free terrace looking over the Bay of Naples toward Vesuvius. Arrive ~30 min before sunset for the bench." },
        { time: "20:00", name: "Limoncello tasting, Old Town", cat: "Drinks", icon: "🍋", rating: 4, price: "€", best: "Evening", pt: { x: 158, y: 168 }, leg: { mode: "🚶", text: "10 min walk" },
          note: "Family cellar off Via San Cesareo. The crema di limone is the one to take home." }
      ]
    },
    {
      id: "d2",
      label: "Day 2",
      city: "Positano",
      title: "Ferry to Positano",
      sub: "Vertical village, pebble beach, the famous staircase streets.",
      distance: "31 km",
      walk: "4.6 km",
      cost: "€210",
      stops: [
        { time: "09:15", name: "Morning ferry Sorrento → Positano", cat: "Transit", icon: "⛴", rating: 5, price: "€€", best: "Morning", pt: { x: 60, y: 90 }, leg: null,
          note: "Sit on the <strong>left side</strong> for the coastline. Buy tickets the evening before to skip the queue." },
        { time: "10:30", name: "Spiaggia Grande beach", cat: "Beach", icon: "🏖", rating: 4, price: "€€", best: "Late morning", pt: { x: 132, y: 130 }, leg: { mode: "⛴", text: "45 min ferry" },
          note: "Rent two loungers at the far end where it's quieter. Water shoes help on the pebbles." },
        { time: "13:30", name: "Lunch above the dome", cat: "Food", icon: "🍤", rating: 5, price: "€€€", best: "Lunch", pt: { x: 176, y: 168 }, leg: { mode: "🚶", text: "9 min climb" },
          note: "Terrace tables overlook the majolica dome of Santa Maria Assunta. Try the spaghetti alle vongole." },
        { time: "16:00", name: "Path of the Gods (lower loop)", cat: "Hike", icon: "🥾", rating: 5, price: "Free", best: "Afternoon", pt: { x: 224, y: 120 }, leg: { mode: "🚌", text: "15 min bus" },
          note: "Do the short Nocelle loop, not the full trail. Sturdy shoes; carry water — no fountains up top." },
        { time: "21:00", name: "Dinner on the staircase street", cat: "Food", icon: "🍷", rating: 4, price: "€€€", best: "Evening", pt: { x: 152, y: 196 }, leg: { mode: "🚶", text: "20 min descent" },
          note: "Candle-lit steps of Via Pasitea. Reserve a railing table for the lights coming on across the cove." }
      ]
    },
    {
      id: "d3",
      label: "Day 3",
      city: "Amalfi",
      title: "Amalfi & Atrani",
      sub: "Cathedral steps, paper museum, hidden fishing cove next door.",
      distance: "26 km",
      walk: "5.2 km",
      cost: "€140",
      stops: [
        { time: "09:00", name: "SITA coast bus to Amalfi", cat: "Transit", icon: "🚌", rating: 3, price: "€", best: "Early", pt: { x: 58, y: 80 }, leg: null,
          note: "Window seat on the sea side. Validate your ticket on board or you'll be fined." },
        { time: "10:15", name: "Cathedral of St. Andrew", cat: "Culture", icon: "⛪", rating: 5, price: "€", best: "Morning", pt: { x: 118, y: 120 }, leg: { mode: "🚌", text: "50 min ride" },
          note: "Climb the 62 striped steps, then the Cloister of Paradise. Shoulders covered to enter." },
        { time: "12:00", name: "Paper Museum (Museo della Carta)", cat: "Culture", icon: "📜", rating: 4, price: "€", best: "Midday", pt: { x: 156, y: 96 }, leg: { mode: "🚶", text: "11 min walk" },
          note: "A working 13th-century mill in a valley grotto — cool and quiet on a hot day." },
        { time: "14:30", name: "Lunch in Atrani square", cat: "Food", icon: "🐟", rating: 5, price: "€€", best: "Lunch", pt: { x: 196, y: 158 }, leg: { mode: "🚶", text: "15 min coastal path" },
          note: "Atrani is the tiny village around the headland — half the crowds, all the charm. Fresh anchovies." },
        { time: "17:30", name: "Marina di Praia swim", cat: "Beach", icon: "🌊", rating: 4, price: "Free", best: "Late day", pt: { x: 232, y: 200 }, leg: { mode: "🚌", text: "18 min bus" },
          note: "A slim fjord-like inlet between cliffs. The water stays calm and deep blue late into the afternoon." }
      ]
    },
    {
      id: "d4",
      label: "Day 4",
      city: "Ravello",
      title: "Ravello in the clouds",
      sub: "Garden terraces, infinite-view belvedere, an evening concert.",
      distance: "22 km",
      walk: "3.8 km",
      cost: "€175",
      stops: [
        { time: "09:30", name: "Drive up to Ravello", cat: "Transit", icon: "🚐", rating: 4, price: "€€", best: "Morning", pt: { x: 64, y: 96 }, leg: null,
          note: "Hairpins climb 350 m above the coast. Pre-book a small-van transfer; parking up top is scarce." },
        { time: "10:30", name: "Villa Rufolo gardens", cat: "Garden", icon: "🌿", rating: 5, price: "€€", best: "Morning", pt: { x: 122, y: 132 }, leg: { mode: "🚐", text: "40 min drive" },
          note: "The cliff-edge garden that inspired Wagner. The stage is set here for the summer concerts." },
        { time: "13:00", name: "Lunch with a valley view", cat: "Food", icon: "🍋", rating: 4, price: "€€€", best: "Lunch", pt: { x: 168, y: 110 }, leg: { mode: "🚶", text: "6 min walk" },
          note: "Lemon-leaf wrapped provola and a glass of local Furore white. Tables face the Dragone valley." },
        { time: "15:30", name: "Villa Cimbrone — Terrace of Infinity", cat: "View", icon: "🗿", rating: 5, price: "€€", best: "Afternoon", pt: { x: 214, y: 150 }, leg: { mode: "🚶", text: "18 min walk" },
          note: "Marble busts lining a balustrade over a 300 m drop to the sea. Easily the best view of the trip." },
        { time: "20:30", name: "Sunset concert at Villa Rufolo", cat: "Music", icon: "🎻", rating: 5, price: "€€€", best: "Evening", pt: { x: 130, y: 196 }, leg: { mode: "🚶", text: "12 min walk" },
          note: "Chamber strings on the garden stage as the sky turns coral. Bring a light layer — it cools fast." }
      ]
    },
    {
      id: "d5",
      label: "Day 5",
      city: "Sorrento",
      title: "Slow return & departure",
      sub: "Lemon-grove brunch, last market stroll, ferry home.",
      distance: "98 km",
      walk: "2.4 km",
      cost: "€135",
      stops: [
        { time: "09:00", name: "Lemon-grove brunch", cat: "Food", icon: "🍳", rating: 5, price: "€€", best: "Morning", pt: { x: 72, y: 104 }, leg: null,
          note: "A family agriturismo terrace shaded by lemon trees. Ricotta, honey, and the last espresso." },
        { time: "11:00", name: "Sorrento market & souvenirs", cat: "Shop", icon: "🛍", rating: 4, price: "€", best: "Late morning", pt: { x: 136, y: 142 }, leg: { mode: "🚐", text: "55 min drive" },
          note: "Inlaid wood (intarsio) and ceramics around Piazza Tasso. Haggle gently; most stalls take cards." },
        { time: "13:30", name: "Farewell lunch by the marina", cat: "Food", icon: "🦐", rating: 4, price: "€€", best: "Lunch", pt: { x: 178, y: 178 }, leg: { mode: "🚶", text: "10 min walk" },
          note: "Grilled prawns and a final spritz at Marina Grande before the bags come out." },
        { time: "16:00", name: "Ferry / transfer to airport", cat: "Transit", icon: "✈", rating: 4, price: "€€", best: "Afternoon", pt: { x: 232, y: 210 }, leg: { mode: "⛴", text: "Ferry + shuttle" },
          note: "Allow 3 hours door-to-gate. The fast ferry to Naples is the calmest way to start the journey home." }
      ]
    }
  ];

  /* ----------------------------- helpers ----------------------------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var SVGNS = "http://www.w3.org/2000/svg";

  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function stars(n) {
    var full = "★★★★★".slice(0, n);
    var empty = "☆☆☆☆☆".slice(0, 5 - n);
    return full + empty;
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS(SVGNS, name);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) {
        el.setAttribute(k, attrs[k]);
      }
    }
    return el;
  }

  /* completion state, keyed by stop id "d1-0" */
  var done = {};
  var activeIndex = 0;

  function key(dayId, stopIdx) { return dayId + "-" + stopIdx; }

  /* ----------------------------- build tabs ----------------------------- */
  var tabsList = $("#dayTabs");
  var tabEls = [];

  TRIP.forEach(function (day, i) {
    var li = document.createElement("li");
    li.setAttribute("role", "presentation");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day-tab";
    btn.id = "tab-" + day.id;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-controls", "dayPanel");
    btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
    btn.tabIndex = i === 0 ? 0 : -1;
    btn.dataset.index = String(i);
    btn.innerHTML =
      '<span class="day-tab__kicker">' + day.label + "</span>" +
      '<span class="day-tab__city">' + day.city + "</span>" +
      '<span class="day-tab__meta">' + day.stops.length + " stops · " + day.distance + "</span>" +
      '<span class="day-tab__bar"><i></i></span>';

    btn.addEventListener("click", function () { selectDay(i, true); });
    btn.addEventListener("keydown", onTabKey);

    li.appendChild(btn);
    tabsList.appendChild(li);
    tabEls.push(btn);
  });

  function onTabKey(e) {
    var idx = activeIndex;
    var next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % TRIP.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + TRIP.length) % TRIP.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TRIP.length - 1;
    if (next === null) return;
    e.preventDefault();
    selectDay(next, true);
    tabEls[next].focus();
  }

  /* ----------------------------- render a day ----------------------------- */
  var timelineEl = $("#timeline");
  var kickerEl = $("#dayKicker");
  var titleEl = $("#dayPanelTitle");
  var subEl = $("#dayPanelSub");

  function renderTimeline(day, dayIdx) {
    timelineEl.innerHTML = "";

    day.stops.forEach(function (stop, sIdx) {
      var k = key(day.id, sIdx);
      var isDone = !!done[k];

      // travel leg between stops
      if (stop.leg) {
        var leg = document.createElement("li");
        leg.className = "leg";
        leg.setAttribute("aria-hidden", "false");
        leg.innerHTML =
          '<span class="leg__line"></span>' +
          '<span class="leg__mode" aria-hidden="true">' + stop.leg.mode + "</span>" +
          "<span>" + stop.leg.text + "</span>";
        timelineEl.appendChild(leg);
      }

      var li = document.createElement("li");
      li.className = "stop" + (isDone ? " is-done" : "");
      li.dataset.stop = String(sIdx);

      var poiOpen = sIdx === 0 ? " is-open" : "";

      li.innerHTML =
        '<div class="stop__time">' + stop.time + "</div>" +
        '<div class="stop__node">' +
          '<span class="stop__dot" aria-hidden="true"></span>' +
          '<div class="poi' + poiOpen + '">' +
            '<div class="poi__head">' +
              '<div class="poi__icon" aria-hidden="true">' + stop.icon + "</div>" +
              '<div class="poi__main">' +
                '<div class="poi__top">' +
                  '<h3 class="poi__name">' + stop.name + "</h3>" +
                  '<span class="poi__cat">' + stop.cat + "</span>" +
                "</div>" +
                '<div class="poi__row">' +
                  '<span class="poi__stars" aria-label="' + stop.rating + ' out of 5">' + stars(stop.rating) + "</span>" +
                  "<span>💶 " + stop.price + "</span>" +
                  "<span>🕑 Best: " + stop.best + "</span>" +
                "</div>" +
              "</div>" +
              '<div class="poi__controls">' +
                checkBtnHTML(isDone, sIdx) +
                toggleBtnHTML(sIdx) +
              "</div>" +
            "</div>" +
            '<div class="poi__body">' +
              '<div class="poi__body-inner">' +
                '<p class="poi__note">' + stop.note + "</p>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>";

      timelineEl.appendChild(li);
    });

    // wire interactions for this render
    Array.prototype.forEach.call(timelineEl.querySelectorAll(".check-btn"), function (b) {
      b.addEventListener("click", function () { onCheck(day, dayIdx, b); });
    });
    Array.prototype.forEach.call(timelineEl.querySelectorAll(".toggle-btn"), function (b) {
      b.addEventListener("click", function () { onToggle(b); });
    });
    // tapping the header (not on a button) also toggles
    Array.prototype.forEach.call(timelineEl.querySelectorAll(".poi__head"), function (h) {
      h.addEventListener("click", function (e) {
        if (e.target.closest("button")) return;
        var t = h.parentElement.querySelector(".toggle-btn");
        if (t) onToggle(t);
      });
    });
  }

  function checkBtnHTML(isDone, sIdx) {
    return (
      '<button type="button" class="icon-btn check-btn" data-stop="' + sIdx + '" ' +
      'aria-pressed="' + (isDone ? "true" : "false") + '" ' +
      'title="Mark stop complete" aria-label="Mark stop complete">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M5 12.5 10 17.5 19.5 7" /></svg>' +
      "</button>"
    );
  }

  function toggleBtnHTML(sIdx) {
    return (
      '<button type="button" class="icon-btn toggle-btn" data-stop="' + sIdx + '" ' +
      'aria-expanded="' + (sIdx === 0 ? "true" : "false") + '" ' +
      'title="Show notes" aria-label="Show notes">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M6 9l6 6 6-6" /></svg>' +
      "</button>"
    );
  }

  function onToggle(btn) {
    var poi = btn.closest(".poi");
    var open = poi.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function onCheck(day, dayIdx, btn) {
    var sIdx = parseInt(btn.dataset.stop, 10);
    var k = key(day.id, sIdx);
    var nowDone = !done[k];
    done[k] = nowDone;

    var stopLi = btn.closest(".stop");
    stopLi.classList.toggle("is-done", nowDone);
    btn.setAttribute("aria-pressed", nowDone ? "true" : "false");

    updateProgress(day, dayIdx);
    updateMapPins(day);

    var stopName = day.stops[sIdx].name;
    toast(nowDone ? "✓ Checked off — " + stopName : "Unchecked — " + stopName);
  }

  /* ----------------------------- progress ----------------------------- */
  var progressArc = $("#progressArc");
  var progressNum = $("#progressNum");
  var dayCountEl = $("#dayCount");
  var ARC_LEN = 2 * Math.PI * 18; // r=18

  function dayDoneCount(day) {
    var c = 0;
    day.stops.forEach(function (_, i) { if (done[key(day.id, i)]) c++; });
    return c;
  }

  function updateProgress(day, dayIdx) {
    var total = day.stops.length;
    var doneN = dayDoneCount(day);
    var pct = total ? Math.round((doneN / total) * 100) : 0;

    if (progressArc) progressArc.style.strokeDashoffset = String(ARC_LEN * (1 - pct / 100));
    if (progressNum) progressNum.textContent = pct + "%";
    if (dayCountEl) dayCountEl.textContent = doneN + " of " + total + " done";

    // update this tab's mini progress bar
    var bar = tabEls[dayIdx] && tabEls[dayIdx].querySelector(".day-tab__bar i");
    if (bar) bar.style.width = pct + "%";
  }

  function refreshAllTabBars() {
    TRIP.forEach(function (day, i) {
      var total = day.stops.length;
      var pct = total ? Math.round((dayDoneCount(day) / total) * 100) : 0;
      var bar = tabEls[i].querySelector(".day-tab__bar i");
      if (bar) bar.style.width = pct + "%";
    });
  }

  /* ----------------------------- map ----------------------------- */
  var routePath = $("#routePath");
  var pinsGroup = $("#mapPins");
  var mapNote = $("#mapNote");

  function renderMap(day) {
    // route polyline through stop points
    var pts = day.stops.map(function (s) { return s.pt; });
    var d = pts.map(function (p, i) { return (i === 0 ? "M" : "L") + p.x + " " + p.y; }).join(" ");
    routePath.setAttribute("d", d);

    pinsGroup.innerHTML = "";
    day.stops.forEach(function (s, i) {
      var g = svgEl("g", { class: "map__pin", "data-stop": String(i) });
      var halo = svgEl("circle", { cx: s.pt.x, cy: s.pt.y, r: 13, fill: "rgba(232,98,63,0.16)" });
      var body = svgEl("circle", {
        class: "pin-body",
        cx: s.pt.x, cy: s.pt.y, r: 10,
        fill: done[key(day.id, i)] ? "#2f9e6f" : "#e8623f",
        stroke: "#fff", "stroke-width": "2"
      });
      var num = svgEl("text", { class: "map__pin-num", x: s.pt.x, y: s.pt.y });
      num.textContent = String(i + 1);

      g.appendChild(halo);
      g.appendChild(body);
      g.appendChild(num);
      pinsGroup.appendChild(g);
    });

    if (mapNote) {
      mapNote.textContent = day.city + " day route · " + day.stops.length + " stops · illustrative map";
    }
  }

  function updateMapPins(day) {
    Array.prototype.forEach.call(pinsGroup.querySelectorAll(".map__pin"), function (g) {
      var i = parseInt(g.dataset.stop, 10);
      var body = g.querySelector(".pin-body");
      if (body) body.setAttribute("fill", done[key(day.id, i)] ? "#2f9e6f" : "#e8623f");
    });
  }

  /* ----------------------------- summary ----------------------------- */
  var summaryStats = $("#summaryStats");
  var highlightsEl = $("#highlights");

  function renderSummary(day) {
    summaryStats.innerHTML =
      '<li><small>Distance</small><b>' + day.distance + "</b></li>" +
      '<li><small>On foot</small><b>' + day.walk + "</b></li>" +
      '<li><small>Est. cost</small><b>' + day.cost + "</b></li>" +
      '<li><small>Stops</small><b>' + day.stops.length + "</b></li>";

    // highlights = top-rated stops (4★+)
    var picks = day.stops
      .filter(function (s) { return s.rating >= 4; })
      .slice(0, 4);
    highlightsEl.innerHTML = picks
      .map(function (s) { return "<li>" + s.name + "</li>"; })
      .join("");
  }

  /* ----------------------------- select day ----------------------------- */
  function selectDay(idx, announce) {
    activeIndex = idx;
    var day = TRIP[idx];

    tabEls.forEach(function (t, i) {
      var sel = i === idx;
      t.setAttribute("aria-selected", sel ? "true" : "false");
      t.tabIndex = sel ? 0 : -1;
      if (sel) {
        t.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      }
    });

    kickerEl.textContent = day.label + " · " + day.city;
    titleEl.textContent = day.title;
    subEl.textContent = day.sub;
    $("#dayPanel").setAttribute("aria-labelledby", "dayPanelTitle");

    renderTimeline(day, idx);
    renderMap(day);
    updateMapPins(day);
    renderSummary(day);
    updateProgress(day, idx);

    if (announce) toast(day.label + " — " + day.city);
  }

  /* ----------------------------- save / print ----------------------------- */
  var saveBtn = $("#saveTripBtn");
  saveBtn.addEventListener("click", function () {
    var saved = saveBtn.getAttribute("aria-pressed") === "true";
    saved = !saved;
    saveBtn.setAttribute("aria-pressed", saved ? "true" : "false");
    saveBtn.querySelector(".btn__label").textContent = saved ? "Saved" : "Save trip";
    toast(saved ? "♥ Trip saved to your wishlist" : "Removed from wishlist");
  });

  var printBtn = $("#printBtn");
  printBtn.addEventListener("click", function () {
    toast("Opening print view…");
    setTimeout(function () { window.print(); }, 120);
  });

  /* ----------------------------- init ----------------------------- */
  selectDay(0, false);
  refreshAllTabBars();
})();
