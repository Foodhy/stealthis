(() => {
  "use strict";

  /* ---------- Toast helper ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------- Smooth-scroll jump links ---------- */
  document.querySelectorAll("[data-jump]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      const target = id && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- Scroll reveals ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");

        // Animate any stat-bar fills inside the revealed element
        entry.target.querySelectorAll(".stat-bar-fill[data-fill]").forEach((bar) => {
          requestAnimationFrame(() => {
            bar.style.width = bar.dataset.fill + "%";
          });
        });

        // Animate counters inside the revealed element
        entry.target.querySelectorAll(".stat-num[data-count]").forEach(animateCount);

        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Count-up stats ---------- */
  function animateCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1100;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Active side-nav + topnav highlighting ---------- */
  const sections = Array.from(document.querySelectorAll(".feature[data-section]"));
  const railLinks = new Map(
    Array.from(document.querySelectorAll("[data-rail]")).map((a) => [a.dataset.rail, a])
  );
  const topLinks = new Map(
    Array.from(document.querySelectorAll(".topnav a")).map((a) => [
      a.getAttribute("href").slice(1),
      a,
    ])
  );

  function setActive(id) {
    railLinks.forEach((a, key) => a.classList.toggle("is-active", key === id));
    topLinks.forEach((a, key) => a.classList.toggle("is-active", key === id));
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.dataset.section);
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ---------- Rail progress fill ---------- */
  const railFill = document.getElementById("railFill");
  const featuresEl = document.getElementById("features");
  function updateRail() {
    const rect = featuresEl.getBoundingClientRect();
    const viewH = window.innerHeight;
    const total = rect.height - viewH * 0.4;
    const scrolled = Math.min(Math.max(viewH * 0.6 - rect.top, 0), total);
    railFill.style.height = (total > 0 ? (scrolled / total) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", updateRail, { passive: true });
  window.addEventListener("resize", updateRail);
  updateRail();

  /* ---------- Wishlist buttons ---------- */
  function wireWishlist(btn) {
    btn.addEventListener("click", () => {
      const added = btn.classList.toggle("is-added");
      btn.textContent = added ? "✓ Wishlisted" : btn.dataset.label;
      toast(
        added
          ? "Hollow Reign added to your wishlist."
          : "Removed from wishlist."
      );
    });
  }
  ["wishlistTop", "wishlistMain"].forEach((id) => {
    const btn = document.getElementById(id);
    btn.dataset.label = btn.textContent;
    wireWishlist(btn);
  });

  /* ---------- Other CTAs ---------- */
  document.getElementById("trailerBtn").addEventListener("click", () => {
    toast("Trailer drops at the Nullforge showcase — stay tuned.");
  });
  document.getElementById("newsletterBtn").addEventListener("click", () => {
    toast("Subscribed to Nullforge dev updates. First dispatch: Friday.");
  });
})();
