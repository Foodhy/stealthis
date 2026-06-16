// ─── Period data sets ───
const PERIODS = {
  today: {
    label: "Today",
    chartKicker: "Revenue · today by hour",
    days: ["12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h", "23h"],
    curr: [480, 620, 710, 540, 390, 680, 1240, 1980, 2340, 1860, 1420, 640],
    prev: [410, 580, 660, 500, 360, 620, 1140, 1820, 2180, 1720, 1310, 590],
    kCoversLabel: "Covers · today",
    kCovers: "68",
    kCoversDelta: "▲ 4.6% vs yesterday",
    kCoversDeltaClass: "is-up",
    kRevenue: "$5,820",
    kRevenueDelta: "▲ 6.1%",
    kRevenueDeltaClass: "is-up",
    kAvg: "$85",
    kAvgDelta: "▲ 1.4%",
    kAvgDeltaClass: "is-up",
    kTurn: "1h 38m",
    kTurnDelta: "▲ 8 min faster",
    kTurnDeltaClass: "is-up",
    kCancel: "1",
    kCancelDelta: "▼ 1 fewer than avg",
    kCancelDeltaClass: "is-up",
    kTonight: '38 <span class="kpi-sub">/ 42 seats</span>',
  },
  week: {
    label: "This week",
    chartKicker: "Revenue · last 7 days",
    days: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"],
    curr: [3200, 3450, 3980, 5320, 6850, 5840, 3540],
    prev: [2900, 3210, 3650, 4920, 6120, 5430, 3380],
    kCoversLabel: "Covers · this week",
    kCovers: "412",
    kCoversDelta: "▲ 8.2% vs last week",
    kCoversDeltaClass: "is-up",
    kRevenue: "$32,184",
    kRevenueDelta: "▲ 11.4% · target met",
    kRevenueDeltaClass: "is-up",
    kAvg: "$78",
    kAvgDelta: "▼ 2.8%",
    kAvgDeltaClass: "is-down",
    kTurn: "1h 42m",
    kTurnDelta: "▲ 6 min faster",
    kTurnDeltaClass: "is-up",
    kCancel: "4",
    kCancelDelta: "— same as last week",
    kCancelDeltaClass: "is-flat",
    kTonight: '38 <span class="kpi-sub">/ 42 seats</span>',
  },
  month: {
    label: "This month",
    chartKicker: "Revenue · last 4 weeks",
    days: ["Wk 1", "Wk 2", "Wk 3", "Wk 4"],
    curr: [28400, 31200, 34800, 32184],
    prev: [25600, 29800, 32100, 30560],
    kCoversLabel: "Covers · this month",
    kCovers: "1,648",
    kCoversDelta: "▲ 9.4% vs last month",
    kCoversDeltaClass: "is-up",
    kRevenue: "$126,584",
    kRevenueDelta: "▲ 13.2% · best month",
    kRevenueDeltaClass: "is-up",
    kAvg: "$76",
    kAvgDelta: "▼ 1.4%",
    kAvgDeltaClass: "is-down",
    kTurn: "1h 45m",
    kTurnDelta: "▲ 4 min faster",
    kTurnDeltaClass: "is-up",
    kCancel: "17",
    kCancelDelta: "▲ 3 more than last month",
    kCancelDeltaClass: "is-down",
    kTonight: '38 <span class="kpi-sub">/ 42 seats</span>',
  },
};

// ─── Chart rendering ───
const W = 600;
const H = 220;
const PX = 40;
const PY = 30;
const innerW = W - PX - 20;
const innerH = H - PY - 30;

const maxY = 8000;
function px(i, n) {
  return PX + (i / (n - 1)) * innerW;
}
function py(v) {
  return PY + innerH - (v / maxY) * innerH;
}
function pathFor(arr) {
  return arr.map((v, i) => `${i === 0 ? "M" : "L"}${px(i, arr.length)} ${py(v)}`).join(" ");
}
function areaFor(arr) {
  const top = pathFor(arr);
  const last = arr.length - 1;
  return `${top} L ${px(last, arr.length)} ${py(0)} L ${px(0, arr.length)} ${py(0)} Z`;
}

function drawChart(data) {
  document.getElementById("currLine").setAttribute("d", pathFor(data.curr));
  document.getElementById("prevLine").setAttribute("d", pathFor(data.prev));
  document.getElementById("currArea").setAttribute("d", areaFor(data.curr));

  document.getElementById("xLabels").innerHTML = data.days
    .map(
      (d, i) =>
        `<text x="${px(i, data.days.length)}" y="${H - 8}" text-anchor="middle">${d}</text>`
    )
    .join("");

  document.getElementById("dots").innerHTML = data.curr
    .map(
      (v, i) =>
        `<circle class="dot" cx="${px(i, data.curr.length)}" cy="${py(v)}" r="4">
      <title>${data.days[i]} · $${v.toLocaleString()}</title>
    </circle>`
    )
    .join("");

  document.getElementById("chartKicker").textContent = data.chartKicker;
}

