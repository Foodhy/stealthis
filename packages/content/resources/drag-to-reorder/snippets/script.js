(function () {
  "use strict";

  const list = document.getElementById("drag-list");
  let dragged = null;

  // Delegate drag events from the list
  list.addEventListener("dragstart", (e) => {
    const item = e.target.closest(".drag-item");
    if (!item) return;
    dragged = item;
    item.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.dataset.id);
  });

  list.addEventListener("dragend", () => {
    if (!dragged) return;
    dragged.classList.remove("dragging");
    clearDropHints();
    dragged = null;
  });

  list.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const item = e.target.closest(".drag-item");
    if (!item || item === dragged) return;

    clearDropHints();

    const rect = item.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    if (e.clientY < midY) {
      item.classList.add("drop-above");
    } else {
      item.classList.add("drop-below");
    }
  });

  list.addEventListener("dragleave", (e) => {
    // Only clear if we've actually left the list
    if (!list.contains(e.relatedTarget)) clearDropHints();
  });

  list.addEventListener("drop", (e) => {
    e.preventDefault();
    const item = e.target.closest(".drag-item");
    if (!item || item === dragged) { clearDropHints(); return; }

    const rect = item.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    if (e.clientY < midY) {
      list.insertBefore(dragged, item);
    } else {
      list.insertBefore(dragged, item.nextSibling);
    }

    clearDropHints();
  });

  function clearDropHints() {
    list.querySelectorAll(".drop-above, .drop-below").forEach((el) => {
      el.classList.remove("drop-above", "drop-below");
    });
  }
})();
