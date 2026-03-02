(function () {
  "use strict";

  const slider = document.querySelector(".diff-slider");
  const handle = slider && slider.querySelector(".diff-handle");
  if (!slider || !handle) return;

  let isDragging = false;
  let split = 50; // percentage

  function setSplit(pct) {
    split = Math.max(2, Math.min(98, pct));
    slider.style.setProperty("--split", split + "%");
    handle.setAttribute("aria-valuenow", Math.round(split));
  }

  function getPercent(clientX) {
    const rect = slider.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  // Mouse events
  handle.addEventListener("mousedown", function (e) {
    e.preventDefault();
    isDragging = true;
    slider.classList.add("dragging");
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;
    setSplit(getPercent(e.clientX));
  });

  document.addEventListener("mouseup", function () {
    if (!isDragging) return;
    isDragging = false;
    slider.classList.remove("dragging");
  });

  // Touch events
  handle.addEventListener("touchstart", function (e) {
    e.preventDefault();
    isDragging = true;
    slider.classList.add("dragging");
  }, { passive: false });

  document.addEventListener("touchmove", function (e) {
    if (!isDragging) return;
    setSplit(getPercent(e.touches[0].clientX));
  }, { passive: true });

  document.addEventListener("touchend", function () {
    if (!isDragging) return;
    isDragging = false;
    slider.classList.remove("dragging");
  });

  // Keyboard support
  handle.addEventListener("keydown", function (e) {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft")  { e.preventDefault(); setSplit(split - step); }
    if (e.key === "ArrowRight") { e.preventDefault(); setSplit(split + step); }
    if (e.key === "Home")       { e.preventDefault(); setSplit(2); }
    if (e.key === "End")        { e.preventDefault(); setSplit(98); }
  });

  // Click on slider background to jump
  slider.addEventListener("click", function (e) {
    if (e.target === handle) return;
    setSplit(getPercent(e.clientX));
  });

  // Initialize
  setSplit(50);
})();
