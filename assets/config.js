// ─────────────────────────────────────────
//  config.js  ← edit card text and scene
//  settings here; nothing else needs to
//  change for common customisations.
// ─────────────────────────────────────────

export const CARD_TO = "Happy Birthday!";
export const CARD_MESSAGE =
  "Wishing you all the love, laughter, and cake in the world. " +
  "You deserve every beautiful moment of today. 🎂✨";

export const CONFIG = {
  camera: { fov: 62, near: 0.1, far: 200, initialRadius: 16 },
  candle: { minIntensity: 2.2, flickerSpeed: 9.3 },
  cake: { offsetX: -0.5, tableY: 0.37 },
  controls: { minRadius: 4, maxRadius: 30, minPhi: 0.05, maxPhi: 1.3 },
};
