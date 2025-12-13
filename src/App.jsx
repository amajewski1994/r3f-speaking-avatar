import "./App.css";
import { Canvas } from "@react-three/fiber";
import Scene from "./components/Scene";

export default function App() {
  return (
    <div className="w-screen h-screen">
      <Canvas
        camera={{ position: [0, 2, 6], fov: 60 }}
        className="w-full h-full"
        dpr={1}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
