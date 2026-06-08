import { scene } from "./renderer.js";

const hemi = new THREE.HemisphereLight(0x050d1e, 0x020408, 0.6);
scene.add(hemi);

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

export const candleLight = new THREE.PointLight(0xff8833, 3.2, 10);
candleLight.position.set(-0.5, 5.5, 0);
candleLight.castShadow = true;
scene.add(candleLight);

const bounceLight = new THREE.PointLight(0xff5500, 0.6, 5);
bounceLight.position.set(-0.5, 1.2, 0.5);
scene.add(bounceLight);

const cityLeft = new THREE.PointLight(0x1a3d88, 2.8, 32);
cityLeft.position.set(-14, 3, -6);
scene.add(cityLeft);

const cityRight = new THREE.PointLight(0x1230aa, 2.8, 32);
cityRight.position.set(14, 3, -6);
scene.add(cityRight);

const skyRim = new THREE.DirectionalLight(0x1a3a88, 0.7);
skyRim.position.set(0, 8, -18);
scene.add(skyRim);

const floorBounce = new THREE.PointLight(0x0a1a66, 1.1, 24);
floorBounce.position.set(0, -1.5, -4);
scene.add(floorBounce);

const overheadFill = new THREE.PointLight(0x081a44, 1.4, 20);
overheadFill.position.set(0, 10, 0);
scene.add(overheadFill);
