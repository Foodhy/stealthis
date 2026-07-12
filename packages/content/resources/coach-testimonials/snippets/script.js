(function () {
  "use strict";

  var carousel = document.getElementById("carousel");
  var track = document.getElementById("track");
  var slides = Array.prototype.slice.call(track.querySelectorAll(".slide"));
  var dotsWrap = document.getElementById("dots");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var bar = document.getElementById("bar");
  var live = document.getElementById("live");
  var pauseBtn = document.getElementById("pauseBtn");
  var cta = document.getElementById("cta");
  var toastEl = document.getElementById("toast");

  var index = 0;
  var count = slides.length;
  var AUTOPLAY = 5200;
  var timer = null;
  var rafId = null;
  var startTime = 0;
  var paused = false;
  var userPaused = false;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- toast helper ----- */
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  /* ----- build dots ----- */
  slides.forEach(function (_, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Testimonial " + (i + 1));
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.addEventListener("click", function () {
      goTo(i, true);
    });
    dotsWrap.appendChild(b);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  /* ----- star fill for active slide ----- */
  function fillStars(slide) {
    var rating = slide.querySelector(".rating");
    if (!rating) return;
    var n = parseInt(rating.getAttribute("data-stars"), 10) || 0;
    var stars = rating.querySelectorAll("span");
    stars.forEach(function (s, i) {
      if (i < n) {
        setTimeout(
          function () {
            s.classList.add("on");
          },
          reduceMotion ? 0 : i * 90
        );
      } else {
        s.classList.remove("on");
      }
    });
  }

  /* ----- animated stat counter ----- */
  function countUp(slide) {
    var el = slide.querySelector(".stat-num");
    if (!el || el.dataset.done === "1") return;
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      el.dataset.done = "1";
      return;
    }
    var dur = 900;
    var t0 = performance.now();
    function tick(now) {
      var p = Math.min((now - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else {
        el.textContent = target.toFixed(decimals) + suffix;
        el.dataset.done = "1";
      }
    }
    requestAnimationFrame(tick);
  }

  /* ----- go to slide ----- */
  function goTo(i, fromUser) {
    index = (i + count) % count;
    track.style.transform = "translateX(" + -index * 100 + "%)";
    dots.forEach(function (d, di) {
      d.setAttribute("aria-selected", di === index ? "true" : "false");
    });
    slides.forEach(function (s, si) {
      s.setAttribute("aria-hidden", si === index ? "false" : "true");
    });
    var active = slides[index];
    fillStars(active);
    countUp(active);
    var name = active.querySelector(".name");
    live.textContent =
      "Showing testimonial " + (index + 1) + " of " + count +
      (name ? ", " + name.textContent : "");
    if (fromUser) restartAutoplay();
  }

  function next(fromUser) {
    goTo(index + 1, fromUser);
  }
  function prev(fromUser) {
    goTo(index - 1, fromUser);
  }

  /* ----- autoplay + progress bar ----- */
  function loop(now) {
    if (paused || userPaused) return;
    if (!startTime) startTime = now;
    var elapsed = now - startTime;
    var pct = Math.min(elapsed / AUTOPLAY, 1);
    bar.style.width = pct * 100 + "%";
    if (pct >= 1) {
      startTime = 0;
      bar.style.width = "0%";
      next(false);
    }
    rafId = requestAnimationFrame(loop);
  }

  function startAutoplay() {
    if (reduceMotion || userPaused) return;
    cancelAnimationFrame(rafId);
    startTime = 0;
    bar.style.width = "0%";
    paused = false;
    rafId = requestAnimationFrame(loop);
  }

  function stopAutoplay() {
    paused = true;
    cancelAnimationFrame(rafId);
  }

  function restartAutoplay() {
    if (userPaused) return;
    startAutoplay();
  }

  /* ----- events ----- */
  nextBtn.addEventListener("click", function () {
    next(true);
  });
  prevBtn.addEventListener("click", function () {
    prev(true);
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", restartAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", function (e) {
    if (!carousel.contains(e.relatedTarget)) restartAutoplay();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopAutoplay();
    else restartAutoplay();
  });

  /* keyboard: arrows + number keys */
  carousel.setAttribute("tabindex", "0");
  carousel.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next(true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev(true);
    } else if (e.key >= "1" && e.key <= String(Math.min(count, 9))) {
      e.preventDefault();
      goTo(parseInt(e.key, 10) - 1, true);
    }
  });

  /* touch / swipe */
  var startX = 0;
  var startY = 0;
  var swiping = false;
  track.addEventListener(
    "touchstart",
    function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      swiping = true;
      stopAutoplay();
    },
    { passive: true }
  );
  track.addEventListener(
    "touchend",
    function (e) {
      if (!swiping) return;
      swiping = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(true);
        else prev(true);
      } else {
        restartAutoplay();
      }
    },
    { passive: true }
  );

  /* pause button */
  pauseBtn.addEventListener("click", function () {
    userPaused = !userPaused;
    pauseBtn.setAttribute("aria-pressed", String(userPaused));
    pauseBtn.textContent = userPaused ? "Resume autoplay" : "Pause autoplay";
    if (userPaused) {
      stopAutoplay();
      bar.style.width = "0%";
      toast("Autoplay paused");
    } else {
      startAutoplay();
      toast("Autoplay resumed");
    }
  });

  /* CTA */
  cta.addEventListener("click", function (e) {
    e.preventDefault();
    toast("Nice — let's get to work! 💪");
  });

  /* ----- init ----- */
  goTo(0, false);
  startAutoplay();
})();
