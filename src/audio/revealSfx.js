import { REVEAL_DURATION, REVEAL_LEAD, revealEase } from "../data/revealTimeline";

// Procedural sound for the holographic intro (Web Audio, no asset files):
// a soft power-up when the platform pulses, a rising shimmering sweep while the
// scan builds the avatar, and a quiet "lock-in" chime when it is complete.

const MASTER_VOLUME = 0.4;

// small deterministic PRNG so the sparkle pattern is the same on every play
const prng = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const noiseBuffer = (ctx, seconds = 2) => {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const rand = prng(7);
  for (let i = 0; i < data.length; i++) data[i] = rand() * 2 - 1;
  return buffer;
};

const noiseSource = (ctx, buffer) => {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  return src;
};

// Values from -> to following the scan's easing, for setValueCurveAtTime.
const sweep = (from, to, steps = 96) =>
  Float32Array.from({ length: steps }, (_, i) => from + (to - from) * revealEase(i / (steps - 1)));

const envelope = (param, points) => {
  param.setValueAtTime(points[0][1], points[0][0]);
  for (const [t, v, kind] of points.slice(1)) {
    if (kind === "exp") param.exponentialRampToValueAtTime(Math.max(v, 0.0001), t);
    else param.linearRampToValueAtTime(v, t);
  }
};

// Schedules the whole effect on `ctx` starting at time `t0`, into `destination`.
// Works with an OfflineAudioContext too. Returns the time the sound has ended.
export const scheduleRevealSfx = (ctx, destination, t0) => {
  const scanStart = t0 + REVEAL_LEAD;
  const scanEnd = scanStart + REVEAL_DURATION;
  const noise = noiseBuffer(ctx);

  const master = ctx.createGain();
  master.gain.value = MASTER_VOLUME;
  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 9000;
  const limiter = ctx.createDynamicsCompressor();
  master.connect(soften).connect(limiter).connect(destination);

  // 1. Platform power-up: a low pitch drop with a muffled air "whoomp".
  {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(120, t0);
    osc.frequency.exponentialRampToValueAtTime(42, t0 + 0.7);
    const gain = ctx.createGain();
    envelope(gain.gain, [[t0, 0.0001], [t0 + 0.03, 0.55, "exp"], [t0 + 1.0, 0.0001, "exp"]]);
    osc.connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + 1.05);

    const air = noiseSource(ctx, noise);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(900, t0);
    lp.frequency.exponentialRampToValueAtTime(150, t0 + 0.9);
    const airGain = ctx.createGain();
    envelope(airGain.gain, [[t0, 0], [t0 + 0.05, 0.18], [t0 + 0.95, 0.0001, "exp"]]);
    air.connect(lp).connect(airGain).connect(master);
    air.start(t0);
    air.stop(t0 + 1.0);
  }

  // A quiet rising "charge" bridging the pulse into the scan.
  {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, t0 + 0.25);
    osc.frequency.exponentialRampToValueAtTime(196, scanStart + 0.3);
    const gain = ctx.createGain();
    envelope(gain.gain, [[t0 + 0.25, 0], [scanStart, 0.05], [scanStart + 0.45, 0]]);
    osc.connect(gain).connect(master);
    osc.start(t0 + 0.25);
    osc.stop(scanStart + 0.5);
  }

  // 2. Scan: detuned pad whose pitch and brightness rise with the scan line,
  // with a fast tremolo for the hologram flicker.
  {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 6;
    filter.frequency.setValueCurveAtTime(sweep(250, 3200), scanStart, REVEAL_DURATION);

    const tremolo = ctx.createGain();
    tremolo.gain.value = 0.75;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 13;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.25;
    lfo.connect(lfoDepth).connect(tremolo.gain);

    const env = ctx.createGain();
    envelope(env.gain, [
      [scanStart, 0],
      [scanStart + 0.5, 0.16],
      [scanEnd - 0.2, 0.16],
      [scanEnd + 0.35, 0.0001, "exp"],
    ]);
    filter.connect(tremolo).connect(env).connect(master);

    for (const [type, base] of [["sawtooth", 98], ["sawtooth", 98 * 1.006], ["triangle", 147]]) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueCurveAtTime(sweep(base, base * 2), scanStart, REVEAL_DURATION);
      osc.connect(filter);
      osc.start(scanStart);
      osc.stop(scanEnd + 0.4);
    }
    lfo.start(scanStart);
    lfo.stop(scanEnd + 0.4);

    // the "scanning" hiss, its band climbing with the line
    const hiss = noiseSource(ctx, noise);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 5;
    band.frequency.setValueCurveAtTime(sweep(700, 6500), scanStart, REVEAL_DURATION);
    const hissGain = ctx.createGain();
    envelope(hissGain.gain, [[scanStart, 0], [scanStart + 0.4, 0.08], [scanEnd - 0.1, 0.08], [scanEnd + 0.2, 0]]);
    hiss.connect(band).connect(hissGain).connect(master);
    hiss.start(scanStart);
    hiss.stop(scanEnd + 0.25);

    // sparkles to match the particles drifting into the scan line
    const rand = prng(42);
    for (let i = 0; i < 26; i++) {
      const u = rand();
      const t = scanStart + 0.15 + u * (REVEAL_DURATION - 0.3);
      const osc = ctx.createOscillator();
      osc.frequency.value = (1800 + 3800 * revealEase(u)) * (0.85 + rand() * 0.3);
      const gain = ctx.createGain();
      envelope(gain.gain, [[t, 0.0001], [t + 0.005, 0.04 + rand() * 0.02, "exp"], [t + 0.14, 0.0001, "exp"]]);
      const pan = ctx.createStereoPanner();
      pan.pan.value = rand() * 1.4 - 0.7;
      osc.connect(gain).connect(pan).connect(master);
      osc.start(t);
      osc.stop(t + 0.16);
    }
  }

  // 3. Lock-in chime: the avatar is complete (kept soft — the intro speech starts here).
  {
    const partials = [
      [329.63, 0.04, 1.2],
      [659.25, 0.07, 1.6],
      [987.77, 0.045, 1.2],
      [1318.51, 0.03, 0.9],
    ];
    for (const [freq, level, decay] of partials) {
      const osc = ctx.createOscillator();
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      envelope(gain.gain, [[scanEnd, 0.0001], [scanEnd + 0.012, level, "exp"], [scanEnd + decay, 0.0001, "exp"]]);
      osc.connect(gain).connect(master);
      osc.start(scanEnd);
      osc.stop(scanEnd + decay + 0.05);
    }
  }

  return scanEnd + 1.7;
};

let played = false;

// Plays the effect once per page load. Call it from the click handler so the
// browser allows the AudioContext to start.
export const playRevealSfx = () => {
  if (played) return;
  played = true;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    ctx.resume?.();
    const end = scheduleRevealSfx(ctx, ctx.destination, ctx.currentTime + 0.03);
    setTimeout(() => ctx.close().catch(() => {}), (end - ctx.currentTime) * 1000 + 500);
  } catch (err) {
    console.warn("Reveal sound unavailable:", err);
  }
};
