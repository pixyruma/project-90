export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, weight, calories } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key missing in Vercel settings" });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `You are Coach Gemini. 41yo male, 185cm, ${weight}kg, ${calories}kcal today. User says: ${message}. Reply in 2 short, high-energy sentences with emojis.` 
          }] 
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
        return res.status(500).json({ error: data.error.message });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: "External API connection failed" });
  }
}
