(function () {
  "use strict";

  /* ── Data ── */
  const AVATAR_COLORS = {
    Alice: "#38bdf8",
    Bob: "#a78bfa",
    Carol: "#fb923c",
    David: "#34d399",
    Emma: "#f87171",
    Milestone: "#fbbf24",
  };

  const tasks = [
    { id: "g1", type: "group", name: "Feature Development" },
    {
      id: "t1",
      type: "task",
      name: "User Authentication",
      assignee: "Alice",
      color: "#38bdf8",
      start: "2026-01-05",
      end: "2026-01-23",
      progress: 100,
      group: "g1",
    },
    {
      id: "t2",
      type: "task",
      name: "Dashboard UI",
      assignee: "Bob",
      color: "#a78bfa",
      start: "2026-01-12",
      end: "2026-02-06",
      progress: 80,
      group: "g1",
    },
    {
      id: "t3",
      type: "task",
      name: "API Integration",
      assignee: "Carol",
      color: "#fb923c",
      start: "2026-01-26",
      end: "2026-02-20",
      progress: 55,
      group: "g1",
    },
    { id: "g2", type: "group", name: "Testing" },
    {
      id: "t4",
      type: "task",
      name: "Unit Tests",
      assignee: "David",
      color: "#34d399",
      start: "2026-02-09",
      end: "2026-02-27",
      progress: 30,
      group: "g2",
    },
    {
      id: "t5",
      type: "task",
      name: "E2E Testing",
      assignee: "Emma",
      color: "#f87171",
      start: "2026-02-23",
      end: "2026-03-13",
      progress: 10,
      group: "g2",
    },
    { id: "g3", type: "group", name: "Launch" },
    { id: "m1", type: "milestone", name: "Beta Release", start: "2026-03-06", group: "g3" },
    { id: "m2", type: "milestone", name: "Production Deploy", start: "2026-03-27", group: "g3" },
  ];

  /* ── Config ── */
  const DAY_W = 28; // px per day
  const ROW_H = 44;
  const TIMELINE_START = new Date(2026, 0, 5); // Jan 5, 2026
  const TIMELINE_END = new Date(2026, 2, 29); // Mar 29, 2026
  const TODAY = new Date(2026, 2, 2); // today for demo

  let currentZoom = "week";
  let scrollOffset = 0;

  /* ── Elements ── */
  const taskList = document.getElementById("tl-task-list");
  const dateHeader = document.getElementById("tl-date-header");
  const gridArea = document.getElementById("tl-grid-area");
  const todayLine = document.getElementById("tl-today-line");
  const timelinePanel = document.getElementById("tl-timeline-panel");
  const tooltip = document.getElementById("tl-tooltip");

  /* ── Helpers ── */
  function daysBetween(a, b) {
    return Math.round((b - a) / 86400000);
  }

  function dateFromOffset(days) {
    const d = new Date(TIMELINE_START);
    d.setDate(d.getDate() + days);
    return d;
  }

  function offsetFromDate(d) {
    return daysBetween(TIMELINE_START, d);
  }

  function fmtDate(d) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function parseDate(str) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const totalDays = daysBetween(TIMELINE_START, TIMELINE_END) + 1;

  /* ── Render task list ── */
  function renderTaskList() {
    taskList.innerHTML = "";
    tasks.forEach((t) => {
      const row = document.createElement("div");
      row.className = `tl-task-row ${t.type}`;
      row.dataset.id = t.id;

      const name = document.createElement("span");
      name.className = "tl-task-name";
      name.textContent = t.type === "milestone" ? `◆ ${t.name}` : t.name;
      row.appendChild(name);

      if (t.type === "task") {
        const av = document.createElement("div");
        av.className = "tl-task-avatar";
        av.style.background = AVATAR_COLORS[t.assignee] || "#64748b";
        av.textContent = t.assignee.slice(0, 2).toUpperCase();
        row.appendChild(av);
      }

      taskList.appendChild(row);
    });
  }

  /* ── Render date header ── */
  function renderDateHeader() {
    dateHeader.innerHTML = "";
    dateHeader.style.width = `${totalDays * DAY_W}px`;

    if (currentZoom === "week") {
      // Group by weeks
      let d = new Date(TIMELINE_START);
      while (d <= TIMELINE_END) {
        const weekStart = new Date(d);
        const daysInWeek = Math.min(7, daysBetween(d, TIMELINE_END) + 1);
        const col = document.createElement("div");
        col.className = "tl-date-col";
        col.style.width = `${daysInWeek * DAY_W}px`;
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        col.textContent = `${months[weekStart.getMonth()]} ${weekStart.getDate()}`;
        if (
          isSameDay(weekStart, TODAY) ||
          (TODAY >= weekStart && TODAY < new Date(weekStart.getTime() + daysInWeek * 86400000))
        ) {
          col.classList.add("today-col");
        }
        dateHeader.appendChild(col);
        d.setDate(d.getDate() + 7);
      }
    } else if (currentZoom === "month") {
      // Group by months
      let d = new Date(TIMELINE_START.getFullYear(), TIMELINE_START.getMonth(), 1);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      while (d <= TIMELINE_END) {
        const monthStart = new Date(Math.max(d, TIMELINE_START));
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const clampedEnd = new Date(Math.min(monthEnd, TIMELINE_END));
        const days = daysBetween(monthStart, clampedEnd) + 1;
        const col = document.createElement("div");
        col.className = "tl-date-col";
        col.style.width = `${days * DAY_W}px`;
        col.textContent = `${months[d.getMonth()]} ${d.getFullYear()}`;
        if (d.getMonth() === TODAY.getMonth()) col.classList.add("today-col");
        dateHeader.appendChild(col);
        d.setMonth(d.getMonth() + 1);
      }
    } else {
      // Quarter
      const col = document.createElement("div");
      col.className = "tl-date-col";
      col.style.width = `${totalDays * DAY_W}px`;
      col.textContent = "Q1 2026";
      dateHeader.appendChild(col);
    }
  }

  /* ── Render grid ── */
  function renderGrid() {
    // Remove old rows (but keep today line)
    gridArea.querySelectorAll(".tl-grid-row").forEach((r) => r.remove());

    tasks.forEach((t, idx) => {
      const row = document.createElement("div");
      row.className = `tl-grid-row${t.type === "group" ? " group-row" : ""}`;
      row.style.width = `${totalDays * DAY_W}px`;

      // Vertical grid cells
      for (let d = 0; d < totalDays; d++) {
        const cell = document.createElement("div");
        cell.className = "tl-grid-cell";
        cell.style.left = `${d * DAY_W}px`;
        cell.style.width = `${DAY_W}px`;
        row.appendChild(cell);
      }

      if (t.type === "task") {
        const startDate = parseDate(t.start);
        const endDate = parseDate(t.end);
        const startOff = offsetFromDate(startDate);
        const duration = daysBetween(startDate, endDate) + 1;

        const bar = document.createElement("div");
        bar.className = "tl-bar";
        bar.style.left = `${startOff * DAY_W + 2}px`;
        bar.style.width = `${duration * DAY_W - 4}px`;
        bar.style.background = t.color;
        bar.dataset.id = t.id;

        const progress = document.createElement("div");
        progress.className = "tl-bar-progress";
        progress.style.width = `${t.progress}%`;
        bar.appendChild(progress);

        const label = document.createElement("span");
        label.className = "tl-bar-label";
        label.textContent = t.name;
        bar.appendChild(label);

        const avatar = document.createElement("div");
        avatar.className = "tl-bar-avatar";
        avatar.textContent = t.assignee.slice(0, 2).toUpperCase();
        bar.appendChild(avatar);

        // Drag logic
        setupBarDrag(bar, t);

        // Tooltip
        bar.addEventListener("mouseenter", (e) => showTooltip(e, t));
        bar.addEventListener("mousemove", (e) => positionTooltip(e));
        bar.addEventListener("mouseleave", hideTooltip);

        row.appendChild(bar);
      } else if (t.type === "milestone") {
        const startDate = parseDate(t.start);
        const startOff = offsetFromDate(startDate);
        const diamond = document.createElement("div");
        diamond.className = "tl-milestone";
        diamond.style.left = `${startOff * DAY_W + DAY_W / 2 - 7}px`;
        diamond.title = t.name;
        diamond.addEventListener("mouseenter", (e) => showTooltip(e, t));
        diamond.addEventListener("mousemove", (e) => positionTooltip(e));
        diamond.addEventListener("mouseleave", hideTooltip);
        row.appendChild(diamond);
      }

      gridArea.appendChild(row);
    });

    // Today line
    const todayOff = offsetFromDate(TODAY);
    todayLine.style.left = `${todayOff * DAY_W + DAY_W / 2}px`;
    gridArea.appendChild(todayLine); // re-append to keep on top
  }

  /* ── Drag ── */
  function setupBarDrag(bar, task) {
    let startX,
      startLeft,
      dragging = false;

    bar.addEventListener("mousedown", (e) => {
      e.preventDefault();
      dragging = true;
      startX = e.clientX;
      startLeft = parseInt(bar.style.left);
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      hideTooltip();
      const dx = e.clientX - startX;
      const newLeft = Math.max(0, startLeft + dx);
      bar.style.left = `${newLeft}px`;

      // Update task dates
      const dayOffset = Math.round(newLeft / DAY_W);
      const newStart = dateFromOffset(dayOffset);
      const duration = daysBetween(parseDate(task.start), parseDate(task.end));
      const newEnd = new Date(newStart);
      newEnd.setDate(newEnd.getDate() + duration);
      task.start = fmtDateISO(newStart);
      task.end = fmtDateISO(newEnd);
    });

    document.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      document.body.style.userSelect = "";
    });
  }

  function fmtDateISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  /* ── Tooltip ── */
  function showTooltip(e, task) {
    document.getElementById("tt-title").textContent = task.name;
    document.getElementById("tt-assignee").textContent = task.assignee || "—";
    document.getElementById("tt-start").textContent = task.start
      ? fmtDate(parseDate(task.start))
      : "—";
    document.getElementById("tt-end").textContent = task.end ? fmtDate(parseDate(task.end)) : "—";
    document.getElementById("tt-progress").textContent =
      task.progress !== undefined ? `${task.progress}%` : "Milestone";
    tooltip.classList.add("visible");
    positionTooltip(e);
  }

  function positionTooltip(e) {
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    let x = e.clientX + 12;
    let y = e.clientY + 12;
    if (x + tw > window.innerWidth - 8) x = e.clientX - tw - 12;
    if (y + th > window.innerHeight - 8) y = e.clientY - th - 12;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  /* ── View zoom ── */
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentZoom = btn.dataset.zoom;
      renderDateHeader();
      renderGrid();
    });
  });

  /* ── Scroll navigation ── */
  document.getElementById("tl-prev").addEventListener("click", () => {
    timelinePanel.scrollLeft = Math.max(0, timelinePanel.scrollLeft - 7 * DAY_W);
  });
  document.getElementById("tl-next").addEventListener("click", () => {
    timelinePanel.scrollLeft += 7 * DAY_W;
  });
  document.getElementById("tl-today").addEventListener("click", () => {
    const todayOff = offsetFromDate(TODAY);
    timelinePanel.scrollLeft = Math.max(0, todayOff * DAY_W - 100);
  });

  /* ── Sync scroll ── */
  timelinePanel.addEventListener("scroll", () => {
    // Keep task list in sync vertically (not needed here as both scroll together)
  });

  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  /* ── Init ── */
  renderTaskList();
  renderDateHeader();
  renderGrid();

  // Scroll to today
  setTimeout(() => {
    const todayOff = offsetFromDate(TODAY);
    timelinePanel.scrollLeft = Math.max(0, todayOff * DAY_W - 150);
  }, 50);
})();
