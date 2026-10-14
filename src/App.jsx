import "./App.css";
import { Canvas } from "@react-three/fiber";
import Scene from "./components/Scene";
import StartButton from "./components/StartButton";
import AudioLoadingOverlay from "./components/AudioLoadingOverlay";
import QuestionPanel from "./components/QuestionPanel";
import { useCompactLayout } from "./hooks/useCompactLayout";
import { CARDS_APPEAR_AFTER_MS } from "./data/layout";
import { useEffect, useState } from "react";

export default function App() {
  const [started, setStarted] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const compact = useCompactLayout();

  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => setCardsVisible(true), CARDS_APPEAR_AFTER_MS);
    return () => clearTimeout(timer);
  }, [started]);

  return (
    <div className="w-screen h-screen bg-[#07051a]">
      <StartButton onStarted={() => setStarted(true)} />
      <AudioLoadingOverlay />
      <Canvas
        shadows
        camera={{ position: [0, 2, 6], fov: 60 }}
        className="w-full h-full"
        dpr={1}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Scene started={started} cardsVisible={cardsVisible} compact={compact} />
      </Canvas>
      <div className="scene-vignette" aria-hidden="true" />
      {compact && <QuestionPanel visible={cardsVisible} />}
    </div>
  );
}
