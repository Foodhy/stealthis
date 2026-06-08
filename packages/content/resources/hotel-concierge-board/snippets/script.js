// ── Mock data ─────────────────────────────────────────────────────────────────
let requests = [
  {
    id: 1,
    room: "204",
    guest: "Mariana Sosa",
    request: "Restaurant booking — Fado Maior at 20:00 on 9 Jun",
    time: "08:14",
    priority: "high",
    status: "new",
    assignee: null,
  },
  {
    id: 2,
    room: "311",
    guest: "Thomas Reuter",
    request: "Taxi to Humberto Delgado Airport — 10 Jun, 06:30",
    time: "08:27",
    priority: "high",
    status: "new",
    assignee: null,
  },
  {
    id: 3,
    room: "118",
    guest: "Aiko Tanaka",
    request: "Theatre tickets — Fado Ao Vivo, 2 seats, 10 Jun",
    time: "08:51",
    priority: "normal",
    status: "new",
    assignee: null,
  },
  {
    id: 4,
    room: "207",
    guest: "Olivier Banks",
    request: "Wake-up call at 05:45 on 10 Jun",
    time: "09:02",
    priority: "normal",
    status: "new",
    assignee: null,
  },
  {
    id: 5,
    room: "302",
    guest: "Fátima Cervantes",
    request: "Luggage storage after checkout until 18:00",
    time: "09:15",
    priority: "low",
    status: "new",
    assignee: null,
  },
  {
    id: 6,
    room: "405",
    guest: "Carlos Mendes",
    request: "Restaurant booking — Solar dos Presuntos, 9 Jun",
    time: "07:58",
    priority: "high",
    status: "inprogress",
    assignee: "Paulo",
  },
  {
    id: 7,
    room: "219",
    guest: "Elena Vasquez",
    request: "Taxi to Belém Cultural Centre — 9 Jun, 14:00",
    time: "08:05",
    priority: "normal",
    status: "inprogress",
    assignee: "Sofia",
  },
  {
    id: 8,
    room: "103",
    guest: "Hassan Najjar",
    request: "Extra towels and pillow to room",
    time: "08:33",
    priority: "low",
    status: "inprogress",
    assignee: null,
  },
  {
    id: 9,
    room: "315",
    guest: "Pilar Romero",
    request: "Wake-up call at 07:00 on 9 Jun — confirmed",
    time: "07:44",
    priority: "normal",
    status: "done",
    assignee: "Paulo",
  },
  {
    id: 10,
    room: "108",
    guest: "Ruiqi Chen",
    request: "Theatre tickets — Teatro Nacional, 8 Jun — booked",
    time: "07:22",
    priority: "high",
    status: "done",
    assignee: "Sofia",
  },
  {
    id: 11,
    room: "221",
    guest: "Marc Dupuis",
    request: "Luggage delivered to room on arrival",
    time: "07:10",
    priority: "low",
    status: "done",
    assignee: "Paulo",
  },
];

let nextId = 12;
let activePriority = "all";

const LANE_LABELS = { new: "New", inprogress: "In Progress", done: "Done" };
const STATUS_ORDER = ["new", "inprogress", "done"];

// ── Toast helper ──────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Render board ──────────────────────────────────────────────────────────────
function renderBoard() {
  const board = document.getElementById("board");
  const filtered =
    activePriority === "all" ? requests : requests.filter((r) => r.priority === activePriority);

  board.innerHTML = STATUS_ORDER.map((lane) => {
    const cards = filtered.filter((r) => r.status === lane);
    const allInLane = requests.filter((r) => r.status === lane);
    return `
      <div class="lane" data-lane="${lane}">
        <div class="lane-head">
          <span class="lane-title">
            <span class="lane-dot"></span>
            ${LANE_LABELS[lane]}
          </span>
          <span class="lane-count">${allInLane.length}</span>
        </div>
        <div class="lane-body">
          ${
            cards.length === 0
              ? `<p class="lane-empty">No requests${activePriority !== "all" ? " for this filter" : ""}</p>`
              : cards.map((card) => renderCard(card, lane)).join("")
          }
        </div>
      </div>`;
  }).join("");

  // ── Wire card buttons ──────────────────────────────────────────────────────
  board.addEventListener("click", handleCardAction);
}

