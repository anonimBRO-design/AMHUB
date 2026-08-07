# PROJECT.md — AMHUB

> **Source of truth for this repository.** Read this before starting any task.
> Update this file whenever there is a significant change (schema, architecture, new API, new page, dependency changes, resolved debt).

**Last updated:** 2026-08-03
**Branch:** `main` (ahead of origin by 7 commits at last check — plus uncommitted mobile/auth work)
**Remote:** https://github.com/anonimBRO-design/AMHUB

---

## 1. Tujuan Project

AMHUB is a **marketplace for Alight Motion presets**: creators upload preset files (XML), QR codes, or import links; users browse, search, like, bookmark, follow, comment, and download.

- Primary audience: mobile-first, data-conscious users (Indonesian market), e.g. persona "Dinda, 15yo, mobile".
- The project began life as **PresetHub** (FL Studio presets). **The rebrand to AMHUB is incomplete**: package names are still `@presethub/*`, `packages/config/src/site.ts` and root docs (`00-README.md`, `PresetHub_*.md`, `MASTER_PROMPT.md`, `ARCHITECTURE_DECISIONS.md`, `01–06-*.md`) are stale. **Do not "fix" the brand unless asked.**
- Design/product history lives in `PresetHub_Product_Specification.md`, `PresetHub_Design_System.md`, and `ARCHITECTURE_DECISIONS.md` (ADR backlog — some OPEN).

---

## 2. Arsitektur

**Monorepo** — Turborepo + pnpm 9 (`node-linker: hoisted`, `shamefully-hoist: true`). Workspaces: `apps/*`, `packages/*`, `tooling/*`.

```
apps/web          → the ONLY app. Next.js 15 App Router, React 19, Tailwind v4, Supabase.
packages/ui       → atomic component library (atoms/molecules/organisms/templates/overlays) + design tokens.
packages/types    → hand-written Supabase Database type + API + component prop types (NOT generated).
packages/config   → env validation (env.ts) + site config (site.ts — STALE brand).
tooling/          → eslint/prettier/typescript configs (NOT used for lint — the app lints with Biome).
supabase/         → migrations (1 SQL file) + seed.sql (categories + tags taxonomy).
```

**Key architectural facts (must-read):**

- **Data access layer** — ALL DB access goes through `apps/web/src/dal/*.ts` (one file per domain: presets, users, collections, comments, likes, bookmarks, notifications, uploads) plus thin re-export wrappers in `apps/web/src/data/*.ts`.
- **CRITICAL GOTCHA (sebagian besar FIXED 2026-08-03)** — hampir semua fungsi DAL sebelumnya wrap query di `try/catch` dan **silently fallback ke mock data** (`apps/web/src/data/mock-data.ts`) saat error ATAU hasil kosong. Sekarang di-gate: `dal/mock-fallback.ts` — error → dev: mock / prod: rethrow; kosong → dev: mock / prod: null/[]/0. `getPresetBySlug`/`getUserByUsernameOrNull`/`getUserById` tidak lagi fallback ke `MOCK_PRESETS[0]`/`MOCK_CREATORS[0]` (slug/user tak dikenal → 404). Mock data di dev tetap dipakai biar UI dev tetap hidup.
- **Page pattern** — Server component → DAL → `lib/mappers.ts` (snake_case → camelCase) → client wrapper → **TWO separate compositions per page**: `Mobile*View` (`md:hidden`) + desktop (`hidden md:block`). Mobile is NOT a responsive variant; it's hand-written per page. Keep both in sync.
- **Interactions** — like/bookmark/follow/comment call `fetch("/api/...")` route handlers directly with optimistic updates + manual rollback. **react-query / zustand / framer-motion / react-hook-form are installed but NOT used.**
- **Auth** — Supabase cookie-based. Middleware protects only `/upload /dashboard /settings /bookmarks /likes /notifications`. Server: `getCurrentUser` / `requireUser` / `getCurrentProfile` / `ensureUserProfile` (auto-creates `users` row on first login, username normalization + unique-violation retry). Client: `AuthContext.tsx` exposes `useAuth().requireAuth(action, title)` → inline `AuthModal` (Google sign-in) instead of redirect.
- **API routes** — uniform shape: `try { requireApiProfile() → enforceRateLimit() → validateJson/Query/RouteParams (Zod) → DAL → apiResponse/apiCreated/apiNoContent } catch { apiErrorResponse }`. Plumbing in `apps/web/src/lib/api/*` (`ApiError`, `assertOwnerOrStaff`/`assertStaff`, pagination, typed responses with `requestId`, logger). Rate limiting is **in-memory only** (resets per serverless instance). Zod errors → 422.
- **Uploads** — presigned URL flow: client POSTs metadata → server validates size/MIME/ext (`UPLOAD_LIMITS`) → returns signed upload URL + token + storage path `{ownerId}/{uuid}.{ext}` → client PUTs bytes directly to Supabase Storage → persists `storage_path`. Buckets: `thumbnails` (public, 10MB), `avatars` (public, 5MB), `preset-files` (private, 5MB).
- **Shared UI** — consumed from source (`transpilePackages` + tsconfig path aliases). Barrel `packages/ui/src/index.ts` re-exports everything. Design tokens: CSS custom properties in `packages/ui/src/tokens/tokens.css`, bridged to Tailwind v4 via `@theme` in `apps/web/src/styles/globals.css`. Components use `class-variance-authority` + `cn()`. Some shared organisms (`PresetDetail`, `CommentThread`, `CreatorDashboard`, overlays) are unused by the app — the app uses its own per-page components.

