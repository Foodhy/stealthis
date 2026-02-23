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

import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

initDemoShell({
  title: "Travel Experience",
  category: "pages",
  tech: ["three.js", "gsap", "lenis", "scrolltrigger"],
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

// =============================================================================
// THREE.JS SETUP
// =============================================================================

const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#0b1628");
scene.fog = new THREE.FogExp2(0x0b1628, 0.015);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 3, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

// -- Lighting --
const ambient = new THREE.AmbientLight(0x1a3060, 0.6);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(5, 8, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x00c2ff, 0.8);
fillLight.position.set(-4, 2, -3);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xff8c42, 1.0);
rimLight.position.set(0, -2, -6);
scene.add(rimLight);

// =============================================================================
// AIRPLANE GEOMETRY (Procedural Three.js Group)
// =============================================================================

const airplaneMat = new THREE.MeshPhysicalMaterial({
  color: 0xe8f0ff,
  metalness: 0.6,
  roughness: 0.2,
  clearcoat: 0.8,
  clearcoatRoughness: 0.1,
});

// -- Fuselage --
const fuselageGeo = new THREE.CapsuleGeometry(0.15, 1.2, 16, 24);
const fuselage = new THREE.Mesh(fuselageGeo, airplaneMat);
fuselage.rotation.z = Math.PI / 2;

// -- Main Wings --
const mainWingGeo = new THREE.BoxGeometry(2.4, 0.025, 0.45, 24, 1, 8);
const mainWing = new THREE.Mesh(mainWingGeo, airplaneMat);
mainWing.position.set(0.05, -0.02, 0);

// Apply sweep and taper to wing vertices
const wingPos = mainWingGeo.attributes.position;
for (let i = 0; i < wingPos.count; i++) {
  const x = wingPos.getX(i);
  let z = wingPos.getZ(i);

  // Sweep: shift Z backward proportional to distance from center
  z -= Math.abs(x) * 0.15;

  // Taper: reduce chord width at wingtips
  const taperFactor = 1.0 - (Math.abs(x) / 1.2) * 0.5;
  z *= taperFactor;

  wingPos.setZ(i, z);
}
wingPos.needsUpdate = true;
mainWingGeo.computeVertexNormals();

// -- Tail Horizontal Stabilizer --
const tailWingGeo = new THREE.BoxGeometry(0.8, 0.02, 0.2, 12, 1, 4);
const tailWing = new THREE.Mesh(tailWingGeo, airplaneMat);
tailWing.position.set(-0.7, 0.05, 0);

// Apply sweep and taper to tail
const tailPos = tailWingGeo.attributes.position;
for (let i = 0; i < tailPos.count; i++) {
  const x = tailPos.getX(i);
  let z = tailPos.getZ(i);

  z -= Math.abs(x) * 0.1;
  const taperFactor = 1.0 - (Math.abs(x) / 0.4) * 0.3;
  z *= taperFactor;

  tailPos.setZ(i, z);
}
tailPos.needsUpdate = true;
tailWingGeo.computeVertexNormals();

// -- Vertical Fin --
const finGeo = new THREE.BoxGeometry(0.02, 0.35, 0.3, 1, 8, 6);
const fin = new THREE.Mesh(finGeo, airplaneMat);
fin.position.set(-0.7, 0.2, 0);

// Taper fin: narrower at top, sweep back at top
const finPos = finGeo.attributes.position;
for (let i = 0; i < finPos.count; i++) {
  const y = finPos.getY(i);
  let z = finPos.getZ(i);

  // Narrower at top
  const heightFactor = (y + 0.175) / 0.35; // 0 at bottom, 1 at top
  z *= 1.0 - heightFactor * 0.5;

  // Sweep back at top
  z -= heightFactor * 0.08;

  finPos.setZ(i, z);
}
finPos.needsUpdate = true;
finGeo.computeVertexNormals();

// -- Engine Nacelles --
const engineGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.25, 12);
const engineLeft = new THREE.Mesh(engineGeo, airplaneMat);
engineLeft.rotation.z = Math.PI / 2;
engineLeft.position.set(0.1, -0.05, -0.5);

const engineRight = new THREE.Mesh(engineGeo, airplaneMat);
engineRight.rotation.z = Math.PI / 2;
engineRight.position.set(0.1, -0.05, 0.5);

// -- Assembly --
const airplane = new THREE.Group();
airplane.add(fuselage, mainWing, tailWing, fin, engineLeft, engineRight);
airplane.scale.setScalar(0.8);
scene.add(airplane);

