// ── Toast ────────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2800);
}

// ── Sticky nav shadow on scroll ──────────────────────────────────────────────
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// ── Mobile nav toggle ────────────────────────────────────────────────────────
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
    if (id.length < 2) return;
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

// ── Reveal on scroll ─────────────────────────────────────────────────────────
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Stagger siblings revealing together for a gentle cascade.
        setTimeout(() => entry.target.classList.add("is-in"), (i % 4) * 70);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
}

// ── Animated count-up for hero stats ─────────────────────────────────────────
function animateCount(el) {
  const target = Number.parseFloat(el.dataset.count);
  const decimals = Number.parseInt(el.dataset.decimals || "0", 10);
  const suffix = el.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();
  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - p) ** 3; // easeOutCubic
    const value = target * eased;
    el.textContent =
      (decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US")) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const statEls = document.querySelectorAll(".stat-num[data-count]");
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

// ── Scroll-spy: highlight the active nav link ────────────────────────────────
const sections = ["services", "why", "doctors", "voices", "book"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const linkFor = (id) => document.querySelector(`.nav-links a[href="#${id}"]`);

if ("IntersectionObserver" in window && sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = linkFor(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          document
            .querySelectorAll(".nav-links a.is-active")
            .forEach((a) => a.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));
}

// ── Call button feedback ─────────────────────────────────────────────────────
const callBtn = document.getElementById("callBtn");
if (callBtn) {
  callBtn.addEventListener("click", () => showToast("Calling Northpoint Clinic — (555) 014-8821"));
}

// ── Booking form (illustrative — nothing is sent) ────────────────────────────
const bookForm = document.getElementById("bookForm");
if (bookForm) {
  const nameInput = bookForm.elements.name;
  nameInput.addEventListener("input", () => nameInput.classList.remove("invalid"));

  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!nameInput.value.trim()) {
      nameInput.classList.add("invalid");
      nameInput.focus();
      showToast("Please add your name so we know who to expect.");
      return;
    }
    const reason = bookForm.elements.reason.value;
    const first = nameInput.value.trim().split(/\s+/)[0];
    showToast(
      `Thanks, ${first} — your ${reason.toLowerCase()} request is in. We'll text to confirm.`
    );
    bookForm.reset();
  });
}
