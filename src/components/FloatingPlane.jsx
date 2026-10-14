import { Html } from "@react-three/drei";
import QuestionCard from "./QuestionCard";
import { CARD_ACCENTS } from "../data/layout";

// Roughly how many CSS pixels one world unit spans at the default camera distance.
const PX_PER_UNIT = 110;

// Glass question card anchored in 3D space. The card itself is DOM (crisp text,
// real backdrop blur). The floating motion is a CSS animation on its own compositor
// layer: moving the Html anchor every frame lands on sub-pixel offsets and makes
// the text jitter against the card.
const FloatingQuestionPlane = ({
  question,
  position = [0, 0, 0],
  floatSpeed = 1,
  floatAmplitude = 0.15,
  floatPhase = 0,
  uiScale = 1,
  ...cardProps
}) => {
  const halfPeriod = Math.PI / floatSpeed;

  return (
    <group position={position}>
      <Html center zIndexRange={[40, 10]}>
        <div
          className="qcard-float"
          style={{
            "--float-amp": `${floatAmplitude * PX_PER_UNIT * uiScale}px`,
            animationDuration: `${halfPeriod}s`,
            animationDelay: `${-(floatPhase / Math.PI) * halfPeriod}s`,
          }}
        >
          <div style={{ transform: `scale(${uiScale})` }}>
            <QuestionCard
              text={question.question}
              icon={question.icon}
              accent={CARD_ACCENTS[question.id]}
              {...cardProps}
            />
          </div>
        </div>
      </Html>
    </group>
  );
};

export default FloatingQuestionPlane;
