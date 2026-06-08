// ── Elements ─────────────────────────────────────────────────────────────────
const soap = document.getElementById("soap");
const areas = Array.from(document.querySelectorAll(".note-area"));
const saveState = document.getElementById("saveState");
const saveText = saveState.querySelector(".ss-text");
const wordCount = document.getElementById("wordCount");
const signBtn = document.getElementById("signBtn");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const signedLine = document.getElementById("signedLine");
const toast = document.getElementById("toast");

let locked = false;

// Illustrative: a fixed timestamp is used instead of Date.now().
const SIGNED_AT = "8 June 2026, 10:52 AM";
const CLINICIAN = "Dr. Ravi Patel";

// ── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Word count across all four sections ──────────────────────────────────────
function countWords() {
  const total = areas.reduce((sum, a) => {
    const words = a.value.trim().split(/\s+/).filter(Boolean);
    return sum + words.length;
  }, 0);
  wordCount.textContent = `${total} word${total === 1 ? "" : "s"}`;
}

// ── Autosave indicator state machine ─────────────────────────────────────────
function setSaveState(state) {
  saveState.classList.remove("is-saving", "is-dirty");
  if (state === "saving") {
    saveState.classList.add("is-saving");
    saveText.textContent = "Saving…";
  } else if (state === "dirty") {
    saveState.classList.add("is-dirty");
    saveText.textContent = "Unsaved changes";
  } else {
    saveText.textContent = "Saved";
  }
}

let saveTimer;
function scheduleSave() {
  if (locked) return;
  setSaveState("dirty");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    setSaveState("saving");
    setTimeout(() => setSaveState("saved"), 600);
  }, 900);
}

// ── Typing → word count + autosave ───────────────────────────────────────────
areas.forEach((area) => {
  area.addEventListener("input", () => {
    countWords();
    scheduleSave();
  });
});

// ── Template chip insertion ──────────────────────────────────────────────────
soap.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip || locked) return;
  const card = chip.closest(".note-card");
  const area = card.querySelector(".note-area");
  const snippet = chip.dataset.insert;
  if (area.value && !area.value.endsWith("\n") && !area.value.endsWith(" ")) {
    area.value += "\n";
  }
  area.value += snippet;
  area.focus();
  area.setSelectionRange(area.value.length, area.value.length);
  countWords();
  scheduleSave();
});

// ── Save draft ───────────────────────────────────────────────────────────────
saveDraftBtn.addEventListener("click", () => {
  if (locked) return;
  clearTimeout(saveTimer);
  setSaveState("saving");
  setTimeout(() => {
    setSaveState("saved");
    showToast("Draft saved.");
  }, 600);
});

// ── Sign & lock ──────────────────────────────────────────────────────────────
signBtn.addEventListener("click", () => {
  if (locked) return;
  locked = true;
  clearTimeout(saveTimer);

  areas.forEach((a) => a.setAttribute("readonly", ""));
  document.querySelectorAll(".note-card").forEach((c) => c.classList.add("is-locked"));

  setSaveState("saved");
  saveText.textContent = "Signed";

  signedLine.textContent = `Signed by ${CLINICIAN} · ${SIGNED_AT}`;
  signedLine.hidden = false;

  signBtn.disabled = true;
  signBtn.textContent = "Signed ✓";
  saveDraftBtn.disabled = true;

  showToast("Note signed and locked.");
});

// ── Init ─────────────────────────────────────────────────────────────────────
countWords();
