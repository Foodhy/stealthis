(function () {
  "use strict";

  // ── Data ──
  const SUGGESTED = [
    {
      id: "dash",
      title: "Dashboard Overview",
      category: "Page",
      icon: "page",
      shortcut: ["⌘", "D"],
    },
    { id: "team", title: "Team Members", category: "User", icon: "user", shortcut: null },
    { id: "api", title: "API Documentation", category: "Document", icon: "doc", shortcut: null },
    {
      id: "revenue",
      title: "Revenue Reports",
      category: "Chart",
      icon: "chart",
      shortcut: ["⌘", "R"],
    },
    {
      id: "settings",
      title: "Account Settings",
      category: "Settings",
      icon: "settings",
      shortcut: null,
    },
    { id: "inbox", title: "Inbox", category: "Page", icon: "page", shortcut: null },
    { id: "projects", title: "Projects", category: "Page", icon: "page", shortcut: null },
    {
      id: "billing",
      title: "Billing & Plans",
      category: "Settings",
      icon: "settings",
      shortcut: null,
    },
  ];

  const ICONS = {
    page: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    doc: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16v16H4z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>`,
    chart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    settings: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  };

  const RECENT_KEY = "search-autocomplete-recent";
  const MAX_RECENT = 5;

  // ── DOM refs ──
  const container = document.getElementById("searchContainer");
  const input = document.getElementById("searchInput");
  const dropdown = document.getElementById("searchDropdown");
  const recentSection = document.getElementById("recentSection");
  const recentList = document.getElementById("recentList");
  const noRecent = document.getElementById("noRecent");
  const suggestedSection = document.getElementById("suggestedSection");
  const suggestedList = document.getElementById("suggestedList");
  const emptyState = document.getElementById("emptyState");
  const emptyQuery = document.getElementById("emptyQuery");
  const footerHint = document.getElementById("footerHint");
  const resultCountBadge = document.getElementById("resultCountBadge");

  if (!input) return;

  let isOpen = false;
  let activeIndex = -1;
  let currentItems = []; // flat list of rendered item elements

  // ── Recent searches ──
  function getRecent() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function addRecent(title) {
    let list = getRecent().filter((t) => t !== title);
    list.unshift(title);
    list = list.slice(0, MAX_RECENT);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch {}
  }

  // ── Fuzzy filter ──
  function fuzzyMatch(str, query) {
    const s = str.toLowerCase();
    const q = query.toLowerCase();
    return s.includes(q);
  }

  function highlight(title, query) {
    if (!query) return title;
    const idx = title.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return title;
    return (
      escapeHtml(title.slice(0, idx)) +
      `<mark>${escapeHtml(title.slice(idx, idx + query.length))}</mark>` +
      escapeHtml(title.slice(idx + query.length))
    );
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ── Render ──
  function renderDropdown(query) {
    currentItems = [];
    activeIndex = -1;

    const recent = getRecent();
    const filtered = SUGGESTED.filter((item) => !query || fuzzyMatch(item.title, query));

    const showEmpty = query.length > 0 && filtered.length === 0;
    const showRecent = query.length === 0;
    const showSuggested = filtered.length > 0;

    // Recent section
    recentSection.hidden = !showRecent;
    if (showRecent) {
      if (recent.length === 0) {
        noRecent.hidden = false;
        recentList.innerHTML = "";
      } else {
        noRecent.hidden = true;
        recentList.innerHTML = recent
          .map(
            (title, i) => `
          <div class="result-item" data-type="recent" data-value="${escapeHtml(title)}" tabindex="-1" role="option">
            <div class="result-icon">${ICONS.clock}</div>
            <div class="result-body">
              <div class="result-title">${escapeHtml(title)}</div>
              <div class="result-category">Recent</div>
            </div>
          </div>
        `
          )
          .join("");
      }
    }

    // Suggested section
    suggestedSection.hidden = !showSuggested;
    if (showSuggested) {
      suggestedList.innerHTML = filtered
        .map((item) => {
          const shortcutHtml = item.shortcut
            ? `<div class="result-shortcut">${item.shortcut.map((k) => `<kbd>${k}</kbd>`).join("")}</div>`
            : "";
          return `
          <div class="result-item" data-type="suggested" data-value="${escapeHtml(item.title)}" data-id="${item.id}" tabindex="-1" role="option">
            <div class="result-icon">${ICONS[item.icon] || ICONS.page}</div>
            <div class="result-body">
              <div class="result-title">${highlight(item.title, query)}</div>
              <div class="result-category">${escapeHtml(item.category)}</div>
            </div>
            ${shortcutHtml}
          </div>
        `;
        })
        .join("");
    }

    // Empty state
    emptyState.hidden = !showEmpty;
    if (showEmpty) emptyQuery.textContent = query;

    // Footer
    const totalVisible = (showRecent ? recent.length : 0) + (showSuggested ? filtered.length : 0);
    resultCountBadge.textContent = `${totalVisible} result${totalVisible !== 1 ? "s" : ""}`;
    footerHint.textContent = query
      ? `Press Enter to search all results for "${query}"`
      : "Press Enter to search all";

    // Build flat item list for keyboard nav
    currentItems = Array.from(dropdown.querySelectorAll(".result-item"));
  }

  // ── Open / close ──
  function openDropdown() {
    if (isOpen) return;
    isOpen = true;
    container.classList.add("open");
    input.setAttribute("aria-expanded", "true");
    dropdown.hidden = false;
    renderDropdown(input.value);
  }

  function closeDropdown() {
    if (!isOpen) return;
    isOpen = false;
    container.classList.remove("open");
    input.setAttribute("aria-expanded", "false");
    dropdown.hidden = true;
    setActive(-1);
  }

  function setActive(index) {
    currentItems.forEach((el) => el.classList.remove("active"));
    activeIndex = index;
    if (index >= 0 && index < currentItems.length) {
      currentItems[index].classList.add("active");
      currentItems[index].scrollIntoView({ block: "nearest" });
    }
  }

  function selectItem(el) {
    const value = el.dataset.value;
    if (!value) return;
    addRecent(value);
    input.value = value;
    closeDropdown();
    input.select();
  }

  // ── Event listeners ──
  input.addEventListener("focus", openDropdown);
  input.addEventListener("input", () => {
    openDropdown();
    renderDropdown(input.value);
  });

  input.addEventListener("keydown", (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive(Math.min(activeIndex + 1, currentItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive(Math.max(activeIndex - 1, -1));
        if (activeIndex === -1) input.focus();
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && currentItems[activeIndex]) {
          selectItem(currentItems[activeIndex]);
        } else if (input.value.trim()) {
          addRecent(input.value.trim());
          closeDropdown();
        }
        break;
      case "Escape":
        e.preventDefault();
        closeDropdown();
        break;
    }
  });

  dropdown.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".result-item");
    if (item) {
      e.preventDefault();
      selectItem(item);
    }
  });

  dropdown.addEventListener("mousemove", (e) => {
    const item = e.target.closest(".result-item");
    if (item) setActive(currentItems.indexOf(item));
  });

  document.addEventListener("mousedown", (e) => {
    if (!container.contains(e.target)) closeDropdown();
  });

  // ── Global shortcut ⌘K / Ctrl+K ──
  document.addEventListener("keydown", (e) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const trigger = isMac ? e.metaKey : e.ctrlKey;
    if (trigger && e.key === "k") {
      e.preventDefault();
      input.focus();
      input.select();
      openDropdown();
    }
  });
})();
