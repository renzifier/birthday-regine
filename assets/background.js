// ─────────────────────────────────────────
//  background.js  — bokeh string lights
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

function makeBokehBackground() {
  const W = 1024,
    H = 512;
  const gc = document.createElement("canvas");
  gc.width = W;
  gc.height = H;
  const ctx = gc.getContext("2d");

  // Deep dark base — very dark navy/charcoal
  ctx.fillStyle = "#06070f";
  ctx.fillRect(0, 0, W, H);

  // Seeded pseudo-random so it's consistent
  const rng = (seed) => {
    let x = Math.sin(seed + 1) * 43758.5453;
    return x - Math.floor(x);
  };

  // Bokeh orb palette — warm candle tones + cool blues
  const colors = [
    [255, 200, 80], // warm gold
    [255, 160, 60], // amber
    [255, 100, 80], // coral
    [255, 220, 130], // soft yellow
    [180, 160, 255], // lavender
    [100, 160, 255], // cool blue
    [255, 180, 200], // soft pink
    [255, 255, 180], // pale yellow
  ];

  // Draw ~55 bokeh orbs of varying sizes
  for (let i = 0; i < 55; i++) {
    const x = rng(i * 3.1) * W;
    const y = rng(i * 7.3) * H;
    const r = 18 + rng(i * 2.9) * 72; // 18–90px radius
    const col = colors[Math.floor(rng(i * 5.1) * colors.length)];
    const alpha = 0.12 + rng(i * 4.7) * 0.28; // 0.12–0.40 opacity

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${alpha})`);
    grad.addColorStop(
      0.4,
      `rgba(${col[0]},${col[1]},${col[2]},${alpha * 0.5})`,
    );
    grad.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Second layer — tiny bright pinpoint centres for some orbs
  for (let i = 0; i < 30; i++) {
    const x = rng(i * 3.1 + 0.5) * W;
    const y = rng(i * 7.3 + 0.5) * H;
    const r = 1.5 + rng(i * 2.9 + 0.5) * 3;
    const col = colors[Math.floor(rng(i * 5.1 + 0.5) * colors.length)];

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},0.9)`);
    grad.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Subtle vignette — darker at corners, slightly lighter centre
  const vig = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.65);
  vig.addColorStop(0, "rgba(20,10,40,0)");
  vig.addColorStop(1, "rgba(2,2,8,0.75)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  return new THREE.CanvasTexture(gc);
}

const bokehTex = makeBokehBackground();
scene.background = bokehTex;

const bgPlaneMat = new THREE.MeshBasicMaterial({
  map: bokehTex,
  depthWrite: false,
});
const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(90, 50), bgPlaneMat);
bgPlane.position.set(0, 8, -24);
bgPlane.renderOrder = -1;
scene.add(bgPlane);

// Soft warm back-light — simulates the string lights glowing behind the scene
export const sunsetBackLight = new THREE.PointLight(0xff9944, 0.8, 60);
sunsetBackLight.position.set(0, 10, -18);
scene.add(sunsetBackLight);

// A couple of coloured point lights to fake bokeh light spill into the scene
const leftSpill = new THREE.PointLight(0x8866ff, 0.3, 25);
leftSpill.position.set(-10, 6, -5);
scene.add(leftSpill);

const rightSpill = new THREE.PointLight(0xff6644, 0.3, 25);
rightSpill.position.set(10, 6, -5);
scene.add(rightSpill);
