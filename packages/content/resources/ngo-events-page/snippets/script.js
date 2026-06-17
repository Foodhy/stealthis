(function () {
  "use strict";

  // ---------- data (fictional) ----------
  var TYPE_LABEL = { gala: "Gala", run: "Run", drive: "Drive", workshop: "Workshop" };
  var MONTHS = ["January","February","March","April","May","June","July",
    "August","September","October","November","December"];

  // All events live in June 2026 so the calendar lands on a populated month.
  var EVENTS = [
    { id: "e1", type: "gala", title: "Riverlight Benefit Gala", date: "2026-06-06",
      time: "7:00 PM", loc: "The Old Mill Ballroom", desc: "Black-tie dinner & live auction to fund winter shelter beds.",
      capacity: 220, taken: 198 },
    { id: "e2", type: "run", title: "Hope Riverside 10K", date: "2026-06-13",
      time: "8:00 AM", loc: "Mill Race Park, North Gate", desc: "Family-friendly 10K & 2K — every entry feeds a child for a week.",
      capacity: 600, taken: 412 },
    { id: "e3", type: "drive", title: "Summer Pantry Food Drive", date: "2026-06-17",
      time: "10:00 AM", loc: "Riverline Community Hub", desc: "Drop off staples or volunteer to sort 8,000 meal kits.",
      capacity: 80, taken: 80 },
    { id: "e4", type: "workshop", title: "Budgeting & Benefits Workshop", date: "2026-06-20",
      time: "2:00 PM", loc: "Larkfield Library, Room B", desc: "Free guided session helping neighbors navigate aid programs.",
      capacity: 40, taken: 33 },
    { id: "e5", type: "drive", title: "Back-to-School Backpack Drive", date: "2026-06-24",
      time: "9:00 AM", loc: "Greenway Coffee Co.", desc: "Sponsor or assemble backpacks for 500 students.",
      capacity: 120, taken: 71 },
    { id: "e6", type: "gala", title: "Donor Appreciation Evening", date: "2026-06-27",
      time: "6:30 PM", loc: "Riverline Gardens Terrace", desc: "An intimate thank-you for our monthly giving circle.",
      capacity: 90, taken: 64 },
    { id: "e7", type: "workshop", title: "Volunteer Leadership Lab", date: "2026-06-28",
      time: "11:00 AM", loc: "Riverline Community Hub", desc: "Hands-on training for crew leads ahead of the summer push.",
      capacity: 50, taken: 22 }
  ];

  // ---------- elements ----------
  var grid = document.getElementById("eventGrid");
  var emptyState = document.getElementById("emptyState");
  var listView = document.getElementById("listView");
  var calendarView = document.getElementById("calendarView");
  var calGrid = document.getElementById("calGrid");
  var calTitle = document.getElementById("calTitle");
  var toastEl = document.getElementById("toast");

  var activeFilter = "all";
  var rsvped = {}; // id -> true
  var viewDate = new Date(2026, 5, 1); // June 2026

  // ---------- toast helper ----------
  var toastTimer;
  function toast(msg, variant) {
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (variant ? " toast--" + variant : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.className = "toast";
    }, 2600);
  }

  // ---------- helpers ----------
  function dayPart(iso) { return parseInt(iso.slice(8, 10), 10); }
  function shortMonth(iso) { return MONTHS[parseInt(iso.slice(5, 7), 10) - 1].slice(0, 3); }

  function seatState(ev) {
    var left = ev.capacity - ev.taken;
    if (left <= 0) return { left: 0, cls: "is-full", label: "Sold out · join waitlist" };
    if (left <= ev.capacity * 0.12) return { left: left, cls: "is-low", label: left + " spots left" };
    return { left: left, cls: "", label: left + " spots left" };
  }

  // ---------- render list ----------
  function renderList() {
    var rows = EVENTS.filter(function (ev) {
      return activeFilter === "all" || ev.type === activeFilter;
    });

    grid.innerHTML = "";
    emptyState.hidden = rows.length > 0;

    rows.forEach(function (ev) {
      var s = seatState(ev);
      var going = !!rsvped[ev.id];
      var li = document.createElement("li");
      li.className = "card";
      li.id = "card-" + ev.id;

      var btnLabel = going ? "✓ You're going" : (s.left <= 0 ? "Join waitlist" : "RSVP");
      var btnClass = "rsvp" + (going ? " is-going" : "");

      li.innerHTML =
        '<div class="card__photo pg--' + ev.type + '">' +
          '<span class="card__type"><span class="dot dot--' + ev.type + '"></span>' + TYPE_LABEL[ev.type] + '</span>' +
          '<span class="card__date"><b>' + dayPart(ev.date) + '</b><span>' + shortMonth(ev.date) + '</span></span>' +
        '</div>' +
        '<div class="card__body">' +
          '<h3 class="card__title">' + ev.title + '</h3>' +
          '<div class="card__meta">' +
            '<span><i>🕑</i>' + ev.time + '</span>' +
            '<span><i>📍</i>' + ev.loc + '</span>' +
          '</div>' +
          '<p class="card__desc">' + ev.desc + '</p>' +
          '<div class="card__foot">' +
            '<span class="seats ' + s.cls + '" data-seats="' + ev.id + '">' + (going ? "You're confirmed" : s.label) + '</span>' +
            '<button class="' + btnClass + '" type="button" data-rsvp="' + ev.id + '">' + btnLabel + '</button>' +
          '</div>' +
        '</div>';
      grid.appendChild(li);
    });
  }

  // ---------- RSVP ----------
  function handleRsvp(id) {
    var ev = EVENTS.find(function (e) { return e.id === id; });
    if (!ev) return;
    var s = seatState(ev);

    if (rsvped[id]) {
      rsvped[id] = false;
      ev.taken = Math.max(0, ev.taken - 1);
      toast("RSVP cancelled for " + ev.title, "warn");
    } else if (s.left <= 0) {
      rsvped[id] = true;
      toast("Added to the waitlist for " + ev.title + " — we'll be in touch!", "ok");
    } else {
      rsvped[id] = true;
      ev.taken += 1;
      toast("You're going to " + ev.title + "! See you on the " + dayPart(ev.date) + "th.", "ok");
    }
    renderList();
  }

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-rsvp]");
    if (btn) handleRsvp(btn.getAttribute("data-rsvp"));
  });

  // ---------- filters ----------
  document.querySelector(".filters").addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    activeFilter = chip.getAttribute("data-filter");
    document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
    chip.classList.add("is-active");
    renderList();
    if (!calendarView.hidden) renderCalendar();
  });

  // ---------- view toggle ----------
  document.querySelector(".viewtoggle").addEventListener("click", function (e) {
    var seg = e.target.closest(".seg");
    if (!seg) return;
    var view = seg.getAttribute("data-view");
    document.querySelectorAll(".seg").forEach(function (s) {
      var on = s === seg;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var calendar = view === "calendar";
    listView.hidden = calendar;
    calendarView.hidden = !calendar;
    if (calendar) renderCalendar();
  });

  // ---------- calendar ----------
  function eventsForFilter() {
    return EVENTS.filter(function (ev) {
      return activeFilter === "all" || ev.type === activeFilter;
    });
  }

  function renderCalendar() {
    var year = viewDate.getFullYear();
    var month = viewDate.getMonth();
    calTitle.textContent = MONTHS[month] + " " + year;

    var firstDow = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = new Date(2026, 5, 17); // demo "today" = Jun 17 2026

    // map day -> events
    var byDay = {};
    eventsForFilter().forEach(function (ev) {
      var d = new Date(ev.date + "T00:00:00");
      if (d.getFullYear() === year && d.getMonth() === month) {
        var k = d.getDate();
        (byDay[k] = byDay[k] || []).push(ev);
      }
    });

    calGrid.innerHTML = "";
    for (var i = 0; i < firstDow; i++) {
      var blank = document.createElement("div");
      blank.className = "day day--empty";
      calGrid.appendChild(blank);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var evs = byDay[d] || [];
      var has = evs.length > 0;
      var cell = document.createElement(has ? "button" : "div");
      cell.className = "day" + (has ? " day--has" : "");
      if (has) cell.type = "button";

      var isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
      if (isToday) cell.classList.add("day--today");

      var dots = "";
      var seen = {};
      evs.forEach(function (ev) {
        if (seen[ev.type]) return;
        seen[ev.type] = true;
        dots += '<span class="dot dot--' + ev.type + '"></span>';
      });

      cell.innerHTML =
        '<span class="day__n">' + d + '</span>' +
        (has ? '<span class="day__dots">' + dots + '</span>' : '') +
        (has ? '<span class="day__count">' + evs.length + (evs.length > 1 ? " events" : " event") + '</span>' : '');

      if (has) {
        cell.setAttribute("aria-label",
          MONTHS[month] + " " + d + ", " + evs.length + " event" + (evs.length > 1 ? "s" : ""));
        (function (list, dayNum) {
          cell.addEventListener("click", function () {
            jumpToDayInList(list, dayNum);
          });
        })(evs, d);
      }
      calGrid.appendChild(cell);
    }
  }

  function jumpToDayInList(evs, dayNum) {
    var names = evs.map(function (e) { return e.title; }).join(" · ");
    toast(evs.length + " event" + (evs.length > 1 ? "s" : "") + " on the " + dayNum + "th: " + names);
    // switch to list and scroll to the first event of that day
    document.querySelector('.seg[data-view="list"]').click();
    var first = evs[0];
    setTimeout(function () {
      var card = document.getElementById("card-" + first.id);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.style.outline = "3px solid var(--accent)";
        card.style.outlineOffset = "2px";
        setTimeout(function () { card.style.outline = ""; }, 1800);
      }
    }, 60);
  }

  document.getElementById("prevMonth").addEventListener("click", function () {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("nextMonth").addEventListener("click", function () {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar();
  });

  // ---------- donate buttons ----------
  document.querySelectorAll("[data-donate]").forEach(function (b) {
    b.addEventListener("click", function () {
      toast("Thank you! In a live site this opens secure checkout. 💛", "ok");
    });
  });

  // ---------- animated counters ----------
  function animateCounters() {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var start = performance.now();
      var dur = 1300;
      function step(now) {
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // ---------- thermometer fill ----------
  function fillThermo() {
    var fill = document.getElementById("thermoFill");
    if (fill) requestAnimationFrame(function () { fill.style.width = (93400 / 120000 * 100) + "%"; });
  }

  // ---------- init ----------
  renderList();
  animateCounters();
  fillThermo();
})();
