// ─────────────────────────────────────────
//  lights.js  — night-time scene lighting
//  Cool blue ambient, strong warm candle
//  glow as the dominant light source.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

// Dim cool night ambient (sky=deep blue, ground=near black)
const hemi = new THREE.HemisphereLight(0x1a2a6c, 0x050510, 0.4);
scene.add(hemi);

// Soft moonlight directional — cool blue-white, low intensity
const moonLight = new THREE.DirectionalLight(0x8899dd, 0.5);
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

// Candle — the HERO light. Warm orange, exported so animate.js can flicker it
export const candleLight = new THREE.PointLight(0xff7722, 5.5, 14);
candleLight.position.set(-0.5, 5.5, 0);
candleLight.castShadow = true;
scene.add(candleLight);

// Warm under-glow from candles bouncing off tablecloth
const bounceLight = new THREE.PointLight(0xff6600, 1.2, 7);
bounceLight.position.set(-0.5, 1.2, 0.5);
scene.add(bounceLight);

// Cool rim from the left — moonlight catching the cake edge
const rimLight = new THREE.DirectionalLight(0x5577cc, 0.35);
rimLight.position.set(-8, 4, 2);
scene.add(rimLight);
