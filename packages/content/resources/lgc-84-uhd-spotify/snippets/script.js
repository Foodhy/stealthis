// =============================================
// 1. Canvas gradient mesh — green/purple orbs
// =============================================
(function () {
  const canvas = document.getElementById("mesh-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const orbs = [
    { x: 0.2, y: 0.3, r: 0.45, color: [29, 185, 84], speed: 0.0003, phase: 0 },
    { x: 0.75, y: 0.6, r: 0.4, color: [139, 92, 246], speed: 0.00025, phase: 2 },
    { x: 0.5, y: 0.8, r: 0.35, color: [29, 185, 84], speed: 0.00035, phase: 4 },
    { x: 0.85, y: 0.2, r: 0.3, color: [88, 60, 180], speed: 0.0002, phase: 1 },
    { x: 0.15, y: 0.7, r: 0.25, color: [16, 130, 60], speed: 0.00028, phase: 3 },
  ];

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, w, h);

    for (const orb of orbs) {
      const ox = (orb.x + Math.sin(t * orb.speed + orb.phase) * 0.08) * w;
      const oy = (orb.y + Math.cos(t * orb.speed * 0.7 + orb.phase) * 0.06) * h;
      const or = orb.r * Math.min(w, h);

      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, or);
      grad.addColorStop(0, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, 0.12)`);
      grad.addColorStop(0.5, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, 0.04)`);
      grad.addColorStop(1, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ox, oy, or, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vignette overlay
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
    vignette.addColorStop(0, "rgba(18, 18, 18, 0)");
    vignette.addColorStop(1, "rgba(18, 18, 18, 0.6)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();

// =============================================
// 2. Lenis + GSAP setup
// =============================================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  autoRaf: false,
});

gsap.registerPlugin(ScrollTrigger);

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const dur = (d) => (reduced ? 0 : d);

// =============================================
// 3. Hero entrance timeline
// =============================================
const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

heroTl
  .to(".hero-logo", {
    opacity: 1,
    y: 0,
    duration: dur(1.2),
    delay: dur(0.3),
  })
  .to(
    ".hero-title",
    {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      duration: dur(2),
    },
    "-=0.8"
  )
  .to(
    ".hero-subtitle",
    {
      opacity: 1,
      y: 0,
      duration: dur(1.2),
    },
    "-=1.5"
  )
  .to(
    ".hero-buttons",
    {
      opacity: 1,
      y: 0,
      duration: dur(1),
    },
    "-=0.8"
  )
  .to(
    ".scroll-indicator",
    {
      opacity: 1,
      y: 0,
      duration: dur(0.8),
    },
    "-=0.5"
  );

// =============================================
// 4. Hero parallax on scroll
// =============================================
gsap.to(".hero-content", {
  scale: 1.15,
  opacity: 0,
  filter: "blur(16px)",
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "80% top",
    scrub: true,
  },
});

gsap.to(".scroll-indicator", {
  opacity: 0,
  scrollTrigger: {
    trigger: ".hero-section",
    start: "15% top",
    end: "30% top",
    scrub: true,
  },
});

// =============================================
// 5. Generic .reveal scroll animation
// =============================================
const revealElements = gsap.utils.toArray(".reveal");
revealElements.forEach((el) => {
  gsap.fromTo(
    el,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: dur(1.2),
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    }
  );
});

// =============================================
// 6. Playlist cards stagger reveal
// =============================================
const playlistGrid = document.querySelector(".playlist-grid");
if (playlistGrid) {
  gsap.fromTo(
    ".playlist-card",
    { opacity: 0, y: 40, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: dur(0.8),
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: playlistGrid,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
}

// =============================================
// 7. Pinned scroll section — How It Works
// =============================================
const howTrack = document.querySelector(".how-track");
const stepCards = document.querySelectorAll(".step-card");
const stepDots = document.querySelectorAll(".step-dot");
const miniPhones = document.querySelectorAll(".mini-phone");

function setActiveStep(index) {
  stepCards.forEach((card, i) => {
    card.classList.toggle("active", i === index);
  });
  stepDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
  miniPhones.forEach((phone, i) => {
    phone.classList.toggle("active", i === index);
  });
}

if (howTrack && stepCards.length > 0) {
  ScrollTrigger.create({
    trigger: howTrack,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      const totalSteps = stepCards.length;
      const stepIndex = Math.min(
        totalSteps - 1,
        Math.floor(progress * totalSteps)
      );
      setActiveStep(stepIndex);
    },
  });
}

// =============================================
// 8. Stat counter count-up
// =============================================
const statNumbers = document.querySelectorAll(".stat-number[data-target]");
statNumbers.forEach((el) => {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || "";

  if (isNaN(target) || target <= 0) return;

  el.textContent = "0" + suffix;

  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.to(
        { val: 0 },
        {
          val: target,
          duration: dur(2.5),
          ease: "power2.out",
          onUpdate: function () {
            el.textContent = Math.round(this.targets()[0].val) + suffix;
          },
        }
      );
    },
  });
});

// =============================================
// 9. Premium features stagger reveal
// =============================================
const premiumGrid = document.querySelector(".premium-grid");
if (premiumGrid) {
  gsap.fromTo(
    ".premium-card",
    { opacity: 0, y: 40, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: dur(0.8),
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: premiumGrid,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
}

// =============================================
// 10. Phone mockup mouse-tilt parallax
// =============================================
const phoneMockup = document.querySelector(".phone-mockup");
if (phoneMockup && !reduced) {
  const phoneContainer = document.querySelector(".phone-container");

  window.addEventListener("mousemove", (e) => {
    if (!phoneContainer) return;
    const rect = phoneContainer.getBoundingClientRect();
    // Only apply tilt if the phone is visible in the viewport
    if (rect.top > window.innerHeight || rect.bottom < 0) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    // Clamp to prevent extreme angles
    const clampedX = Math.max(-1, Math.min(1, x));
    const clampedY = Math.max(-1, Math.min(1, y));

    gsap.to(phoneMockup, {
      rotateY: clampedX * 12,
      rotateX: -clampedY * 8,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  // Scroll parallax for phone
  gsap.to(phoneMockup, {
    y: -30,
    scrollTrigger: {
      trigger: ".app-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}

// =============================================
// 11. CTA rings expansion
// =============================================
gsap.utils.toArray(".ring").forEach((ring, i) => {
  gsap.fromTo(
    ring,
    { scale: 0.4, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: dur(1.8),
      delay: i * 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".cta-section",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
});

// CTA orb parallax
gsap.to(".cta-orb-1", {
  y: -80,
  x: 40,
  scrollTrigger: {
    trigger: ".cta-section",
    start: "top bottom",
    end: "bottom top",
    scrub: 1,
  },
});

gsap.to(".cta-orb-2", {
  y: 60,
  x: -40,
  scrollTrigger: {
    trigger: ".cta-section",
    start: "top bottom",
    end: "bottom top",
    scrub: 1,
  },
});
