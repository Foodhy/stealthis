(function () {
  "use strict";

  // Wedding date — September 12, 2026, 4:00 PM local time.
  var WEDDING = new Date(2026, 8, 12, 16, 0, 0);

  var STAGES = [
    {
      marker: "12",
      title: "Twelve Months Out",
      sub: "The foundation",
      tasks: [
        { text: "Set the overall budget & guest count", tag: "Budget", done: true },
        { text: "Book the ceremony & reception venue", tag: "Venue", done: true },
        { text: "Reserve the wedding planner", tag: "Vendors", done: true },
        { text: "Draft the preliminary guest list", tag: "Guests", done: false },
        { text: "Book photographer & videographer", tag: "Vendors", done: false }
      ]
    },
    {
      marker: "6",
      title: "Six Months Out",
      sub: "The details",
      tasks: [
        { text: "Order the wedding dress & suits", tag: "Attire", done: true },
        { text: "Send save-the-dates", tag: "Stationery", done: false },
        { text: "Choose the florist & palette", tag: "Decor", done: false },
        { text: "Book the caterer & tasting menu", tag: "Catering", done: false },
        { text: "Reserve the honeymoon travel", tag: "Travel", done: false }
      ]
    },
    {
      marker: "1",
      title: "Final Month",
      sub: "The countdown",
      tasks: [
        { text: "Confirm final headcount with caterer", tag: "Catering", done: false },
        { text: "Finalize the seating chart", tag: "Guests", done: false },
        { text: "Pick up rings & attire fittings", tag: "Attire", done: false },
        { text: "Confirm timeline with all vendors", tag: "Vendors", done: false },
        { text: "Pack for the honeymoon", tag: "Travel", done: false }
      ]
    }
  ];

  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6"/></svg>';
  var RING_CIRC = 2 * Math.PI * 52; // r = 52

  var currentFilter = "all";
  var celebrated = false;

  var timelineEl = document.getElementById("timeline");
  var ringEl = document.getElementById("ring");
  var pctEl = document.getElementById("pct");
  var progressText = document.getElementById("progressText");
  var toastEl = document.getElementById("toast");

  // ---------- Toast ----------
  var toastTimer;
  function toast(msg, heart) {
    toastEl.innerHTML = heart ? msg + ' <span class="heart">&#9829;</span>' : msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  // ---------- Build timeline ----------
  function buildTimeline() {
    STAGES.forEach(function (stage, si) {
      var section = document.createElement("section");
      section.className = "stage";
      section.dataset.stage = si;

      var head = document.createElement("div");
      head.className = "stage-head";
      head.innerHTML =
        '<div class="stage-marker" aria-hidden="true">' + stage.marker + "</div>" +
        '<div class="stage-title"><h3>' + stage.title + "</h3><p>" + stage.sub + "</p></div>" +
        '<div class="stage-count" data-count="' + si + '"></div>';
      section.appendChild(head);

      var ul = document.createElement("ul");
      ul.className = "tasks";

      stage.tasks.forEach(function (task, ti) {
        var li = document.createElement("li");
        li.className = "task" + (task.done ? " done" : "");
        li.setAttribute("role", "checkbox");
        li.setAttribute("tabindex", "0");
        li.setAttribute("aria-checked", task.done ? "true" : "false");
        li.dataset.stage = si;
        li.dataset.task = ti;
        li.innerHTML =
          '<span class="box" aria-hidden="true">' + CHECK + "</span>" +
          '<span class="task-text">' + task.text + "</span>" +
          '<span class="task-tag">' + task.tag + "</span>";

        li.addEventListener("click", function () { toggle(si, ti, li); });
        li.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle(si, ti, li);
          }
        });

        ul.appendChild(li);
      });

      section.appendChild(ul);
      timelineEl.appendChild(section);
    });
  }

  // ---------- Toggle a task ----------
  function toggle(si, ti, li) {
    var task = STAGES[si].tasks[ti];
    task.done = !task.done;
    li.classList.toggle("done", task.done);
    li.setAttribute("aria-checked", task.done ? "true" : "false");
    update();
    applyFilter();

    if (task.done && allDone() && !celebrated) {
      celebrated = true;
      toast("Every task complete — you are ready to say I do!", true);
    } else {
      celebrated = celebrated && allDone();
      if (task.done) toast("Nicely done", true);
    }
  }

  function allDone() {
    return STAGES.every(function (s) {
      return s.tasks.every(function (t) { return t.done; });
    });
  }

  // ---------- Progress ----------
  function update() {
    var total = 0, done = 0;
    STAGES.forEach(function (stage, si) {
      var sTotal = stage.tasks.length;
      var sDone = stage.tasks.filter(function (t) { return t.done; }).length;
      total += sTotal;
      done += sDone;
      var countEl = timelineEl.querySelector('[data-count="' + si + '"]');
      if (countEl) countEl.textContent = sDone + " / " + sTotal;
    });

    var pct = total ? Math.round((done / total) * 100) : 0;
    pctEl.textContent = pct;
    ringEl.style.strokeDashoffset = RING_CIRC * (1 - pct / 100);

    var remaining = total - done;
    progressText.textContent = remaining === 0
      ? "All " + total + " tasks complete — the celebration awaits."
      : done + " of " + total + " tasks complete — " + remaining + " to go.";
  }

  // ---------- Filter ----------
  function applyFilter() {
    var tasks = timelineEl.querySelectorAll(".task");
    tasks.forEach(function (li) {
      var isDone = li.classList.contains("done");
      var show = currentFilter === "all" ||
        (currentFilter === "done" && isDone) ||
        (currentFilter === "todo" && !isDone);
      li.hidden = !show;
    });
    // Hide stages that have no visible tasks.
    timelineEl.querySelectorAll(".stage").forEach(function (stage) {
      var anyVisible = stage.querySelector(".task:not([hidden])");
      stage.hidden = !anyVisible;
    });
  }

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      currentFilter = chip.dataset.filter;
      applyFilter();
    });
  });

  // ---------- Countdown ----------
  var els = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    mins: document.getElementById("mins"),
    secs: document.getElementById("secs")
  };

  function pad(n, len) {
    n = String(Math.max(0, n));
    while (n.length < len) n = "0" + n;
    return n;
  }

  function tick() {
    var diff = WEDDING - new Date();
    if (diff < 0) diff = 0;
    var s = Math.floor(diff / 1000);
    var days = Math.floor(s / 86400);
    var hours = Math.floor((s % 86400) / 3600);
    var mins = Math.floor((s % 3600) / 60);
    var secs = s % 60;
    els.days.textContent = pad(days, 3);
    els.hours.textContent = pad(hours, 2);
    els.mins.textContent = pad(mins, 2);
    els.secs.textContent = pad(secs, 2);
  }

  // ---------- Init ----------
  buildTimeline();
  update();
  applyFilter();
  celebrated = allDone();
  tick();
  setInterval(tick, 1000);
})();
