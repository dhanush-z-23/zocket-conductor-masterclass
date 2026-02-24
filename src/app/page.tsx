'use client';

import { useState, useEffect, useRef } from "react";

/* ── COLORS ── */
const c = {
  bg:"#09090b",bg2:"#131316",bg3:"#1a1a1f",border:"#2a2a30",
  t1:"#fafafa",t2:"#e4e4e7",t3:"#c8c8d0",t4:"#a0a0b0",t5:"#808090",
  acc:"#34d399",acc2:"#22d3ee",accD:"rgba(52,211,153,0.12)",accB:"rgba(52,211,153,0.25)",
  am:"#fbbf24",bl:"#60a5fa",vi:"#a78bfa",or:"#fb923c",pk:"#f472b6",rd:"#f87171"
};
const dim=(col: string)=>col+"18", bdr=(col: string)=>col+"40";

/* ── REUSABLE COMPONENTS ── */
const CopyBtn=({text}:{text:string})=>{const[d,sD]=useState(false);return<button onClick={()=>{navigator.clipboard?.writeText(text);sD(true);setTimeout(()=>sD(false),2e3)}} style={{background:"rgba(255,255,255,0.08)",color:c.t4,border:"1px solid "+c.border}} className="absolute top-2 right-2 text-xs px-2.5 py-1 rounded-md hover:opacity-80 transition">{d?"Copied!":"Copy"}</button>};

const Prompt=({label,text,what}:{label:string;text:string;what?:string})=>(
  <div className="rounded-xl my-4 overflow-hidden" style={{border:"1px solid "+c.accB,background:c.accD}}>
    <div className="flex items-center justify-between px-4 py-2" style={{borderBottom:"1px solid "+c.accB}}>
      <span className="text-xs font-bold" style={{color:c.acc}}>→ {label}</span>
      <span className="text-xs font-mono" style={{color:c.t5}}>paste into Conductor</span>
    </div>
    {what&&<div className="px-4 pt-3 pb-0"><p className="text-xs leading-relaxed" style={{color:c.t3}}>{what}</p></div>}
    <div className="relative p-4"><CopyBtn text={text}/><pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed pr-16" style={{color:"#6ee7b7"}}>{text}</pre></div>
  </div>
);

const Tip=({title,children,col=c.acc}:{title:string;children:React.ReactNode;col?:string})=>(
  <div className="rounded-xl p-4 my-3" style={{background:dim(col),borderLeft:"3px solid "+col}}>
    <p className="text-xs font-bold mb-1" style={{color:col}}>{title}</p>
    <div className="text-xs leading-relaxed" style={{color:c.t3}}>{children}</div>
  </div>
);

const Bx=({emoji,title,children,col}:{emoji:string;title:string;children:React.ReactNode;col?:string})=>(
  <div className="flex gap-4 rounded-xl p-5 my-4" style={{background:col?dim(col):c.bg3,border:"1px solid "+(col?bdr(col):c.border)}}>
    <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
    <div className="min-w-0"><p className="text-sm font-semibold mb-1" style={{color:c.t1}}>{title}</p><div className="text-sm leading-relaxed" style={{color:c.t3}}>{children}</div></div>
  </div>
);

const Collapse=({title,children,defaultOpen=false}:{title:string;children:React.ReactNode;defaultOpen?:boolean})=>{
  const[open,setOpen]=useState(defaultOpen);
  return(<div className="rounded-xl my-3 overflow-hidden" style={{border:"1px solid "+c.border,background:c.bg2}}>
    <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:opacity-80 transition">
      <span className="text-sm font-semibold" style={{color:c.t1}}>{title}</span>
      <span className="text-xs" style={{color:c.t4}}>{open?"▼":"▶"}</span>
    </button>
    {open&&<div className="px-5 pb-5 text-sm leading-relaxed" style={{color:c.t3,borderTop:"1px solid "+c.border}}><div className="pt-4">{children}</div></div>}
  </div>);
};

const Step=({n,title,children}:{n:number;title:string;children:React.ReactNode})=>(
  <div className="flex gap-4 items-start my-5">
    <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-mono font-bold" style={{background:c.accD,border:"1px solid "+c.accB,color:c.acc}}>{n}</div>
    <div className="flex-1 rounded-xl p-5" style={{background:c.bg2,border:"1px solid "+c.border}}>
      <p className="text-sm font-semibold mb-3" style={{color:c.t1}}>{title}</p>
      <div className="text-sm leading-relaxed space-y-2" style={{color:c.t3}}>{children}</div>
    </div>
  </div>
);

const P=({children}:{children:React.ReactNode})=><p className="text-sm leading-relaxed my-2" style={{color:c.t3}}>{children}</p>;
const B=({children}:{children:React.ReactNode})=><strong style={{color:c.t1}}>{children}</strong>;
const H2=({children}:{children:React.ReactNode})=><p className="text-base font-bold mt-8 mb-4" style={{color:c.t1}}>{children}</p>;

const Check=({label,checked,onToggle}:{label:string;checked:boolean;onToggle:()=>void})=>(
  <button onClick={onToggle} className="flex items-center gap-3 w-full text-left rounded-lg px-4 py-2.5 mb-1.5 transition hover:opacity-80" style={{background:checked?"rgba(52,211,153,0.08)":c.bg3,border:"1px solid "+(checked?c.accB:c.border)}}>
    <span className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs" style={{background:checked?c.acc:"transparent",border:"2px solid "+(checked?c.acc:c.t5),color:c.bg}}>{checked?"✓":""}</span>
    <span className="text-sm" style={{color:checked?c.acc:c.t3}}>{label}</span>
  </button>
);

const KbdShortcut=({keys,desc}:{keys:string;desc:string})=>(
  <div className="flex items-center justify-between rounded-lg px-4 py-2.5 mb-1.5" style={{background:c.bg3,border:"1px solid "+c.border}}>
    <span className="text-sm" style={{color:c.t3}}>{desc}</span>
    <kbd className="text-xs font-mono px-2.5 py-1 rounded-md" style={{background:c.bg,border:"1px solid "+c.border,color:c.acc}}>{keys}</kbd>
  </div>
);

