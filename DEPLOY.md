# ARIA Deployment Guide — Vibe2Ship 2026

## Quick Start (5 steps)

### Step 1: Clone and install
```bash
git clone https://github.com/yourusername/aria-app
cd aria-app
npm install
cp .env.local.example .env.local
```

### Step 2: Firebase Setup
1. Go to https://console.firebase.google.com → New project
2. Enable Authentication → Sign-in method → Google
3. Enable Realtime Database → Start in test mode
4. Apply security rules: paste `firebase.rules.json` content into rules tab
5. Project Settings → Service Accounts → Generate new private key → download JSON
6. Copy values into .env.local (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
7. Project Settings → General → Your apps → Web app → copy config into NEXT_PUBLIC_ vars

### Step 3: Gemini API Key
1. Go to https://aistudio.google.com/apikey
2. Create API key → copy into .env.local as GEMINI_API_KEY

### Step 4: Test locally
```bash
npm run dev
# Visit http://localhost:3000
# Sign in with Google → Add task → verify ARIA responds
```

### Step 5: Deploy to Google AI Studio
1. Build: `npm run build`
2. In Google AI Studio: File → Deploy → Upload project folder
3. Set all environment variables in AI Studio deployment settings
4. Deploy → get public URL
5. Test health check: GET https://your-url/api/health

## Submission Checklist
- [ ] App deployed and publicly accessible
- [ ] /api/health returns { status: "ok" }
- [ ] Google Sign-In works
- [ ] Build Mode: task decomposition works end-to-end
- [ ] Rescue Mode: triage + email draft works
- [ ] Action log updates in real-time
- [ ] GitHub repo is public with this README
- [ ] Google Doc completed with required fields

## Architecture Reference
- All agents: `lib/agents/`
- Gemini tools: `lib/gemini/tools.ts`
- System prompts: `lib/gemini/prompts.ts`
- API routes: `app/api/aria/`
- Action log component: `components/aria/ActionLog.tsx`

## Judge Q&A Quick Reference
- "Prove agentic depth" → Show `lib/gemini/tools.ts` + network DevTools functionCall
- "How is this different from ChatGPT" → No persistent state, no tools, no action log
- "Show me the code for Rescue Mode" → `lib/agents/rescue.ts` + `app/api/aria/rescue/route.ts`
- "Why Flash not Pro" → Speed requirement: 15s max for Rescue Mode, Flash = 2-4s
