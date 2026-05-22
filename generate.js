export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
 
  const API_KEY = process.env.GROQ_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({
      error: 'API not configured. Set GROQ_API_KEY in Vercel environment variables.'
    });
  }

  const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a world-class recruitment copywriter with 15 years of experience. You write outreach messages that get replies — specific, human, and tailored to the exact platform.

Rules you never break:
1. Never use these phrases: "Hope this finds you well", "I came across your impressive profile", "exciting opportunity", "touch base", "synergy", "leverage", "circle back", "I wanted to reach out"
2. Always open with something concrete and specific — a real detail about the person, their company, their work, or the role
3. Every message has exactly one call-to-action — clear and low-friction
4. Email messages MUST use the literal characters \\n\\n between every paragraph and section for proper spacing
5. Respect character limits for SMS and Twitter with zero exceptions
6. Respond ONLY with a valid JSON object — no markdown fences, no backticks, no explanation, no preamble`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.72,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq API error:', err);
      return res.status(502).json({ error: 'Groq API returned an error', details: err });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
      else return res.status(500).json({ error: 'Model did not return valid JSON', raw });
    }

    return res.status(200).json({ result });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message });
  }
}
