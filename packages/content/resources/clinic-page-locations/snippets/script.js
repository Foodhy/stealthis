// ── Toast ────────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Time helpers ─────────────────────────────────────────────────────────────
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// "HH:MM" → minutes since midnight, or null when empty/closed.
function toMinutes(value) {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function fmtClock(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return fmtClock(d);
}

// ── Live open / closed status ────────────────────────────────────────────────
// Returns { state: "open" | "soon-close" | "soon-open" | "closed", label }.
function computeStatus(card, now) {
  const day = now.getDay(); // 0 = Sun … 6 = Sat
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const todayCell = card.querySelector(`tr[data-day="${day}"] td`);
  const open = toMinutes(todayCell?.dataset.open);
  const close = toMinutes(todayCell?.dataset.close);

  // Open today and currently within hours.
  if (open !== null && close !== null && minutesNow >= open && minutesNow < close) {
    if (close - minutesNow <= 60) {
      return { state: "soon-close", label: `Closes ${fmtTime(close)}` };
    }
    return { state: "open", label: `Open · until ${fmtTime(close)}` };
  }

  // Closed now — does it open later today?
  if (open !== null && minutesNow < open) {
    if (open - minutesNow <= 60) {
      return { state: "soon-open", label: `Opens ${fmtTime(open)}` };
    }
    return { state: "closed", label: `Opens ${fmtTime(open)}` };
  }

  // Otherwise, find the next day with hours (within the coming week).
  for (let step = 1; step <= 7; step++) {
    const d = (day + step) % 7;
    const cell = card.querySelector(`tr[data-day="${d}"] td`);
    const o = toMinutes(cell?.dataset.open);
    if (o !== null) {
      const when = step === 1 ? "tomorrow" : DAY_NAMES[d];
      return { state: "closed", label: `Opens ${when}` };
    }
  }

  return { state: "closed", label: "Closed" };
}

function paintCard(card, now) {
  const day = now.getDay();

  // Highlight today's row.
  card.querySelectorAll("tr[data-day]").forEach((row) => {
    row.classList.toggle("is-today", Number(row.dataset.day) === day);
  });

  // Live badge.
  const { state, label } = computeStatus(card, now);
  const badge = card.querySelector("[data-status]");
  badge.hidden = false;
  badge.className = "badge";
  if (state === "open") badge.classList.add("is-open");
  else if (state === "soon-close" || state === "soon-open") badge.classList.add("is-soon");
  else badge.classList.add("is-closed");
  badge.textContent = label;
}

function refresh() {
  const now = new Date();
  document.getElementById("now-line").textContent =
    `${DAY_NAMES[now.getDay()]}, ${fmtClock(now)} — your local time`;
  document.querySelectorAll(".loc-card").forEach((card) => paintCard(card, now));
}

refresh();
// Re-evaluate every 30s so the badge flips at opening/closing time without a reload.
setInterval(refresh, 30000);

// ── Actions ──────────────────────────────────────────────────────────────────
document.querySelector(".grid").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const name = btn.dataset.name;
  if (btn.dataset.action === "directions") {
    showToast(`Opening directions to Northpoint — ${name}…`);
  } else if (btn.dataset.action === "call") {
    showToast(`Calling Northpoint — ${name}…`);
  }
});
