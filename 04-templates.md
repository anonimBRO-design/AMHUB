# PresetHub Component Library — 04. Templates

**Source of truth for existing specs:** `PresetHub_Design_System.md` §17 "TEMPLATES"  
**This file:** preserves those specs verbatim, appends Accessibility / Responsive / Motion / Composition where the source was silent.

---

## What Templates Are

Templates are page-level shells. They own the persistent chrome (navigation, header, footer), enforce layout constraints (sidebar offset, content max-width, safe-area padding), and provide the `#main-content` landmark that all skip-links target. They receive a single `children` prop — the page's organism(s) — and nothing else. They hold no application state and make no data fetches.

Every page in PresetHub renders within exactly one template. The four templates are mutually exclusive; switching between them happens at the Next.js route-group layout boundary, not inside a component.

**Component IDs T1–T4** are inherited from Product Spec §7 Component Architecture. T4 AdminLayout has no corresponding entry in Design System §17 (which defines only T1–T3) — it is documented here as **[DOCUMENTATION GAP FILL]** from Product Spec §7 and §3 Site Map, and requires design review before implementation.

---

## T1 — AppLayout

### Purpose
*(verbatim from Design System §17)*

Wraps all authenticated routes.

### Variants
*(no variants — single shell; the interior organisms O1/O2/O3 adapt by breakpoint)*

**Structure** *(verbatim):*

```
<AppLayout>
  <TopBar />                          ← O3, spans full viewport width
  <div className="flex">
    <Sidebar />                       ← O1, hidden xs/sm
    <main id="main-content">
      {children}                      ← Page organism(s)
    </main>
    <RightPanel />                    ← Visible xl+ only
  </div>
  <MobileNav />                       ← O2, visible xs/sm only
</AppLayout>
```

**Right Panel anatomy** *(from Product Spec §6.2 Home Feed, §9 Responsive Breakpoints):*

```
RIGHT PANEL (280px, xl+ only)
  ─────────────────────────
  Active Challenge card (O10)
  ─────────────────────────
  Leaderboard top 5 (O11)
  ─────────────────────────
  Creator of the Week (M2 CreatorCard)
```

The Right Panel is a layout slot, not a named component — it is part of the AppLayout shell and is populated by passing Right Panel content as a prop or slot. It is only rendered on pages where it is relevant (primarily the Home Feed). On other authenticated pages (e.g. `/upload`, `/dashboard`, `/notifications`) the Right Panel slot is empty and the main content area expands to fill the space.

### Props — *[GAP FILL — not specified in source]*

```typescript
interface AppLayoutProps {
  children: React.ReactNode              // Page main content
  rightPanel?: React.ReactNode           // Optional Right Panel content (xl+ only)
  // Navigation and user state are sourced from auth context / route context
  // inside the layout — not passed as props from pages. This keeps pages clean.
}
```

The current authenticated user, active route, unread notification count, and similar session-level state are read from context (Zustand `authStore`, `notificationStore`) inside the layout's child organisms (O1, O2, O3). Pages do not thread these as props through AppLayout.

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Default (authenticated, desktop `lg+`) | O1 sidebar expanded (220px), O3 TopBar at top, main content offset by sidebar width, Right Panel visible if `rightPanel` prop provided |
| Tablet (`md`, 768–1023px) | O1 sidebar collapsed (64px, icon-only), main content offset by 64px, Right Panel hidden |
| Mobile (`xs`/`sm`, <768px) | O1 hidden, O3 TopBar visible, O2 MobileNav at bottom, main content full-width, `padding-bottom` to clear MobileNav |
| Right Panel empty | Main content expands to `flex-1`, no right panel column rendered |
| Right Panel populated | Main content `flex-1 min-w-0`, Right Panel `width: 280px flex-shrink-0` — only visible at `xl+` |
| Unauthenticated (redirect) | AppLayout itself never renders for unauthenticated users — middleware redirects to `/auth/login` before the layout mounts |

### Accessibility — *[GAP FILL]*

- The outermost element is a plain `<div>` (or React fragment) — no landmark role on the shell wrapper itself. Landmark roles are on the organisms within: `<header role="banner">` (O3), `<nav aria-label="Main navigation">` (O1), `<nav aria-label="Mobile navigation">` (O2), `<main id="main-content">` (the content area).
- **Skip link:** The first focusable element in the DOM, before any navigation chrome, is the skip link specified in Design System §13:
  ```html
  <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-accent-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md">
    Skip to main content
  </a>
  ```
  This is placed as the first child of `<body>` (or the root layout), outside AppLayout's flex shell, so it is always the first tab stop regardless of sidebar or header markup.
