const SIZES = [
  { key: "small", px: 13, pct: "81%" },
  { key: "default", px: 16, pct: "100%" },
  { key: "large", px: 20, pct: "125%" },
  { key: "xlarge", px: 24, pct: "150%" },
];

let currentIdx = 1; // default

function apply(idx) {
  currentIdx = Math.max(0, Math.min(SIZES.length - 1, idx));
  const size = SIZES[currentIdx];

  document.documentElement.style.setProperty("--base-size", size.px + "px");
  document.getElementById("fscCurrent").textContent = size.pct;

  document.querySelectorAll(".fsc-step").forEach((btn, i) => {
    btn.classList.toggle("active", i === currentIdx);
  });

  document.getElementById("fscDecrease").disabled = currentIdx === 0;
  document.getElementById("fscIncrease").disabled = currentIdx === SIZES.length - 1;

  // Persist
  localStorage.setItem("fsc-size", size.key);

  // Announce to screen readers
  const announcer = document.getElementById("fscCurrent");
  announcer.textContent = `${size.pct} font size`;
}

document.getElementById("fscDecrease").addEventListener("click", () => apply(currentIdx - 1));
document.getElementById("fscIncrease").addEventListener("click", () => apply(currentIdx + 1));
document.getElementById("fscReset").addEventListener("click", () => apply(1));

document.querySelectorAll(".fsc-step").forEach((btn, i) => {
  btn.addEventListener("click", () => apply(i));
});

// Restore from storage
const saved = localStorage.getItem("fsc-size");
if (saved) {
  const idx = SIZES.findIndex((s) => s.key === saved);
  if (idx !== -1) apply(idx);
} else {
  apply(1);
}
