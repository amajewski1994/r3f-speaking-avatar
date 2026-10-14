// Shared timeline of the holographic intro, used by the visual effect and its sound.
// Seconds from the "Enter Experience" click: the platform pulses first, then the
// scan sweeps up the avatar.
export const REVEAL_LEAD = 0.9;
export const REVEAL_DURATION = 3.2;

// easeInOutCubic — the scan line's motion (and the sound's sweep) follow this curve
export const revealEase = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
