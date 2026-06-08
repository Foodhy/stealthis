// Default reservation date to tomorrow
const di = document.querySelector('input[name="d"]');
if (di) {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  di.value = t.toISOString().slice(0, 10);
}

// Cycle the "dry-aging now" days every few seconds so the demo feels alive.
const agingEl = document.getElementById("agingDays");
const STARTING = 187;
let n = STARTING;
setInterval(() => {
  n = STARTING + Math.floor(Math.random() * 9);
  agingEl.textContent = n;
}, 2400);

// Form
const form = document.getElementById("form");
const ok = document.getElementById("ok");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  ok.hidden = false;
  const btn = form.querySelector("button");
  const txt = btn.textContent;
  btn.textContent = "Held ✓";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = txt;
    btn.disabled = false;
    ok.hidden = true;
  }, 2600);
});
