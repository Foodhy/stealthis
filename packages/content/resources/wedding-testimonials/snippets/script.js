(function () {
  "use strict";

  var track = document.getElementById("track");
  var slides = Array.prototype.slice.call(track.querySelectorAll(".slide"));
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var dotsWrap = document.getElementById("dots");
  var carousel = document.getElementById("carousel");
  var toastEl = document.getElementById("toast");

  var index = 0;
  var count = slides.length;
  var AUTOPLAY_MS = 6000;
  var timer = null;
  var paused = false;

  /* ---------- Dots ---------- */
  var dots = slides.map(function (_, i) {
    var b = document.createElement("button");
    b.className = "dot";
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Story " + (i + 1) + " of " + count);
    b.addEventListener("click", function () {
      goTo(i, true);
    });
    dotsWrap.appendChild(b);
    return b;
  });

  /* ---------- Core ---------- */
  function render() {
    track.style.transform = "translateX(" + -index * 100 + "%)";
    dots.forEach(function (d, i) {
      var active = i === index;
      d.classList.toggle("active", active);
      d.setAttribute("aria-selected", active ? "true" : "false");
    });
    slides.forEach(function (s, i) {
      s.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
  }

  function goTo(i, userInitiated) {
    index = (i + count) % count;
    render();
    if (userInitiated) restart();
  }

  function next(user) {
    goTo(index + 1, user);
  }
  function prev(user) {
    goTo(index - 1, user);
  }

  /* ---------- Autoplay ---------- */
  function start() {
    stop();
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    timer = window.setInterval(function () {
      if (!paused) next(false);
    }, AUTOPLAY_MS);
  }
  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }
  function restart() {
    start();
  }

  /* ---------- Controls ---------- */
  nextBtn.addEventListener("click", function () {
    next(true);
  });
  prevBtn.addEventListener("click", function () {
    prev(true);
  });

  carousel.addEventListener("mouseenter", function () {
    paused = true;
  });
  carousel.addEventListener("mouseleave", function () {
    paused = false;
  });
  carousel.addEventListener("focusin", function () {
    paused = true;
  });
  carousel.addEventListener("focusout", function () {
    paused = false;
  });

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      next(true);
    } else if (e.key === "ArrowLeft") {
      prev(true);
    }
  });

  /* ---------- Touch / swipe ---------- */
  var startX = 0;
  var deltaX = 0;
  var dragging = false;

  carousel.addEventListener(
    "touchstart",
    function (e) {
      startX = e.touches[0].clientX;
      deltaX = 0;
      dragging = true;
      paused = true;
    },
    { passive: true }
  );
  carousel.addEventListener(
    "touchmove",
    function (e) {
      if (!dragging) return;
      deltaX = e.touches[0].clientX - startX;
    },
    { passive: true }
  );
  carousel.addEventListener("touchend", function () {
    if (!dragging) return;
    dragging = false;
    paused = false;
    if (Math.abs(deltaX) > 45) {
      if (deltaX < 0) next(true);
      else prev(true);
    }
  });

  /* ---------- Share / toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  track.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".share") : null;
    if (!btn) return;
    var couple = btn.getAttribute("data-couple") || "this couple";
    var slug = couple.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
    var link = window.location.origin + "/stories/" + slug;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(
        function () {
          toast(couple + "’s story link copied");
        },
        function () {
          toast("Story: " + couple);
        }
      );
    } else {
      toast("Story: " + couple);
    }
  });

  /* ---------- Live rating summary ---------- */
  (function summarize() {
    var totalStars = 0;
    slides.forEach(function (s) {
      var label = s.querySelector(".stars").getAttribute("aria-label") || "";
      var m = label.match(/(\d+)/);
      totalStars += m ? parseInt(m[1], 10) : 5;
    });
    var avg = totalStars / count;
    var avgEl = document.getElementById("avgRating");
    var countEl = document.getElementById("totalCount");
    if (avgEl) avgEl.textContent = avg.toFixed(1);
    if (countEl) countEl.textContent = String(count);
  })();

  /* ---------- Boot ---------- */
  render();
  start();
})();
