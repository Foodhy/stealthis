import * as THREE from "three";

// ─── Renderer ────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true,
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ─── Scene + Camera ──────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08091a);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 60);
camera.position.set(0, 0, 7);

// ─── Star Background ─────────────────────────────────────────────────────────
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(600 * 3);
for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 55;
starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
scene.add(
  new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, sizeAttenuation: true })
  )
);

// ─── Lights ──────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x304080, 2.5));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(3, 4, 6);
keyLight.castShadow = true;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x5070ff, 0.7);
fillLight.position.set(-4, 2, 3);
scene.add(fillLight);

// Warm cursor light — intensifies near face when cursor approaches
const cursorLight = new THREE.PointLight(0xff9050, 3.0, 11);
cursorLight.position.set(0, 0, 4);
scene.add(cursorLight);

// ─── Materials ───────────────────────────────────────────────────────────────
const skinMat = new THREE.MeshToonMaterial({ color: 0xf5c09a });
const skinDark = new THREE.MeshToonMaterial({ color: 0xe0a070 });
const scleraMat = new THREE.MeshToonMaterial({ color: 0xffffff });
const irisMat = new THREE.MeshToonMaterial({ color: 0x2266dd });
const pupilMat = new THREE.MeshToonMaterial({
  color: 0x080810,
  emissive: new THREE.Color(0x000820),
  emissiveIntensity: 1.2,
});
const browMat = new THREE.MeshToonMaterial({ color: 0x5a2d00 });
const smileMat = new THREE.MeshToonMaterial({ color: 0xcc3333 });
const blushMat = new THREE.MeshToonMaterial({ color: 0xf06868, transparent: true, opacity: 0.45 });
const shirtMat = new THREE.MeshToonMaterial({ color: 0x1a55cc });

// ─── Head Group ───────────────────────────────────────────────────────────────
const headGroup = new THREE.Group();
scene.add(headGroup);

// Main head sphere
const headMesh = new THREE.Mesh(new THREE.SphereGeometry(2.0, 32, 32), skinMat);
headMesh.castShadow = true;
headGroup.add(headMesh);

// Ears
[-1, 1].forEach((s) => {
  const ear = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), skinMat);
  ear.position.set(s * 1.93, 0.08, 0);
  ear.scale.set(0.58, 0.72, 0.52);
  headGroup.add(ear);
  // Inner ear
  const inner = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), skinDark);
  inner.position.set(s * 2.12, 0.08, 0.08);
  inner.scale.set(0.48, 0.6, 0.4);
  headGroup.add(inner);
});

// ─── Eye Builder ──────────────────────────────────────────────────────────────
// Returns the pupilGroup (which we translate to simulate gaze)
function buildEye(xSide) {
  const eyeGroup = new THREE.Group();
  // Position on face surface
  eyeGroup.position.set(xSide * 0.72, 0.28, 1.78);
  headGroup.add(eyeGroup);

  // Dark socket rim
  const socket = new THREE.Mesh(
    new THREE.CircleGeometry(0.46, 32),
    new THREE.MeshToonMaterial({ color: 0xd09870 })
  );
  socket.position.z = -0.05;
  eyeGroup.add(socket);

  // White sclera
  const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 16), scleraMat);
  sclera.castShadow = true;
  eyeGroup.add(sclera);

  // Pupil group — this group moves laterally to track the cursor
  const pupilGroup = new THREE.Group();
  eyeGroup.add(pupilGroup);

  // Iris disc
  const iris = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 16), irisMat);
  iris.position.z = 0.3;
  pupilGroup.add(iris);

  // Pupil center
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.165, 12, 12), pupilMat);
  pupil.position.z = 0.335;
  pupilGroup.add(pupil);

  // Specular highlight (white dot)
  const spec = new THREE.Mesh(
    new THREE.SphereGeometry(0.052, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  spec.position.set(0.1, 0.1, 0.39);
  pupilGroup.add(spec);

  return { eyeGroup, pupilGroup };
}

const leftEye = buildEye(-1);
const rightEye = buildEye(1);

// ─── Eyelids (squish to blink) ────────────────────────────────────────────────
// A skin-colored hemisphere that scales down from the top to "close" the eye
function buildLid(eyeGroup) {
  const lid = new THREE.Mesh(
    new THREE.SphereGeometry(0.47, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshToonMaterial({ color: 0xf5c09a })
  );
  lid.position.z = 0.12;
  lid.scale.y = 0; // invisible initially
  eyeGroup.add(lid);
  return lid;
}
const leftLid = buildLid(leftEye.eyeGroup);
const rightLid = buildLid(rightEye.eyeGroup);

// ─── Eyebrows ────────────────────────────────────────────────────────────────
function buildBrow(xSide) {
  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.11, 0.14), browMat);
  brow.position.set(xSide * 0.72, 0.9, 1.76);
  brow.rotation.z = xSide * -0.1;
  headGroup.add(brow);
  return brow;
}
const leftBrow = buildBrow(-1);
const rightBrow = buildBrow(1);

