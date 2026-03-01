(function () {
  "use strict";

  const area    = document.getElementById("demo-area");
  const menu    = document.getElementById("context-menu");
  let isOpen    = false;
  let focusIdx  = -1;

  // ── Show ────────────────────────────────────────────────────────────────────

  function show(x, y) {
    menu.style.display = "block";
    isOpen = true;
    focusIdx = -1;

    // Clamp to viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    menu.style.left = "0";
    menu.style.top  = "0";
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    menu.style.left = Math.min(x, vw - mw - 8) + "px";
    menu.style.top  = Math.min(y, vh - mh - 8) + "px";

    // Update aria-expanded on sub-menu triggers
    getItems().forEach(function (el) {
      if (el.classList.contains("menu-item--sub")) {
        el.setAttribute("aria-expanded", "false");
      }
    });
  }

  function hide() {
    menu.style.display = "none";
    isOpen = false;
    focusIdx = -1;
    clearSubMenus();
  }

  function clearSubMenus() {
    menu.querySelectorAll(".menu-item--sub").forEach(function (el) {
      el.classList.remove("sub-open");
      el.setAttribute("aria-expanded", "false");
    });
  }

  // ── Events ──────────────────────────────────────────────────────────────────

  area.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    show(e.clientX, e.clientY);
  });

  // Long-press for mobile
  let longPressTimer = null;
  area.addEventListener("touchstart", function (e) {
    const t = e.touches[0];
    longPressTimer = setTimeout(function () {
      show(t.clientX, t.clientY);
    }, 500);
  }, { passive: true });
  area.addEventListener("touchend", function () { clearTimeout(longPressTimer); }, { passive: true });
  area.addEventListener("touchmove", function () { clearTimeout(longPressTimer); }, { passive: true });

  document.addEventListener("click", function (e) {
    if (!menu.contains(e.target)) hide();
  });

  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        hide();
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(-1);
        break;
      case "ArrowRight": {
        e.preventDefault();
        const focused = getFocusedItem();
        if (focused && focused.classList.contains("menu-item--sub")) {
          focused.classList.add("sub-open");
          focused.setAttribute("aria-expanded", "true");
          const sub = focused.querySelector(".submenu");
          if (sub) {
            const first = sub.querySelector(".menu-item");
            if (first) first.focus();
          }
        }
        break;
      }
      case "ArrowLeft":
        e.preventDefault();
        clearSubMenus();
        break;
      case "Enter":
      case " ": {
        e.preventDefault();
        const focused = getFocusedItem();
        if (focused) focused.click();
        break;
      }
    }
  });

  // ── Item actions ────────────────────────────────────────────────────────────

  menu.querySelectorAll(".menu-item[data-action]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const action = btn.dataset.action;
      const labels = {
        cut: "Cut",
        copy: "Copy",
        "copy-link": "Link copied!",
        email: "Opening email client…",
        twitter: "Opening Twitter…",
        delete: "Deleted!",
      };
      console.log("Action:", action);
      const label = labels[action] || action;
      showFeedback(label);
      hide();
    });
  });

  // Sub-menu open/close on hover
  menu.querySelectorAll(".menu-item--sub").forEach(function (el) {
    el.addEventListener("mouseenter", function () {
      clearSubMenus();
      el.classList.add("sub-open");
      el.setAttribute("aria-expanded", "true");
    });
  });

  // ── Keyboard focus helpers ───────────────────────────────────────────────────

  function getItems() {
    return Array.from(menu.querySelectorAll(".menu-item:not(.menu-item--disabled)"));
  }

  function getFocusedItem() {
    return menu.querySelector(".menu-item:focus, .menu-item.focused");
  }

  function moveFocus(dir) {
    const items = getItems();
    if (!items.length) return;
    focusIdx = (focusIdx + dir + items.length) % items.length;
    items[focusIdx].focus();
  }

  // ── Feedback toast ───────────────────────────────────────────────────────────

  function showFeedback(msg) {
    const el = document.createElement("div");
    Object.assign(el.style, {
      position: "fixed",
      bottom: "1.5rem",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#0d1117",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#f2f6ff",
      padding: "0.5rem 1.25rem",
      borderRadius: "999px",
      fontSize: "0.85rem",
      zIndex: "99999",
      animation: "menu-in 0.15s ease",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    });
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2000);
  }
})();
