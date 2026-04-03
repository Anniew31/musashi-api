# Database Supabase Guide

This project uses Supabase Postgres with 3 core tables:

- `user_accounts`
- `plugin_usage_records`
- `orders_subscriptions`

## 1) Environment Variables

Set these in `.env`:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Backend API options
API_PORT=8787
API_HOST=127.0.0.1
BACKEND_API_KEY=your_local_api_key
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is required for backend writes.
- `SUPABASE_ANON_KEY` can be used for limited client-side reads/writes with RLS.
- Never commit real secrets.

## 2) Database Schema / Migrations

The initial migration is at:

- `supabase/migrations/20260226000000_initial_schema.sql`

### Apply migrations

```bash
cd /Musashi
supabase login
supabase link --project-ref <your_project_ref>
supabase db push
```

### Create next migration

```bash
supabase migration new <change_name>
# edit generated SQL file in supabase/migrations/
supabase db push
```

## 3) Connection Test

Checks that required tables are reachable:

```bash
pnpm run supabase:test
```

Script file:

- `scripts/test-supabase-connection.mjs`

## 4) Smoke Test (real insert/read/delete)

Runs end-to-end checks with temporary data:

```bash
pnpm run supabase:smoke
```

What it validates:

- insert into all 3 tables
- read back inserted data
- constraint rejection test
- cleanup of created test rows

Script file:

- `scripts/supabase-smoke-test.mjs`

## 5) Backend API for DB Updates

Start server:

```bash
pnpm run api:start
```

Base URL:

- `http://127.0.0.1:8787`

Endpoints:

- `GET /health`
- `POST /api/user-accounts/upsert`
- `POST /api/plugin-usage/log`
- `POST /api/orders-subscriptions/upsert`

Detailed examples:

- `BACKEND_API.md`

## 6) Type-safe Supabase Client

Client definitions and table typings:

- `src/api/supabase-client.ts`

Includes:

- table constants
- `AppDatabase` types
- browser client creator
- connection test helper

## 7) Typical Workflow

1. Edit DB structure with migration files.
2. Run `supabase db push`.
3. Run `pnpm run supabase:test`.
4. Run `pnpm run supabase:smoke`.
5. Start backend with `pnpm run api:start` and call endpoints.

## 8) Troubleshooting

- "Missing SUPABASE_URL...": `.env` values missing/empty.
- "No tables": migration not applied to current Supabase project/branch.
- "fetch failed": network restriction or wrong project URL.
- 401 on API routes: wrong/missing `x-api-key` when `BACKEND_API_KEY` is set.

## 9) Security Checklist

- Keep `SUPABASE_SERVICE_ROLE_KEY` only on backend/server scripts.
- Rotate keys if accidentally exposed.
- Add RLS policies before using anon client in production.
- Restrict CORS and API key usage for deployed backend.
