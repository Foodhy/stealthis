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
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

// ── Demo Shell ──
initDemoShell({
  title: "Travel Editorial",
  category: "pages",
  tech: ["gsap", "flip", "lenis", "view-transitions-api"],
});

// ── Lenis ──
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

// ═══════════════════════════════════════════════════════════════════════
// HERO ENTRANCE
// ═══════════════════════════════════════════════════════════════════════

const heroTitle = document.querySelector(".hero-title");
const heroOverline = document.querySelector(".hero-overline");
const heroRule = document.querySelector(".hero-rule");
const heroSubtitle = document.querySelector(".hero-subtitle");
const scrollArrow = document.querySelector(".scroll-arrow");

// SplitText for hero title
const titleSplit = new SplitText(heroTitle, { type: "lines", linesClass: "line" });
gsap.set(titleSplit.lines, {
  opacity: 0,
  y: reduced ? 0 : 80,
});
gsap.set(heroOverline, { opacity: 0, y: reduced ? 0 : 20 });

const heroTl = gsap.timeline({ delay: 0.3 });

heroTl
  .to(heroOverline, {
    opacity: 1,
    y: 0,
    duration: dur(0.6),
    ease: "expo.out",
  })
  .to(
    titleSplit.lines,
    {
      opacity: 1,
      y: 0,
      duration: dur(0.8),
      ease: "expo.out",
      stagger: { each: 0.15 },
    },
    0.2
  )
  .to(
    heroRule,
    {
      opacity: 1,
      width: 60,
      duration: dur(0.6),
      ease: "expo.out",
    },
    0.8
  )
  .to(
    heroSubtitle,
    {
      opacity: 1,
      duration: dur(0.6),
      ease: "expo.out",
    },
    1.0
  )
  .to(
    scrollArrow,
    {
      opacity: 1,
      duration: dur(0.5),
      ease: "expo.out",
    },
    1.3
  );

// ═══════════════════════════════════════════════════════════════════════
// PROSE SECTION: Scroll-scrubbed reading progress
// ═══════════════════════════════════════════════════════════════════════

const proseTexts = document.querySelectorAll(".prose-text");

proseTexts.forEach((el) => {
  const split = new SplitText(el, { type: "lines", linesClass: "prose-line" });

  if (reduced) {
    // All lines fully visible immediately
    split.lines.forEach((line) => (line.style.color = "var(--page-text)"));
    return;
  }

  // Each line transitions from muted to full color via scrub
  split.lines.forEach((line, i) => {
    gsap.fromTo(
      line,
      {
        color: "rgba(138, 132, 120, 1)", // --page-muted
      },
      {
        color: "rgba(26, 26, 26, 1)", // --page-text
        scrollTrigger: {
          trigger: line,
          start: "top 85%",
          end: "top 50%",
          scrub: 1,
        },
      }
    );
  });
});

