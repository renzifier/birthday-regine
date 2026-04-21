// ─────────────────────────────────────────
//  cake.js
//  Two-tier birthday cake: chocolate layers,
//  icing, drips, swirls, berries, pearls,
//  candles with flames and smoke.
//  Exports flameMeshes / perFlameLights /
//  smokeSystems so animate.js can update
//  them every frame.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";
import { CONFIG } from "./config.js";
import { std, makeRoughnessMap, makeCandleTex } from "./textures.js";
import { tableGroup } from "./table.js";

export const flameMeshes = [];
export const perFlameLights = [];
export const smokeSystems = [];

// ── Cake group ────────────────────────────
const cakeGroup = new THREE.Group();
cakeGroup.position.set(CONFIG.cake.offsetX, CONFIG.cake.tableY, 0);
tableGroup.add(cakeGroup);

/** Shorthand: add a mesh at height y inside cakeGroup. */
function addLayer(geo, mat, y) {
  const m = new THREE.Mesh(geo, mat);
  m.position.y = y;
  m.castShadow = true;
  m.receiveShadow = true;
  cakeGroup.add(m);
  return m;
}

// ── Shared materials ──────────────────────
const icingRoughMap = makeRoughnessMap();
const chocoMat = std(0xe8a040, 0.75, 0.0);
const icingMat = new THREE.MeshStandardMaterial({
  color: 0xff5588,
  roughness: 0.2,
  metalness: 0,
  roughnessMap: icingRoughMap,
});
const frostMat = new THREE.MeshStandardMaterial({
  color: 0xff4477,
  roughness: 0.22,
  metalness: 0,
  roughnessMap: icingRoughMap,
});
const plateMat = std(0xf8f8f8, 0.04, 0.06);
const swirlMat = std(0xfff8f0, 0.28, 0.0);
const pearlMat = std(0xf8f8ff, 0.05, 0.1);
const dripBodyMat = new THREE.MeshStandardMaterial({
  color: 0xff4477,
  roughness: 0.14,
  metalness: 0,
  roughnessMap: icingRoughMap,
});
const dripBlobMat = std(0xff4477, 0.06, 0.0);
const berryRedMat = std(0xcc1133, 0.18, 0.0);
const berryGreenMat = std(0x228822, 0.45, 0.0);
const seedMat = std(0xffee44, 0.4, 0.0);
const waxMat = std(0xfff8f0, 0.55, 0.0);
const spongeLayerMat = std(0xfff0d8, 0.6, 0.0);
const jamLayerMat = std(0xff7733, 0.4, 0.0);

// ── Helper: icing drips around a tier ────
function addDrips(radius, baseY, count, angleOffset) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + angleOffset;
    const dH = 0.2 + Math.random() * 0.26;
    const cx = Math.cos(a) * radius;
    const cz = Math.sin(a) * radius;

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.02, dH, 8),
      dripBodyMat,
    );
    body.position.set(cx, baseY - dH * 0.5, cz);
    cakeGroup.add(body);

    const blob = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 8, 8),
      dripBlobMat,
    );
    blob.position.set(cx, baseY - dH, cz);
    cakeGroup.add(blob);
  }
}

// ── Tier 1 ───────────────────────────────
addLayer(new THREE.CylinderGeometry(1.78, 1.78, 0.11, 56), plateMat, 0.055);
addLayer(new THREE.CylinderGeometry(1.4, 1.4, 1.0, 56), chocoMat, 0.61);
addLayer(new THREE.CylinderGeometry(1.45, 1.45, 0.2, 56), icingMat, 0.61);
addLayer(
  new THREE.CylinderGeometry(1.38, 1.38, 0.055, 56),
  spongeLayerMat,
  0.61,
);
addLayer(new THREE.CylinderGeometry(1.38, 1.38, 0.025, 56), jamLayerMat, 0.655);
addDrips(1.45, 0.51, 15, 0.18);

// ── Tier 2 ───────────────────────────────
addLayer(new THREE.CylinderGeometry(1.13, 1.13, 0.9, 56), chocoMat, 1.56);
addLayer(new THREE.CylinderGeometry(1.18, 1.18, 0.18, 56), icingMat, 1.56);
addLayer(
  new THREE.CylinderGeometry(1.11, 1.11, 0.05, 56),
  spongeLayerMat,
  1.56,
);
addLayer(new THREE.CylinderGeometry(1.11, 1.11, 0.022, 56), jamLayerMat, 1.6);
addDrips(1.18, 1.47, 12, 0.52);

// ── Top frost ─────────────────────────────
addLayer(new THREE.CylinderGeometry(1.14, 1.14, 0.07, 56), frostMat, 2.045);

// ── Cream swirls ──────────────────────────
for (let i = 0; i < 14; i++) {
  const a = (i / 14) * Math.PI * 2;
  const swirl = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 10, 10),
    swirlMat,
  );
  swirl.scale.y = 1.6;
  swirl.position.set(Math.cos(a) * 0.95, 2.11, Math.sin(a) * 0.95);
  swirl.castShadow = true;
  cakeGroup.add(swirl);
}

