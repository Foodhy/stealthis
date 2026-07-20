/* Horizontal Scroll Gallery — scroll-snap rail driven by wheel, buttons, dots and keyboard. */
(() => {
  const rail = document.getElementById("rail");
  if (!rail) return;

  const cards = Array.from(rail.querySelectorAll(".card"));
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const dotsBox = document.getElementById("dots");
  const bar = document.getElementById("bar");
  const progress = document.getElementById("progress");
  const status = document.getElementById("status");
  const wheelToggle = document.getElementById("wheel");

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const behavior = () => (reduce.matches ? "auto" : "smooth");

  let index = 0;

  /* ---- dots ---- */
  const dots = cards.map((card, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Go to slide " + (i + 1));
    b.addEventListener("click", () => goTo(i));
    dotsBox.appendChild(b);
    return b;
  });

  /* ---- navigation ---- */
  function goTo(i) {
    i = Math.max(0, Math.min(cards.length - 1, i));
    const left = cards[i].offsetLeft - rail.offsetLeft;
    rail.scrollTo({ left, behavior: behavior() });
  }

  /* Nearest card to the rail's left scroll edge = the "current" slide. */
  function nearestIndex() {
    const origin = rail.scrollLeft + rail.offsetLeft;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const d = Math.abs(card.offsetLeft - origin);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }

  function render() {
    const max = rail.scrollWidth - rail.clientWidth;
    const ratio = max > 0 ? rail.scrollLeft / max : 0;

    bar.style.width = (ratio * 100).toFixed(2) + "%";
    progress.setAttribute("aria-valuenow", Math.round(ratio * 100));

    const i = nearestIndex();
    if (i !== index) {
      index = i;
      const title = cards[i].querySelector("h2").textContent;
      status.textContent = "Slide " + (i + 1) + " of " + cards.length + " — " + title;
    }

    cards.forEach((c, n) => c.classList.toggle("is-active", n === index));
    dots.forEach((d, n) => d.setAttribute("aria-current", String(n === index)));

    prev.disabled = rail.scrollLeft <= 1;
    next.disabled = rail.scrollLeft >= max - 1;
  }

  /* Coalesce scroll events into one paint. */
  let frame = 0;
  rail.addEventListener("scroll", () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; render(); });
  }, { passive: true });

  prev.addEventListener("click", () => goTo(index - 1));
  next.addEventListener("click", () => goTo(index + 1));

  /* ---- keyboard ---- */
  rail.addEventListener("keydown", (e) => {
    const map = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: cards.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    goTo(map[e.key]);
  });

  /* ---- wheel: map vertical deltas onto the horizontal axis ---- */
  rail.addEventListener("wheel", (e) => {
    if (!wheelToggle.checked) return;
    // Let genuinely horizontal gestures (trackpad swipes) pass through untouched.
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    const max = rail.scrollWidth - rail.clientWidth;
    const atStart = rail.scrollLeft <= 0 && e.deltaY < 0;
    const atEnd = rail.scrollLeft >= max && e.deltaY > 0;
    if (atStart || atEnd) return; // release the page scroll at the edges

    e.preventDefault();
    // deltaMode 1 = lines, 2 = pages — normalise to pixels.
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rail.clientWidth : 1;
    rail.scrollLeft += e.deltaY * unit;
  }, { passive: false });

  addEventListener("resize", render);
  render();
})();
