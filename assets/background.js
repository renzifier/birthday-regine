// ─────────────────────────────────────────
//  background.js  — aerial night city view
//  Cool blue palette, milky way overhead,
//  bright centre glow behind the doorway,
//  heavy dark interior vignette on sides.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

function makeAerialNight() {
  const W = 2048,
    H = 1024;
  const gc = document.createElement("canvas");
  gc.width = W;
  gc.height = H;
  const ctx = gc.getContext("2d");

  const rng = (s) => {
    let x = Math.sin(s + 1) * 43758.5453;
    return x - Math.floor(x);
  };

  // ── Deep blue night sky ───────────────────
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0.0, "#01020c");
  sky.addColorStop(0.2, "#020510");
  sky.addColorStop(0.45, "#040a1e");
  sky.addColorStop(0.68, "#06102a");
  sky.addColorStop(0.85, "#081530");
  sky.addColorStop(1.0, "#0a1838");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // ── Milky Way — upper centre ──────────────
  const mwCX = W * 0.5;
  const mwCY = H * 0.2;

  // Soft outer glow
  const mwGlow = ctx.createRadialGradient(mwCX, mwCY, 0, mwCX, mwCY, W * 0.36);
  mwGlow.addColorStop(0, "rgba(120,150,220,0.10)");
  mwGlow.addColorStop(0.5, "rgba(80,110,190,0.04)");
  mwGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mwGlow;
  ctx.fillRect(0, 0, W, H);

  // Dense star cluster
  for (let i = 0; i < 3200; i++) {
    const angle = rng(i * 2.3) * Math.PI * 2;
    const dist = Math.pow(rng(i * 5.7), 0.5) * W * 0.3;
    const sx = mwCX + Math.cos(angle) * dist * 2.4 + (rng(i * 1.1) - 0.5) * 50;
    const sy = mwCY + Math.sin(angle) * dist * 0.42 + (rng(i * 3.3) - 0.5) * 28;
    if (sy < 0 || sy > H * 0.58) continue;
    const sr = 0.25 + rng(i * 4.1) * 0.95;
    const brt = 0.12 + rng(i * 7.3) * 0.75;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle =
      rng(i * 9.1) > 0.55
        ? `rgba(160,185,255,${brt})`
        : `rgba(220,230,255,${brt})`;
    ctx.fill();
  }

  // Bright core
  const core = ctx.createRadialGradient(mwCX, mwCY, 0, mwCX, mwCY, 160);
  core.addColorStop(0, "rgba(180,200,255,0.22)");
  core.addColorStop(0.4, "rgba(120,150,230,0.08)");
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, W, H);

  // ── Scattered stars ───────────────────────
  for (let i = 0; i < 500; i++) {
    const sx = rng(i * 3.7 + 10) * W;
    const sy = rng(i * 6.1 + 10) * H * 0.65;
    const sr = 0.25 + rng(i * 2.3 + 10) * 1.0;
    const brt = 0.15 + rng(i * 8.9 + 10) * 0.85;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,218,255,${brt})`;
    ctx.fill();
  }

  // ── Doorway glow — bright centre behind where doors will sit ──
  const doorCX = W * 0.5;
  const doorCY = H * 0.52;
  const doorGlow = ctx.createRadialGradient(
    doorCX,
    doorCY,
    0,
    doorCX,
    doorCY,
    W * 0.22,
  );
  doorGlow.addColorStop(0, "rgba(140,175,235,0.28)");
  doorGlow.addColorStop(0.3, "rgba(100,140,210,0.14)");
  doorGlow.addColorStop(0.7, "rgba(60,90,170,0.05)");
  doorGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = doorGlow;
  ctx.fillRect(0, 0, W, H);

  // ── Aerial city lights ────────────────────
  const CITY_TOP = H * 0.47;
  const CITY_BOTTOM = H * 0.82;
  const CITY_MID = H * 0.62;

  // Base city ambient glow
  const cityAmb = ctx.createRadialGradient(
    W * 0.5,
    CITY_MID,
    0,
    W * 0.5,
    CITY_MID,
    W * 0.6,
  );
  cityAmb.addColorStop(0, "rgba(40,65,140,0.20)");
  cityAmb.addColorStop(0.5, "rgba(25,45,110,0.10)");
  cityAmb.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = cityAmb;
  ctx.fillRect(0, 0, W, H);

  // City light dots — predominantly cool blue-white like the reference
  const LIGHT_COLORS = [
    [200, 220, 255], // cool blue-white (dominant)
    [180, 205, 255], // soft blue
    [215, 230, 255], // near-white blue
    [255, 240, 200], // warm white (occasional)
    [160, 195, 255], // mid blue
    [230, 240, 255], // bright white-blue
  ];
  const COLOR_WEIGHTS = [0.28, 0.22, 0.2, 0.1, 0.12, 0.08]; // cool dominant

  for (let i = 0; i < 14000; i++) {
    const rawX = rng(i * 2.71 + 1) * W;
    const rawY = CITY_TOP + rng(i * 3.14 + 2) * (CITY_BOTTOM - CITY_TOP);

    const yFrac = (rawY - CITY_TOP) / (CITY_BOTTOM - CITY_TOP);
    const densityY = Math.sin(yFrac * Math.PI) * 0.8 + 0.2;
    if (rng(i * 7.77 + 3) > densityY) continue;

    // Slight centre brightness — more lights visible through doorway
    const xFrac = (rawX / W - 0.5) * 2; // -1 to 1
    const densityX = 0.5 + 0.5 * Math.exp(-xFrac * xFrac * 1.2);
    if (rng(i * 5.55 + 4) > densityX) continue;

    // Pick color weighted toward cool
    let pick = rng(i * 11.1 + 5);
    let ci = 0;
    let acc = 0;
    for (let w = 0; w < COLOR_WEIGHTS.length; w++) {
      acc += COLOR_WEIGHTS[w];
      if (pick < acc) {
        ci = w;
        break;
      }
    }
    const col = LIGHT_COLORS[ci];
    const r = 0.3 + rng(i * 4.4 + 6) * 1.6;
    const a = 0.25 + rng(i * 6.6 + 7) * 0.65;

    if (r > 1.2) {
      const halo = ctx.createRadialGradient(rawX, rawY, 0, rawX, rawY, r * 4.5);
      halo.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${a * 0.25})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(rawX - r * 5, rawY - r * 5, r * 10, r * 10);
    }

    ctx.beginPath();
    ctx.arc(rawX, rawY, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`;
    ctx.fill();
  }

  // Faint street grid lines
  ctx.globalAlpha = 0.018;
  ctx.strokeStyle = "rgba(180,210,255,1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const lx = rng(i * 8.8 + 20) * W;
    ctx.beginPath();
    ctx.moveTo(lx, CITY_TOP);
    ctx.lineTo(lx + (rng(i * 3.3 + 21) - 0.5) * 60, CITY_BOTTOM);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  // ── Lower ground fade ─────────────────────
  const groundFade = ctx.createLinearGradient(0, CITY_BOTTOM - 50, 0, H);
  groundFade.addColorStop(0, "rgba(0,0,0,0)");
  groundFade.addColorStop(1, "rgba(2,4,14,1)");
  ctx.fillStyle = groundFade;
  ctx.fillRect(0, CITY_BOTTOM - 50, W, H - CITY_BOTTOM + 50);

  // ── Interior vignette — heavy dark sides ──
  const leftVig = ctx.createLinearGradient(0, 0, W * 0.32, 0);
  leftVig.addColorStop(0, "rgba(3,6,18,0.96)");
  leftVig.addColorStop(0.4, "rgba(3,6,18,0.55)");
  leftVig.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = leftVig;
  ctx.fillRect(0, 0, W * 0.32, H);

  const rightVig = ctx.createLinearGradient(W, 0, W * 0.68, 0);
  rightVig.addColorStop(0, "rgba(3,6,18,0.96)");
  rightVig.addColorStop(0.4, "rgba(3,6,18,0.55)");
  rightVig.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rightVig;
  ctx.fillRect(W * 0.68, 0, W * 0.32, H);

  // Top vignette
  const topVig = ctx.createLinearGradient(0, 0, 0, H * 0.16);
  topVig.addColorStop(0, "rgba(1,2,10,0.9)");
  topVig.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topVig;
  ctx.fillRect(0, 0, W, H * 0.16);

  // Bottom vignette (floor area)
  const botVig = ctx.createLinearGradient(0, H * 0.82, 0, H);
  botVig.addColorStop(0, "rgba(0,0,0,0)");
  botVig.addColorStop(1, "rgba(2,5,15,0.95)");
  ctx.fillStyle = botVig;
  ctx.fillRect(0, H * 0.82, W, H * 0.18);

  return new THREE.CanvasTexture(gc);
}

const cityTex = makeAerialNight();
scene.background = cityTex;

// Cool blue city ambient from behind/below
export const sunsetBackLight = new THREE.PointLight(0xffaa55, 1.4, 90);
sunsetBackLight.position.set(0, 5, -22);
scene.add(sunsetBackLight);

// Warm golden light from above
const moonLight = new THREE.PointLight(0xffcc77, 0.55, 80);
moonLight.position.set(6, 24, -14);
scene.add(moonLight);

// Warm left spill
const leftSpill = new THREE.PointLight(0xff9944, 0.28, 32);
leftSpill.position.set(-16, 4, -6);
scene.add(leftSpill);

// Warm right spill
const rightSpill = new THREE.PointLight(0xffaa55, 0.28, 32);
rightSpill.position.set(16, 4, -6);
scene.add(rightSpill);
