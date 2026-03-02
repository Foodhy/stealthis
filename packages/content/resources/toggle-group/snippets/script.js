(function () {
  "use strict";

  /**
   * Initialize a toggle group.
   * @param {HTMLElement} group
   */
  function initToggleGroup(group) {
    const mode    = group.dataset.mode || "single"; // "single" | "multi"
    const buttons = Array.from(group.querySelectorAll("[role='button']"));

    // ── Click handling ──────────────────────────────────────────
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => activate(btn));
    });

    // ── Keyboard navigation (roving tabindex) ───────────────────
    group.addEventListener("keydown", (e) => {
      const focused = document.activeElement;
      const idx     = buttons.indexOf(focused);
      if (idx === -1) return;

      let nextIdx = idx;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          nextIdx = (idx + 1) % buttons.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          nextIdx = (idx - 1 + buttons.length) % buttons.length;
          break;
        case "Home":
          e.preventDefault();
          nextIdx = 0;
          break;
        case "End":
          e.preventDefault();
          nextIdx = buttons.length - 1;
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          activate(focused);
          return;
        default:
          return;
      }

      moveFocus(nextIdx);
    });

    /** Move roving tabindex focus */
    function moveFocus(idx) {
      buttons.forEach((b, i) => b.setAttribute("tabindex", i === idx ? "0" : "-1"));
      buttons[idx].focus();
    }

    /** Activate a button */
    function activate(btn) {
      if (mode === "single") {
        buttons.forEach((b) => {
          const isThis = b === btn;
          b.setAttribute("aria-pressed", isThis ? "true" : "false");
          b.setAttribute("tabindex", isThis ? "0" : "-1");
        });
      } else {
        // multi: toggle independently
        const pressed = btn.getAttribute("aria-pressed") === "true";
        btn.setAttribute("aria-pressed", pressed ? "false" : "true");
      }

      // Trigger side-effects
      onGroupChange(group);
    }
  }

  // ── Side-effects: update preview / filter display ────────────
  function onGroupChange(group) {
    // Formatting toolbar → update text preview
    if (group.getAttribute("aria-label") === "Text formatting") {
      updateTextPreview();
    }

    // Filter chips → update active list
    if (group.getAttribute("aria-label") === "Filter by category") {
      updateFilterDisplay(group);
    }
  }

  function updateTextPreview() {
    const toolbar = document.querySelector('[aria-label="Text formatting"]');
    if (!toolbar) return;

    const btns    = toolbar.querySelectorAll("[role='button']");
    const preview = document.getElementById("preview-text");
    if (!preview) return;

    // Single-select: only one can be active
    const activeLabel = [...btns].find(
      (b) => b.getAttribute("aria-pressed") === "true"
    )?.getAttribute("aria-label") || "";

    // Remove all format classes
    preview.classList.remove("is-bold", "is-italic", "is-underline", "is-strikethrough");

    switch (activeLabel) {
      case "Bold":          preview.classList.add("is-bold");          break;
      case "Italic":        preview.classList.add("is-italic");        break;
      case "Underline":     preview.classList.add("is-underline");     break;
      case "Strikethrough": preview.classList.add("is-strikethrough"); break;
    }
  }

  function updateFilterDisplay(group) {
    const active = [...group.querySelectorAll("[aria-pressed='true']")]
      .map((b) => b.textContent.trim())
      .join(", ");

    const display = document.getElementById("active-filters");
    if (display) {
      display.textContent = active || "None";
    }
  }

  // ── Bootstrap all groups ─────────────────────────────────────
  document.querySelectorAll(".toggle-group").forEach(initToggleGroup);

  // Run initial side-effects to reflect default state
  document.querySelectorAll(".toggle-group").forEach(onGroupChange);
})();
