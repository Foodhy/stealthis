// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Live clock ───────────────────────────────────────────────────────────────
const clockEl = document.getElementById("clock");
function tickClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Avatar palette (deterministic per initials) ──────────────────────────────
const AVATAR_COLORS = [
  "#129c93", "#0c7a73", "#ff7a66", "#d98a2b",
  "#2f9e6f", "#5a7fd6", "#9b6bc4", "#c4503a",
];
function colorFor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Data model ───────────────────────────────────────────────────────────────
// `since` is the timestamp the patient entered the queue, used to tick wait time.
let nextSeq = 9;
const now = Date.now();
const queue = {
  waiting: [
    { id: 1, token: "B-07", name: "Aaliyah R.", since: now - 14 * 60000, room: null, prov: null, overAt: 20 },
    { id: 2, token: "B-08", name: "Daniel O.", since: now - 9 * 60000, room: null, prov: null, overAt: 20 },
    { id: 3, token: "B-09", name: "Priya N.", since: now - 5 * 60000, room: null, prov: null, overAt: 20 },
    { id: 4, token: "B-10", name: "Marcus T.", since: now - 110000, room: null, prov: null, overAt: 20 },
  ],
  inroom: [
    { id: 5, token: "B-05", name: "Sofia L.", since: now - 4 * 60000, room: "Room 2", prov: "Dr. Ravi Patel", overAt: 25 },
    { id: 6, token: "B-06", name: "Henry W.", since: now - 2 * 60000, room: "Room 5", prov: "Dr. Maya Bloom", overAt: 25 },
  ],
  ready: [
    { id: 7, token: "B-03", name: "Grace K.", since: now - 7 * 60000, room: "Room 1", prov: "Dr. Lena Okafor", overAt: 12 },
    { id: 8, token: "B-04", name: "Maria G.", since: now - 3 * 60000, room: "Room 3", prov: "Dr. Lena Okafor", overAt: 12 },
  ],
};

const ROOMS = ["Room 1", "Room 2", "Room 3", "Room 4", "Room 5"];
const PROVIDERS = ["Dr. Lena Okafor", "Dr. Ravi Patel", "Dr. Maya Bloom"];

