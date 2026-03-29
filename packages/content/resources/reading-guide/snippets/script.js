(() => {
  const guideToggle = document.getElementById("guide-toggle");
  const heightSlider = document.getElementById("guide-height");
  const heightValue = document.getElementById("guide-height-value");
  const modeBtns = document.querySelectorAll(".mode-btn");
  const colorSwatches = document.querySelectorAll(".color-swatch");

  const guideLine = document.getElementById("guide-line");
  const guideBand = document.getElementById("guide-band");
  const overlayTop = document.getElementById("guide-overlay-top");
  const overlayBottom = document.getElementById("guide-overlay-bottom");

  let enabled = false;
  let mode = "line";
  let guideHeight = 40;
  let guideColor = "#8b5cf6";

  function hideAllGuides() {
    guideLine.classList.remove("visible");
    guideBand.classList.remove("visible");
    overlayTop.classList.remove("visible");
    overlayBottom.classList.remove("visible");
  }

  function positionGuide(y) {
    if (!enabled) return;

    hideAllGuides();

    if (mode === "line") {
      guideLine.style.top = y + "px";
      guideLine.style.setProperty("--guide-color", guideColor);
      guideLine.classList.add("visible");
    } else if (mode === "band") {
      const top = y - guideHeight / 2;
      guideBand.style.top = top + "px";
      guideBand.style.height = guideHeight + "px";
      guideBand.style.setProperty("--guide-color", guideColor);
      guideBand.classList.add("visible");
    } else if (mode === "spotlight") {
      const halfH = guideHeight / 2;
      overlayTop.style.height = Math.max(0, y - halfH) + "px";
      overlayBottom.style.top = y + halfH + "px";
      overlayBottom.style.height = window.innerHeight - y - halfH + "px";
      overlayTop.classList.add("visible");
      overlayBottom.classList.add("visible");
    }
  }

  function setMode(newMode) {
    mode = newMode;
    modeBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === newMode);
    });
    hideAllGuides();
  }

  function setColor(color) {
    guideColor = color;
    colorSwatches.forEach((s) => {
      s.classList.toggle("active", s.dataset.color === color);
    });
  }

  // Event listeners
  guideToggle.addEventListener("change", () => {
    enabled = guideToggle.checked;
    if (!enabled) hideAllGuides();
  });

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  heightSlider.addEventListener("input", () => {
    guideHeight = parseInt(heightSlider.value, 10);
    heightValue.textContent = guideHeight + "px";
  });

  colorSwatches.forEach((swatch) => {
    swatch.addEventListener("click", () => setColor(swatch.dataset.color));
  });

  document.addEventListener("mousemove", (e) => {
    requestAnimationFrame(() => positionGuide(e.clientY));
  });

  // Touch support
  document.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      requestAnimationFrame(() => positionGuide(touch.clientY));
    },
    { passive: true }
  );

  // ── Mobile drawer ──
  const drawerToggle = document.getElementById("drawer-toggle");
  const drawerBackdrop = document.getElementById("drawer-backdrop");
  const controls = document.getElementById("controls");

  function openDrawer() {
    controls.classList.add("drawer-open");
    drawerBackdrop.classList.add("active");
    drawerToggle.classList.add("active");
  }

  function closeDrawer() {
    controls.classList.remove("drawer-open");
    drawerBackdrop.classList.remove("active");
    drawerToggle.classList.remove("active");
  }

  if (drawerToggle) {
    drawerToggle.addEventListener("click", () => {
      const isOpen = controls.classList.contains("drawer-open");
      if (isOpen) closeDrawer();
      else openDrawer();
    });
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener("click", closeDrawer);
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeDrawer();
  });
})();
