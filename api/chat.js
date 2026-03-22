export const config = {
  runtime: 'edge', // This makes it faster and uses modern 'fetch' automatically
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { message, weight, calories } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key Missing' }), { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `Coach Gemini: 41yo male, 185cm, ${weight}kg, ${calories}kcal. User: ${message}. 2 short sentences, high energy.` 
          }] 
        }]
      })
    });

    const data = await response.json();
    
    // Handle Google's specific error responses
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server Crash' }), { status: 500 });
  }
}
