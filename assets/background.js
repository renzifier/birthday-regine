// ─────────────────────────────────────────
//  background.js  — aerial night city view
//  with skyscraper silhouettes, hero towers,
//  lit windows, road streaks, and Milky Way
//  just above the city horizon.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";
import { rng } from "./utils.js";

function makeAerialNight() {
  // Halve texture resolution on narrow/mobile screens — no visible difference,
  // saves significant GPU texture memory.
  const isMobile = window.innerWidth < 768;
  const W = isMobile ? 1024 : 2048;
  const H = isMobile ? 512 : 1024;
  const gc = document.createElement("canvas");
  gc.width = W;
  gc.height = H;
  const ctx = gc.getContext("2d");

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
  const HORIZON_Y = H * 0.52;
  const mwCX = W * 0.5;
  const mwCY = H * 0.28;

  const mwGlow = ctx.createRadialGradient(mwCX, mwCY, 0, mwCX, mwCY, W * 0.38);
  mwGlow.addColorStop(0, "rgba(130,160,240,0.13)");
  mwGlow.addColorStop(0.45, "rgba(80,110,200,0.05)");
  mwGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mwGlow;
  ctx.fillRect(0, 0, W, H);

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

  const core = ctx.createRadialGradient(mwCX, mwCY, 0, mwCX, mwCY, 180);
  core.addColorStop(0, "rgba(190,210,255,0.28)");
  core.addColorStop(0.35, "rgba(130,160,240,0.10)");
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, W, H);

  // ── Scattered stars ───────────────────────
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

  // ── Doorway / centre glow ─────────────────
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
  //  CITY SKYLINE
  // ══════════════════════════════════════════
  const CITY_TOP = H * 0.34;
  const CITY_BASE = H * 0.56;
  const CITY_BOTTOM = H * 0.85;

  // ── Horizon haze ──────────────────────────
  const hazeGrad = ctx.createLinearGradient(
    0,
    CITY_TOP - 60,
    0,
    CITY_BASE + 40,
  );
  hazeGrad.addColorStop(0, "rgba(20,50,120,0)");
  hazeGrad.addColorStop(0.5, "rgba(30,70,160,0.14)");
  hazeGrad.addColorStop(1, "rgba(50,100,200,0.26)");
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, CITY_TOP - 60, W, CITY_BASE - CITY_TOP + 100);

  // ── Regular background buildings ──────────
  const buildings = [];
  let bx = 0;
  while (bx < W) {
    const bw = 18 + rng(bx * 0.013 + 1) * 55;
    const bh = 20 + rng(bx * 0.017 + 2) * (CITY_BASE - CITY_TOP);
    const centreFactor = 1.0 - Math.abs(bx / W - 0.5) * 0.9;
    const finalH = bh * (0.3 + centreFactor * 0.7);
    const by = CITY_BASE - finalH;
    buildings.push({ x: bx, w: bw, y: by, h: finalH });
    bx += bw + rng(bx * 0.019 + 3) * 4;
  }

  // Draw regular silhouettes
  for (const b of buildings) {
    const buildGrad = ctx.createLinearGradient(0, b.y, 0, CITY_BASE);
    buildGrad.addColorStop(0, "rgba(6,12,30,0.88)");
    buildGrad.addColorStop(0.5, "rgba(4,9,24,0.93)");
    buildGrad.addColorStop(1, "rgba(2,6,18,0.97)");
    ctx.fillStyle = buildGrad;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = "rgba(80,130,220,0.10)";
    ctx.fillRect(b.x, b.y, 1.5, b.h);
    ctx.fillStyle = "rgba(80,130,220,0.10)";
    ctx.fillRect(b.x, b.y, b.w, 1.5);
  }

  // Windows on regular buildings
  for (const b of buildings) {
    const WW = 3,
      WH = 4,
      gapX = 5,
      gapY = 7;
    for (let wy = b.y + 8; wy < CITY_BASE - 6; wy += WH + gapY) {
      for (let wx = b.x + 4; wx < b.x + b.w - 4; wx += WW + gapX) {
        const seed = wx * 1.3 + wy * 7.7;
        if (rng(seed) > 0.38) continue;
        const brightness = 0.45 + rng(seed * 3.1) * 0.55;
        const warm = rng(seed * 5.5) > 0.75;
        if (warm) {
          ctx.fillStyle = `rgba(255,230,140,${brightness * 0.85})`;
        } else {
          const b2 = Math.floor(200 + rng(seed * 2.2) * 55);
          ctx.fillStyle = `rgba(${Math.floor(b2 * 0.82)},${Math.floor(b2 * 0.9)},${b2},${brightness * 0.9})`;
        }
        ctx.fillRect(wx, wy, WW, WH);
      }
    }
  }

  // ── Hero skyscrapers ──────────────────────
  const heroTowers = [
    // Centre-left — tallest, tapered spire
    {
      cx: W * 0.44,
      baseY: CITY_BASE,
      floors: [
        { w: 40, h: CITY_BASE - H * 0.14 },
        { w: 30, h: CITY_BASE - H * 0.19 },
        { w: 19, h: CITY_BASE - H * 0.235 },
        { w: 10, h: CITY_BASE - H * 0.262 },
        { w: 4, h: CITY_BASE - H * 0.282 },
      ],
      glowCol: "rgba(80,135,230,0.38)",
      glowR: 90,
      antenna: true,
    },
    // Right of centre — slightly shorter, blocky
    {
      cx: W * 0.575,
      baseY: CITY_BASE,
      floors: [
        { w: 46, h: CITY_BASE - H * 0.12 },
        { w: 34, h: CITY_BASE - H * 0.162 },
        { w: 22, h: CITY_BASE - H * 0.192 },
        { w: 9, h: CITY_BASE - H * 0.212 },
      ],
      glowCol: "rgba(60,110,205,0.28)",
      glowR: 70,
      antenna: false,
    },
    // Far left — medium
    {
      cx: W * 0.25,
      baseY: CITY_BASE,
      floors: [
        { w: 30, h: CITY_BASE - H * 0.1 },
        { w: 20, h: CITY_BASE - H * 0.132 },
        { w: 9, h: CITY_BASE - H * 0.154 },
      ],
      glowCol: "rgba(50,95,185,0.22)",
      glowR: 55,
      antenna: false,
    },
    // Far right — medium
    {
      cx: W * 0.735,
      baseY: CITY_BASE,
      floors: [
        { w: 32, h: CITY_BASE - H * 0.105 },
        { w: 22, h: CITY_BASE - H * 0.138 },
        { w: 10, h: CITY_BASE - H * 0.16 },
      ],
      glowCol: "rgba(50,95,185,0.22)",
      glowR: 55,
      antenna: false,
    },
  ];

  for (const tower of heroTowers) {
    const tallestH = Math.max(...tower.floors.map((f) => f.h));
    const towerTopY = CITY_BASE - tallestH;

    // Atmospheric glow around tower top
    const tg = ctx.createRadialGradient(
      tower.cx,
      towerTopY + 20,
      0,
      tower.cx,
      towerTopY + 20,
      tower.glowR,
    );
    tg.addColorStop(0, tower.glowCol);
    tg.addColorStop(0.5, tower.glowCol.replace(/[\d.]+\)$/, "0.08)"));
    tg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = tg;
    ctx.fillRect(
      tower.cx - tower.glowR,
      towerTopY - tower.glowR * 0.6,
      tower.glowR * 2,
      tower.glowR * 2,
    );

    // Draw floors from widest (first) to narrowest (last)
    for (const floor of tower.floors) {
      const fx = tower.cx - floor.w / 2;
      const fy = CITY_BASE - floor.h;

      const fg = ctx.createLinearGradient(0, fy, 0, CITY_BASE);
      fg.addColorStop(0, "rgba(5,10,26,0.93)");
      fg.addColorStop(0.4, "rgba(4,8,20,0.96)");
      fg.addColorStop(1, "rgba(2,5,15,0.99)");
      ctx.fillStyle = fg;
      ctx.fillRect(fx, fy, floor.w, floor.h);

      // Rim lights on edges
      ctx.fillStyle = "rgba(100,155,240,0.22)";
      ctx.fillRect(fx, fy, 2, floor.h);
      ctx.fillStyle = "rgba(75,125,215,0.13)";
      ctx.fillRect(fx + floor.w - 2, fy, 2, floor.h);

      // Roof edge
      ctx.fillStyle = "rgba(130,180,255,0.28)";
      ctx.fillRect(fx, fy, floor.w, 2.5);
    }

    // Windows on hero tower (main/widest floor)
    const mf = tower.floors[0];
    const mfx = tower.cx - mf.w / 2;
    const mfy = CITY_BASE - mf.h;
    const WW = 4,
      WH = 5,
      gapX = 6,
      gapY = 9;
    for (let wy = mfy + 14; wy < CITY_BASE - 8; wy += WH + gapY) {
      for (let wx = mfx + 5; wx < mfx + mf.w - 5; wx += WW + gapX) {
        const seed = wx * 1.7 + wy * 6.3 + 9000;
        if (rng(seed) > 0.45) continue;
        const brightness = 0.5 + rng(seed * 2.9) * 0.5;
        const warm = rng(seed * 4.4) > 0.7;
        if (warm) {
          ctx.fillStyle = `rgba(255,235,150,${brightness * 0.9})`;
        } else {
          const bv = Math.floor(210 + rng(seed * 3.3) * 45);
          ctx.fillStyle = `rgba(${Math.floor(bv * 0.78)},${Math.floor(bv * 0.88)},${bv},${brightness})`;
        }
        ctx.fillRect(wx, wy, WW, WH);

        if (brightness > 0.75) {
          const hg = ctx.createRadialGradient(
            wx + WW / 2,
            wy + WH / 2,
            0,
            wx + WW / 2,
            wy + WH / 2,
            9,
          );
          hg.addColorStop(
            0,
            warm ? `rgba(255,215,90,0.14)` : `rgba(140,185,255,0.14)`,
          );
          hg.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = hg;
          ctx.fillRect(wx - 8, wy - 8, WW + 16, WH + 16);
        }
      }
    }

    // Antenna / spire on tallest tower
    if (tower.antenna) {
      const spireY = CITY_BASE - tallestH - 8;
      const ag = ctx.createRadialGradient(
        tower.cx,
        spireY,
        0,
        tower.cx,
        spireY,
        14,
      );
      ag.addColorStop(0, "rgba(255,70,70,0.95)");
      ag.addColorStop(0.3, "rgba(255,50,50,0.38)");
      ag.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ag;
      ctx.fillRect(tower.cx - 14, spireY - 14, 28, 28);
      ctx.beginPath();
      ctx.arc(tower.cx, spireY, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,130,130,1)";
      ctx.fill();
    }
  }

  // ── Ground / street level ─────────────────
  const groundGrad = ctx.createLinearGradient(0, CITY_BASE, 0, CITY_BOTTOM);
  groundGrad.addColorStop(0, "rgba(8,18,45,1)");
  groundGrad.addColorStop(0.3, "rgba(5,12,32,1)");
  groundGrad.addColorStop(1, "rgba(2,6,16,1)");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, CITY_BASE, W, CITY_BOTTOM - CITY_BASE);

  // Road streaks
  const ROAD_COLOURS = [
    "rgba(200,220,255,0.22)",
    "rgba(255,220,120,0.18)",
    "rgba(180,210,255,0.15)",
  ];
  for (let ri = 0; ri < 8; ri++) {
    const ry = CITY_BASE + rng(ri * 4.4 + 1) * (CITY_BOTTOM - CITY_BASE - 10);
    ctx.strokeStyle = ROAD_COLOURS[ri % ROAD_COLOURS.length];
    ctx.lineWidth = 0.5 + rng(ri * 3.3 + 2) * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, ry);
    ctx.lineTo(W, ry);
    ctx.stroke();
  }
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

  // Ground glow pool
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

  // ── Lower ground fade ─────────────────────
  const groundFade = ctx.createLinearGradient(0, CITY_BOTTOM - 20, 0, H);
  groundFade.addColorStop(0, "rgba(0,0,0,0)");
  groundFade.addColorStop(1, "rgba(2,4,14,1)");
  ctx.fillStyle = groundFade;
  ctx.fillRect(0, CITY_BOTTOM - 20, W, H - CITY_BOTTOM + 20);

  // ── Vignettes ─────────────────────────────
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

  const topVig = ctx.createLinearGradient(0, 0, 0, H * 0.14);
  topVig.addColorStop(0, "rgba(1,2,10,0.92)");
  topVig.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topVig;
  ctx.fillRect(0, 0, W, H * 0.14);

  const botVig = ctx.createLinearGradient(0, H * 0.84, 0, H);
  botVig.addColorStop(0, "rgba(0,0,0,0)");
  botVig.addColorStop(1, "rgba(2,5,15,0.97)");
  ctx.fillStyle = botVig;
  ctx.fillRect(0, H * 0.84, W, H * 0.16);

  return new THREE.CanvasTexture(gc);
}

const cityTex = makeAerialNight();
scene.background = cityTex;

// Renamed from sunsetBackLight — this is city/ambient back light, not a sunset
export const cityBackLight = new THREE.PointLight(0xffaa55, 1.4, 90);
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