// ─── Nose ────────────────────────────────────────────────────────────────────
const nose = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), skinDark);
nose.position.set(0, -0.28, 1.96);
nose.scale.set(1, 0.82, 0.8);
headGroup.add(nose);

// Nostrils
[-0.12, 0.12].forEach((x) => {
  const nostril = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 8, 8),
    new THREE.MeshToonMaterial({ color: 0xb07050 })
  );
  nostril.position.set(x, -0.37, 2.01);
  headGroup.add(nostril);
});

// ─── Blush ───────────────────────────────────────────────────────────────────
[-1.05, 1.05].forEach((x) => {
  const blush = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), blushMat);
  blush.position.set(x, -0.3, 1.8);
  headGroup.add(blush);
});

// ─── Smile ───────────────────────────────────────────────────────────────────
const smile = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.065, 8, 26, Math.PI * 0.72), smileMat);
smile.position.set(0.1, -0.8, 1.88);
smile.rotation.z = Math.PI * 0.14;
headGroup.add(smile);

// ─── Neck + Shoulders (static, not in headGroup) ─────────────────────────────
const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.68, 0.85, 16), skinMat);
neck.position.set(0, -2.38, 0);
scene.add(neck);

const shirt = new THREE.Mesh(new THREE.CapsuleGeometry(1.05, 2.0, 8, 16), shirtMat);
shirt.rotation.z = Math.PI / 2;
shirt.position.set(0, -3.65, 0);
scene.add(shirt);

// Collar
const collar = new THREE.Mesh(
  new THREE.CylinderGeometry(0.7, 0.72, 0.35, 16),
  new THREE.MeshToonMaterial({ color: 0x1448aa })
);
collar.position.set(0, -2.87, 0);
scene.add(collar);

// ─── Cursor Tracking ─────────────────────────────────────────────────────────
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
// Plane at z=3 (in front of face center at z=0)
const lookPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -3);
const cursor3D = new THREE.Vector3(0, 0, 3);

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

// ─── Blink State ─────────────────────────────────────────────────────────────
let blinkTimer = 2.5 + Math.random() * 2.5;
let blinkPhase = 0; // 0 = open, >0 = blinking
const BLINK_DUR = 0.18; // seconds for one blink

// ─── Reusable temps ──────────────────────────────────────────────────────────
const localCursor = new THREE.Vector3();

// ─── Animation Loop ───────────────────────────────────────────────────────────
const clock = new THREE.Clock();

(function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.getElapsedTime();

  // ─ Project cursor to z=3 plane ─
  raycaster.setFromCamera(mouse, camera);
  const hit = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(lookPlane, hit)) {
    cursor3D.lerp(hit, 0.1);
  }

  // Cursor light follows cursor in front of face
  cursorLight.position.set(cursor3D.x * 0.6, cursor3D.y * 0.6, cursor3D.z);

  // ─ Head gently rotates toward cursor ─
  const targetRotY = Math.atan2(cursor3D.x, cursor3D.z + 3) * 0.3;
  const targetRotX = -Math.atan2(cursor3D.y, cursor3D.z + 3) * 0.22;
  headGroup.rotation.y += (targetRotY - headGroup.rotation.y) * 0.055;
  headGroup.rotation.x += (targetRotX - headGroup.rotation.x) * 0.055;

  // Gentle float
  headGroup.position.y = Math.sin(t * 0.9) * 0.12;

  // ─ Eye tracking: move pupilGroup in eye's local XY space ─
  // Transform cursor to headGroup's local space
  headGroup.worldToLocal(localCursor.copy(cursor3D));

  const MAX_R = 0.16;
  const SENS = 0.055;

  for (const { pupilGroup } of [leftEye, rightEye]) {
    // cursor offset from face center in head local space → pupil XY offset
    const tx = Math.max(-MAX_R, Math.min(MAX_R, localCursor.x * SENS));
    const ty = Math.max(-MAX_R, Math.min(MAX_R, localCursor.y * SENS));
    pupilGroup.position.x += (tx - pupilGroup.position.x) * 0.18;
    pupilGroup.position.y += (ty - pupilGroup.position.y) * 0.18;
  }

  // ─ Eyebrow raise when cursor is high ─
  const browLift = Math.max(0, cursor3D.y * 0.055);
  leftBrow.position.y = 0.9 + browLift;
  rightBrow.position.y = 0.9 + browLift;

  // ─ Blink ─
  blinkTimer -= dt;
  if (blinkTimer <= 0 && blinkPhase === 0) {
    blinkPhase = 0.001;
    blinkTimer = 2.5 + Math.random() * 4.0;
  }
  if (blinkPhase > 0) {
    blinkPhase += dt;
    // sin curve over [0, BLINK_DUR]: 0 → 1 → 0
    const lidScale = Math.max(0, Math.sin((blinkPhase / BLINK_DUR) * Math.PI));
    leftLid.scale.y = lidScale;
    rightLid.scale.y = lidScale;
    if (blinkPhase >= BLINK_DUR) {
      blinkPhase = 0;
      leftLid.scale.y = 0;
      rightLid.scale.y = 0;
    }
  }

  renderer.render(scene, camera);
})();

// ─── Resize ──────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