// ── Strawberries ──────────────────────────
const berryData = [
  [0, 0, 0.21],
  [0.28, 0.06, 0.19],
  [-0.22, 0.15, 0.17],
  [0.06, -0.28, 0.2],
  [0.2, -0.16, 0.18],
];
for (const [bx, bz, br] of berryData) {
  const berry = new THREE.Mesh(
    new THREE.SphereGeometry(br, 12, 12),
    berryRedMat,
  );
  berry.scale.y = 1.28;
  berry.position.set(bx, 2.2, bz);
  berry.castShadow = true;
  cakeGroup.add(berry);

  for (let s = 0; s < 6; s++) {
    const sa = (s / 6) * Math.PI * 2;
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.016, 4, 4), seedMat);
    seed.position.set(
      bx + Math.cos(sa) * br * 0.85,
      2.2 + Math.sin(sa) * 0.07,
      bz + Math.sin(sa) * br * 0.85,
    );
    cakeGroup.add(seed);
  }

  const leaf = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 6, 6),
    berryGreenMat,
  );
  leaf.scale.y = 0.35;
  leaf.position.set(bx, 2.2 + br * 1.15, bz);
  cakeGroup.add(leaf);
}

// ── Pearl border ──────────────────────────
for (let i = 0; i < 26; i++) {
  const a = (i / 26) * Math.PI * 2;
  const pearl = new THREE.Mesh(
    new THREE.SphereGeometry(0.072, 10, 10),
    pearlMat,
  );
  pearl.position.set(Math.cos(a) * 1.65, 0.12, Math.sin(a) * 1.65);
  cakeGroup.add(pearl);
}

// ── Candles ───────────────────────────────
const CANDLE_STRIPES = [
  ["#ffffff", "#ff99bb"],
  ["#ffbbdd", "#ffffff"],
  ["#ffffff", "#ff77aa"],
];

for (let ci = 0; ci < 3; ci++) {
  const ang = (ci / 3) * Math.PI * 2;
  const cfx = Math.cos(ang) * 0.44;
  const cfz = Math.sin(ang) * 0.44;

  // Candle body
  const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.065, 1.35, 14),
    new THREE.MeshStandardMaterial({
      map: makeCandleTex(...CANDLE_STRIPES[ci]),
      roughness: 0.45,
      metalness: 0,
    }),
  );
  candle.position.set(cfx, 2.79, cfz);
  candle.castShadow = true;
  cakeGroup.add(candle);

  // Wax drips (2 per candle)
  for (let wd = 0; wd < 2; wd++) {
    const wdA = ang + (wd === 0 ? 0.4 : -0.5);
    const wdH = 0.18 + Math.random() * 0.14;
    const wx = cfx + Math.cos(wdA) * 0.058;
    const wz = cfz + Math.sin(wdA) * 0.058;

    const wdrop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.008, wdH, 6),
      waxMat,
    );
    wdrop.position.set(wx, 2.79 + 0.3 - wdH * 0.5, wz);
    cakeGroup.add(wdrop);

    const wblob = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), waxMat);
    wblob.position.set(wx, 2.79 + 0.3 - wdH, wz);
    cakeGroup.add(wblob);
  }

  // Decorative ring at candle base
  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(0.082, 0.082, 0.065, 14),
    std(0xff99bb, 0.3),
  );
  ring.position.set(cfx, 2.13, cfz);
  cakeGroup.add(ring);

  // Outer flame
  const flOut = new THREE.Mesh(
    new THREE.SphereGeometry(0.088, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffcc22 }),
  );
  flOut.scale.set(0.62, 1.8, 0.62);
  flOut.position.set(cfx, 3.57, cfz);
  cakeGroup.add(flOut);
  flameMeshes.push({ mesh: flOut, offset: ci * 2.1 });

  // Inner bright core
  const flIn = new THREE.Mesh(
    new THREE.SphereGeometry(0.048, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffcc }),
  );
  flIn.scale.set(0.5, 1.2, 0.5);
  flIn.position.set(cfx, 3.54, cfz);
  cakeGroup.add(flIn);

  // Per-flame light — added to cakeGroup so it moves with the cake
  const flameLight = new THREE.PointLight(0xff9933, 0.5, 2.5);
  flameLight.position.set(cfx, 3.57, cfz);
  cakeGroup.add(flameLight);
  perFlameLights.push({ light: flameLight, offset: ci * 2.1 });

  // Smoke particle system
  const SMOKE_COUNT = 18;
  const smokeGeo = new THREE.BufferGeometry();
  const smokePos = new Float32Array(SMOKE_COUNT * 3);
  const smokeBase = { x: -0.5 + cfx, y: 0.37 + 3.62, z: cfz };

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
  // Random phase offset makes each candle's smoke look independent
  smokeSystems.push({
    pts: smokePoints,
    geo: smokeGeo,
    base: smokeBase,
    phase: ci * 1.3 + Math.random() * 0.8,
  });
}
