export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = "You are Coach Gemini. Respond with 'Estimated: [number] kcal' or 'Burned: [number] kcal'. 2 sentences max.";
    
    const contents = [{
      parts: [{ text: systemPrompt + "\n\nUser: " + (message || "Analyze this.") }]
    }];

    if (image && image.length > 50) {
      contents[0].parts.push({
        inlineData: { mimeType: "image/jpeg", data: image }
      });
    }

    // THE MAGIC URL: v1beta + -latest
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (data.error) {
      // If this fails, it will print the EXACT error in your chat box
      return new Response(JSON.stringify({ reply: `Coach Error: ${data.error.message}` }), { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is recalibrating.";
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Server Connection Error." }), { status: 500 });
  }
}
