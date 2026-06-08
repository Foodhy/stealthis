// ── Toast helper ─────────────────────────────────────────────────────────────
const toastEl = document.getElementById("toast");
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (toastEl.hidden = true), 2800);
}

// ── Sticky nav shadow on scroll ──────────────────────────────────────────────
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ── Mobile menu ──────────────────────────────────────────────────────────────
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
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

// ── Animated hero stat counters ──────────────────────────────────────────────
function animateCount(el, target, decimals = 0, suffix = "") {
  const dur = 1400;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = (target * eased).toFixed(decimals);
    el.textContent = (decimals ? val : Math.round(target * eased).toLocaleString()) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = (decimals ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
  };
  requestAnimationFrame(step);
}

let statsDone = false;
function runStats() {
  if (statsDone) return;
  statsDone = true;
  animateCount(document.getElementById("statPatients"), 12400, 0, "+");
  animateCount(document.getElementById("statRating"), 4.9, 1);
  animateCount(document.getElementById("statYears"), 18, 0);
}

// ── Reveal-on-scroll ─────────────────────────────────────────────────────────
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );
  reveals.forEach((el) => io.observe(el));

  const heroObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        runStats();
        heroObserver.disconnect();
      }
    },
    { threshold: 0.4 }
  );
  heroObserver.observe(document.querySelector(".hero"));
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
  runStats();
}

// ── Before / After slider ────────────────────────────────────────────────────
const range = document.getElementById("compareRange");
const beforePane = document.getElementById("compareBefore");
const handle = document.getElementById("compareHandle");
function setCompare(v) {
  beforePane.style.width = v + "%";
  handle.style.left = v + "%";
}
range.addEventListener("input", (e) => setCompare(e.target.value));
setCompare(range.value);

// ── FAQ accordion ────────────────────────────────────────────────────────────
document.querySelectorAll(".faq-item").forEach((item) => {
  const q = item.querySelector(".faq-q");
  const a = item.querySelector(".faq-a");
  q.addEventListener("click", () => {
    const open = item.classList.toggle("is-open");
    q.setAttribute("aria-expanded", String(open));
    a.style.maxHeight = open ? a.scrollHeight + "px" : null;
  });
});

// ── Booking modal ────────────────────────────────────────────────────────────
const modal = document.getElementById("bookModal");
const bookForm = document.getElementById("bookForm");
let lastFocus = null;

function openModal(trigger) {
  lastFocus = trigger || document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  const first = modal.querySelector("input, select, button");
  if (first) first.focus();
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}

["navBook", "heroBook", "offerBook", "hoursBook"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", () => openModal(el));
});

modal.querySelectorAll("[data-close]").forEach((el) =>
  el.addEventListener("click", closeModal)
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

// Simple focus trap inside the modal
modal.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const focusables = modal.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea'
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

bookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(bookForm);
  const name = (data.get("name") || "").toString().trim();
  const phone = (data.get("phone") || "").toString().trim();
  if (!name || !phone) {
    toast("Please add your name and phone so we can confirm.");
    return;
  }
  const service = data.get("service");
  closeModal();
  bookForm.reset();
  toast(`Thanks, ${name.split(" ")[0]}! We'll text you about your ${service.toLowerCase()} visit.`);
});

// ── Service cards: keyboard activation opens booking ─────────────────────────
document.querySelectorAll(".service-card").forEach((card) => {
  const book = () => {
    const svc = card.querySelector("h3").textContent;
    const select = bookForm.querySelector("select");
    const match = Array.from(select.options).find((o) =>
      svc.toLowerCase().includes(o.value.toLowerCase().split(" ")[0])
    );
    if (match) select.value = match.value;
    openModal(card);
  };
  card.addEventListener("click", book);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      book();
    }
  });
});
