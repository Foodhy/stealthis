(function () {
  "use strict";

  const backdrop = document.getElementById("backdrop");
  let activeDrawer = null;

  // ── Open / Close ────────────────────────────────────────────────────────────

  function openDrawer(side) {
    if (activeDrawer) closeDrawer(activeDrawer, false);
    const el = document.getElementById("drawer-" + side);
    if (!el) return;
    el.classList.add("open");
    backdrop.classList.add("active");
    activeDrawer = side;
    trapFocus(el);
    if (side === "bottom") initDragToDismiss(el);
  }

  function closeDrawer(side, clearActive) {
    const el = document.getElementById("drawer-" + side);
    if (!el) return;
    el.classList.remove("open");
    backdrop.classList.remove("active");
    if (clearActive !== false) activeDrawer = null;
    releaseFocus();
  }

  function closeActiveDrawer() {
    if (activeDrawer) closeDrawer(activeDrawer);
  }

  // Expose to inline onclick attributes
  window.openDrawer = openDrawer;
  window.closeDrawer = closeDrawer;

  // ── Escape key ──────────────────────────────────────────────────────────────

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeDrawer) closeActiveDrawer();
  });

  // ── Focus trap ──────────────────────────────────────────────────────────────

  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let prevFocused = null;

  function trapFocus(el) {
    prevFocused = document.activeElement;
    const focusable = Array.from(el.querySelectorAll(FOCUSABLE));
    if (focusable.length) focusable[0].focus();

    el._trapHandler = function (e) {
      if (e.key !== "Tab") return;
      const items = Array.from(el.querySelectorAll(FOCUSABLE));
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0];
      const last  = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", el._trapHandler);
  }

  function releaseFocus() {
    if (activeDrawer) {
      const el = document.getElementById("drawer-" + activeDrawer);
      if (el && el._trapHandler) document.removeEventListener("keydown", el._trapHandler);
    }
    if (prevFocused) prevFocused.focus();
    prevFocused = null;
  }

  // ── Drag-to-dismiss (bottom sheet) ─────────────────────────────────────────

  function initDragToDismiss(el) {
    const handle = el.querySelector(".drawer__handle-bar");
    if (!handle) return;

    let startY = 0;
    let currentY = 0;
    let dragging = false;
    const THRESHOLD = 0.4; // 40% of sheet height

    function onStart(e) {
      dragging = true;
      startY = getClientY(e);
      el.style.transition = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchend", onEnd);
    }

    function onMove(e) {
      if (!dragging) return;
      e.preventDefault();
      currentY = getClientY(e);
      const dy = Math.max(0, currentY - startY);
      el.style.transform = "translateY(" + dy + "px)";
    }

    function onEnd() {
      dragging = false;
      el.style.transition = "";
      const dy = Math.max(0, currentY - startY);
      if (dy > el.offsetHeight * THRESHOLD) {
        el.style.transform = "";
        closeDrawer("bottom");
      } else {
        el.style.transform = "";
      }
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchend", onEnd);
    }

    function getClientY(e) {
      return e.touches ? e.touches[0].clientY : e.clientY;
    }

    handle.addEventListener("mousedown", onStart);
    handle.addEventListener("touchstart", onStart, { passive: true });
  }
})();
