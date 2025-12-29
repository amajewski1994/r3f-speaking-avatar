import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const clamp01 = (v) => Math.max(0, Math.min(1, v));

const FloatingQuestionPlane = ({
  text,
  position = [0, 0, 0],
  floatSpeed = 1,
  floatAmplitude = 0.15,
  onSelect,
  fadeIn = false,
  fadeDelay = 0,
  fadeDuration = 0.5,
}) => {
  const groupRef = useRef();
  const matRef = useRef();
  const textRef = useRef();

  const appearStartRef = useRef(null);
  const targetBgOpacity = 0.85;
  const initialScale = fadeIn ? 0.92 : 1;

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const g = groupRef.current;
    if (!g) return;

    g.position.y = position[1] + Math.sin(t * floatSpeed) * floatAmplitude;
    g.lookAt(camera.position);

    if (fadeIn) {
      if (appearStartRef.current === null) {
        appearStartRef.current = t;
        if (matRef.current) matRef.current.opacity = 0;
        if (textRef.current?.material) {
          textRef.current.material.transparent = true;
          textRef.current.material.opacity = 0;
        }
        g.scale.setScalar(initialScale * 0.5);
      }

      const elapsed = t - appearStartRef.current;
      const x = (elapsed - fadeDelay) / Math.max(0.001, fadeDuration);
      const a = clamp01(x);

      const eased = a * a * (3 - 2 * a);

      if (matRef.current) {
        matRef.current.opacity = targetBgOpacity * eased;
      }
      if (textRef.current?.material) {
        textRef.current.material.opacity = eased;
      }

      const s = THREE.MathUtils.lerp(initialScale * 0.5, 0.5, eased);
      g.scale.setScalar(s);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={0.5}
      onClick={onSelect}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <mesh castShadow renderOrder={0}>
        <planeGeometry args={[3.6, 1.2]} />
        <meshStandardMaterial
          ref={matRef}
          color="#1e1b4b"
          transparent
          opacity={fadeIn ? 0 : 0.85}
          roughness={0.4}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        ref={textRef}
        position={[0, 0, 0.05]}
        maxWidth={3.2}
        textAlign="center"
        fontSize={0.18}
        lineHeight={1.25}
        color="#e9d5ff"
        anchorX="center"
        anchorY="middle"
        renderOrder={1}
        depthTest={false}
      >
        {text}
      </Text>
    </group>
  );
};

export default FloatingQuestionPlane;
