// ─────────────────────────────────────────
//  card.js  — envelope edition
//  • Draws the birthday card onto a canvas
//  • Renders a pink envelope as the 3-D
//    table object (replaces flat card)
//  • 3-stage overlay: closed → flap open
//    → drag card out
// ─────────────────────────────────────────
import { CARD_TO, CARD_MESSAGE } from "./config.js";
import { std } from "./textures.js";
import { tableGroup } from "./table.js";

// ══════════════════════════════════════════
//  CARD CANVAS
// ══════════════════════════════════════════
export const cardCanvas = document.createElement("canvas");
const W = 800;
const H = 960;
cardCanvas.width = W;
cardCanvas.height = H;
const ctx = cardCanvas.getContext("2d");

// ── Helpers ───────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, startY, maxWidth, lineH) {
  const clean = text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = clean.split(" ").filter(Boolean);
  let line = "";
  let y = startY;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, y);
      line = word + " ";
      y += lineH;
    } else {
      line = test;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, y);
    y += lineH;
  }
  return y;
}

// ── Background ────────────────────────────
const bg = ctx.createLinearGradient(0, 0, 0, H);
bg.addColorStop(0.0, "#fff5f8");
bg.addColorStop(0.45, "#ffedf4");
bg.addColorStop(1.0, "#ffd6e8");
ctx.fillStyle = bg;
roundRect(ctx, 0, 0, W, H, 32);
ctx.fill();

ctx.strokeStyle = "#f48fb1";
ctx.lineWidth = 5;
roundRect(ctx, 6, 6, W - 12, H - 12, 28);
ctx.stroke();

ctx.save();
ctx.strokeStyle = "rgba(244,143,177,0.45)";
ctx.lineWidth = 1.5;
ctx.setLineDash([8, 6]);
roundRect(ctx, 18, 18, W - 36, H - 36, 20);
ctx.stroke();
ctx.restore();

// ── Corner florals ────────────────────────
function drawFloral(cx, cy, r, petals, color) {
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.55, r * 0.28, r * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd54f";
  ctx.fill();
}

for (const [fx, fy] of [
  [52, 52],
  [W - 52, 52],
  [52, H - 52],
  [W - 52, H - 52],
]) {
  drawFloral(fx, fy, 28, 5, "rgba(244,143,177,0.55)");
  drawFloral(fx, fy, 19, 5, "rgba(255,200,220,0.7)");
}

