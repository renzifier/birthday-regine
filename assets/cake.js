// ─────────────────────────────────────────
//  cake.js
//  Korean-style bento birthday cake:
//  — white cream body, squat + wide
//  — scalloped shell rosette borders
//    top edge AND base edge
//  — deep-red satin ribbon bows on sides
//  — "happy birthday" in red cursive on top
//  — tiny red hearts scattered on top
//  — one thin white gold-speckle candle
//  Exports flameMeshes / perFlameLights /
//  smokeSystems so animate.js can update.
// ─────────────────────────────────────────
import { scene } from "./renderer.js";
import { CONFIG } from "./config.js";
import { std } from "./textures.js";
import { tableGroup } from "./table.js";

export const flameMeshes = [];
export const perFlameLights = [];
export const smokeSystems = [];

// ── Cake group ────────────────────────────
const cakeGroup = new THREE.Group();
cakeGroup.position.set(CONFIG.cake.offsetX, CONFIG.cake.tableY, 0);
tableGroup.add(cakeGroup);

function addLayer(geo, mat, y) {
  const m = new THREE.Mesh(geo, mat);
  m.position.y = y;
  m.castShadow = true;
  m.receiveShadow = true;
  cakeGroup.add(m);
  return m;
}

// ════════════════════════════════════════
//  MATERIALS
// ════════════════════════════════════════
// Warm off-white cream body
const creamMat = new THREE.MeshStandardMaterial({
  color: 0xfff8ee,
  roughness: 0.6,
  metalness: 0.0,
});
// Slightly brighter for piped rosettes so they catch the light
const rosetteMat = new THREE.MeshStandardMaterial({
  color: 0xfffcf5,
  roughness: 0.5,
  metalness: 0.0,
});
// White plate
const plateMat = new THREE.MeshStandardMaterial({
  color: 0xf4f4f4,
  roughness: 0.14,
  metalness: 0.04,
});
// Deep crimson satin ribbon — slightly metallic for sheen
const ribbonMat = new THREE.MeshStandardMaterial({
  color: 0xaa0018,
  roughness: 0.28,
  metalness: 0.08,
  side: THREE.DoubleSide,
});
const ribbonDarkMat = new THREE.MeshStandardMaterial({
  color: 0x880010,
  roughness: 0.35,
  metalness: 0.06,
  side: THREE.DoubleSide,
});

// ════════════════════════════════════════
//  CAKE DIMENSIONS
// ════════════════════════════════════════
const TIER_R = 0.92; // radius — smaller bento cake
const TIER_H = 0.92; // height — squat & compact like reference
const PLATE_Y = 0.04;
const TIER_Y = PLATE_Y + TIER_H / 2; // = 0.50
const TOP_Y = PLATE_Y + TIER_H; // = 0.96  (top surface level)

// ════════════════════════════════════════
//  PLATE
// ════════════════════════════════════════
addLayer(new THREE.CylinderGeometry(1.19, 1.19, 0.08, 56), plateMat, PLATE_Y);

// ════════════════════════════════════════
//  MAIN CAKE BODY
// ════════════════════════════════════════
addLayer(
  new THREE.CylinderGeometry(TIER_R, TIER_R, TIER_H, 64),
  creamMat,
  TIER_Y,
);

// Top flat cap
addLayer(
  new THREE.CylinderGeometry(TIER_R, TIER_R, 0.035, 64),
  creamMat,
  TOP_Y + 0.018,
);

// ════════════════════════════════════════
//  "happy birthday" CANVAS DISC  (top)
// ════════════════════════════════════════
(function makeTopDisc() {
  const SIZE = 512;
  const cv = document.createElement("canvas");
  cv.width = SIZE;
  cv.height = SIZE;
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, SIZE, SIZE);

  // ── "happy birthday" in deep red cursive ──
  // Two lines centred
  ctx.fillStyle = "#bb0018";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Line 1 — "happy"
  ctx.font = "bold italic 88px Georgia, 'Times New Roman', serif";
  ctx.fillText("happy", 256, 195);

  // Line 2 — "birthday" slightly larger for reference look
  ctx.font = "bold italic 84px Georgia, 'Times New Roman', serif";
  ctx.fillText("birthday", 256, 298);

  // ── tiny red hearts — rim only, clear of the text ──
  const HEART_POS = [
    [80, 155],
    [432, 150],
    [256, 82],
    [256, 430],
    [76, 220],
    [436, 215],
    [158, 118],
    [366, 112],
  ];
  function drawHeart(ctx, cx, cy, r) {
    ctx.save();
    ctx.translate(cx, cy);
    const s = r / 14;
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.bezierCurveTo(10, -22, 24, -12, 24, 0);
    ctx.bezierCurveTo(24, 12, 10, 22, 0, 30);
    ctx.bezierCurveTo(-10, 22, -24, 12, -24, 0);
    ctx.bezierCurveTo(-24, -12, -10, -22, 0, -10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#cc001e";
  for (const [hx, hy] of HEART_POS) {
    const r = 9 + Math.random() * 6;
    drawHeart(ctx, hx, hy, r);
  }

  const tex = new THREE.CanvasTexture(cv);
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(TIER_R - 0.01, 64),
    new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      roughness: 0.5,
      metalness: 0,
      depthWrite: false,
    }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = TOP_Y + 0.037;
  cakeGroup.add(disc);
})();

