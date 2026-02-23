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

const toggle = document.getElementById("motionToggle");
const progressBar = document.getElementById("progressBar");
const sections = Array.from(document.querySelectorAll("[data-animate]"));

const state = {
  reduced: window.MotionPreference.prefersReducedMotion(),
  lenis: null,
  rafId: 0,
  animations: [],
};

function setLabel() {
  toggle.textContent = state.reduced ? "Enable motion" : "Disable motion";
}

function setProgress(value) {
  const clamped = Math.min(1, Math.max(0, value));
  progressBar.style.transform = `scaleX(${clamped})`;
}

function updateWindowProgress() {
  const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  setProgress(window.scrollY / max);
}

function resetVisuals() {
  sections.forEach((section) => {
    section.style.opacity = "1";
    section.style.transform = "none";
  });
  document.querySelectorAll(".reveal").forEach((node) => {
    node.style.opacity = "1";
    node.style.transform = "none";
  });
  document.querySelectorAll(".stage-card").forEach((node) => {
    node.style.opacity = "1";
    node.style.transform = "none";
  });
}

function killMotion() {
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = 0;
  }

  if (state.lenis) {
    state.lenis.destroy();
    state.lenis = null;
  }

  state.animations.forEach((anim) => anim.kill());
  state.animations = [];

  if (window.ScrollTrigger) {
    window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }

  resetVisuals();
}

function register(anim) {
  state.animations.push(anim);
  return anim;
}

function setupLenis() {
  state.lenis = new window.Lenis({
    lerp: 0.085,
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  state.lenis.on("scroll", (e) => {
    setProgress(e.progress || 0);
    if (window.ScrollTrigger) window.ScrollTrigger.update();
  });

  const raf = (time) => {
    if (!state.lenis) return;
    state.lenis.raf(time);
    state.rafId = requestAnimationFrame(raf);
  };

  state.rafId = requestAnimationFrame(raf);
}

function setupGsap() {
  if (!window.gsap || !window.ScrollTrigger) return;

  window.gsap.registerPlugin(window.ScrollTrigger);

  register(
    window.gsap.fromTo(
      ".intro .reveal",
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
      }
    )
  );

  sections.forEach((section) => {
    if (section.classList.contains("intro")) return;
    register(
      window.gsap.fromTo(
        section.querySelectorAll(".reveal"),
        { y: 52, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            end: "top 38%",
            scrub: 0.8,
          },
        }
      )
    );
  });

  const orbs = document.querySelectorAll(".orb");
  orbs.forEach((orb, i) => {
    register(
      window.gsap.to(orb, {
        x: i % 2 ? -22 : 20,
        y: i % 2 ? 16 : -15,
        scale: i % 2 ? 1.06 : 0.94,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        duration: 3.2 + i * 0.7,
      })
    );
  });

  register(
    window.gsap
      .timeline({
        scrollTrigger: {
          trigger: ".stage",
          start: "top top",
          end: "+=130%",
          scrub: 1,
          pin: true,
        },
      })
      .to(".card-one", { xPercent: -35, rotation: -8, scale: 0.9 }, 0)
      .to(".card-two", { yPercent: -35, scale: 0.94 }, 0)
      .to(".card-three", { xPercent: 35, rotation: 8, scale: 0.9 }, 0)
  );
}

function applyMode() {
  killMotion();
  setLabel();
  const noMotion = state.reduced || !window.Lenis || !window.gsap || !window.ScrollTrigger;
  document.body.classList.toggle("no-motion", noMotion);

  if (noMotion) {
    updateWindowProgress();
    return;
  }

  setupLenis();
  setupGsap();
}

toggle.addEventListener("click", () => {
  state.reduced = !state.reduced;
  applyMode();
});

window.addEventListener(
  "scroll",
  () => {
    if (!state.lenis) updateWindowProgress();
  },
  { passive: true }
);

window.addEventListener("resize", () => {
  if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  updateWindowProgress();
});

setLabel();
applyMode();
