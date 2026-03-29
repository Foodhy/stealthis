// Lens Effect — magnifying glass that follows cursor
(function () {
  "use strict";

  const area = document.getElementById("lens-area");
  const lens = document.getElementById("lens");
  if (!area || !lens) return;

  const ZOOM = 2.5;
  const LENS_SIZE = 160;
  const LERP_FACTOR = 0.15;

  let mouseX = 0;
  let mouseY = 0;
  let lensX = 0;
  let lensY = 0;
  let isActive = false;
  let animId = null;

  // Capture the content area for the lens background
  function updateLensBackground() {
    const content = area.querySelector(".lens-content");
    if (!content) return;

    // Use the area's own rendering as the lens source via element cloning
    const clone = content.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.width = area.clientWidth + "px";
    clone.style.height = area.clientHeight + "px";
    clone.style.transform = `scale(${ZOOM})`;
    clone.style.transformOrigin = "0 0";
    clone.style.pointerEvents = "none";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.id = "";

    // Clear old clone
    const existing = lens.querySelector(".lens-clone");
    if (existing) existing.remove();

    clone.classList.add("lens-clone");
    lens.appendChild(clone);
  }

  updateLensBackground();

  function updateLensPosition() {
    const rect = area.getBoundingClientRect();
    const relX = mouseX - rect.left;
    const relY = mouseY - rect.top;

    // Lerp for smooth following
    lensX += (relX - lensX) * LERP_FACTOR;
    lensY += (relY - lensY) * LERP_FACTOR;

    lens.style.left = lensX + "px";
    lens.style.top = lensY + "px";

    // Move the cloned content inside the lens
    const clone = lens.querySelector(".lens-clone");
    if (clone) {
      const offsetX = -(lensX * ZOOM - LENS_SIZE / 2);
      const offsetY = -(lensY * ZOOM - LENS_SIZE / 2);
      clone.style.transform = `scale(${ZOOM})`;
      clone.style.left = offsetX + "px";
      clone.style.top = offsetY + "px";
    }

    if (isActive) {
      animId = requestAnimationFrame(updateLensPosition);
    }
  }

  area.addEventListener("mouseenter", () => {
    isActive = true;
    lens.classList.add("active");
    updateLensBackground();
    animId = requestAnimationFrame(updateLensPosition);
  });

  area.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  area.addEventListener("mouseleave", () => {
    isActive = false;
    lens.classList.remove("active");
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  });

  // Update on resize
  window.addEventListener("resize", () => {
    updateLensBackground();
  });
})();
