(function () {
  "use strict";

  const MIN = 80; // px minimum per panel

  // ── Init all resize handles ──────────────────────────────────────────────────

  document.querySelectorAll(".panels").forEach(function (container) {
    const dir = container.dataset.direction || "horizontal";
    const handles = Array.from(container.querySelectorAll(".resize-handle"));

    handles.forEach(function (handle) {
      initHandle(handle, container, dir);
    });
  });

  // ── Per-handle setup ─────────────────────────────────────────────────────────

  function initHandle(handle, container, dir) {
    const isH = dir === "horizontal";

    // Find the panels on each side of this handle
    function getPanels() {
      const children = Array.from(container.children).filter(function (c) {
        return !c.classList.contains("resize-handle");
      });
      const handles = Array.from(container.querySelectorAll(".resize-handle"));
      const hIdx   = handles.indexOf(handle);
      return { before: children[hIdx], after: children[hIdx + 1] };
    }

    let startPos = 0;
    let startBefore = 0;
    let startAfter  = 0;
    let collapsed   = false;
    let savedBefore = 0;
    let dragging    = false;

    // ── Drag ──────────────────────────────────────────────────────────────────

    function onDown(e) {
      e.preventDefault();
      dragging = true;
      handle.classList.add("dragging");

      const { before, after } = getPanels();
      startPos    = isH ? getClientX(e) : getClientY(e);
      startBefore = isH ? before.offsetWidth  : before.offsetHeight;
      startAfter  = isH ? after.offsetWidth   : after.offsetHeight;

      document.addEventListener("mousemove", onMove);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("mouseup",   onUp);
      document.addEventListener("touchend",  onUp);
    }

    function onMove(e) {
      if (!dragging) return;
      e.preventDefault();

      const { before, after } = getPanels();
      const pos   = isH ? getClientX(e) : getClientY(e);
      const delta = pos - startPos;
      const total = startBefore + startAfter;

      let newBefore = Math.max(MIN, Math.min(total - MIN, startBefore + delta));
      let newAfter  = total - newBefore;

      if (isH) {
        before.style.flexBasis = newBefore + "px";
        before.style.flex      = "0 0 " + newBefore + "px";
        after.style.flex       = "1";
      } else {
        before.style.flexBasis = newBefore + "px";
        before.style.flex      = "0 0 " + newBefore + "px";
        after.style.flex       = "1";
      }

      // Update ARIA
      handle.setAttribute("aria-valuenow", Math.round(newBefore));
    }

    function onUp() {
      dragging = false;
      handle.classList.remove("dragging");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("mouseup",   onUp);
      document.removeEventListener("touchend",  onUp);
    }

    handle.addEventListener("mousedown",  onDown);
    handle.addEventListener("touchstart", onDown, { passive: false });

    // ── Double-click to collapse/restore ──────────────────────────────────────

    handle.addEventListener("dblclick", function () {
      const { before, after } = getPanels();
      if (collapsed) {
        // Restore
        before.style.flex = "0 0 " + savedBefore + "px";
        after.style.flex  = "1";
        collapsed = false;
      } else {
        // Collapse
        savedBefore = isH ? before.offsetWidth : before.offsetHeight;
        before.style.flex = "0 0 0px";
        after.style.flex  = "1";
        collapsed = true;
      }
    });

    // ── Keyboard resize ───────────────────────────────────────────────────────

    handle.addEventListener("keydown", function (e) {
      const { before, after } = getPanels();
      const step = 20;
      const current = isH ? before.offsetWidth : before.offsetHeight;
      let next = current;

      if (isH) {
        if (e.key === "ArrowLeft")  next = Math.max(MIN, current - step);
        if (e.key === "ArrowRight") next = Math.min(before.offsetWidth + after.offsetWidth - MIN, current + step);
      } else {
        if (e.key === "ArrowUp")   next = Math.max(MIN, current - step);
        if (e.key === "ArrowDown") next = Math.min(before.offsetHeight + after.offsetHeight - MIN, current + step);
      }

      if (next !== current) {
        e.preventDefault();
        before.style.flex = "0 0 " + next + "px";
        after.style.flex  = "1";
        handle.setAttribute("aria-valuenow", next);
      }
    });
  }

  // ── Pointer helpers ──────────────────────────────────────────────────────────

  function getClientX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
  function getClientY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }
})();
