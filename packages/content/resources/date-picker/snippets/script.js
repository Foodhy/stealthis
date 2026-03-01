(function () {
  "use strict";

  const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function today() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function sameDay(a, b) {
    return a && b && a.toDateString() === b.toDateString();
  }

  function isBefore(a, b) {
    return a && b && a < b;
  }

  function isBetween(d, start, end) {
    if (!start || !end) return false;
    const lo = isBefore(start, end) ? start : end;
    const hi = isBefore(start, end) ? end   : start;
    return d > lo && d < hi;
  }

  function formatDate(d) {
    if (!d) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  // ── Calendar builder ─────────────────────────────────────────────────────────

  function buildCalendar(calEl, opts) {
    // opts: { year, month, selected, rangeStart, rangeEnd, hoverDate, onSelect, onHover, disablePast }
    calEl.innerHTML = "";

    const year  = opts.year;
    const month = opts.month;
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const totalDays = daysInMonth(year, month);
    const now   = today();

    // Header
    const header = el("div", "cal-header");
    const prevBtn = el("button", "cal-nav-btn");
    prevBtn.innerHTML = "‹";
    prevBtn.setAttribute("aria-label", "Previous month");
    prevBtn.addEventListener("click", function () {
      opts.onMonthChange(-1);
    });

    const nextBtn = el("button", "cal-nav-btn");
    nextBtn.innerHTML = "›";
    nextBtn.setAttribute("aria-label", "Next month");
    nextBtn.addEventListener("click", function () {
      opts.onMonthChange(1);
    });

    const label = el("span", "cal-month-label");
    label.textContent = MONTHS[month] + " " + year;

    header.appendChild(prevBtn);
    header.appendChild(label);
    header.appendChild(nextBtn);
    calEl.appendChild(header);

    // Weekdays
    const wdRow = el("div", "cal-weekdays");
    DAYS_OF_WEEK.forEach(function (d) {
      const wd = el("span", "cal-weekday");
      wd.textContent = d;
      wdRow.appendChild(wd);
    });
    calEl.appendChild(wdRow);

    // Days
    const grid = el("div", "cal-days");

    // Ghost days from prev month
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      const ghost = el("button", "cal-day cal-day--ghost");
      ghost.textContent = prevMonthDays - i;
      ghost.disabled = true;
      grid.appendChild(ghost);
    }

    // Real days
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const btn = el("button", "cal-day");
      btn.textContent = d;
      btn.setAttribute("data-date", date.toISOString());
      btn.setAttribute("aria-label", formatDate(date));

      // Today
      if (sameDay(date, now)) btn.classList.add("cal-day--today");

      // Disabled (past dates)
      if (opts.disablePast && date < now) {
        btn.disabled = true;
        btn.classList.add("cal-day--disabled");
      }

      // Selected single
      if (!opts.rangeStart && sameDay(date, opts.selected)) {
        btn.classList.add("cal-day--selected");
      }

      // Range: start
      if (opts.rangeStart && sameDay(date, opts.rangeStart)) {
        btn.classList.add("cal-day--selected", "cal-day--range-start");
      }

      // Range: end
      const effectiveEnd = opts.rangeEnd || opts.hoverDate;
      if (opts.rangeStart && effectiveEnd && sameDay(date, effectiveEnd) && !sameDay(date, opts.rangeStart)) {
        btn.classList.add("cal-day--selected-end");
      }

      // Range: in-between
      if (opts.rangeStart && isBetween(date, opts.rangeStart, effectiveEnd)) {
        btn.classList.add("cal-day--in-range");
      }

      btn.addEventListener("click", function () {
        if (opts.onSelect) opts.onSelect(date);
      });

      if (opts.onHover) {
        btn.addEventListener("mouseenter", function () {
          opts.onHover(date);
        });
      }

      grid.appendChild(btn);
    }

    // Ghost days for next month to fill the grid
    const totalCells = Math.ceil((firstDay + totalDays) / 7) * 7;
    for (let i = 1; i <= totalCells - firstDay - totalDays; i++) {
      const ghost = el("button", "cal-day cal-day--ghost");
      ghost.textContent = i;
      ghost.disabled = true;
      grid.appendChild(ghost);
    }

    calEl.appendChild(grid);
  }

  function el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  // ── Demo 1: Single date picker ───────────────────────────────────────────────

  (function () {
    const input  = document.getElementById("single-input");
    const calEl  = document.getElementById("cal-single");
    const wrap   = document.getElementById("dp-single");
    let open     = false;
    let selected = null;
    let viewYear = today().getFullYear();
    let viewMonth = today().getMonth();

    function render() {
      buildCalendar(calEl, {
        year: viewYear, month: viewMonth,
        selected: selected,
        disablePast: false,
        onMonthChange: function (d) {
          viewMonth += d;
          if (viewMonth > 11) { viewMonth = 0; viewYear++; }
          if (viewMonth < 0)  { viewMonth = 11; viewYear--; }
          render();
        },
        onSelect: function (date) {
          selected = date;
          input.value = formatDate(date);
          close();
        },
      });
    }

    function open_() {
      open = true;
      calEl.removeAttribute("hidden");
      input.setAttribute("aria-expanded", "true");
      render();
    }

    function close() {
      open = false;
      calEl.setAttribute("hidden", "");
      input.setAttribute("aria-expanded", "false");
    }

    input.addEventListener("click", function () { open ? close() : open_(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open ? close() : open_(); }
      if (e.key === "Escape") close();
    });

    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) close();
    });
  })();

  // ── Demo 2: Date range picker ────────────────────────────────────────────────

  (function () {
    const startInput = document.getElementById("range-start");
    const endInput   = document.getElementById("range-end");
    const calEl      = document.getElementById("cal-range");
    const wrap       = document.getElementById("dp-range");

    let open      = false;
    let rangeStart = null;
    let rangeEnd   = null;
    let hoverDate  = null;
    let picking    = "start"; // "start" | "end"
    let viewYear   = today().getFullYear();
    let viewMonth  = today().getMonth();

    function render() {
      buildCalendar(calEl, {
        year: viewYear, month: viewMonth,
        rangeStart: rangeStart,
        rangeEnd: rangeEnd,
        hoverDate: hoverDate,
        disablePast: false,
        onMonthChange: function (d) {
          viewMonth += d;
          if (viewMonth > 11) { viewMonth = 0; viewYear++; }
          if (viewMonth < 0)  { viewMonth = 11; viewYear--; }
          render();
        },
        onSelect: function (date) {
          if (picking === "start") {
            rangeStart = date;
            rangeEnd   = null;
            picking    = "end";
            startInput.value = formatDate(date);
            endInput.value   = "";
          } else {
            // If end before start, swap
            if (date < rangeStart) {
              rangeEnd   = rangeStart;
              rangeStart = date;
            } else {
              rangeEnd = date;
            }
            picking = "start";
            startInput.value = formatDate(rangeStart);
            endInput.value   = formatDate(rangeEnd);
            close();
          }
          render();
        },
        onHover: function (date) {
          if (picking === "end") {
            hoverDate = date;
            render();
          }
        },
      });
    }

    function open_() {
      open = true;
      calEl.removeAttribute("hidden");
      render();
    }

    function close() {
      open = false;
      calEl.setAttribute("hidden", "");
    }

    [startInput, endInput].forEach(function (inp) {
      inp.addEventListener("click", function () { open ? close() : open_(); });
    });

    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) close();
    });
  })();

  // ── Demo 3: Inline calendar ──────────────────────────────────────────────────

  (function () {
    const calEl   = document.getElementById("cal-inline");
    const valueEl = document.getElementById("inline-value");
    let selected  = null;
    let viewYear  = today().getFullYear();
    let viewMonth = today().getMonth();

    function render() {
      buildCalendar(calEl, {
        year: viewYear, month: viewMonth,
        selected: selected,
        disablePast: false,
        onMonthChange: function (d) {
          viewMonth += d;
          if (viewMonth > 11) { viewMonth = 0; viewYear++; }
          if (viewMonth < 0)  { viewMonth = 11; viewYear--; }
          render();
        },
        onSelect: function (date) {
          selected = date;
          valueEl.textContent = "Selected: " + formatDate(date);
          render();
        },
      });
    }

    render();
  })();

})();
