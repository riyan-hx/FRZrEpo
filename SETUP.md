# Going live

## 1. Publish the site (GitHub Pages, free)
1. GitHub → repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
2. Branch: **main**, folder: **/ (root)** → **Save**.
3. Every merge into `main` goes live in about a minute at **https://riyan-hx.github.io/FRZrEpo/**
4. On your phone open that URL → **Add to Home Screen** / **Install app**.

Without cloud sync, data is stored only in each browser (use Settings → Export/Import to move it).

## 2. Cloud database & sync (Supabase, free tier)
1. Create a project at https://supabase.com (any region, save the DB password).
2. **SQL Editor → New query** → paste `supabase/schema.sql` → **Run**.
3. **Authentication → URL Configuration → Site URL**: `https://riyan-hx.github.io/FRZrEpo/`
4. **Project Settings → API**: copy the **Project URL** and the **anon / publishable** key.
   (The anon key is safe in the browser — Row Level Security restricts every user to their own row. Never paste the `service_role` / secret key.)
5. In Lumid HQ: **Settings → Cloud sync** → paste URL + key → **Connect** → **Create account** → confirm the email → **Sign in**.
6. On every other device: Connect with the same URL + key and **Sign in**. The cloud copy is loaded (this device's previous data is kept as a local backup).
7. Lock it down: after creating your account, **Authentication → Sign In / Providers → turn off "Allow new users to sign up"**.

### How sync works
- Local-first: the app works fully offline; changes upload ~1.5 s after you stop editing.
- It pulls the latest copy when you open/focus the app and every minute while it's open.
- If two devices edit while offline, the most recent save wins.

## 3. AI assistant & voice capture (free)
Speak or type naturally ("meet the psychologist for Lumid AI tomorrow 3pm, and send the investor update Friday") — the AI splits it into events, tasks, ideas and notes with dates and times, and shows a review sheet before saving.

1. Get a free API key (no card needed):
   - **Google Gemini** (recommended — also understands voice recordings): https://aistudio.google.com/apikey
   - **Groq** (fast, voice via Whisper): https://console.groq.com/keys
   - **OpenRouter** (free `:free` models, text only): https://openrouter.ai/keys
2. In Lumid HQ: **Settings → AI assistant** → choose the provider → paste the key → **Save** → **Test**.
3. Tap the 🎤 mic in the capture box on Today, speak, then tap stop.

Notes:
- The key is stored only in this browser and sent only to the provider you choose; it is not synced to the cloud database.
- Free tiers have rate limits; if a request fails, the note is still saved with the built-in parser.
- Voice uses the browser's speech recognition (Chrome, Safari). Where that isn't available, the app records audio and sends it to Gemini or Groq instead.
- Uncheck **Organize typed notes with AI too** to use AI only for voice.
