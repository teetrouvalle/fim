# Fim Addis / ፍም አዲስ

Fim Addis is a bilingual (English/Amharic) membership video site built with Next.js 15, Vercel, Neon PostgreSQL + Managed Better Auth and Bunny Stream.

## Current deployment status
- Neon database and managed authentication connected; customer registration/login, account and payment history screens implemented.
- Admin /admin: admin-only signed-in dashboard, payment review and Bunny catalog import/editor.
- Price plans: Basic 599 ETB, Plus 999 ETB, Premium 1499 ETB / 30 days.
- M-PESA receiving number 0707070707. Optional receipt path via Telegram @keithify.
- When enabled, verified users can submit a M-PESA reference and a private JPG/PNG/PDF proof under 900 KB (stored in restricted Neon PostgreSQL) or choose Telegram manual receipt review.
- Admin can approve or reject after independent M-PESA balance/transaction verification. Approved payments grant 30-day membership using a locked, idempotent Postgres function; rejected or pending requests give no access.
- Videos appear only after manual import from Bunny and licensing/age-rating approval. Playback further requires verified authentication and sufficient active membership.
- Actual payments and playback are **disabled by default** until external launch requirements are completed.

## Control variables (Vercel server-side)
- `DATABASE_URL`: Neon pooled Postgres connection string, secret.
- `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`: Managed Better Auth, cookie secret.
- `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_API_KEY`: Bunny Stream API.
- `BUNNY_STREAM_TOKEN_KEY`: Bunny **Embed View Token Authentication security key** (not API key). Do not publish; see Bunny library Security.
- `FIM_PAYMENTS_OPEN`: default false; when true AND public.fim_site_settings payments_open=true, payment submissions are available.
- `FIM_PLAYBACK_OPEN`: default false; when true AND public.fim_site_settings playback_open=true AND Bunny token key exists, entitled users get signed player iframe URLs.
- `FIM_ADMIN_EMAIL`: allows administrator account setup; server validates the verified session against `fim_admin_allowlist`.

## Mandatory production checks before changing switches
1. Verify commercial content distribution permissions, classification and age-assurance requirements.
2. Set up Neon's verification method: Project > Settings > Better Auth > enable email verification at signup. Shared email may be rate limited; use production SMTP and owned OAuth credentials.
3. Complete independent confirmation of M-PESA receiving number **0707070707** and Telegram **@keithify**.
4. Upgrade Vercel to a plan that permits commercial operation. Check billing and Neon free database storage use.
5. In Bunny Stream > Library > Security, **enable Embed View Token Authentication** and configure secret `BUNNY_STREAM_TOKEN_KEY` on Vercel. Check domain restrictions / underlying CDN protection as appropriate.
6. Import licensed/encoded Bunny titles, review rights/classification and mark published. Test with a verified test member.
7. Run authenticated end-to-end testing: sign up, verify email, submit a sample receipt, private receipt view, reject, admin approval, membership renewal and signed playback; only then enable actual payments.
8. Do not publish a video with uncertain rights. Never enable paywall with unprotected public video URLs.

## Local development
```sh
npm install
npm run build
npm run dev
```

For implementation details see `docs/MANUAL_PAYMENTS.md`. Do not commit API keys, database credentials or private receipt contents.
