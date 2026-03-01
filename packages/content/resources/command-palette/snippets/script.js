(function () {
  "use strict";

  // ── Commands dataset ───────────────────────────────────────────
  const COMMANDS = [
    { group: "Navigation", icon: "🏠", name: "Go to Home",        meta: "",       shortcut: "G H" },
    { group: "Navigation", icon: "📚", name: "Open Library",      meta: "",       shortcut: "G L" },
    { group: "Navigation", icon: "⚙️",  name: "Settings",          meta: "",       shortcut: "G S" },
    { group: "Navigation", icon: "📖", name: "Documentation",     meta: "",       shortcut: ""    },
    { group: "Actions",    icon: "✨", name: "New Resource",      meta: "Create", shortcut: "⌘N"  },
    { group: "Actions",    icon: "🔍", name: "Search Everything", meta: "Find",   shortcut: "⌘F"  },
    { group: "Actions",    icon: "📋", name: "Copy Page URL",     meta: "Share",  shortcut: "⌘U"  },
    { group: "Actions",    icon: "🌙", name: "Toggle Dark Mode",  meta: "Theme",  shortcut: "⌘D"  },
    { group: "Help",       icon: "❓", name: "Keyboard Shortcuts","meta": "",      shortcut: "?"   },
    { group: "Help",       icon: "💬", name: "Open Feedback",     meta: "",       shortcut: ""    },
  ];

  // ── Elements ───────────────────────────────────────────────────
  const overlay  = document.getElementById("cp-overlay");
  const input    = document.getElementById("cp-input");
  const list     = document.getElementById("cp-list");

  let activeIndex = -1;

  // ── Open / close ───────────────────────────────────────────────
  function open() {
    overlay.hidden = false;
    input.value = "";
    render(COMMANDS);
    activeIndex = -1;
    requestAnimationFrame(() => input.focus());
  }

  function close() {
    overlay.hidden = true;
    input.blur();
  }

  // ── Render results ─────────────────────────────────────────────
  function render(commands) {
    list.innerHTML = "";

    if (commands.length === 0) {
      list.innerHTML = '<li class="cp-no-results">No commands found</li>';
      return;
    }

    let currentGroup = null;

    commands.forEach((cmd, i) => {
      if (cmd.group !== currentGroup) {
        currentGroup = cmd.group;
        const label = document.createElement("li");
        label.className = "cp-group-label";
        label.textContent = cmd.group;
        list.appendChild(label);
      }

      const li = document.createElement("li");
      li.className = "cp-item";
      li.setAttribute("role", "option");
      li.dataset.index = i;
      li.innerHTML = `
        <span class="cp-item-icon">${cmd.icon}</span>
        <span class="cp-item-text">
          <span class="cp-item-name">${cmd.name}</span>
          ${cmd.meta ? `<span class="cp-item-meta">${cmd.meta}</span>` : ""}
        </span>
        ${cmd.shortcut ? `<kbd class="cp-item-kbd">${cmd.shortcut}</kbd>` : ""}
      `;

      li.addEventListener("click", () => execute(cmd));
      li.addEventListener("mouseenter", () => setActive(i));
      list.appendChild(li);
    });
  }

  // ── Filter ─────────────────────────────────────────────────────
  function filter(query) {
    const q = query.toLowerCase().trim();
    activeIndex = -1;
    if (!q) { render(COMMANDS); return; }
    const filtered = COMMANDS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
    render(filtered);
  }

  // ── Active item ────────────────────────────────────────────────
  function setActive(index) {
    const items = list.querySelectorAll(".cp-item");
    items.forEach((el, i) => el.classList.toggle("active", i === index));
    activeIndex = index;
  }

  function moveActive(delta) {
    const items = list.querySelectorAll(".cp-item");
    if (!items.length) return;
    const next = Math.max(0, Math.min(items.length - 1, activeIndex + delta));
    setActive(next);
    items[next].scrollIntoView({ block: "nearest" });
  }

  // ── Execute ────────────────────────────────────────────────────
  function execute(cmd) {
    // Demo: just show which command was selected
    alert(`"${cmd.name}" — action would run here`);
    close();
  }

  // ── Events ────────────────────────────────────────────────────
  // ⌘K / Ctrl+K
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      overlay.hidden ? open() : close();
    }
  });

  // Input filtering
  input.addEventListener("input", () => filter(input.value));

  // Keyboard navigation inside palette
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown")  { e.preventDefault(); moveActive(1); }
    if (e.key === "ArrowUp")    { e.preventDefault(); moveActive(-1); }
    if (e.key === "Escape")     { close(); }
    if (e.key === "Enter") {
      const items = list.querySelectorAll(".cp-item");
      if (activeIndex >= 0 && items[activeIndex]) {
        const cmdName = items[activeIndex].querySelector(".cp-item-name").textContent;
        const cmd = COMMANDS.find((c) => c.name === cmdName);
        if (cmd) execute(cmd);
      }
    }
  });

  // Click backdrop to close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // Open immediately for demo
  open();
})();
