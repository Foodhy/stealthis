/* Scroll Progress Indicator
 * Native scroll-driven CSS timeline when supported, passive JS fallback otherwise.
 * Both paths feed the same progressbar semantics + section rail. */
(() => {
  const scroller = document.getElementById("scroller");
  const article = document.getElementById("article");
  const bar = document.getElementById("progressbar");
  const fill = document.getElementById("progressFill");
  const pct = document.getElementById("pct");
  const rail = document.getElementById("rail");
  const modeEl = document.getElementById("mode");
  // Every node this script touches must exist — bail out wholesale otherwise.
  if (!scroller || !article || !bar || !fill || !pct || !rail || !modeEl) return;

  // Both features are required: the named timeline on #scroller and the
  // timeline-scope that exports it to the bar outside the scroller.
  const nativeTimeline =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("animation-timeline: scroll()") &&
    CSS.supports("timeline-scope: --x");

  modeEl.textContent = nativeTimeline
    ? "Bar driven by CSS animation-timeline: scroll() — JS only updates ARIA + markers."
    : "CSS scroll timelines unsupported here — JS fallback driving the bar.";

  /* ---- cached metrics (never read layout during scroll) ---- */
  let maxScroll = 0;
  let dots = [];

  function buildRail() {
    rail.textContent = "";
    const sections = article.querySelectorAll("section");
    // Only write when it actually changes: this node lives inside the observed
    // #scroller subtree, and an unconditional write would re-trigger the
    // ResizeObserver ("loop completed with undelivered notifications").
    const total = (article.offsetHeight || 1) + "px";
    if (rail.style.height !== total) rail.style.height = total;
    dots = [...sections].map((section) => {
      const dot = document.createElement("span");
      dot.className = "rail__dot";
      dot.dataset.passed = "false";
      dot.style.top = section.offsetTop + "px";
      rail.appendChild(dot);
      return { el: dot, offset: section.offsetTop };
    });
  }

  function measure() {
    maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    buildRail();
    update();
  }

  /* ---- per-frame update, rAF-throttled ---- */
  let ticking = false;

  function update() {
    const top = scroller.scrollTop;
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, top / maxScroll)) : 0;

    // The CSS timeline owns the transform when it is available.
    if (!nativeTimeline) fill.style.setProperty("--p", ratio.toFixed(4));

    const percent = Math.round(ratio * 100);
    if (bar.getAttribute("aria-valuenow") !== String(percent)) {
      bar.setAttribute("aria-valuenow", String(percent));
      bar.setAttribute("aria-valuetext", percent + " percent read");
      pct.textContent = percent + "%";
    }

    const threshold = top + scroller.clientHeight * 0.35;
    for (const dot of dots) {
      const passed = threshold >= dot.offset ? "true" : "false";
      if (dot.el.dataset.passed !== passed) dot.el.dataset.passed = passed;
    }
  }

  scroller.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    },
    { passive: true }
  );

  /* ---- keyboard fallback (scroller is focusable) ---- */
  scroller.addEventListener("keydown", (e) => {
    const page = scroller.clientHeight * 0.9;
    const map = {
      PageDown: page,
      PageUp: -page,
      ArrowDown: 60,
      ArrowUp: -60,
      Home: -Infinity,
      End: Infinity,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    const delta = map[e.key];
    const next =
      delta === Infinity ? maxScroll : delta === -Infinity ? 0 : scroller.scrollTop + delta;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ top: next, behavior: reduced ? "auto" : "smooth" });
  });

  if ("ResizeObserver" in window) {
    // One observer, two targets — two observers would each schedule their own
    // measure() pass for the same layout change.
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    ro.observe(article);
  } else {
    addEventListener("resize", measure);
  }

  measure();
})();
