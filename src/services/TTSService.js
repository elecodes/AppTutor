import fetch from "node-fetch";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

class TTSService {
  constructor() {
    this.elevenLabsKey = null;
    this.googleApiKey = null;
    this.pollyClient = null;
    this.initialized = false;

    // Voice configurations
    this.voices = {
      polly: {
        en: { 
          female: { Engine: "neural", VoiceId: "Joanna" },
          male: { Engine: "neural", VoiceId: "Matthew" }
        },
        es: { 
          female: { Engine: "neural", VoiceId: "Lupe" },
          male: { Engine: "neural", VoiceId: "Pedro" } // Standard voice, but effective
        }
      },
      elevenlabs: {
        en: "t5ztDJA7pj9EyW9QIcJ2",
        es: "f9DFWr0Y8aHd6VNMEdTt"
      },
      google: {
        en: {
          female: { languageCode: "en-US", name: "en-US-Neural2-F", ssmlGender: "FEMALE" },
          male: { languageCode: "en-US", name: "en-US-Neural2-D", ssmlGender: "MALE" }
        },
        es: {
          female: { languageCode: "es-ES", name: "es-ES-Neural2-A", ssmlGender: "FEMALE" },
          male: { languageCode: "es-ES", name: "es-ES-Neural2-B", ssmlGender: "MALE" }
        }
      }
    };
  }

  /**
   * Initialize service - called on first use
   */
  async _ensureInitialized() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    // Read environment variables
    this.elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    this.googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;

    // Initialize Polly Client
    const region = process.env.AWS_REGION || "us-east-1";
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (accessKeyId && secretAccessKey) {
      this.pollyClient = new PollyClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey
        }
      });
      console.log('✅ Amazon Polly configured');
    } else {
      console.warn('⚠️ AWS Credentials missing - Polly disabled');
    }

    if (this.googleApiKey) {
      console.log('✅ Google Cloud TTS configured (API Key)');
    } else {
      console.warn('⚠️ Google Cloud API Key missing');
    }
  }

  /**
   * Generate speech using Amazon Polly
   */
  async generateWithPolly(text, language, options = {}) {
    if (!this.pollyClient) {
      throw new Error("Amazon Polly not configured");
    }

    const gender = options.gender || "female";
    const langConfig = this.voices.polly[language] || this.voices.polly.en;
    const voiceConfig = langConfig[gender] || langConfig.female;

    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: voiceConfig.VoiceId,
      Engine: voiceConfig.Engine,
      LanguageCode: language === 'es' ? 'es-US' : 'en-US'
    });

    try {
      const response = await this.pollyClient.send(command);
      
      // Convert stream to buffer
      const byteArray = await response.AudioStream.transformToByteArray();
      const audioBuffer = Buffer.from(byteArray);

      return {
        audioBuffer,
        provider: "polly",
        contentType: "audio/mpeg"
      };
    } catch (error) {
      throw new Error(`Polly API error: ${error.message}`);
    }
  }

  /**
   * Generate speech using ElevenLabs API
   */
  async generateWithElevenLabs(text, language) {
    // ... (Keep existing implementation for now, or update if needed)
    if (!this.elevenLabsKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    const voice = this.voices.elevenlabs[language] || this.voices.elevenlabs.en;
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": this.elevenLabsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_id: "eleven_multilingual_v2",
          text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }

      // Check for quota exceeded
      if (errorDetails.detail?.status === "quota_exceeded") {
        throw new Error("QUOTA_EXCEEDED");
      }

      throw new Error(`ElevenLabs API error: ${errorDetails.message || errorText}`);
    }

    return {
      audioBuffer: await response.arrayBuffer(),
      provider: "elevenlabs",
      contentType: "audio/mpeg"
    };
  }

  /**
   * Generate speech using Google Cloud TTS REST API
   */
  async generateWithGoogle(text, language, options = {}) {
    if (!this.googleApiKey) {
      throw new Error("Google Cloud API Key not configured");
    }

    const gender = options.gender || "female";
    const langConfig = this.voices.google[language] || this.voices.google.en;
    const voiceConfig = langConfig[gender] || langConfig.female;

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.googleApiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: voiceConfig,
        audioConfig: { 
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Unknown Google API error');
    }

    const data = await response.json();
    // Decode base64 audio content
    const audioBuffer = Buffer.from(data.audioContent, 'base64');

    return {
      audioBuffer: audioBuffer,
      provider: "google",
      contentType: "audio/mpeg"
    };
  }

  /**
   * Main method: Generate speech with automatic fallback
   */
  async generateSpeech(text, language = "es", options = {}) {
    await this._ensureInitialized();
    const errors = [];

    // 1. Try Amazon Polly first (High quality, cost effective)
    if (this.pollyClient) {
      try {
        console.log(`🎙️ Attempting Amazon Polly (${options.gender || 'default'})...`);
        const result = await this.generateWithPolly(text, language, options);
        console.log("✅ Amazon Polly successful");
        return result;
      } catch (error) {
        console.warn("⚠️ Amazon Polly failed:", error.message);
        errors.push({ provider: "polly", error: error.message });
      }
    }

    // 2. Try ElevenLabs (Highest quality, expensive)
    if (this.elevenLabsKey) {
      try {
        console.log("🎙️ Attempting ElevenLabs...");
        const result = await this.generateWithElevenLabs(text, language);
        console.log("✅ ElevenLabs successful");
        return result;
      } catch (error) {
        console.warn("⚠️ ElevenLabs failed:", error.message);
        errors.push({ provider: "elevenlabs", error: error.message });
        
        if (error.message === "QUOTA_EXCEEDED") {
          console.log("📊 ElevenLabs quota exceeded, switching to fallback");
        }
      }
    }

    // 3. Fallback to Google Cloud TTS
    if (this.googleApiKey) {
      try {
        console.log(`🎙️ Attempting Google Cloud TTS (${options.gender || 'default'})...`);
        const result = await this.generateWithGoogle(text, language, options);
        console.log("✅ Google Cloud TTS successful");
        return result;
      } catch (error) {
        console.warn("⚠️ Google Cloud TTS failed:", error.message);
        errors.push({ provider: "google", error: error.message });
      }
    }

    // If all providers failed, throw error with details
    throw new Error(
      `All TTS providers failed. Errors: ${JSON.stringify(errors)}`
    );
  }

  /**
   * Get status of available providers
   */
  async getProviderStatus() {
    await this._ensureInitialized();
    return {
      polly: !!this.pollyClient,
      elevenlabs: !!this.elevenLabsKey,
      google: !!this.googleApiKey,
      webSpeech: true // Always available on client-side
    };
  }
}

export default new TTSService();
