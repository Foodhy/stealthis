(() => {
  const toggleBtn = document.getElementById("toggle-outlines");
  const page = document.getElementById("landmark-page");

  toggleBtn.addEventListener("click", () => {
    const isActive = page.classList.toggle("show-outlines");
    toggleBtn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
})();
