// ── Schedule data ────────────────────────────────────────────────────────────

const SCHEDULE = {
  out: [
    {
      id: "o1",
      hhmm: "07:30",
      route: "Hotel → Airport T1",
      stops: "Lobby · Concourse A · T1 Departures",
      seats: 8,
      maxSeats: 8,
    },
    {
      id: "o2",
      hhmm: "09:00",
      route: "Hotel → Airport T2",
      stops: "Lobby · T2 Departures",
      seats: 5,
      maxSeats: 8,
    },
    {
      id: "o3",
      hhmm: "10:45",
      route: "Hotel → Airport T1",
      stops: "Lobby · Concourse A · T1 Departures",
      seats: 8,
      maxSeats: 8,
    },
    {
      id: "o4",
      hhmm: "12:30",
      route: "Hotel → Airport T2",
      stops: "Lobby · T2 Departures",
      seats: 3,
      maxSeats: 8,
    },
    {
      id: "o5",
      hhmm: "14:00",
      route: "Hotel → Airport T1",
      stops: "Lobby · Concourse A · T1 Departures",
      seats: 7,
      maxSeats: 8,
    },
    {
      id: "o6",
      hhmm: "16:15",
      route: "Hotel → Airport T2",
      stops: "Lobby · T2 Departures",
      seats: 8,
      maxSeats: 8,
    },
    {
      id: "o7",
      hhmm: "18:30",
      route: "Hotel → Airport T1",
      stops: "Lobby · Concourse A · T1 Departures",
      seats: 6,
      maxSeats: 8,
    },
    {
      id: "o8",
      hhmm: "20:00",
      route: "Hotel → Airport T2",
      stops: "Lobby · T2 Departures",
      seats: 8,
      maxSeats: 8,
    },
  ],
  in: [
    {
      id: "i1",
      hhmm: "06:45",
      route: "Airport T1 → Hotel",
      stops: "T1 Arrivals · Concourse A · Lobby",
      seats: 4,
      maxSeats: 8,
    },
    {
      id: "i2",
      hhmm: "08:15",
      route: "Airport T2 → Hotel",
      stops: "T2 Arrivals · Lobby",
      seats: 8,
      maxSeats: 8,
    },
    {
      id: "i3",
      hhmm: "10:00",
      route: "Airport T1 → Hotel",
      stops: "T1 Arrivals · Concourse A · Lobby",
      seats: 2,
      maxSeats: 8,
    },
    {
      id: "i4",
      hhmm: "11:30",
      route: "Airport T2 → Hotel",
      stops: "T2 Arrivals · Lobby",
      seats: 8,
      maxSeats: 8,
    },
    {
      id: "i5",
      hhmm: "13:45",
      route: "Airport T1 → Hotel",
      stops: "T1 Arrivals · Concourse A · Lobby",
      seats: 6,
      maxSeats: 8,
    },
    {
      id: "i6",
      hhmm: "15:00",
      route: "Airport T2 → Hotel",
      stops: "T2 Arrivals · Lobby",
      seats: 5,
      maxSeats: 8,
    },
    {
      id: "i7",
      hhmm: "17:30",
      route: "Airport T1 → Hotel",
      stops: "T1 Arrivals · Concourse A · Lobby",
      seats: 8,
      maxSeats: 8,
    },
    {
      id: "i8",
      hhmm: "19:45",
      route: "Airport T2 → Hotel",
      stops: "T2 Arrivals · Lobby",
      seats: 3,
      maxSeats: 8,
    },
  ],
};

// ── State ─────────────────────────────────────────────────────────────────────
let dir = "out"; // "out" | "in"

// ── Helpers ───────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const toast = $("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function padTwo(n) {
  return String(n).padStart(2, "0");
}

function formatCountdown(diffMin) {
  if (diffMin < 0) return "–";
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return h > 0 ? `${h}h ${padTwo(m)}m` : `${m}m`;
}

function getStatus(hhmm) {
  const depMin = hhmmToMinutes(hhmm);
  const now = nowMinutes();
  const diff = depMin - now;
  if (diff < -3) return "departed";
  if (diff <= 10) return "boarding";
  return "ontime";
}

