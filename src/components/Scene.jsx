import {
  Environment,
  OrbitControls,
  PerformanceMonitor,
} from "@react-three/drei";
import { Suspense, useState } from "react";
import Avatar from "./Avatar";
import Lightformers from "./Lightformers";
import FloatingQuestionPlane from "./FloatingPlane";
import { useAvatar } from "../hooks/useAvatar";
import { qaData } from "../data/qaData";

const Scene = ({ started }) => {
  const [degraded, setDegraded] = useState(false);
  const playMessage = useAvatar((s) => s.playMessage);

  return (
    <>
      <PerformanceMonitor
        onDecline={() => setDegraded(true)}
        onIncline={() => setDegraded(false)}
      />

      <ambientLight intensity={1.5} />
      <directionalLight
        castShadow
        position={[5, 6, 5]}
        intensity={1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Suspense fallback={null}>
        <Avatar position={[0, -2, 0]} scale={2} />
      </Suspense>

      <Suspense fallback={null}>
        {started && (
          <>
            <FloatingQuestionPlane
              text={qaData[0].question}
              position={[-1.75, 1.25, 0]}
              floatSpeed={0.8}
              floatAmplitude={0.1}
              onSelect={() => playMessage(qaData[0])}
              fadeIn
              fadeDelay={0.0}
              fadeDuration={0.55}
            />
            <FloatingQuestionPlane
              text={qaData[1].question}
              position={[-1.95, -0.1, 0]}
              floatSpeed={1.4}
              floatAmplitude={0.05}
              onSelect={() => playMessage(qaData[1])}
              fadeIn
              fadeDelay={0.25}
              fadeDuration={0.55}
            />
            <FloatingQuestionPlane
              text={qaData[2].question}
              position={[2.3, 0, 0]}
              floatSpeed={1.1}
              floatAmplitude={0.22}
              onSelect={() => playMessage(qaData[2])}
              fadeIn
              fadeDelay={0.5}
              fadeDuration={0.55}
            />
            <FloatingQuestionPlane
              text={qaData[3].question}
              position={[1.6, 1.6, 0]}
              floatSpeed={0.6}
              floatAmplitude={0.12}
              onSelect={() => playMessage(qaData[3])}
              fadeIn
              fadeDelay={0.75}
              fadeDuration={0.55}
            />
            <FloatingQuestionPlane
              text={qaData[4].question}
              position={[-0.25, 2.5, 0]}
              floatSpeed={0.75}
              floatAmplitude={0.17}
              onSelect={() => playMessage(qaData[4])}
              fadeIn
              fadeDelay={1.0}
              fadeDuration={0.55}
            />
          </>
        )}
      </Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#170a37" />
      </mesh>

      <Environment
        frames={degraded ? 1 : Infinity}
        resolution={256}
        blur={1}
        background
      >
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
