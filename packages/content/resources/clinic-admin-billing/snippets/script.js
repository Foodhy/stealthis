// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Elements ─────────────────────────────────────────────────────────────────
const body = document.getElementById("claims-body");
const rows = Array.from(body.querySelectorAll("tr"));
const filters = Array.from(document.querySelectorAll(".filter"));
const searchInput = document.getElementById("search");
const emptyMsg = document.getElementById("empty");
const resultCount = document.getElementById("result-count");

let activeFilter = "all";

// ── Live counts per status ───────────────────────────────────────────────────
function refreshCounts() {
  const counts = { all: rows.length, paid: 0, submitted: 0, pending: 0, denied: 0 };
  rows.forEach((r) => {
    counts[r.dataset.status] = (counts[r.dataset.status] || 0) + 1;
  });
  document.querySelectorAll(".fcount").forEach((el) => {
    el.textContent = counts[el.dataset.count] ?? 0;
  });
}

// ── Apply filter + search ────────────────────────────────────────────────────
function applyView() {
  const q = searchInput.value.trim().toLowerCase();
  let shown = 0;
  rows.forEach((r) => {
    const matchesFilter = activeFilter === "all" || r.dataset.status === activeFilter;
    const matchesSearch = !q || r.textContent.toLowerCase().includes(q);
    const visible = matchesFilter && matchesSearch;
    r.hidden = !visible;
    if (visible) shown++;
  });
  emptyMsg.hidden = shown !== 0;
  resultCount.textContent = `Showing ${shown} of ${rows.length} claims`;
}

// ── Filter tabs ──────────────────────────────────────────────────────────────
filters.forEach((f) => {
  f.addEventListener("click", () => {
    filters.forEach((other) => {
      const active = other === f;
      other.classList.toggle("is-active", active);
      other.setAttribute("aria-selected", String(active));
    });
    activeFilter = f.dataset.filter;
    applyView();
  });
});

// ── Search ───────────────────────────────────────────────────────────────────
searchInput.addEventListener("input", applyView);

// ── Resubmit denied claims ───────────────────────────────────────────────────
body.addEventListener("click", (e) => {
  const btn = e.target.closest('[data-action="resubmit"]');
  if (!btn) return;
  const row = btn.closest("tr");
  const claim = row.querySelector(".mono").textContent;
  const patient = row.children[1].textContent;

  // Move the claim back into the Submitted queue.
  row.dataset.status = "submitted";
  const pill = row.querySelector(".pill");
  pill.className = "pill submitted";
  pill.textContent = "Submitted";
  btn.remove();

  refreshCounts();
  applyView();
  showToast(`${claim} resubmitted to payer · ${patient}`);
});

// ── Init ─────────────────────────────────────────────────────────────────────
refreshCounts();
applyView();
