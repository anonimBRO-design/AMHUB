# ARCHITECTURE.md — AMHUB

> **Technical architecture reference for this repository.** Must stay in sync with the implementation.
> If you change a flow described here, update this file in the same commit.
> Companion docs: `PROJECT.md` (project overview / source of truth) and `TODO.md` (audit findings).
> Read `CLAUDE.md` in the repo root for the "gotchas" that every contributor must know.

**Last updated:** 2026-08-03
**Verified against:** `pnpm typecheck` ✅ · `pnpm build` ✅ · `pnpm lint` ✅ (2026-08-03, BUG-2 fixed)

---

## 0. Sync Contract (keep this doc honest)

This document is considered stale if any of these change without the doc being updated:

1. A new route/page under `apps/web/src/app/**` (page or API).
2. A change in `supabase/migrations/*` (tables, RLS policies, storage buckets, triggers).
3. A change in `apps/web/src/dal/*` or `apps/web/src/lib/**` (clients, auth, api plumbing, mappers).
4. A change in dependency graph (`package.json` of `apps/web` or `packages/*`).
5. A change in the middleware matcher/protected routes.
6. A change in the mobile/desktop split pattern (`Mobile*View` / `hidden md:block`).

Verification loop after any change: `pnpm typecheck` → `pnpm lint` → `pnpm build` → update the "Verified against" line.

---

## 1. Dependency Graph

```mermaid
graph TD
    subgraph external["External services"]
        SUPABASE["Supabase<br/>(Postgres + PostgREST + Auth + Storage)"]
    end

    subgraph web["apps/web (Next.js 15, React 19)"]
        APP["app/ (pages + API routes)"]
        MIDDLEWARE["middleware.ts"]
        CTX["context/AuthContext.tsx"]
        DAL["dal/ (data access layer)"]
        DATA["data/ (mock-data + thin wrappers)"]
        LIB["lib/ (api/*, supabase/*, mappers, server)"]
        STYLES["styles/globals.css"]

        APP --> DAL
        APP --> LIB
        APP --> CTX
        MIDDLEWARE -.-> SUPABASE
        LIB --> DAL
        DATA --> DAL
        DAL --> SUPABASE
        LIB --> SUPABASE
    end

    subgraph packages["Workspace packages (source-consumed via transpilePackages)"]
        UI["@presethub/ui<br/>atoms/molecules/organisms/<br/>templates/overlays/tokens"]
        TYPES["@presethub/types<br/>hand-written Database type<br/>+ API/component types"]
        CONFIG["@presethub/config<br/>env validation + site.ts"]
    end

    subgraph tooling["tooling/*"]
        BIOME["Biome (lint/format)"]
        TSC["TypeScript (typecheck)"]
        TURBO["Turborepo (task orchestration)"]
    end

    web --> packages
    APP --> UI
    APP --> TYPES
    APP --> CONFIG
    UI --> TYPES
    BIOME --> web
    BIOME --> packages
    TSC --> web
    TSC --> packages
    TURBO --> web
    TURBO --> packages

    subgraph root["Root files"]
        INSTALL["install.cmd<br/>(Antigravity CLI installer — 3rd-party)"]
        DOCS["00-README..06, PresetHub_*,<br/>ARCHITECTURE_DECISIONS, MASTER_PROMPT<br/>(stale brand — see PROJECT.md §11)"]
    end
```

