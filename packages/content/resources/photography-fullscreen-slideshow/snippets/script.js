(function () {
  "use strict";

  // ---------- Data ----------
  var SLIDES = [
    {
      eyebrow: "Wilderness Series",
      title: "Vellum Ridge at First Light",
      loc: "Dolomites, Italy",
      shot: "1/250s · f/8 · ISO 100",
    },
    {
      eyebrow: "Wilderness Series",
      title: "The Long Green Silence",
      loc: "Trollstigen, Norway",
      shot: "1/160s · f/5.6 · ISO 200",
    },
    {
      eyebrow: "Field Notes",
      title: "Understory, After Rain",
      loc: "Olympic Forest, USA",
      shot: "1/60s · f/2.8 · ISO 400",
    },
    {
      eyebrow: "Field Notes",
      title: "Where the Road Gives Up",
      loc: "Isle of Skye, Scotland",
      shot: "1/320s · f/11 · ISO 100",
    },
    {
      eyebrow: "Nightfall",
      title: "A Quiet Cathedral of Pines",
      loc: "Banff, Canada",
      shot: "1/125s · f/4 · ISO 800",
    },
  ];

  var DWELL = 7000; // ms per slide (matches --dwell)
  var RING_LEN = 125.66; // 2πr, r=20

  // ---------- Elements ----------
  var stage = document.getElementById("stage");
  var slideEls = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var dotsWrap = document.getElementById("dots");
  var playBtn = document.getElementById("play");
  var playGlyph = document.getElementById("play-glyph");
  var ring = document.getElementById("ring");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var toastEl = document.getElementById("toast");

  var capEyebrow = document.getElementById("cap-eyebrow");
  var capTitle = document.getElementById("cap-title");
  var capLoc = document.getElementById("cap-loc");
  var capShot = document.getElementById("cap-shot");
  var counterCur = document.getElementById("counter-cur");
  var counterTotal = document.getElementById("counter-total");
  var caption = document.getElementById("caption");

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- State ----------
  var index = 0;
  var playing = true;
  var startTime = 0;
  var elapsedBeforePause = 0;
  var rafId = null;
  var dotEls = [];

  // ---------- Build dots ----------
  SLIDES.forEach(function (_, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "dot";
    b.setAttribute("aria-label", "Go to photo " + (i + 1));
    var fill = document.createElement("span");
    fill.className = "fill";
    b.appendChild(fill);
    b.addEventListener("click", function () {
      goTo(i, true);
      showToast("Photo " + (i + 1) + " of " + SLIDES.length);
    });
    dotsWrap.appendChild(b);
    dotEls.push({ btn: b, fill: fill });
  });

  counterTotal.textContent = pad(SLIDES.length);

  // ---------- Helpers ----------
  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  var toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1600);
  }

  function setCaption(i) {
    var s = SLIDES[i];
    capEyebrow.textContent = s.eyebrow;
    capTitle.textContent = s.title;
    capLoc.textContent = s.loc;
    capShot.textContent = s.shot;
    counterCur.textContent = pad(i + 1);
    // retrigger caption entrance animation
    if (!reduceMotion) {
      caption.querySelectorAll(":scope > *").forEach(function (el) {
        el.style.animation = "none";
        // force reflow
        void el.offsetWidth;
        el.style.animation = "";
      });
    }
  }

  function updateDots(i) {
    dotEls.forEach(function (d, di) {
      var fill = d.fill;
      fill.style.transition = "none";
      if (di < i) {
        fill.style.transform = "translateY(-50%) scaleX(1)";
      } else if (di > i) {
        fill.style.transform = "translateY(-50%) scaleX(0)";
      } else {
        fill.style.transform = "translateY(-50%) scaleX(0)";
      }
      d.btn.classList.toggle("is-active", di === i);
      d.btn.setAttribute("aria-current", di === i ? "true" : "false");
    });
  }

  function applyActiveSlide(i) {
    slideEls.forEach(function (el, si) {
      var active = si === i;
      el.classList.toggle("is-active", active);
      // reset then (maybe) apply ken-burns for a fresh run
      el.classList.remove("kb");
      if (active && !reduceMotion && playing) {
        // reflow to restart animation
        void el.offsetWidth;
        el.classList.add("kb");
      } else if (active && !reduceMotion) {
        void el.offsetWidth;
        el.classList.add("kb");
        // pause immediately
        var img = el.querySelector(".slide-img");
        if (img) img.style.animationPlayState = "paused";
      }
    });
  }

  // ---------- Progress loop ----------
  function tick(now) {
    if (!startTime) startTime = now;
    var elapsed = elapsedBeforePause + (now - startTime);
    var frac = Math.min(elapsed / DWELL, 1);

    // ring
    ring.style.strokeDashoffset = RING_LEN * (1 - frac);
    // active dot fill
    if (dotEls[index]) {
      dotEls[index].fill.style.transition = "none";
      dotEls[index].fill.style.transform =
        "translateY(-50%) scaleX(" + frac + ")";
    }

    if (frac >= 1) {
      goTo((index + 1) % SLIDES.length, false);
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function startProgress() {
    stopProgress();
    startTime = 0;
    rafId = requestAnimationFrame(tick);
  }
  function stopProgress() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // ---------- Navigation ----------
  function goTo(i, userInitiated) {
    index = (i + SLIDES.length) % SLIDES.length;
    elapsedBeforePause = 0;
    applyActiveSlide(index);
    setCaption(index);
    updateDots(index);
    ring.style.strokeDashoffset = RING_LEN;

    if (playing) {
      startProgress();
      setSlideAnimState("running");
    } else {
      setSlideAnimState("paused");
    }
  }

  function setSlideAnimState(state) {
    var active = slideEls[index];
    if (!active) return;
    var img = active.querySelector(".slide-img");
    if (img) img.style.animationPlayState = state;
  }

  function next() {
    goTo(index + 1, true);
  }
  function prev() {
    goTo(index - 1, true);
  }

  // ---------- Play / pause ----------
  function setPlaying(state) {
    playing = state;
    playBtn.classList.toggle("is-paused", !playing);
    playBtn.setAttribute("aria-pressed", String(playing));
    playBtn.setAttribute(
      "aria-label",
      playing ? "Pause slideshow" : "Play slideshow"
    );

    if (playing) {
      startProgress();
      setSlideAnimState("running");
    } else {
      stopProgress();
      // freeze elapsed so resume continues from same point
      // (recompute from current ring offset)
      var offset = parseFloat(ring.style.strokeDashoffset || RING_LEN);
      var frac = 1 - offset / RING_LEN;
      elapsedBeforePause = frac * DWELL;
      setSlideAnimState("paused");
    }
  }

  function togglePlay() {
    setPlaying(!playing);
    showToast(playing ? "Playing" : "Paused");
  }

  // ---------- Events ----------
  playBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", function () {
    next();
    showToast("Next");
  });
  prevBtn.addEventListener("click", function () {
    prev();
    showToast("Previous");
  });

  // hover pauses timer (without flipping the play button state)
  var hoverPaused = false;
  stage.addEventListener("mouseenter", function () {
    if (playing) {
      hoverPaused = true;
      stopProgress();
      var offset = parseFloat(ring.style.strokeDashoffset || RING_LEN);
      var frac = 1 - offset / RING_LEN;
      elapsedBeforePause = frac * DWELL;
      setSlideAnimState("paused");
    }
  });
  stage.addEventListener("mouseleave", function () {
    if (playing && hoverPaused) {
      hoverPaused = false;
      startProgress();
      setSlideAnimState("running");
    }
  });

  // keyboard
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
      showToast("Next");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
      showToast("Previous");
    } else if (e.key === " " || e.code === "Space") {
      // avoid toggling when a button is focused (button handles its own)
      if (document.activeElement && document.activeElement.tagName === "BUTTON")
        return;
      e.preventDefault();
      togglePlay();
    }
  });

  // pause when tab hidden, resume when visible
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopProgress();
      setSlideAnimState("paused");
    } else if (playing && !hoverPaused) {
      startProgress();
      setSlideAnimState("running");
    }
  });

  // basic touch swipe
  var touchX = null;
  stage.addEventListener(
    "touchstart",
    function (e) {
      touchX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );
  stage.addEventListener(
    "touchend",
    function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) {
        if (dx < 0) next();
        else prev();
      }
      touchX = null;
    },
    { passive: true }
  );

  // ---------- Init ----------
  goTo(0, false);
})();
