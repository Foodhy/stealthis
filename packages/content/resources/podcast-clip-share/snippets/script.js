(function () {
  "use strict";

  var EPISODE_SECONDS = 48 * 60 + 12; // 48:12 total
  var BAR_COUNT = 72;
  var VIZ_BARS = 28;

  var wave = document.getElementById("wave");
  var waveBars = document.getElementById("waveBars");
  var region = document.getElementById("region");
  var playhead = document.getElementById("playhead");
  var handleStart = document.getElementById("handleStart");
  var handleEnd = document.getElementById("handleEnd");

  var clipLength = document.getElementById("clipLength");
  var tcStart = document.getElementById("tcStart");
  var tcEnd = document.getElementById("tcEnd");
  var tcPlay = document.getElementById("tcPlay");

  var cardRange = document.getElementById("cardRange");
  var cardCaption = document.getElementById("cardCaption");
  var cardEp = document.getElementById("cardEp");
  var captionInput = document.getElementById("captionInput");
  var capCount = document.getElementById("capCount");

  var viz = document.getElementById("viz");
  var playBtn = document.getElementById("playBtn");
  var playLabel = document.getElementById("playLabel");
  var toastEl = document.getElementById("toast");

  // state as fraction (0..1) of full episode
  var state = { start: 0.16, end: 0.35, play: 0.16 };

  /* ---------- helpers ---------- */
  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- build static waveform ---------- */
  var amps = [];
  for (var i = 0; i < BAR_COUNT; i++) {
    // deterministic pseudo-random envelope so it looks like real audio
    var base = Math.sin(i * 0.45) * 0.5 + 0.5;
    var jitter = ((Math.sin(i * 13.13) + 1) / 2) * 0.55;
    var env = 0.25 + base * 0.5 + jitter * 0.35;
    amps.push(Math.min(1, env));
    var bar = document.createElement("i");
    bar.style.height = Math.round(18 + amps[i] * 78) + "%";
    waveBars.appendChild(bar);
  }
  var barEls = waveBars.querySelectorAll("i");

  /* ---------- build audiogram viz bars ---------- */
  for (var v = 0; v < VIZ_BARS; v++) {
    var b = document.createElement("i");
    b.style.animationDelay = (v * 0.055).toFixed(3) + "s";
    b.style.animationDuration = (0.7 + (v % 5) * 0.09).toFixed(2) + "s";
    viz.appendChild(b);
  }

  /* ---------- render ---------- */
  function render() {
    var sPct = state.start * 100;
    var ePct = state.end * 100;
    region.style.left = sPct + "%";
    region.style.right = 100 - ePct + "%";
    playhead.style.left = state.play * 100 + "%";

    var startSec = state.start * EPISODE_SECONDS;
    var endSec = state.end * EPISODE_SECONDS;
    var playSec = state.play * EPISODE_SECONDS;

    clipLength.textContent = fmt(endSec - startSec);
    tcStart.textContent = fmt(startSec);
    tcEnd.textContent = fmt(endSec);
    tcPlay.textContent = fmt(playSec);
    cardRange.textContent = fmt(startSec) + " – " + fmt(endSec);
    wave.setAttribute("aria-valuenow", Math.round(state.play * 100));

    // highlight bars inside selection
    for (var i = 0; i < barEls.length; i++) {
      var pos = (i + 0.5) / BAR_COUNT;
      if (pos >= state.start && pos <= state.end) {
        barEls[i].classList.add("on");
      } else {
        barEls[i].classList.remove("on");
      }
    }
  }

  /* ---------- pointer helpers ---------- */
  function fracFromEvent(e) {
    var rect = wave.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return Math.min(1, Math.max(0, x / rect.width));
  }

  var MIN_GAP = 0.03;
  var dragging = null;

  function startDrag(which) {
    return function (e) {
      e.preventDefault();
      dragging = which;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", stopDrag);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", stopDrag);
    };
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    var f = fracFromEvent(e);
    if (dragging === "start") {
      state.start = Math.min(f, state.end - MIN_GAP);
      if (state.play < state.start) state.play = state.start;
    } else if (dragging === "end") {
      state.end = Math.max(f, state.start + MIN_GAP);
      if (state.play > state.end) state.play = state.end;
    }
    render();
  }

  function stopDrag() {
    dragging = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", stopDrag);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("touchend", stopDrag);
  }

  handleStart.addEventListener("mousedown", startDrag("start"));
  handleEnd.addEventListener("mousedown", startDrag("end"));
  handleStart.addEventListener("touchstart", startDrag("start"), { passive: false });
  handleEnd.addEventListener("touchstart", startDrag("end"), { passive: false });

  // click / scrub track to move playhead
  wave.addEventListener("mousedown", function (e) {
    if (e.target === handleStart || e.target === handleEnd) return;
    var f = fracFromEvent(e);
    state.play = Math.min(state.end, Math.max(state.start, f));
    render();
  });

  /* ---------- keyboard on handles ---------- */
  function keyStep(which) {
    return function (e) {
      var step = e.shiftKey ? 0.05 : 0.01;
      var handled = true;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        if (which === "start") state.start = Math.max(0, state.start - step);
        else state.end = Math.max(state.start + MIN_GAP, state.end - step);
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        if (which === "start") state.start = Math.min(state.end - MIN_GAP, state.start + step);
        else state.end = Math.min(1, state.end + step);
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        state.play = Math.min(state.end, Math.max(state.start, state.play));
        render();
      }
    };
  }
  handleStart.addEventListener("keydown", keyStep("start"));
  handleEnd.addEventListener("keydown", keyStep("end"));

  // keyboard on wave = scrub playhead
  wave.addEventListener("keydown", function (e) {
    if (e.target !== wave) return;
    var step = e.shiftKey ? 0.05 : 0.01;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      state.play = Math.max(state.start, state.play - step);
      e.preventDefault();
      render();
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      state.play = Math.min(state.end, state.play + step);
      e.preventDefault();
      render();
    }
  });

  /* ---------- play / pause animation ---------- */
  var playing = true;
  function setPlaying(next) {
    playing = next;
    viz.classList.toggle("paused", !playing);
    playBtn.classList.toggle("is-paused", !playing);
    playBtn.setAttribute("aria-pressed", String(playing));
    playLabel.textContent = playing ? "Pause" : "Play";
  }
  playBtn.addEventListener("click", function () {
    setPlaying(!playing);
    toast(playing ? "Previewing clip" : "Preview paused");
  });

  /* ---------- caption editing ---------- */
  function syncCaption() {
    var val = captionInput.value.trim();
    cardCaption.textContent = val || "Add a caption for your clip…";
    capCount.textContent = captionInput.value.length + " / 120";
  }
  captionInput.addEventListener("input", syncCaption);

  /* ---------- accent swatches ---------- */
  var swatches = document.querySelectorAll(".swatch");
  swatches.forEach(function (sw) {
    sw.addEventListener("click", function () {
      swatches.forEach(function (o) {
        o.classList.remove("is-active");
      });
      sw.classList.add("is-active");
      var map = { violet: "#8b5cf6", cyan: "#22d3ee", pink: "#f472b6" };
      document.documentElement.style.setProperty("--accent", map[sw.dataset.accent]);
      toast(sw.dataset.accent + " accent applied");
    });
  });

  /* ---------- share actions ---------- */
  function clipUrl() {
    var s = Math.round(state.start * EPISODE_SECONDS);
    var e = Math.round(state.end * EPISODE_SECONDS);
    return "https://stealthis.fm/e/214/clip?t=" + s + "," + e;
  }

  document.getElementById("copyBtn").addEventListener("click", function () {
    var url = clipUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () { toast("Clip link copied"); },
        function () { toast("Copy failed — " + url); }
      );
    } else {
      toast("Link: " + url);
    }
  });

  document.getElementById("xBtn").addEventListener("click", function () {
    toast("Opening composer for X…");
  });

  document.getElementById("dlBtn").addEventListener("click", function () {
    toast("Rendering audiogram… " + clipLength.textContent);
  });

  /* ---------- init ---------- */
  syncCaption();
  render();
})();
