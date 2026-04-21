// ─────────────────────────────────────────
//  floor.js  — dark reflective wood floor
// ─────────────────────────────────────────
import { scene } from "./renderer.js";
import { makeFloorTex } from "./textures.js";

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(28, 24),
  new THREE.MeshStandardMaterial({
    map: makeFloorTex(),
    roughness: 0.25,
    metalness: 0.05,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
floor.receiveShadow = true;
scene.add(floor);
