export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image, weight } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are Coach Gemini. Goal: Reach 90kg.
    1. BE CONVERSATIONAL: If the user says "hi" or "hello", just greet them and ask for their status.
    2. ONLY LOG DATA ON REQUEST: Use tags ONLY when the user mentions a specific meal, activity, or asks to add to their plan.
    3. DATA FORMATS: 
       - Food: 'Estimated: [number] kcal' + breakdown (Carbs/Protein/Fat).
       - Activity: 'Burned: [number] kcal'.
       - New Plan Task: 'ADD_PLAN: Task Name | [number]'.
    4. Keep it under 3 sentences.`;
    
    const contents = [{
      parts: [{ text: `${systemPrompt}\n\nUser Weight: ${weight}kg\nMessage: ${message}` }]
    }];

    if (image && image.length > 50) {
      contents[0].parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    return new Response(JSON.stringify({ reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach Offline." }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Connection Error." }), { status: 500 });
  }
}
