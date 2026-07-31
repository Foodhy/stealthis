/* ==========================================================================
   DIY — Maker Unit Converter
   Tabs: Length (mm ↔ in), Wire gauge (AWG ↔ mm), Resistor color code.
   Vanilla JS, no dependencies.
   ========================================================================== */

"use strict";

/* ---------- toast helper ---------- */
const toastEl = document.getElementById("toast");
let toastTimer = null;

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2200);
}

function copyText(text, label) {
  const done = () => toast(label + " copied to clipboard");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    done();
  } catch (_) {
    toast("Copy failed — select manually");
  }
  document.body.removeChild(ta);
}

/* ==========================================================================
   TABS — roving tabindex + arrow-key navigation
   ========================================================================== */
const tabs = Array.from(document.querySelectorAll("[role='tab']"));
const panels = Array.from(document.querySelectorAll("[role='tabpanel']"));

function activateTab(tab, focus) {
  tabs.forEach((t) => {
    const active = t === tab;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", String(active));
    t.tabIndex = active ? 0 : -1;
  });
  panels.forEach((p) => {
    const active = p.id === tab.getAttribute("aria-controls");
    p.classList.toggle("is-active", active);
    p.hidden = !active;
  });
  if (focus) tab.focus();
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => activateTab(tab, false));
  tab.addEventListener("keydown", (e) => {
    let target = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") target = tabs[(i + 1) % tabs.length];
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") target = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === "Home") target = tabs[0];
    if (e.key === "End") target = tabs[tabs.length - 1];
    if (target) {
      e.preventDefault();
      activateTab(target, true);
    }
  });
});

/* ==========================================================================
   TAB 1 — LENGTH  (mm ↔ inches, fractional)
   ========================================================================== */
const mmInput = document.getElementById("mm-input");
const inInput = document.getElementById("in-input");
const fracReadout = document.getElementById("frac-readout");
const fracError = document.getElementById("frac-error");
const decReadout = document.getElementById("dec-readout");

const MM_PER_IN = 25.4;
let lenState = { mm: 9.525 };

/** Parse "0.375", "3/8", "1 1/2", "1-1/2" → decimal inches (or null). */
function parseInches(raw) {
  const s = raw.trim().replace(/["″in]+$/i, "").trim();
  if (!s) return null;
  const mixed = s.match(/^(\d+(?:\.\d+)?)[\s-]+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const den = Number(mixed[3]);
    return den ? Number(mixed[1]) + Number(mixed[2]) / den : null;
  }
  const frac = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) {
    const den = Number(frac[2]);
    return den ? Number(frac[1]) / den : null;
  }
  const dec = Number(s);
  return Number.isFinite(dec) ? dec : null;
}

function parseMm(raw) {
  const s = raw.trim().replace(/mm$/i, "").trim();
  if (!s) return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

/** Snap decimal inches to nearest 1/64 and reduce. */
function nearestFraction(inches) {
  const whole = Math.floor(inches);
  let num = Math.round((inches - whole) * 64);
  let den = 64;
  let w = whole;
  if (num === 64) {
    w += 1;
    num = 0;
  }
  while (num > 0 && num % 2 === 0) {
    num /= 2;
    den /= 2;
  }
  const value = w + (num ? num / den : 0);
  let label;
  if (num === 0) label = w + "″";
  else if (w === 0) label = num + "/" + den + "″";
  else label = w + " " + num + "/" + den + "″";
  return { label, value };
}

function renderLength(source) {
  const mm = lenState.mm;
  const inches = mm / MM_PER_IN;
  if (source !== "mm") mmInput.value = stripZeros(mm.toFixed(3));
  if (source !== "in") inInput.value = stripZeros(inches.toFixed(4));

  const frac = nearestFraction(inches);
  fracReadout.textContent = frac.label;
  decReadout.textContent = inches.toFixed(4) + "″";

  const driftMm = (frac.value - inches) * MM_PER_IN;
  fracError.textContent =
    Math.abs(driftMm) < 0.0005 ? "exact" : (driftMm > 0 ? "+" : "−") + Math.abs(driftMm).toFixed(3) + " mm drift";
}

function stripZeros(s) {
  return s.replace(/\.?0+$/, "");
}

mmInput.addEventListener("input", () => {
  const v = parseMm(mmInput.value);
  mmInput.classList.toggle("is-bad", v === null && mmInput.value.trim() !== "");
  if (v === null) return;
  lenState.mm = v;
  renderLength("mm");
});

inInput.addEventListener("input", () => {
  const v = parseInches(inInput.value);
  inInput.classList.toggle("is-bad", v === null && inInput.value.trim() !== "");
  if (v === null) return;
  lenState.mm = v * MM_PER_IN;
  renderLength("in");
});

document.getElementById("length-chips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-mm]");
  if (!chip) return;
  lenState.mm = Number(chip.dataset.mm);
  renderLength("chip");
  toast(chip.textContent.trim() + " loaded");
});

