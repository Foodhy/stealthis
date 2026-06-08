// ── Toast helper ──
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Copy reference to clipboard ──
const btnCopy = document.getElementById("btnCopy");
const copyIcon = document.getElementById("copyIcon");
const refCode = document.getElementById("refCode");

btnCopy.addEventListener("click", () => {
  const text = refCode.textContent.trim();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showCopied();
      })
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
});

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0;";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
  showCopied();
}

function showCopied() {
  copyIcon.textContent = "✓";
  btnCopy.classList.add("copied");
  showToast("Reference copied: AH-2026-88341");
  clearTimeout(showCopied._t);
  showCopied._t = setTimeout(() => {
    copyIcon.textContent = "⧉";
    btnCopy.classList.remove("copied");
  }, 2000);
}

// ── Add to calendar toggle ──
const btnCal = document.getElementById("btnCal");
const calActions = document.getElementById("calActions");

btnCal.addEventListener("click", () => {
  const isOpen = calActions.hidden === false;
  calActions.hidden = isOpen;
  btnCal.textContent = isOpen ? "Add" : "Close";
  btnCal.classList.toggle("is-open", !isOpen);
});

// ── Calendar provider buttons ──
document.querySelectorAll(".btn-cal").forEach((btn) => {
  btn.addEventListener("click", () => {
    const provider = btn.dataset.cal;
    const providerName =
      { google: "Google Calendar", apple: "Apple Calendar", outlook: "Outlook" }[provider] ||
      provider;
    // In a real app this would build a calendar URL; here we just show feedback
    showToast(`Opening ${providerName}…`);
    // Mark the checklist item as done
    const calItem = document.getElementById("calItem");
    const icon = calItem.querySelector(".ci-icon");
    icon.textContent = "✓";
    icon.classList.remove("ci-pending");
    calActions.hidden = true;
    btnCal.textContent = "Done";
    btnCal.classList.remove("is-open");
    btnCal.disabled = true;
    btnCal.style.opacity = "0.5";
  });
});

// ── Cancellation policy accordion ──
const btnPolicy = document.getElementById("btnPolicy");
const policyDetail = document.getElementById("policyDetail");
const policyArrow = document.getElementById("policyArrow");

btnPolicy.addEventListener("click", () => {
  const isOpen = policyDetail.hidden === false;
  policyDetail.hidden = isOpen;
  policyArrow.textContent = isOpen ? "↓" : "↑";
  btnPolicy.setAttribute("aria-expanded", String(!isOpen));
});

// ── Manage booking CTA (mock) ──
document.getElementById("btnManage").addEventListener("click", () => {
  showToast("Opening booking management…");
});

// ── Back to home CTA (mock) ──
document.getElementById("btnBack").addEventListener("click", () => {
  showToast("Returning to Aurelia Hotels home…");
});