// =============================================================================
// CLOUD PARTICLES
// =============================================================================

const cloudCount = 300;
const cloudGeo = new THREE.BufferGeometry();
const cloudPositions = new Float32Array(cloudCount * 3);

for (let i = 0; i < cloudCount; i++) {
  cloudPositions[i * 3] = (Math.random() - 0.5) * 80;
  cloudPositions[i * 3 + 1] = Math.random() * 20 - 5;
  cloudPositions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 20;
}

cloudGeo.setAttribute("position", new THREE.BufferAttribute(cloudPositions, 3));

const cloudMat = new THREE.PointsMaterial({
  color: 0x4a6a90,
  size: 2.5,
  transparent: true,
  opacity: 0.3,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const clouds = new THREE.Points(cloudGeo, cloudMat);
scene.add(clouds);

// =============================================================================
// FLIGHT PATH
// =============================================================================

const flightPath = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0, 8),
    new THREE.Vector3(3, 2, 4),
    new THREE.Vector3(0, 4, 0),
    new THREE.Vector3(-4, 3, -4),
    new THREE.Vector3(-2, 5, -8),
    new THREE.Vector3(2, 4, -12),
    new THREE.Vector3(0, 6, -16),
  ],
  false,
  "catmullrom",
  0.3
);

// =============================================================================
// SCROLL-DRIVEN FLIGHT ANIMATION
// =============================================================================

const scrollState = { progress: 0 };

gsap.to(scrollState, {
  progress: 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".flight-track",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5,
  },
});

// Static position for reduced motion
if (reduced) {
  const finalPos = flightPath.getPoint(0.5);
  airplane.position.copy(finalPos);
  camera.position.set(finalPos.x + 2, finalPos.y + 2, finalPos.z + 4);
  camera.lookAt(finalPos);
}

// =============================================================================
// HERO ENTRANCE
// =============================================================================

const heroTitle = document.querySelector(".hero-title");
const heroSubtitle = document.getElementById("hero-subtitle");

// SplitText for hero title
const titleSplit = new SplitText(heroTitle, { type: "chars", charsClass: "char" });
gsap.set(titleSplit.chars, {
  opacity: 0,
  y: reduced ? 0 : 60,
  rotateX: reduced ? 0 : -90,
});

const heroTl = gsap.timeline({ delay: 0.3 });

heroTl
  .to(titleSplit.chars, {
    opacity: 1,
    y: 0,
    rotateX: 0,
    duration: dur(0.6),
    ease: "back.out(1.4)",
    stagger: { each: 0.03 },
  })
  .to(
    heroSubtitle,
    {
      opacity: 1,
      duration: dur(0.1),
      onComplete: () => {
        if (!reduced) {
          gsap.to(heroSubtitle, {
            duration: dur(1.2),
            scrambleText: {
              text: "Scroll to take flight",
              chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
              speed: 0.4,
            },
          });
        } else {
          heroSubtitle.textContent = "Scroll to take flight";
        }
      },
    },
    0.5
  )
  .to(
    "#scroll-indicator",
    {
      opacity: 1,
      duration: dur(0.6),
      ease: "expo.out",
    },
    1.0
  );

// =============================================================================
// DESTINATION CARDS (ScrollTrigger per flight-section)
// =============================================================================

const destCards = document.querySelectorAll(".dest-card");
const flightSections = document.querySelectorAll(".flight-section");

flightSections.forEach((section, i) => {
  const card = destCards[i];
  if (!card) return;

  if (reduced) {
    // In reduced motion, cards are simply visible when in viewport
    gsap.set(card, { opacity: 1, x: 0 });
    card.classList.add("visible");
    return;
  }

  // Card entrance
  ScrollTrigger.create({
    trigger: section,
    start: "top 60%",
    end: "bottom 40%",
    onEnter: () => {
      card.classList.add("visible");
      gsap.to(card, {
        opacity: 1,
        x: 0,
        duration: dur(0.8),
        ease: "expo.out",
      });
    },
    onLeave: () => {
      gsap.to(card, {
        opacity: 0,
        x: -30,
        duration: dur(0.4),
        ease: "power2.in",
        onComplete: () => card.classList.remove("visible"),
      });
    },
    onEnterBack: () => {
      card.classList.add("visible");
      gsap.to(card, {
        opacity: 1,
        x: 0,
        duration: dur(0.8),
        ease: "expo.out",
      });
    },
    onLeaveBack: () => {
      gsap.to(card, {
        opacity: 0,
        x: 60,
        duration: dur(0.4),
        ease: "power2.in",
        onComplete: () => card.classList.remove("visible"),
      });
    },
  });

  // Set initial state for cards (off-screen right)
  gsap.set(card, { opacity: 0, x: 60 });
});