document.getElementById("copy-length").addEventListener("click", () => {
  copyText(
    stripZeros(lenState.mm.toFixed(3)) + " mm = " + (lenState.mm / MM_PER_IN).toFixed(4) + "\" (" + fracReadout.textContent.replace("″", "\"") + ")",
    "Length"
  );
});

renderLength("init");

/* ==========================================================================
   TAB 2 — WIRE GAUGE  (AWG ↔ mm)
   ========================================================================== */
const awgSlider = document.getElementById("awg-slider");
const awgVal = document.getElementById("awg-slider-val");
const wireDia = document.getElementById("wire-dia");
const wireArea = document.getElementById("wire-area");
const wireAmps = document.getElementById("wire-amps");
const wireUse = document.getElementById("wire-use");
const wireDisc = document.getElementById("wire-disc");
const wireRuler = document.getElementById("wire-ruler");

/** AWG n → diameter in mm (standard formula). */
function awgToMm(n) {
  return 0.127 * Math.pow(92, (36 - n) / 39);
}

/* Approximate single-wire chassis ratings (illustrative). */
const AMP_TABLE = {
  0: 245, 1: 211, 2: 181, 3: 158, 4: 135, 5: 118, 6: 101, 7: 89, 8: 73,
  9: 64, 10: 55, 11: 47, 12: 41, 13: 35, 14: 32, 15: 28, 16: 22, 17: 19,
  18: 16, 19: 14, 20: 11, 21: 9, 22: 7, 23: 4.7, 24: 3.5, 25: 2.7,
  26: 2.2, 27: 1.7, 28: 1.4, 29: 1.2, 30: 0.86,
};

const USE_NOTES = [
  [0, 4, "Battery banks, welding leads, off-grid inverter runs."],
  [5, 9, "Sub-panels, heavy chassis grounds, big amp power feeds."],
  [10, 12, "Mains circuits, e-bike battery leads, shop tool cords."],
  [13, 15, "Speaker runs, power supplies, appliance rewiring."],
  [16, 19, "Hookup wire, breadboard jumpers, small DC motors."],
  [20, 23, "Arduino sensor leads, LED strips, servo pigtails."],
  [24, 27, "Ribbon cable repairs, fine soldering, JST connectors."],
  [28, 30, "Magnet wire, coil winding, wearable e-textiles."],
];

const MAX_WIRE_MM = awgToMm(0); // ≈ 8.25 mm — reference for preview scale

function renderWire() {
  const n = Number(awgSlider.value);
  const d = awgToMm(n);
  const area = (Math.PI / 4) * d * d;

  awgVal.textContent = n + " AWG";
  awgSlider.setAttribute("aria-valuetext", n + " AWG, " + d.toFixed(3) + " millimeters diameter");
  wireDia.textContent = d.toFixed(3) + " mm";
  wireArea.textContent = (area < 0.1 ? area.toFixed(4) : area.toFixed(3)) + " mm²";
  const amps = AMP_TABLE[n];
  wireAmps.textContent = (amps >= 10 ? Math.round(amps) : amps) + " A";
  wireRuler.textContent = "⌀ " + d.toFixed(3) + " mm";

  const note = USE_NOTES.find(([lo, hi]) => n >= lo && n <= hi);
  wireUse.textContent = note ? note[2] : "General purpose wiring.";

  /* scale preview disc — sqrt easing keeps thin wires visible */
  const scale = Math.max(0.14, Math.sqrt(d / MAX_WIRE_MM));
  wireDisc.style.transform = "scale(" + scale.toFixed(3) + ")";
}

