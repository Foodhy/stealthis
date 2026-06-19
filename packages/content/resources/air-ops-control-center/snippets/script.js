"use strict";

/* ---------- Fictional ops data ---------- */
const PLANE_SVG =
  '<svg class="plane" viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M2 13l8-2 3-7 1.4.4-1.8 6.6 6-1.6.6 1.4-5.6 2.5L11 19l-1.2-.3-.2-4.6L4 16.2 2 13z" fill="currentColor"/></svg>';

const FLIGHTS = [
  { fn: "CR412", from: "JFK", to: "LHR", sched: "08:10", est: "08:10", gate: "B22", ac: "A350-900", tail: "CR-NXA", status: "departed", paxLoad: 96 },
  { fn: "CR118", from: "LHR", to: "DXB", sched: "09:25", est: "09:55", gate: "A14", ac: "B787-9", tail: "CR-PWB", status: "delayed", paxLoad: 88 },
  { fn: "CR205", from: "CDG", to: "JFK", sched: "10:05", est: "10:05", gate: "C07", ac: "A330-300", tail: "CR-MTC", status: "boarding", paxLoad: 92 },
  { fn: "CR731", from: "DXB", to: "SIN", sched: "10:40", est: "10:40", gate: "D31", ac: "B777-300", tail: "CR-LQD", status: "ontime", paxLoad: 74 },
  { fn: "CR509", from: "LHR", to: "FRA", sched: "11:15", est: "—", gate: "—", ac: "A320neo", tail: "CR-VKE", status: "cancelled", paxLoad: 0 },
  { fn: "CR860", from: "SIN", to: "HND", sched: "11:30", est: "11:30", gate: "E12", ac: "A350-900", tail: "CR-NXA", status: "ontime", paxLoad: 81 },
  { fn: "CR322", from: "JFK", to: "CDG", sched: "12:00", est: "12:25", gate: "B09", ac: "B787-9", tail: "CR-PWB", status: "delayed", paxLoad: 90 },
  { fn: "CR144", from: "FRA", to: "DXB", sched: "12:45", est: "12:45", gate: "A03", ac: "A330-300", tail: "CR-MTC", status: "boarding", paxLoad: 68 },
  { fn: "CR677", from: "HND", to: "SIN", sched: "13:10", est: "13:10", gate: "E20", ac: "B777-300", tail: "CR-LQD", status: "ontime", paxLoad: 79 },
  { fn: "CR238", from: "DXB", to: "LHR", sched: "13:35", est: "13:35", gate: "D08", ac: "A320neo", tail: "CR-VKE", status: "ontime", paxLoad: 85 },
  { fn: "CR901", from: "CDG", to: "FRA", sched: "14:05", est: "14:50", gate: "C18", ac: "A350-900", tail: "CR-NXA", status: "delayed", paxLoad: 71 },
  { fn: "CR455", from: "SIN", to: "DXB", sched: "14:30", est: "14:30", gate: "E05", ac: "B787-9", tail: "CR-PWB", status: "ontime", paxLoad: 93 },
];

const ROUTES = [
  { from: "JFK", to: "LHR", status: "ok", note: "Nominal", x1: 30, y1: 60, x2: 150, y2: 40 },
  { from: "LHR", to: "DXB", status: "warn", note: "ATC flow control", x1: 150, y1: 40, x2: 250, y2: 80 },
  { from: "CDG", to: "JFK", status: "ok", note: "Nominal", x1: 140, y1: 70, x2: 30, y2: 60 },
  { from: "DXB", to: "SIN", status: "ok", note: "Nominal", x1: 250, y1: 80, x2: 295, y2: 120 },
  { from: "LHR", to: "FRA", status: "danger", note: "Wx — thunderstorms", x1: 150, y1: 40, x2: 175, y2: 95 },
  { from: "SIN", to: "HND", status: "ok", note: "Nominal", x1: 295, y1: 120, x2: 300, y2: 50 },
];

