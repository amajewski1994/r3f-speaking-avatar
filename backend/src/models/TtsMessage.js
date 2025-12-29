import mongoose from "mongoose";

const TtsMessageSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    voice: { type: String, required: true },
    visemes: { type: [[Number]], default: [] },
    format: { type: String, default: "mp3" },
    meta: {
      ip: String,
      userAgent: String,
      durationMs: Number,
    },
  },
  { timestamps: true }
);

export const TtsMessage =
  mongoose.models.TtsMessage || mongoose.model("TtsMessage", TtsMessageSchema);