(function () {
  "use strict";

  // ---- fictional flight data ----
  var FLIGHTS = {
    AX482: {
      no: "AX482", airline: "Aerolux",
      from: { code: "JFK", city: "New York", time: "08:40", actual: "08:40" },
      to: { code: "LHR", city: "London", time: "20:15", actual: "20:15" },
      status: "boarding", gate: "B12", terminal: "2", seatRows: "1–42",
      progress: 0, durationMin: 415, aircraft: "A350-900"
    },
    AX119: {
      no: "AX119", airline: "Aerolux",
      from: { code: "SFO", city: "San Francisco", time: "11:20", actual: "11:20" },
      to: { code: "NRT", city: "Tokyo", time: "15:05", actual: "15:05" },
      status: "departed", gate: "A4", terminal: "2", seatRows: "1–58",
      progress: 0.62, durationMin: 645, aircraft: "B787-9"
    },
    AX730: {
      no: "AX730", airline: "Aerolux",
      from: { code: "CDG", city: "Paris", time: "14:10", actual: "14:55" },
      to: { code: "DXB", city: "Dubai", time: "23:30", actual: "00:15" },
      status: "delayed", gate: "D21", terminal: "2", seatRows: "1–48",
      progress: 0, durationMin: 380, aircraft: "A330-300"
    },
    AX256: {
      no: "AX256", airline: "Aerolux",
      from: { code: "AMS", city: "Amsterdam", time: "09:05", actual: "09:05" },
      to: { code: "BCN", city: "Barcelona", time: "11:25", actual: "11:25" },
      status: "ontime", gate: "C7", terminal: "2", seatRows: "1–30",
      progress: 0, durationMin: 140, aircraft: "A320neo"
    },
    AX904: {
      no: "AX904", airline: "Aerolux",
      from: { code: "MAD", city: "Madrid", time: "07:45", actual: "—" },
      to: { code: "GRU", city: "São Paulo", time: "16:50", actual: "—" },
      status: "cancelled", gate: "—", terminal: "2", seatRows: "—",
      progress: 0, durationMin: 615, aircraft: "A350-900"
    }
  };

  var STATUS = {
    ontime:   { label: "On time",   cls: "ontime" },
    boarding: { label: "Boarding",  cls: "boarding" },
    delayed:  { label: "Delayed",   cls: "delayed" },
    departed: { label: "Departed",  cls: "departed" },
    cancelled:{ label: "Cancelled", cls: "cancelled" }
  };

  // departures board order
  var DEP_ORDER = ["AX256", "AX482", "AX730", "AX119", "AX904"];

  var card = document.getElementById("statusCard");
  var depList = document.getElementById("depList");
  var form = document.getElementById("searchForm");
  var input = document.getElementById("flightInput");
  var clockEl = document.getElementById("clock");
  var toastEl = document.getElementById("toast");

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2600);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function fmtDur(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + "h " + (m < 10 ? "0" + m : m) + "m";
  }

  // ---- render the big status card ----
  function renderCard(f) {
    var st = STATUS[f.status];
    var fromLate = f.from.actual !== f.from.time && f.from.actual !== "—";
    var toLate = f.to.actual !== f.to.time && f.to.actual !== "—";
    var progPct = f.status === "departed" ? Math.round(f.progress * 100) : 0;

    var routeMeta;
    if (f.status === "cancelled") routeMeta = "Flight cancelled";
    else if (f.status === "departed") routeMeta = "En route · " + progPct + "% complete";
    else if (f.status === "boarding") routeMeta = "Now boarding · " + fmtDur(f.durationMin);
    else if (f.status === "delayed") routeMeta = "Delayed departure · " + fmtDur(f.durationMin);
    else routeMeta = "Scheduled · " + fmtDur(f.durationMin);

    card.innerHTML =
      '<div class="card__top">' +
        '<div class="card__flight">' +
          '<b class="tnum">' + esc(f.no) + '</b>' +
          '<span>' + esc(f.airline) + ' · ' + esc(f.aircraft) + '</span>' +
        '</div>' +
        '<span class="pill pill--' + st.cls + '">' + st.label + '</span>' +
      '</div>' +

      '<div class="route">' +
        '<div class="airport airport--from">' +
          '<div class="airport__code">' + esc(f.from.code) + '</div>' +
          '<div class="airport__city">' + esc(f.from.city) + '</div>' +
          '<div class="airport__time' + (fromLate ? ' is-late' : '') + ' tnum">' +
            esc(f.from.actual) + '<small>' + (fromLate ? 'sched ' + esc(f.from.time) : 'departs') + '</small>' +
          '</div>' +
        '</div>' +

        '<div class="path">' +
          '<div class="path__line">' +
            '<div class="path__fill"></div>' +
            '<span class="path__dot path__dot--a"></span>' +
            '<span class="path__dot path__dot--b"></span>' +
            '<span class="path__plane">' +
              '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z"/></svg>' +
            '</span>' +
          '</div>' +
          '<div class="path__meta">' + esc(routeMeta) + '</div>' +
        '</div>' +

        '<div class="airport airport--to">' +
          '<div class="airport__code">' + esc(f.to.code) + '</div>' +
          '<div class="airport__city">' + esc(f.to.city) + '</div>' +
          '<div class="airport__time' + (toLate ? ' is-late' : '') + ' tnum">' +
            esc(f.to.actual) + '<small>' + (toLate ? 'sched ' + esc(f.to.time) : 'arrives') + '</small>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="details">' +
        '<div class="detail"><div class="detail__label">Gate</div><div class="detail__value is-accent">' + esc(f.gate) + '</div></div>' +
        '<div class="detail"><div class="detail__label">Terminal</div><div class="detail__value">' + esc(f.terminal) + '</div></div>' +
        '<div class="detail"><div class="detail__label">Seats</div><div class="detail__value tnum">' + esc(f.seatRows) + '</div></div>' +
        '<div class="detail"><div class="detail__label">Duration</div><div class="detail__value tnum">' + fmtDur(f.durationMin) + '</div></div>' +
      '</div>' +

      '<div class="card__foot">' +
        '<span class="card__refresh"><span class="pulse"></span>Auto-refreshing</span>' +
        '<span>Updated <span class="tnum" id="cardStamp">just now</span></span>' +
      '</div>';

    // animate the route progress after paint
    var fill = card.querySelector(".path__fill");
    var plane = card.querySelector(".path__plane");
    var target = f.status === "departed" ? f.progress * 100 : (f.status === "cancelled" ? 0 : 0);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        fill.style.width = target + "%";
        plane.style.left = target + "%";
      });
    });
  }

  function renderEmpty(code) {
    card.innerHTML =
      '<div class="card--empty">' +
        '<b>No flight found' + (code ? ' for ' + esc(code) : '') + '</b>' +
        'Check the flight number and try again. Try AX482, AX119, AX730 or AX256.' +
      '</div>';
  }

  // ---- departures list ----
  function renderDepartures() {
    var html = "";
    DEP_ORDER.forEach(function (code) {
      var f = FLIGHTS[code];
      var st = STATUS[f.status];
      var late = f.from.actual !== f.from.time && f.from.actual !== "—";
      html +=
        '<li>' +
        '<button class="dep" type="button" data-flight="' + esc(f.no) + '" aria-label="Track ' + esc(f.no) + ' to ' + esc(f.to.city) + '">' +
          '<span class="dep__time tnum">' + esc(f.from.actual !== "—" ? f.from.actual : f.from.time) +
            (late ? '<small>was ' + esc(f.from.time) + '</small>' : '<small>' + esc(f.no) + '</small>') +
          '</span>' +
          '<span class="dep__route">' +
            '<b class="tnum">' + esc(f.from.code) + ' → ' + esc(f.to.code) + '</b>' +
            '<span>' + esc(f.from.city) + ' to ' + esc(f.to.city) + '</span>' +
          '</span>' +
          '<span class="dep__gate">' + esc(f.gate) + '<small>gate</small></span>' +
          '<span class="tag tag--' + st.cls + '">' + st.label + '</span>' +
        '</button>' +
        '</li>';
    });
    depList.innerHTML = html;
  }

  function setActiveRow(code) {
    var rows = depList.querySelectorAll(".dep");
    rows.forEach(function (r) {
      r.classList.toggle("is-active", r.getAttribute("data-flight") === code);
    });
  }

  // ---- track a flight ----
  function track(raw, announce) {
    var code = String(raw || "").trim().toUpperCase().replace(/\s+/g, "");
    if (!code) { toast("Enter a flight number"); return; }
    var f = FLIGHTS[code];
    if (!f) {
      renderEmpty(code);
      setActiveRow(null);
      toast("Flight " + code + " not found");
      return;
    }
    input.value = code;
    renderCard(f);
    setActiveRow(code);
    if (announce) toast(STATUS[f.status].label + " · " + f.from.code + " → " + f.to.code);
  }

  // ---- events ----
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    track(input.value, true);
  });

  document.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (chip) { track(chip.getAttribute("data-flight"), true); return; }
    var dep = e.target.closest(".dep");
    if (dep) {
      track(dep.getAttribute("data-flight"), true);
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  // ---- clock + auto-refresh pulse ----
  function pad(n) { return n < 10 ? "0" + n : n; }
  function tickClock() {
    var d = new Date();
    clockEl.textContent = pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes());
  }
  tickClock();
  setInterval(tickClock, 1000 * 20);

  // simulate live progress on departed flights + refresh stamp
  var refreshes = 0;
  setInterval(function () {
    var enroute = FLIGHTS.AX119;
    if (enroute.progress < 0.99) {
      enroute.progress = Math.min(0.99, enroute.progress + 0.015);
    }
    var stamp = document.getElementById("cardStamp");
    if (stamp) {
      refreshes++;
      stamp.textContent = refreshes === 0 ? "just now" : refreshes + "s ago";
    }
    // if currently viewing the en-route flight, nudge the plane
    var active = depList.querySelector(".dep.is-active");
    if (active && active.getAttribute("data-flight") === "AX119") {
      var fill = card.querySelector(".path__fill");
      var plane = card.querySelector(".path__plane");
      if (fill && plane) {
        var p = Math.round(enroute.progress * 100) + "%";
        fill.style.width = p;
        plane.style.left = p;
      }
    }
  }, 4000);

  // ---- init ----
  renderDepartures();
  track("AX482", false);
})();
