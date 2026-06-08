// Steps: 0 Sent, 1 Cooking, 2 Ready, 3 Out, 4 Delivered (Out skipped for pickup)
const TOTAL_STEPS = 5;
const MINUTES_REMAINING_BY_STEP = [28, 22, 14, 8, 0];

let mode = "delivery"; // "delivery" | "pickup"
let current = 1;
let timer = null;

const card = document.querySelector(".card");
const stepsEl = document.getElementById("steps");
const etaTime = document.getElementById("etaTime");
const etaMins = document.getElementById("etaMins");
const advanceBtn = document.getElementById("advance");
const restartBtn = document.getElementById("restart");

function fmtClock(d) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function applyMode() {
  card.classList.toggle("is-pickup", mode === "pickup");
}

function visibleSteps() {
  if (mode === "pickup") return [0, 1, 2, 4];
  return [0, 1, 2, 3, 4];
}

function progressPercent() {
  const steps = visibleSteps();
  const i = steps.indexOf(current);
  if (i < 0) return 0;
  if (steps.length <= 1) return 0;
  return (i / (steps.length - 1)) * 100;
}

function effectiveMinutesRemaining() {
  // Pickup skips Out for delivery; remap the minutes accordingly.
  if (mode === "delivery") return MINUTES_REMAINING_BY_STEP[current];
  const map = { 0: 22, 1: 14, 2: 6, 4: 0 };
  return map[current] ?? 0;
}

function render() {
  // Step classes
  document.querySelectorAll("[data-step]").forEach((li) => {
    const n = Number(li.dataset.step);
    li.classList.toggle("is-done", n < current);
    li.classList.toggle("is-active", n === current);
  });
  // Progress bar
  stepsEl.style.setProperty("--progress", `${progressPercent() * 0.8}%`);
  // ETA
  const mins = effectiveMinutesRemaining();
  const eta = new Date();
  eta.setMinutes(eta.getMinutes() + mins);
  etaTime.textContent = current === 4 ? fmtClock(new Date()) : fmtClock(eta);
  etaMins.textContent = current === 4 ? "delivered" : mins === 0 ? "any minute" : `in ${mins} min`;
  // Step times: stamp the time when stepping forward.
  applyMode();
  advanceBtn.disabled = current >= 4;
  advanceBtn.textContent = current >= 4 ? "Done ✓" : "Advance →";
}

function stampTime(step) {
  const el = document.querySelector(`[data-time="${step}"]`);
  if (!el) return;
  el.textContent = fmtClock(new Date());
}

function advance() {
  const steps = visibleSteps();
  const i = steps.indexOf(current);
  if (i < 0 || i >= steps.length - 1) return;
  current = steps[i + 1];
  stampTime(current);
  render();
}

function autoTick() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (current >= 4) {
      clearInterval(timer);
      return;
    }
    advance();
  }, 6500);
}

advanceBtn.addEventListener("click", () => {
  advance();
  autoTick();
});

restartBtn.addEventListener("click", () => {
  current = 1;
  document.querySelectorAll("[data-time]").forEach((el, idx) => {
    if (idx < 2) {
      const t = new Date();
      t.setMinutes(t.getMinutes() - (2 - idx) * 4);
      el.textContent = fmtClock(t);
    } else {
      el.textContent = "— · —";
    }
  });
  render();
  autoTick();
});

document.querySelectorAll("[data-mode]").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-mode]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    mode = btn.dataset.mode;
    render();
  })
);

render();
autoTick();
