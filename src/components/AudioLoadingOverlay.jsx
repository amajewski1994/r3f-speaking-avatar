import { useEffect, useRef, useState } from "react";
import { useAvatar } from "../hooks/useAvatar";

const BARS = 5;
const DELAYS = ["0s", "0.15s", "0.3s", "0.15s", "0s"];

export default function AudioLoadingOverlay() {
  const loading = useAvatar((s) => s.loading);
  const hasEverLoaded = useRef(false);
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    if (hasEverLoaded.current) return;
    if (loading) {
      setPhase("entering");
    } else if (phase !== "idle") {
      setPhase("leaving");
      hasEverLoaded.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    if (phase !== "entering") return;
    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase("visible"));
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [phase]);

  const handleTransitionEnd = (e) => {
    if (e.target !== e.currentTarget) return;
    if (phase === "leaving") setPhase("idle");
  };

  if (phase === "idle") return null;

  const visible = phase === "visible";

  return (
    <>
      <style>{`@keyframes alo-wave { 0% { height: 8px; opacity: 0.55; } 100% { height: 38px; opacity: 1; } }`}</style>

      <div
        className="fixed inset-0 z-9998 flex items-center justify-center pointer-events-none transition-[opacity,transform] duration-550 ease-in-out"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(8px)" }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="flex flex-col items-center gap-4 pt-7.5 px-10 pb-6.5 bg-[rgba(10,10,15,0.62)] backdrop-blur-[18px] backdrop-saturate-180 rounded-3xl border border-white/10 shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_20px_60px_rgba(0,0,0,0.35),inset_0_0_80px_rgba(120,80,255,0.08)]">

          {/* Sound-wave bars */}
          <div className="flex items-end gap-1.25 h-11">
            {Array.from({ length: BARS }, (_, i) => (
              <div
                key={i}
                className="w-1.25 rounded-[3px] bg-linear-to-t from-[#7c5af6] to-[#c4b5fd] shadow-[0_0_8px_rgba(124,90,246,0.5)] animate-[alo-wave_1.1s_ease-in-out_infinite_alternate]"
                style={{ animationDelay: DELAYS[i] }}
              />
            ))}
          </div>

          {/* Mic icon */}
          <div className="text-[rgba(196,181,253,0.65)] leading-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="9" y1="22" x2="15" y2="22" />
            </svg>
          </div>

          <span className="font-sans text-[12.5px] font-medium tracking-[0.06em] uppercase text-[rgba(220,210,255,0.6)] select-none">
            Audio is loading…
          </span>
        </div>
      </div>
    </>
  );
}
