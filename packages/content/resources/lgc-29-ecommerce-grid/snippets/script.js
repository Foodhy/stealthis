if (!window.MotionPreference) {
  const __mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const __listeners = new Set();

  const MotionPreference = {
    prefersReducedMotion() {
      return __mql.matches;
    },
    setOverride(value) {
      const reduced = Boolean(value);
      document.documentElement.classList.toggle("reduced-motion", reduced);
      window.dispatchEvent(new CustomEvent("motion-preference", { detail: { reduced } }));
      for (const listener of __listeners) {
        try {
          listener({ reduced, override: reduced, systemReduced: __mql.matches });
        } catch {}
      }
    },
    onChange(listener) {
      __listeners.add(listener);
      try {
        listener({
          reduced: __mql.matches,
          override: null,
          systemReduced: __mql.matches,
        });
      } catch {}
      return () => __listeners.delete(listener);
    },
    getState() {
      return { reduced: __mql.matches, override: null, systemReduced: __mql.matches };
    },
  };

  window.MotionPreference = MotionPreference;
}

function prefersReducedMotion() {
  return window.MotionPreference.prefersReducedMotion();
}

function initDemoShell() {
  // No-op shim in imported standalone snippets.
}

/* ═══════════════════════════════════════════════════════════════════
   E-commerce Shop — main.js
   Filterable product grid, FLIP animations, cart, View Transitions
   ═══════════════════════════════════════════════════════════════════ */

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

initDemoShell({
  title: "E-commerce Shop",
  category: "pages",
  tech: ["gsap", "flip", "lenis", "view-transitions-api"],
});

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);
  ScrollTrigger.refresh();
});

const dur = (d) => (reduced ? 0 : d);

/* ═══════════════════════════════════════════════════════════════════
   PRODUCT DATA
   ═══════════════════════════════════════════════════════════════════ */
