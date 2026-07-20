/* SVG Map Tooltip — pointer + keyboard driven, viewport-clamped positioning. */
(() => {
  const wrap = document.querySelector(".map-wrap");
  const tip = document.querySelector("#map-tip");
  const live = document.querySelector("[data-live]");
  const regions = Array.from(document.querySelectorAll(".region"));
  if (!wrap || !tip || !regions.length) return;

  const els = {
    dot: tip.querySelector("[data-tip-dot]"),
    name: tip.querySelector("[data-tip-name]"),
    users: tip.querySelector("[data-tip-users]"),
    growth: tip.querySelector("[data-tip-growth]"),
  };

  let current = null;
  let raf = 0;

  /** Anchor point in .map-wrap coordinates: either the pointer or the region centroid. */
  function anchorFor(region, event) {
    const wrapBox = wrap.getBoundingClientRect();
    if (event && event.clientX !== undefined && event.pointerType !== "") {
      return { x: event.clientX - wrapBox.left, y: event.clientY - wrapBox.top };
    }
    const box = region.getBoundingClientRect();
    return {
      x: box.left + box.width / 2 - wrapBox.left,
      y: box.top + box.height / 2 - wrapBox.top,
    };
  }

  function place(anchor) {
    const tipBox = tip.getBoundingClientRect();
    const maxX = wrap.clientWidth - tipBox.width - 8;
    const idealLeft = anchor.x - tipBox.width / 2;
    const left = Math.max(8, Math.min(idealLeft, maxX));

    // Flip below the anchor when there is no headroom above it.
    const gap = 14;
    let top = anchor.y - tipBox.height - gap;
    const flipped = top < 8;
    if (flipped) top = anchor.y + gap;

    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    tip.style.setProperty("--arrow", `${Math.round(anchor.x - left)}px`);
    tip.toggleAttribute("data-flip", flipped);
  }

  function show(region, event) {
    if (current && current !== region) current.classList.remove("is-active");
    current = region;
    region.classList.add("is-active");

    const d = region.dataset;
    els.name.textContent = d.name;
    els.users.textContent = d.users;
    els.growth.textContent = d.growth;
    els.growth.style.color =
      d.status === "risk" ? "#ff6b81" : d.status === "watch" ? "#ffc75f" : "#3ddc97";
    els.dot.dataset.status = d.status;

    tip.hidden = false;
    tip.setAttribute("data-shown", "");
    region.setAttribute("aria-describedby", "map-tip");

    const anchor = anchorFor(region, event);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => place(anchor));

    if (live) live.textContent = `${d.name}: ${d.users} users, ${d.growth} growth, ${d.status}.`;
  }

  function hide() {
    if (current) {
      current.classList.remove("is-active");
      current.removeAttribute("aria-describedby");
      current = null;
    }
    tip.removeAttribute("data-shown");
    tip.removeAttribute("data-flip");
    tip.hidden = true;
    if (live) live.textContent = "";
  }

  regions.forEach((region, i) => {
    region.addEventListener("pointerenter", (e) => show(region, e));
    region.addEventListener("pointermove", (e) => {
      if (current !== region) return;
      const anchor = anchorFor(region, e);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => place(anchor));
    });
    region.addEventListener("pointerleave", () => {
      if (region !== document.activeElement) hide();
    });

    region.addEventListener("focus", () => show(region, null));
    region.addEventListener("blur", hide);

    region.addEventListener("keydown", (e) => {
      const step =
        e.key === "ArrowRight" || e.key === "ArrowDown"
          ? 1
          : e.key === "ArrowLeft" || e.key === "ArrowUp"
            ? -1
            : 0;
      if (step) {
        e.preventDefault();
        regions[(i + step + regions.length) % regions.length].focus();
      } else if (e.key === "Escape") {
        hide();
        region.blur();
      } else if (e.key === "Home") {
        e.preventDefault();
        regions[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        regions[regions.length - 1].focus();
      }
    });
  });

  // Keep an open (keyboard-anchored) tooltip correct on resize/scroll.
  const reflow = () => {
    if (current) place(anchorFor(current, null));
  };
  window.addEventListener("resize", reflow);
  window.addEventListener("scroll", reflow, { passive: true });
})();
