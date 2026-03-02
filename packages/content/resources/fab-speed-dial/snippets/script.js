(function () {
  "use strict";

  const container = document.getElementById("fab-container");
  const btn       = document.getElementById("fab-btn");
  const backdrop  = document.getElementById("fab-backdrop");
  const snackbar  = document.getElementById("snackbar");

  let snackTimer = null;

  /** Toggle the speed dial open / closed */
  function toggleDial(open) {
    const isOpen = open !== undefined ? open : !container.classList.contains("is-open");

    container.classList.toggle("is-open", isOpen);
    backdrop.classList.toggle("is-visible", isOpen);
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.setAttribute("aria-label", isOpen ? "Close actions" : "Open actions");
  }

  /** Close on backdrop click */
  backdrop.addEventListener("click", () => toggleDial(false));

  /** Toggle on FAB click */
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDial();
  });

  /** Close on Escape */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && container.classList.contains("is-open")) {
      toggleDial(false);
      btn.focus();
    }
  });

  /** Keyboard navigation within the dial */
  document.getElementById("fab-actions").addEventListener("keydown", (e) => {
    const items = [...document.querySelectorAll(".fab-action__btn")];
    const idx   = items.indexOf(document.activeElement);

    if (e.key === "ArrowUp"   && idx > 0)              { e.preventDefault(); items[idx - 1].focus(); }
    if (e.key === "ArrowDown" && idx < items.length - 1){ e.preventDefault(); items[idx + 1].focus(); }
    if (e.key === "Tab")      { toggleDial(false); }
  });

  /** Show a temporary snackbar message */
  function showSnack(msg) {
    snackbar.textContent = msg;
    snackbar.classList.add("show");
    clearTimeout(snackTimer);
    snackTimer = setTimeout(() => snackbar.classList.remove("show"), 2200);
  }

  /** Called by inline onclick handlers */
  window.handleAction = function (name) {
    toggleDial(false);
    btn.focus();
    showSnack(`"${name}" selected`);
  };
})();
