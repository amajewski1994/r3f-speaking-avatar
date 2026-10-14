import {
  BulbIcon,
  ChevronIcon,
  CodeIcon,
  GamepadIcon,
  LaptopIcon,
  TargetIcon,
} from "./icons";

const questionIcons = {
  code: CodeIcon,
  gamepad: GamepadIcon,
  laptop: LaptopIcon,
  bulb: BulbIcon,
  target: TargetIcon,
};

const SpeakingBars = () => (
  <span className="qcard-bars" aria-hidden="true">
    <span />
    <span />
    <span />
  </span>
);

// state: "idle" | "active" (avatar is answering this one) | "disabled"
const QuestionCard = ({
  text,
  icon,
  state = "idle",
  onSelect,
  visible = true,
  appearDelay = 0,
  compact = false,
  accent = ["#a78bfa", "#6366f1"],
}) => {
  const Icon = questionIcons[icon] ?? questionIcons.code;

  return (
    <div
      className="qcard-appear"
      data-visible={visible}
      style={{ transitionDelay: visible ? `${appearDelay}s` : "0s" }}
    >
      <button
        type="button"
        className={`qcard ${compact ? "qcard--compact" : ""}`}
        data-question-card
        data-state={state}
        aria-pressed={state === "active"}
        disabled={!visible || state === "disabled"}
        style={{ "--accent": accent[0], "--accent-deep": accent[1] }}
        tabIndex={visible ? 0 : -1}
        onClick={onSelect}
      >
        {!compact && <span className="qcard-dot" aria-hidden="true" />}
        <span className="qcard-icon">
          <Icon />
        </span>
        <span className="qcard-text">{text}</span>
        <span className="qcard-end">
          {state === "active" ? <SpeakingBars /> : <ChevronIcon />}
        </span>
      </button>
    </div>
  );
};

export default QuestionCard;
