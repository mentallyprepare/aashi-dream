# Anushka OS — Claude Code Context

## What This Is
A full-stack personal admissions intelligence platform for one user: **Anushka Navin Kumar**. Single-user, no auth. A command center for tracking grad school applications, IELTS prep, research, SOPs, LORs, scholarships, visas, and careers — with an AI advisor layer on top.

## How to Run
```bash
npm run dev          # starts both servers concurrently
# API  → http://localhost:3000
# App  → http://localhost:5173
```
If node_modules are missing or broken: `npm install` then `npm run dev`.

Make sure `.env` exists:
```
DATABASE_URL=./data/anushka.db
PORT=3000
OPENAI_API_KEY=sk-...   # optional — AI features degrade gracefully without it
```

## Tech Stack
| Layer | Choice |
|-------|--------|
| Frontend | React + Vite + TypeScript (`src/`) |
| Styling | Tailwind CSS v4 |
| Backend | Express.js v5 (`server/`) |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| State | TanStack Query (server state) + Zustand (UI state) |
| AI | OpenAI API (GPT-4o) via `/api/ai/analyze` |
| Drag-drop | @dnd-kit/core (installed, not yet used in UI) |
| Rich text | @tiptap/react (installed, not yet used in UI) |

## File Structure
```
server/
  index.ts             — Express app, all routes registered
  db/
    schema.ts          — All Drizzle table definitions
    client.ts          — SQLite DB client
    init.ts            — Creates tables if not exist
    seed.ts            — Seeds all data (idempotent)
  routes/
    crud.ts            — Generic CRUD router factory
    dashboard.ts       — /api/dashboard/kpis + aggregations
    ai.ts              — /api/ai/analyze (OpenAI calls)
    intelligence.ts    — /api/intelligence/* (computed reports)

src/
  main.tsx             — React entry point
  ui/App.tsx           — ENTIRE frontend (715 lines, single file)
  lib/api.ts           — apiGet / apiPost / apiPut helpers
  store/ui.ts          — Zustand store (page, collapsed sidebar)
  styles.css           — CSS variables + font imports
```

## Database Tables (all in schema.ts)
- `profile` — Single row, Anushka's full profile
- `universities` — 60 seeded universities with fit scores, tuition, rankings
- `university_shortlist` — Kanban status per university
- `scholarships` — 30 seeded scholarships
- `careers` — 10 career paths with salary/roadmap data
- `research_papers` — Paper pipeline
- `ielts_progress` — Mock test score history
- `sop_documents` — SOP drafts with version + content
- `lor_contacts` — Recommenders with status tracking
- `applications` — Application pipeline per university
- `visa_tracker` — Country-level visa status + docs checklist
- `product_portfolio` — Projects (Mentally Prepare etc.)
- `ai_reports` — Saved AI-generated reports
- `tasks` — Action items (AI-generated or manual)
- `people` — Faculty / contacts CRM
- `documents` — Document tracker

## API Routes
All CRUD routes follow the pattern: GET /, POST /, PUT /:id, DELETE /:id
```
/api/profile
/api/universities
/api/shortlist
/api/scholarships
/api/careers
/api/research
/api/ielts
/api/sops
/api/lors
/api/applications
/api/visas
/api/portfolio
/api/tasks
/api/people
/api/documents
/api/dashboard/kpis        — aggregated KPI data for dashboard
/api/intelligence/top-action
/api/intelligence/profile-delta
/api/intelligence/ielts-readiness
/api/intelligence/research-reputation
/api/intelligence/top1-report
/api/ai/analyze            — POST { type: string } → OpenAI call
/api/ai/reports            — GET saved AI reports history
```

## Design System
```css
--bg-primary: #0F1117
--bg-secondary: #161922
--bg-tertiary: #1C1F2E
--border: #2A2D3A
--text-primary: #F1F3F5
--text-secondary: #8B8FA3
--accent-indigo: #6366F1
--accent-violet: #8B5CF6
--accent-emerald: #10B981
--accent-amber: #F59E0B
--accent-red: #EF4444
--accent-blue: #3B82F6
```
Fonts: Instrument Sans (headings), IBM Plex Sans (body), JetBrains Mono (mono/stats).
CSS class helpers defined in styles.css: `.heading`, `.mono`.

No gradients. No illustrations. No rounded-everything. Sharp, dense, data-rich. Notion + Linear + Stripe aesthetic.

## What Is Built ✅
- All DB tables + full seed data (60 universities, 30 scholarships, 10 careers, etc.)
- All CRUD API endpoints
- Dashboard with KPIs, top action strip, 3-column grid
- Elite Universities page — filter bar, university cards, detail modal, add to shortlist
- Profile page — raw data view + notes autosave
- Faculty Intelligence page — people CRM with status pipeline
- Profile Delta page — gap analysis vs every university
- Research Lab page — paper status, publication probability, next moves
- IELTS Hub page — score tracking, university unlock system, weekly plan
- Top 1% Analysis page — probabilities, strengths/weaknesses, 30/90-day plans
- AI Advisor page — triggers `/api/ai/analyze`
- Intelligence routes — top-action, profile-delta, ielts-readiness, research-reputation, top1-report
- Collapsible sidebar with all nav groups + icons

## What Is Placeholder ⚠️ — BUILD THESE NEXT

These pages currently render a raw data table via `GenericDataPage`. Each needs a proper specialized UI:

