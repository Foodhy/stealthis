// Floor plan in 640×420 coordinate space
// shape: "round" | "square" | "long" (booth)
const TABLES = [
  // Window — Sofía
  {
    id: "T1",
    x: 50,
    y: 78,
    shape: "round",
    seats: 2,
    status: "seated",
    party: "Reyes ×2",
    server: "Sofía",
    seated: "19:42",
    course: "Mains",
    check: "$112.40",
  },
  { id: "T2", x: 132, y: 78, shape: "round", seats: 2, status: "free", seats_meta: "" },
  {
    id: "T3",
    x: 214,
    y: 78,
    shape: "round",
    seats: 2,
    status: "reserved",
    party: "Marquez 20:00",
    server: "Sofía",
    seated: "—",
    course: "—",
    check: "—",
  },
  {
    id: "T4",
    x: 42,
    y: 142,
    shape: "square",
    seats: 4,
    status: "seated",
    party: "Costa ×3",
    server: "Sofía",
    seated: "19:10",
    course: "Dessert",
    check: "$208.00",
  },
  {
    id: "T5",
    x: 125,
    y: 142,
    shape: "square",
    seats: 4,
    status: "check",
    party: "Vega ×4",
    server: "Sofía",
    seated: "18:55",
    course: "Pre-bill",
    check: "$284.20",
  },
  { id: "T6", x: 208, y: 142, shape: "square", seats: 4, status: "dirty" },

  // Centre — Marco
  {
    id: "T7",
    x: 314,
    y: 78,
    shape: "round",
    seats: 2,
    status: "seated",
    party: "García ×2",
    server: "Marco",
    seated: "20:05",
    course: "Apps",
    check: "$48.00",
  },
  { id: "T8", x: 396, y: 78, shape: "round", seats: 2, status: "free" },
  {
    id: "T9",
    x: 478,
    y: 78,
    shape: "round",
    seats: 2,
    status: "reserved",
    party: "Khoury 20:15",
    server: "Marco",
  },
  { id: "T10", x: 560, y: 78, shape: "round", seats: 2, status: "free" },
  {
    id: "T11",
    x: 308,
    y: 142,
    shape: "square",
    seats: 4,
    status: "seated",
    party: "Loredo ×4",
    server: "Marco",
    seated: "19:20",
    course: "Mains",
    check: "$162.80",
  },
  {
    id: "T12",
    x: 410,
    y: 142,
    shape: "square",
    seats: 4,
    status: "seated",
    party: "Yamamoto ×3",
    server: "Marco",
    seated: "19:50",
    course: "Apps",
    check: "$96.00",
  },
  {
    id: "T13",
    x: 520,
    y: 146,
    shape: "long",
    seats: 6,
    status: "reserved",
    party: "Mendoza 20:30 ×6",
    server: "Marco",
  },

  // Patio — Aitana
  {
    id: "P1",
    x: 58,
    y: 258,
    shape: "round",
    seats: 2,
    status: "seated",
    party: "Park ×2",
    server: "Aitana",
    seated: "20:00",
    course: "Apps",
    check: "$54.00",
  },
  { id: "P2", x: 148, y: 258, shape: "round", seats: 2, status: "free" },
  { id: "P3", x: 238, y: 258, shape: "round", seats: 2, status: "dirty" },
  {
    id: "P4",
    x: 328,
    y: 258,
    shape: "round",
    seats: 2,
    status: "seated",
    party: "Singh ×2",
    server: "Aitana",
    seated: "19:35",
    course: "Mains",
    check: "$118.50",
  },
  {
    id: "P5",
    x: 54,
    y: 344,
    shape: "square",
    seats: 4,
    status: "check",
    party: "Davis ×4",
    server: "Aitana",
    seated: "18:30",
    course: "Pre-bill",
    check: "$312.10",
  },
  {
    id: "P6",
    x: 170,
    y: 348,
    shape: "long",
    seats: 6,
    status: "seated",
    party: "Mota ×5",
    server: "Aitana",
    seated: "19:00",
    course: "Mains",
    check: "$248.00",
  },
  {
    id: "P7",
    x: 326,
    y: 344,
    shape: "square",
    seats: 4,
    status: "reserved",
    party: "Tanaka 20:45",
    server: "Aitana",
  },

  // Bar — Theo
  {
    id: "B1",
    x: 448,
    y: 284,
    shape: "round",
    seats: 2,
    status: "seated",
    party: "Walk-in ×1",
    server: "Theo",
    seated: "20:10",
    course: "Drinks",
    check: "$28.00",
  },
  {
    id: "B2",
    x: 508,
    y: 284,
    shape: "round",
    seats: 2,
    status: "seated",
    party: "Walk-in ×2",
    server: "Theo",
    seated: "20:14",
    course: "Drinks",
    check: "$36.00",
  },
  { id: "B3", x: 568, y: 284, shape: "round", seats: 2, status: "free" },
  { id: "B4", x: 478, y: 348, shape: "round", seats: 2, status: "dirty" },
  { id: "B5", x: 542, y: 348, shape: "round", seats: 2, status: "free" },
];

