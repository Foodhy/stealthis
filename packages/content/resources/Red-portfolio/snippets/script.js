const data = {
  projects: [
    {
      title: "Pulse Atlas",
      desc: "Realtime logistics map with motion-safe alerts.",
      tag: "Dashboard",
    },
    {
      title: "Vanta Ops",
      desc: "Command UI for an autonomous fleet control room.",
      tag: "Systems",
    },
    {
      title: "Signal Forge",
      desc: "Design system + motion kit for an AI platform.",
      tag: "Design",
    },
    {
      title: "Redline Launch",
      desc: "Immersive product site with staggered cinematic scroll.",
      tag: "Web",
    },
  ],
  capabilities: [
    "Realtime dashboard UX",
    "Motion systems and interaction design",
    "Interface sound + haptic choreography",
    "High-contrast product branding",
  ],
  stack: ["Figma", "Three.js", "GSAP", "Lenis", "Framer", "WebGL"],
  stats: [
    { value: "38", label: "Product launches" },
    { value: "11", label: "Design systems" },
    { value: "4", label: "Global teams" },
  ],
  lab: [
    {
      title: "Velocity Ticker",
      desc: "Scroll-driven marquee tied to Lenis momentum.",
    },
    {
      title: "Speed Lines",
      desc: "Background parallax reacting to scroll velocity.",
    },
    {
      title: "Focus Beam",
      desc: "Hover-triggered light sweeps across panels.",
    },
  ],
  contacts: [
    { label: "Email", value: "redline@studio.com" },
    { label: "LinkedIn", value: "/redline" },
    { label: "GitHub", value: "@redline" },
  ],
};

const projectGrid = document.getElementById("project-grid");
const capabilityList = document.getElementById("capabilities");
const stackGrid = document.getElementById("stack");
const statsGrid = document.getElementById("stats");
const labGrid = document.getElementById("lab-grid");
const contactGrid = document.getElementById("contact-cards");

if (projectGrid) {
  projectGrid.innerHTML = data.projects
    .map(
      (project) => `
        <article class="card">
          <span>${project.tag}</span>
          <h3>${project.title}</h3>
          <p>${project.desc}</p>
        </article>
      `
    )
    .join("");
}

if (capabilityList) {
  capabilityList.innerHTML = data.capabilities.map((item) => `<li>${item}</li>`).join("");
}

if (stackGrid) {
  stackGrid.innerHTML = data.stack.map((item) => `<span>${item}</span>`).join("");
}

if (statsGrid) {
  statsGrid.innerHTML = data.stats
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

if (labGrid) {
  labGrid.innerHTML = data.lab
    .map(
      (item) => `
        <article class="lab-card">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
        </article>
      `
    )
    .join("");
}

if (contactGrid) {
  contactGrid.innerHTML = data.contacts
    .map(
      (contact) => `
        <article class="contact-card">
          <h4>${contact.label}</h4>
          <p>${contact.value}</p>
        </article>
      `
    )
    .join("");
}

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
  document.documentElement.style.setProperty("--speed-shift", `${scrollVelocity * 14}px`);
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
    marqueeX -= 0.4 + Math.abs(scrollVelocity) * 0.03;
    marquee.style.transform = `translateX(${marqueeX}px)`;
    if (Math.abs(marqueeX) > marquee.scrollWidth / 2) {
      marqueeX = 0;
    }
    requestAnimationFrame(loop);
  };
  loop();
}

if (window.gsap) {
  gsap.from(".hero-copy", { opacity: 0, y: 30, duration: 1, ease: "power3.out" });
  gsap.from(".hero-panel", { opacity: 0, x: 30, duration: 1, delay: 0.2, ease: "power3.out" });
  gsap.utils
    .toArray(".card, .list li, .pill-grid span, .stats div, .lab-card")
    .forEach((item, index) => {
      gsap.from(item, {
        opacity: 0,
        y: 24,
        duration: 0.8,
        delay: index * 0.05,
        ease: "power2.out",
      });
    });
}

class SpeedField {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.z = 30;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.speed = 0.4;
    this.lines = this.createLines();
    this.scene.add(this.lines);

    this.clock = new THREE.Clock();
    this.bindEvents();
    this.animate();
  }

  createLines() {
    const count = 220;
    const positions = new Float32Array(count * 2 * 3);
    const colors = new Float32Array(count * 2 * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 40;
      const z = -Math.random() * 120;
      const length = 2 + Math.random() * 6;

      const idx = i * 6;
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;
      positions[idx + 3] = x;
      positions[idx + 4] = y;
      positions[idx + 5] = z + length;

      const color = new THREE.Color(0xff2e3a);
      colors[idx] = color.r;
      colors[idx + 1] = color.g;
      colors[idx + 2] = color.b;
      colors[idx + 3] = color.r;
      colors[idx + 4] = color.g;
      colors[idx + 5] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
    });

    return new THREE.LineSegments(geometry, material);
  }

  updateLines(_delta) {
    const positions = this.lines.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 6) {
      positions[i + 2] += this.speed + Math.abs(scrollVelocity) * 0.04;
      positions[i + 5] += this.speed + Math.abs(scrollVelocity) * 0.04;

      if (positions[i + 2] > 10) {
        const x = (Math.random() - 0.5) * 60;
        const y = (Math.random() - 0.5) * 40;
        const z = -120 - Math.random() * 40;
        const length = 2 + Math.random() * 6;
        positions[i] = x;
        positions[i + 1] = y;
        positions[i + 2] = z;
        positions[i + 3] = x;
        positions[i + 4] = y;
        positions[i + 5] = z + length;
      }
    }
    this.lines.geometry.attributes.position.needsUpdate = true;
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
    const delta = this.clock.getDelta();
    this.updateLines(delta);
    this.lines.rotation.z += delta * 0.02;
    this.lines.rotation.y += delta * 0.01;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
}

const bg = document.getElementById("bg");
if (bg && window.THREE) {
  new SpeedField(bg);
}
