(() => {
  const groups = document.querySelectorAll("[data-roving-group]");
  const tabindexDisplay = document.getElementById("tabindexDisplay");
  const colorSelected = document.getElementById("colorSelected");

  /* ── Roving Tabindex Core ───────────────────────── */

  function getItems(group) {
    // For grid, get all gridcells; for toolbar, get buttons; for radiogroup, get radios
    if (group.hasAttribute("data-grid")) {
      return [...group.querySelectorAll('[role="gridcell"]')];
    }
    if (group.getAttribute("role") === "radiogroup") {
      return [...group.querySelectorAll('[role="radio"]')];
    }
    // Toolbar: skip separators
    return [...group.querySelectorAll('button:not([role="separator"])')];
  }

  function setRovingFocus(group, targetItem) {
    const items = getItems(group);
    items.forEach((item) => item.setAttribute("tabindex", "-1"));
    targetItem.setAttribute("tabindex", "0");
    targetItem.focus();
    updateDisplay();
  }

  function getCurrentIndex(group) {
    const items = getItems(group);
    return items.findIndex((item) => item.getAttribute("tabindex") === "0");
  }

  /* ── Toolbar navigation (horizontal) ────────────── */

  function handleLinearNav(group, e) {
    const items = getItems(group);
    const current = getCurrentIndex(group);
    let next;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        next = (current + 1) % items.length;
        setRovingFocus(group, items[next]);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        next = (current - 1 + items.length) % items.length;
        setRovingFocus(group, items[next]);
        break;
      case "Home":
        e.preventDefault();
        setRovingFocus(group, items[0]);
        break;
      case "End":
        e.preventDefault();
        setRovingFocus(group, items[items.length - 1]);
        break;
    }
  }

  /* ── Grid navigation (2D) ───────────────────────── */

  function handleGridNav(group, e) {
    const items = getItems(group);
    const cols = parseInt(group.dataset.cols) || 5;
    const current = getCurrentIndex(group);
    const row = Math.floor(current / cols);
    const col = current % cols;
    let next;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        next = col + 1 < cols && current + 1 < items.length ? current + 1 : row * cols;
        setRovingFocus(group, items[next]);
        break;
      case "ArrowLeft":
        e.preventDefault();
        next = col - 1 >= 0 ? current - 1 : Math.min(row * cols + cols - 1, items.length - 1);
        setRovingFocus(group, items[next]);
        break;
      case "ArrowDown": {
        e.preventDefault();
        const nextRow = current + cols;
        next = nextRow < items.length ? nextRow : col;
        setRovingFocus(group, items[next]);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevRow = current - cols;
        const totalRows = Math.ceil(items.length / cols);
        next = prevRow >= 0 ? prevRow : Math.min((totalRows - 1) * cols + col, items.length - 1);
        setRovingFocus(group, items[next]);
        break;
      }
      case "Home":
        e.preventDefault();
        setRovingFocus(group, items[0]);
        break;
      case "End":
        e.preventDefault();
        setRovingFocus(group, items[items.length - 1]);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        selectColor(items[current]);
        break;
    }
  }

  /* ── Radio group selection ──────────────────────── */

  function handleRadioNav(group, e) {
    const items = getItems(group);
    const current = getCurrentIndex(group);
    let next;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        next = (current + 1) % items.length;
        selectRadio(group, items[next]);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        next = (current - 1 + items.length) % items.length;
        selectRadio(group, items[next]);
        break;
      case "Home":
        e.preventDefault();
        selectRadio(group, items[0]);
        break;
      case "End":
        e.preventDefault();
        selectRadio(group, items[items.length - 1]);
        break;
    }
  }

  function selectRadio(group, item) {
    getItems(group).forEach((el) => el.setAttribute("aria-checked", "false"));
    item.setAttribute("aria-checked", "true");
    setRovingFocus(group, item);
  }

  /* ── Color swatch selection ─────────────────────── */

  function selectColor(swatch) {
    document
      .querySelectorAll(".color-swatch")
      .forEach((s) => s.setAttribute("aria-selected", "false"));
    swatch.setAttribute("aria-selected", "true");
    const color = swatch.dataset.color;
    const name = swatch.getAttribute("aria-label");
    colorSelected.innerHTML = `Selected: <span style="color: ${color}; font-weight: 600;">${name} (${color})</span>`;
  }

  /* ── Toolbar button toggle ──────────────────────── */

  function handleToolbarAction(button) {
    const pressed = button.getAttribute("aria-pressed");
    if (pressed !== null) {
      button.setAttribute("aria-pressed", pressed === "true" ? "false" : "true");
    }
  }

  /* ── Bind events ────────────────────────────────── */

  groups.forEach((group) => {
    const isGrid = group.hasAttribute("data-grid");
    const isRadio = group.getAttribute("role") === "radiogroup";

    group.addEventListener("keydown", (e) => {
      if (isGrid) {
        handleGridNav(group, e);
      } else if (isRadio) {
        handleRadioNav(group, e);
      } else {
        handleLinearNav(group, e);
        // Toggle on Enter/Space for toolbar
        if ((e.key === "Enter" || e.key === " ") && !isGrid && !isRadio) {
          e.preventDefault();
          const items = getItems(group);
          const current = getCurrentIndex(group);
          if (current >= 0) handleToolbarAction(items[current]);
        }
      }
    });

    // Click handlers
    getItems(group).forEach((item) => {
      item.addEventListener("click", () => {
        setRovingFocus(group, item);
        if (isRadio) {
          selectRadio(group, item);
        } else if (isGrid) {
          selectColor(item);
        } else {
          handleToolbarAction(item);
        }
      });
    });

    // Radio items also select on click
    if (isRadio) {
      getItems(group).forEach((item) => {
        item.addEventListener("click", () => selectRadio(group, item));
      });
    }
  });

  /* ── Tabindex Display ───────────────────────────── */

  function updateDisplay() {
    if (!tabindexDisplay) return;

    let html = "";
    const labels = ["Toolbar", "Radio Group", "Color Grid"];

    groups.forEach((group, gi) => {
      const items = getItems(group);
      html += `<span class="group-label">${labels[gi]}:</span> `;
      html += items
        .map((item) => {
          const val = item.getAttribute("tabindex");
          const cls = val === "0" ? "active-tab" : "inactive-tab";
          const label =
            item.getAttribute("aria-label") || item.textContent.trim() || item.dataset.color || "?";
          const short = label.length > 8 ? label.slice(0, 8) : label;
          return `<span class="${cls}">[${val}] ${short}</span>`;
        })
        .join("  ");
      html += "\n";
    });

    tabindexDisplay.innerHTML = html;
  }

  // Update display on any focus change
  document.addEventListener("focusin", () => {
    requestAnimationFrame(updateDisplay);
  });

  // Initial display
  updateDisplay();
})();
