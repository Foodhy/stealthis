// ── State ────────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 4;
const STEP_NAMES = ["Body area", "Symptoms", "Duration & severity", "Result"];
const state = {
  step: 1,
  area: null,
  symptoms: [],
  duration: "<24h",
  severity: 5,
};

const form = document.getElementById("wizardForm");
const steps = [...form.querySelectorAll(".step")];
const stepLabel = document.getElementById("stepLabel");
const stepName = document.getElementById("stepName");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const navHint = document.getElementById("navHint");

// ── Render the current step ──────────────────────────────────────────────────
function render() {
  steps.forEach((s) => s.classList.toggle("is-active", Number(s.dataset.step) === state.step));
  stepLabel.textContent = `Step ${state.step} of ${TOTAL_STEPS}`;
  stepName.textContent = STEP_NAMES[state.step - 1];
  progressFill.style.width = `${(state.step / TOTAL_STEPS) * 100}%`;
  progressBar.setAttribute("aria-valuenow", String(state.step));
  navHint.textContent = "";

  const onResult = state.step === TOTAL_STEPS;
  backBtn.hidden = state.step === 1 || onResult;
  nextBtn.hidden = onResult;
  restartBtn.hidden = !onResult;
  nextBtn.textContent = state.step === TOTAL_STEPS - 1 ? "See result" : "Next";
}

// ── Validation gating ────────────────────────────────────────────────────────
function validateStep() {
  if (state.step === 1 && !state.area) {
    return "Please choose a body area to continue.";
  }
  if (state.step === 2 && state.symptoms.length === 0) {
    return "Please select at least one symptom.";
  }
  return "";
}

// ── Deterministic illustrative triage ────────────────────────────────────────
function computeTriage() {
  const hasUrgentSymptom = state.symptoms.includes("Shortness of breath");
  const chestPain = state.area === "Chest" && state.symptoms.includes("Pain");
  const longDuration = state.duration === "4-7 days" || state.duration === ">1 week";

  if (hasUrgentSymptom || chestPain || state.severity >= 8) {
    return {
      key: "danger",
      level: "Seek urgent care",
      rec: "Your answers suggest symptoms that should be assessed promptly by a clinician.",
      steps: [
        "Contact urgent care or your clinic today.",
        "If breathing is difficult or pain is severe, call your local emergency number.",
        "Have someone stay with you if you feel unwell.",
      ],
    };
  }

  if (state.severity >= 5 || longDuration || state.symptoms.length >= 3) {
    return {
      key: "warn",
      level: "Book a GP appointment soon",
      rec: "Your symptoms are worth a professional review within the next day or two.",
      steps: [
        "Book a routine appointment with your GP.",
        "Note when symptoms started and what makes them better or worse.",
        "Rest, stay hydrated, and monitor for any new symptoms.",
      ],
    };
  }

  return {
    key: "ok",
    level: "Self-care & monitor",
    rec: "Your symptoms appear mild. Home care and observation are reasonable for now.",
    steps: [
      "Rest and keep up your fluids.",
      "Use over-the-counter relief as appropriate.",
      "Check back in if symptoms worsen or last beyond a few days.",
    ],
  };
}

function renderResult() {
  const t = computeTriage();
  const banner = document.getElementById("resultBanner");
  banner.className = `result-banner level-${t.key}`;
  document.getElementById("rbLevel").textContent = t.level;
  document.getElementById("rbRec").textContent = t.rec;

  const list = document.getElementById("nextSteps");
  list.innerHTML = "";
  for (const step of t.steps) {
    const li = document.createElement("li");
    li.textContent = step;
    list.appendChild(li);
  }
}

// ── Step 1 — body area (single select) ───────────────────────────────────────
document.getElementById("areaGrid").addEventListener("click", (e) => {
  const card = e.target.closest(".area-card");
  if (!card) return;
  state.area = card.dataset.area;
  for (const c of card.parentElement.children) {
    c.setAttribute("aria-checked", String(c === card));
  }
  navHint.textContent = "";
});

// ── Step 2 — symptoms (multi select) ─────────────────────────────────────────
document.getElementById("symptomGrid").addEventListener("change", () => {
  state.symptoms = [...form.querySelectorAll('input[name="symptom"]:checked')].map((i) => i.value);
  if (state.symptoms.length > 0) navHint.textContent = "";
});

// ── Step 3 — duration & severity ─────────────────────────────────────────────
document.getElementById("durationGrid").addEventListener("change", (e) => {
  state.duration = e.target.value;
});
const severity = document.getElementById("severity");
const sevValue = document.getElementById("sevValue");
severity.addEventListener("input", () => {
  state.severity = Number(severity.value);
  sevValue.textContent = severity.value;
});

// ── Navigation ───────────────────────────────────────────────────────────────
nextBtn.addEventListener("click", () => {
  const error = validateStep();
  if (error) {
    navHint.textContent = error;
    return;
  }
  if (state.step === TOTAL_STEPS - 1) renderResult();
  state.step = Math.min(state.step + 1, TOTAL_STEPS);
  render();
});

backBtn.addEventListener("click", () => {
  state.step = Math.max(state.step - 1, 1);
  render();
});

document.getElementById("bookBtn").addEventListener("click", () => {
  document.getElementById("bookBtn").textContent = "Appointment requested ✓";
  document.getElementById("bookBtn").disabled = true;
});

restartBtn.addEventListener("click", () => {
  form.reset();
  state.step = 1;
  state.area = null;
  state.symptoms = [];
  state.duration = "<24h";
  state.severity = 5;
  sevValue.textContent = "5";
  for (const c of document.getElementById("areaGrid").children) {
    c.setAttribute("aria-checked", "false");
  }
  const bookBtn = document.getElementById("bookBtn");
  bookBtn.textContent = "Book an appointment";
  bookBtn.disabled = false;
  render();
});

render();
