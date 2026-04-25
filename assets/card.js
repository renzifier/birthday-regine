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

// Dog photo — loaded async, drawing deferred until ready
let _dogImg = null;
const _dogLoaded = new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    _dogImg = img;
    resolve();
  };
  img.onerror = () => resolve(); // fallback: draw without dog
  img.src = "assets/fatdog.png";
});

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
  const clean = text.replace(/\s+/g, " ").trim(); // emojis kept
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
ctx.fillText("Birthday Card", W / 2, 68);

// Subtitle hearts row
ctx.fillStyle = "#e91e8c";
ctx.font = "20px serif";
ctx.fillText("♥  ♡  ♥  ♡  ♥", W / 2, 98);

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

// Dog photo — drawn after image loads, then card canvas is ready
// _cardReady resolves when the canvas (including dog) is fully drawn
export const _cardReady = _dogLoaded.then(() => {
  if (_dogImg) {
    const imgMaxW = COL_L - 40;
    const imgMaxH = H - HEADER_H - 40;
    const scale = Math.min(imgMaxW / _dogImg.width, imgMaxH / _dogImg.height);
    const dw = Math.floor(_dogImg.width * scale);
    const dh = Math.floor(_dogImg.height * scale);
    const dx = Math.floor(DOG_X - dw / 2);
    const dy = Math.floor(HEADER_H + (H - HEADER_H) / 2 - dh / 2);

    // Dog PNG now has transparency (bg removed in preprocessing)
    ctx.drawImage(_dogImg, dx, dy, dw, dh);
  }
});

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
//  SECTION 3 — Name banner (full width, below header)
//              then right column message
// ══════════════════════════════════════════
const NAME_H = 58; // height of the name band below the header
const NAME_Y = HEADER_H + NAME_H; // bottom of name band

// Name band — subtle deeper pink strip
ctx.save();
ctx.fillStyle = "rgba(255,160,200,0.28)";
ctx.fillRect(0, HEADER_H, W, NAME_H);
ctx.restore();

// Name — centered on full card width
ctx.textAlign = "center";
ctx.fillStyle = "#ad1457";
ctx.font = "bold italic 34px Georgia, 'Times New Roman', serif";
ctx.fillText(CARD_TO, W / 2, HEADER_H + 38);

// Dashed divider below name band
ctx.save();
ctx.strokeStyle = "rgba(240,100,160,0.45)";
ctx.lineWidth = 1;
ctx.setLineDash([8, 6]);
ctx.beginPath();
ctx.moveTo(50, NAME_Y);
ctx.lineTo(W - 50, NAME_Y);
ctx.stroke();
ctx.restore();

// Heart row on divider
for (const hx of [W / 2 - 40, W / 2, W / 2 + 40]) {
  drawHeart(ctx, hx, NAME_Y, 7, "rgba(230,80,140,0.45)");
}

// Right column for message
const RX = COL_L + (W - COL_L) / 2;
const RIGHT_W = W - COL_L - 50;

// Split message at "Happy Birthday, Mishieeee!!"
const splitMarker = "Happy Birthday, Mishieeee!!";
const splitIdx = CARD_MESSAGE.indexOf(splitMarker);
const part1 =
  splitIdx !== -1 ? CARD_MESSAGE.slice(0, splitIdx).trim() : CARD_MESSAGE;
const part2 = splitIdx !== -1 ? CARD_MESSAGE.slice(splitIdx).trim() : "";

// Measure both parts first to know total height, then center vertically
const colBot = H - 50;
const font = "bold 18px Georgia, 'Times New Roman', serif";
const lineH = 25;
ctx.font = font;

// Count lines for each part to compute heights
function countLines(text, maxWidth) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  let line = "",
    count = 1;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      count++;
      line = word + " ";
    } else {
      line = test;
    }
  }
  return count;
}

const p1Lines = countLines(part1, RIGHT_W);
const p2Lines = countLines(part2, RIGHT_W);
const divH = 20; // space for divider
const totalH = (p1Lines + p2Lines) * lineH + divH + 10;

