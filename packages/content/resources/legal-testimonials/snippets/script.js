(function () {
  "use strict";

  var carousel = document.getElementById("carousel");
  var track = document.getElementById("track");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var dotsWrap = document.getElementById("dots");
  if (!carousel || !track) return;

  var slides = Array.prototype.slice.call(track.querySelectorAll(".slide"));
  var total = slides.length;
  var index = 0;
  var timer = null;
  var INTERVAL = 6000;

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* Build dot navigation */
  var dots = [];
  slides.forEach(function (slide, i) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
    dot.addEventListener("click", function () {
      goTo(i, true);
    });
    dotsWrap.appendChild(dot);
    dots.push(dot);
  });

  function render() {
    track.style.transform = "translateX(" + (-index * 100) + "%)";
    slides.forEach(function (slide, i) {
      slide.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
    dots.forEach(function (dot, i) {
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
    });
  }

  function goTo(i, fromUser) {
    index = (i + total) % total;
    render();
    if (fromUser) restart();
  }

  function next(fromUser) {
    goTo(index + 1, fromUser);
  }

  function prev(fromUser) {
    goTo(index - 1, fromUser);
  }

  function start() {
    if (reduceMotion || timer) return;
    timer = window.setInterval(function () {
      next(false);
    }, INTERVAL);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function restart() {
    stop();
    start();
  }

  nextBtn.addEventListener("click", function () {
    next(true);
  });
  prevBtn.addEventListener("click", function () {
    prev(true);
  });

  /* Pause on hover / focus, resume on leave / blur */
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", start);

  /* Keyboard arrows when carousel has focus */
  carousel.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next(true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev(true);
    }
  });

  /* Pause when tab is hidden */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });

  /* Animated stat counters, triggered once on view */
  function animateCounters() {
    var values = document.querySelectorAll(".stats__value");
    values.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      var startTime = null;
      var duration = 1400;
      function step(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    });
  }

  var statsEl = document.querySelector(".stats");
  if (statsEl && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounters();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(statsEl);
  } else {
    animateCounters();
  }

  render();
  start();
})();
