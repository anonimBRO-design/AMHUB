# TODO.md — AMHUB Audit

> Prioritized findings from the repository audit (2026-08-03). Categories: bug, technical debt, missing feature, duplicated code, unused dependency, security issue, performance issue.
> Priority: **P0** = fix now (blocks/breaks things, security) · **P1** = high (important but workable around) · **P2** = medium · **P3** = low/nice-to-have.
> Source of truth for task planning. Update as items are fixed (check them off / move to a Done section).

---

## P0 — Fix now

### Security

- **[SEC-1] ✅ FIXED (2026-08-19).
  - File: `supabase/migrations/20260728000000_database_foundation.sql`
- **[SEC-2] ✅ FIXED (2026-08-19). `follows` and `preset_likes` select policies restricted to authenticated users.
  - File: same migration.
  - File: same migration.

### Bug

- **[BUG-1] ✅ FIXED (2026-08-03).** Mock fallback now env-gated via `dal/mock-fallback.ts` (`isMockFallbackEnabled` = non-production). Policy: query error → dev: log+mock / prod: rethrow; empty → dev: mock / prod: real empty (null/[]/0). `getPresetBySlug`/`getUserByUsernameOrNull`/`getUserById` no longer fall back to `MOCK_PRESETS[0]`/`MOCK_CREATORS[0]` for unknown keys (→ 404). `getFollowerCount` prod → real count/0. See TD-3.
- **[BUG-2] ✅ FIXED (2026-08-03).** `pnpm lint` failed on Biome formatting in `packages/ui/src/templates/app-layout.tsx` (inline JSX children). Split onto own lines; lint now passes 4/4.

---

## P1 — High

### Security

- **[SEC-3] ✅ FIXED (2026-08-19). Removed unvetted `install.cmd` from repo root.
  - File: (deleted)
  - File: `install.cmd`

### Missing feature

- **[MISS-1] ✅ FIXED (2026-08-19). Full download flow with secure signed URLs implemented.
- **[MISS-2] ✅ FIXED (2026-08-19). Notifications triggered on like, comment, follow, download, and bookmark events.
- **[MISS-3] ✅ FIXED (2026-08-19). Implemented `GET /api/search` with tags, category, sort options.
- **[MISS-4] ✅ FIXED (2026-08-20). Tag suggestions endpoint `GET /api/tags` active with search query & limit.

### Performance

- **[PERF-1] ✅ FIXED (2026-08-19). Fast cookie check skips Supabase calls for guest users.
  - File: `apps/web/src/app/layout.tsx`

### Technical debt

- **[TD-1] `SUPABASE_SERVICE_ROLE_KEY` required but service client never instantiated.** `createSupabaseServiceClient` exists (exported, type-only used) but no route uses it. Either use it (admin/staff operations) or drop the env requirement to avoid deploy-time failures.
- **[TD-2] ✅ FIXED (2026-08-19). Removed unused deps: @tanstack/react-query, zustand, react-hook-form, @hookform/resolvers.
- **[TD-3] ✅ FIXED (2026-08-03, with BUG-1).** Mock fallback now env-gated (`dal/mock-fallback.ts`); prod surfaces errors and returns real empties. Remaining: `data/mock-data.ts` still uses `Math.random()`/`Date.now()` at module load (see PERF-3).

---

## P2 — Medium

### Bug

- **[BUG-3] ✅ FIXED (2026-08-19). `getPresetStorageBucket` now correctly returns preset-videos for video type.
  - File: `apps/web/src/lib/supabase/storage.ts`
- **[BUG-4] ✅ FIXED (2026-08-19). Extended `notifications_type_check` to include bookmark, approval, moderation.
  - File: `apps/web/src/data/mock-data.ts`
- **[BUG-5] `GET /api/presets` selects ALL statuses** (no status filter). RLS masks it today, but the endpoint's contract is ambiguous vs. `listPublishedPresets`. Add explicit `status=published` for public listing or mark as staff/admin endpoint.
  - File: `apps/web/src/app/api/presets/route.ts`

### Duplicated code

- **[DUP-1] Route param schemas repeated.** `{ id: z.string().uuid() }` defined in 4+ route files; `usernameRouteParamsSchema` in 2 files; `getSafeRedirectPath` in 2 files (`auth/callback/route.ts`, `auth/login/page.tsx`). Consolidate into `lib/api/validation.ts` or a shared `lib/api/schemas.ts`.
- **[DUP-2] PATCH /api/users/[username] duplicates user lookup.** It re-queries the target user inline (IIFE) and then `updateUserProfile` queries it again. Refactor to a single DAL call returning the target.
  - File: `apps/web/src/app/api/users/[username]/route.ts`

