// ── Toast helper ─────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2800);
}

// ── Sticky bar shadow on scroll ──────────────────────────────────────────────
const bar = document.getElementById("bar");
function onScroll() {
  bar.classList.toggle("is-stuck", window.scrollY > 8);
}
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// ── Mobile nav ───────────────────────────────────────────────────────────────
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");

function setNav(open) {
  nav.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

burger.addEventListener("click", () => {
  setNav(!nav.classList.contains("open"));
});

// Close the menu after tapping any in-page link
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") setNav(false);
});

// Close on Escape, or when resizing back to desktop
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    setNav(false);
    burger.focus();
  }
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) setNav(false);
});

// ── Reveal on scroll ─────────────────────────────────────────────────────────
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reveals = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((el) => el.classList.add("in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  reveals.forEach((el) => io.observe(el));
}

// ── Booking CTAs (illustrative only) ─────────────────────────────────────────
document.querySelectorAll("[data-book]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    // Allow the in-page jump to #book, but always confirm the (fictional) action.
    showToast("Thanks for reaching out — we'd guide you to a free intro call here.");
  });
});

// ── Service cards keyboard-friendly toast (gentle detail) ────────────────────
document.querySelectorAll(".svc").forEach((svc) => {
  svc.addEventListener("click", () => {
    const name = svc.querySelector("h3")?.textContent || "this service";
    showToast(`${name}: book a free intro call to see if it's the right fit.`);
  });
});
