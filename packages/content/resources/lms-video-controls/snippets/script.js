(function () {
  "use strict";

  // ── Fictional lesson "playback" model ─────────────────────────
  var DURATION = 760; // 12:40 in seconds
  var state = {
    time: 0,
    playing: false,
    buffered: 0,
    volume: 0.8,
    prevVolume: 0.8,
    muted: false,
    speed: 1,
    captions: false,
    quality: "720p",
    seeking: false,
  };

  var captionLines = [
    "Let's start by sketching the grid container and its children.",
    "We reach for display: grid and a repeat() track template.",
    "auto-fit lets the browser decide how many columns fit.",
    "minmax(240px, 1fr) keeps each card readable on small screens.",
    "Now we add gap so the cards breathe without extra margins.",
    "Watch the layout reflow as the viewport narrows.",
    "Finally we wrap it in a container query for true modularity.",
  ];

  // ── Element refs ──────────────────────────────────────────────
  var $ = function (id) { return document.getElementById(id); };
  var screen = $("screen");
  var bigPlay = $("bigPlay");
  var playBtn = $("playBtn");
  var nextBtn = $("nextBtn");
  var muteBtn = $("muteBtn");
  var fsBtn = $("fsBtn");
  var ccBtn = $("ccBtn");
  var shell = document.querySelector(".shell");

  var scrubber = $("scrubber");
  var scrubPlayed = $("scrubPlayed");
  var scrubBuffer = $("scrubBuffer");
  var scrubKnob = $("scrubKnob");
  var scrubTip = $("scrubTip");

  var volTrack = $("volTrack");
  var volFill = $("volFill");
  var volKnob = $("volKnob");

  var curEl = $("cur");
  var rateBadge = $("rateBadge");
  var captions = $("captions");
  var captionText = $("captionText");

  var speedBtn = $("speedBtn");
  var speedMenu = $("speedMenu");
  var speedLabel = $("speedLabel");
  var qualBtn = $("qualBtn");
  var qualMenu = $("qualMenu");
  var qualLabel = $("qualLabel");

  var markDone = $("markDone");
  var lessons = $("lessons");
  var toastEl = $("toast");

  // ── Helpers ───────────────────────────────────────────────────
  function fmt(s) {
    s = Math.max(0, Math.floor(s));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1900);
  }

  // ── Render ────────────────────────────────────────────────────
  function renderTime() {
    var pct = (state.time / DURATION) * 100;
    scrubPlayed.style.width = pct + "%";
    scrubKnob.style.left = pct + "%";
    curEl.textContent = fmt(state.time);
    scrubber.setAttribute("aria-valuenow", Math.round(pct));
    scrubber.setAttribute("aria-valuetext", fmt(state.time) + " of " + fmt(DURATION));

    if (state.captions) {
      var idx = Math.min(
        captionLines.length - 1,
        Math.floor((state.time / DURATION) * captionLines.length)
      );
      captionText.textContent = captionLines[idx];
    }
  }

  function renderBuffer() {
    scrubBuffer.style.width = (state.buffered / DURATION) * 100 + "%";
  }

  function renderVolume() {
    var v = state.muted ? 0 : state.volume;
    volFill.style.width = v * 100 + "%";
    volKnob.style.left = v * 100 + "%";
    volTrack.setAttribute("aria-valuenow", Math.round(v * 100));
    muteBtn.classList.toggle("is-muted", state.muted || state.volume === 0);
  }

  // ── Tick loop ─────────────────────────────────────────────────
  var lastTs = 0;
  function loop(ts) {
    if (state.playing) {
      if (lastTs) {
        var dt = ((ts - lastTs) / 1000) * state.speed;
        state.time += dt;
        if (state.time >= DURATION) {
          state.time = DURATION;
          setPlaying(false);
          toast("Lesson finished — nice work!");
        }
        renderTime();
      }
      // simulate buffering a bit ahead
      if (state.buffered < DURATION) {
        state.buffered = Math.min(DURATION, Math.max(state.buffered, state.time + 45));
        renderBuffer();
      }
    }
    lastTs = ts;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ── Play / pause ──────────────────────────────────────────────
  function setPlaying(on) {
    if (on && state.time >= DURATION) state.time = 0;
    state.playing = on;
    screen.classList.toggle("is-playing", on);
    playBtn.setAttribute("data-state", on ? "playing" : "paused");
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
    bigPlay.setAttribute("aria-label", on ? "Pause lesson" : "Play lesson");
  }
  function togglePlay() { setPlaying(!state.playing); }

  bigPlay.addEventListener("click", togglePlay);
  playBtn.addEventListener("click", togglePlay);

  // ── Next lesson ───────────────────────────────────────────────
  function goNext() {
    toast("Loading next lesson · Container Queries in Practice");
    state.time = 0;
    state.buffered = 0;
    renderTime();
    renderBuffer();
    setPlaying(true);
  }
  nextBtn.addEventListener("click", goNext);

  // ── Scrubber drag ─────────────────────────────────────────────
  function seekFromEvent(clientX) {
    var rect = scrubber.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    state.time = ratio * DURATION;
    renderTime();
  }
  function showTip(clientX) {
    var rect = scrubber.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    scrubTip.hidden = false;
    scrubTip.style.left = ratio * 100 + "%";
    scrubTip.textContent = fmt(ratio * DURATION);
  }

  scrubber.addEventListener("pointerdown", function (e) {
    state.seeking = true;
    scrubber.classList.add("is-drag");
    scrubber.setPointerCapture(e.pointerId);
    seekFromEvent(e.clientX);
    showTip(e.clientX);
  });
  scrubber.addEventListener("pointermove", function (e) {
    if (state.seeking) seekFromEvent(e.clientX);
    if (e.buttons || state.seeking) showTip(e.clientX);
    else if (e.pointerType === "mouse") showTip(e.clientX);
  });
  scrubber.addEventListener("pointerleave", function () {
    if (!state.seeking) scrubTip.hidden = true;
  });
  scrubber.addEventListener("pointerup", function () {
    state.seeking = false;
    scrubber.classList.remove("is-drag");
    scrubTip.hidden = true;
  });
  scrubber.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { state.time = Math.max(0, state.time - 5); renderTime(); e.preventDefault(); }
    else if (e.key === "ArrowRight") { state.time = Math.min(DURATION, state.time + 5); renderTime(); e.preventDefault(); }
    else if (e.key === "Home") { state.time = 0; renderTime(); e.preventDefault(); }
    else if (e.key === "End") { state.time = DURATION; renderTime(); e.preventDefault(); }
  });

  // ── Volume ────────────────────────────────────────────────────
  function setVolFromEvent(clientX) {
    var rect = volTrack.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    state.volume = ratio;
    state.muted = ratio === 0;
    renderVolume();
  }
  var volDrag = false;
  volTrack.addEventListener("pointerdown", function (e) {
    volDrag = true; volTrack.setPointerCapture(e.pointerId); setVolFromEvent(e.clientX);
  });
  volTrack.addEventListener("pointermove", function (e) { if (volDrag) setVolFromEvent(e.clientX); });
  volTrack.addEventListener("pointerup", function () { volDrag = false; });
  volTrack.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { state.volume = Math.min(1, state.volume + 0.1); state.muted = false; renderVolume(); e.preventDefault(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { state.volume = Math.max(0, state.volume - 0.1); renderVolume(); e.preventDefault(); }
  });

  function toggleMute() {
    if (state.muted || state.volume === 0) {
      state.muted = false;
      if (state.volume === 0) state.volume = state.prevVolume || 0.8;
      toast("Sound on");
    } else {
      state.prevVolume = state.volume;
      state.muted = true;
      toast("Muted");
    }
    renderVolume();
  }
  muteBtn.addEventListener("click", toggleMute);

  // ── Menus ─────────────────────────────────────────────────────
  function openMenu(menu, btn) {
    closeMenus(menu);
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  }
  function closeMenus(except) {
    [speedMenu, qualMenu].forEach(function (m) {
      if (m !== except && !m.hidden) {
        m.hidden = true;
        var b = m === speedMenu ? speedBtn : qualBtn;
        b.setAttribute("aria-expanded", "false");
      }
    });
  }
  function toggleMenu(menu, btn) {
    if (menu.hidden) openMenu(menu, btn);
    else { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); }
  }

  speedBtn.addEventListener("click", function (e) { e.stopPropagation(); toggleMenu(speedMenu, speedBtn); });
  qualBtn.addEventListener("click", function (e) { e.stopPropagation(); toggleMenu(qualMenu, qualBtn); });

  speedMenu.addEventListener("click", function (e) {
    var item = e.target.closest(".menu-item");
    if (!item) return;
    var sp = parseFloat(item.getAttribute("data-speed"));
    setSpeed(sp, item);
    speedMenu.hidden = true;
    speedBtn.setAttribute("aria-expanded", "false");
  });
  qualMenu.addEventListener("click", function (e) {
    var item = e.target.closest(".menu-item");
    if (!item) return;
    setQuality(item.getAttribute("data-qual"), item);
    qualMenu.hidden = true;
    qualBtn.setAttribute("aria-expanded", "false");
  });

  function setSpeed(sp, item) {
    state.speed = sp;
    speedLabel.textContent = sp === 1 ? "1×" : sp + "×";
    speedMenu.querySelectorAll(".menu-item").forEach(function (m) {
      var on = m === item;
      m.classList.toggle("is-on", on);
      m.setAttribute("aria-checked", on ? "true" : "false");
    });
    rateBadge.hidden = sp === 1;
    rateBadge.textContent = sp + "×";
    toast("Speed " + (sp === 1 ? "normal" : sp + "×"));
  }

  function setQuality(q, item) {
    state.quality = q;
    qualLabel.textContent = q === "Auto" ? "Auto" : q;
    qualMenu.querySelectorAll(".menu-item").forEach(function (m) {
      var on = m === item;
      m.classList.toggle("is-on", on);
      m.setAttribute("aria-checked", on ? "true" : "false");
    });
    toast("Quality · " + q);
  }

  document.addEventListener("click", function () { closeMenus(null); });

  // ── Captions ──────────────────────────────────────────────────
  function toggleCaptions() {
    state.captions = !state.captions;
    ccBtn.setAttribute("aria-pressed", state.captions ? "true" : "false");
    captions.hidden = !state.captions;
    if (state.captions) renderTime();
    toast(state.captions ? "Captions on (English)" : "Captions off");
  }
  ccBtn.addEventListener("click", toggleCaptions);

  // ── Fullscreen (visual only) ──────────────────────────────────
  function toggleFs() {
    shell.classList.toggle("is-fs");
    var on = shell.classList.contains("is-fs");
    fsBtn.setAttribute("aria-label", on ? "Exit fullscreen" : "Fullscreen");
    document.body.style.overflow = on ? "hidden" : "";
    toast(on ? "Fullscreen" : "Exited fullscreen");
  }
  fsBtn.addEventListener("click", toggleFs);

  // ── Mark complete + lesson navigation ─────────────────────────
  markDone.addEventListener("click", function () {
    var done = markDone.classList.toggle("is-done");
    markDone.textContent = done ? "Completed" : "Mark complete";
    var cur = lessons.querySelector(".lesson.is-current");
    if (cur) cur.classList.toggle("is-done", done);
    toast(done ? "Lesson marked complete" : "Marked as not complete");
  });

  lessons.addEventListener("click", function (e) {
    var li = e.target.closest(".lesson");
    if (!li) return;
    lessons.querySelectorAll(".lesson").forEach(function (l) { l.classList.remove("is-current"); l.removeAttribute("aria-current"); });
    li.classList.add("is-current");
    li.setAttribute("aria-current", "true");
    li.classList.remove("is-done");
    var title = li.querySelector(".ln-title").textContent;
    state.time = 0; state.buffered = 0; renderTime(); renderBuffer();
    setPlaying(true);
    toast("Now playing · " + title);
  });

  // ── Keyboard shortcuts ────────────────────────────────────────
  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    // let the sliders handle their own arrow keys
    if ((e.target === scrubber || e.target === volTrack) &&
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(e.key) > -1) return;

    switch (e.key) {
      case " ": case "k": togglePlay(); e.preventDefault(); break;
      case "ArrowLeft": case "j": state.time = Math.max(0, state.time - 5); renderTime(); e.preventDefault(); break;
      case "ArrowRight": case "l": state.time = Math.min(DURATION, state.time + 5); renderTime(); e.preventDefault(); break;
      case "ArrowUp": state.volume = Math.min(1, state.volume + 0.1); state.muted = false; renderVolume(); e.preventDefault(); break;
      case "ArrowDown": state.volume = Math.max(0, state.volume - 0.1); renderVolume(); e.preventDefault(); break;
      case "m": case "M": toggleMute(); break;
      case "c": case "C": toggleCaptions(); break;
      case "f": case "F": toggleFs(); break;
      case "n": case "N": goNext(); break;
      case "Escape": if (shell.classList.contains("is-fs")) toggleFs(); closeMenus(null); break;
    }
  });

  // ── Init ──────────────────────────────────────────────────────
  state.buffered = 95;
  renderTime();
  renderBuffer();
  renderVolume();
})();
