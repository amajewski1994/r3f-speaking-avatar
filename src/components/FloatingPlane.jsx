import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
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
  isActive = false,
  isDisabled = false,
}) => {
  const groupRef = useRef();
  const panelRef = useRef();
  const shineRef = useRef();
  const textRef = useRef();

  const appearStartRef = useRef(null);
  const hoverRef = useRef(false);
  const hoverLerp = useRef(0);
  const activeLerp = useRef(0);
  const dimLerp = useRef(0);

  useEffect(() => {
    if (isDisabled) {
      hoverRef.current = false;
      document.body.style.cursor = "default";
    }
  }, [isDisabled]);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const g = groupRef.current;
    if (!g) return;

    g.position.y = position[1] + Math.sin(t * floatSpeed) * floatAmplitude;
    g.lookAt(camera.position);

    activeLerp.current += ((isActive ? 1 : 0) - activeLerp.current) * 0.08;
    dimLerp.current += ((isDisabled ? 1 : 0) - dimLerp.current) * 0.08;
    const a = activeLerp.current;
    const d = dimLerp.current;

    const hoverTarget = isDisabled ? 0 : hoverRef.current ? 1 : 0;
    hoverLerp.current += (hoverTarget - hoverLerp.current) * 0.1;
    const h = hoverLerp.current;

    let f = 1;
    if (fadeIn) {
      if (appearStartRef.current === null) {
        appearStartRef.current = t;
        g.scale.setScalar(0.46);
        if (panelRef.current) panelRef.current.opacity = 0;
        if (shineRef.current) shineRef.current.opacity = 0;
        if (textRef.current?.material) {
          textRef.current.material.transparent = true;
          textRef.current.material.opacity = 0;
        }
      }
      const raw = clamp01(
        (t - appearStartRef.current - fadeDelay) /
          Math.max(0.001, fadeDuration),
      );
      f = raw * raw * (3 - 2 * raw);
    }

    const vis = THREE.MathUtils.lerp(1, 0.18, d);

    const baseScale = fadeIn ? THREE.MathUtils.lerp(0.46, 0.5, f) : 0.5;
    g.scale.setScalar(
      (baseScale + h * 0.012 + a * 0.018) * THREE.MathUtils.lerp(1, 0.97, d),
    );

    if (panelRef.current) panelRef.current.opacity = 0.92 * f * vis;
    if (shineRef.current)
      shineRef.current.opacity = (0.35 + h * 0.3 + a * 0.45) * f * vis;
    if (textRef.current?.material) textRef.current.material.opacity = f * vis;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={fadeIn ? 0.46 : 0.5}
      onClick={isDisabled ? undefined : onSelect}
      onPointerOver={(e) => {
        if (isDisabled) return;
        e.stopPropagation();
        hoverRef.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hoverRef.current = false;
        document.body.style.cursor = "default";
      }}
    >
      <mesh renderOrder={1}>
        <planeGeometry args={[3.6, 1.2]} />
        <meshStandardMaterial
          ref={panelRef}
          color="#0a0520"
          transparent
          opacity={fadeIn ? 0 : 0.92}
          metalness={0.5}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.565, 0.01]} renderOrder={2}>
        <planeGeometry args={[3.35, 0.018]} />
        <meshBasicMaterial
          ref={shineRef}
          color="#c4b5fd"
          transparent
          opacity={fadeIn ? 0 : 0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <Text
        ref={textRef}
        position={[0, 0, 0.06]}
        maxWidth={3.0}
        textAlign="center"
        fontSize={0.19}
        lineHeight={1.3}
        color="#ede9fe"
        anchorX="center"
        anchorY="middle"
        renderOrder={3}
        depthTest={false}
      >
        {text}
      </Text>
    </group>
  );
};

export default FloatingQuestionPlane;
