const highlights = [
  {
    title: "Aurora Wallet",
    detail: "Redesigned onboarding lifted activation by 38%",
    year: "2025",
  },
  {
    title: "Nexa XR Studio",
    detail: "WebGL showroom for wearable launch",
    year: "2024",
  },
  {
    title: "Pulse Health",
    detail: "Motion system for a 12-country rollout",
    year: "2023",
  },
];

const projects = [
  {
    name: "Vessel Banking",
    role: "Product system + 3D brand refresh",
    year: "2026",
    impact: "Reduced time-to-value from 10 to 4 days",
    tags: ["Design System", "WebGL", "Fintech"],
  },
  {
    name: "Lumen Mobility",
    role: "Spatial UI for autonomous fleet ops",
    year: "2025",
    impact: "Live ops dashboard for 2,000+ vehicles",
    tags: ["Interaction", "Data Viz", "Motion"],
  },
  {
    name: "Glasshouse",
    role: "Immersive e-commerce flagship",
    year: "2024",
    impact: "+62% engagement on hero modules",
    tags: ["E-commerce", "3D", "Brand"],
  },
  {
    name: "Aether Wellness",
    role: "Ritual library + responsive motion",
    year: "2024",
    impact: "Expanded retention to 9.2 months",
    tags: ["Mobile", "Wellness", "Animation"],
  },
];

const timeline = [
  {
    title: "Studio Lead — Liquid Gradient",
    time: "2022 → Present",
    detail: "Built a distributed team shipping premium web experiences.",
  },
  {
    title: "Principal Designer — Halo Labs",
    time: "2018 → 2022",
    detail: "Led motion-first design systems for global brands.",
  },
  {
    title: "Senior UX Designer — Northwind",
    time: "2013 → 2018",
    detail: "Shipped cross-platform products for SaaS teams.",
  },
];

const highlightGrid = document.getElementById("highlightGrid");
const projectGrid = document.getElementById("projectGrid");
const timelineGrid = document.getElementById("timeline");

highlights.forEach((item) => {
  const card = document.createElement("div");
  card.className = "panel-card";
  card.innerHTML = `
    <p class="eyebrow">${item.year}</p>
    <h4>${item.title}</h4>
    <p class="muted">${item.detail}</p>
  `;
  highlightGrid.appendChild(card);
});

projects.forEach((project) => {
  const card = document.createElement("article");
  card.className = "project-card";
  card.innerHTML = `
    <div class="project-meta">
      <span>${project.role}</span>
      <span>${project.year}</span>
    </div>
    <h3>${project.name}</h3>
    <p class="muted">${project.impact}</p>
    <div class="tag-list">
      ${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
    </div>
  `;
  projectGrid.appendChild(card);
});

timeline.forEach((item) => {
  const card = document.createElement("div");
  card.className = "timeline-item";
  card.innerHTML = `
    <p class="eyebrow">${item.time}</p>
    <h4>${item.title}</h4>
    <p class="muted">${item.detail}</p>
  `;
  timelineGrid.appendChild(card);
});

const downloadBtn = document.getElementById("downloadBtn");
const playReelBtn = document.getElementById("playReelBtn");

downloadBtn.addEventListener("click", () => {
  downloadBtn.textContent = "Deck sent to your inbox";
  setTimeout(() => {
    downloadBtn.textContent = "Download deck";
  }, 2200);
});

playReelBtn.addEventListener("click", () => {
  playReelBtn.textContent = "Reel playing...";
  setTimeout(() => {
    playReelBtn.textContent = "Play 60s reel";
  }, 2200);
});

class TouchTexture {
  constructor() {
    this.size = 64;
    this.width = this.size;
    this.height = this.size;
    this.maxAge = 64;
    this.radius = 0.2 * this.size;
    this.trail = [];
    this.last = null;
    this.initTexture();
  }

