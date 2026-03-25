/* ============================================
   Apple UHD — Services & Products
   Script: Canvas mesh, Lenis, GSAP ScrollTrigger
   ============================================ */

(function () {
  "use strict";

  /* ---- Reduced Motion ---- */
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = (d) => (reduced ? 0 : d);

  /* ============================================
     1. Canvas Gradient Mesh (Apple colors)
     ============================================ */
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

  const ORB_CONFIGS = [
    { color: "rgba(0,113,227,0.22)",   fx: 0.22, fy: 0.18, ax: 0.28, ay: 0.22, px: 0.0,  py: 0.0  },
    { color: "rgba(175,82,222,0.16)",   fx: 0.16, fy: 0.28, ax: 0.32, ay: 0.26, px: 1.3,  py: 0.7  },
    { color: "rgba(0,113,227,0.12)",    fx: 0.35, fy: 0.14, ax: 0.26, ay: 0.32, px: 2.6,  py: 1.4  },
    { color: "rgba(52,199,89,0.10)",    fx: 0.12, fy: 0.38, ax: 0.38, ay: 0.18, px: 0.5,  py: 3.0  },
  ];

  let orbs = [];

  function initOrbs() {
    orbs = ORB_CONFIGS.map((cfg) => ({
      cx: W * (0.3 + Math.random() * 0.4),
      cy: H * (0.2 + Math.random() * 0.6),
      r: Math.max(W, H) * (0.25 + Math.random() * 0.15),
      color: cfg.color,
      fx: cfg.fx,
      fy: cfg.fy,
      ax: cfg.ax,
      ay: cfg.ay,
      px: cfg.px,
      py: cfg.py,
    }));
  }

  let t = 0;

  function draw() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "screen";

    orbs.forEach((orb) => {
      const speed = reduced ? 0 : 1;
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

    /* Vignette */
    const vignette = ctx.createRadialGradient(
      W / 2, H / 2, H * 0.15,
      W / 2, H / 2, H * 0.85
    );
    vignette.addColorStop(0, "transparent");
    vignette.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    t += 0.003;
    requestAnimationFrame(draw);
  }

  resize();
  initOrbs();
  draw();
  window.addEventListener("resize", () => { resize(); initOrbs(); });

  /* ============================================
     2. Lenis Smooth Scroll + GSAP ticker
     ============================================ */
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

  /* ============================================
     3. Hero entrance timeline
     ============================================ */
  const heroTl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.4 });

  heroTl
    .to(".hero-title", { opacity: 1, duration: dur(2) })
    .to(".hero-subtitle", { opacity: 1, y: -10, duration: dur(1.2) }, "-=1.5")
    .to(".hero-ctas", { opacity: 1, y: 0, duration: dur(1) }, "-=0.8")
    .to(".scroll-indicator", { opacity: 1, duration: dur(0.8) }, "-=0.4");

  /* Hero parallax on scroll */
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

  gsap.to(".hero-ctas", {
    y: -60,
    opacity: 0,
    scrollTrigger: {
      trigger: ".hero",
      start: "20% top",
      end: "60% top",
      scrub: true,
    },
  });

  /* ============================================
     4. Generic .reveal scroll animation
     ============================================ */
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.fromTo(
      el,
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

  /* ============================================
     5. Product cards stagger reveal
     ============================================ */
  const productCards = document.querySelectorAll(".product-card");
  if (productCards.length) {
    gsap.fromTo(
      productCards,
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

  /* ============================================
     6. Services cards stagger reveal
     ============================================ */
  const stepCards = document.querySelectorAll(".step-card");
  if (stepCards.length) {
    gsap.fromTo(
      stepCards,
      { opacity: 0, y: reduced ? 0 : 30 },
      {
        opacity: 1,
        y: 0,
        duration: dur(0.7),
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".step-cards",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* ============================================
     7. Stat counter count-up
     ============================================ */
  document.querySelectorAll(".stat-number").forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";

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
            duration: dur(2),
            ease: "power2.out",
            onUpdate: function () {
              const current = Math.round(this.targets()[0].val);
              el.textContent = current.toLocaleString() + suffix;
            },
          }
        );
      },
    });
  });

  /* ============================================
     8. Ecosystem features stagger
     ============================================ */
  const ecoFeatures = document.querySelectorAll(".eco-feature");
  if (ecoFeatures.length) {
    gsap.fromTo(
      ecoFeatures,
      { opacity: 0, x: reduced ? 0 : -20 },
      {
        opacity: 1,
        x: 0,
        duration: dur(0.6),
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".eco-features",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* ============================================
     9. Privacy features stagger
     ============================================ */
  const privacyFeatures = document.querySelectorAll(".privacy-feature");
  if (privacyFeatures.length) {
    gsap.fromTo(
      privacyFeatures,
      { opacity: 0, x: reduced ? 0 : -20 },
      {
        opacity: 1,
        x: 0,
        duration: dur(0.6),
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".privacy-features",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* ============================================
     10. Device mockup mouse-tilt parallax
     ============================================ */
  const devicePhone = document.querySelector(".app-device .device-phone");
  if (devicePhone && !reduced) {
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

  /* ============================================
     11. CTA rings expansion
     ============================================ */
  gsap.utils.toArray(".ring").forEach((ring, i) => {
    gsap.fromTo(
      ring,
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

  /* CTA orbs gentle float */
  if (!reduced) {
    gsap.to(".orb-1", {
      x: 30,
      y: -20,
      duration: 6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    gsap.to(".orb-2", {
      x: -25,
      y: 15,
      duration: 5,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }
})();
