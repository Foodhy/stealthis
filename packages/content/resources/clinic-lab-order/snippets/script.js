// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2800);
}

// ── Elements ─────────────────────────────────────────────────────────────────
const form = document.getElementById("order-form");
const catalog = document.getElementById("catalog-body");
const selectedList = document.getElementById("selected-list");
const selectedEmpty = document.getElementById("selected-empty");
const selectedPill = document.getElementById("selected-pill");
const sumCount = document.getElementById("sum-count");
const sumPriority = document.getElementById("sum-priority");
const sumFasting = document.getElementById("sum-fasting");
const fastingInput = document.getElementById("fasting");
const fastingSub = document.getElementById("fasting-sub");
const statNote = document.getElementById("stat-note");
const formError = document.getElementById("form-error");
const signBtn = document.getElementById("sign-btn");
const signed = document.getElementById("signed");
const signedSub = document.getElementById("signed-sub");
const filter = document.getElementById("filter");
const clearFilter = document.getElementById("clear-filter");
const noResults = document.getElementById("no-results");
const noResultsTerm = document.getElementById("no-results-term");

let priority = "routine";
let fastingManual = false; // true once the clinician overrides the auto flag

// ── Selected tests sync ──────────────────────────────────────────────────────
function checkedTests() {
  return [...catalog.querySelectorAll("[data-test]:checked")].map((box) => {
    const li = box.closest(".test");
    return {
      box,
      name: li.dataset.name,
      code: li.dataset.code,
      fasting: li.dataset.fasting === "1",
    };
  });
}

function renderSelected() {
  const tests = checkedTests();

  selectedList.innerHTML = "";
  tests.forEach((t) => {
    const item = document.createElement("li");
    item.className = "selected-item";
    item.innerHTML =
      '<span class="si-text">' +
      '<span class="si-name">' +
      t.name +
      "</span> " +
      '<span class="si-code">' +
      t.code +
      "</span>" +
      "</span>" +
      '<button type="button" class="si-remove" aria-label="Remove ' +
      t.name +
      '">&times;</button>';
    item.querySelector(".si-remove").addEventListener("click", () => {
      t.box.checked = false;
      renderSelected();
    });
    selectedList.appendChild(item);
  });

  const n = tests.length;
  selectedEmpty.hidden = n > 0;
  selectedPill.textContent = n;
  selectedPill.classList.toggle("has", n > 0);
  sumCount.textContent = n;

  // Auto-derive fasting flag from selection unless clinician overrode it.
  const anyFasting = tests.some((t) => t.fasting);
  if (!fastingManual) {
    fastingInput.checked = anyFasting;
  }
  updateFasting();
}

// ── Fasting flag ─────────────────────────────────────────────────────────────
function updateFasting() {
  const on = fastingInput.checked;
  sumFasting.textContent = on ? "Required" : "Not required";
  const anyFasting = checkedTests().some((t) => t.fasting);
  if (on && anyFasting) {
    fastingSub.textContent = "Selection includes fasting tests — patient must fast 8–12 h.";
  } else if (on) {
    fastingSub.textContent = "Fasting requested for this order.";
  } else {
    fastingSub.textContent = "No fasting needed for current selection.";
  }
}

fastingInput.addEventListener("change", () => {
  fastingManual = true;
  updateFasting();
});

// ── Priority toggle ──────────────────────────────────────────────────────────
const segButtons = form.querySelectorAll(".seg-btn");
segButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    priority = btn.dataset.priority;
    segButtons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-checked", String(active));
    });
    const isStat = priority === "stat";
    statNote.hidden = !isStat;
    sumPriority.textContent = isStat ? "STAT" : "Routine";
    sumPriority.classList.toggle("stat", isStat);
  });
});

// ── Live filter ──────────────────────────────────────────────────────────────
filter.addEventListener("input", () => {
  const term = filter.value.trim().toLowerCase();
  clearFilter.hidden = term.length === 0;
  let total = 0;

  catalog.querySelectorAll(".cat-group").forEach((group) => {
    let visible = 0;
    group.querySelectorAll(".test").forEach((test) => {
      const hay = (test.dataset.name + " " + test.dataset.code).toLowerCase();
      const match = hay.includes(term);
      test.hidden = !match;
      if (match) visible++;
    });
    group.hidden = visible === 0;
    total += visible;
  });

  noResults.hidden = total > 0;
  noResultsTerm.textContent = filter.value.trim();
});

clearFilter.addEventListener("click", () => {
  filter.value = "";
  filter.dispatchEvent(new Event("input"));
  filter.focus();
});

// ── Checkbox changes ─────────────────────────────────────────────────────────
catalog.addEventListener("change", (e) => {
  if (e.target.matches("[data-test]")) {
    formError.hidden = true;
    renderSelected();
  }
});

// ── Sign & send ──────────────────────────────────────────────────────────────
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const tests = checkedTests();
  if (tests.length === 0) {
    formError.hidden = false;
    showToast("Add at least one test before signing.");
    return;
  }

  formError.hidden = true;
  signBtn.hidden = true;
  signed.hidden = false;
  form.classList.add("is-locked");

  const label = priority === "stat" ? "STAT" : "Routine";
  signedSub.textContent =
    "Dr. Lena Okafor · " + tests.length + " test" + (tests.length === 1 ? "" : "s") + " · " + label;
  showToast(label + " order signed — sent to Northpoint Lab.");
});

// ── Amend (unlock) ───────────────────────────────────────────────────────────
document.getElementById("amend").addEventListener("click", () => {
  signed.hidden = true;
  signBtn.hidden = false;
  form.classList.remove("is-locked");
  showToast("Order reopened for editing.");
});

// ── Init ─────────────────────────────────────────────────────────────────────
renderSelected();
