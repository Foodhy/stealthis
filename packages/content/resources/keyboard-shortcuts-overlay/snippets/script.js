(() => {
  const backdrop = document.getElementById("overlayBackdrop");
  const overlay = document.getElementById("overlay");
  const overlayBody = document.getElementById("overlayBody");
  const overlayClose = document.getElementById("overlayClose");
  const hintBadge = document.getElementById("hintBadge");

  /* ── Shortcuts Data ─────────────────────────────── */

  const shortcuts = [
    {
      category: "Navigation",
      items: [
        { keys: ["g", "h"], desc: "Go to Home" },
        { keys: ["g", "p"], desc: "Go to Projects" },
        { keys: ["g", "s"], desc: "Go to Settings" },
        { keys: ["g", "n"], desc: "Go to Notifications" },
      ],
    },
    {
      category: "Actions",
      items: [
        { keys: ["c"], desc: "Create new item" },
        { keys: ["e"], desc: "Edit selected" },
        { keys: ["Ctrl", "Enter"], desc: "Submit form" },
        { keys: ["Ctrl", "s"], desc: "Save changes" },
        { keys: ["d"], desc: "Delete selected" },
      ],
    },
    {
      category: "Search",
      items: [
        { keys: ["/"], desc: "Focus search bar" },
        { keys: ["Ctrl", "k"], desc: "Command palette" },
        { keys: ["Esc"], desc: "Clear search / Close" },
      ],
    },
    {
      category: "Help",
      items: [
        { keys: ["?"], desc: "Show this overlay" },
        { keys: ["Ctrl", "/"], desc: "Toggle sidebar" },
        { keys: ["Ctrl", "."], desc: "Toggle dark mode" },
      ],
    },
  ];

  /* ── Render Shortcuts ───────────────────────────── */

  function renderShortcuts() {
    overlayBody.innerHTML = "";

    shortcuts.forEach((cat) => {
      const section = document.createElement("div");
      section.className = "shortcut-category";

      const title = document.createElement("h3");
      title.className = "category-title";
      title.textContent = cat.category;
      section.appendChild(title);

      cat.items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "shortcut-row";

        const keysDiv = document.createElement("div");
        keysDiv.className = "shortcut-keys";

        item.keys.forEach((key, i) => {
          const kbd = document.createElement("kbd");
          kbd.textContent = key;
          keysDiv.appendChild(kbd);

          if (i < item.keys.length - 1) {
            const plus = document.createElement("span");
            plus.className = "key-plus";
            plus.textContent = "+";
            keysDiv.appendChild(plus);
          }
        });

        const desc = document.createElement("span");
        desc.className = "shortcut-desc";
        desc.textContent = item.desc;

        row.appendChild(keysDiv);
        row.appendChild(desc);
        section.appendChild(row);
      });

      overlayBody.appendChild(section);
    });
  }

  renderShortcuts();

  /* ── Open / Close ───────────────────────────────── */

  let triggerElement = null;

  function openOverlay() {
    triggerElement = document.activeElement;
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    // Focus the close button
    requestAnimationFrame(() => overlayClose.focus());
  }

  function closeOverlay() {
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
    // Restore focus
    if (triggerElement && triggerElement.focus) {
      triggerElement.focus();
    }
  }

  function isOverlayOpen() {
    return backdrop.classList.contains("open");
  }

  /* ── Event Listeners ────────────────────────────── */

  // Global "?" key listener
  document.addEventListener("keydown", (e) => {
    // Ignore if inside input/textarea/contenteditable
    const tag = e.target.tagName.toLowerCase();
    const isEditable = tag === "input" || tag === "textarea" || e.target.isContentEditable;

    if (e.key === "?" && !isEditable) {
      e.preventDefault();
      if (isOverlayOpen()) {
        closeOverlay();
      } else {
        openOverlay();
      }
      return;
    }

    if (e.key === "Escape" && isOverlayOpen()) {
      e.preventDefault();
      closeOverlay();
    }
  });

  // Close button
  overlayClose.addEventListener("click", closeOverlay);

  // Hint badge
  hintBadge.addEventListener("click", () => {
    if (isOverlayOpen()) {
      closeOverlay();
    } else {
      openOverlay();
    }
  });

  // Click backdrop to close
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      closeOverlay();
    }
  });

  // Trap focus inside overlay when open
  overlay.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;

    const focusable = overlay.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
