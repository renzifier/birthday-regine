export function rng(s) {
  const x = Math.sin(s + 1) * 43758.5453;
  return x - Math.floor(x);
}