// ════════════════════════════════════════
//  SHELL / ROSETTE BORDERS
//  Each shell = layered half-spheres so
//  they look thick and piped.
// ════════════════════════════════════════
function addShellRing(radius, y, count, shellR, tiltX) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const px = Math.cos(a) * radius;
    const pz = Math.sin(a) * radius;

    // Back layer — larger, slightly lower → gives depth shadow
    const back = new THREE.Mesh(
      new THREE.SphereGeometry(
        shellR * 1.1,
        10,
        8,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.52,
      ),
      rosetteMat,
    );
    back.scale.set(1.0, 0.52, 1.0);
    back.position.set(px, y - shellR * 0.04, pz);
    back.rotation.y = a + Math.PI;
    back.rotation.x = tiltX;
    back.castShadow = true;
    cakeGroup.add(back);

    // Front layer — smaller, on top → bright highlight ridge
    const front = new THREE.Mesh(
      new THREE.SphereGeometry(
        shellR * 0.82,
        9,
        7,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.5,
      ),
      rosetteMat,
    );
    front.scale.set(0.95, 0.58, 0.95);
    front.position.set(px, y + shellR * 0.08, pz);
    front.rotation.y = a + Math.PI;
    front.rotation.x = tiltX - 0.08;
    cakeGroup.add(front);
  }
}

// ── Upright rosette ring for the top border ──
// Each rosette is a standing round blob — like a freshly piped
// cream puff sitting on the rim, not a flat pancake.
function addUprightRing(radius, y, count, blobR) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const px = Math.cos(a) * radius;
    const pz = Math.sin(a) * radius;

    // Base blob — full sphere, slightly oval upward
    const base = new THREE.Mesh(
      new THREE.SphereGeometry(blobR, 12, 10),
      rosetteMat,
    );
    base.scale.set(0.85, 1.1, 0.85);
    base.position.set(px, y, pz);
    base.castShadow = true;
    cakeGroup.add(base);

    // Smaller top highlight — gives the piped "peak" look
    const peak = new THREE.Mesh(
      new THREE.SphereGeometry(blobR * 0.55, 9, 8),
      rosetteMat,
    );
    peak.scale.set(0.9, 1.1, 0.9);
    peak.position.set(px, y + blobR * 1.0, pz);
    cakeGroup.add(peak);
  }
}

// Top border — upright standing rosettes on the rim
addUprightRing(TIER_R - 0.02, TOP_Y + 0.065, 22, 0.092);

// Base border — shells flaring outward/upward
addShellRing(TIER_R - 0.02, PLATE_Y + 0.16, 20, 0.155, 0.26);

