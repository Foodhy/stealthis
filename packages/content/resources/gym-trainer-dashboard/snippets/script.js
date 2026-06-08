(function () {
  "use strict";

  /* ---------- Data ---------- */
  var AVATARS = ["#c6ff3a", "#ff6a2b", "#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa"];

  function initials(name) {
    return name
      .split(" ")
      .map(function (p) { return p[0]; })
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  function avColor(name) {
    var sum = 0;
    for (var i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return AVATARS[sum % AVATARS.length];
  }

  var sessions = [
    {
      id: "s1", start: "06:00", end: "07:00", type: "pt", title: "Strength PT — Daniel Cho",
      sub: "1-on-1 · Lower body power", focus: "Back squat, RDL, sled push",
      location: "Rack 2", goal: "PR test on squat", notes: "Cue bracing on the descent; tape last set.",
      done: false
    },
    {
      id: "s2", start: "07:00", end: "07:45", type: "assessment", title: "Movement Screen — Priya Nair",
      sub: "New member · FMS baseline", focus: "Overhead squat, hip mobility",
      location: "Assess Bay", goal: "Establish baseline + flags", notes: "Suspected left ankle restriction — note for plan.",
      done: false
    },
    {
      id: "s3", start: "08:00", end: "08:50", type: "group", title: "Power Hour — HIIT",
      sub: "Group · 12 booked", focus: "Conditioning circuit",
      location: "Studio A", goal: "Avg HR zone 4", notes: "Two scaling options on the board for beginners.",
      done: false
    },
    {
      id: "s4", start: "09:00", end: "10:00", type: "pt", title: "Hypertrophy PT — Marcus Lin",
      sub: "1-on-1 · Push day", focus: "Bench, incline DB, dips",
      location: "Rack 1", goal: "Volume +5% vs last week", notes: "He's deloading next week — keep RPE under 8.",
      done: false
    },
    {
      id: "s5", start: "10:30", end: "11:15", type: "assessment", title: "Progress Check — Aisha Bello",
      sub: "Re-assessment · Week 8", focus: "Body comp + lifts review",
      location: "Assess Bay", goal: "Compare to month-1 numbers", notes: "Bring InBody printout; update macros.",
      done: false
    },
    {
      id: "s6", start: "12:00", end: "12:50", type: "group", title: "Lunch Express — Mobility",
      sub: "Group · 8 booked", focus: "Mobility + core",
      location: "Studio B", goal: "Active recovery", notes: "Low-impact only; mats out beforehand.",
      done: false
    },
    {
      id: "s7", start: "16:00", end: "17:00", type: "pt", title: "Athletic PT — Sofia Mendes",
      sub: "1-on-1 · Speed & agility", focus: "Sprints, plyo, change of direction",
      location: "Turf", goal: "10m split improvement", notes: "Long warm-up — she had a tight hamstring Friday.",
      done: false
    },
    {
      id: "s8", start: "17:30", end: "18:20", type: "group", title: "Evening Burn — Strength Circuit",
      sub: "Group · 15 booked", focus: "Full body strength",
      location: "Studio A", goal: "Hit all stations twice", notes: "Cap class at 16 — waitlist has 3.",
      done: false
    }
  ];

  var clients = [
    { name: "Daniel Cho", next: "Today · 6:00 AM", adh: 96 },
    { name: "Sofia Mendes", next: "Today · 4:00 PM", adh: 91 },
    { name: "Marcus Lin", next: "Today · 9:00 AM", adh: 88 },
    { name: "Aisha Bello", next: "Today · 10:30 AM", adh: 82 },
    { name: "Priya Nair", next: "Today · 7:00 AM", adh: 100 },
    { name: "Tomás Rivera", next: "Wed · 6:30 AM", adh: 74 },
    { name: "Hannah Webb", next: "Thu · 5:30 PM", adh: 67 },
    { name: "Leo Karlsson", next: "Fri · 8:00 AM", adh: 58 },
    { name: "Naomi Park", next: "Sat · 9:00 AM", adh: 93 },
    { name: "Owen Fletcher", next: "No session booked", adh: 41 }
  ];

  var tasks = [
    { id: "t1", title: "Send 4-week strength block", sub: "Daniel Cho", tag: "program", done: false },
    { id: "t2", title: "Weekly check-in message", sub: "Hannah Webb · 5 days overdue", tag: "checkin", done: false },
    { id: "t3", title: "Build mobility program", sub: "Aisha Bello", tag: "program", done: false },
    { id: "t4", title: "Re-engage lapsed member", sub: "Owen Fletcher · 41% adherence", tag: "checkin", done: false },
    { id: "t5", title: "Share nutrition guide", sub: "Priya Nair (new member)", tag: "program", done: false }
  ];

  /* ---------- Toast ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      el.addEventListener("animationend", function () { el.remove(); });
    }, 2600);
  }

  /* ---------- Timeline ---------- */
  var timelineEl = document.getElementById("timeline");
  var TYPE_LABEL = { pt: "PT", group: "Group", assessment: "Assess" };
  var CHEV = '<svg class="t-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

  function renderTimeline() {
    timelineEl.innerHTML = "";
    sessions.forEach(function (s) {
      var li = document.createElement("li");
      li.className = "t-item";
      li.dataset.type = s.type;

      li.innerHTML =
        '<div class="t-time"><span class="t-start">' + s.start + '</span><span class="t-end">' + s.end + '</span></div>' +
        '<div class="t-card type-' + s.type + (s.done ? " is-done" : "") + '" data-id="' + s.id + '">' +
          '<button class="t-trigger" aria-expanded="false">' +
            '<div class="t-main">' +
              '<div class="t-row1"><span class="t-title">' + s.title + '</span>' +
                '<span class="t-badge">' + TYPE_LABEL[s.type] + '</span></div>' +
              '<div class="t-sub">' + s.sub + '</div>' +
            '</div>' + CHEV +
          '</button>' +
          '<div class="t-detail"><div class="t-detail-inner">' +
            '<dl class="t-meta-grid">' +
              '<div class="t-meta"><dt>Focus</dt><dd>' + s.focus + '</dd></div>' +
              '<div class="t-meta"><dt>Location</dt><dd>' + s.location + '</dd></div>' +
              '<div class="t-meta"><dt>Goal</dt><dd>' + s.goal + '</dd></div>' +
            '</dl>' +
            '<p class="t-notes">' + s.notes + '</p>' +
            '<div class="t-actions">' +
              '<button class="btn btn-primary act-done">' + (s.done ? "Mark not done" : "Mark complete") + '</button>' +
              '<button class="btn act-msg">Message client</button>' +
            '</div>' +
          '</div></div>' +
        '</div>';

      timelineEl.appendChild(li);
    });
  }

  timelineEl.addEventListener("click", function (e) {
    var card = e.target.closest(".t-card");
    if (!card) return;
    var id = card.dataset.id;
    var data = sessions.find(function (x) { return x.id === id; });

    if (e.target.closest(".act-done")) {
      data.done = !data.done;
      card.classList.toggle("is-done", data.done);
      var btn = card.querySelector(".act-done");
      btn.textContent = data.done ? "Mark not done" : "Mark complete";
      toast(data.done ? "Session marked complete ✓" : "Session reopened");
      return;
    }
    if (e.target.closest(".act-msg")) {
      toast("Message drafted to " + data.title.split("—")[1].trim());
      return;
    }
    if (e.target.closest(".t-trigger")) {
      var open = card.classList.toggle("is-open");
      card.querySelector(".t-trigger").setAttribute("aria-expanded", open ? "true" : "false");
    }
  });

  /* ---------- Segmented filter ---------- */
  var segBtns = document.querySelectorAll(".seg-btn");
  segBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      segBtns.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-selected", "true");
      var f = b.dataset.filter;
      var shown = 0;
      document.querySelectorAll(".t-item").forEach(function (item) {
        var match = f === "all" || item.dataset.type === f;
        item.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      document.getElementById("kpiSessions").textContent = f === "all" ? sessions.length : shown;
    });
  });

  /* ---------- Clients ---------- */
  var clientsEl = document.getElementById("clients");
  function adhClass(v) {
    return v >= 85 ? "adh-hi" : v >= 65 ? "adh-mid" : "adh-lo";
  }
  function renderClients() {
    clientsEl.innerHTML = "";
    clients.forEach(function (c) {
      var li = document.createElement("li");
      li.className = "c-item " + adhClass(c.adh);
      li.dataset.name = c.name.toLowerCase();
      li.tabIndex = 0;
      li.innerHTML =
        '<div class="c-av" style="background:' + avColor(c.name) + '">' + initials(c.name) + '</div>' +
        '<div class="c-main"><div class="c-name">' + c.name + '</div>' +
          '<div class="c-next">' + c.next + '</div></div>' +
        '<div class="c-adh"><span class="c-adh-val">' + c.adh + '%</span>' +
          '<div class="c-adh-bar"><div class="c-adh-fill" style="width:' + c.adh + '%"></div></div></div>';
      var open = function () { toast(c.name + " · " + c.adh + "% adherence · " + c.next); };
      li.addEventListener("click", open);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
      clientsEl.appendChild(li);
    });
  }

  var searchEl = document.getElementById("clientSearch");
  searchEl.addEventListener("input", function () {
    var q = searchEl.value.trim().toLowerCase();
    var shown = 0;
    document.querySelectorAll(".c-item").forEach(function (item) {
      var match = item.dataset.name.indexOf(q) !== -1;
      item.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    var existing = clientsEl.querySelector(".empty");
    if (shown === 0 && !existing) {
      var p = document.createElement("li");
      p.className = "empty";
      p.textContent = "No clients match “" + searchEl.value + "”";
      clientsEl.appendChild(p);
    } else if (shown > 0 && existing) {
      existing.remove();
    }
  });

  /* ---------- Tasks ---------- */
  var tasksEl = document.getElementById("tasks");
  var taskCountEl = document.getElementById("taskCount");
  var CHECK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var TAG_LABEL = { program: "Program", checkin: "Check-in" };

  function updateTaskCount() {
    var due = tasks.filter(function (t) { return !t.done; }).length;
    taskCountEl.textContent = due + " due";
    taskCountEl.style.display = due === 0 ? "none" : "";
  }

  function renderTasks() {
    tasksEl.innerHTML = "";
    tasks.forEach(function (t) {
      var li = document.createElement("li");
      li.className = "task" + (t.done ? " is-done" : "");
      li.dataset.id = t.id;
      li.innerHTML =
        '<button class="task-check" aria-pressed="' + t.done + '" aria-label="Mark done">' + CHECK + '</button>' +
        '<div class="task-main"><div class="task-title">' + t.title + '</div>' +
          '<div class="task-sub">' + t.sub + '</div></div>' +
        '<span class="task-tag tag-' + t.tag + '">' + TAG_LABEL[t.tag] + '</span>';
      tasksEl.appendChild(li);
    });
    updateTaskCount();
  }

  tasksEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".task-check");
    if (!btn) return;
    var li = btn.closest(".task");
    var t = tasks.find(function (x) { return x.id === li.dataset.id; });
    t.done = !t.done;
    li.classList.toggle("is-done", t.done);
    btn.setAttribute("aria-pressed", String(t.done));
    if (t.done) toast("Done: " + t.title);
    updateTaskCount();
  });

  /* ---------- Boot ---------- */
  renderTimeline();
  renderClients();
  renderTasks();
})();
