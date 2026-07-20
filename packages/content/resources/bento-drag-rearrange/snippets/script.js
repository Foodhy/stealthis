/**
 * Draggable Bento Rearrange
 * - Native HTML5 drag & drop reordering inside a CSS Grid.
 * - Order lives in a JS array (the "state"); the DOM is re-synced from it.
 * - Full keyboard fallback: Space to lift, arrows to move, Space to drop, Esc to cancel.
 */
(function () {
  const grid = document.getElementById("grid");
  const status = document.getElementById("status");
  if (!grid) return;

  /** @type {string[]} source of truth */
  let order = [...grid.querySelectorAll(".tile")].map((t) => t.dataset.id);
  let orderBeforeLift = null;

  const tileById = (id) => grid.querySelector(`.tile[data-id="${id}"]`);

  function render() {
    // Reorder DOM to match state without destroying nodes (keeps focus alive).
    order.forEach((id) => grid.appendChild(tileById(id)));
    status.textContent = "Order: " + order.join(", ");
  }

  function move(id, toIndex) {
    const from = order.indexOf(id);
    if (from === -1) return;
    const to = Math.max(0, Math.min(order.length - 1, toIndex));
    if (to === from) return;
    order.splice(from, 1);
    order.splice(to, 0, id);
    render();
  }

  /* ---------- pointer drag ---------- */
  let draggingId = null;

  grid.addEventListener("dragstart", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile) return;
    draggingId = tile.dataset.id;
    e.dataTransfer.effectAllowed = "move";
    // Some browsers need payload for the drag to start.
    e.dataTransfer.setData("text/plain", draggingId);
    requestAnimationFrame(() => tile.classList.add("is-dragging"));
  });

  grid.addEventListener("dragover", (e) => {
    if (!draggingId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const over = e.target.closest(".tile");
    if (!over || over.dataset.id === draggingId) return;

    grid.querySelectorAll(".is-over").forEach((n) => n.classList.remove("is-over"));
    over.classList.add("is-over");

    // Swap toward the hovered tile, biased by which half of it the cursor is in.
    const rect = over.getBoundingClientRect();
    const after = e.clientX > rect.left + rect.width / 2;
    const overIndex = order.indexOf(over.dataset.id);
    const fromIndex = order.indexOf(draggingId);
    let target = overIndex;
    if (after && fromIndex > overIndex) target = overIndex + 1;
    if (!after && fromIndex < overIndex) target = overIndex - 1;
    move(draggingId, target);
  });

  grid.addEventListener("dragleave", (e) => {
    const over = e.target.closest && e.target.closest(".tile");
    if (over) over.classList.remove("is-over");
  });

  grid.addEventListener("drop", (e) => e.preventDefault());

  grid.addEventListener("dragend", () => {
    grid.querySelectorAll(".is-over, .is-dragging").forEach((n) =>
      n.classList.remove("is-over", "is-dragging")
    );
    draggingId = null;
  });

  /* ---------- keyboard fallback ---------- */
  let liftedId = null;

  function setLift(id) {
    grid.querySelectorAll(".tile").forEach((t) => {
      const on = t.dataset.id === id;
      t.classList.toggle("is-lifted", on);
      t.setAttribute("aria-selected", String(on));
    });
    liftedId = id;
  }

  grid.addEventListener("keydown", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile) return;
    const id = tile.dataset.id;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (liftedId === id) {
        setLift(null);
        status.textContent = "Dropped " + id + ". Order: " + order.join(", ");
      } else {
        orderBeforeLift = [...order];
        setLift(id);
        status.textContent = "Picked up " + id + ". Use arrow keys to move.";
      }
      return;
    }

    if (e.key === "Escape" && liftedId) {
      e.preventDefault();
      order = orderBeforeLift;
      render();
      setLift(null);
      tile.focus();
      status.textContent = "Cancelled. Order: " + order.join(", ");
      return;
    }

    if (liftedId !== id) return;

    const step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    move(id, order.indexOf(id) + step);
    tile.focus();
  });

  render();
})();
