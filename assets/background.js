import { scene, renderer } from "./renderer.js";

const skyTex = new THREE.TextureLoader().load(
  "assets/photos/night.jpg",
  (t) => {
    fitCover();
  },
);
if (THREE.SRGBColorSpace) skyTex.colorSpace = THREE.SRGBColorSpace;
else skyTex.encoding = THREE.sRGBEncoding;
skyTex.wrapS = skyTex.wrapT = THREE.ClampToEdgeWrapping;
skyTex.minFilter = THREE.LinearFilter;
skyTex.generateMipmaps = false;
scene.background = skyTex;

function fitCover() {
  const img = skyTex.image;
  if (!img) return;
  const c = renderer.domElement;
  const screenA =
    (c.clientWidth || window.innerWidth) /
    (c.clientHeight || window.innerHeight);
  const imgA = img.width / img.height;
  if (screenA < imgA) {
    skyTex.repeat.set(screenA / imgA, 1);
    skyTex.offset.set((1 - screenA / imgA) / 2, 0);
  } else {
    skyTex.repeat.set(1, imgA / screenA);
    skyTex.offset.set(0, (1 - imgA / screenA) / 2);
  }
  skyTex.needsUpdate = true;
}
window.addEventListener("resize", fitCover);
if (window.visualViewport)
  window.visualViewport.addEventListener("resize", fitCover);

export const cityBackLight = new THREE.PointLight(0x6688cc, 0.7, 90);
cityBackLight.position.set(0, 5, -22);
scene.add(cityBackLight);

const moonLight = new THREE.PointLight(0xffcc77, 0.55, 80);
moonLight.position.set(6, 24, -14);
scene.add(moonLight);

const leftSpill = new THREE.PointLight(0xff9944, 0.28, 32);
leftSpill.position.set(-16, 4, -6);
scene.add(leftSpill);

const rightSpill = new THREE.PointLight(0xffaa55, 0.28, 32);
rightSpill.position.set(16, 4, -6);
scene.add(rightSpill);
