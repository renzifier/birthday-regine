// ─────────────────────────────────────────
//  table.js
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

// ── Drapes — double-sided planes (cloth both sides) ──
const DRAPE_H = 1.05; // shortened so legs are visible below
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
    getClothMat(repeat, true), // true = DoubleSide
  );
  drape.position.set(...pos);
  drape.rotation.y = rotY;
  drape.receiveShadow = true;
  drape.castShadow = true;
  tableGroup.add(drape);
}

// ── Hem — thin box strip at the bottom of each drape ──
// Gives the cloth a visible finished edge from any angle.
const HEM_H = 0.09;
const HEM_D = 0.05;
const HEM_Y = 0.37 - DRAPE_H + HEM_H * 0.5;
const hemCloth = getClothMat([2.4, 0.08], true);

const hemConfigs = [
  { w: 9.56, d: HEM_D, px: 0, pz: 3.26, rotY: 0 },
  { w: 9.56, d: HEM_D, px: 0, pz: -3.26, rotY: 0 },
  { w: HEM_D, d: 6.56, px: -4.76, pz: 0, rotY: 0 },
  { w: HEM_D, d: 6.56, px: 4.76, pz: 0, rotY: 0 },
];

for (const { w, d, px, pz } of hemConfigs) {
  // cloth on all visible faces
  const hem = new THREE.Mesh(new THREE.BoxGeometry(w, HEM_H, d), hemCloth);
  hem.position.set(px, HEM_Y, pz);
  hem.receiveShadow = true;
  tableGroup.add(hem);
}

// ── Legs + cross-bars ─────────────────────
const legMat = std(0x8a6040, 0.5, 0.02); // warm wood legs

for (let i = 0; i < 4; i++) {
  const lx = i < 2 ? -4.5 : 4.5;
  const lz = i % 2 === 0 ? -3.1 : 3.1;
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.6, 0.28), legMat);
  leg.position.set(lx, -1.02, lz);
  leg.castShadow = true;
  tableGroup.add(leg);
}
for (const sz of [-3.1, 3.1]) {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.09, 0.09), legMat);
  bar.position.set(0, -1.52, sz);
  tableGroup.add(bar);
}
