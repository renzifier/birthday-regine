// ─────────────────────────────────────────
//  lights.js  — cool blue night lighting
//  Matches reference: dark interior, cool
//  blue ambient from city, dramatic white-
//  blue beam through doorway as key light.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

// Cool blue-black ambient — sky deep navy, ground near black
const hemi = new THREE.HemisphereLight(0x0a1a2e, 0x050810, 0.9);
scene.add(hemi);

// Cool blue directional — like moonlight/city glow from behind
const moonLight = new THREE.DirectionalLight(0x8ab4d4, 0.45);
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

// Candle — still the hero light but cooler/dimmer so city blue dominates
// Still warm so the cake reads as warm focal point against the cool room
export const candleLight = new THREE.PointLight(0xffaa55, 4.5, 12);
candleLight.position.set(-0.5, 5.5, 0);
candleLight.castShadow = true;
scene.add(candleLight);

// Warm bounce under the cake — dimmed so it doesn't fight the cool palette
const bounceLight = new THREE.PointLight(0xff7722, 1.2, 7);
bounceLight.position.set(-0.5, 1.2, 0.5);
scene.add(bounceLight);

// Cool blue fill from city — left and right sides, city glow spills in
const cityLeft = new THREE.PointLight(0x2255aa, 1.8, 28);
cityLeft.position.set(-14, 3, -6);
scene.add(cityLeft);

const cityRight = new THREE.PointLight(0x1a4488, 1.8, 28);
cityRight.position.set(14, 3, -6);
scene.add(cityRight);

// Cool blue rim from behind/above — city sky glow
const skyRim = new THREE.DirectionalLight(0x3366aa, 0.55);
skyRim.position.set(0, 8, -18);
scene.add(skyRim);

// Subtle cool fill from below — city lights reflecting off the floor
const floorBounce = new THREE.PointLight(0x1133aa, 0.6, 20);
floorBounce.position.set(0, -1.5, -4);
scene.add(floorBounce);
