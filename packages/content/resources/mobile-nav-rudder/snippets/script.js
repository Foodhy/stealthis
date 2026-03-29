const navItems = document.querySelectorAll(".nav-item");
const screens = document.querySelectorAll(".content-screen");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.dataset.target;

    navItems.forEach((n) => n.classList.remove("active"));
    item.classList.add("active");

    screens.forEach((s) => {
      if (s.dataset.screen === target) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });
  });
});
