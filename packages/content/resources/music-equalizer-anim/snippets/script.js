(function () {
  "use strict";

  /* ---------- State ---------- */
  var state = {
    playing: false,
    bands: 24,
    speed: 1.0,        // multiplier
    accent: "#1db954",
    accent2: "#8b5cf6",
    position: 0,       // 0..1
    duration: 222,     // 3:42 in seconds
    liked: false,
    queueIndex: 0
  };

  /* ---------- Helpers ---------- */
  function $(sel) { return document.querySelector(sel); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1900);
  }

  /* base duration in seconds for one eq cycle at 1x */
  function baseDur() { return 1.0 / state.speed; }

  /* ---------- Build visualizers ---------- */
  var barsStage = $("#vizBars");
  var dotsStage = $("#vizDots");
  var mirrorStage = $("#vizMirror");
  var radialStage = $("#vizRadial");

  function rnd(min, max) { return min + Math.random() * (max - min); }

  function buildBars() {
    var n = state.bands;
    var html = "";
    for (var i = 0; i < n; i++) {
      var h = rnd(0.35, 1).toFixed(2);
      var d = (-rnd(0, 0.9)).toFixed(2);
      html += '<span class="bar" style="--h:' + h + ';--d:' + d + 's"></span>';
    }
    barsStage.innerHTML = html;
  }

  function buildMirror() {
    var n = state.bands;
    var html = "";
    for (var i = 0; i < n; i++) {
      // mirrored feel: tall in center, short at edges
      var center = 1 - Math.abs((i / (n - 1)) - 0.5) * 1.6;
      var h = clamp(center * rnd(0.6, 1.05), 0.2, 1).toFixed(2);
      var d = (-rnd(0, 0.8)).toFixed(2);
      html += '<span class="bar" style="--h:' + h + ';--d:' + d + 's"></span>';
    }
    mirrorStage.innerHTML = html;
  }

  function buildDots() {
    var cols = Math.max(6, Math.round(state.bands / 2));
    var rows = 7;
    var html = "";
    for (var c = 0; c < cols; c++) {
      var colDelay = -rnd(0, 0.9);
      html += '<span class="dot-col">';
      for (var r = 0; r < rows; r++) {
        var d = (colDelay - r * 0.06).toFixed(2);
        html += '<i style="--d:' + d + 's"></i>';
      }
      html += "</span>";
    }
    dotsStage.innerHTML = html;
  }

  function buildRadial() {
    var n = Math.max(10, Math.round(state.bands * 0.9));
    var html = "";
    for (var i = 0; i < n; i++) {
      var rot = (360 / n) * i;
      var h = rnd(0.7, 1.7).toFixed(2);
      var d = (-rnd(0, 0.9)).toFixed(2);
      html += '<span class="ray" style="--rot:' + rot + 'deg;--h:' + h + ';--d:' + d + 's"></span>';
    }
    radialStage.insertAdjacentHTML("beforeend", html);
  }

  function rebuildAll() {
    buildBars();
    buildMirror();
    buildDots();
    // radial: keep core, rebuild rays
    radialStage.querySelectorAll(".ray").forEach(function (el) { el.remove(); });
    buildRadial();
  }

  /* ---------- Apply speed / accent via CSS vars ---------- */
  var root = document.documentElement;

  function applySpeed() {
    root.style.setProperty("--eq-speed", baseDur().toFixed(3) + "s");
    $("#speedVal").innerHTML = state.speed.toFixed(1) + "&times;";
  }

  function applyAccent() {
    root.style.setProperty("--accent", state.accent);
  }

  /* ---------- Play / pause ---------- */
  var playBtn = $("#playBtn");
  var liveDot = $("#liveDot");
  var statusTxt = $("#statusTxt");

  function setPlaying(on) {
    state.playing = on;
    playBtn.setAttribute("aria-pressed", on ? "true" : "false");
    playBtn.setAttribute("aria-label", on ? "Pause visualizer" : "Play visualizer");
    document.body.classList.toggle("paused", !on);
    liveDot.classList.toggle("on", on);
    statusTxt.textContent = on ? "Playing" : "Paused";
    if (on) startTick(); else stopTick();
  }

  playBtn.addEventListener("click", function () {
    setPlaying(!state.playing);
    toast(state.playing ? "Playback started" : "Paused");
  });

  /* ---------- Simulated playback clock ---------- */
  var tickTimer = null;
  var lastTs = 0;

  function startTick() {
    lastTs = performance.now();
    if (tickTimer) return;
    tickTimer = setInterval(tick, 250);
  }
  function stopTick() {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  }
  function tick() {
    var now = performance.now();
    var dt = (now - lastTs) / 1000;
    lastTs = now;
    state.position += (dt * state.speed) / state.duration;
    if (state.position >= 1) {
      state.position = 0;
      nextTrack(true);
      toast("Up next: " + QUEUE[state.queueIndex].title);
    }
    renderProgress();
  }

  /* ---------- Progress / scrubber ---------- */
  var scrub = $("#scrub");
  var scrubFill = $("#scrubFill");
  var scrubKnob = $("#scrubKnob");
  var elapsedEl = $("#elapsed");
  var totalEl = $("#total");
  var nowTimeEl = $("#now-time");

  function renderProgress() {
    var pct = clamp(state.position, 0, 1) * 100;
    scrubFill.style.width = pct + "%";
    scrubKnob.style.left = pct + "%";
    var cur = state.position * state.duration;
    elapsedEl.textContent = fmt(cur);
    nowTimeEl.textContent = fmt(cur);
    totalEl.textContent = fmt(state.duration);
    scrub.setAttribute("aria-valuenow", Math.round(pct));
  }

  function seekFromClientX(clientX) {
    var rect = scrub.getBoundingClientRect();
    var p = clamp((clientX - rect.left) / rect.width, 0, 1);
    state.position = p;
    renderProgress();
  }

  var dragging = false;
  scrub.addEventListener("pointerdown", function (e) {
    dragging = true;
    scrub.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  });
  scrub.addEventListener("pointermove", function (e) {
    if (dragging) seekFromClientX(e.clientX);
  });
  scrub.addEventListener("pointerup", function () { dragging = false; });
  scrub.addEventListener("keydown", function (e) {
    var step = 0.02;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { state.position = clamp(state.position + step, 0, 1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { state.position = clamp(state.position - step, 0, 1); }
    else if (e.key === "Home") { state.position = 0; }
    else if (e.key === "End") { state.position = 1; }
    else return;
    e.preventDefault();
    renderProgress();
  });

  /* ---------- Like ---------- */
  var likeBtn = $("#likeBtn");
  likeBtn.addEventListener("click", function () {
    state.liked = !state.liked;
    likeBtn.setAttribute("aria-pressed", state.liked ? "true" : "false");
    toast(state.liked ? "Added to Liked Songs" : "Removed from Liked Songs");
  });

  /* ---------- Controls: bands ---------- */
  var bandsInput = $("#bands");
  var bandsVal = $("#bandsVal");
  bandsInput.addEventListener("input", function () {
    state.bands = parseInt(bandsInput.value, 10);
    bandsVal.textContent = state.bands;
    root.style.setProperty("--eq-bands", state.bands);
    rebuildAll();
  });

  /* ---------- Controls: speed ---------- */
  var speedInput = $("#speed");
  speedInput.addEventListener("input", function () {
    state.speed = parseInt(speedInput.value, 10) / 100;
    applySpeed();
  });

  /* ---------- Controls: accent swatches ---------- */
  var swatchWrap = $("#swatches");
  swatchWrap.addEventListener("click", function (e) {
    var btn = e.target.closest(".sw");
    if (!btn) return;
    state.accent = btn.getAttribute("data-c");
    applyAccent();
    swatchWrap.querySelectorAll(".sw").forEach(function (s) {
      s.setAttribute("aria-checked", s === btn ? "true" : "false");
    });
    paintCovers();
    toast("Accent: " + btn.getAttribute("aria-label"));
  });

  /* ---------- Queue ---------- */
  var QUEUE = [
    { title: "Paper Lanterns",   artist: "Neon Tides",     dur: 222, plays: "128,402", hue: 152 },
    { title: "Velvet Static",    artist: "Glass Harbor",   dur: 198, plays: "94,118",  hue: 268 },
    { title: "Low Orbit",        artist: "Neon Tides",     dur: 245, plays: "76,540",  hue: 340 },
    { title: "Cassette Sunrise", artist: "Marlowe Drift",  dur: 176, plays: "61,205",  hue: 190 },
    { title: "Saltwater Code",   artist: "The Quiet Wire", dur: 211, plays: "52,889",  hue: 44 },
    { title: "Halogen Bloom",    artist: "Neon Tides",     dur: 233, plays: "47,310",  hue: 280 }
  ];

  function coverGradient(hue) {
    return "linear-gradient(135deg, hsl(" + hue + " 70% 55%), hsl(" + ((hue + 60) % 360) + " 65% 45%))";
  }

  var queueEl = $("#queue");
  function renderQueue() {
    var html = "";
    QUEUE.forEach(function (t, i) {
      var active = i === state.queueIndex ? " active" : "";
      html += '<li class="track' + active + '" data-i="' + i + '" tabindex="0" role="button" aria-label="Play ' + t.title + ' by ' + t.artist + '">'
        + '<span class="num">' + (i + 1) + '</span>'
        + '<span class="miniwave"><i></i><i></i><i></i></span>'
        + '<span class="mini" style="background:' + coverGradient(t.hue) + '"></span>'
        + '<span class="info"><span class="t-title">' + t.title + '</span><span class="t-artist">' + t.artist + '</span></span>'
        + '<span class="t-plays">' + t.plays + ' plays</span>'
        + '<span class="t-dur">' + fmt(t.dur) + '</span>'
        + '</li>';
    });
    queueEl.innerHTML = html;
  }

  function loadTrack(i, autoplay) {
    state.queueIndex = clamp(i, 0, QUEUE.length - 1);
    var t = QUEUE[state.queueIndex];
    state.duration = t.dur;
    state.position = 0;
    $(".now-track").textContent = t.title;
    $(".now-artist").textContent = t.artist + " · Midnight Reservoir";
    $("#plays").textContent = t.plays;
    renderQueue();
    renderProgress();
    paintCovers();
    if (autoplay && !state.playing) setPlaying(true);
  }

  function nextTrack(autoplay) {
    loadTrack((state.queueIndex + 1) % QUEUE.length, autoplay);
  }

  queueEl.addEventListener("click", function (e) {
    var li = e.target.closest(".track");
    if (!li) return;
    loadTrack(parseInt(li.getAttribute("data-i"), 10), true);
    toast("Playing: " + QUEUE[state.queueIndex].title);
  });
  queueEl.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var li = e.target.closest(".track");
    if (!li) return;
    e.preventDefault();
    loadTrack(parseInt(li.getAttribute("data-i"), 10), true);
  });

  /* recolor hero art + now cover to match active track + accent */
  function paintCovers() {
    var t = QUEUE[state.queueIndex];
    $("#heroArt").style.background =
      "radial-gradient(120% 120% at 20% 15%, " + state.accent + ", transparent 55%),"
      + "radial-gradient(120% 120% at 85% 90%, hsl(" + t.hue + " 65% 45%), transparent 60%),"
      + coverGradient(t.hue);
    $(".now .cover").style.background = coverGradient(t.hue);
  }

  /* ---------- Init ---------- */
  function init() {
    root.style.setProperty("--eq-bands", state.bands);
    applySpeed();
    applyAccent();
    rebuildAll();
    renderQueue();
    loadTrack(0, false);
    setPlaying(false);   // start paused, bars flat
    renderProgress();
  }

  init();
})();
