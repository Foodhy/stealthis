(function () {
  "use strict";

  // --- Fictional flight data -------------------------------------------------
  var DEPARTURES = [
    { time: "06:40", flight: "NW 218", airline: "Northwind Air", city: "London", code: "LHR", gate: "B12", status: "departed" },
    { time: "07:15", flight: "NW 644", airline: "Northwind Air", city: "Reykjavík", code: "KEF", gate: "B7", status: "boarding" },
    { time: "07:55", flight: "AR 1102", airline: "Aurora Lines", city: "Toronto", code: "YYZ", gate: "C3", status: "ontime" },
    { time: "08:20", flight: "NW 305", airline: "Northwind Air", city: "Paris", code: "CDG", gate: "B14", status: "ontime", delayed: "09:05" },
    { time: "08:45", flight: "NW 512", airline: "Northwind Air", city: "Amsterdam", code: "AMS", gate: "B9", status: "ontime" },
    { time: "09:10", flight: "PL 880", airline: "Polaris Jet", city: "Lisbon", code: "LIS", gate: null, status: "ontime" },
    { time: "09:30", flight: "NW 077", airline: "Northwind Air", city: "Dublin", code: "DUB", gate: "B5", status: "delayed", delayed: "10:25" },
    { time: "10:05", flight: "AR 2240", airline: "Aurora Lines", city: "Madrid", code: "MAD", gate: "C8", status: "ontime" },
    { time: "10:40", flight: "NW 419", airline: "Northwind Air", city: "Zürich", code: "ZRH", gate: "B2", status: "cancelled" },
    { time: "11:15", flight: "MS 631", airline: "Meridian Sky", city: "Rome", code: "FCO", gate: "C11", status: "ontime" },
    { time: "11:50", flight: "NW 188", airline: "Northwind Air", city: "Copenhagen", code: "CPH", gate: "B10", status: "ontime" },
    { time: "12:25", flight: "PL 904", airline: "Polaris Jet", city: "Oslo", code: "OSL", gate: null, status: "ontime" },
  ];

  var ARRIVALS = [
    { time: "06:25", flight: "NW 217", airline: "Northwind Air", city: "London", code: "LHR", gate: "B12", status: "landed" },
    { time: "07:05", flight: "MS 410", airline: "Meridian Sky", city: "Munich", code: "MUC", gate: "C2", status: "landed" },
    { time: "07:40", flight: "AR 1101", airline: "Aurora Lines", city: "Toronto", code: "YYZ", gate: "C3", status: "ontime" },
    { time: "08:10", flight: "NW 306", airline: "Northwind Air", city: "Paris", code: "CDG", gate: "B14", status: "ontime" },
    { time: "08:35", flight: "PL 771", airline: "Polaris Jet", city: "Helsinki", code: "HEL", gate: "B6", status: "delayed", delayed: "09:20" },
    { time: "09:00", flight: "NW 511", airline: "Northwind Air", city: "Amsterdam", code: "AMS", gate: null, status: "ontime" },
    { time: "09:25", flight: "AR 2239", airline: "Aurora Lines", city: "Madrid", code: "MAD", gate: "C8", status: "ontime" },
    { time: "10:00", flight: "NW 420", airline: "Northwind Air", city: "Zürich", code: "ZRH", gate: "B2", status: "ontime" },
    { time: "10:35", flight: "MS 632", airline: "Meridian Sky", city: "Rome", code: "FCO", gate: "C11", status: "delayed", delayed: "11:30" },
    { time: "11:10", flight: "NW 189", airline: "Northwind Air", city: "Stockholm", code: "ARN", gate: "B8", status: "ontime" },
    { time: "11:45", flight: "PL 903", airline: "Polaris Jet", city: "Oslo", code: "OSL", gate: "B3", status: "ontime" },
    { time: "12:20", flight: "NW 622", airline: "Northwind Air", city: "Edinburgh", code: "EDI", gate: null, status: "ontime" },
  ];

  var STATUS_LABEL = {
    ontime: "On time",
    boarding: "Boarding",
    delayed: "Delayed",
    departed: "Departed",
    cancelled: "Cancelled",
    landed: "Landed",
  };

  var FILTER_MATCH = {
    all: function () { return true; },
    boarding: function (s) { return s === "boarding"; },
    ontime: function (s) { return s === "ontime"; },
    delayed: function (s) { return s === "delayed"; },
  };

  // --- State -----------------------------------------------------------------
  var state = { tab: "departures", filter: "all", query: "" };

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var rowsEl = $("#rows");
  var emptyEl = $("#empty");
  var searchEl = $("#search");
  var destHead = $("#destHead");
  var toastEl = $("#toast");
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function activeData() {
    return state.tab === "departures" ? DEPARTURES : ARRIVALS;
  }

  function pillHtml(status) {
    return '<span class="pill ' + status + '"><i class="pdot"></i>' + STATUS_LABEL[status] + "</span>";
  }

  function rowHtml(f) {
    var time = f.status === "delayed" && f.delayed
      ? '<span class="col-time">' + f.delayed + "<small>" + f.time + "</small></span>"
      : '<span class="col-time">' + f.time + "</span>";

    var gate = f.gate
      ? '<span class="col-gate">' + escapeHtml(f.gate) + "</span>"
      : '<span class="col-gate tbd">—</span>';

    return (
      '<div class="board-row" role="row" data-flight="' + escapeHtml(f.flight) + '">' +
        time +
        '<span class="col-flight">' +
          '<span class="flight-no">' + escapeHtml(f.flight) + "</span>" +
          '<span class="airline">' + escapeHtml(f.airline) + "</span>" +
        "</span>" +
        '<span class="col-dest">' +
          '<span class="dest-city">' + escapeHtml(f.city) + "</span>" +
          '<span class="dest-code">' + (state.tab === "departures" ? "JFK → " : "") + escapeHtml(f.code) + "</span>" +
        "</span>" +
        gate +
        '<span class="col-status">' + pillHtml(f.status) + "</span>" +
      "</div>"
    );
  }

  function filtered() {
    var q = state.query.trim().toLowerCase();
    var pass = FILTER_MATCH[state.filter] || FILTER_MATCH.all;
    return activeData().filter(function (f) {
      if (!pass(f.status)) return false;
      if (!q) return true;
      return (
        f.flight.toLowerCase().indexOf(q) > -1 ||
        f.city.toLowerCase().indexOf(q) > -1 ||
        f.code.toLowerCase().indexOf(q) > -1 ||
        f.airline.toLowerCase().indexOf(q) > -1
      );
    });
  }

  function render() {
    var list = filtered();
    if (list.length === 0) {
      rowsEl.innerHTML = "";
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    rowsEl.innerHTML = list.map(rowHtml).join("");
  }

  // --- Tabs ------------------------------------------------------------------
  $$(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (tab.dataset.tab === state.tab) return;
      state.tab = tab.dataset.tab;
      $$(".tab").forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      destHead.textContent = state.tab === "departures" ? "Destination" : "Origin";
      render();
    });
  });

  // --- Filters ---------------------------------------------------------------
  $$(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      state.filter = chip.dataset.filter;
      $$(".chip").forEach(function (c) { c.classList.toggle("is-active", c === chip); });
      render();
    });
  });

  // --- Search ----------------------------------------------------------------
  searchEl.addEventListener("input", function () {
    state.query = searchEl.value;
    render();
  });

  // --- Clock -----------------------------------------------------------------
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tickClock() {
    var d = new Date();
    $("#clock").textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  tickClock();
  setInterval(tickClock, 1000);

  // --- "Last updated" relative timer ----------------------------------------
  var lastUpdate = Date.now();
  function refreshUpdated() {
    var secs = Math.floor((Date.now() - lastUpdate) / 1000);
    var label;
    if (secs < 5) label = "just now";
    else if (secs < 60) label = secs + "s ago";
    else label = Math.floor(secs / 60) + "m ago";
    $("#updated").textContent = label;
  }
  setInterval(refreshUpdated, 5000);

  // --- Live status updates (split-flap feel) --------------------------------
  // Walk a small progression so the board feels alive without confusing data.
  var PROGRESSION = { ontime: "boarding", boarding: "departed" };

  function liveUpdate() {
    var candidates = DEPARTURES.filter(function (f) {
      return PROGRESSION[f.status] && f.status !== "cancelled";
    });
    if (candidates.length === 0) return;

    var f = candidates[Math.floor(Math.random() * candidates.length)];
    var next = PROGRESSION[f.status];
    f.status = next;
    lastUpdate = Date.now();
    refreshUpdated();

    // Re-render, then animate the changed pill with a flip.
    render();
    var row = rowsEl.querySelector('[data-flight="' + f.flight + '"] .pill');
    if (row) {
      row.classList.add("flip");
      setTimeout(function () { row.classList.remove("flip"); }, 460);
    }

    if (next === "boarding") toast(f.flight + " to " + f.city + " is now boarding at gate " + (f.gate || "TBD"));
    else if (next === "departed") toast(f.flight + " to " + f.city + " has departed");
  }
  setInterval(liveUpdate, 6500);

  // --- Init ------------------------------------------------------------------
  render();
})();
