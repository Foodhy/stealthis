/* ==========================================================================
   Moss & Ember — Indie Pixel-Art Landing
   Vanilla JS: blinking press-start, sprite/anim toggle, card bounce,
   wishlist toggle (synced across buttons), chiptune EQ teaser, toasts.
   ========================================================================== */
(function () {
  "use strict";

  /* ---- Toast helper ----------------------------------------------------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
  }

  /* ---- Blinking PRESS START -------------------------------------------- */
  const press = document.getElementById("pressStart");
  if (press) {
    setInterval(() => press.classList.toggle("is-off"), 530);
  }

  /* ---- Wishlist toggle (shared state) ---------------------------------- */
  const WISH_BASE = 48217;
  let wished = false;
  const wishButtons = [
    document.getElementById("navWishlist"),
    document.getElementById("heroWishlist"),
    document.getElementById("finaleWishlist"),
  ].filter(Boolean);
  const wishCountEl = document.getElementById("wishCount");

  function renderWishlist() {
    const count = WISH_BASE + (wished ? 1 : 0);
    if (wishCountEl) wishCountEl.textContent = count.toLocaleString("en-US");
    wishButtons.forEach((btn) => {
      btn.classList.toggle("is-wished", wished);
      btn.setAttribute("aria-pressed", String(wished));
      const label = btn.querySelector("[data-wishlist-label]");
      if (label) label.textContent = wished ? "Wishlisted ✓" : "Wishlist on Steam";
    });
  }

  function toggleWishlist() {
    wished = !wished;
    renderWishlist();
    toast(wished ? "ADDED TO WISHLIST — thank you!" : "Removed from wishlist");
  }
  wishButtons.forEach((btn) => btn.addEventListener("click", toggleWishlist));
  renderWishlist();

  /* ---- Hero fox sprite tap (bounce / lantern) -------------------------- */
  const fox = document.getElementById("heroFox");
  if (fox) {
    fox.parentElement.style.cursor = "pointer";
    fox.parentElement.addEventListener("click", () => {
      fox.classList.toggle("is-paused");
      toast(fox.classList.contains("is-paused") ? "Ember takes a nap…" : "Ember wakes up!");
    });
  }

  /* ---- Trailer button (fake) ------------------------------------------- */
  const trailer = document.getElementById("trailerBtn");
  if (trailer) {
    trailer.addEventListener("click", () => toast("Trailer is a fictional demo — no video here."));
  }

  /* ---- Screenshot frame animation toggle ------------------------------- */
  const animToggle = document.getElementById("animToggle");
  const shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  let animating = true;

  function renderAnim() {
    shots.forEach((s) => s.classList.toggle("is-animated", animating));
    if (animToggle) {
      animToggle.textContent = animating ? "❚❚ Pause animation" : "▶ Play animation";
      animToggle.setAttribute("aria-pressed", String(animating));
    }
  }
  if (animToggle) {
    animToggle.addEventListener("click", () => {
      animating = !animating;
      renderAnim();
      toast(animating ? "Screens animating" : "Screens paused");
    });
  }
  renderAnim();

  /* ---- Card hover/focus bounce ----------------------------------------- */
  document.querySelectorAll(".card").forEach((card) => {
    const bounce = () => {
      card.classList.remove("is-bounce");
      // force reflow so the animation can restart
      void card.offsetWidth;
      card.classList.add("is-bounce");
    };
    card.addEventListener("mouseenter", bounce);
    card.addEventListener("focus", bounce);
    card.addEventListener("animationend", () => card.classList.remove("is-bounce"));
  });

  /* ---- Chiptune teaser player ------------------------------------------ */
  const ostBtn = document.getElementById("ostPlay");
  const ostWrap = document.querySelector(".ost");
  const ostDisc = document.querySelector(".ost__disc");
  const ostTime = document.getElementById("ostTime");
  const TOTAL = 42; // seconds
  let playing = false;
  let elapsed = 0;
  let clock = null;

  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, "0");
    return m + ":" + sec;
  }
  function renderTime() {
    if (ostTime) ostTime.textContent = fmt(elapsed) + " / " + fmt(TOTAL);
  }
  function setPlaying(state) {
    playing = state;
    if (ostWrap) ostWrap.classList.toggle("is-playing", playing);
    if (ostDisc) ostDisc.classList.toggle("is-spinning", playing);
    if (ostBtn) {
      ostBtn.textContent = playing ? "❚❚ Pause teaser" : "▶ Play teaser";
      ostBtn.setAttribute("aria-pressed", String(playing));
    }
    if (playing) {
      clock = setInterval(() => {
        elapsed += 1;
        if (elapsed >= TOTAL) {
          elapsed = 0;
          setPlaying(false);
          toast("Teaser ended — wishlist for the full 22-track OST!");
          return;
        }
        renderTime();
      }, 1000);
    } else {
      clearInterval(clock);
    }
  }
  if (ostBtn) {
    ostBtn.addEventListener("click", () => {
      setPlaying(!playing);
      if (playing) toast("♪ Now playing: Title Theme (Press Start)");
    });
  }
  renderTime();
})();
