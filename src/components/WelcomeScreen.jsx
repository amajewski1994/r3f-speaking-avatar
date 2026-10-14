import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

// Show the loading state only if loading takes longer than this, so a fast
// (cached) load goes straight to "Enter Experience" without a flash.
const LOADING_HINT_DELAY_MS = 700;

// Intro overlay. `ready` comes from the scene once the avatar and its animations
// have mounted, so the reveal never starts on an empty stage.
const WelcomeScreen = ({ ready, leaving, onEnter }) => {
  const { progress } = useProgress();
  const [gone, setGone] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  // The loading manager reports per batch of files, so its progress can jump
  // back down; the bar only ever moves forward.
  const [shownProgress, setShownProgress] = useState(0);
  if (progress > shownProgress) setShownProgress(progress);

  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setShowLoading(true), LOADING_HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready]);

  if (gone) return null;

  const loading = !ready && showLoading;

  return (
    <section
      className="welcome"
      data-leaving={leaving}
      aria-hidden={leaving}
      onTransitionEnd={(e) => {
        if (leaving && e.target === e.currentTarget) setGone(true);
      }}
    >
      <p className="welcome-eyebrow">Interactive 3D portfolio</p>
      <h1 className="welcome-title">Meet My Digital Self</h1>
      <p className="welcome-subtitle">
        A holographic version of me, ready to answer your questions about my
        work, passions and what drives me.
      </p>
      <button
        type="button"
        className="welcome-button"
        data-state={ready ? "ready" : loading ? "loading" : "waiting"}
        disabled={!ready || leaving}
        aria-busy={!ready}
        onClick={onEnter}
      >
        {/* both labels share one grid cell and cross-fade */}
        <span className="welcome-label welcome-label--loading" aria-hidden={ready}>
          Preparing experience…
        </span>
        <span className="welcome-label welcome-label--ready" aria-hidden={!ready}>
          Enter Experience
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
        <span
          className="welcome-progress"
          aria-hidden="true"
          style={{ transform: `scaleX(${ready ? 1 : shownProgress / 100})` }}
        />
      </button>
    </section>
  );
};

export default WelcomeScreen;
