import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

export default function LoaderOverlay() {
  const { active, progress } = useProgress();
  const [forceVisible, setForceVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setForceVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!forceVisible && !active) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 select-none">
        <div className="h-14 w-14 rounded-full border-4 border-black/30 border-t-black animate-spin" />
        <div className="text-black text-sm">
          Loading… {active ? `${progress.toFixed(0)}%` : ""}
        </div>
      </div>
    </div>
  );
}
