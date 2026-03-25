/* ═══════════════════════════════════════════════════════════════════════
   Nike UHD Athletic Brand Landing Page — Script
   ═══════════════════════════════════════════════════════════════════════ */

// ── Gradient Mesh Background (Canvas 2D) ───────────────────────────
(function () {
  "use strict";

  const canvas = document.getElementById("mesh-bg");
  const ctx = canvas.getContext("2d");
  const DPR = window.devicePixelRatio || 1;

  let W, H;
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", () => { resize(); initOrbs(); });

  const ORB_CONFIGS = [
    { color: "rgba(205,255,0,0.22)",  fx: 0.25, fy: 0.20, ax: 0.30, ay: 0.25, px: 0.0, py: 0.0 },
    { color: "rgba(205,255,0,0.10)",  fx: 0.18, fy: 0.35, ax: 0.35, ay: 0.30, px: 1.2, py: 0.8 },
    { color: "rgba(255,107,53,0.15)", fx: 0.40, fy: 0.15, ax: 0.25, ay: 0.35, px: 2.5, py: 1.5 },
    { color: "rgba(205,255,0,0.08)",  fx: 0.15, fy: 0.45, ax: 0.40, ay: 0.20, px: 0.7, py: 3.1 },
    { color: "rgba(255,107,53,0.08)", fx: 0.30, fy: 0.25, ax: 0.20, ay: 0.30, px: 3.5, py: 2.0 },
  ];

  let orbs = [];

  function initOrbs() {
    orbs = ORB_CONFIGS.map((cfg, i) => ({
      ...cfg,
      cx: W * (0.15 + (i / ORB_CONFIGS.length) * 0.7),
      cy: H * (0.2 + (i % 3) * 0.3),
      r: Math.min(W, H) * (0.3 + Math.random() * 0.25),
    }));
  }
  initOrbs();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = 0;

  function draw() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "screen";

    orbs.forEach((orb) => {
      const speed = reducedMotion ? 0 : 1;
      const x = orb.cx + Math.sin(t * orb.fx + orb.px) * orb.ax * W * speed;
      const y = orb.cy + Math.cos(t * orb.fy + orb.py) * orb.ay * H * speed;

      const g = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
      g.addColorStop(0, orb.color);
      g.addColorStop(0.5, orb.color.replace(/[\d.]+\)$/, "0.06)"));
      g.addColorStop(1, "transparent");

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    ctx.globalCompositeOperation = "source-over";

    // Vignette
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.85);
    vignette.addColorStop(0, "transparent");
    vignette.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    t += 0.003;
    requestAnimationFrame(draw);
  }

  draw();
})();

// ── Lenis Smooth Scroll ────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════
// HERO ENTRANCE
// ═══════════════════════════════════════════════════════════════════════

const heroTl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.4 });

heroTl
  .to(".hero-swoosh", {
    opacity: 1,
    duration: dur(1),
  })
  .to(".hero-title", {
    opacity: 1,
    duration: dur(2),
  }, "-=0.6")
  .to(".hero-subtitle", {
    opacity: 1,
    y: -10,
    duration: dur(1.2),
  }, "-=1.5")
  .to(".hero-ctas", {
    opacity: 1,
    y: -10,
    duration: dur(1),
  }, "-=0.8")
  .to(".scroll-indicator", {
    opacity: 1,
    duration: dur(0.8),
  }, "-=0.4");

// ── Hero parallax on scroll ──
gsap.to(".hero-content", {
  scale: 1.15,
  opacity: 0,
  filter: "blur(12px)",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "70% top",
    scrub: true,
  },
});

gsap.to(".scroll-indicator", {
  opacity: 0,
  scrollTrigger: {
    trigger: ".hero",
    start: "10% top",
    end: "30% top",
    scrub: true,
  },
});

// ═══════════════════════════════════════════════════════════════════════
// GENERIC REVEAL (elements with .reveal class)
// ═══════════════════════════════════════════════════════════════════════