function updateKPIs(data) {
  const kCoversLabel = document.getElementById("kCoversLabel");
  const kCovers = document.getElementById("kCovers");
  const kCoversDelta = document.getElementById("kCoversDelta");
  const kRevenue = document.getElementById("kRevenue");
  const kRevenueDelta = document.getElementById("kRevenueDelta");
  const kAvg = document.getElementById("kAvg");
  const kAvgDelta = document.getElementById("kAvgDelta");
  const kTurn = document.getElementById("kTurn");
  const kTurnDelta = document.getElementById("kTurnDelta");
  const kCancel = document.getElementById("kCancel");
  const kCancelDelta = document.getElementById("kCancelDelta");
  const kTonight = document.getElementById("kTonight");

  if (kCoversLabel) kCoversLabel.textContent = data.kCoversLabel;
  if (kCovers) kCovers.textContent = data.kCovers;
  if (kCoversDelta) {
    kCoversDelta.textContent = data.kCoversDelta;
    kCoversDelta.className = "kpi-delta " + data.kCoversDeltaClass;
  }
  if (kRevenue) kRevenue.textContent = data.kRevenue;
  if (kRevenueDelta) {
    kRevenueDelta.textContent = data.kRevenueDelta;
    kRevenueDelta.className = "kpi-delta " + data.kRevenueDeltaClass;
  }
  if (kAvg) kAvg.textContent = data.kAvg;
  if (kAvgDelta) {
    kAvgDelta.textContent = data.kAvgDelta;
    kAvgDelta.className = "kpi-delta " + data.kAvgDeltaClass;
  }
  if (kTurn) kTurn.textContent = data.kTurn;
  if (kTurnDelta) {
    kTurnDelta.textContent = data.kTurnDelta;
    kTurnDelta.className = "kpi-delta " + data.kTurnDeltaClass;
  }
  if (kCancel) kCancel.textContent = data.kCancel;
  if (kCancelDelta) {
    kCancelDelta.textContent = data.kCancelDelta;
    kCancelDelta.className = "kpi-delta " + data.kCancelDeltaClass;
  }
  if (kTonight) kTonight.innerHTML = data.kTonight;
}

// ─── Period selector ───
let activePeriod = "week";

function applyPeriod(period) {
  activePeriod = period;
  const data = PERIODS[period];
  drawChart(data);
  updateKPIs(data);
  document.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.period === period);
  });
}

document.querySelectorAll(".seg-btn[data-period]").forEach((btn) => {
  btn.addEventListener("click", () => applyPeriod(btn.dataset.period));
});

// Initial render
applyPeriod("week");

// ─── Top items ───
const TOP = [
  { name: "Ribeye 14oz", sub: "Mains · dry-aged 28 d", amt: 4264 },
  { name: "Burrata huerta", sub: "Apps", amt: 2880 },
  { name: "Pappardelle ragú", sub: "Pasta", amt: 2496 },
  { name: "Branzino entero", sub: "Mains · whole sea bass", amt: 2280 },
  { name: "Tarta de queso", sub: "Dessert · burnt cheesecake", amt: 1958 },
  { name: "Risotto hongos", sub: "Pasta · vegetarian", amt: 1768 },
  { name: "Pulpo brasa", sub: "Apps", amt: 1672 },
  { name: "Negroni sbagliato", sub: "Drinks", amt: 1568 },
];
document.getElementById("topItems").innerHTML = TOP.map(
  (t, i) => `<li>
    <span class="ti-no">${String(i + 1).padStart(2, "0")}</span>
    <span class="ti-name">${t.name}<small>${t.sub}</small></span>
    <span class="ti-amt">$${t.amt.toLocaleString()}</span>
  </li>`
).join("");

// ─── Heatmap (rows = days, cols = service hours) ───
const HEAT_DAYS = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
const HEAT_HOURS = ["18", "19", "20", "21", "22"];
// values 0..5 (low → high)
const HEAT = [
  [1, 3, 4, 3, 1],
  [1, 3, 4, 3, 1],
  [2, 4, 5, 4, 2],
  [2, 4, 5, 5, 3],
  [3, 5, 5, 5, 3],
  [2, 4, 4, 2, 0],
  [0, 0, 0, 0, 0],
];
const heatmap = document.getElementById("heatmap");
let html = `<span class="h-label"></span>`;
HEAT_HOURS.forEach((h) => (html += `<span class="h-label">${h}h</span>`));
HEAT_DAYS.forEach((day, r) => {
  html += `<span class="h-label">${day}</span>`;
  HEAT[r].forEach((v) => {
    html += `<span class="h-cell" data-h="${v}" title="${day} ${HEAT_HOURS[0]}h · ${v}/5"></span>`;
  });
});
heatmap.innerHTML = html;
heatmap.style.gridTemplateColumns = `60px repeat(${HEAT_HOURS.length}, 1fr)`;