---

## 3. Dependency Penting

**Root:** turbo ^2, typescript ^5.4, @biomejs/biome ^1.8 (lint/format), prettier (root format script).

**apps/web** (deps in `package.json`):

| Dependency                                      | Status                 |
| ----------------------------------------------- | ---------------------- |
| next ^15, react ^19, react-dom ^19              | core                   |
| @supabase/ssr ^0.5, @supabase/supabase-js ^2.45 | auth + DB              |
| @presethub/{ui,types,config} (workspace)        | internal               |
| lucide-react                                    | icons (86 uses)        |
| zod ^3.23                                       | validation (14 files)  |
| tailwindcss ^4 + @tailwindcss/postcss           | styling                |
| **@tanstack/react-query ^5.56**                 | **UNUSED** (0 imports) |
| **zustand ^4.5**                                | **UNUSED**             |
| **framer-motion ^11.5**                         | **UNUSED**             |
| **react-hook-form ^7.53**                       | **UNUSED**             |
| **@hookform/resolvers ^3.9**                    | **UNUSED**             |

**packages/ui:** class-variance-authority, clsx, tailwind-merge, @radix-ui/react-slot (1 use), lucide-react, @floating-ui/react (1 use).

**Not installed (but ADR-022 says to add):** `recharts` (creator dashboard chart was never implemented).

---

## 4. Coding Convention

- **Lint/format:** Biome (`biome check src/`), NOT ESLint. `tooling/eslint-config` exists but is unused. Root: `pnpm lint` / `pnpm format` (prettier on md), per-workspace: biome.
- **Type-check:** `tsc --noEmit` per workspace (`pnpm typecheck`). **No test runner — do NOT invent test commands.**
- **Aliases:** `@/*` → `apps/web/src/*`. Component props/files camelCase; DB columns & DAL returns snake_case (mapped at UI boundary via `lib/mappers.ts`).
- **Naming:** client wrappers `*Client.tsx`; mobile-only `Mobile*View.tsx`; page-scoped components under `app/<route>/_components/`.
- **Next 15:** route handler `params` are Promises → `validateRouteParams(await params, schema)`.
- **Breakpoint:** mobile app = `md` (768px); `globals.css` enforces 52px touch targets below it.
- **Type discipline:** `packages/types/src/database.ts` is hand-written and must stay aligned with the migration (refresh path: `supabase gen types typescript --local > packages/types/src/database.ts`).
- Do not "fix" PresetHub branding without being asked.

---

## 5. Alur Data

```
Browser (client wrapper / Mobile*View)
   │  fetch("/api/...") + optimistic update
   ▼
API route handler (apps/web/src/app/api/**/route.ts)
   │  requireApiProfile → enforceRateLimit → Zod validate → DAL
   ▼
DAL (apps/web/src/dal/*.ts)  ── supabase client (typed PresetHubSupabaseClient)
   │  try/catch → on error/empty: mock fallback (mock-data.ts)
   ▼
Supabase (PostgREST + RLS) → storage buckets (presigned uploads)

Server-rendered pages:
Server component (app/<route>/page.tsx)
   → createSupabaseServerClient() + data/*.ts (wrapper) + dal
   → lib/mappers.ts (snake → camel)
   → client wrapper component receives plain props
   → renders Mobile*View (md:hidden) + desktop (hidden md:block)
```

---

## 6. Struktur Folder