const CYCLE = ["free", "reserved", "seated", "check", "dirty", "free"];
const STATUS_LABEL = {
  free: "Free",
  reserved: "Reserved",
  seated: "Seated",
  check: "Pre-bill",
  dirty: "Needs bussing",
};
const SEATS_COUNT = {
  round: 2,
  square: 4,
  long: 6,
};
const BASE_SIZES = {
  round: { w: 56, h: 44, r: 22 },
  square: { w: 60, h: 44, rx: 6 },
  long: { w: 92, h: 36, rx: 4 },
};
const PLAN_BOUNDS = {
  w: 640,
  h: 420,
  pad: 8,
};

let selectedId = null;
let tables = TABLES.map((t) => ({ ...t }));
let editMode = false;
let dragState = null;
let suppressClick = false;

const SVG_NS = "http://www.w3.org/2000/svg";
const plan = document.querySelector(".plan");
const tablesG = document.getElementById("tables");
const editToggle = document.getElementById("editToggle");
const addTableBtn = document.getElementById("addTable");
const sideKicker = document.getElementById("sideKicker");
const sideTitle = document.getElementById("sideTitle");
const sideHint = document.getElementById("sideHint");
const sideMeta = document.getElementById("sideMeta");
const sideFoot = document.getElementById("sideFoot");
const editPanel = document.getElementById("editPanel");
const shapeSelect = document.getElementById("shapeSelect");
const sizeDownBtn = document.getElementById("sizeDown");
const sizeUpBtn = document.getElementById("sizeUp");
const sizeValue = document.getElementById("sizeValue");
const duplicateBtn = document.getElementById("duplicateTable");
const deleteBtn = document.getElementById("deleteTable");
const cycleBtn = document.getElementById("sideCycle");
const assignBtn = document.getElementById("sideAssign");

const dStatus = document.getElementById("sideStatus");
const dParty = document.getElementById("sideParty");
const dServer = document.getElementById("sideServer");
const dSeated = document.getElementById("sideSeated");
const dCourse = document.getElementById("sideCourse");
const dCheck = document.getElementById("sideCheck");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getTableSize(t) {
  const base = BASE_SIZES[t.shape] || BASE_SIZES.square;
  const scale = t.scale || 1;
  return {
    w: base.w * scale,
    h: base.h * scale,
    r: (base.r || 0) * scale,
    rx: (base.rx || 0) * scale,
  };
}

function keepTableInBounds(t) {
  const size = getTableSize(t);
  t.x = clamp(t.x, PLAN_BOUNDS.pad, PLAN_BOUNDS.w - size.w - PLAN_BOUNDS.pad);
  t.y = clamp(t.y, PLAN_BOUNDS.pad, PLAN_BOUNDS.h - size.h - PLAN_BOUNDS.pad);
}

function getSvgPoint(e) {
  const ctm = plan.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const point = plan.createSVGPoint();
  point.x = e.clientX;
  point.y = e.clientY;
  return point.matrixTransform(ctm.inverse());
}

