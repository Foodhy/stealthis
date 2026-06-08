const MIN_PARTY = 1;
const MAX_PARTY = 10;
const RECOMMENDED_SLOT = "20:30";

const SLOT_LABELS = [
  "19:00",
  "19:15",
  "19:30",
  "19:45",
  "20:00",
  "20:15",
  "20:30",
  "20:45",
  "21:00",
  "21:15",
  "21:30",
  "21:45",
  "22:00",
  "22:15",
  "22:30",
];

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let party = 2;
let occasion = "none";
let selectedDate = startOfDay(new Date());
let selectedSlot = RECOMMENDED_SLOT;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function fmtDate(d) {
  if (isSameDay(d, new Date())) return "today";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(d, tomorrow)) return "tomorrow";
  return `${DOW[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()]}`;
}

// Slot availability is a deterministic function of date + party so the demo feels real.
function slotState(date, slot) {
  const key = `${date.getDate()}-${slot}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) & 0xffffffff;
  const v = Math.abs(hash) % 10;
  // Larger parties have fewer options
  if (party >= 8 && v >= 6) return "taken";
  if (party >= 4 && v >= 8) return "taken";
  if (v === 0) return "taken";
  return "open";
}

const datesEl = document.getElementById("dates");
const slotsEl = document.getElementById("slots");
const occEl = document.getElementById("occasions");
const partyNum = document.getElementById("partyNum");
const partyWord = document.getElementById("partyWord");
const partyHint = document.getElementById("partyHint");
const ctaMeta = document.getElementById("ctaMeta");
const form = document.getElementById("form");
const confirmEl = document.getElementById("confirm");
const confirmSub = document.getElementById("confirmSub");
const confRef = document.getElementById("confRef");
const confEmail = document.getElementById("confEmail");

function renderDates() {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  datesEl.innerHTML = days
    .map((d) => {
      const active = isSameDay(d, selectedDate);
      return `<button type="button" class="date ${active ? "is-active" : ""}"
        data-iso="${startOfDay(d).toISOString()}">
        <span class="date-dow">${DOW[d.getDay()]}</span>
        <span class="date-day">${d.getDate()}</span>
        <span class="date-month">${MONTH[d.getMonth()]}</span>
      </button>`;
    })
    .join("");
}

function renderSlots() {
  slotsEl.innerHTML = SLOT_LABELS.map((label) => {
    const state = slotState(selectedDate, label);
    const isRec = label === RECOMMENDED_SLOT && state === "open";
    const isActive = label === selectedSlot && state === "open";
    return `<button type="button" class="slot ${isActive ? "is-active" : ""} ${isRec ? "is-recommended" : ""}"
      data-slot="${label}" ${state === "taken" ? "disabled" : ""}>${label}</button>`;
  }).join("");
  // If selected slot is no longer available, fall back to the first open.
  if (slotState(selectedDate, selectedSlot) === "taken") {
    const open = SLOT_LABELS.find((s) => slotState(selectedDate, s) === "open");
    selectedSlot = open || "";
    renderSlots();
  }
}

function renderParty() {
  partyNum.textContent = party;
  partyWord.textContent = party === 1 ? "guest" : "guests";
  partyHint.hidden = party < 8;
  document.querySelector('[data-step="-1"]').disabled = party <= MIN_PARTY;
  document.querySelector('[data-step="1"]').disabled = party >= MAX_PARTY;
}

function renderCta() {
  ctaMeta.textContent = `${party} ${party === 1 ? "guest" : "guests"} · ${fmtDate(selectedDate)} · ${selectedSlot}`;
}

function refresh() {
  renderParty();
  renderDates();
  renderSlots();
  renderCta();
}

datesEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-iso]");
  if (!btn) return;
  selectedDate = new Date(btn.dataset.iso);
  refresh();
});

slotsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-slot]");
  if (!btn || btn.disabled) return;
  selectedSlot = btn.dataset.slot;
  renderSlots();
  renderCta();
});

document.querySelectorAll("[data-step]").forEach((btn) =>
  btn.addEventListener("click", () => {
    party = Math.min(MAX_PARTY, Math.max(MIN_PARTY, party + Number(btn.dataset.step)));
    renderParty();
    renderSlots();
    renderCta();
  })
);

occEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-occ]");
  if (!btn) return;
  occEl.querySelectorAll(".occ").forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  occasion = btn.dataset.occ;
});

// Mark "None" active on load
occEl.querySelector('[data-occ="none"]').classList.add("is-active");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name");
  const phone = document.getElementById("phone");
  const email = document.getElementById("email");
  if (!name.value || !phone.value || !email.value) {
    if (!name.value) name.focus();
    else if (!phone.value) phone.focus();
    else email.focus();
    return;
  }
  form.hidden = true;
  confirmEl.hidden = false;
  const ref = `R-${Date.now().toString(36).slice(-5).toUpperCase()}`;
  confRef.textContent = ref;
  confirmSub.textContent = `${party} ${party === 1 ? "guest" : "guests"} on ${fmtDate(selectedDate)} at ${selectedSlot}`;
  confEmail.textContent = email.value;
});

document.getElementById("newRes").addEventListener("click", () => {
  form.reset();
  occEl.querySelectorAll(".occ").forEach((b) => b.classList.remove("is-active"));
  occEl.querySelector('[data-occ="none"]').classList.add("is-active");
  party = 2;
  selectedDate = startOfDay(new Date());
  selectedSlot = RECOMMENDED_SLOT;
  form.hidden = false;
  confirmEl.hidden = true;
  refresh();
});

document.getElementById("addCal").addEventListener("click", () => {
  const btn = document.getElementById("addCal");
  btn.textContent = "Added ✓";
  setTimeout(() => (btn.textContent = "+ Add to calendar"), 1500);
});

refresh();
