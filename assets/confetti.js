// ─────────────────────────────────────────
//  confetti.js
//  3-D confetti burst triggered on blow.
//  Flat rectangular pieces spawn above the
//  cake, fall with gravity + spin, then
//  fade out and are recycled.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

// ── Palette ───────────────────────────────
const COLORS = [
  0xff4488, // hot pink
  0xff9900, // orange
  0xffee00, // yellow
  0x44dd88, // mint
  0x44aaff, // sky blue
  0xcc44ff, // purple
  0xff6644, // coral
  0xffffff, // white
];

// ── Pool settings ─────────────────────────
const PIECE_COUNT  = 180;   // total pieces in the pool
const GRAVITY      = -4.8;  // units/s²
const DRAG         = 0.985; // velocity damping per frame
const SPREAD_X     = 7.0;   // horizontal spread radius
const SPREAD_Z     = 4.5;
const SPAWN_Y      = 9.5;   // start height (above the cake)
const FLOOR_Y      = -1.8;  // land / fade out below this

// Each piece is a thin flat box — cheap and reads well
const GEO = new THREE.BoxGeometry(0.18, 0.008, 0.11);

// One material per color, reused across all pieces of that color
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

// ── Piece state ───────────────────────────
const pieces = [];

for (let i = 0; i < PIECE_COUNT; i++) {
  const mat  = MATS[i % MATS.length].clone(); // clone so opacity is independent
  const mesh = new THREE.Mesh(GEO, mat);
  mesh.castShadow = false;
  mesh.visible    = false;
  scene.add(mesh);

  pieces.push({
    mesh,
    mat,
    active: false,
    // physics
    vx: 0, vy: 0, vz: 0,
    // spin axis + speed
    ax: 0, ay: 0, az: 0, spinSpeed: 0,
    // fade timer
    age: 0, lifetime: 0,
  });
}

// ── Spawn helpers ─────────────────────────
function rnd(min, max) {
  return min + Math.random() * (max - min);
}

function spawnPiece(p) {
  p.active   = true;
  p.age      = 0;
  p.lifetime = rnd(2.8, 5.0); // seconds before fully faded

  // Random position above cake area
  p.mesh.position.set(
    rnd(-SPREAD_X * 0.5, SPREAD_X * 0.5),
    rnd(SPAWN_Y * 0.7, SPAWN_Y),
    rnd(-SPREAD_Z * 0.5, SPREAD_Z * 0.5),
  );

  // Initial velocity — mostly outward + upward burst then gravity takes over
  p.vx = rnd(-3.5, 3.5);
  p.vy = rnd(1.5, 5.5);
  p.vz = rnd(-2.5, 2.5);

  // Random tumble axis
  p.ax = rnd(-1, 1);
  p.ay = rnd(-1, 1);
  p.az = rnd(-1, 1);
  p.spinSpeed = rnd(2.0, 6.0); // radians/s

  // Random starting rotation
  p.mesh.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
  );

  p.mat.opacity = 1.0;
  p.mesh.visible = true;
}

// ── Public API ────────────────────────────

/** Call this when the candles are blown out. */
export function launchConfetti() {
  // Stagger spawning slightly so they don't all appear the same frame
  pieces.forEach((p, i) => {
    setTimeout(() => spawnPiece(p), i * 10);
  });
}

/** Call every frame from the animation loop. dt = delta time in seconds. */
export function updateConfetti(dt) {
  for (const p of pieces) {
    if (!p.active) continue;

    p.age += dt;

    // Physics
    p.vy += GRAVITY * dt;
    p.vx *= DRAG;
    p.vz *= DRAG;

    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;

    // Spin
    p.mesh.rotation.x += p.ax * p.spinSpeed * dt;
    p.mesh.rotation.y += p.ay * p.spinSpeed * dt;
    p.mesh.rotation.z += p.az * p.spinSpeed * dt;

    // Fade out in last 30% of lifetime
    const progress = p.age / p.lifetime;
    if (progress > 0.7) {
      p.mat.opacity = 1.0 - (progress - 0.7) / 0.3;
    }

    // Recycle when done or fallen below floor
    if (p.age >= p.lifetime || p.mesh.position.y < FLOOR_Y) {
      p.active        = false;
      p.mesh.visible  = false;
      p.mat.opacity   = 1.0;
    }
  }
}
