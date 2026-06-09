# Project Walkthrough (Agent Reference)

Compact map for codebase review. See `CLAUDE.md` for commands.

## Layout

| Path | Role |
|------|------|
| `app/` | App Router — `export const dynamic = "force-dynamic"` on pages |
| `app/api/[...path]/route.ts` | All REST + SSE (`events/stream`) |
| `src/components/pages/` | Client page shells |
| `src/hooks/` | React Query + `useRealtimeSync` |
| `src/utils/queryInvalidation.ts` | RQ bust + `invalidateByAppEvent()` |
| `lib/` | Prisma, Redis, business-insights, user-registration, realtime |

## Auth (NextAuth only — Auth0 removed)

- `auth.ts` — Credentials + Google OAuth
- `lib/user-registration.ts` — shared DB user create
- `/api/auth/signup-nextauth` — email/password signup

## Realtime sync

```
CRUD → notifyCrud(domain) → Redis seq + insights cache bust
      → SSE /api/events/stream → RealtimeProvider → invalidateByAppEvent
      → React Query refetch (all tabs, no page refresh)
```

| Layer | File |
|-------|------|
| Publish | `lib/realtime/publish.ts` |
| SSE | `lib/realtime/stream.ts`, `GET events/stream` in route.ts |
| Client | `RealtimeProvider`, `useRealtimeSync` |

## Business Insights (REQ-0020)

- `lib/business-insights.ts` — consolidated SQL
- Redis `business:insights` TTL 60s
- SSR + `initialDataUpdatedAt` — no mount double-fetch
- Vitest: `lib/__tests__/business-insights.test.ts`

## Caching

1. Redis — search 30m, recipe 24h, insights 60s, events seq 120s
2. React Query — Infinity default; insights 60s staleTime
3. sessionStorage/localStorage — client persistence

## Key env

`DATABASE_URL`, `UPSTASH_REDIS_*`, `NEXTAUTH_*`, `GOOGLE_ID`/`GOOGLE_SECRET`, `API_KEY`
