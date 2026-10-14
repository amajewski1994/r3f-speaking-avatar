import * as THREE from "three";
import { Billboard, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { getRadialGlow } from "../utils/glowTextures";

// Brightness along the orbit: the short stretch passing in front of the avatar
// (angle π/2 = nearest to the camera) fades out so it never cuts across the body.
const frontFade = (a) => {
  const d = Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2)));
  return THREE.MathUtils.smoothstep(d, 0.25, 0.75);
};

// Tilted towards the camera so they read as ellipses rather than flat lines.
const ORBITS = [
  {
    rx: 4.4, rz: 2.3, y: 0.85, tilt: [0.3, 0, -0.06],
    color: "#a5b4fc", opacity: 0.5,
    orbs: [{ speed: 0.11, offset: 2.4, color: "#c084fc", size: 0.05 }],
  },
  {
    rx: 3.6, rz: 1.8, y: -0.7, tilt: [0.2, 0, 0.07],
    color: "#818cf8", opacity: 0.35,
    orbs: [{ speed: -0.08, offset: 0.4, color: "#60a5fa", size: 0.04 }],
  },
];

const Orb = ({ rx, rz, speed, offset, color, size, fade }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const a = offset + clock.getElapsedTime() * speed;
    ref.current.position.set(Math.cos(a) * rx, 0, Math.sin(a) * rz);
    ref.current.scale.setScalar(fade.current * frontFade(a));
  });

  return (
    <group ref={ref} scale={0}>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color="#f5f3ff" toneMapped={false} />
      </mesh>
      <Billboard>
        <mesh>
          <planeGeometry args={[size * 9, size * 9]} />
          <meshBasicMaterial
            map={getRadialGlow()}
            color={color}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
};

const Orbit = ({ rx, rz, y, tilt, color, opacity, orbs, visible }) => {
  const { points, colors } = useMemo(() => {
    const base = new THREE.Color(color);
    const n = 200;
    const points = [];
    const colors = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      points.push([Math.cos(a) * rx, 0, Math.sin(a) * rz]);
      const k = frontFade(a);
      colors.push([base.r * k, base.g * k, base.b * k]);
    }
    return { points, colors };
  }, [rx, rz, color]);

  const lineRef = useRef();
  const fade = useRef(0);

  useFrame((_, delta) => {
    fade.current += ((visible ? 1 : 0) - fade.current) * Math.min(1, delta * 1.5);
    if (lineRef.current) lineRef.current.material.opacity = opacity * fade.current;
  });

  return (
    <group position={[0, y, 0]} rotation={tilt}>
      {/* additive: dark vertex colours become fully transparent */}
      <Line
        ref={lineRef}
        points={points}
        vertexColors={colors}
        color="#ffffff"
        lineWidth={1.2}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
      {orbs.map((o, i) => (
        <Orb key={i} rx={rx} rz={rz} fade={fade} {...o} />
      ))}
    </group>
  );
};

const OrbitLines = ({ visible }) => (
  <>
    {ORBITS.map((o, i) => (
      <Orbit key={i} {...o} visible={visible} />
    ))}
  </>
);

export default OrbitLines;
