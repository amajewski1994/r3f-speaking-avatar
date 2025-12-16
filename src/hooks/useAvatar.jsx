import { create } from "zustand";

export const useAvatar = create((set) => ({
  messages: [],
  currentMessage: null,
  loading: false,
  speech: "formal",

  avatarAnimation: "Idle",
  setAvatarAnimation: (avatarAnimation) => set({ avatarAnimation }),

  setCurrentMessage: (message) => set({ currentMessage: message }),

  clearCurrentMessage: () => {
    set({ currentMessage: null, avatarAnimation: "Idle" });
  },
}));
