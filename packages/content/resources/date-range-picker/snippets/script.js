(function () {
  "use strict";

  /* ── State ── */
  const TODAY = new Date(2026, 2, 2); // March 2, 2026 for demo
  let leftYear = TODAY.getFullYear();
  let leftMonth = TODAY.getMonth() - 1; // Feb
  if (leftMonth < 0) {
    leftMonth = 11;
    leftYear--;
  }
  let rightYear = TODAY.getFullYear();
  let rightMonth = TODAY.getMonth(); // Mar

  let startDate = null;
  let endDate = null;
  let hoverDate = null;
  let selecting = false; // true = waiting for end date

  // Pre-select a default range for demo
  startDate = new Date(2026, 1, 15); // Feb 15
  endDate = new Date(2026, 1, 22); // Feb 22

  /* ── Elements ── */
  const trigger = document.getElementById("drp-trigger");
  const triggerText = document.getElementById("drp-trigger-text");
  const dropdown = document.getElementById("drp-dropdown");
  const leftGrid = document.getElementById("drp-left-grid");
  const rightGrid = document.getElementById("drp-right-grid");
  const leftTitle = document.getElementById("drp-left-title");
  const rightTitle = document.getElementById("drp-right-title");
  const footerRange = document.getElementById("drp-footer-range");
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

  /* ── Open/close ── */
  trigger.addEventListener("click", toggleDropdown);
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
      closeDropdown();
    }
  });
  document.getElementById("drp-cancel").addEventListener("click", closeDropdown);
  document.getElementById("drp-apply").addEventListener("click", applyRange);

  function toggleDropdown() {
    const isOpen = dropdown.classList.contains("open");
    isOpen ? closeDropdown() : openDropdown();
  }

  function openDropdown() {
    dropdown.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    dropdown.removeAttribute("aria-hidden");
    renderBoth();
  }

  function closeDropdown() {
    dropdown.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
    dropdown.setAttribute("aria-hidden", "true");
    hoverDate = null;
    selecting = false;
  }

  function applyRange() {
    updateTriggerText();
    closeDropdown();
  }

  /* ── Navigation ── */
  document.getElementById("drp-prev").addEventListener("click", () => {
    leftMonth--;
    if (leftMonth < 0) {
      leftMonth = 11;
      leftYear--;
    }
    rightMonth = leftMonth + 1;
    rightYear = leftYear;
    if (rightMonth > 11) {
      rightMonth = 0;
      rightYear++;
    }
    renderBoth();
  });

  document.getElementById("drp-next").addEventListener("click", () => {
    rightMonth++;
    if (rightMonth > 11) {
      rightMonth = 0;
      rightYear++;
    }
    leftMonth = rightMonth - 1;
    leftYear = rightYear;
    if (leftMonth < 0) {
      leftMonth = 11;
      leftYear--;
    }
    renderBoth();
  });

  /* ── Grid-level hover delegation (survives DOM rebuilds) ── */
  function attachGridHover(grid) {
    grid.addEventListener("mouseover", (e) => {
      const btn = e.target.closest(".drp-day");
      if (!btn || btn.classList.contains("other-month") || btn.disabled) return;
      const ts = parseInt(btn.dataset.ts);
      if (!hoverDate || hoverDate.getTime() !== ts) {
        hoverDate = new Date(ts);
        renderBoth();
      }
    });
    grid.addEventListener("mouseleave", () => {
      if (hoverDate !== null) {
        hoverDate = null;
        renderBoth();
      }
    });
  }
  attachGridHover(leftGrid);
  attachGridHover(rightGrid);

  /* ── Render ── */
  function renderBoth() {
    leftTitle.textContent = `${MONTHS[leftMonth]} ${leftYear}`;
    rightTitle.textContent = `${MONTHS[rightMonth]} ${rightYear}`;
    renderMonth(leftGrid, leftYear, leftMonth);
    renderMonth(rightGrid, rightYear, rightMonth);
    updateFooter();
  }

  function renderMonth(grid, year, month) {
    grid.innerHTML = "";
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    for (let i = 0; i < 42; i++) {
      const btn = document.createElement("button");
      btn.className = "drp-day";
      let d;

      if (i < firstDay) {
        d = new Date(year, month - 1, prevMonthDays - firstDay + i + 1);
        btn.classList.add("other-month");
        btn.disabled = true;
      } else if (i >= firstDay + daysInMonth) {
        d = new Date(year, month + 1, i - firstDay - daysInMonth + 1);
        btn.classList.add("other-month");
        btn.disabled = true;
      } else {
        d = new Date(year, month, i - firstDay + 1);
        if (isSameDay(d, TODAY)) btn.classList.add("today");
      }

      btn.textContent = d.getDate();
      btn.dataset.ts = d.getTime();

      if (!btn.classList.contains("other-month")) {
        applyRangeClasses(btn, d);
      }

      btn.addEventListener("click", () => onDayClick(d));

      grid.appendChild(btn);
    }
  }

  function applyRangeClasses(btn, d) {
    const rangeStart = startDate;
    // Guard: only use hoverDate for preview when a start date is already selected
    const rangeEnd =
      selecting && hoverDate && startDate ? (hoverDate >= startDate ? hoverDate : null) : endDate;

    if (rangeStart && isSameDay(d, rangeStart)) btn.classList.add("range-start");
    if (rangeEnd && isSameDay(d, rangeEnd)) btn.classList.add("range-end");

    if (rangeStart && rangeEnd && d > rangeStart && d < rangeEnd) {
      btn.classList.add("in-range");
    }

    // Hover preview strip (only when actively selecting and start is set)
    if (selecting && hoverDate && startDate && hoverDate >= startDate) {
      if (d > startDate && d < hoverDate) {
        btn.classList.add("hover-range");
      }
    }
  }

  function onDayClick(d) {
    if (!selecting || !startDate) {
      // First click — set start
      startDate = d;
      endDate = null;
      selecting = true;
    } else {
      // Second click — set end
      if (d < startDate) {
        endDate = startDate;
        startDate = d;
      } else {
        endDate = d;
      }
      selecting = false;
    }

    // Mark custom preset as active
    document.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
    const customBtn = document.querySelector('[data-preset="custom"]');
    if (customBtn) customBtn.classList.add("active");

    renderBoth();
  }

  /* ── Footer & trigger text ── */
  function updateFooter() {
    if (startDate && endDate) {
      const days = Math.round((endDate - startDate) / 86400000) + 1;
      footerRange.textContent = `${fmtShort(startDate)} → ${fmtShort(endDate)}  ·  ${days} day${days !== 1 ? "s" : ""}`;
    } else if (startDate && selecting) {
      footerRange.textContent = `${fmtShort(startDate)} → …`;
    } else {
      footerRange.textContent = "No date selected";
    }
  }

  function updateTriggerText() {
    if (startDate && endDate) {
      triggerText.textContent = `${fmtShort(startDate)} – ${fmtShort(endDate)}`;
    } else if (startDate) {
      triggerText.textContent = fmtShort(startDate);
    } else {
      triggerText.textContent = "Select date range";
    }
  }

  /* ── Presets ── */
  document.getElementById("drp-presets").addEventListener("click", (e) => {
    const btn = e.target.closest(".preset-btn");
    if (!btn) return;

    document.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const preset = btn.dataset.preset;
    const now = new Date(TODAY);

    if (preset === "custom") {
      // Enter manual selection mode — clear so user can pick fresh
      startDate = null;
      endDate = null;
      selecting = false;
      hoverDate = null;
      updateTriggerText();
      renderBoth();
      return;
    }

    switch (preset) {
      case "today":
        startDate = new Date(now);
        endDate = new Date(now);
        break;
      case "yesterday": {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        startDate = y;
        endDate = new Date(y);
        break;
      }
      case "last7": {
        const s = new Date(now);
        s.setDate(s.getDate() - 6);
        startDate = s;
        endDate = new Date(now);
        break;
      }
      case "last30": {
        const s = new Date(now);
        s.setDate(s.getDate() - 29);
        startDate = s;
        endDate = new Date(now);
        break;
      }
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "thisQuarter": {
        const qStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), qStart, 1);
        endDate = new Date(now.getFullYear(), qStart + 3, 0);
        break;
      }
    }

    selecting = false;
    hoverDate = null;
    // Navigate left calendar to show start date
    if (startDate) {
      leftYear = startDate.getFullYear();
      leftMonth = startDate.getMonth();
      rightMonth = leftMonth + 1;
      rightYear = leftYear;
      if (rightMonth > 11) {
        rightMonth = 0;
        rightYear++;
      }
    }
    renderBoth();
  });

  /* ── Keyboard ── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });

  /* ── Helpers ── */
  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function fmtShort(d) {
    return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  /* ── Init ── */
  updateTriggerText();
  renderBoth();
})();
