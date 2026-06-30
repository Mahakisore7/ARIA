# ARIA (Autonomous Rescue & Intervention Agent)

![ARIA Banner](public/assets/hero.png)

> **You don't manage deadlines. ARIA does.**

ARIA is the first AI agent that covers your complete deadline lifecycle — planning, monitoring, and emergency rescue — without waiting to be asked. Built for the **Vibe2Ship 2026 Hackathon**.

## Features

![Features](public/assets/features.png)

- **⚡ Build Mode:** Drop any task in natural language. ARIA decomposes it, estimates time, flags risks, and builds your execution plan in seconds.
- **🛡️ Shield Mode:** ARIA autonomously monitors your active tasks and flags deadline risks before you realize you have a problem.
- **🚨 Rescue Mode:** Deadline in hours? Haven't started? ARIA triages your situation, builds a micro-sprint plan, cuts scope, and drafts your stakeholder apology email.

## Previews

### Dashboard
*Central command for monitoring task health and active risks.*
![Dashboard](public/assets/dashboard.png)

### Build Mode
*Natural language task decomposition and planning.*
![Build Mode](public/assets/build.png)

### Rescue Protocol
*Emergency triage for failing tasks.*
![Rescue Mode](public/assets/rescue.png)

---

## Architecture

ARIA is built with a modern, agentic architecture powered by **Next.js**, **Firebase**, and **Groq (Llama 3.3)**.

### 1. High-Level System Architecture
```mermaid
graph TD
    U[User] -->|Interacts| F[Next.js Frontend]
    F -->|Google Auth / Realtime Sync| FB[(Firebase DB & Auth)]
    F -->|Sends Task Prompt| API[Next.js API Routes]
    API -->|Tool Calling Prompts| AI[Groq AI Engine Llama-3.3]
    AI -->|Structured JSON Plan| API
    API -->|Saves Plan| FB
    API -->|Response| F
```

### 2. Agentic Workflow
```mermaid
flowchart TD
    UI[User Input - Natural Language] --> Router{Intent Router}
    
    Router -->|Standard Deadline| BA[Build Agent]
    Router -->|Emergency / Failing| RA[Rescue Agent]
    
    BA -->|Decomposes Task| BA1[Time Estimation]
    BA1 -->|Risk Assessment| BA2[Subtask Generation]
    
    RA -->|Triages Situation| RA1[Micro-Sprint Generation]
    RA1 -->|Damage Control| RA2[Stakeholder Email Draft]
    
    BA2 --> Validator[JSON Schema Validator]
    RA2 --> Validator
    
    Validator -->|Valid| DB[(Firebase Database)]
    Validator -->|Invalid| Retry[Agent Auto-Retry]
    Retry --> BA
    Retry --> RA
```

### 3. Database Schema
```mermaid
erDiagram
    USER ||--o{ TASK : manages
    TASK ||--o{ SUBTASK : "Contains (Build Mode)"
    TASK ||--o{ SPRINT_BLOCK : "Contains (Rescue Mode)"

    USER {
        string uid
        string email
        string displayName
    }
    
    TASK {
        string id
        string title
        string deadline_iso
        string risk_level
        string mode_created
    }
    
    SUBTASK {
        string title
        int estimated_minutes
        boolean completed
        boolean risk_flag
    }
    
    SPRINT_BLOCK {
        int duration_minutes
        string deliverable
        boolean completed
    }
```

## Tech Stack
- **Frontend Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (Neobrutalist Design System)
- **Database & Auth:** Firebase (Realtime Database & Google Auth)
- **AI Engine:** Groq Cloud API (Llama-3.3-70b-versatile)
- **Deployment:** Vercel (Recommended)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Setup your `.env.local` with Firebase credentials and your `GROQ_API_KEY`.
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

---
*Developed for Vibe2Ship 2026*
