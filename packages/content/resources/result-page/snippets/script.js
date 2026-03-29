(() => {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".result-panel");

  function activate(targetPanel) {
    tabs.forEach((t) => {
      const isTarget = t.dataset.panel === targetPanel;
      t.classList.toggle("is-active", isTarget);
      t.setAttribute("aria-selected", String(isTarget));
    });
    panels.forEach((p) => {
      const isTarget = p.id === targetPanel;
      p.classList.toggle("is-active", isTarget);
      p.hidden = !isTarget;
      // Re-trigger animation
      if (isTarget) {
        const card = p.querySelector(".result");
        if (card) {
          card.style.animation = "none";
          card.offsetHeight;
          card.style.animation = "";
        }
      }
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.dataset.panel));
  });
})();
