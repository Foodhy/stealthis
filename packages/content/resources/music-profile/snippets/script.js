(function () {
  "use strict";

  /* ===== Data per time range ===== */
  var COVERS = {
    teal: "linear-gradient(135deg,#1db954,#0a6e3a)",
    violet: "linear-gradient(135deg,#8b5cf6,#3b1f86)",
    rose: "linear-gradient(135deg,#ff3d71,#7a1233)",
    amber: "linear-gradient(135deg,#ffb347,#b65f00)",
    ice: "linear-gradient(135deg,#5ad1ff,#1b4f7a)",
    plum: "linear-gradient(135deg,#c46bff,#5a1d7a)",
    lime: "linear-gradient(135deg,#9be15d,#2f7a1d)"
  };

  var DATA = {
    "4w": {
      hint: "Last 4 weeks",
      stats: { mins: 14820, tracks: 3942, day: "Thursday" },
      artists: [
        { n: "Neon Tides", g: "Synth-pop", p: 412, c: "teal" },
        { n: "Velvet Static", g: "Dream pop", p: 388, c: "violet" },
        { n: "Paper Lanterns", g: "Indie folk", p: 274, c: "amber" },
        { n: "Glass Coast", g: "Ambient", p: 233, c: "ice" },
        { n: "Midnight Reservoir", g: "Electronica", p: 201, c: "rose" }
      ],
      genres: [
        { n: "Synth-pop", v: 34 },
        { n: "Dream pop", v: 26 },
        { n: "Indie folk", v: 18 },
        { n: "Ambient", v: 13 },
        { n: "Electronica", v: 9 }
      ],
      tracks: [
        { t: "Paper Lanterns", a: "Neon Tides", d: "3:42", c: "teal" },
        { t: "Cobalt Hour", a: "Velvet Static", d: "4:08", c: "violet" },
        { t: "Driftwood", a: "Paper Lanterns", d: "3:15", c: "amber" },
        { t: "Slow Aurora", a: "Glass Coast", d: "5:21", c: "ice" },
        { t: "Reservoir", a: "Midnight Reservoir", d: "3:57", c: "rose" }
      ]
    },
    "6m": {
      hint: "Last 6 months",
      stats: { mins: 86240, tracks: 21405, day: "Saturday" },
      artists: [
        { n: "Velvet Static", g: "Dream pop", p: 2104, c: "violet" },
        { n: "Neon Tides", g: "Synth-pop", p: 1987, c: "teal" },
        { n: "Glass Coast", g: "Ambient", p: 1442, c: "ice" },
        { n: "Saffron Echo", g: "Neo-soul", p: 1188, c: "plum" },
        { n: "Paper Lanterns", g: "Indie folk", p: 1043, c: "amber" }
      ],
      genres: [
        { n: "Dream pop", v: 29 },
        { n: "Synth-pop", v: 27 },
        { n: "Ambient", v: 19 },
        { n: "Neo-soul", v: 15 },
        { n: "Indie folk", v: 10 }
      ],
      tracks: [
        { t: "Cobalt Hour", a: "Velvet Static", d: "4:08", c: "violet" },
        { t: "Paper Lanterns", a: "Neon Tides", d: "3:42", c: "teal" },
        { t: "Honeyglass", a: "Saffron Echo", d: "4:33", c: "plum" },
        { t: "Slow Aurora", a: "Glass Coast", d: "5:21", c: "ice" },
        { t: "Tin Roof Rain", a: "Paper Lanterns", d: "3:29", c: "amber" }
      ]
    },
    all: {
      hint: "All time",
      stats: { mins: 612900, tracks: 154820, day: "Sunday" },
      artists: [
        { n: "Glass Coast", g: "Ambient", p: 9842, c: "ice" },
        { n: "Velvet Static", g: "Dream pop", p: 9120, c: "violet" },
        { n: "Neon Tides", g: "Synth-pop", p: 8755, c: "teal" },
        { n: "Bramble & Bone", g: "Folk rock", p: 6310, c: "lime" },
        { n: "Saffron Echo", g: "Neo-soul", p: 5988, c: "plum" }
      ],
      genres: [
        { n: "Ambient", v: 31 },
        { n: "Dream pop", v: 24 },
        { n: "Synth-pop", v: 20 },
        { n: "Folk rock", v: 14 },
        { n: "Neo-soul", v: 11 }
      ],
      tracks: [
        { t: "Slow Aurora", a: "Glass Coast", d: "5:21", c: "ice" },
        { t: "Cobalt Hour", a: "Velvet Static", d: "4:08", c: "violet" },
        { t: "Paper Lanterns", a: "Neon Tides", d: "3:42", c: "teal" },
        { t: "Hollow Pines", a: "Bramble & Bone", d: "3:50", c: "lime" },
        { t: "Honeyglass", a: "Saffron Echo", d: "4:33", c: "plum" }
      ]
    }
  };

  var PLAYLISTS = [
    { t: "Late Drive", n: "62 tracks · 4h 12m", c: "teal" },
    { t: "Soft Focus", n: "38 tracks · 2h 31m", c: "violet" },
    { t: "Folk Porch", n: "51 tracks · 3h 05m", c: "amber" },
    { t: "Deep Blue", n: "44 tracks · 3h 44m", c: "ice" },
    { t: "Heartbeat", n: "29 tracks · 1h 58m", c: "rose" },
    { t: "Golden Hour", n: "47 tracks · 2h 49m", c: "plum" }
  ];

  /* ===== Helpers ===== */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var fmt = function (n) { return n.toLocaleString("en-US"); };
  var PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var EQ = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>';
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.5-9.5-8A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 9.5 5C19 15.5 12 20 12 20Z"/></svg>';

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2200);
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===== Count-up ===== */
  function countTo(el, target, suffix) {
    if (reduceMotion) { el.textContent = fmt(target) + (suffix || ""); return; }
    var start = 0;
    var dur = 900;
    var t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + (suffix || "");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ===== Renderers ===== */
  var likeState = {};

  function renderArtists(d) {
    var list = $("#artists-list");
    list.innerHTML = "";
    d.artists.forEach(function (a, i) {
      var li = document.createElement("li");
      li.className = "artist";
      li.style.animationDelay = i * 0.05 + "s";
      li.innerHTML =
        '<span class="artist__rank">' + (i + 1) + "</span>" +
        '<span class="artist__cover" style="--cv:' + COVERS[a.c] + '">' +
        '<button class="play" type="button" aria-label="Play ' + a.n + '">' + PLAY_SVG + "</button></span>" +
        '<span class="artist__info"><span class="artist__name">' + a.n + "</span>" +
        '<span class="artist__sub">' + a.g + "</span></span>" +
        '<span class="artist__plays">' + fmt(a.p) + " plays</span>";
      li.querySelector(".play").addEventListener("click", function (e) {
        e.stopPropagation();
        toast("Playing top tracks by " + a.n);
      });
      li.addEventListener("click", function () { toast("Opened " + a.n); });
      list.appendChild(li);
    });
    $("#artists-hint").textContent = d.hint;
  }

  function renderGenres(d) {
    var list = $("#genres-list");
    list.innerHTML = "";
    d.genres.forEach(function (g) {
      var li = document.createElement("li");
      li.className = "bar";
      li.innerHTML =
        '<div class="bar__top"><span class="bar__name">' + g.n + "</span>" +
        '<span class="bar__pct">' + g.v + "%</span></div>" +
        '<div class="bar__track"><span class="bar__fill"></span></div>';
      list.appendChild(li);
      var fill = li.querySelector(".bar__fill");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { fill.style.width = g.v + "%"; });
      });
    });
  }

  function renderTracks(d) {
    var list = $("#tracks-list");
    list.innerHTML = "";
    d.tracks.forEach(function (tr, i) {
      var key = tr.t + tr.a;
      var liked = !!likeState[key];
      var li = document.createElement("li");
      li.className = "track";
      li.style.animationDelay = i * 0.05 + "s";
      li.innerHTML =
        '<span class="track__idx"><span class="num">' + (i + 1) + "</span>" + EQ + "</span>" +
        '<span class="track__cover" style="--cv:' + COVERS[tr.c] + '"></span>' +
        '<span class="track__info"><span class="track__title">' + tr.t + "</span>" +
        '<span class="track__artist">' + tr.a + "</span></span>" +
        '<button class="track__like" type="button" aria-pressed="' + liked + '" aria-label="Like ' + tr.t + '">' + HEART + "</button>" +
        '<span class="track__dur">' + tr.d + "</span>";

      var likeBtn = li.querySelector(".track__like");
      likeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var on = likeBtn.getAttribute("aria-pressed") !== "true";
        likeBtn.setAttribute("aria-pressed", String(on));
        likeState[key] = on;
        toast(on ? "Liked " + tr.t : "Removed from Liked Songs");
      });

      li.addEventListener("mouseenter", function () { setPlaying(li, true); });
      li.addEventListener("mouseleave", function () { if (!li.classList.contains("pinned")) setPlaying(li, false); });
      li.addEventListener("click", function () {
        list.querySelectorAll(".track").forEach(function (n) { n.classList.remove("pinned"); setPlaying(n, false); });
        li.classList.add("pinned");
        setPlaying(li, true);
        toast("Now playing · " + tr.t + " — " + tr.a);
      });
      list.appendChild(li);
    });
  }

  function setPlaying(li, on) {
    li.classList.toggle("is-playing", on);
  }

  /* ===== Stats ===== */
  function renderStats(d) {
    var nums = document.querySelectorAll(".stat__num[data-count]");
    var values = [d.stats.mins, d.stats.tracks];
    nums.forEach(function (el, i) {
      el.setAttribute("data-count", values[i]);
      countTo(el, values[i], el.getAttribute("data-suffix"));
    });
    $("#top-day").textContent = d.stats.day;
  }

  /* ===== Playlists (static once) ===== */
  function renderPlaylists() {
    var strip = $("#playlists-strip");
    PLAYLISTS.forEach(function (p) {
      var btn = document.createElement("button");
      btn.className = "pl";
      btn.type = "button";
      btn.innerHTML =
        '<span class="pl__cover" style="--cv:' + COVERS[p.c] + '">' +
        '<span class="pl__play">' + PLAY_SVG + "</span></span>" +
        '<span class="pl__title">' + p.t + "</span>" +
        '<span class="pl__meta">' + p.n + "</span>";
      btn.addEventListener("click", function () { toast("Shuffling " + p.t); });
      strip.appendChild(btn);
    });
  }

  /* ===== Range toggle ===== */
  var rangeWrap = $(".range");
  var pill = $(".range__pill");
  function movePill(btn) {
    pill.style.left = btn.offsetLeft + "px";
    pill.style.width = btn.offsetWidth + "px";
  }

  function applyRange(key, btn) {
    var d = DATA[key];
    renderArtists(d);
    renderGenres(d);
    renderTracks(d);
    renderStats(d);
    movePill(btn);
  }

  rangeWrap.querySelectorAll(".range__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      rangeWrap.querySelectorAll(".range__btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      applyRange(btn.dataset.range, btn);
      toast("Showing " + btn.textContent.trim().toLowerCase());
    });
  });

  /* ===== Follow + header actions ===== */
  var followBtn = $("#follow-btn");
  var followersNum = $("#followers-num");
  var baseFollowers = 2184;
  followBtn.addEventListener("click", function () {
    var on = followBtn.getAttribute("aria-pressed") !== "true";
    followBtn.setAttribute("aria-pressed", String(on));
    followBtn.textContent = on ? "Following" : "Follow";
    followersNum.textContent = fmt(baseFollowers + (on ? 1 : 0));
    toast(on ? "You now follow River Halcyon" : "Unfollowed");
  });

  $("#edit-btn").addEventListener("click", function () { toast("Edit profile (demo)"); });
  $("#share-btn").addEventListener("click", function () { toast("Profile link copied"); });
  $("#followers-btn").addEventListener("click", function () { toast("2,184 followers"); });

  /* ===== Boot ===== */
  renderPlaylists();
  var firstBtn = rangeWrap.querySelector(".range__btn.is-active");
  applyRange("4w", firstBtn);
  window.addEventListener("resize", function () {
    var active = rangeWrap.querySelector(".range__btn.is-active");
    if (active) movePill(active);
  });
})();
