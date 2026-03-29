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
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

initDemoShell({
  title: "Atelier Blanc — Art Gallery",
  category: "pages",
  tech: ["gsap", "scroll-trigger", "lenis", "clip-path", "cormorant"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Hero entrance
if (!reduced) {
  gsap.set([".hero-season", ".hero-h1", ".hero-text p", ".btn-dark"], { opacity: 0, y: 20 });
  gsap.set([".ha-frame--main", ".ha-frame--accent"], { opacity: 0, scale: 1.03 });
  gsap.set(".ha-label", { opacity: 0 });

  gsap
    .timeline({ delay: 0.4, defaults: { ease: "expo.out" } })
    .to(".hero-season", { opacity: 1, y: 0, duration: 0.7 })
    .to(".hero-h1", { opacity: 1, y: 0, duration: 1.2 }, "-=0.4")
    .to(".hero-text p", { opacity: 1, y: 0, duration: 0.9 }, "-=0.6")
    .to(".btn-dark", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
    .to(".ha-frame--main", { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" }, 0.5)
    .to(".ha-frame--accent", { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" }, 0.8)
    .to(".ha-label", { opacity: 1, duration: 0.8 }, 1.2);
}

// Works counter update
const worksCount = document.getElementById("works-count");
const workItems = document.querySelectorAll(".work-item");

workItems.forEach((item, i) => {
  if (!reduced) {
    gsap.set(item, { opacity: 0 });
    gsap.to(item, {
      opacity: 1,
      duration: 0.8,
      ease: "power1.out",
      delay: (i % 3) * 0.12,
      scrollTrigger: {
        trigger: ".works-grid",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  }
});

// Artist rows reveal
if (!reduced) {
  document.querySelectorAll(".artist-row").forEach((row, i) => {
    gsap.set(row, { opacity: 0, x: -20 });
    gsap.to(row, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".artists-list",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// Lightbox data
const artworkData = [
  {
    num: "01",
    title: "Luminous Void",
    artist: "Elias Vorne",
    medium: "Oil on canvas, 200×300cm",
    artClass: "wi-art--1",
  },
  {
    num: "02",
    title: "Still Point",
    artist: "Mara Solis",
    medium: "Photography, 80×120cm",
    artClass: "wi-art--2",
  },
  {
    num: "03",
    title: "Threshold Study",
    artist: "Jun Aoki",
    medium: "Mixed media, 150×150cm",
    artClass: "wi-art--3",
  },
  {
    num: "04",
    title: "Erosion Series I–III",
    artist: "Petra Novak",
    medium: "Sculpture (bronze), variable dimensions",
    artClass: "wi-art--4",
  },
  {
    num: "05",
    title: "Frequency",
    artist: "Yuki Tanaka",
    medium: "Digital print, 100×100cm",
    artClass: "wi-art--5",
  },
  {
    num: "06",
    title: "Residue",
    artist: "Camille Dubois",
    medium: "Watercolor, 60×80cm",
    artClass: "wi-art--6",
  },
  {
    num: "07",
    title: "Meridian",
    artist: "Elias Vorne",
    medium: "Acrylic, 180×280cm",
    artClass: "wi-art--7",
  },
  {
    num: "08",
    title: "Archive (after Borges)",
    artist: "Jun Aoki",
    medium: "Installation, site-specific",
    artClass: "wi-art--8",
  },
];

const lightbox = document.getElementById("lightbox");
const lbArtwork = document.getElementById("lb-artwork");
const lbNum = document.getElementById("lb-num");
const lbTitle = document.getElementById("lb-title");
const lbArtist = document.getElementById("lb-artist");
const lbMedium = document.getElementById("lb-medium");
let currentIdx = -1;

function openLightbox(idx) {
  const d = artworkData[idx];
  const item = workItems[idx];
  const rect = item.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  currentIdx = idx;
  lbNum.textContent = d.num;
  lbTitle.textContent = d.title;
  lbArtist.textContent = d.artist;
  lbMedium.textContent = d.medium;
  lbArtwork.className = "lb-artwork wi-art " + d.artClass;
  worksCount.textContent = `${d.num} / 08`;

  lightbox.removeAttribute("hidden");

  if (!reduced) {
    gsap.set(lightbox, {
      clipPath: `inset(${rect.top}px ${vw - rect.right}px ${vh - rect.bottom}px ${rect.left}px round 2px)`,
    });
    gsap.to(lightbox, {
      clipPath: "inset(0px 0px 0px 0px round 0px)",
      duration: 0.6,
      ease: "expo.out",
    });
    gsap.set([lbNum, lbTitle, lbArtist, lbMedium], { opacity: 0, y: 15 });
    gsap.to([lbNum, lbTitle, lbArtist, lbMedium], {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "expo.out",
      delay: 0.35,
    });
  }

  document.body.style.overflow = "hidden";
  document.getElementById("lb-close").focus();
}

function closeLightbox() {
  if (!reduced) {
    const item = workItems[currentIdx];
    const rect = item.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    gsap.to(lightbox, {
      clipPath: `inset(${rect.top}px ${vw - rect.right}px ${vh - rect.bottom}px ${rect.left}px round 2px)`,
      duration: 0.4,
      ease: "expo.in",
      onComplete: () => {
        lightbox.setAttribute("hidden", "");
        gsap.set(lightbox, { clipPath: "" });
      },
    });
  } else {
    lightbox.setAttribute("hidden", "");
  }
  document.body.style.overflow = "";
  workItems[currentIdx].focus();
}

function navigate(dir) {
  const next = (currentIdx + dir + artworkData.length) % artworkData.length;
  if (!reduced) {
    gsap.to([lbNum, lbTitle, lbArtist, lbMedium], {
      opacity: 0,
      x: dir * -20,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        currentIdx = next;
        const d = artworkData[next];
        lbNum.textContent = d.num;
        lbTitle.textContent = d.title;
        lbArtist.textContent = d.artist;
        lbMedium.textContent = d.medium;
        lbArtwork.className = "lb-artwork wi-art " + d.artClass;
        worksCount.textContent = `${d.num} / 08`;
        gsap.fromTo(
          [lbNum, lbTitle, lbArtist, lbMedium],
          { opacity: 0, x: dir * 20 },
          { opacity: 1, x: 0, duration: 0.35, stagger: 0.06, ease: "expo.out" }
        );
      },
    });
  } else {
    currentIdx = next;
    const d = artworkData[next];
    lbNum.textContent = d.num;
    lbTitle.textContent = d.title;
    lbArtist.textContent = d.artist;
    lbMedium.textContent = d.medium;
    lbArtwork.className = "lb-artwork wi-art " + d.artClass;
  }
}

workItems.forEach((item, i) => {
  item.addEventListener("click", () => openLightbox(i));
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox(i);
    }
  });
});

document.getElementById("lb-close").addEventListener("click", closeLightbox);
document.getElementById("lb-prev").addEventListener("click", () => navigate(-1));
document.getElementById("lb-next").addEventListener("click", () => navigate(1));
document.addEventListener("keydown", (e) => {
  if (!lightbox.hasAttribute("hidden")) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigate(-1);
    if (e.key === "ArrowRight") navigate(1);
  }
});

// Visit section reveal
if (!reduced) {
  gsap.set(".visit-left > *", { opacity: 0, y: 20 });
  gsap.to(".visit-left > *", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".visit-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

window.addEventListener("motion-preference", (e) => {
  gsap.globalTimeline.paused(e.detail.reduced);
});
