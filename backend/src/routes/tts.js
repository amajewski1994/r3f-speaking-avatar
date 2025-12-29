import express from "express";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { TtsMessage } from "../models/TtsMessage.js";

export const ttsRouter = express.Router();

ttsRouter.get("/text-to-speech", async (req, res) => {
  const text = (req.query.text ?? "Test dźwięku").toString();

  const SPEECH_KEY = process.env.SPEECH_KEY;
  const SPEECH_REGION = process.env.SPEECH_REGION;
  const voice = process.env.SPEECH_VOICE || "pl-PL-MarekNeural";

  if (!SPEECH_KEY || !SPEECH_REGION) {
    return res.status(500).json({ error: "Missing SPEECH_KEY or SPEECH_REGION" });
  }

  const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
  speechConfig.speechSynthesisVoiceName = voice;

  speechConfig.speechSynthesisOutputFormat =
  sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  const visemes = [];
  synthesizer.visemeReceived = (s, e) => {
    visemes.push([e.audioOffset / 10000, e.visemeId]);
  };

  const started = Date.now();

  synthesizer.speakTextAsync(
    text,
    async (result) => {
      try {
        const audioData = result.audioData;
        synthesizer.close();

        const durationMs = Date.now() - started;

        await TtsMessage.create({
          text,
          voice,
          visemes,
          format: "mp3",
          meta: {
            ip: req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
            durationMs,
          },
        });

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", "inline; filename=text-to-speech.mp3");

        res.setHeader("Visemes", JSON.stringify(visemes));
        res.setHeader("Access-Control-Expose-Headers", "Visemes");

        res.send(Buffer.from(audioData));
      } catch (err) {
        res.status(500).json({ error: String(err) });
      }
    },
    (err) => {
      synthesizer.close();
      res.status(500).json({ error: String(err) });
    }
  );
});
