# Fim Addis / ፍም አዲስ

**Noncommercial prelaunch prototype** — this repository does not implement a paid video platform yet.

## What exists
- Responsive bilingual (English/Amharic) homepage
- Red/black and red/white themes; initial theme follows OS with saved manual preference
- 18+ self-acknowledgement **notice** (not verified age identification)
- Membership tier placeholders: Basic, Plus, Premium
- No videos, checkout, authentication, subscriptions, or bank payments
- Search-engine robots disallow and noindex metadata
- Server-side fail-closed policy module for future playback, checkout, and publication routes (none are implemented)

## Run locally
```bash
npm install
npm run dev
npm run build
```

## Required work before commercial launch
See [CONTENT_AND_LAUNCH_GATE.md](docs/CONTENT_AND_LAUNCH_GATE.md) and [MANUAL_PAYMENTS.md](docs/MANUAL_PAYMENTS.md).

Commercial streaming requires lawful distribution rights, necessary age/classification compliance, a dedicated Supabase backend, a video provider (Bunny Stream), and eligible hosting. The Vercel Hobby plan is used only for a noncommercial prototype. Upgrade hosting before enabling sales or commercially operated services.
