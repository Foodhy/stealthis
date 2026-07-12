/* Reel Grid — hover-preview video grid + modal player (vanilla JS) */
(function () {
  "use strict";

  const CAT_LABEL = {
    commercial: "Commercial",
    documentary: "Documentary",
    music: "Music Video",
    wedding: "Wedding",
  };

  // Fictional but realistic reel data. Posters are Unsplash placeholder URLs.
  const CLIPS = [
    { id: 1, title: "Aurora — Perfume Film", cat: "commercial", dur: 74, quality: "4K", views: 128400, date: "2026-05-18", g: "1492724441997-5dc865305da7" },
    { id: 2, title: "The Last Ferry", cat: "documentary", dur: 612, quality: "6K", views: 54200, date: "2026-06-02", g: "1500530855697-b586d89ba3ee" },
    { id: 3, title: "Neon Tide — Live Session", cat: "music", dur: 218, quality: "4K", views: 402100, date: "2026-06-21", g: "1470225620780-dba8ba36b745" },
    { id: 4, title: "Clara & Jonas", cat: "wedding", dur: 186, quality: "4K", views: 22800, date: "2026-04-30", g: "1519741497674-611481863552" },
    { id: 5, title: "Volt EV — Launch Spot", cat: "commercial", dur: 32, quality: "4K", views: 291500, date: "2026-06-25", g: "1503376780353-7e6692767b70" },
    { id: 6, title: "Salt & Iron", cat: "documentary", dur: 528, quality: "4K", views: 38900, date: "2026-03-14", g: "1441974231531-c6227db76b6e" },
    { id: 7, title: "Midnight Drum Kit", cat: "music", dur: 244, quality: "4K", views: 176300, date: "2026-05-09", g: "1511671782779-c97d3d27a1d4" },
    { id: 8, title: "Elena & Sam — Highland Vows", cat: "wedding", dur: 205, quality: "6K", views: 41200, date: "2026-06-12", g: "1465495976277-4387d4b0b4c6" },
    { id: 9, title: "Bloom — Skincare Ad", cat: "commercial", dur: 45, quality: "4K", views: 97600, date: "2026-05-27", g: "1522337660859-02fbefca4702" },
    { id: 10, title: "Riverkeepers", cat: "documentary", dur: 702, quality: "6K", views: 61800, date: "2026-02-20", g: "1506744038136-46273834b3fb" },
    { id: 11, title: "Static Bloom — Music Video", cat: "music", dur: 197, quality: "4K", views: 512900, date: "2026-06-28", g: "1493225457124-a3eb161ffa5f" },
    { id: 12, title: "Priya & Noor", cat: "wedding", dur: 172, quality: "4K", views: 33400, date: "2026-06-18", g: "1519225421980-715cb0215aed" },
  ];

  const gridEl = document.getElementById("grid");
  const emptyEl = document.getElementById("empty");
  const chips = Array.from(document.querySelectorAll(".chip"));
  const sortEl = document.getElementById("sort");
  const toastEl = document.getElementById("toast");

  let activeFilter = "all";
  let toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function fmtDur(s) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }
  function fmtViews(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1) + "K";
    return String(n);
  }
  function poster(g, w) {
    return "https://images.unsplash.com/photo-" + g + "?auto=format&fit=crop&w=" + (w || 640) + "&q=70";
  }

  function counts() {
    const c = { all: CLIPS.length };
    CLIPS.forEach((x) => { c[x.cat] = (c[x.cat] || 0) + 1; });
    document.querySelectorAll(".count").forEach((el) => {
      const k = el.getAttribute("data-count");
      el.textContent = c[k] != null ? c[k] : 0;
    });
  }

  function sortClips(list) {
    const mode = sortEl.value;
    const arr = list.slice();
    if (mode === "new") arr.sort((a, b) => b.date.localeCompare(a.date));
    else if (mode === "long") arr.sort((a, b) => b.dur - a.dur);
    else if (mode === "views") arr.sort((a, b) => b.views - a.views);
    return arr;
  }

  function render() {
    let list = activeFilter === "all" ? CLIPS : CLIPS.filter((x) => x.cat === activeFilter);
    list = sortClips(list);

    gridEl.innerHTML = "";
    emptyEl.hidden = list.length > 0;

    list.forEach((clip) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.type = "button";
      btn.setAttribute("data-id", clip.id);
      btn.setAttribute("aria-label",
        "Play " + clip.title + ", " + CAT_LABEL[clip.cat] + ", " + fmtDur(clip.dur));

      btn.innerHTML =
        '<div class="tile-poster" style="background-image:url(' + poster(clip.g, 640) + ')"></div>' +
        '<div class="tile-motion"></div>' +
        '<div class="tile-shade"></div>' +
        '<div class="tile-badges">' +
          '<span class="badge-cat">' + CAT_LABEL[clip.cat] + "</span>" +
          '<span class="badge-dur">' + fmtDur(clip.dur) + "</span>" +
        "</div>" +
        '<div class="tile-foot">' +
          '<h3 class="tile-title">' + clip.title + "</h3>" +
          '<p class="tile-sub"><span>' + fmtViews(clip.views) + " views</span>" +
          '<span class="badge-q">' + clip.quality + "</span></p>" +
        "</div>" +
        '<div class="tile-progress"></div>';

      btn.addEventListener("click", () => openModal(clip, btn));
      li.appendChild(btn);
      gridEl.appendChild(li);
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      activeFilter = chip.getAttribute("data-filter");
      render();
    });
  });
  sortEl.addEventListener("change", () => {
    render();
    toast("Sorted by " + sortEl.options[sortEl.selectedIndex].text.toLowerCase());
  });

  /* ---------- Modal player ---------- */
  const modal = document.getElementById("modal");
  const stage = document.getElementById("stage");
  const stagePoster = document.getElementById("stagePoster");
  const bigPlay = document.getElementById("bigPlay");
  const playToggle = document.getElementById("playToggle");
  const muteToggle = document.getElementById("muteToggle");
  const scrub = document.getElementById("scrub");
  const scrubFill = document.getElementById("scrubFill");
  const scrubKnob = document.getElementById("scrubKnob");
  const tCur = document.getElementById("tCur");
  const tDur = document.getElementById("tDur");
  const mTitle = document.getElementById("mTitle");
  const mSub = document.getElementById("mSub");
  const mQual = document.getElementById("mQual");

  let cur = null;      // current clip
  let pos = 0;         // seconds elapsed
  let playing = false;
  let muted = true;
  let ticker = null;
  let lastTrigger = null;

  function setIcons() {
    playToggle.querySelector(".ic-play").hidden = playing;
    playToggle.querySelector(".ic-pause").hidden = !playing;
    playToggle.setAttribute("aria-label", playing ? "Pause" : "Play");
    stage.classList.toggle("playing", playing);
    muteToggle.querySelector(".ic-vol").hidden = muted;
    muteToggle.querySelector(".ic-muted").hidden = !muted;
    muteToggle.setAttribute("aria-label", muted ? "Unmute" : "Mute");
  }

  function drawScrub() {
    const pct = cur ? (pos / cur.dur) * 100 : 0;
    scrubFill.style.width = pct + "%";
    scrubKnob.style.left = pct + "%";
    scrub.setAttribute("aria-valuenow", Math.round(pct));
    tCur.textContent = fmtDur(Math.floor(pos));
  }

  function tick() {
    if (!playing || !cur) return;
    pos += 0.25;
    if (pos >= cur.dur) { pos = cur.dur; pause(); toast("Playback finished"); }
    drawScrub();
  }

  function play() {
    if (!cur) return;
    if (pos >= cur.dur) pos = 0;
    playing = true;
    setIcons();
    clearInterval(ticker);
    ticker = setInterval(tick, 250);
  }
  function pause() {
    playing = false;
    setIcons();
    clearInterval(ticker);
  }
  function togglePlay() { playing ? pause() : play(); }

  function seekToClientX(clientX) {
    if (!cur) return;
    const r = scrub.getBoundingClientRect();
    let pct = (clientX - r.left) / r.width;
    pct = Math.max(0, Math.min(1, pct));
    pos = pct * cur.dur;
    drawScrub();
  }

  function openModal(clip, trigger) {
    cur = clip;
    pos = 0;
    lastTrigger = trigger || null;
    stagePoster.style.backgroundImage = "url(" + poster(clip.g, 1080) + ")";
    mTitle.textContent = clip.title;
    mSub.textContent = CAT_LABEL[clip.cat].toUpperCase() + " · " + fmtViews(clip.views) + " VIEWS";
    mQual.textContent = clip.quality;
    tDur.textContent = fmtDur(clip.dur);
    drawScrub();
    pause();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => bigPlay.focus(), 40);
  }
  function closeModal() {
    pause();
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus();
  }

  bigPlay.addEventListener("click", play);
  playToggle.addEventListener("click", togglePlay);
  muteToggle.addEventListener("click", () => {
    muted = !muted;
    setIcons();
    toast(muted ? "Muted" : "Sound on");
  });

  // scrub: click + drag
  let dragging = false;
  scrub.addEventListener("pointerdown", (e) => {
    dragging = true;
    scrub.setPointerCapture(e.pointerId);
    seekToClientX(e.clientX);
  });
  scrub.addEventListener("pointermove", (e) => { if (dragging) seekToClientX(e.clientX); });
  scrub.addEventListener("pointerup", () => { dragging = false; });
  scrub.addEventListener("keydown", (e) => {
    if (!cur) return;
    if (e.key === "ArrowRight") { pos = Math.min(cur.dur, pos + cur.dur * 0.05); drawScrub(); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { pos = Math.max(0, pos - cur.dur * 0.05); drawScrub(); e.preventDefault(); }
    else if (e.key === " " || e.key === "Enter") { togglePlay(); e.preventDefault(); }
  });

  modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();
    else if (e.key === " " && e.target === document.body) { togglePlay(); e.preventDefault(); }
  });

  /* ---------- Footer clock (session runtime) ---------- */
  const footClock = document.getElementById("footClock");
  let secs = 0;
  setInterval(() => {
    secs++;
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    footClock.textContent = h + ":" + m + ":" + s;
  }, 1000);

  /* ---------- init ---------- */
  counts();
  render();
  setIcons();
})();
