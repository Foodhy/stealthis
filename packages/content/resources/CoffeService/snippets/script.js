const services = [
  {
    title: "Coffee Catering",
    copy: "Full espresso bar, seasonal menu, and barista team.",
    meta: "Events",
  },
  {
    title: "Bread & Bake Lab",
    copy: "Custom bread programs for restaurants and hotels.",
    meta: "Wholesale",
  },
  {
    title: "Cake Studio",
    copy: "Bespoke cakes with curated flavor journeys.",
    meta: "Custom",
  },
];

const products = [
  {
    title: "Single-Origin Espresso",
    copy: "Chocolate notes with bright citrus finish.",
    price: 18,
    tag: "Coffee",
  },
  {
    title: "Sourdough Starter Kit",
    copy: "Active culture, rye blend, and care guide.",
    price: 24,
    tag: "Bakery",
  },
  {
    title: "Vanilla Bean Cake",
    copy: "Signature sponge with berry glaze.",
    price: 42,
    tag: "Cake",
  },
  {
    title: "Brunch Box",
    copy: "Croissant, jam, latte sachet, and granola.",
    price: 32,
    tag: "Bundle",
  },
];

const people = [
  {
    name: "Lina Torres",
    role: "Head Barista",
    specialty: "Milk chemistry + latte art",
  },
  {
    name: "Milo Chen",
    role: "Bread Lead",
    specialty: "Sourdough fermentation",
  },
  {
    name: "Ava Ruiz",
    role: "Pastry Chef",
    specialty: "Seasonal tart design",
  },
];

const workshops = [
  "Latte Art Immersion",
  "Sourdough Fundamentals",
  "Seasonal Cake Design",
  "Coffee + Dessert Pairings",
];

const stack = [
  "Single-Origin",
  "Stone Milling",
  "Wild Yeast",
  "Ganache",
  "Milk Lab",
  "Roast Profiles",
];

const stats = [
  { value: "9", label: "Daily coffee origins" },
  { value: "120", label: "Weekly loaves" },
  { value: "46", label: "Signature pastries" },
];

const serviceGrid = document.getElementById("serviceGrid");
const productGrid = document.getElementById("productGrid");
const peopleGrid = document.getElementById("peopleGrid");
const workshopList = document.getElementById("workshopList");
const stackChips = document.getElementById("stackChips");
const statsGrid = document.getElementById("stats");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

if (serviceGrid) {
  serviceGrid.innerHTML = services
    .map(
      (item) => `
        <article class="service-card">
          <span class="menu-meta">${item.meta}</span>
          <h3>${item.title}</h3>
          <p>${item.copy}</p>
        </article>
      `
    )
    .join("");
}

if (productGrid) {
  productGrid.innerHTML = products
    .map((item, index) => {
      const priceLabel = `$${item.price}`;
      return `
        <article class="product-card">
          <div class="product-image">${item.tag}</div>
          <div class="product-meta">
            <span>${item.title}</span>
            <span class="product-price">${priceLabel}</span>
          </div>
          <p>${item.copy}</p>
          <button class="add-btn" data-index="${index}">Add to cart</button>
        </article>
      `;
    })
    .join("");
}

if (peopleGrid) {
  peopleGrid.innerHTML = people
    .map(
      (person) => `
        <article class="person-card">
          <div class="avatar">${person.name
            .split(" ")
            .map((part) => part[0])
            .join("")}</div>
          <h3>${person.name}</h3>
          <div class="person-chip">${person.role}</div>
          <p>${person.specialty}</p>
        </article>
      `
    )
    .join("");
}

if (workshopList) {
  workshopList.innerHTML = workshops.map((item) => `<li>${item}</li>`).join("");
}

if (stackChips) {
  stackChips.innerHTML = stack.map((item) => `<span>${item}</span>`).join("");
}

if (statsGrid) {
  statsGrid.innerHTML = stats
    .map(
      (stat) => `
        <div>
          <h2>${stat.value}</h2>
          <p>${stat.label}</p>
        </div>
      `
    )
    .join("");
}

const cart = [];

function renderCart() {
  if (!cartItems || !cartTotal || !cartCount) return;

  if (!cart.length) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "$0";
    cartCount.textContent = "0 items";
    return;
  }

  let total = 0;
  cartItems.innerHTML = cart
    .map((item) => {
      total += item.price;
      return `
        <div class="cart-item">
          <span>${item.title}</span>
          <strong>$${item.price}</strong>
        </div>
      `;
    })
    .join("");

  cartTotal.textContent = `$${total}`;
  cartCount.textContent = `${cart.length} items`;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".add-btn");
  if (!button) return;
  const index = Number(button.dataset.index);
  const product = products[index];
  if (!product) return;
  cart.push(product);
  renderCart();
});

renderCart();

const lenis = window.Lenis
  ? new Lenis({
      smoothWheel: true,
      smoothTouch: false,
      lerp: 0.08,
    })
  : null;

let scrollVelocity = 0;
let marqueeX = 0;

function raf(time) {
  if (lenis) lenis.raf(time);
  scrollVelocity *= 0.9;
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

if (lenis) {
  lenis.on("scroll", ({ velocity }) => {
    scrollVelocity = Math.max(Math.min(velocity, 40), -40);
  });
}

const marquee = document.getElementById("marqueeTrack");
if (marquee) {
  const loop = () => {
    marqueeX -= 0.3 + Math.abs(scrollVelocity) * 0.02;
    marquee.style.transform = `translateX(${marqueeX}px)`;
    if (Math.abs(marqueeX) > marquee.scrollWidth / 2) {
      marqueeX = 0;
    }
    requestAnimationFrame(loop);
  };
  loop();
}

if (window.gsap) {
  gsap.to("#loader", {
    opacity: 0,
    duration: 0.6,
    delay: 1.2,
    pointerEvents: "none",
  });

  gsap.from(".hero-copy", { opacity: 0, y: 30, duration: 1, ease: "power3.out" });
  gsap.from(".hero-panel", { opacity: 0, x: 30, duration: 1, delay: 0.2, ease: "power3.out" });
  gsap.utils.toArray(".menu-card, .service-card, .panel, .stats div").forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      y: 24,
      duration: 0.8,
      delay: index * 0.05,
      ease: "power2.out",
    });
  });
}

class BeanField {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.z = 24;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.createBeans();
    this.createSteam();
    this.bindEvents();
    this.animate();
  }

  createBeans() {
    const material = new THREE.MeshStandardMaterial({
      color: 0xb36b3e,
      metalness: 0.2,
      roughness: 0.7,
    });

    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(5, 10, 6);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    for (let i = 0; i < 40; i++) {
      const geometry = new THREE.SphereGeometry(0.45, 16, 16);
      const bean = new THREE.Mesh(geometry, material.clone());
      bean.scale.set(1.1, 0.7, 0.6);
      bean.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      );
      bean.rotation.set(Math.random(), Math.random(), Math.random());
      this.group.add(bean);
    }
  }

  createSteam() {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xf4b183,
      size: 0.1,
      transparent: true,
      opacity: 0.4,
    });
    this.steam = new THREE.Points(geometry, material);
    this.scene.add(this.steam);
  }

  bindEvents() {
    window.addEventListener("resize", () => this.onResize());
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    const t = this.clock.getElapsedTime();
    this.group.rotation.y = t * 0.08;
    this.group.rotation.x = t * 0.03;
    this.steam.rotation.y = -t * 0.04;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
}

const bg = document.getElementById("bg");
if (bg && window.THREE) {
  new BeanField(bg);
}
