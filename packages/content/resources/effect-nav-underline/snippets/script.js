const nav = document.querySelector(".nav");
const links = document.querySelectorAll(".nav-link");
const underline = document.querySelector(".nav-underline");

function setUnderline(link) {
  if (!link || !underline) return;
  links.forEach((l) => l.classList.remove("active"));
  link.classList.add("active");
  underline.style.width = `${link.offsetWidth}px`;
  underline.style.left = `${link.offsetLeft}px`;
}

links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    setUnderline(link);
  });
});

if (links.length) setUnderline(links[0]);
