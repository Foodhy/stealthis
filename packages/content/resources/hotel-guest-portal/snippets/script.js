// ── Toast helper ──
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

const $ = (id) => document.getElementById(id);
const fmt = (n) =>
  "€" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Tab switching ──
document.querySelectorAll(".sb-link").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    // Deactivate all
    document.querySelectorAll(".sb-link").forEach((b) => b.classList.remove("is-active"));
    document.querySelectorAll(".tab-panel").forEach((p) => {
      p.hidden = true;
      p.classList.remove("is-active");
    });
    // Activate target
    btn.classList.add("is-active");
    const panel = $(`tab-${target}`);
    panel.hidden = false;
    panel.classList.add("is-active");
  });
});

// ── Check-out countdown ──
// Target: Thu 12 Jun 2026 12:00:00 local
const checkoutDate = new Date("2026-06-12T12:00:00");

function updateCountdown() {
  const now = new Date();
  const diff = checkoutDate - now;
  if (diff <= 0) {
    $("mainCountdown").textContent = "Check-out now";
    $("sideCountdown").textContent = "Now";
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  const main =
    days > 0
      ? `${days}d ${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`
      : `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const side =
    days > 0
      ? `${days}d ${String(hours).padStart(2, "0")}h`
      : `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

  $("mainCountdown").textContent = main;
  $("sideCountdown").textContent = side;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ── Digital key ──
$("btnDkey").addEventListener("click", () => {
  const btn = $("btnDkey");
  if (btn.classList.contains("is-active")) {
    btn.classList.remove("is-active");
    btn.textContent = "Activate key";
    showToast("Digital key deactivated.");
  } else {
    btn.classList.add("is-active");
    btn.textContent = "Key active ✓";
    showToast("Digital key activated for Room 302.");
  }
});

// ── Sign out (mock) ──
document.querySelector(".btn-signout").addEventListener("click", () => {
  showToast("Signing out…");
});

// ── Folio data ──
const folioCharges = [
  { date: "09 Jun", desc: "Room 302 — Standard Double", amount: 184.0 },
  { date: "09 Jun", desc: "City tourist tax", amount: 1.65 },
  { date: "09 Jun", desc: "Restaurant — Dinner", amount: 62.4 },
  { date: "10 Jun", desc: "Room 302 — Standard Double", amount: 184.0 },
  { date: "10 Jun", desc: "City tourist tax", amount: 1.65 },
  { date: "10 Jun", desc: "Minibar restock", amount: 18.0 },
  { date: "10 Jun", desc: "Spa — Massage 60 min", amount: 85.0 },
  { date: "11 Jun", desc: "Room 302 — Standard Double", amount: 184.0 },
  { date: "11 Jun", desc: "City tourist tax", amount: 1.65 },
  { date: "11 Jun", desc: "Restaurant — Breakfast", amount: 28.5 },
];
const paymentsApplied = 400.0;

function renderFolio() {
  $("folioBody").innerHTML = folioCharges
    .map(
      (c) => `
    <tr>
      <td class="td-date">${c.date}</td>
      <td>${c.desc}</td>
      <td class="td-amt">${fmt(c.amount)}</td>
    </tr>
  `
    )
    .join("");

  const subtotal = folioCharges.reduce((s, c) => s + c.amount, 0);
  const vat = parseFloat((subtotal * 0.1).toFixed(2));
  const total = parseFloat((subtotal + vat).toFixed(2));
  const balance = parseFloat((total - paymentsApplied).toFixed(2));

  $("fSubtotal").textContent = fmt(subtotal);
  $("fVat").textContent = fmt(vat);
  $("fTotal").textContent = fmt(total);
  $("fBalance").textContent = fmt(Math.max(0, balance));
}
renderFolio();

// ── Requests ──
let requests = [];
let nextReqId = 1;

const reqTypeLabels = {
  housekeeping: "Housekeeping turndown",
  towels: "Extra towels",
  "late-checkout": "Late check-out request",
  pillows: "Extra pillows",
  iron: "Iron & ironing board",
  cot: "Baby cot",
  taxi: "Taxi arrangement",
  other: "Special request",
};

const timeLabels = {
  asap: "As soon as possible",
  "30min": "Within 30 minutes",
  "1h": "Within 1 hour",
  evening: "This evening",
  tomorrow: "Tomorrow morning",
};

const statusCycle = ["pending", "progress", "done"];
const statusLabel = { pending: "Pending", progress: "In progress", done: "Done" };
const statusClass = { pending: "pill--pending", progress: "pill--progress", done: "pill--done" };

function renderRequests() {
  const list = $("reqList");
  const empty = $("reqEmpty");
  const badge = $("reqBadge");
  const count = $("reqCount");

  if (requests.length === 0) {
    empty.hidden = false;
    badge.hidden = true;
    count.textContent = "0 requests";
    return;
  }
  empty.hidden = true;
  badge.textContent = requests.length;
  badge.hidden = false;
  count.textContent = `${requests.length} request${requests.length !== 1 ? "s" : ""}`;

  // Re-render only the items list portion (preserve empty paragraph)
  const existingItems = list.querySelectorAll(".req-item");
  existingItems.forEach((el) => el.remove());

  requests.forEach((req) => {
    const el = document.createElement("div");
    el.className = "req-item";
    el.dataset.reqId = req.id;
    el.innerHTML = `
      <div class="ri-body">
        <div class="ri-title">${req.title}</div>
        <div class="ri-meta">${req.time} · Submitted ${req.submitted}</div>
        ${req.notes ? `<div class="ri-notes">"${req.notes}"</div>` : ""}
      </div>
      <button
        class="status-pill ${statusClass[req.status]}"
        data-req-id="${req.id}"
        type="button"
        title="Click to update status"
      >${statusLabel[req.status]}</button>
    `;
    list.appendChild(el);
  });
}

// ── Advance status on pill click ──
$("reqList").addEventListener("click", (e) => {
  const pill = e.target.closest(".status-pill");
  if (!pill) return;
  const id = parseInt(pill.dataset.reqId, 10);
  const req = requests.find((r) => r.id === id);
  if (!req) return;
  const idx = statusCycle.indexOf(req.status);
  req.status = statusCycle[(idx + 1) % statusCycle.length];
  renderRequests();
  showToast(`Request updated: ${statusLabel[req.status]}`);
});

// ── Submit request ──
$("reqForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const type = $("reqType").value;
  const time = $("reqTime").value;
  const notes = $("reqNotes").value.trim();

  if (!type) {
    showToast("Please select a request type.");
    $("reqType").focus();
    return;
  }

  // Build time string for "now"
  const now = new Date();
  const hhmm = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  requests.unshift({
    id: nextReqId++,
    title: reqTypeLabels[type] || "Special request",
    time: timeLabels[time] || time,
    submitted: hhmm,
    notes,
    status: "pending",
  });

  // Reset form
  $("reqType").value = "";
  $("reqTime").value = "asap";
  $("reqNotes").value = "";

  renderRequests();
  showToast(`Request submitted: ${reqTypeLabels[type]}`);
});

// ── Late check-out shortcut: switch to Requests tab and pre-select ──
// (wired via a late-checkout option already in the form; no extra wiring needed)

// ── Init ──
renderRequests();
