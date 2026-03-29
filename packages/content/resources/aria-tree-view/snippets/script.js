(() => {
  const tree = document.getElementById("file-tree");

  function getVisibleItems() {
    const items = [];
    function walk(parent) {
      const children = parent.querySelectorAll(":scope > [role='treeitem']");
      children.forEach((item) => {
        items.push(item);
        const expanded = item.getAttribute("aria-expanded");
        if (expanded === "true") {
          const group = item.querySelector(":scope > [role='group']");
          if (group) walk(group);
        }
      });
    }
    walk(tree);
    return items;
  }

  function focusItem(item) {
    // Remove tabindex from all items
    tree.querySelectorAll("[role='treeitem']").forEach((el) => {
      el.setAttribute("tabindex", "-1");
    });
    item.setAttribute("tabindex", "0");
    item.focus();
  }

  function toggleExpand(item) {
    const expanded = item.getAttribute("aria-expanded");
    if (expanded === null) return; // Not a folder

    const group = item.querySelector(":scope > [role='group']");
    if (!group) return;

    if (expanded === "true") {
      item.setAttribute("aria-expanded", "false");
      group.hidden = true;
    } else {
      item.setAttribute("aria-expanded", "true");
      group.hidden = false;
    }
  }

  function expandItem(item) {
    if (item.getAttribute("aria-expanded") === "false") {
      const group = item.querySelector(":scope > [role='group']");
      if (group) {
        item.setAttribute("aria-expanded", "true");
        group.hidden = false;
      }
    }
  }

  function collapseItem(item) {
    if (item.getAttribute("aria-expanded") === "true") {
      const group = item.querySelector(":scope > [role='group']");
      if (group) {
        item.setAttribute("aria-expanded", "false");
        group.hidden = true;
      }
    }
  }

  function getParentItem(item) {
    const group = item.parentElement;
    if (group && group.getAttribute("role") === "group") {
      return group.closest("[role='treeitem']");
    }
    return null;
  }

  function toggleSelection(item) {
    const selected = item.getAttribute("aria-selected") === "true";
    // Deselect all
    tree.querySelectorAll("[role='treeitem']").forEach((el) => {
      el.setAttribute("aria-selected", "false");
    });
    // Select this one (toggle off if already selected)
    if (!selected) {
      item.setAttribute("aria-selected", "true");
    }
  }

  // Click handler
  tree.addEventListener("click", (e) => {
    const item = e.target.closest("[role='treeitem']");
    if (!item) return;

    // Check if clicking on the chevron area or the content
    const content = e.target.closest(".tree-item-content");
    if (!content) return;

    focusItem(item);

    // If it's a folder, toggle expand
    if (item.getAttribute("aria-expanded") !== null) {
      toggleExpand(item);
    }

    toggleSelection(item);
  });

  // Keyboard handler
  tree.addEventListener("keydown", (e) => {
    const currentItem = document.activeElement;
    if (!currentItem || currentItem.getAttribute("role") !== "treeitem") return;

    const visibleItems = getVisibleItems();
    const currentIndex = visibleItems.indexOf(currentItem);

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (currentIndex < visibleItems.length - 1) {
          focusItem(visibleItems[currentIndex + 1]);
        }
        break;
      }

      case "ArrowUp": {
        e.preventDefault();
        if (currentIndex > 0) {
          focusItem(visibleItems[currentIndex - 1]);
        }
        break;
      }

      case "ArrowRight": {
        e.preventDefault();
        const expanded = currentItem.getAttribute("aria-expanded");
        if (expanded === "false") {
          // Expand the folder
          expandItem(currentItem);
        } else if (expanded === "true") {
          // Move to first child
          const group = currentItem.querySelector(":scope > [role='group']");
          if (group) {
            const firstChild = group.querySelector("[role='treeitem']");
            if (firstChild) focusItem(firstChild);
          }
        }
        break;
      }

      case "ArrowLeft": {
        e.preventDefault();
        const exp = currentItem.getAttribute("aria-expanded");
        if (exp === "true") {
          // Collapse the folder
          collapseItem(currentItem);
        } else {
          // Move to parent
          const parent = getParentItem(currentItem);
          if (parent) focusItem(parent);
        }
        break;
      }

      case "Home": {
        e.preventDefault();
        if (visibleItems.length > 0) {
          focusItem(visibleItems[0]);
        }
        break;
      }

      case "End": {
        e.preventDefault();
        if (visibleItems.length > 0) {
          focusItem(visibleItems[visibleItems.length - 1]);
        }
        break;
      }

      case "Enter":
      case " ": {
        e.preventDefault();
        if (currentItem.getAttribute("aria-expanded") !== null) {
          toggleExpand(currentItem);
        }
        toggleSelection(currentItem);
        break;
      }
    }
  });
})();
