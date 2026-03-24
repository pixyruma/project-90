export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image, weight } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are Coach Gemini. Help the user reach 90kg.
    - If food is mentioned: Include 'Estimated: [number] kcal' at the very end.
    - If a workout is mentioned: Include 'Burned: [number] kcal' at the very end.
    - To add to the plan tab: Include 'ADD_PLAN: Task Name | [number]' at the very end.
    - Provide a short macro breakdown (Protein/Carbs/Fat) in the text.
    - Maximum 3 sentences. No bolding or special characters in the tags.`;
    
    const contents = [{
      parts: [{ text: `${systemPrompt}\n\nUser Weight: ${weight}kg\nMessage: ${message}` }]
    }];

    if (image && image.length > 50) {
      contents[0].parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    // FALLBACK: If Gemini returns nothing, we send a clear error message.
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach had a temporary glitch. Please try again.";
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Coach connection lost." }), { status: 500 });
  }
}
