import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

const GlowRing = ({ started }) => {
  const matRef = useRef();
  const fadeRef = useRef(0);
  const startedRef = useRef(started);
  useEffect(() => {
    startedRef.current = started;
  }, [started]);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    if (startedRef.current && fadeRef.current < 0.65) {
      fadeRef.current = Math.min(1, fadeRef.current + 0.012);
    }
    const pulse = Math.sin(clock.getElapsedTime() * 1.35) * 0.18;
    matRef.current.opacity = fadeRef.current * (0.35 + pulse);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.99, 0]}>
      <ringGeometry args={[0.75, 1.25, 64]} />
      <meshBasicMaterial
        ref={matRef}
        color="#4c1d95"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default GlowRing;
