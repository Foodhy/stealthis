// ── Config ──────────────────────────────────────────────────────────────────

const AMENITIES = {
  spa: {
    label: "Spa",
    optionLabel: "Treatment",
    maxParty: 2,
    options: [
      { id: "s1", name: "Aromatherapy Massage", dur: "60 min", price: 95 },
      { id: "s2", name: "Deep Tissue Massage", dur: "90 min", price: 130 },
      { id: "s3", name: "Facial — Hydra Glow", dur: "50 min", price: 80 },
      { id: "s4", name: "Couples Ritual", dur: "120 min", price: 210 },
    ],
    slots: {
      "9 Jun": ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"],
      "10 Jun": ["09:00", "10:30", "12:00", "14:30", "16:00"],
      "11 Jun": ["09:00", "11:00", "14:00", "15:30", "17:30"],
      "12 Jun": ["10:00", "11:30", "13:00", "15:00", "16:30"],
    },
    booked: {
      "9 Jun": ["11:30", "15:30"],
      "10 Jun": ["09:00", "16:00"],
      "11 Jun": ["11:00", "17:30"],
      "12 Jun": ["13:00"],
    },
  },
  gym: {
    label: "Gym",
    optionLabel: "Session type",
    maxParty: 3,
    options: [
      { id: "g1", name: "Open Gym Access", dur: "90 min", price: 15 },
      { id: "g2", name: "Personal Training", dur: "60 min", price: 75 },
      { id: "g3", name: "Yoga Flow", dur: "60 min", price: 20 },
      { id: "g4", name: "Pilates Reformer", dur: "55 min", price: 35 },
    ],
    slots: {
      "9 Jun": ["07:00", "08:00", "09:30", "11:00", "16:00", "18:00"],
      "10 Jun": ["07:00", "08:30", "10:00", "12:00", "17:00", "19:00"],
      "11 Jun": ["07:00", "09:00", "11:00", "14:00", "16:30", "18:30"],
      "12 Jun": ["07:00", "08:00", "10:30", "13:00", "15:00", "17:30"],
    },
    booked: {
      "9 Jun": ["08:00", "16:00"],
      "10 Jun": ["07:00", "12:00"],
      "11 Jun": ["09:00", "18:30"],
      "12 Jun": ["10:30", "17:30"],
    },
  },
  restaurant: {
    label: "Restaurant",
    optionLabel: "Dining experience",
    maxParty: 8,
    options: [
      { id: "r1", name: "Breakfast Terrace", dur: "Open 07–10h", price: 0 },
      { id: "r2", name: "À la carte Lunch", dur: "12–14h", price: 0 },
      { id: "r3", name: "Tasting Menu Dinner", dur: "6-course", price: 95 },
      { id: "r4", name: "Chef's Table", dur: "8-course", price: 165 },
    ],
    slots: {
      "9 Jun": [
        "07:00",
        "07:30",
        "08:00",
        "12:00",
        "12:30",
        "13:00",
        "19:00",
        "19:30",
        "20:00",
        "21:00",
      ],
      "10 Jun": ["07:00", "08:00", "12:00", "12:30", "19:00", "19:30", "20:00", "20:30"],
      "11 Jun": ["07:00", "07:30", "08:30", "12:00", "13:00", "19:00", "20:00", "21:00"],
      "12 Jun": ["07:00", "08:00", "12:00", "12:30", "19:30", "20:00", "21:00"],
    },
    booked: {
      "9 Jun": ["07:30", "12:30", "19:30"],
      "10 Jun": ["12:00", "19:00", "20:30"],
      "11 Jun": ["08:30", "13:00", "21:00"],
      "12 Jun": ["12:00", "19:30"],
    },
  },
};

const DATES = ["9 Jun", "10 Jun", "11 Jun", "12 Jun"];
const DATE_LABELS = { "9 Jun": "Tue", "10 Jun": "Wed", "11 Jun": "Thu", "12 Jun": "Fri" };

// ── State ────────────────────────────────────────────────────────────────────
let amenity = "spa";
let optionId = null;
let date = DATES[0];
let slot = null;
let party = 1;

