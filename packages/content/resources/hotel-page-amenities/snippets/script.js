// ── Amenity data ──────────────────────────────────────────────────────────────
const AMENITIES = [
  {
    id: "spa",
    name: "Spa & Wellness",
    cat: "wellness",
    icon: "🌿",
    desc: "A 1,200 m² sanctuary offering signature treatments, hammam, aromatherapy showers, and a serenity lounge overlooking the courtyard garden.",
    hours: "Daily 08:00–21:00",
    accHours: [
      { day: "Mon–Fri", time: "08:00–21:00" },
      { day: "Sat–Sun", time: "07:30–22:00" },
      { day: "Public holidays", time: "09:00–20:00" },
    ],
  },
  {
    id: "pool",
    name: "Pool & Jacuzzi",
    cat: "wellness",
    icon: "🏊",
    desc: "A heated 25-metre indoor pool and outdoor rooftop plunge pool with panoramic city views. Heated towels, sunbeds, and complimentary water provided.",
    hours: "Daily 07:00–22:00",
    accHours: [
      { day: "Mon–Sun", time: "07:00–22:00" },
      { day: "Maintenance closure", time: "Tue 06:00–07:00" },
    ],
  },
  {
    id: "fitness",
    name: "Fitness Centre",
    cat: "sport",
    icon: "🏋️",
    desc: "State-of-the-art Technogym equipment, free weights, TRX zones, and personal training sessions available on request (advance booking required).",
    hours: "Daily 06:00–23:00",
    accHours: [
      { day: "Mon–Sun", time: "06:00–23:00" },
      { day: "Personal training", time: "By appointment" },
    ],
  },
  {
    id: "dining",
    name: "Fine Dining",
    cat: "dining",
    icon: "🍽️",
    desc: "Restaurante Laurel offers contemporary Iberian cuisine under Executive Chef Marcos Soto. Tasting menus of 5 and 8 courses, curated wine pairings available.",
    hours: "Dinner 19:00–23:00",
    accHours: [
      { day: "Breakfast", time: "07:00–10:30" },
      { day: "Lunch", time: "13:00–15:30" },
      { day: "Dinner", time: "19:00–23:00" },
      { day: "Monday", time: "Dinner only", highlight: true },
    ],
  },
  {
    id: "bar",
    name: "Rooftop Bar",
    cat: "dining",
    icon: "🥂",
    desc: "Cenit Rooftop Bar on the 14th floor. Craft cocktails, a curated natural wine list, and tapas bites. Sunset sessions with resident DJ every Friday–Saturday.",
    hours: "Daily 17:00–01:00",
    accHours: [
      { day: "Sun–Thu", time: "17:00–00:00" },
      { day: "Fri–Sat", time: "15:00–01:00" },
      { day: "DJ nights (Fri–Sat)", time: "21:00–01:00", highlight: true },
    ],
  },
  {
    id: "business",
    name: "Business Centre",
    cat: "business",
    icon: "💼",
    desc: "Four private meeting rooms (8–24 pax), executive boardroom, high-speed fibre Wi-Fi, A/V equipment, printing & secretarial services available.",
    hours: "Mon–Fri 07:00–21:00",
    accHours: [
      { day: "Mon–Fri", time: "07:00–21:00" },
      { day: "Sat", time: "08:00–14:00" },
      { day: "Sun", time: "On request", highlight: true },
    ],
  },
  {
    id: "concierge",
    name: "Concierge",
    cat: "business",
    icon: "🛎️",
    desc: "Our dedicated concierge team handles restaurant reservations, private tours, event tickets, airport transfers, and any bespoke request around the clock.",
    hours: "24 / 7",
    accHours: [
      { day: "All days", time: "24 hours" },
      { day: "Reservations desk", time: "08:00–22:00" },
    ],
  },
  {
    id: "parking",
    name: "Valet Parking",
    cat: "parking",
    icon: "🚗",
    desc: "Secure underground valet parking with EV charging points. Complimentary for Signature Suite guests; €28/night for all other room categories.",
    hours: "24 / 7",
    accHours: [
      { day: "All days", time: "24 hours" },
      { day: "EV charging", time: "On demand" },
      { day: "Rate", time: "€28 / night", highlight: true },
    ],
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
let activeCat = "all";

// ── DOM refs ──────────────────────────────────────────────────────────────────
const grid = document.getElementById("amenityGrid");
const emptyEl = document.getElementById("emptyMsg");
const accordion = document.getElementById("accordion");
const toast = document.getElementById("toast");

// ── Helpers ───────────────────────────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Render amenity cards ──────────────────────────────────────────────────────
function renderCards() {
  const visible = AMENITIES.filter((a) => activeCat === "all" || a.cat === activeCat);
  emptyEl.hidden = visible.length > 0;

  grid.innerHTML = visible
    .map(
      (a) => `
      <div class="amenity-card" data-id="${a.id}">
        <div class="amenity-icon">${a.icon}</div>
        <h3>${a.name}</h3>
        <p>${a.desc}</p>
        <div class="amenity-hours">🕐 ${a.hours}</div>
      </div>`
    )
    .join("");
}

// ── Render accordion ─────────────────────────────────────────────────────────
function renderAccordion() {
  accordion.innerHTML = AMENITIES.map(
    (a) => `
    <div class="acc-item" data-id="${a.id}">
      <button class="acc-trigger" aria-expanded="false">
        <div class="acc-trigger-left">
          <span class="acc-ico">${a.icon}</span>
          <span class="acc-name">${a.name}</span>
        </div>
        <span class="acc-chevron">▾</span>
      </button>
      <div class="acc-body">
        <div class="acc-body-inner">
          <table class="hours-table">
            <tbody>
              ${a.accHours
                .map(
                  (h) =>
                    `<tr class="${h.highlight ? "highlight-row" : ""}">
                      <td>${h.day}</td>
                      <td>${h.time}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`
  ).join("");
}

// ── Accordion toggle ──────────────────────────────────────────────────────────
accordion.addEventListener("click", (e) => {
  const trigger = e.target.closest(".acc-trigger");
  if (!trigger) return;
  const item = trigger.closest(".acc-item");
  const body = item.querySelector(".acc-body");
  const isOpen = item.classList.contains("open");

  // Close all
  document.querySelectorAll(".acc-item.open").forEach((el) => {
    el.classList.remove("open");
    el.querySelector(".acc-body").style.maxHeight = "0";
    el.querySelector(".acc-trigger").setAttribute("aria-expanded", "false");
  });

  // Open clicked if it wasn't open
  if (!isOpen) {
    item.classList.add("open");
    body.style.maxHeight = body.scrollHeight + "px";
    trigger.setAttribute("aria-expanded", "true");
  }
});

// ── Category tabs ─────────────────────────────────────────────────────────────
document.getElementById("tabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  activeCat = tab.dataset.cat;
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("active", t === tab);
    t.setAttribute("aria-selected", t === tab ? "true" : "false");
  });
  renderCards();
});

// ── Form validation & submit ──────────────────────────────────────────────────
const form = document.getElementById("infoForm");

function setErr(id, msg) {
  const el = document.getElementById(id + "Err");
  const inp = document.getElementById(id);
  if (el) el.textContent = msg;
  if (inp) inp.classList.toggle("invalid", !!msg);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;

  const fname = document.getElementById("fname").value.trim();
  const lname = document.getElementById("lname").value.trim();
  const email = document.getElementById("email").value.trim();
  const interest = document.getElementById("interest").value;

  if (!fname) {
    setErr("fname", "Please enter your first name.");
    ok = false;
  } else setErr("fname", "");

  if (!lname) {
    setErr("lname", "Please enter your last name.");
    ok = false;
  } else setErr("lname", "");

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    setErr("email", "Email address is required.");
    ok = false;
  } else if (!emailRe.test(email)) {
    setErr("email", "Please enter a valid email address.");
    ok = false;
  } else setErr("email", "");

  if (!interest) {
    setErr("interest", "Please select an area of interest.");
    ok = false;
  } else setErr("interest", "");

  if (!ok) return;

  showToast(`Request sent — our concierge will contact ${email} shortly ✓`);
  form.reset();
  document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderCards();
renderAccordion();
