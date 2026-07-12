(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      if (t.parentNode) t.parentNode.removeChild(t);
    }, 3000);
  }

  /* ---------- today's workout: exercise checks + progress ---------- */
  var exList = document.getElementById("exList");
  var exBar = document.getElementById("exBar");
  var exCount = document.getElementById("exCount");
  var statMin = document.getElementById("statMin");
  var streakNum = document.getElementById("streakNum");
  var checks = Array.prototype.slice.call(exList.querySelectorAll(".ex-check"));
  var total = checks.length;

  function refreshProgress() {
    var done = 0;
    checks.forEach(function (c) {
      if (c.classList.contains("on")) done++;
    });
    exBar.style.width = (done / total) * 100 + "%";
    exCount.textContent = done + " / " + total + " done";
    return done;
  }

  checks.forEach(function (c) {
    c.addEventListener("click", function () {
      c.classList.toggle("on");
      c.closest("li").classList.toggle("done", c.classList.contains("on"));
      var done = refreshProgress();
      if (done === total) {
        toast("Every set logged — <b>beast mode</b> 💪");
        finishWorkout();
      }
    });
  });

  /* ---------- start / running / complete flow ---------- */
  var startBtn = document.getElementById("startBtn");
  var workoutTag = document.getElementById("workoutTag");
  var state = "idle"; // idle -> running -> done
  var timerId = null;
  var elapsed = 0;
  var completed = false;

  function fmtClock(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  startBtn.addEventListener("click", function () {
    if (state === "idle") {
      state = "running";
      elapsed = 0;
      startBtn.classList.add("running");
      startBtn.classList.remove("done");
      workoutTag.textContent = "● Live · in progress";
      workoutTag.classList.add("active");
      toast("Session started — <b>let's go!</b>");
      timerId = setInterval(function () {
        elapsed++;
        startBtn.textContent = "Complete · " + fmtClock(elapsed);
        statMin.textContent = Math.max(1, Math.floor(elapsed / 60) + 1);
      }, 1000);
      startBtn.textContent = "Complete · 00:00";
    } else if (state === "running") {
      finishWorkout();
    }
  });

  function finishWorkout() {
    if (completed) return;
    completed = true;
    state = "done";
    if (timerId) clearInterval(timerId);
    startBtn.classList.remove("running");
    startBtn.classList.add("done");
    startBtn.textContent = "✓ Completed";
    startBtn.disabled = false;
    workoutTag.textContent = "Completed today";
    workoutTag.classList.remove("active");
    // mark all exercises done
    checks.forEach(function (c) {
      c.classList.add("on");
      c.closest("li").classList.add("done");
    });
    refreshProgress();
    // bump streak
    var n = parseInt(streakNum.textContent, 10) + 1;
    streakNum.textContent = n;
    bumpGoal();
    toast("Workout complete — streak now <b>" + n + " days</b> 🔥");
  }

  /* ---------- weekly plan strip ---------- */
  var weekStrip = document.getElementById("weekStrip");
  var dayPreview = document.getElementById("dayPreview");
  var days = [
    { dow: "Mon", num: 9, state: "done", focus: "Lower — Strength", meta: ["⏱ 58 min", "5 moves", "Done"] },
    { dow: "Tue", num: 10, state: "done", focus: "Conditioning + Core", meta: ["⏱ 35 min", "HIIT", "Done"] },
    { dow: "Wed", num: 11, state: "today", focus: "Upper Body — Hypertrophy", meta: ["⏱ 52 min", "6 moves", "Today"] },
    { dow: "Thu", num: 12, state: "rest", focus: "Active Recovery — Mobility", meta: ["⏱ 20 min", "Mobility"] },
    { dow: "Fri", num: 13, state: "planned", focus: "Leg Day + Mobility", meta: ["⏱ 60 min", "6 moves", "Studio B"] },
    { dow: "Sat", num: 14, state: "planned", focus: "Full Body Circuit", meta: ["⏱ 45 min", "Circuit"] },
    { dow: "Sun", num: 15, state: "rest", focus: "Rest Day — Walk 8k steps", meta: ["Recovery"] },
  ];

  function selectDay(i) {
    Array.prototype.forEach.call(weekStrip.children, function (el, idx) {
      var on = idx === i;
      el.classList.toggle("active", on);
      el.setAttribute("aria-selected", on ? "true" : "false");
      el.tabIndex = on ? 0 : -1;
    });
    var d = days[i];
    var chips = d.meta
      .map(function (m) {
        return '<span class="chip">' + m + "</span>";
      })
      .join("");
    dayPreview.innerHTML =
      '<div><p class="eyebrow">' +
      d.dow +
      " " +
      d.num +
      '</p><h4>' +
      d.focus +
      "</h4></div>" +
      '<div class="dp-meta">' +
      chips +
      "</div>";
  }

  days.forEach(function (d, i) {
    var btn = document.createElement("button");
    btn.className = "day " + d.state;
    if (d.state === "today") btn.classList.add("today");
    btn.setAttribute("role", "tab");
    btn.tabIndex = -1;
    var mark = d.state === "done" ? "✓" : d.state === "rest" ? "z" : "";
    btn.innerHTML =
      '<span class="dow">' +
      d.dow +
      '</span><span class="dnum">' +
      d.num +
      '</span><span class="dstate">' +
      mark +
      "</span>";
    btn.addEventListener("click", function () {
      selectDay(i);
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var next = e.key === "ArrowRight" ? (i + 1) % days.length : (i - 1 + days.length) % days.length;
        selectDay(next);
        weekStrip.children[next].focus();
      }
    });
    weekStrip.appendChild(btn);
  });
  selectDay(2); // Wednesday today

  /* ---------- progress mini-chart ---------- */
  var metricData = {
    volume: { pts: [8.4, 9.1, 8.8, 10.2, 11.5, 10.9, 12.1], val: "12,480", unit: "kg lifted · this week", delta: "▲ 8.2%", up: true },
    weight: { pts: [72.4, 72.1, 71.8, 71.9, 71.4, 71.2, 70.9], val: "70.9 kg", unit: "body weight · trending down", delta: "▼ 1.5 kg", up: false },
    reps: { pts: [180, 210, 195, 240, 265, 250, 288], val: "288", unit: "total reps · this week", delta: "▲ 11%", up: true },
  };
  var chartLine = document.getElementById("chartLine");
  var chartFill = document.getElementById("chartFill");
  var chartVal = document.getElementById("chartVal");
  var chartUnit = document.getElementById("chartUnit");
  var chartDelta = document.getElementById("chartDelta");
  var svg = document.getElementById("chart");

  // inject gradient def
  var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML =
    '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="rgba(194,245,66,0.30)"/>' +
    '<stop offset="100%" stop-color="rgba(194,245,66,0)"/></linearGradient>';
  svg.insertBefore(defs, svg.firstChild);

  function drawChart(metric) {
    var d = metricData[metric];
    var pts = d.pts;
    var min = Math.min.apply(null, pts);
    var max = Math.max.apply(null, pts);
    var range = max - min || 1;
    var W = 320, H = 120, pad = 10;
    var coords = pts.map(function (p, i) {
      var x = (i / (pts.length - 1)) * (W - pad * 2) + pad;
      var y = H - pad - ((p - min) / range) * (H - pad * 2);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
    chartLine.setAttribute("points", coords.join(" "));
    chartFill.setAttribute("points", pad + "," + (H - pad) + " " + coords.join(" ") + " " + (W - pad) + "," + (H - pad));
    chartVal.textContent = d.val;
    chartUnit.textContent = d.unit;
    chartDelta.textContent = d.delta;
    chartDelta.className = "delta " + (d.up ? "up" : "down");
  }

  var segBtns = Array.prototype.slice.call(document.querySelectorAll(".seg-btn"));
  segBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      segBtns.forEach(function (x) {
        x.classList.remove("active");
        x.setAttribute("aria-selected", "false");
      });
      b.classList.add("active");
      b.setAttribute("aria-selected", "true");
      drawChart(b.dataset.metric);
    });
  });
  drawChart("volume");

  /* ---------- next-session countdown ---------- */
  var cdH = document.getElementById("cdH");
  var cdM = document.getElementById("cdM");
  var cdS = document.getElementById("cdS");
  var target = new Date();
  target.setDate(target.getDate() + 1);
  target.setHours(6, 30, 0, 0);
  function tick() {
    var diff = Math.max(0, target - new Date());
    var s = Math.floor(diff / 1000);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    cdH.textContent = (h < 10 ? "0" : "") + h;
    cdM.textContent = (m < 10 ? "0" : "") + m;
    cdS.textContent = (sec < 10 ? "0" : "") + sec;
  }
  tick();
  setInterval(tick, 1000);

  document.getElementById("rescheduleBtn").addEventListener("click", function () {
    toast("Reschedule request sent to <b>Coach Darius</b>");
  });

  /* ---------- coach quick replies ---------- */
  var thread = document.getElementById("thread");
  var quickReplies = document.getElementById("quickReplies");
  quickReplies.addEventListener("click", function (e) {
    var btn = e.target.closest(".qr");
    if (!btn) return;
    var li = document.createElement("li");
    li.className = "msg out pop";
    var now = new Date();
    var hh = now.getHours() % 12 || 12;
    var mm = (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
    var ap = now.getHours() < 12 ? "AM" : "PM";
    li.innerHTML = "<p>" + btn.textContent + "</p><time>" + hh + ":" + mm + " " + ap + "</time>";
    thread.appendChild(li);
    btn.remove();
    thread.scrollTop = thread.scrollHeight;
    toast("Message sent to <b>Coach Darius</b>");
    // simulated coach reply
    if (!quickReplies.querySelector(".qr")) {
      setTimeout(function () {
        var r = document.createElement("li");
        r.className = "msg in pop";
        r.innerHTML = "<p>Perfect. Hydrate and crush it — I'll review your logs tonight. 👊</p><time>just now</time>";
        thread.appendChild(r);
        thread.scrollTop = thread.scrollHeight;
      }, 1100);
    }
  });

  /* ---------- streak dots ---------- */
  var streakDots = document.getElementById("streakDots");
  for (var i = 0; i < 21; i++) {
    var dot = document.createElement("i");
    if (i < 14) dot.className = "on";
    streakDots.appendChild(dot);
  }

  /* ---------- goal ring ---------- */
  var ringFg = document.getElementById("ringFg");
  var goalPct = document.getElementById("goalPct");
  var CIRC = 2 * Math.PI * 52; // ~327
  var goalDone = 4, goalTotal = 5;

  function setGoal(done) {
    var pct = Math.min(1, done / goalTotal);
    ringFg.style.strokeDashoffset = CIRC * (1 - pct);
    goalPct.textContent = Math.round(pct * 100) + "%";
    var span = ringFg.closest(".ring-wrap").querySelector(".ring-center span");
    span.textContent = done + " / " + goalTotal;
  }
  function bumpGoal() {
    if (goalDone < goalTotal) {
      goalDone++;
      setGoal(goalDone);
      if (goalDone === goalTotal) toast("Weekly goal <b>smashed</b> — 5 / 5 done! 🏆");
    }
  }

  // animate widgets on load
  requestAnimationFrame(function () {
    setTimeout(function () {
      setGoal(goalDone);
    }, 200);
  });

  /* ---------- notifications ---------- */
  document.getElementById("bellBtn").addEventListener("click", function () {
    toast("You have <b>2 new</b> plan updates from your coach");
  });

  refreshProgress();
})();
