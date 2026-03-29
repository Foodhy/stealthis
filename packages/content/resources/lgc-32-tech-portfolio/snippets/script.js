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

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger, SplitText);

// ─── Shell ────────────────────────────────────────────────────────────────
initDemoShell({
  title: "Tech Lead Portfolio",
  category: "pages",
  tech: ["three.js", "gsap", "lenis", "scrolltrigger", "splittext"],
});

// ─── Reduced Motion ───────────────────────────────────────────────────────
let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);
  ScrollTrigger.refresh();
});

const dur = (d) => (reduced ? 0 : d);

// ─── Lenis ────────────────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ─── Three.js Hero Background ─────────────────────────────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const hero = document.querySelector(".hero");
  const w = hero.offsetWidth;
  const h = hero.offsetHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);

  const geos = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.TetrahedronGeometry(1, 0),
  ];

  const mat = new THREE.MeshBasicMaterial({
    color: 0x2563eb,
    wireframe: true,
    opacity: 0.15,
    transparent: true,
  });

  const meshes = [];
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(geos[i % 3], mat);
    m.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 8
    );
    m.scale.setScalar(0.4 + Math.random() * 1.2);
    m.userData.offset = Math.random() * Math.PI * 2;
    meshes.push(m);
    scene.add(m);
  }

  let animId = null;

  function animate() {
    animId = requestAnimationFrame(animate);
    const t = Date.now() * 0.0005;
    meshes.forEach((m, i) => {
      m.rotation.x += 0.002 + i * 0.0003;
      m.rotation.y += 0.003 + i * 0.0002;
      m.position.y += Math.sin(t + m.userData.offset) * 0.002;
    });
    renderer.render(scene, camera);
  }

  if (!reduced) {
    animate();
  } else {
    renderer.render(scene, camera);
  }

  function onResize() {
    const nw = hero.offsetWidth;
    const nh = hero.offsetHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  }

  window.addEventListener("resize", onResize);

  // Pause rendering when hero is fully scrolled past
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    onLeave: () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    },
    onEnterBack: () => {
      if (!animId && !reduced) animate();
    },
  });
}

// ─── Hero Animations ──────────────────────────────────────────────────────
function animateHero() {
  const nameEl = document.getElementById("heroName");
  const taglineEl = document.getElementById("heroTagline");

  if (nameEl) {
    const splitName = new SplitText(nameEl, { type: "words,lines", linesClass: "line" });
    gsap.set(splitName.words, { y: 50, opacity: 0 });
    gsap.to(splitName.words, {
      y: 0,
      opacity: 1,
      duration: dur(1),
      ease: "expo.out",
      stagger: { each: dur(0.06) },
      delay: dur(0.3),
    });
  }

  if (taglineEl) {
    gsap.from(taglineEl, {
      y: reduced ? 0 : 24,
      opacity: 0,
      duration: dur(0.9),
      ease: "expo.out",
      delay: dur(0.7),
    });
  }

  gsap.from(".hero__eyebrow", {
    opacity: 0,
    y: reduced ? 0 : -12,
    duration: dur(0.7),
    ease: "expo.out",
    delay: dur(0.15),
  });

  gsap.from(".hero__ctas", {
    opacity: 0,
    y: reduced ? 0 : 18,
    duration: dur(0.8),
    ease: "expo.out",
    delay: dur(0.9),
  });

  gsap.from(".hero__scroll-indicator", {
    opacity: 0,
    duration: dur(1),
    delay: dur(1.4),
  });
}

// ─── Expertise Cards ──────────────────────────────────────────────────────
function animateExpertise() {
  const cards = document.querySelectorAll(".expertise-card");
  if (!cards.length) return;

  gsap.set(cards, { scale: 0.92, opacity: 0 });

  gsap.to(cards, {
    scale: 1,
    opacity: 1,
    duration: dur(0.75),
    ease: "expo.out",
    stagger: { each: dur(0.1) },
    scrollTrigger: {
      trigger: ".expertise__grid",
      start: "top 78%",
      toggleActions: "play none none reverse",
    },
  });
}

// ─── Timeline Items ───────────────────────────────────────────────────────
function animateTimeline() {
  document.querySelectorAll(".timeline-item").forEach((item) => {
    const isLeft = item.classList.contains("timeline-item--left");
    const card = item.querySelector(".timeline-item__card");
    const year = item.querySelector(".timeline-item__year");

    if (card) {
      gsap.set(card, { x: reduced ? 0 : isLeft ? 48 : -48, opacity: 0 });
      gsap.to(card, {
        x: 0,
        opacity: 1,
        duration: dur(0.8),
        ease: "expo.out",
        scrollTrigger: {
          trigger: item,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }

    if (year) {
      gsap.set(year, { x: reduced ? 0 : isLeft ? -24 : 24, opacity: 0 });
      gsap.to(year, {
        x: 0,
        opacity: 1,
        duration: dur(0.7),
        ease: "expo.out",
        delay: dur(0.08),
        scrollTrigger: {
          trigger: item,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }
  });

  // Grow the center line in from top
  gsap.from(".timeline__line", {
    scaleY: 0,
    transformOrigin: "top center",
    duration: dur(1.5),
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".timeline__track",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ─── Repo Cards ───────────────────────────────────────────────────────────
function animateRepos() {
  const cards = document.querySelectorAll(".repo-card");
  if (!cards.length) return;

  gsap.set(cards, { y: reduced ? 0 : 40, opacity: 0 });

  gsap.to(cards, {
    y: 0,
    opacity: 1,
    duration: dur(0.75),
    ease: "expo.out",
    stagger: { each: dur(0.1) },
    scrollTrigger: {
      trigger: ".repos__grid",
      start: "top 78%",
      toggleActions: "play none none reverse",
    },
  });
}

// ─── Contact CTA ──────────────────────────────────────────────────────────
function animateContact() {
  const ctaEl = document.getElementById("contactCta");
  if (ctaEl) {
    const splitCta = new SplitText(ctaEl, { type: "words,lines", linesClass: "line" });
    gsap.set(splitCta.words, { y: 60, opacity: 0 });

    gsap.to(splitCta.words, {
      y: 0,
      opacity: 1,
      duration: dur(0.95),
      ease: "expo.out",
      stagger: { each: dur(0.06) },
      scrollTrigger: {
        trigger: ".contact__inner",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  }

  gsap.from(".contact__kicker", {
    opacity: 0,
    y: reduced ? 0 : 16,
    duration: dur(0.7),
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".contact__inner",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.from(".contact__links", {
    opacity: 0,
    y: reduced ? 0 : 20,
    duration: dur(0.8),
    ease: "expo.out",
    delay: dur(0.35),
    scrollTrigger: {
      trigger: ".contact__inner",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ─── Section Headers ──────────────────────────────────────────────────────
function animateSectionHeaders() {
  document.querySelectorAll(".section__header").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: reduced ? 0 : 16,
      duration: dur(0.65),
      ease: "expo.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────
initHeroCanvas();
animateHero();
animateSectionHeaders();
animateExpertise();
animateTimeline();
animateRepos();
animateContact();
