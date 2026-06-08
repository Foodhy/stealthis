const ORIGINAL_TOTAL = 1205.5;
const CITY_PER_GUEST_NIGHT = 1.65;
const fmt = (n) => `€${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtSigned = (n) => `${n < 0 ? "−" : "+"}€${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const $ = (id) => document.getElementById(id);
const arrive = $("arrive");
const depart = $("depart");
const cat = $("cat");
const plan = $("plan");
const adults = $("adults");
const children = $("children");
const cots = $("cots");
const toast = $("toast");

function diffNights() {
  const a = new Date(arrive.value);
  const d = new Date(depart.value);
  if (isNaN(a) || isNaN(d)) return 0;
  return Math.max(1, Math.round((d - a) / 86400000));
}

function calc() {
  const nights = diffNights();
  const rate = parseFloat(cat.selectedOptions[0].dataset.rate);
  const mult = parseFloat(plan.selectedOptions[0].dataset.mult);
  const guests = Math.max(1, parseInt(adults.value || 1, 10)) + Math.max(0, parseInt(children.value || 0, 10));
  const base = nights * rate;
  const discount = base * (mult - 1);
  const city = guests * CITY_PER_GUEST_NIGHT * nights;
  const total = base + discount + city;
  return { nights, rate, mult, guests, base, discount, city, total };
}

function render() {
  const { nights, rate, mult, guests, base, discount, city, total } = calc();
  $("nights").textContent = nights;
  $("sNights").textContent = nights;
  $("sNights2").textContent = nights;
  $("sRate").textContent = rate;
  $("sBase").textContent = fmt(base);
  $("sMult").textContent = mult === 1 ? "no change" : `${Math.round((mult - 1) * 100)}%`;
  $("sDisc").textContent = discount === 0 ? "—" : fmtSigned(discount);
  $("sGuestsLbl").textContent = guests;
  $("sCity").textContent = fmt(city);
  $("sTotal").textContent = fmt(total);
  $("diffAmt").textContent = fmtSigned(total - ORIGINAL_TOTAL);
}

[arrive, depart, cat, plan, adults, children, cots].forEach((el) =>
  el.addEventListener("input", render)
);
document.getElementById("chips").addEventListener("click", (e) => {
  const c = e.target.closest(".chip");
  if (!c) return;
  c.classList.toggle("is-on");
});
document.getElementById("save").addEventListener("click", () => {
  toast.textContent = `Saved · confirmation re-issued (${fmtSigned(calc().total - ORIGINAL_TOTAL)})`;
  toast.hidden = false;
  clearTimeout(window.__t);
  window.__t = setTimeout(() => (toast.hidden = true), 2000);
});
document.querySelector(".d-close").addEventListener("click", () => {
  toast.textContent = "Closed without saving";
  toast.hidden = false;
  clearTimeout(window.__t);
  window.__t = setTimeout(() => (toast.hidden = true), 1400);
});

render();
