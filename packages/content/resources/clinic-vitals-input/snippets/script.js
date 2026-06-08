// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 3200);
}

// ── Elements ─────────────────────────────────────────────────────────────────
const form = document.getElementById("vitals-form");
const stamp = document.getElementById("stamp");
const bmiPill = document.getElementById("bmi-pill");
const bmiValue = document.getElementById("bmi-value");
const bmiCat = document.getElementById("bmi-cat");

// Single inputs to range-check (BP handled separately because it's paired).
const rangeInputs = ["hr", "temp", "spo2", "rr"].map((id) => document.getElementById(id));
const sys = document.getElementById("sys");
const dia = document.getElementById("dia");
const weight = document.getElementById("weight");
const height = document.getElementById("height");

// ── Range evaluation ─────────────────────────────────────────────────────────
// Returns "" (empty/ok-unknown), "ok", "warn" (out of normal) or "danger" (critical).
function evaluate(input) {
  const raw = input.value.trim();
  if (raw === "") return "";
  const v = parseFloat(raw);
  if (Number.isNaN(v)) return "";
  const low = parseFloat(input.dataset.low);
  const high = parseFloat(input.dataset.high);
  const critLow = parseFloat(input.dataset.critLow);
  const critHigh = parseFloat(input.dataset.critHigh);
  if (v < critLow || v > critHigh) return "danger";
  if (v < low || v > high) return "warn";
  return "ok";
}

const FLAG_TEXT = {
  high: "Above range",
  low: "Below range",
  critHigh: "Critically high",
  critLow: "Critically low",
};

function flagLabel(input, level) {
  const v = parseFloat(input.value);
  const high = parseFloat(input.dataset.high);
  if (level === "danger") return v > high ? FLAG_TEXT.critHigh : FLAG_TEXT.critLow;
  return v > high ? FLAG_TEXT.high : FLAG_TEXT.low;
}

function applyField(fieldset, level) {
  fieldset.classList.toggle("is-ok", level === "ok");
  fieldset.classList.toggle("is-warn", level === "warn");
  fieldset.classList.toggle("is-danger", level === "danger");
}

function setFlag(name, level, text) {
  const flag = document.querySelector(`.flag[data-flag="${name}"]`);
  if (!flag) return;
  if (level === "warn" || level === "danger") {
    flag.hidden = false;
    flag.dataset.level = level;
    flag.textContent = text;
  } else {
    flag.hidden = true;
    flag.removeAttribute("data-level");
    flag.textContent = "";
  }
}

// Rank levels so the worse of two BP readings wins the field styling.
const RANK = { "": 0, ok: 1, warn: 2, danger: 3 };
function worse(a, b) {
  return RANK[a] >= RANK[b] ? a : b;
}

// ── Per-vital handlers ───────────────────────────────────────────────────────
function checkSingle(input) {
  const level = evaluate(input);
  const fieldset = input.closest(".field");
  applyField(fieldset, level);
  const name = fieldset.dataset.vital;
  setFlag(name, level, level === "ok" || level === "" ? "" : flagLabel(input, level));
}

function checkBP() {
  const sLevel = evaluate(sys);
  const dLevel = evaluate(dia);
  const field = sys.closest(".field");
  const combined = worse(sLevel, dLevel);
  applyField(field, combined);

  sys.closest(".bp-input").classList.toggle("is-flagged", sLevel === "warn" || sLevel === "danger");
  dia.closest(".bp-input").classList.toggle("is-flagged", dLevel === "warn" || dLevel === "danger");

  if (combined === "warn" || combined === "danger") {
    // Surface the more clinically relevant reading in the flag.
    const lead = RANK[sLevel] >= RANK[dLevel] ? sys : dia;
    setFlag("bp", combined, flagLabel(lead, combined));
  } else {
    setFlag("bp", combined, "");
  }
}

