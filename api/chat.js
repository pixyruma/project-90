export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { message, weight, calories } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  // We will try these 3 names in order. One of them WILL work.
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  let lastError = "";

  for (const modelName of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Coach Gemini: 41yo male, 100kg. Goal: 90kg. User: ${message}. 2 short sentences.` }] }]
        })
      });

      const data = await response.json();

      // If this model works, return the reply immediately
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const reply = data.candidates[0].content.parts[0].text;
        return new Response(JSON.stringify({ reply }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      lastError = data.error?.message || "Unknown error";
    } catch (err) {
      lastError = err.message;
    }
  }

  // If ALL models fail, tell us the last error
  return new Response(JSON.stringify({ reply: `ALL MODELS FAILED. Last error: ${lastError}` }), { status: 200 });
}
