// ─────────────────────────────────────────
//  floor.js  — dark reflective wood floor
// ─────────────────────────────────────────
import { scene } from "./renderer.js";
import { makeFloorTex } from "./textures.js";

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 32),
  new THREE.MeshStandardMaterial({
    map: makeFloorTex(),
    roughness: 0.25,
    metalness: 0.15,
    color: 0xc8956c,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.2;
floor.receiveShadow = true;
scene.add(floor);
