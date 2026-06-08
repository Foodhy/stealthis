// ── Mock data ─────────────────────────────────────────────────────────────────
let tickets = [
  {
    id: 1001,
    room: "311",
    issue: "AC",
    priority: "urgent",
    desc: "AC not cooling — guest reports 28 °C in room",
    ageH: 1.5,
    assignee: "Marco B.",
    status: "open",
  },
  {
    id: 1002,
    room: "204",
    issue: "Plumbing",
    priority: "high",
    desc: "Shower drain blocked, standing water",
    ageH: 2.2,
    assignee: "Davide R.",
    status: "inprogress",
  },
  {
    id: 1003,
    room: "118",
    issue: "TV",
    priority: "normal",
    desc: "TV remote unresponsive, batteries replaced — no change",
    ageH: 3.0,
    assignee: "Marco B.",
    status: "open",
  },
  {
    id: 1004,
    room: "405",
    issue: "Lock",
    priority: "urgent",
    desc: "Electronic lock fails on 3rd attempt — keycard issue",
    ageH: 0.5,
    assignee: "Davide R.",
    status: "inprogress",
  },
  {
    id: 1005,
    room: "207",
    issue: "Lighting",
    priority: "normal",
    desc: "Bedside lamp flickers — likely loose bulb",
    ageH: 5.0,
    assignee: "Tiago F.",
    status: "open",
  },
  {
    id: 1006,
    room: "302",
    issue: "Heating",
    priority: "high",
    desc: "Radiator making loud banging noise at night",
    ageH: 8.0,
    assignee: "Marco B.",
    status: "open",
  },
  {
    id: 1007,
    room: "106",
    issue: "Plumbing",
    priority: "low",
    desc: "Tap drips slowly when fully closed",
    ageH: 14.0,
    assignee: "Tiago F.",
    status: "resolved",
  },
  {
    id: 1008,
    room: "219",
    issue: "AC",
    priority: "normal",
    desc: "AC thermostat unresponsive after power outage",
    ageH: 6.5,
    assignee: "Davide R.",
    status: "inprogress",
  },
  {
    id: 1009,
    room: "401",
    issue: "Elevator",
    priority: "high",
    desc: "Floor 4 elevator door judders on close — safety concern",
    ageH: 4.0,
    assignee: "Chief Eng.",
    status: "open",
  },
  {
    id: 1010,
    room: "112",
    issue: "TV",
    priority: "low",
    desc: "HDMI input 2 not recognised by TV",
    ageH: 11.0,
    assignee: "Tiago F.",
    status: "resolved",
  },
];
let nextId = 1011;
let activeFilter = "all";

// ── Status cycle ──────────────────────────────────────────────────────────────
const STATUS_CYCLE = { open: "inprogress", inprogress: "resolved", resolved: "open" };
const STATUS_NEXT_LABEL = { open: "→ In Progress", inprogress: "→ Resolved", resolved: "→ Reopen" };
const STATUS_LABEL = { open: "Open", inprogress: "In Progress", resolved: "Resolved" };

// ── Toast helper ──────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Age formatter ─────────────────────────────────────────────────────────────
function fmtAge(h) {
  if (h < 1) return `${Math.round(h * 60)} min ago`;
  if (h < 24) return `${h % 1 === 0 ? h : h.toFixed(1)} hr ago`;
  return `${Math.floor(h / 24)} d ago`;
}

// ── Open count ────────────────────────────────────────────────────────────────
function updateBadge() {
  const count = tickets.filter((t) => t.status !== "resolved").length;
  const badge = document.getElementById("openBadge");
  badge.textContent = `${count} open`;
  badge.dataset.zero = count === 0 ? "true" : "false";
}

// ── Render list ───────────────────────────────────────────────────────────────
function renderList() {
  const list = document.getElementById("ticketList");
  const empty = document.getElementById("emptyState");

  const filtered =
    activeFilter === "all" ? tickets : tickets.filter((t) => t.priority === activeFilter);

  if (filtered.length === 0) {
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  list.innerHTML = filtered
    .map(
      (t) => `
    <li class="ticket ${t.status}" data-id="${t.id}">
      <div class="t-room-block">
        <span class="t-room">${t.room}</span>
        <span class="t-id">#${t.id}</span>
      </div>
      <div class="t-body">
        <div class="t-top">
          <span class="t-issue">${t.issue}</span>
          <span class="pri-badge ${t.priority}">${t.priority}</span>
        </div>
        <p class="t-desc">${t.desc}</p>
        <div class="t-meta">
          <span class="t-assignee">Assignee: <strong>${t.assignee}</strong></span>
          <span class="t-age">${fmtAge(t.ageH)}</span>
        </div>
      </div>
      <div class="t-status-wrap">
        <button class="status-btn ${t.status}" data-action="cycle" data-id="${t.id}">
          ${STATUS_LABEL[t.status]}
        </button>
        <span class="status-hint">${STATUS_NEXT_LABEL[t.status]}</span>
      </div>
    </li>
  `
    )
    .join("");
}

// ── Status cycle click (event delegation) ─────────────────────────────────────
document.getElementById("ticketList").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action='cycle']");
  if (!btn) return;
  const id = parseInt(btn.dataset.id, 10);
  const t = tickets.find((x) => x.id === id);
  if (!t) return;
  const prev = t.status;
  t.status = STATUS_CYCLE[prev];
  showToast(`Ticket #${id} · ${STATUS_LABEL[t.status]}`);
  updateBadge();
  renderList();
});

// ── Priority filter chips ─────────────────────────────────────────────────────
document.querySelectorAll(".chip[data-pri]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip[data-pri]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeFilter = btn.dataset.pri;
    renderList();
  });
});

// ── New ticket form ───────────────────────────────────────────────────────────
document.getElementById("newForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const room = document.getElementById("fRoom").value.trim();
  const issue = document.getElementById("fIssue").value;
  const priority = document.getElementById("fPri").value;
  const assignee = document.getElementById("fAssignee").value.trim() || "Unassigned";
  const desc = document.getElementById("fDesc").value.trim();

  if (!room || !issue || !priority) {
    showToast("Please fill in room, issue type, and priority.");
    return;
  }

  const t = {
    id: nextId++,
    room,
    issue,
    priority,
    desc: desc || `${issue} issue reported in room ${room}.`,
    ageH: 0,
    assignee,
    status: "open",
  };

  tickets.unshift(t);

  // ── Reset form ──
  document.getElementById("fRoom").value = "";
  document.getElementById("fIssue").value = "";
  document.getElementById("fPri").value = "";
  document.getElementById("fAssignee").value = "";
  document.getElementById("fDesc").value = "";

  showToast(`Ticket #${t.id} created — room ${room}`);
  updateBadge();
  renderList();
});

// ── Initial render ────────────────────────────────────────────────────────────
updateBadge();
renderList();
