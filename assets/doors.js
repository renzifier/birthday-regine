// ─────────────────────────────────────────
//  doors.js — double open doors behind
//  the table, framing the city view.
//  Inspired by the reference image.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

const FRAME_W = 7.2;
const FRAME_H = 10.0;
const FRAME_T = 0.22; // frame thickness
const FLOOR_Y = -2.2;

const doorGroup = new THREE.Group();
doorGroup.position.set(0, FLOOR_Y, -9);
scene.add(doorGroup);

// ── Materials ──────────────────────────────
const frameMat = new THREE.MeshStandardMaterial({
  color: 0xb8ccd8,
  roughness: 0.28,
  metalness: 0.06,
});
const doorMat = new THREE.MeshStandardMaterial({
  color: 0xaabfce,
  roughness: 0.32,
  metalness: 0.04,
});
const panelRecessMat = new THREE.MeshStandardMaterial({
  color: 0x96aebb,
  roughness: 0.4,
  metalness: 0.0,
});

// ── Door frame ────────────────────────────
// Top bar
const topBar = new THREE.Mesh(
  new THREE.BoxGeometry(FRAME_W + FRAME_T * 2, FRAME_T, FRAME_T * 1.5),
  frameMat,
);
topBar.position.set(0, FRAME_H, 0);
doorGroup.add(topBar);

// Left post
const leftPost = new THREE.Mesh(
  new THREE.BoxGeometry(FRAME_T, FRAME_H + FRAME_T, FRAME_T * 1.5),
  frameMat,
);
leftPost.position.set(-FRAME_W / 2 - FRAME_T / 2, FRAME_H / 2, 0);
doorGroup.add(leftPost);

// Right post
const rightPost = new THREE.Mesh(
  new THREE.BoxGeometry(FRAME_T, FRAME_H + FRAME_T, FRAME_T * 1.5),
  frameMat,
);
rightPost.position.set(FRAME_W / 2 + FRAME_T / 2, FRAME_H / 2, 0);
doorGroup.add(rightPost);

// Centre divider (the bit between the two doors)
const centreDiv = new THREE.Mesh(
  new THREE.BoxGeometry(FRAME_T * 0.7, FRAME_H, FRAME_T),
  frameMat,
);
centreDiv.position.set(0, FRAME_H / 2, 0);
doorGroup.add(centreDiv);

// ── Helper: build one door panel with moulding ──
function makeDoorPanel(halfW) {
  const grp = new THREE.Group();

  // Main slab
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(halfW - 0.04, FRAME_H - 0.04, 0.1),
    doorMat,
  );
  grp.add(slab);

  // Upper raised panel
  const upPanel = new THREE.Mesh(
    new THREE.BoxGeometry(halfW - 0.65, FRAME_H * 0.36, 0.035),
    panelRecessMat,
  );
  upPanel.position.set(0, FRAME_H * 0.21, 0.07);
  grp.add(upPanel);

  // Lower raised panel
  const loPanel = new THREE.Mesh(
    new THREE.BoxGeometry(halfW - 0.65, FRAME_H * 0.36, 0.035),
    panelRecessMat,
  );
  loPanel.position.set(0, -FRAME_H * 0.14, 0.07);
  grp.add(loPanel);

  // Door knob
  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xd4c090,
      roughness: 0.15,
      metalness: 0.7,
    }),
  );
  grp.add(knob);

  return grp;
}

// ── Left door — hinge at far-left edge (x = -halfW), right side swings open ──
const halfW = FRAME_W / 2;
const leftPivot = new THREE.Group();
leftPivot.position.set(-halfW, FRAME_H / 2, 0); // pivot sits on the left post
const leftPanel = makeDoorPanel(halfW);
leftPanel.position.set(halfW / 2, 0, 0); // shift panel right so its left edge is at pivot
leftPanel.children[leftPanel.children.length - 1].position // knob on the right (opening) side
  .set(halfW * 0.42, 0, 0.1);
