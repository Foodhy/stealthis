(function () {
  "use strict";

  /* ── Data ── */
  const AVATAR_COLORS = { AL: "#38bdf8", BO: "#a78bfa", CA: "#fb923c", DA: "#34d399" };
  const AVATAR_NAMES = { AL: "Alice", BO: "Bob", CA: "Carol", DA: "David" };
  const PRIORITY_CFG = {
    critical: { label: "Critical", color: "#f87171", bg: "rgba(248,113,113,0.15)", icon: "🔴" },
    high: { label: "High", color: "#fb923c", bg: "rgba(251,146,60,0.15)", icon: "🟠" },
    medium: { label: "Medium", color: "#fbbf24", bg: "rgba(251,191,36,0.15)", icon: "🟡" },
    low: { label: "Low", color: "#38bdf8", bg: "rgba(56,189,248,0.15)", icon: "🔵" },
  };
  const TAG_COLORS = {
    UI: "#a78bfa",
    Backend: "#34d399",
    Bug: "#f87171",
    Feature: "#38bdf8",
    Design: "#fb923c",
    API: "#fbbf24",
    Auth: "#a78bfa",
    Infra: "#64748b",
  };

  let nextId = 100;

  const columns = [
    {
      id: "backlog",
      name: "Backlog",
      color: "#64748b",
      cards: [
        {
          id: "c1",
          title: "Redesign login page",
          priority: "high",
          tags: ["UI", "Design"],
          assignees: ["AL", "BO"],
          due: "Mar 15",
          comments: 3,
          attachments: 1,
          description:
            "Complete redesign of the login page following new brand guidelines. Include SSO button, forgot password flow, and remember me option.",
          comments_list: [
            {
              author: "Alice",
              color: "#38bdf8",
              time: "2d ago",
              text: "Mockups are ready in Figma, waiting for design approval.",
            },
            {
              author: "Bob",
              color: "#a78bfa",
              time: "1d ago",
              text: "I'll start implementation once designs are approved.",
            },
          ],
        },
        {
          id: "c2",
          title: "Add dark mode toggle",
          priority: "medium",
          tags: ["Feature", "UI"],
          assignees: ["CA"],
          due: "Mar 20",
          comments: 1,
          attachments: 0,
          description:
            "Implement a system-wide dark mode toggle that persists user preference to localStorage and respects prefers-color-scheme media query.",
          comments_list: [
            {
              author: "Carol",
              color: "#fb923c",
              time: "3d ago",
              text: "Will use CSS custom properties approach for theming.",
            },
          ],
        },
        {
          id: "c3",
          title: "Set up CI/CD pipeline",
          priority: "critical",
          tags: ["Infra", "Backend"],
          assignees: ["DA"],
          due: "Feb 28",
          comments: 5,
          attachments: 2,
          description:
            "Configure GitHub Actions workflow for automated testing, building, and deployment to staging and production environments.",
          comments_list: [
            {
              author: "David",
              color: "#34d399",
              time: "1d ago",
              text: "Draft pipeline YAML is in PR #42, needs review.",
            },
            {
              author: "Alice",
              color: "#38bdf8",
              time: "5h ago",
              text: "LGTM, will merge after QA sign-off.",
            },
          ],
        },
      ],
    },
    {
      id: "inprogress",
      name: "In Progress",
      color: "#38bdf8",
      cards: [
        {
          id: "c4",
          title: "User profile settings",
          priority: "medium",
          tags: ["Feature", "Backend"],
          assignees: ["BO", "CA"],
          due: "Mar 10",
          comments: 2,
          attachments: 1,
          description:
            "Build user profile settings page with avatar upload, display name, email change, notification preferences, and 2FA setup.",
          comments_list: [
            {
              author: "Bob",
              color: "#a78bfa",
              time: "6h ago",
              text: "Avatar upload working, now doing email verification flow.",
            },
            {
              author: "Carol",
              color: "#fb923c",
              time: "2h ago",
              text: "Notification prefs component is ready for review.",
            },
          ],
        },
        {
          id: "c5",
          title: "Fix auth token expiry bug",
          priority: "critical",
          tags: ["Bug", "Auth"],
          assignees: ["DA"],
          due: "Mar 4",
          comments: 7,
          attachments: 0,
          description:
            "Users are being logged out unexpectedly after 15 minutes even when remember-me is checked. Root cause is a JWT refresh race condition.",
          comments_list: [
            {
              author: "David",
              color: "#34d399",
              time: "4h ago",
              text: "Found the race condition in the token refresh middleware.",
            },
            {
              author: "Alice",
              color: "#38bdf8",
              time: "1h ago",
              text: "This is blocking release, top priority.",
            },
          ],
        },
        {
          id: "c6",
          title: "Dashboard analytics charts",
          priority: "high",
          tags: ["UI", "Feature"],
          assignees: ["AL"],
          due: "Mar 12",
          comments: 3,
          attachments: 3,
          description:
            "Implement interactive analytics charts on the main dashboard showing user growth, revenue trends, and engagement metrics.",
          comments_list: [
            {
              author: "Alice",
              color: "#38bdf8",
              time: "1d ago",
              text: "Using Chart.js for the implementation. Line and bar charts done.",
            },
          ],
        },
      ],
    },
    {
      id: "review",
      name: "Review",
      color: "#a78bfa",
      cards: [
        {
          id: "c7",
          title: "Email notification templates",
          priority: "low",
          tags: ["Feature", "Backend"],
          assignees: ["CA", "BO"],
          due: "Mar 6",
          comments: 4,
          attachments: 1,
          description:
            "Create branded email templates for welcome, password reset, invoice, and weekly summary notifications using MJML.",
          comments_list: [
            {
              author: "Carol",
              color: "#fb923c",
              time: "2d ago",
              text: "All 4 templates ready. Tested across Gmail, Outlook, Apple Mail.",
            },
            {
              author: "Bob",
              color: "#a78bfa",
              time: "1d ago",
              text: "Looks great! Just left a few minor comments on the PR.",
            },
          ],
        },
        {
          id: "c8",
          title: "API rate limiting",
          priority: "high",
          tags: ["Backend", "API"],
          assignees: ["DA"],
          due: "Mar 5",
          comments: 2,
          attachments: 0,
          description:
            "Implement per-user and per-IP rate limiting on all public API endpoints using sliding window algorithm with Redis.",
          comments_list: [
            {
              author: "David",
              color: "#34d399",
              time: "3d ago",
              text: "Redis-based limiter implemented. 100 req/min per user.",
            },
          ],
        },
      ],
    },
    {
      id: "done",
      name: "Done",
      color: "#34d399",
      cards: [
        {
          id: "c9",
          title: "Onboarding flow redesign",
          priority: "medium",
          tags: ["UI", "Feature", "Design"],
          assignees: ["AL", "CA"],
          due: "Feb 20",
          comments: 6,
          attachments: 5,
          description:
            "Complete redesign of the user onboarding experience with step-by-step wizard, progress indicator, and skip option.",
          comments_list: [
            {
              author: "Alice",
              color: "#38bdf8",
              time: "5d ago",
              text: "Shipped to production! Completion rate up 23%.",
            },
            {
              author: "Carol",
              color: "#fb923c",
              time: "4d ago",
              text: "Great collaboration on this one.",
            },
          ],
        },
        {
          id: "c10",
          title: "Password strength indicator",
          priority: "low",
          tags: ["UI", "Auth"],
          assignees: ["BO"],
          due: "Feb 18",
          comments: 1,
          attachments: 0,
          description:
            "Add a visual password strength indicator to the signup and password change forms.",
          comments_list: [
            {
              author: "Bob",
              color: "#a78bfa",
              time: "6d ago",
              text: "Done and merged. Uses zxcvbn for scoring.",
            },
          ],
        },
      ],
    },
  ];

  /* ── Current filter state ── */
  let activeAssignee = "all";
  let searchQuery = "";

  /* ── DOM helpers ── */
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ── Render board ── */
  const board = document.getElementById("kb-board");

  function renderBoard() {
    board.innerHTML = "";
    columns.forEach((col) => {
      const colEl = buildColumn(col);
      board.appendChild(colEl);
    });
  }

  function buildColumn(col) {
    const colEl = el("div", "kb-col");
    colEl.dataset.colId = col.id;

    // Header
    const header = el("div", "kb-col-header");
    const left = el("div", "kb-col-left");
    const dot = el("div", "kb-col-dot");
    dot.style.background = col.color;
    const name = el("span", "kb-col-name", col.name);
    const count = el("span", "kb-col-count", col.cards.length);
    left.appendChild(dot);
    left.appendChild(name);
    left.appendChild(count);
    const addBtn = el("button", "kb-col-add", "+");
    addBtn.title = "Add card";
    header.appendChild(left);
    header.appendChild(addBtn);
    colEl.appendChild(header);

    // Cards container
    const cardsEl = el("div", "kb-cards");
    cardsEl.dataset.colId = col.id;
    colEl.appendChild(cardsEl);

    col.cards.forEach((card) => {
      const cardEl = buildCard(card, col);
      cardsEl.appendChild(cardEl);
    });

    // Inline add form
    const addForm = el("div", "kb-add-card-form");
    const textarea = el("textarea", "kb-add-card-input");
    textarea.placeholder = "Card title…";
    textarea.rows = 2;
    const actions = el("div", "kb-add-card-actions");
    const addCardBtn = el("button", "btn-sm-primary", "Add");
    const cancelBtn = el("button", "btn-sm-ghost", "✕");
    actions.appendChild(addCardBtn);
    actions.appendChild(cancelBtn);
    addForm.appendChild(textarea);
    addForm.appendChild(actions);
    colEl.appendChild(addForm);

    // Events
    addBtn.addEventListener("click", () => {
      addForm.classList.toggle("visible");
      if (addForm.classList.contains("visible")) textarea.focus();
    });
    cancelBtn.addEventListener("click", () => {
      addForm.classList.remove("visible");
      textarea.value = "";
    });
    addCardBtn.addEventListener("click", () => {
      const title = textarea.value.trim();
      if (!title) return;
      const newCard = {
        id: `c${nextId++}`,
        title,
        priority: "medium",
        tags: [],
        assignees: [],
        due: "",
        comments: 0,
        attachments: 0,
        description: title,
        comments_list: [],
      };
      col.cards.push(newCard);
      addForm.classList.remove("visible");
      textarea.value = "";
      renderBoard();
    });

    // Drag-over for column
    colEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      colEl.classList.add("drag-over");
    });
    colEl.addEventListener("dragleave", (e) => {
      if (!colEl.contains(e.relatedTarget)) colEl.classList.remove("drag-over");
    });
    colEl.addEventListener("drop", (e) => {
      e.preventDefault();
      colEl.classList.remove("drag-over");
      const cardId = e.dataTransfer.getData("text/plain");
      moveCard(cardId, col.id);
    });

    applyFilters(cardsEl, col);
    return colEl;
  }

  function buildCard(card, col) {
    const pCfg = PRIORITY_CFG[card.priority];
    const cardEl = el("div", "kb-card");
    cardEl.dataset.cardId = card.id;
    cardEl.dataset.assignees = card.assignees.join(",");
    cardEl.draggable = true;

    // Top row
    const top = el("div", "kb-card-top");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "kb-card-checkbox";
    if (col.id === "done") checkbox.checked = true;
    const titleEl = el("span", "kb-card-title", card.title);
    titleEl.addEventListener("click", () => openModal(card, col));
    top.appendChild(checkbox);
    top.appendChild(titleEl);
    cardEl.appendChild(top);

    // Tags
    if (card.tags.length) {
      const tagsEl = el("div", "kb-card-tags");
      card.tags.forEach((tag) => {
        const t = el("span", "kb-tag", tag);
        t.style.background = (TAG_COLORS[tag] || "#64748b") + "28";
        t.style.color = TAG_COLORS[tag] || "#94a3b8";
        tagsEl.appendChild(t);
      });
      cardEl.appendChild(tagsEl);
    }

    // Priority
    const pEl = el("span", "kb-priority");
    pEl.innerHTML = `${pCfg.icon} ${pCfg.label}`;
    pEl.style.background = pCfg.bg;
    pEl.style.color = pCfg.color;
    cardEl.appendChild(pEl);

    // Footer
    const footer = el("div", "kb-card-footer");

    const due = el("div", "kb-card-due");
    if (card.due) {
      due.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> ${card.due}`;
    }
    footer.appendChild(due);

    const meta = el("div", "kb-card-meta");

    // Attachments & comments
    const stats = el("div", "kb-card-stats");
    if (card.attachments) {
      const s = el("span", "kb-card-stat");
      s.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> ${card.attachments}`;
      stats.appendChild(s);
    }
    if (card.comments) {
      const s = el("span", "kb-card-stat");
      s.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ${card.comments}`;
      stats.appendChild(s);
    }
    meta.appendChild(stats);

    // Avatars
    if (card.assignees.length) {
      const avsEl = el("div", "kb-avatars");
      card.assignees.forEach((a) => {
        const av = el("div", "kb-avatar", a);
        av.style.background = AVATAR_COLORS[a] || "#64748b";
        av.title = AVATAR_NAMES[a] || a;
        avsEl.appendChild(av);
      });
      meta.appendChild(avsEl);
    }

    footer.appendChild(meta);
    cardEl.appendChild(footer);

    // Drag events
    cardEl.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", card.id);
      setTimeout(() => cardEl.classList.add("dragging"), 0);
    });
    cardEl.addEventListener("dragend", () => cardEl.classList.remove("dragging"));

    return cardEl;
  }

  /* ── Move card ── */
  function moveCard(cardId, toColId) {
    let card, fromCol;
    for (const col of columns) {
      const idx = col.cards.findIndex((c) => c.id === cardId);
      if (idx > -1) {
        card = col.cards.splice(idx, 1)[0];
        fromCol = col;
        break;
      }
    }
    if (!card) return;
    const toCol = columns.find((c) => c.id === toColId);
    if (toCol) toCol.cards.push(card);
    renderBoard();
  }

  /* ── Filters ── */
  function applyFilters(cardsEl, col) {
    cardsEl.querySelectorAll(".kb-card").forEach((cardEl) => {
      const assignees = cardEl.dataset.assignees || "";
      const title = cardEl.querySelector(".kb-card-title").textContent.toLowerCase();
      const matchAssignee = activeAssignee === "all" || assignees.includes(activeAssignee);
      const matchSearch = !searchQuery || title.includes(searchQuery.toLowerCase());
      cardEl.classList.toggle("hidden", !matchAssignee || !matchSearch);
    });
  }

  /* ── Assignee filter ── */
  document.getElementById("kb-assignee-filter").addEventListener("click", (e) => {
    const btn = e.target.closest(".av-filter-btn");
    if (!btn) return;
    document.querySelectorAll(".av-filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeAssignee = btn.dataset.assignee;
    renderBoard();
  });

  /* ── Search ── */
  document.getElementById("kb-search").addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    renderBoard();
  });

  /* ── Add column ── */
  document.getElementById("kb-add-col").addEventListener("click", () => {
    const name = prompt("Column name:");
    if (!name) return;
    const colors = ["#38bdf8", "#a78bfa", "#fb923c", "#34d399", "#fbbf24", "#f87171"];
    columns.push({
      id: `col${nextId++}`,
      name,
      color: colors[columns.length % colors.length],
      cards: [],
    });
    renderBoard();
  });

  /* ── Modal ── */
  const backdrop = document.getElementById("modal-backdrop");
  document.getElementById("modal-close").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  function openModal(card, col) {
    document.getElementById("modal-col-label").textContent = col.name;
    document.getElementById("modal-card-title").textContent = card.title;
    document.getElementById("modal-description").textContent =
      card.description || "No description provided.";

    const meta = document.getElementById("modal-meta");
    const pCfg = PRIORITY_CFG[card.priority];
    const pEl = document.createElement("span");
    pEl.className = "kb-priority";
    pEl.innerHTML = `${pCfg.icon} ${pCfg.label}`;
    pEl.style.background = pCfg.bg;
    pEl.style.color = pCfg.color;

    const dueEl = document.createElement("span");
    dueEl.className = "kb-card-due";
    if (card.due)
      dueEl.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> Due ${card.due}`;

    meta.innerHTML = "";
    meta.appendChild(pEl);
    if (card.due) meta.appendChild(dueEl);

    const commentsEl = document.getElementById("modal-comments");
    commentsEl.innerHTML = "";
    (card.comments_list || []).forEach((c) => {
      const wrap = el("div", "modal-comment");
      const av = el("div", "modal-comment-avatar", c.author.slice(0, 2).toUpperCase());
      av.style.background = c.color || "#64748b";
      const body = el("div", "modal-comment-body");
      const top = el("div");
      const author = el("span", "modal-comment-author", c.author);
      const time = el("span", "modal-comment-time", c.time);
      top.appendChild(author);
      top.appendChild(time);
      const text = el("p", "modal-comment-text", c.text);
      body.appendChild(top);
      body.appendChild(text);
      wrap.appendChild(av);
      wrap.appendChild(body);
      commentsEl.appendChild(wrap);
    });

    backdrop.classList.add("open");
  }

  function closeModal() {
    backdrop.classList.remove("open");
  }

  /* ── Init ── */
  renderBoard();
})();
