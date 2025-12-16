import "./App.css";
import { Canvas } from "@react-three/fiber";
import Scene from "./components/Scene";
import { useState } from "react";

const animations = ["Idle", "Talking0", "Talking1"];

export default function App() {
  const [animationIndex, setAnimationIndex] = useState(0);

  const changeAnimation = () => {
    setAnimationIndex((prev) => (prev + 1) % animations.length);
  };

  return (
    <div className="w-screen h-screen">
      <div className="absolute z-10 left-1/2 top-2.5 -translate-x-1/2">
        <button
          onClick={changeAnimation}
          id="nextAnimation__button"
          className="bg-amber-100 p-2! block cursor-pointer rounded-md"
        >
          NEXT ANIMATION
        </button>
      </div>
      <Canvas
        shadows
        camera={{ position: [0, 2, 6], fov: 60 }}
        className="w-full h-full"
        dpr={1}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Scene animation={animations[animationIndex]} />
      </Canvas>
    </div>
  );
}
