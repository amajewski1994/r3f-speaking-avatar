import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { getRadialGlow } from "../utils/glowTextures";

// Timeline (seconds from the click): the platform pulses first, then the scan
// sweeps up the avatar. onComplete fires once, when the avatar is fully visible.
export const REVEAL_LEAD = 0.9;
export const REVEAL_DURATION = 3.2;
const FADE_OUT = 0.9;

const SCAN_FROM = -1.97; // just above the platform rings, at the avatar's feet
const SCAN_TO = 1.85; // above the top of the head
const NO_CLIP = 1e4;

const PARTICLES = 70;
const SEEDS = Array.from({ length: PARTICLES }, () => ({
  angle: Math.random() * Math.PI * 2,
  radius: 0.35 + Math.random() * 0.55,
  lag: Math.random() * 0.7,
  speed: 0.2 + Math.random() * 0.5,
}));

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const shellVertex = /* glsl */ `
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

const shellFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vY;
  void main() {
    // hologram tube: bright silhouette edges, fading towards the bottom
    float rim = pow(1.0 - abs(dot(vNormal, vView)), 2.0);
    float grad = 0.25 + 0.75 * vY;
    gl_FragColor = vec4(uColor * rim * grad * uOpacity, 1.0);
  }
`;

// Holographic materialisation of the avatar. The avatar itself is untouched: a
// renderer-level clipping plane hides everything above the scan line (only the
// avatar reaches that high near the platform), while the glow, column and
// particles sell the effect.
const HoloReveal = ({ active, onProgress, onComplete }) => {
  const getState = useThree((s) => s.get);
  const planeRef = useRef(null);
  const pointsRef = useRef();
  const [positions] = useState(() => new Float32Array(PARTICLES * 3));

  const scanRef = useRef();
  const columnRef = useRef();
  const shellMat = useRef();
  const glowMat = useRef();
  const ringMat = useRef();
  const pointsMat = useRef();
  const startRef = useRef(null);
  const doneRef = useRef(false);
  const finishedRef = useRef(false);
  const callbacks = useRef({ onProgress, onComplete });
  useEffect(() => {
    callbacks.current = { onProgress, onComplete };
  }, [onProgress, onComplete]);

  // The plane stays installed for the whole session (parked far above the scene)
  // so starting or ending the reveal never forces a shader recompile.
  useEffect(() => {
    const { gl } = getState();
    const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), NO_CLIP);
    planeRef.current = plane;
    gl.clippingPlanes = [plane];
    return () => {
      gl.clippingPlanes = [];
      planeRef.current = null;
    };
  }, [getState]);

  const shellUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#7c8cff") }, uOpacity: { value: 0 } }),
    [],
  );

  useFrame(({ clock }) => {
    if (!active) return;
    const t = clock.getElapsedTime();
    if (startRef.current === null) startRef.current = t;
    const elapsed = t - startRef.current;
    // finished and the faded-out state already applied: nothing left to animate
    if (finishedRef.current) return;

    const raw = THREE.MathUtils.clamp((elapsed - REVEAL_LEAD) / REVEAL_DURATION, 0, 1);
    const p = ease(raw);
    const scanY = THREE.MathUtils.lerp(SCAN_FROM, SCAN_TO, p);

    // visibility of the effect: in during the lead, out after completion
    const fadeIn = THREE.MathUtils.clamp(elapsed / REVEAL_LEAD, 0, 1);
    const after = elapsed - REVEAL_LEAD - REVEAL_DURATION;
    const fx = after > 0 ? Math.max(0, 1 - after / FADE_OUT) : fadeIn;

    const plane = planeRef.current;
    if (plane) plane.constant = raw < 1 ? scanY : NO_CLIP;
    callbacks.current.onProgress?.(p, elapsed >= REVEAL_LEAD);
    if (raw >= 1 && !doneRef.current) {
      doneRef.current = true;
      callbacks.current.onComplete?.();
    }

    // effect meshes use built-in materials, so they sit just below the clip line
    if (scanRef.current) {
      scanRef.current.position.y = scanY - 0.01;
      scanRef.current.visible = fx > 0.001;
    }
    const flicker = 0.92 + Math.sin(t * 23) * 0.04 + Math.sin(t * 7.3) * 0.04;
    if (glowMat.current) glowMat.current.opacity = 0.55 * fx * flicker;
    if (ringMat.current) ringMat.current.opacity = 0.85 * fx * flicker;

    if (columnRef.current) {
      const h = Math.max(0.001, scanY - SCAN_FROM);
      columnRef.current.scale.y = h;
      columnRef.current.position.y = SCAN_FROM + h / 2;
      columnRef.current.visible = fx > 0.001;
    }
    if (shellMat.current) shellMat.current.uniforms.uOpacity.value = 0.55 * fx;

    // particles drift up towards the scan line and fade into it
    const pos = pointsRef.current?.geometry.attributes.position;
    if (pos) {
      SEEDS.forEach((s, i) => {
        const life = (elapsed * s.speed + s.lag) % 1;
        const a = s.angle + elapsed * 0.4;
        pos.setXYZ(i, Math.cos(a) * s.radius, scanY - 0.9 + life * 0.88, Math.sin(a) * s.radius);
      });
      pos.needsUpdate = true;
    }
    if (pointsMat.current) pointsMat.current.opacity = 0.75 * fx;

    // only stop once a frame with fx = 0 has been applied — on slow frames the
    // fade-out can be skipped over entirely
    if (after >= FADE_OUT) finishedRef.current = true;
  });

  if (!active) return null;

  const additive = {
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  };

  return (
    <group>
      {/* horizontal scan band */}
      <group ref={scanRef} position={[0, SCAN_FROM, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.6, 2.6]} />
          <meshBasicMaterial ref={glowMat} map={getRadialGlow()} color="#8b9cff" opacity={0} {...additive} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.82, 0.85, 96]} />
          <meshBasicMaterial ref={ringMat} color="#c7d2fe" opacity={0} side={THREE.DoubleSide} {...additive} />
        </mesh>
      </group>

      {/* hologram column from the platform up to the scan line */}
      <mesh ref={columnRef} position={[0, SCAN_FROM, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 1, 64, 1, true]} />
        <shaderMaterial
          ref={shellMat}
          uniforms={shellUniforms}
          vertexShader={shellVertex}
          fragmentShader={shellFragment}
          {...additive}
        />
      </mesh>

      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMat}
          map={getRadialGlow()}
          color="#c4b5fd"
          size={0.07}
          sizeAttenuation
          opacity={0}
          {...additive}
        />
      </points>
    </group>
  );
};

export default HoloReveal;