// ─── Reservation preview ───
const RES = [
  { time: "19:00", name: "Reyes", meta: "×2 · table 4", tag: "Window", t: "window" },
  {
    time: "19:15",
    name: "García-Tan",
    meta: "×4 · table 11 · birthday",
    tag: "Birthday",
    t: "party",
  },
  { time: "19:30", name: "Khoury", meta: "×2 · bar · regular", tag: "VIP", t: "vip" },
  { time: "20:00", name: "Marquez", meta: "×2 · table 3", tag: "—", t: "" },
  { time: "20:15", name: "Loredo", meta: "×4 · table 5", tag: "—", t: "" },
  {
    time: "20:30",
    name: "Mendoza",
    meta: "×6 · long table · catering enquiry",
    tag: "Large",
    t: "party",
  },
  { time: "20:45", name: "Tanaka", meta: "×3 · table 12", tag: "—", t: "" },
  { time: "21:00", name: "Singh", meta: "×2 · patio", tag: "—", t: "" },
];
document.getElementById("resList").innerHTML = RES.map(
  (r) => `<li class="res-row">
    <span class="res-time">${r.time}</span>
    <span>
      <p class="res-name">${r.name}</p>
      <p class="res-meta">${r.meta}</p>
    </span>
    ${r.t ? `<span class="res-tag" data-t="${r.t}">${r.tag}</span>` : ""}
  </li>`
).join("");

// ─── Section switching ───
const SECTION_TITLES = {
  dashboard: "Dashboard",
  reservations: "Reservations",
  menu: "Menu",
  inventory: "Inventory",
  staff: "Staff",
  service: "Tonight · Service",
  alerts: "Alerts",
};

function switchSection(sectionId) {
  // Toggle sections
  document.querySelectorAll(".section").forEach((sec) => {
    sec.hidden = sec.id !== "s-" + sectionId;
  });
  // Update nav active state
  document.querySelectorAll(".r-link[data-section]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.section === sectionId);
  });
  // Update page title
  const title = document.getElementById("pageTitle");
  if (title) title.textContent = SECTION_TITLES[sectionId] || sectionId;
  // Show/hide period selector (only on dashboard)
  const seg = document.querySelector(".seg");
  if (seg) seg.style.visibility = sectionId === "dashboard" ? "" : "hidden";
}

document.querySelectorAll(".r-link[data-section]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const sec = link.dataset.section;
    if (sec === "service") renderServiceFloor();
    switchSection(sec);
  });
});

// ─── Service section ───
let serviceOpen = true;
const TABLE_NAMES = ["T1", "T2", "T4", "T5", "T7", "T9", "T11"];

function renderServiceFloor() {
  const floor = document.getElementById("svcFloor");
  if (!floor) return;
  floor.innerHTML = TABLE_NAMES.map(
    (t) => `<div class="svc-table"><span class="svc-tname">${t}</span><span class="svc-status">Active</span></div>`
  ).join("");
}

document.getElementById("closeServiceBtn")?.addEventListener("click", () => {
  serviceOpen = false;
  const dot = document.getElementById("serviceDot");
  if (dot) { dot.style.background = "var(--warm-gray, #999)"; }
  const label = document.getElementById("serviceStatusLabel");
  if (label) label.textContent = "Service closed";
  const btn = document.getElementById("closeServiceBtn");
  if (btn) { btn.textContent = "Reopen service"; btn.classList.replace("btn-danger", "btn-primary"); }
  btn?.addEventListener("click", () => {
    serviceOpen = true;
    if (dot) dot.style.background = "";
    if (label) label.textContent = "Service open since 19:00";
    btn.textContent = "Close service";
    btn.classList.replace("btn-primary", "btn-danger");
  }, { once: true });
});

// ─── Alerts section ───
let alerts = ["pasta", "noshow"];

function updateAlertsCount() {
  const countEl = document.getElementById("alertsCount");
  const label = document.getElementById("alertsLabel");
  const empty = document.getElementById("alertsEmpty");
  const count = alerts.length;
  if (countEl) countEl.textContent = count === 0 ? "No active alerts" : `${count} active alert${count > 1 ? "s" : ""}`;
  if (label) label.textContent = count === 0 ? "No alerts" : `${count} alert${count > 1 ? "s" : ""}`;
  if (empty) empty.hidden = count > 0;
}

document.getElementById("alertsList")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const alertId = btn.dataset.alert;
  const action = btn.dataset.action;
  const li = document.querySelector(`[data-alert="${alertId}"]`);
  if (action === "reorder" && alertId === "pasta") {
    li.querySelector(".alert-meta").textContent = "Reordered · arriving tomorrow";
    li.querySelector("[data-action='reorder']").disabled = true;
    li.querySelector("[data-action='reorder']").textContent = "Ordered ✓";
  } else if (action === "release" && alertId === "noshow") {
    li.querySelector(".alert-meta").textContent = "Table 4 released and made available";
    btn.disabled = true;
    btn.textContent = "Released ✓";
  } else if (action === "dismiss") {
    li.remove();
    alerts = alerts.filter((a) => a !== alertId);
    updateAlertsCount();
  }
});

// Also wire the "Open reservation manager" card-cta link
document.querySelectorAll(".card-cta[data-section]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    switchSection(link.dataset.section);
  });
});
