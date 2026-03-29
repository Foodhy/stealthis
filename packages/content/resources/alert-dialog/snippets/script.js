(() => {
  const FOCUSABLE =
    'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

  let currentDialog = null;
  let previousFocus = null;

  function getFocusable(el) {
    return [...el.querySelectorAll(FOCUSABLE)].filter(
      (n) => !n.closest("[hidden]") && n.offsetParent !== null
    );
  }

  function openDialog(dialog) {
    if (currentDialog) closeDialog(currentDialog);
    previousFocus = document.activeElement;
    currentDialog = dialog;
    dialog.classList.add("is-open");
    document.body.style.overflow = "hidden";
    const panel = dialog.querySelector(".dialog");
    panel.focus();
    trapFocus(dialog);
  }

  function closeDialog(dialog) {
    dialog.classList.remove("is-open");
    document.body.style.overflow = "";
    if (previousFocus) previousFocus.focus();
    currentDialog = null;
    previousFocus = null;
  }

  function trapFocus(dialog) {
    dialog.addEventListener("keydown", onKeyDown);
  }

  function onKeyDown(e) {
    const dialog = e.currentTarget;
    if (e.key === "Escape") {
      closeDialog(dialog);
      return;
    }
    if (e.key !== "Tab") return;
    const focusable = getFocusable(dialog);
    if (!focusable.length) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // Wire open triggers
  document
    .getElementById("open-delete")
    .addEventListener("click", () => openDialog(document.getElementById("dialog-delete")));
  document
    .getElementById("open-logout")
    .addEventListener("click", () => openDialog(document.getElementById("dialog-logout")));
  document
    .getElementById("open-revoke")
    .addEventListener("click", () => openDialog(document.getElementById("dialog-revoke")));

  // Wire cancel buttons
  document.querySelectorAll(".dialog-cancel").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.dialog;
      closeDialog(document.getElementById(id));
    });
  });

  // Backdrop click closes
  document.querySelectorAll(".backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeDialog(backdrop);
    });
  });
})();
