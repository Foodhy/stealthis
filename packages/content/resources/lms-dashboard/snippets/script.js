(function () {
  "use strict";

  /* ---------- Data (fictional) ---------- */
  var courses = [
    {
      id: "c1", title: "Designing Calm Interfaces", cat: "UX Design",
      inst: "Priya Raman", thumb: "🎨", grad: ["#5b5bd6", "#8b8bf0"],
      diff: "intermediate", done: 14, total: 22, status: "progress", time: "1h 10m left",
    },
    {
      id: "c2", title: "JavaScript Patterns in Depth", cat: "Engineering",
      inst: "Dario Voss", thumb: "⚡", grad: ["#f59e0b", "#fb923c"],
      diff: "advanced", done: 9, total: 18, status: "progress", time: "2h 40m left",
    },
    {
      id: "c3", title: "Intro to Data Storytelling", cat: "Analytics",
      inst: "Lena Hoffmann", thumb: "📊", grad: ["#13b981", "#34d399"],
      diff: "beginner", done: 6, total: 12, status: "progress", time: "55m left",
    },
    {
      id: "c4", title: "Mindful Productivity", cat: "Wellbeing",
      inst: "Theo Almeida", thumb: "🌿", grad: ["#0ea5e9", "#38bdf8"],
      diff: "beginner", done: 3, total: 10, status: "progress", time: "1h 25m left",
    },
    {
      id: "c5", title: "Color Theory Foundations", cat: "UX Design",
      inst: "Priya Raman", thumb: "🖌️", grad: ["#ec4899", "#f472b6"],
      diff: "beginner", done: 16, total: 16, status: "completed", time: "Finished Apr 28",
    },
    {
      id: "c6", title: "CSS Grid & Flexbox Mastery", cat: "Engineering",
      inst: "Dario Voss", thumb: "▦", grad: ["#5b5bd6", "#7c7cf0"],
      diff: "intermediate", done: 20, total: 20, status: "completed", time: "Finished May 12",
    },
    {
      id: "c7", title: "Public Speaking Essentials", cat: "Communication",
      inst: "Amara Bello", thumb: "🎤", grad: ["#f43f5e", "#fb7185"],
      diff: "beginner", done: 9, total: 9, status: "completed", time: "Finished May 30",
    },
  ];

  var certificates = [
    { title: "Color Theory Foundations", date: "Apr 28, 2026", id: "LUM-7741" },
    { title: "CSS Grid & Flexbox Mastery", date: "May 12, 2026", id: "LUM-8123" },
    { title: "Public Speaking Essentials", date: "May 30, 2026", id: "LUM-8540" },
    { title: "SQL for Beginners", date: "Mar 09, 2026", id: "LUM-6602" },
  ];

  var deadlines = [
    { day: "17", mon: "Jun", title: "Quiz 3 — JS Patterns", course: "JavaScript Patterns in Depth", tag: "soon", label: "Tomorrow" },
    { day: "19", mon: "Jun", title: "Project: Dashboard redesign", course: "Designing Calm Interfaces", tag: "soon", label: "3 days" },
    { day: "24", mon: "Jun", title: "Peer review submission", course: "Data Storytelling", tag: "week", label: "Next week" },
    { day: "02", mon: "Jul", title: "Final reflection essay", course: "Mindful Productivity", tag: "later", label: "2 weeks" },
  ];

  var CIRC = 2 * Math.PI * 20; // 125.6 for r=20

  /* ---------- Helpers ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  function diffPill(d) {
    var label = d.charAt(0).toUpperCase() + d.slice(1);
    return '<span class="diff-pill diff-' + d + '">' + label + "</span>";
  }

  /* ---------- Render courses ---------- */
  var coursesEl = document.getElementById("courses");
  var currentTab = "progress";

  function renderCourses() {
    var list = courses.filter(function (c) { return c.status === currentTab; });
    coursesEl.innerHTML = list.map(function (c) {
      var pct = Math.round((c.done / c.total) * 100);
      var ringDone = c.status === "completed";
      var ring =
        '<div class="course-ring">' +
          '<svg viewBox="0 0 46 46" width="46" height="46">' +
            '<circle class="cr-track" cx="23" cy="23" r="20"/>' +
            '<circle class="cr-prog' + (ringDone ? " done" : "") + '" cx="23" cy="23" r="20" ' +
              'style="stroke-dashoffset:' + CIRC + '" data-pct="' + pct + '"/>' +
          "</svg>" +
          "<span>" + pct + "%</span>" +
        "</div>";

      var foot = c.status === "completed"
        ? '<span class="completed-badge">✓ Completed</span>' +
          '<button class="btn btn-ghost btn-sm" data-review="' + c.id + '">Review</button>'
        : '<button class="btn btn-brand" data-resume="' + c.id + '">▶ Resume</button>';

      return (
        '<article class="course">' +
          '<div class="course-top">' +
            '<div class="course-thumb" style="background:linear-gradient(135deg,' + c.grad[0] + "," + c.grad[1] + ')">' + c.thumb + "</div>" +
            '<div class="course-info">' +
              '<p class="course-cat">' + c.cat + "</p>" +
              '<h3 class="course-title">' + c.title + "</h3>" +
              '<p class="course-inst">with ' + c.inst + "</p>" +
            "</div>" +
            ring +
          "</div>" +
          '<div class="course-meta">' +
            diffPill(c.diff) +
            '<span class="lessons">' + c.done + " / " + c.total + " lessons · " + c.time + "</span>" +
          "</div>" +
          '<div class="course-foot">' + foot + "</div>" +
        "</article>"
      );
    }).join("");

    // animate rings after paint
    requestAnimationFrame(function () {
      coursesEl.querySelectorAll(".cr-prog").forEach(function (r) {
        var pct = parseFloat(r.getAttribute("data-pct"));
        r.style.strokeDashoffset = CIRC - (CIRC * pct) / 100;
      });
    });
  }

  /* Tabs */
  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (tab.dataset.tab === currentTab) return;
      document.querySelectorAll(".tab").forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      currentTab = tab.dataset.tab;
      renderCourses();
    });
  });

  /* Course buttons (delegated) */
  coursesEl.addEventListener("click", function (e) {
    var resume = e.target.closest("[data-resume]");
    var review = e.target.closest("[data-review]");
    if (resume) {
      var c1 = courses.find(function (c) { return c.id === resume.dataset.resume; });
      toast("Resuming “" + c1.title + "” — lesson " + (c1.done + 1));
    } else if (review) {
      var c2 = courses.find(function (c) { return c.id === review.dataset.review; });
      toast("Opening review for “" + c2.title + "”");
    }
  });

  /* ---------- Certificates ---------- */
  document.getElementById("certList").innerHTML = certificates.map(function (c) {
    return (
      '<li class="cert">' +
        '<span class="cert-seal" aria-hidden="true">🏅</span>' +
        '<div class="cert-body">' +
          "<strong>" + c.title + "</strong>" +
          "<small>Issued " + c.date + " · ID " + c.id + "</small>" +
        "</div>" +
        '<button class="cert-dl" data-cert="' + c.id + '">↓ PDF</button>' +
      "</li>"
    );
  }).join("");

  document.getElementById("certList").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cert]");
    if (b) toast("Preparing certificate " + b.dataset.cert + " for download…");
  });

  /* ---------- Deadlines ---------- */
  document.getElementById("deadlineList").innerHTML = deadlines.map(function (d) {
    return (
      '<li class="deadline">' +
        '<div class="deadline-date"><span class="d-day">' + d.day + '</span><span class="d-mon">' + d.mon + "</span></div>" +
        '<div class="deadline-body"><strong>' + d.title + "</strong><small>" + d.course + "</small></div>" +
        '<span class="deadline-tag tag-' + d.tag + '">' + d.label + "</span>" +
      "</li>"
    );
  }).join("");

  /* ---------- Streak + XP ---------- */
  var streakNum = document.getElementById("streakNum");
  var streakBtn = document.getElementById("streakBtn");
  var flame = document.getElementById("flame");
  var todayDot = document.getElementById("todayDot");
  var xpNum = document.getElementById("xpNum");
  var xpFill = document.getElementById("xpFill");
  var loggedToday = false;
  var xp = 2480;

  streakBtn.addEventListener("click", function () {
    if (loggedToday) return;
    loggedToday = true;

    var streak = parseInt(streakNum.textContent, 10) + 1;
    streakNum.textContent = streak;
    flame.classList.add("pop");
    setTimeout(function () { flame.classList.remove("pop"); }, 600);

    todayDot.classList.add("done", "bump");
    setTimeout(function () { todayDot.classList.remove("bump"); }, 450);

    // bump each day dot in a ripple
    var dots = document.querySelectorAll("#streakWeek .dot");
    dots.forEach(function (d, i) {
      setTimeout(function () {
        d.classList.add("bump");
        setTimeout(function () { d.classList.remove("bump"); }, 450);
      }, i * 70);
    });

    xp += 50;
    var pct = Math.min(100, (xp / 3000) * 100);
    xpNum.textContent = xp.toLocaleString();
    xpFill.style.width = pct + "%";
    xpFill.parentElement.setAttribute("aria-valuenow", String(xp));

    streakBtn.textContent = "✓ Logged";
    streakBtn.classList.add("is-done");
    toast("Streak extended to " + streak + " days! +50 XP 🔥");
  });

  /* ---------- Weekly goal ring ---------- */
  var goalRing = document.getElementById("goalRing");
  var GOAL_CIRC = 2 * Math.PI * 52; // 326.7
  var goalPctVal = 73;
  requestAnimationFrame(function () {
    goalRing.style.strokeDashoffset = GOAL_CIRC - (GOAL_CIRC * goalPctVal) / 100;
  });

  /* ---------- Study mode toggle ---------- */
  var studyToggle = document.getElementById("studyToggle");
  studyToggle.addEventListener("click", function () {
    var on = document.body.classList.toggle("study");
    studyToggle.setAttribute("aria-pressed", String(on));
    studyToggle.textContent = on ? "☀️ Light mode" : "🌙 Study mode";
    toast(on ? "Study mode on — easy on the eyes" : "Light mode on");
  });

  /* ---------- Init ---------- */
  renderCourses();
})();