let ALERTS = [
  { id: "a1", sev: "high", title: "CR509 LHR→FRA cancelled", msg: "Crew duty limit exceeded — rebooking 168 pax", min: 4, ack: false },
  { id: "a2", sev: "med", title: "CR118 delayed +30", msg: "Late inbound aircraft CR-PWB from JFK", min: 12, ack: false },
  { id: "a3", sev: "med", title: "Gate conflict B22 / B23", msg: "CR412 pushback holding for tug", min: 18, ack: false },
  { id: "a4", sev: "low", title: "De-icing queue forming", msg: "Stand 31–34, +6 min taxi added", min: 27, ack: false },
  { id: "a5", sev: "high", title: "CR901 CDG→FRA delayed +45", msg: "Slot restriction, knock-on to CR455", min: 33, ack: false },
];

/* ---------- DOM refs ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const statusLabels = {
  ontime: "On time", boarding: "Boarding", delayed: "Delayed",
  departed: "Departed", cancelled: "Cancelled",
};

let activeFilter = "all";
let refreshTimer = null;

/* ---------- Toast ---------- */
function toast(msg, tone = "ok") {
  const wrap = $("#toastWrap");
  const el = document.createElement("div");
  el.className = "toast " + (tone === "ok" ? "" : tone);
  el.innerHTML = '<span class="t-dot"></span><span>' + msg + "</span>";
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 250);
  }, 2600);
}

/* ---------- Flight board ---------- */
function renderBoard() {
  const body = $("#boardBody");
  const rows = FLIGHTS.filter((f) => activeFilter === "all" || f.status === activeFilter);
  body.innerHTML = rows
    .map((f) => {
      const late = f.status === "delayed";
      return (
        '<tr data-tail="' + f.tail + '">' +
        '<td class="flightno">' + f.fn + "</td>" +
        '<td><span class="route"><span class="code">' + f.from + "</span>" +
          '<span class="plane">' + PLANE_SVG + "</span>" +
          '<span class="code">' + f.to + "</span></span></td>" +
        '<td class="num timecol">' + f.sched + "</td>" +
        '<td class="num timecol ' + (late ? "late" : "") + '">' + f.est + "</td>" +
        '<td class="gate">' + f.gate + "</td>" +
        '<td class="aircraft">' + f.ac + "</td>" +
        '<td><span class="pill ' + f.status + '">' + statusLabels[f.status] + "</span></td>" +
        "</tr>"
      );
    })
    .join("");
  $("#boardEmpty").hidden = rows.length !== 0;

  $$("#boardBody tr").forEach((tr) => {
    tr.addEventListener("click", () => openDrawer(tr.dataset.tail));
  });
}

/* ---------- KPIs ---------- */
function renderKpis() {
  const total = FLIGHTS.length;
  const cancelled = FLIGHTS.filter((f) => f.status === "cancelled").length;
  const delayed = FLIGHTS.filter((f) => f.status === "delayed").length;
  const departed = FLIGHTS.filter((f) => f.status === "departed").length;
  const onTimeShare = Math.round(((total - cancelled - delayed) / total) * 100);
  const avgDelay = 28 + Math.floor(Math.random() * 10);
  const util = 78 + Math.floor(Math.random() * 8);

  $("#kpiOntime").textContent = onTimeShare + "%";
  $("#kpiOntimeTrend").textContent = (onTimeShare >= 82 ? "▲ on target" : "▼ below 82% target");
  $("#kpiDelays").textContent = delayed;
  $("#kpiAvgDelay").textContent = avgDelay;
  $("#kpiCancel").textContent = cancelled;
  $("#kpiTotal").textContent = total;
  $("#kpiUtil").textContent = util + "%";
  $("#kpiAirborne").textContent = departed + Math.floor(Math.random() * 3);
}

/* ---------- Route map ---------- */
function renderRoutes() {
  const arcs = $("#routeArcs");
  const nodes = $("#routeNodes");
  const list = $("#routeList");
  const seen = {};
  arcs.innerHTML = ROUTES.map((r) => {
    const cls = r.status === "ok" ? "" : r.status;
    const mx = (r.x1 + r.x2) / 2;
    const my = Math.min(r.y1, r.y2) - 26;
    return '<path class="route-arc ' + cls + '" d="M' + r.x1 + " " + r.y1 + " Q" + mx + " " + my + " " + r.x2 + " " + r.y2 + '"/>';
  }).join("");

  let nodeHtml = "";
  ROUTES.forEach((r) => {
    [[r.from, r.x1, r.y1], [r.to, r.x2, r.y2]].forEach(([code, x, y]) => {
      if (seen[code]) return;
      seen[code] = true;
      nodeHtml +=
        '<circle class="route-node" cx="' + x + '" cy="' + y + '" r="3.5"/>' +
        '<text class="route-node-label" x="' + (x + 6) + '" y="' + (y + 3) + '">' + code + "</text>";
    });
  });
  nodes.innerHTML = nodeHtml;

  list.innerHTML = ROUTES.map((r) =>
    '<li class="route-row">' +
    '<span class="status-dot ' + r.status + '"></span>' +
    '<span class="pair"><span class="code">' + r.from + "</span> → <span class=\"code\">" + r.to + "</span></span>" +
    '<span class="meta">' + r.note + "</span></li>"
  ).join("");
}

