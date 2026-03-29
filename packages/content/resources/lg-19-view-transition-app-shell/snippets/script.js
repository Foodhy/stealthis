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

const routes = {
  overview: {
    title: "Overview",
    sections: {
      summary: {
        title: "Executive Summary",
        text: "High-level status modules with minimal noise and clear signal.",
        cards: [
          { k: "Health", v: "97%", d: "All systems nominal" },
          { k: "Velocity", v: "+18%", d: "vs previous cycle" },
          { k: "Focus", v: "4 themes", d: "active initiatives" },
        ],
      },
      activity: {
        title: "Recent Activity",
        text: "Stream of notable state changes and deployment checkpoints.",
        cards: [
          { k: "Releases", v: "3", d: "this week" },
          { k: "Rollbacks", v: "0", d: "stable channel" },
          { k: "Incidents", v: "1", d: "resolved" },
        ],
      },
    },
  },
  analytics: {
    title: "Analytics",
    sections: {
      trends: {
        title: "Trend View",
        text: "Behavior and conversion movement over the current window.",
        cards: [
          { k: "CTR", v: "4.8%", d: "upward trend" },
          { k: "Retention", v: "72%", d: "week 4" },
          { k: "Bounce", v: "21%", d: "improved" },
        ],
      },
      funnels: {
        title: "Funnel View",
        text: "Step-to-step conversion and drop-off highlights.",
        cards: [
          { k: "Visit > Signup", v: "26%", d: "strong top funnel" },
          { k: "Signup > Trial", v: "58%", d: "good activation" },
          { k: "Trial > Paid", v: "31%", d: "optimize onboarding" },
        ],
      },
    },
  },
  settings: {
    title: "Settings",
    sections: {
      profile: {
        title: "Profile Preferences",
        text: "Identity, workspace defaults, and appearance settings.",
        cards: [
          { k: "Locale", v: "en-US", d: "default language" },
          { k: "Time zone", v: "Local", d: "automatic" },
          { k: "Density", v: "Comfort", d: "balanced layout" },
        ],
      },
      access: {
        title: "Access Control",
        text: "Role assignment and policy visibility in one place.",
        cards: [
          { k: "Admins", v: "2", d: "full access" },
          { k: "Editors", v: "5", d: "project scope" },
          { k: "Viewers", v: "12", d: "read-only" },
        ],
      },
    },
  },
};

const state = { route: "overview", section: "summary" };
const reduced = window.MotionPreference.prefersReducedMotion();

const primaryNav = document.getElementById("primaryNav");
const subNav = document.getElementById("subNav");
const content = document.getElementById("content");
const support = document.getElementById("support");

function transition(update) {
  if (!reduced && document.startViewTransition) {
    document.startViewTransition(update);
  } else {
    update();
  }
}

function routeSections(route) {
  return Object.keys(routes[route].sections);
}

function renderPrimaryNav() {
  primaryNav.innerHTML = "";

  Object.keys(routes).forEach((routeKey) => {
    const btn = document.createElement("button");
    btn.className = `nav-btn ${state.route === routeKey ? "active" : ""}`;
    btn.textContent = routes[routeKey].title;
    btn.addEventListener("click", () => {
      if (state.route === routeKey) return;
      transition(() => {
        state.route = routeKey;
        state.section = routeSections(routeKey)[0];
        render();
      });
    });
    primaryNav.appendChild(btn);
  });
}

function renderSubNav() {
  subNav.innerHTML = "";

  routeSections(state.route).forEach((sectionKey) => {
    const btn = document.createElement("button");
    btn.className = `sub-btn ${state.section === sectionKey ? "active" : ""}`;
    btn.textContent = sectionKey;
    btn.addEventListener("click", () => {
      if (state.section === sectionKey) return;
      transition(() => {
        state.section = sectionKey;
        renderContent();
        renderSubNav();
      });
    });
    subNav.appendChild(btn);
  });
}

function renderContent() {
  const section = routes[state.route].sections[state.section];

  content.innerHTML = `
    <div class="content-head">
      <p class="eyebrow" style="view-transition-name:app-kicker">${routes[state.route].title}</p>
      <h2 style="view-transition-name:app-title">${section.title}</h2>
      <p class="muted" style="view-transition-name:app-desc">${section.text}</p>
    </div>
    <div class="cards">
      ${section.cards
        .map(
          (card) => `
            <article class="card">
              <h3>${card.k}</h3>
              <strong>${card.v}</strong>
              <p>${card.d}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSupport() {
  if (document.startViewTransition && !reduced) {
    support.textContent = "App-shell transitions enabled with nested state updates.";
    support.classList.add("ok");
  } else {
    support.textContent = "Fallback mode: nested navigation updates instantly.";
    support.classList.add("warn");
  }
}

function render() {
  renderPrimaryNav();
  renderSubNav();
  renderContent();
}

renderSupport();
render();
