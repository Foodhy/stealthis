// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Build the range bars ─────────────────────────────────────────────────────
// Each .r-bar has data-low / data-high (reference interval) and data-value.
// We map the value onto a padded scale so the in-range band (18%–82%, matching
// the ::before band in CSS) lines up with low..high, and out-of-range values
// land in the visible margins.
function buildBars() {
  const PAD = 0.18; // matches CSS ::before inset
  document.querySelectorAll(".r-bar").forEach((bar) => {
    const low = parseFloat(bar.dataset.low);
    const high = parseFloat(bar.dataset.high);
    const value = parseFloat(bar.dataset.value);
    const span = high - low || 1;

    // position within the [low, high] band, clamped to a sensible margin
    let t = (value - low) / span; // 0 at low, 1 at high
    t = Math.max(-0.85, Math.min(1.85, t)); // allow drift into the margins
    const pct = (PAD + t * (1 - 2 * PAD)) * 100;

    const marker = document.createElement("span");
    marker.className = "r-marker";
    marker.style.left = Math.max(2, Math.min(98, pct)) + "%";
    const status = bar.closest(".row").dataset.status;
    marker.setAttribute(
      "title",
      `${value} (${status === "normal" ? "within" : status + ", outside"} reference range)`
    );
    bar.appendChild(marker);
  });
}

// ── Per-panel flagged counts (derive from DOM so they stay truthful) ─────────
function refreshPanelCounts() {
  document.querySelectorAll(".panel").forEach((panel) => {
    const flagged = panel.querySelectorAll('.row[data-status="high"], .row[data-status="low"]').length;
    const pill = panel.querySelector("[data-flagcount]");
    if (!pill) return;
    pill.textContent = flagged === 0 ? "All normal" : `${flagged} flagged`;
    pill.classList.toggle("is-clear", flagged === 0);
  });
}

// ── Global flagged count + filter ────────────────────────────────────────────
const oorToggle = document.getElementById("filter-oor");
const oorCount = document.getElementById("oor-count");
const emptyMsg = document.getElementById("empty");

function totalFlagged() {
  return document.querySelectorAll('.row[data-status="high"], .row[data-status="low"]').length;
}

function applyFilter() {
  const onlyOOR = oorToggle.checked;
  let visiblePanels = 0;

  document.querySelectorAll(".panel").forEach((panel) => {
    let visibleRows = 0;
    panel.querySelectorAll(".row").forEach((row) => {
      const flagged = row.dataset.status !== "normal";
      const show = !onlyOOR || flagged;
      row.classList.toggle("is-hidden", !show);
      if (show) visibleRows++;
    });
    // Hide a whole panel when filtering and none of its rows qualify.
    const hidePanel = onlyOOR && visibleRows === 0;
    panel.classList.toggle("is-hidden", hidePanel);
    if (!hidePanel) visiblePanels++;
  });

  emptyMsg.hidden = !(onlyOOR && visiblePanels === 0);
}

function refreshCounts() {
  const n = totalFlagged();
  oorCount.textContent = n === 0 ? "All normal" : `${n} flagged`;
  oorCount.style.background = n === 0 ? "rgba(47,158,111,0.14)" : "rgba(212,80,62,0.12)";
  oorCount.style.color = n === 0 ? "var(--ok)" : "var(--danger)";
}

oorToggle.addEventListener("change", () => {
  applyFilter();
  showToast(
    oorToggle.checked
      ? `Showing ${totalFlagged()} out-of-range result${totalFlagged() === 1 ? "" : "s"}.`
      : "Showing all results."
  );
});

// ── Collapsible panels ───────────────────────────────────────────────────────
document.querySelectorAll(".panel-head").forEach((head) => {
  head.addEventListener("click", () => {
    const panel = head.closest(".panel");
    const open = panel.classList.toggle("is-open");
    head.setAttribute("aria-expanded", String(open));
  });
});

// ── Header actions ───────────────────────────────────────────────────────────
document.querySelector(".head-actions").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  if (btn.dataset.action === "download") {
    showToast("Preparing your lab report PDF — it will download shortly.");
  } else if (btn.dataset.action === "share") {
    showToast("Share link copied. It expires in 7 days for your privacy.");
  }
});

// ── Init ─────────────────────────────────────────────────────────────────────
buildBars();
refreshPanelCounts();
refreshCounts();
applyFilter();
