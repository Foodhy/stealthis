(function () {
  "use strict";

  var DURATION = 200; // seconds (3:20)

  // Coaching cues, each pinned to a timestamp in the mock playback.
  var CUES = [
    { t: 0,   chapter: "Set-up & brace", text: "Bar on upper traps, grip just outside shoulders", hint: "Squeeze the bar to lock the shelf" },
    { t: 24,  chapter: "Unrack & stance", text: "Unrack, walk back two steps, feet shoulder-width", hint: "Toes turned out ~15°" },
    { t: 58,  chapter: "The descent",     text: "Big breath into the belly, then break at the hips", hint: "Brace like you're about to be punched" },
    { t: 96,  chapter: "Hitting depth",   text: "Sit between your knees until hip crease is below knee", hint: "Keep knees tracking over toes" },
    { t: 132, chapter: "The drive",       text: "Drive the floor away, hips and chest rise together", hint: "Don't let the chest cave forward" },
    { t: 168, chapter: "Lockout & reset", text: "Stand tall, glutes tight, exhale then reset the breath", hint: "One clean rep — no bouncing" }
  ];

  var TOTAL_SETS = 4;

  // ---- element refs ----
  var $ = function (id) { return document.getElementById(id); };
  var video = $("video");
  var playToggle = $("playToggle");
  var ctrlPlay = $("ctrlPlay");
  var speedBtn = $("speedBtn");
  var track = $("track");
  var trackFill = $("trackFill");
  var trackThumb = $("trackThumb");
  var trackMarks = $("trackMarks");
  var curTime = $("curTime");
  var chapterFlag = $("chapterFlag");
  var stepList = $("stepList");
  var ringFg = $("ringFg");
  var ringPct = $("ringPct");
  var setsDoneEl = $("setsDone");
  var completeBtn = $("completeBtn");
  var nextTitle = $("nextTitle");

  var RING_LEN = 326.7;
  var state = {
    time: 0,
    playing: false,
    speed: 1,
    speeds: [1, 1.25, 1.5, 0.75],
    speedIdx: 0,
    activeCue: -1,
    done: CUES.map(function () { return false; }),
    setsDone: 0,
    completed: false,
    timer: null
  };

  // ---- toast helper ----
  var toastEl = $("toast");
  var toastTimer = null;
  function toast(msg, lime) {
    toastEl.textContent = msg;
    toastEl.classList.toggle("lime", !!lime);
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // ---- build step list + timeline marks ----
  function fmt(s) {
    s = Math.max(0, Math.round(s));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  CUES.forEach(function (cue, i) {
    var li = document.createElement("li");
    li.className = "step";
    li.tabIndex = 0;
    li.dataset.i = i;
    li.setAttribute("role", "button");
    li.innerHTML =
      '<span class="step-time">' + fmt(cue.t) + '</span>' +
      '<span class="step-body">' +
        '<span class="step-text">' + cue.text + '</span>' +
        '<span class="step-hint">' + cue.hint + '</span>' +
      '</span>' +
      '<span class="step-check" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>' +
      '</span>';

    // click on the check toggles done; click elsewhere seeks
    li.querySelector(".step-check").addEventListener("click", function (e) {
      e.stopPropagation();
      toggleDone(i);
    });
    li.addEventListener("click", function () { seekTo(cue.t); });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seekTo(cue.t); }
      if (e.key.toLowerCase() === "x") { e.preventDefault(); toggleDone(i); }
    });
    stepList.appendChild(li);

    // timeline tick
    var mark = document.createElement("span");
    mark.className = "track-mark";
    mark.style.left = (cue.t / DURATION * 100) + "%";
    trackMarks.appendChild(mark);
  });

  var stepEls = Array.prototype.slice.call(stepList.children);

  // ---- render loop ----
  function activeCueFor(t) {
    var idx = 0;
    for (var i = 0; i < CUES.length; i++) {
      if (t >= CUES[i].t) idx = i;
    }
    return idx;
  }

  function render() {
    var pct = state.time / DURATION * 100;
    trackFill.style.width = pct + "%";
    trackThumb.style.left = pct + "%";
    curTime.textContent = fmt(state.time);
    track.setAttribute("aria-valuenow", Math.round(pct));

    var ai = activeCueFor(state.time);
    if (ai !== state.activeCue) {
      state.activeCue = ai;
      stepEls.forEach(function (el, i) { el.classList.toggle("active", i === ai); });
      chapterFlag.textContent = CUES[ai].chapter;
    }
  }

  function renderProgress() {
    var count = state.done.filter(Boolean).length;
    var frac = count / CUES.length;
    ringFg.style.strokeDashoffset = String(RING_LEN * (1 - frac));
    ringPct.textContent = Math.round(frac * 100) + "%";

    var allDone = count === CUES.length;
    if (allDone && !completeBtn.classList.contains("ready")) {
      completeBtn.classList.add("ready");
    } else if (!allDone) {
      completeBtn.classList.remove("ready");
    }
  }

  // ---- playback ----
  function setPlaying(on) {
    state.playing = on;
    video.classList.toggle("playing", on);
    document.body.classList.toggle("playing", on);
    playToggle.setAttribute("aria-pressed", String(on));
    playToggle.setAttribute("aria-label", on ? "Pause lesson" : "Play lesson");
    if (on) {
      if (state.time >= DURATION) { state.time = 0; }
      last = performance.now();
      tick();
    } else if (state.timer) {
      cancelAnimationFrame(state.timer);
      state.timer = null;
    }
  }
  function togglePlay() { setPlaying(!state.playing); }

  var last = 0;
  function tick() {
    var now = performance.now();
    var dt = (now - last) / 1000;
    last = now;
    state.time += dt * state.speed;
    if (state.time >= DURATION) {
      state.time = DURATION;
      render();
      setPlaying(false);
      toast("Lesson watched — log your sets and mark it complete", true);
      return;
    }
    render();
    state.timer = requestAnimationFrame(tick);
  }

  function seekTo(t) {
    state.time = Math.max(0, Math.min(DURATION, t));
    if (state.timer) last = performance.now();
    render();
  }

  // ---- cue completion ----
  function toggleDone(i) {
    state.done[i] = !state.done[i];
    stepEls[i].classList.toggle("done", state.done[i]);
    renderProgress();
    if (state.done[i]) {
      var remaining = state.done.filter(function (d) { return !d; }).length;
      toast(remaining === 0 ? "All cues nailed — nice work!" : "Cue locked in · " + remaining + " to go", remaining === 0);
    }
  }

  // ---- sets stepper ----
  function bumpSets(delta) {
    state.setsDone = Math.max(0, Math.min(TOTAL_SETS, state.setsDone + delta));
    setsDoneEl.textContent = String(state.setsDone);
    if (delta > 0 && state.setsDone === TOTAL_SETS) {
      toast("All " + TOTAL_SETS + " sets logged. Beast.", true);
    }
  }

  // ---- complete / next ----
  function markComplete() {
    if (!state.completed) {
      var undone = state.done.filter(function (d) { return !d; }).length;
      if (undone > 0) {
        toast("Check off all " + CUES.length + " cues first (" + undone + " left)");
        return;
      }
      state.completed = true;
      completeBtn.classList.add("is-complete");
      completeBtn.querySelector(".cta-label").textContent = "Next exercise";
      completeBtn.querySelector("svg").innerHTML = '<path d="M5 12h14M13 6l6 6-6 6"/>';
      toast("Squat complete — up next: " + nextTitle.textContent, true);
    } else {
      // advance to the next exercise
      toast("Loading " + nextTitle.textContent + "…");
      setTimeout(function () {
        document.querySelector(".lesson-title-row h1").textContent = nextTitle.textContent.toUpperCase();
        nextTitle.textContent = "Walking Lunge";
        // reset lesson state
        state.completed = false;
        state.done = CUES.map(function () { return false; });
        state.setsDone = 0;
        state.time = 0;
        setsDoneEl.textContent = "0";
        stepEls.forEach(function (el) { el.classList.remove("done"); });
        completeBtn.classList.remove("is-complete", "ready");
        completeBtn.querySelector(".cta-label").textContent = "Mark complete";
        completeBtn.querySelector("svg").innerHTML = '<path d="M20 6 9 17l-5-5"/>';
        setPlaying(false);
        render();
        renderProgress();
        toast("New exercise loaded — press play", true);
      }, 650);
    }
  }

  // ---- track seek (pointer + keyboard) ----
  function seekFromEvent(e) {
    var rect = track.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    var frac = Math.max(0, Math.min(1, x / rect.width));
    seekTo(frac * DURATION);
  }
  var dragging = false;
  track.addEventListener("pointerdown", function (e) {
    dragging = true;
    track.setPointerCapture(e.pointerId);
    seekFromEvent(e);
  });
  track.addEventListener("pointermove", function (e) { if (dragging) seekFromEvent(e); });
  track.addEventListener("pointerup", function () { dragging = false; });
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); seekTo(state.time + 5); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); seekTo(state.time - 5); }
    else if (e.key === "Home") { e.preventDefault(); seekTo(0); }
    else if (e.key === "End") { e.preventDefault(); seekTo(DURATION); }
  });

  // ---- wire controls ----
  playToggle.addEventListener("click", togglePlay);
  ctrlPlay.addEventListener("click", togglePlay);
  speedBtn.addEventListener("click", function () {
    state.speedIdx = (state.speedIdx + 1) % state.speeds.length;
    state.speed = state.speeds[state.speedIdx];
    speedBtn.textContent = state.speed + "×";
    toast("Speed · " + state.speed + "×");
  });
  $("setPlus").addEventListener("click", function () { bumpSets(1); });
  $("setMinus").addEventListener("click", function () { bumpSets(-1); });
  completeBtn.addEventListener("click", markComplete);

  // spacebar toggles play when not focused on a control
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && !/^(BUTTON|INPUT|TEXTAREA)$/.test(e.target.tagName) && !e.target.classList.contains("step")) {
      e.preventDefault();
      togglePlay();
    }
  });

  // ---- init ----
  $("setsTotal").textContent = String(TOTAL_SETS);
  render();
  renderProgress();
})();
