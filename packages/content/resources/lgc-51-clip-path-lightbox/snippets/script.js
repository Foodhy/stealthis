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

gsap.registerPlugin(ScrollTrigger);

initDemoShell({
  title: "Clip-Path Lightbox",
  category: "css-canvas",
  tech: ["gsap", "clip-path", "lightbox", "keyboard-nav"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ── Card data ─────────────────────────────────────────────────────────────────
const cards = Array.from(document.querySelectorAll(".gallery-card"));
const lightbox = document.getElementById("lightbox");
const lbArt = document.getElementById("lb-art");
const lbTitle = document.getElementById("lb-title");
const lbSub = document.getElementById("lb-sub");
const lbBody = document.getElementById("lb-body");
const lbClose = document.getElementById("lb-close");
const lbPrev = document.getElementById("lb-prev");
const lbNext = document.getElementById("lb-next");

let currentIndex = -1;
let isOpen = false;

// ── Get the card's screen rect expressed as CSS inset ─────────────────────────
function getInsetFromRect(rect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const top = rect.top;
  const right = vw - rect.right;
  const bottom = vh - rect.bottom;
  const left = rect.left;
  return { top, right, bottom, left };
}

function insetToString({ top, right, bottom, left }) {
  return `inset(${top}px ${right}px ${bottom}px ${left}px round 4px)`;
}

// ── Open lightbox ─────────────────────────────────────────────────────────────
function openLightbox(index) {
  const card = cards[index];
  const rect = card.getBoundingClientRect();
  const inset = getInsetFromRect(rect);

  currentIndex = index;
  isOpen = true;

  // Populate content
  const d = card.dataset;
  const artClass = card
    .querySelector(".gc-art")
    .className.split(" ")
    .find((c) => c.startsWith("gc-art--"));
  lbArt.className = "lb-art " + artClass;
  lbTitle.textContent = d.title;
  lbSub.textContent = d.sub;
  lbBody.textContent = d.body;

  // Show the lightbox — start clipped to card position
  lightbox.removeAttribute("hidden");
  gsap.set(lightbox, { clipPath: insetToString(inset) });

  // Animate to fullscreen
  if (!reduced) {
    gsap.to(lightbox, {
      clipPath: "inset(0px 0px 0px 0px round 0px)",
      duration: 0.55,
      ease: "expo.out",
    });

    // Content reveals after clip path opens
    gsap.set([lbTitle, lbSub, lbBody, lbClose], { opacity: 0, y: 16 });
    gsap.to([lbTitle, lbSub, lbBody, lbClose], {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.07,
      ease: "expo.out",
      delay: 0.3,
    });
  } else {
    gsap.set(lightbox, { clipPath: "inset(0px 0px 0px 0px round 0px)" });
  }

  document.body.style.overflow = "hidden";
  lbClose.focus();
}

// ── Close lightbox ────────────────────────────────────────────────────────────
function closeLightbox() {
  if (!isOpen) return;
  const card = cards[currentIndex];
  const rect = card.getBoundingClientRect();
  const inset = getInsetFromRect(rect);

  if (!reduced) {
    gsap.to(lightbox, {
      clipPath: insetToString(inset),
      duration: 0.45,
      ease: "expo.in",
      onComplete: () => {
        lightbox.setAttribute("hidden", "");
        gsap.set(lightbox, { clipPath: "" });
        isOpen = false;
      },
    });
  } else {
    lightbox.setAttribute("hidden", "");
    isOpen = false;
  }

  document.body.style.overflow = "";
  cards[currentIndex].focus();
}

// ── Navigate ──────────────────────────────────────────────────────────────────
function navigateTo(index) {
  const nextIndex = (index + cards.length) % cards.length;

  if (!reduced) {
    // Slide content out, update, slide in
    gsap.to([lbTitle, lbSub, lbBody], {
      opacity: 0,
      y: -12,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        currentIndex = nextIndex;
        const d = cards[nextIndex].dataset;
        const artClass = cards[nextIndex]
          .querySelector(".gc-art")
          .className.split(" ")
          .find((c) => c.startsWith("gc-art--"));
        lbArt.className = "lb-art " + artClass;
        lbTitle.textContent = d.title;
        lbSub.textContent = d.sub;
        lbBody.textContent = d.body;

        gsap.fromTo(
          [lbTitle, lbSub, lbBody],
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.06,
            ease: "expo.out",
          }
        );
      },
    });
  } else {
    currentIndex = nextIndex;
    const d = cards[nextIndex].dataset;
    const artClass = cards[nextIndex]
      .querySelector(".gc-art")
      .className.split(" ")
      .find((c) => c.startsWith("gc-art--"));
    lbArt.className = "lb-art " + artClass;
    lbTitle.textContent = d.title;
    lbSub.textContent = d.sub;
    lbBody.textContent = d.body;
  }
}

// ── Event listeners ───────────────────────────────────────────────────────────
cards.forEach((card, i) => {
  card.addEventListener("click", () => openLightbox(i));
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Open ${card.dataset.title}`);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox(i);
    }
  });
});

lbClose.addEventListener("click", closeLightbox);
lbPrev.addEventListener("click", () => navigateTo(currentIndex - 1));
lbNext.addEventListener("click", () => navigateTo(currentIndex + 1));

document.addEventListener("keydown", (e) => {
  if (!isOpen) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") navigateTo(currentIndex - 1);
  if (e.key === "ArrowRight") navigateTo(currentIndex + 1);
});

// ── Entrance animations ───────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".page-header > *", { opacity: 0, y: 20 });
  gsap.to(".page-header > *", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "expo.out",
    delay: 0.3,
  });

  cards.forEach((card, i) => {
    gsap.set(card, { opacity: 0, scale: 0.96 });
    gsap.to(card, {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: "expo.out",
      delay: i * 0.08,
      scrollTrigger: {
        trigger: ".gallery-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── Motion toggle ─────────────────────────────────────────────────────────────
window.addEventListener("motion-preference", (e) => {
  gsap.globalTimeline.paused(e.detail.reduced);
});
