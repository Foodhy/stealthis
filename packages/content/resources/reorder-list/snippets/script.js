(function () {
  "use strict";

  const list = document.getElementById("reorder-list");
  let draggedItem = null;
  let clone = null;
  let startY = 0;

  // ── Capture rects for FLIP ──
  function captureRects() {
    const rects = {};
    list.querySelectorAll(".reorder-item").forEach((el) => {
      rects[el.dataset.id] = el.getBoundingClientRect();
    });
    return rects;
  }

  // ── FLIP animate all items ──
  function flipAnimate(firstRects) {
    list.querySelectorAll(".reorder-item").forEach((el) => {
      const id = el.dataset.id;
      const first = firstRects[id];
      if (!first) return;
      const last = el.getBoundingClientRect();
      const dy = first.top - last.top;
      if (dy === 0) return;

      el.style.transform = `translateY(${dy}px)`;
      el.style.transition = "none";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transform = "";
          el.style.transition = "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)";
          el.addEventListener("transitionend", () => {
            el.style.transition = "";
            el.style.transform = "";
          }, { once: true });
        });
      });
    });
  }

  // ── Update index numbers ──
  function updateIndices() {
    list.querySelectorAll(".reorder-item").forEach((el, i) => {
      const idx = el.querySelector(".reorder-index");
      if (idx) idx.textContent = String(i + 1);
    });
  }

  // ── Pointer down on handle ──
  list.addEventListener("pointerdown", (e) => {
    const handle = e.target.closest(".reorder-handle");
    if (!handle) return;

    const item = handle.closest(".reorder-item");
    if (!item) return;

    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    draggedItem = item;
    startY = e.clientY;

    // Create floating clone
    const rect = item.getBoundingClientRect();
    clone = item.cloneNode(true);
    clone.className = "reorder-item reorder-clone";
    clone.style.width = rect.width + "px";
    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.background = "rgba(255,255,255,0.06)";
    document.body.appendChild(clone);

    // Mark original as placeholder
    item.classList.add("placeholder");
  });

  // ── Pointer move ──
  window.addEventListener("pointermove", (e) => {
    if (!draggedItem || !clone) return;

    const dy = e.clientY - startY;
    clone.style.transform = `translateY(${dy}px) scale(1.03)`;

    // Determine swap target
    const items = Array.from(list.querySelectorAll(".reorder-item"));
    const dragIndex = items.indexOf(draggedItem);

    for (let i = 0; i < items.length; i++) {
      if (i === dragIndex) continue;
      const rect = items[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      if (i < dragIndex && e.clientY < midY) {
        // Move up
        const firstRects = captureRects();
        list.insertBefore(draggedItem, items[i]);
        updateIndices();
        flipAnimate(firstRects);
        break;
      } else if (i > dragIndex && e.clientY > midY) {
        // Move down
        const firstRects = captureRects();
        list.insertBefore(draggedItem, items[i].nextSibling);
        updateIndices();
        flipAnimate(firstRects);
        break;
      }
    }
  });

  // ── Pointer up ──
  window.addEventListener("pointerup", () => {
    if (!draggedItem) return;

    draggedItem.classList.remove("placeholder");

    if (clone) {
      clone.remove();
      clone = null;
    }

    draggedItem = null;
    updateIndices();
  });
})();
