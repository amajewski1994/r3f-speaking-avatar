import {
  Environment,
  OrbitControls,
  PerformanceMonitor,
} from "@react-three/drei";
import { Suspense, useState } from "react";
import Teacher from "./Teacher";
import Lightformers from "./Lightformers";

export default function Scene() {
  const [degraded, setDegraded] = useState(false);

  return (
    <>
      <PerformanceMonitor
        onDecline={() => setDegraded(true)}
        onIncline={() => setDegraded(false)}
      />

      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      <Suspense fallback={null}>
        <Teacher position={[0, -2, 0]} scale={2} />
      </Suspense>

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
        minDistance={4}
        maxDistance={10}
        enableDamping
        enablePan={false}
        dampingFactor={0.08}
        target={[0, 0, 0]}
      />
    </>
  );
}
