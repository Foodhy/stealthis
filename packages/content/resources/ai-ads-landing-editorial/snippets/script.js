(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".js-toast");
    if (t) {
      e.preventDefault();
      toast(t.getAttribute("data-msg") || "Acción de demostración.");
    }
  });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Reading progress ---------- */
  var progressBar = document.getElementById("progressBar");
  if (progressBar) {
    window.addEventListener(
      "scroll",
      function () {
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        progressBar.style.width = pct.toFixed(2) + "%";
      },
      { passive: true }
    );
  }

  /* ---------- Live student counter ----------
     Starts at 6.186 (the published figure) and creeps up occasionally,
     mimicking a "verified purchases" ticker. */
  var counterEl = document.getElementById("studentCount");
  if (counterEl) {
    var students = 6186;
    function render() {
      counterEl.textContent = students.toLocaleString("es-ES");
    }
    render();
    if (!reduceMotion) {
      setInterval(function () {
        if (Math.random() < 0.18) {
          students += 1;
          render();
        }
      }, 9000);
    }
  }

  /* ---------- Figure count-up ---------- */
  function fmt(value, decimals, prefix) {
    var fixed = value.toFixed(decimals);
    if (decimals > 0) fixed = fixed.replace(".", ",");
    return (prefix || "") + fixed;
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count") || "0");
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    if (reduceMotion) {
      el.textContent = fmt(target, decimals, prefix);
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, decimals, prefix);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target, decimals, prefix);
    }
    requestAnimationFrame(step);
  }
  var countEls = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    countEls.forEach(function (el) {
      cio.observe(el);
    });
  } else {
    countEls.forEach(animateCount);
  }

  /* ---------- Register: single-open ---------- */
  var entries = Array.prototype.slice.call(document.querySelectorAll(".entry"));
  entries.forEach(function (entry) {
    entry.addEventListener("toggle", function () {
      if (entry.open) {
        entries.forEach(function (other) {
          if (other !== entry) other.open = false;
        });
      }
    });
  });

  /* ---------- Reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".chapter, .plan, .fig"));
  revealEls.forEach(function (el) {
    el.classList.add("reveal");
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    var rio = new IntersectionObserver(
      function (items) {
        items.forEach(function (item) {
          if (item.isIntersecting) {
            item.target.classList.add("is-in");
            rio.unobserve(item.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      rio.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }
})();
