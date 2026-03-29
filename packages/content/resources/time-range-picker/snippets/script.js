(function () {
  "use strict";

  // ── State ──
  const MIN_HOURS = 0;
  const MAX_HOURS = 24;
  const MIN_GAP = 0.5; // 30 minutes minimum range

  let startHour = 9;
  let endHour = 17;

  // ── DOM refs ──
  const track = document.getElementById("timelineTrack");
  const fill = document.getElementById("timelineFill");
  const handleStart = document.getElementById("handleStart");
  const handleEnd = document.getElementById("handleEnd");
  const tooltipStart = document.getElementById("tooltipStart");
  const tooltipEnd = document.getElementById("tooltipEnd");
  const rangeText = document.getElementById("rangeText");
  const rangeDuration = document.getElementById("rangeDuration");
  const presetBtns = document.querySelectorAll(".preset-btn");

  if (!track) return;

  // ── Utilities ──
  function hoursToPercent(h) {
    return ((h - MIN_HOURS) / (MAX_HOURS - MIN_HOURS)) * 100;
  }

  function percentToHours(pct) {
    return (pct / 100) * (MAX_HOURS - MIN_HOURS) + MIN_HOURS;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function snapToQuarter(h) {
    return Math.round(h * 4) / 4; // snap to 15-minute increments
  }

  function formatHour(h) {
    const totalMinutes = Math.round(h * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const period = hours < 12 ? "AM" : "PM";
    const display = hours % 12 === 0 ? 12 : hours % 12;
    return `${display}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  function formatDuration(start, end) {
    const totalMinutes = Math.round((end - start) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (m === 0) return `${h} hour${h !== 1 ? "s" : ""}`;
    if (h === 0) return `${m} min`;
    return `${h}h ${m}m`;
  }

  // ── Render ──
  function render() {
    const startPct = hoursToPercent(startHour);
    const endPct = hoursToPercent(endHour);

    handleStart.style.left = `${startPct}%`;
    handleEnd.style.left = `${endPct}%`;

    fill.style.left = `${startPct}%`;
    fill.style.width = `${endPct - startPct}%`;

    tooltipStart.textContent = formatHour(startHour);
    tooltipEnd.textContent = formatHour(endHour);

    rangeText.textContent = `${formatHour(startHour)} – ${formatHour(endHour)}`;
    rangeDuration.textContent = formatDuration(startHour, endHour);

    // Highlight active preset
    presetBtns.forEach((btn) => {
      const s = parseFloat(btn.dataset.start);
      const e = parseFloat(btn.dataset.end);
      const isActive = Math.abs(startHour - s) < 0.05 && Math.abs(endHour - e) < 0.05;
      btn.classList.toggle("active", isActive);
    });
  }

  // ── Drag logic ──
  function getTrackPercent(clientX) {
    const rect = track.getBoundingClientRect();
    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
  }

  function makeDraggable(handle, isStart) {
    let dragging = false;

    function onMove(e) {
      if (!dragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = getTrackPercent(clientX);
      let hours = snapToQuarter(percentToHours(pct));

      if (isStart) {
        hours = clamp(hours, MIN_HOURS, endHour - MIN_GAP);
        startHour = hours;
      } else {
        hours = clamp(hours, startHour + MIN_GAP, MAX_HOURS);
        endHour = hours;
      }
      render();
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove("dragging");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    }

    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      dragging = true;
      handle.classList.add("dragging");
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    handle.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        dragging = true;
        handle.classList.add("dragging");
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("touchend", onUp);
      },
      { passive: false }
    );

    // Keyboard navigation
    handle.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 1 : 0.25; // shift = 1hr, normal = 15min
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        if (isStart) startHour = clamp(startHour - step, MIN_HOURS, endHour - MIN_GAP);
        else endHour = clamp(endHour - step, startHour + MIN_GAP, MAX_HOURS);
        render();
      }
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        if (isStart) startHour = clamp(startHour + step, MIN_HOURS, endHour - MIN_GAP);
        else endHour = clamp(endHour + step, startHour + MIN_GAP, MAX_HOURS);
        render();
      }
    });
  }

  makeDraggable(handleStart, true);
  makeDraggable(handleEnd, false);

  // Click on track to move nearest handle
  track.addEventListener("click", (e) => {
    if (e.target === handleStart || e.target === handleEnd) return;
    const pct = getTrackPercent(e.clientX);
    const hours = snapToQuarter(percentToHours(pct));

    const distStart = Math.abs(hours - startHour);
    const distEnd = Math.abs(hours - endHour);

    if (distStart < distEnd) {
      startHour = clamp(hours, MIN_HOURS, endHour - MIN_GAP);
    } else {
      endHour = clamp(hours, startHour + MIN_GAP, MAX_HOURS);
    }
    render();
  });

  // ── Preset buttons ──
  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const s = parseFloat(btn.dataset.start);
      const e = parseFloat(btn.dataset.end);
      // "Night" preset remapped to 10–22 for sensible single-day display
      if (btn.dataset.overnight) {
        startHour = 10;
        endHour = 22;
      } else {
        startHour = s;
        endHour = e;
      }
      render();
    });
  });

  // ── Initial render ──
  render();
})();
