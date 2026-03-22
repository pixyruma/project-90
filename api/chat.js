export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { message, weight, calories } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  // SWITCHING TO STABLE v1 ENDPOINT
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Coach: 41yo male, 100kg. User: ${message}. 2 short sentences.` }] }]
      })
    });

    const data = await response.json();

    if (data.candidates) {
      return new Response(JSON.stringify({ reply: data.candidates[0].content.parts[0].text }), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ reply: `STILL FAILED: ${data.error?.message || 'Unknown'}` }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ reply: "SERVER ERROR" }), { status: 200 });
  }
}