function renderCard(r, lane) {
  const canAdvance = lane !== "done";
  const advanceLabel = lane === "new" ? "→ In Progress" : "→ Done";
  const assignLabel = r.assignee ? `Assigned: ${r.assignee}` : "Assign to me";

  return `
    <div class="card" data-id="${r.id}">
      <div class="card-top">
        <div class="card-request">${r.request}</div>
        <span class="pri ${r.priority}">${r.priority}</span>
      </div>
      <div class="card-meta">
        <span class="card-room">${r.room}</span>
        <span class="card-sep">·</span>
        <span class="card-guest">${r.guest}</span>
        <span class="card-sep">·</span>
        <span class="card-time">${r.time}</span>
      </div>
      ${
        r.assignee
          ? `<div class="card-assignee">Assigned to <span>${r.assignee}</span></div>`
          : `<div class="card-assignee">Unassigned</div>`
      }
      <div class="card-actions">
        <button class="card-btn assign" data-action="assign" data-id="${r.id}">
          ${r.assignee ? "✓ " + r.assignee : "Assign to me"}
        </button>
        ${
          canAdvance
            ? `<button class="card-btn advance" data-action="advance" data-id="${r.id}">${advanceLabel}</button>`
            : `<span class="card-btn" style="margin-left:auto;opacity:0.45;cursor:default">✓ Done</span>`
        }
      </div>
    </div>`;
}

// ── Card action handler (event delegation) ────────────────────────────────────
function handleCardAction(e) {
  // Guard: don't double-fire from re-renders adding new listeners
  if (e._handled) return;
  e._handled = true;

  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = parseInt(btn.dataset.id, 10);
  const req = requests.find((r) => r.id === id);
  if (!req) return;

  if (btn.dataset.action === "advance") {
    const idx = STATUS_ORDER.indexOf(req.status);
    if (idx < STATUS_ORDER.length - 1) {
      req.status = STATUS_ORDER[idx + 1];
      showToast(`Request #${id} moved to "${LANE_LABELS[req.status]}"`);
      renderBoard();
    }
  }

  if (btn.dataset.action === "assign") {
    if (!req.assignee) {
      req.assignee = "Paulo";
      showToast(`Assigned to Paulo — room ${req.room}`);
    } else {
      req.assignee = null;
      showToast(`Assignment removed — room ${req.room}`);
    }
    renderBoard();
  }
}

// ── Priority filter ───────────────────────────────────────────────────────────
document.querySelectorAll(".chip[data-pri]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip[data-pri]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activePriority = btn.dataset.pri;
    renderBoard();
  });
});

// ── New request button (adds demo card) ───────────────────────────────────────
const REQUEST_TYPES = [
  "Restaurant booking — Bica do Sapato, tonight 21:00",
  "Taxi to Parque das Nações — 11 Jun, 09:00",
  "Extra pillows and blanket for room",
  "Wake-up call at 06:30 on 12 Jun",
  "Luggage storage — 2 bags until 17:00",
];
const ROOMS = ["101", "112", "223", "317", "408", "205", "316"];
const GUESTS = ["Sofia Bellini", "Karl Henriksen", "Yuki Mori", "Ana Costa", "Luca Ferrari"];
const PRIS = ["high", "normal", "normal", "low"];

document.getElementById("btnNewRequest").addEventListener("click", () => {
  const r = {
    id: nextId++,
    room: ROOMS[Math.floor(Math.random() * ROOMS.length)],
    guest: GUESTS[Math.floor(Math.random() * GUESTS.length)],
    request: REQUEST_TYPES[Math.floor(Math.random() * REQUEST_TYPES.length)],
    time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    priority: PRIS[Math.floor(Math.random() * PRIS.length)],
    status: "new",
    assignee: null,
  };
  requests.unshift(r);
  showToast(`New request added — room ${r.room}`);
  renderBoard();
});

// ── Clock + date ──────────────────────────────────────────────────────────────
const clockEl = document.getElementById("clock");
const todayEl = document.getElementById("todayLabel");
function tick() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  todayEl.textContent = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
tick();
setInterval(tick, 1000);

// ── Initial render ────────────────────────────────────────────────────────────
renderBoard();
