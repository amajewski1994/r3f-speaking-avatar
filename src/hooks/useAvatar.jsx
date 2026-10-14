import { create } from "zustand";

const fetchSpeech = async (message) => {
  const baseUrl = import.meta.env.DEV
    ? import.meta.env.VITE_API_URL_DEV
    : import.meta.env.VITE_API_URL;
  if (!baseUrl) {
    throw new Error(
      `Missing ${import.meta.env.DEV ? "VITE_API_URL_DEV" : "VITE_API_URL"}`,
    );
  }

  const url = `${baseUrl}/api/text-to-speech?text=${encodeURIComponent(
    message.answer,
  )}`;

  const audioRes = await fetch(url);
  if (!audioRes.ok) {
    throw new Error(`TTS request failed (${audioRes.status})`);
  }

  const audioBlob = await audioRes.blob();
  const visemes = JSON.parse(audioRes.headers.get("Visemes") || "[]");
  return { audioBlob, visemes };
};

// Speech fetched ahead of time (preloadMessage), consumed once by playMessage.
const preloaded = new Map(); // message id -> { promise, done }

// An <audio> element "unlocked" inside a user gesture, so speech that starts
// later (after the intro animation) is still allowed to play on strict browsers.
let unlockedAudio = null;

const silentWavUrl = () => {
  const bytes = new Uint8Array(46);
  const view = new DataView(bytes.buffer);
  const text = (offset, str) =>
    [...str].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 38, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, "data");
  view.setUint32(40, 2, true);
  bytes[44] = bytes[45] = 128;
  return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
};

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

  // Call from a click handler, before any delayed playMessage.
  unlockAudio: () => {
    if (unlockedAudio) return;
    const src = silentWavUrl();
    const audio = new Audio(src);
    audio
      .play()
      .catch(() => {})
      .finally(() => URL.revokeObjectURL(src));
    unlockedAudio = audio;
  },

  // Starts fetching a message's speech so a later playMessage can start at once.
  preloadMessage: (message) => {
    if (!message?.answer || preloaded.has(message.id)) return;
    const entry = { done: false };
    entry.promise = fetchSpeech(message);
    entry.promise.then(
      () => (entry.done = true),
      () => (entry.done = true),
    );
    preloaded.set(message.id, entry);
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
    const nextAnimation = Math.random() < 0.5 ? "Talking0" : "Talking1";

    set({
      speakingId,
      inFlightMessageId: message.id,
      avatarAnimation: "Idle",
      currentMessage: message,
    });

    try {
      if (!message.audioPlayer) {
        const pending = preloaded.get(message.id);
        preloaded.delete(message.id);
        if (!pending?.done) set({ loading: true });

        const { audioBlob, visemes } = await (pending
          ? pending.promise.catch(() => fetchSpeech(message))
          : fetchSpeech(message));

        const audioUrl = URL.createObjectURL(audioBlob);
        const audioPlayer = unlockedAudio ?? new Audio();
        unlockedAudio = null;
        audioPlayer.src = audioUrl;

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
            m.id === updated.id ? updated : m,
          ),
          currentMessage: updated,
        }));

        message = updated;
      }

      if (get().speakingId !== speakingId) return;

      message.audioPlayer.currentTime = 0;
      await message.audioPlayer.play();

      if (get().speakingId !== speakingId) return;

      set({
        avatarAnimation: nextAnimation,
        currentMessage: {
          ...message,
          startedAt: performance.now(),
        },
      });
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
