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

const items = [
  {
    id: "a",
    title: "Nova Launch",
    category: "Product Reveal",
    color: "linear-gradient(130deg, #5dc8ff, #2155ff)",
    summary: "Hero card transitions into a product release page with implementation notes.",
    difficulty: "intermediate",
    support: "progressive-enhancement",
    stack: ["HTML", "CSS", "View Transitions API", "Vanilla JS"],
    goals: [
      "Preserve visual identity from card to detail hero.",
      "Maintain readable content during transition.",
      "Keep fallback as instant but coherent state swap.",
    ],
    steps: [
      "Assign stable view-transition-name to shared media region.",
      "Trigger state swap with document.startViewTransition.",
      "Render metadata, implementation notes, and testing checklist.",
    ],
    perf: "Only one shared element animates; other content fades with default transition behavior.",
    a11y: "Fallback path is immediate and keeps same document reading order.",
  },
  {
    id: "b",
    title: "Neon Chamber",
    category: "Portfolio Case",
    color: "linear-gradient(130deg, #ff7ddb, #9d31ff)",
    summary: "Case study layout for studio project detail pages.",
    difficulty: "intermediate",
    support: "progressive-enhancement",
    stack: ["HTML", "CSS", "State Rendering", "View Transitions API"],
    goals: [
      "Use one source of truth for grid and detail data.",
      "Avoid duplicate templates for project information.",
      "Support future route-level transitions.",
    ],
    steps: [
      "Store card and detail data in one JS object.",
      "Map data to grid cards and detail panels.",
      "Use same view-transition-name token for matching elements.",
    ],
    perf: "Small DOM updates and template cloning keep transitions responsive.",
    a11y: "Back action restores previous list context with low cognitive load.",
  },
  {
    id: "c",
    title: "Solar Grid",
    category: "Dashboard Entry",
    color: "linear-gradient(130deg, #ffe28a, #ff7f3a)",
    summary: "Card-to-detail pattern suitable for analytics sections.",
    difficulty: "intermediate",
    support: "requires-fallback",
    stack: ["HTML", "CSS", "View Transitions", "Component Data"],
    goals: [
      "Attach business metadata to each card.",
      "Surface transition strategy and technical tradeoffs.",
      "Keep design clean under dense information.",
    ],
    steps: [
      "Render badges for category, difficulty, and support mode.",
      "Show implementation lists in two-column detail layout.",
      "Use lightweight styles to keep visual hierarchy clear.",
    ],
    perf: "No canvas/WebGL here, so this demo isolates route transition behavior.",
    a11y: "Avoids motion-dependent meaning by keeping complete text in both states.",
  },
  {
    id: "d",
    title: "Shadow Arena",
    category: "Campaign Landing",
    color: "linear-gradient(130deg, #7ca3d4, #263f64)",
    summary: "Transition strategy for campaign tiles opening full narratives.",
    difficulty: "intermediate",
    support: "progressive-enhancement",
    stack: ["View Transitions API", "CSS Gradients", "Vanilla JS"],
    goals: [
      "Demonstrate safe fallback on unsupported browsers.",
      "Keep interactions simple for codebase adoption.",
      "Provide a reusable base for advanced cases (Demo 17-20).",
    ],
    steps: [
      "Detect API support at runtime.",
      "If unsupported, execute direct update without animation.",
      "If supported, animate shared region and swap content.",
    ],
    perf: "Transition cost scales mostly with changing DOM surface area.",
    a11y: "Works with keyboard navigation and visible back control.",
  },
];

const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");

function supportMessage() {
  return document.startViewTransition
    ? {
        text: "View Transitions API detected: animated shared-element transitions are enabled.",
        cls: "ok",
      }
    : {
        text: "View Transitions API not detected: demo uses immediate fallback updates.",
        cls: "warn",
      };
}

function badge(text) {
  return `<span class="badge">${text}</span>`;
}

function renderGrid() {
  const t = document.getElementById("gridTemplate");
  app.replaceChildren(t.content.cloneNode(true));

  const status = supportMessage();
  const supportLine = document.getElementById("supportLine");
  supportLine.textContent = status.text;
  supportLine.classList.add(status.cls);

  const grid = document.getElementById("cardGrid");

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="thumb" style="background:${item.color};view-transition-name:card-thumb-${item.id}"></div>
      <div class="card-head">
        <p class="kicker">${item.category}</p>
        <h2>${item.title}</h2>
      </div>
      <div class="meta-row">
        ${badge(item.difficulty)}
        ${badge(item.support)}
      </div>
      <p class="summary">${item.summary}</p>
      <div class="meta-row">${item.stack
        .slice(0, 2)
        .map((x) => badge(x))
        .join("")}</div>
    `;

    card.addEventListener("click", () => openDetail(item.id));
    grid.appendChild(card);
  });
}

function renderDetail(id) {
  const item = items.find((x) => x.id === id);
  const t = document.getElementById("detailTemplate");
  app.replaceChildren(t.content.cloneNode(true));
  const root = document.getElementById("detailRoot");

  root.innerHTML = `
    <div class="hero-thumb" style="background:${item.color};view-transition-name:card-thumb-${item.id}"></div>
    <div class="header-block">
      <p class="kicker">${item.category}</p>
      <h1>${item.title}</h1>
      <div class="meta-row">
        ${badge(item.difficulty)}
        ${badge(item.support)}
        ${badge("Demo 16")}
      </div>
      <p class="description">${item.summary}</p>
    </div>

    <div class="info-grid">
      <section class="panel">
        <h3>Transition Goals</h3>
        <ul class="list">${item.goals.map((x) => `<li>${x}</li>`).join("")}</ul>
      </section>

      <section class="panel">
        <h3>Implementation Steps</h3>
        <ol class="list">${item.steps.map((x) => `<li>${x}</li>`).join("")}</ol>
      </section>

      <section class="panel">
        <h3>Tech Stack</h3>
        <div class="stack">${item.stack.map((x) => badge(x)).join("")}</div>
      </section>

      <section class="panel">
        <h3>Quality Notes</h3>
        <ul class="list">
          <li><strong>Performance:</strong> ${item.perf}</li>
          <li><strong>Accessibility:</strong> ${item.a11y}</li>
          <li><strong>Fallback:</strong> If API support is missing, content still updates instantly.</li>
        </ul>
      </section>
    </div>
  `;
}

function transition(update) {
  if (document.startViewTransition) {
    document.startViewTransition(update);
  } else {
    update();
  }
}

function openDetail(id) {
  backBtn.hidden = false;
  transition(() => renderDetail(id));
}

function goBack() {
  backBtn.hidden = true;
  transition(renderGrid);
}

backBtn.addEventListener("click", goBack);

renderGrid();
