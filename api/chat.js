export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { message, image, weight } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Safety Check 1: Check if the API Key is actually in Vercel
    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "System Error: GEMINI_API_KEY is missing from Vercel Settings." }), { status: 200 });
    }

    const systemPrompt = `You are an elite fitness coach. Goal: 90kg.
    Respond ONLY in valid JSON.
    {
      "reply": "Concise motivation (max 2 sentences).",
      "macros": "P/C/F breakdown if food mentioned.",
      "calories_in": number or 0,
      "calories_out": number or 0,
      "add_to_plan": {"task": "Task name", "kcal": number} or null
    }`;

    const contents = [{
      parts: [{ text: `${systemPrompt}\n\nUser Weight: ${weight}kg. Message: ${message || "Hi"}` }]
    }];

    // Handle Image if provided
    if (image && image.length > 50) {
      contents[0].parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents,
        generationConfig: { 
          responseMimeType: "application/json"
        } 
      })
    });

    const data = await response.json();

    // Safety Check 2: Check if Gemini actually returned a message
    if (!data.candidates || !data.candidates[0]) {
      return new Response(JSON.stringify({ reply: "Coach is busy. Try again in a second." }), { status: 200 });
    }

    const replyJSON = data.candidates[0].content.parts[0].text;
    return new Response(replyJSON, { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    // This catches the "Offline" state
    return new Response(JSON.stringify({ reply: "Coach Offline. Check your Vercel logs." }), { status: 500 });
  }
}
