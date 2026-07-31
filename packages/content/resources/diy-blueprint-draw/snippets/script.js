/* Northgate Fabrication — blueprint line-draw effect
   Vanilla JS. Sequences SVG layers: outlines → hatch → centre lines →
   extension lines → dimension lines → labels → title block. */
(() => {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");

  const LAYERS = [
    { id: 1, name: "Outlines",        mode: "stroke", dur: 1400, gap: 900 },
    { id: 2, name: "Section hatch",   mode: "fade",   dur: 420,  gap: 320, key: "hatch"  },
    { id: 3, name: "Centre lines",    mode: "stroke", dur: 600,  gap: 420, key: "centre" },
    { id: 4, name: "Extension lines", mode: "stroke", dur: 520,  gap: 380, key: "dim"    },
    { id: 5, name: "Dimension lines", mode: "stroke", dur: 520,  gap: 400, key: "dim"    },
    { id: 6, name: "Dimension text",  mode: "fade",   dur: 420,  gap: 340, key: "dim"    },
    { id: 7, name: "Title block",     mode: "fade",   dur: 420,  gap: 300, key: "title"  }
  ];

  /* ── toast ─────────────────────────────── */
  const toastEl = document.getElementById("toast");
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.dataset.show = "1";
    clearTimeout(toastT);
    toastT = setTimeout(() => { toastEl.dataset.show = "0"; }, 2200);
  }

  /* ── drawing controller ────────────────── */
  function makePlate(plateEl, svgEl, opts = {}) {
    const groups = new Map();
    LAYERS.forEach(l => {
      const g = svgEl.querySelector(`.layer[data-layer="${l.id}"]`);
      if (g) groups.set(l.id, g);
    });

    // measure every strokeable path once
    const measured = new WeakMap();
    function lengthOf(el) {
      if (measured.has(el)) return measured.get(el);
      let len = 0;
      try { len = el.getTotalLength(); } catch (e) { len = 0; }
      if (!len || !isFinite(len)) {
        const b = el.getBBox();
        len = (b.width + b.height) * 2 || 200;
      }
      measured.set(el, len);
      return len;
    }

    const visible = { hatch: true, centre: true, dim: true, title: true };
    let speed = 1;
    let timers = [];
    let shown = 0;            // how many layers are currently inked
    let stepping = false;

    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function reset() {
      clearTimers();
      shown = 0;
      plateEl.dataset.state = "idle";
      groups.forEach(g => {
        g.style.visibility = "";
        g.querySelectorAll(".stroking, .fading").forEach(el => {
          el.classList.remove("stroking", "fading");
          el.style.removeProperty("stroke-dasharray");
          el.style.removeProperty("stroke-dashoffset");
          el.style.removeProperty("--len");
          el.style.removeProperty("--dur");
          el.style.removeProperty("--delay");
          el.style.removeProperty("opacity");
        });
      });
      applyVisibility();
      report();
    }

    /* ink one layer; delay is only used in continuous mode */
    function inkLayer(layer, delayMs) {
      const g = groups.get(layer.id);
      if (!g) return 0;
      g.style.visibility = "visible";

      if (layer.mode === "stroke") {
        const items = [...g.querySelectorAll("path, circle, line, rect")];
        const per = items.length ? layer.dur / items.length : layer.dur;
        items.forEach((el, i) => {
          const len = lengthOf(el);
          el.style.strokeDasharray = `${len} ${len}`;
          el.style.setProperty("--len", len);
          el.style.setProperty("--dur", `${Math.max(layer.dur * 0.55, per * 2.2)}ms`);
          el.style.setProperty("--delay", `${delayMs + i * per * 0.55}ms`);
          el.classList.add("stroking");
        });
      } else {
        const items = [...g.children];
        const per = items.length ? Math.min(120, layer.dur / items.length) : 0;
        items.forEach((el, i) => {
          el.style.setProperty("--delay", `${delayMs + i * per}ms`);
          el.classList.add("fading");
        });
      }
      return layer.dur;
    }

    function instant() {
      clearTimers();
      plateEl.dataset.state = "done";
      shown = LAYERS.length;
      LAYERS.forEach(l => {
        const g = groups.get(l.id);
        if (!g) return;
        g.style.visibility = "visible";
        g.querySelectorAll("*").forEach(el => {
          el.style.removeProperty("stroke-dasharray");
          el.style.opacity = "1";
        });
        g.querySelectorAll(".hatchfill").forEach(el => { el.style.opacity = "1"; });
      });
      applyVisibility();
      report();
    }

    function play() {
      reset();
      if (REDUCED.matches) { instant(); return; }
      plateEl.dataset.state = "drawing";
      let t = 0;
      LAYERS.forEach((layer) => {
        if (!isOn(layer)) return;
        const at = t;
        timers.push(setTimeout(() => { shown = layer.id; report(); }, at / speed));
        inkLayer(layer, at);
        t += layer.gap + layer.dur * 0.55;
      });
      timers.push(setTimeout(() => {
        plateEl.dataset.state = "done";
        shown = LAYERS.length;
        report();
      }, t / speed + 500));
    }

    /* step-through */
    function stepNext() {
      if (shown === 0) {
        clearTimers();
        plateEl.dataset.state = "drawing";
      }
      let n = shown + 1;
      while (n <= LAYERS.length && !isOn(LAYERS[n - 1])) n++;
      if (n > LAYERS.length) { toast("Drawing complete — all layers inked."); return; }
      inkLayer(LAYERS[n - 1], 0);
      shown = n;
      if (shown >= LAYERS.length) plateEl.dataset.state = "done";
      report();
    }

    function stepPrev() {
      if (shown === 0) return;
      let n = shown;
      const g = groups.get(LAYERS[n - 1].id);
      if (g) {
        g.style.visibility = "hidden";
        g.querySelectorAll(".stroking, .fading").forEach(el => {
          el.classList.remove("stroking", "fading");
          el.style.removeProperty("opacity");
        });
      }
      n--;
      while (n > 0 && !isOn(LAYERS[n - 1])) n--;
      shown = n;
      plateEl.dataset.state = shown === 0 ? "idle" : "drawing";
      report();
    }

    function isOn(layer) { return !layer.key || visible[layer.key]; }

    function applyVisibility() {
      LAYERS.forEach(l => {
        const g = groups.get(l.id);
        if (!g) return;
        g.hidden = !isOn(l);
      });
    }

    function setVisible(key, on) {
      visible[key] = on;
      applyVisibility();
      report();
    }

    function setSpeed(v) {
      speed = v;
      plateEl.style.setProperty("--speed", v);
    }

    const listeners = [];
    function report() { listeners.forEach(fn => fn({ shown, visible, isOn })); }

    return {
      play, reset, instant, stepNext, stepPrev, setVisible, setSpeed,
      onChange: fn => { listeners.push(fn); fn({ shown, visible, isOn }); },
      get shown() { return shown; },
      get stepping() { return stepping; },
      set stepping(v) { stepping = v; },
      svg: svgEl
    };
  }

  /* ── main plate wiring ─────────────────── */
  const plate = makePlate(document.getElementById("plate"), document.getElementById("dwg"));

  const legendEl = document.getElementById("legend");
  LAYERS.forEach(l => {
    const li = document.createElement("li");
    li.dataset.layer = l.id;
    li.innerHTML = `<span class="dot"></span><span>${String(l.id).padStart(2, "0")} ${l.name}</span>`;
    legendEl.appendChild(li);
  });

  const statusEl = document.getElementById("status");
  const stepCount = document.getElementById("stepCount");

  plate.onChange(({ shown, isOn }) => {
    LAYERS.forEach(l => {
      const li = legendEl.querySelector(`li[data-layer="${l.id}"]`);
      const on = isOn(l);
      li.dataset.off = on ? "0" : "1";
      li.dataset.on = on && shown >= l.id ? "1" : "0";
      li.dataset.cur = on && shown === l.id ? "1" : "0";
    });
    const active = LAYERS.filter(isOn).length;
    const done = LAYERS.filter(l => isOn(l) && shown >= l.id).length;
    stepCount.textContent = `${done} / ${active}`;
    statusEl.textContent =
      shown === 0 ? "IDLE" : done >= active ? "DRAWING COMPLETE" : `INKING · ${LAYERS[shown - 1].name.toUpperCase()}`;
    statusEl.dataset.live = shown > 0 && done < active ? "1" : "0";
  });

  document.getElementById("replay").addEventListener("click", () => {
    if (stepModeEl.checked) { plate.reset(); toast("Reset — press Next to ink layer 01."); }
    else { plate.play(); toast("Redrawing sheet NG-4821…"); }
  });

  const stepModeEl = document.getElementById("stepMode");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  function syncStepUi() {
    const on = stepModeEl.checked;
    prevBtn.disabled = !on;
    nextBtn.disabled = !on;
  }
  stepModeEl.addEventListener("change", () => {
    syncStepUi();
    plate.reset();
    if (stepModeEl.checked) toast("Step-through on — advance one layer at a time.");
    else { plate.play(); }
  });
  syncStepUi();

  prevBtn.addEventListener("click", () => plate.stepPrev());
  nextBtn.addEventListener("click", () => plate.stepNext());

  const speedEl = document.getElementById("speed");
  const speedOut = document.getElementById("speedOut");
  speedEl.addEventListener("input", () => {
    const v = parseFloat(speedEl.value);
    speedOut.textContent = v.toFixed(1) + "×";
    plate.setSpeed(v);
  });
  plate.setSpeed(1);

  const toggleMap = { tDim: "dim", tHatch: "hatch", tCentre: "centre", tTitle: "title" };
  Object.keys(toggleMap).forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("change", () => {
      plate.setVisible(toggleMap[id], el.checked);
      toast(`${el.parentElement.textContent.trim()} ${el.checked ? "shown" : "hidden"}`);
    });
  });

  /* ── label ↔ edge highlighting ─────────── */
  const dwg = document.getElementById("dwg");
  function hot(edge, on) {
    dwg.querySelectorAll(`[data-edge="${edge}"]`).forEach(el => el.classList.toggle("is-hot", on));
  }
  dwg.querySelectorAll(".lbl[data-edge]").forEach(lbl => {
    const edge = lbl.dataset.edge;
    ["mouseenter", "focus"].forEach(ev => lbl.addEventListener(ev, () => hot(edge, true)));
    ["mouseleave", "blur"].forEach(ev => lbl.addEventListener(ev, () => hot(edge, false)));
    lbl.addEventListener("click", () => toast(`${lbl.getAttribute("aria-label")} — measured on the highlighted edge.`));
    lbl.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); lbl.dispatchEvent(new Event("click")); }
    });
  });

  /* ── secondary detail plate ────────────── */
  const plate2 = makePlate(document.getElementById("plate2"), document.getElementById("dwg2"));
  plate2.setSpeed(1.3);
  document.getElementById("replay2").addEventListener("click", () => {
    plate2.setSpeed(parseFloat(speedEl.value) * 1.3);
    plate2.play();
    toast("Redrawing Detail B…");
  });

  /* ── IntersectionObserver triggers ─────── */
  function observe(target, ctrl, once) {
    if (!("IntersectionObserver" in window)) { ctrl.instant(); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        if (REDUCED.matches) ctrl.instant();
        else if (!stepModeEl.checked || ctrl !== plate) ctrl.play();
        if (once) io.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    io.observe(target);
  }
  observe(document.getElementById("plate"), plate, true);
  observe(document.getElementById("plate2"), plate2, true);

  REDUCED.addEventListener("change", () => { if (REDUCED.matches) { plate.instant(); plate2.instant(); } });

  /* keyboard shortcuts */
  document.addEventListener("keydown", e => {
    if (e.target.matches("input, textarea, select")) return;
    if (e.key === "r" || e.key === "R") { plate.play(); toast("Replay (R)"); }
    if (stepModeEl.checked && e.key === "ArrowRight") plate.stepNext();
    if (stepModeEl.checked && e.key === "ArrowLeft") plate.stepPrev();
  });
})();
