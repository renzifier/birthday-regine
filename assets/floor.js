// ─────────────────────────────────────────
//  floor.js  — dark reflective wood floor
// ─────────────────────────────────────────
import { scene } from "./renderer.js";
import { makeFloorTex } from "./textures.js";

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 40),
  new THREE.MeshStandardMaterial({
    map: makeFloorTex(),
    color: 0x1e2235, // dark blue-grey — lets more texture show through
    roughness: 0.42, // slight sheen to catch blue light
    metalness: 0.04, // very faint reflectivity
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -2, -2);
floor.receiveShadow = true;
scene.add(floor);
