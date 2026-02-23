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
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

initDemoShell({
  title: "Blog Magazine",
  category: "pages",
  tech: ["gsap", "lenis", "splittext", "view-transitions-api"],
});

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);
  ScrollTrigger.refresh();
});

const dur = (d) => (reduced ? 0 : d);

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: MASTHEAD — SplitText + ScrambleText entrance
// ═══════════════════════════════════════════════════════════════════

const mastheadTitle = document.getElementById("masthead-title");
const mastheadSubtitle = document.getElementById("masthead-subtitle");

// SplitText char-by-char reveal for title
const titleSplit = new SplitText(mastheadTitle, {
  type: "chars",
  charsClass: "char",
});

gsap.set(titleSplit.chars, {
  opacity: 0,
  y: reduced ? 0 : 40,
  rotateX: reduced ? 0 : -60,
  transformPerspective: 600,
});

const mastheadTl = gsap.timeline({ delay: 0.4 });

mastheadTl.to(titleSplit.chars, {
  opacity: 1,
  y: 0,
  rotateX: 0,
  duration: dur(0.7),
  ease: "expo.out",
  stagger: { each: 0.03 },
});

// ScrambleText for subtitle
if (reduced) {
  // Skip scramble, just show immediately
  mastheadSubtitle.style.opacity = "1";
} else {
  const subtitleText = mastheadSubtitle.textContent;
  gsap.set(mastheadSubtitle, { opacity: 1 });
  mastheadTl.fromTo(
    mastheadSubtitle,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.01,
    },
    0.6
  );
  mastheadTl.to(
    mastheadSubtitle,
    {
      duration: dur(1.2),
      scrambleText: {
        text: subtitleText,
        chars: "lowerCase",
        speed: 0.5,
        revealDelay: 0.3,
      },
    },
    0.6
  );
}

// ═══════════════════════════════════════════════════════════════════
// THEME TOGGLE — View Transitions API with circular clip-path wipe
// ═══════════════════════════════════════════════════════════════════

const supportsVT = typeof document.startViewTransition === "function";
const themeToggle = document.getElementById("theme-toggle");

function updateToggleIcon(theme) {
  // Icon visibility handled by CSS data-theme selectors — no JS needed
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
  );
}

