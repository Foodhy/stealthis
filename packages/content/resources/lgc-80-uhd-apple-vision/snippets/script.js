// Initialize Lenis for smooth scrolling (driven by GSAP ticker)
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  smoothWheel: true,
  autoRaf: false,
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Single raf loop via GSAP ticker — avoids double-calling lenis.raf
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Hero Entrance
const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

tl.to(".hero-title", {
  opacity: 1,
  scale: 1,
  filter: "blur(0px)",
  duration: 2.5,
  delay: 0.5,
})
  .to(
    ".hero-subtitle",
    {
      opacity: 1,
      y: -20,
      duration: 1.5,
    },
    "-=2",
  )
  .to(
    ".scroll-indicator",
    {
      opacity: 1,
      y: 0,
      duration: 1,
    },
    "-=1",
  );

// Parallax for Background Blobs
gsap.to(".blob-1", {
  y: 200,
  x: 100,
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
  },
});

gsap.to(".blob-2", {
  y: -300,
  x: -150,
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
  },
});

// Generic Reveal Animation — elements stay visible once revealed
const revealElements = gsap.utils.toArray(".reveal");
revealElements.forEach((el) => {
  gsap.fromTo(
    el,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    },
  );
});

// Device Showcase Parallax / Tilt
const deviceCard = document.querySelector(".device-card");
if (deviceCard) {
  gsap.to(deviceCard, {
    y: -50,
    rotateX: 5,
    scrollTrigger: {
      trigger: ".intro-section",
      start: "top center",
      end: "bottom center",
      scrub: true,
    },
  });

  // Mouse tilt effect
  window.addEventListener("mousemove", (e) => {
    const rect = deviceCard.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    gsap.to(deviceCard, {
      rotateY: x * 10,
      rotateX: -y * 10,
      duration: 0.8,
      ease: "power2.out",
    });
  });
}

// Staggered reveal for feature boxes
const featureGrid = document.querySelector(".feature-grid");
if (featureGrid) {
  gsap.fromTo(".feature-box",
    { opacity: 0, y: 40, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: featureGrid,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
}

// Hero content zoom-out on scroll (targets wrapper to avoid conflict with entrance animation)
gsap.to(".hero-content", {
  scale: 1.3,
  opacity: 0,
  filter: "blur(20px)",
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "80% top",
    scrub: true,
  },
});

// CTA rings expand on scroll
gsap.utils.toArray(".ring").forEach((ring, i) => {
  gsap.fromTo(
    ring,
    { scale: 0.5, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 1.5,
      delay: i * 0.15,
      scrollTrigger: {
        trigger: ".cta-section",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    },
  );
});

// Spec numbers count-up animation
const specNumbers = document.querySelectorAll(".spec-number");
specNumbers.forEach((el) => {
  const text = el.textContent;
  const num = parseInt(text, 10);

  if (!isNaN(num) && num > 0) {
    const suffix = text.replace(String(num), "");
    el.textContent = "0" + suffix;

    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(
          { val: 0 },
          {
            val: num,
            duration: 2,
            ease: "power2.out",
            onUpdate: function () {
              el.textContent = Math.round(this.targets()[0].val) + suffix;
            },
          },
        );
      },
    });
  }
});
