import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { ttsRouter } from "./routes/tts.js";

dotenv.config();

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN;

app.use(cors({
  origin: allowedOrigin ? allowedOrigin : false,
  credentials: false,
  exposedHeaders: ["Visemes"],
}));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api", ttsRouter);

const PORT = process.env.PORT || 3001;

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  await mongoose.connect(uri);
  console.log("MongoDB connected");

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
