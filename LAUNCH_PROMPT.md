# Launch prompt for the Claude browser extension

Copy everything inside the box below into the Claude extension (Claude in Chrome) and let it work.
It will ask you whenever a login, 2-factor code, payment or identity check is needed.

---

```
You are helping me launch my web app "The Forge" (by Lumid) at https://theforge.lumid.in.
Work through the phases below in order, in my browser, using the tabs and accounts I'm logged into.
After each phase, tell me what you did and what you saw, then continue.

GROUND RULES
- Never paste any secret (API keys, client secrets, service_role keys, webhook secrets, passwords)
  into a chat, a GitHub file, a commit, an issue or a pull request. Secrets only go into the
  dashboard field that asks for them (Supabase, Vercel, Lemon Squeezy). Copy them tab-to-tab.
- The ONLY values allowed in code are public ones: the Supabase project URL, the Supabase
  publishable key (starts with sb_publishable_), and Lemon Squeezy checkout links.
- Stop and ask me before: paying for anything, entering card/bank/ID details, deleting anything,
  or making the GitHub repository private.
- If a screen looks different from these instructions (dashboards change), find the equivalent
  setting, and tell me what you chose.
- Key facts:
    GitHub repo:        https://github.com/riyan-hx/FRZrEpo   (branch: main)
    Supabase project:   https://rbxxtyjcxexknnspgnyv.supabase.co  (ref: rbxxtyjcxexknnspgnyv)
    Supabase callback:  https://rbxxtyjcxexknnspgnyv.supabase.co/auth/v1/callback
    App domain:         theforge.lumid.in       Support email: info@lumid.in
    Pricing:            $5/month or $48/year, 30-day free trial with no card

PHASE 1 — GitHub: merge pending work
1. Open https://github.com/riyan-hx/FRZrEpo/pulls. Merge every open pull request whose branch is
   claude/lumid-ceo-dashboard-61z2xb (use "Create a merge commit", then "Confirm merge").
2. Confirm main now contains vercel.json, scripts/build.sh, LAUNCH_PROMPT.md and supabase/schema.sql.

PHASE 2 — Vercel: automatic deploys
1. Go to https://vercel.com/new and import the GitHub repo riyan-hx/FRZrEpo
   (install/authorize the Vercel GitHub app for this repo if asked).
2. Framework preset: "Other". Leave build settings as they are — vercel.json already sets
   build command `sh scripts/build.sh` and output directory `dist`. Project name: the-forge. Deploy.
3. When the deploy finishes, open the .vercel.app URL and confirm "Create your account" appears.
4. Project → Settings → Git: confirm Production Branch is `main` (every merge to main now
   auto-deploys; pull requests get preview URLs).
5. Project → Settings → Domains → add `theforge.lumid.in`. Note the DNS record Vercel asks for
   (normally CNAME `theforge` → `cname.vercel-dns.com`, or the exact value Vercel shows).
6. Tell me: Vercel's Hobby plan is for non-commercial use. Before we start charging customers
   (Phase 7) the project must be on Vercel Pro ($20/month) — ask me before upgrading.

PHASE 3 — DNS for lumid.in
1. Find where lumid.in's DNS is managed (check the registrar/DNS provider I'm logged into, e.g.
   GoDaddy, Namecheap, Hostinger, Cloudflare). Ask me if you can't tell.
2. Add the record from Phase 2 step 5 exactly (Type CNAME, Name/Host `theforge`, Value from Vercel,
   TTL automatic). If Cloudflare manages DNS, set the proxy to "DNS only" (grey cloud).
3. Back in Vercel → Domains, wait until theforge.lumid.in shows "Valid Configuration" and an
   SSL certificate. Open https://theforge.lumid.in and confirm the sign-up screen loads.

PHASE 4 — Supabase: database, sign-up and email
Open https://supabase.com/dashboard/project/rbxxtyjcxexknnspgnyv
1. SQL Editor → New query. Paste the full contents of
   https://github.com/riyan-hx/FRZrEpo/blob/main/supabase/schema.sql (use the "Raw" view to copy)
   → Run. It must report success. Then Table Editor: confirm tables `hq_state` and
   `subscriptions` exist with RLS enabled.
2. Authentication → Sign In / Providers → Email: enabled, "Confirm email" ON,
   minimum password length 8. Save.
3. Authentication → URL Configuration:
     Site URL: https://theforge.lumid.in
     Redirect URLs (add all): https://theforge.lumid.in/**  and  https://*-riyan-hx.vercel.app/**
     and the exact .vercel.app URL from Phase 2 followed by /**
   Save.
4. Email sending (Supabase's built-in email is limited to a few per hour — not enough to launch):
   a. Go to https://resend.com, sign up/log in, Domains → Add Domain → lumid.in.
   b. Add the DNS records Resend shows (TXT/MX/DKIM) at the same DNS provider as Phase 3,
      then click Verify and wait for "Verified".
   c. Resend → API Keys → create key "the-forge-supabase" (Sending access).
   d. Supabase → Authentication → Emails → SMTP Settings → Enable custom SMTP:
        Sender email: info@lumid.in   Sender name: The Forge
        Host: smtp.resend.com   Port: 465   Username: resend   Password: the Resend API key
      Save. (Copy the key tab-to-tab; don't paste it anywhere else.)
5. Authentication → Emails → Templates:
     "Confirm signup"  → Subject: Confirm your Forge account
     "Reset password"  → Subject: Reset your Forge password
     "Magic link"      → Subject: Your Forge sign-in link
   Keep the existing {{ .ConfirmationURL }} links in each body; you may replace the body text with
   a short friendly message signed "— The Forge team".

PHASE 5 — Google sign-in
Google Cloud Console → Google Auth Platform (project that contains the OAuth client "Lumid HQ Web").
1. Clients → open "Lumid HQ Web" → rename it to "The Forge Web".
   Authorized JavaScript origins: https://theforge.lumid.in  and the .vercel.app URL.
   Authorized redirect URIs: https://rbxxtyjcxexknnspgnyv.supabase.co/auth/v1/callback
   Save. Copy the Client ID and Client secret (tab-to-tab only).
2. Branding: App name "The Forge", support email info@lumid.in (or my email), app logo optional,
   Home page https://theforge.lumid.in, Privacy https://theforge.lumid.in/privacy.html,
   Terms https://theforge.lumid.in/terms.html, Authorized domain lumid.in. Save.
3. Audience: User type External → Publish app (status "In production").
4. Supabase → Authentication → Sign In / Providers → Google: Enable, paste Client ID and
   Client Secret, Save. (The app shows "Continue with Google" automatically once this is on.)

PHASE 6 — End-to-end test (use a private/incognito window)
1. Open https://theforge.lumid.in → Create account with a new email I own (ask me which) →
   confirm the email arrives from info@lumid.in → click it → sign in.
2. Confirm the "What are you working on?" setup appears, finish it, add one task.
3. Supabase Table Editor: `subscriptions` has a row for this user with status `trialing` and a
   trial end ~30 days away; `hq_state` has a row with data.
4. Sign out, sign in with "Continue with Google" using my Google account, confirm it works.
5. "Forgot password?" → confirm the reset email arrives and the link opens "Set a new password".
6. Open the site on a narrow window (≈390px wide) and confirm the sign-up screen fits with no
   sideways scrolling.
Report any error messages exactly.

PHASE 7 — Payments with Lemon Squeezy (ask me before submitting identity/bank details)
1. https://app.lemonsqueezy.com → create store "Lumid" (or use existing). Settings → General:
   store URL, support email info@lumid.in. Start store activation / identity verification and
   PAUSE for me to complete personal details.
2. Products → New product "The Forge Pro", pricing type Subscription, two variants:
     Monthly — $5.00 every 1 month
     Yearly  — $48.00 every 1 year
   For each variant: Confirmation modal/redirect → Button link: https://theforge.lumid.in/#settings
   Publish.
3. For each variant: Share → copy the Checkout link (looks like https://lumid.lemonsqueezy.com/buy/...).
3b. Founding offer: Store → Discounts → New discount:
     Name "Founding 100", Code FOUNDING100 (exactly), Amount type Fixed, $2.00 off,
     Limit to product/variant: The Forge Pro → Monthly only,
     Duration: Forever (applies to every renewal), Limit total redemptions: 100. Save.
     The app pre-fills this code on the monthly checkout, so the first 100 pay $3/month forever.
4. Supabase → Edge Functions → Deploy a new function → Via Editor:
     a. Name: lemonsqueezy-webhook. Paste the code from
        https://github.com/riyan-hx/FRZrEpo/blob/main/supabase/functions/lemonsqueezy-webhook/index.ts
        Turn OFF "Verify JWT" (Lemon Squeezy can't send a Supabase token). Deploy.
     b. Name: delete-account. Paste
        https://github.com/riyan-hx/FRZrEpo/blob/main/supabase/functions/delete-account/index.ts
        Keep "Verify JWT" ON. Deploy.
5. Lemon Squeezy → Settings → Webhooks → Add:
     URL: https://rbxxtyjcxexknnspgnyv.supabase.co/functions/v1/lemonsqueezy-webhook
     Signing secret: generate a long random string (e.g. 40+ random characters)
     Events: every event starting with "subscription_"
   Save.
6. Supabase → Edge Functions → Secrets (or Project Settings → Edge Functions → Secrets), add:
     LEMONSQUEEZY_WEBHOOK_SECRET = the same signing secret
     LEMONSQUEEZY_API_KEY        = a new key from Lemon Squeezy → Settings → API
7. GitHub: open https://github.com/riyan-hx/FRZrEpo/edit/main/app.js, find the LAUNCH block near
   the top and set only:
     checkout: { monthly: '<monthly checkout link>', yearly: '<yearly checkout link>' },
   Commit directly to main with message "Add Lemon Squeezy checkout links".
   (Checkout links are public; this is the only value you edit in code.) Vercel redeploys
   automatically — wait for the deployment to finish.
8. Test mode: switch Lemon Squeezy to Test mode, sign in to the app as the Phase 6 user →
   Settings → Upgrade to Pro → Choose monthly → pay with card 4242 4242 4242 4242, any future
   date, any CVC. Back in the app (reopen/refresh), Settings should show "Pro · renews …" and a
   "Manage billing" button. Supabase `subscriptions` row should show status `active`.
   If it doesn't: Lemon Squeezy → Webhooks → check the latest delivery's response and report it.
9. Switch Lemon Squeezy to Live mode only after I confirm, and only once the Vercel project is on
   a plan that allows commercial use (see Phase 2 step 6).

PHASE 8 — Clean-up and privacy
1. GitHub → repo Settings → Pages → set Source to "None" (the old github.io site stops; Vercel
   now serves the app).
2. Ask me, then: GitHub → Settings → General → Danger Zone → Change visibility → Private.
   Afterwards confirm Vercel still deploys (Vercel → Deployments; push a trivial change if needed,
   or click Redeploy).
3. Optional analytics: Vercel project → Analytics → Enable Web Analytics (free tier).

FINAL REPORT
Give me a checklist of every phase with ✅/❌, the live URLs, anything that needs my action,
and any errors with the exact message. Do not include any secret values in the report.
```
