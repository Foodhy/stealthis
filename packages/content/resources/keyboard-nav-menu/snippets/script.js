(() => {
  const menubar = document.getElementById("menubar");
  const actionLog = document.getElementById("actionLog");
  const menubarButtons = [...menubar.querySelectorAll(".menubar-button")];

  let currentMenubarIndex = 0;
  let typeAheadBuffer = "";
  let typeAheadTimer = null;

  /* ── Helpers ──────────────────────────────────────── */

  function getSubmenu(button) {
    return button.parentElement.querySelector(".submenu");
  }

  function getMenuItems(submenu) {
    return [...submenu.querySelectorAll('[role="menuitem"]')];
  }

  function openSubmenu(button) {
    // Close all others first
    menubarButtons.forEach((btn) => closeSubmenu(btn));
    const submenu = getSubmenu(button);
    button.setAttribute("aria-expanded", "true");
    submenu.classList.add("open");
  }

  function closeSubmenu(button) {
    const submenu = getSubmenu(button);
    button.setAttribute("aria-expanded", "false");
    submenu.classList.remove("open");
    // Remove focused class from all items
    getMenuItems(submenu).forEach((item) => item.classList.remove("focused"));
  }

  function closeAllSubmenus() {
    menubarButtons.forEach((btn) => closeSubmenu(btn));
  }

  function isSubmenuOpen(button) {
    return button.getAttribute("aria-expanded") === "true";
  }

  function focusMenubarItem(index) {
    menubarButtons[currentMenubarIndex].setAttribute("tabindex", "-1");
    currentMenubarIndex = index;
    menubarButtons[currentMenubarIndex].setAttribute("tabindex", "0");
    menubarButtons[currentMenubarIndex].focus();
  }

  function focusSubmenuItem(submenu, index) {
    const items = getMenuItems(submenu);
    items.forEach((item) => item.classList.remove("focused"));
    if (index >= 0 && index < items.length) {
      items[index].classList.add("focused");
      items[index].focus();
    }
  }

  function getFocusedSubmenuIndex(submenu) {
    const items = getMenuItems(submenu);
    return items.findIndex((item) => item.classList.contains("focused"));
  }

  function logAction(text) {
    const placeholder = actionLog.querySelector(".log-placeholder");
    if (placeholder) placeholder.remove();

    const entry = document.createElement("p");
    entry.className = "log-entry";
    entry.textContent = text;
    actionLog.prepend(entry);

    // Keep only last 5 entries
    const entries = actionLog.querySelectorAll(".log-entry");
    if (entries.length > 5) {
      entries[entries.length - 1].remove();
    }
  }

  /* ── Menubar keyboard navigation ─────────────────── */

  menubarButtons.forEach((button, index) => {
    // Click to open/close
    button.addEventListener("click", () => {
      if (isSubmenuOpen(button)) {
        closeSubmenu(button);
      } else {
        openSubmenu(button);
        const submenu = getSubmenu(button);
        focusSubmenuItem(submenu, 0);
      }
      focusMenubarItem(index);
    });

    // Keyboard on menubar buttons
    button.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowRight": {
          e.preventDefault();
          const wasOpen = isSubmenuOpen(button);
          closeAllSubmenus();
          const next = (index + 1) % menubarButtons.length;
          focusMenubarItem(next);
          if (wasOpen) {
            openSubmenu(menubarButtons[next]);
            focusSubmenuItem(getSubmenu(menubarButtons[next]), 0);
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const wasOpen = isSubmenuOpen(button);
          closeAllSubmenus();
          const prev = (index - 1 + menubarButtons.length) % menubarButtons.length;
          focusMenubarItem(prev);
          if (wasOpen) {
            openSubmenu(menubarButtons[prev]);
            focusSubmenuItem(getSubmenu(menubarButtons[prev]), 0);
          }
          break;
        }
        case "ArrowDown":
        case "Enter":
        case " ": {
          e.preventDefault();
          openSubmenu(button);
          const submenu = getSubmenu(button);
          focusSubmenuItem(submenu, 0);
          break;
        }
        case "Escape": {
          e.preventDefault();
          closeAllSubmenus();
          break;
        }
        case "Home": {
          e.preventDefault();
          closeAllSubmenus();
          focusMenubarItem(0);
          break;
        }
        case "End": {
          e.preventDefault();
          closeAllSubmenus();
          focusMenubarItem(menubarButtons.length - 1);
          break;
        }
      }
    });
  });

  /* ── Submenu keyboard navigation ─────────────────── */

  menubarButtons.forEach((button, menuIndex) => {
    const submenu = getSubmenu(button);
    const items = getMenuItems(submenu);

    items.forEach((item) => {
      item.addEventListener("keydown", (e) => {
        const currentIndex = getFocusedSubmenuIndex(submenu);
        const allItems = getMenuItems(submenu);

        switch (e.key) {
          case "ArrowDown": {
            e.preventDefault();
            let next = currentIndex + 1;
            // Skip separators
            while (next < allItems.length && allItems[next].getAttribute("role") === "separator") {
              next++;
            }
            if (next < allItems.length) {
              focusSubmenuItem(submenu, next);
            }
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            let prev = currentIndex - 1;
            while (prev >= 0 && allItems[prev].getAttribute("role") === "separator") {
              prev--;
            }
            if (prev >= 0) {
              focusSubmenuItem(submenu, prev);
            }
            break;
          }
          case "ArrowRight": {
            e.preventDefault();
            closeSubmenu(button);
            const nextMenu = (menuIndex + 1) % menubarButtons.length;
            focusMenubarItem(nextMenu);
            openSubmenu(menubarButtons[nextMenu]);
            focusSubmenuItem(getSubmenu(menubarButtons[nextMenu]), 0);
            break;
          }
          case "ArrowLeft": {
            e.preventDefault();
            closeSubmenu(button);
            const prevMenu = (menuIndex - 1 + menubarButtons.length) % menubarButtons.length;
            focusMenubarItem(prevMenu);
            openSubmenu(menubarButtons[prevMenu]);
            focusSubmenuItem(getSubmenu(menubarButtons[prevMenu]), 0);
            break;
          }
          case "Home": {
            e.preventDefault();
            focusSubmenuItem(submenu, 0);
            break;
          }
          case "End": {
            e.preventDefault();
            focusSubmenuItem(submenu, allItems.length - 1);
            break;
          }
          case "Enter":
          case " ": {
            e.preventDefault();
            logAction(`Activated: ${item.textContent.trim()}`);
            closeSubmenu(button);
            focusMenubarItem(menuIndex);
            break;
          }
          case "Escape": {
            e.preventDefault();
            closeSubmenu(button);
            focusMenubarItem(menuIndex);
            break;
          }
          case "Tab": {
            closeAllSubmenus();
            break;
          }
          default: {
            // Type-ahead: single character search
            if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
              e.preventDefault();
              typeAheadBuffer += e.key.toLowerCase();
              clearTimeout(typeAheadTimer);
              typeAheadTimer = setTimeout(() => {
                typeAheadBuffer = "";
              }, 500);

              const match = allItems.findIndex((el, i) => {
                if (el.getAttribute("role") === "separator") return false;
                return el.textContent.trim().toLowerCase().startsWith(typeAheadBuffer);
              });

              if (match !== -1) {
                focusSubmenuItem(submenu, match);
              }
            }
            break;
          }
        }
      });

      // Click on submenu item
      item.addEventListener("click", () => {
        if (item.getAttribute("role") === "separator") return;
        logAction(`Activated: ${item.textContent.trim()}`);
        closeSubmenu(button);
        focusMenubarItem(menuIndex);
      });
    });
  });

  /* ── Click outside to close ──────────────────────── */

  document.addEventListener("click", (e) => {
    if (!menubar.contains(e.target)) {
      closeAllSubmenus();
    }
  });
})();
