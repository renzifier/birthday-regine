// ─────────────────────────────────────────
//  animate.js
//  Frame loop: candle flicker, flame scale,
//  smoke drift, orbit controls.
//  Also owns click / touch → card open
//  via raycasting.
// ─────────────────────────────────────────
import { renderer, scene, camera, canvas } from "./renderer.js";
import { CONFIG } from "./config.js";
import { candleLight } from "./lights.js";
import { sunsetBackLight } from "./background.js";
import { flameMeshes, perFlameLights, smokeSystems } from "./cake.js";
import { cardHit, openCard } from "./card.js";

// ── Orbit Controls ────────────────────────
const controls = new THREE.OrbitControls(camera, canvas);
controls.target.set(0, 2.0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = CONFIG.controls.minRadius;
controls.maxDistance = CONFIG.controls.maxRadius;
controls.minPolarAngle = CONFIG.controls.minPhi;
controls.maxPolarAngle = CONFIG.controls.maxPhi;
controls.update();

// ── Raycaster — card click / tap ──────────
const raycaster = new THREE.Raycaster();

function hitTestCard(clientX, clientY) {
  raycaster.setFromCamera(
    new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1,
    ),
    camera,
  );
  return raycaster.intersectObject(cardHit).length > 0;
}

// Distinguish a click from a drag — only open card if mouse barely moved
let pointerDownX = 0;
let pointerDownY = 0;
canvas.addEventListener("pointerdown", (e) => {
  pointerDownX = e.clientX;
  pointerDownY = e.clientY;
});
canvas.addEventListener("click", (e) => {
  const dx = e.clientX - pointerDownX;
  const dy = e.clientY - pointerDownY;
  if (Math.hypot(dx, dy) < 5 && hitTestCard(e.clientX, e.clientY)) openCard();
});

// Only fire openCard on a tap (≤ 8 px travel), not a drag
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  },
  { passive: true },
);
canvas.addEventListener("touchend", (e) => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if (Math.hypot(dx, dy) < 8) {
    e.preventDefault();
    if (hitTestCard(t.clientX, t.clientY)) openCard();
  }
});

// ── Animation loop ────────────────────────
const clock = new THREE.Clock();
let t = 0;

export function startAnimation() {
  (function loop() {
    requestAnimationFrame(loop);
    t += clock.getDelta();

    // ── Orbit controls update ────────────
    controls.update();

    // ── Candle flicker ───────────────────
    candleLight.intensity =
      CONFIG.candle.minIntensity +
      Math.max(
        0,
        Math.sin(t * CONFIG.candle.flickerSpeed) * 0.7 +
          Math.sin(t * 17.1) * 0.28,
      );
    candleLight.position.x = -0.5 + Math.sin(t * 8.7) * 0.15;
    candleLight.position.z = Math.sin(t * 6.3) * 0.12;

    // ── Per-flame lights ─────────────────
    for (const pfl of perFlameLights) {
      pfl.light.intensity =
        0.3 + Math.max(0, Math.sin(t * 9.3 + pfl.offset) * 0.18);
    }

    // ── Background light pulse ───────────
    sunsetBackLight.intensity = 2.5 + Math.sin(t * 0.12) * 0.3;

    // ── Flame scale animation ────────────
    for (const ff of flameMeshes) {
      const sy = 1.65 + Math.sin(t * 9.0 + ff.offset) * 0.28;
      const sx = 0.58 + Math.sin(t * 11.5 + ff.offset) * 0.1;
      ff.mesh.scale.set(sx, sy, sx);
    }

    // ── Smoke drift ──────────────────────
    for (const ss of smokeSystems) {
      const pos = ss.geo.attributes.position.array;
      for (let sp = 0; sp < 18; sp++) {
        const frac = sp / 18;
        pos[sp * 3] =
          ss.base.x + Math.sin(t * 2.1 + ss.phase + frac * 3.8) * 0.04 * frac;
        pos[sp * 3 + 1] =
          ss.base.y + sp * 0.062 + Math.sin(t * 1.4 + ss.phase) * 0.01;
        pos[sp * 3 + 2] =
          ss.base.z + Math.cos(t * 1.8 + ss.phase + frac * 2.9) * 0.03 * frac;
      }
      ss.geo.attributes.position.needsUpdate = true;
      ss.pts.material.opacity = 0.14 + Math.sin(t * 0.6 + ss.phase) * 0.06;
    }

    renderer.render(scene, camera);
  })();
}
