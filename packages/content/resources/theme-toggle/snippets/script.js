(() => {
  const key = "theme-mode";
  const summary = document.getElementById("summary");
  const buttons = Array.from(document.querySelectorAll("button[data-mode]"));
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const resolveMode = (mode) => (mode === "system" ? (media.matches ? "dark" : "light") : mode);

  const apply = (mode) => {
    const resolved = resolveMode(mode);
    document.documentElement.setAttribute("data-mode", mode);
    document.documentElement.setAttribute("data-theme", resolved);
    localStorage.setItem(key, mode);

    for (const button of buttons) {
      button.classList.toggle("active", button.getAttribute("data-mode") === mode);
    }

    summary.textContent = `Mode: ${mode} (resolved to ${resolved})`;
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const mode = button.getAttribute("data-mode");
      if (!mode) return;
      apply(mode);
    });
  }

  media.addEventListener("change", () => {
    const currentMode = document.documentElement.getAttribute("data-mode") || "system";
    if (currentMode === "system") apply("system");
  });

  apply(localStorage.getItem(key) || "system");
})();
