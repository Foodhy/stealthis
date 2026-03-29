gsap.registerPlugin(ScrollTrigger);

// --- Hero entrance with bouncy spring ---
const heroTl = gsap.timeline({
  defaults: { ease: "back.out(1.7)" },
});

heroTl
  .to(".hero-badge", { opacity: 1, scale: 1, duration: 0.6, delay: 0.3 })
  .to(".hero-word", {
    opacity: 1,
    y: 0,
    rotation: 0,
    duration: 0.8,
    stagger: 0.15,
  }, "-=0.3")
  .to(".hero-desc", { opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3")
  .to(".hero-actions", { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.2")
  .to(".console-wrapper", {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "elastic.out(1, 0.5)",
  }, "-=0.5");

// --- Console tilt on mouse ---
const consoleEl = document.querySelector(".console");
if (consoleEl) {
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    gsap.to(consoleEl, {
      rotateY: x * 8,
      rotateX: -y * 5,
      duration: 0.6,
      ease: "power2.out",
    });
  });
}

// --- Floating background shapes parallax ---
gsap.utils.toArray(".shape").forEach((shape, i) => {
  gsap.to(shape, {
    y: (i % 2 === 0 ? 150 : -150),
    x: (i % 2 === 0 ? 50 : -50),
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
    },
  });
});

// --- Reveal on scroll with spring ease ---
gsap.utils.toArray(".reveal").forEach((el) => {
  gsap.fromTo(el,
    { opacity: 0, y: 25 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "back.out(1.4)",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    }
  );
});

// --- Mode cards stagger (no .reveal — dedicated animation) ---
const modesGrid = document.querySelector(".modes-grid");
if (modesGrid) {
  gsap.fromTo(".mode-card",
    { opacity: 0, y: 40, scale: 0.92 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: modesGrid,
        start: "top 82%",
        toggleActions: "play none none none",
      },
    }
  );
}

// --- Game cards stagger with rotation (no .reveal — dedicated animation) ---
const gamesRow = document.querySelector(".games-row");
if (gamesRow) {
  gsap.fromTo(".game-card",
    { opacity: 0, y: 50, rotation: -5, scale: 0.88 },
    {
      opacity: 1,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.7,
      stagger: 0.1,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: gamesRow,
        start: "top 82%",
        toggleActions: "play none none none",
      },
    }
  );
}

// --- Specs scale in ---
gsap.utils.toArray(".spec").forEach((spec, i) => {
  gsap.fromTo(spec,
    { opacity: 0, scale: 0.8 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      delay: i * 0.1,
      ease: "back.out(2)",
      scrollTrigger: {
        trigger: ".specs-grid",
        start: "top 85%",
        toggleActions: "play none none none",
      },
    }
  );
});

// --- Color dots bounce on scroll ---
gsap.fromTo(".color-dot",
  { scale: 0 },
  {
    scale: 1,
    duration: 0.5,
    stagger: 0.08,
    ease: "back.out(3)",
    scrollTrigger: {
      trigger: ".specs-colors",
      start: "top 90%",
      toggleActions: "play none none none",
    },
  }
);

// --- Screen glow pulse ---
const screen = document.querySelector(".screen");
if (screen) {
  gsap.to(screen, {
    boxShadow: "0 0 40px rgba(230, 0, 18, 0.15), inset 0 0 20px rgba(230, 0, 18, 0.05)",
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}