/* ── ROLE DATA ── */
const roles=[
  {id:"finance",emoji:"💰",label:"Finance",color:c.acc,
    project:"FinanceIQ",tagline:"AI Financial Intelligence Platform",
    desc:"Build an AI tool your finance team uses daily: real-time KPI dashboards, board-ready report generation, revenue forecasting, anomaly detection, what-if scenario modeling, and invoice processing. Like having a 24/7 financial analyst who knows all your numbers.",
    features:["Real-time KPI dashboard with sparkline charts, traffic lights (green/yellow/red), and AI commentary for each metric","AI board report generator — type 'Generate Q3 report' and get a full narrative with charts, export as PDF","Revenue forecasting — upload a CSV of actuals, get 3/6/12-month projections with best/expected/worst case","Anomaly detection — AI monitors metrics 24/7 and alerts you to unusual patterns with suggested actions","What-if scenario modeling — ask 'What if we hire 10 engineers?' and see the full financial impact","Invoice processing — upload PDFs, AI extracts all data, categorizes, flags duplicates"],
    agents:[
      {name:"Frontend Dashboard",what:"Builds everything your team SEES and clicks — the login page, KPI dashboard with charts, report viewer, forecast page with upload, alerts feed, scenario builder, invoice table, and settings. This is the visual interface.",
       prompt:`Build the complete frontend for FinanceIQ — an internal AI-powered financial intelligence platform. Use Next.js 14 with TypeScript strict mode and Tailwind CSS.

PAGES: /login (email/password), /dashboard (KPI grid: MRR, ARR, Burn Rate, Runway, CAC, LTV, Churn, NRR — each card with value, sparkline, delta arrow, AI tooltip. Period toggles MoM/QoQ/YoY), /reports (list + "Generate Report" modal with type selector and streaming AI output, embedded Recharts, PDF export), /forecast (CSV drag-drop upload, data preview, AI forecast with 3/6/12mo toggles and confidence bands), /alerts (severity-filtered feed with Acknowledge/Snooze/Investigate buttons), /scenarios (variable inputs + AI comparison cards + waterfall chart), /invoices (PDF upload, sortable table, bulk approve), /settings.

COMPONENTS: KPICard, ReportViewer, ForecastChart (Recharts line + confidence), AlertCard, ScenarioBuilder, InvoiceTable, CSVUploader, Sidebar, TopBar.

TECH: TypeScript strict (no 'any'), Tailwind CSS only, Recharts for charts, TanStack React Query for API calls, dark theme, mobile responsive, loading skeletons, error boundaries. Complete package.json. ALL files complete. No TODO or placeholders.`},
      {name:"Backend API",what:"Builds the 'brain' — the server that receives requests from the frontend, processes data, talks to AI, manages the database, and sends responses back. Like the kitchen in a restaurant — invisible to customers but does all the work.",
       prompt:`Build complete Python FastAPI backend for FinanceIQ.

STRUCTURE: /backend/ with main.py, /routers/ (auth, dashboard, reports, forecast, alerts, scenarios, invoices), /services/, /models/, /schemas/, /prompts/, /utils/, requirements.txt, alembic.ini.

ENDPOINTS (/api/v1/): Auth (JWT login/register/me/refresh), Dashboard (GET /kpis with period comparison, GET /kpis/history, GET /summary SSE streaming), Reports (CRUD + POST /generate SSE streaming sections, PDF export), Forecast (POST /upload CSV, POST /generate SSE with confidence intervals), Alerts (filtered list, acknowledge, snooze, summary), Scenarios (POST /model SSE streaming, list, compare), Invoices (PDF upload + AI parse, filtered list, approve, bulk-approve).

TECH: JWT auth, Pydantic v2, SQLAlchemy async + asyncpg, Alembic migrations, SSE StreamingResponse for ALL AI endpoints, CORS, rate limiting, structured logging, consistent error format. Complete requirements.txt. All files complete. No placeholders.`},
      {name:"AI Financial Engine",what:"Builds the AI 'intelligence' — this is what makes the tool SMART. It talks to Claude AI to analyze data, generate reports, detect anomalies, forecast revenue, and model scenarios. Without this, you'd just have an empty dashboard.",
       prompt:`Build AI financial analysis services for FinanceIQ in /backend/services/.

FILES: ai_client.py (Anthropic API client with streaming, retry, token tracking), kpi_analyzer.py (calculate all KPIs, Z-score anomaly detection, AI commentary streaming), report_generator.py (multi-section board reports streamed as JSON sections with chart configs), forecast_engine.py (CSV parsing, trend analysis, AI-powered projections with confidence intervals), anomaly_detector.py (rolling window detection, severity scoring, pattern detection), scenario_modeler.py (financial impact modeling with AI narrative), invoice_processor.py (PDF extraction, AI parsing, categorization, duplicate detection).

PROMPTS in /backend/prompts/: report_system.txt, forecast_system.txt, scenario_system.txt, invoice_system.txt, commentary_system.txt.

TECH: All streaming async generators, comprehensive error handling, type hints everywhere, logging for every AI call. No hardcoded keys. Complete. No placeholders.`},
      {name:"Database Layer",what:"Builds the storage — where all data gets saved permanently. Without this, everything disappears when you close the browser. This creates the tables for users, KPIs, reports, forecasts, alerts, scenarios, and invoices.",
       prompt:`Build database layer for FinanceIQ. SQLAlchemy async + asyncpg + PostgreSQL.

MODELS: User (email, name, password_hash, role, org_id), Organization (name, settings JSONB), KPISnapshot (org_id, date, metric_name enum, value Decimal, metadata JSONB — indexed), Report (org_id, title, type enum, date range, content JSONB, status), Forecast (org_id, actuals JSONB, projections JSONB, scenario, months), Alert (org_id, severity, metric, description, suggested_action, acknowledged_at, snoozed_until — indexed), Scenario (org_id, name, assumptions JSONB, results JSONB), Invoice (org_id, vendor, number, date, line_items JSONB, category, total, status — indexed).

CRUD in /backend/crud/. Alembic migrations. Seed script with 12 months sample KPI data, 3 reports, 5 alerts. Complete.`},
      {name:"Tests & Error Handling",what:"Makes the app reliable. Tests automatically verify every feature works. Error handling shows helpful messages instead of crashes. Critical for a financial tool — you can't have the board report generator crash mid-presentation.",
       prompt:`Build tests and error handling for FinanceIQ.

FRONTEND (Jest + RTL): KPICard renders, ReportViewer sections, ForecastChart toggles, CSV upload flow, alert acknowledge.
BACKEND (pytest + httpx): auth flow, KPI calculations, report streaming, CSV validation, alert filtering, invoice parsing.
ERROR HANDLING: Frontend ErrorBoundary + toast notifications + retry logic. Backend consistent error format, custom exceptions, financial validation (no divide-by-zero, handle missing data).
Complete. No placeholders.`},
      {name:"DevOps & Docs",what:"Makes the app deployable and documented. Docker packages everything for easy setup. GitHub Actions runs tests automatically. README explains how to set everything up.",
       prompt:`Build DevOps for FinanceIQ. Dockerfile frontend (Node multi-stage), Dockerfile backend (Python slim), docker-compose.yml (frontend + backend + PostgreSQL), GitHub Actions CI/CD (lint + test + build), .env.example with ALL variables documented, setup.sh bootstrap script, comprehensive README.md with architecture diagram. Complete.`}
    ]
  },
  {id:"design",emoji:"🎨",label:"Design",color:c.vi,
    project:"DesignForge",tagline:"AI Design System & Brief Generator",
    desc:"Build an AI tool for your design team: generate creative briefs from vague requirements, create complete design token systems (colors, typography, spacing), build mood boards with AI-directed palettes, write component specs, compile brand guidelines, and generate 20 copy variations from one headline.",
    features:["Creative brief generator — paste a vague client email, get a structured brief with objectives, audience, timeline","Design token studio — describe a brand personality, get complete color/type/spacing tokens with CSS variables","Mood board builder — enter keywords, get 3 distinct visual directions with palettes and typography pairings","Component spec writer — describe a UI element, get states, responsive rules, accessibility, and code","Brand guide generator — answer a questionnaire, get a comprehensive brand guidelines document","Copy variation engine — input one headline, get 20 variations tagged by tone"],
    agents:[
      {name:"Frontend Interface",what:"Builds the beautiful design-tool-inspired interface — forms, color swatches, typography previews, mood cards, and export buttons.",
       prompt:`Build complete Next.js 14 frontend for DesignForge — AI design system tool. Figma-inspired aesthetic.

PAGES: /dashboard (recent projects, quick-start cards), /briefs/new (multi-step form with progress stepper → streaming AI output), /briefs/[id] (sections with expand/collapse, inline edit, PDF export), /tokens (brand personality input → AI generates color swatches with hex/HSL, typography scale, spacing, shadows, radii — "Copy as CSS" buttons), /moodboard (keywords input → 3 mood direction cards with palettes, typography, style descriptions), /components/new (description input → spec with states tabs, responsive preview, accessibility checklist, code snippet), /brand-guide (10-question questionnaire → full brand guide, PDF export), /variations (text input + tone filter → 20 variations in masonry grid, click to copy, star favorites).

TypeScript strict, Tailwind CSS, React Query. Premium design aesthetic. Complete. No placeholders.`},
      {name:"Backend API",what:"Server handling all requests, project storage, and AI generation orchestration.",
       prompt:`Build Python FastAPI backend for DesignForge. JWT auth, Pydantic v2, SQLAlchemy async, SSE streaming.

ENDPOINTS: Auth (JWT), Projects CRUD, Briefs CRUD + POST /generate (SSE), Tokens CRUD + POST /generate (SSE by category), Moodboards POST /generate (SSE 3 directions), Components POST /spec (SSE), Brand-guides POST /generate (SSE), Variations POST /generate (20 with tone tags). CORS, rate limiting. Complete.`},
      {name:"AI Design Engine",what:"The AI brain that understands color theory, typography, brand psychology — generates tokens, briefs, and mood directions.",
       prompt:`Build AI design services for DesignForge in /backend/services/. brief_generator.py (multi-section SMART briefs, streamed), token_generator.py (colors with 5 shades + contrast ratios, typography scale, spacing, shadows, radii — CSS variable format), moodboard_engine.py (3 directions with palettes, typography, photography style), component_spec.py (overview, all states, responsive, accessibility, React code), brand_guide_generator.py (full brand guide from questionnaire), variation_engine.py (20 variations: 5 short/5 medium/5 long/5 provocative with tone tags). Prompt files in /backend/prompts/. Claude streaming. Complete.`},
      {name:"Database",what:"Stores all projects, briefs, token sets, mood boards, brand guides permanently.",
       prompt:`Database for DesignForge. SQLAlchemy async. Models: User, Organization, Project, Brief (sections JSONB), TokenSet (colors/typography/spacing/shadows/radii JSONB), MoodBoard (directions JSONB), ComponentSpec (states/responsive/accessibility JSONB), BrandGuide (sections JSONB), Variation (variations JSONB). Alembic, CRUD, seed data. Complete.`},
      {name:"Tests + DevOps",what:"Testing, Docker, CI/CD, and documentation for reliability and deployment.",
       prompt:`Tests (Jest + pytest) and DevOps for DesignForge. Dockerfiles, docker-compose, GitHub Actions, .env.example, setup.sh, README. Complete.`}
    ]
  },
  {id:"marketing",emoji:"📣",label:"Marketing",color:c.bl,
    project:"MarketingHQ",tagline:"AI Campaign & Content Platform",
    desc:"Build an AI content engine for your marketing team: generate platform-specific ad copy and social posts, plan multi-channel campaigns, manage a social media calendar with approval workflows, build email drip sequences, create audience personas, and get AI-powered analytics recommendations.",
    features:["Content studio — select platform + type + voice + audience, get 3 variations with character counts and compliance","Campaign planner — describe a goal, get a complete multi-channel plan with calendar and budget allocation","Social calendar — monthly grid with drag-drop scheduling, approval workflow, platform-specific previews","Email sequence builder — describe a goal, get a full drip sequence visualized as a flowchart","Audience persona builder — describe your ideal customer, get demographics, psychographics, targeting params","Analytics + AI recommendations — AI identifies what's working and suggests specific optimizations"],
    agents:[
      {name:"Frontend",what:"Everything the marketing team sees — content generator, campaign wizard, calendar grid, analytics charts, and email sequence builder.",
       prompt:`Build complete Next.js 14 frontend for MarketingHQ — AI marketing content platform.

PAGES: /dashboard (stats, recent content, quick actions), /content/new (platform selector → content type → brand voice → audience → Generate → 3 streaming variations with character counts and compliance indicators), /campaigns/new (multi-step wizard: Goal→Channels→Timeline→Audience→Budget→Generate streaming plan with calendar table and budget pie chart), /campaigns/[id] (channel tabs, content list, timeline), /calendar (monthly grid, drag-drop, approval badges, platform filters), /analytics (engagement charts, AI recommendations panel), /email-sequences/new (goal input → AI flowchart with expandable emails, A/B variants), /audiences (persona cards with targeting params), /settings (brand voice manager, integrations).

TypeScript strict, Tailwind, Recharts, React Query. Vibrant marketing aesthetic. Complete.`},
      {name:"Backend + Integrations",what:"Server with Meta Ads and Slack connections for pushing campaigns and approval workflows.",
       prompt:`Build Python FastAPI backend for MarketingHQ with Meta Ads and Slack MCP integration.

ENDPOINTS: Auth (JWT), Content CRUD + POST /generate (SSE 3 variations), Campaigns CRUD + POST /generate-plan (SSE), Calendar GET/POST/PUT, Analytics + POST /ai-recommendations (SSE), Email sequences CRUD + POST /generate (SSE), Audiences POST /generate-persona (SSE), Brand voices CRUD. Meta Ads: push campaigns, pull performance. Slack: post drafts for approval. SQLAlchemy async, SSE, CORS. Complete.`},
      {name:"AI Content Engine",what:"The creative brain — understands platforms, brand voices, audience psychology, and generates content that converts.",
       prompt:`Build AI content services for MarketingHQ. content_generator.py (platform-aware: Instagram 2200 char/LinkedIn 3000/Twitter 280/Facebook/Email/Blog — 3 variations with engagement predictions, streamed), campaign_planner.py (full plan: overview, channel strategy, content calendar, targeting, budget allocation, A/B testing plan), email_sequence_builder.py (drip sequence with narrative arc), audience_analyzer.py (persona with demographics, psychographics, pain points, platform recommendations), analytics_recommender.py (actionable insights from performance data). Prompts in /backend/prompts/. Claude streaming. Complete.`},
      {name:"Database + Calendar",what:"Storage for content and campaigns, plus scheduling engine with conflict detection and approval workflows.",
       prompt:`Database and calendar service for MarketingHQ. Models: User, Team, BrandVoice, Campaign (plan JSONB), Content (variations JSONB, performance JSONB), CalendarEntry, EmailSequence, SequenceEmail, Audience (persona JSONB), AnalyticsSnapshot. Calendar: conflict detection, approval state machine (draft→submitted→approved→scheduled→published), timezone-aware, bulk scheduling. Alembic, CRUD, seed data. Complete.`},
      {name:"Tests + DevOps",what:"Testing and deployment infrastructure.",
       prompt:`Tests (Jest + pytest) and DevOps for MarketingHQ. Dockerfiles, docker-compose, GitHub Actions, .env.example, setup.sh, README. Complete.`}
    ]
  },
  {id:"sales",emoji:"🤝",label:"Sales",color:c.or,
    project:"SalesEngine",tagline:"AI CRM & Outreach Platform",
    desc:"Build an AI sales tool: research prospects automatically, generate hyper-personalized outreach emails and LinkedIn messages, track your pipeline on a visual Kanban board, forecast deals with AI, prepare for calls with AI-generated prep sheets, and score deal health with next-best-action recommendations.",
    features:["AI prospect research — enter a company name, get overview, news, tech stack, challenges, and talking points","Personalized outreach — AI writes cold emails, 3 follow-ups, and LinkedIn messages referencing specific prospect details","Visual pipeline — drag-and-drop Kanban board with deal cards showing value, probability, and health score","AI deal forecasting — weighted pipeline forecast, at-risk flags, win/loss patterns, recommended actions","Call prep sheets — 1-click AI prep with discovery questions, objection scripts, and competitive positioning","Activity intelligence — engagement health scoring with next-best-action recommendations"],
    agents:[
      {name:"Frontend",what:"The CRM interface — pipeline board, prospect profiles, outreach generator, forecast charts, and call prep sheets.",
       prompt:`Build complete Next.js 14 frontend for SalesEngine — AI CRM. PAGES: /dashboard (pipeline chart, top deals, forecast), /pipeline (Kanban drag-drop: Lead/Qualified/Proposal/Negotiation/Closed — cards with value, probability, health dot), /prospects (searchable list + AI research button), /prospects/[id] (AI research, timeline, outreach history), /outreach/new (prospect selector → tone → Generate → email/LinkedIn/follow-ups in tabs), /forecast (weighted bar chart, at-risk list, target gauge), /call-prep/[dealId] (AI prep: summary, questions, objection scripts, competitive intel), /activity (log form, timeline, health scores). TypeScript strict, Tailwind, Recharts, HTML5 drag-drop. Complete.`},
      {name:"Backend",what:"API for CRM data, prospect research, and deal management.",
       prompt:`FastAPI backend for SalesEngine. Auth (JWT), Prospects CRUD + POST /research (SSE), Deals CRUD + stage transitions + POST /forecast (SSE), Outreach POST /generate (SSE), CallPrep POST /generate (SSE), Activities CRUD + POST /score-engagement, Pipeline GET /summary. SQLAlchemy async, Pydantic v2, SSE, CORS, JWT. Complete.`},
      {name:"AI Sales Engine",what:"The AI brain — researches prospects, writes personalized outreach, forecasts deals, and prepares call sheets.",
       prompt:`AI services for SalesEngine. prospect_researcher.py (company overview, news, tech stack, challenges, talking points — streamed), outreach_generator.py (personalized cold email + 3 follow-ups + LinkedIn — references prospect details, never generic), deal_forecaster.py (weighted forecast, deal velocity, at-risk flags, action recommendations), call_prep_generator.py (summary, SPIN questions, objection scripts, competitive positioning, case studies), engagement_scorer.py (health 0-100, next-best-action). Prompts in /backend/prompts/. Claude streaming. Complete.`},
      {name:"Database",what:"Stores prospects, deals, activities, outreach, and forecasts.",
       prompt:`Database for SalesEngine. Models: User, Prospect (research JSONB), Contact, Deal (stage enum, value, probability, health_score), Activity (type enum, outcome), Outreach (channel, status, response_at), CallPrep (content JSONB), Forecast (data JSONB). Alembic, CRUD, seed with 15 deals. Complete.`},
      {name:"Tests + DevOps",what:"Testing and deployment.",
       prompt:`Tests (Jest + pytest) and DevOps for SalesEngine. Dockerfiles, docker-compose, GitHub Actions, .env.example, README. Complete.`}
    ]
  },
  {id:"product",emoji:"🚀",label:"Product",color:c.acc2,
    project:"ProductPilot",tagline:"AI Product Management Copilot",
    desc:"Build an AI tool for PMs: generate complete PRDs from feature ideas, build prioritized roadmaps, analyze user feedback clusters, score features with RICE framework, decompose epics into user stories with acceptance criteria, and auto-plan sprints respecting capacity and dependencies.",
    features:["PRD generator — describe a feature, get Problem Statement, Personas, User Stories, Risks, Metrics, Launch Plan","Roadmap builder — input goals and capacity, get a prioritized timeline with dependencies and milestones","Feedback analyzer — import CSV, AI clusters themes, runs sentiment analysis, ranks feature requests","Prioritization engine — RICE scoring with auto-generated justifications and 2x2 priority matrix","User story writer — describe a capability, get epic + stories with acceptance criteria and story points","Sprint planner — input capacity, AI fills the sprint from backlog respecting dependencies"],
    agents:[
      {name:"Frontend",what:"The PM workspace — PRD editor, roadmap timeline, feedback dashboard, prioritization matrix, and sprint board.",
       prompt:`Build complete Next.js 14 frontend for ProductPilot. PAGES: /dashboard (PRD count, roadmap progress, sprint health), /prd/new (feature textarea → Generate → streaming editable sections), /prd/[id] (full view, inline editing, comments, version history, export), /roadmap (quarterly timeline with Recharts, dependency arrows, drag to rearrange), /feedback (CSV import, AI-clustered theme cards, sentiment badges, feature ranking), /prioritize (feature list → RICE matrix table + 2x2 quadrant chart, ICE toggle), /stories (capability input → epic + story cards with acceptance criteria, story points), /sprint (capacity slider → AI fills board with story cards, velocity prediction). TypeScript strict, Tailwind, Recharts, React Query. Complete.`},
      {name:"Backend",what:"API for product management data and AI generation.",
       prompt:`FastAPI backend for ProductPilot. Auth (JWT), PRDs CRUD + POST /generate (SSE), Roadmap CRUD + POST /generate (SSE), Feedback POST /import + POST /analyze (SSE), Prioritization POST /score (SSE RICE/ICE), Stories POST /generate (SSE), Sprint POST /plan (SSE). SQLAlchemy async, Pydantic v2, SSE, JWT, CORS. Complete.`},
      {name:"AI Product Engine",what:"The PM brain — writes PRDs with PM frameworks (JTBD, RICE, SPIN), clusters feedback, scores features, and plans sprints.",
       prompt:`AI services for ProductPilot. prd_generator.py (Problem Statement, Personas, JTBD, User Stories with Given/When/Then, Technical Notes, Dependencies, Risks, Metrics, Launch Plan — streamed), roadmap_builder.py (prioritize, estimate, dependency-order, timeline JSON), feedback_analyzer.py (semantic clustering, sentiment, feature extraction, impact ranking), prioritization_engine.py (RICE + ICE scoring with justifications, matrix coordinates), story_writer.py (epic decomposition into 3-8 stories with acceptance criteria, edge cases, fibonacci points), sprint_planner.py (capacity-based fill, dependency ordering, velocity prediction, sprint goal). Prompts. Claude streaming. Complete.`},
      {name:"Database",what:"Stores PRDs, roadmaps, feedback, stories, and sprints.",
       prompt:`Database for ProductPilot. Models: User, Team, PRD (sections JSONB), RoadmapItem (dependencies JSONB), Feedback (sentiment, cluster_id), FeatureRequest, Epic, UserStory (acceptance_criteria JSONB, story_points), Sprint (goal, capacity, velocity), SprintItem. Alembic, CRUD, seed. Complete.`},
      {name:"Tests + DevOps",what:"Testing and deployment.",
       prompt:`Tests (Jest + pytest) and DevOps for ProductPilot. Dockerfiles, docker-compose, GitHub Actions, .env.example, README. Complete.`}
    ]
  },
  {id:"csuite",emoji:"👔",label:"C-Suite",color:c.pk,
    project:"ExecView",tagline:"AI Executive Intelligence Platform",
    desc:"Build an executive tool: single-screen KPI dashboard with AI insights, auto-generated board presentations, OKR tracking with health scoring, weekly AI briefings, strategic analysis using business frameworks (SWOT, Porter, TAM), and organizational health monitoring.",
    features:["Executive dashboard — every metric a CEO needs on one screen with AI-generated insights per metric","Board deck generator — select quarter, get 8-10 slides with narratives, charts, and takeaways, export as PDF","OKR tracker — company→team→individual cascade with AI health scoring and corrective action suggestions","Weekly executive briefing — AI compiles numbers, market intel, milestones, and action items every Monday","Strategic analyzer — ask any question, get SWOT/Porter/TAM analysis with visual frameworks","Org health monitor — attrition, satisfaction, hiring velocity by department with AI risk flags"],
    agents:[
      {name:"Frontend",what:"Premium executive interface — data-dense dashboards, slide viewer, OKR tree, and strategy framework visualizations.",
       prompt:`Build complete Next.js 14 frontend for ExecView — executive intelligence. Premium dark theme, data-dense but clean.

PAGES: /dashboard (KPI grid with sparklines, delta arrows, AI tooltips. Period toggles. Summary bar), /board-deck (quarter selector → Generate → slide carousel with narrative, Recharts chart, takeaways. Inline edit. PDF export), /okrs (tree view: Company→Team→Individual. Progress bars, health dots, AI recommendations), /briefing (weekly digest cards: Numbers, Market Intel, Milestones, Action Items. Email send. Archive), /strategy (question input + framework selector: SWOT 2x2 grid / Porter pentagon / TAM concentric circles. Streaming analysis. Compare button), /org-health (department cards with attrition gauge, satisfaction trend, hiring funnel, AI risk flags).

TypeScript strict, Tailwind, Recharts, React Query. Executive aesthetic. Complete.`},
      {name:"Backend",what:"Aggregates data from multiple sources and orchestrates AI generation.",
       prompt:`FastAPI backend for ExecView. Auth (SSO + JWT, roles: CEO/CFO/CTO/VP), Dashboard GET /kpis, Board Deck POST /generate (SSE slides), OKRs CRUD + POST /analyze-health (SSE), Briefing POST /generate-weekly (SSE) + POST /send-email, Strategy POST /analyze (SSE with framework param), Org Health GET /metrics + POST /analyze (SSE). Mock data aggregation layer. Pydantic v2, SQLAlchemy async, SSE, JWT with role guards. Complete.`},
      {name:"AI Executive Engine",what:"Strategic AI brain — board decks, SWOT/Porter/TAM analysis, OKR health scoring, and executive-level insights.",
       prompt:`AI executive services for ExecView. dashboard_commentator.py (trend, rate of change, anomaly flag, 1-sentence insight per KPI), board_deck_generator.py (8-10 slides streamed: Title, Executive Summary, Financial Overview, Product Metrics, Customer Health, Team, Strategic Initiatives, Risks, Next Quarter — each with chart_config JSON), okr_analyzer.py (on-track/at-risk/behind scoring, corrective actions), briefing_generator.py (weekly: Numbers, Market Intel, Competitor Watch, Milestones, Attention Required), strategy_engine.py (SWOT with reasoning, Porter scored 1-5, TAM/SAM/SOM sizing — structured JSON for visualization), org_health_analyzer.py (department attrition, satisfaction, hiring, risk flags). Prompts with executive analyst persona. Claude streaming. Complete.`},
      {name:"Database",what:"Stores KPIs, board decks, OKRs, briefings, and strategy analyses.",
       prompt:`Database for ExecView. Models: User (role enum), Organization, KPISnapshot, BoardDeck (slides JSONB), OKR (level, parent_id, target/current values, status), Briefing (content JSONB, sent_at), StrategyAnalysis (framework, analysis JSONB), OrgMetric (department, type, value). Alembic, CRUD, seed with 12 months data + sample OKRs + 2 board decks. Complete.`},
      {name:"Tests + DevOps",what:"Testing and deployment.",
       prompt:`Tests (Jest + pytest) and DevOps for ExecView. Dockerfiles, docker-compose, GitHub Actions, .env.example, README. Complete.`}
    ]
  },
];

