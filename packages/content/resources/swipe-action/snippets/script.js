const SNAP_THRESHOLD = 80; // px to snap open
let openItem = null;

document.querySelectorAll(".swipe-item").forEach((item) => {
  const content = item.querySelector(".item-content");
  const archiveBtn = item.querySelector(".action-btn.archive");
  const deleteBtn = item.querySelector(".action-btn.delete");
  const actionsWidth = 160; // two 80px buttons

  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let isOpen = false;

  function snapOpen() {
    isOpen = true;
    openItem = item;
    content.style.transform = `translateX(-${actionsWidth}px)`;
  }

  function snapClose() {
    isOpen = false;
    if (openItem === item) openItem = null;
    content.style.transform = "translateX(0)";
  }

  function closeOthers() {
    if (openItem && openItem !== item) {
      openItem.querySelector(".item-content").style.transform = "translateX(0)";
      openItem = null;
    }
  }

  // Touch events
  content.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      content.classList.add("dragging");
      closeOthers();
    },
    { passive: true }
  );

  content.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      const delta = e.touches[0].clientX - startX;
      currentX = isOpen ? delta - actionsWidth : delta;
      currentX = Math.min(0, Math.max(-actionsWidth, currentX));
      content.style.transform = `translateX(${currentX}px)`;
    },
    { passive: true }
  );

  content.addEventListener("touchend", () => {
    isDragging = false;
    content.classList.remove("dragging");
    const dragged = isOpen ? currentX + actionsWidth : currentX;
    if (dragged < -SNAP_THRESHOLD) {
      snapOpen();
    } else {
      snapClose();
    }
  });

  // Pointer events (mouse/stylus)
  content.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") return;
    startX = e.clientX;
    isDragging = true;
    content.setPointerCapture(e.pointerId);
    content.classList.add("dragging");
    closeOthers();
  });

  content.addEventListener("pointermove", (e) => {
    if (!isDragging || e.pointerType === "touch") return;
    const delta = e.clientX - startX;
    currentX = isOpen ? delta - actionsWidth : delta;
    currentX = Math.min(0, Math.max(-actionsWidth, currentX));
    content.style.transform = `translateX(${currentX}px)`;
  });

  content.addEventListener("pointerup", (e) => {
    if (e.pointerType === "touch") return;
    isDragging = false;
    content.classList.remove("dragging");
    const dragged = isOpen ? currentX + actionsWidth : currentX;
    if (dragged < -SNAP_THRESHOLD) {
      snapOpen();
    } else {
      snapClose();
    }
  });

  // Action buttons
  archiveBtn.addEventListener("click", () => {
    item.classList.add("removing");
    setTimeout(() => item.remove(), 300);
  });

  deleteBtn.addEventListener("click", () => {
    item.classList.add("removing");
    setTimeout(() => item.remove(), 300);
  });
});
