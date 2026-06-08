(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 280);
    }, 2800);
  }

  /* ---------- Today's date on the whiteboard ---------- */
  var wodDate = document.getElementById("wodDate");
  if (wodDate) {
    try {
      wodDate.textContent = new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      /* keep fallback text */
    }
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  function setMenu(open) {
    if (!burger || !mobileMenu) return;
    burger.setAttribute("aria-expanded", String(open));
    mobileMenu.hidden = !open;
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (burger) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
  }
  if (mobileMenu) {
    mobileMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
            if (entry.target.querySelector("[data-count]")) runCounters(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
    runCounters(document);
  }

  /* ---------- Count-up stats ---------- */
  function runCounters(scope) {
    var nums = scope.querySelectorAll("[data-count]");
    nums.forEach(function (el) {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var dur = 1300;
      var start = performance.now();
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- WOD timer demo ---------- */
  var face = document.getElementById("timerFace");
  var startBtn = document.getElementById("timerStart");
  var resetBtn = document.getElementById("timerReset");
  var modeBtns = document.querySelectorAll("[data-mode]");
  var AMRAP_SECS = 12 * 60;
  var mode = "stopwatch";
  var running = false;
  var rafId = null;
  var startTs = 0;
  var elapsedAtPause = 0;

  function fmt(totalSecs) {
    totalSecs = Math.max(0, Math.floor(totalSecs));
    var m = Math.floor(totalSecs / 60);
    var s = totalSecs % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }
  function render(elapsed) {
    if (!face) return;
    if (mode === "amrap") {
      var remaining = AMRAP_SECS - elapsed;
      if (remaining <= 0) {
        face.textContent = "00:00";
        stopTimer(true);
        toast("Time! AMRAP complete.");
        return;
      }
      face.textContent = fmt(remaining);
    } else {
      face.textContent = fmt(elapsed);
    }
  }
  function loop(now) {
    var elapsed = elapsedAtPause + (now - startTs) / 1000;
    render(elapsed);
    if (running) rafId = requestAnimationFrame(loop);
  }
  function startTimer() {
    if (running) return;
    running = true;
    startTs = performance.now();
    if (face) face.classList.add("is-running");
    if (startBtn) startBtn.textContent = "Pause";
    rafId = requestAnimationFrame(loop);
  }
  function pauseTimer() {
    if (!running) return;
    running = false;
    elapsedAtPause += (performance.now() - startTs) / 1000;
    if (rafId) cancelAnimationFrame(rafId);
    if (face) face.classList.remove("is-running");
    if (startBtn) startBtn.textContent = "Resume";
  }
  function stopTimer(finished) {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (face) face.classList.remove("is-running");
    if (startBtn) startBtn.textContent = finished ? "Start" : "Resume";
    if (finished) elapsedAtPause = 0;
  }
  function resetTimer() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    elapsedAtPause = 0;
    if (face) face.classList.remove("is-running");
    if (startBtn) startBtn.textContent = "Start";
    render(0);
  }
  if (startBtn) {
    startBtn.addEventListener("click", function () {
      if (running) pauseTimer();
      else startTimer();
    });
  }
  if (resetBtn) resetBtn.addEventListener("click", resetTimer);
  modeBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      modeBtns.forEach(function (x) {
        x.classList.remove("is-active");
      });
      b.classList.add("is-active");
      mode = b.getAttribute("data-mode");
      resetTimer();
    });
  });
  render(0);

  /* ---------- Booking modal (focus trap) ---------- */
  var modal = document.getElementById("modal");
  var form = document.getElementById("bookForm");
  var lastFocused = null;

  function getFocusable() {
    return modal
      ? Array.prototype.slice.call(
          modal.querySelectorAll(
            'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
          )
        ).filter(function (el) {
          return !el.disabled && el.offsetParent !== null;
        })
      : [];
  }
  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    setMenu(false);
    document.body.style.overflow = "hidden";
    var f = getFocusable();
    if (f[0]) f[0].focus();
    document.addEventListener("keydown", onModalKey);
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onModalKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  function onModalKey(e) {
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      var f = getFocusable();
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-book]")) {
      e.preventDefault();
      openModal();
    } else if (e.target.closest("[data-close]")) {
      closeModal();
    } else if (e.target.closest("[data-waitlist]")) {
      toast("Added to the waitlist — we'll text you if a spot opens.");
    }
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name;
      var email = form.elements.email;
      var valid = true;
      [name, email].forEach(function (input) {
        input.classList.remove("is-invalid");
      });
      if (!name.value.trim()) {
        name.classList.add("is-invalid");
        valid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.classList.add("is-invalid");
        valid = false;
      }
      if (!valid) {
        toast("Check the highlighted fields.");
        return;
      }
      var who = name.value.trim().split(" ")[0];
      closeModal();
      form.reset();
      toast("Booked! See you on the floor, " + who + ".");
    });
  }
})();
