// ─────────────────────────────────────────
//  background.js  — aerial night city view
//  with skyscraper silhouettes, lit windows,
//  road streaks, and Milky Way just above
//  the city horizon.
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
  sky.addColorStop(0.0, "#010208");
  sky.addColorStop(0.18, "#020410");
  sky.addColorStop(0.38, "#030818");
  sky.addColorStop(0.55, "#050d22");
  sky.addColorStop(0.72, "#06102a");
  sky.addColorStop(1.0, "#081530");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // ── Milky Way — sits just above the city horizon ──
  const HORIZON_Y = H * 0.52; // where buildings meet sky
  const mwCX = W * 0.5;
  const mwCY = H * 0.28; // lower than before — near the horizon

  // Soft outer glow
  const mwGlow = ctx.createRadialGradient(mwCX, mwCY, 0, mwCX, mwCY, W * 0.38);
  mwGlow.addColorStop(0, "rgba(130,160,240,0.13)");
  mwGlow.addColorStop(0.45, "rgba(80,110,200,0.05)");
  mwGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mwGlow;
  ctx.fillRect(0, 0, W, H);

  // Dense Milky Way star cluster — horizontal band
  for (let i = 0; i < 4500; i++) {
    const angle = rng(i * 2.3) * Math.PI * 2;
    const dist = Math.pow(rng(i * 5.7), 0.5) * W * 0.32;
    const sx = mwCX + Math.cos(angle) * dist * 2.8 + (rng(i * 1.1) - 0.5) * 60;
    const sy = mwCY + Math.sin(angle) * dist * 0.35 + (rng(i * 3.3) - 0.5) * 22;
    if (sy < 0 || sy > HORIZON_Y - 20) continue;
    const sr = 0.2 + rng(i * 4.1) * 0.9;
    const brt = 0.1 + rng(i * 7.3) * 0.8;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle =
      rng(i * 9.1) > 0.5
        ? `rgba(160,190,255,${brt})`
        : `rgba(220,235,255,${brt})`;
    ctx.fill();
  }

  // Bright Milky Way core
  const core = ctx.createRadialGradient(mwCX, mwCY, 0, mwCX, mwCY, 180);
  core.addColorStop(0, "rgba(190,210,255,0.28)");
  core.addColorStop(0.35, "rgba(130,160,240,0.10)");
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, W, H);

  // ── Scattered stars across sky ────────────
  for (let i = 0; i < 600; i++) {
    const sx = rng(i * 3.7 + 10) * W;
    const sy = rng(i * 6.1 + 10) * (HORIZON_Y - 30);
    const sr = 0.2 + rng(i * 2.3 + 10) * 1.1;
    const brt = 0.12 + rng(i * 8.9 + 10) * 0.88;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(210,225,255,${brt})`;
    ctx.fill();
  }

  // ── Doorway / centre glow ────────────────
  const doorCX = W * 0.5;
  const doorCY = H * 0.48;
  const doorGlow = ctx.createRadialGradient(
    doorCX,
    doorCY,
    0,
    doorCX,
    doorCY,
    W * 0.26,
  );
  doorGlow.addColorStop(0, "rgba(150,185,245,0.32)");
  doorGlow.addColorStop(0.28, "rgba(100,145,220,0.16)");
  doorGlow.addColorStop(0.65, "rgba(60,95,175,0.06)");
  doorGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = doorGlow;
  ctx.fillRect(0, 0, W, H);

  // ══════════════════════════════════════════
  //  CITY SKYLINE WITH BUILDINGS
  // ══════════════════════════════════════════

  const CITY_TOP = H * 0.34; // tallest possible building top
  const CITY_BASE = H * 0.56; // ground level / street
  const CITY_BOTTOM = H * 0.85;

  // ── Build skyline silhouette path ─────────
  // We'll draw buildings as filled rectangles with dark silhouette
  // then punch in lit windows on top.

  // Generate building data: x, width, height
  const buildings = [];
  let bx = 0;
  while (bx < W) {
    const bw = 18 + rng(bx * 0.013 + 1) * 55;
    const bh = 20 + rng(bx * 0.017 + 2) * (CITY_BASE - CITY_TOP);
    // Taller buildings cluster near centre
    const centreFactor = 1.0 - Math.abs(bx / W - 0.5) * 0.9;
    const finalH = bh * (0.3 + centreFactor * 0.7);
    const by = CITY_BASE - finalH;
    buildings.push({ x: bx, w: bw, y: by, h: finalH });
    bx += bw + rng(bx * 0.019 + 3) * 4; // small gap between buildings
  }

  // ── Draw building silhouettes ─────────────
  ctx.save();

  // Base city glow / ambient haze at horizon
  const hazeGrad = ctx.createLinearGradient(
    0,
    CITY_TOP - 40,
    0,
    CITY_BASE + 60,
  );
  hazeGrad.addColorStop(0, "rgba(20,50,120,0)");
  hazeGrad.addColorStop(0.4, "rgba(30,70,160,0.12)");
  hazeGrad.addColorStop(1, "rgba(50,100,200,0.22)");
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, CITY_TOP - 40, W, CITY_BASE - CITY_TOP + 100);

  // Draw each building as a dark silhouette
  for (const b of buildings) {
    // Building body — very dark blue-black
    const buildGrad = ctx.createLinearGradient(0, b.y, 0, CITY_BASE);
    buildGrad.addColorStop(0, "rgba(6,12,30,0.88)");
    buildGrad.addColorStop(0.5, "rgba(4,9,24,0.93)");
    buildGrad.addColorStop(1, "rgba(2,6,18,0.97)");
    ctx.fillStyle = buildGrad;
    ctx.fillRect(b.x, b.y, b.w, b.h);

    // Very subtle blue-rim on left edge (moonlight/city glow rim light)
    ctx.fillStyle = "rgba(60,110,200,0.06)";
    ctx.fillRect(b.x, b.y, 1.5, b.h);

    // Roof edge highlight
    ctx.fillStyle = "rgba(80,130,220,0.10)";
    ctx.fillRect(b.x, b.y, b.w, 1.5);
  }

  // ── Lit windows ───────────────────────────
  for (const b of buildings) {
    const WW = 3; // window width
    const WH = 4; // window height
    const gapX = 5;
    const gapY = 7;

    for (let wy = b.y + 8; wy < CITY_BASE - 6; wy += WH + gapY) {
      for (let wx = b.x + 4; wx < b.x + b.w - 4; wx += WW + gapX) {
        const seed = wx * 1.3 + wy * 7.7;
        if (rng(seed) > 0.38) continue; // ~38% of windows lit

        const brightness = 0.45 + rng(seed * 3.1) * 0.55;
        // Colour: mostly cool white-blue, occasional warm yellow
        const warm = rng(seed * 5.5) > 0.75;
        let wColor;
        if (warm) {
          wColor = `rgba(255,230,140,${brightness * 0.85})`;
        } else {
          const b2 = Math.floor(200 + rng(seed * 2.2) * 55);
          wColor = `rgba(${Math.floor(b2 * 0.82)},${Math.floor(b2 * 0.9)},${b2},${brightness * 0.9})`;
        }
        ctx.fillStyle = wColor;
        ctx.fillRect(wx, wy, WW, WH);

        // Window glow halo for brighter windows
        if (brightness > 0.7) {
          const haloG = ctx.createRadialGradient(
            wx + WW / 2,
            wy + WH / 2,
            0,
            wx + WW / 2,
            wy + WH / 2,
            7,
          );
          haloG.addColorStop(
            0,
            warm
              ? `rgba(255,220,100,${brightness * 0.12})`
              : `rgba(150,190,255,${brightness * 0.12})`,
          );
          haloG.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = haloG;
          ctx.fillRect(wx - 6, wy - 6, WW + 12, WH + 12);
        }
      }
    }
  }

  // ── Ground / street level ─────────────────
  // Dark ground mass below buildings
  const groundGrad = ctx.createLinearGradient(0, CITY_BASE, 0, CITY_BOTTOM);
  groundGrad.addColorStop(0, "rgba(8,18,45,1)");
  groundGrad.addColorStop(0.3, "rgba(5,12,32,1)");
  groundGrad.addColorStop(1, "rgba(2,6,16,1)");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, CITY_BASE, W, CITY_BOTTOM - CITY_BASE);

  // ── Road streaks / street lights ──────────
  // Horizontal glowing roads receding into distance
  const ROAD_COLOURS = [
    "rgba(200,220,255,0.22)", // cool white road
    "rgba(255,220,120,0.18)", // warm orange street lamp
    "rgba(180,210,255,0.15)", // soft blue road
  ];

  for (let ri = 0; ri < 8; ri++) {
    const ry = CITY_BASE + rng(ri * 4.4 + 1) * (CITY_BOTTOM - CITY_BASE - 10);
    const roadW = 0.5 + rng(ri * 3.3 + 2) * 1.5;
    const col = ROAD_COLOURS[ri % ROAD_COLOURS.length];

    ctx.strokeStyle = col;
    ctx.lineWidth = roadW;
    ctx.beginPath();
    ctx.moveTo(0, ry);
    ctx.lineTo(W, ry);
    ctx.stroke();
  }

  // Converging perspective road lines towards the centre
  for (let li = 0; li < 14; li++) {
    const startX = rng(li * 6.6 + 10) * W;
    const alpha = 0.04 + rng(li * 9.1 + 11) * 0.1;
    const warm2 = rng(li * 2.2) > 0.6;
    ctx.strokeStyle = warm2
      ? `rgba(255,210,100,${alpha})`
      : `rgba(160,200,255,${alpha})`;
    ctx.lineWidth = 0.6 + rng(li * 4.4) * 1.0;
    ctx.beginPath();
    ctx.moveTo(startX, CITY_BOTTOM);
    ctx.lineTo(W * 0.5 + (startX - W * 0.5) * 0.2, CITY_BASE + 10);
    ctx.stroke();
  }

  // ── City ambient / ground glow pool ───────
  const gndPool = ctx.createRadialGradient(
    W * 0.5,
    CITY_BASE + 20,
    0,
    W * 0.5,
    CITY_BASE + 20,
    W * 0.5,
  );
  gndPool.addColorStop(0, "rgba(40,80,180,0.18)");
  gndPool.addColorStop(0.4, "rgba(20,50,130,0.08)");
  gndPool.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gndPool;
  ctx.fillRect(0, CITY_BASE - 20, W, CITY_BOTTOM - CITY_BASE + 40);

  ctx.restore();

  // ── Lower ground fade ─────────────────────
  const groundFade = ctx.createLinearGradient(0, CITY_BOTTOM - 20, 0, H);
  groundFade.addColorStop(0, "rgba(0,0,0,0)");
  groundFade.addColorStop(1, "rgba(2,4,14,1)");
  ctx.fillStyle = groundFade;
  ctx.fillRect(0, CITY_BOTTOM - 20, W, H - CITY_BOTTOM + 20);

  // ── Interior vignette — heavy dark sides ──
  const leftVig = ctx.createLinearGradient(0, 0, W * 0.3, 0);
  leftVig.addColorStop(0, "rgba(2,5,16,0.97)");
  leftVig.addColorStop(0.45, "rgba(2,5,16,0.52)");
  leftVig.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = leftVig;
  ctx.fillRect(0, 0, W * 0.3, H);

  const rightVig = ctx.createLinearGradient(W, 0, W * 0.7, 0);
  rightVig.addColorStop(0, "rgba(2,5,16,0.97)");
  rightVig.addColorStop(0.45, "rgba(2,5,16,0.52)");
  rightVig.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rightVig;
  ctx.fillRect(W * 0.7, 0, W * 0.3, H);

  // Top vignette
  const topVig = ctx.createLinearGradient(0, 0, 0, H * 0.14);
  topVig.addColorStop(0, "rgba(1,2,10,0.92)");
  topVig.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topVig;
  ctx.fillRect(0, 0, W, H * 0.14);

  // Bottom vignette
  const botVig = ctx.createLinearGradient(0, H * 0.84, 0, H);
  botVig.addColorStop(0, "rgba(0,0,0,0)");
  botVig.addColorStop(1, "rgba(2,5,15,0.97)");
  ctx.fillStyle = botVig;
  ctx.fillRect(0, H * 0.84, W, H * 0.16);

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