```
apps/web/
  middleware.ts               # auth gate untuk protected routes saja
  next.config.js              # transpilePackages @presethub/*, outputFileTracingRoot
  src/
    app/
      page.tsx                # entry: redirect /home kalau login, else WelcomeClient
      layout.tsx              # root layout: getCurrentProfile + unread count
      _components/            # layout-shell, AuthModal, welcome/, home/* (page-scoped)
      home/ explore/ dashboard/ upload/ settings/ bookmarks/ likes/
      notifications/ credits/ preset/[slug]/ u/[username]/ auth/{login,register,callback,logout}
      api/
        presets/  (+[id], [id]/like, [id]/bookmark, [id]/comments)
        users/[username]/ (+follow)
        collections/ (+[id])
        uploads/ (preset, avatar)
    context/AuthContext.tsx   # useAuth().requireAuth + AuthModal
    dal/                      # presets, users, collections, comments, likes, bookmarks, notifications, uploads, helpers, types
    data/                     # mock-data.ts (MOCK_*), presets.ts, users.ts, notifications.ts (thin wrappers)
    lib/
      api/                    # auth, authorization, errors, logger, pagination, rate-limit, responses, uploads, validation
      supabase/               # client (browser), server (cookie), auth, storage, realtime (unused)
      mappers.ts server.ts
    styles/globals.css
packages/
  ui/src/                     # atoms/ molecules/ organisms/ templates/ overlays/ tokens/ lib/utils (cn)
  types/src/                  # database.ts (hand-written), api.ts, components.ts
  config/src/                 # env.ts, site.ts (STALE brand), index.ts
supabase/
  migrations/20260728000000_database_foundation.sql
  seed.sql
tooling/                      # eslint-config, prettier-config, typescript-config
*.md root                     # 00-README, 01–06 (design system), PresetHub_*, MASTER_PROMPT, ARCHITECTURE_DECISIONS, CLAUDE.md (all stale brand, some stale structure)
install.cmd                   # Antigravity CLI installer (third-party, committed at root — verify intent)
```

---

## 7. API yang Tersedia

All handlers: `{ data, error, meta }` envelope, `requestId`, rate-limited, Zod-validated (422 on failure).

| Method & Path                            | Auth      | Notes                                                                |
| ---------------------------------------- | --------- | -------------------------------------------------------------------- |
| GET /api/presets                         | anon      | page+limit+category; selects ALL statuses (RLS restricts visibility) |
| POST /api/presets                        | user      | create preset (10/min)                                               |
| GET /api/presets/[id]                    | anon      | by UUID                                                              |
| POST/DELETE /api/presets/[id]/like       | user      | 30/min; upsert + counter sync                                        |
| POST/DELETE /api/presets/[id]/bookmark   | user      | optional collection_id; 30/min                                       |
| GET/POST /api/presets/[id]/comments      | anon/user | paginated; create 15/min                                             |
| GET/PATCH /api/users/[username]          | anon/user | profile + follow counts + is_following                               |
| POST/DELETE /api/users/[username]/follow | user      | 30/min                                                               |
| GET/POST /api/collections                | anon/user | public list; create 20/min                                           |
| GET/PATCH/DELETE /api/collections/[id]   | anon/user | owner/staff enforced                                                 |
| POST /api/uploads/preset                 | user      | xml/qr/thumbnail → presigned URL (10/min)                            |
| POST /api/uploads/avatar                 | user      | presigned URL (5/min)                                                |
| GET /api/auth/callback                   | anon      | OAuth exchange + ensureUserProfile                                   |
| GET /api/auth/logout                     | anon      | signOut → /auth/login                                                |

**Missing vs Product Spec A§16:** no `GET /api/search`, no `GET /api/tags`, no downloads endpoint, no notification-generation endpoints, no comment moderation (delete/pin/like) endpoints.

---

## 8. Database Schema

Single migration: `supabase/migrations/20260728000000_database_foundation.sql`. RLS enabled per-table, `is_staff()` security-definer helper.

