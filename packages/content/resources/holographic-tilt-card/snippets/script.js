(() => {
  const card = document.querySelector(".holo-card");
  if (!card) return;

  const max = 14;

  function setFromPoint(clientX, clientY) {
    const rect = card.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    card.style.setProperty("--px", `${px * 100}%`);
    card.style.setProperty("--py", `${py * 100}%`);
    card.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    card.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
  }

  card.addEventListener("pointermove", (event) => {
    card.classList.add("is-active");
    setFromPoint(event.clientX, event.clientY);
  });

  card.addEventListener("pointerleave", () => {
    card.classList.remove("is-active");
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--px", "50%");
    card.style.setProperty("--py", "40%");
  });
})();