  initTexture() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.texture = new THREE.Texture(this.canvas);
  }

  addTouch(point) {
    let force = 0;
    let vx = 0;
    let vy = 0;
    if (this.last) {
      const dx = point.x - this.last.x;
      const dy = point.y - this.last.y;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / d || 0;
      vy = dy / d || 0;
      force = Math.min(dd * 20000, 1.5);
    }
    this.last = { x: point.x, y: point.y };
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
  }

  update() {
    this.clear();
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i];
      point.age++;
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1);
      } else {
        this.drawPoint(point);
      }
    }
    this.texture.needsUpdate = true;
  }

  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawPoint(point) {
    const pos = {
      x: point.x * this.width,
      y: (1 - point.y) * this.height,
    };

    const intensity = 1 - point.age / this.maxAge;
    const radius = this.radius;
    const color = `rgba(${(point.vx + 1) * 120}, ${(point.vy + 1) * 120}, ${intensity * 255}, ${intensity})`;

    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.shadowBlur = radius * 1.2;
    this.ctx.shadowColor = color;
    this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

class GradientScene {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.id = "webGLApp";
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 6;

    this.clock = new THREE.Clock();
    this.touchTexture = new TouchTexture();
    this.uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTouch: { value: this.touchTexture.texture },
      uColorA: { value: new THREE.Color("#f26b3a") },
      uColorB: { value: new THREE.Color("#3de0c3") },
      uColorC: { value: new THREE.Color("#0a1222") },
    };

    this.colorSchemes = [
      {
        a: "#f26b3a",
        b: "#3de0c3",
        c: "#0a1222",
      },
      {
        a: "#1d3b4f",
        b: "#58ffd0",
        c: "#05060a",
      },
      {
        a: "#ffb347",
        b: "#ffe66d",
        c: "#0b1b16",
      },
      {
        a: "#ffdf3a",
        b: "#ff2d55",
        c: "#1a0b12",
      },
      {
        a: "#8b5bff",
        b: "#57ff6b",
        c: "#0a0e16",
      },
    ];

    this.initMesh();
    this.bindEvents();
    this.render();
  }

  initMesh() {
    const geometry = new THREE.PlaneGeometry(10, 6, 1, 1);
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform sampler2D uTouch;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        varying vec2 vUv;

        float noise(vec2 p) {
          return sin(p.x) * sin(p.y);
        }

        void main() {
          vec2 uv = vUv;
          vec2 st = uv * 2.0 - 1.0;
          st.x *= uResolution.x / uResolution.y;

          vec4 touch = texture2D(uTouch, uv);
          float ripple = (touch.r + touch.g) * 0.35;
          uv += (touch.rg - 0.5) * 0.12;

          float t = uTime * 0.4;
          float wave = sin(st.x * 1.8 + t) * 0.15 + cos(st.y * 2.2 - t) * 0.1;
          float swirl = sin(length(st) * 2.4 - t * 1.3) * 0.2;

          float mask = smoothstep(0.9, 0.1, length(st));
          vec3 color = mix(uColorC, uColorA, wave + 0.5);
          color = mix(color, uColorB, swirl + 0.5);
          color = mix(uColorC, color, mask + ripple);

          float grain = noise(uv * uResolution * 0.01 + uTime);
          color += grain * 0.05;

          float luma = dot(color, vec3(0.299, 0.587, 0.114));
          color = mix(vec3(luma), color, 1.2);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
  }

  setScheme(index) {
    const scheme = this.colorSchemes[index];
    if (!scheme) return;
    this.uniforms.uColorA.value.set(scheme.a);
    this.uniforms.uColorB.value.set(scheme.b);
    this.uniforms.uColorC.value.set(scheme.c);
  }

  bindEvents() {
    window.addEventListener("resize", () => this.onResize());
    window.addEventListener("mousemove", (event) => this.onPointerMove(event));
    window.addEventListener("touchmove", (event) => this.onTouchMove(event));
  }

  onPointerMove(event) {
    const x = event.clientX / window.innerWidth;
    const y = 1 - event.clientY / window.innerHeight;
    this.uniforms.uMouse.value.set(x, y);
    this.touchTexture.addTouch({ x, y });
  }

  onTouchMove(event) {
    const touch = event.touches[0];
    if (!touch) return;
    this.onPointerMove({ clientX: touch.clientX, clientY: touch.clientY });
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  }

  render() {
    const delta = this.clock.getDelta();
    this.uniforms.uTime.value += delta;
    this.touchTexture.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
  }
}

const gradientScene = new GradientScene();

const schemeButtons = document.querySelectorAll(".scheme-btn");
schemeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    schemeButtons.forEach((button) => button.classList.remove("active"));
    btn.classList.add("active");
    gradientScene.setScheme(Number.parseInt(btn.dataset.scheme, 10));
  });
});

const cursor = document.getElementById("customCursor");
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let targetX = cursorX;
let targetY = cursorY;

function animateCursor() {
  cursorX += (targetX - cursorX) * 0.2;
  cursorY += (targetY - cursorY) * 0.2;
  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;
  requestAnimationFrame(animateCursor);
}

window.addEventListener("mousemove", (event) => {
  targetX = event.clientX;
  targetY = event.clientY;
});

window.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  if (!touch) return;
  targetX = touch.clientX;
  targetY = touch.clientY;
});

document.querySelectorAll("button, a").forEach((el) => {
  el.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
});

document.querySelectorAll(".primary, .cta").forEach((el) => {
  el.addEventListener("mouseenter", () => cursor.classList.add("is-cta"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("is-cta"));
});

animateCursor();
