// Cards ease in once the avatar's reveal has finished (seconds).
export const CARD_APPEAR_DELAY = 0.6;
export const CARD_APPEAR_STAGGER = 0.3;

// Card placement around the avatar for the wide layout, keyed by question id:
// a symmetric 3 + 3 arc — beside the head, at shoulder height, and lower down.
export const CARD_LAYOUT = {
  5: { position: [-1.95, 2.15, 0], floatSpeed: 0.75, floatAmplitude: 0.06, floatPhase: 2.8 },
  1: { position: [-2.85, 0.75, 0], floatSpeed: 0.8, floatAmplitude: 0.07, floatPhase: 0 },
  2: { position: [-2.6, -0.65, 0], floatSpeed: 1.2, floatAmplitude: 0.05, floatPhase: 1.3 },
  6: { position: [1.95, 2.15, 0], floatSpeed: 0.7, floatAmplitude: 0.06, floatPhase: 1.9 },
  4: { position: [2.85, 0.75, 0], floatSpeed: 0.65, floatAmplitude: 0.07, floatPhase: 0.7 },
  3: { position: [2.6, -0.65, 0], floatSpeed: 1.0, floatAmplitude: 0.06, floatPhase: 2.1 },
};

// Neon accent of each card (border, icon, glow), keyed by question id: [light, deep].
export const CARD_ACCENTS = {
  1: ["#60a5fa", "#6366f1"],
  2: ["#e879f9", "#a855f7"],
  3: ["#60a5fa", "#3b82f6"],
  4: ["#c084fc", "#8b5cf6"],
  5: ["#a78bfa", "#6366f1"],
  6: ["#22d3ee", "#6366f1"],
};

export const COMPACT_MEDIA_QUERY = "(max-width: 767px), (max-aspect-ratio: 9/10)";

// Visual state of a question card given the id of the message being spoken.
export const cardState = (id, playingId) => {
  if (playingId === null) return "idle";
  return playingId === id ? "active" : "disabled";
};
