# TODO.md — AMHUB Audit

> Prioritized findings from the repository audit (2026-08-03). Categories: bug, technical debt, missing feature, duplicated code, unused dependency, security issue, performance issue.
> Priority: **P0** = fix now (blocks/breaks things, security) · **P1** = high (important but workable around) · **P2** = medium · **P3** = low/nice-to-have.
> Source of truth for task planning. Update as items are fixed (check them off / move to a Done section).

---

## P0 — Fix now

### Security
- **[SEC-1] RLS `users_select_public` exposes PII.** `using (true)` on `users` lets anyone with the anon key read full rows — including `email`, `is_staff`, `auth_provider`, `last_active_at` — via direct PostgREST queries. Fix: restrict to public columns (or use a view / security definer), never expose `email`.
  - File: `supabase/migrations/20260728000000_database_foundation.sql`
- **[SEC-2] Social graph is fully enumerable.** `follows_select_public` and `preset_likes_select_public` use `using (true)` — anyone can enumerate who follows whom and who liked what. Consider restricting to authenticated users (or keep public only if intended).
  - File: same migration.

### Bug
- **[BUG-1] Mock fallback shows fake data on any URL in production.** `getPresetBySlug` returns `MOCK_PRESETS[0]` for unknown slugs; `getUserByUsername` returns `MOCK_CREATORS[0]` for unknown users; `getFollowerCount` falls back to hardcoded `48500`. A random `/preset/whatever` or `/u/xyz` renders fabricated content with fake follower counts. Mock fallback should be dev-only (env-gated) and should return `null`/404 in production.
  - Files: `apps/web/src/dal/presets.dal.ts`, `apps/web/src/dal/users.dal.ts`, `apps/web/src/dal/comments.dal.ts`, `apps/web/src/dal/likes.dal.ts`, `apps/web/src/dal/bookmarks.dal.ts`, `apps/web/src/dal/notifications.dal.ts`
- **[BUG-2] `pnpm lint` fails (CI breaker).** Biome formatting error in `packages/ui/src/templates/app-layout.tsx` (self-closing divs with children need to be split). Fix: `pnpm --filter @presethub/ui format` or manual reformat.

---

## P1 — High

### Security
- **[SEC-3] Third-party installer committed at repo root.** `install.cmd` downloads and installs the "Antigravity CLI" (`agy.exe`) from an external GCP Cloud Run URL into `%LOCALAPPDATA%`. It does verify SHA512 from the manifest, but it's an unvetted third-party binary in a project repo. Confirm it's intentional; if not, remove it. If kept, consider pinning the manifest URL and documenting it.
  - File: `install.cmd`

### Missing feature
- **[MISS-1] Download flow does not exist.** No `preset_downloads` table (ADR-013 resolved: guest downloads allowed — never implemented), no download API, `createSignedDownloadUrl` is dead code. Download button/counter currently has nothing real behind it.
- **[MISS-2] Notifications are never created.** No code inserts into `notifications` (only list/count/read in DAL; RLS even restricts inserts to staff). Like/comment/follow/download events should enqueue notifications. UI currently shows mock fallback.
- **[MISS-3] No real search.** Product Spec promises `GET /api/search`; app only does `ilike title` on `/explore`/`/home`. Tags/style/category search + sorting not implemented.
- **[MISS-4] No tag suggestions endpoint** (`GET /api/tags`) — blocks CC2 Tag Input suggestions (ADR-037).

