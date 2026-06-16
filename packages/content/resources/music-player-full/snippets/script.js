(function () {
  "use strict";

  /* ---------- Fictional catalog ---------- */
  var TRACKS = [
    {
      title: "Paper Lanterns",
      artist: "Neon Tides",
      album: "Midnight Reservoir",
      duration: 222, // 3:42
      colors: ["#8b5cf6", "#ff3d71", "#1db954"],
      glow: "rgba(139, 92, 246, 0.55)",
      lyrics: [
        "Paper lanterns on the wire,",
        "flickering like a slow desire,",
        "we drift below the humming light,",
        "two shadows folding into night.",
        "Hold the quiet, let it stay —",
        "the reservoir will drink the day.",
        "And every echo that we made",
        "dissolves into the river's shade."
      ]
    },
    {
      title: "Velvet Static",
      artist: "Cassette Bloom",
      album: "Saltwater Cassette",
      duration: 198, // 3:18
      colors: ["#ff3d71", "#ffb13d", "#8b5cf6"],
      glow: "rgba(255, 61, 113, 0.5)",
      lyrics: [
        "Velvet static on the line,",
        "your voice arriving out of time,",
        "I tune the dial to find your face",
        "in the warm hiss of empty space.",
        "Stay a little, don't sign off —",
        "the signal's soft, the night is long.",
        "We are the noise between the songs,",
        "the part that fades but lingers on."
      ]
    },
    {
      title: "Glass Avenue",
      artist: "Aurora Lowtide",
      album: "Northbound Aurora",
      duration: 254, // 4:14
      colors: ["#1db954", "#34d8ff", "#8b5cf6"],
      glow: "rgba(52, 216, 255, 0.5)",
      lyrics: [
        "Down on Glass Avenue tonight,",
        "the rain rewrites the city lights,",
        "I count the windows, one by one,",
        "small constellations, never done.",
        "Carry me past the neon haze,",
        "the northbound train, the borrowed days.",
        "And if the morning finds us here,",
        "we'll call it home, we'll disappear."
      ]
    },
    {
      title: "Slow Comet",
      artist: "Marble Heights",
      album: "Orbit of Small Things",
      duration: 176, // 2:56
      colors: ["#ffb13d", "#ff3d71", "#1db954"],
      glow: "rgba(255, 177, 61, 0.5)",
      lyrics: [
        "Slow comet over rooftop tar,",
        "you wished on something just as far,",
        "a tail of dust, a borrowed flame,",
        "you whispered out a stranger's name.",
        "Let it burn, let it go —",
        "the orbit pulls us, soft and slow.",
        "We are the small and falling things",
        "that learn to fly without the wings."
      ]
    },
    {
      title: "Harbor Lights",
      artist: "Quiet Atlas",
      album: "Coast & Current",
      duration: 231, // 3:51
      colors: ["#34d8ff", "#8b5cf6", "#1db954"],
      glow: "rgba(52, 216, 255, 0.55)",
      lyrics: [
        "Harbor lights in amber rows,",
        "the tide remembers where it goes,",
        "I leave my worries on the pier",
        "and let the current pull them clear.",
        "Steady now, the morning breaks,",
        "across the coast the silver wakes.",
        "Whatever sank will surface soon —",
        "the harbor keeps a softer tune."
      ]
    }
  ];

  /* ---------- DOM ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;
  var backdrop = $("backdrop");
  var cover = $("cover");
  var glow = $("glow");
  var eq = $("eq");
  var trackTitle = $("trackTitle");
  var trackArtist = $("trackArtist");
  var topbarAlbum = $("topbarAlbum");
  var playBtn = $("play");
  var likeBtn = $("like");
  var shuffleBtn = $("shuffle");
  var repeatBtn = $("repeat");
  var prevBtn = $("prev");
  var nextBtn = $("next");
  var scrubber = $("scrubber");
  var wave = $("wave");
  var wavePlayed = $("wavePlayed");
  var scrubHandle = $("scrubHandle");
  var timeCurrent = $("timeCurrent");
  var timeTotal = $("timeTotal");
  var drawer = $("drawer");
  var drawerHandle = $("drawerHandle");
  var queueToggle = $("queueToggle");
  var queueEl = $("queue");
  var lyricsEl = $("lyrics");
  var toastEl = $("toast");

  /* ---------- State ---------- */
  var current = 0;
  var position = 0;      // seconds
  var playing = false;
  var liked = {};        // index -> bool
  var repeatOn = false;
  var shuffleOn = false;
  var timer = null;
  var WAVE_BARS = 64;

  /* ---------- Helpers ---------- */
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" + s : s);
  }

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1900);
  }

  /* Build static waveform bars (seeded so each track has its own shape) */
  function buildWave(seed) {
    var htmlA = "", htmlB = "";
    var x = seed * 9301 + 49297;
    function rnd() { x = (x * 9301 + 49297) % 233280; return x / 233280; }
    for (var i = 0; i < WAVE_BARS; i++) {
      var base = 0.25 + Math.abs(Math.sin(i * 0.4 + seed)) * 0.55;
      var h = Math.round((base + rnd() * 0.2) * 100);
      if (h > 100) h = 100;
      var bar = '<span class="bar" style="height:' + h + '%"></span>';
      htmlA += bar;
      htmlB += bar;
    }
    wave.innerHTML = htmlA;
    wavePlayed.innerHTML = htmlB;
  }

  /* ---------- Render track ---------- */
  function loadTrack(i, opts) {
    opts = opts || {};
    current = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    var t = TRACKS[current];

    // Recolor ambient theme from "cover"
    root.style.setProperty("--cover-a", t.colors[0]);
    root.style.setProperty("--cover-b", t.colors[1]);
    root.style.setProperty("--cover-c", t.colors[2]);
    root.style.setProperty("--cover-glow", t.glow);

    trackTitle.textContent = t.title;
    trackArtist.textContent = t.artist;
    topbarAlbum.textContent = t.album;
    timeTotal.textContent = fmt(t.duration);

    likeBtn.setAttribute("aria-pressed", liked[current] ? "true" : "false");

    buildWave(current + 1);
    renderLyrics();
    renderQueue();

    position = 0;
    updateProgress();

    if (opts.autoplay) { setPlaying(true); }
    else { syncEqAndSpin(); }
  }

  /* ---------- Progress ---------- */
  function updateProgress() {
    var t = TRACKS[current];
    var pct = t.duration ? (position / t.duration) * 100 : 0;
    if (pct > 100) pct = 100;
    wavePlayed.style.width = pct + "%";
    scrubHandle.style.left = pct + "%";
    timeCurrent.textContent = fmt(position);
    scrubber.setAttribute("aria-valuenow", Math.round(pct));
    scrubber.setAttribute("aria-valuetext", fmt(position) + " of " + fmt(t.duration));
    highlightLyric(pct);
  }

  /* ---------- Playback engine (simulated) ---------- */
  function tick() {
    var t = TRACKS[current];
    position += 1;
    if (position >= t.duration) {
      if (repeatOn) {
        position = 0;
      } else {
        position = t.duration;
        updateProgress();
        gotoNext(true);
        return;
      }
    }
    updateProgress();
  }

  function setPlaying(on) {
    playing = on;
    playBtn.setAttribute("aria-pressed", on ? "true" : "false");
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
    syncEqAndSpin();
    clearInterval(timer);
    if (on) { timer = setInterval(tick, 1000); }
  }

  function syncEqAndSpin() {
    if (playing) {
      cover.classList.add("spinning");
      eq.classList.add("is-on");
    } else {
      cover.classList.remove("spinning");
      eq.classList.remove("is-on");
    }
  }

  function gotoNext(auto) {
    var nextIndex;
    if (shuffleOn) {
      do { nextIndex = Math.floor(Math.random() * TRACKS.length); }
      while (nextIndex === current && TRACKS.length > 1);
    } else {
      nextIndex = current + 1;
    }
    loadTrack(nextIndex, { autoplay: auto || playing });
    if (!auto) { toast("Next: " + TRACKS[current].title); }
  }

  function gotoPrev() {
    if (position > 3) { position = 0; updateProgress(); return; }
    loadTrack(current - 1, { autoplay: playing });
  }

  /* ---------- Lyrics ---------- */
  function renderLyrics() {
    var t = TRACKS[current];
    lyricsEl.innerHTML = t.lyrics.map(function (line) {
      return '<div class="lyric-line">' + line + "</div>";
    }).join("");
  }
  function highlightLyric(pct) {
    var lines = lyricsEl.children;
    if (!lines.length) return;
    var idx = Math.min(lines.length - 1, Math.floor((pct / 100) * lines.length));
    for (var i = 0; i < lines.length; i++) {
      lines[i].classList.toggle("is-active", i === idx);
    }
  }

  /* ---------- Queue ---------- */
  function renderQueue() {
    queueEl.innerHTML = "";
    TRACKS.forEach(function (t, i) {
      var li = document.createElement("li");
      li.className = "q-item" + (i === current ? " is-current" : "");
      li.setAttribute("role", "button");
      li.setAttribute("tabindex", "0");
      var dur = i === current ? "" : fmt(t.duration);
      li.innerHTML =
        '<span class="q-thumb" style="--qa:' + t.colors[0] + ';--qb:' + t.colors[1] + '"></span>' +
        '<span class="q-info">' +
          '<span class="q-title">' + t.title + "</span>" +
          '<span class="q-sub">' + t.artist + " · " + t.album + "</span>" +
        "</span>" +
        '<span class="q-dur">' + dur + "</span>";
      function pick() {
        if (i === current) { setPlaying(!playing); return; }
        loadTrack(i, { autoplay: true });
        toast("Now playing · " + TRACKS[current].title);
      }
      li.addEventListener("click", pick);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); }
      });
      queueEl.appendChild(li);
    });
  }

  /* ---------- Scrubber (click + drag + keyboard) ---------- */
  function pctFromEvent(clientX) {
    var rect = scrubber.getBoundingClientRect();
    var p = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, p));
  }
  function seekTo(p) {
    position = Math.round(p * TRACKS[current].duration);
    updateProgress();
  }
  var dragging = false;
  function onDown(e) {
    dragging = true;
    var x = e.touches ? e.touches[0].clientX : e.clientX;
    seekTo(pctFromEvent(x));
    e.preventDefault();
  }
  function onMove(e) {
    if (!dragging) return;
    var x = e.touches ? e.touches[0].clientX : e.clientX;
    seekTo(pctFromEvent(x));
  }
  function onUp() {
    if (dragging) { dragging = false; }
  }
  scrubber.addEventListener("mousedown", onDown);
  scrubber.addEventListener("touchstart", onDown, { passive: false });
  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("mouseup", onUp);
  window.addEventListener("touchend", onUp);
  scrubber.addEventListener("keydown", function (e) {
    var step = TRACKS[current].duration * 0.05;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { position = Math.min(TRACKS[current].duration, position + step); updateProgress(); e.preventDefault(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { position = Math.max(0, position - step); updateProgress(); e.preventDefault(); }
    else if (e.key === "Home") { position = 0; updateProgress(); e.preventDefault(); }
    else if (e.key === "End") { position = TRACKS[current].duration; updateProgress(); e.preventDefault(); }
  });

  /* ---------- Controls ---------- */
  playBtn.addEventListener("click", function () { setPlaying(!playing); });
  nextBtn.addEventListener("click", function () { gotoNext(false); });
  prevBtn.addEventListener("click", gotoPrev);

  likeBtn.addEventListener("click", function () {
    liked[current] = !liked[current];
    likeBtn.setAttribute("aria-pressed", liked[current] ? "true" : "false");
    likeBtn.classList.remove("bump");
    void likeBtn.offsetWidth;
    likeBtn.classList.add("bump");
    toast(liked[current] ? "Added to Liked Songs" : "Removed from Liked Songs");
  });

  shuffleBtn.addEventListener("click", function () {
    shuffleOn = !shuffleOn;
    shuffleBtn.setAttribute("aria-pressed", shuffleOn ? "true" : "false");
    toast(shuffleOn ? "Shuffle on" : "Shuffle off");
  });

  repeatBtn.addEventListener("click", function () {
    repeatOn = !repeatOn;
    repeatBtn.setAttribute("aria-pressed", repeatOn ? "true" : "false");
    toast(repeatOn ? "Repeat one" : "Repeat off");
  });

  $("addPlaylist").addEventListener("click", function () {
    toast("Saved to “Late Night Drive”");
  });
  $("share").addEventListener("click", function () {
    toast("Share link copied");
  });
  $("swap").addEventListener("click", function () {
    var nextIndex;
    do { nextIndex = Math.floor(Math.random() * TRACKS.length); }
    while (nextIndex === current && TRACKS.length > 1);
    loadTrack(nextIndex, { autoplay: true });
    toast("Shuffle pick · " + TRACKS[current].title);
  });
  $("more").addEventListener("click", function () { toast("More options"); });
  $("minimize").addEventListener("click", function () { toast("Minimized to mini-player"); });

  /* ---------- Drawer ---------- */
  function toggleDrawer(force) {
    var open = typeof force === "boolean" ? force : !drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    queueToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  queueToggle.addEventListener("click", function () { toggleDrawer(); switchTab("upnext"); });
  drawerHandle.addEventListener("click", function () { toggleDrawer(); });
  drawerHandle.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDrawer(); }
  });

  function switchTab(which) {
    var upnext = which === "upnext";
    $("tabUpnext").classList.toggle("is-active", upnext);
    $("tabLyrics").classList.toggle("is-active", !upnext);
    $("tabUpnext").setAttribute("aria-selected", upnext ? "true" : "false");
    $("tabLyrics").setAttribute("aria-selected", !upnext ? "true" : "false");
    $("panelUpnext").classList.toggle("is-hidden", !upnext);
    $("panelLyrics").classList.toggle("is-hidden", upnext);
  }
  $("tabUpnext").addEventListener("click", function () { switchTab("upnext"); });
  $("tabLyrics").addEventListener("click", function () { switchTab("lyrics"); });

  /* ---------- Global keyboard shortcuts ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest(".scrubber, button, [role=button]")) return;
    if (e.key === " " || e.key === "k") { e.preventDefault(); setPlaying(!playing); }
    else if (e.key === "ArrowRight" && e.shiftKey) { gotoNext(false); }
    else if (e.key === "ArrowLeft" && e.shiftKey) { gotoPrev(); }
    else if (e.key.toLowerCase() === "l") { likeBtn.click(); }
  });

  /* ---------- Init ---------- */
  loadTrack(0);
})();
