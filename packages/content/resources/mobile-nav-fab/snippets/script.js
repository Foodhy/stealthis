const container = document.getElementById("fabContainer");
const fabMain = document.getElementById("fabMain");
const backdrop = document.getElementById("backdrop");

function toggleFab() {
  container.classList.toggle("fab-open");
}

function closeFab() {
  container.classList.remove("fab-open");
}

fabMain.addEventListener("click", toggleFab);
backdrop.addEventListener("click", closeFab);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeFab();
});
