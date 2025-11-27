async function testImport() {
  console.log("Start import...");
  try {
    const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
    console.log("Import successful!");
    new TextToSpeechClient();
    console.log("Client created!");
  } catch (e) {
    console.error("Error:", e);
  }
  console.log("Done.");
}

testImport();
