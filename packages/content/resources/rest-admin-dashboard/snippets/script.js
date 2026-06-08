// ─── Revenue chart ───
const DAYS = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
const CURR = [3200, 3450, 3980, 5320, 6850, 5840, 3540]; // $
const PREV = [2900, 3210, 3650, 4920, 6120, 5430, 3380];

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

document.getElementById("currLine").setAttribute("d", pathFor(CURR));
document.getElementById("prevLine").setAttribute("d", pathFor(PREV));
document.getElementById("currArea").setAttribute("d", areaFor(CURR));

const xLabels = document.getElementById("xLabels");
xLabels.innerHTML = DAYS.map(
  (d, i) => `<text x="${px(i, DAYS.length)}" y="${H - 8}" text-anchor="middle">${d}</text>`
).join("");

const dots = document.getElementById("dots");
dots.innerHTML = CURR.map(
  (v, i) => `<circle class="dot" cx="${px(i, CURR.length)}" cy="${py(v)}" r="4">
    <title>${DAYS[i]} · $${v.toLocaleString()}</title>
  </circle>`
).join("");

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
// Header row (empty corner + hour labels turned per-row — we use a per-col header here)
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
