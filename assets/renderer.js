// ─────────────────────────────────────────
//  renderer.js
//  WebGLRenderer · Scene · Camera · Resize
// ─────────────────────────────────────────
import { CONFIG } from "./config.js";

export const canvas = document.getElementById("c");

export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
// NOTE: outputEncoding is deprecated in r152+.
// Swap to `renderer.outputColorSpace = THREE.SRGBColorSpace` when upgrading.
renderer.outputEncoding = THREE.sRGBEncoding;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5a020); // warm gold fallback before skybox loads
scene.fog = new THREE.FogExp2(0xe8831a, 0.008);

export const camera = new THREE.PerspectiveCamera(
  CONFIG.camera.fov,
  1,
  CONFIG.camera.near,
  CONFIG.camera.far,
);
camera.position.set(0, 5.5, 13);
camera.lookAt(0, 1.2, 0);

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);
