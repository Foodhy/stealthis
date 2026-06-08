// Sunny Sprouts Pediatrics — landing interactions (vanilla JS, illustrative only)
(function () {
  "use strict";

  // ── Toast helper ───────────────────────────────────────────────────────────
  const toastEl = document.getElementById("toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2800);
  }

  // Any element with data-toast fires a toast on click.
  document.querySelectorAll("[data-toast]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (el.getAttribute("href") === "#" || el.dataset.preventNav === "true") {
        e.preventDefault();
      }
      toast(el.dataset.toast);
    });
  });

  // ── Sticky nav shadow on scroll ────────────────────────────────────────────
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ── Mobile nav toggle ──────────────────────────────────────────────────────
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  function setMenu(open) {
    navLinks.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  navToggle.addEventListener("click", () =>
    setMenu(navToggle.getAttribute("aria-expanded") !== "true")
  );

  // Smooth-scroll for in-page links + close mobile menu after a tap.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
      setMenu(false);
    });
  });

  // Close menu on Escape or when clicking outside.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });
  document.addEventListener("click", (e) => {
    if (!navLinks.classList.contains("is-open")) return;
    if (e.target.closest("#navLinks") || e.target.closest("#navToggle")) return;
    setMenu(false);
  });

  // ── Reveal on scroll (gentle staggered cascade) ────────────────────────────
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          setTimeout(() => entry.target.classList.add("is-in"), (i % 4) * 80);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // ── Animated count-up for stats ────────────────────────────────────────────
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1500;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const statEls = document.querySelectorAll(".stat__num[data-count]");
  if ("IntersectionObserver" in window) {
    const statIo = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    statEls.forEach((el) => statIo.observe(el));
  } else {
    statEls.forEach(animateCount);
  }

  // ── Scroll-spy: highlight the active nav link ──────────────────────────────
  const spyIds = ["services", "parents", "team", "stats", "book"];
  const linkFor = (id) =>
    document.querySelector('.nav__links a[href="#' + id + '"]');
  const spySections = spyIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && spySections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkFor(entry.target.id);
          if (!link || !entry.isIntersecting) return;
          document
            .querySelectorAll(".nav__links a.is-active")
            .forEach((a) => a.classList.remove("is-active"));
          link.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    spySections.forEach((s) => spy.observe(s));
  }

  // ── Services checklist ("add to your visit") ───────────────────────────────
  const grid = document.getElementById("serviceGrid");
  const basket = document.getElementById("basket");
  const basketCount = document.getElementById("basketCount");
  const basketList = document.getElementById("basketList");
  const basketClear = document.getElementById("basketClear");
  const basketBook = document.getElementById("basketBook");
  const chosen = new Set();

  // Turn HTML entities (e.g. &amp;) from data attributes back into text.
  function decode(str) {
    const t = document.createElement("textarea");
    t.innerHTML = str;
    return t.value;
  }

  function renderBasket() {
    const items = [...chosen];
    const n = items.length;
    basketCount.textContent = String(n);
    if (n === 0) {
      basket.hidden = true;
      return;
    }
    basket.hidden = false;
    const names = items.map(decode);
    // basketCount already shows the number; keep the trailing copy in sync.
    basketList.textContent =
      n === 1
        ? "service ready · " + names[0]
        : "services ready · " + names.slice(0, 2).join(", ") +
          (n > 2 ? " +" + (n - 2) + " more" : "");
  }

  if (grid) {
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".svc");
      if (!card) return;
      const name = card.dataset.svc;
      const added = card.classList.toggle("is-added");
      card.setAttribute("aria-pressed", String(added));
      if (added) {
        chosen.add(name);
        toast("Added " + decode(name) + " to your checklist 💛");
      } else {
        chosen.delete(name);
        toast("Removed " + decode(name));
      }
      renderBasket();
    });

    // Make each service card behave like a toggle for assistive tech.
    grid.querySelectorAll(".svc").forEach((c) =>
      c.setAttribute("aria-pressed", "false")
    );
  }

  if (basketClear) {
    basketClear.addEventListener("click", () => {
      chosen.clear();
      grid
        .querySelectorAll(".svc.is-added")
        .forEach((c) => {
          c.classList.remove("is-added");
          c.setAttribute("aria-pressed", "false");
        });
      renderBasket();
      toast("Checklist cleared");
    });
  }

  if (basketBook) {
    basketBook.addEventListener("click", () => {
      const n = chosen.size;
      toast(
        "Saved " + n + (n === 1 ? " service" : " services") +
          " — booking is illustrative only 💛"
      );
    });
  }
})();
