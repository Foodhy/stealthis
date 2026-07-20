/* Sortable Drag List — native HTML5 drag & drop + full keyboard fallback. */
(() => {
  const list = document.querySelector("#sortable");
  const readout = document.querySelector("#order");
  if (!list) return;

  const items = () => Array.from(list.querySelectorAll(".item"));
  const labelOf = (el) => el.querySelector(".item__label").textContent.trim();

  let dragged = null;
  let grabbed = null; // keyboard-grabbed row

  function announce(action) {
    if (!readout) return;
    const names = items().map((el, i) => `${i + 1}. ${labelOf(el)}`);
    readout.textContent = (action ? action + " — " : "") + names.join("  ");
  }

  function flash(el) {
    el.classList.remove("is-moved");
    void el.offsetWidth; // restart animation
    el.classList.add("is-moved");
    el.addEventListener("animationend", () => el.classList.remove("is-moved"), { once: true });
  }

  function clearOver() {
    items().forEach((el) => el.classList.remove("is-over"));
  }

  /* ---------- pointer / HTML5 drag ---------- */

  list.addEventListener("dragstart", (e) => {
    const item = e.target.closest(".item");
    if (!item) return;
    dragged = item;
    item.classList.add("is-dragging");
    e.dataTransfer.effectAllowed = "move";
    // Firefox requires data to be set for the drag to begin.
    e.dataTransfer.setData("text/plain", labelOf(item));
  });

  list.addEventListener("dragover", (e) => {
    if (!dragged) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const target = e.target.closest(".item");
    if (!target || target === dragged) return;

    clearOver();
    target.classList.add("is-over");

    const box = target.getBoundingClientRect();
    const after = e.clientY > box.top + box.height / 2;
    list.insertBefore(dragged, after ? target.nextSibling : target);
  });

  list.addEventListener("dragleave", (e) => {
    const target = e.target.closest?.(".item");
    if (target) target.classList.remove("is-over");
  });

  list.addEventListener("drop", (e) => e.preventDefault());

  list.addEventListener("dragend", () => {
    if (!dragged) return;
    dragged.classList.remove("is-dragging");
    clearOver();
    flash(dragged);
    announce(`Moved ${labelOf(dragged)}`);
    dragged = null;
  });

  /* ---------- keyboard fallback ---------- */

  function setGrabbed(item, on) {
    item.classList.toggle("is-grabbed", on);
    item.setAttribute("aria-selected", String(on));
    item.setAttribute("aria-grabbed", String(on));
    grabbed = on ? item : null;
  }

  list.addEventListener("keydown", (e) => {
    const item = e.target.closest(".item");
    if (!item) return;
    const all = items();
    const i = all.indexOf(item);

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (grabbed === item) {
        setGrabbed(item, false);
        announce(`Dropped ${labelOf(item)} at position ${i + 1}`);
      } else {
        if (grabbed) setGrabbed(grabbed, false);
        setGrabbed(item, true);
        announce(`Grabbed ${labelOf(item)}`);
      }
      return;
    }

    if (e.key === "Escape" && grabbed === item) {
      e.preventDefault();
      setGrabbed(item, false);
      announce("Cancelled");
      return;
    }

    const dir = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
    if (!dir) return;
    e.preventDefault();

    if (grabbed === item) {
      const next = i + dir;
      if (next < 0 || next >= all.length) return;
      if (dir < 0) list.insertBefore(item, all[next]);
      else list.insertBefore(all[next], item);
      item.focus();
      announce(`${labelOf(item)} now at position ${next + 1}`);
    } else {
      const next = all[i + dir];
      if (next) next.focus();
    }
  });

  list.addEventListener("focusout", (e) => {
    if (grabbed && !list.contains(e.relatedTarget)) setGrabbed(grabbed, false);
  });

  announce("Current order");
})();
