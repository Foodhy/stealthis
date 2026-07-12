(() => {
  "use strict";

  const board = document.getElementById("board");
  const rmBadge = document.getElementById("rmBadge");
  const stiffnessEl = document.getElementById("stiffness");
  const dampingEl = document.getElementById("damping");
  const resistanceEl = document.getElementById("resistance");
  const stiffnessOut = document.getElementById("stiffnessOut");
  const dampingOut = document.getElementById("dampingOut");
  const resistanceOut = document.getElementById("resistanceOut");
  const roCard = document.getElementById("roCard");
  const roVel = document.getElementById("roVel");
  const roOff = document.getElementById("roOff");
  const roState = document.getElementById("roState");
  const energyFill = document.getElementById("energyFill");
  const energyPct = document.getElementById("energyPct");
  const resetBtn = document.getElementById("reset");

  const reduceMotionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = reduceMotionMQ.matches;
  rmBadge.hidden = !reduceMotion;
  reduceMotionMQ.addEventListener("change", (e) => {
    reduceMotion = e.matches;
    rmBadge.hidden = !reduceMotion;
  });

  // ---- Spring parameters (live) ----
  const params = {
    stiffness: Number(stiffnessEl.value),
    damping: Number(dampingEl.value),
    resistance: Number(resistanceEl.value),
  };

  const PRESETS = {
    snappy: { stiffness: 480, damping: 34, resistance: 45 },
    smooth: { stiffness: 220, damping: 26, resistance: 55 },
    wobbly: { stiffness: 300, damping: 12, resistance: 65 },
    molasses: { stiffness: 90, damping: 26, resistance: 80 },
  };

  const CARD_DATA = [
    { title: "Payments", meta: "svc/pay", c1: "#a78bfa", c2: "#6d28d9" },
    { title: "Auth", meta: "svc/auth", c1: "#67e8f9", c2: "#0e7490" },
    { title: "Search", meta: "svc/search", c1: "#6ee7b7", c2: "#047857" },
    { title: "Media", meta: "svc/media", c1: "#fcd34d", c2: "#b45309" },
    { title: "Queue", meta: "svc/queue", c1: "#fda4af", c2: "#9f1239" },
    { title: "Metrics", meta: "svc/metrics", c1: "#c4b5fd", c2: "#5b21b6" },
  ];

  const cards = [];
  let active = null; // currently dragged card

  // ---- Layout the grid homes ----
  function computeHomes() {
    const rect = board.getBoundingClientRect();
    const sample = document.querySelector(".card");
    const cw = sample ? sample.offsetWidth : 158;
    const ch = sample ? sample.offsetHeight : 118;
    const gap = 18;
    const pad = 20;
    const cols = Math.max(1, Math.floor((rect.width - pad * 2 + gap) / (cw + gap)));
    return { cw, ch, gap, pad, cols, width: rect.width, height: rect.height };
  }

  function assignHomes() {
    const L = computeHomes();
    cards.forEach((card, i) => {
      const col = i % L.cols;
      const row = Math.floor(i / L.cols);
      card.homeX = L.pad + col * (L.cw + L.gap);
      card.homeY = L.pad + row * (L.ch + L.gap);
      card.cw = L.cw;
      card.ch = L.ch;
      card.el.style.left = card.homeX + "px";
      card.el.style.top = card.homeY + "px";
    });
    boardBounds = L;
  }

  let boardBounds = null;

  // ---- Build cards ----
  function build() {
    board.innerHTML = "";
    cards.length = 0;
    CARD_DATA.forEach((d, i) => {
      const el = document.createElement("div");
      el.className = "card";
      el.tabIndex = 0;
      el.style.setProperty("--c1", d.c1);
      el.style.setProperty("--c2", d.c2);
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `${d.title} card. Drag to fling, or use arrow keys to nudge.`);
      el.innerHTML =
        `<span class="grab"><i></i><i></i><i></i><i></i><i></i><i></i></span>` +
        `<span class="c-idx">#${String(i + 1).padStart(2, "0")}</span>` +
        `<span class="c-title">${d.title}</span>` +
        `<span class="c-meta">${d.meta}</span>`;
      board.appendChild(el);

      const card = {
        el, index: i, title: d.title,
        x: 0, y: 0,        // offset from home
        vx: 0, vy: 0,      // velocity px/s
        homeX: 0, homeY: 0,
        cw: 158, ch: 118,
        springing: false,
      };
      cards.push(card);
      attachDrag(card);
      attachKeys(card);
    });
    assignHomes();
    render();
  }

  function render() {
    for (const c of cards) {
      c.el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0)`;
    }
  }

  // ---- Over-drag rubber-band resistance ----
  // Once the card's edge passes the board bound, extra travel is compressed.
  function rubberBand(offset, home, size, min, max) {
    const strength = params.resistance / 100; // 0..1
    if (strength <= 0) return offset;
    const pos = home + offset;
    let over = 0;
    if (pos < min) over = pos - min;
    else if (pos + size > max) over = pos + size - max;
    if (over === 0) return offset;
    // logarithmic compression of the overshoot portion
    const sign = Math.sign(over);
    const abs = Math.abs(over);
    const damped = sign * (1 - 1 / (abs * 0.0055 * (0.15 + strength) + 1)) / (0.0055 * (0.15 + strength));
    return offset - over + damped;
  }

  // ---- Pointer drag ----
  function attachDrag(card) {
    const el = card.el;

    el.addEventListener("pointerdown", (e) => {
      if (e.button != null && e.button !== 0) return;
      el.setPointerCapture(e.pointerId);
      card.springing = false;
      card.el.classList.add("dragging");
      card.el.classList.remove("settling");
      active = card;

      const startX = e.clientX;
      const startY = e.clientY;
      const baseX = card.x;
      const baseY = card.y;

      // velocity sampling
      let lastX = e.clientX, lastY = e.clientY, lastT = performance.now();
      card.vx = 0; card.vy = 0;

      const onMove = (ev) => {
        const now = performance.now();
        const dt = Math.max(1, now - lastT) / 1000;
        card.vx = (ev.clientX - lastX) / dt;
        card.vy = (ev.clientY - lastY) / dt;
        lastX = ev.clientX; lastY = ev.clientY; lastT = now;

        let nx = baseX + (ev.clientX - startX);
        let ny = baseY + (ev.clientY - startY);
        // apply rubber-band at board edges
        nx = rubberBand(nx, card.homeX, card.cw, 0, boardBounds.width);
        ny = rubberBand(ny, card.homeY, card.ch, 0, boardBounds.height);
        card.x = nx; card.y = ny;
        card.el.style.transform = `translate3d(${nx.toFixed(2)}px, ${ny.toFixed(2)}px, 0)`;
        updateReadout(card, "drag");
      };

      const onUp = (ev) => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
        try { el.releasePointerCapture(ev.pointerId); } catch (_) {}
        card.el.classList.remove("dragging");
        // hand velocity to the spring
        release(card);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
      e.preventDefault();
    });
  }

  // ---- Keyboard nudge ----
  function attachKeys(card) {
    card.el.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 40 : 16;
      let handled = true;
      switch (e.key) {
        case "ArrowLeft": card.x -= step; card.vx = -320; break;
        case "ArrowRight": card.x += step; card.vx = 320; break;
        case "ArrowUp": card.y -= step; card.vy = -320; break;
        case "ArrowDown": card.y += step; card.vy = 320; break;
        case "Enter": case " ": card.x += 0; card.vx = 0; card.vy = 0; break;
        default: handled = false;
      }
      if (handled) {
        e.preventDefault();
        active = card;
        release(card);
      }
    });
  }

  // ---- Release: start the spring ----
  function release(card) {
    if (reduceMotion) {
      card.x = 0; card.y = 0; card.vx = 0; card.vy = 0;
      card.springing = false;
      card.el.classList.remove("settling");
      card.el.style.transform = "translate3d(0,0,0)";
      updateReadout(card, "rest");
      return;
    }
    card.springing = true;
    card.el.classList.add("settling");
    updateReadout(card, "spring");
    ensureLoop();
  }

  // ---- The integrator loop (semi-implicit Euler damped spring) ----
  let rafId = null;
  let lastFrame = 0;
  const REST_POS = 0.15;   // px
  const REST_VEL = 12;     // px/s

  function ensureLoop() {
    if (rafId != null) return;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(step);
  }

  function step(now) {
    // clamp dt so a tab-switch doesn't explode the sim
    let dt = (now - lastFrame) / 1000;
    lastFrame = now;
    if (dt > 0.032) dt = 0.032;
    if (dt <= 0) dt = 1 / 60;

    const k = params.stiffness;
    const c = params.damping;
    let anySpringing = false;
    let readoutCard = active && active.springing ? active : null;

    for (const card of cards) {
      if (!card.springing) continue;
      anySpringing = true;

      // sub-step for stability with stiff springs
      const sub = 2;
      const h = dt / sub;
      for (let s = 0; s < sub; s++) {
        // acceleration toward home (target offset = 0)
        const ax = -k * card.x - c * card.vx;
        const ay = -k * card.y - c * card.vy;
        card.vx += ax * h;
        card.vy += ay * h;
        card.x += card.vx * h;
        card.y += card.vy * h;
      }

      // rest test
      const speed = Math.hypot(card.vx, card.vy);
      const dist = Math.hypot(card.x, card.y);
      if (speed < REST_VEL && dist < REST_POS) {
        card.x = 0; card.y = 0; card.vx = 0; card.vy = 0;
        card.springing = false;
        card.el.classList.remove("settling");
        if (active === card) updateReadout(card, "rest");
      }
    }

    render();
    if (readoutCard && readoutCard.springing) updateReadout(readoutCard, "spring");

    if (anySpringing) {
      rafId = requestAnimationFrame(step);
    } else {
      rafId = null;
    }
  }

  // ---- Readout / energy meter ----
  function updateReadout(card, state) {
    roCard.textContent = card ? card.title : "—";
    const speed = card ? Math.hypot(card.vx, card.vy) : 0;
    roVel.textContent = `${Math.round(speed)} px/s`;
    roOff.textContent = card ? `${Math.round(card.x)}, ${Math.round(card.y)}` : "0, 0";

    if (state === "drag") {
      roState.innerHTML = '<span class="chip chip-drag">dragging</span>';
    } else if (state === "spring") {
      roState.innerHTML = '<span class="chip chip-spring">springing</span>';
    } else {
      roState.innerHTML = '<span class="chip chip-rest">at rest</span>';
    }

    // spring energy ~ kinetic + potential, normalised for display
    let energy = 0;
    if (card) {
      const k = params.stiffness;
      const kinetic = 0.5 * (card.vx * card.vx + card.vy * card.vy);
      const potential = 0.5 * k * (card.x * card.x + card.y * card.y);
      energy = kinetic + potential;
    }
    const pct = Math.max(0, Math.min(100, Math.round(Math.sqrt(energy) / 42)));
    energyFill.style.width = pct + "%";
    energyPct.textContent = pct + "%";
  }

  // ---- Controls wiring ----
  function syncOutputs() {
    stiffnessOut.textContent = params.stiffness;
    dampingOut.textContent = params.damping;
    resistanceOut.textContent = params.resistance;
  }

  stiffnessEl.addEventListener("input", () => { params.stiffness = Number(stiffnessEl.value); syncOutputs(); markPreset(); });
  dampingEl.addEventListener("input", () => { params.damping = Number(dampingEl.value); syncOutputs(); markPreset(); });
  resistanceEl.addEventListener("input", () => { params.resistance = Number(resistanceEl.value); syncOutputs(); markPreset(); });

  const presetBtns = Array.from(document.querySelectorAll(".presets button"));
  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = PRESETS[btn.dataset.preset];
      if (!p) return;
      params.stiffness = p.stiffness;
      params.damping = p.damping;
      params.resistance = p.resistance;
      stiffnessEl.value = p.stiffness;
      dampingEl.value = p.damping;
      resistanceEl.value = p.resistance;
      syncOutputs();
      markPreset();
      // give a little kick to the first card so the effect is felt
      demoFling();
    });
  });

  function markPreset() {
    let matched = null;
    for (const key in PRESETS) {
      const p = PRESETS[key];
      if (p.stiffness === params.stiffness && p.damping === params.damping && p.resistance === params.resistance) {
        matched = key; break;
      }
    }
    presetBtns.forEach((b) => b.classList.toggle("active", b.dataset.preset === matched));
  }

  function demoFling() {
    if (reduceMotion || cards.length === 0) return;
    const c = cards[0];
    c.x = 130; c.y = -60;
    c.vx = -260; c.vy = 340;
    active = c;
    release(c);
  }

  resetBtn.addEventListener("click", () => {
    for (const card of cards) {
      card.x = 0; card.y = 0; card.vx = 0; card.vy = 0;
      card.springing = false;
      card.el.classList.remove("settling", "dragging");
      card.el.style.transform = "translate3d(0,0,0)";
    }
    if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
    active = null;
    updateReadout(null, "rest");
  });

  // reflow homes on resize
  let resizeRaf = null;
  window.addEventListener("resize", () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      assignHomes();
      render();
    });
  });

  // ---- Init ----
  build();
  syncOutputs();
  markPreset();
  updateReadout(null, "rest");
})();
