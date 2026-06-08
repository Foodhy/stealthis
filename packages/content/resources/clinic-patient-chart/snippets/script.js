// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Tab switching ────────────────────────────────────────────────────────────
const tabs = Array.from(document.querySelectorAll(".tab"));
const panels = Array.from(document.querySelectorAll(".panel"));

function activateTab(name) {
  for (const tab of tabs) {
    const on = tab.dataset.tab === name;
    tab.classList.toggle("is-active", on);
    tab.setAttribute("aria-selected", on ? "true" : "false");
  }
  for (const panel of panels) {
    const on = panel.dataset.panel === name;
    panel.classList.toggle("is-active", on);
    panel.hidden = !on;
  }
}

document.querySelector(".tabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  activateTab(tab.dataset.tab);
});

// ── Allergy alert: dismiss / re-open ─────────────────────────────────────────
const alert = document.getElementById("allergyAlert");
const alertClose = document.getElementById("alertClose");
const alertReopen = document.getElementById("alertReopen");

alertClose.addEventListener("click", () => {
  alert.hidden = true;
  alertReopen.hidden = false;
  showToast("Allergy alert collapsed — allergies remain on file.");
});

alertReopen.addEventListener("click", () => {
  alert.hidden = false;
  alertReopen.hidden = true;
  alertReopen.blur();
});

// ── Print chart ──────────────────────────────────────────────────────────────
document.getElementById("printBtn").addEventListener("click", () => {
  showToast("Preparing chart for print — opening the print dialog…");
});
