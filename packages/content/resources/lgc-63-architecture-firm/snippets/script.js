/* ── lgc-63-architecture-firm · script.js ─────────────────────────────────── */

/* ── Counter Animation ─────────────────────────────────────────────────────── */
(function initCounters() {
  var statsEl = document.querySelector(".stats-section");
  if (!statsEl) return;

  var counters = statsEl.querySelectorAll(".stat-number[data-target]");
  var started = false;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    var target = parseFloat(el.dataset.target) || 0;
    var suffix = el.dataset.suffix || "";
    var duration = 1600;
    var start = null;

    function tick(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var value = easeOut(progress) * target;
      el.textContent = (target % 1 === 0 ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // Snapshot text content as targets before animating
  counters.forEach(function (el) {
    var text = el.firstChild ? el.firstChild.textContent.trim() : el.textContent.trim();
    var num = parseFloat(text.replace(/[^\d.]/g, "")) || 0;
    var suffix = text.replace(/[\d.,]/g, "").trim();
    el.dataset.target = num;
    el.dataset.suffix = suffix;
    el.textContent = "0" + suffix;
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          started = true;
          counters.forEach(animateCounter);
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(statsEl);
})();

/* ── Horizontal Drag Scroll ────────────────────────────────────────────────── */
(function initDragScroll() {
  var container = document.querySelector(".projects-track-wrap");
  if (!container) return;

  var isDown = false,
    startX = 0,
    scrollLeft = 0;

  container.addEventListener("mousedown", function (e) {
    isDown = true;
    container.classList.add("dragging");
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    e.preventDefault();
  });

  document.addEventListener("mouseup", function () {
    if (!isDown) return;
    isDown = false;
    container.classList.remove("dragging");
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDown) return;
    container.scrollLeft = scrollLeft - (e.pageX - container.offsetLeft - startX) * 1.4;
  });

  container.addEventListener(
    "touchstart",
    function (e) {
      startX = e.touches[0].pageX;
      scrollLeft = container.scrollLeft;
    },
    { passive: true }
  );

  container.addEventListener(
    "touchmove",
    function (e) {
      container.scrollLeft = scrollLeft + (startX - e.touches[0].pageX);
    },
    { passive: true }
  );
})();

/* ── Contact Form ──────────────────────────────────────────────────────────── */
(function initForm() {
  var form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = form.querySelector(".btn-submit");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Sending…";
    }

    setTimeout(function () {
      form.innerHTML =
        '<p style="color:#c9a96e;font-size:0.9rem;padding:16px 0;">Thank you — we\'ll be in touch soon.</p>';
    }, 800);
  });
})();