/* ---------- Alerts ---------- */
function renderAlerts() {
  const list = $("#alertList");
  const open = ALERTS.filter((a) => !a.ack).length;
  $("#alertCount").textContent = open;
  list.innerHTML = ALERTS.map((a) => {
    const ico = a.sev === "high" ? "!" : a.sev === "med" ? "▲" : "i";
    return (
      '<li class="alert sev-' + a.sev + (a.ack ? " ack" : "") + '" data-id="' + a.id + '">' +
      '<span class="sev-ico">' + ico + "</span>" +
      '<span class="a-body"><strong>' + a.title + "</strong><span>" + a.msg + "</span></span>" +
      '<span class="a-time">' + a.min + "m<br>" +
      '<button class="ack-btn" data-ack="' + a.id + '">' + (a.ack ? "Acked" : "Ack") + "</button></span>" +
      "</li>"
    );
  }).join("");

  $$("[data-ack]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const a = ALERTS.find((x) => x.id === btn.dataset.ack);
      if (!a || a.ack) return;
      a.ack = true;
      renderAlerts();
      toast("Alert acknowledged — " + a.title, "ok");
    });
  });
}

/* ---------- Rotation gantt ---------- */
const TAILS = [
  { tail: "CR-NXA", type: "A350-900", segs: [
    { type: "ground", s: 6, e: 7.2, label: "Turn" },
    { type: "flight", s: 7.2, e: 8.1, label: "CR412", st: "departed" },
    { type: "ground", s: 8.1, e: 9.6, label: "" },
    { type: "flight", s: 9.6, e: 11.5, label: "CR860", st: "ontime" },
    { type: "ground", s: 11.5, e: 13.8, label: "" },
    { type: "flight", s: 13.8, e: 16.2, label: "CR901", st: "delayed" },
  ]},
  { tail: "CR-PWB", type: "B787-9", segs: [
    { type: "flight", s: 6, e: 8.4, label: "CR118", st: "delayed" },
    { type: "ground", s: 8.4, e: 10.2, label: "" },
    { type: "flight", s: 10.2, e: 12.4, label: "CR322", st: "delayed" },
    { type: "ground", s: 12.4, e: 14, label: "Turn" },
    { type: "flight", s: 14, e: 16.6, label: "CR455", st: "ontime" },
  ]},
  { tail: "CR-MTC", type: "A330-300", segs: [
    { type: "flight", s: 6.5, e: 8.6, label: "CR205", st: "boarding" },
    { type: "ground", s: 8.6, e: 10.4, label: "" },
    { type: "flight", s: 10.4, e: 12.5, label: "CR144", st: "boarding" },
    { type: "ground", s: 12.5, e: 15, label: "" },
  ]},
  { tail: "CR-LQD", type: "B777-300", segs: [
    { type: "ground", s: 6, e: 8.4, label: "Turn" },
    { type: "flight", s: 8.4, e: 10.4, label: "CR731", st: "ontime" },
    { type: "ground", s: 10.4, e: 12.6, label: "" },
    { type: "flight", s: 12.6, e: 15, label: "CR677", st: "ontime" },
  ]},
  { tail: "CR-VKE", type: "A320neo", segs: [
    { type: "ground", s: 6, e: 9, label: "AOG check" },
    { type: "flight", s: 9, e: 11, label: "CR509", st: "cancelled" },
    { type: "ground", s: 11, e: 13.2, label: "" },
    { type: "flight", s: 13.2, e: 15, label: "CR238", st: "ontime" },
  ]},
];

const ROT_START = 6;
const ROT_END = 20; // 14h window

