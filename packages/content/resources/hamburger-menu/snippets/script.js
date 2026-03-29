const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("fullscreen-nav");
let isOpen = false;

function openMenu() {
  isOpen = true;
  hamburger.classList.add("open");
  hamburger.setAttribute("aria-expanded", "true");
  nav.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  isOpen = false;
  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  nav.classList.remove("open");
  document.body.style.overflow = "";
}

hamburger.addEventListener("click", () => (isOpen ? closeMenu() : openMenu()));

document.querySelectorAll("[data-close]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    closeMenu();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isOpen) closeMenu();
});
