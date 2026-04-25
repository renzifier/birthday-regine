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
//  CARD CANVAS  —  Landscape 960 × 600
//  Layout: full-width header, then dog left + text right
// ══════════════════════════════════════════
export const cardCanvas = document.createElement("canvas");
const W = 960;
const H = 600;
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

// ── Background — soft pink with heart tile pattern ─
roundRect(ctx, 0, 0, W, H, 32);
ctx.fillStyle = "#fde8f0";
ctx.fill();

// Heart tile pattern
const HEART_COLS = 14;
const HEART_ROWS = 9;
const gx = W / HEART_COLS;
const gy = H / HEART_ROWS;
for (let row = 0; row < HEART_ROWS + 1; row++) {
  for (let col = 0; col < HEART_COLS + 1; col++) {
    const ox = row % 2 === 0 ? 0 : gx * 0.5;
    drawHeart(ctx, col * gx + ox, row * gy, 9, "rgba(240,130,170,0.18)");
  }
}

// Card border
ctx.strokeStyle = "#f48fb1";
ctx.lineWidth = 4;
roundRect(ctx, 0, 0, W, H, 32);
ctx.stroke();

// Dashed inner border
ctx.save();
ctx.strokeStyle = "rgba(244,143,177,0.5)";
ctx.lineWidth = 1.5;
ctx.setLineDash([8, 6]);
roundRect(ctx, 14, 14, W - 28, H - 28, 24);
ctx.stroke();
ctx.restore();

// ── Corner florals ────────────────────────
for (const [fx, fy] of [
  [46, 42],
  [W - 46, 42],
  [46, H - 42],
  [W - 46, H - 42],
]) {
  drawFloral(fx, fy, 24, 5, "rgba(244,143,177,0.6)");
  drawFloral(fx, fy, 16, 5, "rgba(255,200,220,0.75)");
}

// ══════════════════════════════════════════
//  SECTION 1 — Header (full width top band)
// ══════════════════════════════════════════
const HEADER_H = 110;

// Header band background
ctx.save();
ctx.beginPath();
roundRect(ctx, 0, 0, W, HEADER_H, 32);
ctx.fillStyle = "rgba(255,180,210,0.38)";
ctx.fill();
ctx.restore();

// Divider line below header
ctx.save();
ctx.strokeStyle = "rgba(244,143,177,0.55)";
ctx.lineWidth = 1;
ctx.setLineDash([10, 7]);
ctx.beginPath();
ctx.moveTo(60, HEADER_H);
ctx.lineTo(W - 60, HEADER_H);
ctx.stroke();
ctx.restore();

// "Happy Birthday" title
ctx.textAlign = "center";
ctx.fillStyle = "#c2185b";
ctx.font = "bold italic 54px Georgia, 'Times New Roman', serif";
ctx.fillText("Happy Birthday", W / 2, 68);

// Subtitle hearts row
ctx.fillStyle = "#e91e8c";
ctx.font = "20px serif";
ctx.fillText("♥  ♡  ♥  ♡  ♥", W / 2, 96);

// ══════════════════════════════════════════
//  SECTION 2 — Left column: Dog illustration
// ══════════════════════════════════════════
const COL_L = W * 0.38; // left column width
const DOG_X = COL_L / 2;
const DOG_Y = HEADER_H + (H - HEADER_H) / 2 + 10;
const DOG_R = 82;

const DOG_TAN = "#c8844a";
const DOG_LIGHT = "#e8b07a";
const DOG_DARK = "#9a6030";
const DOG_WHITE = "#fdf5ec";
const EAR_INNER = "#e09060";

// Shadow
const shadow = ctx.createRadialGradient(
  DOG_X,
  DOG_Y + DOG_R - 5,
  0,
  DOG_X,
  DOG_Y + DOG_R - 5,
  DOG_R * 0.9,
);
shadow.addColorStop(0, "rgba(0,0,0,0.10)");
shadow.addColorStop(1, "rgba(0,0,0,0)");
ctx.fillStyle = shadow;
ctx.beginPath();
ctx.ellipse(DOG_X, DOG_Y + DOG_R + 6, DOG_R * 0.85, 16, 0, 0, Math.PI * 2);
ctx.fill();

