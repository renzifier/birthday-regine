// ─────────────────────────────────────────
//  floor.js  — dark reflective wood floor
// ─────────────────────────────────────────
import { scene } from "./renderer.js";
import { makeFloorTex } from "./textures.js";

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 40),
  new THREE.MeshStandardMaterial({
    map: makeFloorTex(),
    color: 0x0a0d14, // deep blue-black tint over the texture
    roughness: 0.55, // less glossy — absorbs more light
    metalness: 0.0, // no metallic sheen
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -2, -2);
floor.receiveShadow = true;
scene.add(floor);
