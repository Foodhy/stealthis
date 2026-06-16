(function () {
  "use strict";

  /* ---------- Fictional discography data ---------- */
  // Each release: id, title, year, type, plays (raw), duration (sec),
  // and a CSS-drawn cover defined by two accent colors + a base gradient.
  var RELEASES = [
    {
      id: "midnight-reservoir",
      title: "Midnight Reservoir",
      year: 2026,
      type: "album",
      plays: 48200000,
      duration: 222,
      accent: "#8b5cf6",
      bg: "linear-gradient(150deg,#3a1d63,#0e0a1f)",
      a: "rgba(255,61,113,0.85)",
      b: "rgba(139,92,246,0.8)",
    },
    {
      id: "paper-lanterns",
      title: "Paper Lanterns",
      year: 2025,
      type: "single",
      plays: 19800000,
      duration: 198,
      accent: "#ff3d71",
      bg: "linear-gradient(150deg,#5c1530,#160810)",
      a: "rgba(255,184,108,0.85)",
      b: "rgba(255,61,113,0.8)",
    },
    {
      id: "velvet-static",
      title: "Velvet Static",
      year: 2024,
      type: "album",
      plays: 63400000,
      duration: 241,
      accent: "#1db954",
      bg: "linear-gradient(150deg,#0c4d34,#06140f)",
      a: "rgba(108,255,196,0.8)",
      b: "rgba(29,185,84,0.85)",
    },
    {
      id: "harbor-lights-ep",
      title: "Harbor Lights EP",
      year: 2024,
      type: "single",
      plays: 8700000,
      duration: 176,
      accent: "#38bdf8",
      bg: "linear-gradient(150deg,#0b3a5c,#06121c)",
      a: "rgba(125,211,252,0.85)",
      b: "rgba(56,189,248,0.7)",
    },
    {
      id: "low-orbit",
      title: "Low Orbit",
      year: 2023,
      type: "album",
      plays: 31100000,
      duration: 263,
      accent: "#f59e0b",
      bg: "linear-gradient(150deg,#5a3a08,#1a1206)",
      a: "rgba(253,224,71,0.85)",
      b: "rgba(245,158,11,0.75)",
    },
    {
      id: "ghost-frequency",
      title: "Ghost Frequency",
      year: 2023,
      type: "single",
      plays: 12400000,
      duration: 205,
      accent: "#a78bfa",
      bg: "linear-gradient(150deg,#2b2150,#0c0a18)",
      a: "rgba(199,210,254,0.8)",
      b: "rgba(167,139,250,0.8)",
    },
    {
      id: "tidal-archives",
      title: "Tidal Archives",
      year: 2022,
      type: "compilation",
      plays: 27600000,
      duration: 312,
      accent: "#22d3ee",
      bg: "linear-gradient(150deg,#0a4a52,#06151a)",
      a: "rgba(165,243,252,0.8)",
      b: "rgba(34,211,238,0.75)",
    },
    {
      id: "saltwater-bloom",
      title: "Saltwater Bloom",
      year: 2022,
      type: "album",
      plays: 41900000,
      duration: 228,
      accent: "#fb7185",
      bg: "linear-gradient(150deg,#5a1f33,#180a10)",
      a: "rgba(254,205,211,0.85)",
      b: "rgba(251,113,133,0.75)",
    },
    {
      id: "cassette-summer",
      title: "Cassette Summer",
      year: 2021,
      type: "single",
      plays: 9200000,
      duration: 187,
      accent: "#34d399",
      bg: "linear-gradient(150deg,#0d4a3a,#07150f)",
      a: "rgba(167,243,208,0.8)",
      b: "rgba(52,211,153,0.75)",
    },
    {
      id: "first-light-anthology",
      title: "First Light: The Anthology",
      year: 2020,
      type: "compilation",
      plays: 53800000,
      duration: 358,
      accent: "#c084fc",
      bg: "linear-gradient(150deg,#3a1a55,#0e0818)",
      a: "rgba(233,213,255,0.8)",
      b: "rgba(192,132,252,0.75)",
    },
    {
      id: "neon-tides-debut",
      title: "Neon Tides",
      year: 2019,
      type: "album",
      plays: 72500000,
      duration: 214,
      accent: "#ec4899",
      bg: "linear-gradient(150deg,#5c1545,#170818)",
      a: "rgba(251,207,232,0.85)",
      b: "rgba(236,72,153,0.75)",
    },
    {
      id: "static-tide-remixes",
      title: "Static Tide (Remixes)",
      year: 2019,
      type: "single",
      plays: 6100000,
      duration: 232,
      accent: "#60a5fa",
      bg: "linear-gradient(150deg,#1a3a66,#080f1c)",
      a: "rgba(191,219,254,0.8)",
      b: "rgba(96,165,250,0.7)",
    },
  ];

  var TYPE_LABEL = {
    album: "Album",
    single: "Single / EP",
    compilation: "Compilation",
  };

  /* ---------- DOM refs ---------- */
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var sortSelect = document.getElementById("sortSelect");
  var gridViewBtn = document.getElementById("gridViewBtn");
  var listViewBtn = document.getElementById("listViewBtn");
  var toastEl = document.getElementById("toast");

  var nowbar = document.getElementById("nowbar");
  var nowCover = document.getElementById("nowCover");
  var nowTitle = document.getElementById("nowTitle");
  var nowSub = document.getElementById("nowSub");
  var nowPlay = document.getElementById("nowPlay");
  var nowCur = document.getElementById("nowCur");
  var nowDur = document.getElementById("nowDur");
  var scrub = document.getElementById("scrub");
  var scrubFill = document.getElementById("scrubFill");
  var scrubKnob = document.getElementById("scrubKnob");

  /* ---------- State ---------- */
  var state = {
    filter: "all",
    sort: "newest",
    view: "grid",
    playingId: null,
    isPlaying: false,
    progress: 0, // seconds
    duration: 0,
    timer: null,
  };

  /* ---------- Helpers ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function fmtPlays(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
    return String(n);
  }

  function byId(id) {
    for (var i = 0; i < RELEASES.length; i++) {
      if (RELEASES[i].id === id) return RELEASES[i];
    }
    return null;
  }

  /* ---------- Tab counts ---------- */
  function setCounts() {
    var counts = { all: RELEASES.length, album: 0, single: 0, compilation: 0 };
    RELEASES.forEach(function (r) {
      counts[r.type]++;
    });
    document.querySelectorAll(".tab__count").forEach(function (el) {
      el.textContent = counts[el.getAttribute("data-count")];
    });
  }

  /* ---------- Filter + sort ---------- */
  function getVisible() {
    var list = RELEASES.filter(function (r) {
      return state.filter === "all" || r.type === state.filter;
    });
    list.sort(function (a, b) {
      if (state.sort === "oldest") return a.year - b.year;
      if (state.sort === "played") return b.plays - a.plays;
      return b.year - a.year; // newest
    });
    return list;
  }

  /* ---------- Render ---------- */
  function render() {
    var list = getVisible();
    grid.innerHTML = "";

    if (!list.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    list.forEach(function (r) {
      var card = document.createElement("article");
      card.className = "card";
      card.setAttribute("data-id", r.id);
      card.style.setProperty("--card-accent", r.accent);
      if (state.playingId === r.id && state.isPlaying) {
        card.classList.add("is-playing");
      }

      var coverVars =
        "--cover-bg:" + r.bg + ";--cover-a:" + r.a + ";--cover-b:" + r.b + ";";

      card.innerHTML =
        '<div class="cover" style="' + coverVars + '">' +
          '<span class="badge">' + TYPE_LABEL[r.type] + "</span>" +
          '<div class="cover__shapes"></div>' +
          '<div class="cover__bars"><i></i><i></i><i></i><i></i><i></i></div>' +
          '<div class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></div>' +
          '<button class="playbtn" type="button" aria-pressed="false" aria-label="Play ' +
            r.title + '"><span class="icon-play"></span></button>' +
        "</div>" +
        '<div class="card__meta">' +
          '<h3 class="card__title">' + r.title + "</h3>" +
          '<div class="card__sub">' +
            '<span class="badge badge--inline">' + TYPE_LABEL[r.type] + "</span>" +
            "<span>" + r.year + "</span>" +
            '<span class="dot" aria-hidden="true"></span>' +
            "<span>" + fmtTime(r.duration) + "</span>" +
            '<span class="card__tail">' +
              '<span class="dot" aria-hidden="true"></span>' +
              '<span class="card__plays">' + fmtPlays(r.plays) + " plays</span>" +
            "</span>" +
          "</div>" +
        "</div>";

      grid.appendChild(card);
    });

    syncPlayButtons();
  }

  function syncPlayButtons() {
    document.querySelectorAll(".card").forEach(function (card) {
      var id = card.getAttribute("data-id");
      var btn = card.querySelector(".playbtn");
      var isThis = id === state.playingId && state.isPlaying;
      btn.setAttribute("aria-pressed", isThis ? "true" : "false");
      btn.innerHTML = isThis
        ? '<span class="icon-pause"></span>'
        : '<span class="icon-play"></span>';
      btn.setAttribute("aria-label", (isThis ? "Pause " : "Play ") + byId(id).title);
      card.classList.toggle("is-playing", isThis);
    });
  }

  /* ---------- Playback simulation ---------- */
  function startTimer() {
    stopTimer();
    state.timer = setInterval(function () {
      if (!state.isPlaying) return;
      state.progress += 1;
      if (state.progress >= state.duration) {
        state.progress = state.duration;
        updateScrub();
        pause();
        toast("Track finished");
        return;
      }
      updateScrub();
    }, 1000);
  }

  function stopTimer() {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
  }

  function updateScrub() {
    var pct = state.duration ? (state.progress / state.duration) * 100 : 0;
    scrubFill.style.width = pct + "%";
    scrubKnob.style.left = pct + "%";
    scrub.setAttribute("aria-valuenow", Math.round(pct));
    scrub.setAttribute(
      "aria-valuetext",
      fmtTime(state.progress) + " of " + fmtTime(state.duration)
    );
    nowCur.textContent = fmtTime(state.progress);
  }

  function playRelease(id) {
    var r = byId(id);
    if (!r) return;

    if (state.playingId === id) {
      // toggle on same track
      togglePlay();
      return;
    }

    state.playingId = id;
    state.duration = r.duration;
    state.progress = 0;
    state.isPlaying = true;

    nowbar.hidden = false;
    nowCover.style.background = r.bg;
    nowTitle.textContent = r.title;
    nowSub.textContent = "Neon Tides · " + r.year + " · " + TYPE_LABEL[r.type];
    nowDur.textContent = fmtTime(r.duration);
    scrub.setAttribute("aria-valuemax", r.duration);
    document.documentElement.style.setProperty("--accent-now", r.accent);

    setPlayIcon(true);
    updateScrub();
    startTimer();
    syncPlayButtons();
    toast("Now playing — " + r.title);
  }

  function togglePlay() {
    if (!state.playingId) return;
    if (state.isPlaying) pause();
    else resume();
  }

  function pause() {
    state.isPlaying = false;
    setPlayIcon(false);
    syncPlayButtons();
  }

  function resume() {
    if (state.progress >= state.duration) state.progress = 0;
    state.isPlaying = true;
    setPlayIcon(true);
    startTimer();
    syncPlayButtons();
  }

  function stopPlayback() {
    stopTimer();
    state.playingId = null;
    state.isPlaying = false;
    state.progress = 0;
    nowbar.hidden = true;
    syncPlayButtons();
  }

  function setPlayIcon(playing) {
    nowPlay.innerHTML = playing
      ? '<span class="icon-pause"></span>'
      : '<span class="icon-play"></span>';
    nowPlay.setAttribute("aria-pressed", playing ? "true" : "false");
    nowPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
  }

  /* ---------- Scrub seek ---------- */
  function seekFromClientX(clientX) {
    var rect = scrub.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    state.progress = Math.round(ratio * state.duration);
    updateScrub();
  }

  var dragging = false;
  scrub.addEventListener("pointerdown", function (e) {
    if (!state.playingId) return;
    dragging = true;
    scrub.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  });
  scrub.addEventListener("pointermove", function (e) {
    if (dragging) seekFromClientX(e.clientX);
  });
  scrub.addEventListener("pointerup", function (e) {
    dragging = false;
    try { scrub.releasePointerCapture(e.pointerId); } catch (_) {}
  });
  scrub.addEventListener("keydown", function (e) {
    if (!state.playingId) return;
    var step = e.shiftKey ? 15 : 5;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      state.progress = Math.min(state.duration, state.progress + step);
      updateScrub();
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      state.progress = Math.max(0, state.progress - step);
      updateScrub();
      e.preventDefault();
    } else if (e.key === "Home") {
      state.progress = 0;
      updateScrub();
      e.preventDefault();
    } else if (e.key === "End") {
      state.progress = state.duration;
      updateScrub();
      e.preventDefault();
    }
  });

  /* ---------- Event wiring ---------- */
  grid.addEventListener("click", function (e) {
    var playBtn = e.target.closest(".playbtn");
    var card = e.target.closest(".card");
    if (!card) return;
    var id = card.getAttribute("data-id");
    if (playBtn) {
      e.stopPropagation();
      playRelease(id);
    } else {
      // clicking the card body opens / plays the release
      playRelease(id);
    }
  });

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      state.filter = tab.getAttribute("data-filter");
      render();
    });
  });

  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    render();
    toast("Sorted by " + sortSelect.options[sortSelect.selectedIndex].text.toLowerCase());
  });

  function setView(view) {
    state.view = view;
    var isList = view === "list";
    grid.classList.toggle("is-list", isList);
    gridViewBtn.classList.toggle("is-active", !isList);
    listViewBtn.classList.toggle("is-active", isList);
    gridViewBtn.setAttribute("aria-pressed", String(!isList));
    listViewBtn.setAttribute("aria-pressed", String(isList));
  }
  gridViewBtn.addEventListener("click", function () { setView("grid"); });
  listViewBtn.addEventListener("click", function () { setView("list"); });

  nowPlay.addEventListener("click", togglePlay);
  document.getElementById("nowClose").addEventListener("click", function () {
    stopPlayback();
    toast("Playback stopped");
  });

  document.getElementById("shuffleBtn").addEventListener("click", function () {
    var list = getVisible();
    if (!list.length) return;
    var pick = list[Math.floor(Math.random() * list.length)];
    playRelease(pick.id);
  });

  document.getElementById("followBtn").addEventListener("click", function (e) {
    var btn = e.currentTarget;
    var on = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", String(!on));
    btn.textContent = on ? "Follow" : "Following";
    toast(on ? "Unfollowed Neon Tides" : "Following Neon Tides");
  });

  /* ---------- Init ---------- */
  setCounts();
  render();
})();
