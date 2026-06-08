(function () {
  "use strict";

  var grid = document.getElementById("grid");
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".svc"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var resultLine = document.getElementById("result-line");
  var empty = document.getElementById("empty");

  var LABELS = {
    all: "services",
    primary: "primary care services",
    specialist: "specialist services",
    diagnostic: "diagnostic services",
  };

  var current = "all";

  /* ── Toast helper ── */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.hidden = true;
    }, 2600);
  }

  /* ── Live category counts ── */
  function computeCounts() {
    var counts = { all: cards.length, primary: 0, specialist: 0, diagnostic: 0 };
    cards.forEach(function (card) {
      var cat = card.getAttribute("data-cat");
      if (counts[cat] != null) counts[cat] += 1;
    });
    Object.keys(counts).forEach(function (key) {
      var el = document.getElementById("count-" + key);
      if (el) el.textContent = String(counts[key]);
    });
  }

  /* ── Filtering ── */
  function applyFilter(filter) {
    current = filter;
    var visible = 0;

    cards.forEach(function (card) {
      var match = filter === "all" || card.getAttribute("data-cat") === filter;
      card.classList.toggle("is-hidden", !match);
      if (match) visible += 1;
    });

    chips.forEach(function (chip) {
      var active = chip.getAttribute("data-filter") === filter;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-selected", active ? "true" : "false");
    });

    empty.hidden = visible !== 0;

    var label = LABELS[filter] || "services";
    resultLine.textContent =
      visible === 0
        ? "No " + label + " to show."
        : "Showing " + visible + " " + (visible === 1 ? "service" : label) + ".";
  }

  /* ── Chip clicks + keyboard roving focus ── */
  chips.forEach(function (chip, i) {
    chip.addEventListener("click", function () {
      applyFilter(chip.getAttribute("data-filter"));
    });
    chip.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = chips[i + 1] || chips[0];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = chips[i - 1] || chips[chips.length - 1];
      else if (e.key === "Home") next = chips[0];
      else if (e.key === "End") next = chips[chips.length - 1];
      if (next) {
        e.preventDefault();
        next.focus();
        applyFilter(next.getAttribute("data-filter"));
      }
    });
  });

  /* ── Card actions: Learn more / Book / Call ── */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.getAttribute("data-action");
    var name = btn.getAttribute("data-name") || "this service";

    if (action === "learn") {
      toast("Opening details for " + name + " — illustrative only.");
    } else if (action === "book") {
      toast("Booking request started for " + name + ".");
    } else if (action === "call") {
      toast("Call Northpoint Clinic at (555) 014-8821.");
    }
  });

  /* ── Init ── */
  computeCounts();
  applyFilter("all");
})();
