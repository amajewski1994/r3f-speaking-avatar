import { useAvatar } from "../../hooks/useAvatar";

const mockMessage = {
  id: 0,
  question: "Test",
  answer: "OK",
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
  const setCurrentMessage = useAvatar((s) => s.setCurrentMessage);
  const setAvatarAnimation = useAvatar((s) => s.setAvatarAnimation);

  const startTest = () => {
    setCurrentMessage({ ...mockMessage, startedAt: performance.now() });
    setAvatarAnimation(Math.random() < 0.5 ? "Talking0" : "Talking1");
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