gsap.utils.toArray(".reveal").forEach((el) => {
  gsap.fromTo(el,
    { opacity: 0, y: reduced ? 0 : 40 },
    {
      opacity: 1,
      y: 0,
      duration: dur(1),
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    }
  );
});

// ═══════════════════════════════════════════════════════════════════════
// PRODUCT CARDS — stagger reveal
// ═══════════════════════════════════════════════════════════════════════

const productCards = document.querySelectorAll(".product-card");
if (productCards.length) {
  gsap.fromTo(productCards,
    { opacity: 0, y: reduced ? 0 : 30, scale: reduced ? 1 : 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: dur(0.7),
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".products-grid",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
}

// ═══════════════════════════════════════════════════════════════════════
// INNOVATION — pinned scroll with step swap
// ═══════════════════════════════════════════════════════════════════════

const stepCards = document.querySelectorAll(".step-card");
const howVisuals = document.querySelectorAll(".how-visual");
const stepDots = document.querySelectorAll(".step-dot");
let activeStep = 0;

function setActiveStep(index) {
  if (index === activeStep) return;

  stepCards.forEach((c) => c.classList.remove("active"));
  stepCards[index].classList.add("active");

  howVisuals.forEach((v) => v.classList.remove("active"));
  howVisuals[index].classList.add("active");

  stepDots.forEach((d) => d.classList.remove("active"));
  stepDots[index].classList.add("active");

  activeStep = index;
}

ScrollTrigger.create({
  trigger: ".how-track",
  start: "top top",
  end: "bottom bottom",
  scrub: 0,
  onUpdate: (self) => {
    const p = self.progress;
    if (p < 0.33) setActiveStep(0);
    else if (p < 0.66) setActiveStep(1);
    else setActiveStep(2);
  },
});

// ═══════════════════════════════════════════════════════════════════════
// STATS — count-up animation
// ═══════════════════════════════════════════════════════════════════════

document.querySelectorAll(".stat-number").forEach((el) => {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || "";

  if (isNaN(target)) return;

  el.textContent = "0" + suffix;

  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.to({ val: 0 }, {
        val: target,
        duration: dur(2),
        ease: "power2.out",
        onUpdate: function () {
          const current = Math.round(this.targets()[0].val);
          el.textContent = current.toLocaleString() + suffix;
        },
      });
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════
// ATHLETE FEATURES — stagger reveal
// ═══════════════════════════════════════════════════════════════════════

const athleteFeatures = document.querySelectorAll(".athlete-feature");
if (athleteFeatures.length) {
  gsap.fromTo(athleteFeatures,
    { opacity: 0, x: reduced ? 0 : -20 },
    {
      opacity: 1,
      x: 0,
      duration: dur(0.6),
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".athlete-features",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
}

// ═══════════════════════════════════════════════════════════════════════
// APP PHONE — mouse tilt parallax
// ═══════════════════════════════════════════════════════════════════════

const devicePhone = document.querySelector(".app-device .device-phone");
if (devicePhone && !reduced) {
  // Subtle scroll parallax
  gsap.to(devicePhone, {
    y: -40,
    rotateX: 5,
    scrollTrigger: {
      trigger: ".app-section",
      start: "top center",
      end: "bottom center",
      scrub: true,
    },
  });

  // Mouse tilt
  window.addEventListener("mousemove", (e) => {
    const rect = devicePhone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = (e.clientX - cx) / (rect.width / 2);
    const y = (e.clientY - cy) / (rect.height / 2);

    gsap.to(devicePhone, {
      rotateY: x * 8,
      rotateX: -y * 8,
      duration: 0.8,
      ease: "power2.out",
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// CTA — rings + entrance
// ═══════════════════════════════════════════════════════════════════════

gsap.utils.toArray(".ring").forEach((ring, i) => {
  gsap.fromTo(ring,
    { scale: 0.5, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: dur(1.5),
      delay: i * 0.15,
      scrollTrigger: {
        trigger: ".cta-section",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
});
