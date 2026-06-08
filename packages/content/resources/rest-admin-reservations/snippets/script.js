const BOOKINGS = [
  {
    id: "b1",
    time: "19:00",
    name: "Reyes",
    phone: "+34 612 …",
    party: 2,
    table: "T4 · window",
    status: "seated",
    note: "",
  },
  {
    id: "b2",
    time: "19:00",
    name: "García-Tan",
    phone: "+34 645 …",
    party: 4,
    table: "T11 · centre",
    status: "arrived",
    note: "Birthday · candle ready",
  },
  {
    id: "b3",
    time: "19:15",
    name: "Khoury",
    phone: "+34 654 …",
    party: 2,
    table: "Bar 1",
    status: "confirmed",
    note: "Regular · usual seat",
  },
  {
    id: "b4",
    time: "19:30",
    name: "Marquez",
    phone: "+34 698 …",
    party: 2,
    table: "T3 · window",
    status: "confirmed",
    note: "",
  },
  {
    id: "b5",
    time: "19:45",
    name: "Loredo",
    phone: "+34 622 …",
    party: 4,
    table: "T5 · centre",
    status: "confirmed",
    note: "Allergic to nuts",
  },
  {
    id: "b6",
    time: "20:00",
    name: "Mendoza",
    phone: "+34 661 …",
    party: 6,
    table: "Long table",
    status: "confirmed",
    note: "Catering enquiry · ask about events",
  },
  {
    id: "b7",
    time: "20:00",
    name: "Yamamoto",
    phone: "+34 633 …",
    party: 3,
    table: "T12 · centre",
    status: "confirmed",
    note: "",
  },
  {
    id: "b8",
    time: "20:15",
    name: "Park",
    phone: "+34 678 …",
    party: 2,
    table: "P1 · patio",
    status: "confirmed",
    note: "",
  },
  {
    id: "b9",
    time: "20:30",
    name: "Singh",
    phone: "+34 671 …",
    party: 2,
    table: "P4 · patio",
    status: "confirmed",
    note: "",
  },
  {
    id: "b10",
    time: "20:30",
    name: "Tanaka",
    phone: "+34 685 …",
    party: 3,
    table: "T7 · window",
    status: "confirmed",
    note: "Anniversary",
  },
  {
    id: "b11",
    time: "21:00",
    name: "Costa",
    phone: "+34 612 …",
    party: 3,
    table: "T4 · window",
    status: "confirmed",
    note: "",
  },
  {
    id: "b12",
    time: "21:00",
    name: "Vega",
    phone: "+34 620 …",
    party: 4,
    table: "T5 · centre",
    status: "confirmed",
    note: "",
  },
  {
    id: "b13",
    time: "21:15",
    name: "Davis",
    phone: "+44 7 …",
    party: 4,
    table: "P5 · patio",
    status: "confirmed",
    note: "Visiting from London",
  },
  {
    id: "b14",
    time: "21:30",
    name: "Walk-in expected",
    phone: "—",
    party: 2,
    table: "Bar 2",
    status: "cancelled",
    note: "Cancelled this morning",
  },
];

const WAITLIST = [
  {
    id: "w1",
    when: "tonight",
    name: "Bautista, +1",
    note: "Party of 2 · flexible 19–22h · prefers patio",
    tag: "Promote",
    quiet: false,
  },
  {
    id: "w2",
    when: "Fri 21:00",
    name: "Iyengar",
    note: "×4 · added to waitlist at 11:32 today",
    tag: "On list",
    quiet: true,
  },
  {
    id: "w3",
    when: "Sat 20:30",
    name: "Bechtel",
    note: "×2 · birthday · happy with any table",
    tag: "On list",
    quiet: true,
  },
];

const STATUS_LABEL = {
  confirmed: "Confirmed",
  arrived: "Arrived",
  seated: "Seated",
  "no-show": "No-show",
  cancelled: "Cancelled",
};

let activeView = "list";
let partyFilter = "all";
let query = "";

const resList = document.getElementById("resList");
const waitList = document.getElementById("waitList");
const toast = document.getElementById("toast");

function partyMatches(p) {
  if (partyFilter === "all") return true;
  if (partyFilter === "more") return p >= 7;
  if (partyFilter === "2") return p <= 2;
  if (partyFilter === "4") return p >= 3 && p <= 4;
  if (partyFilter === "6") return p >= 5 && p <= 6;
  return true;
}