### Missing feature

- **[MISS-5] ✅ FIXED (2026-08-19). Collections UI created at `/collections` with create/delete.
- **[MISS-6] ✅ FIXED (2026-08-19). Added `/api/comments/[commentId]` PATCH/DELETE for pin, remove, delete.
- **[MISS-7] ✅ FIXED (2026-08-19). Moderation routes at `/api/admin/presets/[id]/moderate`.
- **[MISS-8] ✅ FIXED (2026-08-19). Leaderboard at `/leaderboard` powered by reputation scoring.

### Technical debt

- **[TD-4] Stale site config.** `packages/config/src/site.ts` still says "PresetHub / FL Studio presets", lists routes that don't exist (`/search`, `/creators`, `/leaderboard`, `/profile/[username]`) and misses real ones (`/home`, `/explore`, `/credits`, `/settings`). Update when rebrand is done (don't touch without being asked).
- **[TD-5] Dead code:** `lib/supabase/realtime.ts` (0 usages), cursor pagination helpers (`pagination.ts` — used nowhere), `preset_tags` join table + `tags` table (unused in practice), `data/*.ts` thin wrappers add a layer.
- **[TD-6] `select("*")`** in `getPresetById`, `getUserById`, `listPresets`, `getPresetByUsernameOrNull` — fetch only needed columns.
- **[TD-7] In-memory rate limit** — resets per serverless instance; not effective across instances. Consider a shared store (Upstash/Redis) if deploying serverless.

---

## P3 — Low / Nice-to-have

### Performance

- **[PERF-2] 34 plain `<img>` tags vs 6 `next/image`** — no optimization/format negotiation for most images. Adopt `next/image` for thumbnails/avatars.
- **[PERF-3] Mock dataset module (~1000 lines with Math.random()/Date.now() at load)** — differs between server/client renders → hydration mismatch risk; also loads on both sides. (Part of TD-3.)
- **[PERF-4] No caching strategy** — all pages dynamic; no `revalidate`/ISR for public browse pages.

### Missing feature

- **[MISS-10] ✅ FIXED (2026-08-20). Forgot password & reset password flow implemented at `/auth/forgot-password` and `/auth/reset-password`.
- **[MISS-11] Search page/route** — `/explore?q=` doubles as search (ADR-039 OPEN: CC7 vs Explore merge unresolved).
- **[MISS-12] Realtime features** — channel definitions exist (`realtime.ts`), unused. Notifications/presence/analytics could use them.

### Technical debt

- **[TD-8] Root docs are stale** (`00-README.md`–`06-*.md`, `PresetHub_Product_Specification.md`, `PresetHub_Design_System.md`, `MASTER_PROMPT.md`, `ARCHITECTURE_DECISIONS.md`): PresetHub brand, some structure predates `/home` + mobile split. (Don't touch brand without being asked.)
- **[TD-9] `ARCHITECTURE_DECISIONS.md` has OPEN ADRs** affecting future work: 018 (top bar search), 027–030 (toast/modal), 032–034 (badge queue, unfollow, account deletion), 035–039 (upload limits, style field, tag API, cropper, search). Resolve before touching those areas.
- **[TD-10] `welcome/`, `home/`, `AuthModal`, `AuthContext`, `layout-shell` are uncommitted** — commit the WIP (check with L first; there are 16 modified + 6 untracked items).

---

## Verification status (2026-08-03)

- ✅ `pnpm typecheck` — 4/4 workspaces pass
- ✅ `pnpm lint` — passes (after BUG-2 fix)
- ✅ `pnpm build` — passes (~46s)
- ✅ Unused dep check — 5 confirmed unused in `apps/web`
- ✅ No test runner anywhere (do not add test commands)

---

## Done

- **BUG-2** — `fix(ui)`: format `app-layout.tsx` to satisfy Biome lint.
- **BUG-1 / TD-3** — `fix(dal)`: env-gate mock fallback; prod surfaces DB errors and returns real empties (404 for unknown slugs/users).

---

_Maintained by the assistant (Nawala). Re-run audit checks when significant changes land._
