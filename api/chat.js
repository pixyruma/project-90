export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image, weight } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are Coach Gemini. Your goal is to help the user reach 90kg.
    1. For food: Provide a breakdown of Calories, Carbs, Protein, and Fat.
    2. DATA TAGS: You MUST append these tags to the END of your message on new lines when relevant:
       - To add a task to the Plan: 'ADD_PLAN: Task Name | [number]'
       - To log food intake: 'Estimated: [number] kcal'
       - To log exercise burn: 'Burned: [number] kcal'
    3. Keep the main conversation natural and motivating. Do not mention the tags in your sentences.
    4. Maximum response length: 4 sentences.`;
    
    const contents = [{
      parts: [{ text: `${systemPrompt}\n\nUser Current Weight: ${weight}kg\nUser Message: ${message || "Analyze this."}` }]
    }];

    if (image && image.length > 50) {
      contents[0].parts.push({
        inlineData: { mimeType: "image/jpeg", data: image }
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is recalibrating.";
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ reply: "Coach Connection Error." }), { status: 500 });
  }
}
