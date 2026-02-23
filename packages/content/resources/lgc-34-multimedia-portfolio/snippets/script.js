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

function prefersReducedMotion() {
  return window.MotionPreference.prefersReducedMotion();
}

function initDemoShell() {
  // No-op shim in imported standalone snippets.
}

/**
 * 34-multimedia-portfolio / main.js
 * Multimedia Engineer Portfolio — GSAP FLIP, Canvas waveform,
 * hero particle field, Lenis smooth scroll.
 */

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, Flip, SplitText);

/* ── Shell ─────────────────────────────────────────────────────── */
initDemoShell({
  title: "Multimedia Engineer Portfolio",
  category: "pages",
  tech: ["gsap", "flip", "canvas-2d", "lenis", "scrolltrigger"],
});

/* ── Helpers ───────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Respect reduced-motion for durations */
function dur(base) {
  return prefersReducedMotion() ? 0 : base;
}

/* ══════════════════════════════════════════════════════════════════
   LENIS + SCROLLTRIGGER WIRING
   ══════════════════════════════════════════════════════════════════ */
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ══════════════════════════════════════════════════════════════════
   HERO — PARTICLE WAVEFORM CANVAS
   ══════════════════════════════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = $("#heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H;
  let mouseX = 0.5; // 0–1, normalised
  let mouseY = 0.5;
  let raf;
  const startTime = performance.now();

  /* ── Particles ─────────────────────────────────────────────── */
  const PARTICLE_COUNT = 220;
  const particles = [];

  class Particle {
    constructor(i) {
      this.index = i;
      this.reset();
    }
    reset() {
      // Distribute along the horizontal axis, wave-shaped Y
      this.baseX = (this.index / PARTICLE_COUNT) * 2; // 0..2 → we'll use W
      this.baseXpx = 0; // set on resize
      this.baseYpx = 0;
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.radius = Math.random() * 2.2 + 1;
      // Each particle gets its own phase & colour
      this.phase = (this.index / PARTICLE_COUNT) * Math.PI * 8;
      const hues = ["#ff3cac", "#00f5d4", "#f5f700", "#ff6b2b"];
      this.color = hues[Math.floor(Math.random() * hues.length)];
    }
    update(t, mxPx, myPx) {
      // Waveform base position
      const waveAmp = H * 0.18;
      const freq = 1.8 + mouseX * 1.2; // frequency shifts with mouse X
      this.baseXpx = (this.index / PARTICLE_COUNT) * W;
      this.baseYpx =
        H / 2 +
        Math.sin(this.baseXpx * freq * 0.005 + t * 0.8 + this.phase) * waveAmp * 0.8 +
        Math.sin(this.baseXpx * freq * 0.012 + t * 1.4 + this.phase) * waveAmp * 0.4;

      // Repulsion from mouse
      const dx = this.x - mxPx;
      const dy = this.y - myPx;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repelRadius = prefersReducedMotion() ? 0 : 90;

      if (dist < repelRadius && dist > 0) {
        const force = (repelRadius - dist) / repelRadius;
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * force * 5;
        this.vy += Math.sin(angle) * force * 5;
      }

      // Spring back to waveform position
      const springStr = 0.07;
      this.vx += (this.baseXpx - this.x) * springStr;
      this.vy += (this.baseYpx - this.y) * springStr;

      // Damping
      this.vx *= 0.82;
      this.vy *= 0.82;

      this.x += this.vx;
      this.y += this.vy;
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function buildParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = new Particle(i);
      p.x = (i / PARTICLE_COUNT) * W;
      p.y = H / 2;
      particles.push(p);
    }
  }

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    const t = (performance.now() - startTime) / 1000;
    const mxPx = mouseX * W;
    const myPx = mouseY * H;

    ctx.clearRect(0, 0, W, H);

    // Subtle radial gradient atmosphere
    const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
    grd.addColorStop(0, "rgba(255,60,172,0.05)");
    grd.addColorStop(0.5, "rgba(0,245,212,0.03)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    particles.forEach((p) => {
      p.update(t, mxPx, myPx);
      p.draw(ctx);
    });
  }

  // Mouse tracking on hero section
  const heroEl = $("#hero");
  heroEl.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = (e.clientY - rect.top) / rect.height;
  });
  heroEl.addEventListener("mouseleave", () => {
    mouseX = 0.5;
    mouseY = 0.5;
  });

  window.addEventListener("resize", resize);
  resize();
  loop();
})();

/* ══════════════════════════════════════════════════════════════════
   HERO — GLITCH HOVER
   ══════════════════════════════════════════════════════════════════ */
