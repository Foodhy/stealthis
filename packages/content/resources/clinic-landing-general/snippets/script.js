(function () {
  "use strict";

  /* ── Toast helper ── */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = '<span class="toast-mark" aria-hidden="true">✓</span>' + msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.hidden = true;
    }, 3000);
  }

  /* ── Sticky nav shadow ── */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Mobile nav toggle ── */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  function closeNav() {
    if (!navToggle || !navLinks) return;
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ── Smooth-scroll for in-page links + close mobile nav ── */
  document.querySelectorAll('a[data-link][href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeNav();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ── Reveal on scroll ── */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ── Animated count-up stats ── */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var start = performance.now();
    var dur = 1200;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll(".stat-num[data-count]");
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
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      cio.observe(el);
    });
  } else {
    counters.forEach(animateCount);
  }

  /* ── Live same-day slot counter ── */
  var slotCount = document.getElementById("slotCount");
  var slotsLeft = slotCount ? parseInt(slotCount.textContent, 10) || 6 : 6;
  var grabBtn = document.getElementById("grabSlot");
  if (grabBtn && slotCount) {
    grabBtn.addEventListener("click", function () {
      if (slotsLeft <= 0) {
        toast("Today is fully booked — try a next-day slot.");
        return;
      }
      slotsLeft -= 1;
      slotCount.textContent = String(slotsLeft);
      // mark the matching band stat as live so it mirrors the count
      var bandStat = document.querySelector('.band-stat .stat-num[data-count="6"]');
      if (bandStat) {
        bandStat.dataset.live = "1";
        bandStat.textContent = String(slotsLeft);
      }
      var openBadge = document.getElementById("openBadge");
      if (slotsLeft === 0 && openBadge) {
        openBadge.textContent = "Fully booked";
        openBadge.classList.remove("ok");
        openBadge.classList.add("warn");
        grabBtn.disabled = true;
        grabBtn.style.opacity = "0.6";
        grabBtn.style.cursor = "default";
      }
      toast("Slot reserved — " + slotsLeft + " left today. We'll text to confirm.");
    });
  }

  /* ── Check availability button ── */
  var checkBtn = document.getElementById("checkAvail");
  if (checkBtn) {
    checkBtn.addEventListener("click", function () {
      if (slotsLeft > 0) {
        toast(slotsLeft + " same-day slots open right now — earliest 9:20 AM.");
      } else {
        toast("Same-day is full today, but next-day looks wide open.");
      }
      // gently nudge attention to the hero card's count
      if (slotCount && slotCount.animate) {
        slotCount.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.18)" },
            { transform: "scale(1)" }
          ],
          { duration: 420, easing: "ease-out" }
        );
      }
    });
  }

  /* ── Today's hours highlight ── */
  var hoursList = document.getElementById("hoursList");
  var todayNote = document.getElementById("todayNote");
  if (hoursList && todayNote) {
    var now = new Date();
    var day = now.getDay(); // 0 = Sun
    var li = hoursList.querySelector('li[data-day="' + day + '"]');
    if (li) li.classList.add("is-today");

    // open ranges per weekday: [openHour, closeHour] or null when closed
    var ranges = {
      0: null,
      1: [8, 19],
      2: [8, 19],
      3: [8, 19],
      4: [8, 19],
      5: [8, 18],
      6: [9, 14]
    };
    var r = ranges[day];
    var hour = now.getHours() + now.getMinutes() / 60;
    if (!r) {
      todayNote.textContent = "Closed today — open again Monday at 8:00 AM.";
      todayNote.classList.add("is-closed");
    } else if (hour < r[0]) {
      todayNote.textContent = "Opening soon — front desk at " + fmtHour(r[0]) + " today.";
    } else if (hour >= r[1]) {
      todayNote.textContent = "Closed for the day — back tomorrow morning.";
      todayNote.classList.add("is-closed");
    } else {
      todayNote.textContent = "Open now until " + fmtHour(r[1]) + " — walk-ins welcome.";
    }
  }
  function fmtHour(h) {
    var ampm = h >= 12 ? "PM" : "AM";
    var hr = h % 12 || 12;
    return hr + ":00 " + ampm;
  }

  /* ── Directions button (illustrative) ── */
  var directionsBtn = document.getElementById("directionsBtn");
  if (directionsBtn) {
    directionsBtn.addEventListener("click", function (e) {
      // it's a #book anchor; let the smooth-scroll run but also confirm
      toast("412 Maple Grove Rd — about 6 min from Cedar Hollow center.");
    });
  }

  /* ── Booking form ── */
  var form = document.getElementById("bookForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = form.querySelector('input[name="name"]');
      var name = (nameInput.value || "").trim();
      if (name.length < 2) {
        nameInput.classList.add("invalid");
        nameInput.focus();
        toast("Please add a name so we know who's coming in.");
        return;
      }
      nameInput.classList.remove("invalid");
      var reason = form.querySelector('select[name="reason"]').value;
      var first = name.split(" ")[0];
      toast("Thanks, " + first + " — we'll text to confirm your " + reason + " visit.");
      form.reset();
    });
    form.querySelector('input[name="name"]').addEventListener("input", function (e) {
      if (e.target.value.trim().length >= 2) e.target.classList.remove("invalid");
    });
  }

  /* ── Phone call button feedback ── */
  var callBtn = document.getElementById("callBtn");
  if (callBtn) {
    callBtn.addEventListener("click", function () {
      toast("Calling the front desk — Mon–Fri 8 AM to 7 PM.");
    });
  }
})();
