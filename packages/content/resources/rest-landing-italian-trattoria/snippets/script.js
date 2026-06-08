// Update "Specialità della settimana" week label to current Mon-Sun span (in Italian)
const MONTHS_IT = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];
function setWeek() {
  const el = document.getElementById("boardWeek");
  if (!el) return;
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // Monday = 0
  const mon = new Date(now);
  mon.setDate(now.getDate() - dow);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  el.textContent = `dal ${mon.getDate()} al ${sun.getDate()} ${MONTHS_IT[sun.getMonth()]}`;
}
setWeek();

// Default reservation date to tomorrow
const di = document.querySelector('input[name="d"]');
if (di) {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  di.value = t.toISOString().slice(0, 10);
}

const form = document.getElementById("form");
const ok = document.getElementById("ok");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  ok.hidden = false;
  const btn = form.querySelector("button");
  btn.disabled = true;
  setTimeout(() => {
    ok.hidden = true;
    btn.disabled = false;
  }, 2800);
});
