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

/**
 * AI Engineer Portfolio — main.js
 * Dr. Yuki Tanaka // Three.js neural net + GSAP + Canvas 2D
 */

import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";

// ── Register GSAP plugins ────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

// ── Init shell ───────────────────────────────────────────────────────
initDemoShell({
  title: "AI Engineer Portfolio",
  category: "pages",
  tech: ["three.js", "gsap", "scrambletext", "lenis", "canvas-2d"],
});

const reduced = prefersReducedMotion();

// ── Lenis smooth scroll ──────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ══════════════════════════════════════════════════════════════════════
//  THREE.JS NEURAL NETWORK
// ══════════════════════════════════════════════════════════════════════
function initNeuralNet() {
  const canvas = document.getElementById("neural-canvas");
  const W = canvas.clientWidth || window.innerWidth;
  const H = canvas.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.set(0, 0, 8);

  // ── 200 nodes distributed on sphere surface ──────────────────────
  const NODE_COUNT = 200;
  const positions = new Float32Array(NODE_COUNT * 3);
  const nodes = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 3 + Math.random() * 2;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    nodes.push({
      x,
      y,
      z,
      baseSize: 0.04 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
    });
  }

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const nodeSizes = new Float32Array(NODE_COUNT);
  nodeSizes.fill(0.05);
  nodeGeo.setAttribute("size", new THREE.BufferAttribute(nodeSizes, 1));

  const nodeMat = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(0x00ff88) } },
    vertexShader: `
      attribute float size;
      void main() {
        gl_PointSize = size * 300.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if(d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.2, 0.5, d);
        gl_FragColor = vec4(color, alpha * 0.85);
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(nodeGeo, nodeMat);
  scene.add(points);

  // ── Edges between nodes within distance threshold ────────────────
  const DIST_THRESHOLD = 1.3;
  const edgePositions = [];
  const edges = []; // store for particle paths

  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dz = nodes[i].z - nodes[j].z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < DIST_THRESHOLD) {
        edgePositions.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        edges.push({ from: nodes[i], to: nodes[j] });
      }
    }
  }

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(edgePositions), 3));
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x9945ff,
    transparent: true,
    opacity: 0.18,
  });
  scene.add(new THREE.LineSegments(edgeGeo, edgeMat));

  // ── 50 particles flowing along random edges ──────────────────────
  const PARTICLE_COUNT = 50;
  const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 0.08,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  const particleMesh = new THREE.Points(particleGeo, particleMat);
  scene.add(particleMesh);

  // Each particle picks a random edge and a random progress t
  const particleData = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const edgeIdx = Math.floor(Math.random() * edges.length);
    particleData.push({
      edgeIdx,
      t: Math.random(),
      speed: 0.003 + Math.random() * 0.005,
      direction: Math.random() > 0.5 ? 1 : -1,
    });
  }

  // ── Resize handler ───────────────────────────────────────────────
  function onResize() {
    const w = window.innerWidth;
    const h = canvas.parentElement.clientHeight || window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", onResize);

  // ── Animation loop ───────────────────────────────────────────────
  let cameraAngle = 0;
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Slow camera orbit
    cameraAngle += 0.0008;
    camera.position.x = Math.sin(cameraAngle) * 8;
    camera.position.z = Math.cos(cameraAngle) * 8;
    camera.position.y = Math.sin(cameraAngle * 0.4) * 1.5;
    camera.lookAt(0, 0, 0);

    // Pulse node sizes
    const sizeAttr = nodeGeo.attributes.size;
    for (let i = 0; i < NODE_COUNT; i++) {
      const pulse = nodes[i].baseSize + Math.sin(t * 1.5 + nodes[i].phase) * 0.015;
      sizeAttr.array[i] = pulse;
    }
    sizeAttr.needsUpdate = true;

    // Move particles along edges
    const posAttr = particleGeo.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const pd = particleData[i];
      pd.t += pd.speed * pd.direction;

      // Bounce direction at ends, pick new edge when bouncing
      if (pd.t >= 1 || pd.t <= 0) {
        pd.direction *= -1;
        pd.t = Math.max(0, Math.min(1, pd.t));
        if (Math.random() > 0.6) {
          pd.edgeIdx = Math.floor(Math.random() * edges.length);
        }
      }

      const edge = edges[pd.edgeIdx];
      posAttr.array[i * 3] = edge.from.x + (edge.to.x - edge.from.x) * pd.t;
      posAttr.array[i * 3 + 1] = edge.from.y + (edge.to.y - edge.from.y) * pd.t;
      posAttr.array[i * 3 + 2] = edge.from.z + (edge.to.z - edge.from.z) * pd.t;
    }
    posAttr.needsUpdate = true;

    renderer.render(scene, camera);
  }

  if (!reduced) {
    animate();
  } else {
    // Single static render for reduced motion
    renderer.render(scene, camera);
  }
}

// ══════════════════════════════════════════════════════════════════════
//  HERO TEXT ANIMATIONS
// ══════════════════════════════════════════════════════════════════════
function initHeroText() {
  const nameEl = document.getElementById("hero-name");

  if (!reduced) {
    // Scramble reveal
    gsap.fromTo(
      nameEl,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.1,
        onComplete: () => {
          gsap.to(nameEl, {
            duration: 1.5,
            delay: 0.3,
            scrambleText: {
              text: "DR. YUKI TANAKA",
              chars: "01ABCDEF!@#$%",
              speed: 0.4,
              delimiter: "",
            },
          });
        },
      }
    );

    // Fade in hero elements
    gsap.fromTo(
      "#hero-meta",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
    );
    gsap.fromTo(
      "#hero-title",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 1.4 }
    );
    gsap.fromTo(
      "#hero-spec-wrapper",
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, delay: 1.8 }
    );
    gsap.fromTo(
      "#hero-stats",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 2.0 }
    );
    gsap.fromTo("#hero-scroll-hint", { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 2.6 });
  }

  // Typewriter specializations — runs regardless
  const specs = ["LLM Fine-tuning", "Diffusion Models", "RL Systems", "Neural Architecture"];
  let si = 0;
  let typeTimeout = null;

  function typeSpec() {
    const el = document.getElementById("spec-text");
    const text = specs[si % specs.length];
    el.textContent = "";
    let ci = 0;

    const interval = setInterval(() => {
      el.textContent += text[ci++];
      if (ci >= text.length) {
        clearInterval(interval);
        typeTimeout = setTimeout(() => {
          // Erase
          let ei = text.length;
          const eraseInterval = setInterval(() => {
            el.textContent = text.slice(0, ei--);
            if (ei < 0) {
              clearInterval(eraseInterval);
              si++;
              typeSpec();
            }
          }, 30);
        }, 1800);
      }
    }, 60);
  }

  const specDelay = reduced ? 0 : 1900;
  setTimeout(typeSpec, specDelay);
}

// ══════════════════════════════════════════════════════════════════════
//  PAPER CARDS — scroll reveal
// ══════════════════════════════════════════════════════════════════════
function initPaperCards() {
  const cards = document.querySelectorAll(".paper-card");

  if (reduced) {
    cards.forEach((c) => {
      c.style.opacity = "1";
      c.style.transform = "none";
    });
    return;
  }

  cards.forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      delay: i * 0.12,
      scrollTrigger: {
        trigger: card,
        start: "top 88%",
        once: true,
      },
    });
  });
}

// ══════════════════════════════════════════════════════════════════════
//  CANVAS 2D — Training Loss Curve
// ══════════════════════════════════════════════════════════════════════
function initLossCanvas() {
  const canvas = document.getElementById("loss-canvas");
  const ctx = canvas.getContext("2d");

  // Generate a realistic loss curve: starts ~2.5, drops fast, levels off ~0.15
  function generateLossData(numPoints) {
    const data = [];
    let loss = 2.5;
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const decay = Math.exp(-t * 5) * 2.35;
      const plateau = 0.15;
      const noise = (Math.random() - 0.5) * 0.08 * Math.exp(-t * 3);
      loss = plateau + decay + noise;
      data.push(Math.max(0.05, loss));
    }
    return data;
  }

  const DATA_POINTS = 120;
  const lossData = generateLossData(DATA_POINTS);

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    return { w: rect.width, h: rect.height };
  }

  function drawChart(progress) {
    const { w, h } = resizeCanvas();
    const PAD = { top: 20, right: 20, bottom: 30, left: 48 };
    const plotW = w - PAD.left - PAD.right;
    const plotH = h - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "#020508";
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    const gridCols = 8;
    const gridRows = 5;
    ctx.strokeStyle = "rgba(15,32,32,1)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridCols; i++) {
      const x = PAD.left + (i / gridCols) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, PAD.top);
      ctx.lineTo(x, PAD.top + plotH);
      ctx.stroke();
    }
    for (let i = 0; i <= gridRows; i++) {
      const y = PAD.top + (i / gridRows) * plotH;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + plotW, y);
      ctx.stroke();
    }

    // Y axis labels
    ctx.fillStyle = "#3a5a4a";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "right";
    const yMax = 2.6;
    const yMin = 0.0;
    for (let i = 0; i <= gridRows; i++) {
      const val = yMax - (i / gridRows) * (yMax - yMin);
      const y = PAD.top + (i / gridRows) * plotH;
      ctx.fillText(val.toFixed(1), PAD.left - 6, y + 3);
    }

    // X axis labels
    ctx.textAlign = "center";
    for (let i = 0; i <= gridCols; i++) {
      const val = Math.round((i / gridCols) * 100);
      const x = PAD.left + (i / gridCols) * plotW;
      ctx.fillText(val + "k", x, PAD.top + plotH + 16);
    }

    // Axes
    ctx.strokeStyle = "#1a2435";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, PAD.top + plotH);
    ctx.lineTo(PAD.left + plotW, PAD.top + plotH);
    ctx.stroke();

    // Clip to progress
    const drawCount = Math.floor(DATA_POINTS * progress);
    if (drawCount < 2) return;

    function dataToCanvas(i, val) {
      const x = PAD.left + (i / (DATA_POINTS - 1)) * plotW;
      const y = PAD.top + (1 - (val - yMin) / (yMax - yMin)) * plotH;
      return { x, y };
    }

    // Glow fill under curve
    const firstPt = dataToCanvas(0, lossData[0]);
    const lastPt = dataToCanvas(drawCount - 1, lossData[drawCount - 1]);

    const gradient = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + plotH);
    gradient.addColorStop(0, "rgba(0,255,136,0.18)");
    gradient.addColorStop(1, "rgba(0,255,136,0.00)");

    ctx.beginPath();
    ctx.moveTo(firstPt.x, PAD.top + plotH);
    ctx.lineTo(firstPt.x, firstPt.y);
    for (let i = 1; i < drawCount; i++) {
      const pt = dataToCanvas(i, lossData[i]);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.lineTo(lastPt.x, PAD.top + plotH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Glowing line
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 12;
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    ctx.beginPath();
    const startPt = dataToCanvas(0, lossData[0]);
    ctx.moveTo(startPt.x, startPt.y);
    for (let i = 1; i < drawCount; i++) {
      const pt = dataToCanvas(i, lossData[i]);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Leading dot
    const leadPt = dataToCanvas(drawCount - 1, lossData[drawCount - 1]);
    ctx.beginPath();
    ctx.arc(leadPt.x, leadPt.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#00ff88";
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Initial draw at 0
  drawChart(0);

  if (reduced) {
    drawChart(1);
    return;
  }

  // Animate on scroll entry
  let animated = false;
  ScrollTrigger.create({
    trigger: "#loss-panel",
    start: "top 80%",
    onEnter: () => {
      if (animated) return;
      animated = true;
      const obj = { progress: 0 };
      gsap.to(obj, {
        progress: 1,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: () => drawChart(obj.progress),
      });
    },
  });

  window.addEventListener("resize", () => drawChart(animated ? 1 : 0));
}

// ══════════════════════════════════════════════════════════════════════
//  CANVAS 2D — Confusion Matrix (8×8 heatmap)
// ══════════════════════════════════════════════════════════════════════
function initConfusionMatrix() {
  const container = document.getElementById("confusion-matrix");

  // Simulate a realistic 8x8 confusion matrix (high diagonal, some off-diagonal)
  const labels = ["NLI", "QA", "SUM", "CLS", "GEN", "COD", "MAT", "RLX"];
  const N = 8;

  // Build matrix: diagonal values high, off-diagonal noise
  const matrix = [];
  for (let i = 0; i < N; i++) {
    const row = [];
    for (let j = 0; j < N; j++) {
      if (i === j) {
        row.push(0.82 + Math.random() * 0.17); // diagonal: 0.82–0.99
      } else {
        const off = Math.random() * 0.12;
        row.push(off * (Math.random() > 0.65 ? 1 : 0.3)); // sparse off-diagonal
      }
    }
    matrix.push(row);
  }

  // Create cells
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const val = matrix[i][j];
      const cell = document.createElement("div");
      cell.className = "cm-cell";

      // Color: green for diagonal, purple for off-diagonal confusion, dark for zero
      let r, g, b, a;
      if (i === j) {
        // Green diagonal
        const intensity = val;
        r = Math.round(0 + intensity * 0);
        g = Math.round(100 + intensity * 155);
        b = Math.round(60 + intensity * 76);
        a = 0.3 + intensity * 0.7;
      } else if (val > 0.04) {
        // Purple off-diagonal errors
        const intensity = val / 0.12;
        r = Math.round(80 + intensity * 73);
        g = Math.round(10 + intensity * 20);
        b = Math.round(120 + intensity * 135);
        a = 0.2 + intensity * 0.7;
      } else {
        r = 10;
        g = 20;
        b = 30;
        a = 0.4;
      }

      cell.style.background = `rgba(${r},${g},${b},${a})`;

      if (val > 0.05) {
        cell.textContent = val.toFixed(2);
      }

      // Stagger reveal
      cell.style.opacity = "0";
      cell.style.transform = "scale(0.5)";
      container.appendChild(cell);
    }
  }

  if (reduced) {
    container.querySelectorAll(".cm-cell").forEach((c) => {
      c.style.opacity = "1";
      c.style.transform = "none";
    });
    return;
  }

  ScrollTrigger.create({
    trigger: "#confusion-panel",
    start: "top 80%",
    onEnter: () => {
      const cells = container.querySelectorAll(".cm-cell");
      cells.forEach((cell, i) => {
        gsap.to(cell, {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          delay: i * 0.008,
          ease: "back.out(1.4)",
        });
      });
    },
  });
}

// ══════════════════════════════════════════════════════════════════════
//  TERMINAL STACK — stagger reveal
// ══════════════════════════════════════════════════════════════════════
function initTerminal() {
  const lines = document.querySelectorAll(".term-line, .term-output");

  if (reduced) {
    lines.forEach((l) => {
      l.style.opacity = "1";
      l.style.transform = "none";
    });
    document.querySelectorAll(".term-bar-fill").forEach((b) => {
      b.style.width = b.style.getPropertyValue("--pct");
    });
    return;
  }

  ScrollTrigger.create({
    trigger: "#terminal-body",
    start: "top 82%",
    onEnter: () => {
      lines.forEach((line, i) => {
        const delay = i * 0.1;
        gsap.to(line, {
          opacity: 1,
          x: 0,
          duration: 0.4,
          delay,
          ease: "power2.out",
        });

        // Animate skill bars
        const bar = line.querySelector(".term-bar-fill");
        if (bar) {
          const targetPct = bar.style.getPropertyValue("--pct");
          gsap.to(bar, {
            width: targetPct,
            duration: 1.0,
            delay: delay + 0.15,
            ease: "power2.out",
          });
        }
      });
    },
  });
}

// ══════════════════════════════════════════════════════════════════════
//  CONTACT — fade in
// ══════════════════════════════════════════════════════════════════════
function initContact() {
  if (reduced) return;

  gsap.fromTo(
    ".contact-terminal",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#contact",
        start: "top 85%",
        once: true,
      },
    }
  );

  gsap.fromTo(
    ".contact-row",
    { opacity: 0, x: -20 },
    {
      opacity: 1,
      x: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".contact-output",
        start: "top 88%",
        once: true,
      },
    }
  );
}

// ══════════════════════════════════════════════════════════════════════
//  SECTION HEADERS — reveal
// ══════════════════════════════════════════════════════════════════════
function initSectionHeaders() {
  if (reduced) return;

  document.querySelectorAll(".section-header").forEach((header) => {
    gsap.fromTo(
      header,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: header,
          start: "top 90%",
          once: true,
        },
      }
    );
  });
}

// ══════════════════════════════════════════════════════════════════════
//  REDUCED MOTION LISTENER
// ══════════════════════════════════════════════════════════════════════
window.addEventListener("motion-preference", (e) => {
  // If user toggles motion mid-session, refresh page to reinitialize
  // (complex animation state makes incremental change impractical)
  location.reload();
});

// ══════════════════════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════════════════════
initNeuralNet();
initHeroText();
initPaperCards();
initLossCanvas();
initConfusionMatrix();
initTerminal();
initContact();
initSectionHeaders();
