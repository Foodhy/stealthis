(function () {
  "use strict";

  const form = document.getElementById("tor-form");
  const startInput = document.getElementById("start-date");
  const endInput = document.getElementById("end-date");
  const daysWrap = document.getElementById("days-display");
  const daysText = document.getElementById("days-text");
  const errorEl = document.getElementById("tor-error");
  const submitBtn = document.getElementById("tor-submit");
  const list = document.getElementById("tor-list");

  if (!form) return;

  /* ── Day calculation ─────────────────────────────────── */
  function calcDays() {
    const start = startInput.value;
    const end = endInput.value;

    if (!start || !end) {
      daysText.textContent = "Select dates to calculate duration";
      daysWrap.classList.remove("has-days");
      return null;
    }

    const startDate = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");
    const diff = Math.round((endDate - startDate) / 86_400_000);

    if (diff < 0) {
      daysText.textContent = "End date must be after start date";
      daysWrap.classList.remove("has-days");
      return -1;
    }

    const days = diff + 1; // inclusive of both start and end
    daysText.textContent = days === 1 ? "1 day" : `${days} days`;
    daysWrap.classList.add("has-days");
    return days;
  }

  startInput.addEventListener("change", calcDays);
  endInput.addEventListener("change", calcDays);

  /* ── Format a date string "YYYY-MM-DD" as "Mon DD, YYYY" ── */
  function formatDate(isoStr) {
    const d = new Date(isoStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  /* ── Build a range label ─────────────────────────────── */
  function buildRange(start, end) {
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");

    const sLabel = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (start === end) return formatDate(start);

    // Same month + year: "Mar 3–7, 2026"
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
      return `${sLabel}–${e.getDate()}, ${e.getFullYear()}`;
    }

    // Different month: "Mar 28 – Apr 1, 2026"
    const eLabel = e.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${sLabel} – ${eLabel}, ${e.getFullYear()}`;
  }

  /* ── Map select value → display label ───────────────── */
  const typeLabels = {
    vacation: "Vacation",
    sick: "Sick Leave",
    personal: "Personal",
    parental: "Parental Leave",
    bereavement: "Bereavement",
  };

  /* ── Calendar SVG shared markup ─────────────────────── */
  const calIcon = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>`;

  /* ── Prepend new item to the request list ────────────── */
  function prependRequest(range, typeLabel) {
    const li = document.createElement("li");
    li.className = "tor-item";
    li.dataset.status = "pending";
    li.innerHTML = `
      <div class="tor-item__meta">
        ${calIcon}
        <span class="tor-item__range">${range}</span>
        <span class="tor-item__type">${typeLabel}</span>
      </div>
      <span class="tor-badge tor-badge--pending">Pending</span>
    `;
    list.insertBefore(li, list.firstChild);
  }

  /* ── Show / hide error ───────────────────────────────── */
  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }

  /* ── Submit handler ──────────────────────────────────── */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    const leaveTypeEl = document.getElementById("leave-type");
    const leaveType = leaveTypeEl.value;
    const start = startInput.value;
    const end = endInput.value;

    // Validation
    if (!leaveType) {
      showError("Please select a leave type.");
      leaveTypeEl.focus();
      return;
    }

    if (!start || !end) {
      showError("Please select both a start date and an end date.");
      (start ? endInput : startInput).focus();
      return;
    }

    const days = calcDays();
    if (days < 0) {
      showError("End date must be on or after start date.");
      endInput.focus();
      return;
    }

    // Success state
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitted!";
    submitBtn.classList.add("success");

    // Add to list
    const range = buildRange(start, end);
    const typeLabel = typeLabels[leaveType] || leaveType;
    prependRequest(range, typeLabel);

    // Reset form after brief pause
    setTimeout(function () {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Request";
      submitBtn.classList.remove("success");
      daysText.textContent = "Select dates to calculate duration";
      daysWrap.classList.remove("has-days");
    }, 1800);
  });
})();
