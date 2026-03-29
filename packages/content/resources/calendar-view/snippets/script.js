(function () {
  "use strict";

  /* ── State ── */
  const today = new Date();
  let viewYear = 2026;
  let viewMonth = 1; // February — where the demo events are
  let viewDay = 15; // mid-month
  let currentView = "month";

  let events = [
    {
      id: "e1",
      title: "Team Standup",
      date: "2026-02-02",
      endDate: "2026-02-02",
      startTime: "09:00",
      endTime: "09:30",
      category: "meeting",
      color: "#38bdf8",
      notes: "Daily sync",
    },
    {
      id: "e2",
      title: "Team Standup",
      date: "2026-02-03",
      endDate: "2026-02-03",
      startTime: "09:00",
      endTime: "09:30",
      category: "meeting",
      color: "#38bdf8",
      notes: "Daily sync",
    },
    {
      id: "e3",
      title: "Team Standup",
      date: "2026-02-04",
      endDate: "2026-02-04",
      startTime: "09:00",
      endTime: "09:30",
      category: "meeting",
      color: "#38bdf8",
      notes: "Daily sync",
    },
    {
      id: "e4",
      title: "Team Standup",
      date: "2026-02-05",
      endDate: "2026-02-05",
      startTime: "09:00",
      endTime: "09:30",
      category: "meeting",
      color: "#38bdf8",
      notes: "Daily sync",
    },
    {
      id: "e5",
      title: "Team Standup",
      date: "2026-02-06",
      endDate: "2026-02-06",
      startTime: "09:00",
      endTime: "09:30",
      category: "meeting",
      color: "#38bdf8",
      notes: "Daily sync",
    },
    {
      id: "e6",
      title: "Product Review",
      date: "2026-02-04",
      endDate: "2026-02-04",
      startTime: "14:00",
      endTime: "15:30",
      category: "meeting",
      color: "#a78bfa",
      notes: "Q1 product review with stakeholders",
    },
    {
      id: "e7",
      title: "Design Sprint",
      date: "2026-02-10",
      endDate: "2026-02-12",
      startTime: "09:00",
      endTime: "17:00",
      category: "event",
      color: "#fb923c",
      notes: "3-day design sprint for new onboarding flow",
    },
    {
      id: "e8",
      title: "Q1 Planning",
      date: "2026-02-18",
      endDate: "2026-02-18",
      startTime: "10:00",
      endTime: "12:00",
      category: "meeting",
      color: "#f87171",
      notes: "Quarterly planning session",
    },
    {
      id: "e9",
      title: "All Hands",
      date: "2026-02-25",
      endDate: "2026-02-25",
      startTime: "11:00",
      endTime: "12:00",
      category: "meeting",
      color: "#34d399",
      notes: "Company all-hands meeting",
    },
    {
      id: "e10",
      title: "Team Standup",
      date: "2026-02-09",
      endDate: "2026-02-09",
      startTime: "09:00",
      endTime: "09:30",
      category: "meeting",
      color: "#38bdf8",
      notes: "Daily sync",
    },
    {
      id: "e11",
      title: "Team Standup",
      date: "2026-02-11",
      endDate: "2026-02-11",
      startTime: "09:00",
      endTime: "09:30",
      category: "meeting",
      color: "#38bdf8",
      notes: "Daily sync",
    },
  ];

  let nextId = 20;
  let selectedColor = "#38bdf8";
  let editingEventId = null;

  /* ── Elements ── */
  const grid = document.getElementById("cal-grid");
  const monthLabel = document.getElementById("cal-month-label");
  const backdrop = document.getElementById("modal-backdrop");
  const modalTitle = document.getElementById("modal-title");
  const eventId = document.getElementById("event-id");
  const eventTitle = document.getElementById("event-title");
  const eventDate = document.getElementById("event-date");
  const eventEndDate = document.getElementById("event-end-date");
  const eventStartTime = document.getElementById("event-start-time");
  const eventEndTime = document.getElementById("event-end-time");
  const eventCategory = document.getElementById("event-category");
  const eventNotes = document.getElementById("event-notes");
  const colorSwatches = document.getElementById("color-swatches");
  const modalDelete = document.getElementById("modal-delete");

  /* ── Time options ── */
  (function populateTimes() {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m of [0, 30]) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        const ampm = h < 12 ? "AM" : "PM";
        const displayH = h % 12 || 12;
        times.push({ val: `${hh}:${mm}`, label: `${displayH}:${mm} ${ampm}` });
      }
    }
    times.forEach((t) => {
      const o1 = new Option(t.label, t.val);
      const o2 = new Option(t.label, t.val);
      eventStartTime.appendChild(o1);
      eventEndTime.appendChild(o2);
    });
    eventStartTime.value = "09:00";
    eventEndTime.value = "10:00";
  })();

  /* ── Month/Week navigation ── */
  document.getElementById("cal-prev").addEventListener("click", () => {
    if (currentView === "week") {
      const ws = getWeekStart(viewYear, viewMonth, viewDay || 1);
      ws.setDate(ws.getDate() - 7);
      viewYear = ws.getFullYear();
      viewMonth = ws.getMonth();
      viewDay = ws.getDate() + 3; // middle of week
    } else {
      viewMonth--;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
      }
    }
    renderView();
  });

  document.getElementById("cal-next").addEventListener("click", () => {
    if (currentView === "week") {
      const ws = getWeekStart(viewYear, viewMonth, viewDay || 1);
      ws.setDate(ws.getDate() + 7);
      viewYear = ws.getFullYear();
      viewMonth = ws.getMonth();
      viewDay = ws.getDate() + 3;
    } else {
      viewMonth++;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
      }
    }
    renderView();
  });

  document.getElementById("cal-today").addEventListener("click", () => {
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    viewDay = today.getDate();
    renderView();
  });

  /* ── View toggle ── */
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentView = btn.dataset.view; // get 'month' or 'week' from data-view attribute
      renderView();
    });
  });

  /* ── New event button ── */
  document.getElementById("cal-new-event").addEventListener("click", () => openModal(null));

  /* ── Color swatches ── */
  colorSwatches.addEventListener("click", (e) => {
    const swatch = e.target.closest(".swatch");
    if (!swatch) return;
    colorSwatches.querySelectorAll(".swatch").forEach((s) => s.classList.remove("active"));
    swatch.classList.add("active");
    selectedColor = swatch.dataset.color;
  });

  /* ── Modal controls ── */
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.getElementById("modal-save").addEventListener("click", saveEvent);
  modalDelete.addEventListener("click", deleteEvent);

  /* ── Keyboard ── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  /* ── renderView dispatcher ── */
  function renderView() {
    if (currentView === "week") {
      renderWeekView();
    } else {
      renderCalendar();
    }
  }

  /* ── Render calendar (month view) ── */
  function renderCalendar() {
    // Hide week grid if it exists, show month grid
    const weekGrid = document.getElementById("week-grid");
    if (weekGrid) weekGrid.style.display = "none";
    grid.style.display = "grid";

    const MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    monthLabel.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    grid.innerHTML = "";

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    // Total cells: always 6 rows × 7 cols = 42
    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement("div");
      cell.className = "cal-cell";

      let cellDate;
      if (i < firstDay) {
        // Previous month
        const d = prevMonthDays - firstDay + i + 1;
        cellDate = new Date(viewYear, viewMonth - 1, d);
        cell.classList.add("other-month");
      } else if (i >= firstDay + daysInMonth) {
        // Next month
        const d = i - firstDay - daysInMonth + 1;
        cellDate = new Date(viewYear, viewMonth + 1, d);
        cell.classList.add("other-month");
      } else {
        // Current month
        const d = i - firstDay + 1;
        cellDate = new Date(viewYear, viewMonth, d);
        if (isSameDay(cellDate, today)) cell.classList.add("today");
      }

      const dateStr = formatDate(cellDate);

      // Date number
      const dateNum = document.createElement("span");
      dateNum.className = "cal-date-num";
      dateNum.textContent = cellDate.getDate();
      cell.appendChild(dateNum);

      // Events for this cell
      const cellEvents = getEventsForDate(cellDate);
      const maxVisible = 2;
      cellEvents.slice(0, maxVisible).forEach((ev) => {
        const pill = createEventPill(ev, cellDate);
        cell.appendChild(pill);
      });
      if (cellEvents.length > maxVisible) {
        const more = document.createElement("span");
        more.className = "cal-more-link";
        more.textContent = `+${cellEvents.length - maxVisible} more`;
        cell.appendChild(more);
      }

      // Click cell to add event
      cell.addEventListener("click", (e) => {
        if (e.target.closest(".cal-event-pill")) return;
        openModal(null, dateStr);
      });

      grid.appendChild(cell);
    }
  }

  /* ── Render week view ── */
  function renderWeekView() {
    const MONTHS_SHORT = [
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

    const startOfWeek = getWeekStart(viewYear, viewMonth, viewDay || 1);

    // Update the label to show the week range
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    monthLabel.textContent = `${MONTHS_SHORT[startOfWeek.getMonth()]} ${startOfWeek.getDate()} \u2013 ${MONTHS_SHORT[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;

    // Hide month grid, show week grid
    grid.style.display = "none";

    let weekGrid = document.getElementById("week-grid");
    if (!weekGrid) {
      weekGrid = document.createElement("div");
      weekGrid.id = "week-grid";
      weekGrid.className = "week-grid";
      grid.parentNode.insertBefore(weekGrid, grid.nextSibling);
    }
    weekGrid.style.display = "grid";
    weekGrid.innerHTML = "";

    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + d);
      const isToday = isSameDay(dayDate, today);

      const col = document.createElement("div");
      col.className = `week-col${isToday ? " week-col--today" : ""}`;

      // Day header
      const header = document.createElement("div");
      header.className = "week-day-header";
      header.innerHTML = `<span class="week-day-name">${DAY_NAMES[dayDate.getDay()]}</span><span class="week-day-num${isToday ? " today-num" : ""}">${dayDate.getDate()}</span>`;
      col.appendChild(header);

      // Click column to add event
      col.addEventListener("click", (e) => {
        if (e.target.closest(".week-event-pill")) return;
        openModal(null, formatDate(dayDate));
      });

      // Events for this day
      const dayEvents = getEventsForDate(dayDate);
      dayEvents.forEach((ev) => {
        const pill = document.createElement("button");
        pill.className = "week-event-pill";
        pill.style.background = ev.color;
        pill.innerHTML = `<span class="week-event-time">${ev.startTime}</span><span class="week-event-title">${ev.title}</span>`;
        pill.addEventListener("click", (e) => {
          e.stopPropagation();
          openModal(ev.id);
        });
        col.appendChild(pill);
      });

      weekGrid.appendChild(col);
    }
  }

  /* ── Get Monday (Sunday) of the week ── */
  function getWeekStart(year, month, day) {
    const d = new Date(year, month, day);
    const dow = d.getDay(); // 0=Sun
    d.setDate(d.getDate() - dow); // Go to Sunday
    return d;
  }

  function createEventPill(ev, cellDate) {
    const pill = document.createElement("button");
    pill.className = "cal-event-pill";

    const startDate = parseDate(ev.date);
    const endDate = parseDate(ev.endDate || ev.date);
    const isMultiDay = !isSameDay(startDate, endDate);

    if (isMultiDay) {
      if (isSameDay(cellDate, startDate)) {
        pill.classList.add("multi-start");
        pill.textContent = ev.title;
      } else if (isSameDay(cellDate, endDate)) {
        pill.classList.add("multi-end");
        pill.textContent = ev.title;
      } else {
        pill.classList.add("multi-mid");
        pill.textContent = ev.title;
      }
    } else {
      pill.textContent = ev.title;
    }

    pill.style.background = ev.color;
    pill.title = `${ev.title} — ${ev.startTime}`;
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(ev.id);
    });
    return pill;
  }

  function getEventsForDate(date) {
    const dateStr = formatDate(date);
    return events
      .filter((ev) => {
        const start = ev.date;
        const end = ev.endDate || ev.date;
        return dateStr >= start && dateStr <= end;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  /* ── Modal ── */
  function openModal(id, dateStr) {
    editingEventId = id || null;
    selectedColor = "#38bdf8";

    if (id) {
      const ev = events.find((e) => e.id === id);
      if (!ev) return;
      modalTitle.textContent = "Edit Event";
      eventId.value = ev.id;
      eventTitle.value = ev.title;
      eventDate.value = ev.date;
      eventEndDate.value = ev.endDate || ev.date;
      eventStartTime.value = ev.startTime;
      eventEndTime.value = ev.endTime;
      eventCategory.value = ev.category;
      eventNotes.value = ev.notes || "";
      selectedColor = ev.color;
      modalDelete.style.display = "block";
    } else {
      modalTitle.textContent = "New Event";
      eventId.value = "";
      eventTitle.value = "";
      eventDate.value = dateStr || formatDate(today);
      eventEndDate.value = dateStr || formatDate(today);
      eventStartTime.value = "09:00";
      eventEndTime.value = "10:00";
      eventCategory.value = "meeting";
      eventNotes.value = "";
      modalDelete.style.display = "none";
    }

    // Sync swatch selection
    colorSwatches.querySelectorAll(".swatch").forEach((s) => {
      s.classList.toggle("active", s.dataset.color === selectedColor);
    });

    backdrop.classList.add("open");
    backdrop.removeAttribute("aria-hidden");
    eventTitle.focus();
  }

  function closeModal() {
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
    editingEventId = null;
  }

  function saveEvent() {
    const title = eventTitle.value.trim();
    if (!title) {
      eventTitle.focus();
      return;
    }

    const ev = {
      id: editingEventId || `e${nextId++}`,
      title,
      date: eventDate.value,
      endDate: eventEndDate.value || eventDate.value,
      startTime: eventStartTime.value,
      endTime: eventEndTime.value,
      category: eventCategory.value,
      color: selectedColor,
      notes: eventNotes.value.trim(),
    };

    if (editingEventId) {
      const idx = events.findIndex((e) => e.id === editingEventId);
      if (idx > -1) events[idx] = ev;
    } else {
      events.push(ev);
    }

    closeModal();
    renderView();
  }

  function deleteEvent() {
    if (!editingEventId) return;
    events = events.filter((e) => e.id !== editingEventId);
    closeModal();
    renderView();
  }

  /* ── Helpers ── */
  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function parseDate(str) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  /* ── Init ── */
  renderView();
})();