// ════════════════════════════════════════
//  RED RIBBON BOWS  — 6 evenly spaced
//  Bow knot sits near the top of the cake
//  so loops rise above the rim, tails fall
//  in a wide uniform V to the base border.
// ════════════════════════════════════════
function addBow(angle, y) {
  const bx = Math.cos(angle) * (TIER_R + 0.005);
  const bz = Math.sin(angle) * (TIER_R + 0.005);

  const grp = new THREE.Group();
  grp.position.set(bx, y, bz);
  grp.rotation.y = Math.PI / 2 - angle;
  // Local axes: +X tangential, +Y up, +Z outward (viewer looks along –Z)

  // ── Loops — tall torus ovals that rise above the cake rim ──
  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(
      new THREE.TorusGeometry(0.118, 0.036, 9, 26),
      ribbonMat,
    );
    // Tall oval: Y scale ~1.6 so loops are noticeably taller than wide
    loop.scale.set(0.82, 2.1, 0.28);
    loop.position.set(side * 0.148, 0.1, 0.0);
    loop.rotation.z = side * 0.18;
    grp.add(loop);

    // Inner highlight ring for satin sheen
    const shine = new THREE.Mesh(
      new THREE.TorusGeometry(0.078, 0.019, 7, 22),
      ribbonMat,
    );
    shine.scale.set(0.82, 2.1, 0.26);
    shine.position.set(side * 0.148, 0.1, 0.005);
    shine.rotation.z = side * 0.18;
    grp.add(shine);
  }

  // ── Centre knot ──
  const knot = new THREE.Mesh(
    new THREE.SphereGeometry(0.058, 10, 9),
    ribbonMat,
  );
  knot.scale.set(0.85, 0.68, 0.5);
  grp.add(knot);

  // ── Tails — wide spreading V, fall to near base border ──
  // X offset grows steadily so tails fan out uniformly.
  for (const side of [-1, 1]) {
    const tailPts = [
      new THREE.Vector3(side * 0.038, 0.0, 0.0),
      new THREE.Vector3(side * 0.095, -0.15, 0.016),
      new THREE.Vector3(side * 0.135, -0.34, 0.026),
      new THREE.Vector3(side * 0.155, -0.56, 0.018),
    ];
    const tail = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(tailPts),
        16,
        0.021,
        6,
        false,
      ),
      ribbonMat,
    );
    grp.add(tail);

    // V-notch ribbon end
    for (const notch of [-1, 1]) {
      const tip = new THREE.Mesh(
        new THREE.PlaneGeometry(0.024, 0.058),
        ribbonMat,
      );
      tip.position.set(side * 0.16, -0.595 + notch * 0.015, 0.018);
      tip.rotation.z = side * 0.3 + notch * 0.15;
      grp.add(tip);
    }
  }

  cakeGroup.add(grp);
}

// Bows near the top of the cake — loops breach the rim, tails reach the base
const BOW_Y = PLATE_Y + TIER_H * 0.82;
for (let i = 0; i < 6; i++) {
  addBow((i / 6) * Math.PI * 2, BOW_Y);
}

// ════════════════════════════════════════
//  RED HEART SIDE DECORATIONS
//  Tiny hearts on the cake sides between bows
// ════════════════════════════════════════
(function addSideHearts() {
  // One canvas texture, reused for all side hearts
  const cv = document.createElement("canvas");
  cv.width = 64;
  cv.height = 64;
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = "#cc001e";
  ctx.save();
  ctx.translate(32, 30);
  const s = 1.15;
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.bezierCurveTo(8, -18, 20, -10, 20, 0);
  ctx.bezierCurveTo(20, 10, 8, 20, 0, 28);
  ctx.bezierCurveTo(-8, 20, -20, 10, -20, 0);
  ctx.bezierCurveTo(-20, -10, -8, -18, 0, -8);
  ctx.fill();
  ctx.restore();

  const heartMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(cv),
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // 36 hearts at 4 height levels, scattered around the full cake side
  const OFFSETS = [0.14, 0.34, 0.54, 0.72];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2 + 0.28;
    const yOff = OFFSETS[i % 4];
    const hx = Math.cos(a) * (TIER_R + 0.008);
    const hz = Math.sin(a) * (TIER_R + 0.008);
    const h = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), heartMat);
    h.position.set(hx, PLATE_Y + yOff, hz);
    h.rotation.y = a + Math.PI;
    cakeGroup.add(h);
  }
})();

