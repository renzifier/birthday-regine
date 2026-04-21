// ─────────────────────────────────────────
//  table.js
//  Tablecloth-covered table: top, four
//  drapes (now with thickness), hem border,
//  legs, cross-bars.
//  Exports tableGroup so other modules
//  can place objects on the table.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";
import { std, getClothMat } from "./textures.js";

export const tableGroup = new THREE.Group();
tableGroup.scale.set(1.8, 1.8, 1.8);
scene.add(tableGroup);

// ── Top surface ───────────────────────────
const hiddenFaceMat = new THREE.MeshStandardMaterial({
  color: 0x3a2510,
  roughness: 0.9,
  metalness: 0,
});
const topFaceMat = getClothMat([2.4, 1.64], false);

const tabletop = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.18, 6.5), [
  hiddenFaceMat,
  hiddenFaceMat,
  topFaceMat,
  hiddenFaceMat,
  hiddenFaceMat,
  hiddenFaceMat,
]);
tabletop.position.y = 0.28;
tabletop.receiveShadow = true;
tabletop.castShadow = true;
tableGroup.add(tabletop);

// ── Drapes — BoxGeometry so sides & bottom are solid ──
const DRAPE_H = 1.72;
const DRAPE_T = 0.045; // cloth thickness
const DRAPE_Y = 0.37 - DRAPE_H / 2;

// Each drape: { w, depth, px, pz, repeat }
const drapeConfigs = [
  // front
  { w: 9.5, d: DRAPE_T, px: 0, pz: 3.26, repeat: [2.4, 0.7] },
  // back
  { w: 9.5, d: DRAPE_T, px: 0, pz: -3.26, repeat: [2.4, 0.7] },
  // left  (depth becomes width along Z, width along X)
  { w: DRAPE_T, d: 6.5, px: -4.76, pz: 0, repeat: [1.6, 0.7] },
  // right
  { w: DRAPE_T, d: 6.5, px: 4.76, pz: 0, repeat: [1.6, 0.7] },
];

// We'll use a 6-material box: +x, -x, +y(top), -y(bottom), +z(front face), -z(back face)
// For front/back drapes the cloth face is +z or -z; for side drapes it's +x or -x.
for (const { w, d, px, pz, repeat } of drapeConfigs) {
  const clothFace = getClothMat(repeat, false);
  const clothBack = getClothMat(repeat, false);
  const edge = std(0xf0e8d8, 0.7, 0.0); // soft cream edge

  // [+x, -x, +y, -y, +z, -z]
  const mats = [edge, edge, edge, edge, clothFace, clothBack];

  const drape = new THREE.Mesh(new THREE.BoxGeometry(w, DRAPE_H, d), mats);
  drape.position.set(px, DRAPE_Y, pz);
  drape.receiveShadow = true;
  drape.castShadow = true;
  tableGroup.add(drape);
}

// ── Hem border — solid strip around bottom edge ───────
const HEM_H = 0.1;
const HEM_T = 0.06;
const HEM_Y = 0.37 - DRAPE_H + HEM_H * 0.5;
const hemMat = getClothMat([2.4, 0.12], false);
const hemEdge = std(0xe8dcc8, 0.65, 0.0);

const hemConfigs = [
  // front
  { w: 9.5 + HEM_T * 2, d: HEM_T, px: 0, pz: 3.26 + DRAPE_T * 0.5 },
  // back
  { w: 9.5 + HEM_T * 2, d: HEM_T, px: 0, pz: -3.26 - DRAPE_T * 0.5 },
  // left
  { w: HEM_T, d: 6.5, px: -4.76 - DRAPE_T * 0.5, pz: 0 },
  // right
  { w: HEM_T, d: 6.5, px: 4.76 + DRAPE_T * 0.5, pz: 0 },
];

for (const { w, d, px, pz } of hemConfigs) {
  const hem = new THREE.Mesh(new THREE.BoxGeometry(w, HEM_H, d), [
    hemEdge,
    hemEdge,
    hemMat,
    hemMat,
    hemEdge,
    hemEdge,
  ]);
  hem.position.set(px, HEM_Y, pz);
  hem.receiveShadow = true;
  tableGroup.add(hem);
}

// ── Legs + cross-bars ─────────────────────
const legMat = std(0xfefefe, 0.25, 0.02);

for (let i = 0; i < 4; i++) {
  const lx = i < 2 ? -4.5 : 4.5;
  const lz = i % 2 === 0 ? -3.1 : 3.1;
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.25, 0.22), legMat);
  leg.position.set(lx, -0.87, lz);
  leg.castShadow = true;
  tableGroup.add(leg);
}
for (const sz of [-3.1, 3.1]) {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.09, 0.09), legMat);
  bar.position.set(0, -1.52, sz);
  tableGroup.add(bar);
}
