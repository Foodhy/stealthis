(function () {
  "use strict";

  /* ── Fictional case-study data ───────────── */
  var PROJECTS = {
    lumen: {
      role: "Lead Product Designer",
      year: "2024",
      title: "Lumen — banking that explains itself",
      chips: ["Product UX", "Design System", "Research"],
      thumb: "linear-gradient(135deg, #fbe6c9, #f3b14e)",
      overview:
        "Lumen is a challenger bank where every screen answers \"why am I seeing this?\". I led a 4-month redesign of the money-movement flow, replacing modal-heavy transfers with an inline, reversible timeline.",
      rolep:
        "Owned end-to-end UX, ran 14 moderated sessions, and built the token layer the team still ships on today.",
      impact: [
        ["38%", "fewer support tickets about failed transfers"],
        ["+12", "System Usability Scale points after launch"],
        ["3 wks", "saved per quarter on design-to-build handoff"]
      ]
    },
    orbit: {
      role: "Product Designer",
      year: "2023",
      title: "Orbit — onboarding for a dev platform",
      chips: ["UX", "Prototyping"],
      thumb: "linear-gradient(135deg, #6d5efc, #22d3ee)",
      overview:
        "Orbit helps engineers ship their first deploy in under ten minutes. I reworked the first-run experience into a guided, skippable checklist with contextual code samples.",
      rolep:
        "Designed the flow, prototyped the interactive terminal, and paired daily with two front-end engineers.",
      impact: [
        ["41% → 67%", "activation rate within 7 days"],
        ["−4 min", "median time to first successful deploy"],
        ["x2", "week-2 retention for new accounts"]
      ]
    },
    fern: {
      role: "Brand & Product",
      year: "2023",
      title: "Fern — a grocery app for refill stores",
      chips: ["Branding", "Mobile"],
      thumb: "linear-gradient(135deg, #10b981, #064e3b)",
      overview:
        "Fern lets zero-waste shoppers track refillable containers across local stores. I built the brand from scratch and a refill-tracking flow that maps containers to deposits.",
      rolep:
        "Solo designer: identity, illustration system, and the full mobile UX through a 4-store pilot.",
      impact: [
        ["4", "pilot stores adopted the flow in month one"],
        ["92%", "of testers found a container in under 5 seconds"],
        ["0", "paper receipts — fully digital deposit ledger"]
      ]
    },
    atlas: {
      role: "Design Lead",
      year: "2022",
      title: "Atlas — trail-planning dashboard",
      chips: ["UX", "Data viz"],
      thumb: "linear-gradient(135deg, #ef4444, #f97316)",
      overview:
        "Atlas started as a weekend project to plan multi-day hikes and grew into a client pitch. It layers elevation, weather and water sources onto a single planning canvas.",
      rolep:
        "Concept, interaction design, and the data-viz language for elevation and risk overlays.",
      impact: [
        ["1", "weekend prototype that became a paid engagement"],
        ["6", "overlay types unified into one legend system"],
        ["AA", "contrast met across every map layer"]
      ]
    },
    quill: {
      role: "Content Design",
      year: "2021",
      title: "Quill — docs that read like a friend",
      chips: ["UX Writing", "System"],
      thumb: "linear-gradient(135deg, #1e293b, #475569)",
      overview:
        "Quill is a voice-and-tone system that rewrote 200+ help pages to sound human without losing precision. I paired editorial rules with reusable component patterns.",
      rolep:
        "Defined the voice principles, wrote the pattern library, and trained 9 writers on it.",
      impact: [
        ["200+", "pages migrated to the new voice"],
        ["−27%", "\"was this helpful? — no\" votes"],
        ["9", "writers onboarded onto one shared system"]
      ]
    }
  };

  /* ── Toast helper ─────────────────────────── */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ── Modal wiring ─────────────────────────── */
  var modal = document.getElementById("modal");
  var panel = modal.querySelector(".modal__panel");
  var thumbEl = document.getElementById("modal-thumb");
  var roleEl = document.getElementById("modal-role");
  var yearEl = document.getElementById("modal-year");
  var titleEl = document.getElementById("modal-title");
  var chipsEl = document.getElementById("modal-chips");
  var overviewEl = document.getElementById("modal-overview");
  var rolepEl = document.getElementById("modal-rolep");
  var impactEl = document.getElementById("modal-impact");
  var lastFocused = null;

  function openModal(key) {
    var p = PROJECTS[key];
    if (!p) return;

    thumbEl.style.background = p.thumb;
    roleEl.textContent = p.role;
    yearEl.textContent = p.year;
    titleEl.textContent = p.title;

    chipsEl.innerHTML = "";
    p.chips.forEach(function (c) {
      var li = document.createElement("li");
      li.className = "chip";
      li.textContent = c;
      chipsEl.appendChild(li);
    });

    overviewEl.textContent = p.overview;
    rolepEl.textContent = p.rolep;

    impactEl.innerHTML = "";
    p.impact.forEach(function (row) {
      var li = document.createElement("li");
      var strong = document.createElement("strong");
      strong.textContent = row[0] + " ";
      li.appendChild(strong);
      li.appendChild(document.createTextNode(row[1]));
      impactEl.appendChild(li);
    });

    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    panel.scrollTop = 0;
    panel.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      // simple focus trap
      var focusables = modal.querySelectorAll(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* close buttons + backdrop */
  modal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  /* ── Card interactions ────────────────────── */
  var cards = document.querySelectorAll(".card");
  cards.forEach(function (card) {
    var key = card.getAttribute("data-project");

    function activate() {
      openModal(key);
    }

    card.addEventListener("click", activate);

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        activate();
      }
    });
  });

  /* ── Pointer-tracked tilt (subtle) ────────── */
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    cards.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "translateY(-6px) rotateX(" +
          (-dy * 3).toFixed(2) +
          "deg) rotateY(" +
          (dx * 3).toFixed(2) +
          "deg)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  toast("Hover or focus a card · activate to open its case study");
})();