function renderRotation() {
  const hours = $("#rotHours");
  const grid = $("#rotGrid");
  let hh = "";
  for (let h = ROT_START; h < ROT_END; h++) {
    hh += "<span>" + String(h).padStart(2, "0") + ":00</span>";
  }
  hours.innerHTML = hh;

  const span = ROT_END - ROT_START;
  const pct = (v) => ((v - ROT_START) / span) * 100;
  const now = nowDecimal();

  grid.innerHTML = TAILS.map((t) => {
    const segs = t.segs.map((sg) => {
      const left = pct(sg.s);
      const width = pct(sg.e) - pct(sg.s);
      const cls = sg.type === "flight" ? "flight " + (sg.st || "") : "ground";
      const title = (sg.label || (sg.type === "ground" ? "Ground" : "")) +
        " " + decToTime(sg.s) + "–" + decToTime(sg.e);
      return '<div class="rot-seg ' + cls + '" style="left:' + left + "%;width:" + width +
        '%" title="' + title + '" data-tail="' + t.tail + '" tabindex="0">' +
        (sg.label || "") + "</div>";
    }).join("");
    const nowMarker = (now >= ROT_START && now <= ROT_END)
      ? '<div class="rot-now" style="left:' + pct(now) + '%"></div>' : "";
    return (
      '<div class="rot-row">' +
      '<div class="rot-tail">' + t.tail + "<small>" + t.type + "</small></div>" +
      '<div class="rot-track">' + segs + nowMarker + "</div>" +
      "</div>"
    );
  }).join("");

  $$(".rot-seg").forEach((s) => {
    s.addEventListener("click", () => openDrawer(s.dataset.tail));
    s.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(s.dataset.tail); }
    });
  });
}

/* ---------- Drawer (rotation drill) ---------- */
function openDrawer(tail) {
  const t = TAILS.find((x) => x.tail === tail);
  const drawer = $("#drawer");
  if (!t) {
    // tail not in rotation set — still show a minimal card from FLIGHTS
    const f = FLIGHTS.find((x) => x.tail === tail);
    if (!f) return;
  }
  const rec = t || { tail, type: "—", segs: [] };
  const flights = rec.segs.filter((s) => s.type === "flight");
  const lastDelay = flights.some((s) => s.st === "delayed");

  $("#drawerTail").textContent = "Tail " + rec.tail;
  $("#drawerTitle").textContent = rec.type + " rotation";

  const legs = flights.map((s) => {
    const f = FLIGHTS.find((x) => x.fn === s.label) ||
      { from: "—", to: "—", gate: "—", paxLoad: 0 };
    const stTxt = statusLabels[s.st] || s.st;
    return (
      '<div class="dr-seg-card">' +
      "<div><div class=\"leg-route\">" + f.from + " → " + f.to + "</div>" +
      '<div class="leg-sub">' + s.label + " · " + stTxt + " · " + f.paxLoad + "% load</div></div>" +
      "<div></div>" +
      '<div class="leg-time">' + decToTime(s.s) + '<small>→ ' + decToTime(s.e) + "</small></div>" +
      "</div>"
    );
  }).join("");

  const blockHrs = flights.reduce((a, s) => a + (s.e - s.s), 0).toFixed(1);
  const groundHrs = rec.segs.filter((s) => s.type === "ground")
    .reduce((a, s) => a + (s.e - s.s), 0).toFixed(1);

  $("#drawerBody").innerHTML =
    '<div class="dr-perf"><div class="dr-leg">' + (legs || "<p class=\"empty\">No flight legs.</p>") + "</div></div>" +
    '<dl class="dr-meta">' +
    "<div><dt>Legs today</dt><dd>" + flights.length + "</dd></div>" +
    "<div><dt>Block hours</dt><dd>" + blockHrs + " h</dd></div>" +
    "<div><dt>Ground time</dt><dd>" + groundHrs + " h</dd></div>" +
    "<div><dt>Rotation health</dt><dd style=\"color:" + (lastDelay ? "var(--warn)" : "var(--ok)") + '">' +
      (lastDelay ? "At risk" : "Healthy") + "</dd></div>" +
    "</dl>";

  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  $("#overlay").hidden = false;
}

