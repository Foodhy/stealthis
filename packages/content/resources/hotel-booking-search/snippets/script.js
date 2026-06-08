// ── Date defaults: check-in tomorrow, check-out +2 nights ─────────────────────
const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");

function iso(d) {
  return d.toISOString().slice(0, 10);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

const today = new Date();
today.setHours(0, 0, 0, 0);
const defIn = addDays(today, 1);
const defOut = addDays(today, 3);

checkin.value = iso(defIn);
checkout.value = iso(defOut);
checkin.min = iso(today);
checkout.min = iso(addDays(today, 1));

// Keep check-out strictly after check-in.
checkin.addEventListener("change", () => {
  const inD = new Date(checkin.value);
  const minOut = iso(addDays(inD, 1));
  checkout.min = minOut;
  if (new Date(checkout.value) <= inD) checkout.value = minOut;
  renderSummary();
});
checkout.addEventListener("change", renderSummary);
document.getElementById("dest").addEventListener("change", renderSummary);

// ── Guests & rooms popover ────────────────────────────────────────────────────
const guests = { adults: 2, children: 0, rooms: 1 };
const trigger = document.getElementById("guestsTrigger");
const pop = document.getElementById("guestsPop");
const guestsLabel = document.getElementById("guestsLabel");

function openPop(open) {
  pop.hidden = !open;
  trigger.setAttribute("aria-expanded", String(open));
}
trigger.addEventListener("click", (e) => {
  e.stopPropagation();
  openPop(pop.hidden);
});
document.getElementById("guestsDone").addEventListener("click", () => openPop(false));
document.addEventListener("click", (e) => {
  if (!pop.hidden && !pop.contains(e.target) && e.target !== trigger) openPop(false);
});

document.querySelectorAll(".stepper").forEach((row) => {
  const key = row.dataset.key;
  const min = Number(row.dataset.min);
  const max = Number(row.dataset.max);
  const valEl = row.querySelector("[data-val]");
  const [minus, plus] = row.querySelectorAll(".step");

  function sync() {
    valEl.textContent = guests[key];
    minus.disabled = guests[key] <= min;
    plus.disabled = guests[key] >= max;
  }
  row.querySelectorAll(".step").forEach((btn) =>
    btn.addEventListener("click", () => {
      const next = guests[key] + Number(btn.dataset.dir);
      if (next < min || next > max) return;
      guests[key] = next;
      sync();
      renderGuestsLabel();
      renderSummary();
    })
  );
  sync();
});

function renderGuestsLabel() {
  const ppl = guests.adults + guests.children;
  const g = `${ppl} ${ppl === 1 ? "guest" : "guests"}`;
  const r = `${guests.rooms} ${guests.rooms === 1 ? "room" : "rooms"}`;
  guestsLabel.textContent = `${g} · ${r}`;
}

// ── Summary line ──────────────────────────────────────────────────────────────
const summary = document.getElementById("summary");

function nights() {
  const ms = new Date(checkout.value) - new Date(checkin.value);
  return Math.round(ms / 86400000);
}
function fmt(isoStr) {
  return new Date(isoStr + "T00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function renderSummary() {
  const n = nights();
  if (!checkin.value || !checkout.value || n <= 0) {
    summary.classList.add("error");
    summary.textContent = "Please choose a check-out date after your check-in date.";
    return;
  }
  summary.classList.remove("error");
  const ppl = guests.adults + guests.children;
  summary.innerHTML =
    `<strong>${n}</strong> ${n === 1 ? "night" : "nights"} · ` +
    `${fmt(checkin.value)} → ${fmt(checkout.value)} · ` +
    `<strong>${ppl}</strong> ${ppl === 1 ? "guest" : "guests"}, ` +
    `<strong>${guests.rooms}</strong> ${guests.rooms === 1 ? "room" : "rooms"}`;
}

// ── Toast + submit ────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2400);
}

document.getElementById("search").addEventListener("submit", (e) => {
  e.preventDefault();
  if (nights() <= 0) {
    renderSummary();
    return;
  }
  const dest = document.getElementById("dest");
  const city = dest.options[dest.selectedIndex].text;
  showToast(`Searching ${city} · ${nights()} nights · ${guests.rooms} room(s)…`);
});

renderGuestsLabel();
renderSummary();
