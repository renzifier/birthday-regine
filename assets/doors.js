// ─────────────────────────────────────────
//  doors.js — double open doors behind
//  the table, framing the city view.
//  Darker door panels, strong edge glow,
//  visible interior wall surfaces.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

const FRAME_W = 4.5;
const FRAME_H = 6.5;
const FRAME_T = 0.18;
const FLOOR_Y = -2.0;

const doorGroup = new THREE.Group();
doorGroup.position.set(0, FLOOR_Y, -19);
scene.add(doorGroup);

// ── Materials ─────────────────────────────

// Frame: near-white so the edge glow reads bright
const frameMat = new THREE.MeshStandardMaterial({
  color: 0xddeeff,
  roughness: 0.18,
  metalness: 0.04,
  emissive: 0x8ab8e0,
  emissiveIntensity: 0.55, // glowing frame edges
});

// Door panels: very dark — almost black with a faint blue tint
const doorMat = new THREE.MeshStandardMaterial({
  color: 0x0a1520, // near-black blue
  roughness: 0.55,
  metalness: 0.02,
  emissive: 0x000408,
  emissiveIntensity: 0.1,
});

// Panel recesses: slightly lighter dark
const panelRecessMat = new THREE.MeshStandardMaterial({
  color: 0x0d1e2e,
  roughness: 0.65,
  metalness: 0.0,
});

// ── Interior wall material ────────────────
// Dark blue-grey plaster/concrete — the room walls visible beside the door
const wallMat = new THREE.MeshStandardMaterial({
  color: 0x060e1c,
  roughness: 0.88,
  metalness: 0.0,
  emissive: 0x050c18,
  emissiveIntensity: 0.08,
});

// ── Interior walls flanking the doorway ───
// Left wall panel
const leftWall = new THREE.Mesh(new THREE.BoxGeometry(14, 12, 0.35), wallMat);
leftWall.position.set(-FRAME_W / 2 - 7.2, FRAME_H * 0.5, 0.1);
leftWall.receiveShadow = true;
doorGroup.add(leftWall);

// Right wall panel
const rightWall = new THREE.Mesh(new THREE.BoxGeometry(14, 12, 0.35), wallMat);
rightWall.position.set(FRAME_W / 2 + 7.2, FRAME_H * 0.5, 0.1);
rightWall.receiveShadow = true;
doorGroup.add(rightWall);

// Ceiling strip above the door
const ceiling = new THREE.Mesh(
  new THREE.BoxGeometry(FRAME_W * 6, 3.5, 0.35),
  wallMat,
);
ceiling.position.set(0, FRAME_H + 1.8, 0.1);
ceiling.receiveShadow = true;
doorGroup.add(ceiling);

// ── Subtle wall surface detail ─────────────
// Faint vertical panels/lines on the walls for realism
const wallDetailMat = new THREE.MeshStandardMaterial({
  color: 0x080f1a,
  roughness: 0.92,
  metalness: 0.0,
});
for (let i = 0; i < 3; i++) {
  const px = -FRAME_W / 2 - 2.5 - i * 3.2;
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 10, 0.04),
    wallDetailMat,
  );
  stripe.position.set(px, FRAME_H * 0.45, 0.22);
  doorGroup.add(stripe);

  const stripe2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 10, 0.04),
    wallDetailMat,
  );
  stripe2.position.set(-px, FRAME_H * 0.45, 0.22);
  doorGroup.add(stripe2);
}

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

// ── Helper: build one door panel ──────────
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

  // Door knob — metallic
  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xaac8e0,
      roughness: 0.08,
      metalness: 0.9,
      emissive: 0x223344,
      emissiveIntensity: 0.3,
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

// ══════════════════════════════════════════
//  LIGHTS
// ══════════════════════════════════════════

// 1. Tight bright core — cool white-blue beam
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

// 5. Outer fringe beam
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

// 6. Strong door frame edge glow — bright cool-white rim
const frameGlow = new THREE.PointLight(0xaaddff, 8.0, 14);
frameGlow.position.set(0, FLOOR_Y + FRAME_H * 0.55, -18.4);
scene.add(frameGlow);

// 7. Left frame rim light — illuminates the inner edge of left post
const leftFrameRim = new THREE.PointLight(0x88bbee, 4.5, 8);
leftFrameRim.position.set(-FRAME_W / 2 - 0.1, FLOOR_Y + FRAME_H * 0.5, -18.6);
scene.add(leftFrameRim);

// 8. Right frame rim light
const rightFrameRim = new THREE.PointLight(0x88bbee, 4.5, 8);
rightFrameRim.position.set(FRAME_W / 2 + 0.1, FLOOR_Y + FRAME_H * 0.5, -18.6);
scene.add(rightFrameRim);

// 9. Wall wash lights — cool blue touching the interior walls
const leftWallLight = new THREE.PointLight(0x1a3a6a, 3.5, 22);
leftWallLight.position.set(-FRAME_W / 2 - 5, FLOOR_Y + FRAME_H * 0.4, -17);
scene.add(leftWallLight);

const rightWallLight = new THREE.PointLight(0x1a3a6a, 3.5, 22);
rightWallLight.position.set(FRAME_W / 2 + 5, FLOOR_Y + FRAME_H * 0.4, -17);
scene.add(rightWallLight);
