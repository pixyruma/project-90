export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const body = await req.json();
    const { message, weight, image } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Use a very safe default if weight is missing
    const userWeight = weight || 100;

    const systemPrompt = `You are Coach Gemini. 
    Context: 41yo male, 185cm, ${userWeight}kg. Goal: 90kg.
    1. Food: "Estimated: [number] kcal". 
    2. Exercise: "Burned: [number] kcal".
    3. Plan: "ADD_PLAN: [Task] | [kcal]".
    Keep it to 2 high-energy sentences.`;

    // Reverting to the simplest possible Parts structure
    let promptParts = [{ text: systemPrompt + "\nUser: " + (message || "Analyze this.") }];

    // Only add image if it exists and is long enough to be a base64 string
    if (image && image.length > 50) {
      promptParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image
        }
      });
    }

    // Use the v1beta endpoint - it's the most reliable for Flash 1.5
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: promptParts }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API Error:", data.error.message);
      return new Response(JSON.stringify({ reply: "Coach Error: " + data.error.message }), { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is recalibrating.";
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Server Error." }), { status: 500 });
  }
}
