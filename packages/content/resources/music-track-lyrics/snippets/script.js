(() => {
  "use strict";

  /* ───────── Track data (fictional) ───────── */
  const DURATION = 222; // 3:42 in seconds

  // Time-synced lyric schedule. `t` = start time (seconds).
  // Lines are sorted; the active line is the last one whose t <= currentTime.
  const LYRICS = [
    { t: 0,   text: "♪ ♪ ♪", kind: "instrumental" },
    { t: 8,   text: "Paper lanterns on a borrowed string" },
    { t: 13,  text: "We lit them slow so the dark could sing" },
    { t: 18,  text: "Half a city sleeping under neon rain" },
    { t: 23,  text: "And every window held a different name" },
    { t: 29,  text: "♪ ♪", kind: "instrumental" },
    { t: 34,  text: "So tell me where the river goes" },
    { t: 39,  text: "When the midnight reservoir overflows" },
    { t: 45,  text: "I was counting all the lights I'd lose" },
    { t: 50,  text: "You were humming something I never knew" },
    { t: 57,  text: "(And the tide came in, the tide came in)" },
    { t: 63,  text: "Paper lanterns, let them go" },
    { t: 68,  text: "Higher than the radio glow" },
    { t: 74,  text: "We don't need a map for the morning side" },
    { t: 80,  text: "Just the velvet static and the open sky" },
    { t: 87,  text: "♪ ♪ ♪", kind: "instrumental" },
    { t: 95,  text: "Velvet static on the kitchen floor" },
    { t: 100, text: "You said forever, then you said one more" },
    { t: 106, text: "Every chorus is a folded note" },
    { t: 111, text: "A paper boat for the words I wrote" },
    { t: 118, text: "So tell me where the river goes" },
    { t: 123, text: "When the midnight reservoir overflows" },
    { t: 129, text: "I was counting all the lights I'd lose" },
    { t: 134, text: "You were humming something I never knew" },
    { t: 141, text: "(And the tide came in, the tide came in)" },
    { t: 147, text: "Paper lanterns, let them go" },
    { t: 152, text: "Higher than the radio glow" },
    { t: 158, text: "We don't need a map for the morning side" },
    { t: 164, text: "Just the velvet static and the open sky" },
    { t: 171, text: "♪ ♪", kind: "instrumental" },
    { t: 178, text: "Let them go, let them go" },
    { t: 183, text: "Over the reservoir, soft and slow" },
    { t: 189, text: "Let them go, let them go" },
    { t: 194, text: "Till the only light I know is you" },
    { t: 201, text: "Paper lanterns on a borrowed string" },
    { t: 207, text: "We lit them slow so the dark could sing" },
    { t: 214, text: "♪ ♪ ♪", kind: "instrumental" },
  ];

  /* ───────── Element refs ───────── */
  const $ = (id) => document.getElementById(id);
  const stage = $("stage");
  const playBtn = $("playBtn");
  const playLabel = $("playLabel");
  const coverEq = $("coverEq");
  const wave = $("wave");
  const waveBars = $("waveBars");
  const waveFill = $("waveFill");
  const waveHead = $("waveHead");
  const timeCur = $("timeCur");
  const timeDur = $("timeDur");
  const sizeBtn = $("sizeBtn");
  const sizeLabel = $("sizeLabel");
  const tsBtn = $("tsBtn");
  const lyricsBox = $("lyrics");
  const lyricList = $("lyricList");
  const liveLine = $("liveLine");
  const toastEl = $("toast");

  /* ───────── Helpers ───────── */
  const fmt = (s) => {
    s = Math.max(0, Math.round(s));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 1800);
  }

  /* ───────── Build waveform bars ───────── */
  const BAR_COUNT = 72;
  const heights = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    // pseudo-musical envelope: layered sines + a little jitter
    const env =
      0.45 +
      0.4 * Math.abs(Math.sin(i * 0.42)) +
      0.25 * Math.abs(Math.sin(i * 0.13 + 1.7));
    const jitter = ((i * 9301 + 49297) % 233) / 233;
    heights.push(Math.min(1, env * (0.7 + jitter * 0.5)));
  }
  function paintBars(target) {
    const frag = document.createDocumentFragment();
    heights.forEach((h) => {
      const b = document.createElement("i");
      b.style.height = `${Math.round(20 + h * 80)}%`;
      frag.appendChild(b);
    });
    target.appendChild(frag);
  }
  paintBars(waveBars);
  // mirror set inside the fill layer (clipped by width)
  const fillBars = document.createElement("div");
  fillBars.className = "wave__bars";
  waveFill.appendChild(fillBars);
  paintBars(fillBars);

  /* ───────── Build lyric lines ───────── */
  const lineEls = LYRICS.map((ly, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "line";
    if (ly.kind === "instrumental") btn.classList.add("is-instrumental");
    btn.dataset.index = String(i);

    const ts = document.createElement("span");
    ts.className = "line__ts";
    ts.textContent = fmt(ly.t);

    const txt = document.createElement("span");
    txt.className = "line__text";
    txt.textContent = ly.text;

    btn.append(ts, txt);
    btn.addEventListener("click", () => seekToLine(i));
    li.appendChild(btn);
    lyricList.appendChild(li);
    return btn;
  });

  /* ───────── Playback state ───────── */
  let current = 0; // seconds
  let playing = false;
  let rafId = null;
  let lastTs = 0;
  let activeIdx = -1;

  timeDur.textContent = fmt(DURATION);

  function activeIndexFor(time) {
    let idx = 0;
    for (let i = 0; i < LYRICS.length; i++) {
      if (LYRICS[i].t <= time) idx = i;
      else break;
    }
    return idx;
  }

  function renderActive(force) {
    const idx = activeIndexFor(current);
    if (idx === activeIdx && !force) return;
    activeIdx = idx;

    lineEls.forEach((el, i) => {
      el.classList.toggle("is-active", i === idx);
      el.classList.toggle("is-past", i < idx);
    });

    const el = lineEls[idx];
    if (el) {
      // auto-scroll active line to centre of the lyric viewport
      const boxH = lyricsBox.clientHeight;
      const target = el.offsetTop - boxH / 2 + el.offsetHeight / 2;
      lyricsBox.scrollTo({ top: target, behavior: "smooth" });
      liveLine.textContent = LYRICS[idx].kind === "instrumental"
        ? "Instrumental"
        : `“${LYRICS[idx].text.slice(0, 38)}${LYRICS[idx].text.length > 38 ? "…" : ""}”`;
    }
  }

  function renderScrub() {
    const pct = (current / DURATION) * 100;
    waveFill.style.width = `${pct}%`;
    waveHead.style.left = `${pct}%`;
    timeCur.textContent = fmt(current);
    wave.setAttribute("aria-valuenow", String(Math.round(pct)));
    wave.setAttribute("aria-valuetext", `${fmt(current)} of ${fmt(DURATION)}`);
  }

  function tick(ts) {
    if (!playing) return;
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    current += dt;

    if (current >= DURATION) {
      current = DURATION;
      renderScrub();
      renderActive(true);
      stop(true);
      toast("Track finished");
      return;
    }
    renderScrub();
    renderActive(false);
    rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (playing) return;
    if (current >= DURATION) current = 0;
    playing = true;
    lastTs = 0;
    playBtn.setAttribute("aria-pressed", "true");
    playBtn.setAttribute("aria-label", "Pause");
    playLabel.textContent = "Pause";
    coverEq.classList.add("is-on");
    rafId = requestAnimationFrame(tick);
  }

  function stop(ended) {
    playing = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    lastTs = 0;
    playBtn.setAttribute("aria-pressed", "false");
    playBtn.setAttribute("aria-label", "Play");
    playLabel.textContent = ended ? "Replay" : "Play";
    coverEq.classList.remove("is-on");
  }

  function toggle() {
    playing ? stop(false) : play();
  }

  function seekToTime(time, announce) {
    current = Math.max(0, Math.min(DURATION, time));
    renderScrub();
    renderActive(true);
    if (announce) toast(`Seek · ${fmt(current)}`);
  }

  function seekToLine(i) {
    seekToTime(LYRICS[i].t, false);
    liveLine.textContent = "Jumped to line";
    if (!playing) play();
    toast(`Line ${i + 1} · ${fmt(LYRICS[i].t)}`);
  }

  /* ───────── Scrubber interaction ───────── */
  function timeFromPointer(clientX) {
    const r = wave.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return ratio * DURATION;
  }

  let dragging = false;
  wave.addEventListener("pointerdown", (e) => {
    dragging = true;
    wave.setPointerCapture(e.pointerId);
    seekToTime(timeFromPointer(e.clientX), false);
  });
  wave.addEventListener("pointermove", (e) => {
    if (dragging) seekToTime(timeFromPointer(e.clientX), false);
  });
  wave.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    try { wave.releasePointerCapture(e.pointerId); } catch (_) {}
    toast(`Seek · ${fmt(current)}`);
  });

  wave.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 15 : 5;
    if (e.key === "ArrowRight") { seekToTime(current + step, true); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { seekToTime(current - step, true); e.preventDefault(); }
    else if (e.key === "Home") { seekToTime(0, true); e.preventDefault(); }
    else if (e.key === "End") { seekToTime(DURATION, true); e.preventDefault(); }
    else if (e.key === " " || e.key === "Enter") { toggle(); e.preventDefault(); }
  });

  /* ───────── Controls ───────── */
  playBtn.addEventListener("click", toggle);

  sizeBtn.addEventListener("click", () => {
    const big = stage.classList.toggle("size-lg");
    sizeBtn.setAttribute("aria-pressed", String(big));
    sizeLabel.textContent = big ? "AA" : "Aa";
    toast(big ? "Large lyrics" : "Default lyrics");
    // keep active line centred after resize
    requestAnimationFrame(() => renderActive(true));
  });

  tsBtn.addEventListener("click", () => {
    const on = stage.classList.toggle("show-ts");
    tsBtn.setAttribute("aria-pressed", String(on));
    toast(on ? "Timestamps shown" : "Timestamps hidden");
  });

  // global space toggles play unless focus is on the scrubber (it handles its own)
  document.addEventListener("keydown", (e) => {
    if (e.key === " " && e.target !== wave && !/^(BUTTON)$/.test(e.target.tagName)) {
      toggle();
      e.preventDefault();
    }
  });

  /* ───────── Init ───────── */
  renderScrub();
  renderActive(true);
})();