awgSlider.addEventListener("input", renderWire);

document.querySelectorAll("[data-awg]").forEach((chip) => {
  chip.addEventListener("click", () => {
    awgSlider.value = chip.dataset.awg;
    renderWire();
    toast(chip.dataset.awg + " AWG loaded");
  });
});

document.getElementById("copy-wire").addEventListener("click", () => {
  const n = Number(awgSlider.value);
  const d = awgToMm(n);
  copyText(
    n + " AWG = " + d.toFixed(3) + " mm dia, " + ((Math.PI / 4) * d * d).toFixed(3) + " mm²",
    "Wire gauge"
  );
});

renderWire();

/* ==========================================================================
   TAB 3 — RESISTOR COLOR CODE  (4-band)
   ========================================================================== */
const DIGIT_COLORS = [
  { name: "black", hex: "#20242a", digit: 0 },
  { name: "brown", hex: "#7a4a21", digit: 1 },
  { name: "red", hex: "#d4503e", digit: 2 },
  { name: "orange", hex: "#ff6b35", digit: 3 },
  { name: "yellow", hex: "#ffd60a", digit: 4 },
  { name: "green", hex: "#2f9e6f", digit: 5 },
  { name: "blue", hex: "#2a6fdb", digit: 6 },
  { name: "violet", hex: "#8f5bbd", digit: 7 },
  { name: "grey", hex: "#8b959e", digit: 8 },
  { name: "white", hex: "#f2f4f6", digit: 9 },
];

const MULT_COLORS = DIGIT_COLORS.map((c) => ({ ...c, mult: Math.pow(10, c.digit) })).concat([
  { name: "gold", hex: "#c9a227", mult: 0.1 },
  { name: "silver", hex: "#b9c0c6", mult: 0.01 },
]);

const TOL_COLORS = [
  { name: "brown", hex: "#7a4a21", tol: 1 },
  { name: "red", hex: "#d4503e", tol: 2 },
  { name: "gold", hex: "#c9a227", tol: 5 },
  { name: "silver", hex: "#b9c0c6", tol: 10 },
];

const BAND_SETS = [DIGIT_COLORS, DIGIT_COLORS, MULT_COLORS, TOL_COLORS];
const BAND_ROLES = ["first digit", "second digit", "multiplier", "tolerance"];

/* state = index into each band's color set  → 4.7 kΩ ±5% by default */
const bandState = [4, 7, 2, 2]; // yellow, violet, red(×100), gold

const bandEls = [0, 1, 2, 3].map((i) => document.getElementById("band-" + i));
const resValue = document.getElementById("res-value");
const resRange = document.getElementById("res-range");

function formatOhms(v) {
  if (v >= 1e6) return trimNum(v / 1e6) + " MΩ";
  if (v >= 1e3) return trimNum(v / 1e3) + " kΩ";
  if (v >= 1) return trimNum(v) + " Ω";
  return v.toFixed(2) + " Ω";
}

function trimNum(v) {
  const s = v >= 100 ? v.toFixed(1) : v.toFixed(3);
  return stripZeros(s);
}

function currentOhms() {
  const d1 = DIGIT_COLORS[bandState[0]].digit;
  const d2 = DIGIT_COLORS[bandState[1]].digit;
  const mult = MULT_COLORS[bandState[2]].mult;
  return (d1 * 10 + d2) * mult;
}

function renderResistor() {
  bandState.forEach((idx, i) => {
    const color = BAND_SETS[i][idx];
    bandEls[i].setAttribute("fill", color.hex);
    bandEls[i].setAttribute(
      "aria-label",
      "Band " + (i + 1) + ": " + BAND_ROLES[i] + ", " + color.name + ". Press Enter to cycle."
    );
  });

  const ohms = currentOhms();
  const tol = TOL_COLORS[bandState[3]].tol;
  resValue.textContent = formatOhms(ohms) + " ±" + tol + "%";
  resRange.textContent = formatOhms(ohms * (1 - tol / 100)) + " – " + formatOhms(ohms * (1 + tol / 100));

  /* sync swatch selection */
  document.querySelectorAll(".swatch-row").forEach((row, i) => {
    Array.from(row.children).forEach((sw, j) => {
      sw.setAttribute("aria-checked", String(j === bandState[i]));
      sw.tabIndex = j === bandState[i] ? 0 : -1;
    });
  });
}

