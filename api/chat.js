export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image, weight } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // IMPROVED PROMPT: Encourages personality while keeping the data tags
    const systemPrompt = `You are Coach Gemini, a motivating fitness expert. 
    1. Give a brief, supportive reaction to the user's meal or activity.
    2. Offer one tiny tip related to their goal of reaching 90kg.
    3. MANDATORY: End your response with 'Estimated: [number] kcal' or 'Burned: [number] kcal' on a new line.
    Total length: Max 3 sentences.`;
    
    const contents = [{
      parts: [{ text: `${systemPrompt}\n\nUser is currently ${weight}kg.\nUser Message: ${message || "Analyze this."}` }]
    }];

    if (image && image.length > 50) {
      contents[0].parts.push({
        inlineData: { mimeType: "image/jpeg", data: image }
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ reply: `Coach Error: ${data.error.message}` }), { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is recalibrating.";
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Server Connection Error." }), { status: 500 });
  }
}