- The `<main id="main-content">` element must receive `tabIndex={-1}` so that the skip link's `href="#main-content"` moves keyboard focus into the main content region programmatically (browsers do not focus non-focusable elements from anchor navigation by default).
- At the `md` breakpoint, O1 sidebar is collapsed (icon-only) but still present in the DOM and tab order. O1's own accessibility spec (see `03-organisms.md` O1 Accessibility) handles `sr-only` labels for icon-only nav items. AppLayout's responsibility is ensuring the collapsed sidebar's tab-stop count does not create an excessive tabbing distance before `#main-content` is reached — the skip link exists exactly for this reason.
- O2 MobileNav is `position: fixed` at the bottom. The main content area must have sufficient `padding-bottom` so the last focusable element on the page is not obscured by the fixed nav bar. The `padding-bottom` value equals the MobileNav height (approximately 64px + `env(safe-area-inset-bottom)`).
- The Right Panel, when present, is `<aside aria-label="Sidebar">` — an ARIA complementary landmark. It contains secondary content (leaderboard, challenge card, creator spotlight) that supplements but does not duplicate the main content.
- Route changes (Next.js navigation): on each route change, focus should move to `#main-content` or to the page's `<h1>` — not left at the link that was clicked. This is a Next.js App Router concern, but AppLayout should implement a focus-management effect that fires after navigation to ensure consistent behavior. Screen reader users depend on this to hear the new page's heading after navigation.

### Responsive Behavior — *[GAP FILL, with reference to Design System §8 and §9]*

| Breakpoint | O1 Sidebar | O3 TopBar | Main content `padding-left` | Right Panel | O2 MobileNav |
|---|---|---|---|---|---|
| `xs` (<480px) | Hidden | Full width | `0` | Hidden | Visible (56px height + safe area) |
| `sm` (480–767px) | Hidden | Full width | `0` | Hidden | Visible |
| `md` (768–1023px) | 64px (icon only) | Full width | `64px` | Hidden | Hidden |
| `lg` (1024–1279px) | 220px (expanded) | Full width | `220px` | Hidden | Hidden |
| `xl` (1280–1535px) | 220px (expanded) | Full width | `220px` | 280px (if `rightPanel` prop provided) | Hidden |
| `2xl` (≥1536px) | 220px (expanded) | Full width | `220px` | 280px | Hidden |

- Main content area `max-width`: no global cap within AppLayout. Individual organisms set their own content max-widths (e.g. O7 Upload Wizard caps at 640px centered within the `<main>` area; O4 PresetGrid fills available width).
- O3 TopBar `height: 64px`. Main content area has `padding-top: 64px` to clear the sticky TopBar.
- The flex container (`<div className="flex">`) uses `align-items: flex-start` so sidebar and main content don't stretch to equal heights — sidebar is position:fixed; the flex div's height is driven by main content only.
- Content `min-height: calc(100vh - 64px)` (full viewport minus TopBar) ensures short-content pages don't leave an empty half-screen before the MobileNav.

### Motion Behavior — *[GAP FILL]*

Tier 2 — Transition (page navigation), Tier 3 — Entrance (initial authenticated mount).

| Animation | Property | Duration | Easing | Source |
|---|---|---|---|---|
| Page route change (children swap) | `opacity` 0→1 + `translateY(8px→0)` on the `<main>` content area | `--dur-normal` (250ms) | `--ease-out` | Product Spec §11 "Route change: fade + translate-y 8px→0, 250ms ease-out" (verbatim) |
| Page route exit | `opacity` 1→0 + `translateY(0→-8px)` | `--dur-fast` (200ms) | `--ease-in` | Design System §10 "Page Transition: exit opacity 1→0 + translateY 0→-8px, 200ms ease-in" (verbatim) |
| Sidebar expand/collapse at `md`↔`lg` breakpoint | Width transition — **[OPEN QUESTION → ADR-009 principle]:** width animation causes reflow; this transition is driven by a CSS breakpoint (not a user toggle), so it is better suppressed entirely (instant) rather than animated. Animating a resize-driven layout change risks jarring behavior during window resize. Recommend instant swap at breakpoint. | — | — | Design System §10 "What NOT to Animate: Width/height" |

`prefers-reduced-motion`: page transition is instant opacity swap only (no translateY); breakpoint sidebar swap is always instant regardless of motion preference.

AppLayout does not animate the Right Panel in/out — it is either present in the DOM (at `xl+`) or absent (below `xl`). Animating it would require layout recalculation. Individual organisms within the Right Panel handle their own entrance animations (O10, O11, M2).

### Design Tokens — *[GAP FILL]*

AppLayout contributes structural layout values rather than visual tokens. All visual tokens belong to the organisms it contains.

- O3 TopBar height: `64px` (layout constant, not a spacing-scale value — it is a fixed structural dimension)
- O1 sidebar expanded width: `220px` (layout constant)
- O1 sidebar collapsed width: `64px` (layout constant)
- Right Panel width: `280px` (layout constant, per Design System §9 "Navigation Behavior: Sidebar + right panel visible" at `xl/2xl`)
- Main content `padding-top`: `64px` (matches O3 TopBar height)
- Main content `padding-bottom` on mobile: `env(safe-area-inset-bottom) + 64px` (clears O2 MobileNav)
- Main content horizontal padding: `--space-4` (16px) on `xs`/`sm`; `--space-6` (24px) on `md+`
- Z-index stack: O3 TopBar and O1 Sidebar at `--z-sticky`; O2 MobileNav at `--z-sticky`; overlays (modals, dropdowns, toasts) at higher z-index layers per Design System §6