// Left ear
ctx.save();
ctx.fillStyle = DOG_TAN;
ctx.beginPath();
ctx.ellipse(DOG_X - 76, DOG_Y + 8, 28, 50, -0.38, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = EAR_INNER;
ctx.beginPath();
ctx.ellipse(DOG_X - 76, DOG_Y + 12, 16, 34, -0.38, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

// Right ear
ctx.save();
ctx.fillStyle = DOG_TAN;
ctx.beginPath();
ctx.ellipse(DOG_X + 76, DOG_Y + 8, 28, 50, 0.38, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = EAR_INNER;
ctx.beginPath();
ctx.ellipse(DOG_X + 76, DOG_Y + 12, 16, 34, 0.38, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

// Head
const bodyGrad = ctx.createRadialGradient(
  DOG_X - 20,
  DOG_Y - 26,
  8,
  DOG_X,
  DOG_Y,
  DOG_R,
);
bodyGrad.addColorStop(0, DOG_LIGHT);
bodyGrad.addColorStop(0.6, DOG_TAN);
bodyGrad.addColorStop(1, DOG_DARK);
ctx.fillStyle = bodyGrad;
ctx.beginPath();
ctx.arc(DOG_X, DOG_Y, DOG_R, 0, Math.PI * 2);
ctx.fill();

// Forehead patch
ctx.fillStyle = "rgba(140,80,30,0.20)";
ctx.beginPath();
ctx.ellipse(DOG_X - 16, DOG_Y - 38, 28, 22, -0.3, 0, Math.PI * 2);
ctx.fill();

// Muzzle
const muzzleGrad = ctx.createRadialGradient(
  DOG_X,
  DOG_Y + 26,
  4,
  DOG_X,
  DOG_Y + 26,
  52,
);
muzzleGrad.addColorStop(0, DOG_WHITE);
muzzleGrad.addColorStop(0.65, "#f0dcc0");
muzzleGrad.addColorStop(1, "#ddb88a");
ctx.fillStyle = muzzleGrad;
ctx.beginPath();
ctx.ellipse(DOG_X, DOG_Y + 26, 52, 40, 0, 0, Math.PI * 2);
ctx.fill();

// Eyes
for (const [ex, sign] of [
  [DOG_X - 28, -1],
  [DOG_X + 28, 1],
]) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(ex, DOG_Y - 16, 13, 14, sign * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1200";
  ctx.beginPath();
  ctx.arc(ex, DOG_Y - 14, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a4010";
  ctx.beginPath();
  ctx.arc(ex, DOG_Y - 14, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1200";
  ctx.beginPath();
  ctx.arc(ex, DOG_Y - 14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(ex + 3, DOG_Y - 18, 3, 0, Math.PI * 2);
  ctx.fill();
  // Eyebrow
  ctx.fillStyle = "rgba(120,65,20,0.5)";
  ctx.beginPath();
  ctx.ellipse(ex, DOG_Y - 30, 9, 4, sign * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

// Nose
const noseGrad = ctx.createRadialGradient(
  DOG_X - 3,
  DOG_Y + 6,
  0,
  DOG_X,
  DOG_Y + 10,
  18,
);
noseGrad.addColorStop(0, "#555");
noseGrad.addColorStop(0.6, "#111");
noseGrad.addColorStop(1, "#000");
ctx.fillStyle = noseGrad;
ctx.beginPath();
ctx.moveTo(DOG_X - 18, DOG_Y + 8);
ctx.bezierCurveTo(DOG_X - 18, DOG_Y, DOG_X + 18, DOG_Y, DOG_X + 18, DOG_Y + 8);
ctx.bezierCurveTo(
  DOG_X + 18,
  DOG_Y + 18,
  DOG_X - 18,
  DOG_Y + 18,
  DOG_X - 18,
  DOG_Y + 8,
);
ctx.fill();
ctx.fillStyle = "rgba(255,255,255,0.3)";
ctx.beginPath();
ctx.ellipse(DOG_X - 4, DOG_Y + 5, 6, 3.5, -0.2, 0, Math.PI * 2);
ctx.fill();

// Mouth
ctx.strokeStyle = "#7a3010";
ctx.lineWidth = 2.5;
ctx.lineCap = "round";
ctx.beginPath();
ctx.moveTo(DOG_X, DOG_Y + 18);
ctx.lineTo(DOG_X, DOG_Y + 26);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(DOG_X, DOG_Y + 26);
ctx.quadraticCurveTo(DOG_X - 16, DOG_Y + 38, DOG_X - 26, DOG_Y + 32);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(DOG_X, DOG_Y + 26);
ctx.quadraticCurveTo(DOG_X + 16, DOG_Y + 38, DOG_X + 26, DOG_Y + 32);
ctx.stroke();

// Tongue
ctx.fillStyle = "#ff5588";
ctx.beginPath();
ctx.ellipse(DOG_X, DOG_Y + 44, 14, 11, 0, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = "#cc2255";
ctx.lineWidth = 1.6;
ctx.beginPath();
ctx.moveTo(DOG_X, DOG_Y + 33);
ctx.lineTo(DOG_X, DOG_Y + 54);
ctx.stroke();

// Blush
for (const [bx, ang] of [
  [DOG_X - 46, -0.3],
  [DOG_X + 46, 0.3],
]) {
  const blush = ctx.createRadialGradient(bx, DOG_Y + 20, 0, bx, DOG_Y + 20, 26);
  blush.addColorStop(0, "rgba(255,105,135,0.36)");
  blush.addColorStop(1, "rgba(255,105,135,0)");
  ctx.fillStyle = blush;
  ctx.beginPath();
  ctx.ellipse(bx, DOG_Y + 22, 26, 16, ang, 0, Math.PI * 2);
  ctx.fill();
}

// Party hat
const hatTip = { x: DOG_X + 4, y: DOG_Y - DOG_R - 52 };
const hatBaseY = DOG_Y - 60;
ctx.save();
ctx.beginPath();
ctx.moveTo(hatTip.x, hatTip.y);
ctx.lineTo(DOG_X - 46, hatBaseY);
ctx.lineTo(DOG_X + 46, hatBaseY);
ctx.closePath();
const hatGrad = ctx.createLinearGradient(hatTip.x, hatTip.y, DOG_X, hatBaseY);
hatGrad.addColorStop(0, "#ff4488");
hatGrad.addColorStop(1, "#cc1166");
ctx.fillStyle = hatGrad;
ctx.fill();
// Hat shine
ctx.beginPath();
ctx.moveTo(hatTip.x, hatTip.y);
ctx.lineTo(hatTip.x + 26, hatBaseY);
ctx.lineTo(DOG_X + 18, hatBaseY);
ctx.closePath();
ctx.fillStyle = "rgba(255,220,0,0.45)";
ctx.fill();
ctx.restore();
// Hat brim
ctx.fillStyle = "#ffee44";
ctx.fillRect(DOG_X - 47, hatBaseY - 4, 94, 11);
// Pom
const pomGrad = ctx.createRadialGradient(
  hatTip.x,
  hatTip.y,
  0,
  hatTip.x,
  hatTip.y,
  11,
);
pomGrad.addColorStop(0, "#fff");
pomGrad.addColorStop(1, "#ffe0ee");
ctx.fillStyle = pomGrad;
ctx.beginPath();
ctx.arc(hatTip.x, hatTip.y, 10, 0, Math.PI * 2);
ctx.fill();
// Hat sparkles
ctx.fillStyle = "rgba(255,255,255,0.8)";
for (const [sx, sy] of [
  [DOG_X - 12, DOG_Y - 98],
  [DOG_X + 8, DOG_Y - 116],
  [DOG_X - 2, DOG_Y - 138],
]) {
  ctx.beginPath();
  ctx.arc(sx, sy, 2, 0, Math.PI * 2);
  ctx.fill();
}

// Vertical divider between columns
ctx.save();
ctx.strokeStyle = "rgba(244,143,177,0.45)";
ctx.lineWidth = 1;
ctx.setLineDash([8, 6]);
ctx.beginPath();
ctx.moveTo(COL_L, HEADER_H + 24);
ctx.lineTo(COL_L, H - 24);
ctx.stroke();
ctx.restore();

// ══════════════════════════════════════════
//  SECTION 3 — Right column: Name + Message
// ══════════════════════════════════════════
const RX = COL_L + (W - COL_L) / 2; // center of right column
const RIGHT_W = W - COL_L - 60; // text max width

// Recipient name
const nameY = HEADER_H + 58;
ctx.textAlign = "center";
ctx.fillStyle = "#ad1457";
ctx.font = "bold italic 38px Georgia, 'Times New Roman', serif";
ctx.fillText("Happy Birthday, " + CARD_TO + "!", RX, nameY);

// Small heart divider
const divY = nameY + 22;
ctx.save();
ctx.strokeStyle = "rgba(240,100,160,0.4)";
ctx.lineWidth = 1;
ctx.setLineDash([6, 5]);
ctx.beginPath();
ctx.moveTo(COL_L + 30, divY);
ctx.lineTo(W - 40, divY);
ctx.stroke();
ctx.restore();
drawHeart(ctx, RX, divY, 9, "rgba(230,80,140,0.5)");

// Message text — soft rose
ctx.textAlign = "center";
ctx.fillStyle = "#e88fa8";
ctx.font = "18px Georgia, 'Times New Roman', serif";
const msgEndY = wrapText(ctx, CARD_MESSAGE, RX, divY + 36, RIGHT_W, 27);

// Footer hearts
ctx.fillStyle = "#e91e8c";
ctx.font = "18px serif";
ctx.fillText("✦  ♥  ✦  ♥  ✦", RX, Math.max(msgEndY + 16, H - 36));

// ── Vignette ──────────────────────────────
const vig = ctx.createRadialGradient(
  W / 2,
  H / 2,
  W * 0.2,
  W / 2,
  H / 2,
  W * 0.65,
);
vig.addColorStop(0, "rgba(0,0,0,0)");
vig.addColorStop(1, "rgba(100,0,40,0.07)");
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
        cardInEnv.style.transform = "translateX(-50%) translateY(-65px)";
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
const PEEK_Y = -65; // px card peeks above envelope after open
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
