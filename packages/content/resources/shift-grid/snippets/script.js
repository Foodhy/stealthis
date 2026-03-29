(function () {
  "use strict";

  // ── Config ──
  const EMPLOYEES = [
    { id: "alice", name: "Alice M.", color: "#38bdf8", initials: "AM" },
    { id: "bob", name: "Bob K.", color: "#818cf8", initials: "BK" },
    { id: "carol", name: "Carol S.", color: "#f472b6", initials: "CS" },
    { id: "david", name: "David R.", color: "#34d399", initials: "DR" },
    { id: "emma", name: "Emma J.", color: "#fb923c", initials: "EJ" },
    { id: "frank", name: "Frank L.", color: "#fbbf24", initials: "FL" },
  ];

  const SHIFT_TYPES = {
    Morning: { label: "Morning", hours: 8, cls: "morning" },
    Afternoon: { label: "Afternoon", hours: 8, cls: "afternoon" },
    Night: { label: "Night", hours: 8, cls: "night" },
    "Day Off": { label: "Day Off", hours: 0, cls: "dayoff" },
  };

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // ── State ──
  let weekOffset = 0; // 0 = current week, -1 = prev, +1 = next

  // Grid state: { [employeeId]: { [dayIndex]: "Morning" | "Afternoon" | "Night" | "Day Off" | null } }
  const schedule = {};
  EMPLOYEES.forEach((emp) => {
    schedule[emp.id] = {};
  });

  // Seed some initial data so the grid looks populated
  const seed = [
    ["alice", 0, "Morning"],
    ["alice", 1, "Morning"],
    ["alice", 2, "Afternoon"],
    ["alice", 3, "Morning"],
    ["alice", 4, "Morning"],
    ["alice", 5, "Day Off"],
    ["alice", 6, "Day Off"],
    ["bob", 0, "Afternoon"],
    ["bob", 1, "Afternoon"],
    ["bob", 2, "Morning"],
    ["bob", 3, "Night"],
    ["bob", 4, "Afternoon"],
    ["carol", 0, "Night"],
    ["carol", 2, "Night"],
    ["carol", 4, "Night"],
    ["carol", 5, "Night"],
    ["david", 0, "Morning"],
    ["david", 1, "Day Off"],
    ["david", 2, "Morning"],
    ["david", 3, "Morning"],
    ["david", 4, "Morning"],
    ["emma", 0, "Afternoon"],
    ["emma", 1, "Morning"],
    ["emma", 3, "Afternoon"],
    ["emma", 4, "Afternoon"],
    ["frank", 1, "Morning"],
    ["frank", 2, "Morning"],
    ["frank", 3, "Day Off"],
    ["frank", 4, "Night"],
  ];
  seed.forEach(([empId, dayIdx, type]) => {
    schedule[empId][dayIdx] = type;
  });

  // ── DOM refs ──
  const tableHead = document.getElementById("tableHead");
  const tableBody = document.getElementById("tableBody");
  const tableFoot = document.getElementById("tableFoot");
  const weekLabel = document.getElementById("weekLabel");
  const prevWeekBtn = document.getElementById("prevWeek");
  const nextWeekBtn = document.getElementById("nextWeek");
  const popover = document.getElementById("cellPopover");
  const popoverDelete = document.getElementById("popoverDeleteBtn");
  const shiftTypeBtns = popover.querySelectorAll(".shift-type-btn");

  if (!tableBody) return;

  // ── Week computation ──
  function getWeekDates(offset) {
    const now = new Date(2026, 0, 27); // base: Mon Jan 27 2026
    const base = new Date(now);
    base.setDate(base.getDate() + offset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
  }

  function formatWeekRange(dates) {
    const first = dates[0];
    const last = dates[6];
    const fStr = first.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const lStr = last.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${fStr} – ${lStr}`;
  }

  function isToday(date) {
    const today = new Date(2026, 1, 2); // March 2, 2026 → simulate "today"
    return date.toDateString() === today.toDateString();
  }

  // ── Render ──
  function render() {
    const dates = getWeekDates(weekOffset);
    weekLabel.textContent = formatWeekRange(dates);

    renderHead(dates);
    renderBody(dates);
    renderFoot(dates);
  }

  function renderHead(dates) {
    // Remove old day headers (keep first and last th)
    while (tableHead.children[0].children.length > 2) {
      tableHead.children[0].children[1].remove();
    }
    const totalTh = tableHead.children[0].lastElementChild;

    dates.forEach((date, i) => {
      const th = document.createElement("th");
      th.className = `day-header${isToday(date) ? " today" : ""}`;
      th.innerHTML = `<span class="day-name">${DAYS[i]}</span><span class="day-date">${formatDate(date)}</span>`;
      tableHead.children[0].insertBefore(th, totalTh);
    });
  }

  function renderBody(dates) {
    tableBody.innerHTML = "";
    EMPLOYEES.forEach((emp) => {
      const tr = document.createElement("tr");

      // Employee cell
      const tdEmp = document.createElement("td");
      tdEmp.className = "employee-cell";
      tdEmp.innerHTML = `
        <div class="employee-info">
          <div class="employee-avatar" style="background: ${emp.color}20; color: ${emp.color}; border: 1px solid ${emp.color}30">${emp.initials}</div>
          <span class="employee-name">${emp.name}</span>
        </div>`;
      tr.appendChild(tdEmp);

      // Day cells
      let totalHours = 0;
      dates.forEach((_, dayIdx) => {
        const shiftType = schedule[emp.id][dayIdx] || null;
        const td = document.createElement("td");
        td.className = "shift-cell";
        td.dataset.empId = emp.id;
        td.dataset.dayIdx = dayIdx;

        if (shiftType) {
          const info = SHIFT_TYPES[shiftType];
          totalHours += info.hours;
          const pill = document.createElement("span");
          pill.className = `shift-pill ${info.cls}`;
          pill.textContent = info.label;
          pill.addEventListener("click", (e) => {
            e.stopPropagation();
            openPopover(td, emp.id, dayIdx, shiftType);
          });
          td.appendChild(pill);
        } else {
          const btn = document.createElement("button");
          btn.className = "add-btn";
          btn.textContent = "+";
          btn.setAttribute("aria-label", `Add shift for ${emp.name} on ${DAYS[dayIdx]}`);
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            openPopover(td, emp.id, dayIdx, null);
          });
          td.appendChild(btn);
        }
        tr.appendChild(td);
      });

      // Total hours cell
      const tdTotal = document.createElement("td");
      tdTotal.className = "total-cell";
      tdTotal.textContent = totalHours > 0 ? `${totalHours}h` : "—";
      tr.appendChild(tdTotal);

      tableBody.appendChild(tr);
    });
  }

  function renderFoot(dates) {
    // Remove old day totals
    while (tableFoot.children[0].children.length > 2) {
      tableFoot.children[0].children[1].remove();
    }
    const footTotal = tableFoot.children[0].lastElementChild;

    dates.forEach((_, dayIdx) => {
      const td = document.createElement("td");
      td.className = "foot-day-count";
      const count = EMPLOYEES.filter(
        (emp) => schedule[emp.id][dayIdx] && schedule[emp.id][dayIdx] !== "Day Off"
      ).length;
      td.textContent = count;
      tableFoot.children[0].insertBefore(td, footTotal);
    });
  }

  // ── Popover ──
  let activePopoverData = null;

  function openPopover(cellEl, empId, dayIdx, currentShift) {
    activePopoverData = { empId, dayIdx, currentShift };

    // Show/hide delete
    popoverDelete.hidden = currentShift === null;

    // Position
    const rect = cellEl.getBoundingClientRect();
    const pw = 200;
    let left = rect.left + rect.width / 2 - pw / 2;
    let top = rect.bottom + 8 + window.scrollY;

    // Clamp within viewport
    if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    if (left < 8) left = 8;

    popover.style.left = `${left + window.scrollX}px`;
    popover.style.top = `${top}px`;
    popover.style.minWidth = `${pw}px`;
    popover.hidden = false;

    // Highlight active type
    shiftTypeBtns.forEach((btn) => {
      btn.style.fontWeight = btn.dataset.type === currentShift ? "700" : "500";
      btn.style.background = btn.dataset.type === currentShift ? "rgba(56,189,248,0.08)" : "";
    });
  }

  function closePopover() {
    popover.hidden = true;
    activePopoverData = null;
  }

  shiftTypeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!activePopoverData) return;
      const { empId, dayIdx } = activePopoverData;
      schedule[empId][dayIdx] = btn.dataset.type;
      closePopover();
      render();
    });
  });

  popoverDelete.addEventListener("click", () => {
    if (!activePopoverData) return;
    const { empId, dayIdx } = activePopoverData;
    delete schedule[empId][dayIdx];
    closePopover();
    render();
  });

  document.addEventListener("click", (e) => {
    if (!popover.hidden && !popover.contains(e.target)) closePopover();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopover();
  });

  // ── Week navigation ──
  prevWeekBtn.addEventListener("click", () => {
    weekOffset--;
    closePopover();
    render();
  });

  nextWeekBtn.addEventListener("click", () => {
    weekOffset++;
    closePopover();
    render();
  });

  // ── Init ──
  render();
})();
