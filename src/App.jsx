import "./App.css";
import { Canvas } from "@react-three/fiber";
import Scene from "./components/Scene";
import WelcomeScreen from "./components/WelcomeScreen";
import AudioLoadingOverlay from "./components/AudioLoadingOverlay";
import QuestionPanel from "./components/QuestionPanel";
import { useCompactLayout } from "./hooks/useCompactLayout";
import { useAvatar } from "./hooks/useAvatar";
import { startData } from "./data/qaData";
import { playRevealSfx } from "./audio/revealSfx";
import { useCallback, useRef, useState } from "react";

export default function App() {
  // "welcome" -> "intro" (holographic reveal) -> "ready"; it never goes back,
  // so the introduction plays once per page load.
  const [phase, setPhase] = useState("welcome");
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const handleAvatarLoaded = useCallback(() => setAvatarLoaded(true), []);
  const introSpoken = useRef(false);
  const compact = useCompactLayout();

  const handleEnter = () => {
    if (phase !== "welcome" || !avatarLoaded) return;
    const { unlockAudio, preloadMessage } = useAvatar.getState();
    unlockAudio();
    playRevealSfx(); // in sync with the holographic reveal
    preloadMessage(startData); // fetch while the reveal plays
    setPhase("intro");
  };

  // Called by the reveal effect once the avatar is fully visible.
  const handleRevealComplete = useCallback(() => {
    if (introSpoken.current) return;
    introSpoken.current = true;
    setPhase("ready");
    useAvatar.getState().playMessage(startData);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#07051a]">
      <AudioLoadingOverlay />
      <Canvas
        shadows
        camera={{ position: [0, 2, 6], fov: 60 }}
        className="w-full h-full"
        dpr={1}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Scene
          phase={phase}
          onAvatarLoaded={handleAvatarLoaded}
          onRevealComplete={handleRevealComplete}
          compact={compact}
        />
      </Canvas>
      <div className="scene-vignette" aria-hidden="true" />
      {compact && <QuestionPanel visible={phase === "ready"} />}
      <WelcomeScreen
        ready={avatarLoaded}
        leaving={phase !== "welcome"}
        onEnter={handleEnter}
      />
    </div>
  );
}
