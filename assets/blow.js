// ─────────────────────────────────────────
//  blow.js
//  Microphone-based blow detection.
//  Exports:
//    initBlow()     — call once to request mic + start analysis
//    onBlow(cb)     — register a callback fired when a blow is detected
//    blowState      — { active: bool, strength: 0-1 } — read every frame
// ─────────────────────────────────────────

export const blowState = { active: false, strength: 0 };
const _listeners = [];

export function onBlow(cb) {
  _listeners.push(cb);
}

// ── Tuning ────────────────────────────────
// RMS threshold above which we consider it a "blow" vs ambient noise.
// 0.018 works well in a quiet room; raise to ~0.04 in noisier environments.
const BLOW_THRESHOLD = 0.01;
// How many consecutive frames above threshold before we fire the event.
const BLOW_FRAMES_MIN = 2;
// Cooldown in ms before another blow can fire.
const BLOW_COOLDOWN_MS = 1800;

let _ready = false;
let _analyser = null;
let _dataArr = null;

export async function initBlow() {
  if (_ready) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    _analyser = ctx.createAnalyser();
    _analyser.fftSize = 256;
    _dataArr = new Float32Array(_analyser.fftSize);
    src.connect(_analyser);
    _ready = true;
    _poll();
  } catch (err) {
    console.warn("blow.js: mic unavailable —", err.message);
  }
}

let _framesAbove = 0;
let _lastBlow = 0;

function _rms(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i] * arr[i];
  return Math.sqrt(sum / arr.length);
}

function _poll() {
  requestAnimationFrame(_poll);
  if (!_analyser) return;

  _analyser.getFloatTimeDomainData(_dataArr);
  const rms = _rms(_dataArr);

  // Expose a smoothed strength value for the flame flicker effect
  blowState.strength = Math.min(1, rms / BLOW_THRESHOLD);

  if (rms > BLOW_THRESHOLD) {
    _framesAbove++;
    if (_framesAbove >= BLOW_FRAMES_MIN) {
      const now = performance.now();
      if (now - _lastBlow > BLOW_COOLDOWN_MS) {
        _lastBlow = now;
        blowState.active = true;
        _listeners.forEach((cb) => cb(rms));
        // Auto-reset active flag after 400 ms
        setTimeout(() => {
          blowState.active = false;
        }, 400);
      }
    }
  } else {
    _framesAbove = 0;
  }
}
