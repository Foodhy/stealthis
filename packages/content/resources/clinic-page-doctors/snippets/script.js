// ── Elements ─────────────────────────────────────────────────────────────────
const searchInput = document.getElementById("search");
const specialtySelect = document.getElementById("specialty");
const grid = document.getElementById("grid");
const cards = Array.from(grid.querySelectorAll(".doc"));
const resultLine = document.getElementById("result-line");
const emptyEl = document.getElementById("empty");
const clearBtn = document.getElementById("clear");
const toast = document.getElementById("toast");

const TOTAL = cards.length;

// ── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Filtering ────────────────────────────────────────────────────────────────
function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const specialty = specialtySelect.value;
  let shown = 0;

  cards.forEach((card) => {
    const name = card.dataset.name.toLowerCase();
    const matchesName = !query || name.includes(query);
    const matchesSpecialty = specialty === "all" || card.dataset.specialty === specialty;
    const visible = matchesName && matchesSpecialty;
    card.hidden = !visible;
    if (visible) shown++;
  });

  resultLine.innerHTML = 'Showing <span id="shown">' + shown + "</span> of " + TOTAL + " doctors";
  grid.hidden = shown === 0;
  emptyEl.hidden = shown !== 0;
}

searchInput.addEventListener("input", applyFilters);
specialtySelect.addEventListener("change", applyFilters);

// ── Clear filters ────────────────────────────────────────────────────────────
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  specialtySelect.value = "all";
  applyFilters();
  searchInput.focus();
});

// ── Book / waitlist actions ──────────────────────────────────────────────────
grid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action='book']");
  if (!btn) return;
  const card = btn.closest(".doc");
  const name = "Dr. " + card.dataset.name;
  if (card.dataset.status === "waitlist") {
    btn.textContent = "On waitlist ✓";
    btn.disabled = true;
    showToast(name + " — you've been added to the waitlist. We'll reach out soon.");
  } else {
    showToast("Requesting a visit with " + name + " — choose a time next.");
  }
});

// ── Init ─────────────────────────────────────────────────────────────────────
applyFilters();
