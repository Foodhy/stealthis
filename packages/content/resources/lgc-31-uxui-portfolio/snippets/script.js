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

// ── Plugin registration ────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, SplitText);

// ── Demo Shell ─────────────────────────────────────────────────
initDemoShell({
  title: "UX/UI Designer Portfolio",
  category: "pages",
  tech: ["gsap", "lenis", "scrolltrigger", "splittext", "view-transitions-api"],
});

// ── Reduced motion ─────────────────────────────────────────────
let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);
  ScrollTrigger.refresh();
});

const dur = (d) => (reduced ? 0 : d);

// ── Lenis smooth scroll ────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ═══════════════════════════════════════════════════════════════
// HERO ANIMATIONS
// ═══════════════════════════════════════════════════════════════

function initHero() {
  const nameEl = document.querySelector(".hero__name");
  if (!nameEl) return;

  // SplitText — char by char animation
  const split = new SplitText(nameEl, { type: "chars", charsClass: "char" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(split.chars, {
    y: 60,
    opacity: 0,
    duration: dur(1),
    stagger: 0.03,
  })
    .to(
      ".hero__eyebrow",
      {
        opacity: 1,
        duration: dur(0.6),
      },
      "-=0.5"
    )
    .to(
      ".hero__role",
      {
        opacity: 1,
        y: 0,
        duration: dur(0.5),
      },
      "-=0.3"
    )
    .to(
      ".hero__tagline",
      {
        opacity: 1,
        duration: dur(0.5),
      },
      "-=0.2"
    )
    .to(
      ".hero__cta",
      {
        opacity: 1,
        duration: dur(0.4),
      },
      "-=0.1"
    )
    .to(
      ".hero__scroll-hint",
      {
        opacity: 1,
        duration: dur(0.4),
      },
      "-=0.1"
    );

  // Parallax on background deco circles
  if (!reduced) {
    gsap.to(".deco-circle--1", {
      y: -80,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.5,
      },
    });

    gsap.to(".deco-circle--2", {
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 2,
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// ROTATING WORDS
// ═══════════════════════════════════════════════════════════════

function initRotatingWords() {
  const wordEl = document.getElementById("rotating-word");
  if (!wordEl) return;

  const words = ["product", "interaction", "visual", "systems"];
  let currentIndex = 0;

  function rotateWord() {
    currentIndex = (currentIndex + 1) % words.length;

    if (reduced) {
      wordEl.textContent = words[currentIndex];
      return;
    }

    gsap
      .timeline()
      .to(wordEl, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          wordEl.textContent = words[currentIndex];
          gsap.set(wordEl, { y: 12 });
        },
      })
      .to(wordEl, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out",
      });
  }

  // Start rotating after hero animation finishes
  setTimeout(
    () => {
      setInterval(rotateWord, 2500);
    },
    reduced ? 0 : 2000
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION HEADING REVEALS
// ═══════════════════════════════════════════════════════════════

function initHeadingReveals() {
  const headings = document.querySelectorAll(".reveal-heading");

  headings.forEach((heading) => {
    gsap.to(heading, {
      opacity: 1,
      y: 0,
      duration: dur(0.8),
      ease: "power3.out",
      scrollTrigger: {
        trigger: heading,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// WORK CARDS
// ═══════════════════════════════════════════════════════════════

function initWorkCards() {
  const cards = document.querySelectorAll(".case-card");

  cards.forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: dur(0.7),
      ease: "power3.out",
      delay: reduced ? 0 : (i % 2) * 0.12,
      scrollTrigger: {
        trigger: card,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// PROCESS STEPS
// ═══════════════════════════════════════════════════════════════

function initProcessSteps() {
  const steps = document.querySelectorAll(".process-step");
  if (!steps.length) return;

  gsap.to(steps, {
    opacity: 1,
    y: 0,
    duration: dur(0.7),
    stagger: reduced ? 0 : 0.12,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".process-row",
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// ABOUT SECTION
// ═══════════════════════════════════════════════════════════════

function initAbout() {
  const image = document.querySelector(".about-image");
  const content = document.querySelector(".about-content");

  if (image) {
    gsap.to(image, {
      opacity: 1,
      x: 0,
      duration: dur(0.9),
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".about-layout",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  }

  if (content) {
    gsap.to(content, {
      opacity: 1,
      x: 0,
      duration: dur(0.9),
      ease: "power3.out",
      delay: reduced ? 0 : 0.15,
      scrollTrigger: {
        trigger: ".about-layout",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  }

  // Skill pills stagger
  const pills = document.querySelectorAll(".skill-pill");
  gsap.from(pills, {
    opacity: 0,
    scale: 0.85,
    duration: dur(0.4),
    stagger: reduced ? 0 : 0.04,
    ease: "back.out(1.5)",
    scrollTrigger: {
      trigger: ".about-skills",
      start: "top 85%",
      toggleActions: "play none none none",
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// FOOTER ANIMATION
// ═══════════════════════════════════════════════════════════════

function initFooter() {
  const headline = document.querySelector(".footer__headline");
  if (!headline) return;

  gsap.to(headline, {
    opacity: 1,
    y: 0,
    duration: dur(1),
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".footer",
      start: "top 85%",
      toggleActions: "play none none none",
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// CASE STUDY PROJECT DATA
// ═══════════════════════════════════════════════════════════════

const projectData = {
  finvault: {
    title: "FinVault",
    badge: "Fintech",
    year: "2024",
    color: "#d4956a",
    summary:
      "A personal finance dashboard redesign focused on reducing cognitive load and building financial confidence for everyday users.",
    challenge:
      "FinVault's existing dashboard overwhelmed users with dense data visualizations and unclear information hierarchy, leading to a 68% feature abandonment rate and low DAU retention.",
    approach:
      'I led a 3-month discovery sprint: 24 user interviews, diary studies with 8 participants, and a competitive audit of 14 fintech apps. The redesign introduced progressive disclosure, a "financial health score" to anchor the experience, and contextual micro-goals that guided users toward positive behaviors.',
    outcomes: [
      {
        label: "Engagement",
        value: "+47% DAU",
        desc: "Daily active users within 90 days of launch",
      },
      { label: "Task Success", value: "91%", desc: "Up from 54% on core financial planning tasks" },
      { label: "Satisfaction", value: "4.7★", desc: "App Store rating after redesign (from 3.2)" },
    ],
  },
  luma: {
    title: "Luma",
    badge: "Mobile App",
    year: "2024",
    color: "#9b8fbe",
    summary:
      "AI-powered mood journaling app that adapts its interface — colors, typography, content — to the user's emotional state in real time.",
    challenge:
      "Most journaling apps feel clinical or one-size-fits-all. The brief was to design an experience that felt genuinely empathetic: one that acknowledged where users were emotionally and met them there without being intrusive.",
    approach:
      'I prototyped 6 different adaptive UI models and ran moderated usability sessions with 18 users across diverse emotional states. The final design uses a gentle color temperature shift, typographic weight changes, and prompt cadence adjustment to create a sense of co-presence without AI "performance."',
    outcomes: [
      { label: "Retention", value: "+61%", desc: "30-day retention vs. category benchmark" },
      { label: "Sessions/week", value: "5.2", desc: "Average weekly journal sessions per user" },
      { label: "NPS", value: "72", desc: "Net Promoter Score at 60-day mark" },
    ],
  },
  forma: {
    title: "Forma DS",
    badge: "Design System",
    year: "2023",
    color: "#6a9e91",
    summary:
      "A comprehensive design system built for a B2B SaaS platform serving 40k+ users across 12 distinct product areas with 3 engineering teams.",
    challenge:
      "The platform had accumulated 7 years of UI debt: 4 inconsistent component libraries, 200+ one-off colors, and 3 separate icon sets. Engineers were re-building the same components independently and design reviews were bottlenecks.",
    approach:
      "I audited all existing UI, ran a component inventory workshop with both design and engineering leads, and established token architecture from scratch. The system was built in Figma with full Storybook parity, documented for both designers and developers, with WCAG AA as a baseline requirement for every component.",
    outcomes: [
      { label: "Build Speed", value: "3× faster", desc: "Feature UI implementation time reduced" },
      { label: "Components", value: "180+", desc: "Fully documented, accessible components" },
      { label: "Adoption", value: "100%", desc: "All 3 engineering teams on Forma DS by Q4" },
    ],
  },
  wayfound: {
    title: "Wayfound",
    badge: "Travel & Navigation",
    year: "2023",
    color: "#b8956e",
    summary:
      "Reimagining travel discovery for solo adventurers — from inspiration to itinerary in a single, fluid, AI-assisted experience.",
    challenge:
      'Planning a solo trip involves 8–12 different apps and websites on average. Wayfound wanted to collapse this fragmented experience into one coherent product, without losing the serendipitous "discovery" quality that makes travel planning enjoyable.',
    approach:
      'Through guerrilla research at hostels and solo travel forums, I mapped 5 distinct traveler personas and their planning rituals. The UX centers on a "wanderboard" that feels like a digital pin-board — expansive and non-linear — that progressively structures into a day-by-day itinerary as the user\'s intent becomes more defined.',
    outcomes: [
      { label: "Time Saved", value: "4.2 hrs", desc: "Average planning time reduction per trip" },
      { label: "Bookings", value: "+38%", desc: "Conversion to actual bookings vs. control" },
      { label: "Users", value: "15k", desc: "Beta waitlist signups before launch" },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// VIEW TRANSITIONS + CASE STUDY OVERLAY
// ═══════════════════════════════════════════════════════════════

function initCaseStudyOverlay() {
  const overlay = document.getElementById("detailOverlay");
  const closeBtn = document.getElementById("detailClose");
  const cards = document.querySelectorAll(".case-card");

  if (!overlay || !closeBtn) return;

  const supportsVT = typeof document.startViewTransition === "function";

  function populateOverlay(project) {
    const data = projectData[project];
    if (!data) return;

    // Hero image
    const detailImage = document.getElementById("detailImage");
    detailImage.style.background = data.color;
    detailImage.innerHTML = `
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;opacity:0.3;">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect x="10" y="20" width="60" height="40" rx="6" fill="white"/>
          <rect x="20" y="30" width="40" height="6" rx="3" fill="${data.color}"/>
          <rect x="20" y="42" width="24" height="4" rx="2" fill="${data.color}80"/>
        </svg>
      </div>
    `;

    // Text content
    document.getElementById("detailMeta").innerHTML = `
      <span class="badge">${data.badge}</span>
      <span class="case-card__year">${data.year}</span>
    `;
    document.getElementById("detailTitle").textContent = data.title;
    document.getElementById("detailSummary").textContent = data.summary;
    document.getElementById("detailChallenge").textContent = data.challenge;
    document.getElementById("detailApproach").textContent = data.approach;

    if (data.outcomes) {
      ["detailOutcome1", "detailOutcome2", "detailOutcome3"].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && data.outcomes[i]) {
          el.innerHTML = `
            <div style="font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:0.4rem;">${data.outcomes[i].label}</div>
            <div style="font-family:var(--font-serif);font-size:1.6rem;color:var(--accent);margin-bottom:0.3rem;">${data.outcomes[i].value}</div>
            <div style="font-size:0.85rem;color:var(--muted);">${data.outcomes[i].desc}</div>
          `;
        }
      });
    }
  }

  function openOverlay(project) {
    populateOverlay(project);

    const doOpen = () => {
      document.body.classList.add("detail-open");
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      overlay.scrollTop = 0;
      document.body.style.overflow = "hidden";
      lenis.stop();
      closeBtn.focus();
    };

    if (supportsVT && !reduced) {
      document.startViewTransition(doOpen);
    } else {
      doOpen();
    }
  }

  function closeOverlay() {
    const doClose = () => {
      document.body.classList.remove("detail-open");
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lenis.start();
    };

    if (supportsVT && !reduced) {
      document.startViewTransition(doClose);
    } else {
      doClose();
    }
  }

  // Attach card click handlers
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const project = card.dataset.project;
      if (project) openOverlay(project);
    });

    // Keyboard accessibility
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const project = card.dataset.project;
        if (project) openOverlay(project);
      }
    });
  });

  // Close button
  closeBtn.addEventListener("click", closeOverlay);

  // ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) {
      closeOverlay();
    }
  });

  // Click outside inner content to close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });
}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════

function init() {
  initHero();
  initRotatingWords();
  initHeadingReveals();
  initWorkCards();
  initProcessSteps();
  initAbout();
  initFooter();
  initCaseStudyOverlay();

  // Refresh ScrollTrigger after all setup
  ScrollTrigger.refresh();
}

// Run after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