leftPivot.add(leftPanel);
leftPivot.rotation.y = Math.PI * 0.36; // swing right side toward camera (+Y opens toward viewer)
doorGroup.add(leftPivot);

// ── Right door — hinge at far-right edge (x = +halfW), left side swings open ──
const rightPivot = new THREE.Group();
rightPivot.position.set(halfW, FRAME_H / 2, 0); // pivot sits on the right post
const rightPanel = makeDoorPanel(halfW);
rightPanel.position.set(-halfW / 2, 0, 0); // shift panel left so its right edge is at pivot
rightPanel.children[rightPanel.children.length - 1].position // knob on the left (opening) side
  .set(-halfW * 0.42, 0, 0.1);
rightPivot.add(rightPanel);
rightPivot.rotation.y = -Math.PI * 0.36; // swing left side toward camera (-Y opens toward viewer)
doorGroup.add(rightPivot);

// ── Shadows ───────────────────────────────
doorGroup.traverse((obj) => {
  if (obj.isMesh) {
    obj.castShadow = true;
    obj.receiveShadow = true;
  }
});

// ── Dramatic light beam through the doorway ───────────────────────────────

// 1. Tight bright core beam — narrow cone, high intensity, hits floor centre
const beamCore = new THREE.SpotLight(
  0xffcc88,
  18.0,
  40,
  Math.PI * 0.1,
  0.0,
  1.4,
);
beamCore.position.set(0, FLOOR_Y + FRAME_H * 0.85, -8.6);
beamCore.target.position.set(0, FLOOR_Y, 6);
beamCore.castShadow = false;
scene.add(beamCore);
scene.add(beamCore.target);

// 2. Wide soft halo around the core — same direction, broader cone, softer falloff
const beamHalo = new THREE.SpotLight(
  0xffaa55,
  10.0,
  38,
  Math.PI * 0.22,
  0.6,
  1.6,
);
beamHalo.position.set(0, FLOOR_Y + FRAME_H * 0.85, -8.6);
beamHalo.target.position.set(0, FLOOR_Y, 5);
beamHalo.castShadow = false;
scene.add(beamHalo);
scene.add(beamHalo.target);

// 3. Floor-level point light at the bright landing spot — bounces light back up
//    giving the floor that glowing pool look from the reference
const floorPool = new THREE.PointLight(0xff9944, 6.0, 10);
floorPool.position.set(0, FLOOR_Y + 0.08, 2);
scene.add(floorPool);

// 4. Volumetric-style beam mesh — a long tapered cone of semi-transparent
//    blue-white material stretching from the doorway to the floor, giving the
//    "shaft of light" illusion even without real volumetrics
const beamGeo = new THREE.CylinderGeometry(0.18, 3.8, 14, 16, 1, true);
const beamMat = new THREE.MeshBasicMaterial({
  color: 0xffdd99,
  transparent: true,
  opacity: 0.045,
  side: THREE.BackSide,
  depthWrite: false,
});
const beamMesh = new THREE.Mesh(beamGeo, beamMat);
// Position so the narrow top sits at the doorway opening, wide base on the floor
beamMesh.position.set(0, FLOOR_Y + 7.8, -2.2);
beamMesh.rotation.x = 0.18; // slight tilt toward camera matching spotlight angle
scene.add(beamMesh);

// Second beam layer — slightly wider, even more transparent, for soft glow fringe
const beamGeo2 = new THREE.CylinderGeometry(0.4, 5.5, 15, 16, 1, true);
const beamMat2 = new THREE.MeshBasicMaterial({
  color: 0xffbb77,
  transparent: true,
  opacity: 0.022,
  side: THREE.BackSide,
  depthWrite: false,
});
const beamMesh2 = new THREE.Mesh(beamGeo2, beamMat2);
beamMesh2.position.set(0, FLOOR_Y + 7.8, -2.2);
beamMesh2.rotation.x = 0.18;
scene.add(beamMesh2);
