export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const API_KEY = process.env.LLAMA_API_KEY;
  const API_URL = process.env.LLAMA_API_URL; // e.g. https://api.groq.com/openai/v1/chat/completions
  const MODEL   = process.env.LLAMA_MODEL || 'llama-3.2-3b-preview';

  if (!API_KEY || !API_URL) {
    return res.status(500).json({ error: 'API not configured. Set LLAMA_API_KEY and LLAMA_API_URL in Vercel environment variables.' });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('LLM API error:', err);
      return res.status(502).json({ error: 'LLM API returned an error', details: err });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      // fallback — try to extract JSON from anywhere in the string
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
