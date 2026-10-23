const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function analyzePhoto(file) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_GEMINI_KEY')) {
    return "AI Studio API key not found in .env. Falling back to default: Hazard detected on pedestrian segment.";
  }

  try {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [{
        parts: [
          {
            text: "You are an assistant for a Malaysian township pedestrian route audit. Analyze this walkway photo and summarize the hazard or shade issue in 1 concise sentence (e.g., uneven tiles, unshaded path, blocked drain)."
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Path condition analyzed.";
  } catch (err) {
    console.error("Gemini analysis error:", err);
    return "Could not complete image analysis automatically.";
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
}