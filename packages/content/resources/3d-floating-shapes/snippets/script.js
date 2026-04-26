import * as THREE from "three";

// ─── Renderer ────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true,
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

// ─── Scene + Camera ──────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07070f);
scene.fog = new THREE.FogExp2(0x07070f, 0.028);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 13);

// ─── Lights ──────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x1a1030, 3));

const light1 = new THREE.PointLight(0x6633ff, 5, 22);
light1.position.set(-5, 5, 4);
scene.add(light1);

const light2 = new THREE.PointLight(0xff3366, 5, 22);
light2.position.set(5, -4, 3);
scene.add(light2);

const light3 = new THREE.PointLight(0x00ccff, 3, 18);
light3.position.set(0, 6, -6);
scene.add(light3);

// ─── Shape Definitions ───────────────────────────────────────────────────────
const defs = [
  { geo: new THREE.TorusKnotGeometry(0.85, 0.28, 80, 18),         color: 0x8b5cf6, wire: false },
  { geo: new THREE.IcosahedronGeometry(1.0, 1),                    color: 0x06b6d4, wire: false },
  { geo: new THREE.OctahedronGeometry(1.05),                       color: 0xf59e0b, wire: true  },
  { geo: new THREE.DodecahedronGeometry(0.95),                     color: 0x10b981, wire: false },
  { geo: new THREE.TetrahedronGeometry(1.1),                       color: 0xf43f5e, wire: true  },
  { geo: new THREE.TorusGeometry(0.80, 0.26, 16, 52),              color: 0x3b82f6, wire: false },
  { geo: new THREE.SphereGeometry(0.90, 32, 16),                   color: 0xf97316, wire: false },
  { geo: new THREE.BoxGeometry(1.2, 1.2, 1.2),                     color: 0xec4899, wire: true  },
  { geo: new THREE.ConeGeometry(0.78, 1.7, 7),                     color: 0x14b8a6, wire: false },
  { geo: new THREE.CylinderGeometry(0.48, 0.48, 1.4, 32),          color: 0xa855f7, wire: false },
];

// Layout positions in world space
const layout = [
  [-3.8, 2.8, 0.5],  [ 0.0, 3.2, -1.0], [ 3.8, 2.2,  0.5],
  [-4.2, 0.1, 0.8],  [-1.4, 0.6,  1.0], [ 1.4,-0.4,  0.2],
  [ 4.2, 0.3,-0.5],  [-3.8,-2.8,  0.5], [ 0.0,-3.0, -1.0],
  [ 3.8,-2.2,  0.5],
];

const meshes = defs.map(({ geo, color, wire }, i) => {
  const mat = wire
    ? new THREE.MeshBasicMaterial({ color, wireframe: true })
    : new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.65 });

  const mesh = new THREE.Mesh(geo, mat);
  const [x, y, z] = layout[i];
  mesh.position.set(x, y, z);
  mesh.castShadow = !wire;

  // Per-shape animation params stored in userData
  mesh.userData = {
    homeY:     y,
    rotAxis:   new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
    rotSpeed:  0.25 + Math.random() * 0.45,
    floatAmp:  0.18 + Math.random() * 0.14,
    floatFreq: 0.45 + Math.random() * 0.30,
    floatPhase: Math.random() * Math.PI * 2,
  };

  scene.add(mesh);
  return mesh;
});

// ─── Mouse Parallax ───────────────────────────────────────────────────────────
const mouse = new THREE.Vector2();
const camOffset = new THREE.Vector2();

window.addEventListener("mousemove", e => {
  mouse.x = (e.clientX / innerWidth)  * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
});
window.addEventListener("touchmove", e => {
  mouse.x = (e.touches[0].clientX / innerWidth)  * 2 - 1;
  mouse.y = -(e.touches[0].clientY / innerHeight) * 2 + 1;
}, { passive: true });

// ─── Animation Loop ───────────────────────────────────────────────────────────
const clock = new THREE.Clock();

(function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  meshes.forEach(mesh => {
    const { homeY, rotAxis, rotSpeed, floatAmp, floatFreq, floatPhase } = mesh.userData;
    // Self-rotate on unique axis
    mesh.rotateOnAxis(rotAxis, rotSpeed * 0.012);
    // Float up and down
    mesh.position.y = homeY + Math.sin(t * floatFreq + floatPhase) * floatAmp;
  });

  // Smooth camera parallax
  camOffset.x += (mouse.x * 1.6 - camOffset.x) * 0.045;
  camOffset.y += (mouse.y * 0.9 - camOffset.y) * 0.045;
  camera.position.x = camOffset.x;
  camera.position.y = camOffset.y;
  camera.lookAt(0, 0, 0);

  // Animate lights in slow orbit
  light1.position.x = Math.cos(t * 0.25) * 6;
  light1.position.z = Math.sin(t * 0.25) * 4 + 3;
  light2.position.x = -Math.cos(t * 0.18) * 6;
  light2.position.z = Math.sin(t * 0.18) * 4 + 2;

  renderer.render(scene, camera);
})();

// ─── Resize ──────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
