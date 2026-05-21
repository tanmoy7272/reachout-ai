# ReachOut AI 🚀
AI-powered recruiter outreach generator — LinkedIn, WhatsApp & Email in 5 seconds.

## Deploy to Vercel (5 minutes)

### Step 1 — Push to GitHub
1. Go to https://github.com/new → create a new repo called `reachout-ai`
2. Upload all these files (drag & drop the folder contents)

### Step 2 — Deploy on Vercel
1. Go to https://vercel.com → Sign up free with GitHub
2. Click **"Add New Project"** → Import your `reachout-ai` repo
3. Click **Deploy** (no build settings needed)

### Step 3 — Add your API key (IMPORTANT)
In Vercel dashboard → Your project → **Settings** → **Environment Variables**, add:

| Name | Value |
|------|-------|
| `LLAMA_API_KEY` | your company API key |
| `LLAMA_API_URL` | your company's API endpoint URL |
| `LLAMA_MODEL` | `llama-3.2-3b` (or exact model name) |

> **LLAMA_API_URL** is the full endpoint, e.g.:
> - Groq: `https://api.groq.com/openai/v1/chat/completions`
> - Together AI: `https://api.together.xyz/v1/chat/completions`
> - Company hosted: `https://your-company-llm.com/v1/chat/completions`

### Step 4 — Redeploy
After adding env vars → **Deployments** → click **Redeploy**.

Your live link will be: `https://reachout-ai.vercel.app` 🎉

## File structure
```
reachout-ai/
├── public/
│   └── index.html     ← the entire frontend
├── api/
│   └── generate.js    ← serverless function (keeps API key secret)
├── vercel.json        ← routing config
└── package.json
```

## API format
The backend expects an OpenAI-compatible API (`/v1/chat/completions`).
If your company uses a different format, edit `api/generate.js`.
