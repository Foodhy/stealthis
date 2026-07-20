/* Sticky-stack Sections — scroll-linked depth for sticky panels.
   Each card writes a progress value --p (0 = frontmost, 1 = fully buried),
   computed from how far the NEXT card has advanced over it. */

(() => {
  const stack = document.getElementById("stack");
  const status = document.getElementById("status");
  if (!stack) return;

  const cards = Array.from(stack.querySelectorAll(".card"));
  if (!cards.length) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

  // z-order: later cards sit above earlier ones so they can cover them.
  cards.forEach((c, i) => { c.style.zIndex = String(i + 1); });

  let ticking = false;

  function update() {
    ticking = false;
    if (reduced.matches) {
      cards.forEach((c) => c.style.setProperty("--p", "0"));
      return;
    }

    let front = 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const next = cards[i + 1];
      const rect = card.getBoundingClientRect();

      let p = 0;
      if (next) {
        const nextTop = next.getBoundingClientRect().top;
        // travel = distance the next card covers, from "just below this card"
        // to "fully overlapping its pinned position".
        const travel = rect.height;
        p = clamp((rect.bottom - nextTop) / travel);
      }

      card.style.setProperty("--p", p.toFixed(3));
      card.setAttribute("aria-hidden", p > 0.95 ? "true" : "false");
      if (p < 0.5) front = i;
    }

    if (status && status.dataset.front !== String(front)) {
      status.dataset.front = String(front);
      const h = cards[front].querySelector("h2");
      status.textContent = `Showing section ${front + 1} of ${cards.length}${h ? " — " + h.textContent : ""}`;
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  reduced.addEventListener?.("change", update);

  // Keyboard fallback: step between cards instead of relying on wheel/touch.
  stack.addEventListener("keydown", (e) => {
    const step = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const current = Number(status?.dataset.front || 0);
    const target = Math.min(cards.length - 1, Math.max(0, current + step));
    cards[target].scrollIntoView({
      block: "start",
      behavior: reduced.matches ? "auto" : "smooth",
    });
  });

  update();
})();
