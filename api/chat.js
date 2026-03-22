export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // 1. Safety check for request type
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Send a POST request, please.' }), { status: 405 });
  }

  try {
    // 2. Parse the incoming data from your dashboard
    const body = await req.json();
    const { message, weight, calories } = body;

    // 3. Check if the API Key exists in Vercel Settings
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "ERROR: API Key is missing in Vercel Environment Variables." }), { status: 200 });
    }

    // 4. Talk to Google
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `You are Coach Gemini. User: 41yo male, 185cm, ${weight}kg, ${calories}kcal. Message: "${message}". Reply in 2 short, high-energy sentences with emojis.` 
          }] 
        }]
      })
    });

    const data = await response.json();

    // 5. Check if Google sent back an error (like "Invalid Key")
    if (data.error) {
      return new Response(JSON.stringify({ reply: `GOOGLE ERROR: ${data.error.message}` }), { status: 200 });
    }

    // 6. Send the successful reply back to the dashboard
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is speechless. Try again.";
    
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    // 7. If the code crashes, tell the dashboard why
    return new Response(JSON.stringify({ reply: `CRASH: ${err.message}` }), { status: 200 });
  }
}
