# Lumid HQ

CEO command center for **Lumid AI** and **Lumid Studio** — capture ideas, turn them into work, and run the company from one mobile-friendly dashboard.

## Features
- **Today** — greeting, quick capture, focus tasks, today's schedule, KPIs, follow-ups, top ideas, pinned notes
- **Ideas** — pipeline board (Spark → Exploring → Building → Shipped / Parked), impact/effort scoring, one-tap *Implement* turns an idea into a task
- **Tasks** — priorities, due dates, owners, grouped by overdue / today / this week
- **Notes** — searchable, pinnable notes
- **Schedule** — Month / Week / Deadlines views, a written plan for each day, quick-add tasks to any day, deadline countdowns, `.ics` export to Google/Apple Calendar
- **Resources** — paste reels, YouTube videos, podcasts or articles; watch list → reference → watched, with takeaways notes. On Android, share a link straight into the installed app. Organise links into collections (e.g. Instagram reels, design videos) and search across all of them
- **Goals** — OKRs with key-result progress sliders
- **KPIs** — log metrics over time with sparklines, deltas and targets
- **Decisions** — decision log with review dates
- **People** — investors, advisors, hires with follow-up reminders
- **AI + voice capture** — tap the mic and speak; a free-tier LLM (Gemini, Groq or OpenRouter) turns it into events, tasks and ideas with dates and times (see SETUP.md)
- Venture filter, global search (`⌘K` / `Ctrl+K`), light/dark theme, JSON backup/restore, installable PWA with offline support

### Quick capture
Tap a pill (Idea, Task, Event, Note, Decision, Link) to set the type, and use the tag/date pills to add details. Dates and times in plain English are understood — `tomorrow 3pm`, `next fri at 10:30`, `28 sep`, `in 3 days`, `tonight`, `for 2 hours`. Events and tasks open a confirmation sheet; missing dates/times are highlighted.

```
Voice mode for onboarding #ai                → idea tagged Lumid AI
task: call investor #studio !tomorrow !p1   → P1 task due tomorrow
note: board prep thoughts                   → note
event: demo day !week                       → event in 7 days
https://youtu.be/… growth tactics #ai       → saved to Resources
```

## Go live & cloud sync
See **[SETUP.md](SETUP.md)** — GitHub Pages hosting + optional Supabase database so your data syncs across phone and laptop.

## Run locally
No build step. Serve the folder with any static server:
```
python3 -m http.server 8080
```
Then open http://localhost:8080. Deploy anywhere static (GitHub Pages, Netlify, Vercel).

On your phone: open the site → Share → **Add to Home Screen** (iOS) or ⋮ → **Install app** (Android).

Data is always stored locally (works offline). Enable **Settings → Cloud sync** to sync devices, or use **Export JSON** for manual backups.
