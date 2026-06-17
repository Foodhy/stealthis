(function () {
  "use strict";

  // --- Fixed "now" so the demo is deterministic ---
  var NOW = new Date(2026, 5, 17); // 17 Jun 2026 (month is 0-based)
  NOW.setHours(0, 0, 0, 0);

  var DAY = 86400000;
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MONTHS_SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

  // --- Fictional events (dates as [year, monthIndex, day]) ---
  var POSTERS = [
    "linear-gradient(135deg,#7c3aed,#ff3d81)",
    "linear-gradient(135deg,#0ea5e9,#7c3aed)",
    "linear-gradient(135deg,#f59e0b,#dc2626)",
    "linear-gradient(135deg,#16a34a,#0ea5e9)",
    "linear-gradient(135deg,#ff3d81,#f59e0b)",
    "linear-gradient(135deg,#6d28d9,#0e0e16)"
  ];
  var EVENTS = [
    { name: "Neon Bloom — Rooftop Set", venue: "The Halcyon Loft", city: "Brooklyn", price: 38, ymd: [2026,5,17], stock: "hot" },
    { name: "Velvet Static (DJ Aria)", venue: "Basement 9", city: "Brooklyn", price: 25, ymd: [2026,5,19], stock: "low" },
    { name: "Saturday Carnival of Sound", venue: "Pier 6 Open Air", city: "Brooklyn", price: 54, ymd: [2026,5,20], stock: "ok" },
    { name: "Lo-Fi Sunday Garden", venue: "Greenpoint Yard", city: "Brooklyn", price: 18, ymd: [2026,5,21], stock: "ok" },
    { name: "Midweek Jazz Lab", venue: "Blue Cellar", city: "Manhattan", price: 30, ymd: [2026,5,24], stock: "low" },
    { name: "Pulsewave Festival — Night 1", venue: "Eastern Arena", city: "Queens", price: 72, ymd: [2026,5,27], stock: "out" },
    { name: "Indie Echo Showcase", venue: "Marlow Hall", city: "Brooklyn", price: 28, ymd: [2026,5,30], stock: "ok" },
    { name: "Synth City Afterparty", venue: "Rift Warehouse", city: "Queens", price: 22, ymd: [2026,6,4], stock: "hot" },
    { name: "Acoustic Tides", venue: "Harbor Chapel", city: "Manhattan", price: 34, ymd: [2026,6,11], stock: "ok" },
    { name: "Bassline Bazaar", venue: "Underline", city: "Brooklyn", price: 26, ymd: [2026,6,18], stock: "low" }
  ];
  EVENTS.forEach(function (e, i) {
    e.date = new Date(e.ymd[0], e.ymd[1], e.ymd[2]);
    e.date.setHours(0, 0, 0, 0);
    e.poster = POSTERS[i % POSTERS.length];
  });

  // --- State ---
  var state = { start: null, end: null, chip: null };
  var viewMonth = new Date(NOW.getFullYear(), NOW.getMonth(), 1);

  // --- DOM ---
  var chipEls = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var clearBtn = document.getElementById("clearBtn");
  var calGrid = document.getElementById("calGrid");
  var monthLabel = document.getElementById("monthLabel");
  var calHint = document.getElementById("calHint");
  var appliedEl = document.getElementById("applied");
  var appliedValue = document.getElementById("appliedValue");
  var appliedCount = document.getElementById("appliedCount");
  var eventList = document.getElementById("eventList");
  var emptyState = document.getElementById("emptyState");
  var toastEl = document.getElementById("toast");

  // --- Helpers ---
  function startOfWeek(d) { // Monday-based
    var c = new Date(d);
    var day = (c.getDay() + 6) % 7;
    c.setDate(c.getDate() - day);
    c.setHours(0, 0, 0, 0);
    return c;
  }
  function addDays(d, n) { var c = new Date(d); c.setDate(c.getDate() + n); return c; }
  function sameDay(a, b) { return a && b && a.getTime() === b.getTime(); }
  function fmt(d) { return d.getDate() + " " + MONTHS_SHORT[d.getMonth()][0] + MONTHS_SHORT[d.getMonth()].slice(1).toLowerCase(); }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // --- Quick-range presets ---
  function presetRange(key) {
    var sow = startOfWeek(NOW);
    switch (key) {
      case "today":
        return [NOW, NOW];
      case "weekend": {
        var sat = addDays(sow, 5), sun = addDays(sow, 6);
        return [sat, sun];
      }
      case "week":
        return [NOW, addDays(sow, 6)];
      case "month": {
        var first = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
        var last = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 0);
        return [NOW > first ? NOW : first, last];
      }
    }
    return [null, null];
  }

  // --- Emit selection (console event for consumers) ---
  function emit() {
    var detail = {
      start: state.start ? new Date(state.start) : null,
      end: state.end ? new Date(state.end) : null,
      preset: state.chip
    };
    document.dispatchEvent(new CustomEvent("daterange:change", { detail: detail }));
    if (window.console && console.info) {
      console.info("[date-filter] selection", detail);
    }
  }

  // --- Chip handlers ---
  chipEls.forEach(function (chip) {
    chip.setAttribute("aria-pressed", "false");
    chip.addEventListener("click", function () {
      var key = chip.dataset.range;
      if (state.chip === key) { clearAll(false); return; }
      var r = presetRange(key);
      state.start = r[0];
      state.end = r[1];
      state.chip = key;
      // jump calendar to the start month
      viewMonth = new Date(state.start.getFullYear(), state.start.getMonth(), 1);
      render();
      toast("Range: " + chip.textContent.trim());
      emit();
    });
  });

  // --- Calendar navigation ---
  document.getElementById("prevMonth").addEventListener("click", function () {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  document.getElementById("nextMonth").addEventListener("click", function () {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  // --- Calendar day click (custom range) ---
  function onDayClick(date) {
    state.chip = null; // custom selection clears preset
    if (!state.start || (state.start && state.end)) {
      state.start = date;
      state.end = null;
      calHint.textContent = "Now pick an end date.";
    } else {
      if (date < state.start) {
        state.end = state.start;
        state.start = date;
      } else {
        state.end = date;
      }
      calHint.textContent = "Tap a day to set the start, then tap again for the end.";
    }
    render();
    emit();
  }

  // --- Clear ---
  function clearAll(notify) {
    state.start = null;
    state.end = null;
    state.chip = null;
    calHint.textContent = "Tap a day to set the start, then tap again for the end.";
    render();
    if (notify !== false) toast("Dates cleared");
    emit();
  }
  clearBtn.addEventListener("click", function () { clearAll(true); });

  // --- Rendering ---
  function renderCalendar() {
    monthLabel.textContent = MONTHS[viewMonth.getMonth()] + " " + viewMonth.getFullYear();
    calGrid.innerHTML = "";
    var firstWeekday = (new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay() + 6) % 7;
    var daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();

    for (var i = 0; i < firstWeekday; i++) {
      var pad = document.createElement("span");
      pad.className = "cal-cell is-empty";
      pad.setAttribute("aria-hidden", "true");
      calGrid.appendChild(pad);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var cur = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d);
      cur.setHours(0, 0, 0, 0);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-cell";
      btn.textContent = d;
      btn.setAttribute("role", "gridcell");

      var label = d + " " + MONTHS[viewMonth.getMonth()] + " " + viewMonth.getFullYear();
      btn.setAttribute("aria-label", label);

      if (cur < NOW) {
        btn.disabled = true;
      }
      if (sameDay(cur, NOW)) btn.classList.add("is-today");

      if (state.start && state.end && cur > state.start && cur < state.end) {
        btn.classList.add("in-range");
      }
      if (sameDay(cur, state.start)) { btn.classList.add("range-start"); btn.setAttribute("aria-selected", "true"); }
      if (sameDay(cur, state.end)) { btn.classList.add("range-end"); btn.setAttribute("aria-selected", "true"); }
      if (state.start && !state.end && sameDay(cur, state.start)) btn.classList.add("range-end");

      (function (date) {
        btn.addEventListener("click", function () { onDayClick(date); });
      })(cur);

      calGrid.appendChild(btn);
    }
  }

  function renderApplied() {
    var has = !!state.start;
    clearBtn.disabled = !has;
    if (!has) { appliedEl.hidden = true; return; }
    appliedEl.hidden = false;
    var label;
    if (state.start && state.end && !sameDay(state.start, state.end)) {
      label = fmt(state.start) + " – " + fmt(state.end);
    } else {
      label = fmt(state.start);
    }
    appliedValue.textContent = label;
    var n = countMatches();
    appliedCount.textContent = n + (n === 1 ? " show" : " shows");
  }

  function inRange(d) {
    if (!state.start) return true;
    var end = state.end || state.start;
    return d >= state.start && d <= end;
  }

  function countMatches() {
    return EVENTS.filter(function (e) { return inRange(e.date); }).length;
  }

  function badge(stock) {
    if (stock === "out") return '<span class="badge badge--out">Sold out</span>';
    if (stock === "low") return '<span class="badge badge--low">Low stock</span>';
    if (stock === "hot") return '<span class="badge badge--hot">Selling fast</span>';
    return "";
  }

  function renderEvents() {
    var matches = EVENTS.filter(function (e) { return inRange(e.date); })
      .sort(function (a, b) { return a.date - b.date; });

    eventList.innerHTML = "";
    emptyState.hidden = matches.length > 0;

    matches.forEach(function (e) {
      var dow = ["SUN","MON","TUE","WED","THU","FRI","SAT"][e.date.getDay()];
      var li = document.createElement("li");
      li.className = "event";
      li.innerHTML =
        '<div class="event__poster" style="background:' + e.poster + '">' +
          '<div class="event__date-badge">' + dow + '<b>' + e.date.getDate() + '</b>' + MONTHS_SHORT[e.date.getMonth()] + '</div>' +
          '<span>' + e.city.toUpperCase() + '</span>' +
        '</div>' +
        '<div class="event__body">' +
          badge(e.stock) +
          '<h3 class="event__name">' + e.name + '</h3>' +
          '<p class="event__meta">' +
            '<span>' + e.venue + '</span>' +
            '<span class="event__price">$' + e.price + '</span>' +
          '</p>' +
        '</div>';
      eventList.appendChild(li);
    });
  }

  function syncChips() {
    chipEls.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.dataset.range === state.chip ? "true" : "false");
    });
  }

  function render() {
    renderCalendar();
    renderApplied();
    renderEvents();
    syncChips();
  }

  render();
})();
