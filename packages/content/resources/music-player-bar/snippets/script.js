(() => {
  "use strict";

  // --- fictional catalog (covers are CSS gradient pairs) ---
  const TRACKS = [
    { title: "Paper Lanterns",   artist: "Neon Tides",     dur: 222, plays: "4.2M", a: "#1db954", b: "#0a6e36" },
    { title: "Velvet Static",    artist: "Neon Tides",     dur: 198, plays: "2.8M", a: "#8b5cf6", b: "#3b1d72" },
    { title: "Glasshouse",       artist: "Marlow Vey",     dur: 254, plays: "1.1M", a: "#ff3d71", b: "#7a1230" },
    { title: "Low Orbit",        artist: "Cassette Bloom", dur: 176, plays: "903K", a: "#38bdf8", b: "#0b4a6e" },
    { title: "Saltwater Hymn",   artist: "Neon Tides",     dur: 287, plays: "6.7M", a: "#f59e0b", b: "#7a4a05" },
    { title: "Tin Roof Rain",    artist: "Marlow Vey",     dur: 211, plays: "512K", a: "#34d399", b: "#0f5c43" },
    { title: "Afterimage",       artist: "Cassette Bloom", dur: 233, plays: "1.9M", a: "#e879f9", b: "#6b1782" },
    { title: "Midnight Reservoir", artist: "Neon Tides",   dur: 305, plays: "8.1M", a: "#60a5fa", b: "#1e3a8a" },
  ];

  const $ = (id) => document.getElementById(id);
  const player = $("player");
  const playBtn = $("playBtn");
  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");
  const shuffleBtn = $("shuffleBtn");
  const repeatBtn = $("repeatBtn");
  const likeBtn = $("likeBtn");
  const muteBtn = $("muteBtn");
  const queueBtn = $("queueBtn");
  const expandBtn = $("expandBtn");
  const trackTitle = $("trackTitle");
  const trackArtist = $("trackArtist");
  const curTimeEl = $("curTime");
  const totTimeEl = $("totTime");
  const scrub = $("scrub");
  const scrubFill = $("scrubFill");
  const scrubThumb = $("scrubThumb");
  const vol = $("vol");
  const volFill = $("volFill");
  const volThumb = $("volThumb");
  const queueList = $("queueList");
  const toastEl = $("toast");

  // --- state ---
  let index = 0;
  let elapsed = 0;       // seconds
  let playing = false;
  let timer = null;
  let last = 0;
  let volume = 0.8;
  let prevVol = 0.8;
  let muted = false;
  let liked = new Set();
  let shuffle = false;
  let repeat = false;    // repeat current track

  const fmt = (s) => {
    s = Math.max(0, Math.round(s));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  };

  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1700);
  }

  // --- queue rendering ---
  function buildQueue() {
    queueList.innerHTML = "";
    TRACKS.forEach((t, i) => {
      const li = document.createElement("li");
      li.className = "q-row" + (i === index ? " is-current" : "");
      li.style.setProperty("--ca", t.a);
      li.tabIndex = 0;
      li.setAttribute("role", "button");
      li.setAttribute("aria-label", `Play ${t.title} by ${t.artist}`);
      li.innerHTML =
        `<span class="q-row__num">${i + 1}</span>` +
        `<span class="q-row__cover" style="--ca:${t.a}"></span>` +
        `<span class="q-row__meta"><span class="q-row__t">${t.title}</span>` +
        `<span class="q-row__a">${t.artist}</span></span>` +
        `<span class="q-row__plays">${t.plays} plays</span>` +
        `<span class="q-row__dur">${fmt(t.dur)}</span>`;
      const go = () => { load(i); play(); };
      li.addEventListener("click", go);
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
      queueList.appendChild(li);
    });
  }

  function markCurrent() {
    [...queueList.children].forEach((li, i) =>
      li.classList.toggle("is-current", i === index)
    );
  }

  // --- load a track ---
  function load(i) {
    index = (i + TRACKS.length) % TRACKS.length;
    const t = TRACKS[index];
    elapsed = 0;
    trackTitle.textContent = t.title;
    trackArtist.textContent = t.artist;
    totTimeEl.textContent = fmt(t.dur);
    player.style.setProperty("--cover-a", t.a);
    player.style.setProperty("--cover-b", t.b);
    likeBtn.setAttribute("aria-pressed", liked.has(index) ? "true" : "false");
    renderProgress();
    markCurrent();
  }

  function renderProgress() {
    const t = TRACKS[index];
    const pct = Math.min(100, (elapsed / t.dur) * 100);
    scrubFill.style.width = pct + "%";
    scrubThumb.style.left = pct + "%";
    curTimeEl.textContent = fmt(elapsed);
    scrub.setAttribute("aria-valuenow", Math.round(pct));
    scrub.setAttribute("aria-valuetext", `${fmt(elapsed)} of ${fmt(t.dur)}`);
  }

  // --- playback loop (rAF, scaled by volume-independent real time) ---
  function tick(now) {
    if (!playing) return;
    const dt = (now - last) / 1000;
    last = now;
    elapsed += dt;
    const t = TRACKS[index];
    if (elapsed >= t.dur) {
      if (repeat) {
        elapsed = 0;
      } else {
        next(true);
        return;
      }
    }
    renderProgress();
    timer = requestAnimationFrame(tick);
  }

  function play() {
    if (playing) return;
    playing = true;
    player.classList.add("is-playing");
    playBtn.setAttribute("aria-pressed", "true");
    playBtn.setAttribute("aria-label", "Pause");
    last = performance.now();
    timer = requestAnimationFrame(tick);
  }

  function pause() {
    if (!playing) return;
    playing = false;
    player.classList.remove("is-playing");
    playBtn.setAttribute("aria-pressed", "false");
    playBtn.setAttribute("aria-label", "Play");
    cancelAnimationFrame(timer);
  }

  function toggle() {
    playing ? pause() : play();
  }

  function next(auto) {
    const wasPlaying = playing || auto;
    let i;
    if (shuffle) {
      do { i = Math.floor(Math.random() * TRACKS.length); }
      while (TRACKS.length > 1 && i === index);
    } else {
      i = index + 1;
    }
    pause();
    load(i);
    if (wasPlaying) play();
  }

  function prev() {
    const wasPlaying = playing;
    // restart current if >3s in, else previous track
    if (elapsed > 3) {
      elapsed = 0;
      renderProgress();
      return;
    }
    pause();
    load(index - 1);
    if (wasPlaying) play();
  }

  // --- volume ---
  function applyVolume() {
    const v = muted ? 0 : volume;
    volFill.style.width = v * 100 + "%";
    volThumb.style.left = v * 100 + "%";
    vol.setAttribute("aria-valuenow", Math.round(v * 100));
    vol.setAttribute("aria-valuetext", `${Math.round(v * 100)} percent`);
    muteBtn.setAttribute("aria-pressed", v === 0 ? "true" : "false");
    muteBtn.classList.toggle("is-muted", v === 0);
    muteBtn.querySelector(".i-vol").style.display = v === 0 ? "none" : "";
    muteBtn.querySelector(".i-mute").style.display = v === 0 ? "" : "none";
  }

  function setVolume(v) {
    volume = Math.min(1, Math.max(0, v));
    muted = volume === 0;
    if (!muted) prevVol = volume;
    applyVolume();
  }

  // --- generic horizontal slider drag (pointer) ---
  function dragSlider(el, onMove) {
    function pct(e) {
      const r = el.getBoundingClientRect();
      return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    }
    el.addEventListener("pointerdown", (e) => {
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-drag");
      onMove(pct(e), false);
      const move = (ev) => onMove(pct(ev), false);
      const up = (ev) => {
        onMove(pct(ev), true);
        el.classList.remove("is-drag");
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
    });
  }

  // --- wire scrubber ---
  dragSlider(scrub, (p, done) => {
    elapsed = p * TRACKS[index].dur;
    renderProgress();
    if (done) toast(`Seek · ${fmt(elapsed)}`);
  });
  scrub.addEventListener("keydown", (e) => {
    const t = TRACKS[index];
    let handled = true;
    if (e.key === "ArrowRight") elapsed = Math.min(t.dur, elapsed + 5);
    else if (e.key === "ArrowLeft") elapsed = Math.max(0, elapsed - 5);
    else if (e.key === "Home") elapsed = 0;
    else if (e.key === "End") elapsed = t.dur - 1;
    else handled = false;
    if (handled) { e.preventDefault(); renderProgress(); }
  });

  // --- wire volume ---
  dragSlider(vol, (p) => setVolume(p));
  vol.addEventListener("keydown", (e) => {
    let handled = true;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") setVolume(volume + 0.05);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") setVolume(volume - 0.05);
    else if (e.key === "Home") setVolume(0);
    else if (e.key === "End") setVolume(1);
    else handled = false;
    if (handled) e.preventDefault();
  });

  // --- buttons ---
  playBtn.addEventListener("click", toggle);
  nextBtn.addEventListener("click", () => next(false));
  prevBtn.addEventListener("click", prev);

  shuffleBtn.addEventListener("click", () => {
    shuffle = !shuffle;
    shuffleBtn.setAttribute("aria-pressed", String(shuffle));
    toast(shuffle ? "Shuffle on" : "Shuffle off");
  });
  repeatBtn.addEventListener("click", () => {
    repeat = !repeat;
    repeatBtn.setAttribute("aria-pressed", String(repeat));
    toast(repeat ? "Repeat track" : "Repeat off");
  });
  likeBtn.addEventListener("click", () => {
    const on = !liked.has(index);
    on ? liked.add(index) : liked.delete(index);
    likeBtn.setAttribute("aria-pressed", String(on));
    toast(on ? `Saved “${TRACKS[index].title}”` : "Removed from Liked Songs");
  });
  muteBtn.addEventListener("click", () => {
    if (muted || volume === 0) {
      setVolume(prevVol || 0.5);
      toast("Sound on");
    } else {
      prevVol = volume;
      setVolume(0);
      toast("Muted");
    }
  });
  queueBtn.addEventListener("click", () => {
    const on = queueBtn.getAttribute("aria-pressed") !== "true";
    queueBtn.setAttribute("aria-pressed", String(on));
    document.querySelector(".queue").style.display = on ? "" : "none";
    toast(on ? "Queue shown" : "Queue hidden");
  });
  expandBtn.addEventListener("click", () => {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      el.requestFullscreen().catch(() => toast("Full screen unavailable"));
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      toast("Full screen unavailable");
    }
  });

  // --- global keyboard shortcuts ---
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    const isControl = e.target === scrub || e.target === vol;
    if (e.code === "Space" && !isControl && tag !== "button") {
      e.preventDefault();
      toggle();
    } else if (e.key === "m" && tag !== "input") {
      muteBtn.click();
    }
  });

  // --- init ---
  buildQueue();
  load(0);
  applyVolume();
})();
