import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const FloatingQuestionPlane = ({
  text,
  position = [0, 0, 0],
  floatSpeed = 1,
  floatAmplitude = 0.15,
  onSelect,
}) => {
  const ref = useRef();

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;

    ref.current.position.y =
      position[1] + Math.sin(t * floatSpeed) * floatAmplitude;

    ref.current.lookAt(camera.position);
  });

  return (
    <group
      ref={ref}
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
          color="#1e1b4b"
          transparent
          opacity={0.85}
          roughness={0.4}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
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
