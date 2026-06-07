# UnbrokenAudit

Audit your day, keep the streak unbroken. Log daily tasks as time blocks, get an
automatic Productive / Sleep / Other breakdown plus streak stats, and export a clean
**1080×1080** card to post on Instagram.

Built to spec: React + Vite + TypeScript + Tailwind on the front end, Supabase
(Postgres + Auth + RLS) on the back end, deployable to Vercel.

---

## Status of the build

| Phase | Scope | State |
|------|-------|-------|
| 1 | Vite + React + TS + Tailwind + Router scaffold, env wiring, Vercel config | ✅ |
| 2 | Schema, overlap `EXCLUDE`, unique day/user, indexes, triggers, `get_user_stats`, **RLS** | ✅ SQL written — needs applying |
| 3 | Email/password + magic link + Google auth, verify email, profile trigger, route guards | ✅ |
| 4 | Today screen, window controls, add/edit/delete entries, client+DB overlap & bounds, live breakdown | ✅ |
| 5 | Streak stats (current/max/total) in the user's tz | ✅ |
| 6 | 1080×1080 card, live preview, PNG export, copy-caption | ✅ |
| 7 | History (search/view/edit/delete), Settings (tz, default window, delete-account cascade) | ✅ |
| 8 | Hardening: security headers, friendly errors, input validation, bundle splitting, a11y | ✅ baseline |

**Tests:** 65 unit tests, ~97% coverage on the business logic (duration/past-midnight,
overlap, window bounds, breakdown, streaks, captions, error mapping, validation).
An RLS isolation integration test is included (auto-skips without live creds).

---

## What I still need from you

The frontend, all logic, and the SQL are done. To go live you must provide two things
the keys alone don't include:

1. **Project URL** — e.g. `https://abcd1234.supabase.co` (Project Settings → API).
   Put it in `.env` as `VITE_SUPABASE_URL`.
2. **Apply the migrations** — either:
   - paste `supabase/migrations/0001…0004` into the Supabase **SQL Editor** in order, **or**
   - give me a **Supabase personal access token** (Account → Access Tokens) and the
     project ref, and I can apply them for you via the MCP tools.

The publishable key you gave is already wired as the anon key in `.env`. The secret key
is stored in `.env` only for server-side admin use and is **never** imported by any
`src/` file.

---

## Local development

```bash
npm install
cp .env.example .env      # then set VITE_SUPABASE_URL (anon key already provided)
npm run dev               # http://localhost:5173
```

Other scripts:

```bash
npm test                  # unit tests
npm run test:coverage     # coverage (80% gate on business logic)
npm run typecheck         # tsc -b
npm run build             # production build -> dist/
npm run lint              # eslint
```

## Applying the database

In the Supabase SQL Editor, run in order:

```
supabase/migrations/0001_schema.sql
supabase/migrations/0002_rls.sql
supabase/migrations/0003_functions_triggers.sql
supabase/migrations/0004_delete_account.sql
```

Then in **Auth → Providers** enable Email (with confirmations), and add Google with your
OAuth credentials. Set the **Site URL** and add `…/auth/callback` and `…/reset` as
redirect URLs.

## Verifying RLS isolation (spec §6)

Create two confirmed users, then:

```bash
export IT_SUPABASE_URL=...        IT_SUPABASE_ANON_KEY=...
export IT_USER_A_EMAIL=...        IT_USER_A_PASSWORD=...
export IT_USER_B_EMAIL=...        IT_USER_B_PASSWORD=...
npx vitest run src/test/rls.integration.test.ts
```

User B must read **zero rows** of User A's days/profile; User A reads their own.

## Deploy to Vercel

- Framework preset: **Vite** (already in `vercel.json`, with SPA rewrite + security headers).
- Set env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project.
- Build command `npm run build`, output `dist`.

---

## Architecture notes

- **Time & timezones (§7):** all timestamps are `timestamptz` (UTC). `local_date`,
  "today" and streaks are computed in the user's IANA timezone, stored on `profiles`.
  Past-midnight entries resolve forward off the window anchor (`src/lib/time.ts`).
- **Overlap (§4.2):** enforced twice — instantly client-side (`entryRules.ts`) and as a
  Postgres `EXCLUDE USING gist (day_id, tstzrange)` constraint that can't be bypassed.
- **Denormalized totals (§4.7):** an `AFTER` trigger keeps `days.{productive,sleep,
  other}_minutes` current so reads stay cheap at scale; `window_minutes` and entry
  `duration_minutes` are generated columns (the client can't lie about them).
- **Breakdown (§4.4/4.5):** percentages are of the user-defined window; unlogged gaps
  stay unaccounted and render as a faint segment, never labelled "Other".
- **Streaks (§4.6):** `get_user_stats()` uses a gaps-and-islands query in the user's tz;
  mirrored client-side in `src/lib/streak.ts` for instant display.
- **Card export (§8):** rendered at a true 1080×1080 node with inline styles; `html-to-image`
  (lazy-loaded) snapshots it at `pixelRatio: 2`. Preview is a CSS-scaled copy.
```
