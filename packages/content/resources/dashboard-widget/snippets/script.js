(() => {
  const restoreBar = document.getElementById("restoreBar");
  const restoreMsg = document.getElementById("restoreMsg");
  const restoreBtn = document.getElementById("restoreBtn");

  const closedWidgets = new Map(); // id -> { element, placeholder }
  let hideRestoreTimer = null;

  function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function showRestoreBar(widgetTitle, widgetId) {
    clearTimeout(hideRestoreTimer);
    restoreMsg.textContent = `"${widgetTitle}" was closed`;
    restoreBar.classList.add("visible");

    restoreBtn.onclick = () => restoreWidget(widgetId);

    hideRestoreTimer = setTimeout(() => {
      restoreBar.classList.remove("visible");
    }, 6000);
  }

  function restoreWidget(widgetId) {
    const stored = closedWidgets.get(widgetId);
    if (!stored) return;

    const { element, placeholder } = stored;
    element.style.opacity = "0";
    element.style.transform = "scale(0.96)";
    placeholder.replaceWith(element);

    // trigger reflow then animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        element.style.opacity = "1";
        element.style.transform = "scale(1)";
        setTimeout(() => {
          element.style.transition = "";
          element.style.opacity = "";
          element.style.transform = "";
        }, 350);
      });
    });

    closedWidgets.delete(widgetId);
    restoreBar.classList.remove("visible");
  }

  // ── Event delegation on widget grid ──
  document.getElementById("widgetGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const widget = btn.closest(".widget");
    if (!widget) return;

    const action = btn.dataset.action;

    if (action === "minimize") {
      widget.classList.toggle("minimized");
      // Update tooltip
      btn.title = widget.classList.contains("minimized") ? "Maximize" : "Minimize";
      // Swap icon: minus <-> plus
      const svg = btn.querySelector("svg line");
      if (svg) {
        if (widget.classList.contains("minimized")) {
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
        } else {
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
        }
      }
    }

    if (action === "refresh") {
      if (btn.classList.contains("refreshing")) return;
      btn.classList.add("refreshing");

      setTimeout(() => {
        btn.classList.remove("refreshing");
        const ts = widget.querySelector(".widget-timestamp");
        if (ts) ts.textContent = `Updated at ${getTimestamp()}`;
      }, 1000);
    }

    if (action === "close") {
      const widgetId = widget.id;
      const widgetTitle = widget.dataset.title || "Widget";

      // Create invisible placeholder to preserve grid layout briefly
      const placeholder = document.createElement("div");
      placeholder.style.cssText = `width:${widget.offsetWidth}px; height:${widget.offsetHeight}px; visibility:hidden; pointer-events:none;`;
      widget.classList.add("closing");

      setTimeout(() => {
        widget.replaceWith(placeholder);
        closedWidgets.set(widgetId, { element: widget, placeholder });
        showRestoreBar(widgetTitle, widgetId);

        // Clean placeholder after animation
        setTimeout(() => {
          if (placeholder.parentNode) placeholder.remove();
        }, 400);
      }, 320);
    }
  });

  // Also handle task checkbox interactions to update progress
  document.querySelectorAll(".task-list").forEach((list) => {
    list.addEventListener("change", (e) => {
      if (!e.target.matches('input[type="checkbox"]')) return;
      const all = list.querySelectorAll('input[type="checkbox"]');
      const checked = list.querySelectorAll('input[type="checkbox"]:checked');
      const widget = list.closest(".widget");
      const fill = widget.querySelector(".task-progress-fill");
      const label = widget.querySelector(".task-progress-label");
      if (fill) fill.style.width = `${(checked.length / all.length) * 100}%`;
      if (label) label.textContent = `${checked.length} of ${all.length} complete`;
    });
  });
})();
