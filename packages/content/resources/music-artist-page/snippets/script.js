(function () {
  "use strict";

  // ---- Data (fictional) ----
  var TRACKS = [
    { id: "t1", title: "Paper Lanterns", plays: "182,440,118", dur: 222, c1: "#1db954", c2: "#0e7a3a", liked: true },
    { id: "t2", title: "Midnight Reservoir", plays: "146,902,331", dur: 256, c1: "#8b5cf6", c2: "#3b1d7a", liked: false },
    { id: "t3", title: "Velvet Static", plays: "121,773,540", dur: 198, c1: "#ff3d71", c2: "#7a1d36", liked: false },
    { id: "t4", title: "Coastal Glow", plays: "98,210,664", dur: 241, c1: "#22d3ee", c2: "#0e5a6a", liked: false },
    { id: "t5", title: "Saltwater Neon", plays: "76,558,902", dur: 207, c1: "#f59e0b", c2: "#7a5210", liked: false },
    { id: "t6", title: "Halcyon Drift", plays: "61,330,210", dur: 274, c1: "#ec4899", c2: "#7a2150", liked: true },
    { id: "t7", title: "Low Tide Lights", plays: "44,118,775", dur: 189, c1: "#34d399", c2: "#0f6b4d", liked: false },
    { id: "t8", title: "Marble Skies", plays: "39,902,114", dur: 233, c1: "#60a5fa", c2: "#1e3a8a", liked: false }
  ];

  var ALBUMS = [
    { title: "Midnight Reservoir", year: "2026 · Album", c1: "#8b5cf6", c2: "#1db954" },
    { title: "Coastal Static", year: "2025 · Album", c1: "#22d3ee", c2: "#ff3d71" },
    { title: "Paper Lanterns", year: "2024 · Single", c1: "#1db954", c2: "#0e7a3a" },
    { title: "Neon Demos", year: "2023 · EP", c1: "#f59e0b", c2: "#ec4899" },
    { title: "Tidewater", year: "2022 · Album", c1: "#60a5fa", c2: "#8b5cf6" }
  ];

  var FANS = [
    { name: "Velvet Static", sub: "Artist", c1: "#ff3d71", c2: "#7a1d36" },
    { name: "Glasshouse", sub: "Artist", c1: "#22d3ee", c2: "#1e3a8a" },
    { name: "Mara Vel", sub: "Artist", c1: "#8b5cf6", c2: "#3b1d7a" },
    { name: "Coral Hours", sub: "Artist", c1: "#34d399", c2: "#0f6b4d" },
    { name: "Lumen Ave", sub: "Artist", c1: "#f59e0b", c2: "#7a5210" },
    { name: "Northbound", sub: "Artist", c1: "#60a5fa", c2: "#1e3a8a" }
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  // ---- Toast ----
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // ---- Render top tracks ----
  var trackList = $("#trackList");
  TRACKS.forEach(function (t, i) {
    var li = document.createElement("li");
    li.className = "track" + (i >= 5 ? " hidden extra" : "");
    li.dataset.id = t.id;
    li.style.setProperty("--c1", t.c1);
    li.style.setProperty("--c2", t.c2);
    li.innerHTML =
      '<div class="t-rank">' +
        '<span class="t-rank-num">' + (i + 1) + '</span>' +
        '<span class="t-hit">' +
          '<button class="t-mini-play t-mini" type="button" aria-label="Play ' + t.title + '">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
          '</button>' +
          '<span class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span>' +
        '</span>' +
      '</div>' +
      '<div class="t-cover" aria-hidden="true"></div>' +
      '<div class="t-main"><span class="t-title">' + t.title + '</span></div>' +
      '<span class="t-plays">' + t.plays + '</span>' +
      '<button class="t-like" type="button" aria-pressed="' + (t.liked ? "true" : "false") +
        '" aria-label="Like ' + t.title + '">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
          (t.liked
            ? '<path fill="currentColor" d="M12 21s-7.5-4.9-10-9.3C.4 8.7 2 5 5.4 5c2 0 3.3 1.1 4.1 2.2C10.3 6.1 11.6 5 13.6 5 17 5 18.6 8.7 17 11.7 14.5 16.1 12 21 12 21z"/>'
            : '<path fill="none" stroke="currentColor" stroke-width="1.7" d="M12 20s-6.8-4.4-9.1-8.5C1.3 8.4 2.7 6 5.4 6c1.9 0 3 1 3.9 2.1L12 9.6l.7-1.5C13.6 7 14.7 6 16.6 6c2.7 0 4.1 2.4 2.5 5.5C16.8 15.6 12 20 12 20z"/>') +
        '</svg>' +
      '</button>' +
      '<span class="t-dur">' + fmt(t.dur) + '</span>';
    trackList.appendChild(li);
  });

  // ---- Render discography ----
  var discoRow = $("#discoRow");
  ALBUMS.forEach(function (a) {
    var d = document.createElement("article");
    d.className = "album";
    d.tabIndex = 0;
    d.style.setProperty("--c1", a.c1);
    d.style.setProperty("--c2", a.c2);
    d.innerHTML =
      '<div class="album-art"><span class="a-disc"></span>' +
        '<button class="a-mini" type="button" aria-label="Play ' + a.title + '">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="a-title">' + a.title + '</div>' +
      '<div class="a-sub">' + a.year + '</div>';
    d.querySelector(".a-mini").addEventListener("click", function (e) {
      e.stopPropagation();
      toast("Playing " + a.title);
    });
    d.addEventListener("click", function () { toast("Opening " + a.title); });
    discoRow.appendChild(d);
  });

  // ---- Render fans also like ----
  var fansRow = $("#fansRow");
  FANS.forEach(function (f) {
    var el = document.createElement("article");
    el.className = "fan";
    el.tabIndex = 0;
    el.style.setProperty("--c1", f.c1);
    el.style.setProperty("--c2", f.c2);
    el.innerHTML =
      '<div class="fan-art" aria-hidden="true"></div>' +
      '<div class="a-title">' + f.name + '</div>' +
      '<div class="a-sub">' + f.sub + '</div>';
    el.addEventListener("click", function () { toast("Opening " + f.name); });
    fansRow.appendChild(el);
  });

  // ---- Playback engine ----
  var heroPlay = $("#heroPlay");
  var nowbar = $("#nowbar");
  var npCover = $("#npCover");
  var npTitle = $("#npTitle");
  var npToggle = $("#npToggle");
  var npCur = $("#npCur");
  var npDur = $("#npDur");
  var scrub = $("#scrub");
  var scrubFill = $("#scrubFill");
  var scrubKnob = $("#scrubKnob");

  var state = { id: null, playing: false, pos: 0, dur: 0, timer: null };

  function trackById(id) {
    for (var i = 0; i < TRACKS.length; i++) if (TRACKS[i].id === id) return TRACKS[i];
    return null;
  }

  function tick() {
    if (!state.playing) return;
    state.pos += 0.5;
    if (state.pos >= state.dur) { nextTrack(); return; }
    renderProgress();
  }

  function startTimer() {
    stopTimer();
    state.timer = setInterval(tick, 500);
  }
  function stopTimer() {
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
  }

  function renderProgress() {
    var pct = state.dur ? (state.pos / state.dur) * 100 : 0;
    scrubFill.style.width = pct + "%";
    scrubKnob.style.left = pct + "%";
    scrub.setAttribute("aria-valuenow", Math.round(pct));
    npCur.textContent = fmt(state.pos);
  }

  function syncUI() {
    $$(".track").forEach(function (li) {
      var on = li.dataset.id === state.id && state.playing;
      li.classList.toggle("playing", li.dataset.id === state.id);
      var btn = li.querySelector(".t-mini-play");
      if (btn) {
        btn.setAttribute("aria-label",
          (li.dataset.id === state.id && state.playing ? "Pause " : "Play ") +
          li.querySelector(".t-title").textContent);
      }
      // toggle play/pause icon on currently selected, non-playing track handled by .playing class via eq
      void on;
    });
    heroPlay.setAttribute("aria-pressed", state.playing ? "true" : "false");
    npToggle.setAttribute("aria-pressed", state.playing ? "true" : "false");
    npToggle.setAttribute("aria-label", state.playing ? "Pause" : "Play");
  }

  function loadTrack(id, autoplay) {
    var t = trackById(id);
    if (!t) return;
    state.id = id;
    state.dur = t.dur;
    state.pos = 0;
    npTitle.textContent = t.title;
    npCover.style.setProperty("--c1", t.c1);
    npCover.style.setProperty("--c2", t.c2);
    npDur.textContent = fmt(t.dur);
    nowbar.hidden = false;
    document.body.style.setProperty("--c1", t.c1);
    renderProgress();
    if (autoplay) play(); else { state.playing = false; stopTimer(); syncUI(); }
  }

  function play() {
    if (!state.id) { loadTrack(TRACKS[0].id, false); }
    state.playing = true;
    startTimer();
    syncUI();
  }
  function pause() {
    state.playing = false;
    stopTimer();
    syncUI();
  }
  function toggle() { state.playing ? pause() : play(); }

  function nextTrack() {
    var idx = 0;
    for (var i = 0; i < TRACKS.length; i++) if (TRACKS[i].id === state.id) idx = i;
    var next = TRACKS[(idx + 1) % TRACKS.length];
    loadTrack(next.id, true);
  }

  // hero play
  heroPlay.addEventListener("click", function () {
    if (!state.id) { loadTrack(TRACKS[0].id, true); }
    else { toggle(); }
  });

  // shuffle
  $("#shuffleBtn").addEventListener("click", function () {
    var r = TRACKS[Math.floor(Math.random() * TRACKS.length)];
    loadTrack(r.id, true);
    toast("Shuffling Neon Tides");
  });

  $("#moreBtn").addEventListener("click", function () { toast("More options"); });

  // now bar toggle
  npToggle.addEventListener("click", toggle);

  // track row clicks (delegated)
  trackList.addEventListener("click", function (e) {
    var likeBtn = e.target.closest(".t-like");
    if (likeBtn) {
      var pressed = likeBtn.getAttribute("aria-pressed") === "true";
      likeBtn.setAttribute("aria-pressed", pressed ? "false" : "true");
      likeBtn.querySelector("svg").innerHTML = pressed
        ? '<path fill="none" stroke="currentColor" stroke-width="1.7" d="M12 20s-6.8-4.4-9.1-8.5C1.3 8.4 2.7 6 5.4 6c1.9 0 3 1 3.9 2.1L12 9.6l.7-1.5C13.6 7 14.7 6 16.6 6c2.7 0 4.1 2.4 2.5 5.5C16.8 15.6 12 20 12 20z"/>'
        : '<path fill="currentColor" d="M12 21s-7.5-4.9-10-9.3C.4 8.7 2 5 5.4 5c2 0 3.3 1.1 4.1 2.2C10.3 6.1 11.6 5 13.6 5 17 5 18.6 8.7 17 11.7 14.5 16.1 12 21 12 21z"/>';
      toast(pressed ? "Removed from Liked Songs" : "Added to Liked Songs");
      return;
    }
    var row = e.target.closest(".track");
    if (!row) return;
    var id = row.dataset.id;
    if (id === state.id) { toggle(); }
    else { loadTrack(id, true); }
  });

  // ---- Follow toggle ----
  var followBtn = $("#followBtn");
  followBtn.addEventListener("click", function () {
    var following = followBtn.getAttribute("aria-pressed") === "true";
    followBtn.setAttribute("aria-pressed", following ? "false" : "true");
    followBtn.textContent = following ? "Follow" : "Following";
    var el = $("#listeners");
    var n = parseInt(el.textContent.replace(/,/g, ""), 10) + (following ? -1 : 1);
    el.textContent = n.toLocaleString("en-US");
    toast(following ? "Unfollowed Neon Tides" : "Following Neon Tides");
  });

  // ---- Show more ----
  var showMore = $("#showMore");
  showMore.addEventListener("click", function () {
    var expanded = showMore.getAttribute("aria-expanded") === "true";
    $$(".track.extra").forEach(function (el) { el.classList.toggle("hidden", expanded); });
    showMore.setAttribute("aria-expanded", expanded ? "false" : "true");
    showMore.textContent = expanded ? "Show more" : "Show less";
  });

  // ---- Scrubber ----
  function seekFromEvent(clientX) {
    var rect = scrub.getBoundingClientRect();
    var pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    state.pos = pct * state.dur;
    renderProgress();
  }
  var dragging = false;
  scrub.addEventListener("pointerdown", function (e) {
    if (!state.id) return;
    dragging = true;
    scrub.setPointerCapture(e.pointerId);
    seekFromEvent(e.clientX);
  });
  scrub.addEventListener("pointermove", function (e) {
    if (dragging) seekFromEvent(e.clientX);
  });
  scrub.addEventListener("pointerup", function () { dragging = false; });
  scrub.addEventListener("keydown", function (e) {
    if (!state.id) return;
    var step = 5;
    if (e.key === "ArrowRight") { state.pos = Math.min(state.dur, state.pos + step); renderProgress(); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { state.pos = Math.max(0, state.pos - step); renderProgress(); e.preventDefault(); }
    else if (e.key === "Home") { state.pos = 0; renderProgress(); e.preventDefault(); }
    else if (e.key === "End") { state.pos = state.dur; renderProgress(); e.preventDefault(); }
  });

  // keyboard activation for album/fan cards
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && document.activeElement &&
        (document.activeElement.classList.contains("album") || document.activeElement.classList.contains("fan"))) {
      e.preventDefault();
      document.activeElement.click();
    }
  });
})();
