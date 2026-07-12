(function () {
  "use strict";

  var INTERVAL = 6000; // ms per slide

  var carousel = document.getElementById("carousel");
  var track = document.getElementById("track");
  var slides = Array.prototype.slice.call(track.querySelectorAll(".slide"));
  var dotsWrap = document.getElementById("dots");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var playBtn = document.getElementById("playpause");
  var playIcon = playBtn.querySelector(".playpause__icon");
  var progressBar = document.getElementById("progressbar");
  var toastEl = document.getElementById("toast");

  var index = 0;
  var playing = true;
  var paused = false; // hover pause
  var rafId = null;
  var startTs = 0;
  var elapsedBefore = 0;

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1800);
  }

  /* ---------- Build dots ---------- */
  slides.forEach(function (slide, i) {
    var dot = document.createElement("button");
    dot.className = "dot" + (i === 0 ? " is-active" : "");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
    dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
    dot.addEventListener("click", function () {
      goTo(i);
      resetTimer();
    });
    dotsWrap.appendChild(dot);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  /* ---------- Show a slide ---------- */
  function goTo(next) {
    if (next === index) return;
    var total = slides.length;
    next = ((next % total) + total) % total;

    slides[index].classList.remove("is-active");
    slides[index].setAttribute("hidden", "");
    dots[index].classList.remove("is-active");
    dots[index].setAttribute("aria-selected", "false");

    index = next;

    slides[index].removeAttribute("hidden");
    slides[index].classList.add("is-active");
    dots[index].classList.add("is-active");
    dots[index].setAttribute("aria-selected", "true");
  }

  function step(dir) {
    goTo(index + dir);
  }

  /* ---------- Progress / auto-advance ---------- */
  function frame(ts) {
    if (!startTs) startTs = ts;
    var elapsed = elapsedBefore + (ts - startTs);
    var pct = Math.min(elapsed / INTERVAL, 1);
    progressBar.style.width = (pct * 100).toFixed(2) + "%";

    if (pct >= 1) {
      step(1);
      resetTimer();
      return;
    }
    rafId = requestAnimationFrame(frame);
  }

  function startTimer() {
    if (reduceMotion) return; // no autoplay when reduced motion
    cancelAnimationFrame(rafId);
    startTs = 0;
    rafId = requestAnimationFrame(frame);
  }

  function resetTimer() {
    elapsedBefore = 0;
    progressBar.style.width = "0%";
    if (playing && !paused) startTimer();
  }

  function stopTimer() {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  /* Pause on hover: freeze the elapsed time, resume from there */
  function freeze() {
    if (!playing || paused) return;
    paused = true;
    if (startTs) elapsedBefore += performance.now() - startTs;
    stopTimer();
  }
  function unfreeze() {
    if (!playing || !paused) return;
    paused = false;
    if (!reduceMotion) startTimer();
  }

  /* ---------- Play / pause toggle ---------- */
  function setPlaying(on) {
    playing = on;
    playBtn.setAttribute("aria-pressed", on ? "true" : "false");
    playBtn.setAttribute("aria-label", on ? "Pause auto-play" : "Start auto-play");
    playIcon.setAttribute("data-state", on ? "playing" : "paused");
    if (on) {
      paused = false;
      resetTimer();
      toast("Auto-play on");
    } else {
      stopTimer();
      toast("Auto-play paused");
    }
  }

  /* ---------- Events ---------- */
  prevBtn.addEventListener("click", function () {
    step(-1);
    resetTimer();
  });
  nextBtn.addEventListener("click", function () {
    step(1);
    resetTimer();
  });
  playBtn.addEventListener("click", function () {
    setPlaying(!playing);
  });

  carousel.addEventListener("mouseenter", freeze);
  carousel.addEventListener("mouseleave", unfreeze);
  carousel.addEventListener("focusin", freeze);
  carousel.addEventListener("focusout", unfreeze);

  // Keyboard: arrows navigate when the carousel region has focus
  carousel.setAttribute("tabindex", "0");
  carousel.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
      resetTimer();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
      resetTimer();
    } else if (e.key === " " || e.key === "Enter") {
      if (e.target === carousel) {
        e.preventDefault();
        setPlaying(!playing);
      }
    }
  });

  // Pause when tab hidden, resume when visible
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopTimer();
    } else if (playing && !paused) {
      startTimer();
    }
  });

  /* ---------- Init ---------- */
  slides.forEach(function (s, i) {
    if (i !== 0) s.setAttribute("hidden", "");
  });
  startTimer();
})();
