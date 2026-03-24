export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { message, weight, image } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = `You are Coach Gemini. 
  CONTEXT: 41yo male, 185cm, ${weight}kg. Target: 90kg.
  COMMANDS:
  1. Food/Photo: "Estimated: [number] kcal". 
  2. Exercise mention: "Burned: [number] kcal".
  3. New Workout Request: End with "ADD_PLAN: [Task Name] | [Estimated kcal]".
  4. "Undo" request: Acknowledge that the user is removing a previous entry.
  STYLE: Max 2 high-energy sentences. Focus on consistency.
  Current user message: "${message || "Analyze this image."}"`;

  const parts = [{ text: systemPrompt }];
  if (image) parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is recalibrating.";
    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ reply: "Connection timed out." }), { status: 500 });
  }
}
