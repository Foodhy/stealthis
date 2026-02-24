const lenis = window.Lenis
  ? new Lenis({
      smoothWheel: true,
      smoothTouch: false,
      lerp: 0.08
    })
  : null;

const projects = [
  {
    id: "01",
    title: "Night City Grid",
    copy: "Realtime city telemetry dashboard with adaptive neon layers.",
    tags: ["UI/UX", "2026"]
  },
  {
    id: "02",
    title: "Ghostwire Relay",
    copy: "Cyberpunk launch site with kinetic typography and motion gates.",
    tags: ["WebGL", "2025"]
  },
  {
    id: "03",
    title: "Synapse Archive",
    copy: "Data storytelling interface for biotech intelligence.",
    tags: ["Brand", "2025"]
  },
  {
    id: "04",
    title: "Signal Loom",
    copy: "Identity system with neon typography and modular UI kits.",
    tags: ["System", "2024"]
  }
];

const abilities = [
  "Realtime HUD systems",
  "Motion-first UI choreography",
  "Neon brand systems",
  "3D dashboards and data overlays"
];

const skills = ["Figma", "Three.js", "GSAP", "Lenis", "WebGL", "TypeScript", "Framer"];

const stats = [
  { value: "12", label: "Years crafting motion-forward narratives." },
  { value: "38", label: "Launches for cyber-native brands." },
  { value: "94%", label: "Repeat collaboration rate." }
];

const lab = [
  { title: "Drift Ticker", desc: "Marquee speed reacts to Lenis velocity." },
  { title: "Neon Pulse", desc: "Ambient glow synced to scroll momentum." },
  { title: "City Grid", desc: "3D skyline driven by motion signals." }
];

const projectGrid = document.getElementById("project-cards");
const abilityList = document.getElementById("abilities-list");
const skillChips = document.getElementById("skill-chips");
const statsGrid = document.getElementById("stats-grid");
const labGrid = document.getElementById("lab-grid");

if (projectGrid) {
  projectGrid.innerHTML = projects
    .map(
      (project) => `
        <article class="card">
          <div class="card-tag">${project.id}</div>
          <h3>${project.title}</h3>
          <p>${project.copy}</p>
          <div class="card-meta">
            <span>${project.tags[0]}</span>
            <span>${project.tags[1]}</span>
          </div>
        </article>
      `
    )
    .join("");
}

if (abilityList) {
  abilityList.innerHTML = abilities.map((item) => `<li>${item}</li>`).join("");
}

if (skillChips) {
  skillChips.innerHTML = skills.map((skill) => `<span>${skill}</span>`).join("");
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

if (labGrid) {
  labGrid.innerHTML = lab
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

let scrollVelocity = 0;
let tickerX = 0;
const tickerTrack = document.getElementById("tickerTrack");

function raf(time) {
  if (lenis) lenis.raf(time);
  scrollVelocity *= 0.9;
  document.documentElement.style.setProperty("--scan-shift", `${scrollVelocity * 0.6}px`);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

if (lenis) {
  lenis.on("scroll", ({ velocity }) => {
    scrollVelocity = Math.max(Math.min(velocity, 40), -40);
  });
}

if (tickerTrack) {
  const loop = () => {
    tickerX -= 0.35 + Math.abs(scrollVelocity) * 0.02;
    tickerTrack.style.transform = `translateX(${tickerX}px)`;
    if (Math.abs(tickerX) > tickerTrack.scrollWidth / 2) {
      tickerX = 0;
    }
    requestAnimationFrame(loop);
  };
  loop();
}

if (window.gsap) {
  gsap.from(".hero-copy", { opacity: 0, y: 30, duration: 1, ease: "power3.out" });
  gsap.from(".hero-panel", { opacity: 0, x: 30, duration: 1, delay: 0.15, ease: "power3.out" });
  gsap.utils.toArray(".card, .panel, .chips span, .stats div, .lab-card").forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      y: 24,
      duration: 0.8,
      delay: index * 0.04,
      ease: "power2.out"
    });
  });
}

class NeonCity {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 8, 24);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.city = new THREE.Group();
    this.scene.add(this.city);

    this.addLights();
    this.buildGrid();
    this.buildCity();
    this.buildParticles();

    this.bindEvents();
    this.animate();
  }

  addLights() {
    this.scene.add(new THREE.AmbientLight(0x8b4dff, 0.4));
    const key = new THREE.DirectionalLight(0x2af1ff, 0.8);
    key.position.set(10, 20, 10);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xff38c7, 0.6);
    rim.position.set(-10, 8, -10);
    this.scene.add(rim);
  }

  buildGrid() {
    const size = 120;
    const divisions = 30;
    const grid = new THREE.GridHelper(size, divisions, 0x2af1ff, 0x2af1ff);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    grid.position.y = -2;
    this.scene.add(grid);
  }

  buildCity() {
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x110b1f,
      roughness: 0.4,
      metalness: 0.6,
      emissive: 0x2af1ff,
      emissiveIntensity: 0.2
    });

    for (let i = 0; i < 80; i++) {
      const w = 0.6 + Math.random() * 1.4;
      const h = 1 + Math.random() * 8;
      const d = 0.6 + Math.random() * 1.4;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), blockMat.clone());
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        h / 2 - 2,
        (Math.random() - 0.5) * 30
      );
      mesh.material.emissiveIntensity = 0.2 + Math.random() * 0.6;
      this.city.add(mesh);
    }
  }

  buildParticles() {
    const count = 220;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ color: 0xff38c7, size: 0.08 });
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
    const drift = scrollVelocity * 0.004;
    this.city.rotation.y = t * 0.05 + drift;
    this.city.position.z = Math.sin(t * 0.2) * 1.2;
    this.particles.rotation.y = t * 0.08;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
}

const bg = document.getElementById("cyber-bg");
if (bg && window.THREE) {
  new NeonCity(bg);
}
