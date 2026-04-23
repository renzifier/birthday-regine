// ─────────────────────────────────────────
//  decorations.js
//  Table scatter: rose petals, photo
//  frames with placeholder images,
//  and balloons with strings.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";
import { std, makePhotoPlaceholder } from "./textures.js";
import { tableGroup } from "./table.js";

// ── Rose petals ───────────────────────────
const petalMat = std(0xff6688, 0.55, 0.0);
const PETAL_POSITIONS = [
  [2.0, 0.5],
  [-2.2, -0.8],
  [1.4, -1.6],
  [-1.0, 1.8],
  [3.2, 0.2],
  [-3.0, 0.9],
  [2.6, 1.4],
  [-1.8, -1.4],
];
for (const [px, pz] of PETAL_POSITIONS) {
  const petal = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 4), petalMat);
  petal.scale.set(1.0, 0.15, 0.65);
  petal.rotation.y = Math.random() * Math.PI * 2;
  petal.position.set(px - 0.5, 0.375, pz);
  petal.receiveShadow = true;
  tableGroup.add(petal);
}

// ── Photo frames ──────────────────────────
// One shared loader — more efficient than creating a new instance per frame.
const photoLoader = new THREE.TextureLoader();

function makeFrame(x, z, rotY, lean, photoPath, idx) {
  const grp = new THREE.Group();
  const fw = 2.2;
  const fh = 1.75;

  // Outer frame
  const outer = new THREE.Mesh(
    new THREE.BoxGeometry(fw, fh, 0.14),
    std(0xc9963a, 0.22, 0.6),
  );
  outer.castShadow = true;
  grp.add(outer);

  // Inner moulding
  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(fw - 0.22, fh - 0.22, 0.1),
    std(0xa07020, 0.18, 0.52),
  );
  inner.position.z = 0.02;
  grp.add(inner);

  // Photo surface — starts with a generated placeholder
  const photoMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(fw - 0.26, fh - 0.26),
    new THREE.MeshStandardMaterial({
      map: makePhotoPlaceholder(idx || 0),
      roughness: 0.18,
      metalness: 0,
    }),
  );
  photoMesh.position.z = 0.075;
  grp.add(photoMesh);

  // Swap in a real photo if available
  if (photoPath) {
    photoLoader.load(
      photoPath,
      (tex) => {
        photoMesh.material.map = tex;
        photoMesh.material.needsUpdate = true;
      },
      undefined,
      (err) => console.warn("Photo failed to load:", photoPath, err),
    );
  }

  // Stand legs
  const standMat = std(0xa07020, 0.3, 0.4);
  for (const sx of [-0.3, 0.3]) {
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.9, 0.06),
      standMat,
    );
    stand.position.set(sx, -fh * 0.5 - 0.35, -0.2);
    stand.rotation.x = 0.35;
    grp.add(stand);
  }

  grp.position.set(x, 0.37 + fh * 0.5 + 0.05, z);
  grp.rotation.y = rotY;
  grp.rotation.z = lean || 0;
  grp.castShadow = true;
  tableGroup.add(grp);
}

makeFrame(-3.6, -1.5, 0.28, 0.02, "assets/photos/claire.jpg", 0);
makeFrame(3.3, -1.4, -0.25, -0.02, "assets/photos/taeclaire.jpg", 1);
makeFrame(-3.3, 1.4, 0.55, 0.03, "assets/photos/clairee.png", 2);
makeFrame(3.5, 1.6, -0.55, -0.03, "assets/photos/clairepool.png", 3);

// ── Balloons ──────────────────────────────
const BALLOON_DATA = [
  { x: -5.5, y: 8.0, z: -2.0, color: 0xff4488, sx: 0.85, sy: 1.0, sz: 0.85 },
  { x: -4.2, y: 9.2, z: -2.5, color: 0xffaacc, sx: 0.75, sy: 0.95, sz: 0.75 },
  { x: -5.0, y: 7.4, z: -1.8, color: 0xff77bb, sx: 0.7, sy: 0.9, sz: 0.7 },
  { x: 5.2, y: 7.8, z: -2.0, color: 0xffcc00, sx: 0.8, sy: 1.0, sz: 0.8 },
  { x: 4.2, y: 9.0, z: -2.5, color: 0xff88dd, sx: 0.72, sy: 0.92, sz: 0.72 },
];

for (const bd of BALLOON_DATA) {
  // Balloon body
  const balloon = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 18, 14),
    new THREE.MeshStandardMaterial({
      color: bd.color,
      roughness: 0.05,
      metalness: 0.08,
      transparent: true,
      opacity: 0.92,
    }),
  );
  balloon.scale.set(bd.sx, bd.sy, bd.sz);
  balloon.position.set(bd.x, bd.y, bd.z);
  balloon.castShadow = true;
  scene.add(balloon);

  // Specular highlight sphere
  const hilight = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
    }),
  );
  hilight.position.set(bd.x + 0.22, bd.y + 0.28, bd.z + 0.45);
  scene.add(hilight);

  // String
  const strPts = [
    new THREE.Vector3(bd.x, bd.y - 0.72 * bd.sy, bd.z),
    new THREE.Vector3(bd.x + 0.15, bd.y - 1.5, bd.z + 0.1),
    new THREE.Vector3(bd.x + 0.2, bd.y - 3.0, bd.z + 0.15),
  ];
  const string = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(strPts),
      12,
      0.008,
      4,
      false,
    ),
    std(0xffccdd, 0.6),
  );
  scene.add(string);
}
