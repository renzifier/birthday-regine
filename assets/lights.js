// ─────────────────────────────────────────
//  lights.js  — deep blue night lighting
//  Cool city-night palette: near-black
//  ambient, strong blue fills, candle warm
//  only as a focal accent on the cake.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

// Near-black deep navy ambient — sky almost pitch, ground black
const hemi = new THREE.HemisphereLight(0x050d1e, 0x020408, 0.6);
scene.add(hemi);

// Moonlight — cooler, more blue-silver
const moonLight = new THREE.DirectionalLight(0x4a7aaa, 0.35);
moonLight.position.set(0, 14, -12);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 2048;
moonLight.shadow.mapSize.height = 2048;
moonLight.shadow.camera.left = -14;
moonLight.shadow.camera.right = 14;
moonLight.shadow.camera.top = 14;
moonLight.shadow.camera.bottom = -14;
moonLight.shadow.camera.far = 50;
moonLight.shadow.bias = -0.0008;
scene.add(moonLight);

// Candle — kept warm so the cake pops as the single warm focal point
// but intensity reduced so it doesn't wash out the blue mood
export const candleLight = new THREE.PointLight(0xff8833, 3.2, 10);
candleLight.position.set(-0.5, 5.5, 0);
candleLight.castShadow = true;
scene.add(candleLight);

// Warm bounce under the cake — very subtle, just prevents pitch-black underside
const bounceLight = new THREE.PointLight(0xff5500, 0.6, 5);
bounceLight.position.set(-0.5, 1.2, 0.5);
scene.add(bounceLight);

// Strong cool blue fill from city — left side
const cityLeft = new THREE.PointLight(0x1a3d88, 2.8, 32);
cityLeft.position.set(-14, 3, -6);
scene.add(cityLeft);

// Strong cool blue fill from city — right side
const cityRight = new THREE.PointLight(0x1230aa, 2.8, 32);
cityRight.position.set(14, 3, -6);
scene.add(cityRight);

// Deep blue rim from city sky behind — dominant night-sky hue
const skyRim = new THREE.DirectionalLight(0x1a3a88, 0.7);
skyRim.position.set(0, 8, -18);
scene.add(skyRim);

// Cold indigo floor bounce — city LEDs reflecting off the dark floor
const floorBounce = new THREE.PointLight(0x0a1a66, 1.1, 24);
floorBounce.position.set(0, -1.5, -4);
scene.add(floorBounce);

// Subtle deep-blue overhead fill so the ceiling/top faces don't go white
const overheadFill = new THREE.PointLight(0x081a44, 1.4, 20);
overheadFill.position.set(0, 10, 0);
scene.add(overheadFill);
