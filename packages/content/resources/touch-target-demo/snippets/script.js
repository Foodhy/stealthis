(() => {
  const gridToggle = document.getElementById("grid-toggle");
  const gridOverlay = document.getElementById("grid-overlay");
  const tooltip = document.getElementById("size-tooltip");
  const measurables = document.querySelectorAll(".target-measure");

  // Grid overlay toggle
  gridToggle.addEventListener("click", () => {
    const active = gridOverlay.classList.toggle("visible");
    gridToggle.setAttribute("aria-pressed", String(active));
  });

  // Show dimensions on hover/click
  let activeEl = null;

  function showTooltip(el, e) {
    const rect = el.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const passes = w >= 44 && h >= 44;

    tooltip.innerHTML = `<span class="${passes ? "pass" : "fail"}">${w} &times; ${h}px</span> ${passes ? " Pass" : " Fail"}`;
    tooltip.classList.add("visible");

    // Position tooltip near cursor
    const tx = e.clientX + 14;
    const ty = e.clientY - 10;
    tooltip.style.left = tx + "px";
    tooltip.style.top = ty + "px";

    // Ensure tooltip doesn't go off-screen
    requestAnimationFrame(() => {
      const tr = tooltip.getBoundingClientRect();
      if (tr.right > window.innerWidth) {
        tooltip.style.left = e.clientX - tr.width - 10 + "px";
      }
      if (tr.bottom > window.innerHeight) {
        tooltip.style.top = e.clientY - tr.height - 10 + "px";
      }
    });
  }

  function hideTooltip() {
    tooltip.classList.remove("visible");
    if (activeEl) {
      activeEl.classList.remove("measuring");
      activeEl = null;
    }
  }

  measurables.forEach((el) => {
    el.addEventListener("mouseenter", (e) => {
      if (activeEl) activeEl.classList.remove("measuring");
      activeEl = el;
      el.classList.add("measuring");
      showTooltip(el, e);
    });

    el.addEventListener("mousemove", (e) => {
      if (activeEl === el) {
        const tx = e.clientX + 14;
        const ty = e.clientY - 10;
        tooltip.style.left = tx + "px";
        tooltip.style.top = ty + "px";
      }
    });

    el.addEventListener("mouseleave", () => {
      hideTooltip();
    });

    // Also show on click for touch devices
    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (activeEl === el && tooltip.classList.contains("visible")) {
        hideTooltip();
      } else {
        if (activeEl) activeEl.classList.remove("measuring");
        activeEl = el;
        el.classList.add("measuring");
        showTooltip(el, e);
      }
    });
  });

  // Hide tooltip when clicking elsewhere
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".target-measure") && !e.target.closest(".grid-toggle")) {
      hideTooltip();
    }
  });
})();
