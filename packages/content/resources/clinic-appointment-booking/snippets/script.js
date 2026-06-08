// ── Data ─────────────────────────────────────────────────────────────────────
const SPECIALTIES = [
  { id: "cardio", icon: "♥", name: "Cardiology", blurb: "Heart & vascular care" },
  { id: "derm", icon: "✦", name: "Dermatology", blurb: "Skin, hair & nails" },
  { id: "peds", icon: "☺", name: "Pediatrics", blurb: "Care for children" },
  { id: "gp", icon: "✚", name: "General Practice", blurb: "Everyday primary care" },
  { id: "ortho", icon: "⚙", name: "Orthopedics", blurb: "Bones & joints" },
  { id: "mind", icon: "◐", name: "Mental Health", blurb: "Therapy & wellbeing" },
];

const DOCTORS = {
  cardio: [
    {
      name: "Dr. Lena Okafor",
      sub: "Interventional cardiology",
      rating: "4.9",
      avail: "Tomorrow, 9:00 AM",
    },
    { name: "Dr. Marcus Hale", sub: "Heart failure", rating: "4.7", avail: "Thu, 11:30 AM" },
  ],
  derm: [
    { name: "Dr. Priya Nair", sub: "Medical dermatology", rating: "4.8", avail: "Today, 4:15 PM" },
    { name: "Dr. Owen Brandt", sub: "Cosmetic dermatology", rating: "4.6", avail: "Wed, 10:00 AM" },
  ],
  peds: [
    {
      name: "Dr. Sara Nguyen",
      sub: "General pediatrics",
      rating: "5.0",
      avail: "Tomorrow, 8:30 AM",
    },
    { name: "Dr. Tomas Reyes", sub: "Pediatric pulmonology", rating: "4.8", avail: "Fri, 1:00 PM" },
  ],
  gp: [
    { name: "Dr. Ravi Patel", sub: "Family medicine", rating: "4.9", avail: "Today, 3:00 PM" },
    { name: "Dr. Elise Moreau", sub: "Preventive care", rating: "4.7", avail: "Tomorrow, 2:00 PM" },
  ],
  ortho: [
    { name: "Dr. Hannah Cole", sub: "Sports medicine", rating: "4.8", avail: "Wed, 9:45 AM" },
    { name: "Dr. Jonah Kim", sub: "Joint replacement", rating: "4.6", avail: "Thu, 4:30 PM" },
  ],
  mind: [
    {
      name: "Dr. Amelia Frost",
      sub: "Clinical psychology",
      rating: "4.9",
      avail: "Tomorrow, 5:00 PM",
    },
    { name: "Dr. Noah Bauer", sub: "Psychiatry", rating: "4.7", avail: "Fri, 11:00 AM" },
  ],
};

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Fixed seed date: Mon 8 Jun 2026 (no Date.now / Math.random in the lab sandbox).
const BASE = { dow: 1, day: 8, month: 5 };
const MONTH_LEN = 30;

