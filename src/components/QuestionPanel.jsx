import QuestionCard from "./QuestionCard";
import { useAvatar } from "../hooks/useAvatar";
import { qaData } from "../data/qaData";
import { CARD_ACCENTS, CARD_APPEAR_STAGGER, cardState } from "../data/layout";

// Compact (phone / portrait) layout: questions as a list docked at the bottom.
const QuestionPanel = ({ visible }) => {
  const playMessage = useAvatar((s) => s.playMessage);
  const playingId = useAvatar((s) => s.currentMessage?.id ?? null);

  return (
    <nav
      aria-label="Questions"
      className="qpanel"
      data-visible={visible}
    >
      {qaData.map((q, i) => (
        <QuestionCard
          key={q.id}
          compact
          text={q.question}
          icon={q.icon}
          accent={CARD_ACCENTS[q.id]}
          visible={visible}
          appearDelay={i * CARD_APPEAR_STAGGER}
          state={cardState(q.id, playingId)}
          onSelect={() => playMessage(q)}
        />
      ))}
    </nav>
  );
};

export default QuestionPanel;
