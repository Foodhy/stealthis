const AVAIL = {
  single: ["101", "105"],
  double: ["102", "103", "208"],
  deluxe: ["201", "205", "211"],
  junior: ["302", "303"],
};

let nights = 1;
let cat = "single";
let rate = 142;
let room = null;

const fmt = (n) =>
  `€${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const $ = (id) => document.getElementById(id);

function tomorrowFmt(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
}

function renderDates() {
  $("dIn").textContent = tomorrowFmt(0);
  $("dOut").textContent = tomorrowFmt(nights);
}
function renderNights() {
  $("nightsN").textContent = nights;
  $("nightsS").textContent = nights > 1 ? "s" : "";
}
function renderRooms() {
  const list = AVAIL[cat];
  if (!list || list.length === 0) {
    $("rooms").innerHTML = `<span class="rpill is-empty">No rooms available</span>`;
    room = null;
    return;
  }
  $("rooms").innerHTML = list
    .map(
      (r) =>
        `<button type="button" class="rpill ${room === r ? "is-selected" : ""}" data-r="${r}">${r}</button>`
    )
    .join("");
}
function renderQuote() {
  const subtotal = nights * rate;
  const city = 1.65 * nights;
  const total = subtotal + city;
  $("totalQ").textContent = fmt(total);
  $("quoteMeta").textContent =
    `${nights} night${nights > 1 ? "s" : ""} · €${rate} BAR · incl. city tax ${fmt(city)}`;
}

document.querySelectorAll(".stepper button").forEach((b) =>
  b.addEventListener("click", () => {
    const delta = parseInt(b.dataset.step, 10);
    nights = Math.max(1, Math.min(14, nights + delta));
    renderNights();
    renderDates();
    renderQuote();
  })
);

document.getElementById("cats").addEventListener("click", (e) => {
  const c = e.target.closest(".cat");
  if (!c) return;
  document.querySelectorAll(".cat").forEach((x) => x.classList.remove("is-active"));
  c.classList.add("is-active");
  cat = c.dataset.cat;
  rate = parseFloat(c.dataset.rate);
  room = null;
  renderRooms();
  renderQuote();
});

document.getElementById("rooms").addEventListener("click", (e) => {
  const p = e.target.closest(".rpill");
  if (!p || p.classList.contains("is-empty")) return;
  room = p.dataset.r;
  renderRooms();
});

document.getElementById("checkin").addEventListener("click", () => {
  const t = document.getElementById("toast");
  const name = $("gName").value || "guest";
  if (!room) {
    t.textContent = "Pick a room from the list to continue.";
  } else {
    t.textContent = `Booked · ${name} → room ${room} for ${nights} night${nights > 1 ? "s" : ""}`;
  }
  t.hidden = false;
  clearTimeout(window.__t);
  window.__t = setTimeout(() => (t.hidden = true), 2000);
});

renderNights();
renderDates();
renderRooms();
renderQuote();