// ════════════════════════════════════════
//  SINGLE WHITE CANDLE  (gold speckles)
// ════════════════════════════════════════
(function makeCandle() {
  // Build candle texture: white with gold metallic speckles
  const cv = document.createElement("canvas");
  cv.width = 64;
  cv.height = 256;
  const ctx = cv.getContext("2d");

  // Base white
  ctx.fillStyle = "#fefefe";
  ctx.fillRect(0, 0, 64, 256);

  // Gold speckles
  for (let i = 0; i < 36; i++) {
    const sx = Math.random() * 64;
    const sy = Math.random() * 256;
    const sr = 0.7 + Math.random() * 1.6;
    const alpha = 0.5 + Math.random() * 0.45;
    ctx.fillStyle = `rgba(210,165,35,${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  // Subtle vertical highlight stripe down the centre
  const shine = ctx.createLinearGradient(0, 0, 64, 0);
  shine.addColorStop(0.0, "rgba(255,255,255,0)");
  shine.addColorStop(0.45, "rgba(255,255,255,0.18)");
  shine.addColorStop(0.55, "rgba(255,255,255,0.18)");
  shine.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, 64, 256);

  const tex = new THREE.CanvasTexture(cv);

  const CANDLE_X = 0.06;
  const CANDLE_Z = 0.04;
  const CANDLE_BASE_Y = TOP_Y + 0.055;
  const CANDLE_LEN = 1.1;
  const TILT_Z = 0.07; // slight lean

  const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.042, CANDLE_LEN, 14),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.38, metalness: 0 }),
  );
  candle.position.set(CANDLE_X, CANDLE_BASE_Y + CANDLE_LEN * 0.5, CANDLE_Z);
  candle.rotation.z = TILT_Z;
  candle.castShadow = true;
  cakeGroup.add(candle);

  // Wax drip on candle (just two small blobs)
  const waxMat = std(0xfff8ee, 0.55, 0.0);
  for (let wd = 0; wd < 2; wd++) {
    const wdA = wd === 0 ? 0.4 : -0.5;
    const wdH = 0.14 + wd * 0.06;
    const wdrop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.006, wdH, 6),
      waxMat,
    );
    const wx = CANDLE_X + Math.cos(wdA) * 0.038;
    const wz = CANDLE_Z + Math.sin(wdA) * 0.038;
    wdrop.position.set(wx, CANDLE_BASE_Y + CANDLE_LEN * 0.62 - wdH * 0.5, wz);
    cakeGroup.add(wdrop);
    const wblob = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 6), waxMat);
    wblob.position.set(wx, CANDLE_BASE_Y + CANDLE_LEN * 0.62 - wdH, wz);
    cakeGroup.add(wblob);
  }

  // Flame position — exact tip of the tilted candle
  // Rotating (0, CANDLE_LEN/2, 0) around Z by TILT_Z gives:
  //   X offset = -CANDLE_LEN/2 * sin(TILT_Z)   (negative — leans left)
  //   Y offset =  CANDLE_LEN/2 * cos(TILT_Z)
  const halfLen = CANDLE_LEN * 0.5;
  const flameLX = CANDLE_X - halfLen * Math.sin(TILT_Z);
  const flameLY = CANDLE_BASE_Y + halfLen + halfLen * Math.cos(TILT_Z) + 0.08;
  const flameLZ = CANDLE_Z;

  // Outer flame
  const flOut = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffcc22 }),
  );
  flOut.scale.set(0.55, 1.75, 0.55);
  flOut.position.set(flameLX, flameLY, flameLZ);
  cakeGroup.add(flOut);
  flameMeshes.push({ mesh: flOut, offset: 0 });

  // Inner white-hot core
  const flIn = new THREE.Mesh(
    new THREE.SphereGeometry(0.036, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffee }),
  );
  flIn.scale.set(0.44, 1.1, 0.44);
  flIn.position.set(flameLX, flameLY - 0.022, flameLZ);
  cakeGroup.add(flIn);

  // Per-flame point light
  const flameLight = new THREE.PointLight(0xff9933, 0.55, 3.0);
  flameLight.position.set(flameLX, flameLY, flameLZ);
  cakeGroup.add(flameLight);
  perFlameLights.push({ light: flameLight, offset: 0 });

  // Smoke — world-space coords (tableGroup scale = 1.8)
  const tgScale = tableGroup.scale.x;
  const SMOKE_COUNT = 18;
  const smokeGeo = new THREE.BufferGeometry();
  const smokePos = new Float32Array(SMOKE_COUNT * 3);
  const smokeBase = {
    x: (CONFIG.cake.offsetX + flameLX) * tgScale,
    y: (CONFIG.cake.tableY + flameLY + 0.05) * tgScale,
    z: flameLZ * tgScale,
  };
  for (let sp = 0; sp < SMOKE_COUNT; sp++) {
    smokePos[sp * 3] = smokeBase.x + (Math.random() - 0.5) * 0.04;
    smokePos[sp * 3 + 1] = smokeBase.y + sp * 0.062;
    smokePos[sp * 3 + 2] = smokeBase.z + (Math.random() - 0.5) * 0.04;
  }
  smokeGeo.setAttribute("position", new THREE.BufferAttribute(smokePos, 3));
  const smokePoints = new THREE.Points(
    smokeGeo,
    new THREE.PointsMaterial({
      color: 0xfff0e8,
      size: 0.028,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    }),
  );
  scene.add(smokePoints);
  smokeSystems.push({
    pts: smokePoints,
    geo: smokeGeo,
    base: smokeBase,
    phase: Math.random() * 0.8,
  });
})();
