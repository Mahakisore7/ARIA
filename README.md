# ARIA — Autonomous Rescue & Intervention Agent

> "You don't manage deadlines. ARIA does."

Built for **Vibe2Ship 2026** (Coding Ninjas × Google for Developers) — PS1: The Last-Minute Life Saver

## What is ARIA?

ARIA is the first tri-modal AI agent that covers the complete deadline lifecycle:

| Mode | Trigger | What ARIA Does |
|---|---|---|
| **Build Mode** | New task with a deadline | Decomposes task → estimates time → builds execution plan → blocks calendar |
| **Rescue Mode** | Deadline in hours | Triages scope → builds sprint plan → drafts stakeholder email |
| **Shield Mode** | Background monitoring | Detects deadline risk → surfaces alerts before crisis |

## Google Technologies Used

- **Gemini 2.0 Flash** — Core reasoning engine for all agent operations
- **Gemini Function Calling** — Autonomous tool execution (decompose_task, generate_sprint_plan, draft_communication)
- **Gemini Structured Outputs** — JSON schema enforcement for reliable agent outputs
- **Firebase Authentication** — Google Sign-In
- **Firebase Realtime Database** — Real-time action log, task state persistence
- **Google AI Studio** — Deployment platform

## Architecture

```
Multi-Agent System:
ARIA-Core (Orchestrator) → routes to:
  ARIA-Build  → task decomposition + function calling
  ARIA-Rescue → emergency triage + sprint planning
  ARIA-Comms  → stakeholder communication drafting
  ARIA-Shield → risk scoring (synchronous)
  ARIA-Check  → quality validation + reflection loops
```

## Setup

### Prerequisites
- Node.js 20+
- Firebase project with Realtime Database enabled
- Gemini API key (Google AI Studio)

### Installation

```bash
git clone https://github.com/yourusername/aria-app
cd aria-app
npm install
cp .env.example .env.local
# Fill in your API keys in .env.local
npm run dev
```

### Firebase Setup
1. Create a Firebase project at console.firebase.google.com
2. Enable **Authentication** → Google Sign-In
3. Enable **Realtime Database** → Start in test mode
4. Set security rules (see `firebase.rules.json`)
5. Generate Admin SDK service account key
6. Set Database URL to your Realtime DB URL

### Firebase Security Rules
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

### Deployment (Google AI Studio)
1. Build: `npm run build`
2. Deploy via Google AI Studio interface
3. Set all environment variables in AI Studio settings
4. Verify health check: `GET /api/health`

## Project Structure

```
aria-app/
├── app/
│   ├── page.tsx              # Landing page + sign-in
│   ├── (auth)/
│   │   ├── dashboard/        # Main dashboard
│   │   ├── task/new/         # Build Mode input + results
│   │   ├── rescue/           # Rescue Mode dashboard
│   │   └── log/              # Full action log
│   └── api/aria/             # Server-side agent routes
├── lib/
│   ├── agents/               # ARIA-Build, ARIA-Rescue, ARIA-Comms, ARIA-Shield, ARIA-Check
│   ├── gemini/               # Client, tools, prompts, schemas
│   └── firebase/             # Client, admin, db helpers
├── components/               # UI + ARIA-specific components
├── hooks/                    # useARIA, useActionLog, useTasks, useRescueTimer
└── context/                  # AuthContext, ModeContext
```

## Demo

**Demo Account:** Sign in with any Google account

**Suggested demo flow:**
1. Open dashboard → see CRITICAL task (pre-seeded)
2. Click "Rescue" → watch amber UI activate
3. ARIA processes → triage results appear
4. Expand email draft → "ARIA wrote this"
5. Click "+ New Task" → Build Mode
6. Type any task + deadline → ARIA decomposes
7. Open "ARIA Activity" → show real-time action log

## Key Files for Judges

| "Show me..." | File |
|---|---|
| Function calling implementation | `lib/agents/build.ts` |
| Rescue agent logic | `lib/agents/rescue.ts` |
| All tool declarations | `lib/gemini/tools.ts` |
| Validation / reflection loops | `lib/agents/validator.ts` |
| Action log component | `components/aria/ActionLog.tsx` |
| System prompts | `lib/gemini/prompts.ts` |

---

Built solo · Vibe2Ship 2026 · Powered by Gemini 2.0 Flash + Firebase