function createTable(t) {
  const g = document.createElementNS(SVG_NS, "g");
  g.classList.add("table-group");
  g.dataset.id = t.id;
  g.dataset.status = t.status;

  const size = getTableSize(t);
  let shape;
  if (t.shape === "round") {
    shape = document.createElementNS(SVG_NS, "circle");
    shape.setAttribute("cx", t.x + size.w / 2);
    shape.setAttribute("cy", t.y + size.h / 2);
    shape.setAttribute("r", size.r);
  } else if (t.shape === "square") {
    shape = document.createElementNS(SVG_NS, "rect");
    shape.setAttribute("x", t.x);
    shape.setAttribute("y", t.y);
    shape.setAttribute("width", size.w);
    shape.setAttribute("height", size.h);
    shape.setAttribute("rx", size.rx);
  } else {
    shape = document.createElementNS(SVG_NS, "rect");
    shape.setAttribute("x", t.x);
    shape.setAttribute("y", t.y);
    shape.setAttribute("width", size.w);
    shape.setAttribute("height", size.h);
    shape.setAttribute("rx", size.rx);
  }
  shape.classList.add("table-shape");
  g.appendChild(shape);

  const label = document.createElementNS(SVG_NS, "text");
  label.classList.add("table-label");
  label.setAttribute("x", t.x + size.w / 2);
  label.setAttribute("y", t.y + size.h / 2 + 1);
  label.textContent = t.id;
  g.appendChild(label);

  const sub = document.createElementNS(SVG_NS, "text");
  sub.classList.add("table-sub");
  sub.setAttribute("x", t.x + size.w / 2);
  sub.setAttribute("y", t.y + size.h / 2 + 12);
  sub.textContent = `${t.seats || SEATS_COUNT[t.shape]} seats`;
  g.appendChild(sub);

  return g;
}

function renderTables() {
  tablesG.innerHTML = "";
  tables.forEach((t) => {
    keepTableInBounds(t);
    const node = createTable(t);
    if (t.id === selectedId) node.classList.add("is-selected");
    tablesG.appendChild(node);
  });
  document.getElementById("kpiTotal").textContent = tables.length;
  document.getElementById("kpiOccupied").textContent = tables.filter(
    (t) => t.status === "seated" || t.status === "check"
  ).length;
  document.getElementById("kpiReserved").textContent = tables.filter(
    (t) => t.status === "reserved"
  ).length;
  document.getElementById("kpiCovers").textContent = tables
    .filter((t) => t.status === "seated" || t.status === "check")
    .reduce((sum, t) => {
      const m = (t.party || "").match(/×(\d+)/);
      return sum + (m ? Number(m[1]) : 0);
    }, 0);
}

function renderSide() {
  const t = tables.find((x) => x.id === selectedId);
  if (!t) {
    sideKicker.textContent = editMode ? "Edit layout" : "Select a table";
    sideTitle.textContent = editMode ? "No item selected" : "No table selected";
    sideHint.textContent = editMode
      ? "Add a table or select one on the plan."
      : "Tap any table on the plan to see its status, party and current course.";
    sideHint.hidden = false;
    sideMeta.hidden = true;
    sideFoot.hidden = true;
    updateEditControls();
    return;
  }
  sideKicker.textContent = STATUS_LABEL[t.status];
  sideTitle.textContent = `${t.id} · ${t.seats || SEATS_COUNT[t.shape]} seats`;
  sideHint.hidden = true;
  sideMeta.hidden = false;
  sideFoot.hidden = editMode;
  dStatus.textContent = STATUS_LABEL[t.status];
  dStatus.dataset.tone = t.status;
  dParty.textContent = t.party || "—";
  dServer.textContent = t.server || "—";
  dSeated.textContent = t.seated || "—";
  dCourse.textContent = t.course || "—";
  dCheck.textContent = t.check || "—";
  updateEditControls();
}

function updateEditControls() {
  const selected = tables.find((x) => x.id === selectedId);
  document.body.classList.toggle("is-editing", editMode);
  editToggle.textContent = editMode ? "Done" : "Edit layout";
  editToggle.setAttribute("aria-pressed", String(editMode));
  addTableBtn.disabled = !editMode;
  editPanel.hidden = !editMode;

  const hasSelection = Boolean(selected);
  shapeSelect.disabled = !editMode || !hasSelection;
  sizeDownBtn.disabled = !editMode || !hasSelection;
  sizeUpBtn.disabled = !editMode || !hasSelection;
  duplicateBtn.disabled = !editMode || !hasSelection;
  deleteBtn.disabled = !editMode || !hasSelection;

  if (selected) {
    shapeSelect.value = selected.shape;
    sizeValue.textContent = `${Math.round((selected.scale || 1) * 100)}%`;
  } else {
    sizeValue.textContent = "100%";
  }
}

function nextTableId() {
  let i = 1;
  while (tables.some((t) => t.id === `N${i}`)) i += 1;
  return `N${i}`;
}

