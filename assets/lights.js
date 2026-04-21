// ─────────────────────────────────────────
//  lights.js  — night-time scene lighting
//  Cool blue ambient, strong warm candle
//  glow as the dominant light source.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

// Warm amber ambient — sky like a candlelit room, ground deep warm brown
const hemi = new THREE.HemisphereLight(0x5a3010, 0x1a0800, 0.7);
scene.add(hemi);

// Warm golden key light — like a distant warm lamp rather than cold moonlight
const moonLight = new THREE.DirectionalLight(0xffcc88, 0.6);
moonLight.position.set(6, 12, -8);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 2048;
moonLight.shadow.mapSize.height = 2048;
moonLight.shadow.camera.left = -12;
moonLight.shadow.camera.right = 12;
moonLight.shadow.camera.top = 12;
moonLight.shadow.camera.bottom = -12;
moonLight.shadow.camera.far = 40;
moonLight.shadow.bias = -0.0008;
scene.add(moonLight);

// Candle — the HERO light. Rich warm amber, exported so animate.js can flicker it
export const candleLight = new THREE.PointLight(0xff8800, 7.5, 16);
candleLight.position.set(-0.5, 5.5, 0);
candleLight.castShadow = true;
scene.add(candleLight);

// Warm under-glow from candles bouncing off tablecloth — deeper orange
const bounceLight = new THREE.PointLight(0xff5500, 2.2, 9);
bounceLight.position.set(-0.5, 1.2, 0.5);
scene.add(bounceLight);

// Warm side fill — amber from the right catching the cake edge
const rimLight = new THREE.DirectionalLight(0xffaa44, 0.45);
rimLight.position.set(-8, 4, 2);
scene.add(rimLight);
