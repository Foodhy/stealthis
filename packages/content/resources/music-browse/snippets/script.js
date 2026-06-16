(function () {
  "use strict";

  /* ----------------------------------------------------------------
   * Fictional data
   * ---------------------------------------------------------------- */
  var PALETTES = {
    sunset:  ["#ff7a59", "#8b5cf6"],
    deep:    ["#1db954", "#0e7c5a"],
    violet:  ["#8b5cf6", "#22d3ee"],
    blush:   ["#ff3d71", "#ffb86b"],
    ocean:   ["#2563eb", "#22d3ee"],
    ember:   ["#f97316", "#ff3d71"],
    mint:    ["#10b981", "#84cc16"],
    dusk:    ["#6366f1", "#ec4899"],
    gold:    ["#facc15", "#f97316"],
    night:   ["#334155", "#0ea5e9"]
  };

  var MUSIC = {
    new: [
      { title: "Midnight Reservoir", sub: "Neon Tides", dur: 222, pal: "sunset" },
      { title: "Velvet Static", sub: "The Paper Lanterns", dur: 198, pal: "violet" },
      { title: "Glass Harbor", sub: "Mara Quill", dur: 244, pal: "ocean" },
      { title: "Slow Comet", sub: "Halcyon Drift", dur: 211, pal: "blush" },
      { title: "Amber Frequency", sub: "Lou Verano", dur: 187, pal: "gold" },
      { title: "Northern Ghosts", sub: "Coastline", dur: 256, pal: "night" },
      { title: "Cassette Heaven", sub: "Bloom & Static", dur: 203, pal: "dusk" },
      { title: "Saltwater Radio", sub: "Wren Avila", dur: 229, pal: "mint" }
    ],
    mixes: [
      { title: "Daily Mix 1", sub: "Neon Tides, Coastline, Mara Quill +", dur: 0, pal: "deep", tag: "Mix" },
      { title: "Night Drive", sub: "Made for Riva — synth & dream pop", dur: 0, pal: "dusk", tag: "Mix" },
      { title: "Deep Focus", sub: "Beatless textures to stay locked in", dur: 0, pal: "ocean", tag: "Mix" },
      { title: "On Repeat", sub: "The songs you can't stop playing", dur: 0, pal: "ember", tag: "Mix" },
      { title: "Time Capsule", sub: "Throwbacks picked for you", dur: 0, pal: "gold", tag: "Mix" },
      { title: "Discover Weekly", sub: "Fresh finds, every Monday", dur: 0, pal: "violet", tag: "Mix" }
    ],
    charts: [
      { title: "Paper Lanterns", artist: "Neon Tides", plays: "48.2M", dur: 201, move: "up", pal: "sunset" },
      { title: "Velvet Static", artist: "The Paper Lanterns", plays: "41.9M", dur: 198, move: "flat", pal: "violet" },
      { title: "Glass Harbor", artist: "Mara Quill", plays: "37.4M", dur: 244, move: "up", pal: "ocean" },
      { title: "Slow Comet", artist: "Halcyon Drift", plays: "33.1M", dur: 211, move: "down", pal: "blush" },
      { title: "Saltwater Radio", artist: "Wren Avila", plays: "29.8M", dur: 229, move: "up", pal: "mint" },
      { title: "Amber Frequency", artist: "Lou Verano", plays: "26.0M", dur: 187, move: "down", pal: "gold" },
      { title: "Northern Ghosts", artist: "Coastline", plays: "24.5M", dur: 256, move: "flat", pal: "night" },
      { title: "Cassette Heaven", artist: "Bloom & Static", plays: "22.7M", dur: 203, move: "up", pal: "dusk" }
    ]
  };

  var PODCASTS = {
    new: [
      { title: "Signal & Noise", sub: "Ep. 142 — The synth that ate pop", dur: 2940, pal: "ocean" },
      { title: "Quiet Riot Hours", sub: "Late-night talk for night owls", dur: 3360, pal: "dusk" },
      { title: "Field Notes", sub: "Ep. 58 — Recording the Arctic", dur: 2580, pal: "mint" },
      { title: "The Long Cut", sub: "Filmmakers, unscripted", dur: 4020, pal: "ember" },
      { title: "Stack Overflow Coffee", sub: "Dev stories before standup", dur: 1860, pal: "deep" },
      { title: "Ghost Frequencies", sub: "Audio mysteries, retold", dur: 3120, pal: "night" }
    ],
    mixes: [
      { title: "Your Daily Drive", sub: "News + the shows you follow", dur: 0, pal: "violet", tag: "Playlist" },
      { title: "Wind Down", sub: "Calm voices for the evening", dur: 0, pal: "blush", tag: "Playlist" },
      { title: "Commute Boost", sub: "Short episodes under 25 min", dur: 0, pal: "gold", tag: "Playlist" },
      { title: "Deep Dives", sub: "Long-form investigations", dur: 0, pal: "ocean", tag: "Playlist" },
      { title: "Comedy Queue", sub: "Picked to make you laugh", dur: 0, pal: "ember", tag: "Playlist" }
    ],
    charts: [
      { title: "The synth that ate pop", artist: "Signal & Noise", plays: "1.2M", dur: 2940, move: "up", pal: "ocean" },
      { title: "Recording the Arctic", artist: "Field Notes", plays: "980K", dur: 2580, move: "up", pal: "mint" },
      { title: "Filmmakers, unscripted", artist: "The Long Cut", plays: "874K", dur: 4020, move: "flat", pal: "ember" },
      { title: "Audio mysteries, retold", artist: "Ghost Frequencies", plays: "812K", dur: 3120, move: "down", pal: "night" },
      { title: "Dev stories before standup", artist: "Stack Overflow Coffee", plays: "760K", dur: 1860, move: "up", pal: "deep" },
      { title: "Late-night talk", artist: "Quiet Riot Hours", plays: "688K", dur: 3360, move: "flat", pal: "dusk" }
    ]
  };

  var GENRES = [
    { name: "Pop", pal: "sunset" },
    { name: "Hip-Hop", pal: "ember" },
    { name: "Chill", pal: "ocean" },
    { name: "Workout", pal: "blush" },
    { name: "Focus", pal: "deep" },
    { name: "Party", pal: "dusk" },
    { name: "Indie", pal: "mint" },
    { name: "R&B", pal: "violet" },
    { name: "Electronic", pal: "night" },
    { name: "Jazz", pal: "gold" }
  ];

  /* ----------------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------------- */
  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function pal(name) { return PALETTES[name] || PALETTES.deep; }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function coverVars(p) {
    var c = pal(p);
    return "--c1:" + c[0] + ";--c2:" + c[1] + ";";
  }

  /* ----------------------------------------------------------------
   * Card builders
   * ---------------------------------------------------------------- */
  function buildCard(item, kind) {
    var card = document.createElement("article");
    card.className = "card" + (kind === "mix" ? " mix" : "");
    card.dataset.title = item.title;
    card.dataset.sub = item.sub;
    card.dataset.pal = item.pal;

    var cover = document.createElement("div");
    cover.className = "cover";
    cover.setAttribute("style", coverVars(item.pal));
    cover.innerHTML = '<span class="cover-shape"></span>' +
      '<button class="play-overlay" aria-label="Play ' + item.title + '" aria-pressed="false"><span class="tri"></span></button>';
    card.appendChild(cover);

    var title = document.createElement("p");
    title.className = "card-title";
    title.textContent = item.title;
    card.appendChild(title);

    var sub = document.createElement("p");
    sub.className = "card-sub";
    sub.textContent = item.sub;
    card.appendChild(sub);

    if (item.tag) {
      var tag = document.createElement("span");
      tag.className = "card-tag";
      tag.textContent = item.tag;
      card.appendChild(tag);
    }

    var play = cover.querySelector(".play-overlay");
    play.addEventListener("click", function (e) {
      e.stopPropagation();
      playTrack({ title: item.title, artist: item.sub, dur: item.dur || 210, pal: item.pal }, card);
    });
    card.addEventListener("click", function () {
      toast("Opening " + item.title);
    });
    return card;
  }

  function buildGenre(g) {
    var btn = document.createElement("button");
    btn.className = "genre";
    btn.setAttribute("style", coverVars(g.pal));
    btn.innerHTML = "<span>" + g.name + "</span>";
    btn.addEventListener("click", function () { toast("Browsing " + g.name); });
    return btn;
  }

  function buildChartRow(item, rank) {
    var li = document.createElement("li");
    li.className = "chart-row";
    li.dataset.title = item.title;

    var moveSym = item.move === "up" ? "▲" : item.move === "down" ? "▼" : "—";
    var moveCls = item.move === "up" ? "ch-up" : item.move === "down" ? "ch-down" : "ch-flat";

    li.innerHTML =
      '<div class="ch-rank">' + rank +
        '<span class="ch-move ' + moveCls + '">' + moveSym + '</span></div>' +
      '<div class="ch-cover" style="' + coverVars(item.pal) + '"></div>' +
      '<div class="ch-info">' +
        '<div class="ch-title"><span class="ch-name"></span></div>' +
        '<div class="ch-artist"></div>' +
      '</div>' +
      '<div class="ch-plays">' + item.plays + '</div>' +
      '<div class="ch-dur">' + fmt(item.dur) + '</div>';

    li.querySelector(".ch-name").textContent = item.title;
    li.querySelector(".ch-artist").textContent = item.artist;

    li.addEventListener("click", function () {
      playTrack({ title: item.title, artist: item.artist, dur: item.dur, pal: item.pal }, null);
      markChartPlaying(li);
    });
    return li;
  }

  /* ----------------------------------------------------------------
   * Render a feed (music | podcasts)
   * ---------------------------------------------------------------- */
  var scrollerEls = document.querySelectorAll('[data-row="new"] .scroller, [data-row="mixes"] .scroller');

  function renderFeed(data) {
    var newScroller = document.querySelector('[data-row="new"] .scroller');
    var mixScroller = document.querySelector('[data-row="mixes"] .scroller');
    var chartList = document.getElementById("chartList");

    newScroller.innerHTML = "";
    data.new.forEach(function (it) { newScroller.appendChild(buildCard(it, "album")); });

    mixScroller.innerHTML = "";
    data.mixes.forEach(function (it) { mixScroller.appendChild(buildCard(it, "mix")); });

    chartList.innerHTML = "";
    data.charts.forEach(function (it, i) { chartList.appendChild(buildChartRow(it, i + 1)); });

    updateArrows();
  }

  function markChartPlaying(row) {
    document.querySelectorAll(".chart-row.is-playing").forEach(function (r) {
      r.classList.remove("is-playing");
      var eq = r.querySelector(".eq");
      if (eq) eq.remove();
      var dur = r.querySelector(".ch-dur");
      if (dur) dur.style.display = "";
    });
    if (row) {
      row.classList.add("is-playing");
      var title = row.querySelector(".ch-title");
      if (!title.querySelector(".eq")) {
        var eq = document.createElement("span");
        eq.className = "eq";
        eq.innerHTML = "<i></i><i></i><i></i><i></i>";
        title.appendChild(eq);
      }
    }
  }

  /* Build genres once */
  var genreGrid = document.getElementById("genreGrid");
  GENRES.forEach(function (g) { genreGrid.appendChild(buildGenre(g)); });

  /* ----------------------------------------------------------------
   * Tab switching
   * ---------------------------------------------------------------- */
  var greetSub = document.getElementById("greetSub");
  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (tab.classList.contains("is-active")) return;
      document.querySelectorAll(".tab").forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      var feed = tab.dataset.feed;
      renderFeed(feed === "podcasts" ? PODCASTS : MUSIC);
      greetSub.textContent = feed === "podcasts"
        ? "Shows and episodes picked for you."
        : "Picked for your night drive.";
      var fe = document.getElementById("feed");
      fe.animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: 280, easing: "ease" }
      );
    });
  });

  /* ----------------------------------------------------------------
   * Horizontal scrollers — arrows + drag
   * ---------------------------------------------------------------- */
  function updateArrows() {
    document.querySelectorAll('[data-row="new"], [data-row="mixes"]').forEach(function (row) {
      var sc = row.querySelector(".scroller");
      if (!sc) return;
      var btns = row.querySelectorAll(".scroll-btn");
      if (!btns.length) return;
      var maxScroll = sc.scrollWidth - sc.clientWidth - 2;
      btns.forEach(function (b) {
        if (b.dataset.dir === "-1") b.disabled = sc.scrollLeft <= 2;
        else b.disabled = sc.scrollLeft >= maxScroll;
      });
    });
  }

  document.querySelectorAll(".scroll-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var sc = btn.closest(".row").querySelector(".scroller");
      var amount = (sc.clientWidth * 0.8) * parseInt(btn.dataset.dir, 10);
      sc.scrollBy({ left: amount, behavior: "smooth" });
    });
  });

  document.querySelectorAll('[data-scroller]').forEach(function (sc) {
    sc.addEventListener("scroll", updateArrows, { passive: true });

    var down = false, startX = 0, startScroll = 0, moved = 0;
    sc.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      down = true; moved = 0;
      startX = e.clientX;
      startScroll = sc.scrollLeft;
      sc.setPointerCapture(e.pointerId);
    });
    sc.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) sc.classList.add("dragging");
      moved += Math.abs(dx);
      sc.scrollLeft = startScroll - dx;
    });
    function end(e) {
      if (!down) return;
      down = false;
      sc.classList.remove("dragging");
      try { sc.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    sc.addEventListener("pointerup", end);
    sc.addEventListener("pointercancel", end);

    /* keyboard scroll */
    sc.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { sc.scrollBy({ left: 200, behavior: "smooth" }); e.preventDefault(); }
      if (e.key === "ArrowLeft") { sc.scrollBy({ left: -200, behavior: "smooth" }); e.preventDefault(); }
    });
  });

  window.addEventListener("resize", updateArrows);

  /* ----------------------------------------------------------------
   * Simulated playback + now-playing bar
   * ---------------------------------------------------------------- */
  var nowbar = document.getElementById("nowbar");
  var nbArt = document.getElementById("nbArt");
  var nbTitle = document.getElementById("nbTitle");
  var nbArtist = document.getElementById("nbArtist");
  var nbPlay = document.getElementById("nbPlay");
  var nbLike = document.getElementById("nbLike");
  var nbCur = document.getElementById("nbCur");
  var nbDur = document.getElementById("nbDur");
  var nbScrub = document.getElementById("nbScrub");
  var nbFill = document.getElementById("nbFill");
  var nbKnob = document.getElementById("nbKnob");

  var current = null;        // { title, artist, dur, pal }
  var elapsed = 0;
  var playing = false;
  var timer = null;
  var activeCard = null;

  function renderProgress() {
    var d = current ? current.dur : 1;
    var pct = Math.min(100, (elapsed / d) * 100);
    nbFill.style.width = pct + "%";
    nbKnob.style.left = pct + "%";
    nbCur.textContent = fmt(elapsed);
    nbScrub.setAttribute("aria-valuenow", Math.round(pct));
    nbScrub.setAttribute("aria-valuetext", fmt(elapsed) + " of " + fmt(d));
  }

  function tick() {
    if (!playing || !current) return;
    elapsed += 1;
    if (elapsed >= current.dur) {
      elapsed = current.dur;
      renderProgress();
      pause();
      toast("Track finished");
      return;
    }
    renderProgress();
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(tick, 1000);
  }

  function setActiveCard(card) {
    if (activeCard && activeCard !== card) {
      activeCard.classList.remove("is-playing");
      var ov = activeCard.querySelector(".play-overlay");
      if (ov) ov.setAttribute("aria-pressed", "false");
    }
    activeCard = card || null;
    if (activeCard) {
      activeCard.classList.add("is-playing");
      var ov2 = activeCard.querySelector(".play-overlay");
      if (ov2) ov2.setAttribute("aria-pressed", "true");
    }
  }

  function playTrack(track, card) {
    current = track;
    elapsed = 0;
    nowbar.hidden = false;
    var c = pal(track.pal);
    nbArt.setAttribute("style", "--c1:" + c[0] + ";--c2:" + c[1] + ";");
    nbTitle.textContent = track.title;
    nbArtist.textContent = track.artist;
    nbDur.textContent = fmt(track.dur);
    nbLike.setAttribute("aria-pressed", "false");
    setActiveCard(card);
    play();
    renderProgress();
    toast("Now playing — " + track.title);
  }

  function play() {
    if (!current) return;
    playing = true;
    nbPlay.setAttribute("aria-pressed", "true");
    nbPlay.setAttribute("aria-label", "Pause");
    nowbar.classList.remove("paused");
    startTimer();
  }
  function pause() {
    playing = false;
    nbPlay.setAttribute("aria-pressed", "false");
    nbPlay.setAttribute("aria-label", "Play");
    nowbar.classList.add("paused");
    clearInterval(timer);
  }

  nbPlay.addEventListener("click", function () {
    if (!current) return;
    if (elapsed >= current.dur) elapsed = 0;
    playing ? pause() : play();
  });

  nbLike.addEventListener("click", function () {
    var on = nbLike.getAttribute("aria-pressed") === "true";
    nbLike.setAttribute("aria-pressed", String(!on));
    toast(on ? "Removed from your library" : "Saved to your library");
  });

  /* Scrubber: click + drag + keyboard */
  function seekFromClientX(clientX) {
    if (!current) return;
    var rect = nbScrub.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    elapsed = Math.round(ratio * current.dur);
    renderProgress();
  }

  var scrubbing = false;
  nbScrub.addEventListener("pointerdown", function (e) {
    if (!current) return;
    scrubbing = true;
    nbScrub.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  });
  nbScrub.addEventListener("pointermove", function (e) {
    if (scrubbing) seekFromClientX(e.clientX);
  });
  nbScrub.addEventListener("pointerup", function (e) {
    scrubbing = false;
    try { nbScrub.releasePointerCapture(e.pointerId); } catch (_) {}
  });
  nbScrub.addEventListener("keydown", function (e) {
    if (!current) return;
    var step = 5;
    if (e.key === "ArrowRight") { elapsed = Math.min(current.dur, elapsed + step); renderProgress(); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { elapsed = Math.max(0, elapsed - step); renderProgress(); e.preventDefault(); }
    else if (e.key === "Home") { elapsed = 0; renderProgress(); e.preventDefault(); }
    else if (e.key === "End") { elapsed = current.dur; renderProgress(); e.preventDefault(); }
  });

  /* ----------------------------------------------------------------
   * Misc top-bar actions
   * ---------------------------------------------------------------- */
  document.getElementById("searchBtn").addEventListener("click", function () { toast("Search coming soon"); });
  document.getElementById("avatarBtn").addEventListener("click", function () { toast("Signed in as Riva V."); });
  document.getElementById("chartsMore").addEventListener("click", function () { toast("Opening full Top 50"); });

  /* ----------------------------------------------------------------
   * Greeting by time of day
   * ---------------------------------------------------------------- */
  (function () {
    var h = new Date().getHours();
    var g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    document.getElementById("greetTitle").textContent = g;
  })();

  /* Boot */
  renderFeed(MUSIC);
})();
