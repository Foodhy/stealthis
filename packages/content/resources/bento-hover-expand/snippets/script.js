(() => {
  const grid = document.getElementById("expand-grid");
  const lockToggle = document.getElementById("lock");
  if (!grid) return;

  const tiles = Array.from(grid.querySelectorAll(".tile"));
  let locked = null;
  let hovered = null;
  let raf = 0;

  const render = () => {
    raf = 0;
    const active = locked || hovered;
    grid.classList.toggle("has-focus", Boolean(active));
    tiles.forEach((tile) => {
      const isActive = tile === active;
      tile.classList.toggle("is-focused", isActive);
      tile.classList.toggle("is-locked", tile === locked);
      tile.setAttribute("aria-expanded", String(isActive));
    });
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  const setHover = (tile) => {
    if (hovered === tile) return;
    hovered = tile;
    schedule();
  };

  const toggleLock = (tile) => {
    locked = locked === tile ? null : tile;
    schedule();
  };

  tiles.forEach((tile) => {
    tile.setAttribute("role", "button");
    tile.setAttribute("aria-expanded", "false");

    tile.addEventListener("pointerenter", () => {
      if (!locked) setHover(tile);
    });
    tile.addEventListener("focus", () => {
      if (!locked) setHover(tile);
    });
    tile.addEventListener("click", () => {
      if (lockToggle && lockToggle.checked) toggleLock(tile);
    });
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleLock(tile);
      }
    });
  });

  grid.addEventListener("pointerleave", () => {
    if (!locked) setHover(null);
  });
  grid.addEventListener("focusout", (e) => {
    if (!locked && !grid.contains(e.relatedTarget)) setHover(null);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      locked = null;
      hovered = null;
      schedule();
    }
  });

  render();
})();
