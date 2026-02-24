const data = {
  missions: [
    {
      title: "Neon Raid",
      description: "Design a HUD overlay for a cyber bike chase sequence.",
      status: "Urgent",
      reward: "1200 XP"
    },
    {
      title: "Skyline Tower",
      description: "Prototype a vertical navigation system for a megacity map.",
      status: "Active",
      reward: "860 XP"
    },
    {
      title: "Quantum Bazaar",
      description: "Create animated product cards for a futuristic marketplace.",
      status: "Active",
      reward: "940 XP"
    },
    {
      title: "Specter Console",
      description: "Build a command deck UI for a stealth operations team.",
      status: "Queued",
      reward: "760 XP"
    }
  ],
  loadout: [
    { name: "HUD Design", level: "Epic" },
    { name: "Motion FX", level: "Legendary" },
    { name: "3D Layout", level: "Rare" },
    { name: "Audio Sync", level: "Rare" },
    { name: "UX Systems", level: "Epic" },
    { name: "Prototype", level: "Legendary" }
  ],
  stats: [
    { value: "48", label: "Missions completed" },
    { value: "12", label: "Live ops launches" },
    { value: "6", label: "Teams led" }
  ]
};

const missionGrid = document.getElementById("mission-cards");
const loadoutGrid = document.getElementById("loadout-items");
const statsGrid = document.getElementById("stats-grid");

if (missionGrid) {
  missionGrid.innerHTML = data.missions
    .map(
      (mission) => `
        <article class="card">
          <span class="badge">${mission.status}</span>
          <h3>${mission.title}</h3>
          <p>${mission.description}</p>
          <div class="card-meta">
            <span>Reward</span>
            <strong>${mission.reward}</strong>
          </div>
        </article>
      `
    )
    .join("");
}

if (loadoutGrid) {
  loadoutGrid.innerHTML = data.loadout
    .map(
      (item) => `
        <article class="loadout-item">
          <h4>${item.name}</h4>
          <span>${item.level}</span>
        </article>
      `
    )
    .join("");
}

if (statsGrid) {
  statsGrid.innerHTML = data.stats
    .map(
      (stat) => `
        <div>
          <h3>${stat.value}</h3>
          <p>${stat.label}</p>
        </div>
      `
    )
    .join("");
}

const lenis = window.Lenis
  ? new Lenis({
      smoothWheel: true,
      smoothTouch: false
    })
  : null;

function raf(time) {
  if (lenis) lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

if (window.gsap) {
  gsap.from(".topbar", { opacity: 0, y: -20, duration: 1, ease: "power3.out" });
  gsap.utils.toArray(".card, .loadout-item, .stats-grid div, .tool-card, .contact-card").forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      y: 20,
      duration: 0.7,
      delay: 0.05 * index,
      ease: "power2.out"
    });
  });
}

class GameBoyScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 1.6, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    this.buildLights();
    this.buildGameBoy();
    this.createScreenTexture();
    this.bindEvents();
    this.animate();
  }

  buildLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(4, 6, 4);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x73f6ff, 0.5);
    rim.position.set(-3, 2, -4);
    this.scene.add(rim);
  }

  buildGameBoy() {
    this.gameboy = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.7, metalness: 0.1 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6, metalness: 0.2 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.5, metalness: 0.2 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.2, 0.7), bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;

    const screenBezel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 0.05), darkMat);
    screenBezel.position.set(0, 0.8, 0.38);

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshStandardMaterial({ color: 0x88aa55, emissive: 0x335511 }));
    screen.position.set(0, 0.8, 0.405);
    this.screenMesh = screen;

    const dpad = new THREE.Group();
    const dpadBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.08), darkMat);
    const dpadCross = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.08), darkMat);
    dpad.add(dpadBase, dpadCross);
    dpad.position.set(-0.7, -0.4, 0.4);

    const buttonA = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 32), accentMat);
    buttonA.rotation.x = Math.PI / 2;
    buttonA.position.set(0.6, -0.35, 0.42);

    const buttonB = buttonA.clone();
    buttonB.position.set(1.0, -0.55, 0.42);

    const speaker = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.03), darkMat);
      slot.position.set(0.65, -1.2 - i * 0.12, 0.39);
      speaker.add(slot);
    }

    this.gameboy.add(body, screenBezel, screen, dpad, buttonA, buttonB, speaker);
    this.scene.add(this.gameboy);
  }

  createScreenTexture() {
    this.screenCanvas = document.createElement("canvas");
    this.screenCanvas.width = 128;
    this.screenCanvas.height = 128;
    this.screenCtx = this.screenCanvas.getContext("2d");

    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.magFilter = THREE.NearestFilter;
    this.screenTexture.minFilter = THREE.NearestFilter;

    this.screenMesh.material.map = this.screenTexture;
    this.screenMesh.material.needsUpdate = true;
  }

  drawScreen(time) {
    const ctx = this.screenCtx;
    const w = this.screenCanvas.width;
    const h = this.screenCanvas.height;
    ctx.fillStyle = "#b9d87a";
    ctx.fillRect(0, 0, w, h);

    const gridX = 12;
    const gridY = 8;
    const cols = 10;
    const rows = 16;
    const cell = 6;

    const wellW = cols * cell;
    const wellH = rows * cell;
    const wellLeft = gridX;
    const wellTop = gridY;

    ctx.fillStyle = "#a6c56b";
    ctx.fillRect(wellLeft - 2, wellTop - 2, wellW + 4, wellH + 4);

    ctx.fillStyle = "#8cb05f";
    ctx.fillRect(wellLeft, wellTop, wellW, wellH);

    ctx.strokeStyle = "#6f8f4a";
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(wellLeft + x * cell, wellTop);
      ctx.lineTo(wellLeft + x * cell, wellTop + wellH);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(wellLeft, wellTop + y * cell);
      ctx.lineTo(wellLeft + wellW, wellTop + y * cell);
      ctx.stroke();
    }

    const stackRows = 6;
    ctx.fillStyle = "#48653b";
    for (let y = rows - 1; y >= rows - stackRows; y--) {
      for (let x = 0; x < cols; x++) {
        if ((x + y) % 3 !== 0) {
          ctx.fillRect(wellLeft + x * cell + 1, wellTop + y * cell + 1, cell - 2, cell - 2);
        }
      }
    }

    const pieceFrames = [
      [ [0,0],[1,0],[0,1],[1,1] ],
      [ [0,0],[1,0],[2,0],[1,1] ],
      [ [0,0],[1,0],[2,0],[3,0] ],
      [ [0,0],[1,0],[1,1],[2,1] ]
    ];
    const frame = Math.floor(time * 1.2) % pieceFrames.length;
    const fall = (time * 3) % (rows - stackRows - 2);
    const piece = pieceFrames[frame];
    const pieceX = 4;
    const pieceY = Math.floor(fall);

    ctx.fillStyle = "#2f4e2d";
    piece.forEach(([dx, dy]) => {
      ctx.fillRect(
        wellLeft + (pieceX + dx) * cell + 1,
        wellTop + (pieceY + dy) * cell + 1,
        cell - 2,
        cell - 2
      );
    });

    ctx.fillStyle = "#2f4e2d";
    ctx.fillRect(80, 12, 36, 6);
    ctx.fillStyle = "#1f2f1e";
    ctx.fillRect(80, 12, 10 + (frame * 6), 6);

    this.screenTexture.needsUpdate = true;
  }

  bindEvents() {
    window.addEventListener("resize", () => this.onResize());
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    const elapsed = this.clock.getElapsedTime();
    this.drawScreen(elapsed);
    this.gameboy.rotation.y = Math.sin(elapsed * 0.5) * 0.35;
    this.gameboy.rotation.x = Math.sin(elapsed * 0.35) * 0.12;
    this.gameboy.position.y = Math.sin(elapsed * 0.8) * 0.12;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
}

const stage = document.getElementById("gameboy-stage");
if (stage && window.THREE) {
  new GameBoyScene(stage);
}
