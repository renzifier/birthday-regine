// ─────────────────────────────────────────
//  card.js
//  Draws the birthday card on a <canvas>,
//  places it as a 3-D object on the table,
//  and wires up the overlay UI.
//  Exports:
//    cardCanvas  — the source canvas
//    cardHit     — invisible raycasting target
//    openCard()  — called from animate.js
// ─────────────────────────────────────────
import { CARD_TO, CARD_MESSAGE } from "./config.js";
import { std } from "./textures.js";
import { tableGroup } from "./table.js";

// ── Canvas drawing helpers ─────────────────
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

/** Wrap text into lines that fit within maxWidth, advancing y by lineH each row. */
function wrapText(ctx, text, x, startY, maxWidth, lineH) {
  const words = text.split(" ");
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
  ctx.fillText(line.trim(), x, y);
}

// ── Draw card onto a canvas ───────────────
export const cardCanvas = document.createElement("canvas");
cardCanvas.width = 480;
cardCanvas.height = 600;
const ctx = cardCanvas.getContext("2d");

// Background gradient
const cardBg = ctx.createLinearGradient(0, 0, 0, 600);
cardBg.addColorStop(0, "#fff5f9");
cardBg.addColorStop(0.5, "#ffecf4");
cardBg.addColorStop(1, "#ffc0d8");
ctx.fillStyle = cardBg;
roundRect(ctx, 0, 0, 480, 600, 24);
ctx.fill();
ctx.strokeStyle = "#f06292";
ctx.lineWidth = 4;
roundRect(ctx, 6, 6, 468, 588, 20);
ctx.stroke();

// Header
ctx.fillStyle = "#cc3377";
ctx.font = "bold 34px Georgia,serif";
ctx.textAlign = "center";
ctx.fillText("Happy Birthday", 240, 58);
ctx.fillStyle = "#ff6699";
ctx.font = "22px serif";
ctx.fillText("♥  ♥  ♥", 240, 90);

// ── Teddy bear illustration ───────────────
// Body
ctx.fillStyle = "#c8956c";
ctx.beginPath();
ctx.arc(240, 185, 75, 0, Math.PI * 2);
ctx.fill();
// Ears (outer)
ctx.fillStyle = "#b07844";
ctx.beginPath();
ctx.arc(180, 128, 30, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(300, 128, 30, 0, Math.PI * 2);
ctx.fill();
// Ears (inner)
ctx.fillStyle = "#e8a87c";
ctx.beginPath();
ctx.arc(180, 128, 16, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(300, 128, 16, 0, Math.PI * 2);
ctx.fill();
// Muzzle
ctx.fillStyle = "#f5c098";
ctx.beginPath();
ctx.ellipse(240, 204, 36, 28, 0, 0, Math.PI * 2);
ctx.fill();
// Eyes (dark)
ctx.fillStyle = "#111";
ctx.beginPath();
ctx.arc(218, 170, 9, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(262, 170, 9, 0, Math.PI * 2);
ctx.fill();
// Eyes (highlight)
ctx.fillStyle = "#fff";
ctx.beginPath();
ctx.arc(222, 166, 3, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(266, 166, 3, 0, Math.PI * 2);
ctx.fill();
// Nose
ctx.fillStyle = "#dd3366";
ctx.beginPath();
ctx.ellipse(240, 200, 10, 7, 0, 0, Math.PI * 2);
ctx.fill();
// Smile
ctx.strokeStyle = "#994422";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.arc(240, 208, 14, 0.15, Math.PI - 0.15);
ctx.stroke();
// Cheek blush
ctx.fillStyle = "rgba(255,120,120,0.32)";
ctx.beginPath();
ctx.ellipse(205, 195, 18, 10, -0.3, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.ellipse(275, 195, 18, 10, 0.3, 0, Math.PI * 2);
ctx.fill();
// Party hat
ctx.fillStyle = "#ff4488";
ctx.beginPath();
ctx.moveTo(240, 96);
ctx.lineTo(208, 140);
ctx.lineTo(272, 140);
ctx.closePath();
ctx.fill();
ctx.fillStyle = "#ffdd44";
ctx.beginPath();
ctx.moveTo(240, 96);
ctx.lineTo(238, 102);
ctx.lineTo(267, 133);
ctx.lineTo(270, 128);
ctx.closePath();
ctx.fill();
ctx.beginPath();
ctx.arc(240, 94, 8, 0, Math.PI * 2);
ctx.fill();

// ── Message area ──────────────────────────
ctx.fillStyle = "#dd4488";
ctx.font = "bold 30px Georgia,serif";
ctx.textAlign = "center";
ctx.fillText(CARD_TO, 240, 312);

ctx.strokeStyle = "#f8bbd0";
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(60, 330);
ctx.lineTo(420, 330);
ctx.stroke();

ctx.fillStyle = "#884466";
ctx.font = "18px Georgia,serif";
wrapText(ctx, CARD_MESSAGE, 240, 364, 360, 26);

ctx.fillStyle = "#ff6699";
ctx.font = "20px serif";
ctx.fillText("✦  ✦  ✦", 240, 576);

// Vignette
const vig = ctx.createRadialGradient(240, 300, 180, 240, 300, 300);
vig.addColorStop(0, "rgba(0,0,0,0)");
vig.addColorStop(1, "rgba(100,0,30,0.12)");
ctx.fillStyle = vig;
ctx.fillRect(0, 0, 480, 600);

// ── 3-D card objects ──────────────────────
const cardTex = new THREE.CanvasTexture(cardCanvas);

const cardFace = new THREE.Mesh(
  new THREE.PlaneGeometry(1.1, 0.82),
  new THREE.MeshStandardMaterial({
    map: cardTex,
    roughness: 0.18,
    metalness: 0,
    side: THREE.DoubleSide,
  }),
);
cardFace.rotation.x = -Math.PI / 2;
cardFace.rotation.z = 0.35;
cardFace.position.set(1.2, 0.392, 2.5);
cardFace.castShadow = true;
cardFace.receiveShadow = true;
tableGroup.add(cardFace);

// Invisible mesh used as a larger raycasting target
export const cardHit = new THREE.Mesh(
  new THREE.PlaneGeometry(1.1, 0.82),
  new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
);
cardHit.rotation.x = -Math.PI / 2;
cardHit.rotation.z = 0.35;
// FIX: match cardFace y exactly so raycasting aligns with the visible mesh
cardHit.position.set(1.2, 0.392, 2.5);
tableGroup.add(cardHit);

// ── Overlay UI ────────────────────────────
const overlay = document.getElementById("cardOverlay");
const cardImg = document.getElementById("cardImg");
const closeBtn = document.getElementById("closeCard");

export function openCard() {
  cardImg.src = cardCanvas.toDataURL("image/png");
  overlay.classList.add("open");
}
function closeCard() {
  overlay.classList.remove("open");
}

closeBtn.addEventListener("click", closeCard);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeCard();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCard();
});