### Composition Examples — *[GAP FILL]*

T1 AppLayout is the shell for every authenticated route:

| Route | `children` | `rightPanel` |
|---|---|---|
| `/` (Home Feed) | Feed tabs + O4 PresetGrid | O10 ChallengeCard + O11 LeaderboardPanel + M2 CreatorCard |
| `/explore` | Search hero + filter bar + O4 PresetGrid | — |
| `/trending` | O4 PresetGrid (trending sort) | — |
| `/challenges` | O10 ChallengeCard hero + past/upcoming lists | — |
| `/bookmarks` | O4 PresetGrid (saved presets) | — |
| `/notifications` | Notification feed (M5 NotificationItem list) | — |
| `/upload` | O7 Upload Wizard | — |
| `/dashboard` | O9 Creator Dashboard | — |
| `/settings` | Settings forms | — |

---

## T2 — PublicLayout

### Purpose
*(verbatim from Design System §17)*

Wraps public pages (landing, preset page, profile).

### Variants
*(no variants — single shell, with contextual header behaviour)*

**Structure** *(verbatim):*

```
<PublicLayout>
  <PublicHeader />                    ← Logo + Nav + Auth buttons
  <main id="main-content">
    {children}                        ← Page organism(s)
  </main>
  <Footer />
</PublicLayout>
```

**PublicHeader anatomy** *(derived from Product Spec §6.1 Landing Page structure and §3 Navigation Structure):*

```
[PresetHub logo]    [Browse Presets]  [Trending]  [Challenges]    [Log In]  [Get Started →]
```

The PublicHeader is a simplified navigation bar for unauthenticated visitors. It is distinct from O3 TopBar (authenticated app header) — do not share the component. PublicHeader has no notification bell, no avatar menu, and no search bar (the Landing Page has its own full-width search in the hero; preset and profile pages use their own in-page controls).

When a user is authenticated but navigates to a public route (e.g. `/preset/:slug`, `/u/:username`), the PublicLayout should detect auth state and adapt: replace "Log In" / "Get Started" with the user's avatar and a link to the app. This prevents showing a logged-in user prompts to register.

**Footer anatomy** *(derived from Product Spec §3 Site Map — no footer explicitly specified in source docs):*

```
[PresetHub logo]   "The home of Alight Motion creators."

Links:             Explore · Trending · Challenges · Creators
Creators:          Upload · Dashboard · Docs (future)
Company:           About · Blog (future) · Contact

© 2026 PresetHub. All rights reserved.   [TikTok] [Discord] [Instagram]
```

**ADR-024 RESOLVED:** The inferred footer structure above is approved as documented. The footer is ready for implementation as specified. Responsive layout: 4-column grid at `lg+`; 2-column grid at `md`; single-column stacked at `xs`/`sm`.

### Props — *[GAP FILL — not specified in source]*

