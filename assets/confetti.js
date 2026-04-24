// ─────────────────────────────────────────
//  confetti.js
//  3-D confetti burst triggered on blow.
//  Pieces fall under gravity and land on
//  the FIRST surface they descend into —
//  cake top, table cloth, or floor.
//  Once landed they stay visible forever.
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

// ── Pool / physics constants ──────────────
const PIECE_COUNT = 180;
const GRAVITY = -4.8; // units / s²
const DRAG = 0.985; // per-frame horizontal damping
const SPREAD_X = 7.0;
const SPREAD_Z = 4.5;
const SPAWN_Y = 9.5;

// ── Surface stack (highest → lowest) ─────
// Each surface: { y, test(x,z) → bool }
// A piece locks onto the FIRST surface whose
// test() returns true when the piece is still
// ABOVE that surface and then crosses it.
//
// Cake estimate (tableGroup scale 1.8):
//   - cake sits on table cloth ≈ y 0.67
//   - typical 3-tier cake radius ≈ 1.0 world units
//   - cake top ≈ y 4.5 (rough mid estimate; adjust if you know exact)
//   Table cloth: y 0.67, half-extents 8.55 × 5.85
//   Floor: y -1.8, catches everything

const SURFACES = [
  {
    label: "cake",
    y: 4.5,
    test: (x, z) => x * x + z * z < 1.1 * 1.1, // cylinder radius ~1.1
  },
  {
    label: "table",
    y: 0.67,
    test: (x, z) => Math.abs(x) <= 8.55 && Math.abs(z) <= 5.85,
  },
  {
    label: "floor",
    y: -1.8,
    test: () => true, // catch-all
  },
];

// ── Geometry / materials ──────────────────
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

// ── Piece pool ────────────────────────────
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
    // The Y this piece will land on — resolved the first time it
    // descends into a surface's test zone while still above it.
    targetY: null,
  });
}

// ── Helpers ───────────────────────────────
function rnd(a, b) {
  return a + Math.random() * (b - a);
}

function spawnPiece(p) {
  p.active = true;
  p.targetY = null; // not yet committed to any surface

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

// ── Public API ────────────────────────────

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

    // ── Physics ───────────────────────────
    p.vy += GRAVITY * dt;
    p.vx *= DRAG;
    p.vz *= DRAG;

    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;

    const px = p.mesh.position.x;
    const py = p.mesh.position.y;
    const pz = p.mesh.position.z;

    // ── Surface commitment ────────────────
    // Walk surfaces top→bottom. The first surface whose test zone the
    // piece is currently inside AND whose Y is below the piece locks in
    // as this piece's target. Once committed, it never changes — the
    // piece will land exactly where it first "flew over".
    if (p.targetY === null && p.vy < 0) {
      for (const s of SURFACES) {
        if (py > s.y && s.test(px, pz)) {
          p.targetY = s.y;
          break;
        }
      }
    }

    // If still no surface (piece still rising or hasn't entered any zone),
    // keep simulating without a target yet.
    if (p.targetY === null) continue;

    // ── Spin damp as it approaches ────────
    const dist = Math.max(0, py - p.targetY);
    const spinDamp = Math.min(1, dist * 2);
    p.mesh.rotation.x += p.ax * p.spinSpeed * spinDamp * dt;
    p.mesh.rotation.y += p.ay * p.spinSpeed * spinDamp * dt;
    p.mesh.rotation.z += p.az * p.spinSpeed * spinDamp * dt;

    // ── Land ──────────────────────────────
    if (py <= p.targetY) {
      p.mesh.position.y = p.targetY;
      p.vx = p.vy = p.vz = 0;
      p.spinSpeed = 0;
      p.active = false; // physics done — mesh stays visible
    }
  }
}
