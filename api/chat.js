export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { message, weight, calories } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // The Prompt: We tell the AI exactly how to behave
    const systemPrompt = `You are Coach Gemini. 
    User is 41yo male, 185cm, current weight ${weight}kg. 
    TASK: If the user mentions a meal, estimate the calories and macros (Protein/Carbs/Fats). 
    Always provide a total calorie number. 
    Keep your response to 2-3 high-energy sentences. Use emojis. 
    User message: "${message}"`;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is recalibrating!";
    
    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ reply: "Connection glitch. Try again!" }), { status: 200 });
  }
}
