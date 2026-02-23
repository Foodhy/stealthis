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
    id: "n1",
    title: "Pulse Launcher",
    category: "product",
    blurb: "Launch-focused hero with CTA pacing.",
    color: "linear-gradient(130deg,#59c8ff,#294bff)",
  },
  {
    id: "n2",
    title: "Studio Grid",
    category: "portfolio",
    blurb: "Project archive with retained card identity.",
    color: "linear-gradient(130deg,#ff88e9,#8f3fff)",
  },
  {
    id: "n3",
    title: "Arena Promo",
    category: "campaign",
    blurb: "High-energy campaign teaser cards.",
    color: "linear-gradient(130deg,#7da3d8,#293f63)",
  },
  {
    id: "n4",
    title: "Nova Metrics",
    category: "dashboard",
    blurb: "Data cards opening deep detail routes.",
    color: "linear-gradient(130deg,#ffd983,#ff8f3b)",
  },
  {
    id: "n5",
    title: "Cover Story",
    category: "campaign",
    blurb: "Magazine-style featured narrative block.",
    color: "linear-gradient(130deg,#7ce0ff,#00a8c7)",
  },
  {
    id: "n6",
    title: "Studio Case",
    category: "portfolio",
    blurb: "Portfolio details with animation fallback.",
    color: "linear-gradient(130deg,#cb8aff,#7642cf)",
  },
  {
    id: "n7",
    title: "Ops Console",
    category: "dashboard",
    blurb: "Operational cards with dense metadata.",
    color: "linear-gradient(130deg,#ffe7a9,#d38d30)",
  },
  {
    id: "n8",
    title: "Nova Device",
    category: "product",
    blurb: "Product card with staged reveal sections.",
    color: "linear-gradient(130deg,#98f0ff,#4e82ff)",
  },
];

const filters = ["all", "product", "portfolio", "campaign", "dashboard"];

const grid = document.getElementById("grid");
const controls = document.getElementById("controls");
const meta = document.getElementById("meta");
const support = document.getElementById("support");

const reduced = window.MotionPreference.prefersReducedMotion();
const state = { filter: "all" };

function transition(update) {
  if (!reduced && document.startViewTransition) {
    document.startViewTransition(update);
  } else {
    update();
  }
}

function filtered() {
  if (state.filter === "all") return items;
  return items.filter((item) => item.category === state.filter);
}

function renderControls() {
  controls.innerHTML = "";
  filters.forEach((name) => {
    const button = document.createElement("button");
    button.className = `filter ${state.filter === name ? "active" : ""}`;
    button.textContent = name;
    button.addEventListener("click", () => {
      if (state.filter === name) return;
      transition(() => {
        state.filter = name;
        render();
      });
    });
    controls.appendChild(button);
  });
}

function renderGrid() {
  grid.innerHTML = "";
  const list = filtered();

  list.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.viewTransitionName = `card-${item.id}`;

    card.innerHTML = `
      <div class="thumb" style="background:${item.color};view-transition-name:thumb-${item.id}"></div>
      <p class="tag">${item.category}</p>
      <h2>${item.title}</h2>
      <p>${item.blurb}</p>
    `;

    grid.appendChild(card);
  });

  meta.textContent = `${list.length} item(s) visible in "${state.filter}".`;
}

function renderSupport() {
  if (document.startViewTransition && !reduced) {
    support.textContent = "View transitions enabled: shared cards animate between filters.";
    support.classList.add("ok");
  } else {
    support.textContent = "Fallback mode: filters still work, but updates are instant.";
    support.classList.add("warn");
  }
}

function render() {
  renderControls();
  renderGrid();
}

renderSupport();
render();
