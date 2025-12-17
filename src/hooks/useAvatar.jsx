import { create } from "zustand";

export const useAvatar = create((set, get) => ({
  messages: [],
  currentMessage: null,
  loading: false,
  speech: "formal",
  speakingId: 0,

  avatarAnimation: "Idle",
  setAvatarAnimation: (avatarAnimation) => set({ avatarAnimation }),

  setCurrentMessage: (message) => set({ currentMessage: message }),

  clearCurrentMessage: () => {
    set({ currentMessage: null, avatarAnimation: "Idle" });
  },

  playMessage: async (message) => {
    const speakingId = Date.now();
    set({
      speakingId,
      avatarAnimation: Math.random() < 0.5 ? "Talking0" : "Talking1",
    });

    if (!message?.answer) {
      console.warn("playMessage called without answer");
      return;
    }

    set({ currentMessage: message });

    if (!message.audioPlayer) {
      set({ loading: true });

      const baseUrl = import.meta.env.VITE_API_URL;
      const url = `${baseUrl}/api/text-to-speech?text=${encodeURIComponent(
        message.answer
      )}`;

      const audioRes = await fetch(url);
      if (!audioRes.ok) {
        set({ loading: false });
        throw new Error("TTS request failed");
      }

      const audioBlob = await audioRes.blob();
      const visemes = JSON.parse(audioRes.headers.get("Visemes") || "[]");

      const audioUrl = URL.createObjectURL(audioBlob);
      const audioPlayer = new Audio(audioUrl);

      const updated = {
        ...message,
        audioPlayer,
        visemes,
      };

      const stopSpeaking = get().stopSpeaking;

      audioPlayer.onended = () => {
        if (get().speakingId !== speakingId) return;
        URL.revokeObjectURL(audioUrl);
        stopSpeaking();
      };

      set((state) => ({
        loading: false,
        messages: state.messages.map((m) =>
          m.id === updated.id ? updated : m
        ),
        currentMessage: updated,
      }));

      message = updated;
    }

    message.audioPlayer.currentTime = 0;
    await message.audioPlayer.play();
  },

  stopSpeaking: () => {
    set({
      currentMessage: null,
      avatarAnimation: "Idle",
    });
  },
}));