```typescript
interface PublicLayoutProps {
  children: React.ReactNode
  // Current user (if authenticated) read from auth context inside the layout.
  // Pages do not pass user state as props — the layout reads it independently
  // so that any public page automatically adapts the header for logged-in users.
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Unauthenticated visitor | PublicHeader shows "Log In" + "Get Started" CTAs |
| Authenticated user on public route | PublicHeader replaces auth CTAs with user avatar (A4, size `sm`) + dropdown (Dashboard, Settings, Sign out) |
| PublicHeader at top of page | Transparent or `--color-bg-base` background (no blur) |
| PublicHeader on scroll (Landing Page hero) | Solid `--color-bg-surface` background after scrolling past hero — same glassmorphism principle as O3, but only on Landing; on other public pages the header is always solid |
| Footer | Always solid `--color-bg-surface`, no scroll interaction |

### Accessibility — *[GAP FILL]*

- **Skip link:** Identical pattern to T1 AppLayout — the first focusable element in the DOM is `<a href="#main-content">Skip to main content</a>`. This is required on public pages too, since the PublicHeader contains navigation links that keyboard users would otherwise tab through on every page load.
- PublicHeader renders as `<header role="banner">` — the page's primary banner landmark. There must be exactly one `<header role="banner">` per page; the children passed via `{children}` must not contain another `<header>` element.
- PublicHeader navigation links render as `<nav aria-label="Primary navigation">` within the header, containing `<a>` elements (not buttons — they navigate, not act).
- The "Get Started →" CTA is an `<a href="/auth/register">` styled as a primary button — it is a link to a new page, not a form submission action. Use `<a>` not `<button>`, per Design System §13 semantic HTML rule: "Use correct elements: `<a>` for links."
- "Log In" is similarly an `<a href="/auth/login">`.
- Footer renders as `<footer>` — the page's ARIA contentinfo landmark. Social links within the footer are `<a href="..." rel="noopener noreferrer" target="_blank" aria-label="[Platform name]">` since the link content is an icon only.
- Footer navigation groups use `<nav aria-label="[Section Name]">` (e.g. `aria-label="Explore PresetHub"`, `aria-label="For Creators"`) within the footer — multiple `<nav>` elements are permitted per page as long as each has a distinct `aria-label`.
- `<main id="main-content" tabIndex={-1}>` — same focus-management requirement as T1.
- On public pages that are server-rendered (e.g. `/preset/:slug` via Next.js SSG), the initial focus on hard navigation is the browser default (top of document). The skip link handles the keyboard path from there.
- **ADR-025 RESOLVED:** On `xs`/`sm`, the PublicHeader collapses to **Logo + Hamburger icon button + "Get Started" CTA**. The hamburger opens a full-screen slide-in drawer from the right containing all nav links plus "Log In" and "Get Started", stacked as full-width tap targets. The drawer uses `slideInRight` motion variant at `--z-overlay` (300). A backdrop tap or `×` close button collapses it. Focus is trapped within the drawer while open; Escape closes and restores focus to the hamburger button. The "Get Started" CTA remains pinned in the header row (not only inside the drawer) as the primary conversion trigger.

### Responsive Behavior — *[GAP FILL]*

| Breakpoint | PublicHeader | Main content | Footer |
|---|---|---|---|
| `xs`/`sm` | Logo + **Hamburger button** + "Get Started" CTA *(ADR-025, RESOLVED)* | Full width, `padding-x: --space-4` | Single column, stacked link groups |
| `md` | Logo + partial nav links + "Log In" + "Get Started" | Full width, `padding-x: --space-6` | 2-column footer grid |
| `lg+` | Logo + full nav links + "Log In" + "Get Started" | Full width | 4-column footer grid (logo + 3 link groups) |

- PublicHeader `height: 64px` at all breakpoints — same height as O3 TopBar for visual consistency when a user transitions from public to authenticated views.
- PublicHeader is `position: sticky top-0` on scroll, with the same glassmorphism treatment as O3 (but conditional on being the Landing Page, per States above).
- `<main>` has no global `padding-top` set by the template — instead the first child organism on each public page handles its own top spacing. This allows the Landing Page hero to bleed under the transparent header while inner pages (preset page, profile page) add their own top padding.
- **Exception:** When PublicHeader is sticky (solid background), a `padding-top: 64px` equivalent must be applied to prevent content from jumping under the header on scroll — this can be handled with `scroll-margin-top` on anchor targets or a spacer element.
- No `padding-bottom` needed (no fixed bottom nav on public layout).
- Content max-width: T2 PublicLayout imposes a `max-width: 1280px` centered content container on the Landing Page sections. On the Preset Page and Profile Page, the organisms themselves handle their width (O5 PresetDetail and O6 ProfileHeader are full-bleed, then constrain internal content). The template does not force a max-width on `{children}`.

### Motion Behavior — *[GAP FILL]*

Tier 2 — Transition (page navigation), Tier 1 — Feedback (header scroll behavior).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Page route transition (children swap) | Same as T1: `opacity` 0→1 + `translateY(8px→0)` on `<main>` | `--dur-normal` (250ms) | `--ease-out` |
| PublicHeader background on scroll (Landing Page) | `background-color` transparent → `--color-bg-surface`, `box-shadow` appear | `--dur-fast` (150ms) | `--ease-out` |
| Footer entrance (scroll into view, Landing Page only) | `opacity` 0→1 (IntersectionObserver trigger, one-shot) | `--dur-slow` (400ms) | `--ease-out` |

`prefers-reduced-motion`: page transition is instant; header scroll transition is instant color swap; footer entrance is instant.

### Design Tokens — *[GAP FILL]*

- PublicHeader height: `64px` (layout constant, matches O3 TopBar for cross-context consistency)
- PublicHeader background (default): `--color-bg-base`
- PublicHeader background (scrolled, Landing only): `--color-bg-surface`
- PublicHeader border (scrolled): `--color-border-subtle`, `1px`, bottom edge
- Footer background: `--color-bg-surface`
- Footer border: `--color-border-subtle`, `1px`, top edge
- Footer top padding: `--space-16` (64px)
- Footer bottom padding: `--space-8` (32px)
- Footer copyright: `body-sm`, `text-tertiary`
- Footer link typography: `body-sm`, `text-secondary`; hover: `text-primary`
- Footer section header: `label-sm`, `text-tertiary`, uppercase, `letter-spacing: 0.06em`
- "Get Started" CTA in header: A1 Button `variant="primary"` `size="sm"`
- "Log In" link in header: A1 Button `variant="ghost"` `size="sm"`
- Z-index: PublicHeader at `--z-sticky`; Footer at default document flow (no z-index)

### Composition Examples — *[GAP FILL]*

T2 PublicLayout is the shell for every public-facing route:

| Route | `children` |
|---|---|
| `/` (Landing Page, logged out) | Hero + social proof + trending strip + feature sections + creator spotlight |
| `/preset/:slug` | O5 Preset Detail |
| `/u/:username` | O6 Profile Header + content tabs + O4 PresetGrid |
| `/u/:username/presets` | O6 Profile Header + O4 PresetGrid |
| `/u/:username/collections` | O6 Profile Header + collection grid |
| `/collection/:slug` | Collection header + O4 PresetGrid |
| `/explore` (logged-out view) | Search hero + filter bar + O4 PresetGrid |
| `/trending` (logged-out view) | O4 PresetGrid (trending) |
| `/challenges` (logged-out view) | O10 ChallengeCard + past challenges |

Note: Several routes (e.g. `/explore`, `/trending`, `/challenges`) are accessible both logged-in (T1 AppLayout) and logged-out (T2 PublicLayout). Next.js route groups handle this split: `(app)/explore` uses T1, `(public)/explore` uses T2. The organisms rendered within are identical; only the chrome differs.

---

## T3 — AuthLayout

### Purpose
*(verbatim from Design System §17)*

Wraps login/register pages.

### Variants
*(no variants — single split-panel pattern used for both login and register)*

**Structure** *(verbatim):*

```
<AuthLayout>
  <div className="split-layout">
    <AuthPanel>                        ← Left: form
      {children}
    </AuthPanel>
    <VisualPanel />                    ← Right: animated preset showcase
  </div>