// ── Wait-time formatting ─────────────────────────────────────────────────────
function fmtWait(since) {
  const sec = Math.max(0, Math.floor((Date.now() - since) / 1000));
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ── Rendering ────────────────────────────────────────────────────────────────
function ticketHTML(p, isFront) {
  const ini = initials(p.name);
  const minsOver = (Date.now() - p.since) / 60000 >= p.overAt;
  const room = p.room
    ? `<span class="room-badge assigned">${p.room}</span>`
    : `<span class="room-badge">Unassigned</span>`;
  const prov = p.prov ? `<span class="t-prov">${p.prov}</span>` : "";
  return `
    <li class="ticket${isFront ? " is-front" : ""} entering" role="listitem" data-id="${p.id}">
      <span class="avatar" style="background:${colorFor(ini)}" aria-hidden="true">${ini}</span>
      <div class="t-main">
        <div class="t-token">${p.token}</div>
        <div class="t-name">${p.name}</div>
        <div class="t-sub">${room}${prov}</div>
      </div>
      <div class="t-wait">
        <div class="wait-time${minsOver ? " over" : ""}" data-since="${p.since}">${fmtWait(p.since)}</div>
        <div class="wait-label">waiting</div>
      </div>
    </li>`;
}

function render(col) {
  const list = document.getElementById(`list-${col}`);
  const empty = document.getElementById(`empty-${col}`);
  const items = queue[col];
  list.innerHTML = items
    .map((p, i) => ticketHTML(p, col === "waiting" && i === 0))
    .join("");
  empty.hidden = items.length > 0;
  document.getElementById(`count-${col}`).textContent = items.length;
}

function renderAll() {
  render("waiting");
  render("inroom");
  render("ready");
}

// ── Now serving banner ───────────────────────────────────────────────────────
function setServing(p) {
  document.getElementById("servingToken").textContent = p.token;
  document.getElementById("servingName").textContent = p.name;
  document.getElementById("servingRoom").textContent =
    `${p.room || "Awaiting room"} · ${p.prov || "Provider pending"}`;
  const banner = document.getElementById("serving");
  banner.classList.remove("flash");
  void banner.offsetWidth; // reflow to restart animation
  banner.classList.add("flash");
}

// ── Advance logic ────────────────────────────────────────────────────────────
// waiting → inroom (assign room/provider) → ready → served (off the board)
function advanceFromWaiting(manual) {
  if (!queue.waiting.length) {
    if (manual) showToast("No patients are waiting right now.");
    return;
  }
  const p = queue.waiting.shift();
  const occupied = new Set(queue.inroom.map((x) => x.room));
  p.room = ROOMS.find((r) => !occupied.has(r)) || ROOMS[0];
  p.prov = PROVIDERS[(p.id + nextSeq) % PROVIDERS.length];
  p.since = Date.now();
  queue.inroom.push(p);
  render("waiting");
  render("inroom");
  showToast(`${p.token} ${p.name} → ${p.room} with ${p.prov}.`);
}

function advanceFromInroom() {
  if (!queue.inroom.length) return;
  const p = queue.inroom.shift();
  p.since = Date.now();
  queue.ready.push(p);
  render("inroom");
  render("ready");
}

function serveFromReady() {
  if (!queue.ready.length) return;
  const p = queue.ready.shift();
  render("ready");
  setServing(p);
}

// ── "Call next" button ───────────────────────────────────────────────────────
const callNextBtn = document.getElementById("callNext");
callNextBtn.addEventListener("click", () => advanceFromWaiting(true));

function refreshCallNext() {
  callNextBtn.disabled = queue.waiting.length === 0;
}

// ── Demo auto-advance loop ───────────────────────────────────────────────────
// Cycles a patient one column forward roughly every 4 seconds, and recycles
// served patients back into Waiting so the board never empties out.
let phase = 0;
function demoStep() {
  const moves = [serveFromReady, advanceFromInroom, () => advanceFromWaiting(false), recyclePatient];
  moves[phase % moves.length]();
  phase++;
  renderCounts();
  refreshCallNext();
}

function recyclePatient() {
  nextSeq++;
  const names = ["Olivia P.", "Noah F.", "Emma S.", "Liam D.", "Ava C.", "Ethan B.", "Mia H.", "Lucas V."];
  const nm = names[nextSeq % names.length];
  queue.waiting.push({
    id: 100 + nextSeq,
    token: `B-${String(10 + nextSeq).padStart(2, "0")}`,
    name: nm,
    since: Date.now(),
    room: null,
    prov: null,
    overAt: 20,
  });
  render("waiting");
}

function renderCounts() {
  document.getElementById("count-waiting").textContent = queue.waiting.length;
  document.getElementById("count-inroom").textContent = queue.inroom.length;
  document.getElementById("count-ready").textContent = queue.ready.length;
}

// ── Per-second wait tick (cheap: updates text nodes in place) ─────────────────
function tickWaits() {
  document.querySelectorAll(".wait-time").forEach((el) => {
    const since = Number(el.dataset.since);
    el.textContent = fmtWait(since);
    // mark long waits in the danger colour at 20 min for waiting tickets
    const li = el.closest(".ticket");
    const inWaiting = li && li.closest("#list-waiting");
    if (inWaiting && (Date.now() - since) / 60000 >= 20) el.classList.add("over");
  });
}

// ── Boot ─────────────────────────────────────────────────────────────────────
tickClock();
renderAll();
refreshCallNext();
setInterval(tickClock, 1000 * 15);
setInterval(tickWaits, 1000);
setInterval(demoStep, 4000);
