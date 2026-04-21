// ─────────────────────────────────────────
//  background.js  — aerial night city view
//  Inspired by: looking out from a rooftop
//  into a sprawling lit city below, milky
//  way overhead, dark interior vignette.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

function makeAerialNight() {
  const W = 2048,
    H = 1024;
  const gc = document.createElement("canvas");
  gc.width = W;
  gc.height = H;
  const ctx = gc.getContext("2d");

  // ── Deterministic RNG ─────────────────────
  const rng = (s) => {
    let x = Math.sin(s + 1) * 43758.5453;
    return x - Math.floor(x);
  };

  // ── Deep night sky gradient ───────────────
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0.0, "#01020a");
  sky.addColorStop(0.25, "#030814");
  sky.addColorStop(0.5, "#060e22");
  sky.addColorStop(0.72, "#0b1635");
  sky.addColorStop(0.85, "#0d1a3a");
  sky.addColorStop(1.0, "#111f45");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // ── Milky Way band ────────────────────────
  const mwCX = W * 0.5;
  const mwCY = H * 0.22;

  const mwGlow = ctx.createRadialGradient(mwCX, mwCY, 0, mwCX, mwCY, W * 0.38);
  mwGlow.addColorStop(0, "rgba(160,180,255,0.07)");
  mwGlow.addColorStop(0.4, "rgba(120,140,220,0.04)");
  mwGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mwGlow;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 2800; i++) {
    const angle = rng(i * 2.3) * Math.PI * 2;
    const dist = Math.pow(rng(i * 5.7), 0.55) * W * 0.32;
    const sx = mwCX + Math.cos(angle) * dist * 2.2 + (rng(i * 1.1) - 0.5) * 60;
    const sy = mwCY + Math.sin(angle) * dist * 0.45 + (rng(i * 3.3) - 0.5) * 30;
    if (sy > H * 0.6) continue;
    const sr = 0.3 + rng(i * 4.1) * 1.0;
    const brt = 0.15 + rng(i * 7.3) * 0.7;
    const blue = rng(i * 9.1) > 0.6;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = blue
      ? `rgba(180,200,255,${brt})`
      : `rgba(230,235,255,${brt})`;
    ctx.fill();
  }

  const streak = ctx.createRadialGradient(mwCX, mwCY, 0, mwCX, mwCY, 180);
  streak.addColorStop(0, "rgba(200,215,255,0.18)");
  streak.addColorStop(0.3, "rgba(160,180,240,0.08)");
  streak.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = streak;
  ctx.fillRect(0, 0, W, H);

  // ── Regular stars ─────────────────────────
  for (let i = 0; i < 420; i++) {
    const sx = rng(i * 3.7 + 10) * W;
    const sy = rng(i * 6.1 + 10) * H * 0.68;
    const sr = 0.3 + rng(i * 2.3 + 10) * 1.1;
    const brt = 0.2 + rng(i * 8.9 + 10) * 0.8;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,228,255,${brt})`;
    ctx.fill();
  }

  // ── Aerial city lights ────────────────────
  const CITY_TOP = H * 0.5;
  const CITY_BOTTOM = H * 0.84;
  const CITY_MID = H * 0.64;

  const horizonGlow = ctx.createRadialGradient(
    W * 0.5,
    CITY_MID,
    0,
    W * 0.5,
    CITY_MID,
    W * 0.55,
  );
  horizonGlow.addColorStop(0, "rgba(60,80,160,0.18)");
  horizonGlow.addColorStop(0.4, "rgba(40,60,130,0.10)");
  horizonGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, 0, W, H);

  const LIGHT_COLORS = [
    [255, 240, 180],
    [255, 220, 140],
    [255, 200, 100],
    [220, 235, 255],
    [180, 210, 255],
    [255, 230, 160],
  ];

  for (let i = 0; i < 12000; i++) {
    const rawX = rng(i * 2.71 + 1) * W;
    const rawY = CITY_TOP + rng(i * 3.14 + 2) * (CITY_BOTTOM - CITY_TOP);

    const yFrac = (rawY - CITY_TOP) / (CITY_BOTTOM - CITY_TOP);
    const densityY = Math.sin(yFrac * Math.PI) * 0.85 + 0.15;
    if (rng(i * 7.77 + 3) > densityY) continue;

    const xFrac = rawX / W;
    const densityX = 0.4 + 0.6 * Math.sin(xFrac * Math.PI);
    if (rng(i * 5.55 + 4) > densityX) continue;

    const col =
      LIGHT_COLORS[Math.floor(rng(i * 11.1 + 5) * LIGHT_COLORS.length)];
    const r = 0.4 + rng(i * 4.4 + 6) * 1.8;
    const a = 0.3 + rng(i * 6.6 + 7) * 0.7;

    if (r > 1.4) {
      const halo = ctx.createRadialGradient(rawX, rawY, 0, rawX, rawY, r * 5);
      halo.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${a * 0.3})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(rawX - r * 5, rawY - r * 5, r * 10, r * 10);
    }

    ctx.beginPath();
    ctx.arc(rawX, rawY, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`;
    ctx.fill();
  }

  // Faint street grid suggestion
  ctx.globalAlpha = 0.025;
  ctx.strokeStyle = "rgba(255,240,180,1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    const lx = rng(i * 8.8 + 20) * W;
    ctx.beginPath();
    ctx.moveTo(lx, CITY_TOP);
    ctx.lineTo(lx + (rng(i * 3.3 + 21) - 0.5) * 80, CITY_BOTTOM);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  // ── Ground fade ───────────────────────────
  const groundFade = ctx.createLinearGradient(0, CITY_BOTTOM - 40, 0, H);
  groundFade.addColorStop(0, "rgba(0,0,0,0)");
  groundFade.addColorStop(1, "rgba(1,3,10,1)");
  ctx.fillStyle = groundFade;
  ctx.fillRect(0, CITY_BOTTOM - 40, W, H - CITY_BOTTOM + 40);

  // ── Interior vignette — dark sides ────────
  const leftVig = ctx.createLinearGradient(0, 0, W * 0.28, 0);
  leftVig.addColorStop(0, "rgba(2,4,14,0.92)");
  leftVig.addColorStop(0.5, "rgba(2,4,14,0.4)");
  leftVig.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = leftVig;
  ctx.fillRect(0, 0, W * 0.28, H);

  const rightVig = ctx.createLinearGradient(W, 0, W * 0.72, 0);
  rightVig.addColorStop(0, "rgba(2,4,14,0.92)");
  rightVig.addColorStop(0.5, "rgba(2,4,14,0.4)");
  rightVig.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rightVig;
  ctx.fillRect(W * 0.72, 0, W * 0.28, H);

  // Top vignette
  const topVig = ctx.createLinearGradient(0, 0, 0, H * 0.18);
  topVig.addColorStop(0, "rgba(1,2,8,0.85)");
  topVig.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topVig;
  ctx.fillRect(0, 0, W, H * 0.18);

  return new THREE.CanvasTexture(gc);
}

const cityTex = makeAerialNight();
scene.background = cityTex;

// Soft cool city glow from below
export const sunsetBackLight = new THREE.PointLight(0x4466bb, 1.2, 80);
sunsetBackLight.position.set(0, 4, -20);
scene.add(sunsetBackLight);

// Moonlight / starlight from above
const moonLight = new THREE.PointLight(0x8899dd, 0.5, 70);
moonLight.position.set(8, 22, -12);
scene.add(moonLight);

// Subtle warm city-glow spill from sides
const leftSpill = new THREE.PointLight(0xffaa44, 0.2, 30);
leftSpill.position.set(-14, 3, -6);
scene.add(leftSpill);

const rightSpill = new THREE.PointLight(0x99bbff, 0.2, 30);
rightSpill.position.set(14, 3, -6);
scene.add(rightSpill);