| Table            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| users            | id = auth.users.id (FK cascade); username unique lower; display_name, email unique lower; xp/level; is_verified/is_staff; socials; `users_username_format ^[a-z0-9_]{3,24}$`; bio ≤280                                                                                                                                                                                                                                                                                    |
| categories       | slug unique; color_token; is_active; sort_order                                                                                                                                                                                                                                                                                                                                                                                                                           |
| tags             | slug unique; usage_count                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| presets          | slug unique; creator_id FK; file_type xml/qr/link with location CHECK (xml/qr → file_url, link → am_link); category FK → categories(slug); style/tags text[] (≤10 each, GIN-indexed); difficulty; **am_version_min/max**; device_support array; denormalized counters (download/view/like/bookmark/comment_count); trending_score/quality_score (never computed); status pending/published/rejected/removed; is_featured; rejection_reason; title ≤100, description ≤2000 |
| preset_tags      | join table — **unused in practice** (presets.tags text[] is used instead)                                                                                                                                                                                                                                                                                                                                                                                                 |
| collections      | owner_id FK; slug unique per owner; is_public; preset_count                                                                                                                                                                                                                                                                                                                                                                                                               |
| collection_items | PK (collection_id, preset_id); sort_order                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| follows          | PK (follower_id, following_id); no self-follow CHECK                                                                                                                                                                                                                                                                                                                                                                                                                      |
| preset_likes     | PK (preset_id, user_id)                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| preset_bookmarks | PK (preset_id, user_id); optional collection_id (SET NULL)                                                                                                                                                                                                                                                                                                                                                                                                                |
| comments         | parent_id (single reply level enforced by trigger `validate_comment_parent`); body ≤500; is_pinned/is_removed; like_count                                                                                                                                                                                                                                                                                                                                                 |
| notifications    | type in like/comment/follow/download/system; actor_id/preset_id SET NULL; is_read                                                                                                                                                                                                                                                                                                                                                                                         |

**Storage buckets:** `thumbnails` (public, 10MB, jpeg/png/webp), `avatars` (public, 5MB), `preset-files` (private, 5MB, xml + images). RLS: first path segment must equal `auth.uid()`; staff override.

**Counters:** `syncPresetCounter` in `dal/helpers.ts` — full COUNT + UPDATE (O(n), deliberately simple).

**RLS highlights / issues:** `users_select_public using(true)` exposes full rows (incl. **email**, is_staff, auth_provider, last_active_at) to anyone with the anon key. `follows_select_public` / `preset_likes_select_public` expose the full social graph. Presets visible only when published / own / staff. `notifications_staff_insert` — only staff can insert (yet nothing ever inserts notifications).

---

## 9. Komponen Utama

**packages/ui (atomic):**

- atoms: avatar, badge, button, divider, input, skeleton, spinner, tag, textarea
- molecules: badge-chip, comment-item, creator-card, download-button, filter-chip, notification-item, preset-card, search-bar, stat-card, video-player, xp-progress-bar
- organisms: challenge-card, comment-thread, creator-dashboard, leaderboard-panel, mobile-bottom-nav, navigation-sidebar, preset-detail, preset-grid, profile-header, top-bar, upload-wizard
- overlays: badge-unlock, confirmation-dialog, dropdown-menu, modal, toast, tooltip
- templates: auth-layout, app-layout (+ public/admin layouts specified in docs, not implemented)
- tokens: `tokens.css` (dark default, `[data-theme="light"]`, system-preference)

**Apps/web page components:** `layout-shell`, `AuthModal`, `welcome/*`, `home/*` (Hero, SearchBar, CategoryScroller, FeaturedSection, PresetCarousel, CreatorSection, StatsSection, Footer, MobileHomeFeed), `Mobile*View` per page, `UploadWizard`, per-page `_components` (BookmarkButton, CommentSection, FollowSection, etc.).

**Unused shared organisms** (app uses its own per-page components): PresetDetail, CommentThread, CreatorDashboard, ChallengeCard, LeaderboardPanel, all overlays except Modal/Toast usage.

---

## 10. Workflow Build

```sh
pnpm install        # node-linker: hoisted
pnpm dev            # turbo run dev (Next dev + package watchers)
pnpm build          # turbo run build  ✅ verified passing (2026-08-03, ~1m25s)
pnpm lint           # biome check src/  ✅ verified passing (2026-08-03, after BUG-2 fix)
pnpm typecheck      # tsc --noEmit     ✅ verified passing (2026-08-03, 4/4)
pnpm format         # prettier (root md) / biome format --write (workspaces)
```

- Env: `apps/web/.env.local` (gitignored). `validatePublicEnv`/`validateServerEnv` in `packages/config/src/env.ts` skip required-checks during build phase, throw at runtime.
- **No test runner anywhere.** Do not add test commands.

---

## 11. Hal yang Belum Selesai (Incomplete)

