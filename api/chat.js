export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image, weight } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // SYSTEM PROMPT: Optimized for Macros and Plan Management
    const systemPrompt = `You are Coach Gemini. Goal: Help the user reach 90kg.
    1. For food: Provide a clear breakdown of Calories, Carbs, Protein, and Fat.
    2. To add a task to the Plan tab: Use the EXACT format 'ADD_PLAN: Task Name | [number]'.
    3. To log intake: Include 'Estimated: [number] kcal'.
    4. To log activity: Include 'Burned: [number] kcal'.
    Keep responses under 4 sentences. Be scientific and motivating.`;
    
    const contents = [{
      parts: [{ text: `${systemPrompt}\n\nUser Current Weight: ${weight}kg\nUser Message: ${message || "Analyze this."}` }]
    }];

    if (image && image.length > 50) {
      contents[0].parts.push({
        inlineData: { mimeType: "image/jpeg", data: image }
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ reply: `Coach Error: ${data.error.message}` }), { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is recalibrating.";
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Server Connection Error." }), { status: 500 });
  }
}
