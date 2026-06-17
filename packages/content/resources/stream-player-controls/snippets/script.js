(function () {
  "use strict";

  /* ---------------- elements ---------------- */
  const $ = (id) => document.getElementById(id);
  const player = $("player");
  const scrub = $("scrub");
  const played = $("played");
  const buffered = $("buffered");
  const handle = $("handle");
  const tip = $("tip");
  const tipTime = $("tipTime");
  const curEl = $("cur");
  const durEl = $("dur");
  const volSlider = $("volSlider");
  const volFill = $("volFill");
  const volHandle = $("volHandle");
  const vol = $("vol");
  const settingsBtn = $("settingsBtn");
  const settingsMenu = $("settingsMenu");
  const ccBtn = $("cc");
  const upnext = $("upnext");
  const qualityBadge = $("qualityBadge");
  const toastEl = $("toast");

  /* ---------------- state ---------------- */
  const DURATION = 48 * 60 + 12; // 48:12 in seconds
  const state = {
    time: 0,
    playing: false,
    volume: 0.8,
    prevVolume: 0.8,
    muted: false,
    captions: false,
    buffering: false,
    seeking: false,
  };
  const settings = { quality: "Auto (4K)", speed: "1x", audio: "English 5.1", subs: "English" };

  /* ---------------- helpers ---------------- */
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 1900);
  }

  function fmt(s) {
    s = Math.max(0, Math.round(s));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const mm = h ? String(m).padStart(2, "0") : String(m);
    return (h ? h + ":" : "") + mm + ":" + String(sec).padStart(2, "0");
  }

  /* ---------------- render ---------------- */
  function renderProgress() {
    const pct = (state.time / DURATION) * 100;
    played.style.width = pct + "%";
    handle.style.left = pct + "%";
    curEl.textContent = fmt(state.time);
    scrub.setAttribute("aria-valuenow", Math.round(pct));
    scrub.setAttribute("aria-valuetext", fmt(state.time) + " of " + fmt(DURATION));
    // up-next surfaces near the end
    const remaining = DURATION - state.time;
    upnext.hidden = remaining > 40;
  }

  function renderVolume() {
    const v = state.muted ? 0 : state.volume;
    volFill.style.width = v * 100 + "%";
    volHandle.style.left = v * 100 + "%";
    volSlider.setAttribute("aria-valuenow", Math.round(v * 100));
    player.classList.toggle("muted", state.muted || state.volume === 0);
  }

  function renderPlaying() {
    player.classList.toggle("playing", state.playing);
    const lbl = state.playing ? "Pause" : "Play";
    $("playToggle").setAttribute("aria-label", lbl);
    $("centerToggle").setAttribute("aria-label", lbl);
    $("bigplay").setAttribute("aria-label", lbl);
  }

  durEl.textContent = fmt(DURATION);
  renderProgress();
  renderVolume();

  /* ---------------- buffered simulation ---------------- */
  let bufferedPct = 18;
  function tickBuffer() {
    const target = Math.min(100, (state.time / DURATION) * 100 + 22);
    bufferedPct += (target - bufferedPct) * 0.12;
    buffered.style.width = Math.min(100, bufferedPct) + "%";
  }

  /* ---------------- playback loop ---------------- */
  let lastT = performance.now();
  function loop(now) {
    const dt = (now - lastT) / 1000;
    lastT = now;
    if (state.playing && !state.seeking && !state.buffering) {
      state.time += dt;
      if (state.time >= DURATION) {
        state.time = DURATION;
        play(false);
        toast("Episode finished — Up next in 5s");
      }
      renderProgress();
    }
    tickBuffer();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------------- play / pause ---------------- */
  function play(on) {
    state.playing = on;
    renderPlaying();
    if (on) showUI(true), scheduleHide();
    else clearTimeout(hideT), player.classList.add("show-ui");
  }
  function toggle() {
    play(!state.playing);
    bumpUI();
  }

  ["playToggle", "centerToggle", "bigplay"].forEach((id) =>
    $(id).addEventListener("click", (e) => { e.stopPropagation(); toggle(); })
  );

  /* brief buffering flash when seeking far */
  function flashBuffer(ms) {
    state.buffering = true;
    player.classList.add("buffering");
    clearTimeout(flashBuffer._t);
    flashBuffer._t = setTimeout(() => {
      state.buffering = false;
      player.classList.remove("buffering");
    }, ms);
  }

  /* ---------------- skip ---------------- */
  function seekBy(delta) {
    state.time = Math.min(DURATION, Math.max(0, state.time + delta));
    renderProgress();
    bumpUI();
  }
  $("rewind").addEventListener("click", (e) => { e.stopPropagation(); seekBy(-10); toast("⏪ 10 seconds"); });
  $("forward").addEventListener("click", (e) => { e.stopPropagation(); seekBy(10); toast("⏩ 10 seconds"); });

  $("prev").addEventListener("click", (e) => { e.stopPropagation(); toast("◀ Previous episode"); });
  $("next").addEventListener("click", (e) => { e.stopPropagation(); state.time = 0; renderProgress(); flashBuffer(700); toast("▶ Next episode · E5 Saltwater Vows"); });
  $("back").addEventListener("click", (e) => { e.stopPropagation(); toast("Back to browse"); });

  /* ---------------- scrubber ---------------- */
  function pctFromX(clientX, el) {
    const r = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  }
  function updateTip(p) {
    const r = scrub.getBoundingClientRect();
    tip.style.left = p * r.width + "px";
    tipTime.textContent = fmt(p * DURATION);
  }

  scrub.addEventListener("pointermove", (e) => {
    if (state.seeking) return;
    scrub.classList.add("show-tip");
    updateTip(pctFromX(e.clientX, scrub));
  });
  scrub.addEventListener("pointerleave", () => { if (!state.seeking) scrub.classList.remove("show-tip"); });

  scrub.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    state.seeking = true;
    scrub.classList.add("dragging", "show-tip");
    scrub.setPointerCapture(e.pointerId);
    applySeek(e.clientX);
  });
  scrub.addEventListener("pointermove", (e) => {
    if (!state.seeking) return;
    applySeek(e.clientX);
  });
  function endSeek(e) {
    if (!state.seeking) return;
    state.seeking = false;
    scrub.classList.remove("dragging");
    if (e && e.pointerType !== "mouse") scrub.classList.remove("show-tip");
    flashBuffer(450);
    bumpUI();
  }
  scrub.addEventListener("pointerup", endSeek);
  scrub.addEventListener("pointercancel", endSeek);

  function applySeek(clientX) {
    const p = pctFromX(clientX, scrub);
    state.time = p * DURATION;
    updateTip(p);
    renderProgress();
  }

  scrub.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 30 : 10;
    if (e.key === "ArrowRight") { seekBy(step); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { seekBy(-step); e.preventDefault(); }
    else if (e.key === "Home") { state.time = 0; renderProgress(); e.preventDefault(); }
    else if (e.key === "End") { state.time = DURATION; renderProgress(); e.preventDefault(); }
  });

  /* ---------------- volume ---------------- */
  function setVolume(v, announce) {
    v = Math.min(1, Math.max(0, v));
    state.volume = v;
    state.muted = v === 0;
    if (v > 0) state.prevVolume = v;
    renderVolume();
    if (announce) toast("Volume " + Math.round(v * 100) + "%");
  }
  function applyVol(clientX) { setVolume(pctFromX(clientX, volSlider)); }

  volSlider.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    volSlider.setPointerCapture(e.pointerId);
    volSlider._drag = true;
    vol.classList.add("open");
    applyVol(e.clientX);
  });
  volSlider.addEventListener("pointermove", (e) => { if (volSlider._drag) applyVol(e.clientX); });
  const volUp = (e) => { volSlider._drag = false; vol.classList.remove("open"); };
  volSlider.addEventListener("pointerup", volUp);
  volSlider.addEventListener("pointercancel", volUp);
  volSlider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { setVolume(state.volume + 0.05, true); e.preventDefault(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setVolume(state.volume - 0.05, true); e.preventDefault(); }
  });

  function toggleMute() {
    if (state.muted || state.volume === 0) setVolume(state.prevVolume || 0.5);
    else { state.prevVolume = state.volume; setVolume(0); }
    toast(state.muted ? "Muted" : "Unmuted");
    bumpUI();
  }
  $("muteToggle").addEventListener("click", (e) => { e.stopPropagation(); toggleMute(); });

  /* ---------------- captions ---------------- */
  function toggleCaptions() {
    state.captions = !state.captions;
    ccBtn.setAttribute("aria-pressed", String(state.captions));
    toast(state.captions ? "Subtitles on · " + settings.subs : "Subtitles off");
    bumpUI();
  }
  ccBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleCaptions(); });

  /* ---------------- settings menu ---------------- */
  const MENUS = {
    root: () => [
      { type: "item", label: "Quality", icon: chev, value: settings.quality, go: "quality" },
      { type: "item", label: "Speed", icon: chev, value: settings.speed, go: "speed" },
      { type: "item", label: "Audio", icon: chev, value: settings.audio, go: "audio" },
      { type: "item", label: "Subtitles", icon: chev, value: settings.subs, go: "subs" },
    ],
    quality: ["Auto (4K)", "4K HDR", "1080p", "720p", "Data Saver"].map((q) => opt("quality", q)),
    speed: ["0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"].map((q) => opt("speed", q)),
    audio: ["English 5.1", "English Stereo", "Español 5.1", "Audio Description"].map((q) => opt("audio", q)),
    subs: ["Off", "English", "English [CC]", "Español", "Français"].map((q) => opt("subs", q)),
  };
  const TITLES = { quality: "Quality", speed: "Playback speed", audio: "Audio", subs: "Subtitles" };
  const chev = '<svg class="menu__chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';
  function opt(key, val) { return { type: "radio", key, val }; }

  let menuOpen = false;
  let menuPage = "root";

  function buildMenu(page) {
    menuPage = page;
    let html = "";
    if (page !== "root") {
      html += '<div class="menu__head"><button class="menu__back" data-back aria-label="Back">' +
        '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>' + TITLES[page] + "</div>";
      html += '<div class="menu__sep"></div>';
    }
    const items = page === "root" ? MENUS.root() : MENUS[page];
    items.forEach((it) => {
      if (it.type === "item") {
        html += `<button class="menu__item" role="menuitem" data-go="${it.go}">${it.label}` +
          `<span class="menu__val">${it.value}${it.icon}</span></button>`;
      } else {
        const checked = settings[it.key] === it.val;
        html += `<button class="menu__item" role="menuitemradio" aria-checked="${checked}" data-set="${it.key}" data-val="${it.val}">` +
          `<svg class="menu__check" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>${it.val}</button>`;
      }
    });
    settingsMenu.innerHTML = html;
  }

  function openMenu() {
    menuOpen = true;
    buildMenu("root");
    settingsMenu.hidden = false;
    settingsBtn.setAttribute("aria-expanded", "true");
    const first = settingsMenu.querySelector(".menu__item");
    if (first) first.focus();
    bumpUI();
  }
  function closeMenu() {
    menuOpen = false;
    settingsMenu.hidden = true;
    settingsBtn.setAttribute("aria-expanded", "false");
  }
  settingsBtn.addEventListener("click", (e) => { e.stopPropagation(); menuOpen ? closeMenu() : openMenu(); });

  settingsMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    const back = e.target.closest("[data-back]");
    if (back) { buildMenu("root"); settingsMenu.querySelector(".menu__item").focus(); return; }
    const go = e.target.closest("[data-go]");
    if (go) { buildMenu(go.dataset.go); settingsMenu.querySelector(".menu__item").focus(); return; }
    const set = e.target.closest("[data-set]");
    if (set) {
      const { set: key, val } = set.dataset;
      settings[key] = val;
      if (key === "quality") qualityBadge.textContent = val.includes("4K") ? "4K" : val.includes("1080") ? "HD" : "SD";
      if (key === "subs") { state.captions = val !== "Off"; ccBtn.setAttribute("aria-pressed", String(state.captions)); }
      buildMenu("root");
      toast(TITLES[key] + ": " + val);
    }
  });
  settingsMenu.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeMenu(); settingsBtn.focus(); }
  });

  document.addEventListener("click", () => { if (menuOpen) closeMenu(); });

  /* ---------------- PiP / fullscreen ---------------- */
  $("pip").addEventListener("click", (e) => { e.stopPropagation(); toast("Picture-in-picture"); });
  $("fs").addEventListener("click", (e) => { e.stopPropagation(); toggleFullscreen(); });
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      (player.requestFullscreen ? player.requestFullscreen() : Promise.reject()).catch(() => {
        player.classList.toggle("fs"); // fallback visual toggle in sandboxed iframes
      });
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  }
  document.addEventListener("fullscreenchange", () => {
    player.classList.toggle("fs", !!document.fullscreenElement);
  });

  /* ---------------- auto-hide UI ---------------- */
  let hideT;
  function showUI(on) { player.classList.toggle("show-ui", on); player.classList.toggle("hide-cursor", !on && state.playing); }
  function scheduleHide() {
    clearTimeout(hideT);
    if (!state.playing) return;
    hideT = setTimeout(() => { if (!menuOpen && !state.seeking) showUI(false); }, 2800);
  }
  function bumpUI() { showUI(true); scheduleHide(); }

  player.classList.add("show-ui");
  ["pointermove", "pointerdown"].forEach((ev) => player.addEventListener(ev, bumpUI));
  player.addEventListener("click", (e) => {
    // click on bare video area toggles playback
    if (e.target === player || e.target.closest("#poster")) toggle();
  });

  /* ---------------- keyboard shortcuts ---------------- */
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    const k = e.key.toLowerCase();
    switch (k) {
      case " ": case "k": toggle(); e.preventDefault(); break;
      case "arrowright": if (document.activeElement !== scrub && document.activeElement !== volSlider) { seekBy(5); e.preventDefault(); } break;
      case "arrowleft": if (document.activeElement !== scrub && document.activeElement !== volSlider) { seekBy(-5); e.preventDefault(); } break;
      case "arrowup": if (document.activeElement !== volSlider) { setVolume(state.volume + 0.05, true); e.preventDefault(); } break;
      case "arrowdown": if (document.activeElement !== volSlider) { setVolume(state.volume - 0.05, true); e.preventDefault(); } break;
      case "m": toggleMute(); break;
      case "c": toggleCaptions(); break;
      case "f": toggleFullscreen(); break;
      case "j": seekBy(-10); toast("⏪ 10 seconds"); break;
      case "l": seekBy(10); toast("⏩ 10 seconds"); break;
      case "n": $("next").click(); break;
      default: return;
    }
    bumpUI();
  });

  // start ready, paused
  renderPlaying();
})();
