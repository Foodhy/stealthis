// 3D Tilt Card with Glare
// Pointer Events drive rotateX/rotateY via CSS custom properties.
// requestAnimationFrame batches updates; a spring-back transition handles leave.

(() => {
  "use strict";

  const cards = Array.from(document.querySelectorAll("[data-tilt]"));
  const intensityInput = document.getElementById("intensity");
  const intensityVal = document.getElementById("intensity-val");
  const glareToggle = document.getElementById("glare");
  const parallaxToggle = document.getElementById("parallax");

  const roCard = document.getElementById("ro-card");
  const roX = document.getElementById("ro-x");
  const roY = document.getElementById("ro-y");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Shared, live-tunable settings.
  const settings = {
    max: Number(intensityInput.value),
    glare: glareToggle.checked,
    parallax: parallaxToggle.checked,
  };

  // Per-card pending frame state so we only touch the DOM inside rAF.
  const frames = new WeakMap();

  function applyPop(card) {
    // How far inner layers pop toward the viewer (0 = flat).
    card.style.setProperty("--pop", settings.parallax ? "1" : "0");
  }

  function setDepths(card) {
    // Seed each layer's depth from its data-depth attribute (once).
    card.querySelectorAll("[data-depth]").forEach((el) => {
      el.style.setProperty("--depth", el.dataset.depth || "0");
    });
  }

  function updateReadout(card, rx, ry) {
    const label = card.getAttribute("aria-label") || "Card";
    roCard.textContent = label.replace(/ product card$/i, "");
    roX.textContent = `${rx.toFixed(1)}°`;
    roY.textContent = `${ry.toFixed(1)}°`;
  }

  function schedule(card, px, py, rect) {
    if (frames.get(card)) return; // already queued this frame
    const id = requestAnimationFrame(() => {
      frames.set(card, 0);
      render(card, px, py, rect);
    });
    frames.set(card, id);
  }

  function render(card, px, py, rect) {
    // Normalize pointer position to -0.5..0.5 across the card.
    const nx = (px - rect.left) / rect.width - 0.5;
    const ny = (py - rect.top) / rect.height - 0.5;

    // Tilt toward the pointer: vertical pointer -> rotateX, horizontal -> rotateY.
    const rotX = (-ny * settings.max).toFixed(2);
    const rotY = (nx * settings.max).toFixed(2);

    card.style.setProperty("--rx", `${rotX}deg`);
    card.style.setProperty("--ry", `${rotY}deg`);

    // Glare tracks the pointer as a percentage.
    if (settings.glare) {
      card.style.setProperty("--mx", `${((px - rect.left) / rect.width) * 100}%`);
      card.style.setProperty("--my", `${((py - rect.top) / rect.height) * 100}%`);
      card.style.setProperty("--glare", "1");
    } else {
      card.style.setProperty("--glare", "0");
    }

    updateReadout(card, Number(rotX), Number(rotY));
  }

  function reset(card) {
    card.classList.remove("is-active");
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--glare", "0");
    // Center the glare so its fade-out looks natural.
    card.style.setProperty("--mx", "50%");
    card.style.setProperty("--my", "50%");
  }

  function bind(card) {
    setDepths(card);
    applyPop(card);

    let rect = null;

    const onEnter = (e) => {
      if (reduceMotion.matches) return;
      rect = card.getBoundingClientRect();
      card.classList.add("is-active");
      schedule(card, e.clientX, e.clientY, rect);
    };

    const onMove = (e) => {
      if (reduceMotion.matches) return;
      if (!rect) rect = card.getBoundingClientRect();
      schedule(card, e.clientX, e.clientY, rect);
    };

    const onLeave = () => {
      rect = null;
      reset(card);
    };

    // Pointer Events cover mouse, touch, and pen with one code path.
    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    card.addEventListener("pointercancel", onLeave);

    // Keyboard focus gives a gentle preset tilt so it's clearly interactive.
    card.addEventListener("focus", () => {
      if (reduceMotion.matches) return;
      card.classList.add("is-active");
      const t = (settings.max * 0.5).toFixed(2);
      card.style.setProperty("--rx", `${t}deg`);
      card.style.setProperty("--ry", `${-t}deg`);
      if (settings.glare) card.style.setProperty("--glare", "1");
      updateReadout(card, Number(t), Number(-t));
    });
    card.addEventListener("blur", onLeave);
  }

  // Controls
  intensityInput.addEventListener("input", () => {
    settings.max = Number(intensityInput.value);
    intensityVal.textContent = `${settings.max}°`;
  });

  glareToggle.addEventListener("change", () => {
    settings.glare = glareToggle.checked;
    if (!settings.glare) cards.forEach((c) => c.style.setProperty("--glare", "0"));
  });

  parallaxToggle.addEventListener("change", () => {
    settings.parallax = parallaxToggle.checked;
    cards.forEach(applyPop);
  });

  cards.forEach(bind);

  // Honor a runtime change in the motion preference.
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) cards.forEach(reset);
  });
})();
