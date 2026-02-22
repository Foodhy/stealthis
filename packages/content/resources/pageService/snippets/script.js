const services = [
  {
    title: "Growth Marketing",
    copy: "Paid media, lifecycle strategy, and multi-channel acquisition.",
    meta: "Performance"
  },
  {
    title: "Web + App Development",
    copy: "Full-stack product builds with scalable infrastructure.",
    meta: "Engineering"
  },
  {
    title: "Conversion Optimization",
    copy: "A/B testing, funnel audits, and pricing experimentation.",
    meta: "CRO"
  },
  {
    title: "Brand + Positioning",
    copy: "Narratives, identity systems, and launch storytelling.",
    meta: "Strategy"
  }
];

const work = [
  {
    title: "Helio Analytics",
    copy: "Rebuilt onboarding and growth loops for a B2B SaaS.",
    meta: "+57% activation"
  },
  {
    title: "Flux Commerce",
    copy: "Performance storefront and retention playbooks.",
    meta: "-32% churn"
  },
  {
    title: "Orbit Health",
    copy: "HIPAA-ready platform with marketing automation.",
    meta: "Series B launch"
  }
];

const capabilities = [
  "Go-to-market planning",
  "Experimentation frameworks",
  "Full-funnel analytics",
  "Design systems + UI engineering"
];

const stack = ["Figma", "Webflow", "React", "Next.js", "GSAP", "Three.js", "HubSpot", "GA4"];

const stats = [
  { value: "120+", label: "Growth sprints shipped" },
  { value: "$48M", label: "Pipeline influenced" },
  { value: "4.9", label: "Client satisfaction" }
];

const serviceGrid = document.getElementById("serviceGrid");
const workGrid = document.getElementById("workGrid");
const capabilitiesList = document.getElementById("capabilities");
const stackChips = document.getElementById("stackChips");
const statsGrid = document.getElementById("stats");

if (serviceGrid) {
  serviceGrid.innerHTML = services
    .map(
      (item) => `
        <article class="service-card">
          <span class="card-meta">${item.meta}</span>
          <h3>${item.title}</h3>
          <p>${item.copy}</p>
        </article>
      `
    )
    .join("");
}

if (workGrid) {
  workGrid.innerHTML = work
    .map(
      (item) => `
        <article class="work-card">
          <span class="card-meta">${item.meta}</span>
          <h3>${item.title}</h3>
          <p>${item.copy}</p>
        </article>
      `
    )
    .join("");
}

if (capabilitiesList) {
  capabilitiesList.innerHTML = capabilities.map((item) => `<li>${item}</li>`).join("");
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

const lenis = window.Lenis
  ? new Lenis({
      smoothWheel: true,
      smoothTouch: false,
      lerp: 0.08
    })
  : null;

let scrollVelocity = 0;
let marqueeX = 0;

function raf(time) {
  if (lenis) lenis.raf(time);
  scrollVelocity *= 0.9;
  if (topbar) {
    topbar.classList.toggle("is-compact", Math.abs(scrollVelocity) > 1.5);
  }
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
    marqueeX -= 0.35 + Math.abs(scrollVelocity) * 0.03;
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
    pointerEvents: "none"
  });

  gsap.from(".hero-copy", { opacity: 0, y: 30, duration: 1, ease: "power3.out" });
  gsap.from(".hero-panel", { opacity: 0, x: 30, duration: 1, delay: 0.2, ease: "power3.out" });
  gsap.utils.toArray(".service-card, .work-card, .panel, .stats div").forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      y: 24,
      duration: 0.8,
      delay: index * 0.05,
      ease: "power2.out"
    });
  });
}

const topbar = document.getElementById("topbar");
const mainNav = document.getElementById("mainNav");
const burger = document.getElementById("burger");
const navRight = document.querySelector(".nav-right");
const navItems = document.querySelectorAll(".nav-item");

// Update active nav item on scroll
function updateActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const scrollPos = window.scrollY || (lenis ? lenis.scroll : 0);
  
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");
    
    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      navItems.forEach((item) => {
        item.classList.remove("active");
        if (item.getAttribute("href") === `#${sectionId}`) {
          item.classList.add("active");
        }
      });
    }
  });
}

if (lenis) {
  lenis.on("scroll", updateActiveNav);
} else {
  window.addEventListener("scroll", updateActiveNav);
}

// Smooth scroll for nav links
navItems.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href");
    
    if (targetId.startsWith("#")) {
      if (lenis) {
        lenis.scrollTo(targetId, { duration: 1.5, offset: -80 });
      } else {
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
    
    // Close mobile menu
    if (window.innerWidth <= 640) {
      burger.classList.remove("is-open");
      mainNav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });
});

if (burger && mainNav) {
  burger.addEventListener("click", () => {
    const isOpen = burger.classList.toggle("is-open");
    mainNav.classList.toggle("is-open", isOpen);
    if (navRight) {
      navRight.classList.toggle("is-open", isOpen);
    }
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 640) {
        burger.classList.remove("is-open");
        mainNav.classList.remove("is-open");
        if (navRight) {
          navRight.classList.remove("is-open");
        }
        burger.setAttribute("aria-expanded", "false");
      }
    });
  });
}

class HaloField {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.z = 26;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.createRings();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  createRings() {
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffb347,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });

    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.TorusGeometry(6 + i * 2.4, 0.18, 16, 120);
      const ring = new THREE.Mesh(geometry, ringMat.clone());
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -2 + i * 0.6;
      this.group.add(ring);
    }
  }

  createParticles() {
    const count = 220;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ color: 0x5ce1e6, size: 0.12 });
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
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
    this.group.rotation.z = t * 0.1;
    this.group.rotation.x = t * 0.05;
    this.particles.rotation.y = t * 0.08;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
}

const bg = document.getElementById("bg");
if (bg && window.THREE) {
  new HaloField(bg);
}
