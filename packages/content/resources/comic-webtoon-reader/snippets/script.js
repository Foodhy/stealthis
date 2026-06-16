(function () {
  "use strict";

  var progressFill = document.getElementById("progressFill");
  var topbar = document.getElementById("topbar");
  var toTop = document.getElementById("toTop");
  var likeBtn = document.getElementById("likeBtn");
  var likeCount = document.getElementById("likeCount");
  var nextBtn = document.getElementById("nextBtn");
  var toastEl = document.getElementById("toast");

  /* ---------- Toast helper ---------- */
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2000);
  }

  /* ---------- Scroll: progress, header hide/show, to-top ---------- */
  var lastY = window.scrollY;
  var ticking = false;

  function maxScroll() {
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  function onScroll() {
    var y = window.scrollY;
    var pct = Math.min(100, (y / maxScroll()) * 100);

    // progress bar
    progressFill.style.width = pct.toFixed(2) + "%";

    // header auto-hide on scroll-down, reveal on scroll-up (ignore tiny jitters)
    var delta = y - lastY;
    if (y < 80) {
      topbar.classList.remove("is-hidden");
    } else if (delta > 6) {
      topbar.classList.add("is-hidden");
    } else if (delta < -6) {
      topbar.classList.remove("is-hidden");
    }

    // scroll-to-top appears past 50%
    if (pct > 50) {
      toTop.classList.add("is-visible");
    } else {
      toTop.classList.remove("is-visible");
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  /* ---------- Scroll to top ---------- */
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
    topbar.classList.remove("is-hidden");
    toast("Back to the top");
  });

  /* ---------- Like toggle with count ---------- */
  var BASE_LIKES = 8402;
  var liked = false;

  function fmt(n) {
    return n.toLocaleString("en-US");
  }

  likeBtn.addEventListener("click", function () {
    liked = !liked;
    likeBtn.setAttribute("aria-pressed", liked ? "true" : "false");
    likeCount.textContent = fmt(BASE_LIKES + (liked ? 1 : 0));

    likeBtn.classList.remove("is-pop");
    // force reflow so the animation can replay
    void likeBtn.offsetWidth;
    likeBtn.classList.add("is-pop");

    toast(liked ? "Liked Ep. 12 ❤" : "Removed your like");
  });

  /* ---------- Next episode CTA ---------- */
  nextBtn.addEventListener("click", function () {
    toast("Loading Ep. 13 · Iron Vanguard…");
    nextBtn.disabled = true;
    nextBtn.textContent = "Loading…";
    setTimeout(function () {
      nextBtn.disabled = false;
      nextBtn.textContent = "Read Episode 13 →";
    }, 1400);
  });
})();
