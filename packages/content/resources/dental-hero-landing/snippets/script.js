(function () {
  "use strict";

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- State ---------- */
  var selectedDay = "Mon 8";
  var selectedTime = null;

  var bookBtn = document.getElementById("bookBtn");
  var bookLabel = bookBtn ? bookBtn.querySelector(".btn-label") : null;
  var hint = document.getElementById("pickerHint");

  function updateBooking() {
    var ready = !!selectedTime;
    if (bookBtn) {
      bookBtn.disabled = !ready;
      if (ready) {
        bookBtn.classList.add("is-ready");
        if (bookLabel) bookLabel.textContent = "Book " + selectedDay + " · " + selectedTime;
      } else {
        bookBtn.classList.remove("is-ready");
        if (bookLabel) bookLabel.textContent = "Pick a time to book";
      }
    }
    if (hint) {
      if (ready) {
        hint.textContent = selectedDay + " at " + selectedTime + " selected";
        hint.classList.add("is-set");
      } else {
        hint.textContent = "Select a day & time";
        hint.classList.remove("is-set");
      }
    }
  }

  /* ---------- Day tabs ---------- */
  var days = document.getElementById("days");
  if (days) {
    var chips = Array.prototype.slice.call(days.querySelectorAll(".chip"));
    days.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      chips.forEach(function (c) { c.setAttribute("aria-selected", "false"); });
      chip.setAttribute("aria-selected", "true");
      selectedDay = chip.getAttribute("data-day");
      updateBooking();
    });
    // Keyboard arrow navigation between day tabs
    days.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var i = chips.indexOf(document.activeElement);
      if (i === -1) return;
      e.preventDefault();
      var next = e.key === "ArrowRight" ? (i + 1) % chips.length : (i - 1 + chips.length) % chips.length;
      chips[next].focus();
      chips[next].click();
    });
  }

  /* ---------- Time slots ---------- */
  var slots = document.getElementById("slots");
  if (slots) {
    var slotBtns = Array.prototype.slice.call(slots.querySelectorAll(".slot"));
    slots.addEventListener("click", function (e) {
      var slot = e.target.closest(".slot");
      if (!slot || slot.disabled) return;
      slotBtns.forEach(function (s) { s.classList.remove("is-selected"); });
      slot.classList.add("is-selected");
      selectedTime = slot.getAttribute("data-time");
      updateBooking();
      toast("Held " + selectedDay + " at " + selectedTime + " for 10 min");
    });
  }

  /* ---------- Book button ---------- */
  if (bookBtn) {
    bookBtn.addEventListener("click", function () {
      if (!selectedTime) return;
      toast("Appointment requested — " + selectedDay + " at " + selectedTime + ". We'll call to confirm.");
    });
  }

  /* ---------- Services ---------- */
  var services = document.querySelectorAll(".service");
  services.forEach(function (s) {
    function pick() {
      var name = s.querySelector(".service-name");
      toast((name ? name.textContent : "Service") + " — added to your visit");
    }
    s.addEventListener("click", pick);
    s.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); }
    });
  });

  /* ---------- Count-up badges ---------- */
  function formatValue(v, el) {
    var decimal = el.getAttribute("data-decimal");
    var fmt = el.getAttribute("data-format");
    if (decimal) {
      // stored as integer * 10 (e.g. 49 -> 4.9)
      return (v / 10).toFixed(parseInt(decimal, 10));
    }
    if (fmt === "k") {
      if (v >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + "k";
      return String(v);
    }
    return String(v);
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var start = performance.now();
    var dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = formatValue(val, el) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = formatValue(target, el) + suffix;
    }
    requestAnimationFrame(tick);
  }

  var badgeNums = document.querySelectorAll(".badge-num");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    badgeNums.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      el.textContent = formatValue(target, el) + (el.getAttribute("data-suffix") || "");
    });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    badgeNums.forEach(function (el) { io.observe(el); });
  } else {
    badgeNums.forEach(countUp);
  }

  updateBooking();
})();
