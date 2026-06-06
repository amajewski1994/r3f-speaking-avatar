import { Environment, OrbitControls, Sparkles } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import Avatar from "./Avatar";
import Lightformers from "./Lightformers";
import FloatingQuestionPlane from "./FloatingPlane";
import GlowRing from "./GlowRing";
import { useAvatar } from "../hooks/useAvatar";
import { qaData } from "../data/qaData";

const Scene = ({ started }) => {
  const [visiblePlanes, setVisiblePlanes] = useState(0);
  const playMessage = useAvatar((s) => s.playMessage);
  const currentMessage = useAvatar((s) => s.currentMessage);
  const playingId = currentMessage?.id ?? null;

  useEffect(() => {
    if (!started) return;
    const timers = [0, 200, 400, 600, 800].map((delay, i) =>
      setTimeout(() => setVisiblePlanes(i + 1), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [started]);

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight
        castShadow
        position={[5, 6, 5]}
        intensity={0.8}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <pointLight position={[-4, 3, -2]} intensity={10} color="#818cf8" />
      <pointLight position={[4, 2, -1]} intensity={5} color="#c084fc" />
      <pointLight position={[0, 5, -4]} intensity={8} color="#7c3aed" />

      <Sparkles
        count={60}
        scale={[8, 5, 6]}
        size={1.4}
        speed={0.25}
        opacity={0.55}
        color="#a78bfa"
        position={[0, 0.5, 0]}
      />

      <Suspense fallback={null}>
        <Avatar position={[0, -2, 0]} scale={2} />
      </Suspense>

      <GlowRing started={started} />

      <Suspense fallback={null}>
        {visiblePlanes >= 1 && (
          <FloatingQuestionPlane
            text={qaData[0].question}
            position={[-1.75, 1.25, 0]}
            floatSpeed={0.8}
            floatAmplitude={0.1}
            onSelect={() => playMessage(qaData[0])}
            fadeIn
            fadeDelay={9}
            fadeDuration={0.55}
            isActive={playingId === qaData[0].id}
            isDisabled={playingId !== null && playingId !== qaData[0].id}
          />
        )}
        {visiblePlanes >= 2 && (
          <FloatingQuestionPlane
            text={qaData[1].question}
            position={[-1.95, -0.1, 0]}
            floatSpeed={1.4}
            floatAmplitude={0.05}
            onSelect={() => playMessage(qaData[1])}
            fadeIn
            fadeDelay={9.5}
            fadeDuration={0.55}
            isActive={playingId === qaData[1].id}
            isDisabled={playingId !== null && playingId !== qaData[1].id}
          />
        )}
        {visiblePlanes >= 3 && (
          <FloatingQuestionPlane
            text={qaData[2].question}
            position={[2.3, 0, 0]}
            floatSpeed={1.1}
            floatAmplitude={0.22}
            onSelect={() => playMessage(qaData[2])}
            fadeIn
            fadeDelay={10}
            fadeDuration={0.55}
            isActive={playingId === qaData[2].id}
            isDisabled={playingId !== null && playingId !== qaData[2].id}
          />
        )}
        {visiblePlanes >= 4 && (
          <FloatingQuestionPlane
            text={qaData[3].question}
            position={[1.6, 1.6, 0]}
            floatSpeed={0.6}
            floatAmplitude={0.12}
            onSelect={() => playMessage(qaData[3])}
            fadeIn
            fadeDelay={10.5}
            fadeDuration={0.55}
            isActive={playingId === qaData[3].id}
            isDisabled={playingId !== null && playingId !== qaData[3].id}
          />
        )}
        {visiblePlanes >= 5 && (
          <FloatingQuestionPlane
            text={qaData[4].question}
            position={[-0.25, 2.5, 0]}
            floatSpeed={0.75}
            floatAmplitude={0.17}
            onSelect={() => playMessage(qaData[4])}
            fadeIn
            fadeDelay={11}
            fadeDuration={0.55}
            isActive={playingId === qaData[4].id}
            isDisabled={playingId !== null && playingId !== qaData[4].id}
          />
        )}
      </Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#0d0620"
          metalness={0.15}
          roughness={0.85}
        />
      </mesh>

      <Environment frames={1} resolution={256} blur={1} background>
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
