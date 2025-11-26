import dotenv from 'dotenv';
dotenv.config();

import TTSService from './src/services/TTSService.js';
import fs from 'fs';
import path from 'path';

async function testTTS() {
  console.log("🔍 Testing TTS Providers...");
  
  // 1. Check Status
  console.log("\n1️⃣ Checking Provider Status...");
  const status = await TTSService.getProviderStatus();
  console.log("Status:", JSON.stringify(status, null, 2));

  // 2. Test Google Cloud TTS
  console.log("\n2️⃣ Testing Google Cloud TTS Generation...");
  try {
    // Force Google provider if possible, or just rely on fallback order (ElevenLabs -> Google)
    // Since we know ElevenLabs is likely out of quota, it should try Google.
    // We can temporarily mock ElevenLabs failure if needed, but let's see what happens naturally.
    
    const text = "Hola, esto es una prueba de voz.";
    const result = await TTSService.generateSpeech(text, 'es');
    
    if (result && result.audioBuffer) {
      console.log("✅ Audio generated successfully!");
      
      // Save to file to verify
      const outputPath = path.join(process.cwd(), 'test-output.mp3');
      fs.writeFileSync(outputPath, result.audioBuffer);
      
      console.log(`💾 Audio saved to ${outputPath}`);
      console.log("👉 Please check if this file plays correctly and sounds natural.");
    } else {
      console.error("❌ No audio returned.");
    }
  } catch (error) {
    console.error("❌ Error generating speech:", error);
  }
}

testTTS().catch(console.error);
