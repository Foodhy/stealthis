/* Swipe-to-dismiss: Pointer Events + pointer capture, axis lock,
   rubber-band resistance, velocity-aware threshold, height collapse,
   keyboard fallback and reduced-motion support. */
(() => {
  const stack = document.getElementById("stack");
  const empty = document.getElementById("empty");
  const live = document.getElementById("live");
  const resetBtn = document.getElementById("reset");
  if (!stack) return;

  const DIST_RATIO = 0.35;   // fraction of card width that commits a dismiss
  const VELOCITY = 0.5;      // px/ms that commits regardless of distance
  const SLOP = 8;            // px before we decide the gesture is horizontal
  const template = stack.innerHTML;

  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = new WeakMap(); // card -> gesture record

  function setX(card, dx) {
    const w = card.offsetWidth || 1;
    const p = Math.min(1, Math.abs(dx) / (w * DIST_RATIO));
    card.style.transform = `translateX(${dx}px) rotate(${(dx / w) * 6}deg)`;
    card.style.opacity = String(1 - p * 0.35);
    card.style.setProperty("--p", p.toFixed(3));
  }

  function clearX(card) {
    card.style.transform = "";
    card.style.opacity = "";
    card.style.setProperty("--p", "0");
  }

  function rubber(dx, limit) {
    // linear until `limit`, then logarithmic resistance
    const a = Math.abs(dx);
    if (a <= limit) return dx;
    return Math.sign(dx) * (limit + Math.log10(1 + (a - limit) / limit) * limit * 0.6);
  }

  function announce(msg) { if (live) live.textContent = msg; }

  function updateEmpty() {
    const left = stack.querySelectorAll(".card").length;
    if (empty) empty.hidden = left > 0;
  }

  /* ---- commit / cancel ---------------------------------------------- */

  function dismiss(card, dir) {
    if (card.dataset.gone === "1") return;
    card.dataset.gone = "1";
    const title = card.querySelector(".card__title");
    const label = title ? title.textContent : "Card";

    // move focus somewhere sensible before the node leaves the tree
    if (card.contains(document.activeElement)) {
      const next = card.nextElementSibling || card.previousElementSibling;
      (next || resetBtn || document.body).focus?.();
    }

    card.classList.remove("is-settling");
    card.classList.add("is-out");
    card.style.transform = `translateX(${dir * (card.offsetWidth + 80)}px) rotate(${dir * 8}deg)`;

    const collapse = () => {
      const h = card.offsetHeight;
      card.style.height = h + "px";
      card.classList.add("is-collapsing");
      // force layout so the height transition has a start value
      void card.offsetHeight;
      card.style.height = "0px";
      card.style.marginTop = "-10px";
      card.style.paddingTop = "0";
      card.style.paddingBottom = "0";
      const done = () => { card.remove(); updateEmpty(); };
      if (reduced()) done();
      else setTimeout(done, 220);
    };

    if (reduced()) collapse();
    else setTimeout(collapse, 200);

    announce(label + " dismissed");
  }

  function settle(card) {
    card.classList.add("is-settling");
    clearX(card);
    setTimeout(() => card.classList.remove("is-settling"), 240);
  }

  /* ---- pointer gesture ---------------------------------------------- */

  stack.addEventListener("pointerdown", (e) => {
    const card = e.target.closest(".card");
    if (!card || card.dataset.gone === "1") return;
    if (e.target.closest(".card__x")) return;      // let the button handle it
    if (e.button !== 0 && e.pointerType === "mouse") return;

    card.classList.remove("is-settling");
    state.set(card, {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      lastX: e.clientX,
      lastT: e.timeStamp,
      v: 0,
      axis: null,
    });
  });

  stack.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".card");
    const s = card && state.get(card);
    if (!s || s.id !== e.pointerId) return;

    const dx = e.clientX - s.x0;
    const dy = e.clientY - s.y0;

    if (s.axis === null) {
      if (Math.hypot(dx, dy) < SLOP) return;
      s.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (s.axis === "x") {
        card.setPointerCapture(e.pointerId);
        card.dataset.dragging = "true";
      } else {
        state.delete(card);           // vertical: hand back to the scroller
        return;
      }
    }

    const dt = e.timeStamp - s.lastT;
    if (dt > 0) s.v = (e.clientX - s.lastX) / dt;
    s.lastX = e.clientX;
    s.lastT = e.timeStamp;

    e.preventDefault();
    setX(card, rubber(dx, card.offsetWidth * 0.5));
  });

  function endGesture(e) {
    const card = e.target.closest(".card");
    const s = card && state.get(card);
    if (!s || s.id !== e.pointerId) return;
    state.delete(card);
    delete card.dataset.dragging;
    if (card.hasPointerCapture?.(e.pointerId)) card.releasePointerCapture(e.pointerId);
    if (s.axis !== "x") return;

    const dx = e.clientX - s.x0;
    const farEnough = Math.abs(dx) > card.offsetWidth * DIST_RATIO;
    const fastEnough = Math.abs(s.v) > VELOCITY && Math.sign(s.v) === Math.sign(dx) && Math.abs(dx) > 20;

    if (farEnough || fastEnough) dismiss(card, Math.sign(dx) || 1);
    else settle(card);
  }

  stack.addEventListener("pointerup", endGesture);
  stack.addEventListener("pointercancel", endGesture);

  /* ---- keyboard + button fallbacks ---------------------------------- */

  stack.addEventListener("keydown", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    if (e.key === "ArrowRight") { e.preventDefault(); dismiss(card, 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); dismiss(card, -1); }
    else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); dismiss(card, 1); }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const cards = [...stack.querySelectorAll(".card")];
      const i = cards.indexOf(card);
      const next = cards[i + (e.key === "ArrowDown" ? 1 : -1)];
      if (next) { e.preventDefault(); next.focus(); }
    }
  });

  stack.addEventListener("click", (e) => {
    const btn = e.target.closest(".card__x");
    if (btn) dismiss(btn.closest(".card"), 1);
  });

  resetBtn?.addEventListener("click", () => {
    stack.innerHTML = template;
    stack.querySelectorAll(".card").forEach(clearX);
    updateEmpty();
    announce("All cards restored");
    stack.querySelector(".card")?.focus();
  });

  updateEmpty();
})();
