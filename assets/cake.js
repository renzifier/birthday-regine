// ─────────────────────────────────────────
//  cake.js
//  Single-tier white cream birthday cake:
//  ruffle shell borders top + base,
//  pink ribbon bows, scattered pink hearts,
//  "happy birthday" text on top,
//  one thin white candle with gold speckles,
//  flame + smoke for animate.js.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";
import { CONFIG } from "./config.js";
import { std } from "./textures.js";
import { tableGroup } from "./table.js";

export const flameMeshes = [];
export const perFlameLights = [];
export const smokeSystems = [];

// ── Cake group ────────────────────────────
const cakeGroup = new THREE.Group();
cakeGroup.position.set(CONFIG.cake.offsetX, CONFIG.cake.tableY, 0);
tableGroup.add(cakeGroup);

function addLayer(geo, mat, y) {
  const m = new THREE.Mesh(geo, mat);
  m.position.y = y;
  m.castShadow = true;
  m.receiveShadow = true;
  cakeGroup.add(m);
  return m;
}

// ── Materials ─────────────────────────────
const creamMat = new THREE.MeshStandardMaterial({
  color: 0xfff8ee, // warm off-white cream
  roughness: 0.55,
  metalness: 0.0,
});
const creamRuffleMat = new THREE.MeshStandardMaterial({
  color: 0xfffaf2,
  roughness: 0.6,
  metalness: 0.0,
});
const plateMat = new THREE.MeshStandardMaterial({
  color: 0xf0f0f0,
  roughness: 0.12,
  metalness: 0.04,
});
const pinkMat = new THREE.MeshStandardMaterial({
  color: 0xf4a7b9,
  roughness: 0.45,
  metalness: 0.0,
});
const heartMat = new THREE.MeshStandardMaterial({
  color: 0xf08090,
  roughness: 0.5,
  metalness: 0.0,
});
const candleMat = new THREE.MeshStandardMaterial({
  color: 0xfefefe,
  roughness: 0.38,
  metalness: 0.0,
});
const ribbonMat = new THREE.MeshStandardMaterial({
  color: 0xf4afc0,
  roughness: 0.7,
  metalness: 0.0,
  side: THREE.DoubleSide,
});

// ── Cake board / plate ────────────────────
addLayer(new THREE.CylinderGeometry(1.72, 1.72, 0.08, 56), plateMat, 0.04);

// ── Main cake body ────────────────────────
// Tier: radius 1.28, height 1.4
const TIER_R = 1.28;
const TIER_H = 1.4;
const TIER_Y = 0.08 + TIER_H / 2; // sits on top of plate
addLayer(
  new THREE.CylinderGeometry(TIER_R, TIER_R, TIER_H, 56),
  creamMat,
  TIER_Y,
);

const TOP_Y = 0.08 + TIER_H; // = 1.48

// ── Top flat surface ──────────────────────
addLayer(
  new THREE.CylinderGeometry(TIER_R, TIER_R, 0.04, 56),
  creamMat,
  TOP_Y + 0.02,
);

// ── "happy birthday" text on top ──────────
// Rendered onto a canvas, applied as a texture on a thin disc
(function makeTopText() {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 512;
  const ctx = cv.getContext("2d");

  // Transparent background
  ctx.clearRect(0, 0, 512, 512);

  // Pink text — "happy birthday" in two lines, cursive style
  ctx.fillStyle = "#e8758a";
  ctx.font = "bold italic 72px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("happy", 256, 200);
  ctx.fillText("birthday", 256, 296);

  // Scatter small heart dots
  const heartPositions = [
    [90, 140],
    [420, 150],
    [130, 350],
    [390, 340],
    [200, 130],
    [320, 130],
    [80, 260],
    [440, 260],
    [170, 390],
    [340, 390],
    [256, 120],
    [256, 380],
    [110, 200],
    [400, 210],
  ];
  ctx.fillStyle = "#e8758a";
  for (const [hx, hy] of heartPositions) {
    const s = 10 + Math.random() * 8;
    // Simple heart using bezier
    ctx.save();
    ctx.translate(hx, hy);
    ctx.scale(s / 30, s / 30);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.bezierCurveTo(8, -18, 20, -10, 20, 0);
    ctx.bezierCurveTo(20, 10, 8, 20, 0, 28);
    ctx.bezierCurveTo(-8, 20, -20, 10, -20, 0);
    ctx.bezierCurveTo(-20, -10, -8, -18, 0, -8);
    ctx.fill();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(cv);
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(TIER_R - 0.01, 56),
    new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      roughness: 0.5,
      metalness: 0,
      depthWrite: false,
    }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = TOP_Y + 0.041;
  cakeGroup.add(disc);
})();

