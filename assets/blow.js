export const blowState = { active: false, strength: 0 };
const _listeners = [];

export function onBlow(cb) {
  _listeners.push(cb);
}
const BLOW_THRESHOLD = 0.018;
const BLOW_FRAMES_MIN = 2;
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

  blowState.strength = Math.min(1, rms / BLOW_THRESHOLD);

  if (rms > BLOW_THRESHOLD) {
    _framesAbove++;
    if (_framesAbove >= BLOW_FRAMES_MIN) {
      const now = performance.now();
      if (now - _lastBlow > BLOW_COOLDOWN_MS) {
        _lastBlow = now;
        blowState.active = true;
        _listeners.forEach((cb) => cb(rms));
        setTimeout(() => {
          blowState.active = false;
        }, 400);
      }
    }
  } else {
    _framesAbove = 0;
  }
}