</AuthLayout>
```

**AuthPanel — left side** *(derived from Product Spec §3 auth routes: `/auth/login`, `/auth/register`, `/auth/callback`):*

```
┌───────────────────────────────────┐
│  [PresetHub logo]                 │
│                                   │
│  Sign in to PresetHub             │  ← Page-level heading (h1)
│  "Welcome back."                  │  ← Subheading
│                                   │
│  [Continue with Google]           │  ← OAuth primary
│  [Continue with Discord]          │  ← OAuth secondary
│                                   │
│  ── or ──                         │
│                                   │
│  Email                            │
│  [─────────────────────────────]  │
│  Password                         │
│  [─────────────────────────────]  │
│  [Sign In]                        │
│                                   │
│  Forgot password? · Sign up       │
└───────────────────────────────────┘
```

**VisualPanel — right side** *(from Design System §17 T3 "Right: animated preset showcase"):*

```
┌───────────────────────────────────┐
│                                   │
│   [Animated mosaic of preset      │
│    thumbnails — auto-scrolling    │
│    grid, looping vertically]      │
│                                   │
│   "The home of Alight Motion      │
│    creators."                     │
│                                   │
│   [Social proof: creator count,   │
│    download count]                │
│                                   │
└───────────────────────────────────┘
```

The VisualPanel's animated mosaic is a looping, muted, auto-scrolling grid of preset thumbnails (real content from the platform). Its purpose is to immediately communicate PresetHub's content quality to new users who arrive at the register page. It is decorative from an accessibility standpoint — all meaningful information is in the AuthPanel.

### Props — *[GAP FILL — not specified in source]*

```typescript
interface AuthLayoutProps {
  children: React.ReactNode           // The auth form content (login, register, or callback UI)
}
```

VisualPanel content (the mosaic of thumbnails) is fetched by the layout itself (server-side at build time or on request), not by the page. This keeps auth pages free of data-fetching concerns while keeping the visual panel fresh.

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Default | 50/50 split: AuthPanel left, VisualPanel right |
| Mobile (`xs`/`sm`) | VisualPanel hidden; AuthPanel full-width, vertically centered. A condensed logo + tagline replaces the visual panel's role. |
| VisualPanel loading | Skeleton grid of thumbnails (A7 `variant="thumbnail"`) animating in before real content arrives |
| OAuth in progress (after clicking "Continue with Google/Discord") | The button enters A1 Button `isLoading` state; the form is visually disabled; no layout change |
| Error (invalid credentials, rate limit, etc.) | Error message appears within the AuthPanel `{children}` — the template does not display errors; the page organism does |
| `/auth/callback` route | Children is a loading indicator ("Signing you in…") rather than a form. VisualPanel still present on desktop. |

### Accessibility — *[GAP FILL]*

- AuthLayout has no `<header>` or `<footer>` — auth pages are intentionally minimal, with no global navigation. The PresetHub logo in the AuthPanel links back to `/` (the landing page) so users who arrive at login accidentally can exit.
- The AuthPanel logo link: `<a href="/" aria-label="PresetHub — Return to home">` with the logo image inside (or SVG wordmark). Not a `<button>`.
- The `<main id="main-content" tabIndex={-1}>` wraps the entire split layout (`AuthPanel` + `VisualPanel`). The skip link targets `#main-content` and since there is no navigation to skip, it jumps directly to the top of the form — still useful for screen reader users who want to bypass the logo/header area within the AuthPanel.
- The VisualPanel is `aria-hidden="true"` — it is a decorative animated collage. Its scroll animation, thumbnail images, and overlaid tagline convey no information not available in the AuthPanel. Making it aria-hidden prevents screen readers from announcing a large quantity of decorative image content.
- Within `{children}` (the form pages):
  - The page heading ("Sign in to PresetHub" / "Create your account") is the `<h1>`. There is exactly one `<h1>` per auth page.
  - OAuth buttons: `<button type="button">` (not `<a>`) since they trigger a JavaScript-initiated OAuth flow, not a direct navigation. Each has a text label: "Continue with Google" (the logo is supplementary and `aria-hidden`).
  - Email and password inputs follow A2 Input accessibility rules (associated `<label>`, error states, etc.).
  - "Forgot password?" and "Sign up" (cross-links between auth pages) are `<a>` links, not buttons.
  - Form submission: `<button type="submit">` for the "Sign In" / "Create Account" button — not `<button type="button" onClick>`. Enables Enter-key submission and correct browser behavior.
