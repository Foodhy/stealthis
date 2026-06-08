// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Card flip ────────────────────────────────────────────────────────────────
const flip = document.getElementById("flip");
const flipInner = document.getElementById("flipInner");
const flipBtn = document.getElementById("flipBtn");

function setFace(face) {
  flip.dataset.face = face;
  const onBack = face === "back";
  flipInner.setAttribute("aria-pressed", String(onBack));
  flipInner.setAttribute(
    "aria-label",
    `Insurance card, showing ${onBack ? "back" : "front"}. Activate to flip.`,
  );
  flipInner.querySelector(".face-front").setAttribute("aria-hidden", String(onBack));
  flipInner.querySelector(".face-back").setAttribute("aria-hidden", String(!onBack));
}

function toggleFace() {
  setFace(flip.dataset.face === "back" ? "front" : "back");
}

// Flip on card activation (click / Enter / Space all fire click on a <button>)
flipInner.addEventListener("click", toggleFace);
flipBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleFace();
});

// ── Copy member ID ───────────────────────────────────────────────────────────
const copyBtn = document.getElementById("copyBtn");
const memberIdText = document.getElementById("memberId").textContent.trim();

async function copyMemberId() {
  let ok = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(memberIdText);
      ok = true;
    } else {
      const ta = document.createElement("textarea");
      ta.value = memberIdText;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand("copy");
      ta.remove();
    }
  } catch (_) {
    ok = false;
  }

  if (ok) {
    showToast(`Member ID ${memberIdText} copied to clipboard.`);
    copyBtn.classList.add("is-done");
    const label = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span class="ico" aria-hidden="true">✓</span> Copied';
    clearTimeout(copyMemberId._t);
    copyMemberId._t = setTimeout(() => {
      copyBtn.classList.remove("is-done");
      copyBtn.innerHTML = label;
    }, 1800);
  } else {
    showToast(`Couldn't copy automatically — your Member ID is ${memberIdText}.`);
  }
}
copyBtn.addEventListener("click", copyMemberId);

// ── Animate coverage bars on load ────────────────────────────────────────────
function animateBars() {
  document.querySelectorAll(".bar-fill").forEach((fill) => {
    const target = getComputedStyle(fill).getPropertyValue("--pct").trim() || "0%";
    fill.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.width = target;
      });
    });
  });
}

if (document.readyState === "complete") animateBars();
else window.addEventListener("load", animateBars);
