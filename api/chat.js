export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image, weight } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are Coach Gemini. Goal: 90kg.
    1. Respond naturally to the user (max 3 sentences).
    2. If they log food/exercise or add a plan, append this EXACT format at the end:
    ---DATA---
    IN: [number]
    OUT: [number]
    PLAN: [Task Name] | [number]
    ----------`;

    const contents = [{
      parts: [{ text: `${systemPrompt}\n\nUser Weight: ${weight}kg\nMessage: ${message || "Hi"}` }]
    }];

    if (image) {
      contents[0].parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is reset. Try again.";
    
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Connection Error." }), { status: 500 });
  }
}
