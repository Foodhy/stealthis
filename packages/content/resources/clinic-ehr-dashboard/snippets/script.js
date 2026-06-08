// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Live clock ───────────────────────────────────────────────────────────────
// Illustrative: starts from a fixed 08:42:00 and ticks via a seconds counter.
const clockEl = document.getElementById("clock");
let elapsed = 8 * 3600 + 42 * 60; // seconds since midnight
function renderClock() {
  const h = Math.floor(elapsed / 3600) % 24;
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const pad = (n) => String(n).padStart(2, "0");
  clockEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  elapsed += 1;
}
renderClock();
setInterval(renderClock, 1000);

// ── Data ─────────────────────────────────────────────────────────────────────
const FLOW = ["waiting", "inroom", "done"];
const PILL = { waiting: "Waiting", inroom: "In room", done: "Completed", noshow: "No-show" };
const NEXT_LABEL = { waiting: "Room in", inroom: "Complete" };

const appointments = [
  {
    id: 1,
    time: "9:00",
    name: "Marcus Reed",
    who: "58 M",
    reason: "Post-MI follow-up",
    status: "done",
  },
  {
    id: 2,
    time: "9:20",
    name: "Priya Anand",
    who: "44 F",
    reason: "Palpitations review",
    status: "inroom",
  },
  {
    id: 3,
    time: "9:40",
    name: "Tom Whitfield",
    who: "67 M",
    reason: "Hypertension check",
    status: "waiting",
  },
  {
    id: 4,
    time: "10:00",
    name: "Grace Lim",
    who: "39 F",
    reason: "Echo results",
    status: "waiting",
  },
  {
    id: 5,
    time: "10:20",
    name: "Daniel Cruz",
    who: "52 M",
    reason: "Chest pain triage",
    status: "waiting",
  },
  {
    id: 6,
    time: "10:40",
    name: "Aisha Bello",
    who: "61 F",
    reason: "Med titration",
    status: "noshow",
  },
];

const tasks = [
  {
    id: "t1",
    kind: "lab",
    title: "Troponin panel — M. Reed",
    meta: "Result ready · review",
    done: false,
  },
  {
    id: "t2",
    kind: "flag",
    title: "Abnormal K+ 5.9 — D. Cruz",
    meta: "Critical flag",
    done: false,
  },
  {
    id: "t3",
    kind: "refill",
    title: "Bisoprolol refill — T. Whitfield",
    meta: "Pharmacy request",
    done: false,
  },
  {
    id: "t4",
    kind: "lab",
    title: "Lipid panel — G. Lim",
    meta: "Result ready · review",
    done: false,
  },
];

const messages = [
  { from: "Sara Nguyen, RN", text: "Room 3 vitals charted for Anand.", cls: "", unread: true },
  { from: "Dr. Ravi Patel", text: "Can you review Cruz's ECG?", cls: "b", unread: true },
  { from: "Front desk", text: "Bello called — running late.", cls: "c", unread: false },
];

// ── KPI sync ─────────────────────────────────────────────────────────────────
const kpi = {
  today: document.getElementById("kpiToday"),
  waiting: document.getElementById("kpiWaiting"),
  done: document.getElementById("kpiDone"),
  msgs: document.getElementById("kpiMsgs"),
};
const schedCount = document.getElementById("schedCount");
function syncKpis() {
  kpi.today.textContent = appointments.length;
  kpi.waiting.textContent = appointments.filter((a) => a.status === "waiting").length;
  kpi.done.textContent = appointments.filter((a) => a.status === "done").length;
  kpi.msgs.textContent = messages.filter((m) => m.unread).length;
  schedCount.textContent = `${appointments.length} visits`;
}

// ── Schedule render ──────────────────────────────────────────────────────────
const timeline = document.getElementById("timeline");
let activeFilter = "all";

function renderSchedule() {
  const visible = appointments.filter((a) => activeFilter === "all" || a.status === activeFilter);
  timeline.innerHTML = visible.length
    ? visible
        .map((a) => {
          const isFinal = a.status === "done" || a.status === "noshow";
          const btn = isFinal
            ? `<button class="appt-btn is-final" disabled>${a.status === "done" ? "Done ✓" : "No-show"}</button>`
            : `<button class="appt-btn" data-id="${a.id}">${NEXT_LABEL[a.status]} →</button>`;
          return `<li class="appt" data-status="${a.status}">
            <span class="appt-time">${a.time}</span>
            <span class="appt-rail"><span class="appt-dot"></span></span>
            <div class="appt-body">
              <p class="appt-name">${a.name} <span>· ${a.who}</span></p>
              <p class="appt-reason">${a.reason}</p>
            </div>
            <div class="appt-side">
              <span class="pill ${a.status}">${PILL[a.status]}</span>
              ${btn}
            </div>
          </li>`;
        })
        .join("")
    : `<p class="empty">No patients in this view.</p>`;
}

timeline.addEventListener("click", (e) => {
  const btn = e.target.closest(".appt-btn[data-id]");
  if (!btn) return;
  const appt = appointments.find((a) => a.id === Number(btn.dataset.id));
  const next = FLOW[FLOW.indexOf(appt.status) + 1];
  if (!next) return;
  appt.status = next;
  syncKpis();
  renderSchedule();
  showToast(`${appt.name} → ${PILL[next]}`);
});

// ── Filter chips ─────────────────────────────────────────────────────────────
document.getElementById("chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  activeFilter = chip.dataset.filter;
  document.querySelectorAll(".chip").forEach((c) => {
    const on = c === chip;
    c.classList.toggle("is-active", on);
    c.setAttribute("aria-selected", String(on));
  });
  renderSchedule();
});

// ── Tasks & alerts ───────────────────────────────────────────────────────────
const ICON = { lab: "⌗", flag: "⚠", refill: "℞" };
const tasksEl = document.getElementById("tasks");
const taskBadge = document.getElementById("taskBadge");

function renderTasks() {
  tasksEl.innerHTML = tasks
    .map(
      (t) => `<li class="task ${t.done ? "is-done" : ""}" data-id="${t.id}">
        <span class="task-ic ${t.kind}">${ICON[t.kind]}</span>
        <div class="task-body">
          <p class="task-title">${t.title}</p>
          <p class="task-meta">${t.meta}</p>
        </div>
        <button class="task-done" ${t.done ? "disabled" : ""}>${t.done ? "Done ✓" : "Done"}</button>
      </li>`
    )
    .join("");
  const open = tasks.filter((t) => !t.done).length;
  taskBadge.textContent = open;
  taskBadge.classList.toggle("is-zero", open === 0);
}

tasksEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".task-done");
  if (!btn) return;
  const li = btn.closest(".task");
  const task = tasks.find((t) => t.id === li.dataset.id);
  if (!task || task.done) return;
  task.done = true;
  renderTasks();
  showToast(`Task cleared: ${task.title}`);
});

// ── Messages ─────────────────────────────────────────────────────────────────
const messagesEl = document.getElementById("messages");
function renderMessages() {
  messagesEl.innerHTML = messages
    .map((m) => {
      const initials = m.from
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("");
      return `<li class="msg">
        <span class="msg-avatar ${m.cls}">${initials}</span>
        <div class="msg-body">
          <p class="msg-from">${m.from}</p>
          <p class="msg-text">${m.text}</p>
        </div>
        ${m.unread ? '<span class="msg-unread"></span>' : ""}
      </li>`;
    })
    .join("");
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.getElementById("todayDate").textContent = "Monday, 8 June";
syncKpis();
renderSchedule();
renderTasks();
renderMessages();
