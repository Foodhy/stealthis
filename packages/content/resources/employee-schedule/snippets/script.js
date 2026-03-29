(function () {
  "use strict";

  /* ── Config ── */
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const WEEK_START = new Date(2026, 0, 27); // Jan 27, 2026

  const SHIFT_CFG = {
    morning: { label: "Morning", color: "#38bdf8", start: "06:00", end: "14:00", hours: 8 },
    afternoon: { label: "Afternoon", color: "#fb923c", start: "14:00", end: "22:00", hours: 8 },
    night: { label: "Night", color: "#a78bfa", start: "22:00", end: "06:00", hours: 8 },
    off: { label: "Off", color: "#334155", start: "", end: "", hours: 0 },
  };

  const AVATAR_COLORS = [
    "#38bdf8",
    "#a78bfa",
    "#fb923c",
    "#34d399",
    "#f87171",
    "#fbbf24",
    "#38bdf8",
    "#a78bfa",
  ];

  const employees = [
    { id: "e1", name: "Alice M.", role: "Manager", initials: "AM" },
    { id: "e2", name: "Bob K.", role: "Associate", initials: "BK" },
    { id: "e3", name: "Carol S.", role: "Lead", initials: "CS" },
    { id: "e4", name: "David R.", role: "Associate", initials: "DR" },
    { id: "e5", name: "Emma J.", role: "Senior", initials: "EJ" },
    { id: "e6", name: "Frank L.", role: "Intern", initials: "FL" },
    { id: "e7", name: "Grace H.", role: "Associate", initials: "GH" },
    { id: "e8", name: "Henry W.", role: "Senior", initials: "HW" },
  ];

  /* ── Schedule data: keyed by `${empId}:${dayIndex}` ── */
  let schedule = {
    "e1:0": { type: "morning", startTime: "06:00", endTime: "14:00" },
    "e1:1": { type: "morning", startTime: "06:00", endTime: "14:00" },
    "e1:2": { type: "morning", startTime: "06:00", endTime: "14:00" },
    "e1:3": { type: "morning", startTime: "06:00", endTime: "14:00" },
    "e1:4": { type: "morning", startTime: "06:00", endTime: "14:00" },
    "e2:0": { type: "afternoon", startTime: "14:00", endTime: "22:00" },
    "e2:1": { type: "afternoon", startTime: "14:00", endTime: "22:00" },
    "e2:2": { type: "afternoon", startTime: "14:00", endTime: "22:00" },
    "e2:3": { type: "afternoon", startTime: "14:00", endTime: "22:00" },
    "e2:4": { type: "off", startTime: "", endTime: "" },
    "e3:0": { type: "morning", startTime: "08:00", endTime: "16:00" },
    "e3:1": { type: "morning", startTime: "08:00", endTime: "16:00" },
    "e3:2": { type: "morning", startTime: "08:00", endTime: "16:00" },
    "e3:3": { type: "morning", startTime: "08:00", endTime: "16:00" },
    "e3:4": { type: "morning", startTime: "08:00", endTime: "16:00" },
    "e4:1": { type: "afternoon", startTime: "14:00", endTime: "22:00" },
    "e4:2": { type: "afternoon", startTime: "14:00", endTime: "22:00" },
    "e4:3": { type: "afternoon", startTime: "14:00", endTime: "22:00" },
    "e4:5": { type: "morning", startTime: "09:00", endTime: "17:00" },
    "e4:6": { type: "morning", startTime: "09:00", endTime: "17:00" },
    "e5:0": { type: "night", startTime: "22:00", endTime: "06:00" },
    "e5:1": { type: "night", startTime: "22:00", endTime: "06:00" },
    "e5:2": { type: "night", startTime: "22:00", endTime: "06:00" },
    "e5:4": { type: "afternoon", startTime: "12:00", endTime: "20:00" },
    "e6:0": { type: "morning", startTime: "09:00", endTime: "13:00" },
    "e6:1": { type: "morning", startTime: "09:00", endTime: "13:00" },
    "e6:2": { type: "morning", startTime: "09:00", endTime: "13:00" },
    "e6:3": { type: "morning", startTime: "09:00", endTime: "13:00" },
    "e6:4": { type: "morning", startTime: "09:00", endTime: "13:00" },
    "e7:0": { type: "afternoon", startTime: "14:00", endTime: "22:00" },
    "e7:2": { type: "afternoon", startTime: "14:00", endTime: "22:00" },
    "e7:4": { type: "afternoon", startTime: "14:00", endTime: "22:00" },
    "e7:5": { type: "morning", startTime: "09:00", endTime: "17:00" },
    "e8:1": { type: "morning", startTime: "07:00", endTime: "15:00" },
    "e8:2": { type: "morning", startTime: "07:00", endTime: "15:00" },
    "e8:3": { type: "morning", startTime: "07:00", endTime: "15:00" },
    "e8:4": { type: "morning", startTime: "07:00", endTime: "15:00" },
    "e8:6": { type: "night", startTime: "20:00", endTime: "04:00" },
  };

  let weekOffset = 0;
  let editingKey = null;
  let currentView = "week";
  let dayViewIndex = 0; // active day index (0=Mon … 6=Sun) when in day view

  /* ── Helpers ── */
  function getWeekStart() {
    const d = new Date(WEEK_START);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }

  function formatWeekLabel() {
    const ws = getWeekStart();
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
    if (currentView === "day") {
      const d = new Date(ws);
      d.setDate(ws.getDate() + dayViewIndex);
      return `${DAYS[dayViewIndex]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    return `Week of ${months[ws.getMonth()]} ${ws.getDate()}, ${ws.getFullYear()}`;
  }

  function calcHours(start, end) {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let diff = eh * 60 + em - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60;
    return Math.round((diff / 60) * 10) / 10;
  }

  function getTotalHours(empId) {
    let total = 0;
    for (let d = 0; d < 7; d++) {
      const shift = schedule[`${empId}:${d}`];
      if (shift && shift.type !== "off") {
        total += calcHours(shift.startTime, shift.endTime);
      }
    }
    return total;
  }

  function isConflict(empId, dayIdx) {
    const shift = schedule[`${empId}:${dayIdx}`];
    if (!shift) return false;
    const prevShift = schedule[`${empId}:${dayIdx - 1}`];
    if (prevShift && prevShift.type === "night" && shift.type === "morning") return true;
    return false;
  }

  function isToday(dayIdx) {
    const ws = getWeekStart();
    const cellDate = new Date(ws);
    cellDate.setDate(ws.getDate() + dayIdx);
    const now = new Date(2026, 2, 2); // demo today
    return cellDate.toDateString() === now.toDateString();
  }

  /* ── Render ── */
  function render() {
    document.getElementById("es-week-label").textContent = formatWeekLabel();
    renderEmployees();
    renderDayHeaders();
    renderRows();
    renderSummary();
  }

  function renderEmployees() {
    const list = document.getElementById("es-employee-list");
    list.innerHTML = "";
    employees.forEach((emp, idx) => {
      const row = document.createElement("div");
      row.className = "es-employee-row";

      const info = document.createElement("div");
      info.className = "es-employee-info";

      const av = document.createElement("div");
      av.className = "es-emp-avatar";
      av.textContent = emp.initials;
      av.style.background = AVATAR_COLORS[idx % AVATAR_COLORS.length];

      const meta = document.createElement("div");
      meta.className = "es-emp-meta";
      const name = document.createElement("div");
      name.className = "es-emp-name";
      name.textContent = emp.name;
      const role = document.createElement("div");
      role.className = "es-emp-role";
      role.textContent = emp.role;
      meta.appendChild(name);
      meta.appendChild(role);

      info.appendChild(av);
      info.appendChild(meta);

      const hours = document.createElement("div");
      hours.className = "es-emp-hours";
      hours.textContent = `${getTotalHours(emp.id)}h`;

      row.appendChild(info);
      row.appendChild(hours);
      list.appendChild(row);
    });
  }

  function renderDayHeaders() {
    const headersEl = document.getElementById("es-day-headers");
    headersEl.innerHTML = "";
    const ws = getWeekStart();

    const indices = currentView === "day" ? [dayViewIndex] : DAYS.map((_, i) => i);

    indices.forEach((idx) => {
      const cell = document.createElement("div");
      cell.className = "es-day-header-cell";
      if (isToday(idx)) cell.classList.add("today");

      const d = new Date(ws);
      d.setDate(ws.getDate() + idx);

      const dayName = document.createElement("span");
      dayName.className = "es-day-name";
      dayName.textContent = DAYS[idx];

      const dayDate = document.createElement("span");
      dayDate.className = "es-day-date";
      dayDate.textContent = d.getDate();

      cell.appendChild(dayName);
      cell.appendChild(dayDate);
      headersEl.appendChild(cell);
    });
  }

  function renderRows() {
    const rowsEl = document.getElementById("es-schedule-rows");
    rowsEl.innerHTML = "";

    const indices = currentView === "day" ? [dayViewIndex] : DAYS.map((_, i) => i);

    employees.forEach((emp) => {
      const row = document.createElement("div");
      row.className = "es-row";

      indices.forEach((dayIdx) => {
        const key = `${emp.id}:${dayIdx}`;
        const shift = schedule[key];
        const cell = document.createElement("div");
        cell.className = "es-cell";
        if (isConflict(emp.id, dayIdx)) cell.classList.add("conflict");

        if (shift && shift.type !== "off") {
          const cfg = SHIFT_CFG[shift.type] || SHIFT_CFG.morning;
          const block = document.createElement("div");
          block.className = "shift-block";
          block.style.background = cfg.color;

          const typeEl = document.createElement("span");
          typeEl.className = "shift-type";
          typeEl.textContent = cfg.label;

          const timeEl = document.createElement("span");
          timeEl.className = "shift-time";
          timeEl.textContent = `${shift.startTime} – ${shift.endTime}`;

          block.appendChild(typeEl);
          block.appendChild(timeEl);
          block.addEventListener("click", (e) => {
            e.stopPropagation();
            openPopup(key, shift);
          });
          cell.appendChild(block);
        } else if (shift && shift.type === "off") {
          const block = document.createElement("div");
          block.className = "shift-block";
          block.style.background = SHIFT_CFG.off.color;
          block.style.color = "#64748b";
          block.style.fontSize = "0.7rem";
          block.textContent = "OFF";
          block.addEventListener("click", (e) => {
            e.stopPropagation();
            openPopup(key, shift);
          });
          cell.appendChild(block);
        } else {
          const empty = document.createElement("div");
          empty.className = "es-cell-empty";
          empty.textContent = "+ Add";
          cell.appendChild(empty);
          cell.addEventListener("click", () => openPopup(key, null));
        }

        row.appendChild(cell);
      });

      rowsEl.appendChild(row);
    });
  }

  function renderSummary() {
    const sumEl = document.getElementById("es-summary-row");
    sumEl.innerHTML = "";

    const indices = currentView === "day" ? [dayViewIndex] : DAYS.map((_, i) => i);

    indices.forEach((dayIdx) => {
      const cell = document.createElement("div");
      cell.className = "es-summary-cell";
      let count = 0,
        totalH = 0;
      employees.forEach((emp) => {
        const shift = schedule[`${emp.id}:${dayIdx}`];
        if (shift && shift.type !== "off") {
          count++;
          totalH += calcHours(shift.startTime, shift.endTime);
        }
      });
      const countEl = document.createElement("div");
      countEl.className = "sum-count";
      countEl.textContent = `${count} shifts`;
      const hrsEl = document.createElement("div");
      hrsEl.className = "sum-hours";
      hrsEl.textContent = `${totalH}h coverage`;
      cell.appendChild(countEl);
      cell.appendChild(hrsEl);
      sumEl.appendChild(cell);
    });
  }

  /* ── Shift popup ── */
  const popup = document.getElementById("shift-popup");
  const overlay = document.getElementById("popup-overlay");
  const shiftType = document.getElementById("shift-type");
  const shiftStart = document.getElementById("shift-start");
  const shiftEnd = document.getElementById("shift-end");
  const shiftDelete = document.getElementById("shift-delete");
  const shiftTitle = document.getElementById("shift-popup-title");

  // Populate time selects
  (function populateTimes() {
    for (let h = 0; h < 24; h++) {
      for (let m of [0, 30]) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        const label = `${h % 12 || 12}:${mm} ${h < 12 ? "AM" : "PM"}`;
        const val = `${hh}:${mm}`;
        shiftStart.appendChild(new Option(label, val));
        shiftEnd.appendChild(new Option(label, val));
      }
    }
  })();

  shiftType.addEventListener("change", () => {
    const cfg = SHIFT_CFG[shiftType.value];
    if (cfg && cfg.start) {
      shiftStart.value = cfg.start;
      shiftEnd.value = cfg.end;
    }
  });

  function openPopup(key, shift) {
    editingKey = key;
    shiftTitle.textContent = shift ? "Edit Shift" : "Add Shift";
    shiftDelete.style.display = shift ? "block" : "none";
    shiftType.value = shift ? shift.type : "morning";
    const cfg = SHIFT_CFG[shiftType.value];
    shiftStart.value = shift ? shift.startTime || cfg.start : cfg.start;
    shiftEnd.value = shift ? shift.endTime || cfg.end : cfg.end;
    popup.classList.add("open");
    overlay.classList.add("visible");
  }

  function closePopup() {
    popup.classList.remove("open");
    overlay.classList.remove("visible");
    editingKey = null;
  }

  document.getElementById("shift-popup-close").addEventListener("click", closePopup);
  document.getElementById("shift-cancel").addEventListener("click", closePopup);
  overlay.addEventListener("click", closePopup);

  document.getElementById("shift-save").addEventListener("click", () => {
    if (!editingKey) return;
    schedule[editingKey] = {
      type: shiftType.value,
      startTime: shiftStart.value,
      endTime: shiftEnd.value,
    };
    closePopup();
    render();
  });

  shiftDelete.addEventListener("click", () => {
    if (!editingKey) return;
    delete schedule[editingKey];
    closePopup();
    render();
  });

  /* ── Navigation ── */
  document.getElementById("es-prev").addEventListener("click", () => {
    if (currentView === "day") {
      dayViewIndex--;
      if (dayViewIndex < 0) {
        dayViewIndex = 6;
        weekOffset--;
      }
    } else {
      weekOffset--;
    }
    render();
  });

  document.getElementById("es-next").addEventListener("click", () => {
    if (currentView === "day") {
      dayViewIndex++;
      if (dayViewIndex > 6) {
        dayViewIndex = 0;
        weekOffset++;
      }
    } else {
      weekOffset++;
    }
    render();
  });

  document.getElementById("es-today").addEventListener("click", () => {
    weekOffset = 0;
    dayViewIndex = 0;
    render();
  });

  /* ── View toggle ── */
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentView = btn.dataset.view;
      render();
    });
  });

  /* ── Copy previous week ── */
  document.getElementById("es-copy-prev").addEventListener("click", () => {
    schedule = { ...schedule };
    showToast("Previous week copied to current week");
  });

  /* ── Publish ── */
  document.getElementById("es-publish").addEventListener("click", () => {
    if (confirm("Publish this schedule to all employees? They will receive notifications.")) {
      showToast("Schedule published successfully!");
    }
  });

  /* ── Toast ── */
  let toastTimer;
  function showToast(msg) {
    const toast = document.getElementById("es-toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
  }

  /* ── Init ── */
  render();
})();
