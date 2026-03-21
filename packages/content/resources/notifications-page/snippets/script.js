(() => {
  const list = document.getElementById("notificationsList");
  const emptyState = document.getElementById("emptyState");
  const markAllBtn = document.getElementById("markAllRead");
  const unreadBadge = document.getElementById("unreadBadge");
  const tabs = document.querySelectorAll(".tab");

  let activeTab = "all";

  /* ── Helpers ──────────────────────────────── */

  function getItems() {
    return Array.from(list.querySelectorAll(".notification-item"));
  }

  function countUnread() {
    return getItems().filter((el) => el.classList.contains("unread")).length;
  }

  function updateUnreadBadge() {
    const count = countUnread();
    unreadBadge.textContent = count;
    unreadBadge.setAttribute("data-count", count);
    if (count === 0) {
      unreadBadge.style.display = "none";
    } else {
      unreadBadge.style.display = "";
    }
  }

  function checkEmpty() {
    const visible = getItems().filter(
      (el) => !el.classList.contains("removing") && el.style.display !== "none"
    );
    if (visible.length === 0) {
      list.style.display = "none";
      emptyState.style.display = "";
    } else {
      list.style.display = "";
      emptyState.style.display = "none";
    }
    /* Hide date-group headers when all children hidden */
    list.querySelectorAll(".date-group").forEach((group) => {
      const visibleChildren = Array.from(
        group.querySelectorAll(".notification-item")
      ).filter(
        (el) =>
          !el.classList.contains("removing") && el.style.display !== "none"
      );
      group.style.display = visibleChildren.length === 0 ? "none" : "";
    });
  }

  /* ── Tab Filtering ────────────────────────── */

  function applyTabFilter() {
    getItems().forEach((item) => {
      const type = item.getAttribute("data-type");
      const isUnread = item.classList.contains("unread");

      let show = false;
      if (activeTab === "all") show = true;
      else if (activeTab === "unread") show = isUnread;
      else show = type === activeTab;

      item.style.display = show ? "" : "none";
    });
    checkEmpty();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      activeTab = tab.getAttribute("data-tab");
      closeAllMenus();
      applyTabFilter();
    });
  });

  /* ── Mark as Read / Unread ────────────────── */

  function markAsRead(item) {
    item.classList.remove("unread");
    const menuItem = item.querySelector('[data-action="read"]');
    if (menuItem) {
      menuItem.textContent = "Mark as unread";
      menuItem.setAttribute("data-action", "unread");
    }
    updateUnreadBadge();
    if (activeTab === "unread") {
      applyTabFilter();
    }
  }

  function markAsUnread(item) {
    item.classList.add("unread");
    const menuItem = item.querySelector('[data-action="unread"]');
    if (menuItem) {
      menuItem.textContent = "Mark as read";
      menuItem.setAttribute("data-action", "read");
    }
    updateUnreadBadge();
  }

  markAllBtn.addEventListener("click", () => {
    getItems().forEach((item) => markAsRead(item));
  });

  /* ── Delete ───────────────────────────────── */

  function deleteNotification(item) {
    item.style.maxHeight = item.offsetHeight + "px";
    /* Force reflow */
    void item.offsetHeight;
    item.classList.add("removing");
    item.addEventListener(
      "transitionend",
      () => {
        item.remove();
        updateUnreadBadge();
        checkEmpty();
      },
      { once: true }
    );
  }

  /* ── Action Menu ──────────────────────────── */

  function closeAllMenus() {
    document
      .querySelectorAll(".action-menu.open")
      .forEach((m) => m.classList.remove("open"));
  }

  list.addEventListener("click", (e) => {
    /* Three-dot button */
    const actionBtn = e.target.closest(".btn-action");
    if (actionBtn) {
      e.stopPropagation();
      const menu = actionBtn.nextElementSibling;
      const isOpen = menu.classList.contains("open");
      closeAllMenus();
      if (!isOpen) menu.classList.add("open");
      return;
    }

    /* Menu item */
    const menuItem = e.target.closest(".action-menu-item");
    if (menuItem) {
      e.stopPropagation();
      const action = menuItem.getAttribute("data-action");
      const item = menuItem.closest(".notification-item");
      closeAllMenus();

      if (action === "read") markAsRead(item);
      else if (action === "unread") markAsUnread(item);
      else if (action === "delete") deleteNotification(item);
      return;
    }

    /* Clicking the notification row itself marks it read */
    const notifItem = e.target.closest(".notification-item");
    if (notifItem && notifItem.classList.contains("unread")) {
      markAsRead(notifItem);
    }
  });

  /* Close menus on outside click */
  document.addEventListener("click", () => closeAllMenus());

  /* ── Init ──────────────────────────────────── */
  updateUnreadBadge();
  checkEmpty();
})();
