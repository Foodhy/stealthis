(function () {
  "use strict";

  /* ── Config ── */
  const TODAY = new Date(2026, 2, 2); // Mar 2, 2026
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
  const LONG_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const SHORT_MONTHS = [
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

  // Blocked specific dates (0-indexed month, day): unavailable weekdays
  const BLOCKED = [
    "2026-02-13",
    "2026-02-20",
    "2026-03-06",
    "2026-03-13",
    "2026-03-20",
    "2026-03-27",
  ];

  // Pre-booked time slots (stored in UTC-5 base)
  const BOOKED_SLOTS = {
    "2026-02-18": ["11:00", "14:30", "16:00"],
    "2026-02-24": ["09:00", "10:30"],
    "2026-03-09": ["13:00", "15:00"],
    "2026-03-10": ["09:00", "10:30"],
    "2026-03-11": ["11:00", "14:00"],
    "2026-03-16": ["09:30", "13:00", "15:30"],
    "2026-03-17": ["10:00"],
    "2026-03-18": ["11:00", "16:00"],
  };

  let calYear = 2026;
  let calMonth = 2; // March
  let selectedDate = null;
  let selectedSlot = null;
  let tzOffset = -5; // default UTC-5

  /* ── Screens ── */
  function showScreen(id) {
    ["screen-slots", "screen-form", "screen-success"].forEach((s) => {
      const el = document.getElementById(s);
      el.style.display = s === id ? "block" : "none";
    });
  }

  /* ── Calendar render ── */
  function renderCalendar() {
    document.getElementById("av-cal-title").textContent = `${MONTHS[calMonth]} ${calYear}`;
    const grid = document.getElementById("av-cal-grid");
    grid.innerHTML = "";

    // Week starts Monday (ISO)
    const firstDayOfMonth = new Date(calYear, calMonth, 1);
    let startDay = firstDayOfMonth.getDay(); // 0=Sun
    startDay = startDay === 0 ? 6 : startDay - 1; // convert to Mon=0

    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevDays = new Date(calYear, calMonth, 0).getDate();

    for (let i = 0; i < 42; i++) {
      const btn = document.createElement("button");
      btn.className = "av-day";
      let d;

      if (i < startDay) {
        d = new Date(calYear, calMonth - 1, prevDays - startDay + i + 1);
        btn.classList.add("other-month");
        btn.textContent = d.getDate();
        btn.disabled = true;
      } else if (i >= startDay + daysInMonth) {
        d = new Date(calYear, calMonth + 1, i - startDay - daysInMonth + 1);
        btn.classList.add("other-month");
        btn.textContent = d.getDate();
        btn.disabled = true;
      } else {
        const dayNum = i - startDay + 1;
        d = new Date(calYear, calMonth, dayNum);
        btn.textContent = dayNum;

        const dateStr = formatDateISO(d);
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const isPast = d < new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
        const isBlocked = BLOCKED.includes(dateStr);

        if (!isWeekend && !isPast && !isBlocked) {
          btn.classList.add("available");
          btn.addEventListener("click", () => selectDate(d));
        }

        if (isSameDay(d, TODAY)) btn.classList.add("today");
        if (selectedDate && isSameDay(d, selectedDate)) btn.classList.add("selected");
      }

      grid.appendChild(btn);
    }
  }

  /* ── Select date ── */
  function selectDate(d) {
    selectedDate = d;
    selectedSlot = null;
    renderCalendar();

    const slotsCol = document.getElementById("av-slots-col");
    const divider = document.getElementById("av-divider");
    slotsCol.style.display = "flex";
    divider.style.display = "block";

    const DAYS_LONG = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    document.getElementById("av-slots-day").textContent =
      `${DAYS_LONG[d.getDay()]}, ${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;

    renderSlots();
  }

  /* ── Render slots ── */
  function renderSlots() {
    const list = document.getElementById("av-slots-list");
    list.innerHTML = "";

    const dateStr = selectedDate ? formatDateISO(selectedDate) : "";
    const booked = BOOKED_SLOTS[dateStr] || [];

    // Generate 9am-5pm in 30min intervals in base UTC-5
    for (let hour = 9; hour < 17; hour++) {
      for (let min of [0, 30]) {
        const baseH = hour;
        const baseM = min;

        // Apply tz offset (tzOffset relative to -5 base)
        const diff = tzOffset - -5;
        let displayH = baseH + diff;
        let displayM = baseM;
        if (displayH < 0) displayH += 24;
        if (displayH >= 24) displayH -= 24;

        const slotKey = `${String(baseH).padStart(2, "0")}:${String(baseM).padStart(2, "0")}`;
        const isBooked = booked.includes(slotKey);

        const ampm = displayH < 12 ? "AM" : "PM";
        const h12 = displayH % 12 || 12;
        const displayLabel = `${h12}:${String(displayM).padStart(2, "0")} ${ampm}`;

        const slotWrap = document.createElement("div");
        slotWrap.className = "av-slot";

        const slotBtn = document.createElement("button");
        slotBtn.className = `av-slot-btn${isBooked ? " booked" : ""}`;
        slotBtn.textContent = displayLabel;
        slotBtn.disabled = isBooked;
        slotBtn.dataset.slot = slotKey;
        slotBtn.dataset.label = displayLabel;

        const confirmWrap = document.createElement("div");
        confirmWrap.className = "av-slot-confirm";

        const confirmBtn = document.createElement("button");
        confirmBtn.className = "av-confirm-btn";
        confirmBtn.textContent = "Confirm";
        confirmWrap.appendChild(confirmBtn);

        if (!isBooked) {
          slotBtn.addEventListener("click", () => {
            // Deselect all other slots
            document
              .querySelectorAll(".av-slot-btn")
              .forEach((b) => b.classList.remove("selected"));
            document
              .querySelectorAll(".av-slot-confirm")
              .forEach((c) => c.classList.remove("visible"));

            const alreadySelected = selectedSlot === slotKey;
            if (alreadySelected) {
              selectedSlot = null;
            } else {
              selectedSlot = slotKey;
              slotBtn.classList.add("selected");
              confirmWrap.classList.add("visible");
            }
          });

          confirmBtn.addEventListener("click", () => {
            openBookingForm(slotBtn.dataset.label);
          });
        }

        slotWrap.appendChild(slotBtn);
        slotWrap.appendChild(confirmWrap);
        list.appendChild(slotWrap);
      }
    }
  }

  /* ── Booking form ── */
  function openBookingForm(slotLabel) {
    const info = document.getElementById("av-booking-info");
    const DAYS_LONG = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dateLabel = selectedDate
      ? `${DAYS_LONG[selectedDate.getDay()]}, ${SHORT_MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
      : "";

    info.innerHTML = `
      <div class="av-booking-detail">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        <span>${dateLabel}</span>
      </div>
      <div class="av-booking-detail">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        <span>${slotLabel}</span> · 30 min
      </div>
    `;

    showScreen("screen-form");
  }

  /* ── Form submit ── */
  document.getElementById("av-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("av-name").value.trim();
    const email = document.getElementById("av-email").value.trim();
    if (!name || !email) return;

    showSuccessScreen(name);
  });

  document.getElementById("av-back").addEventListener("click", () => showScreen("screen-slots"));

  /* ── Success screen ── */
  function showSuccessScreen(name) {
    const DAYS_LONG = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dateLabel = selectedDate
      ? `${DAYS_LONG[selectedDate.getDay()]}, ${SHORT_MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
      : "";

    const slotLabel =
      document.querySelector(".av-slot-btn.selected")?.dataset.label || selectedSlot || "";

    const details = document.getElementById("av-success-details");
    details.innerHTML = `
      <div class="av-detail-row">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        <span>${dateLabel}</span>
      </div>
      <div class="av-detail-row">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        <span>${slotLabel}</span>
      </div>
      <div class="av-detail-row">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m12 8-3.5 4 3.5 2.5 3.5-2.5z"/></svg>
        30-minute call with James Doe
      </div>
    `;

    showScreen("screen-success");
  }

  document.getElementById("av-add-cal").addEventListener("click", () => {
    alert("In a real app, this would download an .ics file or open Google Calendar.");
  });

  document.getElementById("av-schedule-another").addEventListener("click", () => {
    selectedDate = null;
    selectedSlot = null;
    document.getElementById("av-slots-col").style.display = "none";
    document.getElementById("av-divider").style.display = "none";
    document.getElementById("av-name").value = "";
    document.getElementById("av-email").value = "";
    document.getElementById("av-notes").value = "";
    renderCalendar();
    showScreen("screen-slots");
  });

  /* ── Navigation ── */
  document.getElementById("av-prev").addEventListener("click", () => {
    calMonth--;
    if (calMonth < 0) {
      calMonth = 11;
      calYear--;
    }
    renderCalendar();
  });
  document.getElementById("av-next").addEventListener("click", () => {
    calMonth++;
    if (calMonth > 11) {
      calMonth = 0;
      calYear++;
    }
    renderCalendar();
  });

  /* ── Timezone ── */
  document.getElementById("av-tz-select").addEventListener("change", (e) => {
    tzOffset = parseInt(e.target.value);
    if (selectedDate) renderSlots();
  });

  /* ── Helpers ── */
  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function formatDateISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  /* ── Init ── */
  renderCalendar();
  showScreen("screen-slots");
})();
