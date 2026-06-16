(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () {
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Now-playing mockup ---------- */
  var tracks = [
    { title: "Paper Lanterns", artist: "Neon Tides", dur: 222, art: "linear-gradient(135deg,#22e1ff,#a855f7 55%,#ff2d95)" },
    { title: "Velvet Static", artist: "Mara Vale", dur: 198, art: "linear-gradient(135deg,#ff2d95,#a855f7 55%,#22e1ff)" },
    { title: "Midnight Reservoir", artist: "Glass Atlas", dur: 254, art: "linear-gradient(135deg,#a855f7,#22e1ff 60%,#0a8ea0)" },
    { title: "Slow Rivers", artist: "Hollow Coast", dur: 176, art: "linear-gradient(135deg,#22e1ff,#0a8ea0 50%,#a855f7)" }
  ];

  var idx = 0;
  var elapsed = 0;
  var playing = true;
  var tick = null;

  var artEl = document.getElementById("npArt");
  var eqEl = document.getElementById("npEq");
  var titleEl = document.getElementById("npTitle");
  var artistEl = document.getElementById("npArtist");
  var progEl = document.getElementById("npProgress");
  var curEl = document.getElementById("npCur");
  var durEl = document.getElementById("npDur");
  var queueEl = document.getElementById("npQueue");
  var playBtn = document.getElementById("npPlay");
  var playPath = document.getElementById("npPath");

  var PLAY_ICON = "M8 5v14l11-7z";
  var PAUSE_ICON = "M6 5h4v14H6zM14 5h4v14h-4z";

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function renderQueue() {
    if (!queueEl) return;
    queueEl.innerHTML = "";
    for (var i = 1; i <= 2; i++) {
      var t = tracks[(idx + i) % tracks.length];
      var li = document.createElement("li");
      var s = document.createElement("strong");
      s.textContent = t.title;
      var span = document.createElement("span");
      span.textContent = fmt(t.dur);
      li.appendChild(s);
      li.appendChild(span);
      queueEl.appendChild(li);
    }
  }

  function loadTrack(reset) {
    var t = tracks[idx];
    titleEl.textContent = t.title;
    artistEl.textContent = t.artist;
    durEl.textContent = fmt(t.dur);
    artEl.style.background =
      "radial-gradient(circle at 30% 25%,rgba(255,255,255,0.25),transparent 45%)," + t.art;
    if (reset) {
      elapsed = 0;
    }
    updateProgress();
    renderQueue();
  }

  function updateProgress() {
    var t = tracks[idx];
    var pct = Math.min(100, (elapsed / t.dur) * 100);
    progEl.style.width = pct + "%";
    curEl.textContent = fmt(elapsed);
  }

  function setPlaying(state) {
    playing = state;
    playBtn.setAttribute("aria-pressed", String(state));
    playBtn.setAttribute("aria-label", state ? "Pause" : "Play");
    playPath.setAttribute("d", state ? PAUSE_ICON : PLAY_ICON);
    eqEl.classList.toggle("is-playing", state && !reduceMotion);
    if (state) startTick();
    else stopTick();
  }

  function startTick() {
    stopTick();
    tick = setInterval(function () {
      elapsed += 1;
      var t = tracks[idx];
      if (elapsed >= t.dur) {
        next(true);
        return;
      }
      updateProgress();
    }, 1000);
  }
  function stopTick() {
    if (tick) {
      clearInterval(tick);
      tick = null;
    }
  }

  function next(auto) {
    idx = (idx + 1) % tracks.length;
    loadTrack(true);
    if (auto) {
      // keep playing
      if (playing) startTick();
    } else {
      setPlaying(true);
    }
  }
  function prev() {
    if (elapsed > 3) {
      elapsed = 0;
      updateProgress();
      return;
    }
    idx = (idx - 1 + tracks.length) % tracks.length;
    loadTrack(true);
    setPlaying(true);
  }

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      setPlaying(!playing);
    });
    document.getElementById("npNext").addEventListener("click", function () { next(false); });
    document.getElementById("npPrev").addEventListener("click", prev);

    // Scrub by clicking the progress bar
    var barEl = progEl.parentElement;
    barEl.addEventListener("click", function (e) {
      var rect = barEl.getBoundingClientRect();
      var ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      elapsed = Math.floor(tracks[idx].dur * ratio);
      updateProgress();
    });

    loadTrack(true);
    setPlaying(true);
  }

  /* ---------- Pricing: monthly / annual toggle ---------- */
  var toggleWrap = document.querySelector(".toggle");
  var billToggle = document.getElementById("billToggle");
  var amts = document.querySelectorAll(".plan__amt[data-m]");
  var perPremium = document.getElementById("perPremium");
  var perFamily = document.getElementById("perFamily");

  function setBilling(annual) {
    billToggle.setAttribute("aria-checked", String(annual));
    toggleWrap.classList.toggle("is-annual", annual);
    amts.forEach(function (el) {
      var val = annual ? el.getAttribute("data-a") : el.getAttribute("data-m");
      el.textContent = "$" + val;
    });
    var per = annual ? "/mo, billed yearly" : "/month";
    if (perPremium) perPremium.textContent = per;
    if (perFamily) perFamily.textContent = per;
  }

  if (billToggle) {
    billToggle.addEventListener("click", function () {
      setBilling(billToggle.getAttribute("aria-checked") !== "true");
    });
  }

  /* ---------- Count-up stats ---------- */
  function formatStat(n, suffix) {
    var out;
    if (n >= 1000000) out = (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
    else if (n >= 1000) out = Math.round(n / 1000) + "K";
    else out = String(n);
    return out + (suffix || "");
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var numEl = el.querySelector(".stat__num");
    if (reduceMotion) {
      numEl.textContent = formatStat(target, suffix);
      return;
    }
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      numEl.textContent = formatStat(Math.round(target * eased), suffix);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Scroll reveal + lazy count-up ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          if (entry.target.classList.contains("stat")) countUp(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
      if (el.classList.contains("stat")) countUp(el);
    });
  }

  /* ---------- Parallax-ish blob drift on pointer move ---------- */
  if (!reduceMotion) {
    var blobs = document.querySelectorAll(".blob");
    window.addEventListener("pointermove", function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;
      blobs.forEach(function (b, i) {
        var depth = (i + 1) * 8;
        b.style.marginLeft = x * depth + "px";
        b.style.marginTop = y * depth + "px";
      });
    });
  }
})();