// Vertically center the whole block in the column
const colTop = NAME_Y + 16;
const colH = colBot - colTop;
const blockStartY = colTop + Math.max(0, (colH - totalH) / 2);

// Part 1 — same style as part 2
ctx.textAlign = "center";
ctx.fillStyle = "#c2185b";
ctx.font = font;
const p1EndY = wrapText(ctx, part1, RX, blockStartY, RIGHT_W, lineH);

// Divider
const divY2 = p1EndY + 6;
ctx.save();
ctx.strokeStyle = "rgba(240,100,160,0.35)";
ctx.lineWidth = 1;
ctx.setLineDash([5, 5]);
ctx.beginPath();
ctx.moveTo(COL_L + 20, divY2);
ctx.lineTo(W - 30, divY2);
ctx.stroke();
ctx.restore();
drawHeart(ctx, RX, divY2, 7, "rgba(230,80,140,0.4)");

// Part 2 — same style as part 1
ctx.fillStyle = "#c2185b";
ctx.font = font;
const p2EndY = wrapText(ctx, part2, RX, divY2 + 14, RIGHT_W, lineH);

// Footer hearts
ctx.fillStyle = "#e91e8c";
ctx.font = "17px serif";
ctx.fillText("✦  ♥  ✦  ♥  ✦", RX, Math.max(p2EndY + 12, H - 34));

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
  // Export canvas only after dog is drawn
  _cardReady.then(() => {
    const dataUrl = cardCanvas.toDataURL("image/png");
    cardPullImg.src = dataUrl;
    cardFullImg.src = dataUrl;
  });

  // Clean up flip wrapper if present — move cardInEnv back out first
  const flipWrapper = document.getElementById("cardFlipWrapper");
  if (flipWrapper) {
    flipWrapper.parentElement.removeChild(flipWrapper);
  }
  const flipHint = document.querySelector("#envOverlay div[style*='flip']");
  if (flipHint) flipHint.remove();
  // Remove all stray flip hints
  document
    .querySelectorAll("#envOverlay > div:not(#envScene):not(#cardFullView)")
    .forEach((el) => {
      if (el.id !== "cardInEnv" && el.id !== "cardFlipWrapper") el.remove();
    });
  if (cardInEnv.parentElement !== envWrap) {
    envWrap.insertBefore(cardInEnv, envWrap.firstChild);
  }
  envFlap.classList.remove("open");
  document.getElementById("envFlapOuter").classList.remove("opened");
  // Clear ALL inline styles completely
  cardInEnv.removeAttribute("style");
  cardInEnv.style.display = "none";
  envScene.classList.remove("hidden");
  envScene.style.opacity = "";
  cardFullView.classList.remove("visible");
  envSeal.style.opacity = "1";
  envWrap.style.opacity = "1";
  envWrap.style.transition = "";
  envHint.textContent = "tap to open";
  envHint.style.opacity = "";
  envHint.style.transition = "";

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
  setTimeout(() => {
    document.getElementById("envFlapOuter").classList.add("opened");
  }, 660);

  // After flap animation: pop card in INSIDE the envelope
  setTimeout(() => {
    stage = "open";
    cardInEnv.style.display = "block";
    cardInEnv.style.opacity = "0";
    cardInEnv.style.transform = "translateX(-50%) translateY(-50%) scale(0.55)";

    // Pop in with spring — card appears inside envelope
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cardInEnv.style.transition =
          "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease";
        cardInEnv.style.transform =
          "translateX(-50%) translateY(-50%) scale(0.58)";
        cardInEnv.style.opacity = "1";
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
const SNAP_THRESHOLD = 60;

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
  cardInEnv.style.transform = `translateX(-50%) translateY(calc(-50% - ${delta * 0.6}px)) scale(0.58)`;
  e.stopPropagation();
  e.preventDefault();
});