// ── Scattered background hearts ───────────
function drawHeart(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(cx, cy);
  const s = size / 14;
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.bezierCurveTo(8, -18, 22, -8, 22, 2);
  ctx.bezierCurveTo(22, 12, 10, 20, 0, 28);
  ctx.bezierCurveTo(-10, 20, -22, 12, -22, 2);
  ctx.bezierCurveTo(-22, -8, -8, -18, 0, -8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

for (const [hx, hy, hs] of [
  [90, 160, 7],
  [710, 155, 8],
  [75, 800, 7],
  [720, 790, 9],
  [130, 870, 6],
  [660, 870, 6],
  [400, 910, 7],
]) {
  drawHeart(ctx, hx, hy, hs, "rgba(240,120,155,0.22)");
}

// ── Header ────────────────────────────────
ctx.textAlign = "center";
ctx.fillStyle = "#c2185b";
ctx.font = "bold italic 50px Georgia, 'Times New Roman', serif";
ctx.fillText("Happy Birthday", W / 2, 74);

ctx.fillStyle = "#e91e8c";
ctx.font = "22px serif";
ctx.fillText("♥  ♡  ♥  ♡  ♥", W / 2, 104);

// ── Dog illustration ──────────────────────
const BX = W / 2;
const BY = 285;
const BR = 98;

const DOG_TAN = "#c8844a";
const DOG_LIGHT = "#e8b07a";
const DOG_DARK = "#9a6030";
const DOG_WHITE = "#fdf5ec";
const EAR_INNER = "#e09060";

const shadow = ctx.createRadialGradient(
  BX,
  BY + BR - 5,
  0,
  BX,
  BY + BR - 5,
  BR * 0.9,
);
shadow.addColorStop(0, "rgba(0,0,0,0.12)");
shadow.addColorStop(1, "rgba(0,0,0,0)");
ctx.fillStyle = shadow;
ctx.beginPath();
ctx.ellipse(BX, BY + BR + 8, BR * 0.88, 20, 0, 0, Math.PI * 2);
ctx.fill();

// Left ear
ctx.save();
ctx.fillStyle = DOG_TAN;
ctx.beginPath();
ctx.ellipse(BX - 90, BY + 10, 32, 58, -0.38, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = EAR_INNER;
ctx.beginPath();
ctx.ellipse(BX - 90, BY + 14, 18, 40, -0.38, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

// Right ear
ctx.save();
ctx.fillStyle = DOG_TAN;
ctx.beginPath();
ctx.ellipse(BX + 90, BY + 10, 32, 58, 0.38, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = EAR_INNER;
ctx.beginPath();
ctx.ellipse(BX + 90, BY + 14, 18, 40, 0.38, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

// Head
const bodyGrad = ctx.createRadialGradient(BX - 22, BY - 30, 8, BX, BY, BR);
bodyGrad.addColorStop(0, DOG_LIGHT);
bodyGrad.addColorStop(0.6, DOG_TAN);
bodyGrad.addColorStop(1, DOG_DARK);
ctx.fillStyle = bodyGrad;
ctx.beginPath();
ctx.arc(BX, BY, BR, 0, Math.PI * 2);
ctx.fill();

// Forehead patch
ctx.fillStyle = "rgba(140,80,30,0.22)";
ctx.beginPath();
ctx.ellipse(BX - 18, BY - 44, 32, 26, -0.3, 0, Math.PI * 2);
ctx.fill();

// Muzzle
const muzzleGrad = ctx.createRadialGradient(BX, BY + 30, 4, BX, BY + 30, 58);
muzzleGrad.addColorStop(0, DOG_WHITE);
muzzleGrad.addColorStop(0.65, "#f0dcc0");
muzzleGrad.addColorStop(1, "#ddb88a");
ctx.fillStyle = muzzleGrad;
ctx.beginPath();
ctx.ellipse(BX, BY + 30, 58, 44, 0, 0, Math.PI * 2);
ctx.fill();

// Eyes
for (const [ex, sign] of [
  [BX - 30, -1],
  [BX + 30, 1],
]) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(ex, BY - 18, 14, 15, sign * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1200";
  ctx.beginPath();
  ctx.arc(ex, BY - 16, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a4010";
  ctx.beginPath();
  ctx.arc(ex, BY - 16, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1200";
  ctx.beginPath();
  ctx.arc(ex, BY - 16, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(ex + 3, BY - 20, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ex - 4, BY - 16, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(120,65,20,0.55)";
  ctx.beginPath();
  ctx.ellipse(ex, BY - 33, 10, 4, sign * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

// Nose
const noseGrad = ctx.createRadialGradient(BX - 4, BY + 8, 0, BX, BY + 12, 20);
noseGrad.addColorStop(0, "#555");
noseGrad.addColorStop(0.6, "#111");
noseGrad.addColorStop(1, "#000");
ctx.fillStyle = noseGrad;
ctx.beginPath();
ctx.moveTo(BX - 20, BY + 10);
ctx.bezierCurveTo(BX - 20, BY + 2, BX + 20, BY + 2, BX + 20, BY + 10);
ctx.bezierCurveTo(BX + 20, BY + 20, BX - 20, BY + 20, BX - 20, BY + 10);
ctx.fill();
ctx.fillStyle = "rgba(255,255,255,0.35)";
ctx.beginPath();
ctx.ellipse(BX - 5, BY + 7, 7, 4, -0.2, 0, Math.PI * 2);
ctx.fill();

// Mouth / smile
ctx.strokeStyle = "#7a3010";
ctx.lineWidth = 2.8;
ctx.lineCap = "round";
ctx.beginPath();
ctx.moveTo(BX, BY + 20);
ctx.lineTo(BX, BY + 30);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(BX, BY + 30);
ctx.quadraticCurveTo(BX - 18, BY + 42, BX - 30, BY + 36);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(BX, BY + 30);
ctx.quadraticCurveTo(BX + 18, BY + 42, BX + 30, BY + 36);
ctx.stroke();

// Tongue
ctx.fillStyle = "#ff5588";
ctx.beginPath();
ctx.ellipse(BX, BY + 48, 16, 12, 0, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = "#cc2255";
ctx.lineWidth = 1.8;
ctx.beginPath();
ctx.moveTo(BX, BY + 36);
ctx.lineTo(BX, BY + 58);
ctx.stroke();
ctx.fillStyle = "rgba(255,200,220,0.4)";
ctx.beginPath();
ctx.ellipse(BX - 5, BY + 44, 7, 5, -0.2, 0, Math.PI * 2);
ctx.fill();

// Blush
for (const [cx, ang] of [
  [BX - 50, -0.3],
  [BX + 50, 0.3],
]) {
  const blush = ctx.createRadialGradient(cx, BY + 22, 0, cx, BY + 22, 28);
  blush.addColorStop(0, "rgba(255,105,135,0.38)");
  blush.addColorStop(1, "rgba(255,105,135,0)");
  ctx.fillStyle = blush;
  ctx.beginPath();
  ctx.ellipse(cx, BY + 24, 28, 17, ang, 0, Math.PI * 2);
  ctx.fill();
}

// Party hat
const hatTip = { x: BX + 4, y: BY - BR - 62 };
const hatBaseY = BY - 68;
ctx.save();
ctx.beginPath();
ctx.moveTo(hatTip.x, hatTip.y);
ctx.lineTo(BX - 52, hatBaseY);
ctx.lineTo(BX + 52, hatBaseY);
ctx.closePath();
const hatGrad = ctx.createLinearGradient(hatTip.x, hatTip.y, BX, hatBaseY);
hatGrad.addColorStop(0, "#ff4488");
hatGrad.addColorStop(1, "#cc1166");
ctx.fillStyle = hatGrad;
ctx.fill();
ctx.beginPath();
ctx.moveTo(hatTip.x, hatTip.y);
ctx.lineTo(hatTip.x + 30, hatBaseY);
ctx.lineTo(BX + 20, hatBaseY);
ctx.closePath();
ctx.fillStyle = "rgba(255,220,0,0.5)";
ctx.fill();
ctx.restore();

ctx.fillStyle = "#ffee44";
ctx.fillRect(BX - 53, hatBaseY - 4, 106, 13);

const pomGrad = ctx.createRadialGradient(
  hatTip.x,
  hatTip.y,
  0,
  hatTip.x,
  hatTip.y,
  13,
);
pomGrad.addColorStop(0, "#fff");
pomGrad.addColorStop(1, "#ffe0ee");
ctx.fillStyle = pomGrad;
ctx.beginPath();
ctx.arc(hatTip.x, hatTip.y, 11, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = "rgba(255,255,255,0.75)";
for (const [sx, sy] of [
  [BX - 15, BY - 112],
  [BX + 9, BY - 132],
  [BX - 3, BY - 158],
]) {
  ctx.beginPath();
  ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// Paws
for (const [tx, ty, rot] of [
  [BX - BR + 2, BY + 28, 0.65],
  [BX + BR - 2, BY + 28, -0.65],
]) {
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(rot);
  ctx.fillStyle = DOG_TAN;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c07858";
  for (const [tx2, ty2] of [
    [-10, -4],
    [0, -7],
    [10, -4],
  ]) {
    ctx.beginPath();
    ctx.arc(tx2, ty2, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ── Recipient name ────────────────────────
const nameY = BY + BR + 58;

const ribbonGrad = ctx.createLinearGradient(W * 0.15, 0, W * 0.85, 0);
ribbonGrad.addColorStop(0, "rgba(255,182,212,0)");
ribbonGrad.addColorStop(0.25, "rgba(255,182,212,0.55)");
ribbonGrad.addColorStop(0.75, "rgba(255,182,212,0.55)");
ribbonGrad.addColorStop(1, "rgba(255,182,212,0)");
ctx.fillStyle = ribbonGrad;
ctx.fillRect(W * 0.1, nameY - 34, W * 0.8, 48);

ctx.textAlign = "center";
ctx.fillStyle = "#ad1457";
ctx.font = "bold 42px Georgia, 'Times New Roman', serif";
ctx.fillText(CARD_TO, W / 2, nameY);

const divY = nameY + 26;
ctx.strokeStyle = "rgba(240,100,160,0.35)";
ctx.lineWidth = 1;
ctx.setLineDash([6, 5]);
ctx.beginPath();
ctx.moveTo(80, divY);
ctx.lineTo(W - 80, divY);
ctx.stroke();
ctx.setLineDash([]);
drawHeart(ctx, W / 2, divY - 2, 10, "rgba(230,80,140,0.5)");

// ── Message text ──────────────────────────
ctx.textAlign = "center";
ctx.fillStyle = "#7b3a5a";
ctx.font = "20px Georgia, 'Times New Roman', serif";

const endY = wrapText(ctx, CARD_MESSAGE, W / 2, divY + 52, W - 160, 30);

ctx.fillStyle = "#e91e8c";
ctx.font = "22px serif";
ctx.fillText("✦  ♥  ✦  ♥  ✦", W / 2, Math.max(endY + 30, H - 60));

// Vignette
const vig = ctx.createRadialGradient(
  W / 2,
  H / 2,
  H * 0.28,
  W / 2,
  H / 2,
  H * 0.72,
);
vig.addColorStop(0, "rgba(0,0,0,0)");
vig.addColorStop(1, "rgba(100,0,40,0.08)");
ctx.fillStyle = vig;
roundRect(ctx, 0, 0, W, H, 32);
ctx.fill();

// ══════════════════════════════════════════
//  ENVELOPE CANVAS TEXTURE (for 3-D table object)
// ══════════════════════════════════════════
function makeEnvelopeTex() {
  const ec = document.createElement("canvas");
  ec.width = 512;
  ec.height = 360;
  const c = ec.getContext("2d");

  // Body gradient
  const ebg = c.createLinearGradient(0, 0, 512, 360);
  ebg.addColorStop(0, "#ffc8df");
  ebg.addColorStop(0.5, "#ff90c0");
  ebg.addColorStop(1, "#ee5598");
  c.fillStyle = ebg;
  c.beginPath();
  c.roundRect(0, 0, 512, 360, 18);
  c.fill();

  // Envelope fold lines — X from all 4 corners to center
  c.strokeStyle = "rgba(255,255,255,0.28)";
  c.lineWidth = 2.5;
  c.lineCap = "round";
  // Top-left to center
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(256, 195);
  c.stroke();
  // Top-right to center
  c.beginPath();
  c.moveTo(512, 0);
  c.lineTo(256, 195);
  c.stroke();
  // Bottom-left to center
  c.beginPath();
  c.moveTo(0, 360);
  c.lineTo(256, 195);
  c.stroke();
  // Bottom-right to center
  c.beginPath();
  c.moveTo(512, 360);
  c.lineTo(256, 195);
  c.stroke();

  // Subtle top-flap fill to distinguish it
  c.save();
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(512, 0);
  c.lineTo(256, 195);
  c.closePath();
  c.fillStyle = "rgba(255,255,255,0.12)";
  c.fill();
  c.restore();

  // Heart seal
  c.save();
  c.translate(256, 195);
  const hs = 2.4;
  c.scale(hs, hs);
  const hGrad = c.createRadialGradient(-3, -6, 0, 0, 0, 24);
  hGrad.addColorStop(0, "#ff6aac");
  hGrad.addColorStop(1, "#bb0050");
  c.fillStyle = hGrad;
  c.beginPath();
  c.moveTo(0, -8);
  c.bezierCurveTo(8, -18, 22, -8, 22, 2);
  c.bezierCurveTo(22, 12, 10, 20, 0, 28);
  c.bezierCurveTo(-10, 20, -22, 12, -22, 2);
  c.bezierCurveTo(-22, -8, -8, -18, 0, -8);
  c.closePath();
  c.fill();
  // shine
  c.fillStyle = "rgba(255,200,230,0.55)";
  c.beginPath();
  c.ellipse(-5, -5, 7, 5, -0.3, 0, Math.PI * 2);
  c.fill();
  c.restore();

  // "To:" text at bottom
  c.fillStyle = "rgba(180, 40, 100, 0.75)";
  c.font = "italic bold 20px Georgia, serif";
  c.textAlign = "center";
  const firstName =
    CARD_TO.replace(/,.*/, "").replace("Happy Birthday", "").trim() || CARD_TO;
  c.fillText("To: " + firstName, 256, 318);

  // Outer border
  c.strokeStyle = "rgba(220, 80, 140, 0.4)";
  c.lineWidth = 4;
  c.beginPath();
  c.roundRect(4, 4, 504, 352, 14);
  c.stroke();

  return new THREE.CanvasTexture(ec);
}

// ══════════════════════════════════════════
//  3-D ENVELOPE ON TABLE
// ══════════════════════════════════════════
const envTableTex = makeEnvelopeTex();

const envelopeFace = new THREE.Mesh(
  new THREE.PlaneGeometry(1.1, 0.77),
  new THREE.MeshStandardMaterial({
    map: envTableTex,
    roughness: 0.18,
    metalness: 0,
    side: THREE.DoubleSide,
  }),
);
envelopeFace.rotation.x = -Math.PI / 2;
envelopeFace.rotation.z = 0.35;
envelopeFace.position.set(1.2, 0.395, 2.5);
envelopeFace.castShadow = true;
envelopeFace.receiveShadow = true;
tableGroup.add(envelopeFace);

export const envelopeHit = new THREE.Mesh(
  new THREE.PlaneGeometry(1.1, 0.77),
  new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
);
envelopeHit.rotation.x = -Math.PI / 2;
envelopeHit.rotation.z = 0.35;
envelopeHit.position.set(1.2, 0.395, 2.5);
tableGroup.add(envelopeHit);

// ══════════════════════════════════════════
//  OVERLAY — 3-STAGE STATE MACHINE
//  Stage: '' | 'closed' | 'opening' | 'open' | 'cardout'
// ══════════════════════════════════════════
const overlay = document.getElementById("envOverlay");
const closeBtn = document.getElementById("closeEnv");
const envScene = document.getElementById("envScene");
const envWrap = document.getElementById("envWrap");
const envFlap = document.getElementById("envFlap");
const envSeal = document.getElementById("envSeal");
const cardInEnv = document.getElementById("cardInEnv");
const cardPullImg = document.getElementById("cardPullImg");
const envHint = document.getElementById("envHint");
const cardFullView = document.getElementById("cardFullView");
const cardFullImg = document.getElementById("cardFullImg");

let stage = "";

// ── Open / Close ──────────────────────────
export function openEnvelope() {
  // Pre-load card images
  const dataUrl = cardCanvas.toDataURL("image/png");
  cardPullImg.src = dataUrl;
  cardFullImg.src = dataUrl;

  // Reset all states
  envFlap.classList.remove("open");
  cardInEnv.style.cssText = "";
  cardInEnv.style.display = "none";
  envScene.classList.remove("hidden");
  cardFullView.classList.remove("visible");
  envSeal.style.opacity = "1";
  envWrap.style.opacity = "1";
  envWrap.style.transition = "";
  envHint.textContent = "tap to open";
  envHint.style.opacity = "1";

  stage = "closed";
  overlay.classList.add("open");
}

function closeEnvelope() {
  overlay.classList.remove("open");
  stage = "";
}

closeBtn.addEventListener("click", closeEnvelope);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeEnvelope();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeEnvelope();
});

// ── Stage 1 → 2: tap envelope to open flap ──
envWrap.addEventListener("click", (e) => {
  if (stage !== "closed") return;
  stage = "opening";

  // Fade out the seal
  envSeal.style.transition = "opacity 0.3s ease";
  envSeal.style.opacity = "0";

  // Fade out hint
  envHint.style.transition = "opacity 0.2s ease";
  envHint.style.opacity = "0";

  // Animate flap open
  envFlap.classList.add("open");

  // After flap animation: reveal card peeking
  setTimeout(() => {
    stage = "open";
    cardInEnv.style.display = "block";
    cardInEnv.style.transform = "translateX(-50%) translateY(0px)";

    // Slight delay then peek card up
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cardInEnv.style.transition =
          "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)";
        cardInEnv.style.transform = `translateX(-50%) translateY(${PEEK_Y}px)`;
        setTimeout(() => {
          cardInEnv.style.transition = "";
          envHint.textContent = "drag the card out  ↑";
          envHint.style.transition = "opacity 0.4s ease";
          envHint.style.opacity = "1";
        }, 450);
      });
    });
  }, 650);
});

// ── Stage 2 → 3: drag card out ────────────
const PEEK_Y = -15; // card peeks just slightly above envelope opening
const SNAP_THRESHOLD = 110; // additional drag to snap card out

let isDragging = false;
let dragStartClientY = 0;
let dragLastDelta = 0;

function getClientY(e) {
  return e.touches ? e.touches[0].clientY : e.clientY;
}

cardInEnv.addEventListener("pointerdown", (e) => {
  if (stage !== "open") return;
  isDragging = true;
  dragStartClientY = getClientY(e);
  dragLastDelta = 0;
  cardInEnv.style.transition = "none";
  cardInEnv.setPointerCapture(e.pointerId);
  e.stopPropagation();
  e.preventDefault();
});

cardInEnv.addEventListener("pointermove", (e) => {
  if (!isDragging) return;
  const delta = Math.max(0, dragStartClientY - getClientY(e));
  dragLastDelta = delta;
  const totalY = PEEK_Y - delta;
  cardInEnv.style.transform = `translateX(-50%) translateY(${totalY}px)`;
  e.stopPropagation();
  e.preventDefault();
});

cardInEnv.addEventListener("pointerup", (e) => {
  if (!isDragging) return;
  isDragging = false;

  if (dragLastDelta >= SNAP_THRESHOLD) {
    snapCardOut();
  } else {
    // Snap back to peek position
    cardInEnv.style.transition =
      "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)";
    cardInEnv.style.transform = `translateX(-50%) translateY(${PEEK_Y}px)`;
  }
  e.stopPropagation();
});

function snapCardOut() {
  stage = "cardout";

  // Fade out hint
  envHint.style.transition = "opacity 0.2s ease";
  envHint.style.opacity = "0";

  // Fade envelope scene out
  envScene.style.transition = "opacity 0.35s ease";
  envScene.classList.add("hidden");

  // Show full card view
  setTimeout(() => {
    cardFullView.classList.add("visible");
  }, 280);
}
