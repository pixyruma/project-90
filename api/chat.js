export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 });
  }

  try {
    const { message, weight, calories } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Standard Google Cloud endpoint for Gemini 1.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `Context: You are Coach Gemini. 41yo male, 185cm, ${weight}kg. User: ${message}. Reply in 2 short, high-energy sentences with emojis.` 
          }] 
        }]
      })
    });

    const data = await response.json();

    // If it fails, this will now tell us the EXACT reason from Google
    if (data.error) {
      return new Response(JSON.stringify({ reply: `GOOGLE CLOUD ERROR: ${data.error.message}` }), { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is processing... try one more time.";
    
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ reply: `SYSTEM CRASH: ${err.message}` }), { status: 200 });
  }
}
