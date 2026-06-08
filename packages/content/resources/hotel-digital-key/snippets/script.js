// ── Helpers ──
const $ = (id) => document.getElementById(id);
const toast = $("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Live clock in status bar ──
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  $("statusTime").textContent = `${hh}:${mm}`;
}
updateClock();
setInterval(updateClock, 30000);

// ── Unlock state machine ──
// States: "locked" | "unlocking" | "unlocked"
let lockState = "locked";
let unlockTimer = null;
let relockTimer = null;

const btn = $("unlockBtn");
const lockIcon = $("lockIcon");
const unlockLbl = $("unlockLabel");
const unlockHint = $("unlockHint");
const nfcRings = $("nfcRings");

function setLockState(state) {
  lockState = state;
  btn.classList.remove("is-unlocking", "is-unlocked");
  nfcRings.classList.remove("is-active");
  unlockHint.classList.remove("is-unlocking", "is-unlocked");

  if (state === "locked") {
    lockIcon.textContent = "🔒";
    unlockLbl.textContent = "Hold to unlock";
    unlockHint.textContent = "Tap and hold near door reader";
  } else if (state === "unlocking") {
    btn.classList.add("is-unlocking");
    nfcRings.classList.add("is-active");
    unlockHint.classList.add("is-unlocking");
    lockIcon.textContent = "🔓";
    unlockLbl.textContent = "Unlocking…";
    unlockHint.textContent = "Reading NFC key…";
  } else if (state === "unlocked") {
    btn.classList.add("is-unlocked");
    unlockHint.classList.add("is-unlocked");
    lockIcon.textContent = "✓";
    unlockLbl.textContent = "Unlocked";
    unlockHint.textContent = "Door open — re-locking in 3 s";
    $("lastUsed").textContent = "Just now";
    showToast("Room 512 unlocked successfully");
  }
}

// ── Press-and-hold unlock (400 ms) ──
let holdStart = null;

function onPressStart(e) {
  e.preventDefault();
  if (lockState !== "locked") return;
  holdStart = Date.now();
  setLockState("unlocking");
  unlockTimer = setTimeout(() => {
    setLockState("unlocked");
    relockTimer = setTimeout(() => setLockState("locked"), 3000);
  }, 1400);
}

function onPressEnd() {
  if (lockState === "unlocking") {
    clearTimeout(unlockTimer);
    setLockState("locked");
  }
}

btn.addEventListener("mousedown", onPressStart);
btn.addEventListener("touchstart", onPressStart, { passive: false });
btn.addEventListener("mouseup", onPressEnd);
btn.addEventListener("mouseleave", onPressEnd);
btn.addEventListener("touchend", onPressEnd);
btn.addEventListener("touchcancel", onPressEnd);

// ── Quick action buttons ──
$("shareBtn").addEventListener("click", () => {
  showToast("Share link copied — valid for 2 hours");
});

$("infoBtn").addEventListener("click", () => {
  showToast("Room 512 · Deluxe Double · Floor 5 · Sea view");
});

$("helpBtn").addEventListener("click", () => {
  showToast("Connecting to concierge…");
});

// ── Battery indicator (cosmetic cycling) ──
let battPct = 82;
setInterval(() => {
  // gently drift to simulate real usage
  battPct = Math.max(10, Math.min(100, battPct - (Math.random() < 0.3 ? 1 : 0)));
  $("battPct").textContent = `${battPct}%`;
  // update status-bar icon opacity
  const icons = ["▮", "▮▮", "▮▮▮", "▮▮▮▮"];
  $("battIcon").textContent = battPct > 60 ? icons[3] : battPct > 30 ? icons[2] : icons[1];
}, 15000);

// ── Init ──
setLockState("locked");
