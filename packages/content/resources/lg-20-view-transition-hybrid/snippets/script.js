if (!window.MotionPreference) {
  const __mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const __listeners = new Set();

  const MotionPreference = {
    prefersReducedMotion() {
      return __mql.matches;
    },
    setOverride(value) {
      const reduced = Boolean(value);
      document.documentElement.classList.toggle("reduced-motion", reduced);
      window.dispatchEvent(new CustomEvent("motion-preference", { detail: { reduced } }));
      for (const listener of __listeners) {
        try {
          listener({ reduced, override: reduced, systemReduced: __mql.matches });
        } catch {}
      }
    },
    onChange(listener) {
      __listeners.add(listener);
      try {
        listener({
          reduced: __mql.matches,
          override: null,
          systemReduced: __mql.matches,
        });
      } catch {}
      return () => __listeners.delete(listener);
    },
    getState() {
      return { reduced: __mql.matches, override: null, systemReduced: __mql.matches };
    },
  };

  window.MotionPreference = MotionPreference;
}

const entries = [
  {
    id: "h1",
    title: "Launch Track",
    summary: "Hybrid timeline for launch campaign transitions.",
    color: "linear-gradient(130deg,#5cc9ff,#2d54ff)",
    bullets: [
      "Shared thumbnail becomes hero media.",
      "JS panel fade/slide runs after state swap.",
      "Fallback preserves content without animated dependency.",
    ],
  },
  {
    id: "h2",
    title: "Studio Spotlight",
    summary: "Portfolio highlight opening richer case information.",
    color: "linear-gradient(130deg,#ff8eea,#923eff)",
    bullets: [
      "Card identity retained through view-transition-name.",
      "UI controls animate with WAAPI after render.",
      "Close action reverses panel choreography first.",
    ],
  },
  {
    id: "h3",
    title: "Ops Layer",
    summary: "Dashboard module detail with progressive enhancement.",
    color: "linear-gradient(130deg,#ffe19b,#d88937)",
    bullets: [
      "Transition wraps only state mutation.",
      "JS animation coordinates secondary detail elements.",
      "Reduced motion path disables timeline effects.",
    ],
  },
];

const reduced = window.MotionPreference.prefersReducedMotion();
const app = document.getElementById("app");
const support = document.getElementById("support");
const state = { activeId: null };

function canAnimateViewTransition() {
  return document.startViewTransition && !reduced;
}

function transition(update) {
  if (canAnimateViewTransition()) {
    return document.startViewTransition(update);
  }
  update();
  return null;
}

function activeItem() {
  return entries.find((entry) => entry.id === state.activeId);
}

function animateDetailIn() {
  if (reduced) return;
  const panel = document.querySelector(".detail-wrap");
  if (!panel || !panel.animate) return;
  panel.animate(
    [
      { opacity: 0, transform: "translateY(14px) scale(0.99)" },
      { opacity: 1, transform: "translateY(0px) scale(1)" },
    ],
    { duration: 260, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
  );
}

function renderGrid() {
  const t = document.getElementById("gridTemplate");
  app.replaceChildren(t.content.cloneNode(true));
  const grid = document.getElementById("tileGrid");

  entries.forEach((entry) => {
    const tile = document.createElement("article");
    tile.className = "tile";
    tile.style.viewTransitionName = `hybrid-tile-${entry.id}`;
    tile.innerHTML = `
      <div class="tile-media" style="background:${entry.color};view-transition-name:hybrid-media-${entry.id}"></div>
      <h2>${entry.title}</h2>
      <p>${entry.summary}</p>
    `;
    tile.addEventListener("click", () => openDetail(entry.id));
    grid.appendChild(tile);
  });
}

function renderDetail() {
  const item = activeItem();
  const t = document.getElementById("detailTemplate");
  app.replaceChildren(t.content.cloneNode(true));
  const root = document.getElementById("detailRoot");

  root.innerHTML = `
    <div class="hero-media" style="background:${item.color};view-transition-name:hybrid-media-${item.id}"></div>
    <div class="detail-head">
      <p class="eyebrow">Hybrid Coordination</p>
      <h1>${item.title}</h1>
      <p class="muted">${item.summary}</p>
    </div>
    <div class="actions">
      <button class="btn" id="backBtn">Back to Grid</button>
      <button class="btn primary">Apply Pattern</button>
    </div>
    <ul class="list">
      ${item.bullets.map((line) => `<li>${line}</li>`).join("")}
    </ul>
  `;

  document.getElementById("backBtn").addEventListener("click", closeDetail);
}

function openDetail(id) {
  state.activeId = id;
  const vt = transition(renderDetail);
  if (vt && vt.finished) vt.finished.then(animateDetailIn);
  else animateDetailIn();
}

function closeDetail() {
  const panel = document.querySelector(".detail-wrap");

  const closeNow = () => {
    state.activeId = null;
    transition(renderGrid);
  };

  if (reduced || !panel || !panel.animate) {
    closeNow();
    return;
  }

  panel
    .animate(
      [
        { opacity: 1, transform: "translateY(0px) scale(1)" },
        { opacity: 0, transform: "translateY(12px) scale(0.99)" },
      ],
      { duration: 180, easing: "ease-out" }
    )
    .finished.then(closeNow);
}

function renderSupport() {
  if (canAnimateViewTransition()) {
    support.textContent = "Hybrid mode active: View Transition + JS choreography.";
    support.classList.add("ok");
  } else {
    support.textContent = "Fallback mode: transitions are instant, panel behavior remains usable.";
    support.classList.add("warn");
  }
}

renderSupport();
renderGrid();
