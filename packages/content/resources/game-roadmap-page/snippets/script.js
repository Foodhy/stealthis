/* Hollow Reign — Roadmap page interactions */
(() => {
  "use strict";

  const roadmap = document.getElementById("roadmap");
  const milestones = Array.from(roadmap.querySelectorAll(".milestone"));
  const chips = Array.from(document.querySelectorAll(".chip"));
  const viewBtns = Array.from(document.querySelectorAll(".vt-btn"));
  const spineFill = document.getElementById("spineFill");
  const emptyNote = document.getElementById("emptyNote");
  const toastEl = document.getElementById("toast");

  /* ---------- Toast helper ---------- */
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2400);
  }

  /* ---------- Expandable cards ---------- */
  milestones.forEach((m) => {
    const head = m.querySelector(".card-head");
    // Sync initial state from aria-expanded markup
    if (head.getAttribute("aria-expanded") === "true") m.classList.add("is-open");

    head.addEventListener("click", () => {
      const open = m.classList.toggle("is-open");
      head.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------- Status filtering ---------- */
  const counts = { all: milestones.length, released: 0, progress: 0, planned: 0 };
  milestones.forEach((m) => { counts[m.dataset.status] += 1; });
  document.querySelectorAll(".chip-count").forEach((el) => {
    el.textContent = counts[el.dataset.count];
  });

  const FILTER_LABELS = {
    all: "Showing all milestones",
    released: "Showing released updates",
    progress: "Showing work in progress",
    planned: "Showing planned updates",
  };

  function applyFilter(filter) {
    let visible = 0;
    milestones.forEach((m) => {
      const show = filter === "all" || m.dataset.status === filter;
      m.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    emptyNote.hidden = visible > 0;
    requestAnimationFrame(updateSpine);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      if (chip.classList.contains("is-on")) return;
      chips.forEach((c) => c.classList.remove("is-on"));
      chip.classList.add("is-on");
      const filter = chip.dataset.filter;
      applyFilter(filter);
      toast(FILTER_LABELS[filter]);
    });
  });

  /* ---------- Timeline / list view toggle ---------- */
  viewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-on")) return;
      viewBtns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      const view = btn.dataset.view;
      roadmap.classList.toggle("view-timeline", view === "timeline");
      roadmap.classList.toggle("view-list", view === "list");
      if (view === "timeline") requestAnimationFrame(updateSpine);
      toast(view === "timeline" ? "Timeline view" : "List view");
    });
  });

  /* ---------- Animated progress line to current milestone ---------- */
  function updateSpine() {
    const current = roadmap.querySelector(".milestone.is-current:not(.is-hidden)");
    if (!current) { spineFill.style.height = "0px"; return; }
    const node = current.querySelector(".node");
    const spineRect = spineFill.parentElement.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const h = nodeRect.top + nodeRect.height / 2 - spineRect.top;
    spineFill.style.height = Math.max(0, h) + "px";
  }

  // Re-measure when cards expand/collapse settle and on resize.
  roadmap.addEventListener("transitionend", (e) => {
    if (e.target.classList.contains("card-body")) updateSpine();
  });
  window.addEventListener("resize", updateSpine);

  /* ---------- Phase meter fill on load ---------- */
  function fillMeters() {
    document.querySelectorAll(".meter-fill[style*='--target']").forEach((el) => {
      el.classList.add("is-filled");
    });
  }

  /* ---------- CTAs ---------- */
  const wire = (id, msg) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", () => toast(msg));
  };
  wire("wishlistBtn", "Hollow Reign added to your wishlist ✦");
  wire("ctaWishlist", "Hollow Reign added to your wishlist ✦");
  wire("ctaDiscord", "Invite sent — welcome to the Council, Vanguard.");

  /* ---------- Init ---------- */
  window.addEventListener("load", () => {
    fillMeters();
    // Slight delay so the spine animates after layout is final.
    setTimeout(updateSpine, 250);
  });
  // Fallback in case load already fired (e.g. inlined in srcdoc)
  if (document.readyState === "complete") {
    fillMeters();
    setTimeout(updateSpine, 250);
  }
})();