// ── BMI ──────────────────────────────────────────────────────────────────────
function computeBMI() {
  const w = parseFloat(weight.value);
  const h = parseFloat(height.value);
  if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) {
    bmiValue.textContent = "—";
    bmiCat.textContent = "awaiting data";
    bmiPill.dataset.cat = "none";
    return null;
  }
  const m = h / 100;
  const bmi = w / (m * m);
  const rounded = bmi.toFixed(1);
  bmiValue.textContent = rounded;

  let cat, label;
  if (bmi < 18.5) {
    cat = "under";
    label = "underweight";
  } else if (bmi < 25) {
    cat = "normal";
    label = "normal";
  } else if (bmi < 30) {
    cat = "over";
    label = "overweight";
  } else {
    cat = "obese";
    label = "obese";
  }
  bmiCat.textContent = label;
  bmiPill.dataset.cat = cat;
  return { bmi: rounded, label };
}

// ── Timestamp ────────────────────────────────────────────────────────────────
function nowLabel() {
  const d = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  return `${date} · ${time}`;
}

function markEdited() {
  stamp.classList.remove("is-saved");
  stamp.textContent = "Editing — not yet saved";
}

// ── Wire up live checking ────────────────────────────────────────────────────
rangeInputs.forEach((input) => {
  input.addEventListener("input", () => {
    checkSingle(input);
    markEdited();
  });
});
[sys, dia].forEach((input) => {
  input.addEventListener("input", () => {
    checkBP();
    markEdited();
  });
});
[weight, height].forEach((input) => {
  input.addEventListener("input", () => {
    computeBMI();
    markEdited();
  });
});

// ── Save ─────────────────────────────────────────────────────────────────────
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const captured = [];
  const flagged = [];

  const single = [
    { input: sys, label: "Systolic", unit: "mmHg" },
    { input: dia, label: "Diastolic", unit: "mmHg" },
    { input: document.getElementById("hr"), label: "HR", unit: "bpm" },
    { input: document.getElementById("temp"), label: "Temp", unit: "°C" },
    { input: document.getElementById("spo2"), label: "SpO₂", unit: "%" },
    { input: document.getElementById("rr"), label: "RR", unit: "/min" },
  ];

  single.forEach(({ input, label, unit }) => {
    const v = input.value.trim();
    if (v === "") return;
    captured.push(`${label} ${v}${unit}`);
    const level = evaluate(input);
    if (level === "warn" || level === "danger") flagged.push(label);
  });

  const bmi = computeBMI();
  if (weight.value.trim() !== "") captured.push(`Wt ${weight.value.trim()}kg`);
  if (height.value.trim() !== "") captured.push(`Ht ${height.value.trim()}cm`);
  if (bmi) captured.push(`BMI ${bmi.bmi} (${bmi.label})`);

  if (captured.length === 0) {
    showToast("Enter at least one vital before saving.");
    return;
  }

  stamp.classList.add("is-saved");
  stamp.textContent = `Saved ${nowLabel()} · by Nurse on duty`;

  const summary = captured.join(" · ");
  if (flagged.length) {
    showToast(`Vitals saved (${captured.length}). Flagged for review: ${flagged.join(", ")}.`);
  } else {
    showToast(`Vitals saved — all in range. ${summary}.`);
  }
});

// ── Reset ────────────────────────────────────────────────────────────────────
form.addEventListener("reset", () => {
  // Defer so the native reset clears values first.
  setTimeout(() => {
    document.querySelectorAll(".field").forEach((f) => {
      f.classList.remove("is-ok", "is-warn", "is-danger");
    });
    document.querySelectorAll(".bp-input").forEach((b) => b.classList.remove("is-flagged"));
    document.querySelectorAll(".flag").forEach((f) => {
      f.hidden = true;
      f.removeAttribute("data-level");
      f.textContent = "";
    });
    computeBMI();
    stamp.classList.remove("is-saved");
    stamp.textContent = "Captured — not yet saved";
    showToast("Form cleared.");
  }, 0);
});
