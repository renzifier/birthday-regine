import { scene } from "./renderer.js";

const COLORS = [
  0xff4488, 0xff9900, 0xffee00, 0x44dd88, 0x44aaff, 0xcc44ff, 0xff6644,
  0xffffff,
];

const PIECE_COUNT = 180;
const GRAVITY = -4.8;
const DRAG = 0.985;
const SPREAD_X = 7.0;
const SPREAD_Z = 4.5;
const SPAWN_Y = 9.5;

const SURFACES = [
  {
    label: "table",
    y: 0.67,
    test: (x, z) => Math.abs(x) <= 8.55 && Math.abs(z) <= 5.85,
  },
  {
    label: "floor",
    y: -1.8,
    test: () => true,
  },
];

const GEO = new THREE.BoxGeometry(0.18, 0.008, 0.11);
const MATS = COLORS.map(
  (c) =>
    new THREE.MeshStandardMaterial({
      color: c,
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: 1.0,
    }),
);

const pieces = [];
for (let i = 0; i < PIECE_COUNT; i++) {
  const mat = MATS[i % MATS.length].clone();
  const mesh = new THREE.Mesh(GEO, mat);
  mesh.castShadow = false;
  mesh.visible = false;
  scene.add(mesh);
  pieces.push({
    mesh,
    mat,
    active: false,
    vx: 0,
    vy: 0,
    vz: 0,
    ax: 0,
    ay: 0,
    az: 0,
    spinSpeed: 0,

    targetY: null,
  });
}

function rnd(a, b) {
  return a + Math.random() * (b - a);
}

function spawnPiece(p) {
  p.active = true;
  p.targetY = null;

  p.mesh.position.set(
    rnd(-SPREAD_X * 0.5, SPREAD_X * 0.5),
    rnd(SPAWN_Y * 0.7, SPAWN_Y),
    rnd(-SPREAD_Z * 0.5, SPREAD_Z * 0.5),
  );

  p.vx = rnd(-3.5, 3.5);
  p.vy = rnd(1.5, 5.5);
  p.vz = rnd(-2.5, 2.5);

  p.ax = rnd(-1, 1);
  p.ay = rnd(-1, 1);
  p.az = rnd(-1, 1);
  p.spinSpeed = rnd(2.0, 6.0);

  p.mesh.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
  );

  p.mat.opacity = 1.0;
  p.mesh.visible = true;
}

export function clearConfetti() {
  for (const p of pieces) {
    p.active = false;
    p.targetY = null;
    p.mesh.visible = false;
    p.mat.opacity = 1.0;
  }
}

export function launchConfetti() {
  pieces.forEach((p, i) => setTimeout(() => spawnPiece(p), i * 10));
}

export function updateConfetti(dt) {
  for (const p of pieces) {
    if (!p.active) continue;

    p.vy += GRAVITY * dt;
    p.vx *= DRAG;
    p.vz *= DRAG;

    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;

    const px = p.mesh.position.x;
    const py = p.mesh.position.y;
    const pz = p.mesh.position.z;

    if (p.targetY === null && p.vy < 0) {
      for (const s of SURFACES) {
        if (py > s.y && s.test(px, pz)) {
          p.targetY = s.y;
          break;
        }
      }
    }

    if (p.targetY === null) continue;

    const dist = Math.max(0, py - p.targetY);
    const spinDamp = Math.min(1, dist * 2);
    p.mesh.rotation.x += p.ax * p.spinSpeed * spinDamp * dt;
    p.mesh.rotation.y += p.ay * p.spinSpeed * spinDamp * dt;
    p.mesh.rotation.z += p.az * p.spinSpeed * spinDamp * dt;

    if (py <= p.targetY) {
      p.mesh.position.y = p.targetY;
      p.vx = p.vy = p.vz = 0;
      p.spinSpeed = 0;
      p.active = false;
    }
  }
}