// ── Helpers ──────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const fmt = (n) =>
  n > 0
    ? `€${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "Complimentary";

const toast = $("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

function genRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return (
    "AU-" +
    Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  );
}

// ── Render helpers ───────────────────────────────────────────────────────────

function renderOptions() {
  const cfg = AMENITIES[amenity];
  $("optionLabel").textContent = cfg.optionLabel;
  $("optionGrid").innerHTML = cfg.options
    .map(
      (o) => `
      <button class="opt-card ${optionId === o.id ? "is-active" : ""}" data-id="${o.id}" data-price="${o.price}" type="button">
        <span class="opt-name">${o.name}</span>
        <span class="opt-dur">${o.dur}</span>
        <span class="opt-price">${fmt(o.price)}</span>
      </button>`
    )
    .join("");
}

function renderDates() {
  $("datePills").innerHTML = DATES.map(
    (d) => `
      <button class="dpill ${d === date ? "is-active" : ""}" data-date="${d}" type="button">
        <span class="dday">${DATE_LABELS[d]}</span>
        ${d}
      </button>`
  ).join("");
}

function renderSlots() {
  const cfg = AMENITIES[amenity];
  const all = cfg.slots[date] || [];
  const booked = cfg.booked[date] || [];
  $("slotGrid").innerHTML = all
    .map((t) => {
      const isBooked = booked.includes(t);
      const isActive = slot === t && !isBooked;
      return `<button type="button" class="slot-pill ${isBooked ? "is-booked" : ""} ${isActive ? "is-active" : ""}" data-slot="${t}" ${isBooked ? "disabled aria-disabled='true'" : ""}>${t}</button>`;
    })
    .join("");
}

function renderParty() {
  const cfg = AMENITIES[amenity];
  $("partyN").textContent = party;
  $("partyS").textContent = party > 1 ? "s" : "";
  $("partyNote").textContent = `Up to ${cfg.maxParty} per booking`;
}

function renderQuote() {
  const opt = optionId && AMENITIES[amenity].options.find((o) => o.id === optionId);
  if (!opt || !slot) {
    $("totalQ").textContent = "—";
    $("quoteMeta").textContent = "Select an option & slot";
    $("confirmBtn").disabled = true;
    return;
  }
  const perPerson = opt.price > 0 ? opt.price * party : 0;
  $("totalQ").textContent = fmt(perPerson);
  const label =
    opt.price > 0
      ? `${party} guest${party > 1 ? "s" : ""} · €${opt.price}/person`
      : "No charge — complimentary";
  $("quoteMeta").textContent = `${opt.name} · ${date} ${slot} · ${label}`;
  $("confirmBtn").disabled = false;
}

function renderBadge() {
  $("headBadge").textContent = AMENITIES[amenity].label;
}

function renderAll() {
  renderBadge();
  renderOptions();
  renderDates();
  renderSlots();
  renderParty();
  renderQuote();
}

// ── Segmented control ─────────────────────────────────────────────────────────
$("seg").addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn) return;
  amenity = btn.dataset.amenity;
  optionId = null;
  slot = null;
  party = 1;
  document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  renderAll();
});

// ── Option cards ──────────────────────────────────────────────────────────────
$("optionGrid").addEventListener("click", (e) => {
  const card = e.target.closest(".opt-card");
  if (!card) return;
  optionId = card.dataset.id;
  renderOptions();
  renderQuote();
});

// ── Date pills ────────────────────────────────────────────────────────────────
$("datePills").addEventListener("click", (e) => {
  const pill = e.target.closest(".dpill");
  if (!pill) return;
  date = pill.dataset.date;
  slot = null; // reset slot on date change
  renderDates();
  renderSlots();
  renderQuote();
});

// ── Time slots ────────────────────────────────────────────────────────────────
$("slotGrid").addEventListener("click", (e) => {
  const pill = e.target.closest(".slot-pill");
  if (!pill || pill.classList.contains("is-booked")) return;
  slot = pill.dataset.slot;
  renderSlots();
  renderQuote();
});

// ── Stepper ───────────────────────────────────────────────────────────────────
document.querySelectorAll(".stepper button").forEach((b) =>
  b.addEventListener("click", () => {
    const delta = parseInt(b.dataset.step, 10);
    party = Math.max(1, Math.min(AMENITIES[amenity].maxParty, party + delta));
    renderParty();
    renderQuote();
  })
);

// ── Confirm booking ───────────────────────────────────────────────────────────
$("confirmBtn").addEventListener("click", () => {
  const opt = AMENITIES[amenity].options.find((o) => o.id === optionId);
  if (!opt || !slot) return;

  const ref = genRef();
  const perPerson = opt.price > 0 ? opt.price * party : 0;

  $("confirmRef").textContent = `Booking ref: ${ref}`;
  $("confirmDetail").innerHTML =
    `${opt.name} on <strong>${date}</strong> at <strong>${slot}</strong><br>` +
    `${party} guest${party > 1 ? "s" : ""} · ${fmt(perPerson)}`;

  $("formWrap").hidden = true;
  $("confirmPanel").hidden = false;
  showToast(`Confirmed · ${ref}`);
});

// ── Book another ──────────────────────────────────────────────────────────────
$("bookAnother").addEventListener("click", () => {
  amenity = "spa";
  optionId = null;
  date = DATES[0];
  slot = null;
  party = 1;
  document
    .querySelectorAll(".seg-btn")
    .forEach((b) => b.classList.toggle("is-active", b.dataset.amenity === "spa"));
  $("confirmPanel").hidden = true;
  $("formWrap").hidden = false;
  renderAll();
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderAll();
