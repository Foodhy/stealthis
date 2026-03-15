const sidebar = document.getElementById("sidebar");
const contentArea = document.getElementById("contentArea");
const navBtns = sidebar.querySelectorAll(".nav-btn");
const pages = contentArea.querySelectorAll(".content-page");

function switchPage(pageName) {
  navBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === pageName);
  });

  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.content === pageName);
  });
}

navBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchPage(btn.dataset.page);
  });
});
