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

const root = document.documentElement;
const track = document.getElementById("track");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const storySteps = Array.from(document.querySelectorAll(".story-step"));
const mobileQuery = window.matchMedia("(max-width: 1000px)");

const state = {
  reduced: Boolean(window.MotionPreference && window.MotionPreference.prefersReducedMotion()),
  mobile: mobileQuery.matches,
  raf: 0,
};

const thresholds = [0, 0.36, 0.72];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getScrollProgress() {
  const rect = track.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  if (distance <= 0) return 1;
  return clamp(-rect.top / distance, 0, 1);
}

function applyStepState(progress) {
  let activeIndex = 0;
  if (progress >= thresholds[2]) {
    activeIndex = 2;
  } else if (progress >= thresholds[1]) {
    activeIndex = 1;
  }

  storySteps.forEach((step, index) => {
    step.classList.toggle("active", index <= activeIndex);
  });
}

function render() {
  state.raf = 0;
  const progress = state.reduced || state.mobile ? 1 : getScrollProgress();
  const reveal = 8 + progress * 92;
  const revealText = `${Math.round(reveal)}%`;

  root.style.setProperty("--split-progress", progress.toFixed(4));
  root.style.setProperty("--split-reveal", `${reveal.toFixed(2)}%`);

  progressLabel.textContent = revealText;
  progressBar.setAttribute("aria-valuenow", String(Math.round(reveal)));
  progressBar.setAttribute("aria-valuetext", `Reveal progress ${Math.round(reveal)} percent`);

  applyStepState(progress);
}

function scheduleRender() {
  if (state.raf) return;
  state.raf = window.requestAnimationFrame(render);
}

if (mobileQuery.addEventListener) {
  mobileQuery.addEventListener("change", (event) => {
    state.mobile = event.matches;
    scheduleRender();
  });
} else if (mobileQuery.addListener) {
  mobileQuery.addListener((event) => {
    state.mobile = event.matches;
    scheduleRender();
  });
}

if (window.MotionPreference && window.MotionPreference.onChange) {
  window.MotionPreference.onChange((next) => {
    state.reduced = Boolean(next.reduced);
    scheduleRender();
  });
}

window.addEventListener("scroll", scheduleRender, { passive: true });
window.addEventListener("resize", scheduleRender);
scheduleRender();
