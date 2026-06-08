(function () {
  "use strict";

  /* ── Toast helper ── */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition runs every time
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => {
        toastEl.hidden = true;
      }, 280);
    }, 2600);
  }

  /* ── Sticky nav shadow ── */
  const nav = document.getElementById("nav");
  const onScrollNav = () => {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 8);
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ── Mobile nav toggle ── */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  function closeMenu() {
    if (!navToggle || !navLinks) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    navLinks.classList.remove("open");
  }
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      navLinks.classList.toggle("open", !open);
    });
  }

  /* ── Smooth in-page nav + close mobile menu ── */
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#")) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          closeMenu();
        }
      }
    });
  });

  /* ── Reveal on scroll ── */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ── Active nav link via section observer ── */
  const links = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
  const sections = links
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach((l) =>
              l.classList.toggle("is-active", l.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ── Animated stat counters ── */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count || "0");
    const suffix = el.dataset.suffix || "";
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 1400;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const value = target * eased;
      const shown =
        decimals > 0
          ? value.toFixed(decimals)
          : Math.round(value).toLocaleString("en-US");
      el.textContent = shown + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else
        el.textContent =
          (decimals > 0 ? target.toFixed(decimals) : target.toLocaleString("en-US")) +
          suffix;
    }
    requestAnimationFrame(frame);
  }
  const statEls = document.querySelectorAll(".stat-num[data-count]");
  if ("IntersectionObserver" in window) {
    const statObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach((el) => statObs.observe(el));
  } else {
    statEls.forEach(animateCount);
  }

  /* ── Hero consult desk: reserve a slot (live count) ── */
  const slotCountEl = document.getElementById("slotCount");
  const reserveBtn = document.getElementById("reserveBtn");
  const deskBadge = document.getElementById("deskBadge");
  if (reserveBtn && slotCountEl) {
    reserveBtn.addEventListener("click", () => {
      let count = parseInt(slotCountEl.textContent, 10) || 0;
      if (count <= 0) {
        toast("This week is fully booked — we'll add you to the waitlist.");
        return;
      }
      count -= 1;
      slotCountEl.textContent = String(count);
      if (count === 0) {
        reserveBtn.textContent = "Join the waitlist";
        if (deskBadge) {
          deskBadge.textContent = "Waitlist only";
          deskBadge.classList.remove("ok");
          deskBadge.classList.add("warn");
        }
        toast("Last slot reserved — desk is now waitlist only.");
      } else {
        toast("Consult slot reserved · " + count + " remaining this week.");
      }
    });
  }

  /* ── Surgeon profile button ── */
  const bioBtn = document.getElementById("bioBtn");
  if (bioBtn) {
    bioBtn.addEventListener("click", () => {
      toast("Dr. Vasquez's full profile would open here.");
    });
  }

  /* ── Consultation form ── */
  const form = document.getElementById("consultForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector("[name='name']");
      const email = form.querySelector("[name='email']");
      let ok = true;

      [name, email].forEach((f) => f && f.classList.remove("invalid"));

      if (!name || !name.value.trim()) {
        ok = false;
        if (name) name.classList.add("invalid");
      }
      const emailVal = email ? email.value.trim() : "";
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        ok = false;
        if (email) email.classList.add("invalid");
      }

      if (!ok) {
        toast("Please add your name and a valid email so we can reply.");
        const firstInvalid = form.querySelector(".invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const firstName = name.value.trim().split(/\s+/)[0];
      const specialty = form.querySelector("[name='specialty']");
      const spec = specialty ? specialty.value : "a specialist";
      toast("Thank you, " + firstName + " — your " + spec + " request is in.");
      form.reset();
    });

    form.querySelectorAll("input, select, textarea").forEach((el) => {
      el.addEventListener("input", () => el.classList.remove("invalid"));
    });
  }
})();
