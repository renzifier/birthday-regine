import { scene } from "./renderer.js";
import { makeFloorTex } from "./textures.js";

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 40),
  new THREE.MeshStandardMaterial({
    map: makeFloorTex(),
    color: 0x1e2235,
    roughness: 0.42,
    metalness: 0.04,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -2, -2);
floor.receiveShadow = true;
scene.add(floor);
