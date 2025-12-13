import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Teacher from "./components/Teacher";
import LoaderOverlay from "./components/LoaderOverlay";
import { Delay } from "./components/DelayResource";

export default function App() {
  return (
    <div className="relative w-screen h-screen">
      <Canvas
        className="w-full h-full"
        dpr={1}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} />

        <Suspense fallback={null}>
          <Delay>
            <Teacher position={[0, -2, 0]} scale={2} />
          </Delay>
        </Suspense>
      </Canvas>

      <LoaderOverlay />
    </div>
  );
}
