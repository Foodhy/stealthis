/* Hollow Reign — store page interactions (vanilla JS, illustrative only) */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Toast helper ---------- */
  const toastEl = $("#toast");
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  /* ---------- Media viewer: thumbnail switching ---------- */
  const frame = $("#mediaFrame");
  const kindEl = $("#mediaKind");
  const captionEl = $("#mediaCaption");
  const playBtn = $("#mediaPlay");
  const thumbs = $$(".thumb");
  const GRADS = ["media-grad-1", "media-grad-2", "media-grad-3", "media-grad-4", "media-grad-5"];

  function selectMedia(thumb) {
    thumbs.forEach((t) => {
      const active = t === thumb;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });

    frame.classList.remove(...GRADS);
    frame.classList.add(thumb.dataset.grad);
    kindEl.textContent = thumb.dataset.kind;
    captionEl.textContent = thumb.dataset.caption;
    playBtn.hidden = thumb.dataset.video !== "true";
    frame.setAttribute("aria-label", "Hollow Reign media — " + thumb.dataset.caption);

    // retrigger switch animation
    frame.classList.remove("is-switching");
    void frame.offsetWidth;
    frame.classList.add("is-switching");
  }

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => selectMedia(thumb));
    thumb.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = thumbs[(i + 1) % thumbs.length];
      if (e.key === "ArrowLeft") next = thumbs[(i - 1 + thumbs.length) % thumbs.length];
      if (next) {
        e.preventDefault();
        next.focus();
        selectMedia(next);
      }
    });
  });

  playBtn.addEventListener("click", () => {
    toast("Trailer playback is illustrative in this demo");
  });

  /* ---------- Cart ---------- */
  const cartCount = $("#cartCount");
  const navCartBtn = $("#navCartBtn");
  let cart = 0;

  function bumpCart(delta) {
    cart = Math.max(0, cart + delta);
    cartCount.textContent = String(cart);
    navCartBtn.setAttribute("aria-label", "Cart, " + cart + " item" + (cart === 1 ? "" : "s"));
    cartCount.classList.remove("bump");
    void cartCount.offsetWidth;
    cartCount.classList.add("bump");
  }

  navCartBtn.addEventListener("click", () => {
    toast(cart === 0 ? "Your cart is empty" : "Cart: " + cart + " item" + (cart === 1 ? "" : "s") + " — checkout is illustrative");
  });

  /* Main Add to Cart toggle */
  const addCartBtn = $("#addCartBtn");
  let mainInCart = false;
  addCartBtn.addEventListener("click", () => {
    mainInCart = !mainInCart;
    addCartBtn.classList.toggle("in-cart", mainInCart);
    addCartBtn.querySelector(".btn-label").textContent = mainInCart ? "✓ IN CART" : "ADD TO CART";
    bumpCart(mainInCart ? 1 : -1);
    toast(mainInCart ? "Hollow Reign added to cart — $25.99" : "Hollow Reign removed from cart");
  });

  /* Wishlist toggle */
  const wishlistBtn = $("#wishlistBtn");
  wishlistBtn.addEventListener("click", () => {
    const wished = wishlistBtn.getAttribute("aria-pressed") !== "true";
    wishlistBtn.setAttribute("aria-pressed", String(wished));
    wishlistBtn.querySelector(".btn-label").textContent = wished ? "WISHLISTED" : "WISHLIST";
    toast(wished ? "Added to your wishlist — we'll ping you on deals" : "Removed from wishlist");
  });

  /* Edition / DLC add buttons */
  $$(".btn-mini").forEach((btn) => {
    btn.addEventListener("click", () => {
      const added = !btn.classList.contains("is-added");
      btn.classList.toggle("is-added", added);
      btn.textContent = added ? "✓ ADDED" : "ADD";
      bumpCart(added ? 1 : -1);
      toast(
        added
          ? btn.dataset.edition + " added — $" + btn.dataset.price
          : btn.dataset.edition + " removed from cart"
      );
    });
  });

  /* ---------- Reviews sentiment bar (animate on load + scroll-to on click) ---------- */
  const reviewFill = $("#reviewFill");
  requestAnimationFrame(() => {
    setTimeout(() => reviewFill.classList.add("is-filled"), 250);
  });

  $("#reviewLink").addEventListener("click", () => {
    const wrap = $("#reviewBarWrap");
    wrap.scrollIntoView({ behavior: "smooth", block: "center" });
    reviewFill.classList.remove("is-filled");
    void reviewFill.offsetWidth;
    setTimeout(() => reviewFill.classList.add("is-filled"), 120);
    toast("48,213 reviews — 91% positive (last 30 days: Very Positive)");
  });

  /* ---------- System requirements: Min / Recommended tabs ---------- */
  const tabMin = $("#tabMin");
  const tabRec = $("#tabRec");
  const reqMin = $("#reqMin");
  const reqRec = $("#reqRec");

  function showReq(which) {
    const min = which === "min";
    tabMin.classList.toggle("is-active", min);
    tabRec.classList.toggle("is-active", !min);
    tabMin.setAttribute("aria-selected", String(min));
    tabRec.setAttribute("aria-selected", String(!min));
    reqMin.hidden = !min;
    reqRec.hidden = min;
  }
  tabMin.addEventListener("click", () => showReq("min"));
  tabRec.addEventListener("click", () => showReq("rec"));
  [tabMin, tabRec].forEach((tab) => {
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const other = tab === tabMin ? tabRec : tabMin;
        other.focus();
        showReq(other === tabMin ? "min" : "rec");
      }
    });
  });

  /* ---------- About: read more ---------- */
  const aboutBody = $("#aboutBody");
  const aboutToggle = $("#aboutToggle");
  aboutToggle.addEventListener("click", () => {
    const open = !aboutBody.classList.contains("is-open");
    aboutBody.classList.toggle("is-open", open);
    aboutToggle.setAttribute("aria-expanded", String(open));
    aboutToggle.textContent = open ? "SHOW LESS" : "READ MORE";
  });

  /* ---------- Tag chips ---------- */
  const moreTags = $("#moreTags");
  moreTags.addEventListener("click", () => {
    $$(".chip-hidden").forEach((c) => (c.hidden = false));
    moreTags.setAttribute("aria-expanded", "true");
    moreTags.hidden = true;
  });
  document.querySelector(".tag-chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip && chip !== moreTags) toast('Browsing tag "' + chip.textContent.trim() + '" — illustrative');
  });

  /* ---------- Deal countdown ---------- */
  const dealTimer = $("#dealTimer");
  let remaining = 47 * 3600 + 59 * 60 + 12; // seconds
  const pad = (n) => String(n).padStart(2, "0");
  setInterval(() => {
    remaining = Math.max(0, remaining - 1);
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    dealTimer.textContent = pad(h) + ":" + pad(m) + ":" + pad(s);
  }, 1000);
})();
