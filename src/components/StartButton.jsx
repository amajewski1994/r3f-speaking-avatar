import { useState } from "react";
import { startData } from "../data/qaData";
import { useAvatar } from "../hooks/useAvatar";

const StartButton = ({ onStarted }) => {
  const playMessage = useAvatar((s) => s.playMessage);
  const [phase, setPhase] = useState("idle");

  const handleStart = () => {
    if (phase !== "idle") return;

    playMessage(startData);
    setPhase("fading");

    setTimeout(() => {
      setPhase("gone");
      onStarted?.();
    }, 500);
  };

  if (phase === "gone") return null;

  return (
    <button
      onClick={handleStart}
      className={`fixed top-[28%] left-1/2 -translate-x-1/2 inline-flex items-center justify-center px-16 py-6 text-3xl font-bold rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-all duration-500 z-[9999] ${
        phase === "fading"
          ? "opacity-0 scale-95 blur-sm pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      START
    </button>
  );
};

export default StartButton;
