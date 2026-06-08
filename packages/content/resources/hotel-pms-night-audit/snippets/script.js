// ── Revenue by department (sums to €31,420 total revenue KPI) ─────────────────
const DEPTS = [
  { name: "Rooms", amount: 24288 },
  { name: "F&B · Restaurant", amount: 4182 },
  { name: "Spa & Wellness", amount: 1476 },
  { name: "Bar & Lounge", amount: 892 },
  { name: "Minibar", amount: 344 },
  { name: "Parking", amount: 210 },
  { name: "Laundry", amount: 28 },
];

const eur = (n) =>
  "€" + n.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ── Render departments ────────────────────────────────────────────────────────
const dept = document.getElementById("dept");
const maxDept = Math.max(...DEPTS.map((d) => d.amount));

dept.innerHTML = DEPTS.map(
  (d) => `
    <li>
      <span class="d-name">${d.name}</span>
      <span class="d-amt">${eur(d.amount)}</span>
      <span class="d-bar"><span data-pct="${(d.amount / maxDept) * 100}"></span></span>
    </li>`
).join("");

// Animate bars in after first paint
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    dept.querySelectorAll(".d-bar > span").forEach((bar) => {
      bar.style.width = bar.dataset.pct + "%";
    });
  });
});

// ── Toast ─────────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 1800);
}

// ── Discrepancy actions ───────────────────────────────────────────────────────
const discr = document.getElementById("discr");
const discN = document.getElementById("discN");

function updateDiscCount() {
  const open = discr.querySelectorAll(
    "li.warn:not(.is-resolved), li.info:not(.is-resolved)"
  ).length;
  if (open === 0) {
    discN.textContent = "All clear";
    discN.classList.remove("warn");
    discN.classList.add("ok");
  } else {
    discN.textContent = `${open} to review`;
  }
}

discr.addEventListener("click", (e) => {
  const btn = e.target.closest("button.mini");
  if (!btn) return;
  const li = btn.closest("li");
  const label = li.querySelector("strong").textContent;
  const verb = btn.textContent.trim();
  li.classList.add("is-resolved");
  btn.disabled = true;
  btn.textContent = "Done";
  showToast(`${verb} · ${label}`);
  updateDiscCount();
});

// ── Topbar ghost actions ──────────────────────────────────────────────────────
document
  .querySelectorAll(".topactions .ghost")
  .forEach((b) => b.addEventListener("click", () => showToast(b.textContent.trim())));

// ── Run audit pipeline ────────────────────────────────────────────────────────
const runBtn = document.getElementById("run");
const stages = Array.from(document.querySelectorAll("#pipeline li"));
const STAGE_LABELS = ["①", "②", "③", "④"];
let auditDone = false;

function runStage(i) {
  if (i >= stages.length) {
    finishAudit();
    return;
  }
  const li = stages[i];
  li.classList.add("is-running");
  li.querySelector(".state").textContent = "running…";

  setTimeout(() => {
    li.classList.remove("is-running");
    li.classList.add("is-done");
    li.querySelector(".stg").textContent = "✓";
    li.querySelector(".state").textContent = "posted";
    runStage(i + 1);
  }, 900);
}

function finishAudit() {
  auditDone = true;
  // Roll the business date displayed in the header to the next day.
  const bd = document.getElementById("bd");
  const nextBd = document.getElementById("nextBd");
  if (bd && nextBd) bd.textContent = nextBd.textContent;

  runBtn.textContent = "Audit complete ✓";
  showToast("Night audit complete · business date rolled");
}

runBtn.addEventListener("click", () => {
  if (auditDone) return;
  runBtn.disabled = true;
  runBtn.textContent = "Running audit…";
  // Reset any prior state, then run.
  stages.forEach((li, i) => {
    li.classList.remove("is-running", "is-done");
    li.querySelector(".stg").textContent = STAGE_LABELS[i];
    li.querySelector(".state").textContent = "queued";
  });
  runStage(0);
});

updateDiscCount();
