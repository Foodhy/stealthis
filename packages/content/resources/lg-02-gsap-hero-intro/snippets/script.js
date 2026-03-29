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

const toggle = document.getElementById("toggle");
let reduced = window.MotionPreference.prefersReducedMotion();
const active = [];

function track(animation) {
  active.push(animation);
  return animation;
}

function teardown() {
  active.forEach((animation) => animation.kill());
  active.length = 0;
  document.querySelectorAll(".orb").forEach((n) => {
    n.style.transform = "none";
  });
  document.querySelectorAll(".kicker, h1, .subtitle, .actions").forEach((n) => {
    n.style.opacity = "1";
    n.style.transform = "none";
  });
}

function play() {
  if (reduced || !window.gsap) return;
  const tl = track(window.gsap.timeline());
  tl.from(".kicker", { y: 24, opacity: 0, duration: 0.4 })
    .from("h1", { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, "<0.08")
    .from(".subtitle", { y: 18, opacity: 0, duration: 0.45 }, "<0.08")
    .from(".actions", { y: 20, opacity: 0, duration: 0.4 }, "<0.12");

  track(
    window.gsap.to(".a", { x: 24, y: -16, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" })
  );
  track(
    window.gsap.to(".b", { x: -22, y: 16, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" })
  );
  track(
    window.gsap.to(".c", {
      x: 16,
      y: -12,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    })
  );
}

function apply() {
  teardown();
  toggle.textContent = reduced ? "Enable motion" : "Disable motion";
  play();
}

toggle.addEventListener("click", () => {
  reduced = !reduced;
  apply();
});

apply();
