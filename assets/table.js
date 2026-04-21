// ─────────────────────────────────────────
//  table.js
//  Tablecloth-covered table: top, four
//  drapes, hem shadows, legs, cross-bars.
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

// ── Drapes (four sides) ───────────────────
const DRAPE_H = 1.72;
const DRAPE_Y = 0.37 - DRAPE_H / 2;

const drapeConfigs = [
  { w: 9.5, pos: [0, DRAPE_Y, 3.26], rotY: 0, repeat: [2.4, 0.7] },
  { w: 9.5, pos: [0, DRAPE_Y, -3.26], rotY: Math.PI, repeat: [2.4, 0.7] },
  { w: 6.5, pos: [-4.76, DRAPE_Y, 0], rotY: Math.PI / 2, repeat: [1.6, 0.7] },
  { w: 6.5, pos: [4.76, DRAPE_Y, 0], rotY: -Math.PI / 2, repeat: [1.6, 0.7] },
];
for (const { w, pos, rotY, repeat } of drapeConfigs) {
  const drape = new THREE.Mesh(
    new THREE.PlaneGeometry(w, DRAPE_H),
    getClothMat(repeat, true),
  );
  drape.position.set(...pos);
  drape.rotation.y = rotY;
  drape.receiveShadow = true;
  drape.castShadow = true;
  tableGroup.add(drape);
}

// ── Hem shadow strips ─────────────────────
const hemMat = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.07,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const HEM_Y = 0.37 - DRAPE_H + 0.06;
const hemConfigs = [
  { pos: [0, HEM_Y, 3.265], rot: [0, 0, 0], w: 9.5 },
  { pos: [0, HEM_Y, -3.265], rot: [0, Math.PI, 0], w: 9.5 },
  { pos: [-4.765, HEM_Y, 0], rot: [0, Math.PI / 2, 0], w: 6.5 },
  { pos: [4.765, HEM_Y, 0], rot: [0, -Math.PI / 2, 0], w: 6.5 },
];
for (const { pos, rot, w } of hemConfigs) {
  const hem = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.18), hemMat);
  hem.position.set(...pos);
  hem.rotation.set(...rot);
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
