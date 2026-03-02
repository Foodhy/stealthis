(function () {
  "use strict";

  // ─── Tour steps ───────────────────────────────────────────────
  const STEPS = [
    {
      target:  "tour-header",
      title:   "Navigation",
      body:    "The header gives you quick access to all major sections. Jump between Overview, Analytics, and Reports instantly.",
      placement: "bottom",
    },
    {
      target:  "tour-stats",
      title:   "Key Metrics",
      body:    "Your four most important KPIs are always visible here — Revenue, Active Users, Conversion, and Churn.",
      placement: "bottom",
    },
    {
      target:  "tour-chart",
      title:   "Revenue Chart",
      body:    "Visualize trends over time. Switch between 7-day, 30-day, and 90-day windows to spot patterns.",
      placement: "top",
    },
    {
      target:  "tour-action",
      title:   "Export Report",
      body:    "Download a full PDF or CSV snapshot of the current view — great for weekly stakeholder updates.",
      placement: "top",
    },
  ];

  // ─── DOM refs ─────────────────────────────────────────────────
  const overlay   = document.getElementById("tour-overlay");
  const tooltip   = document.getElementById("tour-tooltip");
  const titleEl   = document.getElementById("tour-title");
  const bodyEl    = document.getElementById("tour-body");
  const stepLabel = document.getElementById("tour-step-label");
  const dotsEl    = document.getElementById("tour-dots");
  const prevBtn   = document.getElementById("tour-prev");
  const nextBtn   = document.getElementById("tour-next");
  const skipBtn   = document.getElementById("tour-skip");
  const startBtn  = document.getElementById("start-tour-btn");
  const tourStart = document.getElementById("tour-start");
  const maskHole  = document.getElementById("mask-hole");

  const PAD = 10; // spotlight padding around element

  let currentStep = 0;
  let active      = false;

  // ─── Build dots ───────────────────────────────────────────────
  function buildDots() {
    dotsEl.innerHTML = "";
    STEPS.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "tour-dot" + (i === currentStep ? " is-active" : "");
      dotsEl.appendChild(dot);
    });
  }

  // ─── Position tooltip near the target ─────────────────────────
  function positionTooltip(rect, placement) {
    const TW = tooltip.offsetWidth  || 280;
    const TH = tooltip.offsetHeight || 180;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const GAP = 16;

    let top, left;

    if (placement === "bottom") {
      top  = rect.bottom + PAD + GAP;
      left = rect.left + rect.width / 2 - TW / 2;
    } else {
      top  = rect.top - PAD - GAP - TH;
      left = rect.left + rect.width / 2 - TW / 2;
    }

    // Clamp to viewport
    left = Math.max(GAP, Math.min(left, vw - TW - GAP));
    top  = Math.max(GAP, Math.min(top,  vh - TH - GAP));

    tooltip.style.left = left + "px";
    tooltip.style.top  = top  + "px";
  }

  // ─── Update spotlight hole ─────────────────────────────────────
  function updateHole(rect) {
    const x = rect.left   - PAD;
    const y = rect.top    - PAD;
    const w = rect.width  + PAD * 2;
    const h = rect.height + PAD * 2;

    maskHole.setAttribute("x",      x);
    maskHole.setAttribute("y",      y);
    maskHole.setAttribute("width",  w);
    maskHole.setAttribute("height", h);
  }

  // ─── Render step ──────────────────────────────────────────────
  function renderStep(idx) {
    const step   = STEPS[idx];
    const target = document.getElementById(step.target);
    if (!target) return;

    // Scroll target into view
    target.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Small delay to let scroll settle, then position
    requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect();

      // Update SVG hole
      updateHole(rect);

      // Update tooltip content
      stepLabel.textContent = `Step ${idx + 1} of ${STEPS.length}`;
      titleEl.textContent   = step.title;
      bodyEl.textContent    = step.body;

      // Dots
      buildDots();

      // Nav buttons
      prevBtn.disabled = idx === 0;
      nextBtn.textContent = idx === STEPS.length - 1 ? "Done" : "Next";

      // Position tooltip
      positionTooltip(rect, step.placement);
    });
  }

  // ─── Start tour ───────────────────────────────────────────────
  function startTour() {
    active      = true;
    currentStep = 0;

    tourStart.style.display = "none";
    overlay.classList.add("is-active");
    tooltip.classList.add("is-active");

    renderStep(currentStep);

    // Focus tooltip for screen readers
    setTimeout(() => tooltip.focus(), 350);
  }

  // ─── End tour ─────────────────────────────────────────────────
  function endTour() {
    active = false;

    overlay.classList.remove("is-active");
    tooltip.classList.remove("is-active");

    // Reset hole size (animate out)
    maskHole.setAttribute("width",  0);
    maskHole.setAttribute("height", 0);

    setTimeout(() => {
      tourStart.style.display = "";
      startBtn.focus();
    }, 300);
  }

  // ─── Navigate ─────────────────────────────────────────────────
  function goNext() {
    if (currentStep >= STEPS.length - 1) { endTour(); return; }
    currentStep++;
    renderStep(currentStep);
  }

  function goPrev() {
    if (currentStep <= 0) return;
    currentStep--;
    renderStep(currentStep);
  }

  // ─── Events ───────────────────────────────────────────────────
  startBtn.addEventListener("click", startTour);
  nextBtn.addEventListener("click",  goNext);
  prevBtn.addEventListener("click",  goPrev);
  skipBtn.addEventListener("click",  endTour);

  // Click on overlay (outside tooltip) also skips
  overlay.addEventListener("click", endTour);

  // Prevent overlay click from firing when clicking inside tooltip
  tooltip.addEventListener("click", (e) => e.stopPropagation());

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (!active) return;
    if (e.key === "Escape")     { endTour(); }
    if (e.key === "ArrowRight") { goNext(); }
    if (e.key === "ArrowLeft")  { goPrev(); }
  });

  // Reposition on resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (active) renderStep(currentStep); }, 100);
  });

  // Allow tooltip to be focusable
  tooltip.setAttribute("tabindex", "-1");
})();
