// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

const rows = document.getElementById("rows");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
const tabs = [...document.querySelectorAll(".tab")];

let activeFilter = "all";

// ── Status flow ──────────────────────────────────────────────────────────────
// Each status carries its display label, the action button to show, and the
// status it advances to on click.
const FLOW = {
  verify: { label: "To verify", next: "ready", action: "Verify", cls: "btn-verify" },
  ready: { label: "Ready", next: "dispensed", action: "Dispense", cls: "btn-dispense" },
  dispensed: { label: "Dispensed", next: null },
};

// ── Live counts from current DOM state ───────────────────────────────────────
function refreshCounts() {
  const all = rows.querySelectorAll(".row");
  const tally = { all: all.length, verify: 0, ready: 0, dispensed: 0 };
  all.forEach((r) => (tally[r.dataset.status] += 1));
  document.querySelectorAll(".count").forEach((c) => {
    c.textContent = tally[c.dataset.count];
  });
}

// ── Apply active filter + search query ───────────────────────────────────────
function applyView() {
  const q = search.value.trim().toLowerCase();
  let visible = 0;
  rows.querySelectorAll(".row").forEach((row) => {
    const matchesFilter = activeFilter === "all" || row.dataset.status === activeFilter;
    const matchesQuery = !q || row.dataset.search.includes(q);
    const show = matchesFilter && matchesQuery;
    row.hidden = !show;
    if (show) visible += 1;
  });
  empty.hidden = visible !== 0;
}

// ── Tab switching ────────────────────────────────────────────────────────────
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeFilter = tab.dataset.filter;
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    applyView();
  });
});

// ── Advance a row's status (Verify → Dispense) ───────────────────────────────
function advance(row) {
  const current = FLOW[row.dataset.status];
  if (!current || !current.next) return;
  const name = row.querySelector(".name").textContent;
  const drug = row.querySelector(".drug").firstChild.textContent.trim();

  const nextKey = current.next;
  const next = FLOW[nextKey];
  row.dataset.status = nextKey;

  const status = row.querySelector(".status");
  status.className = "status status-" + nextKey;
  status.textContent = next.label;
  status.setAttribute("aria-label", "Status: " + next.label.toLowerCase());

  const slot = row.querySelector(".row-action");
  if (next.next) {
    slot.innerHTML =
      '<button class="btn ' + next.cls + '" data-action="advance">' + next.action + "</button>";
    showToast(name + " · " + drug + " verified — ready to dispense.");
  } else {
    row.classList.add("is-dispensed");
    slot.innerHTML =
      '<span class="done-mark" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24"><polyline points="4 12.5 9.5 18 20 6" /></svg>' +
      "Handed to patient</span>";
    showToast(name + " · " + drug + " dispensed and logged.");
  }

  row.classList.remove("just-advanced");
  void row.offsetWidth;
  row.classList.add("just-advanced");

  refreshCounts();
  applyView();
}

// ── Wiring ───────────────────────────────────────────────────────────────────
rows.addEventListener("click", (e) => {
  const btn = e.target.closest('[data-action="advance"]');
  if (!btn) return;
  advance(btn.closest(".row"));
});

search.addEventListener("input", applyView);

refreshCounts();
applyView();