(function initGlitch() {
  const nameEl = $(".hero-name");
  if (!nameEl) return;

  // Wrap name element in a glitch container if not already in HTML
  // The HTML already positions glitch spans absolutely inside .hero-content
  // We add/remove .is-hovered on the wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "hero-name-wrapper";
  nameEl.parentNode.insertBefore(wrapper, nameEl);
  // Move name and glitch spans into wrapper
  const glitch1 = $(".hero-name-glitch--1");
  const glitch2 = $(".hero-name-glitch--2");
  wrapper.appendChild(nameEl);
  if (glitch1) wrapper.appendChild(glitch1);
  if (glitch2) wrapper.appendChild(glitch2);

  wrapper.addEventListener("mouseenter", () => {
    if (!prefersReducedMotion()) wrapper.classList.add("is-hovered");
  });
  wrapper.addEventListener("mouseleave", () => {
    wrapper.classList.remove("is-hovered");
  });

  // Motion preference change
  window.addEventListener("motion-preference", () => {
    wrapper.classList.remove("is-hovered");
  });
})();

/* ══════════════════════════════════════════════════════════════════
   HERO — GSAP ENTRANCE ANIMATIONS
   ══════════════════════════════════════════════════════════════════ */
(function initHeroEntrance() {
  const eyebrow = $(".hero-eyebrow");
  const nameEl = $(".hero-name");
  const tagline = $(".hero-tagline");
  const scrollCue = $(".hero-scroll-cue");

  const tl = gsap.timeline({ delay: 0.15 });

  tl.to(eyebrow, {
    opacity: 1,
    y: 0,
    duration: dur(0.6),
    ease: "expo.out",
    onStart() {
      gsap.set(eyebrow, { y: 12 });
    },
  });

  tl.to(
    nameEl,
    {
      opacity: 1,
      y: 0,
      duration: dur(0.9),
      ease: "expo.out",
      onStart() {
        gsap.set(nameEl, { y: 30 });
      },
    },
    "-=0.35"
  );

  tl.to(
    tagline,
    {
      opacity: 1,
      y: 0,
      duration: dur(0.7),
      ease: "expo.out",
      onStart() {
        gsap.set(tagline, { y: 16 });
      },
    },
    "-=0.55"
  );

  tl.to(
    scrollCue,
    {
      opacity: 1,
      duration: dur(0.6),
      ease: "power2.out",
    },
    "-=0.2"
  );
})();

/* ══════════════════════════════════════════════════════════════════
   GALLERY — GSAP FLIP LAYOUT TOGGLE
   ══════════════════════════════════════════════════════════════════ */
