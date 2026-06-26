// ── Case Results: filter by practice area + sort by amount/year ──────────────
const list = document.getElementById("results");
const chips = Array.from(document.querySelectorAll(".chip"));
const sortSelect = document.getElementById("sort-select");
const countEl = document.getElementById("count");
const emptyEl = document.getElementById("empty");

const cases = Array.from(list.querySelectorAll(".case"));
let activeFilter = "all";

function applyFilter() {
  let visible = 0;
  cases.forEach((card) => {
    const match = activeFilter === "all" || card.dataset.area === activeFilter;
    card.classList.toggle("is-hidden", !match);
    if (match) visible++;
  });
  countEl.textContent = visible;
  emptyEl.hidden = visible !== 0;
}

function applySort() {
  const value = sortSelect.value;
  const sorted = [...cases].sort((a, b) => {
    const amtA = Number(a.dataset.amount);
    const amtB = Number(b.dataset.amount);
    const yrA = Number(a.dataset.year);
    const yrB = Number(b.dataset.year);
    switch (value) {
      case "amount-asc":
        return amtA - amtB;
      case "year-desc":
        return yrB - yrA || amtB - amtA;
      case "year-asc":
        return yrA - yrB || amtB - amtA;
      case "amount-desc":
      default:
        return amtB - amtA;
    }
  });
  // Re-append in sorted order (keeps filter classes intact).
  sorted.forEach((card) => list.appendChild(card));
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => {
      const on = c === chip;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    activeFilter = chip.dataset.filter;
    applyFilter();
  });
});

sortSelect.addEventListener("change", applySort);

// Initial paint
applySort();
applyFilter();
