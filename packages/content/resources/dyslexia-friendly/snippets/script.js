(() => {
  const STORAGE_KEY = "dyslexia-mode-enabled";
  const toggleBtn = document.getElementById("dyslexia-toggle");
  const label = toggleBtn.querySelector(".toggle-btn__label");

  function applyMode(enabled) {
    document.body.classList.toggle("dyslexia-mode", enabled);
    toggleBtn.setAttribute("aria-pressed", String(enabled));
    label.textContent = enabled ? "Disable Dyslexia Mode" : "Enable Dyslexia Mode";
  }

  // Restore saved preference
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "true") {
    applyMode(true);
  }

  toggleBtn.addEventListener("click", () => {
    const isActive = document.body.classList.contains("dyslexia-mode");
    const next = !isActive;
    applyMode(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  });
})();
