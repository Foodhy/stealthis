/* File Reorder Grid — Pointer Events drag reorder with FLIP animation.
   No dependencies. Touch + mouse + keyboard. */
(function () {
  const grid = document.querySelector("#file-grid");
  if (!grid) return;
  const orderOut = document.querySelector("#order-list");
  const live = document.querySelector("#live");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const items = () => [...grid.querySelectorAll(".item")];

  function renderOrder() {
    if (orderOut) orderOut.textContent = items().map((i) => i.dataset.name).join(" → ");
    // Persistence boundary: POST items().map(i => i.dataset.name) to your API here.
  }

  /* ---- FLIP: animate siblings from their old box to the new one ---- */
  function flip(mutate) {
    const first = new Map(items().map((el) => [el, el.getBoundingClientRect()]));
    mutate();
    if (reduced) return;
    for (const el of items()) {
      const a = first.get(el);
      if (!a || el.classList.contains("is-dragging")) continue;
      const b = el.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (!dx && !dy) continue;
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0,0)" }],
        { duration: 200, easing: "cubic-bezier(.2,.8,.3,1)" }
      );
    }
  }

  /* ---------------- pointer drag ---------------- */
  let drag = null;

  grid.addEventListener("pointerdown", (e) => {
    const item = e.target.closest(".item");
    if (!item || e.button !== 0 || drag) return;

    const rect = item.getBoundingClientRect();
    const slot = document.createElement("li");
    slot.className = "slot";
    slot.style.height = rect.height + "px";

    drag = {
      item,
      slot,
      id: e.pointerId,
      offX: e.clientX - rect.left,
      offY: e.clientY - rect.top,
      w: rect.width,
      h: rect.height,
      moved: false,
    };
    item.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  grid.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { item } = drag;

    if (!drag.moved) {
      drag.moved = true;
      item.after(drag.slot);
      item.classList.add("is-dragging");
      item.setAttribute("aria-selected", "true");
      Object.assign(item.style, {
        position: "fixed",
        width: drag.w + "px",
        height: drag.h + "px",
        left: "0",
        top: "0",
        margin: "0",
        pointerEvents: "none",
      });
    }

    item.style.transform =
      `translate(${e.clientX - drag.offX}px, ${e.clientY - drag.offY}px) scale(1.04)`;

    // Which tile is under the pointer? Move the placeholder slot there.
    const cx = e.clientX;
    const cy = e.clientY;
    for (const el of items()) {
      if (el === item) continue;
      const r = el.getBoundingClientRect();
      if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) continue;
      const target = cx < r.left + r.width / 2 ? el : el.nextSibling;
      if (target !== drag.slot) flip(() => grid.insertBefore(drag.slot, target));
      break;
    }
  });

  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const { item, slot, moved } = drag;
    drag = null;
    if (moved) {
      item.removeAttribute("style");
      item.classList.remove("is-dragging");
      item.setAttribute("aria-selected", "false");
      slot.replaceWith(item);
      renderOrder();
      announce(item);
    }
    item.focus({ preventScroll: true });
  }

  grid.addEventListener("pointerup", endDrag);
  grid.addEventListener("pointercancel", endDrag);

  /* ---------------- keyboard reorder ---------------- */
  grid.addEventListener("keydown", (e) => {
    const item = e.target.closest(".item");
    if (!item) return;
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();

    const list = items();
    const j = list.indexOf(item) + dir;
    if (j < 0 || j >= list.length) return;

    flip(() => (dir === 1 ? list[j].after(item) : list[j].before(item)));
    item.focus({ preventScroll: true });
    item.classList.remove("is-moved");
    void item.offsetWidth;
    item.classList.add("is-moved");
    renderOrder();
    announce(item);
  });

  function announce(item) {
    if (!live) return;
    const list = items();
    live.textContent =
      `${item.dataset.name} moved to position ${list.indexOf(item) + 1} of ${list.length}.`;
  }

  renderOrder();
})();
