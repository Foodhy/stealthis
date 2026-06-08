// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── State machine ────────────────────────────────────────────────────────────
// Four fixed stages. Timestamps are illustrative constants (no Date / random).
const STAGES = [
  { label: "Order confirmed", pill: "", time: "2:58 PM" },
  { label: "Preparing", pill: "is-prep", time: "3:12 PM" },
  { label: "Out for delivery", pill: "is-out", time: "3:47 PM" },
  { label: "Delivered", pill: "is-done", time: "4:24 PM" },
];

let current = 0; // index of the active stage

const stepEls = [...document.querySelectorAll(".step")];
const statusPill = document.getElementById("statusPill");
const statusText = document.getElementById("statusText");
const eta = document.getElementById("eta");
const etaLabel = document.getElementById("etaLabel");
const etaValue = document.getElementById("etaValue");
const courier = document.getElementById("courier");
const advanceBtn = document.getElementById("advanceBtn");

function render() {
  // Stepper: past = complete (with timestamp), current = highlighted, future = muted.
  stepEls.forEach((el, i) => {
    const timeEl = el.querySelector(".step-time");
    el.classList.toggle("is-complete", i < current);
    el.classList.toggle("is-current", i === current);
    if (i < current) {
      timeEl.textContent = `Completed · ${STAGES[i].time}`;
      timeEl.hidden = false;
    } else {
      timeEl.hidden = true;
    }
  });

  // Status pill.
  const stage = STAGES[current];
  statusText.textContent = stage.label;
  statusPill.className = `status-pill ${stage.pill}`.trim();

  // ETA panel.
  if (current === STAGES.length - 1) {
    eta.classList.add("is-done");
    etaLabel.textContent = "Delivered";
    etaValue.textContent = `Handed off at ${stage.time}`;
  } else {
    eta.classList.remove("is-done");
    etaLabel.textContent = "Estimated arrival";
    etaValue.textContent = "Arriving by 4:30 PM today";
  }

  // Courier card only while out for delivery.
  courier.hidden = current !== 2;

  // Advance button locks at the final stage.
  if (current === STAGES.length - 1) {
    advanceBtn.textContent = "Delivered ✓";
    advanceBtn.disabled = true;
  }
}

function advance() {
  if (current >= STAGES.length - 1) return;
  current += 1;
  render();
  if (current === STAGES.length - 1) {
    showToast("Delivered — your prescription has arrived.");
  } else {
    showToast(`Status updated · ${STAGES[current].label}.`);
  }
}

advanceBtn.addEventListener("click", advance);

document.getElementById("contactBtn").addEventListener("click", () => {
  showToast("Calling Marco — your courier will pick up shortly.");
});

render();
