export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image, weight } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are Coach Gemini. Goal: Reach 90kg.
    1. For food: Give a breakdown (Cals, Carbs, Protein, Fat).
    2. To add a task to the Plan: On a NEW LINE at the END of your message, write 'ADD_PLAN: Task Name | [number]'. 
    3. To log intake: On a NEW LINE at the END, write 'Estimated: [number] kcal'.
    4. To log activity: On a NEW LINE at the END, write 'Burned: [number] kcal'.
    5. Keep the main message natural. Do not mention the tags in your sentences.`;
    
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
