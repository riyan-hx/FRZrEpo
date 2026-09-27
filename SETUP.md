# Launching The Forge (theforge.lumid.in)

Everything is built. Turning on accounts, trials and payments is configuration only — fill in the
`LAUNCH` block at the top of `app.js`. Until then the app runs exactly as today (local-only, free).

Order: **1 Hosting → 2 Supabase → 3 Google sign-in → 4 Lemon Squeezy → 5 Analytics → 6 Go live.**

---

## 1a. Hosting on Vercel (recommended — automatic deploys)
`vercel.json` is included (build `sh scripts/build.sh` → `dist`, security headers, no-cache for the app shell).
Import the repo at vercel.com/new, add the domain `theforge.lumid.in`, and every merge to `main` deploys
automatically. Vercel's Hobby plan is non-commercial — move to Pro before charging customers.
The full click-by-click setup (Vercel, DNS, Supabase, Google, Resend, Lemon Squeezy) is in `LAUNCH_PROMPT.md`.

## 1b. Hosting on Cloudflare Pages (alternative) + theforge.lumid.in (15 min)
GitHub Pages doesn't allow commercial use, so move to Cloudflare Pages (free, commercial OK).

1. https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git** → pick `riyan-hx/FRZrEpo`.
2. Build settings: Framework **None**, build command **`sh scripts/build.sh`**, output directory **`dist`**. Deploy.
   This publishes only the app files — README, SETUP, `supabase/` and scripts are never served.
3. **Custom domains → Set up a domain → `theforge.lumid.in`** and follow the DNS instructions.
   (If lumid.in's DNS isn't on Cloudflare, add the CNAME it shows at your registrar.)
4. The app is at `https://theforge.lumid.in/`, the landing page at `https://theforge.lumid.in/landing.html`
   (or copy `landing.html` to `lumid.in/forge`).
5. Once live, turn off GitHub Pages (repo Settings → Pages → Source: None).
6. Make the repository **private** (repo Settings → General → Danger zone → Change visibility).
   Cloudflare Pages keeps deploying from a private repo, and your code, history and pull requests stop being public.

`_headers` adds security headers and makes sure updates reach users immediately.

## 2. Supabase: accounts, trials, paywall (15 min)
1. https://supabase.com → **New project** (region close to your users, e.g. Mumbai). Save the DB password.
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
   This creates synced data, `subscriptions` (14-day trial for every new account), and the rule that
   blocks sync writes once a trial or subscription ends.
3. **Authentication → URL Configuration**
   - Site URL: `https://theforge.lumid.in`
   - Redirect URLs: add `https://theforge.lumid.in/**`
4. **Authentication → Sign In / Providers → Email**: enabled, **Confirm email ON**, minimum password length **8**.
   Sign-up is required: anyone not signed in sees the Create account / Sign in screen first.