const AM_SLOTS = ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"];
const PM_SLOTS = ["13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
// Deterministic "unavailable" pattern per day index.
const blocked = (dayIdx, slotIdx) => (dayIdx + slotIdx) % 4 === 0;

// ── State ────────────────────────────────────────────────────────────────────
const state = { step: 1, spec: null, doc: null, dayIdx: null, time: null };

const $ = (id) => document.getElementById(id);
const toast = $("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

function dayMeta(i) {
  const day = ((BASE.day - 1 + i) % MONTH_LEN) + 1;
  const dow = DOW[(BASE.dow + i) % 7];
  return { day, dow, label: `${dow}, ${day} ${MONTH[BASE.month]}` };
}

// ── Renderers ────────────────────────────────────────────────────────────────
function renderSpecialties() {
  $("specGrid").innerHTML = SPECIALTIES.map(
    (s) =>
      `<button class="spec-card${state.spec === s.id ? " is-selected" : ""}" data-spec="${s.id}" aria-pressed="${state.spec === s.id}">` +
      `<span class="spec-ic" aria-hidden="true">${s.icon}</span>` +
      `<span class="spec-name">${s.name}</span><span class="spec-blurb">${s.blurb}</span></button>`
  ).join("");
}

function renderDoctors() {
  const docs = DOCTORS[state.spec] || [];
  $("docList").innerHTML = docs
    .map((d, i) => {
      const sel = state.doc === d.name ? " is-selected" : "";
      const initials = d.name
        .replace("Dr. ", "")
        .split(" ")
        .map((w) => w[0])
        .join("");
      return (
        `<li><button class="doc-card${sel}" data-doc="${i}" aria-pressed="${!!sel}">` +
        `<span class="doc-avatar" aria-hidden="true">${initials}</span>` +
        `<span class="doc-body"><span class="doc-name">${d.name}</span>` +
        `<span class="doc-sub">${d.sub}</span>` +
        `<span class="doc-avail">Next available · ${d.avail}</span></span>` +
        `<span class="doc-rating"><span class="stars" aria-hidden="true">★</span> ${d.rating}</span>` +
        `</button></li>`
      );
    })
    .join("");
}

function renderDates() {
  let out = "";
  for (let i = 1; i <= 7; i++) {
    const m = dayMeta(i);
    const sel = state.dayIdx === i ? " is-selected" : "";
    out += `<button class="date-chip${sel}" data-day="${i}" aria-pressed="${state.dayIdx === i}"><span class="dc-dow">${m.dow}</span><span class="dc-day">${m.day}</span></button>`;
  }
  $("dateStrip").innerHTML = out;
}

function renderSlots() {
  const di = state.dayIdx || 0;
  const build = (list, offset) =>
    list
      .map((t, i) => {
        const off = blocked(di, i + offset);
        const sel = state.time === t ? " is-selected" : "";
        return `<button class="slot${sel}" data-time="${t}"${off ? " disabled" : ""} aria-pressed="${state.time === t}">${t}</button>`;
      })
      .join("");
  $("slotsAm").innerHTML = build(AM_SLOTS, 0);
  $("slotsPm").innerHTML = build(PM_SLOTS, 8);
}

function renderSummary() {
  const spec = SPECIALTIES.find((s) => s.id === state.spec);
  $("sumSpec").textContent = spec ? spec.name : "—";
  $("sumDoc").textContent = state.doc || "—";
  $("sumDate").textContent = state.dayIdx ? dayMeta(state.dayIdx).label : "—";
  $("sumTime").textContent = state.time || "—";
}

function renderStepper() {
  document.querySelectorAll(".step").forEach((el) => {
    const n = Number(el.dataset.step);
    el.classList.toggle("is-current", n === state.step);
    el.classList.toggle("is-done", n < state.step || state.step === 4);
  });
}

// ── Validation ───────────────────────────────────────────────────────────────
function isValid() {
  if (state.step === 1) return !!state.spec;
  if (state.step === 2) return !!state.doc;
  if (state.step === 3) return !!state.dayIdx && !!state.time;
  return false;
}

function render() {
  document.querySelectorAll(".panel-step").forEach((p) => (p.hidden = true));
  if (state.step === 4) {
    document.querySelector('[data-panel="done"]').hidden = false;
  } else {
    document.querySelector(`[data-panel="${state.step}"]`).hidden = false;
  }
  renderStepper();
  renderSummary();
  $("backBtn").hidden = state.step === 1 || state.step === 4;
  $("contBtn").hidden = state.step === 4;
  $("contBtn").disabled = !isValid();
  $("contBtn").textContent = state.step === 3 ? "Confirm booking" : "Continue";
}

// ── Reference (deterministic, derived from selections) ────────────────────────
function makeRef() {
  const specIdx = SPECIALTIES.findIndex((s) => s.id === state.spec) + 1;
  const docs = DOCTORS[state.spec] || [];
  const docIdx = docs.findIndex((d) => d.name === state.doc) + 1;
  const slotIdx = [...AM_SLOTS, ...PM_SLOTS].indexOf(state.time) + 1;
  const n = ((specIdx * 100000 + docIdx * 10000 + state.dayIdx * 100 + slotIdx) % 1000000) + 100000;
  return "APT-" + String(n % 1000000).padStart(6, "0");
}

// ── Events ───────────────────────────────────────────────────────────────────
$("specGrid").addEventListener("click", (e) => {
  const b = e.target.closest("[data-spec]");
  if (!b) return;
  state.spec = b.dataset.spec;
  state.doc = null;
  renderSpecialties();
  render();
});

$("docList").addEventListener("click", (e) => {
  const b = e.target.closest("[data-doc]");
  if (!b) return;
  state.doc = DOCTORS[state.spec][Number(b.dataset.doc)].name;
  renderDoctors();
  render();
});

$("dateStrip").addEventListener("click", (e) => {
  const b = e.target.closest("[data-day]");
  if (!b) return;
  state.dayIdx = Number(b.dataset.day);
  state.time = null;
  renderDates();
  renderSlots();
  render();
});

document.querySelector(".flow").addEventListener("click", (e) => {
  const b = e.target.closest(".slot");
  if (!b || b.disabled) return;
  state.time = b.dataset.time;
  renderSlots();
  render();
});

$("contBtn").addEventListener("click", () => {
  if (!isValid()) return;
  if (state.step === 3) {
    $("bookingRef").textContent = makeRef();
    state.step = 4;
    render();
    showToast("Appointment confirmed — see you soon!");
    return;
  }
  state.step += 1;
  if (state.step === 2) renderDoctors();
  if (state.step === 3) {
    renderDates();
    renderSlots();
  }
  render();
});

$("backBtn").addEventListener("click", () => {
  if (state.step > 1) state.step -= 1;
  render();
});

$("calBtn").addEventListener("click", () => showToast("Added to your calendar."));
$("doneBtn").addEventListener("click", () => {
  Object.assign(state, { step: 1, spec: null, doc: null, dayIdx: null, time: null });
  renderSpecialties();
  render();
});

// ── Init ─────────────────────────────────────────────────────────────────────
renderSpecialties();
render();
