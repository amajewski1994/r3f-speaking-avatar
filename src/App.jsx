import "./App.css";
import { Canvas } from "@react-three/fiber";
import Scene from "./components/Scene";
import StartButton from "./components/StartButton";
import { useState } from "react";

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <div className="w-screen h-screen">
      <StartButton onStarted={() => setStarted(true)} />
      <Canvas
        shadows
        camera={{ position: [0, 2, 6], fov: 60 }}
        className="w-full h-full"
        dpr={1}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Scene started={started} />
      </Canvas>
    </div>
  );
}
