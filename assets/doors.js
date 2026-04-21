// ─────────────────────────────────────────
//  doors.js — double open doors behind
//  the table, framing the city view.
//  Inspired by the reference image.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

const FRAME_W = 7.2;
const FRAME_H = 10.0;
const FRAME_T = 0.22;  // frame thickness
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
    new THREE.MeshStandardMaterial({ color: 0xd4c090, roughness: 0.15, metalness: 0.7 }),
  );
  grp.add(knob);

  return grp;
}

// ── Left door — hinged at left, swings toward camera-left ──
const halfW = FRAME_W / 2;
const leftPivot = new THREE.Group();
leftPivot.position.set(-halfW / 2, FRAME_H / 2, 0);
const leftPanel = makeDoorPanel(halfW);
leftPanel.position.set(halfW / 4, 0, 0);           // hinge at panel's left edge
leftPanel.children[leftPanel.children.length - 1]  // knob
  .position.set(halfW * 0.38, 0, 0.1);
leftPivot.add(leftPanel);
leftPivot.rotation.y = -Math.PI * 0.36;            // open ~65°
doorGroup.add(leftPivot);

// ── Right door — hinged at right, swings toward camera-right ──
const rightPivot = new THREE.Group();
rightPivot.position.set(halfW / 2, FRAME_H / 2, 0);
const rightPanel = makeDoorPanel(halfW);
rightPanel.position.set(-halfW / 4, 0, 0);          // hinge at panel's right edge
rightPanel.children[rightPanel.children.length - 1] // knob
  .position.set(-halfW * 0.38, 0, 0.1);
rightPivot.add(rightPanel);
rightPivot.rotation.y = Math.PI * 0.36;
doorGroup.add(rightPivot);

// ── Shadows ───────────────────────────────
doorGroup.traverse((obj) => {
  if (obj.isMesh) {
    obj.castShadow = true;
    obj.receiveShadow = true;
  }
});

// ── Light spilling through the doorway ────
// Cool blue-white spotlight aimed at the floor in front of the table
const doorSpot = new THREE.SpotLight(0x88aadd, 4.0, 35, Math.PI * 0.22, 0.5, 1.2);
doorSpot.position.set(0, FLOOR_Y + FRAME_H * 0.72, -8.5);
doorSpot.target.position.set(0, FLOOR_Y + 0.1, 8);
doorSpot.castShadow = false; // keep perf light
scene.add(doorSpot);
scene.add(doorSpot.target);
