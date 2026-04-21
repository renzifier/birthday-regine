// ─────────────────────────────────────────
//  textures.js
//  Shared material helper + all procedural
//  canvas-texture generators.
//  Heavy textures (tablecloth, roughness,
//  bump) are generated ONCE and exported as
//  BASE_CLOTH so callers can clone cheaply.
// ─────────────────────────────────────────

const THREAD = 6; // weave thread width in pixels

// ── Convenience material factory ──────────
export function std(color, roughness = 0.5, metalness = 0.0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

// ── Floor ────────────────────────────────
export function makeFloorTex() {
  const fc = document.createElement("canvas");
  fc.width = 512;
  fc.height = 512;
  const ctx = fc.getContext("2d");

  // Warm dark wood base
  ctx.fillStyle = "#1a120a";
  ctx.fillRect(0, 0, 512, 512);

  const PLANK_H = 48;
  const rng = (s) => {
    let x = Math.sin(s + 1) * 43758.5453;
    return x - Math.floor(x);
  };

  for (let row = 0; row < Math.ceil(512 / PLANK_H); row++) {
    const py = row * PLANK_H;
    const offset = (row % 2) * 80;

    const bright = 28 + rng(row * 3.1) * 18;
    ctx.fillStyle = `rgb(${Math.floor(bright * 1.6)},${Math.floor(bright * 1.0)},${Math.floor(bright * 0.55)})`;
    ctx.fillRect(0, py, 512, PLANK_H - 1);

    // Wood grain
    for (let g = 0; g < 6; g++) {
      const gy = py + rng(row * 7.7 + g) * (PLANK_H - 2);
      const alpha = 0.04 + rng(row * 5.5 + g) * 0.08;
      ctx.strokeStyle = `rgba(80,40,10,${alpha})`;
      ctx.lineWidth = 0.5 + rng(row * 9.1 + g) * 1.0;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(
        128,
        gy + (rng(row * 4.4 + g) - 0.5) * 4,
        384,
        gy + (rng(row * 6.6 + g) - 0.5) * 4,
        512,
        gy + (rng(row * 8.8 + g) - 0.5) * 3,
      );
      ctx.stroke();
    }

    // Plank gap
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, py + PLANK_H - 1, 512, 1);

    // Vertical joint
    for (
      let jx = offset;
      jx < 512;
      jx += 160 + Math.floor(rng(row * 2.2) * 60)
    ) {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(jx, py, 1, PLANK_H - 1);
    }
  }

  // Warm varnish sheen
  const sheen = ctx.createLinearGradient(0, 0, 512, 512);
  sheen.addColorStop(0, "rgba(255,180,80,0.06)");
  sheen.addColorStop(0.5, "rgba(255,160,60,0.03)");
  sheen.addColorStop(1, "rgba(180,100,30,0.06)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 512, 512);

  const tex = new THREE.CanvasTexture(fc);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(18, 12);
  return tex;
}

// ── Tablecloth colour map ─────────────────
export function makeTableclothTex() {
  const SIZE = 512;
  const GRID = 128;
  const tc = document.createElement("canvas");
  tc.width = SIZE;
  tc.height = SIZE;
  const ctx = tc.getContext("2d");
  const imgd = ctx.createImageData(SIZE, SIZE);
  const d = imgd.data;

  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const idx = (py * SIZE + px) * 4;
      const col = Math.floor(px / GRID);
      const row = Math.floor(py / GRID);
      const dark = (col + row) % 2 === 1;

      let br, bg, bb;
      if (dark) {
        br = 8;
        bg = 12;
        bb = 48;
      } else {
        br = 18;
        bg = 28;
        bb = 80;
      }

      const threadCol = Math.floor(px / THREAD);
      const threadRow = Math.floor(py / THREAD);
      const threadPhase = (threadCol + threadRow) % 2;
      const txPos = px % THREAD;
      const tyPos = py % THREAD;

      let weave;
      if (threadPhase === 0) {
        const cy = tyPos - THREAD * 0.5;
        weave = 14 * (1.0 - Math.abs(cy) / (THREAD * 0.5));
      } else {
        const cx = txPos - THREAD * 0.5;
        weave = 14 * (1.0 - Math.abs(cx) / (THREAD * 0.5));
      }

      const gapDark = Math.min(
        txPos === 0 || txPos === THREAD - 1 ? -8 : 0,
        tyPos === 0 || tyPos === THREAD - 1 ? -8 : 0,
      );
      const dX = Math.min(px % GRID, GRID - (px % GRID));
      const dY = Math.min(py % GRID, GRID - (py % GRID));
      const gridBand = dX < 10 || dY < 10 ? -18 : 0;
      const noise = (Math.random() - 0.5) * 9;

      d[idx] = Math.max(
        0,
        Math.min(255, br + weave + gapDark + gridBand + noise),
      );
      d[idx + 1] = Math.max(
        0,
        Math.min(255, bg + weave * 0.85 + gapDark + gridBand + noise * 0.9),
      );
      d[idx + 2] = Math.max(
        0,
        Math.min(
          255,
          bb + weave * 0.65 + gapDark + gridBand * 0.8 + noise * 0.7,
        ),
      );
      d[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgd, 0, 0);
  const tex = new THREE.CanvasTexture(tc);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ── Tablecloth roughness map ──────────────
export function makeRoughnessMap() {
  const SIZE = 256;
  const rc = document.createElement("canvas");
  rc.width = SIZE;
  rc.height = SIZE;
  const ctx = rc.getContext("2d");
  const imgd = ctx.createImageData(SIZE, SIZE);
  const d = imgd.data;

  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const idx = (py * SIZE + px) * 4;
      const threadCol = Math.floor(px / THREAD);
      const threadRow = Math.floor(py / THREAD);
      const phase = (threadCol + threadRow) % 2;
      const txPos = px % THREAD;
      const tyPos = py % THREAD;

      let smooth;
      if (phase === 0) {
        const cy = tyPos - THREAD * 0.5;
        smooth = 1.0 - Math.abs(cy) / (THREAD * 0.5);
      } else {
        const cx = txPos - THREAD * 0.5;
        smooth = 1.0 - Math.abs(cx) / (THREAD * 0.5);
      }

      smooth = smooth * 0.6 + (txPos === 0 || tyPos === 0 ? 0.0 : 1.0) * 0.4;
      const v = Math.max(
        100,
        Math.min(230, 130 + smooth * 80 + (Math.random() - 0.5) * 18),
      );
      d[idx] = d[idx + 1] = d[idx + 2] = v;
      d[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgd, 0, 0);
  return new THREE.CanvasTexture(rc);
}

// ── Tablecloth bump map ───────────────────
export function makeBumpMap() {
  const SIZE = 256;
  const bc = document.createElement("canvas");
  bc.width = SIZE;
  bc.height = SIZE;
  const ctx = bc.getContext("2d");
  const imgd = ctx.createImageData(SIZE, SIZE);
  const d = imgd.data;

  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const idx = (py * SIZE + px) * 4;
      const threadCol = Math.floor(px / THREAD);
      const threadRow = Math.floor(py / THREAD);
      const phase = (threadCol + threadRow) % 2;
      const txPos = px % THREAD;
      const tyPos = py % THREAD;

      let height;
      if (phase === 0) {
        height = Math.sin((tyPos / (THREAD - 1)) * Math.PI) * 0.7 + 0.3;
      } else {
        height = Math.sin((txPos / (THREAD - 1)) * Math.PI) * 0.7 + 0.3;
      }
      if (txPos === 0 && tyPos === 0) height = 0.05;

      const v = Math.max(
        0,
        Math.min(255, Math.round(height * 220 + (Math.random() - 0.5) * 8)),
      );
      d[idx] = d[idx + 1] = d[idx + 2] = v;
      d[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgd, 0, 0);
  return new THREE.CanvasTexture(bc);
}

// Generated once, cloned by getClothMat()
export const BASE_CLOTH = {
  color: makeTableclothTex(),
  rough: makeRoughnessMap(),
  bump: makeBumpMap(),
};

// ── Cloth material factory ────────────────
export function getClothMat(repeat, doubleSide) {
  function cloneWith(base) {
    const t = base.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    if (repeat) t.repeat.set(repeat[0], repeat[1]);
    return t;
  }
  return new THREE.MeshStandardMaterial({
    map: cloneWith(BASE_CLOTH.color),
    roughnessMap: cloneWith(BASE_CLOTH.rough),
    bumpMap: cloneWith(BASE_CLOTH.bump),
    bumpScale: 0.018,
    roughness: 0.8,
    metalness: 0.0,
    color: 0xffffff,
    side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
  });
}

// ── Candle stripe texture ─────────────────
export function makeCandleTex(c1, c2) {
  const cv = document.createElement("canvas");
  cv.width = 64;
  cv.height = 256;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, 64, 256);
  ctx.fillStyle = c2;
  for (let y = 0; y < 256; y += 28) ctx.fillRect(0, y, 64, 14);
  return new THREE.CanvasTexture(cv);
}

// ── Sunset gradient skybox ────────────────
export function makeSunsetGradient() {
  const gc = document.createElement("canvas");
  gc.width = 1024;
  gc.height = 512;
  const ctx = gc.getContext("2d");

  const sky = ctx.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0.0, "#1a0a2e");
  sky.addColorStop(0.3, "#ff6622");
  sky.addColorStop(0.6, "#ffaa33");
  sky.addColorStop(0.85, "#ffcc66");
  sky.addColorStop(1.0, "#ffe0aa");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1024, 512);

  const sun = ctx.createRadialGradient(512, 200, 0, 512, 200, 160);
  sun.addColorStop(0, "rgba(255,255,200,0.9)");
  sun.addColorStop(0.3, "rgba(255,200,80,0.5)");
  sun.addColorStop(1, "rgba(255,120,0,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 1024, 512);

  return new THREE.CanvasTexture(gc);
}

