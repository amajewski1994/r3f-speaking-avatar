import * as THREE from "three";
import { useMemo } from "react";

export const HORIZON_COLOR = "#21175e";

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uBottom;
  uniform vec3 uGlow;
  varying vec3 vDir;

  void main() {
    float y = vDir.y;
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.3, y));
    col = mix(col, uTop, smoothstep(0.3, 0.85, y));
    col = mix(col, uBottom, smoothstep(0.0, -0.2, y));

    // soft halo behind the avatar
    float halo = pow(max(dot(vDir, normalize(vec3(0.0, 0.1, -1.0))), 0.0), 4.0);
    col += uGlow * halo * 0.55;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

// Deep purple-blue gradient sky. Lighting still comes from the Environment lightformers.
const Backdrop = () => {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color("#0c0a2e") },
      uMid: { value: new THREE.Color("#1d1556") },
      uHorizon: { value: new THREE.Color(HORIZON_COLOR) },
      uBottom: { value: new THREE.Color("#07051a") },
      uGlow: { value: new THREE.Color("#6d3bd8") },
    }),
    [],
  );

  return (
    <mesh scale={60} renderOrder={-1}>
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};

export default Backdrop;
