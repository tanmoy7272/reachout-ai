# ReachOut AI

AI-powered recruiter outreach generator — craft personalised LinkedIn, WhatsApp, Email, SMS and Twitter/X DMs in seconds using Groq's free LLM API.

---

## File structure

```
reachout-ai/
├── api/
│   └── generate.js    ← Vercel serverless function (keeps API key secret)
├── index.html         ← entire frontend (single file, no build step)
├── vercel.json        ← routing config
├── package.json       ← Node ≥18 requirement
└── README.md
```

---

## Deploy to Vercel (5 minutes)

### Step 1 — Get a free Groq API key

1. Go to [https://console.groq.com](https://console.groq.com) and sign up (free)
2. Navigate to **API Keys** → click **Create API Key**
3. Copy the key — you'll need it in Step 3

### Step 2 — Push to GitHub

1. Go to [https://github.com/new](https://github.com/new) → create a repo called `reachout-ai`
2. Upload all files (drag & drop or `git push`)

### Step 3 — Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com) → sign up free with GitHub
2. Click **Add New Project** → Import your `reachout-ai` repo
3. Leave all build settings as default → click **Deploy**

### Step 4 — Add the API key ⚠️ Required

In your Vercel dashboard → **Your Project** → **Settings** → **Environment Variables**, add:

| Name | Value | Notes |
|------|-------|-------|
| `GROQ_API_KEY` | `gsk_xxxxxxxxxxxx` | Your Groq API key from Step 1 |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Optional — this is the default |

> **Why is this in Vercel and not the code?**  
> Environment variables in Vercel are server-side only. Your API key is never exposed to the browser.

### Step 5 — Redeploy

After adding the env var → go to **Deployments** tab → click **Redeploy** on the latest deployment.

Your live URL will be something like: `https://reachout-ai.vercel.app` 🎉

---

## How it works

```
Browser  →  POST /api/generate  →  Vercel Function  →  Groq API (llama-3.3-70b-versatile)
                                         ↓
Browser  ←  { result: { linkedin, whatsapp, email, ... } }
```

1. User fills in role, candidate, sender details + optional JD paste
2. Frontend builds a structured prompt and POSTs to `/api/generate`
3. The serverless function forwards the prompt to Groq (API key stays server-side)
4. Groq returns a JSON object with one message per selected channel
5. Frontend renders tabbed results with copy buttons

---

## Choosing a Groq model

The default `llama-3.3-70b-versatile` is free, fast, and produces excellent output for this use case. To change it, set the `GROQ_MODEL` env var to any model ID from [https://console.groq.com/docs/models](https://console.groq.com/docs/models).

| Model | Speed | Quality | Notes |
|-------|-------|---------|-------|
| `llama-3.3-70b-versatile` | Fast | ⭐⭐⭐⭐⭐ | **Recommended (default)** |
| `llama-3.1-8b-instant` | Fastest | ⭐⭐⭐ | Good for high volume |
| `mixtral-8x7b-32768` | Fast | ⭐⭐⭐⭐ | Longer context window |

---

## Local development

No build step needed. The frontend is plain HTML — just open `index.html` in a browser to view the UI.

To test the full API flow locally, install the [Vercel CLI](https://vercel.com/docs/cli):

```bash
npm i -g vercel
vercel dev
```

Then add your `GROQ_API_KEY` to a `.env.local` file:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxx
```

The app will be available at `http://localhost:3000`.

