(() => {
  let activeModal = null;
  let triggerElement = null;

  const FOCUSABLE_SELECTORS =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openModal(modalId, trigger) {
    const backdrop = document.getElementById(modalId);
    if (!backdrop) return;

    triggerElement = trigger;
    activeModal = backdrop;

    backdrop.hidden = false;
    document.body.classList.add("modal-open");

    // Focus the modal container
    const modal = backdrop.querySelector(".modal");
    modal.focus();

    // Set up focus trap
    requestAnimationFrame(() => {
      const focusableEls = getFocusableElements(backdrop);
      if (focusableEls.length > 0) {
        focusableEls[0].focus();
      }
    });
  }

  function closeModal() {
    if (!activeModal) return;

    activeModal.hidden = true;
    document.body.classList.remove("modal-open");

    // Return focus to trigger
    if (triggerElement) {
      triggerElement.focus();
    }

    activeModal = null;
    triggerElement = null;
  }

  function getFocusableElements(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
      (el) => !el.closest("[hidden]") && el.offsetParent !== null
    );
  }

  function trapFocus(e) {
    if (!activeModal) return;

    const focusableEls = getFocusableElements(activeModal);
    if (focusableEls.length === 0) return;

    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    if (e.key === "Tab") {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  }

  // Trigger buttons
  document.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.dataset.modal, btn);
    });
  });

  // Close buttons
  document.querySelectorAll(".modal-close, .modal-cancel").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  // Backdrop click to close
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });
  });

  // Keyboard: Escape to close, Tab trapping
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeModal) {
      e.preventDefault();
      closeModal();
    }

    if (e.key === "Tab" && activeModal) {
      trapFocus(e);
    }
  });

  // Form submission in modal
  const submitBtn = document.getElementById("submit-form");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const form = document.getElementById("team-form");
      const nameInput = document.getElementById("team-name");
      const leadSelect = document.getElementById("team-lead");

      // Simple validation
      let valid = true;

      if (!nameInput.value.trim()) {
        nameInput.style.borderColor = "#f87171";
        valid = false;
      } else {
        nameInput.style.borderColor = "";
      }

      if (!leadSelect.value) {
        leadSelect.style.borderColor = "#f87171";
        valid = false;
      } else {
        leadSelect.style.borderColor = "";
      }

      if (valid) {
        closeModal();
      }
    });
  }
})();
