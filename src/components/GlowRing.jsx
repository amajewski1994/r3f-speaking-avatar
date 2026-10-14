import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useAvatar } from "../hooks/useAvatar";
import { getRadialGlow, getRingGlow, RING_GLOW_PEAK } from "../utils/glowTextures";

export const PLATFORM_RADIUS = 2.3;
const PLATFORM_HEIGHT = 0.08;
const TOP = -2; // the avatar's feet

// Opacity of every glowing layer: [base, follows the pulse?]
const LAYERS = {
  glow: [0.28, true],
  spill: [0.22, true],
  edge: [0.45, true],
  rim: [0.65, true],
  ring0: [0.75, true],
  ring1: [0.35, false],
  ring2: [0.35, false],
  halo0: [0.55, true],
  halo1: [0.7, true],
};

// [inner, outer, color]
const RINGS = [
  [1.1, 1.14, "#c4b5fd"],
  [0.62, 0.635, "#a5b4fc"],
  [1.62, 1.645, "#818cf8"],
];

// [radius, color] — soft halos that fake bloom around the bright rings
const HALOS = [
  [1.12, "#8b5cf6"],
  [PLATFORM_RADIUS, "#6366f1"],
];

const additive = {
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  toneMapped: false,
};

// Glowing platform under the avatar; brightens while the avatar is speaking.
const GlowRing = ({ started }) => {
  const glowTex = getRadialGlow();
  const haloTex = getRingGlow();
  const mats = useRef({});
  const fadeRef = useRef(0);
  const talkRef = useRef(0);
  const startedRef = useRef(started);
  const waveRef = useRef();
  const waveMat = useRef();
  const waveStart = useRef(null);
  useEffect(() => {
    startedRef.current = started;
  }, [started]);

  const layer = (key) => (m) => {
    mats.current[key] = m;
  };

  useFrame(({ clock }, delta) => {
    if (startedRef.current) fadeRef.current = Math.min(1, fadeRef.current + delta * 0.8);

    // one soft light wave rolling out from the centre when the platform activates
    if (startedRef.current && waveStart.current === null) waveStart.current = clock.getElapsedTime();
    if (waveRef.current && waveMat.current) {
      const w = waveStart.current === null ? 1 : (clock.getElapsedTime() - waveStart.current) / 1.6;
      waveRef.current.visible = w < 1;
      if (w < 1) {
        const e = 1 - Math.pow(1 - w, 3);
        waveRef.current.scale.setScalar(0.3 + e * 2.9);
        waveMat.current.opacity = 0.7 * (1 - w) * Math.min(1, w * 6);
      }
    }

    const talking = useAvatar.getState().avatarAnimation !== "Idle";
    talkRef.current += ((talking ? 1 : 0) - talkRef.current) * Math.min(1, delta * 3);

    const t = clock.getElapsedTime();
    const pulse = 0.85 + Math.sin(t * (1.3 + talkRef.current * 1.5)) * 0.15;
    const boost = 1 + talkRef.current * 0.45;
    const fade = 0.4 + fadeRef.current * 0.6;

    for (const key in LAYERS) {
      const m = mats.current[key];
      if (!m) continue;
      const [base, pulses] = LAYERS[key];
      m.opacity = base * fade * (pulses ? pulse * boost : 1);
    }
  });

  return (
    <group>
      {/* light spilling onto the floor around the platform — reads as a soft reflection */}
      <mesh position={[0, -2.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 11]} />
        <meshBasicMaterial ref={layer("spill")} map={glowTex} color="#4f46e5" {...additive} />
      </mesh>

      {/* glossy disc */}
      <mesh position={[0, TOP - PLATFORM_HEIGHT / 2, 0]} receiveShadow>
        <cylinderGeometry args={[PLATFORM_RADIUS, PLATFORM_RADIUS + 0.04, PLATFORM_HEIGHT, 128]} />
        <meshStandardMaterial color="#0c0724" metalness={0.6} roughness={0.35} envMapIntensity={0.15} />
      </mesh>

      {/* neon band on the disc side */}
      <mesh position={[0, TOP - PLATFORM_HEIGHT / 2, 0]}>
        <cylinderGeometry
          args={[PLATFORM_RADIUS + 0.006, PLATFORM_RADIUS + 0.046, PLATFORM_HEIGHT, 128, 1, true]}
        />
        <meshBasicMaterial ref={layer("edge")} color="#7c83ff" {...additive} />
      </mesh>

      <group position={[0, TOP + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh renderOrder={1}>
          <planeGeometry args={[4, 4]} />
          <meshBasicMaterial ref={layer("glow")} map={glowTex} color="#7c3aed" {...additive} />
        </mesh>

        {RINGS.map(([inner, outer, color], i) => (
          <mesh key={i} position={[0, 0, 0.001]} renderOrder={2}>
            <ringGeometry args={[inner, outer, 128]} />
            <meshBasicMaterial
              ref={layer(`ring${i}`)}
              color={color}
              side={THREE.DoubleSide}
              {...additive}
            />
          </mesh>
        ))}

        {/* bright rim on the platform edge */}
        <mesh position={[0, 0, 0.002]} renderOrder={2}>
          <ringGeometry args={[PLATFORM_RADIUS - 0.018, PLATFORM_RADIUS + 0.004, 160]} />
          <meshBasicMaterial ref={layer("rim")} color="#8b9cff" {...additive} />
        </mesh>

        {/* activation wave */}
        <mesh ref={waveRef} position={[0, 0, 0.004]} visible={false} renderOrder={4}>
          <planeGeometry args={[2 / RING_GLOW_PEAK, 2 / RING_GLOW_PEAK]} />
          <meshBasicMaterial ref={waveMat} map={haloTex} color="#8b9cff" opacity={0} {...additive} />
        </mesh>

        {HALOS.map(([r, color], i) => {
          const size = (2 * r) / RING_GLOW_PEAK;
          return (
            <mesh key={`halo${i}`} position={[0, 0, 0.003]} renderOrder={3}>
              <planeGeometry args={[size, size]} />
              <meshBasicMaterial ref={layer(`halo${i}`)} map={haloTex} color={color} {...additive} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

export default GlowRing;
