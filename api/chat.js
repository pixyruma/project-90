export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image, weight } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are an elite fitness coach. Help the user reach 90kg.
    Respond ONLY in valid JSON format. 
    JSON Structure:
    {
      "reply": "Your motivating response here (max 2 sentences)",
      "macros": "Protein/Carbs/Fat breakdown string",
      "calories_in": number or 0,
      "calories_out": number or 0,
      "add_to_plan": {"task": "Task name", "kcal": number} or null
    }
    Rules: If user mentions food, set calories_in. If activity, set calories_out. If they ask to add a workout, use add_to_plan.`;

    const contents = [{
      parts: [{ text: `${systemPrompt}\n\nUser Weight: ${weight}kg. Message: ${message}` }]
    }];

    if (image && image.length > 50) {
      contents[0].parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents,
        generationConfig: { responseMimeType: "application/json" } 
      })
    });

    const data = await response.json();
    const replyJSON = data.candidates[0].content.parts[0].text;
    return new Response(replyJSON, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Coach is offline." }), { status: 500 });
  }
}