/* click / keyboard cycling on SVG bands */
bandEls.forEach((el, i) => {
  const cycle = () => {
    bandState[i] = (bandState[i] + 1) % BAND_SETS[i].length;
    renderResistor();
    toast("Band " + (i + 1) + " → " + BAND_SETS[i][bandState[i]].name);
  };
  el.addEventListener("click", cycle);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      cycle();
    }
  });
});

/* build swatch rows */
BAND_SETS.forEach((set, i) => {
  const row = document.getElementById("swatches-" + i);
  set.forEach((color, j) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "swatch";
    btn.style.background = color.hex;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    btn.setAttribute(
      "aria-label",
      color.name +
        (color.digit !== undefined && i < 2 ? " (" + color.digit + ")" : "") +
        (i === 2 ? " (×" + set[j].mult + ")" : "") +
        (i === 3 ? " (±" + set[j].tol + "%)" : "")
    );
    btn.title = btn.getAttribute("aria-label");
    btn.addEventListener("click", () => {
      bandState[i] = j;
      renderResistor();
    });
    btn.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (bandState[i] + 1) % set.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (bandState[i] - 1 + set.length) % set.length;
      if (next !== null) {
        e.preventDefault();
        bandState[i] = next;
        renderResistor();
        row.children[next].focus();
      }
    });
    row.appendChild(btn);
  });
});

/* reverse lookup: ohms → bands */
const ohmsInput = document.getElementById("ohms-input");

function parseOhms(raw) {
  const s = raw.trim().toLowerCase().replace(/[ωΩ]|ohms?/g, "").trim();
  if (!s) return null;
  const m = s.match(/^(\d+(?:\.\d+)?)\s*(k|m)?$/);
  if (!m) return null;
  let v = Number(m[1]);
  if (m[2] === "k") v *= 1e3;
  if (m[2] === "m") v *= 1e6;
  return Number.isFinite(v) && v > 0 ? v : null;
}

function setBandsFromOhms(ohms) {
  /* find best 2-significant-digit representation: ohms ≈ (d1 d2) × 10^p */
  let best = null;
  for (let mi = 0; mi < MULT_COLORS.length; mi++) {
    const mult = MULT_COLORS[mi].mult;
    const code = Math.round(ohms / mult);
    if (code < 10 || code > 99) continue;
    const err = Math.abs(code * mult - ohms) / ohms;
    if (!best || err < best.err) best = { mi, code, err };
  }
  if (!best) {
    toast("Value out of 4-band range (1.0 Ω – 99 GΩ)");
    return false;
  }
  bandState[0] = Math.floor(best.code / 10);
  bandState[1] = best.code % 10;
  bandState[2] = best.mi;
  renderResistor();
  if (best.err > 0.001) {
    toast("Snapped to " + formatOhms(currentOhms()));
  } else {
    toast("Bands set to " + formatOhms(currentOhms()));
  }
  return true;
}

function applyOhmsInput() {
  const v = parseOhms(ohmsInput.value);
  ohmsInput.classList.toggle("is-bad", v === null && ohmsInput.value.trim() !== "");
  if (v === null) {
    if (ohmsInput.value.trim() !== "") toast("Could not read that value");
    return;
  }
  setBandsFromOhms(v);
}

document.getElementById("ohms-apply").addEventListener("click", applyOhmsInput);
ohmsInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applyOhmsInput();
});

document.querySelectorAll("[data-ohms]").forEach((chip) => {
  chip.addEventListener("click", () => {
    ohmsInput.value = chip.textContent.trim();
    setBandsFromOhms(Number(chip.dataset.ohms));
  });
});

document.getElementById("copy-resistor").addEventListener("click", () => {
  const bands = bandState.map((idx, i) => BAND_SETS[i][idx].name).join(" · ");
  copyText(resValue.textContent + " (" + bands + ")", "Resistor value");
});

renderResistor();
