export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { message, weight, image } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = `You are Coach Gemini. 
  CONTEXT: 41yo male, 185cm, 100kg. Goal 90kg.
  RULES:
  1. If user mentions food/photo: Analyze and say "Estimated: [number] kcal". 
  2. If user mentions workout: Analyze and say "Burned: [number] kcal".
  3. Keep it to 2 high-energy, supportive sentences.
  Current user message: "${message || "Analyze this image."}"`;

  const parts = [{ text: systemPrompt }];
  if (image) parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is offline.";
    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ reply: "Connection Error." }), { status: 500 });
  }
}
