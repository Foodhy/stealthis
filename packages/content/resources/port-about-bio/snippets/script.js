/* =================================================================
   Portfolio — About / Bio Block
   Vanilla JS: CV download (simulated), social toasts,
   rotating "currently" line, availability toggle.
   ================================================================= */
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2400);
  }

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Download CV (illustrative) ---------- */
  var cvBtn = document.getElementById("cv-btn");
  if (cvBtn) {
    var cvLabel = cvBtn.querySelector("span:last-child");
    var cvDefault = cvLabel ? cvLabel.textContent : "";
    cvBtn.addEventListener("click", function () {
      if (cvBtn.classList.contains("is-busy")) return;
      cvBtn.classList.add("is-busy");
      if (cvLabel) cvLabel.textContent = "Preparing PDF…";
      toast("Generating Maya’s CV…");
      window.setTimeout(
        function () {
          cvBtn.classList.remove("is-busy");
          if (cvLabel) cvLabel.textContent = cvDefault;
          toast("CV ready — download is illustrative in this demo");
        },
        reduceMotion ? 200 : 1100
      );
    });
  }

  /* ---------- Social links (illustrative) ---------- */
  var socials = document.querySelectorAll(".social");
  Array.prototype.forEach.call(socials, function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      toast(link.getAttribute("data-toast") || "Link is illustrative");
    });
  });

  /* ---------- Rotating "currently" line ---------- */
  var currentlyText = document.getElementById("currently-text");
  if (currentlyText) {
    var lines = [
      "Refining a fintech design system in Lisbon",
      "Pairing with engineers on tokens & theming",
      "Mentoring two junior product designers",
      "Sketching a side project after hours ☕"
    ];
    var lineIdx = 0;

    function showNextLine() {
      lineIdx = (lineIdx + 1) % lines.length;
      if (reduceMotion) {
        currentlyText.textContent = lines[lineIdx];
        return;
      }
      currentlyText.style.transition = "opacity 0.28s ease";
      currentlyText.style.opacity = "0";
      window.setTimeout(function () {
        currentlyText.textContent = lines[lineIdx];
        currentlyText.style.opacity = "1";
      }, 300);
    }

    // Click the card to cycle manually.
    var currentlyCard = document.getElementById("currently");
    if (currentlyCard) {
      currentlyCard.addEventListener("click", showNextLine);
    }
    // Auto-rotate (paused for reduced motion).
    if (!reduceMotion) {
      window.setInterval(showNextLine, 4200);
    }
  }

  /* ---------- Availability toggle (click the badge) ---------- */
  var availability = document.getElementById("availability");
  if (availability) {
    availability.style.cursor = "pointer";
    availability.setAttribute("role", "button");
    availability.setAttribute("tabindex", "0");
    availability.setAttribute("aria-pressed", "false");

    var states = [
      { text: "Available · June ’26", cls: "badge--open", msg: "Open to new work in June 2026" },
      { text: "Booked through Q3", cls: "badge--busy", msg: "Currently booked — back in Q4" }
    ];
    var stateIdx = 0;

    function toggleAvailability() {
      stateIdx = (stateIdx + 1) % states.length;
      var s = states[stateIdx];
      availability.classList.remove("badge--open", "badge--busy");
      availability.classList.add(s.cls);
      availability.textContent = s.text;
      availability.setAttribute("aria-pressed", stateIdx === 1 ? "true" : "false");
      toast(s.msg);
    }

    availability.addEventListener("click", toggleAvailability);
    availability.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleAvailability();
      }
    });
  }
})();
