export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { jd } = req.body;
  if (!jd) return res.status(400).json({ error: 'jd is required' });

  const API_KEY = process.env.GROQ_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'API not configured' });

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
            content: `You are a precise data extractor. Extract structured fields from job descriptions. Return ONLY a valid JSON object — no markdown, no backticks, no explanation. Return null for any field that is not clearly and explicitly stated in the text — do NOT infer or guess.`,
          },
          {
            role: 'user',
            content: `Extract the following fields from this job description. Return null for anything not explicitly stated.

Fields:
- role: the exact job title as written
- company: the hiring company name
- location: work location or remote/hybrid status, concise (e.g. "Bangalore / Hybrid" or "Remote")
- comp: compensation or salary range exactly as stated (e.g. "₹18–24 LPA" or "$120k–$150k + equity") — null if not mentioned
- hook: one concise sentence, max 20 words, capturing the single most compelling thing about this role (scope, ownership, team size, growth) — null if nothing stands out clearly

Job description:
${jd.slice(0, 1200)}

Respond ONLY with this JSON (no other text):
{"role":...,"company":...,"location":...,"comp":...,"hook":...}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'Groq API error', details: err });
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
    return res.status(500).json({ error: err.message });
  }
}