// ── Find next departure ───────────────────────────────────────────────────────
function findNext() {
  const now = nowMinutes();
  const rows = SCHEDULE[dir];
  return rows.find((r) => hhmmToMinutes(r.hhmm) - now > -3) || null;
}

// ── Render clock ──────────────────────────────────────────────────────────────
function renderClock() {
  const d = new Date();
  $("clock").textContent = `${padTwo(d.getHours())}:${padTwo(d.getMinutes())}`;
}

// ── Render next banner ────────────────────────────────────────────────────────
function renderNext() {
  const next = findNext();
  if (!next) {
    $("nextTime").textContent = "—";
    $("nextStops").textContent = "No more departures today";
    $("countdown").textContent = "—";
    $("nextReserveBtn").disabled = true;
    return;
  }
  const diff = hhmmToMinutes(next.hhmm) - nowMinutes();
  $("nextTime").textContent = next.hhmm;
  $("nextStops").textContent = next.stops;
  $("countdown").textContent = formatCountdown(diff);
  $("nextReserveBtn").disabled = next.seats === 0 || diff < -3;
  $("nextReserveBtn").dataset.id = next.id;
}

// ── Render departure list ─────────────────────────────────────────────────────
function renderList() {
  const rows = SCHEDULE[dir];
  const next = findNext();

  $("depList").innerHTML = rows
    .map((r) => {
      const status = getStatus(r.hhmm);
      const isNext = next && r.id === next.id;
      const isDep = status === "departed";
      const isBoard = status === "boarding";
      const canRes = !isDep && r.seats > 0;

      const seatsLow = r.seats <= 2 && r.seats > 0;
      const statusHtml = isDep
        ? `<span class="status-badge status-departed">Departed</span>`
        : isBoard
          ? `<span class="status-badge status-boarding">Boarding</span>`
          : `<span class="status-badge status-ontime">On time</span>`;

      const actionHtml = isDep
        ? statusHtml
        : `<button type="button" class="btn-reserve" data-id="${r.id}" ${r.seats === 0 ? "disabled" : ""}>${r.seats === 0 ? "Full" : "Reserve"}</button>`;

      return `
      <div class="dep-row ${isNext ? "is-next" : ""} ${isDep ? "is-departed" : ""}" role="listitem">
        <span class="dep-time">${r.hhmm}</span>
        <div class="dep-info">
          <div class="dep-route">${r.route}</div>
          <div class="dep-stops">${r.stops}</div>
        </div>
        <div class="dep-seats">
          <span class="seats-n ${seatsLow ? "low" : ""}">${r.seats}</span>
          <span class="seats-label">seats</span>
        </div>
        <div class="dep-action">${actionHtml}</div>
      </div>`;
    })
    .join("");
}

// ── Reserve seat (list) ───────────────────────────────────────────────────────
$("depList").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-reserve");
  if (!btn || btn.disabled) return;
  reserveSeat(btn.dataset.id);
});

// ── Reserve seat (banner) ─────────────────────────────────────────────────────
$("nextReserveBtn").addEventListener("click", () => {
  const next = findNext();
  if (!next) return;
  reserveSeat(next.id);
});

function reserveSeat(id) {
  const row = [...SCHEDULE.out, ...SCHEDULE.in].find((r) => r.id === id);
  if (!row || row.seats === 0) return;
  row.seats -= 1;
  const suffix = row.seats === 1 ? "1 seat left" : `${row.seats} seats left`;
  showToast(`Reserved · ${row.hhmm} ${row.route} — ${suffix}`);
  renderNext();
  renderList();
}

// ── Direction toggle ──────────────────────────────────────────────────────────
$("dirSeg").addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn) return;
  dir = btn.dataset.dir;
  document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  renderNext();
  renderList();
});

// ── Tick ──────────────────────────────────────────────────────────────────────
function tick() {
  renderClock();
  renderNext();
  renderList();
}

// ── Init ──────────────────────────────────────────────────────────────────────
tick();
setInterval(tick, 30_000); // refresh every 30 s
