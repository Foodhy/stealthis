/* ============================================================
   Maya Okafor — Creative / Visual CV
   Vanilla JS: animated stat counters, skill bars on view,
   accent picker (persisted), print-mode toggle, copy email.
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Toast helper ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* ---------- Animated number counter ---------- */
  function animateCount(el, target, suffix) {
    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1300;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Skill bar fill ---------- */
  function fillBar(barEl) {
    const level = parseInt(barEl.getAttribute("data-level"), 10) || 0;
    const fill = barEl.querySelector(".bar-fill");
    const pct = barEl.querySelector("[data-bar-pct]");
    if (fill) fill.style.width = level + "%";
    if (pct) {
      if (prefersReduced) {
        pct.textContent = level + "%";
      } else {
        const start = performance.now();
        const dur = 1100;
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          pct.textContent = Math.round(eased * level) + "%";
          if (p < 1) requestAnimationFrame(tick);
          else pct.textContent = level + "%";
        })(performance.now());
      }
    }
  }

  /* ---------- IntersectionObserver to trigger on view ---------- */
  const statNodes = Array.from(document.querySelectorAll(".stat"));
  const barNodes = Array.from(document.querySelectorAll(".bar"));

  function runStat(stat) {
    const numEl = stat.querySelector("[data-stat]");
    const target = parseInt(stat.getAttribute("data-target"), 10) || 0;
    const suffix = stat.getAttribute("data-suffix") || "";
    if (numEl) animateCount(numEl, target, suffix);
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.classList.contains("stat")) runStat(el);
          if (el.classList.contains("bar")) fillBar(el);
          obs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    statNodes.forEach((n) => io.observe(n));
    barNodes.forEach((n) => io.observe(n));
  } else {
    // Fallback: just run everything immediately
    statNodes.forEach(runStat);
    barNodes.forEach(fillBar);
  }

  /* ---------- Accent picker (persisted) ---------- */
  const STORAGE_KEY = "maya-cv-accent";
  const swatches = Array.from(document.querySelectorAll(".swatch"));

  function applyAccent(name) {
    if (name && name !== "coral") {
      document.documentElement.setAttribute("data-accent", name);
    } else {
      document.documentElement.removeAttribute("data-accent");
    }
    swatches.forEach((s) => {
      const active = s.getAttribute("data-accent") === (name || "coral");
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  swatches.forEach((s) => {
    s.addEventListener("click", () => {
      const name = s.getAttribute("data-accent");
      applyAccent(name);
      try {
        localStorage.setItem(STORAGE_KEY, name);
      } catch (e) {
        /* storage may be unavailable in sandboxed iframe */
      }
      toast("Accent set to " + name);
    });
  });

  // Restore saved accent
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) applyAccent(saved);
  } catch (e) {
    /* ignore */
  }

  /* ---------- Print-mode toggle ---------- */
  const printToggle = document.getElementById("printToggle");
  if (printToggle) {
    printToggle.addEventListener("click", () => {
      const on = document.body.classList.toggle("print-mode");
      printToggle.setAttribute("aria-pressed", on ? "true" : "false");
      const label = printToggle.querySelector(".dock-btn-label");
      if (label) label.textContent = on ? "Color mode" : "Print mode";
      toast(on ? "Print-friendly mode on" : "Back to color mode");
    });
  }

  /* ---------- Download CV (demo) ---------- */
  const downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      toast("CV download is a demo — print mode is print-ready though.");
    });
  }

  /* ---------- Copy email ---------- */
  const copyEmail = document.getElementById("copyEmail");
  const EMAIL = "hello@mayaokafor.design";
  if (copyEmail) {
    copyEmail.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(EMAIL);
        } else {
          throw new Error("no clipboard");
        }
        toast("Email copied — " + EMAIL);
      } catch (e) {
        // Fallback for sandboxed contexts
        const ta = document.createElement("textarea");
        ta.value = EMAIL;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          toast("Email copied — " + EMAIL);
        } catch (err) {
          toast(EMAIL);
        }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- Social link toasts (demo) ---------- */
  document.querySelectorAll("[data-toast]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      toast(a.getAttribute("data-toast"));
    });
  });
})();
