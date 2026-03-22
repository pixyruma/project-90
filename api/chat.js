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

    // The "-latest" suffix usually solves the "model not found" error for new keys
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `Coach Gemini for Project 90. User: 41yo male, 185cm, ${weight}kg. Message: "${message}". Reply in 2 high-energy sentences with emojis.` 
          }] 
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ reply: `GOOGLE ERROR: ${data.error.message}` }), { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is recalibrating. Try again!";
    
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ reply: `CRASH: ${err.message}` }), { status: 200 });
  }
}