### Performance
- **[PERF-1] Root layout does 2–3 Supabase round-trips on EVERY page** (public too): `getCurrentProfile()` (auth getUser + profile select) + `getUnreadNotificationCount()`. Cache per-request (React `cache()` is already used for the client, but the count query isn't scoped) and skip work for anonymous users (already skipped for count, but profile is fetched even for anons → 2 queries for nothing). Consider `unstable_cache`/ISR for static-ish pages.
  - File: `apps/web/src/app/layout.tsx`

### Technical debt
- **[TD-1] `SUPABASE_SERVICE_ROLE_KEY` required but service client never instantiated.** `createSupabaseServiceClient` exists (exported, type-only used) but no route uses it. Either use it (admin/staff operations) or drop the env requirement to avoid deploy-time failures.
- **[TD-2] Unused dependencies (apps/web):** `@tanstack/react-query`, `zustand`, `framer-motion`, `react-hook-form`, `@hookform/resolvers` — 0 imports each. Remove from `package.json` (or document why they stay).
- **[TD-3] Mock fallback pattern** is the single biggest architectural debt: ~10 DAL functions silently swallow DB errors. See BUG-1. Plan: env-gate mock, log errors, return 404/null.

---

## P2 — Medium

### Bug
- **[BUG-3] `getPresetStorageBucket(fileType)` ignores its argument** (`void fileType; return presetFiles`) — misleading API; callers assume per-type bucket logic. Either implement or remove the param.
  - File: `apps/web/src/lib/supabase/storage.ts`
- **[BUG-4] Mock notification types diverge from DB.** `MockNotification.type` includes `"approval" | "moderation"` which don't exist in the `notifications_type_check` constraint → future insert would fail.
  - File: `apps/web/src/data/mock-data.ts`
- **[BUG-5] `GET /api/presets` selects ALL statuses** (no status filter). RLS masks it today, but the endpoint's contract is ambiguous vs. `listPublishedPresets`. Add explicit `status=published` for public listing or mark as staff/admin endpoint.
  - File: `apps/web/src/app/api/presets/route.ts`

### Duplicated code
- **[DUP-1] Route param schemas repeated.** `{ id: z.string().uuid() }` defined in 4+ route files; `usernameRouteParamsSchema` in 2 files; `getSafeRedirectPath` in 2 files (`auth/callback/route.ts`, `auth/login/page.tsx`). Consolidate into `lib/api/validation.ts` or a shared `lib/api/schemas.ts`.
- **[DUP-2] PATCH /api/users/[username] duplicates user lookup.** It re-queries the target user inline (IIFE) and then `updateUserProfile` queries it again. Refactor to a single DAL call returning the target.
  - File: `apps/web/src/app/api/users/[username]/route.ts`

### Missing feature
- **[MISS-5] Collections have no UI.** Full CRUD API exists (`/api/collections*`) but no `/collections` page; bookmarks can reference `collection_id` but users can't create/manage collections.
- **[MISS-6] No comment moderation.** Schema supports `is_pinned`/`is_removed`/`like_count`, trigger enforces single reply level — but no API to pin/remove/like comments and no UI.
- **[MISS-7] Admin panel absent** (T4 template specified desktop-only per ADR-026). No moderation routes for pending presets.
- **[MISS-8] XP/level, badges, trending_score, quality_score** — columns exist, never computed. Leaderboard page doesn't exist either.

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
- **[MISS-9] Preview video upload** — only `preview_video_url` (external URL) supported; no video bucket/upload. ADR-012: previews are silent-only by policy (not enforced at upload).
- **[MISS-10] Email confirmation flow** exists (`status=check_email`) but register → confirm → login UX is basic; no resend/forgot-password.
- **[MISS-11] Search page/route** — `/explore?q=` doubles as search (ADR-039 OPEN: CC7 vs Explore merge unresolved).
- **[MISS-12] Realtime features** — channel definitions exist (`realtime.ts`), unused. Notifications/presence/analytics could use them.

### Technical debt
- **[TD-8] Root docs are stale** (`00-README.md`–`06-*.md`, `PresetHub_Product_Specification.md`, `PresetHub_Design_System.md`, `MASTER_PROMPT.md`, `ARCHITECTURE_DECISIONS.md`): PresetHub brand, some structure predates `/home` + mobile split. (Don't touch brand without being asked.)
- **[TD-9] `ARCHITECTURE_DECISIONS.md` has OPEN ADRs** affecting future work: 018 (top bar search), 027–030 (toast/modal), 032–034 (badge queue, unfollow, account deletion), 035–039 (upload limits, style field, tag API, cropper, search). Resolve before touching those areas.
- **[TD-10] `welcome/`, `home/`, `AuthModal`, `AuthContext`, `layout-shell` are uncommitted** — commit the WIP (check with L first; there are 16 modified + 6 untracked items).

---

## Verification status (2026-08-03)

- ✅ `pnpm typecheck` — 4/4 workspaces pass
- ❌ `pnpm lint` — fails on `packages/ui/src/templates/app-layout.tsx` formatting (BUG-2)
- ✅ `pnpm build` — passes (~1m25s)
- ✅ Unused dep check — 5 confirmed unused in `apps/web`
- ✅ No test runner anywhere (do not add test commands)

---

*Maintained by the assistant (Nawala). Re-run audit checks when significant changes land.*