// ── Ruffle shell helper ────────────────────
// Places a ring of overlapping petal/shell shapes at a given height and radius.
// Each "shell" is a flattened hemisphere.
function addRuffleRing(radius, y, count, petalR, scaleY, angleTilt) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const px = Math.cos(a) * radius;
    const pz = Math.sin(a) * radius;

    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(
        petalR,
        10,
        8,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.55,
      ),
      creamRuffleMat,
    );
    petal.scale.set(1.0, scaleY, 1.0);
    petal.position.set(px, y, pz);
    // Face outward
    petal.rotation.y = a + Math.PI;
    if (angleTilt) petal.rotation.x = angleTilt;
    petal.castShadow = true;
    cakeGroup.add(petal);
  }
}

// ── Top ruffle border (scalloped edge around top) ────
// Two rings for fullness: outer shells and slightly inner raised shells
addRuffleRing(TIER_R - 0.04, TOP_Y + 0.04, 22, 0.21, 0.55, -0.18);
addRuffleRing(TIER_R - 0.22, TOP_Y + 0.09, 18, 0.18, 0.5, -0.25);

// ── Base ruffle border (around the bottom edge) ──────
addRuffleRing(TIER_R - 0.04, 0.08 + 0.18, 22, 0.2, 0.6, 0.18);
addRuffleRing(TIER_R - 0.22, 0.08 + 0.1, 18, 0.17, 0.55, 0.28);

// ── Pink hearts scattered on sides ────────
// Created as tiny flat heart-textured planes mapped onto the side
function addSideHearts(count) {
  const cv = document.createElement("canvas");
  cv.width = 64;
  cv.height = 64;
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = "#f08090";
  ctx.save();
  ctx.translate(32, 30);
  ctx.scale(1.1, 1.1);
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.bezierCurveTo(8, -18, 20, -10, 20, 0);
  ctx.bezierCurveTo(20, 10, 8, 20, 0, 28);
  ctx.bezierCurveTo(-8, 20, -20, 10, -20, 0);
  ctx.bezierCurveTo(-20, -10, -8, -18, 0, -8);
  ctx.fill();
  ctx.restore();
  const heartTex = new THREE.CanvasTexture(cv);

  const heartMesh = new THREE.MeshBasicMaterial({
    map: heartTex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + 0.3;
    const yOff = 0.2 + (i % 3) * 0.38;
    const hx = Math.cos(a) * (TIER_R + 0.005);
    const hz = Math.sin(a) * (TIER_R + 0.005);

    const h = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), heartMesh);
    h.position.set(hx, 0.08 + yOff, hz);
    h.rotation.y = a + Math.PI;
    cakeGroup.add(h);
  }
}
addSideHearts(16);

// ── Pink ribbon bows ──────────────────────
function addBow(a, y) {
  const bx = Math.cos(a) * (TIER_R + 0.01);
  const bz = Math.sin(a) * (TIER_R + 0.01);

  const bowGroup = new THREE.Group();
  bowGroup.position.set(bx, y, bz);
  bowGroup.rotation.y = a + Math.PI;

  // Two bow loops (left and right wing)
  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 8, 6),
      ribbonMat,
    );
    loop.scale.set(0.5, 0.32, 0.18);
    loop.position.set(side * 0.1, 0, 0);
    loop.rotation.z = side * 0.4;
    bowGroup.add(loop);
  }

  // Centre knot
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), ribbonMat);
  bowGroup.add(knot);

  // Two ribbon tails hanging down
  for (const side of [-1, 1]) {
    const pts = [
      new THREE.Vector3(side * 0.03, 0, 0),
      new THREE.Vector3(side * 0.06, -0.18, 0.02),
      new THREE.Vector3(side * 0.04, -0.36, 0.04),
    ];
    const tail = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts),
        8,
        0.012,
        4,
        false,
      ),
      ribbonMat,
    );
    bowGroup.add(tail);
  }

  cakeGroup.add(bowGroup);
}

