(function () {
  "use strict";

  // ---- Course data (fictional) ----
  var COURSE = {
    title: "Modern CSS Layout Mastery",
    modules: [
      {
        name: "Module 1 · Foundations",
        lessons: [
          { id: "l1", t: "The box model, really", d: "08:12", level: "beginner", kind: "video" },
          { id: "l2", t: "Display & document flow", d: "10:05", level: "beginner", kind: "video" }
        ]
      },
      {
        name: "Module 2 · Flexbox",
        lessons: [
          { id: "l3", t: "Aligning items with flex utilities", d: "12:40", level: "intermediate", kind: "video" },
          { id: "l4", t: "Wrapping, gap & grow/shrink", d: "11:18", level: "intermediate", kind: "video" },
          { id: "l5", t: "Checkpoint: flex quiz", d: "5 questions", level: "intermediate", kind: "quiz" }
        ]
      },
      {
        name: "Module 3 · Grid",
        lessons: [
          { id: "l6", t: "Grid template areas", d: "13:50", level: "advanced", kind: "video" },
          { id: "l7", t: "Auto-fit, minmax & responsive grids", d: "14:22", level: "advanced", kind: "video" },
          { id: "l8", t: "Final project: dashboard layout", d: "09:01", level: "advanced", kind: "video" }
        ]
      }
    ],
    transcripts: {
      l3: [
        { t: 0, s: "0:00", x: "Welcome back. In this lesson we tackle alignment in Flexbox." },
        { t: 28, s: "0:28", x: "Remember: a flex container has a main axis and a cross axis." },
        { t: 65, s: "1:05", x: "justify-content controls spacing along the main axis." },
        { t: 112, s: "1:52", x: "align-items, by contrast, positions children on the cross axis." },
        { t: 168, s: "2:48", x: "Let's open the demo and toggle each value live." },
        { t: 240, s: "4:00", x: "Notice how stretch is the default for align-items." },
        { t: 322, s: "5:22", x: "Use align-self to override alignment for a single child." },
        { t: 410, s: "6:50", x: "Quick recap, then your turn in the exercise files." }
      ]
    }
  };

  var DEFAULT_TRANSCRIPT = [
    { t: 0, s: "0:00", x: "Transcript for this lesson is being generated." },
    { t: 30, s: "0:30", x: "Switch to a Flexbox lesson to see the full interactive transcript." }
  ];

  // Flatten lessons preserving module reference
  var FLAT = [];
  COURSE.modules.forEach(function (m) {
    m.lessons.forEach(function (l) { FLAT.push({ lesson: l, module: m.name }); });
  });

  var state = {
    current: 2,                 // index into FLAT (l3)
    done: {},                   // id -> true
    playing: false,
    pos: 0,                     // seconds
    dur: 760,
    rate: 1,
    timer: null
  };
  var RATES = [1, 1.25, 1.5, 2, 0.75];

  // ---- DOM helpers ----
  var $ = function (s) { return document.querySelector(s); };
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function durToSec(d) {
    if (!/:/.test(d)) return 300;
    var p = d.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  // ---- Render curriculum ----
  function renderCurriculum() {
    var wrap = $("#modules");
    wrap.innerHTML = "";
    var idx = 0;
    COURSE.modules.forEach(function (m) {
      var h = document.createElement("div");
      h.className = "module-h";
      h.textContent = m.name;
      wrap.appendChild(h);
      m.lessons.forEach(function (l) {
        var fi = idx;
        var btn = document.createElement("button");
        btn.className = "lesson";
        btn.type = "button";
        if (fi === state.current) btn.classList.add("current");
        if (state.done[l.id]) btn.classList.add("done");
        btn.setAttribute("aria-current", fi === state.current ? "true" : "false");
        btn.innerHTML =
          '<span class="check" aria-hidden="true">✓</span>' +
          '<span class="lesson-meta">' +
            '<span class="lt">' + l.t + '</span>' +
            '<span class="ld"><span class="dur-tag">' + l.d + '</span>' +
              '<span class="kind-tag ' + (l.kind === "quiz" ? "quiz" : "") + '">' +
                (l.kind === "quiz" ? "QUIZ" : "VIDEO") + '</span></span>' +
          '</span>';
        btn.addEventListener("click", function () { goTo(fi); });
        wrap.appendChild(btn);
        idx++;
      });
    });
  }

  // ---- Progress ----
  function progress() {
    var total = FLAT.length;
    var done = Object.keys(state.done).length;
    var pct = Math.round((done / total) * 100);

    $("#ringFg").style.setProperty;
    $("#courseRing").style.setProperty("--p", pct);
    $("#ringNum").textContent = pct + "%";
    $("#progressLabel").textContent = done + " of " + total + " lessons";
    $("#curBar").style.width = pct + "%";
    $("#curPct").textContent = pct + "% complete";
    return pct;
  }

  // ---- Load a lesson ----
  function loadLesson() {
    var entry = FLAT[state.current];
    var l = entry.lesson;

    $("#nowModule").textContent = entry.module;
    $("#nowTitle").textContent = l.t;
    state.dur = durToSec(l.d);
    var totalIdx = "Lesson " + (state.current + 1) + " of " + FLAT.length;
    $("#nowDur").textContent = (/:/.test(l.d) ? l.d + " · " : "") + totalIdx;

    $("#barTitle").textContent = l.t;
    var lvl = $("#barLevel");
    lvl.textContent = l.level.charAt(0).toUpperCase() + l.level.slice(1);
    lvl.className = "pill level " + l.level;

    $("#durTime").textContent = fmt(state.dur);

    // complete button label
    var cb = $("#completeBtn");
    if (state.done[l.id]) {
      cb.textContent = state.current < FLAT.length - 1 ? "Completed ✓ · Next lesson" : "Completed ✓";
    } else {
      cb.textContent = state.current < FLAT.length - 1 ? "Mark complete & next" : "Mark complete";
    }
    $("#prevBtn").disabled = state.current === 0;

    // reset playback
    pause();
    state.pos = 0;
    updateScrub();
    renderTranscript();
    highlightCurrent();
  }

  function highlightCurrent() {
    var btns = document.querySelectorAll(".lesson");
    btns.forEach(function (b, i) {
      b.classList.toggle("current", i === state.current);
      b.setAttribute("aria-current", i === state.current ? "true" : "false");
    });
  }

  function goTo(i) {
    if (i < 0 || i >= FLAT.length) return;
    state.current = i;
    loadLesson();
    $("#player").scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast("Now playing: " + FLAT[i].lesson.t);
  }

  // ---- Transcript ----
  function renderTranscript() {
    var l = FLAT[state.current].lesson;
    var lines = COURSE.transcripts[l.id] || DEFAULT_TRANSCRIPT;
    var ul = $("#transcript");
    ul.innerHTML = "";
    lines.forEach(function (ln) {
      var li = document.createElement("li");
      li.dataset.t = ln.t;
      li.innerHTML = '<span class="tr-time">' + ln.s + '</span><span class="tr-text">' + ln.x + '</span>';
      li.addEventListener("click", function () {
        state.pos = ln.t;
        updateScrub();
        markActiveLine();
        if (!state.playing) play();
        toast("Jumped to " + ln.s);
      });
      ul.appendChild(li);
    });
    markActiveLine();
  }

  function markActiveLine() {
    var items = document.querySelectorAll("#transcript li");
    var active = null;
    items.forEach(function (li) {
      if (parseFloat(li.dataset.t) <= state.pos) active = li;
      li.classList.remove("active");
    });
    if (active) active.classList.add("active");
  }

  // ---- Playback ----
  function updateScrub() {
    var pct = state.dur ? (state.pos / state.dur) * 100 : 0;
    pct = Math.min(100, Math.max(0, pct));
    $("#scrubFill").style.width = pct + "%";
    $("#scrubKnob").style.left = pct + "%";
    $("#curTime").textContent = fmt(state.pos);
    var sc = $("#scrub");
    sc.setAttribute("aria-valuenow", Math.round(pct));
  }

  function tick() {
    state.pos += state.rate;
    if (state.pos >= state.dur) {
      state.pos = state.dur;
      updateScrub();
      pause();
      toast("Lesson finished");
      return;
    }
    updateScrub();
    markActiveLine();
  }

  function play() {
    if (state.playing) return;
    state.playing = true;
    $("#player").classList.add("playing");
    $("#poster").classList.add("playing");
    state.timer = setInterval(tick, 1000);
  }
  function pause() {
    state.playing = false;
    $("#player").classList.remove("playing");
    $("#poster").classList.remove("playing");
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
  }
  function togglePlay() { state.playing ? pause() : play(); }

  // ---- Wire controls ----
  $("#playBtn").addEventListener("click", play);
  $("#ctrlPlay").addEventListener("click", togglePlay);

  $("#scrub").addEventListener("click", function (e) {
    var r = this.getBoundingClientRect();
    state.pos = ((e.clientX - r.left) / r.width) * state.dur;
    updateScrub();
    markActiveLine();
  });
  $("#scrub").addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { state.pos = Math.min(state.dur, state.pos + 5); updateScrub(); markActiveLine(); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { state.pos = Math.max(0, state.pos - 5); updateScrub(); markActiveLine(); e.preventDefault(); }
    else if (e.key === " " || e.key === "Enter") { togglePlay(); e.preventDefault(); }
  });

  $("#rateBtn").addEventListener("click", function () {
    var i = (RATES.indexOf(state.rate) + 1) % RATES.length;
    state.rate = RATES[i];
    this.textContent = state.rate + "×";
    toast("Speed " + state.rate + "×");
  });

  $("#ccBtn").addEventListener("click", function () {
    var on = this.getAttribute("aria-pressed") === "true";
    this.setAttribute("aria-pressed", String(!on));
    toast("Captions " + (!on ? "on" : "off"));
  });

  // ---- Lesson navigation ----
  $("#prevBtn").addEventListener("click", function () { goTo(state.current - 1); });

  $("#completeBtn").addEventListener("click", function () {
    var l = FLAT[state.current].lesson;
    var wasDone = state.done[l.id];
    if (!wasDone) {
      state.done[l.id] = true;
      var btn = document.querySelectorAll(".lesson")[state.current];
      if (btn) btn.classList.add("done");
      var pct = progress();
      toast("Lesson complete ✓ " + pct + "% of course done");
    }
    if (state.current < FLAT.length - 1) {
      goTo(state.current + 1);
    } else if (!wasDone) {
      progress();
      loadLesson();
      toast("🎉 Course complete! Nice work.");
    }
  });

  // ---- Tabs ----
  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      var name = tab.dataset.tab;
      document.querySelectorAll(".panel").forEach(function (p) {
        p.hidden = p.dataset.panel !== name;
        p.classList.toggle("is-active", p.dataset.panel === name);
      });
    });
  });

  // ---- Notes ----
  var notesArea = $("#notesArea");
  var savedNote = "";
  $("#stampBtn").addEventListener("click", function () {
    var stamp = "[" + fmt(state.pos) + "] ";
    var pos = notesArea.selectionStart || notesArea.value.length;
    notesArea.value = notesArea.value.slice(0, pos) + stamp + notesArea.value.slice(pos);
    notesArea.focus();
    $("#notesStamp").textContent = "Unsaved changes";
  });
  notesArea.addEventListener("input", function () {
    $("#notesStamp").textContent = notesArea.value === savedNote ? "All changes saved" : "Unsaved changes";
  });
  $("#saveNote").addEventListener("click", function () {
    savedNote = notesArea.value;
    var now = new Date();
    var hh = now.getHours(), mm = now.getMinutes();
    var ap = hh >= 12 ? "PM" : "AM";
    hh = hh % 12 || 12;
    $("#notesStamp").textContent = "Saved at " + hh + ":" + (mm < 10 ? "0" : "") + mm + " " + ap;
    toast("Note saved");
  });

  // ---- Q&A ----
  $("#qaForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("#qaInput");
    var v = input.value.trim();
    if (!v) return;
    var li = document.createElement("li");
    li.innerHTML =
      '<div class="qa-av" style="--c:#f59e0b">You</div>' +
      '<div class="qa-body">' +
        '<p class="qa-meta"><strong>You</strong> · just now</p>' +
        '<p></p>' +
        '<div class="qa-foot"><button class="qa-up" type="button">▲ 0</button> · 0 replies</div>' +
      '</div>';
    li.querySelector(".qa-body p:nth-child(2)").textContent = v;
    $("#qaList").prepend(li);
    input.value = "";
    var b = $("#tab-qa").querySelector(".badge");
    if (b) b.textContent = String(parseInt(b.textContent, 10) + 1);
    toast("Question posted to the class");
  });

  document.addEventListener("click", function (e) {
    var up = e.target.closest(".qa-up");
    if (up) {
      var n = parseInt(up.textContent.replace(/\D/g, ""), 10) || 0;
      up.textContent = "▲ " + (n + 1);
    }
  });

  // ---- Study mode ----
  $("#themeToggle").addEventListener("click", function () {
    var on = document.documentElement.getAttribute("data-theme") === "study";
    if (on) {
      document.documentElement.removeAttribute("data-theme");
      this.setAttribute("aria-pressed", "false");
      toast("Light mode");
    } else {
      document.documentElement.setAttribute("data-theme", "study");
      this.setAttribute("aria-pressed", "true");
      toast("Study mode on");
    }
  });

  // ---- Init ----
  // pre-complete first two lessons for realistic progress
  state.done.l1 = true;
  state.done.l2 = true;
  renderCurriculum();
  progress();
  loadLesson();
})();
