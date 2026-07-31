/* Bolt & Bevel — Workshop Classes
   Vanilla JS: level filter, seat meters, enroll flow, hero counters, toast. */

(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------- Seat meters ---------- */
  var LOW_THRESHOLD = 0.34; // <= ~1/3 of seats -> amber

  function paintMeter(fill) {
    var seats = parseInt(fill.dataset.seats, 10);
    var total = parseInt(fill.dataset.total, 10);
    var ratio = total > 0 ? seats / total : 0;

    fill.style.width = Math.round(ratio * 100) + "%";
    fill.classList.toggle("is-low", seats > 0 && ratio <= LOW_THRESHOLD);
    fill.classList.toggle("is-empty", seats === 0);

    var meter = fill.closest(".seat-meter");
    if (meter) {
      meter.setAttribute("aria-label", seats + " of " + total + " seats left");
    }
  }

  document.querySelectorAll(".seat-fill").forEach(paintMeter);

  /* ---------- Enroll buttons ---------- */
  document.querySelectorAll(".btn-enroll").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".class-card");
      var fill = card.querySelector(".seat-fill");
      var numEl = card.querySelector(".seat-num");
      var seats = parseInt(fill.dataset.seats, 10);
      var name = btn.dataset.class;

      if (seats <= 0) return;

      seats -= 1;
      fill.dataset.seats = String(seats);
      numEl.textContent = String(seats);
      paintMeter(fill);

      if (seats === 0) {
        card.classList.add("is-full");
        btn.disabled = true;
        btn.textContent = "Class full";
        var label = card.querySelector(".seat-label");
        if (label) label.innerHTML = '<b class="seat-num">0</b>/' + fill.dataset.total + " — WAITLIST OPEN";
        toast("LAST SEAT CLAIMED — “" + name.toUpperCase() + "” IS NOW FULL");
      } else if (seats === 1) {
        toast("SEAT RESERVED FOR “" + name.toUpperCase() + "” — ONLY 1 LEFT!");
      } else {
        toast("SEAT RESERVED FOR “" + name.toUpperCase() + "” — SEE YOU AT THE BENCH");
      }
    });
  });

  /* ---------- Level filter chips ---------- */
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".class-card");
  var countEl = document.getElementById("filterCount");
  var emptyNote = document.getElementById("emptyNote");

  function applyFilter(level) {
    var visible = 0;
    cards.forEach(function (card) {
      var show = level === "all" || card.dataset.level === level;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    countEl.textContent = "SHOWING " + visible + " OF " + cards.length + " CLASSES";
    emptyNote.hidden = visible !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", String(active));
      });
      applyFilter(chip.dataset.level);
    });
  });

  /* ---------- Membership join ---------- */
  var joinBtn = document.getElementById("joinBtn");
  if (joinBtn) {
    joinBtn.addEventListener("click", function () {
      joinBtn.disabled = true;
      joinBtn.textContent = "Card BB-4172 reserved";
      toast("WELCOME ABOARD — YOUR MEMBER CARD IS WAITING AT THE FRONT DESK");
    });
  }

  /* ---------- Hero stat counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.dataset.count, 10);
    var duration = 900;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var statEls = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window) {
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statEls.forEach(function (el) { io.observe(el); });
  } else {
    statEls.forEach(function (el) {
      el.textContent = el.dataset.count;
    });
  }

  /* ---------- FAQ: close others when one opens ---------- */
  var faqs = document.querySelectorAll(".faq-item");
  faqs.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqs.forEach(function (other) {
        if (other !== item && other.open) other.open = false;
      });
    });
  });
})();