// 6 bows evenly spaced around the side, at mid-height
const BOW_COUNT = 6;
for (let i = 0; i < BOW_COUNT; i++) {
  const angle = (i / BOW_COUNT) * Math.PI * 2;
  addBow(angle, TOP_Y - 0.05);
}

// ── Single white candle ───────────────────
// Thin, tall, slightly tilted — with gold speckle texture
(function makeCandle() {
  const cv = document.createElement("canvas");
  cv.width = 32;
  cv.height = 256;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#fefefe";
  ctx.fillRect(0, 0, 32, 256);
  // Gold speckles
  ctx.fillStyle = "rgba(200,160,40,0.7)";
  for (let i = 0; i < 28; i++) {
    const sx = Math.random() * 32;
    const sy = Math.random() * 256;
    const sr = 0.8 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(cv);

  const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.044, 1.6, 12),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0 }),
  );
  // Slightly off-centre and tilted like in the photo
  candle.position.set(0.08, TOP_Y + 0.06 + 0.8, 0.05);
  candle.rotation.z = 0.08;
  candle.castShadow = true;
  cakeGroup.add(candle);

  // ── Flame ──────────────────────────────
  const FLAME_X = 0.08 + Math.sin(0.08) * (TOP_Y + 0.06 + 1.6);
  // Approximate world-local tip position
  const flameLX = 0.08 + 0.08 * 1.4;
  const flameLY = TOP_Y + 0.06 + 1.6 + 0.12;
  const flameLZ = 0.05;

  const flOut = new THREE.Mesh(
    new THREE.SphereGeometry(0.072, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffcc22 }),
  );
  flOut.scale.set(0.55, 1.7, 0.55);
  flOut.position.set(flameLX, flameLY, flameLZ);
  cakeGroup.add(flOut);
  flameMeshes.push({ mesh: flOut, offset: 0 });

  const flIn = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffcc }),
  );
  flIn.scale.set(0.45, 1.1, 0.45);
  flIn.position.set(flameLX, flameLY - 0.02, flameLZ);
  cakeGroup.add(flIn);

  // Per-flame point light
  const flameLight = new THREE.PointLight(0xff9933, 0.55, 2.8);
  flameLight.position.set(flameLX, flameLY, flameLZ);
  cakeGroup.add(flameLight);
  perFlameLights.push({ light: flameLight, offset: 0 });

  // Smoke
  const tgScale = tableGroup.scale.x;
  const SMOKE_COUNT = 18;
  const smokeGeo = new THREE.BufferGeometry();
  const smokePos = new Float32Array(SMOKE_COUNT * 3);
  const smokeBase = {
    x: (CONFIG.cake.offsetX + flameLX) * tgScale,
    y: (CONFIG.cake.tableY + flameLY + 0.05) * tgScale,
    z: flameLZ * tgScale,
  };
  for (let sp = 0; sp < SMOKE_COUNT; sp++) {
    smokePos[sp * 3] = smokeBase.x + (Math.random() - 0.5) * 0.04;
    smokePos[sp * 3 + 1] = smokeBase.y + sp * 0.06;
    smokePos[sp * 3 + 2] = smokeBase.z + (Math.random() - 0.5) * 0.04;
  }
  smokeGeo.setAttribute("position", new THREE.BufferAttribute(smokePos, 3));
  const smokePoints = new THREE.Points(
    smokeGeo,
    new THREE.PointsMaterial({
      color: 0xfff0e8,
      size: 0.028,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  );
  scene.add(smokePoints);
  smokeSystems.push({
    pts: smokePoints,
    geo: smokeGeo,
    base: smokeBase,
    phase: Math.random() * 0.8,
  });
})();