cardInEnv.addEventListener("pointerup", (e) => {
  if (!isDragging) return;
  isDragging = false;
  if (dragLastDelta >= SNAP_THRESHOLD) {
    snapCardOut();
  } else {
    cardInEnv.style.transition =
      "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)";
    cardInEnv.style.transform = "translateX(-50%) translateY(-50%) scale(0.58)";
  }
  e.stopPropagation();
});

function snapCardOut() {
  stage = "cardout";
  envHint.style.transition = "opacity 0.2s ease";
  envHint.style.opacity = "0";

  // Reparent so card survives envScene fade
  const overlayEl = document.getElementById("envOverlay");
  overlayEl.appendChild(cardInEnv);

  // Pop to full size at center
  cardInEnv.style.transition =
    "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), top 0.5s ease, left 0.5s ease, width 0.5s ease";
  cardInEnv.style.position = "fixed";
  cardInEnv.style.top = "50%";
  cardInEnv.style.left = "50%";
  cardInEnv.style.width = "min(560px, 92vw)";
  cardInEnv.style.transform = "translate(-50%, -50%) scale(1)";
  cardInEnv.style.zIndex = "200";
  cardInEnv.style.borderRadius = "18px";
  cardInEnv.style.boxShadow = "0 24px 64px rgba(0,0,0,0.55)";

  // Fade envelope out behind card
  setTimeout(() => {
    envScene.style.transition = "opacity 0.4s ease";
    envScene.classList.add("hidden");
  }, 300);

  // Enable flip after card is fully out
  setTimeout(() => {
    _enableFlip();
  }, 600);
}

