export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Simplified prompt for maximum stability
    const systemPrompt = "You are Coach Gemini. 41yo male, 185cm, 100kg. Goal: 90kg. Format: 'Estimated: [number] kcal' or 'Burned: [number] kcal'. 2 sentences max.";

    const contents = [{
      parts: [{ text: systemPrompt + "\n\nUser: " + (message || "Analyze this.") }]
    }];

    // Only attach image if it's actually there
    if (image && image.length > 50) {
      contents[0].parts.push({
        inlineData: { mimeType: "image/jpeg", data: image }
      });
    }

    // This is the most likely "Working" URL for 1.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ reply: "API Error: " + data.error.message }), { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is recalibrating.";
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Connection Error." }), { status: 500 });
  }
}
