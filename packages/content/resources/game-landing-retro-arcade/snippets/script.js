(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }
  document.querySelectorAll("[data-toast]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast(btn.getAttribute("data-toast"));
    });
  });

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Title flicker ---------- */
  var title = document.querySelector("[data-flicker]");
  if (title && !reduced) {
    setInterval(function () {
      if (Math.random() > 0.78) {
        title.classList.add("flick");
        setTimeout(function () { title.classList.remove("flick"); }, 70 + Math.random() * 90);
      }
    }, 280);
  }

  /* ---------- Animated stat counters ---------- */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* ---------- High-score ticker ---------- */
  var scores = [
    { name: "AAA", game: "Neon Drift", score: 9820450 },
    { name: "ZX9", game: "Hollow Reign", score: 7714200 },
    { name: "VEX", game: "Ashen Vanguard", score: 6620980 },
    { name: "RGB", game: "Chrome Sunset", score: 5530110 },
    { name: "K1T", game: "Grid Runner X", score: 4488700 },
    { name: "NUL", game: "Pulse Raider", score: 3902560 },
    { name: "MEG", game: "Neon Drift", score: 3120440 },
    { name: "ORB", game: "Void Circuit", score: 2755300 }
  ];
  var track = document.getElementById("tickerTrack");
  if (track) {
    function fmt(n) { return n.toLocaleString("en-US"); }
    var html = scores.map(function (s, i) {
      return '<span class="ticker__item">#' + (i + 1) +
        ' <b>' + s.name + '</b> · ' + s.game +
        ' · <span class="score">' + fmt(s.score) + '</span></span>';
    }).join("");
    track.innerHTML = html + html; /* duplicate for seamless loop */
  }

  /* ---------- Game lineup carousel ---------- */
  var games = [
    { name: "Neon Drift", genre: "Synthwave Racer", glyph: "▲", color: "#ff2bd6", badge: "NEW", rating: 98, plays: "12.4M" },
    { name: "Hollow Reign", genre: "Dark Platformer", glyph: "✦", color: "#19f0ff", badge: "HOT", rating: 94, plays: "8.9M" },
    { name: "Ashen Vanguard", genre: "Mech Shooter", glyph: "◆", color: "#ffe93d", badge: "TOP", rating: 91, plays: "6.2M" },
    { name: "Grid Runner X", genre: "Endless Arcade", glyph: "●", color: "#ff2bd6", badge: "RETRO", rating: 88, plays: "5.5M" },
    { name: "Pulse Raider", genre: "Rhythm Combat", glyph: "■", color: "#19f0ff", badge: "BETA", rating: 86, plays: "3.9M" },
    { name: "Void Circuit", genre: "Puzzle Shooter", glyph: "✺", color: "#ffe93d", badge: "INDIE", rating: 90, plays: "2.7M" }
  ];

  var cabTrack = document.getElementById("cabTrack");
  var dotsWrap = document.getElementById("cabDots");
  var carousel = document.getElementById("carousel");
  var index = 0;

  function perView() {
    var w = window.innerWidth;
    if (w <= 520) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  if (cabTrack) {
    cabTrack.innerHTML = games.map(function (g) {
      return (
        '<article class="cab" tabindex="0">' +
          '<div class="cab__badge">' + g.badge + "</div>" +
          '<div class="cab__screen" style="color:' + g.color +
            ';background:radial-gradient(circle at 50% 40%, ' + g.color + '22, #07030f 70%)">' + g.glyph + "</div>" +
          '<div class="cab__name">' + g.name + "</div>" +
          '<div class="cab__genre">' + g.genre + "</div>" +
          '<div class="cab__bar"><div class="cab__fill" data-rating="' + g.rating + '"></div></div>' +
          '<div class="cab__meta"><span>HYPE <b>' + g.rating + '%</b></span><span>' + g.plays + " plays</span></div>" +
        "</article>"
      );
    }).join("");

    /* dots */
    var pages = Math.max(1, games.length - perView() + 1);
    function buildDots() {
      pages = Math.max(1, games.length - perView() + 1);
      dotsWrap.innerHTML = "";
      for (var i = 0; i < pages; i++) {
        var d = document.createElement("button");
        d.className = "dot";
        d.setAttribute("role", "tab");
        d.setAttribute("aria-label", "Slide " + (i + 1));
        (function (i) { d.addEventListener("click", function () { go(i); }); })(i);
        dotsWrap.appendChild(d);
      }
    }

    function update() {
      var card = cabTrack.querySelector(".cab");
      if (!card) return;
      var gap = 1.3 * 16;
      var step = card.offsetWidth + gap;
      cabTrack.style.transform = "translateX(" + (-index * step) + "px)";
      dotsWrap.querySelectorAll(".dot").forEach(function (d, i) {
        d.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    }

    function go(i) {
      var max = Math.max(0, games.length - perView());
      index = Math.max(0, Math.min(i, max));
      update();
    }

    document.getElementById("nextCab").addEventListener("click", function () { go(index + 1); });
    document.getElementById("prevCab").addEventListener("click", function () { go(index - 1); });

    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    });

    buildDots();
    update();

    /* animate hype bars in once */
    requestAnimationFrame(function () {
      cabTrack.querySelectorAll(".cab__fill").forEach(function (f) {
        f.style.width = f.getAttribute("data-rating") + "%";
      });
    });

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { buildDots(); go(index); }, 150);
    });
  }

  /* ---------- Soundtrack visualizer ---------- */
  var viz = document.getElementById("viz");
  var playBtn = document.getElementById("playBtn");
  var nowPlaying = document.getElementById("nowPlaying");
  var bars = [];
  var playing = false;
  var vizTimer;
  var tracks = ['"Chrome Sunset"', '"Midnight Velocity"', '"Outrun Protocol"', '"Magenta Skies"'];
  var trackIdx = 0;

  if (viz) {
    for (var b = 0; b < 28; b++) {
      var bar = document.createElement("span");
      bar.className = "bar";
      bar.style.height = "20%";
      viz.appendChild(bar);
      bars.push(bar);
    }
    function animateViz() {
      bars.forEach(function (bar) {
        bar.style.height = (playing ? (12 + Math.random() * 88) : (8 + Math.random() * 14)) + "%";
      });
    }
    animateViz();
    if (!reduced) vizTimer = setInterval(animateViz, 130);
  }

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      playing = !playing;
      playBtn.textContent = playing ? "❚❚ PAUSE" : "▶ PREVIEW";
      if (playing) {
        trackIdx = (trackIdx + 1) % tracks.length;
        nowPlaying.textContent = "NOW SPINNING — " + tracks[trackIdx] + " · Nullforge Audio";
        toast("♪ Streaming preview — " + tracks[trackIdx]);
      } else {
        toast("Preview paused.");
      }
    });
  }
})();