/* ── GOOGLE SHEETS WEBHOOK ── */
const GOOGLE_SHEET_WEBHOOK = "https://script.google.com/macros/s/AKfycbwUdofpRuIukv_SueDbDOA-2Xw9mc86KjZZSImLoBQdKRtxxSeaDzDObaNTro_VU0wKeg/exec";

/* ── MAIN APP ── */
export default function App(){
  const[role,setRole]=useState<string|null>(null);
  const[phase,setPhase]=useState<"signup"|"home"|"learn"|"build">("signup");
  const[learnTab,setLearnTab]=useState(0);
  const[buildTab,setBuildTab]=useState(0);
  const[expandedAgent,setExpandedAgent]=useState<number|null>(null);
  const[done,setDone]=useState<Record<string,boolean>>({});
  const[signupName,setSignupName]=useState("");
  const[signupEmail,setSignupEmail]=useState("");
  const[signupRole,setSignupRole]=useState("");
  const[signupSubmitting,setSignupSubmitting]=useState(false);
  const[signupError,setSignupError]=useState("");
  const topRef=useRef<HTMLDivElement>(null);

  const ri=roles.find(r=>r.id===role);
  useEffect(()=>{topRef.current?.scrollIntoView({behavior:"smooth"})},[phase,learnTab,buildTab]);

  const selectRole=(id:string)=>{setRole(id);setPhase("learn");setLearnTab(0);};
  const goHome=()=>{setPhase("home");setRole(null);setLearnTab(0);setBuildTab(0);setExpandedAgent(null);};

  const handleSignup=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!signupName.trim()||!signupEmail.trim()){setSignupError("Please fill in your name and email.");return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)){setSignupError("Please enter a valid email address.");return;}
    setSignupError("");
    setSignupSubmitting(true);
    try{
      if(GOOGLE_SHEET_WEBHOOK){
        await fetch(GOOGLE_SHEET_WEBHOOK,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({name:signupName.trim(),email:signupEmail.trim(),role:signupRole||"Not selected",timestamp:new Date().toISOString()})
        });
      }
      setPhase("home");
    }catch{
      setPhase("home");
    }finally{setSignupSubmitting(false);}
  };

  /* ── SIGNUP PAGE ── */
  if(phase==="signup") return(
    <div ref={topRef} className="min-h-screen flex flex-col" style={{background:c.bg,color:c.t1,fontFamily:"system-ui,sans-serif"}}>
      {/* Header */}
      <header className="py-6 text-center" style={{borderBottom:"1px solid "+c.border}}>
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{background:c.bg3,border:"1px solid "+c.border}}>🎼</div>
          <span className="text-base font-bold" style={{color:c.t1}}>Conductor Masterclass</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-block mb-4 px-3 py-1 rounded-full text-xs" style={{border:"1px solid "+c.border,background:c.bg2,color:c.t4}}>Zocket · Internal Learning</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{lineHeight:1.15}}>Learn to build AI products<br/><span style={{color:c.acc}}>without writing code.</span></h1>
            <p className="text-sm max-w-md mx-auto leading-relaxed" style={{color:c.t4}}>A hands-on masterclass on Conductor — the Mac app that runs a team of AI coding agents. Go from zero to a deployed product in one afternoon.</p>
          </div>

          {/* What you get */}
          <div className="grid grid-cols-3 gap-2.5 mb-8">
            {([["🤖","5+ AI agents","working in parallel"],["📋","Step-by-step","copy-paste prompts"],["🚀","Deploy live","in hours, not weeks"]] as const).map(([em,t,d],i)=>(
              <div key={i} className="text-center rounded-xl p-3.5" style={{background:c.bg2,border:"1px solid "+c.border}}>
                <span className="text-xl">{em}</span>
                <p className="text-xs font-semibold mt-1.5" style={{color:c.t1}}>{t}</p>
                <p className="text-xs mt-0.5" style={{color:c.t5}}>{d}</p>
              </div>
            ))}
          </div>

          {/* Signup form */}
          <form onSubmit={handleSignup} className="rounded-2xl p-6 sm:p-8" style={{background:c.bg2,border:"1px solid "+c.border}}>
            <p className="text-base font-bold mb-1" style={{color:c.t1}}>Get started</p>
            <p className="text-xs mb-6" style={{color:c.t4}}>Enter your details to access the masterclass</p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{color:c.t3}}>Full name</label>
                <input type="text" value={signupName} onChange={e=>setSignupName(e.target.value)} placeholder="Jane Smith" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition" style={{background:c.bg,border:"1px solid "+c.border,color:c.t1}} onFocus={e=>e.currentTarget.style.borderColor=c.acc} onBlur={e=>e.currentTarget.style.borderColor=c.border}/>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{color:c.t3}}>Email address</label>
                <input type="email" value={signupEmail} onChange={e=>setSignupEmail(e.target.value)} placeholder="jane@company.com" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition" style={{background:c.bg,border:"1px solid "+c.border,color:c.t1}} onFocus={e=>e.currentTarget.style.borderColor=c.acc} onBlur={e=>e.currentTarget.style.borderColor=c.border}/>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{color:c.t3}}>Your role <span style={{color:c.t5}}>(optional)</span></label>
                <select value={signupRole} onChange={e=>setSignupRole(e.target.value)} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none cursor-pointer" style={{background:c.bg,border:"1px solid "+c.border,color:signupRole?c.t1:c.t5}}>
                  <option value="">Select your role...</option>
                  {roles.map(r=><option key={r.id} value={r.label}>{r.emoji} {r.label}</option>)}
                </select>
              </div>

              {signupError&&<p className="text-xs" style={{color:c.rd}}>{signupError}</p>}

              <button type="submit" disabled={signupSubmitting} className="w-full py-3 rounded-lg text-sm font-bold transition hover:opacity-90 disabled:opacity-50 mt-2" style={{background:c.acc,color:c.bg}}>
                {signupSubmitting?"Signing up...":"Get Started"}
              </button>
            </div>

            <p className="text-center text-xs mt-4" style={{color:c.t5}}>Instant access after sign-in.</p>
          </form>

          {/* Social proof / info */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {([["💻","Mac app"],["⏱️","~3 hours"],["🧠","No code needed"]] as const).map(([em,t],i)=>(
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-sm">{em}</span>
                <span className="text-xs" style={{color:c.t5}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="py-6 text-center" style={{borderTop:"1px solid "+c.border}}>
        <p className="text-xs" style={{color:c.t5}}>© 2026 Zocket · Powered by Conductor</p>
      </footer>
    </div>
  );

  /* ── NAV ── */
  const Nav=()=>(
    <header className="sticky top-0 z-50" style={{background:"rgba(9,9,11,0.92)",backdropFilter:"blur(16px)",borderBottom:"1px solid "+c.border}}>
      <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {phase!=="home"&&<button onClick={goHome} className="text-xs hover:opacity-70 transition mr-1" style={{color:c.t4}}>← Home</button>}
          <button onClick={goHome} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{background:c.bg3,border:"1px solid "+c.border}}>🎼</div>
            <span className="text-sm font-semibold" style={{color:c.t1}}>Conductor Masterclass</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {ri&&<>
            <button onClick={()=>{setPhase("learn");setLearnTab(0)}} className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-80" style={{background:phase==="learn"?dim(ri.color):"transparent",color:phase==="learn"?ri.color:c.t4}}>Learn</button>
            <button onClick={()=>{setPhase("build");setBuildTab(0)}} className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-80" style={{background:phase==="build"?dim(ri.color):"transparent",color:phase==="build"?ri.color:c.t4}}>Build</button>
            <div className="ml-2 text-xs px-3 py-1.5 rounded-lg" style={{background:dim(ri.color),border:"1px solid "+bdr(ri.color),color:ri.color}}>{ri.emoji} {ri.label}</div>
          </>}
        </div>
      </div>
    </header>
  );

  /* ── HOME ── */
  if(phase==="home") return(
    <div ref={topRef} className="min-h-screen" style={{background:c.bg,color:c.t1,fontFamily:"system-ui,sans-serif"}}>
      <Nav/>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{background:"radial-gradient(ellipse at 50% 0%,rgba(52,211,153,0.08) 0%,transparent 60%)"}}/>
        <div className="max-w-3xl mx-auto text-center px-5 pt-20 pb-16 relative">
          <div className="inline-block mb-6 px-3 py-1 rounded-full text-xs" style={{border:"1px solid "+c.border,background:c.bg2,color:c.t4}}>Zocket · Internal Learning · Powered by Conductor</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5" style={{lineHeight:1.1}}>Build full AI products<br/><span style={{color:c.acc}}>without writing code.</span></h1>
          <p className="text-lg max-w-xl mx-auto mb-4 leading-relaxed" style={{color:c.t4}}>Conductor runs a team of AI coding agents on your Mac. You copy-paste prompts, review the output, and deploy. That&apos;s it.</p>
          <p className="text-sm max-w-md mx-auto mb-10" style={{color:c.t5}}>No coding experience required. Personalized for your role.</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-5 pb-10">
        <p className="text-center text-sm font-semibold mb-2" style={{color:c.t1}}>Select your role to start</p>
        <p className="text-center text-xs mb-8" style={{color:c.t4}}>Each role gets a tailored learning path and a custom AI product to build</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {roles.map(r=>(<button key={r.id} onClick={()=>selectRole(r.id)} className="group text-left rounded-xl p-5 transition-all hover:scale-[1.02]" style={{background:dim(r.color),border:"1px solid "+bdr(r.color)}}>
            <span className="text-2xl">{r.emoji}</span>
            <p className="text-sm font-bold mt-2 mb-1" style={{color:r.color}}>{r.label}</p>
            <p className="text-xs" style={{color:c.t3}}>Build: {r.project}</p>
            <p className="text-xs mt-2 opacity-0 group-hover:opacity-100 transition" style={{color:r.color}}>Start →</p>
          </button>))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 pb-10">
        <H2>How It Works — 5 Steps, No Code</H2>
        {(["Pick your role above — you get a personalized learning path and a full AI product to build",
          "Learn the basics — we explain Conductor, GitHub, and every concept in plain English",
          "Copy prompts — each building block has a ready-to-paste prompt for a Conductor agent",
          "Paste into Conductor — press ⌘+N, paste the prompt, press Enter. The AI builds it.",
          "Review, merge, deploy — approve the AI's work, merge it, and it's live on the internet"
        ]).map((t,i)=>(
          <div key={i} className="flex items-start gap-3 mb-2">
            <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{background:c.accD,border:"1px solid "+c.accB,color:c.acc}}>{i+1}</span>
            <p className="text-sm py-1" style={{color:c.t3}}>{t}</p>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-5 pb-10">
        <H2>What You&apos;ll Learn</H2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            ["🎼","What Conductor is","How it runs multiple AI agents in parallel on your Mac"],
            ["📖","Core concepts","Repos, PRs, diffs, merging, localhost, deploy — all explained simply"],
            ["⌨️","Keyboard shortcuts","Every shortcut you need, with what each one does"],
            ["📄","CLAUDE.md","How to set rules so all AI agents produce consistent, compatible code"],
            ["🔧","Troubleshooting","Ready-to-paste fixes for every common problem"],
            ["💡","Pro tips","Writing better prompts, using MCP integrations, extending your project"],
            ["🤖","Building with agents","Step-by-step prompts for each piece of your product"],
            ["🚀","Deploy to the internet","Hosting with Vercel and automatic updates"]
          ] as const).map(([emoji,title,desc],i)=>(
            <div key={i} className="flex gap-3 rounded-xl p-4" style={{background:c.bg2,border:"1px solid "+c.border}}>
              <span className="text-lg flex-shrink-0">{emoji}</span>
              <div><p className="text-sm font-semibold" style={{color:c.t1}}>{title}</p><p className="text-xs mt-0.5" style={{color:c.t4}}>{desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 pb-20">
        <H2>What You Need</H2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            ["💻","A Mac","Conductor runs natively on macOS"],
            ["🧠","Claude Pro/Max","$20-100/mo — powers the AI agents"],
            ["⏱️","~3 hours","From zero to a deployed product"]
          ] as const).map(([emoji,title,desc],i)=>(
            <div key={i} className="rounded-xl p-4 text-center" style={{background:c.bg2,border:"1px solid "+c.border}}>
              <span className="text-2xl">{emoji}</span>
              <p className="text-sm font-semibold mt-2" style={{color:c.t1}}>{title}</p>
              <p className="text-xs mt-1" style={{color:c.t4}}>{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs mt-4" style={{color:c.t5}}>No coding experience required. No prior technical knowledge needed.</p>
      </div>

      <footer className="py-8 text-center" style={{borderTop:"1px solid "+c.border}}><p className="text-xs" style={{color:c.t5}}>© 2026 Zocket · Powered by Conductor · conductor.build</p></footer>
    </div>
  );

  if(!ri) return null;
  const col=ri.color;

  /* ── LEARN PHASE ── */
  const learnSections=[
    {title:"What is Conductor?",icon:"🎼"},
    {title:"Key Concepts",icon:"📖"},
    {title:"Set Up Conductor",icon:"⚙️"},
    {title:"CLAUDE.md Explained",icon:"📄"},
    {title:"Shortcuts & Commands",icon:"⌨️"},
    {title:"Troubleshooting",icon:"🔧"},
    {title:"Pro Tips",icon:"💡"},
    {title:"Your Product Overview",icon:ri.emoji},
  ];

  /* ── BUILD PHASE ── */
  const buildSections=[
    {title:"Create Your Project",icon:"📁"},
    {title:"Set Up CLAUDE.md",icon:"📄"},
    ...ri.agents.map((a,i)=>({title:`Agent ${i+1}: ${a.name}`,icon:"🤖"})),
    {title:"Progress Checklist",icon:"📋"},
    {title:"Merge & Review",icon:"✅"},
    {title:"Fix Issues",icon:"🔧"},
    {title:"Run & Deploy",icon:"🚀"},
    {title:"What's Next",icon:"🌟"},
  ];

  const TabBar=({tabs,active,set}:{tabs:{title:string;icon:string}[];active:number;set:(n:number)=>void})=>(
    <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      {tabs.map((t,i)=>(
        <button key={i} onClick={()=>set(i)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap" style={{background:i===active?dim(col):"transparent",border:"1px solid "+(i===active?bdr(col):"transparent"),color:i===active?col:c.t4}}>
          <span>{t.icon}</span>{t.title}
        </button>
      ))}
    </div>
  );

  return(
    <div ref={topRef} className="min-h-screen" style={{background:c.bg,color:c.t1,fontFamily:"system-ui,sans-serif"}}>
      <Nav/>
      <div className="max-w-3xl mx-auto px-5 py-8">

{/* ══════ LEARN PHASE ══════ */}
{phase==="learn"&&<>
  <TabBar tabs={learnSections} active={learnTab} set={setLearnTab}/>

  {learnTab===0&&<>
    <Bx emoji="🎼" title="Conductor = A team of AI coders on your Mac" col={col}>
      <p>Imagine having 5 brilliant programmers, each at their own desk, working simultaneously on different parts of your project. You give them instructions in plain English, they write all the code, and you review their work before approving it. <B>That&apos;s Conductor.</B></p>
      <p className="mt-2">You don&apos;t write any code. You copy-paste prompts from this guide, and the AI agents do everything.</p>
    </Bx>

    <H2>Your entire workflow</H2>
    {(["Open Conductor on your Mac and press ⌘+N (Command+N) to create a new workspace — this is like hiring one AI worker",
      "A text box appears at the bottom — this is where you give instructions in plain English",
      "Copy a prompt from this guide and paste it in. Press Enter. The AI starts building immediately.",
      "Watch the AI work in real-time — you'll see it creating files and writing code (you don't need to understand the code)",
      "When it's done, press ⌘+D to see what changed (green = new code), and ⌘+⇧+P to submit the work",
      "Repeat for each agent. They all work at the same time! Then merge their work together on GitHub."
    ]).map((t,i)=>(
      <div key={i} className="flex items-start gap-3 mb-2.5">
        <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>{i+1}</span>
        <p className="text-sm py-1 leading-relaxed" style={{color:c.t3}}>{t}</p>
      </div>
    ))}

    <Tip title="Why is this so powerful?" col={col}><p>Without Conductor, a single AI builds one thing at a time. A project that has 5 parts takes 5x longer. With Conductor, 5 agents build 5 parts simultaneously — what takes weeks happens in hours. And you never write a single line of code.</p></Tip>

    <div className="flex justify-end mt-6"><button onClick={()=>setLearnTab(1)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: Key Concepts →</button></div>
  </>}

  {learnTab===1&&<>
    <P>Every term you&apos;ll encounter, explained simply. Come back to this tab whenever you&apos;re confused.</P>

    {([["Workspace","Where one AI agent works. Press ⌘+N to create one. Each gets a US city name (like Sacramento). Think of it as a separate desk — each agent has their own space and can't mess up another's work."],
    ["Repository (Repo)","Your project folder on GitHub — like a Google Drive folder for code. It stores all files and tracks every change ever made. You'll create one for your project."],
    ["CLAUDE.md","A text file with rules that every AI agent reads before working. Like an employee handbook — coding style, project structure, what tools to use. Without it, agents guess randomly. With it, they follow YOUR rules."],
    ["Diff (⌘+D)","The 'Track Changes' view showing what an agent modified. Green lines = added. Red lines = removed. This is how you review AI work before approving it."],
    ["Pull Request / PR (⌘+⇧+P)","A formal submission of an agent's work. Like an employee turning in their finished assignment for your approval. You create one per workspace."],
    ["Merge","Approving a PR and combining it into the main project. Like clicking 'Accept All Changes' in a Word document."],
    ["Localhost","Your app running privately on your computer. The address localhost:3000 means 'this computer, door 3000.' Only you can see it — it's not on the internet yet."],
    ["Deploy","Putting your app on the internet so anyone can access it. We use Vercel — it auto-updates when you merge code."],
    ["MCP","Model Context Protocol — lets AI agents connect to Slack, Meta Ads, Figma, Linear, databases. Like USB-C for AI — one connector for everything."],
    [".env File","A secret file storing API keys (passwords for services). Never gets uploaded to GitHub. Each person has their own copy."]
    ] as const).map(([t,d],i)=>(
      <Collapse key={i} title={t}><p>{d}</p></Collapse>
    ))}

    <div className="flex justify-between mt-6">
      <button onClick={()=>setLearnTab(0)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>setLearnTab(2)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: Set Up Conductor →</button>
    </div>
  </>}

  {learnTab===2&&<>
    <Bx emoji="⚙️" title="One-time setup — about 10 minutes" col={col}>
      <p>You only do this once. After setup, building any project is just copy-paste prompts.</p>
    </Bx>

    <Step n={1} title="Get a Claude subscription">
      <P>Go to <B>claude.ai</B> → Sign up → Subscribe to <B>Claude Pro</B> or <B>Claude Max</B>. This powers the AI agents. Claude is the engine behind Conductor.</P>
    </Step>

    <Step n={2} title="Create a GitHub account">
      <P>Go to <B>github.com</B> → Click &quot;Sign up&quot; (if you don&apos;t have an account) → Pick a username, enter email, set password → Verify your email. This is where your project code lives online.</P>
    </Step>

    <Step n={3} title="Install Conductor">
      <P>Go to <B>conductor.build</B> → Click the download button → Open the .dmg file → Drag Conductor to Applications → Open it.</P>
      <P>When it launches, click <B>&quot;Sign in with GitHub&quot;</B> → Authorize in your browser → Done!</P>
    </Step>

    <Step n={4} title="Install required tools">
      <P>Conductor needs a few tools on your Mac. Open the <B>Terminal</B> app (press ⌘+Space, type &quot;Terminal&quot;, press Enter) and paste these one at a time:</P>
      <Prompt label="Install Homebrew (Mac's tool installer)" text={`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`} what="Homebrew lets you install developer tools with one command. It'll ask for your Mac password (you won't see characters — that's normal). Wait 2-5 minutes."/>
      <Prompt label="Install Node.js and Git" text={`brew install node git`} what="Node.js runs the frontend of your app. Git tracks code changes and is required by Conductor."/>
      <Prompt label="Install GitHub CLI and sign in" text={`brew install gh && gh auth login`} what="GitHub CLI lets Conductor talk to GitHub. Choose: GitHub.com → HTTPS → Yes → Login with browser."/>
      <Tip title="This is the only time you'll use Terminal" col={c.am}><p>After this setup, everything else is done through Conductor by pasting prompts. These 3 commands install the foundations that Conductor needs to work.</p></Tip>
    </Step>

    <div className="flex justify-between mt-6">
      <button onClick={()=>setLearnTab(1)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>setLearnTab(3)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: CLAUDE.md →</button>
    </div>
  </>}

  {learnTab===3&&<>
    <Bx emoji="📄" title="CLAUDE.md = Your AI team's rulebook" col={col}>
      <p>Every time you create a workspace (⌘+N), the AI agent reads a file called <B>CLAUDE.md</B> in your project before starting. It&apos;s like onboarding a new employee — they read the company handbook first.</p>
    </Bx>

    <P><B>Without CLAUDE.md:</B> Each agent makes random choices — one uses JavaScript, another TypeScript, one puts files in /src, another in /app. The code won&apos;t fit together.</P>
    <P><B>With CLAUDE.md:</B> Every agent follows the same rules — same language, same file structure, same coding style. All their work fits together perfectly.</P>

    <Collapse title="What goes in CLAUDE.md?" defaultOpen>
      <p className="mb-2"><B>Project description</B> — What this project is and what technology it uses</p>
      <p className="mb-2"><B>Folder structure</B> — Where files go (frontend here, backend there)</p>
      <p className="mb-2"><B>Commands</B> — How to start the app, run tests, etc.</p>
      <p className="mb-2"><B>Code rules</B> — Use TypeScript, use Tailwind CSS, never hardcode secrets, etc.</p>
    </Collapse>

    <Collapse title="Where does it live?">
      <p>In the root (top-level folder) of your project. If your project is called &quot;financeiq&quot;, the file path is <code style={{color:c.acc}}>financeiq/CLAUDE.md</code>. The filename must be exactly CLAUDE.md — capital letters matter.</p>
    </Collapse>

    <Collapse title="How do you create it?">
      <p>You don&apos;t create it manually! In the Build phase, you&apos;ll paste a prompt into Conductor that tells an agent to create it for you. One copy-paste and it&apos;s done.</p>
    </Collapse>

    <Tip title="You'll create yours in the Build phase" col={col}><p>Don&apos;t worry about writing one now. When you move to the Build tab, Step 2 gives you a ready-to-paste prompt that creates the perfect CLAUDE.md for your specific project.</p></Tip>

    <div className="flex justify-between mt-6">
      <button onClick={()=>setLearnTab(2)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>setLearnTab(4)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: Your Product →</button>
    </div>
  </>}

  {/* ── Shortcuts & Commands ── */}
  {learnTab===4&&<>
    <Bx emoji="⌨️" title="Every Conductor shortcut you need" col={col}>
      <p>Conductor is designed to be used with keyboard shortcuts. Here&apos;s every shortcut you&apos;ll use, explained simply.</p>
    </Bx>

    <H2>Essential shortcuts (you&apos;ll use these constantly)</H2>
    <KbdShortcut keys="⌘+N" desc="Create a new workspace — like hiring a new AI worker"/>
    <KbdShortcut keys="⌘+D" desc="View the diff — see what the agent changed (green = added, red = removed)"/>
    <KbdShortcut keys="⌘+⇧+P" desc="Create a Pull Request — submit the agent's work for review"/>
    <KbdShortcut keys="⌘+Enter" desc="Send your message — after typing a prompt, this sends it to the agent"/>

    <H2>Navigation shortcuts</H2>
    <KbdShortcut keys="⌘+1, ⌘+2..." desc="Switch between workspace tabs — jump to a specific agent"/>
    <KbdShortcut keys="⌘+W" desc="Close current workspace tab"/>
    <KbdShortcut keys="⌘+," desc="Open Conductor settings"/>

    <H2>Helpful extras</H2>
    <KbdShortcut keys="⌘+K" desc="Command palette — search for any action"/>
    <KbdShortcut keys="⌘+." desc="Stop the current agent — if it's going in the wrong direction"/>
    <KbdShortcut keys="⌘+L" desc="Clear the chat — start fresh in the current workspace"/>

    <Tip title="Don't memorize — just remember ⌘+N and ⌘+⇧+P" col={col}>
      <p>For this masterclass, you really only need two shortcuts: ⌘+N to create a workspace and ⌘+⇧+P to submit the work. Everything else you can click in the UI.</p>
    </Tip>

    <div className="flex justify-between mt-6">
      <button onClick={()=>setLearnTab(3)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>setLearnTab(5)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: Troubleshooting →</button>
    </div>
  </>}

  {/* ── Troubleshooting ── */}
  {learnTab===5&&<>
    <Bx emoji="🔧" title="Common issues and how to fix them" col={col}>
      <p>Things will occasionally go wrong — that&apos;s normal! Here&apos;s how to handle every common situation you might encounter.</p>
    </Bx>

    <Collapse title='Agent says "I encountered an error"' defaultOpen>
      <p className="mb-2"><B>What happened:</B> The AI ran into a problem while building. This is common and usually easy to fix.</p>
      <p className="mb-2"><B>Fix:</B> Just type in the chat: <span style={{color:c.acc}}>&quot;Please fix the errors and try again&quot;</span> — the agent will read the error, understand it, and fix it automatically.</p>
      <p><B>If it keeps failing:</B> Type: <span style={{color:c.acc}}>&quot;Show me the error message&quot;</span> — then you can share it for help.</p>
    </Collapse>

    <Collapse title="Agent seems stuck or frozen">
      <p className="mb-2"><B>What happened:</B> The agent might be doing heavy work, or it may have stalled.</p>
      <p className="mb-2"><B>Fix:</B> Wait 2-3 minutes first — some tasks take time. If still stuck, press <B>⌘+.</B> (Command+Period) to stop it, then type: <span style={{color:c.acc}}>&quot;Continue where you left off and complete the remaining work&quot;</span></p>
    </Collapse>

    <Collapse title="Two agents created conflicting files">
      <p className="mb-2"><B>What happened:</B> Two agents tried to edit the same file differently. This creates a &quot;merge conflict.&quot;</p>
      <p className="mb-2"><B>Fix:</B> After merging the first PR, create a new workspace (⌘+N) and paste: <span style={{color:c.acc}}>&quot;Pull the latest code from main. There are merge conflicts in [the second PR]. Please resolve them keeping both sets of changes, then push.&quot;</span></p>
    </Collapse>

    <Collapse title='"npm install" or "pip install" fails'>
      <p className="mb-2"><B>What happened:</B> A package (library) couldn&apos;t be downloaded or installed.</p>
      <p className="mb-2"><B>Fix:</B> Create a workspace and paste: <span style={{color:c.acc}}>&quot;Run npm install in the frontend directory. If any packages fail, find alternatives and update the code to use them. Then verify the app starts without errors.&quot;</span></p>
    </Collapse>

    <Collapse title="App shows a blank white page">
      <p className="mb-2"><B>What happened:</B> There&apos;s likely a JavaScript error preventing the page from loading.</p>
      <p className="mb-2"><B>Fix:</B> Create a workspace and paste: <span style={{color:c.acc}}>&quot;The app is showing a blank page at localhost:3000. Check the browser console errors and Next.js server logs. Fix any issues and verify the page loads correctly.&quot;</span></p>
    </Collapse>

    <Collapse title="Can't connect to the database">
      <p className="mb-2"><B>What happened:</B> PostgreSQL isn&apos;t running, or the connection details are wrong.</p>
      <p className="mb-2"><B>Fix:</B> Create a workspace and paste: <span style={{color:c.acc}}>&quot;Check if PostgreSQL is running. If not, install it with brew install postgresql@16 and start it. Then verify the DATABASE_URL in .env is correct and run alembic upgrade head to set up the tables.&quot;</span></p>
    </Collapse>

    <Collapse title="Agent created incomplete files with TODO comments">
      <p className="mb-2"><B>What happened:</B> The AI ran out of context or took a shortcut.</p>
      <p className="mb-2"><B>Fix:</B> In the same workspace, paste: <span style={{color:c.acc}}>&quot;Search all files for TODO, FIXME, placeholder, and 'not implemented'. Replace every instance with complete, working code. No shortcuts.&quot;</span></p>
    </Collapse>

    <Collapse title="Vercel deploy fails">
      <p className="mb-2"><B>What happened:</B> The code compiles locally but fails on Vercel&apos;s servers.</p>
      <p className="mb-2"><B>Fix:</B> Create a workspace and paste: <span style={{color:c.acc}}>&quot;The Vercel deploy is failing. Run 'npm run build' locally in the frontend folder, fix any TypeScript or build errors, and push the fixes.&quot;</span></p>
    </Collapse>

    <Tip title="The golden rule of troubleshooting" col={c.am}>
      <p>When in doubt, create a new workspace (⌘+N) and describe the problem in plain English. The AI agent is excellent at diagnosing and fixing issues. You don&apos;t need to understand the technical details — just describe what you expected vs. what happened.</p>
    </Tip>

    <div className="flex justify-between mt-6">
      <button onClick={()=>setLearnTab(4)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>setLearnTab(6)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: Pro Tips →</button>
    </div>
  </>}

  {/* ── Pro Tips ── */}
  {learnTab===6&&<>
    <Bx emoji="💡" title="Level up your Conductor skills" col={col}>
      <p>Once you&apos;re comfortable with the basics, these tips will make you much faster and more effective.</p>
    </Bx>

    <H2>Writing better prompts</H2>
    <Collapse title="Be specific about what you want" defaultOpen>
      <p className="mb-2"><B>Vague prompt:</B> <span style={{color:c.rd}}>&quot;Make a dashboard&quot;</span></p>
      <p className="mb-2"><B>Great prompt:</B> <span style={{color:c.acc}}>&quot;Build a dashboard page at /dashboard with 6 KPI cards showing MRR, ARR, Burn Rate, Runway, CAC, and LTV. Each card should have the value, a sparkline chart, and a green/red delta arrow. Use Recharts for the charts and Tailwind CSS.&quot;</span></p>
      <p>The more detail you give, the better the result. Mention: pages, components, layout, data, libraries, and style.</p>
    </Collapse>

    <Collapse title="Reference existing files">
      <p className="mb-2">Agents can read your project. Tell them: <span style={{color:c.acc}}>&quot;Look at the existing KPICard component in /frontend/src/components/KPICard.tsx and create a similar one for alerts&quot;</span></p>
      <p>This ensures consistency — the new component will match the existing style and patterns.</p>
    </Collapse>

    <Collapse title="Ask for iterations, not perfection">
      <p className="mb-2">Don&apos;t try to get everything perfect in one prompt. Build in layers:</p>
      <p className="mb-1">1. First prompt: Build the basic page with layout and data</p>
      <p className="mb-1">2. Second prompt: &quot;Add animations, loading states, and error handling&quot;</p>
      <p className="mb-1">3. Third prompt: &quot;Make it mobile responsive and add dark/light theme toggle&quot;</p>
      <p>Each iteration refines the previous work. This is faster and produces better results.</p>
    </Collapse>

    <H2>Working with multiple agents</H2>
    <Collapse title="Let agents work in parallel — don't wait">
      <p>After pasting a prompt, immediately create another workspace (⌘+N) and paste the next prompt. Conductor runs them simultaneously. 5 agents working in parallel = 5x faster than sequential. You&apos;ll see all workspace tabs at the top — click between them to check progress.</p>
    </Collapse>

    <Collapse title="Use conductor.json for automation">
      <p className="mb-2"><B>conductor.json</B> is a configuration file that tells Conductor how to set up each workspace automatically. It can run install commands, start servers, and set environment variables without you doing anything.</p>
      <p>We create this in the Build phase — but you can customize it later to add more setup automation.</p>
    </Collapse>

    <H2>Extending your project later</H2>
    <Collapse title="Add new features anytime">
      <p className="mb-2">Your project is never &quot;finished.&quot; Want to add a new page? Create a workspace, describe what you want, and the agent builds it using the existing code as context.</p>
      <p className="mb-2">Example: <span style={{color:c.acc}}>&quot;Add a /settings page where users can update their profile picture, change their email, and manage notification preferences. Follow the same design patterns as the existing pages.&quot;</span></p>
    </Collapse>

    <Collapse title="Connect external services with MCP">
      <p className="mb-2"><B>MCP (Model Context Protocol)</B> lets agents connect to external tools:</p>
      <p className="mb-1">• <B>Slack MCP</B> — Send notifications, post to channels, get approval workflows</p>
      <p className="mb-1">• <B>GitHub MCP</B> — Create issues, manage repos, automate workflows</p>
      <p className="mb-1">• <B>Linear MCP</B> — Create tasks, track bugs, manage sprints</p>
      <p className="mb-1">• <B>Figma MCP</B> — Read designs and convert them to code</p>
      <p className="mb-1">• <B>Database MCP</B> — Query databases directly from the agent</p>
      <p className="mt-2">To use one, install the MCP server and mention it in your prompt: <span style={{color:c.acc}}>&quot;Use the Slack MCP to send a message to #general when a new report is generated&quot;</span></p>
    </Collapse>

    <Collapse title="Use Conductor for non-coding tasks too">
      <p className="mb-2">Conductor agents can also:</p>
      <p className="mb-1">• Write documentation and READMEs</p>
      <p className="mb-1">• Generate test data and seed scripts</p>
      <p className="mb-1">• Analyze and refactor existing code</p>
      <p className="mb-1">• Set up CI/CD pipelines (GitHub Actions)</p>
      <p className="mb-1">• Debug production issues by reading logs</p>
      <p className="mb-1">• Create database migrations</p>
    </Collapse>

    <div className="flex justify-between mt-6">
      <button onClick={()=>setLearnTab(5)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>setLearnTab(7)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: Your Product →</button>
    </div>
  </>}

  {/* ── Product Overview ── */}
  {learnTab===7&&<>
    <div className="rounded-xl p-5 mb-6" style={{background:dim(col),border:"1px solid "+bdr(col)}}>
      <p className="text-lg font-bold" style={{color:c.t1}}>{ri.emoji} {ri.project} — {ri.tagline}</p>
      <p className="text-sm mt-2 leading-relaxed" style={{color:c.t3}}>{ri.desc}</p>
    </div>

    <H2>What you&apos;ll build — Feature by Feature</H2>
    {ri.features.map((f,i)=>{
      const[icon,...rest]=f.split(" — ");
      return <Collapse key={i} title={icon}><p>{rest.join(" — ")||f}</p></Collapse>;
    })}

    <H2>How it gets built — {ri.agents.length} AI agents working in parallel</H2>
    <P>Each agent below gets its own Conductor workspace. You paste one prompt per agent. All {ri.agents.length} work simultaneously. Total build time: ~2-4 hours instead of weeks.</P>
    {ri.agents.map((a,i)=>(
      <div key={i} className="flex items-center gap-3 rounded-lg px-4 py-3 mb-1.5" style={{background:c.bg3,border:"1px solid "+c.border}}>
        <span className="text-xs font-mono font-bold" style={{color:col}}>#{i+1}</span>
        <span className="text-sm font-semibold" style={{color:c.t1}}>{a.name}</span>
        <span className="text-xs" style={{color:c.t4}}>— {a.what.split('.')[0]}.</span>
      </div>
    ))}

    <div className="flex items-center justify-between mt-8">
      <button onClick={()=>setLearnTab(6)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>{setPhase("build");setBuildTab(0)}} className="px-6 py-3 rounded-xl text-sm font-bold transition hover:scale-[1.02]" style={{background:col,color:c.bg}}>Start Building {ri.project} →</button>
    </div>
  </>}
</>}

{/* ══════ BUILD PHASE ══════ */}
{phase==="build"&&<>
  <TabBar tabs={buildSections} active={buildTab} set={setBuildTab}/>

  {/* ── Step 1: Create Project ── */}
  {buildTab===0&&<>
    <Bx emoji="📁" title={`Create the ${ri.project} project`} col={col}>
      <p>First, you need a GitHub repository — this is the online home for your project&apos;s code. All your AI agents will push their work here.</p>
    </Bx>

    <Step n={1} title="Create the repository on GitHub">
      <P>Go to <B>github.com</B> → Click the green <B>&quot;New&quot;</B> button (top-left) → Name it <B>{ri.project.toLowerCase()}</B> → Check <B>&quot;Add a README file&quot;</B> → Click <B>&quot;Create repository&quot;</B></P>
      <P>Your repo is now live. Copy the URL — it looks like: <code style={{color:c.acc}}>https://github.com/YOURUSERNAME/{ri.project.toLowerCase()}</code></P>
    </Step>

    <Step n={2} title="Add it to Conductor">
      <P>Open <B>Conductor</B> on your Mac → Click <B>&quot;Add Repo&quot;</B> in the sidebar → Paste your GitHub URL → Conductor downloads the project and sets up workspaces.</P>
      <P>You&apos;ll see <B>{ri.project.toLowerCase()}</B> appear in your Conductor sidebar. It&apos;s ready!</P>
    </Step>

    <div className="flex justify-end mt-6"><button onClick={()=>setBuildTab(1)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: Set Up CLAUDE.md →</button></div>
  </>}

  {/* ── Step 2: CLAUDE.md ── */}
  {buildTab===1&&<>
    <Bx emoji="📄" title="Create your project's rulebook" col={col}>
      <p>This tells every AI agent how to write code for {ri.project}. Create one workspace to set this up — it takes about 2 minutes.</p>
    </Bx>

    <Step n={1} title="Create a new workspace">
      <P>In Conductor, press <B>⌘+N</B> (Command+N). A new tab appears with a city name — that&apos;s your workspace.</P>
    </Step>

    <Step n={2} title="Paste this prompt and press Enter">
      <Prompt label={`Create CLAUDE.md for ${ri.project}`} what={`This tells the agent to create the CLAUDE.md rulebook file and a conductor.json setup file. Every future agent will read these rules before starting work.`} text={`Create a CLAUDE.md file in the root of this project with the following rules, then also create a conductor.json file. Commit and push both files.

CLAUDE.md content:
# CLAUDE.md — ${ri.project} Project Rules

## What This Project Is
${ri.project} is ${ri.desc.split('.')[0].toLowerCase()}.
Built with Next.js 14 frontend (TypeScript + Tailwind CSS) and Python FastAPI backend with PostgreSQL.

## Project Structure
- /frontend — Next.js 14 app (TypeScript + Tailwind CSS)
- /frontend/src/app — Pages
- /frontend/src/components — React components
- /frontend/src/lib — Utilities and API client
- /backend — Python FastAPI server
- /backend/routers — API endpoint files
- /backend/services — Business logic and AI integration
- /backend/models — Database models
- /backend/schemas — Request/response validation
- /backend/prompts — AI prompt text files

## Commands
- Start frontend: cd frontend && npm install && npm run dev
- Start backend: cd backend && pip install -r requirements.txt && uvicorn main:app --reload
- Run tests: cd frontend && npm test / cd backend && pytest

## Code Rules
- TypeScript strict mode — never use 'any'
- Tailwind CSS for ALL styling — no custom CSS
- Recharts for all charts
- React Query for API calls
- Python type hints on every function
- Pydantic v2 for all schemas
- SSE streaming for AI generation endpoints
- NEVER hardcode API keys — use environment variables
- No TODO or placeholder comments — every file must be complete

conductor.json content:
{
  "scripts": {
    "setup": "cd frontend && npm install",
    "start": "cd frontend && npm run dev"
  }
}`}/>
    </Step>

    <Step n={3} title="Wait for it to finish, then create the PR">
      <P>The agent will create both files and push them. When done, press <B>⌘+⇧+P</B> to create a Pull Request.</P>
      <P>Go to <B>github.com</B> → Your repo → <B>Pull requests</B> tab → Click the PR → Click <B>&quot;Merge pull request&quot;</B> → <B>&quot;Confirm merge.&quot;</B></P>
    </Step>

    <Tip title="This is now the foundation" col={col}><p>Every agent you create from now on will read this CLAUDE.md automatically. They&apos;ll all follow the same rules, use the same file structure, and produce compatible code. One setup step ensures everything works together.</p></Tip>

    <div className="flex justify-between mt-6">
      <button onClick={()=>setBuildTab(0)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>setBuildTab(2)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: Agent 1 →</button>
    </div>
  </>}

  {/* ── Agent Steps ── */}
  {buildTab>=2 && buildTab < 2+ri.agents.length && (()=>{
    const ai=buildTab-2;
    const agent=ri.agents[ai];
    return<>
      <Bx emoji="🤖" title={`Agent ${ai+1} of ${ri.agents.length}: ${agent.name}`} col={col}>
        <p><B>What this agent does:</B> {agent.what}</p>
      </Bx>

      <Step n={1} title="Create a new workspace">
        <P>Press <B>⌘+N</B> in Conductor. A new workspace tab appears.</P>
      </Step>

      <Step n={2} title="Copy and paste this prompt">
        <P>Click the <B>&quot;Copy&quot;</B> button below, then paste it into the workspace chat and press Enter.</P>
        <Prompt label={`Agent ${ai+1}: ${agent.name}`} what={`The agent will start building immediately. You'll see real-time output as it creates files. This usually takes 20-60 minutes. You can move on and create the next agent workspace while this one works.`} text={agent.prompt}/>
      </Step>

      <Step n={3} title="Move on — create the next agent while this one works">
        <P>Don&apos;t wait! The magic of Conductor is <B>parallelism</B>. Create the next workspace (⌘+N) and paste the next agent&apos;s prompt. All agents work at the same time.</P>
        {ai<ri.agents.length-1&&<P>When you&apos;re ready, click <B>&quot;Next&quot;</B> below to see Agent {ai+2}&apos;s prompt.</P>}
        {ai===ri.agents.length-1&&<P>This is the last agent! Once all agents finish, click <B>&quot;Next&quot;</B> to learn how to merge and deploy.</P>}
      </Step>

      <div className="flex justify-between mt-6">
        <button onClick={()=>setBuildTab(buildTab-1)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
        <button onClick={()=>setBuildTab(buildTab+1)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>{ai<ri.agents.length-1?`Next: Agent ${ai+2} →`:"Next: Progress Checklist →"}</button>
      </div>
    </>;
  })()}

  {/* ── Progress Tracker ── */}
  {buildTab===2+ri.agents.length&&<>
    <Bx emoji="📋" title="Your build progress" col={col}>
      <p>Use this checklist to track your progress. Check off each step as you complete it.</p>
    </Bx>

    <H2>Setup</H2>
    <Check label="Created GitHub repository" checked={!!done["repo"]} onToggle={()=>setDone(d=>({...d,repo:!d.repo}))}/>
    <Check label="Added repo to Conductor" checked={!!done["addrepo"]} onToggle={()=>setDone(d=>({...d,addrepo:!d.addrepo}))}/>
    <Check label="Created and merged CLAUDE.md" checked={!!done["claude"]} onToggle={()=>setDone(d=>({...d,claude:!d.claude}))}/>

    <H2>Agents</H2>
    {ri.agents.map((a,i)=>(
      <Check key={i} label={`Agent ${i+1}: ${a.name} — workspace created & prompt pasted`} checked={!!done[`agent${i}`]} onToggle={()=>setDone(d=>({...d,[`agent${i}`]:!d[`agent${i}`]}))}/>
    ))}

    <H2>Review & Deploy</H2>
    <Check label="All agents finished" checked={!!done["alldone"]} onToggle={()=>setDone(d=>({...d,alldone:!d.alldone}))}/>
    <Check label="Reviewed all diffs (⌘+D)" checked={!!done["reviewed"]} onToggle={()=>setDone(d=>({...d,reviewed:!d.reviewed}))}/>
    <Check label="Created all PRs (⌘+⇧+P)" checked={!!done["prs"]} onToggle={()=>setDone(d=>({...d,prs:!d.prs}))}/>
    <Check label="Merged all PRs on GitHub" checked={!!done["merged"]} onToggle={()=>setDone(d=>({...d,merged:!d.merged}))}/>
    <Check label="App running locally" checked={!!done["local"]} onToggle={()=>setDone(d=>({...d,local:!d.local}))}/>
    <Check label="Deployed to Vercel" checked={!!done["deployed"]} onToggle={()=>setDone(d=>({...d,deployed:!d.deployed}))}/>

    {Object.values(done).filter(Boolean).length===ri.agents.length+7&&
      <div className="rounded-xl p-5 mt-6 text-center" style={{background:dim(c.acc),border:"1px solid "+c.accB}}>
        <p className="text-lg font-bold" style={{color:c.acc}}>🎉 All steps complete!</p>
        <p className="text-sm mt-1" style={{color:c.t3}}>You&apos;ve built {ri.project} from scratch using Conductor. Amazing work!</p>
      </div>
    }

    <div className="flex justify-between mt-6">
      <button onClick={()=>setBuildTab(buildTab-1)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>setBuildTab(buildTab+1)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: Merge & Review →</button>
    </div>
  </>}

  {/* ── Merge & Review ── */}
  {buildTab===3+ri.agents.length&&<>
    <Bx emoji="✅" title="Review and merge all agents' work" col={col}>
      <p>All {ri.agents.length} agents should be finishing up. Now you&apos;ll review their work and combine it into one complete project.</p>
    </Bx>

    <Step n={1} title="Check each workspace is done">
      <P>Click each workspace tab in Conductor. The agent should show a completion message or be idle. If an agent is still working, wait for it to finish.</P>
      <P>If an agent hit an error, type in its chat: <B>&quot;Please fix the errors and complete the task&quot;</B> — it will retry.</P>
    </Step>

    <Step n={2} title="Review each agent's work (⌘+D)">
      <P>In each workspace, press <B>⌘+D</B> to see the diff — what the agent changed.</P>
      <P><B>Green lines</B> = new code added. <B>Red lines</B> = code removed. You should see mostly green.</P>
      <P>You don&apos;t need to understand the code! Just check: Were files created? Did the agent finish without errors? No &quot;TODO&quot; or &quot;placeholder&quot; mentions?</P>
    </Step>

    <Step n={3} title="Create a Pull Request from each workspace (⌘+⇧+P)">
      <P>In each workspace, press <B>⌘+⇧+P</B> (Command+Shift+P). This uploads the agent&apos;s work to GitHub as a Pull Request.</P>
      <P>Repeat for all {ri.agents.length} workspaces. You&apos;ll have {ri.agents.length} PRs on GitHub.</P>
    </Step>

    <Step n={4} title="Merge PRs on GitHub — in this order">
      <P>Go to <B>github.com</B> → Your repo → <B>Pull requests</B> tab. Merge them in this exact order:</P>
      {ri.agents.map((a,i)=>(
        <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 mb-1.5" style={{background:c.bg3,border:"1px solid "+c.border}}>
          <span className="text-xs font-mono font-bold" style={{color:col}}>{i+1}st</span>
          <span className="text-xs font-semibold" style={{color:c.t1}}>{a.name}</span>
        </div>
      ))}
      <P>For each: Click the PR → Click green <B>&quot;Merge pull request&quot;</B> → <B>&quot;Confirm merge&quot;</B></P>
      <Tip title="Why this order?" col={c.am}><p>Each piece depends on the previous one — the backend needs the database, the frontend needs the backend, tests need everything. Merging in order prevents conflicts.</p></Tip>
    </Step>

    <div className="flex justify-between mt-6">
      <button onClick={()=>setBuildTab(buildTab-1)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>setBuildTab(buildTab+1)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: Fix Issues →</button>
    </div>
  </>}

  {/* ── Fix Issues ── */}
  {buildTab===4+ri.agents.length&&<>
    <Bx emoji="🔧" title="Fix any issues with Conductor" col={col}>
      <p>Sometimes agents produce code that needs tweaks. Here are ready-to-paste prompts for every common situation. Just create a workspace (⌘+N) and paste the relevant one.</p>
    </Bx>

    <H2>After merging — common fixes</H2>
    <Collapse title="Merge conflicts between agents" defaultOpen>
      <P>If GitHub shows &quot;merge conflict&quot; on a PR, it means two agents edited the same file differently.</P>
      <Prompt label="Fix merge conflicts" text={`Pull the latest code from main. There are merge conflicts in this branch. Please resolve all conflicts by keeping both sets of changes integrated properly. Make sure the code compiles and works correctly after resolving. Then push the fixes.`} what="The agent will read both versions, intelligently combine them, and push the fix."/>
    </Collapse>

    <Collapse title="TypeScript errors preventing build">
      <Prompt label="Fix all TypeScript errors" text={`Run "npm run build" in the frontend directory. Fix every TypeScript error. Common issues: missing type annotations, incorrect imports, undefined variables. Fix them all until the build succeeds with zero errors. Push the fixes.`} what="The agent will find and fix every type error until the project compiles cleanly."/>
    </Collapse>

    <Collapse title="Missing or broken imports">
      <Prompt label="Fix import errors" text={`Check all import statements across the project. Fix any broken imports — missing files, wrong paths, circular dependencies. Install any missing npm packages. Verify the app starts without import errors. Push fixes.`} what="Scans all files and fixes any broken references between them."/>
    </Collapse>

    <Collapse title="API endpoints don't connect to frontend">
      <Prompt label="Fix API connection" text={`The frontend and backend aren't communicating properly. Check:
1. The API base URL in the frontend matches the backend port (8000)
2. CORS is configured to allow localhost:3000
3. All API endpoint paths match between frontend fetch calls and backend routes
4. Auth tokens are being passed correctly
Fix all mismatches and verify data flows from backend to frontend. Push fixes.`} what="Ensures the frontend and backend talk to each other correctly."/>
    </Collapse>

    <Collapse title="Database migration issues">
      <Prompt label="Fix database setup" text={`Check the database setup:
1. Ensure PostgreSQL is running
2. Check the DATABASE_URL in .env
3. Run alembic upgrade head — if migrations fail, fix them
4. Run the seed script — if it fails, fix it
5. Verify all tables are created and sample data exists
Push any fixes needed.`} what="Gets the database working with all tables and sample data."/>
    </Collapse>

    <Collapse title="Styling looks broken or inconsistent">
      <Prompt label="Fix styling issues" text={`Review all pages in the frontend. Fix any styling issues:
- Ensure consistent spacing, fonts, and colors across all pages
- Fix responsive design so it works on mobile (375px) and desktop (1440px)
- Ensure dark theme is consistent everywhere
- Fix any overlapping elements or broken layouts
Follow the existing Tailwind CSS patterns. Push fixes.`} what="Makes everything look polished and consistent."/>
    </Collapse>

    <Tip title="The beauty of Conductor" col={col}>
      <p>Every fix is the same workflow: ⌘+N → paste the prompt → agent fixes it → ⌘+⇧+P → merge. No debugging skills required. Just describe the problem and the AI solves it.</p>
    </Tip>

    <div className="flex justify-between mt-6">
      <button onClick={()=>setBuildTab(buildTab-1)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>setBuildTab(buildTab+1)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: Run & Deploy →</button>
    </div>
  </>}

  {/* ── Run & Deploy ── */}
  {buildTab===5+ri.agents.length&&<>
    <Bx emoji="🚀" title={`Launch ${ri.project}`} col={col}>
      <p>Your code is merged on GitHub. Now let&apos;s run it on your Mac and then put it on the internet.</p>
    </Bx>

    <H2>Run it on your Mac</H2>
    <Step n={1} title="Create a new workspace and paste this setup prompt">
      <P>Press <B>⌘+N</B> and paste:</P>
      <Prompt label={`Set up and run ${ri.project}`} what="This agent pulls the merged code, installs everything, sets up the database, adds sample data, and starts the app. It does all the technical setup so you don't have to." text={`Pull the latest code from the main branch. Then set up the entire project:

1. Copy .env.example to .env (I'll add my API keys after)
2. Install all backend dependencies (cd backend && pip install -r requirements.txt)
3. Run database migrations (cd backend && alembic upgrade head)
4. Run the seed script for sample data (cd backend && python seed.py)
5. Install all frontend dependencies (cd frontend && npm install)
6. Start the backend server on port 8000
7. Start the frontend on port 3000
8. Tell me when both servers are running and I can open localhost:3000`}/>
    </Step>

    <Step n={2} title="Add your API key">
      <P>The agent will tell you to add your Anthropic API key. Create a workspace (⌘+N) and paste:</P>
      <Prompt label="Add API key to .env" text={`Open the .env file in the project root. Add my Anthropic API key: ANTHROPIC_API_KEY=sk-ant-PASTE_YOUR_KEY_HERE

Replace sk-ant-PASTE_YOUR_KEY_HERE with my actual key. Save the file.`} what="Your API key is the password that lets the app talk to Claude AI. Get it from console.anthropic.com → API Keys."/>
      <Collapse title="Where do I get an Anthropic API key?">
        <p className="mb-2">1. Go to <B>console.anthropic.com</B></p>
        <p className="mb-2">2. Sign up or log in</p>
        <p className="mb-2">3. Click <B>&quot;API Keys&quot;</B> in the left sidebar</p>
        <p className="mb-2">4. Click <B>&quot;Create Key&quot;</B> → Give it a name like &quot;{ri.project}&quot; → Copy the key</p>
        <p>5. The key starts with <B>sk-ant-</B> — paste the whole thing into the prompt above</p>
      </Collapse>
    </Step>

    <Step n={3} title="Open your app">
      <P>Open your browser (Chrome, Safari, Firefox) and go to:</P>
      <p className="text-lg font-bold my-4 text-center" style={{color:col}}>http://localhost:3000</p>
      <P><B>{ri.project} is running on your Mac!</B> Only you can see it at this address. Everything is working locally.</P>
    </Step>

    <H2>Deploy to the internet (optional)</H2>
    <Step n={4} title="Create a Vercel account">
      <P>1. Go to <B>vercel.com</B> → Click <B>&quot;Sign Up&quot;</B> → Choose <B>&quot;Continue with GitHub&quot;</B></P>
      <P>2. Authorize Vercel to access your GitHub repos</P>
      <P>Vercel is a hosting platform. It takes your code from GitHub and puts it on the internet.</P>
    </Step>

    <Step n={5} title="Deploy your project">
      <P>1. On Vercel dashboard, click <B>&quot;Add New...&quot;</B> → <B>&quot;Project&quot;</B></P>
      <P>2. Find your <B>{ri.project.toLowerCase()}</B> repo → Click <B>&quot;Import&quot;</B></P>
      <P>3. Leave the settings as-is → Click <B>&quot;Deploy&quot;</B></P>
      <P>4. Wait 2-3 minutes — Vercel builds and launches your app</P>
      <P>5. Go to Project Settings → <B>Environment Variables</B> → Add <B>ANTHROPIC_API_KEY</B> with your key</P>
      <P>Your app is now live at <B>{ri.project.toLowerCase()}.vercel.app</B>!</P>
    </Step>

    <Step n={6} title="Automatic updates forever">
      <P>Here&apos;s the magic: from now on, any change you merge on GitHub automatically updates your live site.</P>
      <P>1. Create a Conductor workspace (⌘+N)</P>
      <P>2. Tell the agent what to change in plain English</P>
      <P>3. Review (⌘+D), create PR (⌘+⇧+P), merge on GitHub</P>
      <P>4. Vercel detects the merge and auto-deploys — your live site updates in ~60 seconds</P>
      <Tip title="You now have a professional deployment pipeline" col={c.acc}>
        <p>This is the same workflow used by professional engineering teams at top tech companies. Conductor + GitHub + Vercel = an entire DevOps team, automated.</p>
      </Tip>
    </Step>

    <div className="flex justify-between mt-6">
      <button onClick={()=>setBuildTab(buildTab-1)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
      <button onClick={()=>setBuildTab(buildTab+1)} className="text-xs px-4 py-2 rounded-lg transition hover:opacity-80" style={{background:dim(col),border:"1px solid "+bdr(col),color:col}}>Next: What&apos;s Next →</button>
    </div>
  </>}

  {/* ── What's Next ── */}
  {buildTab===6+ri.agents.length&&<>
    <div className="rounded-xl p-8 text-center mb-8" style={{border:"1px solid "+bdr(col),background:"linear-gradient(135deg,"+dim(col)+","+dim(c.acc2)+")"}}>
      <p className="text-2xl font-extrabold mb-2" style={{color:c.t1}}>{ri.emoji} {ri.project} is complete!</p>
      <p className="text-sm" style={{color:c.t3}}>You just built a full AI-powered product — without writing a single line of code.</p>
    </div>

    <H2>Ideas to make it even better</H2>
    <P>Now that you know the workflow, you can keep improving {ri.project} with more Conductor prompts. Here are ideas:</P>

    <Collapse title="Add user authentication with Google/GitHub login" defaultOpen>
      <Prompt label="Add social login" text={`Add authentication to ${ri.project} with NextAuth.js. Support Google and GitHub login providers. Add a /login page with social login buttons. Protect all other routes — redirect to /login if not authenticated. Show the user's name and avatar in the top navigation bar. Add a logout button. Store user sessions in the database.`} what="Adds real login so multiple people can use the app with their own accounts."/>
    </Collapse>

    <Collapse title="Add email notifications">
      <Prompt label="Add email notifications" text={`Add email notifications to ${ri.project} using Resend (resend.com). Create a /backend/services/email_service.py that sends transactional emails. Add notifications for: welcome email on signup, weekly summary digest, important alerts. Create email templates with the ${ri.project} branding. Add a /settings/notifications page where users can toggle each notification type.`} what="Users get email updates about important events — makes the app feel professional."/>
    </Collapse>

    <Collapse title="Add a mobile-friendly version">
      <Prompt label="Make fully mobile responsive" text={`Make every page in ${ri.project} fully responsive for mobile devices (375px width). Use Tailwind responsive classes. On mobile: sidebar becomes a hamburger menu, tables become card lists, charts resize to fit screen width, modals become full-screen, touch-friendly tap targets (min 44px). Test at 375px, 768px, and 1440px widths.`} what="Makes the app work perfectly on phones and tablets."/>
    </Collapse>

    <Collapse title="Add data export (CSV, PDF)">
      <Prompt label="Add export functionality" text={`Add export functionality to ${ri.project}. On every data table and report, add "Export" buttons for CSV and PDF formats. CSV: use papaparse to generate downloadable CSV files. PDF: use jsPDF to generate formatted PDF reports with the ${ri.project} logo, title, date, and styled tables. Add a /reports page that lists all generated exports.`} what="Lets users download their data as spreadsheets or formatted documents."/>
    </Collapse>

    <Collapse title="Add real-time collaboration">
      <Prompt label="Add real-time features" text={`Add real-time collaboration to ${ri.project}. Use Socket.IO for WebSocket connections. Show who else is online (avatar dots in the top bar). When one user makes a change, all other users see it instantly without refreshing. Add a simple activity feed showing "User X just generated a report" style notifications.`} what="Multiple team members can use the app at the same time and see each other's changes live."/>
    </Collapse>

    <Collapse title="Add an AI chatbot assistant">
      <Prompt label="Add AI chat assistant" text={`Add an AI chat assistant to ${ri.project}. Add a floating chat button (bottom-right corner) that opens a chat panel. The AI can answer questions about the data in the app, explain metrics, suggest actions, and help users navigate. Use Claude API with streaming responses. The AI should have context about the user's data and the app's features. Style it to match the existing dark theme.`} what="A built-in AI helper that answers questions about your data — like having an analyst on call."/>
    </Collapse>

    <H2>Build something completely new</H2>
    <P>You now know the Conductor workflow. You can build <B>any</B> software product:</P>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
      {(["Customer support chatbot","Internal knowledge base","Inventory tracking system","Appointment booking app","Employee onboarding portal","Client project tracker","Automated reporting tool","Team OKR dashboard"]).map((idea,i)=>(
        <div key={i} className="rounded-lg px-4 py-3" style={{background:c.bg3,border:"1px solid "+c.border}}>
          <p className="text-sm" style={{color:c.t3}}>{idea}</p>
        </div>
      ))}
    </div>

    <Tip title="The workflow is always the same" col={col}>
      <p>1. Create a GitHub repo → 2. Add CLAUDE.md with rules → 3. Create Conductor workspaces with prompts → 4. Review, merge, deploy. You can build anything with this pattern. The only limit is your imagination.</p>
    </Tip>

    <div className="rounded-xl p-6 text-center mt-8" style={{background:c.bg2,border:"1px solid "+c.border}}>
      <p className="text-xs mb-2" style={{color:c.t5}}>Zocket Internal · Powered by Conductor</p>
      <p className="text-sm font-semibold" style={{color:c.t1}}>conductor.build</p>
      <p className="text-xs mt-1" style={{color:c.t5}}>Zocket · Powered by Conductor</p>
    </div>

    <div className="flex justify-start mt-6">
      <button onClick={()=>setBuildTab(buildTab-1)} className="text-xs px-4 py-2 rounded-lg" style={{color:c.t4}}>← Previous</button>
    </div>
  </>}
</>}

      </div>
    </div>
  );
}
