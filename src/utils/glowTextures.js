import * as THREE from "three";

// Small procedural textures used for fake bloom / haze. Created once and shared.
const cache = {};

const makeTexture = (key, stops) => {
  if (cache[key]) return cache[key];
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([at, alpha]) => g.addColorStop(at, `rgba(255,255,255,${alpha})`));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache[key] = tex;
  return tex;
};

// Soft round glow, brightest in the middle.
export const getRadialGlow = () =>
  makeTexture("radial", [
    [0, 1],
    [0.45, 0.45],
    [1, 0],
  ]);

// Glow halo peaking at RING_GLOW_PEAK of the texture radius: a plane of size
// 2 * r / RING_GLOW_PEAK puts the brightest band exactly on a ring of radius r.
export const RING_GLOW_PEAK = 0.8;
export const getRingGlow = () =>
  makeTexture("ring", [
    [0, 0],
    [0.55, 0],
    [0.72, 0.35],
    [RING_GLOW_PEAK, 1],
    [0.88, 0.35],
    [1, 0],
  ]);