// ── Flip card feature ─────────────────────
function _enableFlip() {
  // Create flip wrapper around cardInEnv
  // Get the actual rendered size of cardInEnv before reparenting
  const cardRect = cardInEnv.getBoundingClientRect();
  const wrapper = document.createElement("div");
  wrapper.id = "cardFlipWrapper";
  Object.assign(wrapper.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: cardRect.width + "px",
    zIndex: "200",
    perspective: "1200px",
    cursor: "pointer",
  });

  // Inner container that actually flips
  const inner = document.createElement("div");
  inner.id = "cardFlipInner";
  Object.assign(inner.style, {
    position: "relative",
    width: "100%",
    height: cardRect.height + "px",
    transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
    transformStyle: "preserve-3d",
  });

  // Front = existing cardInEnv
  cardInEnv.style.position = "absolute";
  cardInEnv.style.inset = "0";
  cardInEnv.style.top = "";
  cardInEnv.style.left = "";
  cardInEnv.style.transform = "";
  cardInEnv.style.zIndex = "";
  cardInEnv.style.width = "100%";
  cardInEnv.style.backfaceVisibility = "hidden";
  cardInEnv.style.webkitBackfaceVisibility = "hidden";

  // Back = new canvas with a special back-of-card design
  const backEl = document.createElement("div");
  backEl.id = "cardBack";
  Object.assign(backEl.style, {
    position: "absolute",
    inset: "0",
    borderRadius: "18px",
    backfaceVisibility: "hidden",
    webkitBackfaceVisibility: "hidden",
    transform: "rotateY(180deg)",
    overflow: "hidden",
    boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
  });

  // Draw back canvas
  const backCanvas = document.createElement("canvas");
  const bw = 960,
    bh = 600;
  backCanvas.width = bw;
  backCanvas.height = bh;
  backCanvas.style.width = "100%";
  backCanvas.style.height = "auto";
  backCanvas.style.display = "block";
  const bctx = backCanvas.getContext("2d");

  // Background — deep rose gradient
  const bgGrad = bctx.createLinearGradient(0, 0, bw, bh);
  bgGrad.addColorStop(0, "#e91e8c");
  bgGrad.addColorStop(1, "#c2185b");
  bctx.fillStyle = bgGrad;
  bctx.beginPath();
  const br = 32;
  bctx.moveTo(br, 0);
  bctx.lineTo(bw - br, 0);
  bctx.quadraticCurveTo(bw, 0, bw, br);
  bctx.lineTo(bw, bh - br);
  bctx.quadraticCurveTo(bw, bh, bw - br, bh);
  bctx.lineTo(br, bh);
  bctx.quadraticCurveTo(0, bh, 0, bh - br);
  bctx.lineTo(0, br);
  bctx.quadraticCurveTo(0, 0, br, 0);
  bctx.closePath();
  bctx.fill();

  // Heart pattern
  function bHeart(cx, cy, size, color) {
    bctx.save();
    bctx.fillStyle = color;
    bctx.translate(cx, cy);
    const s = size / 14;
    bctx.scale(s, s);
    bctx.beginPath();
    bctx.moveTo(0, -8);
    bctx.bezierCurveTo(8, -18, 22, -8, 22, 2);
    bctx.bezierCurveTo(22, 12, 10, 20, 0, 28);
    bctx.bezierCurveTo(-10, 20, -22, 12, -22, 2);
    bctx.bezierCurveTo(-22, -8, -8, -18, 0, -8);
    bctx.closePath();
    bctx.fill();
    bctx.restore();
  }
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 13; col++) {
      const ox = row % 2 === 0 ? 0 : 37;
      bHeart(col * 74 + ox, row * 76, 11, "rgba(255,255,255,0.12)");
    }

  // Dashed border
  bctx.save();
  bctx.strokeStyle = "rgba(255,255,255,0.35)";
  bctx.lineWidth = 2;
  bctx.setLineDash([10, 8]);
  bctx.beginPath();
  bctx.moveTo(br + 14, 14);
  bctx.lineTo(bw - br - 14, 14);
  bctx.quadraticCurveTo(bw - 14, 14, bw - 14, br + 14);
  bctx.lineTo(bw - 14, bh - br - 14);
  bctx.quadraticCurveTo(bw - 14, bh - 14, bw - br - 14, bh - 14);
  bctx.lineTo(br + 14, bh - 14);
  bctx.quadraticCurveTo(14, bh - 14, 14, bh - br - 14);
  bctx.lineTo(14, br + 14);
  bctx.quadraticCurveTo(14, 14, br + 14, 14);
  bctx.stroke();
  bctx.restore();

  // Big center heart
  bHeart(bw / 2, bh / 2 - 60, 120, "rgba(255,255,255,0.18)");
  bHeart(bw / 2, bh / 2 - 60, 80, "rgba(255,255,255,0.22)");

  // "With love" text
  bctx.textAlign = "center";
  bctx.fillStyle = "#fff";
  bctx.font = "italic bold 42px Georgia,'Times New Roman',serif";
  bctx.fillText("With love 💕", bw / 2, bh / 2 + 30);
  bctx.font = "22px Georgia,'Times New Roman',serif";
  bctx.fillStyle = "rgba(255,255,255,0.75)";
  bctx.fillText("— tap to flip back —", bw / 2, bh / 2 + 76);

  // Corner hearts
  for (const [cx, cy] of [
    [54, 50],
    [bw - 54, 50],
    [54, bh - 50],
    [bw - 54, bh - 50],
  ]) {
    bHeart(cx, cy, 28, "rgba(255,255,255,0.5)");
  }

  backEl.appendChild(backCanvas);

  // Assemble
  inner.appendChild(cardInEnv);
  inner.appendChild(backEl);
  wrapper.appendChild(inner);
  document.getElementById("envOverlay").appendChild(wrapper);

  // Flip on click
  let flipped = false;
  wrapper.addEventListener("click", () => {
    flipped = !flipped;
    inner.style.transform = flipped ? "rotateY(180deg)" : "rotateY(0deg)";
  });

  // Hint
  const flipHint = document.createElement("div");
  flipHint.textContent = "💌 tap card to flip";
  Object.assign(flipHint.style, {
    position: "fixed",
    bottom: "52px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(255,200,220,0.85)",
    fontFamily: "monospace",
    fontSize: "13px",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    zIndex: "201",
    animation: "pulse 1.6s ease-in-out infinite",
  });
  document.getElementById("envOverlay").appendChild(flipHint);
}
