(() => {
  const wrapper = document.querySelector(".dots-wrapper");
  const dotsBtn = document.querySelector(".dots-btn");

  if (!wrapper || !dotsBtn) return;

  function open() {
    wrapper.classList.add("menu-open");
    dotsBtn.setAttribute("aria-expanded", "true");
  }

  function close() {
    wrapper.classList.remove("menu-open");
    dotsBtn.setAttribute("aria-expanded", "false");
  }

  function toggle() {
    wrapper.classList.contains("menu-open") ? close() : open();
  }

  dotsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle();
  });

  // Close on click outside
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      close();
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      close();
      dotsBtn.focus();
    }
  });

  // Close when a menu item is clicked
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      close();
    });
  });
})();
