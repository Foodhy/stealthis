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
scene.background = new THREE.Color(0x060612);
scene.fog = new THREE.FogExp2(0x060612, 0.025);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 80);
camera.position.set(0, 0, 15);

// ─── Lights ──────────────────────────────────────────────────────────────────
// Cool ambient fill
scene.add(new THREE.AmbientLight(0x102080, 2.0));

// Backlight for rim sheen
const backLight = new THREE.DirectionalLight(0x4444cc, 1.6);
backLight.position.set(0, 5, -12);
scene.add(backLight);

// Warm cursor light — this is what makes orbs near cursor look orange/hot
const cursorLight = new THREE.PointLight(0xff6633, 8, 13);
scene.add(cursorLight);

// Secondary accent light
const accentLight = new THREE.PointLight(0x3366ff, 3, 18);
accentLight.position.set(-8, -5, -5);
scene.add(accentLight);

// ─── Orb Mesh (Instanced) ─────────────────────────────────────────────────────
const N = 240;

const orbGeo = new THREE.SphereGeometry(0.18, 10, 8);
const orbMat = new THREE.MeshStandardMaterial({
  color: 0x3355ee,
  emissive: 0x0a1555,
  emissiveIntensity: 0.8,
  roughness: 0.08,
  metalness: 0.95,
});

const orbMesh = new THREE.InstancedMesh(orbGeo, orbMat, N);
orbMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(orbMesh);

// ─── Orb State ────────────────────────────────────────────────────────────────
const pos = new Float32Array(N * 3); // current positions
const vel = new Float32Array(N * 3); // velocities
const home = new Float32Array(N * 3); // rest positions

// Distribute on a disc-like sphere shell (flatten z-axis for frontal view)
for (let i = 0; i < N; i++) {
  const phi = Math.acos(1 - 2 * Math.random());
  const theta = Math.random() * Math.PI * 2;
  const r = 2.8 + Math.random() * 3.2;

  home[i * 3] = pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  home[i * 3 + 1] = pos[i * 3 + 1] = r * Math.cos(phi);
  home[i * 3 + 2] = pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.45;
}

// Pre-apply identity matrices so the mesh has valid initial transforms
const dummy = new THREE.Object3D();
for (let i = 0; i < N; i++) {
  dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
  dummy.scale.setScalar(1);
  dummy.updateMatrix();
  orbMesh.setMatrixAt(i, dummy.matrix);
}
orbMesh.instanceMatrix.needsUpdate = true;

// ─── Cursor Tracking ──────────────────────────────────────────────────────────
const mouse = new THREE.Vector2();
const cursor3D = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
// Plane at z=0, facing camera
const frontPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

const onPointer = (x, y) => {
  mouse.x = (x / innerWidth) * 2 - 1;
  mouse.y = -(y / innerHeight) * 2 + 1;
};
window.addEventListener("mousemove", (e) => onPointer(e.clientX, e.clientY));
window.addEventListener(
  "touchmove",
  (e) => {
    onPointer(e.touches[0].clientX, e.touches[0].clientY);
  },
  { passive: true }
);

// ─── Physics Constants ────────────────────────────────────────────────────────
const ATTRACT = 0.052;
const RESTORE = 0.016;
const DAMPING = 0.875;
const NOISE = 0.007;

// ─── Render Loop ─────────────────────────────────────────────────────────────
(function animate() {
  requestAnimationFrame(animate);

  // Project cursor onto front plane → 3D position
  raycaster.setFromCamera(mouse, camera);
  const hit = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(frontPlane, hit)) {
    cursor3D.lerp(hit, 0.12);
  }

  // Cursor light follows cursor in 3D space
  cursorLight.position.copy(cursor3D);

  const t = performance.now() * 0.001;

  for (let i = 0; i < N; i++) {
    const ix = i * 3;

    // Spring force: toward cursor + toward home + noise jitter
    vel[ix] =
      (vel[ix] +
        (cursor3D.x - pos[ix]) * ATTRACT +
        (home[ix] - pos[ix]) * RESTORE +
        (Math.random() - 0.5) * NOISE) *
      DAMPING;
    vel[ix + 1] =
      (vel[ix + 1] +
        (cursor3D.y - pos[ix + 1]) * ATTRACT +
        (home[ix + 1] - pos[ix + 1]) * RESTORE +
        (Math.random() - 0.5) * NOISE) *
      DAMPING;
    vel[ix + 2] =
      (vel[ix + 2] +
        (cursor3D.z - pos[ix + 2]) * ATTRACT +
        (home[ix + 2] - pos[ix + 2]) * RESTORE +
        (Math.random() - 0.5) * NOISE) *
      DAMPING;

    pos[ix] += vel[ix];
    pos[ix + 1] += vel[ix + 1];
    pos[ix + 2] += vel[ix + 2];

    // Scale: larger near cursor + slow pulsation
    const dx = cursor3D.x - pos[ix];
    const dy = cursor3D.y - pos[ix + 1];
    const dz = cursor3D.z - pos[ix + 2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const prox = Math.max(0, 1 - dist / 6); // 0..1, peaks at cursor
    const pulse = 1 + Math.sin(t * 1.8 + i * 0.25) * 0.08;
    const scale = (0.55 + prox * 0.9) * pulse;

    dummy.position.set(pos[ix], pos[ix + 1], pos[ix + 2]);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    orbMesh.setMatrixAt(i, dummy.matrix);
  }

  orbMesh.instanceMatrix.needsUpdate = true;
  renderer.render(scene, camera);
})();

// ─── Resize ──────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
