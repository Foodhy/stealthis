const container = document.getElementById("drawerContainer");
const openBtn = document.getElementById("openDrawer");
const closeBtn = document.getElementById("closeDrawer");
const backdrop = document.getElementById("backdrop");

function openDrawer() {
  container.classList.add("drawer-open");
}

function closeDrawer() {
  container.classList.remove("drawer-open");
}

openBtn.addEventListener("click", openDrawer);
closeBtn.addEventListener("click", closeDrawer);
backdrop.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});
