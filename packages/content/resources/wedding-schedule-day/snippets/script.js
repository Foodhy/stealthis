(function () {
  "use strict";

  var timeline = document.getElementById("timeline");
  var events = Array.prototype.slice.call(
    document.querySelectorAll(".event")
  );
  var chips = Array.prototype.slice.call(
    document.querySelectorAll(".chip[data-filter]")
  );
  var jumpNow = document.getElementById("jumpNow");
  var clockEl = document.getElementById("liveClock");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  /* ---------- Toast helper ---------- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2400);
  }

  /* ---------- Time helpers ---------- */
  // Demo "now" anchored to the wedding day so the live marker always lands
  // on a real event. Uses the current minute-of-day for a lively clock.
  function minutesFromStr(str) {
    var parts = str.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function nowMinutes() {
    var d = new Date();
    // Map real time onto the wedding window (14:30–23:00) so the demo is
    // always active. Scale seconds of the day into that band.
    var startBand = minutesFromStr("14:30");
    var endBand = minutesFromStr("23:00");
    var frac =
      (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400;
    return Math.round(startBand + frac * (endBand - startBand));
  }

  function fmt(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
  }

  /* ---------- Live "now" marker ---------- */
  function currentEvent() {
    var mins = nowMinutes();
    var active = null;
    var upcoming = null;
    events.forEach(function (ev) {
      var s = minutesFromStr(ev.getAttribute("data-start"));
      var e = minutesFromStr(ev.getAttribute("data-end"));
      if (mins >= s && mins < e) active = ev;
      if (!active && !upcoming && mins < s) upcoming = ev;
    });
    return active || upcoming || events[events.length - 1];
  }

  function updateNow() {
    var now = nowMinutes();
    clockEl.textContent = fmt(now);
    var target = currentEvent();
    events.forEach(function (ev) {
      ev.classList.toggle("is-now", ev === target);
    });
  }

  /* ---------- Filtering ---------- */
  function applyFilter(filter) {
    events.forEach(function (ev) {
      var match = filter === "all" || ev.getAttribute("data-cat") === filter;
      ev.classList.toggle("is-hidden", !match);
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- Expand / collapse cards ---------- */
  function toggleCard(card) {
    var open = card.classList.toggle("is-open");
    card.setAttribute("aria-expanded", open ? "true" : "false");
  }

  events.forEach(function (ev) {
    var card = ev.querySelector(".card");

    card.addEventListener("click", function (e) {
      // Don't toggle when interacting with the inner action button.
      if (e.target.closest(".add-btn")) return;
      toggleCard(card);
    });

    card.addEventListener("keydown", function (e) {
      if (e.target !== card) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleCard(card);
      }
    });

    var addBtn = card.querySelector(".add-btn");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        var title = card.querySelector(".card-title h2").textContent;
        if (addBtn.classList.contains("is-added")) {
          addBtn.classList.remove("is-added");
          addBtn.textContent = "Add to my plan";
          toast("Removed “" + title + "” from your plan");
        } else {
          addBtn.classList.add("is-added");
          addBtn.textContent = "✓ In your plan";
          toast("Added “" + title + "” to your plan");
        }
      });
    }
  });

  /* ---------- Jump to now ---------- */
  jumpNow.addEventListener("click", function () {
    updateNow();
    var target = document.querySelector(".event.is-now");
    if (!target) return;
    // Make sure it's visible under the active filter.
    if (target.classList.contains("is-hidden")) {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chips[0].classList.add("is-active");
      chips[0].setAttribute("aria-pressed", "true");
      applyFilter("all");
    }
    var card = target.querySelector(".card");
    card.classList.add("is-open");
    card.setAttribute("aria-expanded", "true");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    toast("Happening now: " + target.querySelector("h2").textContent);
  });

  /* ---------- Init ---------- */
  updateNow();
  setInterval(updateNow, 1000);
})();
