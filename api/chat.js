export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { message, weight, calories, image } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  // Build the content parts for Gemini
  const parts = [];
  // ... inside your api/chat.js ...
  const systemPrompt = `You are Coach Gemini. 
  41yo male, 185cm, ${weight}kg. Goal: 90kg.
  TASK: 
  1. If user eats: Estimate kcal/macros. Format: "Estimated: [number] kcal".
  2. If user exercises: Estimate burn. Format: "Burned: [number] kcal".
  Keep it to 2 high-energy sentences. Use emojis. 
  User message: "${message}"`;
  
  // 1. Add the text instructions
  parts.push({ text: `Context: Coach Gemini for 41yo male, 185cm, ${weight}kg. User message: ${message || "Analyze this meal photo."} Task: Estimate calories/macros and give 2 high-energy coaching sentences.` });

  // 2. Add the image if it exists
  if (image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: image
      }
    });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach missed that one. Try again!";
    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ reply: "Server error." }), { status: 500 });
  }
}
