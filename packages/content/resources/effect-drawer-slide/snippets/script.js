function setupDrawer(openId, closeId, backdropId) {
  const openBtn = document.getElementById(openId);
  const closeBtn = document.getElementById(closeId);
  const backdrop = document.getElementById(backdropId);

  function open() {
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("open"));
  }

  function close() {
    backdrop.classList.remove("open");
    backdrop.addEventListener("transitionend", function handler() {
      backdrop.hidden = true;
      backdrop.removeEventListener("transitionend", handler);
    });
  }

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
}

setupDrawer("open-left", "close-left", "backdrop-left");
setupDrawer("open-right", "close-right", "backdrop-right");
