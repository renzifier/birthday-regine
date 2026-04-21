// ─────────────────────────────────────────
//  background.js  — aerial night city view
//  Matches reference: deep navy interior,
//  city skyline with building silhouettes
//  visible on sides, dramatic Milky Way
//  framed through the open doorway.
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

  // ── 1. Deep navy base — interior walls ──────────────
  const wallBg = ctx.createLinearGradient(0, 0, 0, H);
  wallBg.addColorStop(0.0, "#010510");
  wallBg.addColorStop(0.35, "#020a1a");
  wallBg.addColorStop(0.65, "#040e22");
  wallBg.addColorStop(1.0, "#06112a");
  ctx.fillStyle = wallBg;
  ctx.fillRect(0, 0, W, H);

  // ── 2. City glow layer — covers the full lower half ─
  //    Visible on sides AND through door, so no heavy vignette
  const CITY_TOP = H * 0.4;
  const CITY_BOTTOM = H * 0.8;
  const SKYLINE_Y = H * 0.52; // where building tops peak

  // Ambient city glow (wide, covers full width)
  const cityAmb = ctx.createLinearGradient(0, CITY_TOP, 0, CITY_BOTTOM);
  cityAmb.addColorStop(0, "rgba(30,60,120,0.55)");
  cityAmb.addColorStop(0.5, "rgba(15,35,90,0.35)");
  cityAmb.addColorStop(1, "rgba(5,15,50,0.15)");
  ctx.fillStyle = cityAmb;
  ctx.fillRect(0, CITY_TOP, W, CITY_BOTTOM - CITY_TOP);

  // ── 3. Stars — upper sky ────────────────────────────
  for (let i = 0; i < 600; i++) {
    const sx = rng(i * 3.7 + 10) * W;
    const sy = rng(i * 6.1 + 10) * H * 0.55;
    const sr = 0.3 + rng(i * 2.3 + 10) * 1.1;
    const brt = 0.1 + rng(i * 8.9 + 10) * 0.8;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,218,255,${brt})`;
    ctx.fill();
  }

  // ── 4. Milky Way — centred, framed by the doorway ───
  const mwCX = W * 0.5;
  const mwCY = H * 0.22;

  // Outer soft glow
  const mwGlow = ctx.createRadialGradient(mwCX, mwCY, 0, mwCX, mwCY, W * 0.22);
  mwGlow.addColorStop(0, "rgba(130,165,240,0.18)");
  mwGlow.addColorStop(0.4, "rgba(80,120,200,0.08)");
  mwGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mwGlow;
  ctx.fillRect(0, 0, W, H);

  // Dense star band — narrow vertical strip centred
  for (let i = 0; i < 4000; i++) {
    const angle = rng(i * 2.3) * Math.PI * 2;
    const dist = Math.pow(rng(i * 5.7), 0.5) * W * 0.2;
    const sx = mwCX + Math.cos(angle) * dist * 1.8 + (rng(i * 1.1) - 0.5) * 30;
    const sy = mwCY + Math.sin(angle) * dist * 0.38 + (rng(i * 3.3) - 0.5) * 20;
    if (sy < 0 || sy > H * 0.52) continue;
    const sr = 0.2 + rng(i * 4.1) * 0.9;
    const brt = 0.15 + rng(i * 7.3) * 0.8;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle =
      rng(i * 9.1) > 0.5
        ? `rgba(165,192,255,${brt})`
        : `rgba(225,235,255,${brt})`;
    ctx.fill();
  }

  // Bright Milky Way core
  const core = ctx.createRadialGradient(mwCX, mwCY, 0, mwCX, mwCY, 130);
  core.addColorStop(0, "rgba(190,210,255,0.30)");
  core.addColorStop(0.4, "rgba(120,155,235,0.12)");
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, W, H);

  // ── 5. City light dots — full width, no centre bias ─
  const LIGHT_COLORS = [
    [210, 230, 255], // cool blue-white (dominant)
    [185, 210, 255], // soft blue
    [240, 248, 255], // near-white
    [160, 200, 255], // mid blue
    [255, 248, 210], // warm accent (rare)
  ];
  const COLOR_WEIGHTS = [0.3, 0.25, 0.22, 0.15, 0.08];

  for (let i = 0; i < 18000; i++) {
    const rawX = rng(i * 2.71 + 1) * W;
    const rawY = CITY_TOP + rng(i * 3.14 + 2) * (CITY_BOTTOM - CITY_TOP);

    const yFrac = (rawY - CITY_TOP) / (CITY_BOTTOM - CITY_TOP);
    const densityY = Math.sin(yFrac * Math.PI) * 0.75 + 0.25;
    if (rng(i * 7.77 + 3) > densityY) continue;

    // Pick colour
    let pick = rng(i * 11.1 + 5),
      ci = 0,
      acc = 0;
    for (let w = 0; w < COLOR_WEIGHTS.length; w++) {
      acc += COLOR_WEIGHTS[w];
      if (pick < acc) {
        ci = w;
        break;
      }
    }
    const col = LIGHT_COLORS[ci];
    const r = 0.35 + rng(i * 4.4 + 6) * 1.8;
    const a = 0.2 + rng(i * 6.6 + 7) * 0.7;

    if (r > 1.3) {
      const halo = ctx.createRadialGradient(rawX, rawY, 0, rawX, rawY, r * 5);
      halo.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${a * 0.22})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(rawX - r * 5, rawY - r * 5, r * 10, r * 10);
    }

    ctx.beginPath();
    ctx.arc(rawX, rawY, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`;
    ctx.fill();
  }

  // ── 6. Building silhouettes ──────────────────────────
  //    Draw dark jagged skylines left, centre, right.
  //    Silhouettes sit just above the city light band.
  function drawSkyline(startX, endX, seed, baseY, heightRange, buildingW) {
    ctx.beginPath();
    ctx.moveTo(startX, H);
    let x = startX;
    while (x < endX) {
      const bw = buildingW * (0.6 + rng(seed + x * 0.01) * 0.8);
      const bh =
        heightRange[0] +
        rng(seed + x * 0.013) * (heightRange[1] - heightRange[0]);
      const top = baseY - bh;
      ctx.lineTo(x, top);
      // Rooftop details
      if (rng(seed + x * 0.07) > 0.6) {
        const antH = 6 + rng(seed + x * 0.09) * 14;
        const antX = x + bw * 0.5;
        ctx.lineTo(antX - 1, top);
        ctx.lineTo(antX - 1, top - antH);
        ctx.lineTo(antX + 1, top - antH);
        ctx.lineTo(antX + 1, top);
      }
      ctx.lineTo(x + bw, top);
      ctx.lineTo(x + bw, baseY);
      x += bw + rng(seed + x * 0.017) * 4;
    }
    ctx.lineTo(endX, H);
    ctx.closePath();
  }

  // Back-row silhouette (shorter, lighter — further away)
  ctx.fillStyle = "rgba(5,12,30,0.72)";
  drawSkyline(0, W, 77, SKYLINE_Y + 20, [30, 90], 22);

  // Mid-row silhouette
  ctx.fillStyle = "rgba(3,8,22,0.88)";
  drawSkyline(0, W * 0.42, 13, SKYLINE_Y + 5, [55, 130], 28);
  drawSkyline(W * 0.58, W, 91, SKYLINE_Y + 5, [55, 130], 28);

  // Centre buildings (through the doorway gap)
  ctx.fillStyle = "rgba(3,8,22,0.88)";
  drawSkyline(W * 0.38, W * 0.62, 44, SKYLINE_Y, [60, 160], 24);

  // Front-row / closest buildings (tallest, darkest)
  ctx.fillStyle = "rgba(2,5,14,0.95)";
  drawSkyline(0, W * 0.32, 55, SKYLINE_Y + 30, [80, 180], 34);
  drawSkyline(W * 0.68, W, 33, SKYLINE_Y + 30, [80, 180], 34);

  // Building windows — tiny warm/cool dots on dark buildings
  for (let i = 0; i < 2200; i++) {
    const wx = rng(i * 3.11 + 20) * W;
    const wy = SKYLINE_Y - 10 + rng(i * 4.55 + 20) * 130;
    if (wy > CITY_BOTTOM - 20) continue;
    const wa = 0.12 + rng(i * 7.77 + 20) * 0.55;
    const wc =
      rng(i * 5.33 + 20) > 0.8
        ? `rgba(255,240,180,${wa})`
        : `rgba(180,215,255,${wa})`;
    ctx.fillStyle = wc;
    ctx.fillRect(wx, wy, 1.5 + rng(i * 2.2) * 1.5, 1.2 + rng(i * 3.3) * 1.2);
  }

  // ── 7. Ground / lower fade ───────────────────────────
  const groundFade = ctx.createLinearGradient(0, CITY_BOTTOM - 40, 0, H);
  groundFade.addColorStop(0, "rgba(0,0,0,0)");
  groundFade.addColorStop(1, "rgba(2,5,15,1)");
  ctx.fillStyle = groundFade;
  ctx.fillRect(0, CITY_BOTTOM - 40, W, H - CITY_BOTTOM + 40);

  // ── 8. Doorway glow — bright centre portal ───────────
  const doorCX = W * 0.5;
  const doorCY = H * 0.46;
  const doorGlow = ctx.createRadialGradient(
    doorCX,
    doorCY,
    0,
    doorCX,
    doorCY,
    W * 0.18,
  );
  doorGlow.addColorStop(0, "rgba(160,195,255,0.32)");
  doorGlow.addColorStop(0.3, "rgba(100,150,220,0.14)");
  doorGlow.addColorStop(0.7, "rgba(50,90,180,0.05)");
  doorGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = doorGlow;
  ctx.fillRect(0, 0, W, H);

  // ── 9. Interior wall overlay — upper sides only ──────
  //    Darker near the top corners (ceiling/wall), fades
  //    out before the city band so skyline stays visible.
  const leftWall = ctx.createLinearGradient(0, 0, W * 0.28, 0);
  leftWall.addColorStop(0, "rgba(2,6,20,0.88)");
  leftWall.addColorStop(0.5, "rgba(2,6,20,0.40)");
  leftWall.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = leftWall;
  ctx.fillRect(0, 0, W * 0.28, H * 0.55);

  const rightWall = ctx.createLinearGradient(W, 0, W * 0.72, 0);
  rightWall.addColorStop(0, "rgba(2,6,20,0.88)");
  rightWall.addColorStop(0.5, "rgba(2,6,20,0.40)");
  rightWall.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rightWall;
  ctx.fillRect(W * 0.72, 0, W * 0.28, H * 0.55);

  // Top edge vignette
  const topVig = ctx.createLinearGradient(0, 0, 0, H * 0.12);
  topVig.addColorStop(0, "rgba(1,3,12,0.92)");
  topVig.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topVig;
  ctx.fillRect(0, 0, W, H * 0.12);

  return new THREE.CanvasTexture(gc);
}

const cityTex = makeAerialNight();
scene.background = cityTex;

// Cool blue city ambient from behind
export const sunsetBackLight = new THREE.PointLight(0xffaa55, 1.4, 90);
sunsetBackLight.position.set(0, 5, -22);
scene.add(sunsetBackLight);

// Moonlight
const moonLight = new THREE.PointLight(0xaaccff, 0.6, 80);
moonLight.position.set(6, 24, -14);
scene.add(moonLight);

// Side spills — cool blue to match city walls
const leftSpill = new THREE.PointLight(0x2255aa, 0.5, 36);
leftSpill.position.set(-16, 4, -6);
scene.add(leftSpill);

const rightSpill = new THREE.PointLight(0x1a4488, 0.5, 36);
rightSpill.position.set(16, 4, -6);
scene.add(rightSpill);
