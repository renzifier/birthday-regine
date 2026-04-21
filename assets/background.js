// ─────────────────────────────────────────
//  background.js
//  1. Draws a procedural sunset gradient
//     (always visible — no file needed).
//  2. Tries to load bg.jpg and swaps it in
//     if found; gradient stays as fallback.
//  Exports sunsetBackLight for the subtle
//  pulse in animate.js.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";
import { makeSunsetGradient } from "./textures.js";

const gradientTex = makeSunsetGradient();
scene.background = gradientTex;

const bgPlaneMat = new THREE.MeshBasicMaterial({
  map: gradientTex,
  depthWrite: false,
});
const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(80, 45), bgPlaneMat);
bgPlane.position.set(0, 6, -22);
bgPlane.renderOrder = -1;
scene.add(bgPlane);

export const sunsetBackLight = new THREE.PointLight(0xff9933, 2.5, 60);
sunsetBackLight.position.set(0, 10, -20);
scene.add(sunsetBackLight);

// Try common paths; first success wins — gradient stays if all fail.
(function tryLoadBgImage() {
  const paths = ["bg.jpg", "assets/bg.jpg", "bg.jpg"];
  let i = 0;
  function tryNext() {
    if (i >= paths.length) return;
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = img.naturalWidth || img.width;
      cv.height = img.naturalHeight || img.height;
      cv.getContext("2d").drawImage(img, 0, 0);
      const photoTex = new THREE.CanvasTexture(cv);
      scene.background = photoTex;
      bgPlaneMat.map = photoTex;
      bgPlaneMat.needsUpdate = true;
    };
    img.onerror = () => {
      i++;
      tryNext();
    };
    img.src = paths[i++];
  }
  tryNext();
})();