### 1. University Shortlist (`page === "shortlist"`)
- **Needs**: Kanban board using `@dnd-kit/core`
- Columns: Researching → Shortlisted → Preparing → Applied → Interview → Offer → Enrolled
- Cards show: university name, program, deadline, priority badge
- Drag updates `status` via `PUT /api/shortlist/:id`
- @dnd-kit/core is already installed

### 2. SOP Studio (`page === "sops"`)
- **Needs**: Two-panel layout — left sidebar list of SOPs, right TipTap editor
- Document types: Master SOP, University-specific, Scholarship Essays, Story Banks
- TipTap editor with auto-save (debounced 500ms) via `PUT /api/sops/:id`
- Status toggle: draft → review → final
- "Generate Draft" button → `POST /api/ai/analyze` with `{ type: "sop_draft", sopId }`
- @tiptap/react and @tiptap/starter-kit are already installed

### 3. LOR Command Center (`page === "lors"`)
- **Needs**: Contact cards (name, role, institution, strength score bar, status badge)
- Status pipeline: not_requested → requested → drafting → submitted
- "Generate LOR Email" button per contact → AI call
- "Generate Briefing Note" button → AI call
- Edit contact inline

### 4. Application Tracker (`page === "applications"`)
- **Needs**: Kanban board (same pattern as shortlist)
- Columns: Researching → Shortlisted → Preparing → Applied → Interview → Offer → Scholarship → Visa → Finalized
- Cards show: university name, program, deadline, checklist progress

### 5. Scholarship Tracker (`page === "scholarships"`)
- **Needs**: Sortable/filterable table + card view toggle
- Columns: name, country, amount, deadline, winning probability (color-coded badge), status
- Click → detail modal
- Filter by: status, winning_probability, country, type

### 6. Visa Tracker (`page === "visas"`)
- **Needs**: Country cards grid
- Each card: visa type, status badge, funds required, stay-back years, work rights
- Expandable checklist (toggle items as complete)
- Countries already seeded: USA, UK, Canada, Germany, Netherlands, Ireland, Australia, Singapore

### 7. Career Explorer (`page === "careers"`)
- **Needs**: Career cards grid
- Each card: title, avg salary, growth rate, demand badge, top countries (flag emojis)
- Click → detail modal: salary ranges, required skills (gap-highlighted vs Anushka's profile), roadmap steps timeline, best universities (linked)

### 8. Product Portfolio (`page === "portfolio"`)
- **Needs**: Project cards
- Each card: title, type badge, status, key metrics, description
- "Mentally Prepare" gets an expanded hero view: metrics, user count, founder story, research connections

### 9. Life Design Simulator (`page === "life"`)
- Currently renders `<AiPage type="life_sim" />` which just shows a raw JSON dump
- **Needs**: Proper comparison table/cards UI
- Scenarios: USA+PM, UK+Behavioral Scientist, Europe+Consumer Psych, Canada+UX Research, Singapore+Product Strategy, India+Founder
- Per scenario: salary (yr 1/5/10), COL, ROI, visa pathway, lifestyle score, risk
- "Simulate Custom Scenario" button

## Component Patterns (already established in App.tsx)
```tsx
// Reuse these — don't invent new patterns
<Panel className="p-4">          // section wrapper (border + bg-secondary)
<KpiCard kpi={kpi} />            // large number + progress bar
<SectionTitle title="..." />     // uppercase section header
<CompactRow title meta value />  // 2-line row with right-aligned value
<Metric label value />           // small stat box
<TinyBar label value />          // inline 0-10 bar chart
<Filter label value options />   // select dropdown
```

## AI Endpoint
```typescript
POST /api/ai/analyze
Body: { type: string, context?: object }

// Supported types:
"top1_analysis"   — full report across all tables
"weekly_plan"     — tasks + deadlines
"sop_draft"       — generate SOP draft
"sop_feedback"    — critique existing SOP
"lor_email"       — draft LOR request email
"lor_briefing"    — draft recommender briefing
"research_match"  — find matching professors
"career_analysis" — fit scores + gap analysis
"life_sim"        — life scenario simulation
"profile_gap"     — profile vs university requirements
```
If `OPENAI_API_KEY` is not set, the endpoint returns a 200 with `{ error: "Add OPENAI_API_KEY to .env to unlock AI features" }` — never crashes.

## Key Rules
1. Every number/card/chart pulls from SQLite — no hardcoded UI data
2. All dates in ISO 8601, displayed in IST (Asia/Kolkata)
3. All currencies USD
4. Auto-save on edit — debounced 500ms, no manual save buttons
5. Empty states show "Add first entry" CTA — never blank
6. AI features degrade gracefully if no API key
7. Seed is idempotent — running twice doesn't duplicate
8. The entire frontend lives in `src/ui/App.tsx` — add new page components there
9. All API routes are registered in `server/index.ts` via `crudRouter()` or custom routers

## User Profile Context
Anushka is a final-year BSc Psychology (Honours + Research) student at Christ University, India. She:
- Has a research paper on VR/gaming and derealization (preparing for submission)
- Runs a startup called "Mentally Prepare" (anonymous 21-day journaling app for college students)
- Was an HPAIR Harvard Conference delegate, HP Dreams Unlocked Top 40 finalist
- Targeting MSc programs in Behavioral Science, Consumer Psychology, HCI, UX, Product Psychology
- Planning IELTS in Oct 2025 (target: 7.5)
- Target countries: USA, UK, Europe, Canada, Australia, Singapore
