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
import { TextPlugin } from "gsap/TextPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

initDemoShell({
  title: "Data Dashboard",
  category: "pages",
  tech: ["gsap", "canvas-2d", "scrolltrigger", "lenis", "textplugin"],
});

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ─── Hero ───────────────────────────────────────────────────────────────────
if (!reduced) {
  const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });
  gsap.set([".hero-badge", ".hero-title", ".hero-sub", ".hero-cta"], { opacity: 0, y: 30 });
  heroTl
    .to(".hero-badge", { opacity: 1, y: 0, duration: 0.6, delay: 0.4 })
    .to(".hero-title", { opacity: 1, y: 0, duration: 1 }, "-=0.3")
    .to(".hero-sub", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
    .to(".hero-cta", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
}

// Gradient hue shift on scroll — hero title (Demo 37 technique)
if (!reduced) {
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const hue = self.progress * 360;
      document.documentElement.style.setProperty("--hue-shift", `${hue}deg`);
    },
  });
}

// ─── Metrics Counters (Demo 36 technique) ───────────────────────────────────
const metricCards = document.querySelectorAll(".metric-card");

metricCards.forEach((card, i) => {
  const valueEl = card.querySelector(".metric-value");
  const target = Number.parseFloat(card.dataset.target);
  const suffix = card.dataset.suffix || "";
  let currentValue = 0;

  if (!reduced) {
    // Card entrance
    gsap.set(card, { opacity: 0, y: 40, scale: 0.95 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "expo.out",
      delay: i * 0.07,
      scrollTrigger: {
        trigger: ".metrics-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });

    // Progress bar fill
    const bar = card.querySelector(".metric-bar-fill");
    if (bar) {
      gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
      gsap.to(bar, {
        scaleX: 1,
        duration: 1.2,
        ease: "expo.out",
        delay: i * 0.1 + 0.5,
        scrollTrigger: {
          trigger: ".metrics-grid",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
    }

    // Counter animation scrubbed to scroll
    ScrollTrigger.create({
      trigger: card,
      start: "top 80%",
      end: "top 20%",
      onUpdate: (self) => {
        const progress = self.progress;
        currentValue = target * progress;

        let display;
        if (target >= 1000) {
          display = Math.round(currentValue).toLocaleString();
        } else if (target < 10) {
          display = currentValue.toFixed(1);
        } else {
          display = Math.round(currentValue);
        }
        valueEl.textContent = display + suffix;
      },
    });
  } else {
    valueEl.textContent = target >= 1000 ? target.toLocaleString() + suffix : target + suffix;
  }
});

// ─── Section Headers ─────────────────────────────────────────────────────────
document.querySelectorAll(".section-header").forEach((header) => {
  if (!reduced) {
    gsap.set(header.children, { opacity: 0, y: 30 });
    gsap.to(header.children, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "expo.out",
      stagger: 0.1,
      scrollTrigger: { trigger: header, start: "top 75%", toggleActions: "play none none reverse" },
    });
  }
});

// ─── Canvas Charts ───────────────────────────────────────────────────────────
function animateBarChart(canvas, progress) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const data2024 = [22, 28, 25, 32, 30, 38, 35, 41, 38, 44, 42, 48];
  const data2025 = [48, 52, 45, 58, 62, 55, 68, 72, 65, 78, 82, 90];
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const padding = { top: 16, right: 16, bottom: 32, left: 32 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;
  const maxVal = Math.max(...data2025) * 1.1;
  const barGroupW = chartW / data2024.length;
  const barW = barGroupW * 0.35;

  ctx.clearRect(0, 0, W, H);
  ctx.font = "10px -apple-system, sans-serif";
  ctx.fillStyle = "rgba(138, 149, 168, 0.5)";

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - (chartH * i) / 4;
    ctx.beginPath();
    ctx.strokeStyle = "rgba(38, 50, 73, 0.8)";
    ctx.lineWidth = 1;
    ctx.moveTo(padding.left, y);
    ctx.lineTo(W - padding.right, y);
    ctx.stroke();
    ctx.fillText(Math.round((maxVal * i) / 4), 2, y + 4);
  }

  // Bars
  data2024.forEach((val, i) => {
    const x = padding.left + i * barGroupW;
    const barH2024 = (val / maxVal) * chartH * Math.min(1, progress * 1.5);
    const barH2025 = (data2025[i] / maxVal) * chartH * Math.min(1, progress * 1.5);

    // 2024 bar
    ctx.fillStyle = "rgba(134, 232, 255, 0.35)";
    ctx.fillRect(x + barGroupW * 0.1, padding.top + chartH - barH2024, barW, barH2024);

    // 2025 bar
    ctx.fillStyle = "rgba(174, 82, 255, 0.7)";
    ctx.fillRect(x + barGroupW * 0.1 + barW + 2, padding.top + chartH - barH2025, barW, barH2025);

    // Month label
    ctx.fillStyle = "rgba(138, 149, 168, 0.7)";
    ctx.fillText(months[i], x + barGroupW * 0.3, H - 8);
  });
}

function animateDonutChart(canvas, progress) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const outerR = Math.min(W, H) * 0.42;
  const innerR = outerR * 0.58;
  const data = [
    { val: 0.62, color: "#86e8ff", label: "SaaS" },
    { val: 0.28, color: "#ae52ff", label: "Enterprise" },
    { val: 0.1, color: "#ffcc66", label: "Add-ons" },
  ];

  ctx.clearRect(0, 0, W, H);

  let startAngle = -Math.PI / 2;
  data.forEach((seg) => {
    const sweep = seg.val * 2 * Math.PI * Math.min(1, progress);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, startAngle, startAngle + sweep);
    ctx.arc(cx, cy, innerR, startAngle + sweep, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    startAngle += sweep;
  });

  // Center text
  ctx.font = `bold 18px -apple-system, sans-serif`;
  ctx.fillStyle = "#f0f4fb";
  ctx.textAlign = "center";
  ctx.fillText("Revenue", cx, cy - 4);
  ctx.font = `12px -apple-system, sans-serif`;
  ctx.fillStyle = "#8a95a8";
  ctx.fillText("Q4 2025", cx, cy + 14);
}

function animateAreaChart(canvas, progress) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const padding = { top: 16, right: 16, bottom: 24, left: 40 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  // Generate random-ish API request data
  const points = Array.from({ length: 30 }, (_, i) => {
    const base = 2.5 + Math.sin(i * 0.4) * 0.6;
    const noise = Math.sin(i * 1.7 + 2) * 0.3 + Math.sin(i * 0.9) * 0.2;
    return base + noise;
  });
  const maxVal = Math.max(...points) * 1.1;

  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = "rgba(38, 50, 73, 0.6)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = padding.top + (chartH * i) / 3;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(W - padding.right, y);
    ctx.stroke();
    ctx.font = "9px -apple-system, sans-serif";
    ctx.fillStyle = "rgba(138, 149, 168, 0.6)";
    ctx.fillText(`${(maxVal - (maxVal * i) / 3).toFixed(1)}M`, 2, y + 4);
  }

  const visiblePoints = Math.max(2, Math.round(points.length * progress));
  const step = chartW / (points.length - 1);

  // Area fill
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + chartH);
  points.slice(0, visiblePoints).forEach((val, i) => {
    const x = padding.left + i * step;
    const y = padding.top + chartH - (val / maxVal) * chartH;
    if (i === 0) ctx.lineTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(padding.left + (visiblePoints - 1) * step, padding.top + chartH);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  grad.addColorStop(0, "rgba(134, 232, 255, 0.25)");
  grad.addColorStop(1, "rgba(134, 232, 255, 0)");
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  points.slice(0, visiblePoints).forEach((val, i) => {
    const x = padding.left + i * step;
    const y = padding.top + chartH - (val / maxVal) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#86e8ff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Chart animation on scroll
const barCanvas = document.getElementById("bar-chart");
const donutCanvas = document.getElementById("donut-chart");
const areaCanvas = document.getElementById("area-chart");

// Initialize charts at 0
animateBarChart(barCanvas, 0);
animateDonutChart(donutCanvas, 0);
animateAreaChart(areaCanvas, 0);

if (!reduced) {
  // Chart cards entrance
  document.querySelectorAll(".chart-card").forEach((card, i) => {
    gsap.set(card, { opacity: 0, y: 40 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".charts-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });

  // Bar chart animated on scroll
  ScrollTrigger.create({
    trigger: barCanvas,
    start: "top 80%",
    end: "top 10%",
    onUpdate: (self) => animateBarChart(barCanvas, self.progress),
  });

  // Donut chart
  ScrollTrigger.create({
    trigger: donutCanvas,
    start: "top 80%",
    end: "top 10%",
    onUpdate: (self) => animateDonutChart(donutCanvas, self.progress),
  });

  // Area chart
  ScrollTrigger.create({
    trigger: areaCanvas,
    start: "top 85%",
    end: "top 20%",
    onUpdate: (self) => animateAreaChart(areaCanvas, self.progress),
  });
} else {
  // Show full charts immediately for reduced motion
  animateBarChart(barCanvas, 1);
  animateDonutChart(donutCanvas, 1);
  animateAreaChart(areaCanvas, 1);
}

// ─── Timeline ────────────────────────────────────────────────────────────────
document.querySelectorAll(".tl-item").forEach((item, i) => {
  if (!reduced) {
    const side = item.dataset.side === "left" ? -40 : 40;
    gsap.set(item, { opacity: 0, x: side });
    gsap.to(item, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "expo.out",
      scrollTrigger: { trigger: item, start: "top 75%", toggleActions: "play none none reverse" },
    });
  }
});

// ─── Team Grid ───────────────────────────────────────────────────────────────
document.querySelectorAll(".team-card").forEach((card, i) => {
  if (!reduced) {
    gsap.set(card, { opacity: 0, scale: 0.85, y: 20 });
    gsap.to(card, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.7,
      ease: "back.out(1.5)",
      delay: i * 0.08,
      scrollTrigger: {
        trigger: ".team-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  }
});

// ─── CTA ─────────────────────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".cta-section h2, .cta-section p, .cta-section a", { opacity: 0, y: 30 });
  gsap.to(".cta-section h2, .cta-section p, .cta-section a", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".cta-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ─── Motion preference ───────────────────────────────────────────────────────
window.addEventListener("motion-preference", (e) => {
  if (e.detail.reduced) {
    gsap.globalTimeline.paused(true);
    animateBarChart(barCanvas, 1);
    animateDonutChart(donutCanvas, 1);
    animateAreaChart(areaCanvas, 1);
  } else {
    gsap.globalTimeline.paused(false);
  }
});