**Key external dependencies (apps/web):** `next`, `react`, `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `lucide-react`, `tailwindcss@4`.
**Installed but UNUSED (apps/web):** `@tanstack/react-query`, `zustand`, `framer-motion`, `react-hook-form`, `@hookform/resolvers` — do not import them; remove them when the rebrand cleanup lands (TODO TD-2).
**packages/ui deps:** `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot` (1 use), `@floating-ui/react` (1 use), `lucide-react`.

---

## 2. Request Flow

Two distinct request families:

### 2a. Server-rendered page request (SSR)

```mermaid
sequenceDiagram
    participant B as Browser
    participant M as middleware.ts
    participant P as Server Component (page.tsx)
    participant A as lib/supabase/auth.ts
    participant C as createSupabaseServerClient (react cache)
    participant D as dal/*.ts
    participant DB as Supabase

    B->>M: GET /home?search=...
    alt public route (not in protectedRoutes)
        M-->>P: pass through (no auth check — optimization)
    else protected route (/upload, /dashboard, ...)
        M->>C: getUser() via cookies
        alt no user
            M-->>B: 307 → /auth/login?redirectTo=/dashboard
        else user
            M-->>P: continue (session cookies refreshed)
        end
    end
    P->>A: getCurrentProfile() / getCurrentUser() (cached)
    A->>C: supabase client (cookies from request)
    C-->>A: client
    A->>DB: select users by id
    P->>D: listPublishedPresets(client, {search, category})
    D->>DB: select presets + creator (joined), RLS-filtered
    D-->>P: rows (snake_case) — dev: MOCK fallback · prod: real rows/errors ⚠️
    P->>P: lib/mappers.ts (snake_case → camelCase)
    P->>P: render <Mobile*View> (md:hidden) + desktop (hidden md:block)
    P-->>B: HTML (RSC payload + static shell)
```

### 2b. Client API request (fetch /api/...)

```mermaid
sequenceDiagram
    participant B as Browser (client wrapper)
    participant R as Route Handler (app/api/**/route.ts)
    participant RL as lib/api/rate-limit.ts
    participant Z as lib/api/validation.ts (Zod)
    participant D as dal/*.ts
    participant DB as Supabase

    B->>R: fetch("/api/presets/[id]/like", POST, optimistic UI first)
    R->>R: requireApiProfile() → getUser + ensureUserProfile
    R->>RL: enforceRateLimit({scope, limit, windowMs, userId})
    alt rate limited
        RL-->>R: ApiError(rate_limited) → 429 + Retry-After
    end
    R->>Z: validateJson/validateQuery/validateRouteParams(schema)
    alt invalid
        Z-->>R: ApiError(unprocessable_entity) → 422 (Zod issues)
    end
    R->>D: dal function (like, bookmark, follow, ...)
    D->>DB: mutate + syncPresetCounter()
    D-->>R: result
    R-->>B: apiResponse({data, error:null, meta:{requestId}})
    Note over B: rollback optimistic update on non-ok
```

---

## 3. Auth Flow

**Stack:** Supabase Auth (email/password + Google OAuth) via `@supabase/ssr` cookie-based sessions.

- **Browser client:** `createSupabaseBrowserClient()` (`lib/supabase/client.ts`) — used in `auth/login`, `auth/register`, `AuthModal`.
- **Server client:** `createSupabaseServerClient()` (`lib/supabase/server.ts`) — cookie store from `next/headers`, wrapped in React `cache()`; `setAll` swallowed in Server Components (only middleware/route handlers can write cookies).
- **Profile bootstrap:** `ensureUserProfile(user)` — after auth, upserts a `users` row: normalizes username (`^[a-z0-9_]{3,24}$`, lowercased, fallback `user_<id8>`), display name from metadata, avatar from metadata, `auth_provider` from `app_metadata.provider`; retries on unique-violation (`23505`) with `username_<id8>`.
- **Server-side helpers** (`lib/supabase/auth.ts`): `getCurrentUser` (React `cache()`), `requireUser` (redirect → `/auth/login`), `getCurrentProfile` (user + profile, bootstraps if missing).
- **Client-side gating** (`context/AuthContext.tsx`): `useAuth().requireAuth(action, title)` — if logged in runs `action()`, else opens `AuthModal` (Google sign-in) with an optional title. No redirect; the modal is the gate.

```mermaid
sequenceDiagram
    participant B as Browser
    participant LP as /auth/login (client)
    participant CB as /api/auth/callback
    participant AU as lib/supabase/auth.ts
    participant DB as Supabase Auth + users

    alt Email/password
        B->>LP: submit email+password
        LP->>DB: signInWithPassword()
        DB-->>LP: session (cookies set)
        LP-->>B: router.push(redirectTo || "/home")
    else Google OAuth (AuthModal)
        B->>B: useAuth().requireAuth(action) → AuthModal opens
        B->>DB: signInWithOAuth({provider:"google"})
        DB-->>B: redirect to /api/auth/callback?code=...
    end
    CB->>DB: exchangeCodeForSession(code)
    CB->>AU: ensureUserProfile(user)
    AU->>DB: select users → insert if missing (retry 23505)
    CB-->>B: 307 → next || "/home"

    Note over B,DB: Middleware refreshes cookies on protected routes<br/>Session cookie name: sb-<ref>-auth-token (@supabase/ssr)
```

**Logout:** `GET /api/auth/logout` → `supabase.auth.signOut()` → redirect `/auth/login`.

---

## 4. Upload Flow (presigned URL)

**Design:** the server never sees file bytes. Client POSTs metadata → server validates + issues a short-lived signed upload URL → client PUTs bytes directly to Supabase Storage → server persists the `storage_path`.

- **Endpoints:** `POST /api/uploads/preset` (xml | qr | thumbnail, 10/min) and `POST /api/uploads/avatar` (5/min).
- **Limits** (`lib/api/uploads.ts` `UPLOAD_LIMITS`): avatar 5MB, thumbnail 10MB, presetXml 5MB, presetQr 5MB — MIME + extension allowlists per kind.
- **Path scheme:** `{ownerId}/{uuid}.{ext}` — owner prefix enables RLS folder ownership; extension derived from MIME allowlist, never from client filename.
- **Sanitization:** `sanitizeFilename` (NFC normalize, strip null bytes, basename only, `[^a-zA-Z0-9._-]` → `_`, ≤200 chars).
- **Buckets:** `thumbnails` (public), `avatars` (public), `preset-files` (private — served via signed URL when downloads exist; currently **no download endpoint**, TODO MISS-1).

```mermaid
sequenceDiagram
    participant W as UploadWizard (client)
    participant R as POST /api/uploads/preset
    participant U as lib/api/uploads.ts
    participant S as lib/supabase/storage.ts
    participant ST as Supabase Storage

    W->>R: {upload_type, filename, content_type, size}
    R->>R: requireApiProfile() + enforceRateLimit (10/min)
    R->>U: validateJson (zod discriminated union) → prepareUpload()
    U->>U: validateFileMetadata (size/MIME/ext allowlist)
    U->>U: buildStoragePath(ownerId, mime) → {ownerId}/{uuid}.{ext}
    U->>S: createSignedUploadUrl(bucket, path)
    S->>ST: createSignedUploadUrl
    ST-->>U: {signedUrl, token}
    U-->>R: {upload_url, token, storage_path, bucket, original_filename}
    R-->>W: 200 {data:{...}} (no file bytes!)
    W->>ST: PUT upload_url (body: File, Content-Type)
    ST-->>W: 200 (object stored at storage_path)
    W->>R: POST /api/presets (create record — see §5)
```

---

## 5. Preset Publishing Flow

`UploadWizard` (`apps/web/src/app/upload/_components/`) is a 4-step client wizard: **Format & File → Thumbnail → Details → Review & Publish**. Form state is local `useState` (no react-hook-form).

Steps at publish time (in order, single handler):

1. Prepare + PUT **thumbnail** (if provided) via `/api/uploads/preset` → keep `storage_path`.
2. Prepare + PUT **preset file** (if `xml`/`qr`) via `/api/uploads/preset` → keep `storage_path`. (`link` type skips files; `am_link` is stored instead.)
3. **Create record:** `POST /api/presets` with `{slug, title, description, thumbnail_url, file_type, file_url?, am_link?, category, difficulty}`. Slug is generated client-side: `title → kebab-case` + `-` + last 4 digits of `Date.now()`.
4. `router.push(/preset/${slug})`.

Server side (`POST /api/presets`): `requireApiProfile` → rate limit (10/min) → Zod validate → `createPreset` DAL → row inserted with **`status = 'pending'`** (default) → RLS means only owner/staff can see it until `status = 'published'` → there is **no moderation/admin UI yet** (TODO MISS-7), so published presets can only appear via direct DB update or a future staff flow.

```mermaid
flowchart TD
    A[UploadWizard step 1: file type] -->|link| B[am_link input]
    A -->|xml/qr| C[FilePicker: presetFile]
    B --> D[Step 2: ThumbnailStep]
    C --> D
    D --> E[Step 3: DetailsStep: title/desc/category/difficulty]
    E --> F[Step 4: ReviewStep]
    F --> G{submit}
    G --> H["POST /api/uploads/preset (thumbnail)"]
    H --> I[PUT signed URL → storage]
    I --> J{fileType != link?}
    J -->|yes| K["POST /api/uploads/preset (xml/qr)"]
    K --> L[PUT signed URL → storage]
    J -->|no| M[skip file upload]
    L --> N[POST /api/presets]
    M --> N
    N --> O[status = pending]
    O --> P{RLS visibility}
    P -->|owner / staff| Q[visible in detail page]
    P -->|everyone else| R[not visible until published]
    Q --> S[router.push /preset/slug]
```

---

## 6. Supabase Interaction

Three client constructors — all typed with the hand-written `Database` from `@presethub/types`:

| Constructor | Location | Cookies? | Used by |
|---|---|---|---|
| `createSupabaseBrowserClient()` | `lib/supabase/client.ts` | yes (browser) | login/register pages, AuthModal |
| `createSupabaseServerClient()` | `lib/supabase/server.ts` | yes (request cookies) | pages, route handlers, DAL |
| `createSupabaseServiceClient()` | `lib/supabase/server.ts` | no (service role) | **unused** (dead code, TODO TD-1) |

- **Typing:** `PresetHubSupabaseClient = ReturnType<typeof createBrowserClient<Database>>` — the server client is cast to this type; `DalClient` in `dal/types.ts` is an alias of it.
- **Env validation:** `validatePublicEnv()` (URL + anon key) runs in both clients; `validateServerEnv()` (adds `SUPABASE_SERVICE_ROLE_KEY`) only in the service client. During Next build both skip required checks; they throw at runtime.
- **Storage:** `lib/supabase/storage.ts` — `storageBuckets` map, `getPresetStorageBucket(fileType)` (⚠️ ignores its argument, TODO BUG-3), `createSignedDownloadUrl` (⚠️ dead code), `createSignedUploadUrl` (used by uploads).
- **Realtime:** `lib/supabase/realtime.ts` exists but **nothing subscribes** (TODO TD-5).

```mermaid
graph LR
    subgraph app["apps/web"]
        BROWSER[createSupabaseBrowserClient] --> SA[Supabase Auth + DB<br/>anon key, user-scoped]
        SERVER[createSupabaseServerClient<br/>react cache + request cookies] --> SA
        SERVICE[createSupabaseServiceClient<br/>service role] -.->|never instantiated| SA
        DAL[dal/*.ts] --> SERVER
        ROUTES[API route handlers] --> SERVER
        PAGES[Server components] --> SERVER
        STORAGE[lib/supabase/storage.ts] --> SB[Supabase Storage<br/>thumbnails / avatars / preset-files]
    end
    subgraph supabase["Supabase project"]
        SA --> PG[(Postgres + RLS)]
        SB --> PG
    end
```

---

## 7. RLS Flow

**Model:** every table has `alter table ... enable row level security` + named policies. Privilege escalation helper: `is_staff()` — a `security definer` function that checks `users.is_staff` for the current `auth.uid()` (immune to direct table reads).

```mermaid
sequenceDiagram
    participant C as PostgREST (anon key)
    participant P as RLS policy engine
    participant F as is_staff() (security definer)
    participant T as Table rows

    C->>P: SELECT/INSERT/UPDATE/DELETE with JWT (anon or user)
    P->>P: resolve auth.uid() from JWT
    alt no policy passes
        P-->>C: empty set / permission denied
    else policy passes (e.g. presets: published OR owner OR staff)
        P->>F: staff check (for staff branch)
        P-->>C: allowed rows
    end
    T-->>P: candidate rows (filtered)
```

**Key policies (from `supabase/migrations/20260728000000_database_foundation.sql`):**

| Table | Policy | Effect |
|---|---|---|
| `users` | `users_select_public using (true)` | anyone can read **full rows incl. `email`** ⚠️ TODO SEC-1 |
| `presets` | published visible; own visible; staff visible | draft/pending/rejected hidden from public |
| `preset_likes` | `preset_likes_select_public using (true)` | anyone can enumerate likes ⚠️ TODO SEC-2 |
| `follows` | `follows_select_public using (true)` | social graph enumerable ⚠️ TODO SEC-2 |
| `comments` | select public; insert own; no update/delete for users | moderation not exposed (TODO MISS-6) |
| `notifications` | `notifications_staff_insert` | **only staff can insert** — yet nothing inserts (TODO MISS-2) |
| Storage buckets | first path segment must equal `auth.uid()`; staff override | users can only touch their own folder |

**Rule of thumb for DAL code:** RLS is the final gate — a DAL query may return fewer rows than requested; the app must not assume PostgREST bypasses it (the service client would, but it's unused).

---

## 8. DAL Flow

**Layering (strict):** Server Component / Route Handler → `data/*.ts` (thin re-export wrappers) → `dal/*.ts` → Supabase client. UI code never touches `supabase` directly; route handlers only via `lib/api/auth.ts` contexts.

```mermaid
flowchart TD
    subgraph consumers["Consumers"]
        PAGES["Server components (pages)"]
        ROUTES["API route handlers"]
    end
    subgraph wrappers["Thin wrappers (data/)"]
        DP["data/presets.ts"]
        DU["data/users.ts"]
        DN["data/notifications.ts"]
    end
    subgraph dal["DAL (dal/)"]
        DPRESET["presets.dal.ts"]
        DUSER["users.dal.ts"]
        DCOL["collections.dal.ts"]
        DCOM["comments.dal.ts"]
        DLIKE["likes.dal.ts"]
        DBOK["bookmarks.dal.ts"]
        DNOTIF["notifications.dal.ts"]
        DUPL["uploads.dal.ts"]
        DHELP["helpers.ts: assertExists,<br/>handleDuplicateKey, syncPresetCounter"]
    end
    subgraph mock["data/mock-data.ts (dev-only fallback)"]
        M["MOCK_PRESETS, MOCK_CREATORS,<br/>MOCK_LIKES, MOCK_BOOKMARKS,<br/>MOCK_COMMENTS, MOCK_NOTIFICATIONS"]
    end
    subgraph db["Supabase"]
        DB[("Postgres via typed client")]
    end

    PAGES --> DP
    PAGES --> DU
    PAGES --> DN
    ROUTES --> DPRESET
    ROUTES --> DUSER
    ROUTES --> DCOL
    ROUTES --> DCOM
    ROUTES --> DLIKE
    ROUTES --> DBOK
    ROUTES --> DNOTIF
    ROUTES --> DUPL
    DP --> DPRESET
    DU --> DUSER
    DN --> DNOTIF
    DPRESET --> DB
    DUSER --> DB
    DCOL --> DB
    DCOM --> DB
    DLIKE --> DB
    DBOK --> DB
    DNOTIF --> DB
    DUPL --> DB
    DPRESET -.->|error/empty → dev only| M
    DUSER -.->|error/empty → dev only| M
    DCOM -.->|error/empty → dev only| M
    DLIKE -.->|error/empty → dev only| M
    DBOK -.->|error/empty → dev only| M
    DNOTIF -.->|error/empty → dev only| M
```

**⚠️ Mock fallback (was a critical gotcha — FIXED 2026-08-03, TODO BUG-1):** now env-gated via `dal/mock-fallback.ts` (`isMockFallbackEnabled` = non-production). Query error → dev: log + mock · prod: rethrow. Empty → dev: mock · prod: real empty (`null`/`[]`/`0`). `getPresetBySlug`/`getUserByUsernameOrNull`/`getUserById` return `null` for unknown keys (pages 404); `getUserByUsername` throws `ApiError(not_found)` in prod.

**Shared helpers (`dal/helpers.ts`):**
- `assertExists(data, msg)` → throws `ApiError(not_found)`.
- `handleDuplicateKey(err, msg)` → rethrows as `ApiError(conflict)` when Postgres code `23505`.
- `syncPresetCounter(client, presetId, table, column)` → full `COUNT(*)` + `UPDATE presets` (O(n), intentionally simple). Used after like/bookmark/comment mutations. Comments count excludes `is_removed`.

**Naming contract:** DAL returns **snake_case** (DB shape); UI shape (camelCase) produced by `lib/mappers.ts` `mapPresetToCardPreset` at the page boundary.

---

## 9. Server Component ↔ Client Component Interaction

**Pattern (per page):** Server Component (async, awaits `searchParams`) → builds data → passes **plain serializable props** to a thin client wrapper → wrapper renders the two view compositions. Client wrappers own all interactivity; they re-fetch via `fetch("/api/...")` and mutate local state optimistically.

```mermaid
sequenceDiagram
    participant S as Server Component (page.tsx)
    participant D as DAL
    participant M as lib/mappers.ts
    participant C as Client Wrapper (*Client.tsx)
    participant V as Mobile*View + Desktop view
    participant API as /api/... (route handler)

    S->>D: await listPublishedPresets(...)
    D-->>S: snake_case rows (or mock ⚠️)
    S->>M: map to camelCase PresetCardPreset[]
    S->>C: <HomeClient presets={...} searchQuery={...}/>
    C->>V: render <MobileHomeFeed/> (md:hidden) + desktop (hidden md:block)
    V->>API: onClick → fetch("/api/presets/[id]/like", POST)
    V->>V: optimistic update (setState)
    API-->>V: {data, error}
    alt error
        V->>V: rollback + toast (packages/ui overlays)
    end
```

**Rules:**
- Props crossing the boundary must be serializable (no functions, no Date instances — timestamps as ISO strings).
- Server components never import client components' state; the client wrapper is the *only* bridge.
- `useAuth().requireAuth()` lives in client land; `getCurrentProfile()` in server land — same truth, two mechanisms.

---

## 10. Mobile / Desktop Rendering

**Breakpoint:** `md` (768px) is the app's mobile boundary — set in `packages/ui/src/tokens/tokens.css` and enforced in `apps/web/src/styles/globals.css` (52px touch targets below `md`).

**Two compositions per page — not responsive variants.** Each page that has mobile-specific UX ships:
- `<Mobile*View>` rendered inside `md:hidden` (hand-written mobile layout, often bottom-sheet/native-feel), and
- the desktop/tablet layout inside `hidden md:block`.

```mermaid
flowchart TD
    P[Page server component] --> C[Client wrapper]
    C --> MOB["<div class='md:hidden'><br/><MobileHomeFeed .../></div>"]
    C --> DESK["<div class='hidden md:block'><br/><Hero/> <SearchBar/> ... desktop composition</div>"]
    MOB --> S1[Same props: presets, categories, searchQuery]
    DESK --> S1
    S1 --> SYNC["⚠️ Keep both compositions in sync —<br/>they are separate DOM trees, not CSS variants"]
```

Files following this pattern today: `home/`, `bookmarks/`, `dashboard/`, `explore/`, `likes/`, `preset/[slug]/`, `u/[username]/` (each with a `Mobile*View.tsx` + desktop composition). Shared chrome in `packages/ui`: `mobile-bottom-nav` (mobile) vs `navigation-sidebar` + `top-bar` (desktop), composed by `apps/web/src/app/_components/layout-shell.tsx`.

---

## 11. API Lifecycle

Uniform envelope: `{ data, error, meta: { requestId, ... } }` (types in `packages/types/src/api.ts`). Every handler is a `try/catch` around the same pipeline:

```mermaid
flowchart LR
    REQ[Request] --> A1["requireApiProfile — lib/api/auth.ts"]
    A1 -->|unauthorized 401| ERR
    A1 --> A2["enforceRateLimit — lib/api/rate-limit.ts"]
    A2 -->|rate_limited 429| ERR
    A2 --> A3["validateJson/Query/RouteParams — lib/api/validation.ts + Zod"]
    A3 -->|unprocessable_entity 422| ERR
    A3 --> A4[DAL call]
    A4 -->|ApiError e.g. not_found 404 / conflict 409| ERR
    A4 --> OK["apiResponse / apiCreated / apiNoContent"]
    ERR["apiErrorResponse — toApiError: ZodError→422, SyntaxError→400, unknown→500 (details hidden, requestId kept)"]
    OK --> OUT[Response]
    ERR --> OUT
    OUT --> H["RateLimit-* headers + Retry-After"]
```

**Details:**
- **Status codes** (`lib/api/errors.ts`): 400 bad_request · 401 unauthorized · 403 forbidden · 404 not_found · 409 conflict · 413 payload_too_large · 415 unsupported_media_type · 422 unprocessable_entity · 429 rate_limited · 500 internal_server_error.
- **Authorization guards** (`lib/api/authorization.ts`): `assertAuthorized`, `assertSameUser`, `assertStaff`, `assertOwnerOrStaff`.
- **Rate limiting** (`lib/api/rate-limit.ts`): key = `{scope}:user:{userId}` or `{scope}:ip:{ip}`; `MemoryRateLimitStore` (⚠️ per-instance only, TODO TD-7); returns `RateLimit-*` headers.
- **Logging** (`lib/api/logger.ts`): `apiLogger.{debug,info,warn,error}` with `requestId`, method, path, userId; debug suppressed in production.
- **Pagination** (`lib/api/pagination.ts`): page-based (`page`/`limit`, default 24, max 100) — used everywhere; cursor helpers exist but unused (TODO TD-5).
- **Next 15:** dynamic route params are `Promise` → `validateRouteParams(await params, schema)`.

---

## 12. Caching

Current state — deliberately minimal, mostly per-request:

| Layer | Mechanism | Scope | Notes |
|---|---|---|---|
| Supabase server client | React `cache()` in `lib/supabase/server.ts` | per request tree | dedupes client creation within one render |
| `getCurrentUser` / `getCurrentProfile` | React `cache()` in `lib/supabase/auth.ts` | per request tree | dedupes auth lookup + profile select |
| Rate limit store | in-memory `Map` | per server instance | ⚠️ resets on cold start (TODO TD-7) |
| Pages | none (all dynamic) | — | no `revalidate`/ISR (TODO PERF-4) |
| Images | 6× `next/image`, 34× plain `<img>` | — | TODO PERF-2 |
| Mock data | dev-only (BUG-1 fixed); module-load `Math.random()`/`Date.now()` | per process | dev-only; PERF-3 tracks removal |

```mermaid
flowchart TD
    REQ[One request tree] --> C1["cache(): createSupabaseServerClient"]
    REQ --> C2["cache(): getCurrentUser"]
    C2 --> C3["cache(): getCurrentProfile"]
    C1 --> DAL[DAL calls]
    C2 --> MID[Middleware refresh<br/>cookies only, no caching]
    DAL --> DB[(Supabase)]
    subgraph across["Across requests"]
        RL["in-memory rate limit Map (per instance)"]
        MOCK["mock data module state (per process)"]
    end
```

**Consequence:** every page render = 2–3 round-trips (auth + profile + unread count) even for anonymous visitors (TODO PERF-1). No Redis/Upstash/ISR anywhere.

---

## 13. Middleware

`apps/web/middleware.ts` — Next.js edge middleware (file lives at `apps/web/`, not under `src/`).

**Matcher:** everything except static assets (`_next/static`, `_next/image`, `favicon.ico`, image extensions).

**Logic:**
1. `validatePublicEnv()`; if Supabase env missing → protect nothing (redirect protected routes to login defensively, else pass).
2. **Optimization:** if pathname is NOT in `protectedRoutes` → return early (no auth API call on public pages).
3. For protected routes, build `@supabase/ssr` server client over `request.cookies`, call `auth.getUser()`; refresh session cookies on response.
4. No user → redirect `/auth/login?redirectTo={pathname}{search}` (safe: `redirectTo` validated on the client and in callback route).
5. Errors (Supabase unreachable) are swallowed → request continues (page-level guards still apply).

```mermaid
flowchart TD
    REQ[Request] --> MATCH{"matcher: static asset?"}
    MATCH -->|yes| SKIP[pass through]
    MATCH -->|no| ENV{"env configured?"}
    ENV -->|no| PROTECTED1{"protected route?"}
    PROTECTED1 -->|yes| REDIR1["→ /auth/login"]
    PROTECTED1 -->|no| PASS1[pass through]
    ENV -->|yes| PROTECTED2{"protected route? /upload /dashboard /settings /bookmarks /likes /notifications"}
    PROTECTED2 -->|no| PASS2[pass through — no auth API call]
    PROTECTED2 -->|yes| GETUSER[createServerClient + getUser]
    GETUSER -->|user| REFRESH[refresh session cookies → continue]
    GETUSER -->|no user| REDIR2["→ /auth/login?redirectTo=..."]
    GETUSER -->|error| SWALLOW[swallow → continue]
```

---

## 14. State Management

**No global state library.** react-query/zustand are installed but unused (TODO TD-2). The actual strategy:

| Concern | Mechanism |
|---|---|
| Server-truth (current user, profiles, lists) | Server components + DAL per request |
| Client auth gate | `AuthContext` (`context/AuthContext.tsx`): `currentUser` prop + `requireAuth()` + `AuthModal` open state |
| Page-local UI state | `useState` in client wrappers / `Mobile*View` |
| Server mutations (like/bookmark/follow/comment) | `fetch("/api/...")` + **optimistic update** (setState immediately, rollback on error) |
| URL state (search, category, pagination) | `searchParams` (server) / `useSearchParams` (client) — no state library |
| Form state (upload wizard, login) | local `useState` (no react-hook-form) |
| Toasts/modals | `packages/ui` overlays (toast, modal) — component-level state |

```mermaid
flowchart LR
    subgraph server["Server side (source of truth)"]
        DB[(Supabase)]
        DAL[DAL]
        SC[Server Components]
    end
    subgraph client["Client side (ephemeral only)"]
        CTX["AuthContext (useAuth)"]
        STATE["useState in wrappers/views"]
        OPT["optimistic fetch updates"]
    end
    SC -->|serializable props| CTX
    SC -->|serializable props| STATE
    OPT -->|GET/POST /api/*| DAL
    DB --> DAL
```

**Rule:** never duplicate server truth in a client store; if a client value must survive navigation, keep it in the URL (`searchParams`), not in memory.

---

## 15. Folder Ownership

| Path | Owns | Must not |
|---|---|---|
| `apps/web/src/app/**` | routes, pages, page-scoped components (`_components/`) | DB queries (use DAL), business rules |
| `apps/web/src/app/api/**` | HTTP contract: auth gate, rate limit, validation, response envelope | SQL, UI |
| `apps/web/src/middleware.ts` | session refresh + route protection | business logic |
| `apps/web/src/dal/**` | all Supabase queries/mutations, counters, error→`ApiError` mapping | HTTP concerns |
| `apps/web/src/data/**` | mock dataset + thin DAL re-exports for pages | raw queries |
| `apps/web/src/lib/api/**` | API plumbing: auth context, errors, rate-limit, validation, responses, uploads, pagination, logger | routes, DAL |
| `apps/web/src/lib/supabase/**` | client factories, auth helpers (server-side), storage URLs | domain logic |
| `apps/web/src/lib/mappers.ts` | snake_case→camelCase shape mapping | queries |
| `apps/web/src/context/**` | client-side auth context (AuthProvider/useAuth) | data fetching |
| `packages/ui/src/**` | presentational components + tokens (atomic design) | Supabase, Next-specific APIs |
| `packages/types/src/**` | shared types (Database, API, components) | runtime logic |
| `packages/config/src/**` | env validation + site config | app logic |
| `supabase/migrations/**` | schema, RLS, triggers, storage buckets | app code |
| `supabase/seed.sql` | taxonomy only (categories/tags) — **no fake users/presets** | fake content |

```mermaid
graph TD
    subgraph ownership["Ownership boundaries"]
        UI["packages/ui + types + config"] -->|props only| WEB["apps/web"]
        WEB --> ROUTES["app/**"]
        ROUTES --> API["app/api/**"]
        API --> LIBAPI["lib/api/**"]
        ROUTES --> DAL["dal/**"]
        LIBAPI --> DAL
        DAL --> DB[(Supabase)]
        ROUTES --> MAPPERS["lib/mappers.ts"]
        ROUTES --> DATA["data/**"]
        MID["middleware.ts"] --> AUTH["lib/supabase/auth.ts"]
    end
```

**Enforcement:** no `@/dal` imports in `packages/*`; no `supabase` client imports in components; no raw `fetch` to Supabase REST in app code (everything through DAL or `/api`).

---

## 16. Diagram Index

| Flow | Diagram | Section |
|---|---|---|
| Dependency graph | `graph TD` (workspaces + external) | §1 |
| SSR page request | `sequenceDiagram` | §2a |
| Client API request | `sequenceDiagram` | §2b |
| Auth (login + OAuth + callback + bootstrap) | `sequenceDiagram` | §3 |
| Upload (presigned URL) | `sequenceDiagram` | §4 |
| Preset publishing | `flowchart TD` (wizard steps) | §5 |
| Supabase clients | `graph LR` | §6 |
| RLS enforcement | `sequenceDiagram` | §7 |
| DAL + mock fallback | `flowchart TD` | §8 |
| Server ↔ Client props | `sequenceDiagram` | §9 |
| Mobile/Desktop split | `flowchart TD` | §10 |
| API lifecycle | `flowchart LR` | §11 |
| Caching layers | `flowchart TD` | §12 |
| Middleware decision tree | `flowchart TD` | §13 |
| State management | `flowchart LR` | §14 |
| Folder ownership | `graph TD` | §15 |

---

*Maintained by the assistant (Nawala). Update in the same commit as any change to the flows above (see §0 Sync Contract).*
