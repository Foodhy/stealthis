(function () {
  "use strict";

  // ---- Simulated playback model ----
  const DURATION = 2645; // seconds (~44 min episode)
  const INTRO_START = 12;
  const INTRO_END = 78;
  const NEXTUP_AT = DURATION - 26;

  const player = document.getElementById("player");
  const stage = document.getElementById("stage");
  const spinner = document.getElementById("spinner");
  const centerPlay = document.getElementById("centerPlay");
  const playToggle = document.getElementById("playToggle");
  const rewind = document.getElementById("rewind");
  const forward = document.getElementById("forward");
  const scrub = document.getElementById("scrub");
  const scrubBuffer = document.getElementById("scrubBuffer");
  const scrubPlayed = document.getElementById("scrubPlayed");
  const scrubThumb = document.getElementById("scrubThumb");
  const scrubTip = document.getElementById("scrubTip");
  const timeEl = document.getElementById("time");
  const curEl = timeEl.firstChild;
  const durEl = document.getElementById("dur");
  const vol = document.getElementById("vol");
  const muteBtn = document.getElementById("muteBtn");
  const volSlider = document.getElementById("volSlider");
  const ccBtn = document.getElementById("ccBtn");
  const captions = document.getElementById("captions");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsMenu = document.getElementById("settingsMenu");
  const skipIntro = document.getElementById("skipIntro");
  const nextup = document.getElementById("nextup");
  const nextCount = document.getElementById("nextCount");
  const nextPlay = document.getElementById("nextPlay");
  const nextCancel = document.getElementById("nextCancel");
  const nextEpBtn = document.getElementById("nextEpBtn");
  const fsBtn = document.getElementById("fsBtn");
  const backBtn = document.getElementById("backBtn");
  const toastEl = document.getElementById("toast");

  let current = 0;
  let buffered = 24;
  let playing = false;
  let muted = false;
  let lastVol = 80;
  let ccOn = true;
  let speed = 1;
  let dragging = false;
  let nextupActive = false;
  let nextupTimer = null;
  let nextupRemain = 8;

  // ---- Helpers ----
  function fmt(s) {
    s = Math.max(0, Math.floor(s));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const mm = h ? String(m).padStart(2, "0") : m;
    return (h ? h + ":" : "") + mm + ":" + String(sec).padStart(2, "0");
  }

  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1700);
  }

  // ---- Caption track ----
  const cues = [
    [80, 86, "Nebula Originals presents"],
    [86, 92, "Aurora Drift"],
    [120, 126, "— You feel that? The hull's singing again."],
    [126, 133, "That's not the hull. That's the rift answering us."],
    [180, 187, "Set a course. We follow the signal."],
    [240, 248, "Whatever's out there… it knew we were coming."]
  ];
  function updateCaptions() {
    if (!ccOn) { captions.innerHTML = ""; return; }
    const cue = cues.find((c) => current >= c[0] && current < c[1]);
    captions.innerHTML = cue ? "<span>" + cue[2] + "</span>" : "";
  }

  // ---- Render ----
  function render() {
    const pct = (current / DURATION) * 100;
    scrubPlayed.style.width = pct + "%";
    scrubThumb.style.left = pct + "%";
    scrubBuffer.style.width = Math.min(100, buffered) + "%";
    scrub.setAttribute("aria-valuenow", Math.round(pct));
    scrub.setAttribute("aria-valuetext", fmt(current) + " of " + fmt(DURATION));
    curEl.textContent = fmt(current) + " ";
    durEl.textContent = fmt(DURATION);

    skipIntro.hidden = !(current >= INTRO_START && current < INTRO_END);

    if (current >= NEXTUP_AT && !nextupActive) showNextUp();
    if (current < NEXTUP_AT && nextupActive) hideNextUp(false);

    updateCaptions();
  }

  // ---- Playback tick ----
  let tickId = null;
  function startTick() {
    if (tickId) return;
    let last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (playing && !dragging) {
        current = Math.min(DURATION, current + dt * speed);
        if (buffered < 100) buffered = Math.min(100, Math.max(buffered, (current / DURATION) * 100 + 14));
        if (current >= DURATION) pause();
        render();
      }
      tickId = requestAnimationFrame(loop);
    };
    tickId = requestAnimationFrame(loop);
  }

  // ---- Play / pause with buffering sim ----
  let bufferTimer = null;
  function play() {
    if (current >= DURATION) current = 0;
    spinner.hidden = false;
    centerPlay.setAttribute("aria-label", "Pause");
    clearTimeout(bufferTimer);
    bufferTimer = setTimeout(() => {
      spinner.hidden = true;
      playing = true;
      player.classList.add("playing");
      playToggle.setAttribute("aria-label", "Pause");
      startTick();
      scheduleHide();
    }, 480);
  }
  function pause() {
    playing = false;
    spinner.hidden = true;
    player.classList.remove("playing");
    playToggle.setAttribute("aria-label", "Play");
    centerPlay.setAttribute("aria-label", "Play");
    showControls();
  }
  function togglePlay() { playing ? pause() : play(); }

  // ---- Seeking ----
  function seekTo(sec) {
    current = Math.max(0, Math.min(DURATION, sec));
    if (current > buffered / 100 * DURATION) buffered = Math.min(100, (current / DURATION) * 100 + 6);
    render();
  }
  function pointerToTime(clientX) {
    const r = scrub.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return ratio * DURATION;
  }

  scrub.addEventListener("pointerdown", (e) => {
    dragging = true;
    scrub.classList.add("dragging");
    scrub.setPointerCapture(e.pointerId);
    seekTo(pointerToTime(e.clientX));
  });
  scrub.addEventListener("pointermove", (e) => {
    const t = pointerToTime(e.clientX);
    scrubTip.hidden = false;
    scrubTip.textContent = fmt(t);
    const r = scrub.getBoundingClientRect();
    scrubTip.style.left = (e.clientX - r.left) + "px";
    if (dragging) seekTo(t);
  });
  scrub.addEventListener("pointerleave", () => { if (!dragging) scrubTip.hidden = true; });
  scrub.addEventListener("pointerup", (e) => {
    dragging = false;
    scrub.classList.remove("dragging");
    scrubTip.hidden = true;
    try { scrub.releasePointerCapture(e.pointerId); } catch (_) {}
  });
  scrub.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 60 : 10;
    if (e.key === "ArrowRight") { seekTo(current + step); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { seekTo(current - step); e.preventDefault(); }
    else if (e.key === "Home") { seekTo(0); e.preventDefault(); }
    else if (e.key === "End") { seekTo(DURATION); e.preventDefault(); }
  });

  // ---- Controls bindings ----
  centerPlay.addEventListener("click", togglePlay);
  playToggle.addEventListener("click", togglePlay);
  stage.addEventListener("click", (e) => {
    if (e.target === stage || e.target.classList.contains("backdrop") || e.target.classList.contains("grain")) {
      togglePlay();
    }
  });
  rewind.addEventListener("click", () => { seekTo(current - 10); toast("− 10s"); showControls(); });
  forward.addEventListener("click", () => { seekTo(current + 10); toast("+ 10s"); showControls(); });

  // volume
  function applyVolume() {
    muted = lastVol === 0;
    vol.classList.toggle("muted", muted || volSlider.value === "0");
    volSlider.value = muted ? 0 : lastVol;
  }
  muteBtn.addEventListener("click", () => {
    if (muted || lastVol === 0) {
      lastVol = lastVol === 0 ? 80 : lastVol;
      muted = false;
      volSlider.value = lastVol;
      vol.classList.remove("muted");
      toast("Unmuted");
    } else {
      muted = true;
      vol.classList.add("muted");
      toast("Muted");
    }
  });
  volSlider.addEventListener("input", () => {
    lastVol = +volSlider.value;
    muted = lastVol === 0;
    vol.classList.toggle("muted", muted);
  });

  // captions
  ccBtn.addEventListener("click", () => {
    ccOn = !ccOn;
    ccBtn.classList.toggle("is-off", !ccOn);
    ccBtn.setAttribute("aria-pressed", String(ccOn));
    captions.classList.toggle("off", !ccOn);
    toast(ccOn ? "Subtitles: English" : "Subtitles off");
    updateCaptions();
  });

  // ---- Settings menu ----
  function openMenu() {
    settingsMenu.hidden = false;
    settingsBtn.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    settingsMenu.hidden = true;
    settingsBtn.setAttribute("aria-expanded", "false");
  }
  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsMenu.hidden ? openMenu() : closeMenu();
  });
  document.addEventListener("click", (e) => {
    if (!settingsMenu.hidden && !settingsMenu.contains(e.target) && e.target !== settingsBtn) closeMenu();
  });

  // tabs
  settingsMenu.querySelectorAll(".menu-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const pane = tab.dataset.pane;
      settingsMenu.querySelectorAll(".menu-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
      settingsMenu.querySelectorAll(".menu-pane").forEach((p) => { p.hidden = p.dataset.pane !== pane; });
    });
  });
  // options
  settingsMenu.querySelectorAll(".menu-pane").forEach((pane) => {
    pane.querySelectorAll(".menu-opt").forEach((opt) => {
      opt.addEventListener("click", () => {
        pane.querySelectorAll(".menu-opt").forEach((o) => {
          o.classList.toggle("is-active", o === opt);
          o.setAttribute("aria-checked", String(o === opt));
        });
        if (opt.dataset.q) toast("Quality: " + opt.dataset.q);
        if (opt.dataset.s) { speed = +opt.dataset.s; toast("Speed: " + (speed === 1 ? "Normal" : speed + "×")); }
        if (opt.dataset.a) toast("Audio: " + opt.textContent.trim());
        keepAlive();
      });
    });
  });

  // skip intro
  skipIntro.addEventListener("click", () => {
    seekTo(INTRO_END);
    skipIntro.hidden = true;
    toast("Skipped intro");
    if (!playing) play();
  });

  // ---- Next-up ----
  function showNextUp() {
    nextupActive = true;
    nextup.hidden = false;
    nextupRemain = 8;
    nextCount.textContent = nextupRemain;
    nextEpBtn.classList.add("pulse");
    clearInterval(nextupTimer);
    nextupTimer = setInterval(() => {
      nextupRemain -= 1;
      nextCount.textContent = Math.max(0, nextupRemain);
      if (nextupRemain <= 0) playNext();
    }, 1000);
  }
  function hideNextUp(silent) {
    nextupActive = false;
    nextup.hidden = true;
    nextEpBtn.classList.remove("pulse");
    clearInterval(nextupTimer);
    if (!silent) toast("Staying on this episode");
  }
  function playNext() {
    clearInterval(nextupTimer);
    nextup.hidden = true;
    nextupActive = false;
    nextEpBtn.classList.remove("pulse");
    current = 0;
    buffered = 18;
    document.querySelector(".title-block .ep").textContent = "S2 · E5 — “Signal Lost”";
    toast("Now playing: S2 · E5");
    render();
    play();
  }
  nextPlay.addEventListener("click", playNext);
  nextCancel.addEventListener("click", () => hideNextUp(false));
  nextEpBtn.addEventListener("click", playNext);

  // ---- Fullscreen ----
  fsBtn.addEventListener("click", () => {
    const exit = player.classList.contains("is-fs");
    fsBtn.querySelector(".icon-fs").style.display = exit ? "" : "none";
    fsBtn.querySelector(".icon-fs-exit").style.display = exit ? "none" : "block";
    try {
      if (exit && document.fullscreenElement) document.exitFullscreen();
      else if (!exit && player.requestFullscreen) player.requestFullscreen();
    } catch (_) {}
    player.classList.toggle("is-fs");
    toast(exit ? "Exited fullscreen" : "Fullscreen");
  });

  backBtn.addEventListener("click", () => toast("Returning to browse…"));

  // ---- Auto-hide controls ----
  let hideTimer = null;
  function showControls() {
    player.classList.remove("controls-hidden", "hide-cursor");
  }
  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (playing && !dragging && settingsMenu.hidden && !nextupActive) {
        player.classList.add("controls-hidden", "hide-cursor");
      }
    }, 3000);
  }
  function keepAlive() { showControls(); if (playing) scheduleHide(); }

  player.addEventListener("pointermove", keepAlive);
  player.addEventListener("pointerdown", keepAlive);
  player.addEventListener("focusin", keepAlive);

  // ---- Keyboard shortcuts ----
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    switch (e.key) {
      case " ":
      case "k": e.preventDefault(); togglePlay(); keepAlive(); break;
      case "ArrowRight": seekTo(current + 10); keepAlive(); break;
      case "ArrowLeft": seekTo(current - 10); keepAlive(); break;
      case "ArrowUp": lastVol = Math.min(100, lastVol + 5); volSlider.value = lastVol; applyVolume(); keepAlive(); break;
      case "ArrowDown": lastVol = Math.max(0, lastVol - 5); volSlider.value = lastVol; applyVolume(); keepAlive(); break;
      case "m": muteBtn.click(); break;
      case "c": ccBtn.click(); break;
      case "f": fsBtn.click(); break;
      case "n": playNext(); break;
      case "Escape": if (!settingsMenu.hidden) closeMenu(); break;
    }
  });

  // ---- Init ----
  render();
  startTick();
})();
