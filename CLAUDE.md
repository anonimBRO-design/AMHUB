# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AMHUB — a marketplace for Alight Motion presets (XML files, QR codes, and import links). It began life as "PresetHub" (FL Studio presets); the **rebrand to AMHUB is incomplete**. Package names (`@presethub/*`), `packages/config/src/site.ts`, some docs, and a few components still say PresetHub / FL Studio. Don't "fix" the brand without being asked, but know that `site.ts` and the doc markdown at the repo root are stale relative to the app.

Monorepo (Turborepo + pnpm 9, `node-linker: hoisted`). Workspaces: `apps/*`, `packages/*`, `tooling/*`.

- `apps/web` — the only app: Next.js 15 App Router, React 19, Tailwind v4, Supabase.
- `packages/ui` — atomic component library (atoms/molecules/organisms/templates/overlays) + design tokens.
- `packages/types` — hand-written Supabase `Database` type + API + component prop types.
- `packages/config` — env validation and site config.
- `supabase/migrations` — one SQL migration defining the schema, RLS policies, storage buckets.

## Commands

Run everything from the repo root (turbo drives all workspaces):

```sh
pnpm install          # install
pnpm dev              # turbo run dev — starts Next dev (web) and package watchers
pnpm build            # turbo run build
pnpm lint             # turbo run lint — each workspace runs `biome check src/`
pnpm typecheck        # turbo run typecheck — tsc --noEmit per workspace
pnpm format           # prettier --write on **/*.{ts,tsx,md} (root) / biome format --write src/
```

There is **no test runner configured** anywhere — do not invent test commands.

Lint is **Biome** (`@biomejs/biome` in root devDependencies), not ESLint. The `tooling/eslint-config` package exists but the app's `lint` script is `biome check src/`. Formatting is Biome too. Type-check is `tsc --noEmit` against `@presethub/typescript-config`.

## Environment

