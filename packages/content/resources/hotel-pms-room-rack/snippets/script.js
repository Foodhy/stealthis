// ── Config ─────────────────────────────────────────────────────────────────
const DAYS = 14;
const ROOMS = [
  { group: "Floor 1 · Standard", type: "standard", floor: 1 },
  { no: "101", type: "standard", floor: 1, label: "Single" },
  { no: "102", type: "standard", floor: 1, label: "Double" },
  { no: "103", type: "standard", floor: 1, label: "Double" },
  { no: "104", type: "standard", floor: 1, label: "Twin" },
  { no: "105", type: "standard", floor: 1, label: "Twin" },

  { group: "Floor 2 · Deluxe", type: "deluxe", floor: 2 },
  { no: "201", type: "deluxe", floor: 2, label: "Deluxe" },
  { no: "202", type: "deluxe", floor: 2, label: "Deluxe" },
  { no: "203", type: "deluxe", floor: 2, label: "Deluxe" },
  { no: "204", type: "deluxe", floor: 2, label: "Family" },
  { no: "205", type: "deluxe", floor: 2, label: "Deluxe" },

  { group: "Floor 3 · Suites", type: "suite", floor: 3 },
  { no: "301", type: "suite", floor: 3, label: "Junior" },
  { no: "302", type: "suite", floor: 3, label: "Junior" },
  { no: "303", type: "suite", floor: 3, label: "Executive" },
  { no: "304", type: "suite", floor: 3, label: "Penthouse" },
];

// Stays defined as offsets from "today" (col 0 = today, col 1 = +1d, …)
// Each stay: { room, start, nights, status, name, rate, balance }
const STAYS = [
  { room: "101", start: -2, nights: 4, status: "checked-in", name: "Karl Henriksen", rate: "Flex BAR · €184", balance: "€736 / paid" },
  { room: "102", start: 1, nights: 3, status: "confirmed", name: "Mariana Sosa", rate: "Promo · €152", balance: "€456 / deposit €100" },
  { room: "103", start: 0, nights: 1, status: "due-out", name: "Ruiqi Chen", rate: "Corporate · €172", balance: "€552 / open" },
  { room: "104", start: 4, nights: 5, status: "confirmed", name: "Patrick Wolfe", rate: "Flex BAR · €174", balance: "€870 / deposit" },
  { room: "105", start: 8, nights: 2, status: "confirmed", name: "Linnea Aalto", rate: "Promo · €148", balance: "€296 / paid" },

  { room: "201", start: -1, nights: 3, status: "checked-in", name: "Pilar Romero", rate: "Flex · €241", balance: "€482 / open" },
  { room: "202", start: 2, nights: 4, status: "confirmed", name: "Maya Sharma", rate: "Promo · €212", balance: "€848 / deposit" },
  { room: "203", start: 6, nights: 7, status: "maintenance", name: "Maintenance · plumbing", rate: "—", balance: "—" },
  { room: "204", start: 0, nights: 3, status: "confirmed", name: "Sofia Bellini", rate: "Suite Promo · €265", balance: "€795 / deposit" },
  { room: "205", start: 9, nights: 3, status: "confirmed", name: "Olivier Banks", rate: "Flex · €232", balance: "€696 / open" },

  { room: "301", start: -3, nights: 7, status: "checked-in", name: "Hassan Najjar", rate: "Family Promo · €301", balance: "€2,108 / paid" },
  { room: "302", start: 0, nights: 5, status: "confirmed", name: "Aiko Tanaka", rate: "Flex · €241", balance: "€1,205 / deposit" },
  { room: "303", start: 5, nights: 4, status: "confirmed", name: "Elena Vasquez", rate: "Suite Promo · €482", balance: "€1,928 / open" },
  { room: "304", start: 1, nights: 9, status: "confirmed", name: "Marc Dupuis", rate: "Penthouse · €612", balance: "€5,508 / deposit" },
];

// ── State ──────────────────────────────────────────────────────────────────
let anchor = startOfDay(new Date()); // first column = today
let selected = null;
let typeFilter = "all";
let floorFilter = "all";

