import { CONFIG } from "./config.js";

export const canvas = document.getElementById("c");

export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

if (renderer.outputColorSpace !== undefined) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
} else {
  renderer.outputEncoding = THREE.sRGBEncoding;
}

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040e);
scene.fog = new THREE.FogExp2(0x03060f, 0.016);

export const camera = new THREE.PerspectiveCamera(
  CONFIG.camera.fov,
  1,
  CONFIG.camera.near,
  CONFIG.camera.far,
);
camera.position.set(0, 5, 16);
camera.lookAt(0, 1.5, -4);

function resize() {
  const vvp = window.visualViewport;
  const w = vvp ? Math.round(vvp.width) : window.innerWidth;
  const h = vvp ? Math.round(vvp.height) : window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", resize);
}
