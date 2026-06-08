// ── Toast ──────────────────────────────────────────────────────────────────
const toastEl = document.getElementById("toast");
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (toastEl.hidden = true), 2600);
}

// ── Time model ───────────────────────────────────────────────────────────────
// 8:00 AM → 5:00 PM in 30-min blocks. Slot index 0 = 8:00.
const START_MIN = 8 * 60;
const SLOT_MIN = 30;
const SLOTS = 18; // 8:00 .. 4:30 start blocks (last visible block 4:30–5:00)

function slotToLabel(i) {
  const total = START_MIN + i * SLOT_MIN;
  let h = Math.floor(total / 60);
  const m = total % 60;
  const mer = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${mer}`;
}

// ── Data: doctors, rooms, appointments ───────────────────────────────────────
const doctors = [
  { id: "okafor", name: "Dr. Lena Okafor", spec: "Cardiology", initials: "LO" },
  { id: "patel", name: "Dr. Ravi Patel", spec: "Primary care", initials: "RP" },
  { id: "bloom", name: "Dr. Maya Bloom", spec: "Dermatology", initials: "MB" },
  { id: "reyes", name: "Dr. Tomas Reyes", spec: "Orthopedics", initials: "TR" },
  { id: "novak", name: "Dr. Anja Novak", spec: "Pediatrics", initials: "AN" },
];

const rooms = [
  { id: "r201", name: "Room 201", spec: "Exam · Floor 2", initials: "201" },
  { id: "r202", name: "Room 202", spec: "Exam · Floor 2", initials: "202" },
  { id: "r210", name: "Procedure A", spec: "Surgical · Floor 2", initials: "PA" },
  { id: "r305", name: "Room 305", spec: "Exam · Floor 3", initials: "305" },
  { id: "tele", name: "Telehealth", spec: "Remote bay", initials: "TH" },
];

const TYPES = {
  new: { label: "New patient", cls: "t-new" },
  follow: { label: "Follow-up", cls: "t-follow" },
  proc: { label: "Procedure", cls: "t-proc" },
  tele: { label: "Telehealth", cls: "t-tele" },
};

// start = slot index, len = number of 30-min blocks
const appts = [
  // Okafor
  { doctor: "okafor", room: "r201", start: 0, len: 1, type: "follow", patient: "George Hale", reason: "Hypertension review" },
  { doctor: "okafor", room: "r201", start: 2, len: 2, type: "new", patient: "Priya Anand", reason: "Initial cardiac consult" },
  { doctor: "okafor", room: "tele", start: 6, len: 1, type: "tele", patient: "Marcus Webb", reason: "ECG results call" },
  { doctor: "okafor", room: "r210", start: 10, len: 3, type: "proc", patient: "Dolores Kim", reason: "Stress echocardiogram" },
  { doctor: "okafor", room: "r201", start: 15, len: 1, type: "follow", patient: "Ian Frost", reason: "Medication titration" },
  // Patel
  { doctor: "patel", room: "r202", start: 0, len: 2, type: "new", patient: "Sofia Marlow", reason: "New patient intake" },
  { doctor: "patel", room: "r202", start: 3, len: 1, type: "follow", patient: "Henry Dawes", reason: "Lab follow-up" },
  { doctor: "patel", room: "tele", start: 5, len: 1, type: "tele", patient: "Aisha Bello", reason: "Refill check-in" },
  { doctor: "patel", room: "r202", start: 8, len: 2, type: "follow", patient: "Owen Pritchard", reason: "Diabetes management" },
  { doctor: "patel", room: "r202", start: 12, len: 1, type: "new", patient: "Lucia Mendez", reason: "Annual physical" },
  { doctor: "patel", room: "r202", start: 16, len: 2, type: "follow", patient: "Nadia Hart", reason: "Thyroid recheck" },
  // Bloom
  { doctor: "bloom", room: "r305", start: 1, len: 1, type: "follow", patient: "Theo Vance", reason: "Eczema follow-up" },
  { doctor: "bloom", room: "r210", start: 3, len: 2, type: "proc", patient: "Renata Cole", reason: "Lesion excision" },
  { doctor: "bloom", room: "r305", start: 7, len: 1, type: "new", patient: "Jonah Reed", reason: "Skin screening" },
  { doctor: "bloom", room: "tele", start: 11, len: 1, type: "tele", patient: "Mira Solis", reason: "Rash photo review" },
  { doctor: "bloom", room: "r305", start: 14, len: 2, type: "follow", patient: "Caleb Nguyen", reason: "Acne treatment review" },
  // Reyes
  { doctor: "reyes", room: "r210", start: 0, len: 3, type: "proc", patient: "Della Ortiz", reason: "Knee arthroscopy" },
  { doctor: "reyes", room: "r305", start: 5, len: 1, type: "new", patient: "Sam Whitlock", reason: "Shoulder eval" },
  { doctor: "reyes", room: "r305", start: 8, len: 1, type: "follow", patient: "Bea Lindqvist", reason: "Post-op check" },
  { doctor: "reyes", room: "tele", start: 12, len: 1, type: "tele", patient: "Omar Said", reason: "Imaging review" },
  { doctor: "reyes", room: "r305", start: 15, len: 2, type: "follow", patient: "Grace Yoon", reason: "Physio progress" },
  // Novak
  { doctor: "novak", room: "r201", start: 4, len: 1, type: "new", patient: "Eli Brandt (age 6)", reason: "Well-child visit" },
  { doctor: "novak", room: "r201", start: 6, len: 1, type: "follow", patient: "Maya Tran (age 4)", reason: "Asthma follow-up" },
  { doctor: "novak", room: "tele", start: 9, len: 1, type: "tele", patient: "Liam Hayes (age 9)", reason: "Cold symptoms call" },
  { doctor: "novak", room: "r201", start: 11, len: 2, type: "new", patient: "Zoe Park (age 2)", reason: "Vaccination + intake" },
  { doctor: "novak", room: "r201", start: 16, len: 1, type: "follow", patient: "Noah Fields (age 7)", reason: "Growth check" },
];

// ── State ────────────────────────────────────────────────────────────────────
let viewMode = "doctor"; // "doctor" | "room"
let range = "day"; // "day" | "week"
let filter = "all";

const grid = document.getElementById("grid");

// ── Populate doctor filter ───────────────────────────────────────────────────
const docFilter = document.getElementById("doctor-filter");
doctors.forEach((d) => {
  const opt = document.createElement("option");
  opt.value = d.id;
  opt.textContent = d.name;
  docFilter.appendChild(opt);
});

// ── Render the grid ──────────────────────────────────────────────────────────
function render() {
  const rows = viewMode === "doctor" ? doctors : rooms;
  const rowKey = viewMode === "doctor" ? "doctor" : "room";

  grid.style.gridTemplateColumns = `var(--label-w) repeat(${SLOTS}, var(--col-w))`;
  grid.innerHTML = "";

  // header row: corner + time labels
  const corner = document.createElement("div");
  corner.className = "g-corner";
  corner.textContent = viewMode === "doctor" ? "Provider" : "Room";
  grid.appendChild(corner);

  for (let i = 0; i < SLOTS; i++) {
    const t = document.createElement("div");
    t.className = "g-time";
    // label only on the hour to reduce clutter
    t.textContent = i % 2 === 0 ? slotToLabel(i) : "";
    grid.appendChild(t);
  }

  // body rows
  rows.forEach((row) => {
    const label = document.createElement("div");
    label.className = "g-rowlabel";
    label.innerHTML =
      `<span class="row-avatar">${row.initials}</span>` +
      `<span class="row-meta">` +
      `<span class="row-name">${escape(row.name)}</span>` +
      `<span class="row-spec">${escape(row.spec)}</span>` +
      `</span>`;
    grid.appendChild(label);

    // track spanning all slot columns
    const track = document.createElement("div");
    track.className = "g-track";
    track.style.gridColumn = `2 / span ${SLOTS}`;
    for (let i = 0; i < SLOTS; i++) {
      const cell = document.createElement("div");
      cell.className = "g-cell" + (i % 2 === 1 ? " is-half" : "");
      track.appendChild(cell);
    }

    // appointments for this row
    appts
      .filter((a) => a[rowKey] === row.id)
      .forEach((a) => {
        const block = document.createElement("button");
        const t = TYPES[a.type];
        const dimmed =
          filter !== "all" && a.doctor !== filter ? " is-dim" : "";
        block.className = `appt ${t.cls}${dimmed}`;
        block.style.left = `calc(${a.start} * var(--col-w) + 3px)`;
        block.style.width = `calc(${a.len} * var(--col-w) - 6px)`;
        block.dataset.id = `${a.doctor}-${a.start}-${a.room}`;
        const dctr = doctors.find((d) => d.id === a.doctor);
        block.innerHTML =
          `<span class="appt-name">${escape(a.patient)}</span>` +
          `<span class="appt-sub">${slotToLabel(a.start)} · ${t.label}</span>`;
        block.addEventListener("click", () => openDetail(a, dctr, block));
        block.setAttribute(
          "aria-label",
          `${a.patient}, ${t.label}, ${slotToLabel(a.start)}, ${
            dctr ? dctr.name : ""
          }`
        );
        track.appendChild(block);
      });

    grid.appendChild(track);
  });

  updateStats();
}

function escape(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

// ── Utilization summary (live) ───────────────────────────────────────────────
function updateStats() {
  // Count against currently visible rows, honoring the doctor filter.
  let visible = appts;
  if (filter !== "all") visible = appts.filter((a) => a.doctor === filter);

  const rows = viewMode === "doctor" ? doctors : rooms;
  const rowKey = viewMode === "doctor" ? "doctor" : "room";
  const activeRows =
    filter === "all"
      ? rows
      : rows.filter((r) =>
          visible.some((a) => a[rowKey] === r.id)
        );

  const capacity = (filter === "all" ? rows.length : activeRows.length || 1) *
    SLOTS *
    (range === "week" ? 5 : 1);

  let booked = visible.reduce((sum, a) => sum + a.len, 0);
  if (range === "week") booked = Math.round(booked * 4.6); // illustrative week fill

  const open = Math.max(capacity - booked, 0);
  const util = capacity ? Math.round((booked / capacity) * 100) : 0;

  document.getElementById("stat-booked").textContent = booked;
  document.getElementById("stat-open").textContent = open;
  document.getElementById("stat-util").textContent = `${util}%`;
  document.getElementById("util-fill").style.width = `${Math.min(util, 100)}%`;

  const unit = range === "week" ? "this week" : "today";
  document.getElementById("stat-booked-foot").textContent = `slots ${unit}`;
  document.getElementById("stat-open-foot").textContent = `slots ${unit}`;
}

// ── Detail side panel ────────────────────────────────────────────────────────
const panel = document.getElementById("detail");
const scrim = document.getElementById("scrim");
let activeBlock = null;

function openDetail(a, dctr, block) {
  if (activeBlock) activeBlock.classList.remove("is-active");
  activeBlock = block;
  block.classList.add("is-active");

  const t = TYPES[a.type];
  const room = rooms.find((r) => r.id === a.room);
  const tag = document.getElementById("detail-tag");
  tag.textContent = t.label;
  tag.className = `panel-tag ${t.cls}`;

  document.getElementById("detail-title").textContent = a.patient;
  const endLabel = slotToLabel(a.start + a.len);
  document.getElementById("detail-time").textContent = `${slotToLabel(
    a.start
  )} – ${endLabel}`;
  document.getElementById("detail-doctor").textContent = dctr
    ? `${dctr.name} · ${dctr.spec}`
    : "—";
  document.getElementById("detail-room").textContent = room ? room.name : "—";
  document.getElementById("detail-type").textContent = t.label;
  document.getElementById("detail-reason").textContent = a.reason;

  panel.hidden = false;
  panel.setAttribute("aria-hidden", "false");
  scrim.hidden = false;
  requestAnimationFrame(() => {
    panel.classList.add("is-open");
    scrim.classList.add("is-open");
  });
  document.getElementById("detail-close").focus();
}

function closeDetail() {
  panel.classList.remove("is-open");
  scrim.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  if (activeBlock) activeBlock.classList.remove("is-active");
  setTimeout(() => {
    panel.hidden = true;
    scrim.hidden = true;
  }, 280);
}

document.getElementById("detail-close").addEventListener("click", closeDetail);
scrim.addEventListener("click", closeDetail);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !panel.hidden) closeDetail();
});

panel.querySelectorAll("[data-panel-action]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = document.getElementById("detail-title").textContent;
    if (btn.dataset.panelAction === "checkin") {
      toast(`${name} checked in — provider notified.`);
    } else {
      toast(`Reschedule ${name}: drag to a new open slot.`);
    }
    closeDetail();
  });
});

// ── Toggles + filter ─────────────────────────────────────────────────────────
document.getElementById("view-toggle").addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn || btn.dataset.view === viewMode) return;
  viewMode = btn.dataset.view;
  syncSeg("view-toggle", btn);
  // filter only applies to doctor rows; reset it when viewing rooms
  if (viewMode === "room") {
    filter = "all";
    docFilter.value = "all";
  }
  docFilter.disabled = viewMode === "room";
  render();
});

document.getElementById("range-toggle").addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn || btn.dataset.range === range) return;
  range = btn.dataset.range;
  syncSeg("range-toggle", btn);
  document.querySelector(".sub").textContent =
    range === "week"
      ? "Northpoint Clinic · Week of June 8–12"
      : "Northpoint Clinic · Tuesday, June 9";
  updateStats();
  toast(range === "week" ? "Showing week utilization." : "Showing day view.");
});

docFilter.addEventListener("change", () => {
  filter = docFilter.value;
  render();
});

function syncSeg(groupId, active) {
  document.querySelectorAll(`#${groupId} .seg-btn`).forEach((b) => {
    const on = b === active;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", String(on));
  });
}

// ── Init ─────────────────────────────────────────────────────────────────────
render();
