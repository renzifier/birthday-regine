import { renderer, scene, camera, canvas } from "./renderer.js";
import { CONFIG } from "./config.js";
import { candleLight } from "./lights.js";
import { cityBackLight } from "./background.js";
import { flameMeshes, perFlameLights, smokeSystems } from "./cake.js";
import { envelopeHit, openEnvelope } from "./card.js";
import { initBlow, onBlow } from "./blow.js";
import { launchConfetti, updateConfetti, clearConfetti } from "./confetti.js";

const controls = new THREE.OrbitControls(camera, canvas);
controls.target.set(0, 1.5, -4);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = CONFIG.controls.minRadius;
controls.maxDistance = CONFIG.controls.maxRadius;
controls.minPolarAngle = CONFIG.controls.minPhi;
controls.maxPolarAngle = CONFIG.controls.maxPhi;
controls.update();

const raycaster = new THREE.Raycaster();

function hitTestEnvelope(clientX, clientY) {
  raycaster.setFromCamera(
    new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1,
    ),
    camera,
  );
  return raycaster.intersectObject(envelopeHit).length > 0;
}

let pointerDownX = 0;
let pointerDownY = 0;
canvas.addEventListener("pointerdown", (e) => {
  pointerDownX = e.clientX;
  pointerDownY = e.clientY;
});
canvas.addEventListener("click", (e) => {
  const dx = e.clientX - pointerDownX;
  const dy = e.clientY - pointerDownY;
  if (Math.hypot(dx, dy) < 5 && hitTestEnvelope(e.clientX, e.clientY))
    openEnvelope();

  if (flameState === "out") {
    flameState = "relighting";
    flameT = 0;
    clearConfetti();
    _hideRelightHint();
  }
});

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
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  if (Math.hypot(dx, dy) < 8) {
    if (flameState === "out") {
      e.preventDefault();
      flameState = "relighting";
      flameT = 0;
      clearConfetti();
      _hideRelightHint();
    } else if (hitTestEnvelope(touch.clientX, touch.clientY)) {
      e.preventDefault();
      openEnvelope();
    }
  }
});

let flameState = "lit";
let flameT = 0;

const EXTINGUISH_DUR = 0.55;
const RELIGHT_DUR = 0.7;

onBlow(() => {
  if (flameState === "lit" || flameState === "blowing") {
    flameState = "blowing";
    setTimeout(() => {
      if (flameState === "blowing") {
        flameState = "out";
        flameT = 0;
        launchConfetti();
        _showRelightHint();
      }
    }, 200);
  }
});

function _showRelightHint() {
  let el = document.getElementById("relightHint");
  if (!el) {
    el = document.createElement("div");
    el.id = "relightHint";
    el.textContent = "Click anywhere to relight!";
    Object.assign(el.style, {
      position: "fixed",
      bottom: "52px",
      left: "50%",
      transform: "translateX(-50%)",
      color: "rgba(255,200,120,0.85)",
      fontFamily: "monospace",
      fontSize: "13px",
      pointerEvents: "none",
      whiteSpace: "nowrap",
      zIndex: "50",
    });
    document.body.appendChild(el);
  }
  el.style.display = "block";
}
function _hideRelightHint() {
  const el = document.getElementById("relightHint");
  if (el) el.style.display = "none";
}

const clock = new THREE.Clock();

export function startAnimation() {
  initBlow();
  const hint = document.getElementById("hint");
  if (hint) {
    hint.innerHTML =
      '<span class="hint-desktop">You can blow the candle and open the envelope!</span>' +
      '<span class="hint-mobile">You can blow the candle and open the envelope!</span>';
  }

  let lastT = 0;
  (function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    const dt = Math.min(t - lastT, 0.05);
    lastT = t;

    controls.update();

    if (flameState !== "lit") {
      const dur = flameState === "relighting" ? RELIGHT_DUR : EXTINGUISH_DUR;
      flameT = Math.min(1, flameT + dt / dur);
      if (flameState === "relighting" && flameT >= 1) flameState = "lit";
    }

    updateConfetti(dt);

    let flameScaleY, flameScaleX, lightMult;

    if (flameState === "lit") {
      flameScaleY = 1.0;
      flameScaleX = 1.0;
      lightMult = 1.0;
    } else if (flameState === "blowing") {
      flameScaleY = 0.5 + Math.sin(t * 30) * 0.25;
      flameScaleX = 1.5;
      lightMult = 0.35 + Math.random() * 0.3;
    } else if (flameState === "out") {
      const ease = 1 - flameT * flameT;
      flameScaleY = ease;
      flameScaleX = ease * 0.7;
      lightMult = ease;
    } else {
      const ease = flameT * (2 - flameT);
      flameScaleY = ease;
      flameScaleX = ease;
      lightMult = ease;
    }

    const baseIntensity =
      CONFIG.candle.minIntensity +
      Math.max(
        0,
        Math.sin(t * CONFIG.candle.flickerSpeed) * 0.7 +
          Math.sin(t * 17.1) * 0.28,
      );
    candleLight.intensity = baseIntensity * lightMult;
    if (flameState === "lit") {
      candleLight.position.x = -0.5 + Math.sin(t * 8.7) * 0.15;
      candleLight.position.z = Math.sin(t * 6.3) * 0.12;
    }

    for (const pfl of perFlameLights) {
      pfl.light.intensity =
        (0.3 + Math.max(0, Math.sin(t * 9.3 + pfl.offset) * 0.18)) * lightMult;
    }

    cityBackLight.intensity = 0.6 + Math.sin(t * 0.12) * 0.15;

    for (const ff of flameMeshes) {
      const normalSY = 1.65 + Math.sin(t * 9.0 + ff.offset) * 0.28;
      const normalSX = 0.58 + Math.sin(t * 11.5 + ff.offset) * 0.1;
      ff.mesh.visible = flameScaleY > 0.02;
      ff.mesh.scale.set(
        normalSX * flameScaleX,
        normalSY * flameScaleY,
        normalSX * flameScaleX,
      );
    }

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

      const smokeBoost = flameState === "out" ? Math.min(1, flameT * 2.5) : 0;
      ss.pts.material.opacity =
        0.14 + Math.sin(t * 0.6 + ss.phase) * 0.06 + smokeBoost * 0.25;
    }

    renderer.render(scene, camera);
  })();
}
