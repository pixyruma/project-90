export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, weight, image } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Build the text part
    const promptText = `You are Coach Gemini. 
    CONTEXT: 41yo male, 185cm, ${weight || 100}kg. Target: 90kg.
    RULES:
    1. Food/Photo: "Estimated: [number] kcal". 
    2. Exercise: "Burned: [number] kcal".
    3. New Workout: End with "ADD_PLAN: [Task Name] | [Estimated kcal]".
    4. "Undo": Acknowledge removing the last entry.
    STYLE: Max 2 high-energy sentences.
    User says: "${message || "Analyze this."}"`;

    // 2. Build the parts array correctly
    const contents = [{
      parts: [{ text: promptText }]
    }];

    // 3. Only add image if it's a valid string
    if (image && image.length > 10) {
      contents[0].parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image
        }
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    // Catch API-specific errors (like expired keys)
    if (data.error) {
      return new Response(JSON.stringify({ reply: `API Error: ${data.error.message}` }), { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is recalibrating.";
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Server Connection Error." }), { status: 500 });
  }
}
