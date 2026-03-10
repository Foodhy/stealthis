const openBtn = document.getElementById("open");
const backdrop = document.getElementById("backdrop");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("close");

openBtn.addEventListener("click", () => {
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add("open"));
});

function close() {
  backdrop.classList.add("closing");
  backdrop.classList.remove("open");
  setTimeout(() => {
    backdrop.hidden = true;
    backdrop.classList.remove("closing");
  }, 200);
}

closeBtn.addEventListener("click", close);
backdrop.addEventListener("click", (e) => {
  if (e.target === backdrop) close();
});
