(function () {
  "use strict";

  // ---- Config limits ----
  var LIMITS = {
    work: { min: 5, max: 300, stepDelta: 5 },
    rest: { min: 0, max: 300, stepDelta: 5 },
    rounds: { min: 1, max: 30, stepDelta: 1 }
  };

  var config = { work: 20, rest: 10, rounds: 8 };

  // ---- State ----
  var state = {
    running: false,
    phase: "ready", // ready | work | rest | done
    round: 0,       // 1-based during a session
    remaining: 0,
    total: 0,
    ticker: null,
    lastFlashAt: -1
  };

  // ---- Elements ----
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("stage");
  var phaseLabel = $("phaseLabel");
  var countEl = $("count");
  var countSub = $("countSub");
  var ring = $("ring");
  var roundChip = $("roundChip");
  var dotsEl = $("dots");
  var flash = $("flash");
  var statusBadge = $("statusBadge");
  var startBtn = $("startBtn");
  var resetBtn = $("resetBtn");
  var setup = $("setup");
  var estimate = $("estimate");
  var toastEl = $("toast");
  var presets = Array.prototype.slice.call(document.querySelectorAll(".preset"));
  var stepperEls = Array.prototype.slice.call(document.querySelectorAll(".stepper"));

  var valEls = {
    work: $("workVal"),
    rest: $("restVal"),
    rounds: $("roundsVal")
  };

  // ---- Helpers ----
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" + s : s);
  }

  function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function totalSeconds() {
    return config.rounds * config.work + Math.max(0, config.rounds - 1) * config.rest;
  }

  function buzz(pattern) {
    if (navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) { /* ignore */ }
    }
  }

  function pulseFlash() {
    flash.classList.remove("pulse");
    // force reflow so the animation can restart
    void flash.offsetWidth;
    flash.classList.add("pulse");
  }

  // ---- Rendering ----
  function renderConfig() {
    valEls.work.innerHTML = config.work + "<small>s</small>";
    valEls.rest.innerHTML = config.rest + "<small>s</small>";
    valEls.rounds.textContent = config.rounds;
    estimate.textContent = "~" + fmt(totalSeconds()) + " total";
    renderDots();
    updatePresetMatch();
    if (!state.running && state.phase === "ready") {
      roundChip.textContent = "Round 0 / " + config.rounds;
    }
  }

  function renderDots() {
    dotsEl.innerHTML = "";
    for (var i = 1; i <= config.rounds; i++) {
      var li = document.createElement("li");
      if (state.phase !== "ready") {
        if (i < state.round) li.className = "done";
        else if (i === state.round) li.className = "active";
      }
      dotsEl.appendChild(li);
    }
  }

  function updatePresetMatch() {
    presets.forEach(function (p) {
      var match =
        parseInt(p.dataset.work, 10) === config.work &&
        parseInt(p.dataset.rest, 10) === config.rest &&
        parseInt(p.dataset.rounds, 10) === config.rounds;
      p.classList.toggle("active", match);
    });
  }

  function paintStage() {
    stage.dataset.phase = state.phase;
    var pct;
    if (state.total > 0) {
      pct = ((state.total - state.remaining) / state.total) * 100;
    } else {
      pct = 0;
    }
    ring.style.setProperty("--pct", pct.toFixed(2));
    countEl.textContent = pad2(state.remaining);

    if (state.phase === "work") {
      phaseLabel.textContent = "Work";
      countSub.textContent = "Push hard";
      roundChip.textContent = "Round " + state.round + " / " + config.rounds;
    } else if (state.phase === "rest") {
      phaseLabel.textContent = "Rest";
      countSub.textContent = "Breathe";
      roundChip.textContent = "Round " + state.round + " / " + config.rounds;
    } else if (state.phase === "ready") {
      phaseLabel.textContent = "Get Ready";
      countSub.textContent = state.running ? "Starting" : "Press start";
    } else if (state.phase === "done") {
      phaseLabel.textContent = "Complete";
      countSub.textContent = "Nice work";
      roundChip.textContent = config.rounds + " rounds done";
    }
    renderDots();
  }

  // ---- Phase transitions ----
  function beginPhase(phase, round) {
    state.phase = phase;
    if (round) state.round = round;
    state.total = phase === "work" ? config.work : config.rest;
    state.remaining = state.total;
    state.lastFlashAt = -1;
    paintStage();
  }

  function advance() {
    // Called when a phase's remaining hits 0
    if (state.phase === "ready") {
      beginPhase("work", 1);
      buzz(60);
      return;
    }
    if (state.phase === "work") {
      if (config.rest > 0 && state.round < config.rounds) {
        beginPhase("rest");
        buzz(80);
      } else if (state.round < config.rounds) {
        beginPhase("work", state.round + 1);
        buzz(60);
      } else {
        finish();
      }
      return;
    }
    if (state.phase === "rest") {
      beginPhase("work", state.round + 1);
      buzz(60);
      return;
    }
  }

  function tick() {
    state.remaining -= 1;

    // Cue on final 3 seconds of a live phase
    if (
      (state.phase === "work" || state.phase === "rest") &&
      state.remaining <= 3 &&
      state.remaining >= 1 &&
      state.remaining !== state.lastFlashAt
    ) {
      state.lastFlashAt = state.remaining;
      pulseFlash();
      buzz(40);
    }

    if (state.remaining <= 0) {
      advance();
    } else {
      paintStage();
    }
  }

  // ---- Controls ----
  function start() {
    if (state.running) return;
    if (state.phase === "done") reset(true);

    state.running = true;
    startBtn.textContent = "Pause";
    startBtn.classList.add("running");
    statusBadge.textContent = "Live";
    setup.classList.add("locked");

    if (state.phase === "ready" && state.remaining <= 0) {
      // Kick off the first work interval immediately
      beginPhase("work", 1);
      buzz(60);
      toast("Let's go — " + config.rounds + " rounds");
    } else {
      toast("Resumed");
    }
    paintStage();

    state.ticker = setInterval(tick, 1000);
  }

  function pause() {
    if (!state.running) return;
    state.running = false;
    clearInterval(state.ticker);
    state.ticker = null;
    startBtn.textContent = "Resume";
    startBtn.classList.remove("running");
    statusBadge.textContent = "Paused";
    toast("Paused");
  }

  function toggle() {
    if (state.running) pause();
    else start();
  }

  function finish() {
    clearInterval(state.ticker);
    state.ticker = null;
    state.running = false;
    state.phase = "done";
    state.remaining = 0;
    state.total = 0;
    startBtn.textContent = "Start";
    startBtn.classList.remove("running");
    statusBadge.textContent = "Done";
    setup.classList.remove("locked");
    pulseFlash();
    buzz([120, 60, 120, 60, 200]);
    countEl.textContent = "00";
    ring.style.setProperty("--pct", "100");
    paintStage();
    toast("Session complete — great work!");
  }

  function reset(silent) {
    clearInterval(state.ticker);
    state.ticker = null;
    state.running = false;
    state.phase = "ready";
    state.round = 0;
    state.remaining = 0;
    state.total = 0;
    state.lastFlashAt = -1;
    startBtn.textContent = "Start";
    startBtn.classList.remove("running");
    statusBadge.textContent = "Ready";
    setup.classList.remove("locked");
    ring.style.setProperty("--pct", "0");
    countEl.textContent = "00";
    paintStage();
    if (!silent) toast("Reset to plan");
  }

  // ---- Setup interactions ----
  function changeField(field, dir) {
    if (state.running) return;
    var lim = LIMITS[field];
    var next = config[field] + dir * lim.stepDelta;
    next = Math.max(lim.min, Math.min(lim.max, next));
    config[field] = next;
    renderConfig();
  }

  stepperEls.forEach(function (st) {
    var field = st.dataset.field;
    st.querySelectorAll(".step").forEach(function (b) {
      b.addEventListener("click", function () {
        changeField(field, parseInt(b.dataset.dir, 10));
      });
    });
  });

  presets.forEach(function (p) {
    p.addEventListener("click", function () {
      if (state.running) {
        toast("Pause before changing preset");
        return;
      }
      config.work = parseInt(p.dataset.work, 10);
      config.rest = parseInt(p.dataset.rest, 10);
      config.rounds = parseInt(p.dataset.rounds, 10);
      reset(true);
      renderConfig();
      toast(p.textContent + " loaded");
    });
  });

  startBtn.addEventListener("click", toggle);
  resetBtn.addEventListener("click", function () { reset(false); });

  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && e.target === document.body) {
      e.preventDefault();
      toggle();
    } else if (e.key === "r" || e.key === "R") {
      if (e.target === document.body) reset(false);
    }
  });

  // ---- Init ----
  renderConfig();
  paintStage();
})();
