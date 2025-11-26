import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// IMPORTANT: Load environment variables BEFORE importing TTSService
dotenv.config();

// Now import TTSService after env vars are loaded
import TTSService from "./src/services/TTSService.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/tts", async (req, res) => {
  try {
    console.log("📩 /tts request:", req.body);

    const { text, language = "es", options = {} } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Use TTSService with automatic fallback
    const result = await TTSService.generateSpeech(text, language, options);

    // Send audio with provider information in headers
    res.setHeader("Content-Type", result.contentType);
    res.setHeader("X-TTS-Provider", result.provider);
    res.send(Buffer.from(result.audioBuffer));

    console.log(`✅ Audio generated successfully using ${result.provider}`);
  } catch (err) {
    console.error("🔴 TTS Error:", err.message);
    
    // Return error with suggestion to use Web Speech API fallback
    res.status(500).json({ 
      error: "TTS generation failed",
      message: err.message,
      fallbackAvailable: true,
      suggestion: "Client should use Web Speech API as fallback"
    });
  }
});

// Health check endpoint
app.get("/tts/status", async (req, res) => {
  const status = await TTSService.getProviderStatus();
  res.json({
    providers: status,
    available: status.elevenlabs || status.google || status.webSpeech
  });
});

// Start server and log provider status
async function startServer() {
  // Get provider status (this will trigger initialization)
  const providerStatus = await TTSService.getProviderStatus();
  console.log("🔊 TTS Provider Status:", providerStatus);

  if (!providerStatus.polly && !providerStatus.elevenlabs && !providerStatus.google) {
    console.warn("⚠️ WARNING: No TTS providers configured! Only Web Speech API will be available.");
  }

  app.listen(3001, () => {
    console.log("🚀 Server running on http://localhost:3001");
  });
}

startServer().catch(console.error);