themeToggle.addEventListener("click", (e) => {
  const isDark = document.documentElement.dataset.theme === "dark";
  const newTheme = isDark ? "light" : "dark";

  if (!supportsVT || reduced) {
    document.documentElement.dataset.theme = newTheme;
    updateToggleIcon(newTheme);
    return;
  }

  const { clientX: x, clientY: y } = e;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  document.documentElement.style.setProperty("--wipe-x", `${x}px`);
  document.documentElement.style.setProperty("--wipe-y", `${y}px`);
  document.documentElement.style.setProperty("--wipe-radius", `${radius}px`);

  document.startViewTransition(() => {
    document.documentElement.dataset.theme = newTheme;
    updateToggleIcon(newTheme);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: FEATURED ARTICLE — SplitText line reveal on scroll
// ═══════════════════════════════════════════════════════════════════

const featuredTitle = document.getElementById("featured-title");

if (featuredTitle) {
  const featuredSplit = new SplitText(featuredTitle, {
    type: "lines",
    linesClass: "line",
  });

  gsap.set(featuredSplit.lines, {
    opacity: 0,
    y: reduced ? 0 : 40,
  });

  gsap.to(featuredSplit.lines, {
    opacity: 1,
    y: 0,
    duration: dur(0.7),
    ease: "expo.out",
    stagger: { each: 0.12 },
    scrollTrigger: {
      trigger: ".featured",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// Featured card entrance
const featuredCard = document.querySelector(".featured-card");
if (featuredCard) {
  gsap.set(featuredCard, { opacity: 0, y: reduced ? 0 : 30 });

  gsap.to(featuredCard, {
    opacity: 1,
    y: 0,
    duration: dur(0.8),
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".featured",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: ARTICLE GRID — stagger entrance + reading view
// ═══════════════════════════════════════════════════════════════════

const articlesGrid = document.getElementById("articles-grid");
const articleCards = document.querySelectorAll(".article-card");

// Card entrance animation
articleCards.forEach((card, i) => {
  gsap.set(card, { opacity: 0, y: reduced ? 0 : 40 });

  gsap.to(card, {
    opacity: 1,
    y: 0,
    duration: dur(0.6),
    ease: "expo.out",
    delay: i * 0.1,
    scrollTrigger: {
      trigger: ".articles-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
});

// ── Reading View Logic ───────────────────────────────────────────

let activeReadingCard = null;

function openReadingView(card) {
  if (activeReadingCard === card) return;

  // Close any existing reading view first
  if (activeReadingCard) {
    closeReadingView(false);
  }

  const doOpen = () => {
    card.classList.add("reading-view");
    articlesGrid.classList.add("has-reading-view");
    activeReadingCard = card;

    // Scroll to the card
    card.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

    // Refresh ScrollTrigger after layout change
    setTimeout(() => ScrollTrigger.refresh(), 100);
  };

  if (supportsVT && !reduced) {
    // Set a view-transition-name on the card dynamically
    card.style.viewTransitionName = "article-expand";

    document
      .startViewTransition(() => {
        doOpen();
      })
      .finished.then(() => {
        card.style.viewTransitionName = "";
      });
  } else {
    doOpen();
  }
}

function closeReadingView(useTransition = true) {
  if (!activeReadingCard) return;

  const card = activeReadingCard;

  const doClose = () => {
    card.classList.remove("reading-view");
    articlesGrid.classList.remove("has-reading-view");
    activeReadingCard = null;

    // Refresh ScrollTrigger after layout change
    setTimeout(() => ScrollTrigger.refresh(), 100);
  };

  if (supportsVT && !reduced && useTransition) {
    card.style.viewTransitionName = "article-expand";

    document
      .startViewTransition(() => {
        doClose();
      })
      .finished.then(() => {
        card.style.viewTransitionName = "";
      });
  } else {
    doClose();
  }
}

// Click handlers for cards
articleCards.forEach((card) => {
  const closeBtn = card.querySelector(".card-close-btn");

  card.addEventListener("click", (e) => {
    // Do not open if we're clicking the close button
    if (e.target.closest(".card-close-btn")) return;

    // Only open if not already in reading view
    if (!card.classList.contains("reading-view")) {
      openReadingView(card);
    }
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeReadingView();
  });
});

// Close reading view on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && activeReadingCard) {
    closeReadingView();
  }
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: NEWSLETTER — SplitText word reveal
// ═══════════════════════════════════════════════════════════════════

const newsletterHeading = document.getElementById("newsletter-heading");

if (newsletterHeading) {
  const nlSplit = new SplitText(newsletterHeading, {
    type: "words",
    wordsClass: "word",
  });

  gsap.set(nlSplit.words, {
    opacity: 0,
    y: reduced ? 0 : 25,
  });

  gsap.to(nlSplit.words, {
    opacity: 1,
    y: 0,
    duration: dur(0.6),
    ease: "expo.out",
    stagger: { each: 0.08 },
    scrollTrigger: {
      trigger: ".newsletter",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// Newsletter subtitle entrance
const nlSubtitle = document.querySelector(".newsletter-subtitle");
if (nlSubtitle) {
  gsap.set(nlSubtitle, { opacity: 0, y: reduced ? 0 : 15 });

  gsap.to(nlSubtitle, {
    opacity: 1,
    y: 0,
    duration: dur(0.6),
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".newsletter",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });
}

// Newsletter form entrance
const nlForm = document.querySelector(".newsletter-form");
if (nlForm) {
  gsap.set(nlForm, { opacity: 0, y: reduced ? 0 : 15 });

  gsap.to(nlForm, {
    opacity: 1,
    y: 0,
    duration: dur(0.6),
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".newsletter",
      start: "top 65%",
      toggleActions: "play none none reverse",
    },
  });
}

// Footer entrance
const siteFooter = document.querySelector(".site-footer");
if (siteFooter) {
  gsap.set(siteFooter, { opacity: 0 });

  gsap.to(siteFooter, {
    opacity: 1,
    duration: dur(0.5),
    ease: "expo.out",
    scrollTrigger: {
      trigger: siteFooter,
      start: "top 95%",
      toggleActions: "play none none reverse",
    },
  });
}
