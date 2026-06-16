/* Game devlog — scroll-spy TOC, smooth scroll, reactions, back-to-top.
   Vanilla JS, no dependencies. Fictional demo data. */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Toast helper ---------- */
  const toastHost = $("#toastHost");
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-leaving");
      el.addEventListener("transitionend", () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 600); // reduced-motion fallback
    }, 2200);
  }

  /* ---------- Scroll-spy TOC ---------- */
  const tocLinks = $$(".toc-link");
  const sections = tocLinks
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  function setActive(id) {
    tocLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  const spy = new IntersectionObserver(
    (entries) => {
      // Pick the entry closest to the top band that is intersecting.
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    },
    { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Smooth scroll for all in-page anchors ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
      if (a.classList.contains("toc-link")) setActive(id.slice(1));
    });
  });

  /* ---------- Read progress ---------- */
  const post = $("#post");
  const progressFill = $("#readProgress");
  const pctLabel = $("#readPct");

  function updateProgress() {
    if (!post || !progressFill) return;
    const rect = post.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const read = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    const pct = total > 0 ? Math.round((read / total) * 100) : 0;
    progressFill.style.width = `${pct}%`;
    if (pctLabel) pctLabel.textContent = String(pct);
  }

  /* ---------- Back to top ---------- */
  const backTop = $("#backTop");

  function updateBackTop() {
    backTop.hidden = window.scrollY < 480;
  }

  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    backTop.blur();
  });

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateProgress();
        updateBackTop();
        ticking = false;
      });
    },
    { passive: true }
  );
  updateProgress();
  updateBackTop();

  /* ---------- Stat bars: animate when visible ---------- */
  const bars = $(".bars");
  if (bars) {
    const barWatcher = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            bars.classList.add("is-visible");
            barWatcher.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    barWatcher.observe(bars);
  }

  /* ---------- Reactions ---------- */
  const reactionNames = {
    fire: "Fire",
    gg: "GG",
    hype: "Hype",
    heart: "Love",
  };

  $$(".react-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pressed = btn.getAttribute("aria-pressed") === "true";
      const next = !pressed;
      btn.setAttribute("aria-pressed", String(next));

      const countEl = $(".react-count", btn);
      const base = Number(countEl.dataset.base);
      countEl.textContent = String(base + (next ? 1 : 0));

      if (next) {
        btn.classList.remove("is-popping");
        // restart the pop animation
        void btn.offsetWidth;
        btn.classList.add("is-popping");
        toast(`${reactionNames[btn.dataset.reaction] || "Reaction"} added`);
      } else {
        toast("Reaction removed");
      }
    });
  });

  /* ---------- Misc demo actions ---------- */
  const actions = {
    wishlist: () => toast("Added to wishlist — see you in the Reach"),
    comments: () => toast("Comments — demo only"),
    "full-notes": () => toast("Full patch notes — demo only"),
    "nav-prev": () => toast("Loading Update 1.3.2…"),
    "nav-next": () => toast("Loading dev diary…"),
    "copy-log": async () => {
      const text = $$("#changelogList li")
        .map((li) => `- ${li.textContent.replace(/\s+/g, " ").trim()}`)
        .join("\n");
      try {
        await navigator.clipboard.writeText(`Ashen Vanguard v1.4.0\n${text}`);
        toast("Changelog copied to clipboard");
      } catch {
        toast("Clipboard unavailable in this context");
      }
    },
  };

  $$("[data-action]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const fn = actions[el.dataset.action];
      if (!fn) return;
      if (el.tagName === "A") e.preventDefault();
      fn();
    });
  });
})();
