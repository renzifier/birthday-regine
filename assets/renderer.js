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
renderer.toneMappingExposure = 1.05;
// NOTE: outputEncoding is deprecated in r152+.
// Swap to `renderer.outputColorSpace = THREE.SRGBColorSpace` when upgrading.
renderer.outputEncoding = THREE.sRGBEncoding;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05081a); // deep night blue fallback
scene.fog = new THREE.FogExp2(0x080d1f, 0.018);

export const camera = new THREE.PerspectiveCamera(
  CONFIG.camera.fov,
  1,
  CONFIG.camera.near,
  CONFIG.camera.far,
);
camera.position.set(0, 7, 22);
camera.lookAt(0, 2.0, 0);

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);
