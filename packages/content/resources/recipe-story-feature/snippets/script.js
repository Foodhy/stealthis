(function () {
  "use strict";

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
    }, 2400);
  }

  /* ---------- Reading progress bar ---------- */
  var bar = document.getElementById("progressBar");
  var progressWrap = document.querySelector(".progress");
  function updateProgress() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var max = (doc.scrollHeight - doc.clientHeight) || 1;
    var pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
    if (bar) bar.style.width = pct.toFixed(1) + "%";
    if (progressWrap) progressWrap.setAttribute("aria-valuenow", Math.round(pct));
  }

  /* ---------- Sticky byline ---------- */
  var byline = document.getElementById("byline");
  var bylinePlaceholder = null;
  function updateStickyByline() {
    if (!byline) return;
    // Make byline sticky once the hero has scrolled mostly past.
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 80) {
      if (!byline.classList.contains("is-sticky")) byline.classList.add("is-sticky");
    } else {
      byline.classList.remove("is-sticky");
    }
  }

  function onScroll() {
    updateProgress();
    updateStickyByline();
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Jump to recipe ---------- */
  var recipe = document.getElementById("recipe");
  function jumpToRecipe() {
    if (!recipe) return;
    recipe.scrollIntoView({ behavior: "smooth", block: "start" });
    // Move focus for accessibility after the scroll settles.
    setTimeout(function () {
      recipe.focus({ preventScroll: true });
    }, 600);
    toast("Skipping to the good part 🍝");
  }
  document.querySelectorAll("[data-jump]").forEach(function (btn) {
    btn.addEventListener("click", jumpToRecipe);
  });

  /* ---------- Back to top ---------- */
  document.querySelectorAll("[data-top]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var top = document.getElementById("top");
      if (top) top.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Print ---------- */
  document.querySelectorAll("[data-print]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("Opening print view…");
      setTimeout(function () { window.print(); }, 250);
    });
  });

  /* ---------- Smooth anchor nav ---------- */
  document.querySelectorAll('.topbar__nav a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