// Pull quote
const quoteText = document.querySelector(".quote-text");
if (quoteText) {
  const quoteSplit = new SplitText(quoteText, { type: "words", wordsClass: "word" });
  gsap.set(quoteSplit.words, {
    opacity: 0,
    y: reduced ? 0 : 15,
  });

  gsap.to(quoteSplit.words, {
    opacity: 1,
    y: 0,
    duration: dur(0.5),
    ease: "expo.out",
    stagger: { each: 0.04 },
    scrollTrigger: {
      trigger: quoteText,
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════
// HORIZONTAL PHOTO GALLERY
// ═══════════════════════════════════════════════════════════════════════

const gallerySection = document.querySelector(".gallery-section");
const galleryTrack = document.querySelector(".gallery-track");
const panels = document.querySelectorAll(".gallery-panel");
const galleryFill = document.getElementById("gallery-fill");
const galleryProgress = document.querySelector(".gallery-progress");

if (galleryTrack && panels.length > 0) {
  const totalWidth = panels.length * window.innerWidth;

  // Horizontal scroll via pin
  const galleryTween = gsap.to(galleryTrack, {
    x: () => -(totalWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
      trigger: gallerySection,
      start: "top top",
      end: () => `+=${totalWidth}`,
      scrub: 1.5,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        // Update progress bar
        if (galleryFill) {
          galleryFill.style.width = `${self.progress * 100}%`;
        }
      },
      onEnter: () => galleryProgress?.classList.add("visible"),
      onLeave: () => galleryProgress?.classList.remove("visible"),
      onEnterBack: () => galleryProgress?.classList.add("visible"),
      onLeaveBack: () => galleryProgress?.classList.remove("visible"),
    },
  });

  // Panel captions fade in
  panels.forEach((panel, i) => {
    const caption = panel.querySelector(".panel-caption");
    if (!caption || reduced) return;

    gsap.to(caption, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "expo.out",
      scrollTrigger: {
        trigger: panel,
        containerAnimation: galleryTween,
        start: "left 60%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// FLIP STORIES SECTION
// ═══════════════════════════════════════════════════════════════════════

const storiesGrid = document.getElementById("stories-grid");
const storyCards = document.querySelectorAll(".story-card");

// Stories section entrance
const storiesHeading = document.querySelector(".stories-heading");
if (storiesHeading) {
  const storiesSplit = new SplitText(storiesHeading, { type: "words", wordsClass: "word" });
  gsap.set(storiesSplit.words, {
    opacity: 0,
    y: reduced ? 0 : 20,
  });

  gsap.to(storiesSplit.words, {
    opacity: 1,
    y: 0,
    duration: dur(0.5),
    ease: "expo.out",
    stagger: { each: 0.06 },
    scrollTrigger: {
      trigger: ".stories-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// Card entrance animation
storyCards.forEach((card, i) => {
  gsap.set(card, { opacity: 0, y: reduced ? 0 : 40 });

  gsap.to(card, {
    opacity: 1,
    y: 0,
    duration: dur(0.6),
    ease: "expo.out",
    delay: i * 0.1,
    scrollTrigger: {
      trigger: ".stories-section",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });
});

// FLIP toggle
storyCards.forEach((card) => {
  const toggleBtn = card.querySelector(".story-toggle");

  function toggleCard() {
    const isExpanded = card.classList.contains("expanded");

    if (reduced) {
      // No animation, just toggle
      if (isExpanded) {
        card.classList.remove("expanded");
        toggleBtn.textContent = "Read more";
      } else {
        // Collapse any other expanded cards
        storyCards.forEach((c) => {
          c.classList.remove("expanded");
          c.querySelector(".story-toggle").textContent = "Read more";
        });
        card.classList.add("expanded");
        toggleBtn.textContent = "Close";
      }
      return;
    }

    // Get current state for FLIP
    const flipState = Flip.getState(storyCards);

    if (isExpanded) {
      card.classList.remove("expanded");
      toggleBtn.textContent = "Read more";
    } else {
      // Collapse any other expanded cards first
      storyCards.forEach((c) => {
        c.classList.remove("expanded");
        c.querySelector(".story-toggle").textContent = "Read more";
      });
      card.classList.add("expanded");
      toggleBtn.textContent = "Close";
    }

    // Animate the layout change
    Flip.from(flipState, {
      duration: 0.7,
      ease: "expo.inOut",
      stagger: 0.04,
      absolute: true,
      onComplete: () => ScrollTrigger.refresh(),
    });
  }

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCard();
  });

  card.addEventListener("click", () => {
    if (!card.classList.contains("expanded")) {
      toggleCard();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// CLOSING SECTION
// ═══════════════════════════════════════════════════════════════════════

const closingQuote = document.querySelector(".closing-quote");
if (closingQuote) {
  const closingSplit = new SplitText(closingQuote, { type: "words", wordsClass: "word" });
  gsap.set(closingSplit.words, {
    opacity: 0,
    y: reduced ? 0 : 25,
  });

  gsap.to(closingSplit.words, {
    opacity: 1,
    y: 0,
    duration: dur(0.6),
    ease: "expo.out",
    stagger: { each: 0.08 },
    scrollTrigger: {
      trigger: ".closing-section",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });
}

const closingMeta = document.querySelector(".closing-meta");
if (closingMeta) {
  gsap.set(closingMeta, { opacity: 0, y: reduced ? 0 : 15 });

  gsap.to(closingMeta, {
    opacity: 1,
    y: 0,
    duration: dur(0.6),
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".closing-section",
      start: "top 60%",
      toggleActions: "play none none reverse",
    },
  });
}