const products = [
  {
    id: 1,
    name: "Merino Crew Neck",
    category: "apparel",
    price: 89,
    gradient: "grad-merino",
    shape: "shape-circle",
    description:
      "Crafted from ultra-fine 18-micron merino wool, this crew neck strikes the perfect balance between warmth and breathability. The relaxed fit drapes naturally over any frame, making it an effortless everyday layer.",
  },
  {
    id: 2,
    name: "Canvas Weekender",
    category: "accessories",
    price: 145,
    gradient: "grad-canvas",
    shape: "shape-rounded-sq",
    description:
      "Heavy-duty waxed canvas meets vegetable-tanned leather handles in a bag built for spontaneous getaways. The reinforced base and brass hardware ensure it ages beautifully over years of use.",
  },
  {
    id: 3,
    name: "Ceramic Pour-Over",
    category: "homeware",
    price: 42,
    gradient: "grad-ceramic",
    shape: "shape-abstract-a",
    description:
      "Hand-thrown stoneware dripper with a precision-cut spiral channel that controls water flow for consistent extraction. Each piece is kiln-fired with a reactive glaze that makes it one of a kind.",
  },
  {
    id: 4,
    name: "Linen Overshirt",
    category: "apparel",
    price: 128,
    gradient: "grad-linen",
    shape: "shape-rounded-sq",
    description:
      "Stonewashed European linen in a boxy silhouette that works as a light jacket or a structured shirt. The fabric softens with every wash while retaining its natural texture and drape.",
  },
  {
    id: 5,
    name: "Leather Card Wallet",
    category: "accessories",
    price: 55,
    gradient: "grad-leather",
    shape: "shape-abstract-b",
    description:
      "Slim enough to slip into a front pocket, this full-grain leather wallet holds up to six cards with a center cash slot. The burnished edges are hand-finished for a clean, modern profile.",
  },
  {
    id: 6,
    name: "Stoneware Mug Set",
    category: "homeware",
    price: 38,
    gradient: "grad-stoneware",
    shape: "shape-circle",
    description:
      "A set of two generously sized mugs in a matte volcanic glaze with a smooth interior. The thick walls retain heat longer, and the weighted base keeps them grounded on any surface.",
  },
  {
    id: 7,
    name: "Organic Cotton Tee",
    category: "apparel",
    price: 48,
    gradient: "grad-organic",
    shape: "shape-abstract-a",
    description:
      "GOTS-certified organic cotton in a medium weight that drapes without clinging. Pre-shrunk and garment-dyed for a broken-in feel straight out of the box with minimal environmental impact.",
  },
  {
    id: 8,
    name: "Brass Key Ring",
    category: "accessories",
    price: 28,
    gradient: "grad-brass",
    shape: "shape-circle",
    description:
      "Solid brass loop with a spring-loaded gate clip, designed to develop a rich patina with daily carry. The compact profile attaches cleanly to belt loops and bag hardware alike.",
  },
  {
    id: 9,
    name: "Linen Table Runner",
    category: "homeware",
    price: 65,
    gradient: "grad-runner",
    shape: "shape-rounded-sq",
    description:
      "Woven from raw Belgian flax with naturally frayed edges, this runner brings understated warmth to any table. The oatmeal tone pairs effortlessly with both ceramic and wooden tableware.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   HERO — SplitText word reveal
   ═══════════════════════════════════════════════════════════════════ */
const headlineEl = document.getElementById("hero-headline");

if (headlineEl) {
  const split = new SplitText(headlineEl, { type: "words", wordsClass: "word" });

  if (!reduced) {
    gsap.fromTo(
      split.words,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.08,
        delay: 0.15,
      }
    );
  } else {
    gsap.set(split.words, { opacity: 1, y: 0 });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   CARD ENTRANCE — ScrollTrigger stagger
   ═══════════════════════════════════════════════════════════════════ */
const cards = gsap.utils.toArray(".product-card");

if (!reduced) {
  gsap.fromTo(
    cards,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "expo.out",
      stagger: 0.06,
      scrollTrigger: {
        trigger: "#product-grid",
        start: "top 85%",
      },
    }
  );
} else {
  gsap.set(cards, { opacity: 1, y: 0 });
}

/* ═══════════════════════════════════════════════════════════════════
   FILTER — GSAP Flip
   ═══════════════════════════════════════════════════════════════════ */
const filterNav = document.getElementById("filter-nav");
let activeFilter = "all";

function filterProducts(category) {
  if (category === activeFilter) return;
  activeFilter = category;

  // Update pill UI
  filterNav.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.filter === category);
  });

  const state = Flip.getState(".product-card");

  document.querySelectorAll(".product-card").forEach((card) => {
    const show = category === "all" || card.dataset.category === category;
    card.style.display = show ? "" : "none";
  });

  if (!reduced) {
    Flip.from(state, {
      duration: 0.6,
      ease: "expo.inOut",
      stagger: 0.03,
      absolute: true,
      onComplete: () => ScrollTrigger.refresh(),
    });
  } else {
    ScrollTrigger.refresh();
  }
}

filterNav.addEventListener("click", (e) => {
  const pill = e.target.closest(".filter-pill");
  if (!pill) return;
  filterProducts(pill.dataset.filter);
});

/* ═══════════════════════════════════════════════════════════════════
   PRODUCT DETAIL — View Transitions API
   ═══════════════════════════════════════════════════════════════════ */
const supportsVT = typeof document.startViewTransition === "function";
const detailOverlay = document.getElementById("detail-overlay");
const detailImage = document.getElementById("detail-image");
const detailTitle = document.getElementById("detail-title");
const detailCategory = document.getElementById("detail-category");
const detailDesc = document.getElementById("detail-desc");
const detailPrice = document.getElementById("detail-price");
const detailAdd = document.getElementById("detail-add");
const detailClose = document.getElementById("detail-close");
const detailBackdrop = document.getElementById("detail-backdrop");
const qtyValue = document.getElementById("qty-value");
const qtyMinus = document.getElementById("qty-minus");
const qtyPlus = document.getElementById("qty-plus");

let activeProductId = null;
let activeCard = null;
let detailQty = 1;

function getProduct(id) {
  return products.find((p) => p.id === id);
}

function populateDetail(product) {
  // Set image gradient + shape class
  detailImage.className = "detail-image";
  detailImage.classList.add(product.gradient, product.shape);

  detailTitle.textContent = product.name;
  detailCategory.textContent = product.category;
  detailDesc.textContent = product.description;
  detailPrice.textContent = `$${product.price}`;

  detailQty = 1;
  qtyValue.textContent = detailQty;
  activeProductId = product.id;
}

function openDetail(card, product) {
  activeCard = card;
  populateDetail(product);

  const performOpen = () => {
    // Set view-transition-name on the active card only
    card.classList.add("vt-active");
    detailOverlay.classList.add("open");
    detailOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lenis.stop();
  };

  if (supportsVT && !reduced) {
    document.startViewTransition(() => performOpen());
  } else {
    performOpen();
  }
}

