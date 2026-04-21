// ─────────────────────────────────────────
//  background.js  — city at night skyline
//  Rooftop birthday party vibes 🏙️🎂
// ─────────────────────────────────────────
import { scene } from "./renderer.js";

function makeCityNight() {
  const W = 2048,
    H = 1024;
  const gc = document.createElement("canvas");
  gc.width = W;
  gc.height = H;
  const ctx = gc.getContext("2d");

  // ── Sky gradient ─────────────────────────
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0.0, "#02040e");
  sky.addColorStop(0.3, "#060c1f");
  sky.addColorStop(0.6, "#0b1530");
  sky.addColorStop(0.82, "#12234a");
  sky.addColorStop(1.0, "#1a2f5a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // ── Stars ────────────────────────────────
  const rng = (s) => {
    let x = Math.sin(s + 1) * 43758.5453;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 280; i++) {
    const sx = rng(i * 3.7) * W;
    const sy = rng(i * 6.1) * H * 0.65;
    const sr = 0.4 + rng(i * 2.3) * 1.2;
    const brt = 0.3 + rng(i * 8.9) * 0.7;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(210,225,255,${brt})`;
    ctx.fill();
  }

  // ── Moon ─────────────────────────────────
  const moonX = W * 0.78,
    moonY = H * 0.18;
  const moon = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 52);
  moon.addColorStop(0, "rgba(255,252,230,1.0)");
  moon.addColorStop(0.5, "rgba(220,235,255,0.9)");
  moon.addColorStop(1, "rgba(100,140,220,0)");
  ctx.fillStyle = moon;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 52, 0, Math.PI * 2);
  ctx.fill();
  // moon halo
  const halo = ctx.createRadialGradient(moonX, moonY, 48, moonX, moonY, 160);
  halo.addColorStop(0, "rgba(160,190,255,0.12)");
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  // ── City glow on horizon ─────────────────
  const horizonY = H * 0.68;
  const cityGlow = ctx.createLinearGradient(0, horizonY - 60, 0, horizonY + 80);
  cityGlow.addColorStop(0, "rgba(0,0,0,0)");
  cityGlow.addColorStop(0.4, "rgba(255,140,40,0.08)");
  cityGlow.addColorStop(1, "rgba(255,100,20,0.18)");
  ctx.fillStyle = cityGlow;
  ctx.fillRect(0, 0, W, H);

  // ── Draw buildings ───────────────────────
  // Each building: { x, w, h, windows cols, rows }
  const GROUND = H * 0.98;

  function drawBuilding(x, w, h, winCols, winRows, roofStyle) {
    const top = GROUND - h;

    // Building body — dark with slight blue tint
    const bgrad = ctx.createLinearGradient(x, top, x + w, top);
    bgrad.addColorStop(0, "#0a0f1a");
    bgrad.addColorStop(0.5, "#0d1525");
    bgrad.addColorStop(1, "#080c16");
    ctx.fillStyle = bgrad;
    ctx.fillRect(x, top, w, h);

    // Edge highlight (moonlight catching left edge)
    ctx.fillStyle = "rgba(100,140,220,0.12)";
    ctx.fillRect(x, top, 3, h);

    // Windows
    const winW = Math.max(4, w / (winCols * 2.2));
    const winH = Math.max(5, h / (winRows * 2.5));
    const padX = (w - winCols * winW * 2) / (winCols + 1);
    const padY = 18;

    for (let row = 0; row < winRows; row++) {
      for (let col = 0; col < winCols; col++) {
        const wx = x + padX + col * (winW + padX);
        const wy = top + padY + row * (winH + padY * 0.8);
        if (wy + winH > GROUND - 5) continue;

        // Random lit/unlit, warm/cool
        const seed = x * 0.01 + row * 100 + col * 7;
        const lit = rng(seed) > 0.3;
        if (!lit) {
          ctx.fillStyle = "rgba(20,25,40,0.8)";
        } else {
          const warm = rng(seed * 3) > 0.4;
          if (warm) {
            const brightness = 0.5 + rng(seed * 7) * 0.5;
            ctx.fillStyle = `rgba(255,${Math.floor(180 + rng(seed * 2) * 60)},${Math.floor(60 + rng(seed * 4) * 60)},${brightness})`;
          } else {
            ctx.fillStyle = `rgba(${Math.floor(140 + rng(seed * 5) * 80)},${Math.floor(180 + rng(seed * 6) * 60)},255,${0.4 + rng(seed * 8) * 0.4})`;
          }
          // Window glow
          const wglow = ctx.createRadialGradient(
            wx + winW / 2,
            wy + winH / 2,
            0,
            wx + winW / 2,
            wy + winH / 2,
            winW * 2,
          );
          wglow.addColorStop(0, ctx.fillStyle.replace(/[\d.]+\)$/, "0.15)"));
          wglow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = wglow;
          ctx.fillRect(wx - winW, wy - winH, winW * 3, winH * 3);
        }
        // Window rect
        ctx.fillStyle = lit
          ? rng(x * 0.01 + row * 100 + col * 7 + 1) > 0.4
            ? `rgba(255,${Math.floor(200 + rng(x * 0.01 + row * 100 + col * 7) * 40)},100,0.85)`
            : `rgba(180,210,255,0.75)`
          : "rgba(15,20,35,0.9)";
        ctx.fillRect(wx, wy, winW, winH);
      }
    }

    // Roof styles
    if (roofStyle === "antenna") {
      ctx.strokeStyle = "rgba(150,170,210,0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, top);
      ctx.lineTo(x + w / 2, top - 35);
      ctx.stroke();
      // Blinking red light
      ctx.fillStyle = "rgba(255,60,60,0.9)";
      ctx.beginPath();
      ctx.arc(x + w / 2, top - 37, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (roofStyle === "stepped") {
      ctx.fillStyle = "#0a0f1a";
      ctx.fillRect(x + w * 0.15, top - 18, w * 0.7, 18);
      ctx.fillRect(x + w * 0.3, top - 32, w * 0.4, 14);
    } else if (roofStyle === "dome") {
      ctx.fillStyle = "#0d1525";
      ctx.beginPath();
      ctx.ellipse(x + w / 2, top, w * 0.4, 20, 0, Math.PI, 0);
      ctx.fill();
    }
  }

  // ── Building layout — varied skyline ─────
  const buildings = [
    // far background (shorter, lighter)
    { x: 0, w: 90, h: 220, wc: 3, wr: 8, roof: "flat" },
    { x: 80, w: 60, h: 160, wc: 2, wr: 6, roof: "flat" },
    { x: 130, w: 110, h: 310, wc: 4, wr: 11, roof: "antenna" },
    { x: 230, w: 75, h: 190, wc: 3, wr: 7, roof: "stepped" },
    { x: 295, w: 130, h: 380, wc: 5, wr: 14, roof: "antenna" },
    { x: 415, w: 80, h: 240, wc: 3, wr: 9, roof: "flat" },
    { x: 485, w: 55, h: 170, wc: 2, wr: 6, roof: "flat" },
    { x: 530, w: 145, h: 420, wc: 5, wr: 15, roof: "stepped" },
    { x: 665, w: 70, h: 200, wc: 3, wr: 7, roof: "dome" },
    { x: 725, w: 100, h: 290, wc: 4, wr: 10, roof: "antenna" },
    { x: 815, w: 60, h: 155, wc: 2, wr: 6, roof: "flat" },
    { x: 865, w: 120, h: 350, wc: 4, wr: 13, roof: "antenna" },
    { x: 975, w: 85, h: 230, wc: 3, wr: 8, roof: "stepped" },
    { x: 1050, w: 65, h: 175, wc: 2, wr: 6, roof: "flat" },
    { x: 1105, w: 155, h: 460, wc: 6, wr: 16, roof: "antenna" },
    { x: 1250, w: 90, h: 260, wc: 3, wr: 9, roof: "dome" },
    { x: 1330, w: 70, h: 190, wc: 2, wr: 7, roof: "flat" },
    { x: 1390, w: 125, h: 330, wc: 4, wr: 12, roof: "stepped" },
    { x: 1505, w: 80, h: 210, wc: 3, wr: 8, roof: "flat" },
    { x: 1575, w: 110, h: 395, wc: 4, wr: 14, roof: "antenna" },
    { x: 1675, w: 65, h: 180, wc: 2, wr: 7, roof: "flat" },
    { x: 1730, w: 140, h: 440, wc: 5, wr: 16, roof: "antenna" },
    { x: 1860, w: 90, h: 250, wc: 3, wr: 9, roof: "stepped" },
    { x: 1940, w: 108, h: 310, wc: 4, wr: 11, roof: "dome" },
  ];

  // Draw back buildings first (slightly faded)
  ctx.globalAlpha = 0.55;
  buildings
    .filter((_, i) => i % 3 === 0)
    .forEach((b) => {
      ctx.globalAlpha = 0.4;
      drawBuilding(
        b.x * (W / 2048),
        b.w * (W / 2048),
        b.h * 0.6,
        b.wc,
        Math.floor(b.wr * 0.6),
        "flat",
      );
    });

  // Main buildings
  ctx.globalAlpha = 1.0;
  buildings.forEach((b) => {
    drawBuilding(
      b.x * (W / 2048),
      b.w * (W / 2048),
      b.h * (H / 1024),
      b.wc,
      b.wr,
      b.roof,
    );
  });

  // ── Ground / rooftop floor ────────────────
  const groundGrad = ctx.createLinearGradient(0, GROUND - 20, 0, H);
  groundGrad.addColorStop(0, "#0f1828");
  groundGrad.addColorStop(1, "#050a12");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND - 8, W, H - GROUND + 8);

  // ── Bokeh overlay — string light feel ────
  const bokehColors = [
    [255, 200, 80],
    [255, 140, 60],
    [180, 160, 255],
    [100, 180, 255],
    [255, 180, 100],
  ];
  for (let i = 0; i < 25; i++) {
    const bx = rng(i * 4.1 + 99) * W;
    const by = rng(i * 9.3 + 99) * H * 0.75;
    const br = 30 + rng(i * 3.3 + 99) * 80;
    const bc = bokehColors[Math.floor(rng(i * 6.1 + 99) * bokehColors.length)];
    const ba = 0.04 + rng(i * 2.7 + 99) * 0.08;
    const bg2 = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    bg2.addColorStop(0, `rgba(${bc[0]},${bc[1]},${bc[2]},${ba})`);
    bg2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = bg2;
    ctx.fillRect(0, 0, W, H);
  }

  // Final dark vignette on sides
  const vign = ctx.createRadialGradient(
    W / 2,
    H / 2,
    W * 0.3,
    W / 2,
    H / 2,
    W * 0.75,
  );
  vign.addColorStop(0, "rgba(0,0,0,0)");
  vign.addColorStop(1, "rgba(0,0,10,0.55)");
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);

  return new THREE.CanvasTexture(gc);
}

const cityTex = makeCityNight();
scene.background = cityTex;

// Warm city glow from below/behind
export const sunsetBackLight = new THREE.PointLight(0xff8833, 0.9, 70);
sunsetBackLight.position.set(0, 6, -18);
scene.add(sunsetBackLight);

// Cool moonlight from upper right
const moonLight = new THREE.PointLight(0x8899dd, 0.4, 60);
moonLight.position.set(10, 18, -15);
scene.add(moonLight);

// Warm window-light spill left and right
const leftSpill = new THREE.PointLight(0xff9944, 0.25, 28);
leftSpill.position.set(-12, 4, -4);
scene.add(leftSpill);

const rightSpill = new THREE.PointLight(0xaabbff, 0.25, 28);
rightSpill.position.set(12, 4, -4);
scene.add(rightSpill);
