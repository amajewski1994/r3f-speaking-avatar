import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { getRadialGlow } from "../utils/glowTextures";

const beamVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vY;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vY = uv.y;
    gl_Position = projectionMatrix * mv;
  }
`;

const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vY;
  void main() {
    // brightest through the core of the cone, soft towards its silhouette
    float core = pow(abs(dot(vNormal, vView)), 3.0);
    float falloff = smoothstep(0.0, 0.55, vY) * (0.35 + 0.65 * vY);
    gl_FragColor = vec4(uColor * core * falloff * uOpacity, 1.0);
  }
`;

// Soft volumetric-looking light shaft falling from above, behind the avatar.
const LightBeam = () => {
  const matRef = useRef();
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#8b7bff") },
      uOpacity: { value: 0.22 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uOpacity.value = 0.2 + Math.sin(clock.getElapsedTime() * 0.6) * 0.03;
  });

  return (
    <mesh position={[0, 2.2, -2.2]}>
      <cylinderGeometry args={[0.35, 2.6, 9, 48, 1, true]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={beamVertex}
        fragmentShader={beamFragment}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};

// [x, y, z, width, height, color, opacity] — low purple mist near the horizon
const HAZE = [
  [-7, -1.1, -6, 9, 2.8, "#7c3aed", 0.32],
  [7.5, -1.0, -6.5, 10, 3, "#a855f7", 0.28],
  [-3, -1.6, -9, 9, 2.2, "#4f46e5", 0.22],
  [4, -1.7, -10, 10, 2.2, "#6366f1", 0.2],
];

const Haze = () => {
  const tex = getRadialGlow();
  const group = useRef();

  // a very slow drift so the mist feels alive
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((m, i) => {
      m.position.x = HAZE[i][0] + Math.sin(t * 0.07 + i * 1.7) * 0.6;
    });
  });

  return (
    <group ref={group}>
      {HAZE.map(([x, y, z, w, h, color, opacity], i) => (
        <mesh key={i} position={[x, y, z]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial
            map={tex}
            color={color}
            transparent
            opacity={opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
};

const Atmosphere = () => (
  <>
    <LightBeam />
    <Haze />
  </>
);

export default Atmosphere;