function closeDetail() {
  const performClose = () => {
    detailOverlay.classList.remove("open");
    detailOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lenis.start();

    // Remove vt-active after transition completes
    if (activeCard) {
      activeCard.classList.remove("vt-active");
      activeCard = null;
    }
    activeProductId = null;
  };

  if (supportsVT && !reduced) {
    document.startViewTransition(() => performClose());
  } else {
    performClose();
  }
}

// Open on card click (but not on the Add to Cart button)
document.getElementById("product-grid").addEventListener("click", (e) => {
  const addBtn = e.target.closest(".btn-add");
  if (addBtn) {
    e.stopPropagation();
    addToCart(Number(addBtn.dataset.id));
    return;
  }

  const card = e.target.closest(".product-card");
  if (!card) return;

  const product = getProduct(Number(card.dataset.id));
  if (product) openDetail(card, product);
});

// Close triggers
detailClose.addEventListener("click", closeDetail);
detailBackdrop.addEventListener("click", closeDetail);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (detailOverlay.classList.contains("open")) {
      closeDetail();
    } else if (cartSidebar.classList.contains("open")) {
      closeCart();
    }
  }
});

// Quantity controls
qtyMinus.addEventListener("click", () => {
  if (detailQty > 1) {
    detailQty--;
    qtyValue.textContent = detailQty;
  }
});

qtyPlus.addEventListener("click", () => {
  if (detailQty < 99) {
    detailQty++;
    qtyValue.textContent = detailQty;
  }
});

// Add from detail view
detailAdd.addEventListener("click", () => {
  if (activeProductId) {
    for (let i = 0; i < detailQty; i++) {
      addToCart(activeProductId, true);
    }
    closeDetail();
  }
});

/* ═══════════════════════════════════════════════════════════════════
   CART STATE & UI
   ═══════════════════════════════════════════════════════════════════ */
let cart = [];

const cartSidebar = document.getElementById("cart-sidebar");
const cartPanel = document.getElementById("cart-panel");
const cartItems = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const cartBadge = document.getElementById("cart-badge");
const cartTotalValue = document.getElementById("cart-total-value");
const cartTrigger = document.getElementById("cart-trigger");
const cartClose = document.getElementById("cart-close");
const cartSidebarBackdrop = document.getElementById("cart-sidebar-backdrop");

function addToCart(productId, skipBounce = false) {
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  updateCartUI();

  // Badge bounce
  if (!reduced && !skipBounce) {
    gsap.fromTo(cartBadge, { scale: 1.4 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);

  // Badge
  cartBadge.textContent = totalItems;
  cartBadge.classList.toggle("visible", totalItems > 0);

  // Total
  cartTotalValue.textContent = `$${totalPrice}`;

  // Items list
  if (cart.length === 0) {
    cartEmpty.style.display = "";
    // Clear all cart items
    cartItems.querySelectorAll(".cart-item").forEach((el) => el.remove());
    return;
  }

  cartEmpty.style.display = "none";

  // Rebuild items
  const existingItems = cartItems.querySelectorAll(".cart-item");
  existingItems.forEach((el) => el.remove());

  cart.forEach((item) => {
    const product = getProduct(item.id);
    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-swatch ${product.gradient}"></div>
      <div class="cart-item-details">
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-meta">Qty: ${item.qty}</div>
      </div>
      <div class="cart-item-price">$${product.price * item.qty}</div>
      <button class="cart-item-remove" data-remove-id="${product.id}" aria-label="Remove ${product.name}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    cartItems.appendChild(row);
  });
}

// Cart item removal (delegated)
cartItems.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".cart-item-remove");
  if (!removeBtn) return;
  removeFromCart(Number(removeBtn.dataset.removeId));
});

/* ═══════════════════════════════════════════════════════════════════
   CART SIDEBAR OPEN / CLOSE
   ═══════════════════════════════════════════════════════════════════ */
function openCart() {
  cartSidebar.classList.add("open");
  cartSidebar.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lenis.stop();
}

function closeCart() {
  cartSidebar.classList.remove("open");
  cartSidebar.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lenis.start();
}

cartTrigger.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartSidebarBackdrop.addEventListener("click", closeCart);
