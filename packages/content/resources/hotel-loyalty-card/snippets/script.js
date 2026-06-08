// ── Helpers ──
const $ = (id) => document.getElementById(id);
const toast = $("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}
const fmtPts = (n) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

// ── Tier data ──
const TIERS = {
  silver: {
    label: "Silver",
    threshold: 10000, // pts to reach this tier
    nextTier: "gold",
    nextLabel: "Gold",
    nextThreshold: 25000,
    benefits: [
      "Late checkout (12:00) on request",
      "10% discount on spa treatments",
      "Complimentary bottled water on arrival",
      "Member-rate room pricing",
    ],
    stays_for_next: 20, // approx nights to next tier
  },
  gold: {
    label: "Gold",
    threshold: 25000,
    nextTier: "platinum",
    nextLabel: "Platinum",
    nextThreshold: 50000,
    benefits: [
      "Guaranteed late checkout (13:00)",
      "20% discount on spa & dining",
      "Complimentary room upgrade (subject to availability)",
      "Breakfast included (2 guests)",
      "Welcome amenity on arrival",
    ],
    stays_for_next: 11,
  },
  platinum: {
    label: "Platinum",
    threshold: 50000,
    nextTier: null,
    nextLabel: null,
    nextThreshold: null,
    benefits: [
      "Suite upgrade guaranteed on request",
      "Complimentary airport transfer",
      "Full breakfast + afternoon tea included",
      "Private concierge line",
      "Complimentary spa access daily",
      "Exclusive floor lounge access",
    ],
    stays_for_next: 0,
  },
};

// ── State ──
let currentTier = "gold";
let points = 18450;
const POINTS_PER_STAY = 1850; // 3 nights × ~617 pts/night

// ── Initial activity ──
let activities = [
  { name: "Grand Via stay · 3 nights", date: "09 Jun 2026", pts: +1850, id: "a1" },
  { name: "Spa treatment", date: "07 Jun 2026", pts: +220, id: "a2" },
  { name: "Room service", date: "06 Jun 2026", pts: +75, id: "a3" },
  { name: "Palermo stay · 2 nights", date: "28 May 2026", pts: +1230, id: "a4" },
  { name: "Points redemption", date: "20 May 2026", pts: -500, id: "a5" },
];

// ── Render card ──
function renderCard() {
  const tier = TIERS[currentTier];
  const card = $("loyaltyCard");
  card.dataset.tier = currentTier;
  $("tierBadge").textContent = tier.label;
  $("pointsBal").textContent = fmtPts(points);
}

// ── Render progress ──
function renderProgress() {
  const tier = TIERS[currentTier];

  if (!tier.nextTier) {
    // Max tier reached
    $("progLabel").textContent = "Maximum tier reached";
    $("progPct").textContent = "100%";
    $("progressFill").style.width = "100%";
    $("nightsLeft").textContent = "All benefits unlocked";
    $("pointsLeft").textContent = "";
    return;
  }

  const rangeBottom = tier.threshold;
  const rangeTop = tier.nextThreshold;
  const progress = Math.min(1, Math.max(0, (points - rangeBottom) / (rangeTop - rangeBottom)));
  const pct = Math.round(progress * 100);
  const ptsLeft = Math.max(0, rangeTop - points);
  const nightsLeft = Math.max(
    0,
    tier.stays_for_next - Math.floor((points - rangeBottom) / (POINTS_PER_STAY / 3))
  );

  $("progLabel").textContent = `Progress to ${tier.nextLabel}`;
  $("progPct").textContent = `${pct}%`;
  $("progressFill").style.width = `${pct}%`;
  const prog = document.querySelector(".progress-track");
  if (prog) {
    prog.setAttribute("aria-valuenow", pct);
  }
  $("nightsLeft").textContent =
    nightsLeft > 0
      ? `${nightsLeft} night${nightsLeft !== 1 ? "s" : ""} to go`
      : "Promotion imminent!";
  $("pointsLeft").textContent = ptsLeft > 0 ? `${fmtPts(ptsLeft)} pts needed` : "Threshold reached";
}

// ── Render benefits ──
function renderBenefits() {
  const tier = TIERS[currentTier];
  $("benefitsList").innerHTML = tier.benefits.map((b) => `<li>${b}</li>`).join("");
}

// ── Render activity ──
function renderActivity() {
  $("activityList").innerHTML = activities
    .slice(0, 5)
    .map(
      (a) => `
      <li class="activity-item">
        <div class="ai-info">
          <span class="ai-name">${a.name}</span>
          <span class="ai-date">${a.date}</span>
        </div>
        <span class="ai-pts ${a.pts > 0 ? "positive" : "negative"}">${a.pts > 0 ? "+" : ""}${fmtPts(a.pts)} pts</span>
      </li>`
    )
    .join("");
}

// ── Full render ──
function render() {
  renderCard();
  renderProgress();
  renderBenefits();
  renderActivity();
}

// ── Tier switcher ──
document.querySelectorAll(".ts-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetTier = btn.dataset.tier;
    // Update button state
    document.querySelectorAll(".ts-btn").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    // Set points to midpoint of tier range for demonstration
    currentTier = targetTier;
    const tier = TIERS[targetTier];
    if (targetTier === "silver") {
      points = 14500;
    } else if (targetTier === "gold") {
      points = 18450;
    } else {
      points = 52000;
    }
    render();
    showToast(`Viewing ${tier.label} tier — ${fmtPts(points)} pts`);
  });
});

// ── Simulate a stay ──
$("simulateBtn").addEventListener("click", () => {
  const btn = $("simulateBtn");
  btn.disabled = true;

  const added = POINTS_PER_STAY;
  points += added;

  // Add new activity
  const today = "09 Jun 2026";
  activities.unshift({
    name: "Simulated stay · 3 nights",
    date: today,
    pts: added,
    id: `sim${Date.now()}`,
  });

  // Check for promotion
  const tier = TIERS[currentTier];
  if (tier.nextTier && points >= tier.nextThreshold) {
    const oldLabel = tier.label;
    currentTier = tier.nextTier;
    // Update switcher button
    document.querySelectorAll(".ts-btn").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.tier === currentTier);
    });
    render();
    showToast(`🎉 Congratulations! Promoted from ${oldLabel} to ${TIERS[currentTier].label}!`);
  } else {
    render();
    showToast(`+${fmtPts(added)} pts added — ${fmtPts(points)} total`);
  }

  setTimeout(() => (btn.disabled = false), 800);
});

// ── Init ──
render();