const daysEl = document.getElementById("days");
const roomsEl = document.getElementById("rooms");
const gridEl = document.getElementById("grid");
const detailEl = document.getElementById("detail");
const rangeLabel = document.getElementById("rangeLabel");

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function isWeekend(d) {
  const w = d.getDay();
  return w === 0 || w === 6;
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtDay(d) {
  return d.toLocaleDateString("en-GB", { weekday: "short" });
}
function fmtNum(d) {
  return d.getDate();
}
function fmtRange(d0, d1) {
  const opts = { day: "2-digit", month: "short" };
  return `${d0.toLocaleDateString("en-GB", opts)} – ${d1.toLocaleDateString("en-GB", opts)}`;
}

// ── Render ─────────────────────────────────────────────────────────────────
const today = startOfDay(new Date());

function render() {
  const end = addDays(anchor, DAYS - 1);
  rangeLabel.textContent = fmtRange(anchor, end);

  daysEl.innerHTML = "";
  for (let i = 0; i < DAYS; i++) {
    const d = addDays(anchor, i);
    const isToday = isSameDay(d, today);
    daysEl.insertAdjacentHTML(
      "beforeend",
      `<div class="day ${isWeekend(d) ? "is-weekend" : ""} ${isToday ? "is-today" : ""}">
        <span>${fmtDay(d)}</span><strong>${fmtNum(d)}</strong>
      </div>`
    );
  }

  // Filter rooms (respect group rows)
  const visibleRooms = [];
  let currentGroupVisible = false;
  ROOMS.forEach((r) => {
    if (r.group) {
      const typeOk = typeFilter === "all" || r.type === typeFilter;
      const floorOk = floorFilter === "all" || String(r.floor) === floorFilter;
      currentGroupVisible = typeOk && floorOk;
      if (currentGroupVisible) visibleRooms.push(r);
    } else if (currentGroupVisible) {
      visibleRooms.push(r);
    }
  });

  // Room labels column
  roomsEl.innerHTML = visibleRooms
    .map((r) =>
      r.group
        ? `<div class="rm-group">${r.group}</div>`
        : `<div class="rm-label">
            <span class="rm-no">${r.no}</span>
            <span class="rm-type">${r.label}</span>
          </div>`
    )
    .join("");

  // Grid cells + stays
  gridEl.style.gridTemplateColumns = `repeat(${DAYS}, var(--cell-w))`;
  gridEl.innerHTML = "";

  visibleRooms.forEach((r, rowIdx) => {
    if (r.group) {
      const groupCell = document.createElement("div");
      groupCell.className = "cell-group";
      groupCell.style.gridColumn = `1 / -1`;
      groupCell.style.gridRow = `${rowIdx + 1}`;
      groupCell.style.height = "var(--row-h)";
      gridEl.appendChild(groupCell);
      return;
    }
    for (let i = 0; i < DAYS; i++) {
      const d = addDays(anchor, i);
      const isToday = isSameDay(d, today);
      const c = document.createElement("div");
      c.className = `cell ${isWeekend(d) ? "is-weekend" : ""} ${isToday ? "is-today" : ""}`;
      c.style.gridRow = `${rowIdx + 1}`;
      c.style.gridColumn = `${i + 1}`;
      gridEl.appendChild(c);
    }
  });

  STAYS.forEach((stay) => {
    const roomIdx = visibleRooms.findIndex((r) => r.no === stay.room);
    if (roomIdx === -1) return;
    const startCol = stay.start + 1;
    const endCol = startCol + stay.nights;
    if (endCol <= 1 || startCol > DAYS) return;
    const visStart = Math.max(1, startCol);
    const visEnd = Math.min(DAYS + 1, endCol);
    const span = visEnd - visStart;

    const el = document.createElement("div");
    el.className = `stay ${stay.status}`;
    if (selected && selected.room === stay.room && selected.start === stay.start) el.classList.add("is-selected");
    el.style.gridRow = `${roomIdx + 1}`;
    el.style.gridColumn = `${visStart} / span ${span}`;
    el.innerHTML = `<span class="stay-dot"></span><span>${stay.name}</span>`;
    el.addEventListener("click", () => {
      selected = stay;
      render();
      renderDetail(stay);
    });
    gridEl.appendChild(el);
  });
}

function renderDetail(stay) {
  detailEl.innerHTML = `
    <div class="detail-card">
      <div class="dc-room">${stay.room}</div>
      <div class="dc-guest">
        <p>${stay.name}</p>
        <small>${stay.nights} nights · checked from row ${stay.start >= 0 ? "+" : ""}${stay.start}</small>
      </div>
      <div class="dc-block"><strong>Rate</strong><span>${stay.rate}</span></div>
      <div class="dc-block"><strong>Balance</strong><span>${stay.balance}</span></div>
      <span class="dc-status ${stay.status}">${stay.status.replace("-", " ")}</span>
      <button class="dc-action">Open reservation</button>
    </div>`;
}

// ── Wiring ─────────────────────────────────────────────────────────────────
document.querySelectorAll(".ico-btn").forEach((b) =>
  b.addEventListener("click", () => {
    anchor = addDays(anchor, parseInt(b.dataset.nav, 10));
    render();
  })
);
document.getElementById("todayBtn").addEventListener("click", () => {
  anchor = startOfDay(new Date());
  render();
});
document.getElementById("typeFilter").addEventListener("change", (e) => {
  typeFilter = e.target.value;
  render();
});
document.getElementById("floorFilter").addEventListener("change", (e) => {
  floorFilter = e.target.value;
  render();
});

render();