- Focus management on auth pages: when the page first loads, focus should land on the first form input (email field) — not the logo link. This reduces tabbing distance for keyboard users who arrive ready to type their credentials. Implement via `autoFocus` on the email input or a focus effect on mount.
- OAuth callback page (`/auth/callback`): the loading indicator should be a `<div role="status" aria-live="polite">` so screen readers announce the "Signing you in…" message when it appears.

### Responsive Behavior — *[GAP FILL]*

| Breakpoint | AuthPanel | VisualPanel | Layout |
|---|---|---|---|
| `xs`/`sm` | Full viewport width, vertically centered (`min-height: 100svh`) | Hidden (`display: none`) | Single column |
| `md` | 50% of viewport width | 50% of viewport width | 50/50 horizontal split |
| `lg+` | 45% (slightly narrower — form doesn't need more width) | 55% | ~45/55 split |

- The split layout uses `display: flex` (two direct children, no grid needed for a binary split). Minimum height: `100svh` (small viewport height unit — avoids the mobile browser chrome overflow problem with `100vh`).
- AuthPanel: `max-width: 480px` within its 50% column, centered. This prevents the form from stretching uncomfortably wide on very large monitors.
- VisualPanel: fills its column completely (`height: 100svh`, `position: sticky top: 0`) so it stays in view as the AuthPanel's content scrolls (if the form is tall enough to require scroll on small desktop viewports). The sticky behaviour ensures the visual panel never scrolls away.
- On `xs`/`sm`, the AuthPanel gets the full screen. The tagline from the VisualPanel ("The home of Alight Motion creators.") should be shown as a brief subtitle below the logo within the AuthPanel on mobile, since the VisualPanel is hidden. This is a text-only fallback, not an image.

### Motion Behavior — *[GAP FILL]*

Tier 4 — Ambient (VisualPanel mosaic scroll), Tier 3 — Entrance (AuthPanel form).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| AuthPanel form entrance on page load | `opacity` 0→1 + `translateY(16px→0)` | `--dur-slow` (400ms) | `--ease-out` |
| VisualPanel mosaic auto-scroll | `translateY` continuous upward scroll, looping | `--dur-loop` (2000ms per "row" — adjust to taste, approximately 20–30s for a full-grid loop) | `--ease-linear` |
| VisualPanel thumbnail load | Each thumbnail fades in as it loads (`opacity` 0→1) | `--dur-normal` (250ms) | `--ease-out` |
| OAuth button loading state | A1 Button `isLoading` — spinner replaces label, dimensions held constant | — | — |
| Route transition between `/auth/login` and `/auth/register` | `opacity` 0→1 on `{children}` only (AuthPanel swaps, VisualPanel persists) | `--dur-normal` (250ms) | `--ease-out` |

`prefers-reduced-motion`:
- VisualPanel mosaic scroll is **paused** (`animation-play-state: paused`) — the grid is static. A static mosaic is still visually rich and meets the intent.
- AuthPanel entrance is instant (no translateY).
- Route transition between login/register is instant opacity swap.

The VisualPanel mosaic is the one component in the product that uses a continuous looping `Tier 4 — Ambient` animation with visible motion (vs. a spinner, which is small). It is intentional — the "live" feel of the mosaic communicates platform activity. `prefers-reduced-motion` pausing it is therefore especially important.

### Design Tokens — *[GAP FILL]*

- Split layout background: `--color-bg-base` (full bleed, both panels on this base)
- AuthPanel background: `--color-bg-surface` (slightly elevated from base, gives the panel card-like presence)
- AuthPanel padding: `--space-12` (48px) horizontal, `--space-16` (64px) vertical on `md+`; `--space-6` (24px) horizontal, `--space-8` (32px) vertical on `xs`/`sm`
- AuthPanel max-width: `480px`
- AuthPanel radius (on `md+` where it appears as a panel within the 50% column): `--radius-xl` (16px) — gives a contained-card feel within the dark background
- VisualPanel background: `--color-bg-elevated` (dark, recessed from AuthPanel to make the panel stand out)
- VisualPanel tagline: `display-md` (Space Grotesk 600 / 32px), `text-primary` — large and confident, matching the Landing Page hero tone
- VisualPanel tagline gradient option: `.gradient-text` class from Design System §10 — the VisualPanel tagline is one of the "sparingly used" contexts for gradient text, alongside the hero headline
- VisualPanel social proof: `body-md`, `text-secondary`
- OAuth button divider ("── or ──"): `body-sm`, `text-tertiary`; the divider lines are `--color-border-subtle`
- Form field spacing: `--space-4` (16px) gap between label and input; `--space-6` (24px) gap between form fields; `--space-8` (32px) gap between OAuth section and email/password section

### Composition Examples — *[GAP FILL]*

T3 AuthLayout wraps the three auth routes:

| Route | `children` |
|---|---|
| `/auth/login` | Login form: OAuth buttons, email/password fields, "Sign In" button, "Forgot password?" + "Sign up" links |
| `/auth/register` | Register form: OAuth buttons, email/username/password fields, "Create Account" button, terms acceptance, "Log in" link |
| `/auth/callback` | OAuth callback loading state: spinner + "Signing you in…" |

- **Internal components:** A1 Button (OAuth, submit, links-styled-as-buttons), A2 Input (email, username, password), A4 Avatar (only on the logo mark — no user avatar exists yet on auth pages), A7 Skeleton (VisualPanel thumbnail loading), M1 PresetCard thumbnails (the VisualPanel mosaic content — rendered without interactive states since they are decorative in this context).
- The VisualPanel's mosaic thumbnails are `<img>` elements with `alt=""` (decorative, per Design System §13 Image Alt Text: `alt=""` if decorative) wrapped in a `aria-hidden="true"` container.

---

## T4 — AdminLayout

**[DOCUMENTATION GAP FILL — no source in Design System §17; derived from Product Spec §7 Component Architecture ("AdminLayout — Admin panel"), §3 Site Map (`/admin`, `/admin/moderation`, `/admin/reports`, `/admin/featured`), §15 Moderation System, and inference from T1 AppLayout patterns. Requires design review before implementation.]**

### Purpose
*(derived from Product Spec §7 and §15)*

Wraps admin and moderation routes. Accessible only to users with `is_staff: true` (per Product Spec §4 `users` schema). Provides a distinct visual identity from the creator-facing AppLayout, making it immediately clear to staff that they are in an admin context rather than the public product.

### Variants
*(no variants defined in source — single pattern)*

**Structure** *(derived from Product Spec §3 Site Map admin routes and §15 Moderation Dashboard):*

```
<AdminLayout>
  <AdminTopBar />                     ← Stripped-down header with admin identity
  <div className="flex">
    <AdminSidebar />                  ← Admin-specific navigation
    <main id="main-content">
      {children}                      ← Admin page organism(s)
    </main>
  </div>
</AdminLayout>
```

**AdminTopBar anatomy:**
```
[PresetHub logo]  ADMIN PANEL         [Staff avatar]  [← Back to App]
```

**AdminSidebar anatomy** *(from Product Spec §3 Site Map admin routes and §15 Moderation System):*

```
┌──────────────────────┐
│  📋 Moderation Queue │  → /admin/moderation
│  🚩 Reports          │  → /admin/reports
│  ⭐ Featured         │  → /admin/featured
├──────────────────────┤
│  Staff: [Name]       │
│  ← Back to App       │
└──────────────────────┘
```

The AdminSidebar is narrower than O1 (Sidebar) — admin workflows are task-focused and the navigation is compact (3 primary routes, no secondary sections like trending tags or recent activity).

### Props — *[GAP FILL — not specified in source]*

```typescript
interface AdminLayoutProps {
  children: React.ReactNode
  // Staff user identity read from auth context inside the layout.
  // Pages do not pass user state as props.
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Default (staff, desktop) | AdminSidebar visible, main content offset, AdminTopBar at top |
| Non-staff user attempts access | Middleware redirects to `/` before AdminLayout mounts (per Product Spec §14 Security Architecture) — AdminLayout never renders for non-staff users |
| Mobile (`xs`/`sm`) | **Desktop-only — admin panel not supported on mobile** *(ADR-026, RESOLVED)*. T4 AdminLayout renders a full-screen interstitial: "Moderation tools are designed for desktop. Please switch to a desktop browser to access the admin panel." — with the PresetHub logo and a link back to `/`. Enforced via `@media (max-width: 767px)` at the template level. |

### Accessibility — *[GAP FILL]*

- AdminLayout follows the same landmark structure as T1 AppLayout: `<header role="banner">` (AdminTopBar), `<nav aria-label="Admin navigation">` (AdminSidebar), `<main id="main-content" tabIndex={-1}>`.
- Skip link: same pattern as T1 and T2 — `<a href="#main-content">Skip to main content</a>` as first DOM element.
- AdminTopBar "← Back to App" link: `<a href="/">` with explicit text — not a JavaScript `router.push`. Staff should be able to middle-click to open the public app in a new tab.
- AdminSidebar active route: `aria-current="page"` on the active nav item, identical to O1's pattern.
- AdminTopBar "ADMIN PANEL" label: a visually prominent indicator that this is a staff context. For screen readers, it is inline text — no additional ARIA needed. The `<header>` or page `<h1>` context makes the admin environment clear.
- Moderation queue actions (Approve, Reject, Ask for Changes) are irreversible or semi-irreversible. Each must be a `<button>` with a confirmation pattern (F6 Confirmation Dialog) before execution — per A1 Button's rule: "Danger buttons always use a confirmation dialog before executing." The "Reject" and "Remove" actions in particular are destructive to creator content.
- Bulk actions (approve/reject batch): a multi-select pattern with a confirmation step. The checkbox group follows standard `role="group"` + associated `<label>` patterns; bulk action buttons are `disabled` until at least one item is selected (`aria-disabled` if they remain in the DOM as visible but inactive).

### Responsive Behavior — *[GAP FILL]*

| Breakpoint | AdminTopBar | AdminSidebar | Main content |
|---|---|---|---|
| `xs`/`sm` | Full width | **Desktop-only interstitial rendered** — AdminSidebar and main content replaced *(ADR-026, RESOLVED)* | — |
| `md+` | Full width | 180px (narrower than O1's 220px — admin nav is compact) | `padding-left: 180px` |
| `lg+` | Full width | 180px | `padding-left: 180px` |

- AdminLayout does not have a Right Panel — admin pages are information-dense, and the right panel pattern from T1 is a product-facing feature.
- Main content `padding-top: 64px` to clear AdminTopBar (same height as O3/PublicHeader).

### Motion Behavior — *[GAP FILL]*

Tier 2 — Transition (page navigation within admin routes).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Admin page route change (children swap) | `opacity` 0→1 on `<main>` content area | `--dur-fast` (150ms) | `--ease-out` |

Note: The admin interface uses a faster, more subdued transition than the product-facing pages (150ms vs. 250ms). Admin users are task-focused; the entrance animation communicates route change without the added motion of the consumer experience.

`prefers-reduced-motion`: transition is instant.

### Design Tokens — *[GAP FILL]*

The AdminLayout uses a visually distinct surface to prevent confusing the admin context with the product:

- AdminTopBar background: `--color-bg-elevated` — one step darker/elevated from `--color-bg-surface`, differentiating from O3 TopBar
- AdminTopBar "ADMIN PANEL" label: `label-sm`, `text-accent`, uppercase, `letter-spacing: 0.06em` — the accent color here serves as a warning signal: "you are in an administrative context"
- AdminSidebar background: `--color-bg-surface`
- AdminSidebar border: `--color-border-default` (stronger than `--color-border-subtle` used in O1 — the admin sidebar boundary is slightly more prominent to reinforce the separate context)
- AdminSidebar width: `180px` (layout constant — narrower than O1's 220px)
- AdminTopBar height: `64px` (layout constant — matches all other headers for consistent spacing)
- Main content `padding-left`: `180px` at `md+`
- Main content horizontal padding: `--space-6` (24px)
- Main content `padding-top`: `64px`
- No glow shadows in the admin layout — `--shadow-glow-*` tokens are reserved for the consumer-facing product. Admin uses `--shadow-card` only.

### Composition Examples — *[GAP FILL]*

T4 AdminLayout wraps all staff-only routes:

| Route | `children` |
|---|---|
| `/admin/moderation` | Moderation queue — list of pending presets with Approve / Reject / Ask for Changes actions; each row shows the preset thumbnail, title, creator trust score, and submission time |
| `/admin/reports` | Reports queue — user-submitted reports on presets and comments; filters by reason (Spam / Stolen / Inappropriate / Misleading / Broken File) and status (Open / Reviewed / Resolved) |
| `/admin/featured` | Featured preset management — staff selects which presets appear in editorial "Featured" slots on the home feed and preset pages |

- **Internal components:** A1 Button (action buttons — `variant="primary"` for Approve, `variant="danger"` for Reject/Remove), A4 Avatar (creator avatars in queue), A5 Badge (preset status, trust score tier), F6 Confirmation Dialog (for reject/remove actions), M1 PresetCard `variant="compact"` (preset preview in queue rows), and standard A2 Input + FilterChip organisms for filtering the queue.
- **Moderation queue pagination:** standard offset pagination (`page=N&limit=20`) per Product Spec §13 Pagination Pattern — the moderation queue is staff-navigable (not an infinite scroll), since moderators need to work through the queue systematically.

---

*End of Templates — continued in `05-overlays-feedback.md`*
