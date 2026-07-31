/* DIY — Maker Workshop Hero
   Vanilla JS: toast helper, SVG self-draw lengths, count-up stats,
   grid parallax on mouse move. No external libraries. */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  // Wire every element with a data-toast attribute (buttons + cards).
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () {
      toast(el.getAttribute("data-toast"));
    });
    // Cards are focusable articles — make Enter/Space act like a click.
    if (el.tagName !== "BUTTON" && el.tagName !== "A") {
      el.setAttribute("role", "button");
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toast(el.getAttribute("data-toast"));
        }
      });
    }
  });

  /* ---------- SVG line-art: measure real path lengths ----------
     CSS animates stroke-dashoffset from --len to 0; here we set --len
     to each shape's true length so every stroke draws at a natural pace. */
  document
    .querySelectorAll(".tools-svg .draw path, .tools-svg .draw rect, .tools-svg .draw line, .tools-svg .draw circle")
    .forEach(function (shape) {
      var len;
      try {
        len = Math.ceil(shape.getTotalLength()) + 2;
      } catch (err) {
        len = 900; // fallback for shapes without getTotalLength
      }
      shape.style.setProperty("--len", String(len));
    });

  /* ---------- Count-up stats ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reducedMotion) {
      el.textContent = target.toLocaleString("en-US") + suffix;
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US") + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var statsStarted = false;
  function startStats() {
    if (statsStarted) return;
    statsStarted = true;
    document.querySelectorAll(".stat-num").forEach(animateCount);
  }

  var statsBlock = document.querySelector(".stats");
  if (statsBlock && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startStats();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(statsBlock);
  } else {
    startStats();
  }

  /* ---------- Grid parallax on mouse move ---------- */
  var hero = document.getElementById("hero");
  var grid = document.querySelector(".hero-grid");
  if (hero && grid && !reducedMotion) {
    var ticking = false;
    var mx = 0;
    var my = 0;

    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      // Normalize to -1 .. 1 from hero center
      mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      my = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          grid.style.transform =
            "translate(" + (mx * -14).toFixed(1) + "px, " + (my * -14).toFixed(1) + "px)";
          ticking = false;
        });
      }
    });

    hero.addEventListener("mouseleave", function () {
      grid.style.transform = "translate(0, 0)";
    });
  }

  /* ---------- Welcome toast (small delight, once) ---------- */
  setTimeout(function () {
    toast("Bench is hot — 47 makers building right now.");
  }, 2800);
})();