(function initGallery() {
  const gallery = $("#mediaGallery");
  const toggleBtn = $("#layout-toggle");
  if (!gallery || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    // Capture state BEFORE class change
    const state = Flip.getState(".media-card");

    gallery.classList.toggle("list-view");
    toggleBtn.classList.toggle("is-list");

    // Animate from old state to new
    Flip.from(state, {
      duration: dur(0.65),
      ease: "expo.out",
      stagger: { each: dur(0.06) },
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: dur(0.4) }),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: dur(0.2) }),
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════
   SCROLL REVEAL — MEDIA CARDS
   ══════════════════════════════════════════════════════════════════ */
(function initCardReveal() {
  const cards = $$(".media-card");
  if (!cards.length) return;

  cards.forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: dur(0.7),
      ease: "expo.out",
      delay: i * dur(0.1),
      scrollTrigger: {
        trigger: card,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════
   CONTACT SECTION — SCROLL REVEAL
   ══════════════════════════════════════════════════════════════════ */
(function initContactReveal() {
  const heading = $(".contact-heading");
  const sub = $(".contact-sub");
  const links = $(".contact-links");
  if (!heading) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#contact",
      start: "top 78%",
      toggleActions: "play none none none",
    },
  });

  tl.to(heading, {
    opacity: 1,
    y: 0,
    duration: dur(0.9),
    ease: "expo.out",
    onStart() {
      gsap.set(heading, { y: 40 });
    },
  });
  tl.to(
    sub,
    {
      opacity: 1,
      y: 0,
      duration: dur(0.6),
      ease: "expo.out",
      onStart() {
        gsap.set(sub, { y: 16 });
      },
    },
    "-=0.55"
  );
  tl.to(
    links,
    {
      opacity: 1,
      y: 0,
      duration: dur(0.5),
      ease: "expo.out",
      onStart() {
        gsap.set(links, { y: 12 });
      },
    },
    "-=0.4"
  );
})();

/* ══════════════════════════════════════════════════════════════════
   WAVEFORM VISUALIZER CANVAS
   ══════════════════════════════════════════════════════════════════ */
(function initWaveform() {
  const canvas = $("#waveformCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H;
  let mouseX = 0; // raw px, updated on section mousemove
  let animId;
  let startTime = performance.now();

  const waves = [
    { freq: 0.022, amp: 0.15, speed: 1.0, color: "#ff3cac", lineWidth: 2.5 },
    { freq: 0.034, amp: 0.1, speed: 1.6, color: "#00f5d4", lineWidth: 2 },
    { freq: 0.055, amp: 0.06, speed: 2.3, color: "#f5f700", lineWidth: 1.5 },
  ];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    mouseX = W / 2;
  }

  function drawWave(t) {
    ctx.clearRect(0, 0, W, H);

    const centerY = H / 2;
    const mxInfluence = (mouseX / W - 0.5) * 0.5;

    waves.forEach((wave, wi) => {
      const amp = wave.amp * H;

      // Create horizontal gradient for this wave
      const grd = ctx.createLinearGradient(0, 0, W, 0);
      if (wi === 0) {
        grd.addColorStop(0, "rgba(255,60,172,0)");
        grd.addColorStop(0.3, "#ff3cac");
        grd.addColorStop(0.7, "#ff6b2b");
        grd.addColorStop(1, "rgba(255,107,43,0)");
      } else if (wi === 1) {
        grd.addColorStop(0, "rgba(0,245,212,0)");
        grd.addColorStop(0.25, "#00f5d4");
        grd.addColorStop(0.75, "#ff3cac");
        grd.addColorStop(1, "rgba(255,60,172,0)");
      } else {
        grd.addColorStop(0, "rgba(245,247,0,0)");
        grd.addColorStop(0.4, "#f5f700");
        grd.addColorStop(0.6, "#00f5d4");
        grd.addColorStop(1, "rgba(0,245,212,0)");
      }

      ctx.beginPath();
      ctx.strokeStyle = grd;
      ctx.lineWidth = wave.lineWidth;
      ctx.shadowBlur = 16;
      ctx.shadowColor = wave.color;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      for (let x = 0; x <= W; x += 2) {
        const freqMod = wave.freq + mxInfluence;
        const y =
          centerY +
          Math.sin(x * freqMod + t * wave.speed) * amp +
          Math.sin(x * freqMod * 2.1 + t * wave.speed * 0.5) * amp * 0.3;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Subtle center line
    ctx.beginPath();
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = "rgba(68,68,102,0.5)";
    ctx.lineWidth = 1;
    ctx.moveTo(0, centerY);
    ctx.lineTo(W, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function loop() {
    animId = requestAnimationFrame(loop);
    if (prefersReducedMotion()) {
      // Static single frame
      drawWave(0);
      cancelAnimationFrame(animId);
      return;
    }
    const t = (performance.now() - startTime) / 1000;
    drawWave(t);
  }

  // Mousemove on the waveform section
  const wfSection = $("#waveform");
  wfSection.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
  });
  wfSection.addEventListener("mouseleave", () => {
    mouseX = W / 2;
  });

  // Restart animation on motion preference change
  window.addEventListener("motion-preference", () => {
    cancelAnimationFrame(animId);
    if (!prefersReducedMotion()) {
      startTime = performance.now();
      loop();
    } else {
      drawWave(0);
    }
  });

  window.addEventListener("resize", resize);
  resize();
  loop();
})();

/* ══════════════════════════════════════════════════════════════════
   DISCIPLINES MARQUEE — CSS animation, paused when reduced-motion
   ══════════════════════════════════════════════════════════════════ */
(function initDisciplinesMarquee() {
  const marquee = $("#disciplinesMarquee");
  if (!marquee) return;

  // If user prefers reduced motion, freeze the animation immediately
  function applyMotion() {
    if (prefersReducedMotion()) {
      marquee.style.setProperty("--marquee-play-state", "paused");
    } else {
      marquee.style.removeProperty("--marquee-play-state");
    }
  }

  applyMotion();
  window.addEventListener("motion-preference", applyMotion);
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION TITLE ANIMATIONS
   ══════════════════════════════════════════════════════════════════ */
(function initSectionTitles() {
  const titles = $$(".section-title");
  titles.forEach((title) => {
    gsap.fromTo(
      title,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: dur(0.8),
        ease: "expo.out",
        scrollTrigger: {
          trigger: title,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  });
})();

/* ══════════════════════════════════════════════════════════════════
   REDUCED MOTION HANDLING (runtime toggle)
   ══════════════════════════════════════════════════════════════════ */
window.addEventListener("motion-preference", () => {
  if (prefersReducedMotion()) {
    document.documentElement.classList.add("reduced-motion");
    lenis.stop();
  } else {
    document.documentElement.classList.remove("reduced-motion");
    lenis.start();
  }
});

// Apply on load if needed
if (prefersReducedMotion()) {
  document.documentElement.classList.add("reduced-motion");
  lenis.stop();
}