function closeDrawer() {
  $("#drawer").classList.remove("open");
  $("#drawer").setAttribute("aria-hidden", "true");
  $("#overlay").hidden = true;
}

/* ---------- Time helpers ---------- */
function nowDecimal() {
  // map real clock minutes into the ops window for a live "now" line
  const d = new Date();
  const dec = d.getHours() + d.getMinutes() / 60;
  if (dec >= ROT_START && dec <= ROT_END) return dec;
  // demo fallback: place "now" at a lively point in the window
  return 11.4 + (d.getSeconds() / 60) * 0.5;
}
function decToTime(dec) {
  const h = Math.floor(dec);
  const m = Math.round((dec - h) * 60);
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

/* ---------- Clock ---------- */
function tickClock() {
  const d = new Date();
  $("#clock").textContent =
    String(d.getHours()).padStart(2, "0") + ":" +
    String(d.getMinutes()).padStart(2, "0") + ":" +
    String(d.getSeconds()).padStart(2, "0");
}

/* ---------- Auto refresh simulation ---------- */
const SIM_EVENTS = [
  () => {
    const f = FLIGHTS.find((x) => x.status === "boarding");
    if (f) { f.status = "departed"; f.est = f.sched; toast(f.fn + " " + f.from + "→" + f.to + " departed gate " + f.gate, "ok"); return true; }
    return false;
  },
  () => {
    const f = FLIGHTS.find((x) => x.status === "ontime");
    if (f) {
      f.status = "delayed";
      const [h, m] = f.sched.split(":").map(Number);
      const nm = m + 20; const nh = h + Math.floor(nm / 60);
      f.est = String(nh).padStart(2, "0") + ":" + String(nm % 60).padStart(2, "0");
      ALERTS.unshift({ id: "a" + Date.now(), sev: "med", title: f.fn + " delayed +20", msg: "New restriction on " + f.from + "→" + f.to, min: 0, ack: false });
      toast(f.fn + " now delayed", "warn"); return true;
    }
    return false;
  },
  () => {
    const f = FLIGHTS.find((x) => x.status === "ontime");
    if (f) { f.status = "boarding"; f.gate = f.gate === "—" ? "B17" : f.gate; toast(f.fn + " boarding at gate " + f.gate, "ok"); return true; }
    return false;
  },
];
let simIdx = 0;

function runRefresh(manual) {
  $("#netDot").style.background = "var(--sunrise)";
  setTimeout(() => ($("#netDot").style.background = "var(--ok)"), 600);

  // bump alert ages
  ALERTS.forEach((a) => (a.min += 1));

  if (manual || Math.random() > 0.35) {
    let acted = false;
    for (let i = 0; i < SIM_EVENTS.length && !acted; i++) {
      acted = SIM_EVENTS[simIdx % SIM_EVENTS.length]();
      simIdx++;
    }
    if (!acted && manual) toast("Feed refreshed — no new changes", "ok");
  }

  renderKpis();
  renderBoard();
  renderAlerts();
  renderRotation();

  // flash a changed row
  const tr = $("#boardBody tr");
  if (tr) tr.classList.add("flash");
}

function startAuto() {
  stopAuto();
  refreshTimer = setInterval(() => runRefresh(false), 7000);
}
function stopAuto() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = null;
}

/* ---------- Wire up ---------- */
function init() {
  renderKpis();
  renderBoard();
  renderRoutes();
  renderAlerts();
  renderRotation();
  tickClock();
  setInterval(tickClock, 1000);
  setInterval(() => renderRotation(), 15000); // keep "now" line moving

  $$(".chip").forEach((c) => {
    c.addEventListener("click", () => {
      $$(".chip").forEach((x) => { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      c.classList.add("is-active");
      c.setAttribute("aria-selected", "true");
      activeFilter = c.dataset.filter;
      renderBoard();
    });
  });

  $("#refreshBtn").addEventListener("click", () => runRefresh(true));
  $("#autoRefresh").addEventListener("change", (e) => {
    if (e.target.checked) { startAuto(); toast("Auto-refresh on (7s)", "ok"); }
    else { stopAuto(); toast("Auto-refresh paused", "warn"); }
  });

  $("#drawerClose").addEventListener("click", closeDrawer);
  $("#overlay").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  startAuto();
}

document.addEventListener("DOMContentLoaded", init);
