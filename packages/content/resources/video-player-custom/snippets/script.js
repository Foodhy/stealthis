(function () {
  "use strict";

  var player = document.getElementById("player");
  var video = document.getElementById("video");
  var bigPlay = document.getElementById("bigPlay");
  var playBtn = document.getElementById("playBtn");
  var backBtn = document.getElementById("backBtn");
  var fwdBtn = document.getElementById("fwdBtn");
  var muteBtn = document.getElementById("muteBtn");
  var volRange = document.getElementById("volRange");
  var volWrap = document.getElementById("vol");
  var fsBtn = document.getElementById("fsBtn");
  var pipBtn = document.getElementById("pipBtn");

  var scrub = document.getElementById("scrub");
  var buffered = document.getElementById("buffered");
  var played = document.getElementById("played");
  var thumb = document.getElementById("thumb");
  var bubble = document.getElementById("bubble");
  var markers = document.getElementById("markers");

  var curEl = document.getElementById("current");
  var durEl = document.getElementById("duration");

  var chapMenu = document.getElementById("chapMenu");
  var chapBtn = document.getElementById("chapBtn");
  var chapPanel = document.getElementById("chapPanel");
  var speedMenu = document.getElementById("speedMenu");
  var speedBtn = document.getElementById("speedBtn");
  var speedPanel = document.getElementById("speedPanel");
  var speedLabel = document.getElementById("speedLabel");

  var railList = document.getElementById("railList");
  var railCount = document.getElementById("railCount");
  var toastEl = document.getElementById("toast");
  var skipLeft = document.getElementById("skipLeft");
  var skipRight = document.getElementById("skipRight");

  /* ---- Chapters (fractions of duration, resolved once metadata loads) ---- */
  var CHAPTERS = [
    { f: 0.0, name: "Cold Open", desc: "Establishing wide, no dialogue" },
    { f: 0.16, name: "Golden Hour", desc: "Backlit dolly across the field" },
    { f: 0.34, name: "The Reveal", desc: "Rack focus to the subject" },
    { f: 0.55, name: "Chase Cut", desc: "Handheld, rapid intercutting" },
    { f: 0.74, name: "Quiet Beat", desc: "Slow push-in, ambient score" },
    { f: 0.88, name: "End Card", desc: "Fade to credits, title lockup" }
  ];
  var SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  var DUR = 0;
  var scrubbing = false;
  var uiTimer = null;

  /* ---------------- helpers ---------------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    t = Math.floor(t);
    var h = Math.floor(t / 3600);
    var m = Math.floor((t % 3600) / 60);
    var s = t % 60;
    return h > 0 ? h + ":" + pad(m) + ":" + pad(s) : pad(m) + ":" + pad(s);
  }

  var toastTimer;
  function toast(msg) {
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1500);
  }

  function flash(el) {
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
  }

  /* ---------------- UI auto-hide ---------------- */
  function showUI() {
    player.classList.remove("hide-ui");
    clearTimeout(uiTimer);
    if (!video.paused) {
      uiTimer = setTimeout(function () {
        if (!video.paused && !anyMenuOpen()) player.classList.add("hide-ui");
      }, 2200);
    }
  }
  function anyMenuOpen() {
    return chapMenu.classList.contains("open") || speedMenu.classList.contains("open");
  }
  player.addEventListener("mousemove", showUI);
  player.addEventListener("mouseleave", function () {
    if (!video.paused && !anyMenuOpen()) player.classList.add("hide-ui");
  });
  ["focusin", "touchstart"].forEach(function (ev) { player.addEventListener(ev, showUI); });

  /* ---------------- play / pause ---------------- */
  function togglePlay() {
    if (video.paused) { video.play().catch(function () {}); }
    else { video.pause(); }
  }
  video.addEventListener("play", function () {
    player.classList.add("playing");
    playBtn.setAttribute("aria-label", "Pause");
    playBtn.setAttribute("aria-pressed", "true");
    showUI();
  });
  video.addEventListener("pause", function () {
    player.classList.remove("playing");
    player.classList.remove("hide-ui");
    playBtn.setAttribute("aria-label", "Play");
    playBtn.setAttribute("aria-pressed", "false");
    clearTimeout(uiTimer);
  });
  bigPlay.addEventListener("click", togglePlay);
  playBtn.addEventListener("click", togglePlay);
  video.addEventListener("click", togglePlay);

  function skip(sec) {
    video.currentTime = Math.min(Math.max(0, video.currentTime + sec), DUR || video.duration || 0);
    flash(sec < 0 ? skipLeft : skipRight);
  }
  backBtn.addEventListener("click", function () { skip(-10); });
  fwdBtn.addEventListener("click", function () { skip(10); });

  /* ---------------- volume ---------------- */
  function applyVolumeUI() {
    var muted = video.muted || video.volume === 0;
    volWrap.classList.toggle("muted", muted);
    muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
    volRange.value = video.muted ? 0 : video.volume;
  }
  volRange.addEventListener("input", function () {
    video.volume = parseFloat(volRange.value);
    video.muted = video.volume === 0;
    applyVolumeUI();
  });
  muteBtn.addEventListener("click", function () {
    video.muted = !video.muted;
    applyVolumeUI();
    toast(video.muted ? "Muted" : "Volume " + Math.round(video.volume * 100) + "%");
  });
  video.addEventListener("volumechange", applyVolumeUI);

  /* ---------------- timeline ---------------- */
  function renderProgress() {
    var d = DUR || video.duration || 0;
    var pct = d ? (video.currentTime / d) * 100 : 0;
    played.style.width = pct + "%";
    thumb.style.left = pct + "%";
    curEl.textContent = fmt(video.currentTime);
    scrub.setAttribute("aria-valuenow", Math.round(pct));
    scrub.setAttribute("aria-valuetext", fmt(video.currentTime) + " of " + fmt(d));
    updateActiveChapter();
  }
  function renderBuffered() {
    var d = DUR || video.duration || 0;
    if (!d || !video.buffered.length) return;
    var end = 0;
    for (var i = 0; i < video.buffered.length; i++) {
      if (video.buffered.start(i) <= video.currentTime) end = video.buffered.end(i);
    }
    if (!end) end = video.buffered.end(video.buffered.length - 1);
    buffered.style.width = Math.min(100, (end / d) * 100) + "%";
  }
  video.addEventListener("timeupdate", function () { renderProgress(); renderBuffered(); });
  video.addEventListener("progress", renderBuffered);

  function seekRatio(r) {
    r = Math.min(1, Math.max(0, r));
    var d = DUR || video.duration || 0;
    if (d) video.currentTime = r * d;
  }
  function ratioFromEvent(e) {
    var rect = scrub.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return rect.width ? x / rect.width : 0;
  }
  function moveBubble(r) {
    r = Math.min(1, Math.max(0, r));
    bubble.style.left = r * 100 + "%";
    var d = DUR || video.duration || 0;
    bubble.textContent = fmt(r * d);
  }

  scrub.addEventListener("mousemove", function (e) {
    if (!scrubbing) moveBubble(ratioFromEvent(e));
  });
  scrub.addEventListener("mousedown", function (e) {
    scrubbing = true;
    scrub.classList.add("active");
    var r = ratioFromEvent(e);
    seekRatio(r); moveBubble(r); renderProgress();
  });
  window.addEventListener("mousemove", function (e) {
    if (!scrubbing) return;
    var r = ratioFromEvent(e);
    seekRatio(r); moveBubble(r); renderProgress();
  });
  window.addEventListener("mouseup", function () {
    if (scrubbing) { scrubbing = false; scrub.classList.remove("active"); }
  });
  // touch
  scrub.addEventListener("touchstart", function (e) {
    scrubbing = true; scrub.classList.add("active");
    var r = ratioFromEvent(e); seekRatio(r); moveBubble(r);
  }, { passive: true });
  scrub.addEventListener("touchmove", function (e) {
    if (!scrubbing) return;
    var r = ratioFromEvent(e); seekRatio(r); moveBubble(r);
  }, { passive: true });
  scrub.addEventListener("touchend", function () { scrubbing = false; scrub.classList.remove("active"); });

  // keyboard on the slider itself
  scrub.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { skip(5); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { skip(-5); e.preventDefault(); }
    else if (e.key === "Home") { seekRatio(0); e.preventDefault(); }
    else if (e.key === "End") { seekRatio(0.999); e.preventDefault(); }
  });

  /* ---------------- chapters ---------------- */
  function buildChapters() {
    var d = DUR || video.duration || 0;
    markers.innerHTML = "";
    chapPanel.innerHTML = "";
    railList.innerHTML = "";
    CHAPTERS.forEach(function (c, i) {
      c.t = c.f * d;
      // marker
      var mk = document.createElement("div");
      mk.className = "marker";
      mk.style.left = c.f * 100 + "%";
      markers.appendChild(mk);
      // menu item
      var li = document.createElement("li");
      var mi = document.createElement("button");
      mi.className = "menu-item";
      mi.setAttribute("role", "menuitem");
      mi.dataset.idx = i;
      mi.innerHTML = "<span>" + c.name + "</span><span class='mi-time'>" + fmt(c.t) + "</span>";
      mi.addEventListener("click", function () { jumpTo(i); closeMenus(); });
      li.appendChild(mi);
      chapPanel.appendChild(li);
      // rail item
      var ri = document.createElement("li");
      var rb = document.createElement("button");
      rb.className = "rail-item";
      rb.dataset.idx = i;
      rb.innerHTML =
        "<span class='rail-num'>" + pad(i + 1) + "</span>" +
        "<span class='rail-body'><span class='rail-name'>" + c.name + "</span>" +
        "<span class='rail-desc'>" + c.desc + "</span>" +
        "<span class='rail-bar'><span></span></span></span>" +
        "<span class='rail-time'>" + fmt(c.t) + "</span>";
      rb.addEventListener("click", function () { jumpTo(i); });
      ri.appendChild(rb);
      railList.appendChild(ri);
    });
    railCount.textContent = CHAPTERS.length + " marks";
  }

  function jumpTo(i) {
    var c = CHAPTERS[i];
    if (!c) return;
    video.currentTime = c.t + 0.05;
    toast("Chapter " + (i + 1) + " &middot; <span class='t-mono'>" + fmt(c.t) + "</span> " + c.name);
    if (video.paused) renderProgress();
  }

  function currentChapterIndex() {
    var t = video.currentTime, idx = 0;
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (t >= CHAPTERS[i].t - 0.01) idx = i;
    }
    return idx;
  }
  var lastChap = -1;
  function updateActiveChapter() {
    var idx = currentChapterIndex();
    // rail highlight + progress within chapter
    var railItems = railList.querySelectorAll(".rail-item");
    railItems.forEach(function (el) {
      var on = parseInt(el.dataset.idx, 10) === idx;
      el.classList.toggle("active", on);
      if (on) {
        var start = CHAPTERS[idx].t;
        var end = CHAPTERS[idx + 1] ? CHAPTERS[idx + 1].t : (DUR || video.duration || start + 1);
        var span = end - start || 1;
        var p = Math.min(100, Math.max(0, ((video.currentTime - start) / span) * 100));
        var bar = el.querySelector(".rail-bar span");
        if (bar) bar.style.width = p + "%";
      }
    });
    // menu active
    if (idx !== lastChap) {
      chapPanel.querySelectorAll(".menu-item").forEach(function (el) {
        el.classList.toggle("active", parseInt(el.dataset.idx, 10) === idx);
      });
      lastChap = idx;
    }
  }

  /* ---------------- speed menu ---------------- */
  function buildSpeeds() {
    speedPanel.innerHTML = "";
    SPEEDS.forEach(function (s) {
      var li = document.createElement("li");
      var mi = document.createElement("button");
      mi.className = "menu-item" + (s === 1 ? " active" : "");
      mi.setAttribute("role", "menuitem");
      mi.dataset.speed = s;
      mi.innerHTML = "<span class='speed-mono'>" + s.toFixed(2).replace(/0$/, "") + "&times;</span><span class='mi-check'>&check;</span>";
      mi.addEventListener("click", function () { setSpeed(s); closeMenus(); });
      li.appendChild(mi);
      speedPanel.appendChild(li);
    });
  }
  function setSpeed(s) {
    video.playbackRate = s;
    speedLabel.innerHTML = (s === 1 ? "1.0" : String(s)) + "&times;";
    speedPanel.querySelectorAll(".menu-item").forEach(function (el) {
      el.classList.toggle("active", parseFloat(el.dataset.speed) === s);
    });
    toast("Speed <span class='t-mono'>" + s + "&times;</span>");
  }

  /* ---------------- menus open/close ---------------- */
  function closeMenus() {
    chapMenu.classList.remove("open");
    speedMenu.classList.remove("open");
    chapBtn.setAttribute("aria-expanded", "false");
    speedBtn.setAttribute("aria-expanded", "false");
  }
  function toggleMenu(menu, btn) {
    var open = menu.classList.contains("open");
    closeMenus();
    if (!open) { menu.classList.add("open"); btn.setAttribute("aria-expanded", "true"); showUI(); }
  }
  chapBtn.addEventListener("click", function (e) { e.stopPropagation(); toggleMenu(chapMenu, chapBtn); });
  speedBtn.addEventListener("click", function (e) { e.stopPropagation(); toggleMenu(speedMenu, speedBtn); });
  document.addEventListener("click", function (e) {
    if (!chapMenu.contains(e.target) && !speedMenu.contains(e.target)) closeMenus();
  });

  /* ---------------- fullscreen ---------------- */
  fsBtn.addEventListener("click", function () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (player.requestFullscreen) {
      player.requestFullscreen().catch(function () { toast("Fullscreen blocked"); });
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    } else {
      toast("Fullscreen not supported");
    }
  });
  document.addEventListener("fullscreenchange", function () {
    var fs = !!document.fullscreenElement;
    player.classList.toggle("is-fs", fs);
    fsBtn.setAttribute("aria-label", fs ? "Exit fullscreen" : "Fullscreen");
  });

  /* ---------------- picture in picture ---------------- */
  pipBtn.addEventListener("click", function () {
    if (!document.pictureInPictureEnabled) { toast("PiP not supported"); return; }
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else {
      video.requestPictureInPicture().catch(function () { toast("PiP unavailable"); });
    }
  });

  /* ---------------- keyboard shortcuts (global) ---------------- */
  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target === scrub && (e.key.indexOf("Arrow") === 0)) return; // slider handles its own

    var k = e.key;
    if (k === " " || k === "k" || k === "K") { togglePlay(); e.preventDefault(); }
    else if (k === "j" || k === "J") { skip(-10); e.preventDefault(); }
    else if (k === "l" || k === "L") { skip(10); e.preventDefault(); }
    else if (k === "ArrowRight") { skip(5); e.preventDefault(); }
    else if (k === "ArrowLeft") { skip(-5); e.preventDefault(); }
    else if (k === "ArrowUp") { video.muted = false; video.volume = Math.min(1, video.volume + 0.1); applyVolumeUI(); toast("Volume " + Math.round(video.volume * 100) + "%"); e.preventDefault(); }
    else if (k === "ArrowDown") { video.volume = Math.max(0, video.volume - 0.1); video.muted = video.volume === 0; applyVolumeUI(); toast(video.muted ? "Muted" : "Volume " + Math.round(video.volume * 100) + "%"); e.preventDefault(); }
    else if (k === "m" || k === "M") { video.muted = !video.muted; applyVolumeUI(); toast(video.muted ? "Muted" : "Unmuted"); e.preventDefault(); }
    else if (k === "f" || k === "F") { fsBtn.click(); e.preventDefault(); }
    else if (k === "c" || k === "C") { toggleMenu(chapMenu, chapBtn); e.preventDefault(); }
    else if (/^[0-9]$/.test(k)) { seekRatio(parseInt(k, 10) / 10); showUI(); e.preventDefault(); }
    else if (k === "Escape") { closeMenus(); }
  });

  /* ---------------- metadata / fallback simulation ---------------- */
  function init() {
    DUR = video.duration && isFinite(video.duration) ? video.duration : 0;
    durEl.textContent = fmt(DUR);
    buildChapters();
    renderProgress();
    renderBuffered();
  }
  video.addEventListener("loadedmetadata", init);
  video.addEventListener("ended", function () {
    player.classList.remove("playing", "hide-ui");
    toast("Playback complete");
  });

  buildSpeeds();
  applyVolumeUI();

  // If the sample video can't load, simulate a 3:20 clip so the UI stays alive.
  var simmed = false;
  video.addEventListener("error", startSim);
  setTimeout(function () {
    if (!DUR && (video.readyState === 0)) startSim();
  }, 3500);

  function startSim() {
    if (simmed || DUR) return;
    simmed = true;
    DUR = 200; // 3:20
    var simTime = 0, simPlaying = false, raf = null, last = 0;
    durEl.textContent = fmt(DUR);
    buildChapters();

    Object.defineProperty(video, "duration", { configurable: true, get: function () { return DUR; } });
    Object.defineProperty(video, "currentTime", {
      configurable: true,
      get: function () { return simTime; },
      set: function (v) { simTime = Math.min(Math.max(0, v), DUR); renderSim(); }
    });
    Object.defineProperty(video, "paused", { configurable: true, get: function () { return !simPlaying; } });
    Object.defineProperty(video, "buffered", {
      configurable: true,
      get: function () {
        var end = Math.min(DUR, simTime + 28);
        return { length: 1, start: function () { return 0; }, end: function () { return end; } };
      }
    });
    video.play = function () {
      simPlaying = true;
      video.dispatchEvent(new Event("play"));
      last = performance.now();
      loop();
      return Promise.resolve();
    };
    video.pause = function () {
      simPlaying = false;
      if (raf) cancelAnimationFrame(raf);
      video.dispatchEvent(new Event("pause"));
    };
    function loop() {
      if (!simPlaying) return;
      var now = performance.now();
      simTime += ((now - last) / 1000) * (video.playbackRate || 1);
      last = now;
      if (simTime >= DUR) { simTime = DUR; simPlaying = false; renderSim(); video.dispatchEvent(new Event("pause")); video.dispatchEvent(new Event("ended")); return; }
      renderSim();
      raf = requestAnimationFrame(loop);
    }
    function renderSim() { renderProgress(); renderBuffered(); }
    renderSim();
    toast("Demo mode &middot; simulated <span class='t-mono'>3:20</span> reel");
  }

  // Try to read metadata immediately if already available
  if (video.readyState >= 1) init();
})();
