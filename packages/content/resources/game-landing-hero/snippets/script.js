/* Hollow Reign — landing page interactions (vanilla JS) */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
  }

  /* ---------- Sticky nav scroll state ---------- */
  const nav = $("#siteNav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Wishlist toggle (synced buttons + count) ---------- */
  const wishlistButtons = [$("#navWishlist"), $("#heroWishlist")].filter(Boolean);
  const countEl = $("#wishlistCount");
  const baseCount = 128407;
  let wishlisted = false;

  function renderWishlist() {
    const count = baseCount + (wishlisted ? 1 : 0);
    countEl.textContent = count.toLocaleString("en-US");
    wishlistButtons.forEach((btn) => {
      btn.classList.toggle("is-wishlisted", wishlisted);
      btn.setAttribute("aria-pressed", String(wishlisted));
      const label = btn.querySelector("[data-wishlist-label]");
      if (label) {
        const isHero = btn.id === "heroWishlist";
        label.textContent = wishlisted
          ? "Wishlisted"
          : isHero
            ? "Add to Wishlist"
            : "Wishlist";
      }
    });
  }

  wishlistButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      wishlisted = !wishlisted;
      renderWishlist();
      toast(
        wishlisted
          ? "Hollow Reign added to your wishlist."
          : "Removed from your wishlist."
      );
    })
  );
  renderWishlist();

  /* ---------- Trailer lightbox ---------- */
  const lightbox = $("#lightbox");
  const trailerBtn = $("#trailerBtn");
  const closeBtn = $("#lightboxClose");
  let lastFocused = null;

  function openLightbox() {
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    closeBtn.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    if (lastFocused) lastFocused.focus();
  }

  trailerBtn.addEventListener("click", openLightbox);
  closeBtn.addEventListener("click", closeLightbox);
  $("[data-close-lightbox]").addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
  // Basic focus trap inside the dialog
  lightbox.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusables = $$("button", lightbox);
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
  $("#fakePlay").addEventListener("click", () =>
    toast("Trailer placeholder — embed your video player here.")
  );

  /* ---------- Screenshot carousel (auto + manual) ---------- */
  const track = $("#carouselTrack");
  const slides = $$(".shot", track);
  const dotsWrap = $("#carouselDots");
  let index = 0;
  let autoTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Screenshot ${i + 1}`);
    dot.addEventListener("click", () => {
      goTo(i);
      restartAuto();
    });
    dotsWrap.appendChild(dot);
  });
  const dots = $$("button", dotsWrap);

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) =>
      d.setAttribute("aria-selected", String(di === index))
    );
  }

  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(index + 1), 5000);
  }

  $("#prevShot").addEventListener("click", () => {
    goTo(index - 1);
    restartAuto();
  });
  $("#nextShot").addEventListener("click", () => {
    goTo(index + 1);
    restartAuto();
  });

  // Pause auto-advance while hovering or focused inside the carousel
  const carousel = $("#carousel");
  carousel.addEventListener("mouseenter", () => clearInterval(autoTimer));
  carousel.addEventListener("mouseleave", restartAuto);
  carousel.addEventListener("focusin", () => clearInterval(autoTimer));
  carousel.addEventListener("focusout", restartAuto);

  goTo(0);
  restartAuto();

  /* ---------- Edition pre-order buttons ---------- */
  $$("[data-edition]").forEach((btn) =>
    btn.addEventListener("click", () =>
      toast(`${btn.dataset.edition} Edition added to cart — see you 11.09.26!`)
    )
  );

  /* ---------- Newsletter form ---------- */
  const form = $("#newsForm");
  const emailInput = $("#newsEmail");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    emailInput.classList.toggle("is-invalid", !valid);
    if (!valid) {
      toast("Enter a valid email address to enlist.");
      emailInput.focus();
      return;
    }
    form.reset();
    toast("Enlisted! First war dispatch inbound.");
  });
  emailInput.addEventListener("input", () =>
    emailInput.classList.remove("is-invalid")
  );

  /* ---------- Scroll-reveal sections ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-revealed"));
  }
})();
