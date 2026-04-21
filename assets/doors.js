// ─────────────────────────────────────────
//  doors.js — double open doors behind
//  the table, framing the city view.
//  Cool blue-white beam matching reference.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

const FRAME_W = 4.5;
const FRAME_H = 6.5;
const FRAME_T = 0.18;
const FLOOR_Y = -2.0;

const doorGroup = new THREE.Group();
doorGroup.position.set(0, FLOOR_Y, -19);
scene.add(doorGroup);

// ── Materials — cool blue-grey to match reference ──
const frameMat = new THREE.MeshStandardMaterial({
  color: 0xc8d8e8,
  roughness: 0.22,
  metalness: 0.08,
  emissive: 0x1a2a3a,
  emissiveIntensity: 0.15,
});
const doorMat = new THREE.MeshStandardMaterial({
  color: 0xb0c8d8,
  roughness: 0.28,
  metalness: 0.05,
  emissive: 0x0a1a2a,
  emissiveIntensity: 0.1,
});
const panelRecessMat = new THREE.MeshStandardMaterial({
  color: 0x8aaabb,
  roughness: 0.38,
  metalness: 0.0,
});

// ── Door frame ────────────────────────────
const topBar = new THREE.Mesh(
  new THREE.BoxGeometry(FRAME_W + FRAME_T * 2, FRAME_T, FRAME_T * 1.5),
  frameMat,
);
topBar.position.set(0, FRAME_H, 0);
doorGroup.add(topBar);

const leftPost = new THREE.Mesh(
  new THREE.BoxGeometry(FRAME_T, FRAME_H + FRAME_T, FRAME_T * 1.5),
  frameMat,
);
leftPost.position.set(-FRAME_W / 2 - FRAME_T / 2, FRAME_H / 2, 0);
doorGroup.add(leftPost);

const rightPost = new THREE.Mesh(
  new THREE.BoxGeometry(FRAME_T, FRAME_H + FRAME_T, FRAME_T * 1.5),
  frameMat,
);
rightPost.position.set(FRAME_W / 2 + FRAME_T / 2, FRAME_H / 2, 0);
doorGroup.add(rightPost);

const centreDiv = new THREE.Mesh(
  new THREE.BoxGeometry(FRAME_T * 0.7, FRAME_H, FRAME_T),
  frameMat,
);
centreDiv.position.set(0, FRAME_H / 2, 0);
doorGroup.add(centreDiv);

// ── Helper: build one door panel ──
function makeDoorPanel(halfW) {
  const grp = new THREE.Group();

  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(halfW - 0.04, FRAME_H - 0.04, 0.1),
    doorMat,
  );
  grp.add(slab);

  const upPanel = new THREE.Mesh(
    new THREE.BoxGeometry(halfW - 0.65, FRAME_H * 0.36, 0.035),
    panelRecessMat,
  );
  upPanel.position.set(0, FRAME_H * 0.21, 0.07);
  grp.add(upPanel);

  const loPanel = new THREE.Mesh(
    new THREE.BoxGeometry(halfW - 0.65, FRAME_H * 0.36, 0.035),
    panelRecessMat,
  );
  loPanel.position.set(0, -FRAME_H * 0.14, 0.07);
  grp.add(loPanel);

  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xd0dde8,
      roughness: 0.1,
      metalness: 0.8,
    }),
  );
  grp.add(knob);

  return grp;
}

const halfW = FRAME_W / 2;

const leftPivot = new THREE.Group();
leftPivot.position.set(-halfW, FRAME_H / 2, 0);
const leftPanel = makeDoorPanel(halfW);
leftPanel.position.set(halfW / 2, 0, 0);
leftPanel.children[leftPanel.children.length - 1].position.set(
  halfW * 0.42,
  0,
  0.1,
);
leftPivot.add(leftPanel);
leftPivot.rotation.y = Math.PI * 0.36;
doorGroup.add(leftPivot);

const rightPivot = new THREE.Group();
rightPivot.position.set(halfW, FRAME_H / 2, 0);
const rightPanel = makeDoorPanel(halfW);
rightPanel.position.set(-halfW / 2, 0, 0);
rightPanel.children[rightPanel.children.length - 1].position.set(
  -halfW * 0.42,
  0,
  0.1,
);
rightPivot.add(rightPanel);
rightPivot.rotation.y = -Math.PI * 0.36;
doorGroup.add(rightPivot);

doorGroup.traverse((obj) => {
  if (obj.isMesh) {
    obj.castShadow = true;
    obj.receiveShadow = true;
  }
});

// ── Cool blue-white light beam through doorway ──

// 1. Tight bright core — cool white-blue
const beamCore = new THREE.SpotLight(
  0xddeeff,
  22.0,
  55,
  Math.PI * 0.09,
  0.0,
  1.3,
);
beamCore.position.set(0, FLOOR_Y + FRAME_H * 0.85, -18.8);
beamCore.target.position.set(0, FLOOR_Y, 6);
beamCore.castShadow = false;
scene.add(beamCore);
scene.add(beamCore.target);

// 2. Wide soft halo — cool blue
const beamHalo = new THREE.SpotLight(
  0xaaccee,
  12.0,
  52,
  Math.PI * 0.2,
  0.65,
  1.5,
);
beamHalo.position.set(0, FLOOR_Y + FRAME_H * 0.85, -18.8);
beamHalo.target.position.set(0, FLOOR_Y, 5);
beamHalo.castShadow = false;
scene.add(beamHalo);
scene.add(beamHalo.target);

// 3. Floor pool — cool blue-white landing glow
const floorPool = new THREE.PointLight(0x88aadd, 5.0, 16);
floorPool.position.set(0, FLOOR_Y + 0.08, 2);
scene.add(floorPool);

// 4. Volumetric beam mesh — cool white-blue taper
const beamGeo = new THREE.CylinderGeometry(0.14, 4.2, 22, 16, 1, true);
const beamMat = new THREE.MeshBasicMaterial({
  color: 0xccddff,
  transparent: true,
  opacity: 0.055,
  side: THREE.BackSide,
  depthWrite: false,
});
const beamMesh = new THREE.Mesh(beamGeo, beamMat);
beamMesh.position.set(0, FLOOR_Y + 5.0, -8.0);
beamMesh.rotation.x = 0.28;
scene.add(beamMesh);

// 5. Outer fringe — even softer, wider
const beamGeo2 = new THREE.CylinderGeometry(0.35, 6.0, 24, 16, 1, true);
const beamMat2 = new THREE.MeshBasicMaterial({
  color: 0xaabbee,
  transparent: true,
  opacity: 0.025,
  side: THREE.BackSide,
  depthWrite: false,
});
const beamMesh2 = new THREE.Mesh(beamGeo2, beamMat2);
beamMesh2.position.set(0, FLOOR_Y + 5.0, -8.0);
beamMesh2.rotation.x = 0.28;
scene.add(beamMesh2);

// 6. Edge glow on door frame — cool blue emissive light
const frameGlow = new THREE.PointLight(0x6699cc, 3.5, 10);
frameGlow.position.set(0, FLOOR_Y + FRAME_H * 0.6, -18.5);
scene.add(frameGlow);
