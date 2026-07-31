/* DIY — Exploded View Animation
   Scroll-driven (sticky stage) with slider scrub, Explode/Assemble buttons,
   clickable callouts and a reduced-motion fallback. Vanilla JS only. */
(function () {
  "use strict";

  // ---------- data ----------
  const LAYERS = [
    {
      id: "keycaps",
      name: "Keycaps",
      part: "KC-PBT-68",
      count: 68,
      material: "Dye-sub PBT plastic, 1.4 mm walls, Cherry profile.",
      fact: "PBT resists finger-oil shine roughly 4× longer than ABS — that is why the legends still look freshly stenciled after a year.",
      offset: -150, // px in SVG units at full explode
      fadeStart: 0.08,
      band: [0.06, 0.24],
    },
    {
      id: "switches",
      name: "Switches",
      part: "SW-TAC-62",
      count: 68,
      material: "POM stem, nylon housing, 62 g tactile spring.",
      fact: "Each switch is factory-lubed on the spring only — the tactile leg stays dry so the bump keeps its snap.",
      offset: -80,
      fadeStart: 0.26,
      band: [0.24, 0.42],
    },
    {
      id: "plate",
      name: "Plate",
      part: "PL-ALU-15",
      count: 1,
      material: "1.5 mm aluminum 5052, bead-blasted, 68 cutouts.",
      fact: "The half-slot relief cuts around the spacebar let the plate flex ~0.3 mm, softening bottom-out without losing alignment.",
      offset: -20,
      fadeStart: 0.44,
      band: [0.42, 0.6],
    },
    {
      id: "pcb",
      name: "PCB",
      part: "PCB-HS-R3",
      count: 1,
      material: "FR-4, 1.6 mm, hot-swap sockets, USB-C daughterboard.",
      fact: "Every socket is rated for 100+ swaps — the whole switch layer comes out with zero soldering.",
      offset: 50,
      fadeStart: 0.62,
      band: [0.6, 0.78],
    },
    {
      id: "case",
      name: "Case",
      part: "CS-CNC-2P",
      count: 2,
      material: "CNC aluminum 6063, sandblasted + anodized, 2-piece.",
      fact: "Top and bottom halves are gasket-mounted — eight silicone strips mean no metal ever touches metal.",
      offset: 130,
      fadeStart: 0.8,
      band: [0.78, 1.01],
    },
  ];
  const TOTAL_PARTS = 141;

  // ---------- elements ----------
  const stage = document.getElementById("scroll-stage");
  const slider = document.getElementById("scrub");
  const readout = document.getElementById("scrub-readout");
  const railFill = document.getElementById("rail-fill");
  const railPct = document.getElementById("rail-pct");
  const status = document.getElementById("stage-status");
  const btnExplode = document.getElementById("btn-explode");
  const btnAssemble = document.getElementById("btn-assemble");
  const infoCard = document.getElementById("info-card");
  const infoPart = document.getElementById("info-part");
  const infoCount = document.getElementById("info-count");
  const infoName = document.getElementById("info-name");
  const infoMaterial = document.getElementById("info-material");
  const infoFact = document.getElementById("info-fact");
  const toastEl = document.getElementById("toast");

  const groups = {};
  const callouts = {};
  const listItems = {};
  LAYERS.forEach((l) => {
    groups[l.id] = document.getElementById("g-" + l.id);
    callouts[l.id] = document.getElementById("lbl-" + l.id);
    listItems[l.id] = document.querySelector('.layer-item[data-layer="' + l.id + '"]');
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- state ----------
  let progress = 0; // 0..1
  let animRaf = null;
  let scrollRaf = null;
  let selectedId = null;
  let toastTimer = null;

  // ---------- helpers ----------
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  // ---------- render ----------
  function render(p) {
    progress = clamp(p, 0, 1);
    const pct = Math.round(progress * 100);

    LAYERS.forEach((l, i) => {
      // slight per-layer stagger for a mechanical, sequential feel
      const lp = clamp(progress * 1.12 - i * 0.03, 0, 1);
      const y = l.offset * easeInOut(lp);
      groups[l.id].style.transform = "translateY(" + y + "px)";

      const visible = progress >= l.fadeStart;
      callouts[l.id].classList.toggle("is-visible", visible);
    });

    // progress rail + slider + readouts
    railFill.style.height = pct + "%";
    railPct.textContent = pct + "%";
    readout.textContent = pct + "%";
    slider.value = String(Math.round(progress * 1000));
    slider.style.setProperty("--fill", pct + "%");
    slider.setAttribute("aria-valuetext", pct + " percent exploded");

    // status + active layer highlight
    let activeId = null;
    if (progress >= 0.99) {
      status.textContent = "FULLY EXPLODED";
    } else if (progress <= 0.02) {
      status.textContent = "ASSEMBLED";
    } else {
      const active = LAYERS.find((l) => progress >= l.band[0] && progress < l.band[1]);
      if (active) {
        activeId = active.id;
        status.textContent = "SEPARATING · " + active.name.toUpperCase();
      }
    }
    LAYERS.forEach((l) => {
      listItems[l.id].classList.toggle("is-active", l.id === activeId);
    });
  }

  // ---------- info card ----------
  function selectLayer(id) {
    const layer = LAYERS.find((l) => l.id === id);
    if (!layer) return;
    selectedId = id;
    infoPart.textContent = layer.part;
    infoCount.textContent = "×" + layer.count;
    infoName.textContent = String(LAYERS.indexOf(layer) + 1).padStart(2, "0") + " · " + layer.name;
    infoMaterial.textContent = layer.material;
    infoFact.textContent = layer.fact;

    LAYERS.forEach((l) => {
      listItems[l.id].classList.toggle("is-selected", l.id === id);
      groups[l.id].classList.toggle("is-selected", l.id === id);
    });

    infoCard.classList.remove("flash");
    // restart the flash animation
    void infoCard.offsetWidth;
    infoCard.classList.add("flash");
  }

  function resetInfo() {
    selectedId = null;
    infoPart.textContent = "FR-68";
    infoCount.textContent = "×" + TOTAL_PARTS;
    infoName.textContent = "Full assembly";
    infoMaterial.textContent = "Select a layer or callout to inspect its specs.";
    infoFact.textContent = "Every part in this drawing is serviceable with a single T6 driver and a keycap puller.";
    LAYERS.forEach((l) => {
      listItems[l.id].classList.remove("is-selected");
      groups[l.id].classList.remove("is-selected");
    });
  }

  // ---------- scroll driving ----------
  function scrollProgress() {
    const rect = stage.getBoundingClientRect();
    const range = stage.offsetHeight - window.innerHeight;
    if (range <= 0) return 0;
    return clamp(-rect.top / range, 0, 1);
  }

  function onScroll() {
    if (animRaf) return; // button animation owns the scroll right now
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      render(scrollProgress());
    });
  }

  function scrollTargetFor(p) {
    const top = stage.getBoundingClientRect().top + window.scrollY;
    const range = stage.offsetHeight - window.innerHeight;
    return top + p * range;
  }

  // ---------- button animation ----------
  function animateTo(target, label) {
    if (animRaf) cancelAnimationFrame(animRaf);

    if (reduced) {
      render(target);
      toast(label);
      return;
    }

    // Animate window scroll so scroll position and progress stay in sync.
    const fromY = window.scrollY;
    const toY = scrollTargetFor(target);
    const dur = clamp(Math.abs(toY - fromY) * 0.45, 500, 1600);
    const t0 = performance.now();

    function step(now) {
      const t = clamp((now - t0) / dur, 0, 1);
      const y = fromY + (toY - fromY) * easeInOut(t);
      window.scrollTo(0, y);
      render(scrollProgress());
      if (t < 1) {
        animRaf = requestAnimationFrame(step);
      } else {
        animRaf = null;
        toast(label);
      }
    }
    animRaf = requestAnimationFrame(step);
  }

  btnExplode.addEventListener("click", () => animateTo(1, "FULLY EXPLODED · 5 LAYERS APART"));
  btnAssemble.addEventListener("click", () => animateTo(0, "REASSEMBLED · TORQUE TO 0.4 N·M"));

  // ---------- slider scrub ----------
  slider.addEventListener("input", () => {
    if (animRaf) {
      cancelAnimationFrame(animRaf);
      animRaf = null;
    }
    const p = Number(slider.value) / 1000;
    if (reduced) {
      render(p);
    } else {
      // keep scroll position consistent with the scrubbed progress
      window.scrollTo(0, scrollTargetFor(p));
      render(scrollProgress());
    }
  });

  // ---------- layer selection (sidebar + SVG callouts/groups) ----------
  Object.keys(listItems).forEach((id) => {
    listItems[id].addEventListener("click", () => {
      selectLayer(id);
      toast(LAYERS.find((l) => l.id === id).part + " · INSPECTING");
    });
  });

  Object.keys(groups).forEach((id) => {
    const g = groups[id];
    g.addEventListener("click", () => selectLayer(id));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectLayer(id);
      }
    });
  });

  // double-click the info card resets it to the full assembly
  infoCard.addEventListener("dblclick", resetInfo);

  // ---------- init ----------
  if (reduced) {
    document.body.classList.add("reduced");
    document.getElementById("rm-note").hidden = false;
    render(0);
  } else {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    render(scrollProgress());
  }
})();
