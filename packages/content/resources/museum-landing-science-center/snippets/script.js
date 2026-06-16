(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2600);
  }

  /* ---------- Sticky topbar shadow ---------- */
  var topbar = document.getElementById("topbar");
  function onScroll() {
    if (!topbar) return;
    topbar.classList.toggle("is-stuck", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Generic CTA + toast triggers ---------- */
  document.querySelectorAll("[data-buy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("Tickets open in a new window — demo only.");
    });
  });
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (el.tagName === "A") e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Exhibit zone filtering ---------- */
  var chips = document.querySelectorAll(".filters .chip");
  var zones = Array.prototype.slice.call(document.querySelectorAll(".zone"));
  var emptyMsg = document.getElementById("zonesEmpty");

  function applyFilter(cat) {
    var shown = 0;
    zones.forEach(function (z) {
      var match = cat === "all" || z.getAttribute("data-cat") === cat;
      z.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- "Add to plan" buttons ---------- */
  var planned = 0;
  document.querySelectorAll(".zone__more").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.dataset.added) {
        btn.dataset.added = "";
        btn.textContent = "Add to plan";
        planned = Math.max(0, planned - 1);
      } else {
        btn.dataset.added = "1";
        btn.textContent = "✓ Added";
        planned++;
      }
      var name = btn.closest(".zone").querySelector("h3").textContent;
      toast(btn.dataset.added
        ? name + " added — " + planned + " zone" + (planned === 1 ? "" : "s") + " in your plan"
        : name + " removed from your plan");
    });
  });

  /* ---------- Showtimes ---------- */
  var showData = {
    "Worlds Beyond": ["10:30", "12:00", "2:30", "4:00"],
    "Coral Reefs": ["11:15", "1:45", "3:15", "5:00"],
    "Sky Tonight": ["1:00", "3:30", "5:30"]
  };
  var soldOut = { "Worlds Beyond": "10:30", "Coral Reefs": "11:15" };
  var showNote = document.getElementById("showNote");

  document.querySelectorAll(".times").forEach(function (box) {
    var show = box.getAttribute("data-show");
    (showData[show] || []).forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "time";
      b.textContent = t;
      if (soldOut[show] === t) {
        b.classList.add("is-soldout");
        b.disabled = true;
        b.setAttribute("aria-label", show + " at " + t + " sold out");
      } else {
        b.addEventListener("click", function () {
          box.querySelectorAll(".time").forEach(function (x) { x.classList.remove("is-picked"); });
          b.classList.add("is-picked");
          if (showNote) showNote.textContent = "Reserved: " + show + " at " + t + ". See you there!";
          toast("Seat held for " + show + " · " + t);
        });
      }
      box.appendChild(b);
    });
  });

  /* ---------- Show date label ---------- */
  var showDate = document.getElementById("showDate");
  if (showDate) {
    showDate.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric"
    });
  }

  /* ---------- Field-trip cost estimator ---------- */
  var form = document.getElementById("tripForm");
  var countEl = document.getElementById("count");
  var estEl = document.getElementById("tripEst");
  var schoolEl = document.getElementById("school");
  var dateEl = document.getElementById("date");
  var PER_STUDENT = 8;

  function recalc() {
    var n = parseInt(countEl.value, 10);
    if (isNaN(n) || n < 0) n = 0;
    estEl.textContent = "$" + (n * PER_STUDENT).toLocaleString();
  }
  if (countEl) countEl.addEventListener("input", recalc);
  recalc();

  // sensible default date: 6 weeks out
  if (dateEl && !dateEl.value) {
    var d = new Date();
    d.setDate(d.getDate() + 42);
    dateEl.min = new Date().toISOString().split("T")[0];
    dateEl.value = d.toISOString().split("T")[0];
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      [schoolEl, dateEl].forEach(function (f) {
        var bad = !f.value.trim();
        f.classList.toggle("is-invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) {
        toast("Add a school name and a date to request your trip.");
        return;
      }
      toast("Request sent for " + schoolEl.value.trim() + " — we'll confirm within 2 days!");
      form.reset();
      recalc();
    });
    [schoolEl, dateEl].forEach(function (f) {
      f && f.addEventListener("input", function () { f.classList.remove("is-invalid"); });
    });
  }
})();