function addTable(seed) {
  const source = seed || tables.find((t) => t.id === selectedId);
  const t = {
    id: nextTableId(),
    x: source ? source.x + 24 : 292,
    y: source ? source.y + 24 : 214,
    shape: source ? source.shape : "square",
    seats: source ? source.seats || SEATS_COUNT[source.shape] : 4,
    status: "free",
    scale: source ? source.scale || 1 : 1,
  };
  keepTableInBounds(t);
  tables.push(t);
  selectedId = t.id;
  renderTables();
  renderSide();
}

function resizeSelected(delta) {
  const t = tables.find((x) => x.id === selectedId);
  if (!t) return;
  t.scale = clamp((t.scale || 1) + delta, 0.75, 1.5);
  keepTableInBounds(t);
  renderTables();
  renderSide();
}

tablesG.addEventListener("click", (e) => {
  if (suppressClick) return;
  const g = e.target.closest("[data-id]");
  if (!g) return;
  selectedId = g.dataset.id;
  renderTables();
  renderSide();
});

tablesG.addEventListener("pointerdown", (e) => {
  const g = e.target.closest("[data-id]");
  if (!g || !editMode) return;
  const t = tables.find((x) => x.id === g.dataset.id);
  if (!t) return;

  selectedId = t.id;
  const point = getSvgPoint(e);
  dragState = {
    id: t.id,
    dx: point.x - t.x,
    dy: point.y - t.y,
    moved: false,
  };
  document.body.classList.add("is-dragging");
  renderTables();
  renderSide();
  e.preventDefault();
});

window.addEventListener("pointermove", (e) => {
  if (!dragState) return;
  const t = tables.find((x) => x.id === dragState.id);
  if (!t) return;
  const point = getSvgPoint(e);
  t.x = point.x - dragState.dx;
  t.y = point.y - dragState.dy;
  keepTableInBounds(t);
  dragState.moved = true;
  renderTables();
  renderSide();
  e.preventDefault();
});

window.addEventListener("pointerup", () => {
  if (!dragState) return;
  suppressClick = dragState.moved;
  dragState = null;
  document.body.classList.remove("is-dragging");
  if (suppressClick) {
    window.setTimeout(() => {
      suppressClick = false;
    }, 0);
  }
});

editToggle.addEventListener("click", () => {
  editMode = !editMode;
  renderTables();
  renderSide();
});

addTableBtn.addEventListener("click", () => {
  if (!editMode) return;
  addTable();
});

duplicateBtn.addEventListener("click", () => {
  if (!editMode) return;
  const selected = tables.find((t) => t.id === selectedId);
  if (!selected) return;
  addTable(selected);
});

deleteBtn.addEventListener("click", () => {
  if (!editMode || !selectedId) return;
  tables = tables.filter((t) => t.id !== selectedId);
  selectedId = null;
  renderTables();
  renderSide();
});

shapeSelect.addEventListener("change", () => {
  const t = tables.find((x) => x.id === selectedId);
  if (!t) return;
  t.shape = shapeSelect.value;
  t.seats = SEATS_COUNT[t.shape];
  keepTableInBounds(t);
  renderTables();
  renderSide();
});

sizeDownBtn.addEventListener("click", () => resizeSelected(-0.1));
sizeUpBtn.addEventListener("click", () => resizeSelected(0.1));

cycleBtn.addEventListener("click", () => {
  const t = tables.find((x) => x.id === selectedId);
  if (!t) return;
  const i = CYCLE.indexOf(t.status);
  t.status = CYCLE[(i + 1) % CYCLE.length];
  if (t.status === "free") {
    t.party = undefined;
    t.seated = undefined;
    t.course = undefined;
    t.check = undefined;
    t.server = undefined;
  }
  if (t.status === "seated" && !t.party) {
    t.party = "Walk-in";
    t.seated = `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}`;
    t.course = "Apps";
    t.check = "$0.00";
    t.server = "—";
  }
  renderTables();
  renderSide();
});

assignBtn.addEventListener("click", () => {
  const t = tables.find((x) => x.id === selectedId);
  if (!t) return;
  const name = prompt("Party name:", t.party || "");
  if (!name) return;
  t.party = name;
  if (t.status === "free") t.status = "reserved";
  renderTables();
  renderSide();
});

renderTables();
renderSide();
