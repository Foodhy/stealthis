(function () {
  "use strict";

  var DURATION = 3120; // 52:00 in seconds
  var current = 0;
  var playing = false;
  var timer = null;
  var speeds = [1, 1.25, 1.5, 2];
  var speedIdx = 0;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var body = document.body;
  var playBtn = $("#playBtn");
  var wave = $("#wave");
  var waveFill = $("#waveFill");
  var waveHead = $("#waveHead");
  var curEl = $("#cur");
  var durEl = $("#dur");
  var chapterEls = $$("#chapters li");
  var transcriptEls = $$("#transcript p");
  var toastEl = $("#toast");
  var toastTimer = null;

  body.classList.add("paused");

  /* ---------- helpers ---------- */
  function fmt(s) {
    s = Math.max(0, Math.floor(s));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" + r : r);
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function render() {
    var pct = (current / DURATION) * 100;
    wave.style.setProperty("--pct", pct + "%");
    curEl.textContent = fmt(current);
    durEl.textContent = "-" + fmt(DURATION - current);
    wave.setAttribute("aria-valuenow", Math.floor(current));
    wave.setAttribute("aria-valuetext", fmt(current) + " of " + fmt(DURATION));
    syncChapters();
    syncTranscript();
  }

  function syncChapters() {
    var activeIdx = 0;
    chapterEls.forEach(function (li, i) {
      var t = +li.querySelector("button").dataset.t;
      if (current >= t) activeIdx = i;
    });
    chapterEls.forEach(function (li, i) {
      li.classList.toggle("active", i === activeIdx);
    });
  }

  function syncTranscript() {
    var activeIdx = -1;
    transcriptEls.forEach(function (p, i) {
      if (current >= +p.dataset.t) activeIdx = i;
    });
    transcriptEls.forEach(function (p, i) {
      p.classList.toggle("here", i === activeIdx);
    });
  }

  /* ---------- playback ---------- */
  function tick() {
    current += speeds[speedIdx];
    if (current >= DURATION) {
      current = DURATION;
      pause();
      toast("Episode finished — up next: Ep 46");
    }
    render();
  }

  function play() {
    if (playing) return;
    playing = true;
    body.classList.add("playing");
    body.classList.remove("paused");
    playBtn.setAttribute("aria-pressed", "true");
    playBtn.setAttribute("aria-label", "Pause episode");
    timer = setInterval(tick, 1000);
  }

  function pause() {
    playing = false;
    body.classList.remove("playing");
    body.classList.add("paused");
    playBtn.setAttribute("aria-pressed", "false");
    playBtn.setAttribute("aria-label", "Play episode");
    clearInterval(timer);
  }

  function toggle() { playing ? pause() : play(); }

  playBtn.addEventListener("click", toggle);

  $("#rewind").addEventListener("click", function () {
    current = Math.max(0, current - 15); render();
  });
  $("#forward").addEventListener("click", function () {
    current = Math.min(DURATION, current + 30); render();
  });

  /* ---------- speed ---------- */
  $("#speed").addEventListener("click", function () {
    speedIdx = (speedIdx + 1) % speeds.length;
    this.textContent = speeds[speedIdx] + "×";
    if (playing) { clearInterval(timer); timer = setInterval(tick, 1000); }
    toast("Speed " + speeds[speedIdx] + "×");
  });

  /* ---------- scrub ---------- */
  function seekFromEvent(e) {
    var rect = wave.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    var pct = Math.min(1, Math.max(0, x / rect.width));
    current = Math.round(pct * DURATION);
    render();
  }
  var dragging = false;
  wave.addEventListener("mousedown", function (e) { dragging = true; seekFromEvent(e); });
  window.addEventListener("mousemove", function (e) { if (dragging) seekFromEvent(e); });
  window.addEventListener("mouseup", function () { dragging = false; });
  wave.addEventListener("touchstart", function (e) { seekFromEvent(e); }, { passive: true });
  wave.addEventListener("touchmove", function (e) { seekFromEvent(e); }, { passive: true });

  wave.addEventListener("keydown", function (e) {
    var step = 0;
    if (e.key === "ArrowRight") step = 15;
    else if (e.key === "ArrowLeft") step = -15;
    else if (e.key === "Home") { current = 0; render(); e.preventDefault(); return; }
    else if (e.key === "End") { current = DURATION; render(); e.preventDefault(); return; }
    else return;
    current = Math.min(DURATION, Math.max(0, current + step));
    render();
    e.preventDefault();
  });

  /* ---------- chapters ---------- */
  chapterEls.forEach(function (li) {
    var btn = li.querySelector("button");
    btn.addEventListener("click", function () {
      current = +btn.dataset.t;
      render();
      if (!playing) play();
      toast("Jumped to “" + btn.querySelector(".ch-name").textContent + "”");
    });
  });

  /* ---------- transcript toggle ---------- */
  var toggleTr = $("#toggleTr");
  var transcript = $("#transcript");
  toggleTr.addEventListener("click", function () {
    var open = transcript.classList.toggle("open");
    toggleTr.textContent = open ? "Collapse" : "Expand";
    toggleTr.setAttribute("aria-expanded", open ? "true" : "false");
  });

  /* ---------- save ---------- */
  var saveBtn = $("#save");
  saveBtn.addEventListener("click", function () {
    var on = saveBtn.getAttribute("aria-pressed") === "true";
    saveBtn.setAttribute("aria-pressed", on ? "false" : "true");
    toast(on ? "Removed from saved" : "Saved to your library");
  });

  /* ---------- share ---------- */
  $$(".chip[data-share]").forEach(function (c) {
    c.addEventListener("click", function () { toast("Sharing to " + c.dataset.share); });
  });
  $("#copyLink").addEventListener("click", function () {
    var url = "https://signalandnoise.fm/ep/47";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () { toast("Link copied to clipboard"); },
        function () { toast("Copy this: " + url); }
      );
    } else {
      toast("Copy this: " + url);
    }
  });

  /* ---------- related ---------- */
  $$("#related button").forEach(function (b) {
    b.addEventListener("click", function () {
      toast("Loading “" + b.querySelector(".r-title").textContent + "”");
    });
  });

  render();
})();