function renderList() {
  const q = query.toLowerCase();
  resList.innerHTML = BOOKINGS.map((b) => {
    const hide =
      !partyMatches(b.party) ||
      (q && !`${b.name} ${b.phone} ${b.table} ${b.note}`.toLowerCase().includes(q));
    const actions =
      b.status === "cancelled"
        ? `<button class="act" data-action="reinstate" data-id="${b.id}">Reinstate</button>`
        : b.status === "seated"
          ? `<button class="act" data-action="check" data-id="${b.id}">Mark check</button>
             <button class="act act-danger" data-action="cancel" data-id="${b.id}">Cancel</button>`
          : `<button class="act act-primary" data-action="seat" data-id="${b.id}">Seat now</button>
             <button class="act" data-action="noshow" data-id="${b.id}">No-show</button>
             <button class="act act-danger" data-action="cancel" data-id="${b.id}">Cancel</button>`;
    return `<li class="res-row ${hide ? "row-hidden" : ""}" data-id="${b.id}">
      <span class="r-time">${b.time}</span>
      <div class="r-body">
        <p class="r-name">${b.name}</p>
        <p class="r-meta">
          <strong>×${b.party}</strong>
          · <span>${b.table}</span>
          · <span>${b.phone}</span>
        </p>
        ${b.note ? `<p class="r-note">${b.note}</p>` : ""}
      </div>
      <span class="r-status" data-s="${b.status}">${STATUS_LABEL[b.status]}</span>
      <div class="r-actions">${actions}</div>
    </li>`;
  }).join("");
}

function renderWaitlist() {
  waitList.innerHTML = WAITLIST.map(
    (w) => `<li class="wait-row" data-id="${w.id}">
      <span class="w-when">${w.when}</span>
      <div>
        <p class="w-name">${w.name}</p>
        <p class="w-note">${w.note}</p>
      </div>
      <span class="w-tag ${w.quiet ? "w-tag-quiet" : ""}">${w.tag}</span>
      <button class="act act-primary" data-action="promote" data-id="${w.id}">${w.quiet ? "Offer slot" : "Promote ↗"}</button>
    </li>`
  ).join("");
}

function renderCalendar() {
  const calHead = document.getElementById("calHead");
  const calGrid = document.getElementById("cal");
  if (!calHead || !calGrid) return;
  const days = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
  const today = 0; // demo: today = Tue (offset 0)
  calHead.innerHTML =
    `<div></div>` +
    days.map((d, i) => `<div class="${i === today ? "is-today" : ""}">${d}</div>`).join("");
  const HOURS = ["18", "19", "20", "21", "22"];
  // Density 0..4 per cell — heat varies by time and day
  const DENSITY = [
    [1, 1, 2, 2, 3, 4, 1],
    [3, 3, 3, 4, 4, 4, 2],
    [4, 4, 4, 4, 4, 3, 2],
    [3, 3, 4, 4, 4, 1, 0],
    [1, 1, 2, 3, 3, 0, 0],
  ];
  let html = "";
  HOURS.forEach((h, r) => {
    html += `<div class="cal-time">${h}h</div>`;
    DENSITY[r].forEach((v, c) => {
      const count = v === 0 ? 0 : v + 1;
      html += `<div class="cal-cell" data-h="${v}" data-day="${days[c]}" data-hour="${h}">${count ? `${count}×` : ""}</div>`;
    });
  });
  calGrid.innerHTML = html;
}

// View switching
document.querySelectorAll("[data-view]").forEach((el) => {
  if (el.tagName === "BUTTON") {
    el.addEventListener("click", () => {
      activeView = el.dataset.view;
      document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("is-active", t === el));
      document.querySelectorAll(".view").forEach((v) => (v.hidden = v.dataset.view !== activeView));
      if (activeView === "cal") renderCalendar();
    });
  }
});

document.querySelectorAll(".seg-btn").forEach((btn) =>
  btn.addEventListener("click", () => {
    partyFilter = btn.dataset.party;
    document
      .querySelectorAll(".seg-btn")
      .forEach((b) => b.classList.toggle("is-active", b === btn));
    renderList();
  })
);

document.getElementById("search").addEventListener("input", (e) => {
  query = e.target.value.trim();
  renderList();
});

resList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const b = BOOKINGS.find((x) => x.id === id);
  if (!b) return;
  switch (btn.dataset.action) {
    case "seat":
      b.status = "seated";
      showToast(`${b.name} seated at ${b.table}`);
      break;
    case "noshow":
      b.status = "no-show";
      showToast(`${b.name} marked no-show`);
      break;
    case "cancel":
      b.status = "cancelled";
      showToast(`${b.name} cancelled`);
      break;
    case "reinstate":
      b.status = "confirmed";
      showToast(`${b.name} back on the list`);
      break;
    case "check":
      showToast(`Bill brought to ${b.name}`);
      break;
  }
  renderList();
});

waitList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  showToast("Sent an offer · waiting for confirmation");
});

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2400);
}

renderList();
renderWaitlist();
