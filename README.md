# Lumid HQ

CEO command center for **Lumid AI** and **Lumid Studio** — capture ideas, turn them into work, and run the company from one mobile-friendly dashboard.

## Features
- **Today** — greeting, quick capture, focus tasks, today's schedule, KPIs, follow-ups, top ideas, pinned notes
- **Ideas** — pipeline board (Spark → Exploring → Building → Shipped / Parked), impact/effort scoring, one-tap *Implement* turns an idea into a task
- **Tasks** — priorities, due dates, owners, grouped by overdue / today / this week
- **Notes** — searchable, pinnable notes
- **Schedule** — month calendar, day agenda, `.ics` export to Google/Apple Calendar
- **Goals** — OKRs with key-result progress sliders
- **KPIs** — log metrics over time with sparklines, deltas and targets
- **Decisions** — decision log with review dates
- **People** — investors, advisors, hires with follow-up reminders
- Venture filter, global search (`⌘K` / `Ctrl+K`), light/dark theme, JSON backup/restore, installable PWA with offline support

### Quick capture syntax
```
Voice mode for onboarding #ai                → idea tagged Lumid AI
task: call investor #studio !tomorrow !p1   → P1 task due tomorrow
note: board prep thoughts                   → note
event: demo day !week                       → event in 7 days
```

## Run
No build step. Serve the folder with any static server:
```
python3 -m http.server 8080
```
Then open http://localhost:8080. Deploy anywhere static (GitHub Pages, Netlify, Vercel).

On your phone: open the site → Share → **Add to Home Screen** (iOS) or ⋮ → **Install app** (Android).

Data is stored locally in the browser — use **Settings → Export JSON** to back up or move devices.
