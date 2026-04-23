// ─────────────────────────────────────────
//  utils.js  — shared helpers
// ─────────────────────────────────────────

/**
 * Deterministic pseudo-random from a float seed.
 * Same algorithm that was copy-pasted into background.js
 * and textures.js — centralised here.
 */
export function rng(s) {
  const x = Math.sin(s + 1) * 43758.5453;
  return x - Math.floor(x);
}
