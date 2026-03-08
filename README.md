<div align="center">

<img src="https://img.shields.io/badge/AWS-AI%20for%20Bharat-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" />
<img src="https://img.shields.io/badge/Track-Student%2003%3A%20AI%20for%20Communities-4CAF50?style=for-the-badge" />
<img src="https://img.shields.io/badge/Stage-Prototype%20Submission-6B46C1?style=for-the-badge" />

<br /><br />

```
  ██████╗  ██████╗ ███╗   ██╗██████╗ ██╗  ██╗██╗   ██╗
  ██╔══██╗██╔═══██╗████╗  ██║██╔══██╗██║  ██║██║   ██║
  ██████╔╝██║   ██║██╔██╗ ██║██║  ██║███████║██║   ██║
  ██╔══██╗██║   ██║██║╚██╗██║██║  ██║██╔══██║██║   ██║
  ██████╔╝╚██████╔╝██║ ╚████║██████╔╝██║  ██║╚██████╔╝
  ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝
```

### **বন্ধু — The Friend That Stays**
#### *Agentic AI Mental Wellness Companion for India's Gen Z*

<br />

[![Live Prototype](https://img.shields.io/badge/🌐%20Live%20Prototype-bondhu.tech-00C896?style=for-the-badge)](https://www.bondhu.tech)
[![GitHub](https://img.shields.io/badge/GitHub-rex223%2FBondhu__Prototype-181717?style=for-the-badge&logo=github)](https://github.com/rex223/Bondhu_Prototype)
[![Demo Video](https://img.shields.io/badge/▶%20Demo%20Video-Watch%20Now-FF0000?style=for-the-badge&logo=googledrive)](https://drive.google.com/file/d/1NrYJfxAbJXWtZjNZVN3-cqR0VfEgyUwR/view?usp=sharing)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Bondhu%20AI-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/company/bondhu-ai/)

<br />

> *"Bondhu is there before the breakdown at 2AM — building a real connection to help lonely Gen Z feel understood and supported."*

<br />

---

</div>

## 🧠 The Core Insight

India has **450 million Gen Z** — and a near-invisible mental wellness infrastructure for them. Students face academic pressure, identity crises, family expectations, and deep loneliness. Yet formal care is unaffordable, stigmatized, or simply unavailable.

**Existing apps fail because they feel generic.**

> Bondhu is not another chatbot. It is an **Agentic AI Emotional Infrastructure** — a companion that learns who you are, watches how you live, and reaches out *before* isolation becomes a crisis.

---

## 💡 What Makes Bondhu Different — The Core Innovation

Most mental wellness apps wait for the user to type something. Bondhu doesn't.

| Signal | What Bondhu Detects | Response |
|--------|-------------------|----------|
| 🎮 Gaming Agent | Rage-quit pattern at 1 AM | *"Hey, rough night? Wanna talk?"* |
| 🎵 Music Agent | Sad song loop at 2 AM | *"I noticed your playlist shifted — you okay?"* |
| 💬 Personality Agent | Withdrawal from conversations | Proactive check-in, not a prompt |
| 📺 Content Agent | Late-night doom-scrolling | Gentle nudge toward coping tools |

This is **proactive intervention** — catching the drift before isolation spirals into a clinical crisis.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
│                    Next.js 16 Client (TypeScript)               │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                         LOGIC LAYER                             │
│                      FastAPI Backend (Python 3.13)              │
│                                                                 │
│   ┌──────────────┐      ┌─────────────────┐   ┌─────────────┐  │
│   │ Music Agent  │◄────►│   LangGraph     │◄─►│ Video Agent │  │
│   └──────────────┘      │  Orchestrator   │   └─────────────┘  │
│   ┌──────────────┐      │  (Multi-Agent   │   ┌─────────────┐  │
│   │ Gaming Agent │◄────►│  Coordination)  │◄─►│ Personality │  │
│   └──────────────┘      └─────────────────┘   │    Agent    │  │
│                                                └─────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                          DATA LAYER                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌────────┐ │
│   │   Supabase   │  │  Spotify API │  │  YouTube │  │ Steam  │ │
│   │ (PostgreSQL) │  │              │  │   API    │  │  API   │ │
│   └──────────────┘  └──────────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

Bondhu orchestrates **4 intelligent agents** via LangGraph, powered by your interaction data across Spotify, YouTube, and Steam — building a truly adaptive **Digital Twin** of each user.

---

## 🤖 The Four-Agent System

<table>
<tr>
<td align="center" width="25%">

### 🧬 Personality Agent
Learns stable Big Five traits, values, and decision-making patterns from onboarding and ongoing interaction

**Tracks:**
- Core traits & social preferences
- Decision-making style
- Communication boundaries

</td>
<td align="center" width="25%">

### 🎵 Music Agent
Infers mood and emotional shifts in real time from listening behaviour via Spotify API

**Tracks:**
- Emotional expression
- Energy & tempo patterns
- Cultural influences

</td>
<td align="center" width="25%">

### 📺 Content Agent
Understands learning style, curiosity domains, and communication tone from content consumption

**Tracks:**
- Learning preferences
- Curiosity domains
- Entertainment style

</td>
<td align="center" width="25%">

### 🎮 Gaming Agent
Uses RPG-style quest choices and Steam data to uncover deeper behavioural tendencies

**Tracks:**
- Problem-solving approach
- Competitive vs. cooperative
- Risk tolerance

</td>
</tr>
</table>

> **The Moat:** This proprietary multi-agent integration (Personality + Music + Content + Gaming) creates a defensible competitive advantage that generic LLM wrappers cannot replicate.

---

## 🛠️ Tech Stack

### Frontend Product Layer
| Technology | Purpose |
|---|---|
| **Next.js 16** (TypeScript) | Responsive web interface — onboarding, dashboard, real-time chat |
| **React 19** | Component architecture |
| **Tailwind CSS 4** | Accessible, modern UI design |
| **Framer Motion & GSAP** | Fluid animation and transitions |
| **Recharts** | Wellness progress visualisation |
| **Vapi Voice Client** | Voice-mode companion entry points |

### Backend & Orchestration Layer
| Technology | Purpose |
|---|---|
| **FastAPI** (Python 3.13) | High-performance REST APIs and request orchestration |
| **LangGraph** | Stateful multi-agent orchestration framework |
| **Cerebras-backed Chat Service** | Low-latency conversational AI |
| **Gemini** | Mood detection and emotional signal analysis |

### AI & Machine Learning Layer
| Technology | Purpose |
|---|---|
| **Llama 3.3 70B** | Core large language model |
| **Big Five (BFI-S) Personality Vectors** | Adaptive personality modelling |
| **scikit-learn / NumPy / pandas** | Behavioural signal processing and personality updates |

### Data & Infrastructure Layer
| Technology | Purpose |
|---|---|
| **Supabase** (PostgreSQL + RLS) | Auth, user profiles, and activity data |
| **Redis / Upstash** | Low-latency session and personalisation caching |
| **APScheduler** | Periodic personality evolution tasks |
| **Docker + GitHub Actions** | Containerised CI/CD pipeline |

---

## ☁️ Path to AWS-Scale Deployment

This prototype is cloud-agnostic today and maps cleanly onto a full AWS architecture:

```
Amazon Bedrock          →  Model routing, evaluation & guardrails
AWS Lambda / ECS        →  API and async task execution
Amazon RDS / Aurora     →  Relational application data
ElastiCache             →  Session, context & personalisation caching
Amazon S3 + CloudFront  →  Static delivery and media assets
Amazon API Gateway      →  Secure frontend ↔ backend communication
CloudWatch + X-Ray      →  Monitoring, tracing & incident visibility
```

---

## 🗂️ Repository Structure

```
Bondhu_Prototype/
│
├── bondhu-landing/               # Next.js product prototype
│   └── src/
│       ├── app/                  # Routes and API handlers
│       │   ├── onboarding/personality/   # Big Five flow
│       │   ├── dashboard/               # Companion chat UI
│       │   ├── entertainment/           # Music & video surfaces
│       │   ├── games/personality-quest/ # Gamified discovery
│       │   ├── personality-insights/    # Profile & feedback
│       │   ├── progress/                # Wellness loop
│       │   └── api/                     # Crisis, auth, notifications
│       ├── components/           # UI and product components
│       └── lib/                  # Auth, scoring, schema, utilities
│
└── bondhu-ai/                    # Python conversation modules
    └── chat/                     # Chat service, routing, mood, traits
```

---

## 🚀 Local Setup

### Frontend

```bash
cd bondhu-landing
npm install
cp env.local.example .env.local   # or: Copy-Item env.local.example .env.local (PowerShell)
npm run dev
```

**Required environment variables** (see `bondhu-landing/env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
VAPI_PUBLIC_KEY=
```

### Backend Note

The core conversation modules are available under `bondhu-ai/chat/`. Full backend deployment wiring, secrets, and external service configuration are environment-dependent and are not packaged as a one-command bootstrap in this submission.

---

## 🗺️ Recommended Evaluation Journey

| Route | What it Shows |
|---|---|
| `/` | Problem framing, solution story, and product narrative |
| `/onboarding/personality` | Big Five personality discovery and onboarding flow |
| `/dashboard` | Core companion UI and voice-mode entry |
| `/entertainment` | Music, video, and game-driven engagement surfaces |
| `/games/personality-quest` | Gamified personality learning (Bondhu Quest) |
| `/personality-insights` | Personality results and explanatory feedback |
| `/progress` | Activity and engagement feedback loop |
| `/profile` & `/settings` | User account and control surfaces |
| `/privacy-policy` & `/terms-of-service` | Trust, governance, and product readiness |
| `/team` | Team and mentor context |

---

## 📊 Prototype Validation

Early user research across 17 respondents showed strong signal:

| Question | Result |
|---|---|
| "Do you find the idea of a Digital Twin Friend helpful for daily mental wellness?" | **94.1% Yes** |
| "Would you personally use this?" | **88.2% Yes** |
| Likelihood to recommend to a stressed friend (1–10) | **Skewed 8–10** |

The primary hesitation was a **preference for human connection** (47.1%) — validating that Bondhu's positioning as a *companion bridge*, not a therapy replacement, is the right framing.

---

## 🏪 Business Model

```
┌─────────────────────────┐         ┌──────────────────────────┐
│  Colleges & Corporates  │──fees──►│      bondhu Platform     │──access──►│ Students & Employees │
│  CSR / Wellness Budgets │         │  Voice-first companion   │           │  All premium features │
└─────────────────────────┘         │  Proactive support       │           │  24/7 · Zero stigma  │
                                    └──────────────────────────┘           └──────────────────────┘
```

**B2B2C** — Bulk institutional licenses sold to colleges and corporates  
**B2C** — Freemium individual tier · Paid plan at **₹299/month**

---

## 📈 Market Opportunity

| Segment | Size |
|---|---|
| **TAM** — Total Addressable | 450M Gen Z in India (120M college-aged) |
| **SAM** — Serviceable Addressable | 10M Gen Z actively seeking online wellness support |
| **SOM** — Year 3 Target | 50,000 users (just 3.3% of Wysa's current base) |

**The Gap:** 72% of Gen Z are open to AI mental wellness support *(Cheil India, 2024)*, yet affordable, personalised solutions don't exist. Existing apps are either generic or cost ₹1,500–4,000 per session.

### Competitive Positioning

| Feature | Bondhu AI | Wysa / Replika / YourDOST |
|---|---|---|
| **Pricing** | ₹299/month | ₹600–₹2,500+ |
| **Intelligence** | Remembers your personality | Generic or human-only |
| **Integration** | Gaming, Spotify, Steam | None |
| **Availability** | Instant 24/7 | Appointments / Delayed |
| **Language** | Hinglish + local nuance | English-first |

---

## 🌏 Impact & SDGs

Bondhu directly contributes to:

- 🟢 **SDG 3 — Good Health & Well-Being:** Democratising access to mental wellness support
- 🟠 **SDG 10 — Reduce Inequalities:** Breaking cost and stigma barriers for underserved youth

**Roadmap:**

```
Now  ──► Q3 2026: 3 institutional pilots with colleges
     ──► Q1 2027: 10K MAU · ₹5 Lakh ARR
     ──► Beyond:  Multilingual rollout · Global South expansion
```

---

## 🛡️ Responsible AI & Safety Posture

Bondhu is a wellness companion — not a medical device, not a replacement for licensed care.

- **Crisis-aware UX** — dedicated crisis intervention modal and escalation messaging built into the product
- **Privacy by design** — Supabase Row-Level Security, data minimisation, and transparent data handling
- **User control** — account deletion, notification settings, and session management accessible in-product
- **Trust surfaces** — Privacy Policy and Terms of Service pages are part of the prototype experience
- **Scope clarity** — Clinical validation, multilingual rollout, and production hardening are next-phase deliverables

---

## 🔭 Current Limitations & Next Milestones

- [ ] Package the backend into a fully runnable service within the repository
- [ ] Expand multilingual Indian language support (Hindi, Bengali, Tamil, Telugu)
- [ ] Deepen safety review and introduce evaluator benchmarks
- [ ] Strengthen campus and institutional pilot readiness
- [ ] Harden AWS deployment with observability and automated evaluation flows
- [ ] Clinical advisory integration for responsible wellness guidance

---

## 👥 Team

| Name | Role |
|---|---|
| **Saikat Bandopadhyay** | Mentor & Advisor |
| **Md Haaris Hussain** | Full Stack Developer · Team Lead |
| **Raquib** | Devops and Infrastructure |


*Pre-Incubated by **StartUp ki Pathsala***  
*Built in **Kolkata, India** 🇮🇳*

---

## 📬 Contact

<div align="center">

| Channel | Link |
|---|---|
| 🌐 Website | [bondhu.tech](https://www.bondhu.tech) |
| 📧 General | [bondhuaitech@gmail.com](mailto:bondhuaitech@gmail.com) |
| 📧 Support | [support@bondhu.tech](mailto:support@bondhu.tech) |
| 💼 LinkedIn | [linkedin.com/company/bondhu-ai](https://www.linkedin.com/company/bondhu-ai/) |
| 💻 GitHub | [github.com/rex223/Bondhu_Prototype](https://github.com/rex223/Bondhu_Prototype) |

</div>

---

<div align="center">

<img src="https://img.shields.io/badge/Built%20in-Kolkata%2C%20India-FF6B35?style=flat-square" />
<img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs" />
<img src="https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/LangGraph-Multi--Agent-00C896?style=flat-square" />
<img src="https://img.shields.io/badge/Llama-3.3%2070B-7C3AED?style=flat-square" />
<img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />

<br /><br />

**"No judgment. No waiting. Just a friend when you need it most."**

*© 2026 Bondhu AI · AWS AI for Bharat Hackathon · Student Track 03*

</div>