5. **Authentication → Emails → Templates** — brand these (they're the first emails users get):
   - *Confirm signup* — subject "Confirm your Forge account"
   - *Reset password* — subject "Reset your Forge password"
6. **Authentication → SMTP**: set up custom SMTP before launch (e.g. Resend, free up to ~3k emails/month,
   sender `info@lumid.in`). Supabase's built-in email only sends a few emails per hour — not enough for sign-ups.
7. **Project Settings → API** → copy **Project URL** and **anon / publishable key** into `app.js`:
   ```js
   supabaseUrl: 'https://xxxx.supabase.co',
   supabaseKey: 'eyJ… or sb_publishable_…',
   ```
   Both are public by design. **Never** put the `service_role` / secret key in the app.
8. Upgrade to **Pro ($25/mo)** once people pay you (daily backups, no pausing).

## 3. "Continue with Google" (10 min)
> App name on the consent screen: **The Forge**. Authorized domain: `lumid.in`.
1. https://console.cloud.google.com → create a project → **APIs & Services → OAuth consent screen**
   (External; app name "The Forge"; support email; authorized domain `lumid.in`; add privacy/terms URLs).
2. **Credentials → Create credentials → OAuth client ID → Web application**
   - Authorized redirect URI: `https://xxxx.supabase.co/auth/v1/callback` (shown in Supabase under Authentication → Providers → Google)
3. Paste the Client ID and Secret into **Supabase → Authentication → Providers → Google** → Enable.
4. **Publish** the consent screen so anyone can sign in.
5. The "Continue with Google" button appears on the sign-in screen automatically once the provider is enabled.

## 4. Lemon Squeezy payments (30 min + approval time)
Lemon Squeezy is the merchant of record: it charges customers, handles global VAT/GST and invoices, and pays you out.

1. https://lemonsqueezy.com → create a store (e.g. `lumid`). Complete identity + payout setup and **request store activation** — this can take a few days, so do it first.
2. **Products → New product** "The Forge Pro" → type **Subscription** with two variants:
   - Monthly: **$5 / month**
   - Yearly: **$48 / year**
   In each variant's settings, set the redirect after purchase to `https://theforge.lumid.in/#settings`.
   **Founding offer:** Store → Discounts → New: code `FOUNDING100`, fixed **$2 off**, Monthly variant only,
   duration **Forever**, limit **100** redemptions. The app pre-fills it on the monthly checkout. When all 100
   are used, set `founder.code` to `''` in `app.js` to remove the offer from the app (and edit landing.html).
3. For each variant: **Share → Checkout link** → copy into `app.js`:
   ```js
   checkout: { monthly: 'https://lumid.lemonsqueezy.com/buy/…', yearly: 'https://lumid.lemonsqueezy.com/buy/…' },
   ```
   The app adds the customer's email and account id to the link automatically.
4. **Deploy the webhook** (Supabase CLI: `npm i -g supabase`, then `supabase login`, `supabase link --project-ref xxxx`):
   ```bash
   supabase functions deploy lemonsqueezy-webhook --no-verify-jwt
   supabase functions deploy delete-account
   ```
5. **Lemon Squeezy → Settings → Webhooks → +**
   - URL: `https://xxxx.supabase.co/functions/v1/lemonsqueezy-webhook`
   - Signing secret: make up a long random string
   - Events: all `subscription_*` events (created, updated, cancelled, resumed, expired, paused, unpaused, payment_success, payment_failed, payment_recovered)
6. Store the secrets in Supabase:
   ```bash
   supabase secrets set LEMONSQUEEZY_WEBHOOK_SECRET='the-same-random-string'
   supabase secrets set LEMONSQUEEZY_API_KEY='…'   # Settings → API; lets "Delete account" cancel a subscription
   ```
7. **Test mode first**: toggle Lemon Squeezy to test mode, buy with card `4242 4242 4242 4242`, and check
   **Supabase → Table editor → subscriptions** shows `active` for your user. Then switch to live.

## 5. Analytics & error tracking (10 min, optional)
- **Cloudflare Web Analytics** (free, no cookies): Cloudflare → Analytics & Logs → Web Analytics → add `theforge.lumid.in` → copy the token → `analyticsToken: '…'`.
- **Sentry** (free tier): create a Browser JavaScript project → **Settings → Client Keys → Loader Script** → copy the URL → `sentryLoader: 'https://js.sentry-cdn.com/….min.js'`.

## 6. Go live checklist
- [ ] `info@lumid.in` receives mail (feedback, refunds, privacy requests all point there)
- [ ] Sign in with Google and with an email link on phone + laptop; data syncs both ways
- [ ] Test purchase in Lemon Squeezy test mode flips your account to Pro; "Manage billing" opens the portal
- [ ] Set a test user's `trial_ends_at` to yesterday in the Table editor → app shows "sync is paused"
- [ ] Privacy, Terms and Refunds pages open from Settings and the landing page
- [ ] Record the demo video and swap it into `landing.html` (see the comment in the demo block)

## How accounts work
- **Sign-up is required** once `supabaseUrl`/`supabaseKey` are set: Create account (name, email, password
  → verification email) or Continue with Google. "Forgot password?" emails a reset link that opens a
  "Set a new password" screen.
- New accounts go straight into "What are you working on?" setup, then the app.
- Signed-in users keep working offline; the sign-in screen only needs a connection the first time.
- Signing out removes that device's copy (it warns first if changes haven't synced), so the next person
  to sign in on a shared device never sees or uploads someone else's data.
- The landing page links to `./?mode=signup` and `./?mode=signin`.

## How the plans work
- **After the trial without paying:** every feature keeps working on the device; export any time.
- **Pro trial:** creating an account starts 14 days of Pro — sync + cloud backup — no card needed.
- **After the trial:** without a subscription, the database refuses sync writes (enforced by Row Level
  Security, so it can't be bypassed from the browser). Local data and export keep working; the account
  can still read its cloud copy.
- **Pro ($5/mo or $48/yr):** Lemon Squeezy webhook marks the account active; cancelling keeps Pro until the paid period ends.

## Labs (owner-only features)
AI capture and connecting your own Supabase project are hidden for public users. Open the app with
`?labs=1` to show them. Your AI key stays on your device and is never synced.
