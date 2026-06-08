// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2800);
}

const list = document.getElementById("list");
const cards = () => Array.from(list.querySelectorAll(".card"));
const checkIcon =
  '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">' +
  '<path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" ' +
  'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// ── Per-state metadata ───────────────────────────────────────────────────────
const BADGE = {
  active: { cls: "badge ok", text: "Active" },
  "needs-refill": { cls: "badge warn", text: "Needs refill" },
  requested: { cls: "badge requested", text: "Refill requested" },
  completed: { cls: "badge done", text: "Course complete" },
};

// ── Live counts + filter visibility ──────────────────────────────────────────
function matchesFilter(state, filter) {
  if (filter === "all") return true;
  if (filter === "active") return state === "active" || state === "requested";
  if (filter === "needs-refill") return state === "needs-refill";
  return true;
}

function currentFilter() {
  return document.querySelector(".filter.is-active").dataset.filter;
}

function isEligible(card) {
  return (
    card.dataset.state === "needs-refill" &&
    Number(card.querySelector("[data-refills]").textContent) > 0
  );
}

function refreshCounts() {
  const all = cards();
  const set = (id, n) => (document.getElementById(id).textContent = n);

  set("count-all", all.length);
  set(
    "count-active",
    all.filter((c) => matchesFilter(c.dataset.state, "active")).length
  );
  set(
    "count-needs-refill",
    all.filter((c) => c.dataset.state === "needs-refill").length
  );

  const eligible = all.filter(isEligible).length;
  set("eligible-count", eligible);
  const refillAll = document.getElementById("refill-all");
  refillAll.disabled = eligible === 0;
}

function applyFilter() {
  const filter = currentFilter();
  let visible = 0;
  cards().forEach((card) => {
    const show = matchesFilter(card.dataset.state, filter);
    card.hidden = !show;
    if (show) visible++;
  });
  document.getElementById("empty").hidden = visible !== 0;
}

// ── Filter tabs ──────────────────────────────────────────────────────────────
document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((f) => {
      const active = f === btn;
      f.classList.toggle("is-active", active);
      f.setAttribute("aria-selected", String(active));
    });
    applyFilter();
  });
});

// ── Request a single refill (pending → requested) ────────────────────────────
function requestRefill(card, { silent } = {}) {
  if (!isEligible(card)) return false;

  const refillsEl = card.querySelector("[data-refills]");
  const left = Number(refillsEl.textContent) - 1;
  refillsEl.textContent = left;
  refillsEl.classList.toggle("low", left <= 2);

  card.dataset.state = "requested";
  card.classList.remove("needs-refill");

  const badge = card.querySelector("[data-badge]");
  badge.className = BADGE.requested.cls;
  badge.textContent = BADGE.requested.text;

  // Reset the warn-styled due date now that it's handled.
  const due = card.querySelector(".warn-text");
  if (due) due.classList.remove("warn-text");

  const btn = card.querySelector("[data-action='request']");
  btn.classList.add("is-requested");
  btn.disabled = true;
  btn.innerHTML = checkIcon + "Requested";

  const name = card.querySelector("h2").firstChild.textContent.trim();
  if (!silent) {
    showToast(`Refill requested for ${name} — your care team will review it.`);
  }
  return name;
}

// ── Refill all eligible at once ──────────────────────────────────────────────
function refillAll() {
  const eligible = cards().filter(isEligible);
  if (eligible.length === 0) return;
  eligible.forEach((card) => requestRefill(card, { silent: true }));
  refreshCounts();
  applyFilter();
  showToast(
    `${eligible.length} refill request${eligible.length > 1 ? "s" : ""} sent ` +
      `to your care team.`
  );
}

// ── Event delegation ─────────────────────────────────────────────────────────
list.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action='request']");
  if (!btn || btn.disabled) return;
  const card = btn.closest(".card");
  const requested = requestRefill(card);
  if (requested) {
    refreshCounts();
    applyFilter();
    card.classList.remove("just-requested");
    void card.offsetWidth; // restart animation
    card.classList.add("just-requested");
  }
});

document.getElementById("refill-all").addEventListener("click", refillAll);

// ── Init ─────────────────────────────────────────────────────────────────────
refreshCounts();
applyFilter();