`apps/web/.env.local` (gitignored; template in `apps/web/.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` — project URL (`https://<ref>.supabase.co`), validated to not be a `/rest/v1` endpoint.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, used by `createSupabaseServiceClient()`.

Env validation lives in `packages/config/src/env.ts`; it skips required-checks during the Next build phase and throws at runtime. Supabase clients are typed with `PresetHubSupabaseClient` (generic `Database` from `@presethub/types`).

## Architecture — the parts you must understand before changing code

### Data access layer (the most important gotcha)

All database access goes through **`apps/web/src/dal/*.ts`** (one file per domain: presets, users, collections, comments, likes, bookmarks, notifications, uploads) plus thin wrappers in `apps/web/src/data/*.ts`.

**Critical:** nearly every DAL function wraps its query in `try/catch` and, on any error *or empty result*, silently returns fabricated rows from `apps/web/src/data/mock-data.ts` (`MOCK_PRESETS`, `MOCK_CREATORS`, `MOCK_LIKES`, `MOCK_BOOKMARKS`, `MOCK_COMMENTS`, `MOCK_NOTIFICATIONS`). Examples: `getPresetBySlug` returns `MOCK_PRESETS[0]` for any unknown slug; `getUserByUsername` falls back to `MOCK_CREATORS[0]`. **If you see data that looks "too good" or fake counts (e.g. 48,500 followers), it's the mock fallback — the DB query failed.** When working on data code, treat the mock fallback as technical debt, not a feature. The mock dataset uses `Math.random()`/`Date.now()` at module load, so it also differs between server and client renders.

### Server → client data flow (every page follows this pattern)

1. **Server component** (`app/<route>/page.tsx`) awaits `searchParams`, calls `createSupabaseServerClient()` + DAL functions.
2. Data is mapped from DAL snake_case to UI camelCase via `apps/web/src/lib/mappers.ts` (`mapPresetToCardPreset`) and passed as plain props.
3. A **client wrapper** (`<XxxClient>`) receives the props. Pages render **two compositions**: a dedicated mobile view `<MobileXView>` (`md:hidden`) and a desktop/tablet layout (`hidden md:block`). Mobile is *not* a responsive variant of desktop — it's a separate hand-written composition per page (grids, sticky bars, touch targets). Keep both in sync when changing a page.
4. Interactive actions (like / bookmark / follow / comment / profile save) call `fetch("/api/...")` route handlers directly — optimistic state updates with manual rollback on error. There is **no** react-query / zustand / SWR in use, even though `@tanstack/react-query`, `zustand`, `react-hook-form`, and `framer-motion` are in `apps/web/package.json` (unused).

### Auth

- **Server:** `createSupabaseServerClient()` (cookie-based, `cache()`d) from `apps/web/src/lib/supabase/server.ts`; `getCurrentUser` / `requireUser` / `getCurrentProfile` / `ensureUserProfile` in `lib/supabase/auth.ts`. `ensureUserProfile` auto-creates the `users` row on first login (normalizes username, retries on unique-violation).
- **Middleware** (`apps/web/middleware.ts`) only runs auth on protected routes (`/upload`, `/dashboard`, `/settings`, `/bookmarks`, `/likes`, `/notifications`); it deliberately skips public routes and redirects unauthenticated users to `/auth/login?redirectTo=...`.
- **Client:** `apps/web/src/context/AuthContext.tsx` exposes `useAuth().requireAuth(action, title)` — gates a button behind an inline `AuthModal` (Google sign-in) instead of redirecting. Use it for client-side gates; real enforcement is still the API's `requireApiProfile()`.
- OAuth callback is `app/auth/callback/route.ts`; it sanitizes `next`/`redirectTo` (blocks `//` protocol-relative).

### API route handlers

Route handlers in `app/api/**/route.ts` follow one shape:

```
try {
  requireApiProfile()            // lib/api/auth.ts — auth + profile context
  enforceRateLimit()             // lib/api/rate-limit.ts — in-memory fixed window
  validateJson / validateQuery / validateRouteParams  // Zod in lib/api/validation.ts
  <dal function>
  apiResponse() / apiCreated() / apiNoContent()       // lib/api/responses.ts
} catch (e) { apiErrorResponse(e) }
```

Centralized plumbing is in `apps/web/src/lib/api/*`: `ApiError` (code→HTTP status), `assertOwnerOrStaff`/`assertStaff`, pagination (`createPaginationMeta`, cursor helpers), typed responses with `requestId`, and a logger. Rate limiting is **in-memory only** (resets per serverless instance). All Zod errors become 422 `ApiErrorBody`.

### Uploads (presigned URL flow)

Client POSTs file metadata to `/api/uploads/preset` or `/api/uploads/avatar` → server validates size/MIME/extension against `UPLOAD_LIMITS` in `lib/api/uploads.ts`, builds an owner-scoped path `{ownerId}/{uuid}.{ext}`, and returns a signed upload URL + token → client PUTs the bytes directly to Supabase Storage → then creates the record with the returned `storage_path`. `lib/supabase/storage.ts` defines buckets: `thumbnails` and `avatars` are public-read; `preset-files` is private.

### Database & RLS

Schema lives in `supabase/migrations/20260728000000_database_foundation.sql`. Tables: `users`, `categories`, `tags`, `presets` (+ `preset_tags` join, unused in practice), `collections` / `collection_items`, `follows`, `preset_likes`, `preset_bookmarks`, `comments`, `notifications`. Counters (`like_count`, etc.) are denormalized on `presets` and updated by `syncPresetCounter` in `dal/helpers.ts` (a full count + update — O(n), deliberately simple). RLS is per-table with an `is_staff()` security-definer helper. Storage policies require the first path segment to be the user's uid.

**`packages/types/src/database.ts` is hand-written**, not generated — keep it aligned when you change the migration (the README notes `supabase gen types typescript --local > packages/types/src/database.ts` as the refresh path).

### Shared UI package

`packages/ui` is consumed **from source** (Next `transpilePackages` + `tsconfig` path aliases map `@presethub/ui*` to `packages/ui/src/*`). Its barrel `src/index.ts` re-exports everything, so unused components are easy to import. Design tokens are CSS custom properties in `packages/ui/src/tokens/tokens.css` (dark default, `[data-theme="light"]`, system-preference fallback) bridged into Tailwind v4 via the `@theme` block in `apps/web/src/styles/globals.css`. Components use `class-variance-authority` + `cn()` (clsx + tailwind-merge). Some shared organisms (e.g. `PresetDetail`, `CommentThread`, `CreatorDashboard`) are unused by the app, which uses its own per-page components instead — prefer the shared library for new shared UI, but match the surrounding page's style.

### Conventions / aliases

- `@/*` → `apps/web/src/*`. Component props and files are camelCase; DB columns and DAL returns are snake_case (mapped at the UI boundary).
- Client wrappers are named `*Client.tsx`; mobile-only compositions `Mobile*View.tsx`; page-scoped components live under `app/<route>/_components/`.
- Route handlers use `validateRouteParams(await params, schema)` (Next 15 params are Promises).
- Tailwind responsive breakpoint for the "mobile app" is `md` (768px); `globals.css` globally enforces 52px touch targets below it.
