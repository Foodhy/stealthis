(function () {
  "use strict";

  // ---- Demo data: events keyed by ISO date (June 2026) ----
  // Each event: id, time, title, cat, location, capacity, taken, desc
  var CATS = {
    talk: "Talk",
    tour: "Tour",
    workshop: "Workshop",
    family: "Family",
    members: "Members"
  };

  var EVENTS = {
    "2026-06-02": [
      { id: "e1", time: "18:30", title: "Curator's Talk: Northern Light", cat: "talk", location: "Auditorium B", capacity: 120, taken: 86, desc: "Senior curator Dr. Iris Vahl on the luminist landscapes of Greta Søndergaard (1841–1903), cat. no. NL-217." },
      { id: "e2", time: "11:00", title: "Highlights Tour", cat: "tour", location: "Meet at Atrium", capacity: 18, taken: 14, desc: "A 60-minute walk through the permanent collection — twelve works, five centuries." }
    ],
    "2026-06-05": [
      { id: "e3", time: "10:30", title: "Drawing from the Cast Hall", cat: "workshop", location: "Studio 3", capacity: 16, taken: 16, desc: "Graphite study session among the plaster casts. Materials provided. Led by artist-in-residence M. Okafor." }
    ],
    "2026-06-07": [
      { id: "e4", time: "14:00", title: "Family Sunday: Color & Clay", cat: "family", location: "Learning Lab", capacity: 40, taken: 22, desc: "Hands-on making for ages 5–11 inspired by the ceramics gallery. Caregivers welcome." },
      { id: "e5", time: "16:00", title: "Gallery Talk: Reading a Still Life", cat: "talk", location: "Gallery 9", capacity: 30, taken: 11, desc: "Twenty minutes with one painting — Almeida's 'Quinces and Pewter,' 1672, cat. no. ST-044." }
    ],
    "2026-06-11": [
      { id: "e6", time: "12:30", title: "Lunchtime Tour: Modern Wing", cat: "tour", location: "Meet at Gallery 14", capacity: 18, taken: 6, desc: "Postwar abstraction in forty minutes, from Reyes to the Verda Group." }
    ],
    "2026-06-13": [
      { id: "e7", time: "19:00", title: "Members' Preview: After Dusk", cat: "members", location: "East Galleries", capacity: 90, taken: 71, desc: "First look at the summer exhibition with sparkling wine. Membership card required at entry." },
      { id: "e8", time: "10:00", title: "Watercolor Basics", cat: "workshop", location: "Studio 1", capacity: 14, taken: 9, desc: "An introduction to wet-on-wet technique. All levels. Aprons and paper supplied." }
    ],
    "2026-06-15": [
      { id: "e9", time: "13:00", title: "Conservation in Focus", cat: "talk", location: "Auditorium B", capacity: 120, taken: 33, desc: "Head conservator Lena Brandt on relining a 17th-century canvas — before-and-after imaging." }
    ],
    "2026-06-18": [
      { id: "e10", time: "11:00", title: "Architecture Walk", cat: "tour", location: "Front Steps", capacity: 20, taken: 18, desc: "The 1908 Beaux-Arts hall and its 2014 glass annex, with the building archivist." },
      { id: "e11", time: "15:30", title: "Print Workshop: Monotype", cat: "workshop", location: "Studio 3", capacity: 12, taken: 4, desc: "Pull a one-of-a-kind print on the studio press. Ages 16+." }
    ],
    "2026-06-20": [
      { id: "e12", time: "14:00", title: "Family Saturday: Mask Making", cat: "family", location: "Learning Lab", capacity: 40, taken: 38, desc: "Inspired by the masks of the Oceania gallery. Drop-in, ages 4–10." }
    ],
    "2026-06-22": [
      { id: "e13", time: "18:00", title: "Evening Lecture: The Painted Letter", cat: "talk", location: "Auditorium A", capacity: 200, taken: 124, desc: "Visiting scholar Prof. H. Marchetti on text and image in Renaissance portraiture." }
    ],
    "2026-06-25": [
      { id: "e14", time: "19:30", title: "Members' Late Night", cat: "members", location: "Whole Museum", capacity: 150, taken: 60, desc: "Galleries open till 22:00, live cello in the Atrium, cash bar. Bring a guest." },
      { id: "e15", time: "11:30", title: "Sketching the Sculpture Court", cat: "workshop", location: "Sculpture Court", capacity: 16, taken: 7, desc: "Open-air drawing among the bronzes. Bring your own sketchbook; pencils available." }
    ],
    "2026-06-28": [
      { id: "e16", time: "14:00", title: "Family Sunday: Story Trail", cat: "family", location: "Galleries 1–6", capacity: 50, taken: 19, desc: "A guided story trail through six galleries with our museum educators." },
      { id: "e17", time: "16:30", title: "Closing Tour: After Dusk", cat: "tour", location: "East Galleries", capacity: 18, taken: 10, desc: "A last look at the summer show before it travels onward." }
    ]
  };

  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var WEEKDAYS_LONG = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  // ---- State ----
  var view = new Date(2026, 5, 1); // June 2026
  var today = new Date(2026, 5, 15); // demo "today"
  var selectedKey = null;
  var activeCat = "all";
  var mode = "calendar";

  // ---- DOM ----
  var grid = document.getElementById("grid");
  var monthLabel = document.getElementById("monthLabel");
  var panelDate = document.getElementById("panelDate");
  var panelBody = document.getElementById("panelBody");
  var calendarView = document.getElementById("calendarView");
  var listView = document.getElementById("listView");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function key(y, m, d) {
    return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }
  function pad(n) { return String(n).padStart(2, "0"); }

  function eventsFor(k) {
    var list = EVENTS[k] || [];
    if (activeCat === "all") return list;
    return list.filter(function (e) { return e.cat === activeCat; });
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  // ---- Render calendar grid ----
  function renderGrid() {
    var y = view.getFullYear();
    var m = view.getMonth();
    monthLabel.textContent = MONTHS[m] + " " + y;
    grid.innerHTML = "";

    var first = new Date(y, m, 1).getDay();
    var days = new Date(y, m + 1, 0).getDate();

    for (var i = 0; i < first; i++) {
      var blank = document.createElement("div");
      blank.className = "cell empty";
      grid.appendChild(blank);
    }

    for (var d = 1; d <= days; d++) {
      var k = key(y, m, d);
      var list = eventsFor(k);
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      var isToday = (y === today.getFullYear() && m === today.getMonth() && d === today.getDate());
      if (isToday) cell.classList.add("today");
      if (k === selectedKey) cell.classList.add("selected");
      cell.setAttribute("aria-label", WEEKDAYS_LONG[new Date(y, m, d).getDay()] + " " + MONTHS[m] + " " + d + ", " + list.length + " events");

      var num = document.createElement("span");
      num.className = "num";
      num.textContent = d;
      cell.appendChild(num);

      if (list.length) {
        var dots = document.createElement("span");
        dots.className = "dots";
        var shown = list.slice(0, 4);
        shown.forEach(function (e) {
          var dot = document.createElement("span");
          dot.className = "dot dot-" + e.cat;
          dot.title = CATS[e.cat];
          dots.appendChild(dot);
        });
        if (list.length > 4) {
          var more = document.createElement("span");
          more.className = "more";
          more.textContent = "+" + (list.length - 4);
          dots.appendChild(more);
        }
        cell.appendChild(dots);
      }

      (function (kk) {
        cell.addEventListener("click", function () { selectDay(kk); });
      })(k);

      grid.appendChild(cell);
    }
  }

  // ---- Select a day -> panel ----
  function selectDay(k) {
    selectedKey = k;
    renderGrid();
    var parts = k.split("-").map(Number);
    var dt = new Date(parts[0], parts[1] - 1, parts[2]);
    panelDate.textContent = WEEKDAYS_LONG[dt.getDay()] + ", " + MONTHS[dt.getMonth()] + " " + parts[2];

    var list = eventsFor(k);
    panelBody.innerHTML = "";
    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "panel-empty";
      empty.textContent = activeCat === "all"
        ? "No public programs scheduled this day. The galleries are open 10–6."
        : "No " + CATS[activeCat].toLowerCase() + " programs this day. Try “All programs.”";
      panelBody.appendChild(empty);
      return;
    }
    list.slice().sort(function (a, b) { return a.time.localeCompare(b.time); })
      .forEach(function (e) { panelBody.appendChild(eventCard(e)); });
  }

  // ---- Event card ----
  function eventCard(e) {
    var left = e.capacity - e.taken;
    var card = document.createElement("article");
    card.className = "event cat-" + e.cat;

    var top = document.createElement("div");
    top.className = "event-top";
    var time = document.createElement("span");
    time.className = "event-time";
    time.textContent = e.time;
    var badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = CATS[e.cat];
    top.appendChild(time);
    top.appendChild(badge);
    card.appendChild(top);

    var title = document.createElement("h4");
    title.className = "event-title";
    title.textContent = e.title;
    card.appendChild(title);

    var meta = document.createElement("p");
    meta.className = "event-meta";
    meta.innerHTML = "📍 " + escapeHtml(e.location) + " <span class='sep'>·</span> " + e.capacity + " seats";
    card.appendChild(meta);

    var desc = document.createElement("p");
    desc.className = "event-desc";
    desc.textContent = e.desc;
    card.appendChild(desc);

    var foot = document.createElement("div");
    foot.className = "event-foot";

    var seatsWrap = document.createElement("div");
    var seats = document.createElement("div");
    seats.className = "seats";
    var bar = document.createElement("div");
    bar.className = "seatbar";
    var fill = document.createElement("i");
    bar.appendChild(fill);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rsvp-btn";

    function refreshSeats() {
      var rem = e.capacity - e.taken;
      var pct = Math.round((e.taken / e.capacity) * 100);
      fill.style.width = pct + "%";
      var lvl = rem === 0 ? "full" : rem <= Math.max(3, e.capacity * 0.15) ? "low" : "";
      seats.className = "seats" + (lvl ? " " + lvl : "");
      bar.className = "seatbar" + (lvl ? " " + lvl : "");
      seats.innerHTML = rem === 0
        ? "<strong>Fully booked</strong> · " + e.capacity + " seats"
        : "<strong>" + rem + "</strong> of " + e.capacity + " seats left";
    }

    function refreshBtn() {
      if (e.reserved) {
        btn.textContent = "Reserved ✓";
        btn.classList.add("reserved");
        btn.disabled = false;
        btn.setAttribute("aria-label", "Cancel reservation for " + e.title);
      } else if (e.capacity - e.taken === 0) {
        btn.textContent = "Join waitlist";
        btn.classList.remove("reserved");
        btn.disabled = false;
      } else {
        btn.textContent = "Reserve seat";
        btn.classList.remove("reserved");
        btn.disabled = false;
      }
    }

    btn.addEventListener("click", function () {
      if (e.reserved) {
        e.reserved = false;
        e.taken = Math.max(0, e.taken - 1);
        toast("Reservation cancelled — " + e.title);
      } else if (e.capacity - e.taken === 0) {
        toast("Added to the waitlist for " + e.title);
        return;
      } else {
        e.reserved = true;
        e.taken += 1;
        toast("Seat reserved — " + e.title + " at " + e.time);
      }
      refreshSeats();
      refreshBtn();
      renderGrid();
    });

    refreshSeats();
    refreshBtn();
    seatsWrap.appendChild(seats);
    seatsWrap.appendChild(bar);
    foot.appendChild(seatsWrap);
    foot.appendChild(btn);
    card.appendChild(foot);
    return card;
  }

  // ---- List view ----
  function renderList() {
    var y = view.getFullYear();
    var m = view.getMonth();
    listView.innerHTML = "";
    var keys = Object.keys(EVENTS).filter(function (k) {
      var p = k.split("-").map(Number);
      return p[0] === y && p[1] - 1 === m && eventsFor(k).length;
    }).sort();

    if (!keys.length) {
      var empty = document.createElement("p");
      empty.className = "list-empty";
      empty.textContent = "No programs match this filter in " + MONTHS[m] + ".";
      listView.appendChild(empty);
      return;
    }

    keys.forEach(function (k) {
      var p = k.split("-").map(Number);
      var dt = new Date(p[0], p[1] - 1, p[2]);
      var head = document.createElement("div");
      head.className = "list-day-head";
      head.textContent = WEEKDAYS_LONG[dt.getDay()] + ", " + MONTHS[dt.getMonth()] + " " + p[2];
      listView.appendChild(head);

      eventsFor(k).slice().sort(function (a, b) { return a.time.localeCompare(b.time); })
        .forEach(function (e) {
          var c = eventCard(e);
          c.classList.add("list-card");
          listView.appendChild(c);
        });
    });
  }

  function rerender() {
    if (mode === "calendar") {
      renderGrid();
      if (selectedKey) selectDay(selectedKey);
    } else {
      renderList();
    }
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---- Wiring ----
  document.getElementById("prevMonth").addEventListener("click", function () {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    selectedKey = null;
    resetPanel();
    rerender();
  });
  document.getElementById("nextMonth").addEventListener("click", function () {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    selectedKey = null;
    resetPanel();
    rerender();
  });
  document.getElementById("todayBtn").addEventListener("click", function () {
    view = new Date(today.getFullYear(), today.getMonth(), 1);
    rerender();
    selectDay(key(today.getFullYear(), today.getMonth(), today.getDate()));
  });

  function resetPanel() {
    panelDate.textContent = "Select a day";
    panelBody.innerHTML = '<p class="panel-empty">Choose a date on the calendar to see talks, tours and workshops scheduled that day.</p>';
  }

  var calBtn = document.getElementById("calViewBtn");
  var listBtn = document.getElementById("listViewBtn");
  calBtn.addEventListener("click", function () {
    mode = "calendar";
    calBtn.classList.add("active"); listBtn.classList.remove("active");
    calBtn.setAttribute("aria-selected", "true"); listBtn.setAttribute("aria-selected", "false");
    calendarView.hidden = false; listView.hidden = true;
    rerender();
  });
  listBtn.addEventListener("click", function () {
    mode = "list";
    listBtn.classList.add("active"); calBtn.classList.remove("active");
    listBtn.setAttribute("aria-selected", "true"); calBtn.setAttribute("aria-selected", "false");
    calendarView.hidden = true; listView.hidden = false;
    rerender();
  });

  Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (chip) {
    chip.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeCat = chip.getAttribute("data-cat");
      rerender();
    });
  });

  // ---- Init ----
  renderGrid();
  selectDay(key(today.getFullYear(), today.getMonth(), today.getDate()));
})();
