import { useAvatar } from "../../hooks/useAvatar";

const mockMessage = {
  id: 0,
  question: "Test",
  answer:
    "Hello, my name is Adrian and I’ll tell you a little about myself. Of course, this is not my real appearance, but only a generated model. Choose one of the questions and I will answer it.",
  visemes: [
    [0, 0],
    [120, 4],
    [240, 8],
    [360, 14],
    [480, 3],
    [600, 11],
    [720, 6],
    [840, 15],
    [960, 20],
    [1080, 7],
    [1200, 12],
    [1320, 18],
    [1440, 9],
    [1560, 1],
    [1680, 5],
    [1800, 17],
    [1920, 2],
    [2040, 13],
    [2160, 19],
    [2280, 0],
  ],
  startedAt: performance.now(),
};

const TestButtons = () => {
  const playMessage = useAvatar((s) => s.playMessage);

  const startTest = () => {
    playMessage({
      id: Date.now(),
      answer: mockMessage.answer,
    });
  };

  return (
    <div className="absolute z-10 left-1/2 top-2.5 -translate-x-1/2 flex gap-2">
      <button
        onClick={startTest}
        className="bg-amber-100 p-2! block cursor-pointer rounded-md"
      >
        TEST MOUTH
      </button>
    </div>
  );
};

export default TestButtons;
