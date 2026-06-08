// ── Mock data ───────────────────────────────────────────────────────────────
const ARRIVALS = [
  { room: "204", name: "Mariana Sosa", meta: "2 adults · 1 child · Deluxe Suite", in: "2026-05-24", out: "2026-05-27", amount: "€612", status: "expected", vip: true, due: false },
  { room: "118", name: "Thomas Reuter", meta: "1 adult · Classic Double", in: "2026-05-24", out: "2026-05-25", amount: "€184", status: "expected", vip: false, due: true },
  { room: "302", name: "Aiko Tanaka", meta: "2 adults · Junior Suite", in: "2026-05-24", out: "2026-05-29", amount: "€1,205", status: "expected", vip: true, due: false },
  { room: "121", name: "Olivier Banks", meta: "2 adults · Twin Standard", in: "2026-05-24", out: "2026-05-26", amount: "€368", status: "late", vip: false, due: true },
  { room: "205", name: "Fátima Cervantes", meta: "1 adult · Single Standard", in: "2026-05-24", out: "2026-05-25", amount: "€142", status: "expected", vip: false, due: false },
];
const INHOUSE = [
  { room: "102", name: "Karl Henriksen", meta: "1 adult · Classic Double", in: "2026-05-22", out: "2026-05-26", amount: "€736", status: "checked-in", vip: false, due: false },
  { room: "210", name: "Pilar Romero", meta: "2 adults · Junior Suite", in: "2026-05-23", out: "2026-05-25", amount: "€482", status: "checked-in", vip: true, due: false },
  { room: "308", name: "Hassan Najjar", meta: "2 adults · 1 child · Family Suite", in: "2026-05-21", out: "2026-05-28", amount: "€2,108", status: "checked-in", vip: false, due: false },
  { room: "114", name: "Sofia Bellini", meta: "1 adult · Deluxe Double", in: "2026-05-23", out: "2026-05-26", amount: "€516", status: "checked-in", vip: false, due: false },
];
const DEPARTURES = [
  { room: "207", name: "Elena Vasquez", meta: "2 adults · Junior Suite", in: "2026-05-20", out: "2026-05-24", amount: "€964", status: "due-out", vip: true, due: true },
  { room: "117", name: "Ruiqi Chen", meta: "1 adult · Classic Double", in: "2026-05-21", out: "2026-05-24", amount: "€552", status: "due-out", vip: false, due: false },
  { room: "311", name: "Marc Dupuis", meta: "2 adults · Deluxe Suite", in: "2026-05-22", out: "2026-05-24", amount: "€408", status: "due-out", vip: false, due: true },
];

const ACTS = [
  { type: "checkin", icon: "✓", title: "Mariana Sosa checked in", sub: "Room 204 · key issued", time: "08:42" },
  { type: "payment", icon: "€", title: "Folio payment posted", sub: "€612.00 · card · 204", time: "08:41" },
  { type: "housekeeping", icon: "✦", title: "Room 117 reported clean", sub: "Ines · housekeeping", time: "08:36" },
  { type: "alert", icon: "!", title: "Late check-in flagged", sub: "Olivier Banks · room 121", time: "08:21" },
  { type: "checkin", icon: "✓", title: "Pre-check-in completed", sub: "Aiko Tanaka · room 302", time: "08:18" },
  { type: "payment", icon: "€", title: "Deposit captured", sub: "€184.00 · 118 · hold", time: "08:11" },
  { type: "housekeeping", icon: "✦", title: "Room 207 inspected", sub: "Departure clean", time: "08:02" },
];

// ── Render ──────────────────────────────────────────────────────────────────
const rows = document.getElementById("rows");
const acts = document.getElementById("acts");
const toast = document.getElementById("toast");
let activeTab = "arrivals";
let activeFilter = "all";

function getList() {
  if (activeTab === "arrivals") return ARRIVALS;
  if (activeTab === "inhouse") return INHOUSE;
  return DEPARTURES;
}

function getPrimaryAction() {
  if (activeTab === "arrivals") return "Check in";
  if (activeTab === "inhouse") return "Open folio";
  return "Check out";
}

function renderRows() {
  const query = (document.getElementById("search").value || "").toLowerCase().trim();
  const list = getList().filter((r) => {
    if (activeFilter === "vip" && !r.vip) return false;
    if (activeFilter === "due" && !r.due) return false;
    if (query) {
      return (
        r.name.toLowerCase().includes(query) ||
        r.room.includes(query) ||
        r.meta.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (!list.length) {
    rows.innerHTML = `<p class="empty">No reservations match the current filter.</p>`;
    return;
  }

  rows.innerHTML = list
    .map(
      (r) => `
      <article class="row ${r.vip ? "is-vip" : ""}">
        <div class="room">${r.room}</div>
        <div class="guest">
          <div class="guest-name">${r.name}</div>
          <div class="guest-meta">${r.meta}</div>
        </div>
        <div class="dates">
          <strong>${fmtShort(r.in)}</strong>
          <span>→ ${fmtShort(r.out)}</span>
        </div>
        <div class="amount">${r.amount}</div>
        <div><span class="status ${r.status}">${r.status.replace("-", " ")}</span></div>
        <div class="row-actions">
          <button class="action">Folio</button>
          <button class="action primary">${getPrimaryAction()}</button>
        </div>
      </article>`
    )
    .join("");
}

function renderActs() {
  acts.innerHTML = ACTS.map(
    (a) => `
    <li class="act ${a.type}">
      <span class="act-icon">${a.icon}</span>
      <div class="act-body">
        <p>${a.title}</p>
        <small>${a.sub}</small>
      </div>
      <span class="act-time">${a.time}</span>
    </li>`
  ).join("");
}

function fmtShort(iso) {
  const d = new Date(iso + "T00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 1800);
}

// ── Wiring ──────────────────────────────────────────────────────────────────
document.querySelectorAll(".tab").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("is-active"));
    t.classList.add("is-active");
    activeTab = t.dataset.tab;
    renderRows();
  });
});
document.querySelectorAll(".chip").forEach((c) => {
  c.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((x) => x.classList.remove("is-active"));
    c.classList.add("is-active");
    activeFilter = c.dataset.filter;
    renderRows();
  });
});
document.getElementById("search").addEventListener("input", renderRows);

rows.addEventListener("click", (e) => {
  const btn = e.target.closest("button.action");
  if (!btn) return;
  const name = btn.closest(".row").querySelector(".guest-name").textContent;
  showToast(`${btn.textContent} · ${name}`);
});

document.querySelectorAll(".ghost-btn, .quick-btn").forEach((b) =>
  b.addEventListener("click", () => showToast(b.textContent.trim()))
);

// ── Clock + label ───────────────────────────────────────────────────────────
const clock = document.getElementById("clock");
const todayLabel = document.getElementById("todayLabel");

function tick() {
  const now = new Date();
  const hhmm = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const wk = now.toLocaleDateString("en-GB", { weekday: "short" });
  clock.textContent = `${hhmm} · ${wk}`;
  todayLabel.textContent = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
tick();
setInterval(tick, 1000);

renderRows();
renderActs();
