(() => {
  const liveRegion = document.getElementById("liveRegion");
  const trackerElement = document.getElementById("trackerElement");
  const spaMain = document.getElementById("spaMain");

  /* ── Focus Tracker ──────────────────────────────── */

  function describeFocusedElement(el) {
    if (!el || el === document.body) return "body";
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute("role");
    const label = el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 40) || "";
    const id = el.id ? `#${el.id}` : "";
    const cls = el.className ? `.${el.className.split(" ")[0]}` : "";
    const display = role ? `[${role}]` : `<${tag}>`;
    return `${display}${id || cls} "${label}"`;
  }

  document.addEventListener("focusin", (e) => {
    trackerElement.textContent = describeFocusedElement(e.target);
  });

  /* ── SPA Navigation ─────────────────────────────── */

  const navLinks = document.querySelectorAll(".spa-link");
  const pages = document.querySelectorAll(".spa-page");

  const pageHeadings = {
    "route-change": "Home Page",
    "dynamic-content": "Dynamic Content",
    "delete-recovery": "Manage Tasks",
    "modal-restore": "Settings",
  };

  function navigateToPage(pageId) {
    // Update nav links
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.page === pageId);
    });

    // Update pages
    pages.forEach((page) => {
      page.classList.toggle("active", page.id === `page-${pageId}`);
    });

    // Pattern 1: Focus moves to the new page heading
    const heading = document.getElementById(`heading-${pageId}`);
    if (heading) {
      heading.textContent = pageHeadings[pageId] || pageId;
      // Small delay to allow DOM update
      requestAnimationFrame(() => {
        heading.focus();
        announce(`Navigated to ${pageHeadings[pageId] || pageId}`);
      });
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToPage(link.dataset.page);
    });
  });

  /* ── Live Region Announcements ──────────────────── */

  function announce(message) {
    liveRegion.textContent = "";
    requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  }

  /* ── Pattern 2: Dynamic Content ─────────────────── */

  const dynamicList = document.getElementById("dynamicList");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  let itemCounter = 3;

  const sampleContent = [
    "Newly fetched article from API",
    "User comment just posted",
    "System notification received",
    "Search result loaded dynamically",
    "Feed item from live stream",
  ];

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      // Add 2 new items
      const fragment = document.createDocumentFragment();
      let firstNew = null;

      for (let i = 0; i < 2; i++) {
        itemCounter++;
        const item = document.createElement("div");
        item.className = "list-item new-item";
        item.setAttribute("tabindex", "-1");

        const text = document.createElement("span");
        text.className = "item-text";
        const content = sampleContent[(itemCounter - 1) % sampleContent.length];
        text.textContent = `Item ${itemCounter} \u2014 ${content}`;
        item.appendChild(text);

        fragment.appendChild(item);
        if (!firstNew) firstNew = item;
      }

      dynamicList.appendChild(fragment);

      // Focus moves to first new item
      if (firstNew) {
        requestAnimationFrame(() => {
          firstNew.focus();
          announce(`${2} new items loaded. Item ${itemCounter - 1} and Item ${itemCounter}.`);
        });
      }

      // Remove "new" highlight after animation
      setTimeout(() => {
        dynamicList.querySelectorAll(".new-item").forEach((el) => {
          el.classList.remove("new-item");
        });
      }, 1500);
    });
  }

  /* ── Pattern 3: Delete Recovery ─────────────────── */

  const taskList = document.getElementById("taskList");

  if (taskList) {
    taskList.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".delete-btn");
      if (!deleteBtn) return;

      const taskItem = deleteBtn.closest(".task-item");
      if (!taskItem) return;

      const siblings = [...taskList.querySelectorAll(".task-item")];
      const index = siblings.indexOf(taskItem);
      const taskName = taskItem.querySelector(".task-text")?.textContent || "Task";

      // Remove the item
      taskItem.remove();

      // Focus recovery: next sibling, or previous, or parent
      const remaining = [...taskList.querySelectorAll(".task-item")];

      if (remaining.length === 0) {
        // No items left, focus the heading
        const heading = document.getElementById("heading-delete-recovery");
        if (heading) heading.focus();
        announce(`Deleted ${taskName}. No tasks remaining.`);
      } else if (index < remaining.length) {
        // Focus next item (same index position)
        remaining[index].focus();
        announce(`Deleted ${taskName}. Focus moved to next task.`);
      } else {
        // Focus previous item (was last)
        remaining[remaining.length - 1].focus();
        announce(`Deleted ${taskName}. Focus moved to previous task.`);
      }
    });
  }

  /* ── Pattern 4: Modal Focus Restoration ─────────── */

  const modalBackdrop = document.getElementById("modalBackdrop");
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");
  const modalCancel = document.getElementById("modalCancel");
  const modalSave = document.getElementById("modalSave");

  let modalTrigger = null;

  const modalContent = {
    profile: {
      title: "Edit Profile",
      body: `
        <label for="profileName">Display Name</label>
        <input type="text" id="profileName" value="Jane Developer" />
        <label for="profileBio">Bio</label>
        <input type="text" id="profileBio" value="Full-stack engineer" />
      `,
    },
    notifications: {
      title: "Notification Preferences",
      body: `
        <label for="notifEmail">Email notifications</label>
        <input type="text" id="notifEmail" value="Enabled" />
        <label for="notifPush">Push notifications</label>
        <input type="text" id="notifPush" value="Disabled" />
      `,
    },
    security: {
      title: "Security Settings",
      body: `
        <label for="secPassword">Password</label>
        <input type="password" id="secPassword" value="placeholder" />
        <label for="sec2fa">Two-Factor Auth</label>
        <input type="text" id="sec2fa" value="Enabled (Authenticator)" />
      `,
    },
  };

  function openModal(type) {
    const content = modalContent[type];
    if (!content) return;

    modalTrigger = document.activeElement;
    modalTitle.textContent = content.title;
    modalBody.innerHTML = content.body;

    modalBackdrop.classList.add("open");
    modalBackdrop.setAttribute("aria-hidden", "false");

    // Focus first focusable element in modal
    requestAnimationFrame(() => {
      const firstInput = modal.querySelector("input, button");
      if (firstInput) firstInput.focus();
    });

    announce(`${content.title} dialog opened.`);
  }

  function closeModal() {
    modalBackdrop.classList.remove("open");
    modalBackdrop.setAttribute("aria-hidden", "true");

    // Pattern 4: Restore focus to the trigger element
    if (modalTrigger && modalTrigger.focus) {
      requestAnimationFrame(() => {
        modalTrigger.focus();
        announce("Dialog closed. Focus restored.");
      });
    }
    modalTrigger = null;
  }

  // Modal triggers
  document.querySelectorAll(".modal-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.dataset.modal);
    });
  });

  // Modal close actions
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCancel) modalCancel.addEventListener("click", closeModal);
  if (modalSave) {
    modalSave.addEventListener("click", () => {
      announce("Changes saved.");
      closeModal();
    });
  }

  // Backdrop click
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBackdrop.classList.contains("open")) {
      e.preventDefault();
      closeModal();
    }
  });

  // Focus trap in modal
  if (modal) {
    modal.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;

      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

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
  }
})();
