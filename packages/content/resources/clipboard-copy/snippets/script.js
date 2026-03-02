(function () {
  "use strict";

  const RESET_DELAY = 2000;

  /**
   * Copy the text content of an element to the clipboard.
   * @param {HTMLButtonElement} btn  The copy button that was activated
   */
  async function handleCopy(btn) {
    const targetId = btn.dataset.copy;
    const source   = document.getElementById(targetId);
    if (!source) return;

    const text = source.textContent ?? "";

    try {
      await navigator.clipboard.writeText(text);
      setButtonState(btn, "copied");
    } catch {
      setButtonState(btn, "error");
    }
  }

  /**
   * Apply a visual state to the button, then revert after RESET_DELAY ms.
   * @param {HTMLButtonElement} btn
   * @param {"copied"|"error"} state
   */
  function setButtonState(btn, state) {
    // Clear any pending reset
    clearTimeout(btn._resetTimer);

    // Remove both possible state classes first
    btn.classList.remove("is-copied", "is-error");

    if (state === "copied") {
      btn.classList.add("is-copied");
      btn.setAttribute("aria-label", "Copied!");
    } else {
      btn.classList.add("is-error");
      btn.setAttribute("aria-label", "Failed to copy");
    }

    // Revert to default
    btn._resetTimer = setTimeout(() => {
      btn.classList.remove("is-copied", "is-error");
      btn.setAttribute("aria-label", "Copy to clipboard");
    }, RESET_DELAY);
  }

  // Event delegation — handles all copy buttons
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-btn");
    if (btn) handleCopy(btn);
  });
})();
