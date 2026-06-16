(function () {
  "use strict";

  var root = document.querySelector("[data-carousel]");
  if (!root) return;

  var track = root.querySelector("[data-track]");
  var slides = Array.prototype.slice.call(track.querySelectorAll(".slide"));
  var prevBtn = root.querySelector("[data-prev]");
  var nextBtn = root.querySelector("[data-next]");
  var dotsWrap = root.parentElement.querySelector("[data-dots]");
  var playBtn = document.querySelector("[data-playpause]");
  var playLabel = document.querySelector("[data-playpause-label]");
  var toastEl = document.querySelector("[data-toast]");

  var count = slides.length;
  var index = 0;
  var timer = null;
  var paused = false;
  var INTERVAL = 5500;

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Build dots ---------- */
  var dots = [];
  slides.forEach(function (_, i) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Recommendation " + (i + 1) + " of " + count);
    dot.addEventListener("click", function () {
      goTo(i, true);
    });
    dotsWrap.appendChild(dot);
    dots.push(dot);
  });

  /* ---------- Toast helper ---------- */
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("toast--show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("toast--show");
    }, 2200);
  }

  /* ---------- Render ---------- */
  function render() {
    track.style.transform = "translateX(" + -index * 100 + "%)";
    slides.forEach(function (slide, i) {
      var active = i === index;
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      // keep off-screen slides out of the tab order
      var focusables = slide.querySelectorAll("a, button");
      focusables.forEach(function (el) {
        if (active) el.removeAttribute("tabindex");
        else el.setAttribute("tabindex", "-1");
      });
    });
    dots.forEach(function (dot, i) {
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
    });
  }

  function goTo(i, userTriggered) {
    index = (i + count) % count;
    render();
    if (userTriggered) restart();
  }

  function next(userTriggered) {
    goTo(index + 1, userTriggered);
  }

  function prev(userTriggered) {
    goTo(index - 1, userTriggered);
  }

  /* ---------- Autoplay ---------- */
  function tick() {
    if (!paused) next(false);
  }

  function start() {
    if (reduceMotion) return; // respect reduced motion: no auto-advance
    stop();
    timer = window.setInterval(tick, INTERVAL);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function restart() {
    if (paused) return;
    start();
  }

  function setPaused(state) {
    paused = state;
    root.setAttribute("data-paused", state ? "true" : "false");
    if (playBtn) playBtn.setAttribute("aria-pressed", state ? "false" : "true");
    if (playLabel) playLabel.textContent = state ? "Play" : "Pause";
    if (state) stop();
    else start();
  }

  /* ---------- Events ---------- */
  nextBtn.addEventListener("click", function () {
    next(true);
  });
  prevBtn.addEventListener("click", function () {
    prev(true);
  });

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      setPaused(!paused);
      toast(paused ? "Autoplay paused" : "Autoplay resumed");
    });
  }

  /* Keyboard nav when focus is inside the carousel */
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next(true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev(true);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(count - 1, true);
    }
  });

  /* Pause on hover / focus, resume after (unless user-paused) */
  root.addEventListener("mouseenter", function () {
    if (!paused) stop();
  });
  root.addEventListener("mouseleave", function () {
    if (!paused) start();
  });
  root.addEventListener("focusin", function () {
    if (!paused) stop();
  });
  root.addEventListener("focusout", function () {
    if (!root.contains(document.activeElement) && !paused) start();
  });

  /* Pause when tab is hidden */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (!paused) start();
  });

  /* ---------- Touch / swipe ---------- */
  var startX = 0;
  var startY = 0;
  var swiping = false;
  root.addEventListener(
    "touchstart",
    function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      swiping = true;
    },
    { passive: true }
  );
  root.addEventListener(
    "touchend",
    function (e) {
      if (!swiping) return;
      swiping = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(true);
        else prev(true);
      }
    },
    { passive: true }
  );

  /* ---------- Init ---------- */
  if (reduceMotion) {
    setPaused(true);
  } else {
    render();
    start();
  }
  render();
})();
