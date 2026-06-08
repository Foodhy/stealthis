// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = ["clean", "dirty", "inprogress", "inspected", "outoforder"];
const STATUS_LABELS = {
  clean: "Clean",
  dirty: "Dirty",
  inprogress: "In Progress",
  inspected: "Inspected",
  outoforder: "Out of Order",
};
const OCC_TYPES = ["stayover", "departure", "arrival", "vacant"];

// ── Mock room data ────────────────────────────────────────────────────────────
// 4 floors, 12 rooms each (101–112, 201–212, 301–312, 401–412)
function buildRooms() {
  const seed = [
    // Floor 1
    { n: "101", st: "dirty", occ: "departure" },
    { n: "102", st: "inprogress", occ: "departure" },
    { n: "103", st: "clean", occ: "arrival" },
    { n: "104", st: "clean", occ: "arrival" },
    { n: "105", st: "inspected", occ: "arrival" },
    { n: "106", st: "dirty", occ: "stayover" },
    { n: "107", st: "inprogress", occ: "stayover" },
    { n: "108", st: "clean", occ: "stayover" },
    { n: "109", st: "inspected", occ: "stayover" },
    { n: "110", st: "dirty", occ: "departure" },
    { n: "111", st: "outoforder", occ: "vacant" },
    { n: "112", st: "clean", occ: "arrival" },
    // Floor 2
    { n: "201", st: "inspected", occ: "arrival" },
    { n: "202", st: "dirty", occ: "stayover" },
    { n: "203", st: "dirty", occ: "departure" },
    { n: "204", st: "clean", occ: "stayover" },
    { n: "205", st: "inprogress", occ: "stayover" },
    { n: "206", st: "clean", occ: "arrival" },
    { n: "207", st: "dirty", occ: "departure" },
    { n: "208", st: "clean", occ: "arrival" },
    { n: "209", st: "outoforder", occ: "vacant" },
    { n: "210", st: "inspected", occ: "stayover" },
    { n: "211", st: "clean", occ: "stayover" },
    { n: "212", st: "dirty", occ: "departure" },
    // Floor 3
    { n: "301", st: "clean", occ: "stayover" },
    { n: "302", st: "dirty", occ: "departure" },
    { n: "303", st: "inprogress", occ: "departure" },
    { n: "304", st: "clean", occ: "arrival" },
    { n: "305", st: "inspected", occ: "arrival" },
    { n: "306", st: "dirty", occ: "stayover" },
    { n: "307", st: "clean", occ: "stayover" },
    { n: "308", st: "clean", occ: "arrival" },
    { n: "309", st: "dirty", occ: "departure" },
    { n: "310", st: "outoforder", occ: "vacant" },
    { n: "311", st: "clean", occ: "stayover" },
    { n: "312", st: "inspected", occ: "stayover" },
    // Floor 4
    { n: "401", st: "dirty", occ: "departure" },
    { n: "402", st: "dirty", occ: "stayover" },
    { n: "403", st: "clean", occ: "arrival" },
    { n: "404", st: "inprogress", occ: "stayover" },
    { n: "405", st: "clean", occ: "stayover" },
    { n: "406", st: "inspected", occ: "arrival" },
    { n: "407", st: "dirty", occ: "departure" },
    { n: "408", st: "clean", occ: "arrival" },
    { n: "409", st: "clean", occ: "stayover" },
    { n: "410", st: "outoforder", occ: "vacant" },
    { n: "411", st: "dirty", occ: "departure" },
    { n: "412", st: "inspected", occ: "arrival" },
  ];
  return seed.map((r, i) => ({ ...r, id: i, note: "" }));
}

let rooms = buildRooms();
let activeFilter = "all";
let openRoomId = null;

// ── Toast helper ──────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Tally computation ─────────────────────────────────────────────────────────
function computeTallies() {
  const t = {};
  STATUSES.forEach((s) => (t[s] = 0));
  rooms.forEach((r) => t[r.st]++);
  return t;
}

// ── Render tally bar ──────────────────────────────────────────────────────────
function renderTally() {
  const t = computeTallies();
  const total = rooms.length;
  document.getElementById("tallyBar").innerHTML =
    STATUSES.map(
      (s) => `
      <span class="tally ${s}">${STATUS_LABELS[s]}&thinsp;${t[s]}</span>
    `
    ).join("") + `<span class="tally-total">${total} rooms total</span>`;
}

// ── Render grid ───────────────────────────────────────────────────────────────
function renderGrid() {
  const floors = [1, 2, 3, 4];
  const gridArea = document.getElementById("gridArea");

  gridArea.innerHTML = floors
    .map((f) => {
      const floorRooms = rooms.filter((r) => r.n.startsWith(String(f)));
      return `
      <div class="floor-block">
        <p class="floor-label">Floor ${f}</p>
        <div class="floor-rooms">
          ${floorRooms
            .map((r) => {
              const dimmed = activeFilter !== "all" && r.st !== activeFilter;
              return `
              <div class="tile ${r.st}${dimmed ? " dimmed" : ""}" data-id="${r.id}">
                <div class="tile-number">${r.n}</div>
                <div class="tile-status">${STATUS_LABELS[r.st]}</div>
                <div class="tile-occ">${r.occ}</div>
                ${r.note ? `<span class="tile-note-dot"></span>` : ""}
              </div>`;
            })
            .join("")}
        </div>
      </div>`;
    })
    .join("");
}

// ── Open room modal ───────────────────────────────────────────────────────────
function openModal(roomId) {
  openRoomId = roomId;
  const r = rooms[roomId];
  document.getElementById("modalTitle").textContent = `Room ${r.n}`;
  const pill = document.getElementById("modalStatus");
  pill.textContent = STATUS_LABELS[r.st];
  pill.className = `status-pill ${r.st}`;
  document.getElementById("modalOcc").textContent = r.occ.charAt(0).toUpperCase() + r.occ.slice(1);
  document.getElementById("modalNote").value = r.note;
  document.getElementById("modalOverlay").hidden = false;
}

function closeModal() {
  document.getElementById("modalOverlay").hidden = true;
  openRoomId = null;
}

// ── Grid click ────────────────────────────────────────────────────────────────
document.getElementById("gridArea").addEventListener("click", (e) => {
  const tile = e.target.closest(".tile");
  if (!tile) return;
  const id = parseInt(tile.dataset.id, 10);
  openModal(id);
});

// ── Modal: advance status ─────────────────────────────────────────────────────
document.getElementById("modalAdvance").addEventListener("click", () => {
  if (openRoomId === null) return;
  const r = rooms[openRoomId];
  const idx = STATUSES.indexOf(r.st);
  const next = STATUSES[(idx + 1) % STATUSES.length];
  r.st = next;
  showToast(`Room ${r.n} → ${STATUS_LABELS[next]}`);
  renderTally();
  renderGrid();
  openModal(openRoomId); // refresh modal display
});

// ── Modal: save note ──────────────────────────────────────────────────────────
document.getElementById("modalSave").addEventListener("click", () => {
  if (openRoomId === null) return;
  const r = rooms[openRoomId];
  r.note = document.getElementById("modalNote").value.trim();
  showToast(`Note saved — room ${r.n}`);
  renderGrid();
  closeModal();
});

// ── Modal close ───────────────────────────────────────────────────────────────
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// ── Filter chips ──────────────────────────────────────────────────────────────
document.querySelectorAll(".chip[data-st]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip[data-st]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeFilter = btn.dataset.st;
    renderGrid();
  });
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
renderTally();
renderGrid();