// ── Photo-frame placeholder ───────────────
export function makePhotoPlaceholder(idx) {
  const palettes = [
    ["#1a4a6e", "#c8a878", "#e8c898"],
    ["#2d5a1e", "#8ab040", "#f0d888"],
    ["#c88040", "#e8b060", "#fff0d0"],
    ["#4a2a6e", "#c060a0", "#f8c0e0"],
  ];
  const pal = palettes[idx % palettes.length];

  const cv = document.createElement("canvas");
  cv.width = 320;
  cv.height = 256;
  const ctx = cv.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, 0, 256);
  bg.addColorStop(0, pal[0]);
  bg.addColorStop(0.5, pal[1]);
  bg.addColorStop(1, pal[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 320, 256);

  // Silhouetted figures
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.arc(110, 130, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(84, 158, 52, 70);
  ctx.beginPath();
  ctx.arc(200, 140, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(180, 162, 40, 58);

  const hi = ctx.createRadialGradient(160, 90, 10, 160, 90, 120);
  hi.addColorStop(0, "rgba(255,240,180,0.28)");
  hi.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = hi;
  ctx.fillRect(0, 0, 320, 256);

  const vig = ctx.createRadialGradient(160, 128, 80, 160, 128, 160);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, 320, 256);

  return new THREE.CanvasTexture(cv);
}
