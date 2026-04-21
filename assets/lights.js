// ─────────────────────────────────────────
//  lights.js
//  All scene lights, warmed to match the
//  sunset-field background.
//  Only the lights that change at runtime
//  (candleLight) are exported.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

// Sky / ground ambient
const hemi = new THREE.HemisphereLight(0xffcc55, 0x8b4513, 0.9);
scene.add(hemi);

// Strong low-angle sun
const dirLight = new THREE.DirectionalLight(0xff9933, 2.2);
dirLight.position.set(8, 4, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -12;
dirLight.shadow.camera.right = 12;
dirLight.shadow.camera.top = 12;
dirLight.shadow.camera.bottom = -12;
dirLight.shadow.camera.far = 40;
dirLight.shadow.bias = -0.0008;
scene.add(dirLight);

// Warm fill from the left
const fillLight = new THREE.DirectionalLight(0xffaa44, 1.1);
fillLight.position.set(-3, 4, 10);
scene.add(fillLight);

// Warm overhead glow
const pendantLight = new THREE.PointLight(0xffcc55, 2.2, 16);
pendantLight.position.set(0, 8, -1);
scene.add(pendantLight);

// Candle — flickered every frame in animate.js
export const candleLight = new THREE.PointLight(0xff8822, 3.5, 10);
candleLight.position.set(-0.5, 5.5, 0);
scene.add(candleLight);

// Warm bounce off floor
const bounceLight = new THREE.PointLight(0xff9955, 0.9, 6);
bounceLight.position.set(-0.5, -0.2, 1.5);
scene.add(bounceLight);

// Sunset rim from behind
const rimLight = new THREE.DirectionalLight(0xff6622, 0.8);
rimLight.position.set(0, 3, -10);
scene.add(rimLight);
