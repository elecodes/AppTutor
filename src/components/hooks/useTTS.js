import { useState } from "react";

export const useTTS = () => {
  const [audio, setAudio] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(null);

  /**
   * Fallback to Web Speech API (browser native TTS)
   */
  const speakWithWebSpeech = (text, lang = "es") => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error("Web Speech API not supported in this browser"));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select best voice for the language
      const voices = window.speechSynthesis.getVoices();
      const langCode = lang === "es" ? "es" : "en";
      
      // Try to find a high-quality voice for the language
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(langCode) && 
        (voice.name.includes("Premium") || 
         voice.name.includes("Enhanced") ||
         voice.name.includes("Google") ||
         voice.name.includes("Microsoft"))
      ) || voices.find(voice => voice.lang.startsWith(langCode));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log(`🎤 Using voice: ${preferredVoice.name} (${preferredVoice.lang})`);
      }
      
      utterance.lang = lang === "es" ? "es-ES" : "en-US";
      utterance.rate = 0.95; // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        console.log("✅ Web Speech API completed");
        resolve();
      };

      utterance.onerror = (event) => {
        console.error("❌ Web Speech API error:", event.error);
        reject(new Error(`Web Speech API error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
      setCurrentProvider("webspeech");
    });
  };

  /**
   * Main speak function with automatic fallback
   */
  const speak = async (text, lang = "es", options = {}) => {
    try {
      // Stop any currently playing audio
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }

      // Try backend providers first (ElevenLabs → Google Cloud)
      try {
        console.log("🎙️ Attempting backend TTS...");
        const response = await fetch("http://localhost:3001/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language: lang, options }),
        });

        if (response.ok) {
          // Get provider from response headers
          const provider = response.headers.get("X-TTS-Provider") || "unknown";
          setCurrentProvider(provider);

          const arrayBuffer = await response.arrayBuffer();
          const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
          const audioURL = URL.createObjectURL(audioBlob);

          const newAudio = new Audio(audioURL);
          window.currentAudio = newAudio;

          newAudio.play();
          newAudio.onended = () => URL.revokeObjectURL(audioURL);

          setAudio(newAudio);
          console.log(`✅ TTS successful using ${provider} (high quality)`);
          return;
        } else {
          // Backend failed, try Web Speech API
          const errorData = await response.json();
          console.warn("⚠️ Backend TTS failed:", errorData.message);
          console.log("🔄 Falling back to Web Speech API...");
        }
      } catch (fetchError) {
        // Network error or server down
        console.warn("⚠️ Backend unreachable:", fetchError.message);
        console.log("🔄 Falling back to Web Speech API...");
      }

      // Fallback to Web Speech API
      await speakWithWebSpeech(text, lang);
      console.log("✅ Using Web Speech API fallback (browser voice)");

    } catch (err) {
      console.error("❌ All TTS methods failed:", err);
      setCurrentProvider("failed");
    }
  };

  return { 
    speak, 
    audio, 
    currentProvider 
  };
};
