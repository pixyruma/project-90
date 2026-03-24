export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = "You are Coach Gemini. Format: 'Estimated: [number] kcal' or 'Burned: [number] kcal'. 2 sentences max.";
    const contents = [{
      parts: [{ text: systemPrompt + "\n\nUser: " + (message || "Analyze this.") }]
    }];

    // Only attach image if it's there
    if (image && image.length > 50) {
      contents[0].parts.push({
        inlineData: { mimeType: "image/jpeg", data: image }
      });
    }

    // TRY THIS URL - It is the most widely supported
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (data.error) {
      // This will show the EXACT error in your chat box so we can fix it
      return new Response(JSON.stringify({ reply: "API Error: " + data.error.message }), { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is recalibrating.";
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Connection Error." }), { status: 500 });
  }
}
