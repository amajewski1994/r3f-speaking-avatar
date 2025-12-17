import { create } from "zustand";

export const useAvatar = create((set, get) => ({
  messages: [],
  currentMessage: null,
  loading: false,
  speech: "formal",
  speakingId: 0,
  inFlightMessageId: null,
  lastPlayAt: 0,

  avatarAnimation: "Idle",
  setAvatarAnimation: (avatarAnimation) => set({ avatarAnimation }),

  setCurrentMessage: (message) => set({ currentMessage: message }),

  clearCurrentMessage: () => {
    set({ currentMessage: null, avatarAnimation: "Idle" });
  },

  playMessage: async (message) => {
    const now = Date.now();

    if (now - get().lastPlayAt < 300) return;
    set({ lastPlayAt: now });

    if (get().inFlightMessageId === message?.id) return;

    if (!message?.answer) {
      console.warn("playMessage called without answer");
      return;
    }

    const cm = get().currentMessage;
    if (cm?.id === message.id && cm?.audioPlayer && !cm.audioPlayer.paused) {
      return;
    }

    if (cm?.id && cm.id !== message.id) {
      get().stopSpeaking();
    }

    const speakingId = Date.now();
    set({
      speakingId,
      inFlightMessageId: message.id,
      avatarAnimation: Math.random() < 0.5 ? "Talking0" : "Talking1",
      currentMessage: message,
    });

    try {
      if (!message.audioPlayer) {
        set({ loading: true });

        const baseUrl = import.meta.env.VITE_API_URL;
        const url = `${baseUrl}/api/text-to-speech?text=${encodeURIComponent(
          message.answer
        )}`;

        const audioRes = await fetch(url);
        if (!audioRes.ok) {
          throw new Error(`TTS request failed (${audioRes.status})`);
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

        audioPlayer.onended = () => {
          if (get().speakingId !== speakingId) return;
          URL.revokeObjectURL(audioUrl);
          get().stopSpeaking();
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

      if (get().speakingId !== speakingId) return;

      message.audioPlayer.currentTime = 0;
      await message.audioPlayer.play();
    } catch (err) {
      console.error("playMessage error:", err);

      get().stopSpeaking();
    } finally {
      if (get().inFlightMessageId === message?.id) {
        set({ inFlightMessageId: null, loading: false });
      }
    }
  },

  stopSpeaking: () => {
    const cm = get().currentMessage;
    if (cm?.audioPlayer) {
      try {
        cm.audioPlayer.pause();
        cm.audioPlayer.currentTime = 0;
      } catch (err) {
        console.warn("stopSpeaking: audio cleanup failed", err);
      }
    }

    set({
      currentMessage: null,
      avatarAnimation: "Idle",
      loading: false,
      inFlightMessageId: null,
    });
  },
}));
