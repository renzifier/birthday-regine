// ─────────────────────────────────────────
//  background.js  — night-time starry sky
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

// ── Draw night sky gradient with stars ───
function makeNightSky() {
  const gc = document.createElement("canvas");
  gc.width = 1024;
  gc.height = 512;
  const ctx = gc.getContext("2d");

  // Deep blue-purple night gradient
  const sky = ctx.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0.0, "#01030f");
  sky.addColorStop(0.25, "#060d2a");
  sky.addColorStop(0.55, "#0d1f4a");
  sky.addColorStop(0.8, "#102458");
  sky.addColorStop(1.0, "#1a3570");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1024, 512);

  // Moon
  const moon = ctx.createRadialGradient(820, 90, 0, 820, 90, 55);
  moon.addColorStop(0, "rgba(255,252,220,1.0)");
  moon.addColorStop(0.4, "rgba(230,240,255,0.9)");
  moon.addColorStop(1, "rgba(100,140,200,0)");
  ctx.fillStyle = moon;
  ctx.fillRect(0, 0, 1024, 512);

  // Moon glow halo
  const halo = ctx.createRadialGradient(820, 90, 50, 820, 90, 150);
  halo.addColorStop(0, "rgba(180,200,255,0.18)");
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 1024, 512);

  // Stars
  const rng = (seed) => {
    let x = Math.sin(seed) * 43758.5453;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 220; i++) {
    const sx = rng(i * 3.1) * 1024;
    const sy = rng(i * 7.3) * 340;
    const sr = 0.5 + rng(i * 2.7) * 1.4;
    const brt = 0.4 + rng(i * 5.9) * 0.6;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,220,255,${brt})`;
    ctx.fill();
  }

  // Horizon city-glow tint
  const glow = ctx.createLinearGradient(0, 380, 0, 512);
  glow.addColorStop(0, "rgba(20,40,120,0)");
  glow.addColorStop(1, "rgba(40,80,180,0.3)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1024, 512);

  return new THREE.CanvasTexture(gc);
}

const nightTex = makeNightSky();
scene.background = nightTex;

const bgPlaneMat = new THREE.MeshBasicMaterial({
  map: nightTex,
  depthWrite: false,
});
const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(90, 50), bgPlaneMat);
bgPlane.position.set(0, 8, -24);
bgPlane.renderOrder = -1;
scene.add(bgPlane);

// Soft cool moonlight from behind/above
export const sunsetBackLight = new THREE.PointLight(0x4466cc, 1.2, 80);
sunsetBackLight.position.set(8, 18, -20);
scene.add(sunsetBackLight);