// =============================================================================
// DESTINATIONS GRID
// =============================================================================

const gridHeading = document.querySelector(".grid-heading");

if (gridHeading) {
  const gridSplit = new SplitText(gridHeading, { type: "words", wordsClass: "word" });
  gsap.set(gridSplit.words, {
    opacity: 0,
    y: reduced ? 0 : 30,
  });

  gsap.to(gridSplit.words, {
    opacity: 1,
    y: 0,
    duration: dur(0.6),
    ease: "back.out(1.2)",
    stagger: { each: 0.08 },
    scrollTrigger: {
      trigger: ".grid-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// Grid cards staggered entrance
gsap.to(".grid-card", {
  opacity: 1,
  y: 0,
  scale: 1,
  duration: dur(0.7),
  ease: "expo.out",
  stagger: {
    each: 0.1,
    from: "center",
    grid: [2, 2],
  },
  scrollTrigger: {
    trigger: ".destinations-grid",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
});

// =============================================================================
// CTA SECTION
// =============================================================================

const ctaHeading = document.querySelector(".cta-heading");

if (ctaHeading) {
  const ctaSplit = new SplitText(ctaHeading, { type: "chars", charsClass: "char" });
  gsap.set(ctaSplit.chars, {
    opacity: 0,
    y: reduced ? 0 : 40,
    rotateX: reduced ? 0 : -60,
  });

  if (reduced) {
    gsap.set(ctaSplit.chars, { opacity: 1 });
    gsap.set(".cta-subtitle", { opacity: 1 });
    gsap.set(".btn", { opacity: 1, y: 0 });
  } else {
    ScrollTrigger.create({
      trigger: ".cta-section",
      start: "top 60%",
      once: true,
      onEnter: () => {
        const ctaTl = gsap.timeline();

        ctaTl
          .to(ctaSplit.chars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: dur(0.6),
            ease: "back.out(1.4)",
            stagger: { each: 0.02 },
          })
          .to(
            ".cta-subtitle",
            {
              opacity: 1,
              duration: dur(0.6),
              ease: "expo.out",
            },
            "-=0.3"
          )
          .to(
            ".btn",
            {
              opacity: 1,
              y: 0,
              duration: dur(0.5),
              ease: "back.out(1.7)",
              stagger: 0.1,
            },
            "-=0.2"
          );
      },
    });
  }
}

// =============================================================================
// THREE.JS ANIMATION LOOP
// =============================================================================

// Reusable vectors to avoid allocation in the loop
const _lookTarget = new THREE.Vector3();
const _camTarget = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);

  if (reduced) {
    renderer.render(scene, camera);
    return;
  }

  const t = Math.max(0, Math.min(1, scrollState.progress));

  // Position airplane on curve
  const pos = flightPath.getPoint(t);
  airplane.position.copy(pos);

  // Orient airplane to face direction of travel
  const lookAheadT = Math.min(t + 0.01, 1);
  _lookTarget.copy(flightPath.getPoint(lookAheadT));
  airplane.lookAt(_lookTarget);

  // Compensate for fuselage being along Y axis (from CapsuleGeometry rotation)
  airplane.rotateY(Math.PI / 2);

  // Gentle wing bank based on curve curvature
  airplane.rotateZ(Math.sin(t * Math.PI * 4) * 0.1);

  // Camera follows behind and above
  const behindT = Math.max(t - 0.05, 0);
  const camPos = flightPath.getPoint(behindT);
  _camTarget.set(camPos.x + 2, camPos.y + 2, camPos.z + 4);
  camera.position.lerp(_camTarget, 0.05);
  camera.lookAt(pos);

  renderer.render(scene, camera);
}

animate();

// =============================================================================
// RESIZE
// =============================================================================

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// =============================================================================
// CLEANUP
// =============================================================================

window.addEventListener("beforeunload", () => {
  airplane.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
  });
  airplaneMat.dispose();
  cloudGeo.dispose();
  cloudMat.dispose();
  renderer.dispose();
});
