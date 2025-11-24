import { useState } from "react";

export const useTTS = () => {
  const [audio, setAudio] = useState(null);

  const speak = async (text, lang = "es") => {
    try {
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }

      const response = await fetch("http://localhost:3001/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: lang }),
      });

      if (!response.ok) throw new Error("Audio generation failed");

      const arrayBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const audioURL = URL.createObjectURL(audioBlob);

      const newAudio = new Audio(audioURL);
      window.currentAudio = newAudio;

      newAudio.play();
      newAudio.onended = () => URL.revokeObjectURL(audioURL);

      setAudio(newAudio);
    } catch (err) {
      console.error("TTS error:", err);
    }
  };

  return { speak, audio };
};
