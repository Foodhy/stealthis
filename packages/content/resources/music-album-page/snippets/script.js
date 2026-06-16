(() => {
  "use strict";

  /* ---------- data (fictional) ---------- */
  const TRACKS = [
    { title: "Paper Lanterns", feat: "", sec: 224, plays: 4820113, liked: false },
    { title: "Midnight Reservoir", feat: "", sec: 252, plays: 8104552, liked: true },
    { title: "Velvet Static", feat: "feat. Lake Mercer", sec: 198, plays: 3290881, liked: false },
    { title: "Harbor Lights", feat: "", sec: 241, plays: 2740019, liked: false },
    { title: "Glass Avenue", feat: "feat. The Hollow Quartet", sec: 277, plays: 1980442, liked: false },
    { title: "Saltwater Telegraph", feat: "", sec: 213, plays: 1556730, liked: false },
    { title: "Low Tide Confessions", feat: "feat. J. Wilder", sec: 268, plays: 2204117, liked: true },
    { title: "Neon Undertow", feat: "", sec: 231, plays: 3071008, liked: false },
    { title: "Driftwood Radio", feat: "", sec: 256, plays: 1342990, liked: false },
    { title: "Reservoir (Reprise)", feat: "", sec: 162, plays: 998421, liked: false }
  ];

  const MORE_ALBUMS = [
    { title: "Saltwater EP", year: 2024, a: "#1db954", b: "#0a5c8a" },
    { title: "Half-Light", year: 2023, a: "#8b5cf6", b: "#ff3d71" },
    { title: "Coastline Tapes", year: 2022, a: "#f59e0b", b: "#ff3d71" },
    { title: "First Frequencies", year: 2021, a: "#06b6d4", b: "#8b5cf6" }
  ];

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  const compact = (n) =>
    n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
    : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
    : String(n);

  const toastWrap = $("#toastWrap");
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(() => el.remove(), 2750);
  }

  /* ---------- build tracklist ---------- */
  const tracklist = $("#tracklist");
  let order = TRACKS.map((_, i) => i); // index order, mutated by sort

  function renderTracklist() {
    tracklist.innerHTML = "";
    order.forEach((idx, pos) => {
      const t = TRACKS[idx];
      const li = document.createElement("li");
      li.className = "track";
      li.dataset.idx = String(idx);
      if (idx === playing.idx) li.classList.add("playing");
      li.innerHTML = `
        <span class="t-num">
          <span class="t-num-text">${pos + 1}</span>
          <button class="t-play" aria-label="Play ${t.title}"><span class="pic"></span></button>
        </span>
        <span class="t-info">
          <span class="t-title">${t.title}</span>
          ${t.feat ? `<span class="t-feat">${t.feat}</span>` : ""}
        </span>
        <span class="t-plays">${compact(t.plays)}</span>
        <button class="t-like" aria-pressed="${t.liked}" aria-label="Like ${t.title}">
          <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.2C.4 8.5 1.8 5 5.2 5c2 0 3.3 1.2 3.8 2.2C9.5 6.2 10.8 5 12.8 5 16.2 5 17.6 8.5 16 11.8 13.5 16.4 12 21 12 21z"/></svg>
        </button>
        <span class="t-dur">
          <span class="dur-text">${fmt(t.sec)}</span>
          <span class="eq"><i></i><i></i><i></i><i></i></span>
        </span>`;
      tracklist.appendChild(li);
    });
  }

  /* ---------- runtime sum ---------- */
  const totalSec = TRACKS.reduce((a, t) => a + t.sec, 0);
  $("#totalRuntime").textContent = `${Math.round(totalSec / 60)} min`;
  $("#trackCount").textContent = `${TRACKS.length} tracks`;

  /* ---------- playback simulation ---------- */
  const nowBar = $("#nowBar");
  const scrubFill = $("#scrubFill");
  const scrubKnob = $("#scrubKnob");
  const scrub = $("#scrub");
  const playing = { idx: -1, elapsed: 0, timer: null, paused: false };

  function setNowBar(idx) {
    const t = TRACKS[idx];
    $("#nbTitle").textContent = t.title;
    $("#nbArtist").textContent = t.feat ? "Neon Tides " + t.feat : "Neon Tides";
    $("#nbDur").textContent = fmt(t.sec);
    nowBar.hidden = false;
  }

  function updateScrub() {
    const t = TRACKS[playing.idx];
    if (!t) return;
    const pct = Math.min(100, (playing.elapsed / t.sec) * 100);
    scrubFill.style.width = pct + "%";
    scrubKnob.style.left = pct + "%";
    scrub.setAttribute("aria-valuenow", Math.round(pct));
    $("#nbCur").textContent = fmt(playing.elapsed);
  }

  function tick() {
    if (playing.paused) return;
    const t = TRACKS[playing.idx];
    playing.elapsed += 1;
    if (playing.elapsed >= t.sec) {
      // advance to next in current visual order
      const curPos = order.indexOf(playing.idx);
      if (curPos < order.length - 1) {
        startTrack(order[curPos + 1]);
        return;
      }
      stopAll();
      toast("Album finished");
      return;
    }
    updateScrub();
  }

  function startTrack(idx) {
    clearInterval(playing.timer);
    playing.idx = idx;
    playing.elapsed = 0;
    playing.paused = false;
    nowBar.classList.remove("paused");
    setNowBar(idx);
    updateScrub();
    syncRows();
    syncAlbumBtn();
    $("#nbPlay").setAttribute("aria-pressed", "true");
    $("#nbPlay").setAttribute("aria-label", "Pause");
    playing.timer = setInterval(tick, 1000);
  }

  function togglePause() {
    if (playing.idx < 0) return;
    playing.paused = !playing.paused;
    nowBar.classList.toggle("paused", playing.paused);
    const pressed = !playing.paused;
    $("#nbPlay").setAttribute("aria-pressed", String(pressed));
    $("#nbPlay").setAttribute("aria-label", pressed ? "Pause" : "Play");
    syncRows();
    syncAlbumBtn();
  }

  function stopAll() {
    clearInterval(playing.timer);
    playing.idx = -1;
    playing.paused = false;
    syncRows();
    syncAlbumBtn();
  }

  function syncRows() {
    tracklist.querySelectorAll(".track").forEach((row) => {
      const isCur = Number(row.dataset.idx) === playing.idx;
      row.classList.toggle("playing", isCur && !playing.paused ? true : isCur);
      // keep row marked when paused but show static state via class only when current
      if (!isCur) row.classList.remove("playing");
      else row.classList.add("playing");
    });
  }

  function syncAlbumBtn() {
    const active = playing.idx >= 0 && !playing.paused;
    const btn = $("#playAlbum");
    btn.setAttribute("aria-pressed", String(active));
    $(".pa-label", btn).textContent = active ? "Pause" : "Play";
  }

  /* ---------- tracklist interactions (delegated) ---------- */
  tracklist.addEventListener("click", (e) => {
    const row = e.target.closest(".track");
    if (!row) return;
    const idx = Number(row.dataset.idx);

    const like = e.target.closest(".t-like");
    if (like) {
      TRACKS[idx].liked = !TRACKS[idx].liked;
      like.setAttribute("aria-pressed", String(TRACKS[idx].liked));
      toast(TRACKS[idx].liked ? "Added to Liked Songs" : "Removed from Liked Songs");
      return;
    }

    // play/pause this track
    if (idx === playing.idx) {
      togglePause();
    } else {
      startTrack(idx);
    }
  });

  /* ---------- album-level play ---------- */
  $("#playAlbum").addEventListener("click", () => {
    if (playing.idx < 0) {
      startTrack(order[0]);
    } else {
      togglePause();
    }
  });

  /* ---------- now-bar play button ---------- */
  $("#nbPlay").addEventListener("click", togglePause);

  /* ---------- scrubber: click, drag, keyboard ---------- */
  function seekFromEvent(clientX) {
    if (playing.idx < 0) return;
    const r = scrub.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    playing.elapsed = Math.round(pct * TRACKS[playing.idx].sec);
    updateScrub();
  }
  scrub.addEventListener("pointerdown", (e) => {
    scrub.setPointerCapture(e.pointerId);
    seekFromEvent(e.clientX);
    const move = (ev) => seekFromEvent(ev.clientX);
    const up = () => {
      scrub.removeEventListener("pointermove", move);
      scrub.removeEventListener("pointerup", up);
    };
    scrub.addEventListener("pointermove", move);
    scrub.addEventListener("pointerup", up);
  });
  scrub.addEventListener("keydown", (e) => {
    if (playing.idx < 0) return;
    const step = e.key === "ArrowRight" ? 5 : e.key === "ArrowLeft" ? -5 : 0;
    if (!step) return;
    e.preventDefault();
    playing.elapsed = Math.min(TRACKS[playing.idx].sec, Math.max(0, playing.elapsed + step));
    updateScrub();
  });

  /* ---------- album like / add / download / menu ---------- */
  $("#likeAlbum").addEventListener("click", (e) => {
    const b = e.currentTarget;
    const on = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", String(on));
    toast(on ? "Saved Midnight Reservoir to your library" : "Removed from your library");
  });
  $("#addPlaylist").addEventListener("click", () => toast("Add to playlist"));
  $("#downloadBtn").addEventListener("click", () => toast("Downloading album (simulated)"));

  const moreBtn = $("#moreBtn");
  const moreMenu = $("#moreMenu");
  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = moreMenu.classList.toggle("open");
    moreBtn.setAttribute("aria-expanded", String(open));
  });
  moreMenu.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    moreMenu.classList.remove("open");
    moreBtn.setAttribute("aria-expanded", "false");
    toast(b.dataset.toast);
  });
  document.addEventListener("click", () => {
    moreMenu.classList.remove("open");
    moreBtn.setAttribute("aria-expanded", "false");
  });

  /* ---------- sort toggle ---------- */
  const sortToggle = $("#sortToggle");
  let sorted = false;
  sortToggle.addEventListener("click", () => {
    sorted = !sorted;
    sortToggle.setAttribute("aria-pressed", String(sorted));
    $("#sortLabel").textContent = sorted ? "Most played" : "Album order";
    if (sorted) {
      order = TRACKS.map((_, i) => i).sort((a, b) => TRACKS[b].plays - TRACKS[a].plays);
    } else {
      order = TRACKS.map((_, i) => i);
    }
    renderTracklist();
    toast(sorted ? "Sorted by play count" : "Restored album order");
  });

  /* ---------- more by artist ---------- */
  const albumRow = $("#albumRow");
  MORE_ALBUMS.forEach((al) => {
    const card = document.createElement("button");
    card.className = "mini";
    card.innerHTML = `
      <span class="mini-cover" style="background:linear-gradient(145deg,${al.a},${al.b})"></span>
      <span class="mini-title">${al.title}</span><br />
      <span class="mini-year">${al.year}</span>`;
    card.addEventListener("click", () => toast(`Opening “${al.title}” (${al.year})`));
    albumRow.appendChild(card);
  });

  /* ---------- init ---------- */
  renderTracklist();
})();
