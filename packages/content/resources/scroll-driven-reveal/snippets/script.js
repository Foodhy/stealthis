(() => {
  "use strict";

  const root = document.documentElement;

  /* ---------------------------------------------------------
   * 1. Feature detection — CSS scroll-driven animations
   * --------------------------------------------------------- */
  const SUPPORTS_SDA =
    typeof CSS !== "undefined" &&
    CSS.supports &&
    CSS.supports("animation-timeline: view()");

  const support = document.getElementById("support");
  if (support) {
    if (SUPPORTS_SDA) {
      support.dataset.state = "native";
      support.querySelector(".support__label").textContent = "Native scroll-driven";
    } else {
      support.dataset.state = "fallback";
      support.querySelector(".support__label").textContent = "IntersectionObserver fallback";
    }
  }

  /* ---------------------------------------------------------
   * 2. Populate demo content
   * --------------------------------------------------------- */
  const cards = [
    { icon: "◇", title: "Declarative", body: "Motion lives in CSS keyframes — no scroll listeners to write or leak." },
    { icon: "⟡", title: "Off main thread", body: "Timelines run in the compositor, so reveals stay smooth under load." },
    { icon: "◈", title: "Geometry-based", body: "animation-range maps keyframes to how far an element has entered." },
    { icon: "❖", title: "Composable", body: "Mix view() reveals with a scroll() progress bar on the same page." },
    { icon: "✦", title: "Accessible", body: "Honors prefers-reduced-motion by collapsing the animation range." },
    { icon: "⬡", title: "Progressive", body: "@supports gives non-supporting browsers a graceful fallback." },
  ];
  const grid = document.getElementById("revealGrid");
  if (grid) {
    grid.innerHTML = cards
      .map(
        (c) => `
      <article class="card" data-reveal-card>
        <div class="card__icon" aria-hidden="true">${c.icon}</div>
        <h3>${c.title}</h3>
        <p>${c.body}</p>
      </article>`
      )
      .join("");
  }

  const rows = [
    { title: "entry 10% → cover 40%", sub: "Row reveals as its top edge enters", pill: "delay 0ms" },
    { title: "entry 16% → cover 46%", sub: "Range start nudged later", pill: "delay ~120ms" },
    { title: "entry 22% → cover 52%", sub: "Later again — creates the cascade", pill: "delay ~240ms" },
    { title: "entry 28% → cover 58%", sub: "Each row scrubs independently", pill: "delay ~360ms" },
    { title: "entry 34% → cover 64%", sub: "All bound to one view() timeline", pill: "delay ~480ms" },
  ];
  const stagger = document.getElementById("stagger");
  if (stagger) {
    stagger.innerHTML = rows
      .map(
        (r, i) => `
      <li data-reveal style="--enter-start:${10 + i * 6}%; --enter-end:${40 + i * 6}%;">
        <span class="idx">${String(i + 1).padStart(2, "0")}</span>
        <span class="txt"><strong>${r.title}</strong><span>${r.sub}</span></span>
        <span class="pill">${r.pill}</span>
      </li>`
      )
      .join("");
  }

  /* ---------------------------------------------------------
   * 3. Controls — effect, range, replay
   * --------------------------------------------------------- */
  root.dataset.effect = "fade";

  const effect = document.getElementById("effect");
  if (effect) {
    effect.addEventListener("click", (e) => {
      const btn = e.target.closest(".seg");
      if (!btn) return;
      effect.querySelectorAll(".seg").forEach((b) =>
        b.setAttribute("aria-checked", String(b === btn))
      );
      root.dataset.effect = btn.dataset.effect;
      replay();
    });
  }

  const range = document.getElementById("range");
  const rangeOut = document.getElementById("rangeOut");
  function applyRange() {
    if (!range) return;
    const start = Number(range.value);
    const end = start + 30;
    root.style.setProperty("--enter-start", start + "%");
    root.style.setProperty("--enter-end", end + "%");
    if (rangeOut) rangeOut.textContent = `cover ${start}%→${end}%`;
  }
  if (range) {
    range.addEventListener("input", applyRange);
    applyRange();
  }

  const replayBtn = document.getElementById("replay");
  function replay() {
    // Toggling animation:none then forcing reflow restarts view() timelines.
    root.dataset.replay = "1";
    // force reflow
    void document.body.offsetHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        delete root.dataset.replay;
      });
    });

    // In fallback mode, re-trigger the observer classes too.
    if (!SUPPORTS_SDA) {
      document.querySelectorAll("[data-reveal], .card").forEach((el) => {
        el.classList.remove("is-in");
      });
      // observer will re-add on next intersection; nudge those already visible
      requestAnimationFrame(refreshFallbackVisibility);
    }
  }
  if (replayBtn) replayBtn.addEventListener("click", replay);

  /* ---------------------------------------------------------
   * 4. Fallback — tiny IntersectionObserver polyfill for reveals
   *    (only does real work when native SDA is missing)
   * --------------------------------------------------------- */
  let io = null;
  function markInView(el) {
    el.classList.add("is-in");
  }
  function refreshFallbackVisibility() {
    document.querySelectorAll("[data-reveal], .card").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) markInView(el);
    });
  }

  function initFallback() {
    const targets = document.querySelectorAll("[data-reveal], .card");
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              markInView(entry.target);
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
      );
      targets.forEach((el) => io.observe(el));
    } else {
      // No IO at all — reveal everything immediately.
      targets.forEach(markInView);
    }

    // Progress bar + dial via scroll handler (rAF-throttled).
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const p = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
        root.style.setProperty("--js-progress", String(p));
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  if (!SUPPORTS_SDA) {
    initFallback();
  }
})();
