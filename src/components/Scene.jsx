import { Environment, OrbitControls, Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import Avatar from "./Avatar";
import Lightformers from "./Lightformers";
import FloatingQuestionPlane from "./FloatingPlane";
import GlowRing from "./GlowRing";
import OrbitLines from "./OrbitLines";
import Backdrop, { HORIZON_COLOR } from "./Backdrop";
import Atmosphere from "./Atmosphere";
import { useAvatar } from "../hooks/useAvatar";
import { qaData } from "../data/qaData";
import { CARD_APPEAR_STAGGER, CARD_LAYOUT, cardState } from "../data/layout";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Keeps its children facing the camera's azimuth so the card layout stays
// readable while the user orbits around the avatar.
const FollowCamera = ({ children }) => {
  const ref = useRef();
  // Priority -0.5: after OrbitControls moves the camera (-1) and before the cards'
  // <Html> projects its position (0). Otherwise the cards lag one frame behind the
  // rotation and wobble while the user orbits.
  useFrame(({ camera }) => {
    if (ref.current) ref.current.rotation.y = Math.atan2(camera.position.x, camera.position.z);
  }, -0.5);
  return <group ref={ref}>{children}</group>;
};

// On compact screens the question list covers the bottom of the viewport, so the
// frame is shifted up (lens shift) instead of moving the camera, keeping the perspective.
const ViewShift = ({ amount }) => {
  const current = useRef(0);

  useFrame(({ camera, size }, delta) => {
    const prev = current.current;
    current.current += (amount - prev) * Math.min(1, delta * 2.5);
    if (Math.abs(amount - current.current) < 0.0005) current.current = amount;

    const view = camera.view;
    const stale = view?.enabled && (view.fullWidth !== size.width || view.fullHeight !== size.height);
    if (current.current === prev && !stale) return;

    if (current.current > 0) {
      camera.setViewOffset(size.width, size.height, 0, size.height * current.current, size.width, size.height);
    } else {
      camera.clearViewOffset();
    }
  });

  return null;
};

const Scene = ({ started, cardsVisible, compact }) => {
  const playMessage = useAvatar((s) => s.playMessage);
  const playingId = useAvatar((s) => s.currentMessage?.id ?? null);
  const size = useThree((s) => s.size);

  // Wide layout: cards keep their proportion to the scene and pull in on narrower screens.
  const aspect = size.width / size.height;
  const uiScale = clamp(Math.min(size.width / 1440, size.height / 900), 0.6, 1.15);
  const spread = clamp(aspect / 1.6, 0.68, 1);

  return (
    <>
      <ViewShift amount={compact && cardsVisible ? 0.24 : 0} />
      <fog attach="fog" args={[HORIZON_COLOR, 9, 28]} />

      <ambientLight intensity={1.2} />
      <directionalLight
        castShadow
        position={[5, 6, 5]}
        intensity={0.8}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-radius={6}
      />
      {/* blue / purple rim lights from behind separate the avatar from the backdrop */}
      <directionalLight position={[-3.5, 3, -5]} intensity={1.7} color="#60a5fa" />
      <directionalLight position={[3.5, 2.5, -5]} intensity={1.4} color="#c084fc" />

      <pointLight position={[-4, 3, -2]} intensity={10} color="#818cf8" />
      <pointLight position={[4, 2, -1]} intensity={5} color="#c084fc" />
      <pointLight position={[0, 5, -4]} intensity={8} color="#7c3aed" />

      <Sparkles
        count={60}
        scale={[10, 5, 7]}
        size={1.3}
        speed={0.22}
        opacity={0.45}
        color="#c7d2fe"
        position={[0, 0.5, 0]}
      />
      <Sparkles
        count={14}
        scale={[14, 6, 6]}
        size={5}
        speed={0.12}
        opacity={0.28}
        color="#a78bfa"
        position={[0, 0.8, -3]}
      />

      <Suspense fallback={null}>
        <Avatar position={[0, -2, 0]} scale={2} />
      </Suspense>

      <GlowRing started={started} />

      <FollowCamera>
        <Backdrop />
        <Atmosphere />
        {!compact && <OrbitLines visible={started} />}

        {!compact &&
          qaData.map((q, i) => {
            const { position, ...float } = CARD_LAYOUT[q.id];
            return (
              <FloatingQuestionPlane
                key={q.id}
                question={q}
                position={[position[0] * spread, position[1], position[2]]}
                {...float}
                uiScale={uiScale}
                visible={cardsVisible}
                appearDelay={i * CARD_APPEAR_STAGGER}
                state={cardState(q.id, playingId)}
                onSelect={() => playMessage(q)}
              />
            );
          })}
      </FollowCamera>

      {/* floor, level with the bottom of the platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.08, 0]} receiveShadow>
        <circleGeometry args={[40, 96]} />
        <meshStandardMaterial color="#0d0828" metalness={0.15} roughness={0.85} />
      </mesh>

      <Environment frames={1} resolution={256} blur={1}>
        <Lightformers />
      </Environment>

      <OrbitControls
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        minDistance={6.5}
        maxDistance={10}
        enableDamping
        enablePan={false}
        dampingFactor={0.08}
        target={[0, 0, 0]}
      />
    </>
  );
};

export default Scene;
