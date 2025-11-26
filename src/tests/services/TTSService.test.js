import { describe, it, expect, vi, beforeEach } from "vitest";
import TTSService from "../../services/TTSService.js";

// Mock fetch for ElevenLabs
global.fetch = vi.fn();

// Mock Google Cloud TTS
vi.mock("@google-cloud/text-to-speech", () => ({
  default: {
    TextToSpeechClient: vi.fn().mockImplementation(() => ({
      synthesizeSpeech: vi.fn().mockResolvedValue([
        {
          audioContent: Buffer.from("mock-google-audio"),
        },
      ]),
    })),
  },
}));

describe("TTSService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateWithElevenLabs", () => {
    it("genera audio exitosamente con ElevenLabs", async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      
      global.fetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });

      const result = await TTSService.generateWithElevenLabs("Hello", "en");

      expect(result.provider).toBe("elevenlabs");
      expect(result.contentType).toBe("audio/mpeg");
      expect(result.audioBuffer).toBe(mockArrayBuffer);
    });

    it("lanza error cuando falta la API key", async () => {
      const originalKey = TTSService.elevenLabsKey;
      TTSService.elevenLabsKey = null;

      await expect(
        TTSService.generateWithElevenLabs("Hello", "en")
      ).rejects.toThrow("ElevenLabs API key not configured");

      TTSService.elevenLabsKey = originalKey;
    });

    it("detecta error de cuota excedida", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              detail: {
                status: "quota_exceeded",
                message: "Quota exceeded",
              },
            })
          ),
      });

      await expect(
        TTSService.generateWithElevenLabs("Hello", "en")
      ).rejects.toThrow("QUOTA_EXCEEDED");
    });
  });

  describe("generateSpeech (fallback logic)", () => {
    it("intenta ElevenLabs primero cuando está disponible", async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      
      global.fetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });

      const result = await TTSService.generateSpeech("Hello", "en");

      expect(result.provider).toBe("elevenlabs");
      expect(global.fetch).toHaveBeenCalled();
    });

    it("hace fallback a Google Cloud cuando ElevenLabs falla", async () => {
      // Simular que ElevenLabs falla
      global.fetch.mockResolvedValue({
        ok: false,
        text: () => Promise.resolve(JSON.stringify({ error: "Failed" })),
      });

      // Mock Google Client disponible
      const originalClient = TTSService.googleClient;
      TTSService.googleClient = {
        synthesizeSpeech: vi.fn().mockResolvedValue([
          {
            audioContent: Buffer.from("google-audio"),
          },
        ]),
      };

      const result = await TTSService.generateSpeech("Hello", "en");

      expect(result.provider).toBe("google");
      expect(TTSService.googleClient.synthesizeSpeech).toHaveBeenCalled();

      TTSService.googleClient = originalClient;
    });

    it("lanza error cuando todos los proveedores fallan", async () => {
      // Simular que ElevenLabs falla
      global.fetch.mockResolvedValue({
        ok: false,
        text: () => Promise.resolve(JSON.stringify({ error: "Failed" })),
      });

      // Simular que Google Cloud no está disponible
      const originalClient = TTSService.googleClient;
      TTSService.googleClient = null;

      await expect(TTSService.generateSpeech("Hello", "en")).rejects.toThrow(
        "All TTS providers failed"
      );

      TTSService.googleClient = originalClient;
    });
  });

  describe("getProviderStatus", () => {
    it("retorna el estado de los proveedores", () => {
      const status = TTSService.getProviderStatus();

      expect(status).toHaveProperty("elevenlabs");
      expect(status).toHaveProperty("google");
      expect(status).toHaveProperty("webSpeech");
      expect(status.webSpeech).toBe(true);
    });
  });
});
