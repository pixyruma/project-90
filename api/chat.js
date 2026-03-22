export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { message, weight, calories } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // UPDATED FOR 2026: Using Gemini 2.5 Flash (Stable)
    // If you want the absolute latest, you can try 'gemini-3-flash-preview'
    const model = "gemini-2.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Coach Gemini: 41yo male, 185cm, ${weight}kg. User: ${message}. 2 short, high-energy sentences.` }] 
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // This will catch if 2.5 isn't available and suggest the next best thing
      return new Response(JSON.stringify({ reply: `MODERN ERROR: ${data.error.message}` }), { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is offline.";
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: `SYSTEM ERROR: ${err.message}` }), { status: 200 });
  }
}