- **Rebrand PresetHub → AMHUB belum selesai** (package names, site.ts, root docs) — jangan diperbaiki tanpa diminta.
- **Uncommitted work in progress** (branch ahead 7 + dirty tree): dedicated mobile compositions per page, `AuthModal` + `AuthContext`, new `/home` page + `welcome/`, layout-shell refactor, `CLAUDE.md`, `.claude/`. **Belum di-commit / belum di-push.**
- **Download flow tidak ada:** no `preset_downloads` table, no download API, `createSignedDownloadUrl` defined but never used. (ADR-013 resolved: guest downloads allowed — belum diimplementasi.)
- **Notifications tidak pernah dibuat** oleh event (like/comment/follow) — DAL hanya list/count/read; UI fallback ke mock.
- **XP / level / badges / achievements** hanya di mock data; tidak ada logika perhitungan.
- **trending_score / quality_score** kolom ada, tidak pernah dihitung.
- **Search:** tidak ada `/api/search`; `/explore?q=` pakai ilike title saja.
- **Tag suggestions** (ADR-037) tidak ada endpoint `/api/tags`.
- **Admin panel** (T4, desktop-only per ADR-026) belum ada; tidak ada moderation UI/routes.
- **/leaderboard, /creators, /search** routes ada di site.ts tetapi tidak ada halamannya (app punya /home, /explore, /credits).
- **Collections:** API lengkap, **tidak ada halaman UI** (/collections).
- **Creator dashboard chart** (Recharts, ADR-022) belum diimplementasi.
- **Comments:** tidak ada like/pin/delete endpoints (schema mendukung).
- **Realtime** (`lib/supabase/realtime.ts`) didefinisikan, tidak dipakai.
- **Cursor pagination helpers** ada, tidak dipakai (semua page-based).
- **register page** ada; **Google OAuth** di AuthModal; **email confirmation** flow ada di login (status=check_email).

---

## 12. Technical Debt

1. ~~**Mock fallback di DAL**~~ — **FIXED (2026-08-03)**: env-gated di `dal/mock-fallback.ts`; prod tidak lagi menyembunyikan error DB / menampilkan data palsu. Sisa: `mock-data.ts` masih pakai `Math.random()`/`Date.now()` saat module load (lihat PERF-3).
2. **Branding PresetHub** — package names, site.ts, docs root.
3. **Unused dependencies** — react-query, zustand, framer-motion, react-hook-form, @hookform/resolvers di apps/web.
4. **Dead code** — `createSupabaseServiceClient` (tidak pernah di-instantiate, tapi `SUPABASE_SERVICE_ROLE_KEY` wajib di env), `createSignedDownloadUrl`, `realtime.ts`, cursor pagination helpers, `preset_tags` table, `getPresetStorageBucket` (mengabaikan param).
5. **Duplicated validation schemas** — `routeParamsSchema {id: uuid}` di 4+ route files; `usernameRouteParamsSchema` di 2 file; `getSafeRedirectPath` di 2 file.
6. **Duplicated user lookup** — PATCH /api/users/[username] melakukan inline query + `updateUserProfile` query ulang.
7. **Thin wrapper layer** `data/*.ts` hanya re-export DAL (intentional, tapi menambah lapisan).
8. **Rate limiting in-memory** — tidak efektif di serverless multi-instance.
9. **`lint` gagal** karena formatting app-layout.tsx.
10. **Root docs stale** — 00-README sampai 06, PresetHub_*, MASTER_PROMPT (brand lama, beberapa struktur lama: /search, /creators, /leaderboard).
11. **install.cmd** — installer CLI pihak ketiga (Antigravity/agy) di root repo; verifikasi apakah disengaja; ada SHA512 verify, tapi tetap third-party binary.
12. **`select("*")`** di beberapa DAL (getPresetById, getUserById, listPresets) — fetch semua kolom.
13. ~~**Mock data hydration mismatch**~~ — **FIXED (2026-08-03, dengan BUG-1)**: mock hanya dipakai di dev; prod pakai data asli.

---

## 13. Roadmap (inferred from docs/ADR, not an official plan)

- **Phase 0 (sekarang):** stabilkan rebrand & cleanup — commit WIP, perbaiki lint, hapus unused deps, matikan mock fallback di produksi (atau flag dev-only).
- **Phase 1 (content core):** download flow (preset_downloads + signed URL + counter), notification generation on events, real search API, tag suggestions.
- **Phase 2 (community):** collections UI, comment moderation (pin/delete/like), admin panel (desktop-only), leaderboard & creators pages, XP/badges engine.
- **Phase 3 (creators):** creator dashboard analytics (Recharts), trending/quality scoring, featured curation workflow.
- **Ongoing:** resolve OPEN ADRs (018/027–030/032–038/039 backlog), Realtime features, image optimization (next/image), caching strategy.

---

_Maintained by the assistant (Nawala) as the single source of truth. Update on significant changes._
