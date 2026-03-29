(() => {
  const toggleBtn = document.getElementById("toggle-reveal");

  toggleBtn.addEventListener("click", () => {
    const isRevealed = document.body.classList.toggle("reveal-mode");
    toggleBtn.setAttribute("aria-pressed", isRevealed ? "true" : "false");

    // Show/hide the sr-reveal panels
    document.querySelectorAll(".sr-reveal").forEach((el) => {
      el.hidden = !isRevealed;
    });
  });
})();
