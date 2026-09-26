# Going live

## 1. Publish the site (GitHub Pages, free)
1. Merge this branch into `main`.
2. GitHub → repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The *Deploy to GitHub Pages* workflow runs on every push to `main`.
   Your site: **https://riyan-hx.github.io/FRZrEpo/**
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
