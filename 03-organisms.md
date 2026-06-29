# PresetHub Component Library — 03. Organisms

**Source of truth for existing specs:** `PresetHub_Design_System.md` §17 "ORGANISMS"  
**This file:** preserves those specs verbatim, appends Accessibility / Responsive / Motion / Composition where the source was silent.

---

## O1 — Navigation Sidebar

### Purpose
*(verbatim)*

Primary navigation for authenticated users (desktop).

### Variants
*(verbatim — by breakpoint state)*

| State | Width | Treatment |
|---|---|---|
| `expanded` | 220px | Full labels + icons, always visible at `lg+` |
| `collapsed` | 64px | Icon-only at `md`, hover tooltip for labels |
| `hidden` | — | Hidden at `xs`/`sm`, replaced by O2 Mobile Bottom Nav |

**Anatomy:**
```
┌──────────────────┐
│  Logo            │
│                  │
│  [avatar] Name   │
│  Level badge     │
├──────────────────┤
│  ⌂  Home        │
│  🔍 Explore      │
│  🔥 Trending     │
│  🏆 Challenges   │
│  🔖 Bookmarks   │
├──────────────────┤
│  Recent Activity │
│  @user liked...  │
│  @user posted... │
├──────────────────┤
│  Trending Tags   │
│  #velocity       │
│  #anime          │
├──────────────────┤
│  ⚙ Settings     │
│  Help            │
└──────────────────┘
```

### Props — *[GAP FILL — not specified in source]*

```typescript
interface NavigationSidebarProps {
  currentUser: {
    username: string
    displayName: string
    avatarUrl?: string
    level: number
    levelName: string
  }
  activeRoute: string                // Current pathname for active-state highlighting
  recentActivity: {
    actor: { username: string; displayName: string; avatarUrl?: string }
    action: string                   // e.g. "liked a preset" | "uploaded a new preset"
    href: string
    createdAt: string
  }[]
  trendingTags: string[]
  unreadNotificationCount?: number   // Drives badge on Notifications item if sidebar includes it
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Default | Nav items at rest: `text-secondary`, icon at `--color-text-secondary` |
| Nav item hover | Background `--color-bg-elevated`, text shifts to `text-primary` |
| Nav item active (current route) | Left accent bar (2px, `--color-interactive-primary`), text `text-accent`, icon `--color-text-accent`, background `--color-bg-accent` |
| Collapsed (`md` breakpoint) | Icons only, labels hidden; active state retains accent bar |
| Logo / profile mini-card | Always visible regardless of collapsed/expanded state |

### Accessibility — *[GAP FILL]*

- The sidebar renders as `<nav aria-label="Main navigation">` — a landmark role so screen reader users can jump to it directly via "navigate to navigation" shortcuts.
- Each nav item is an `<a>` (navigates to a route), not a `<button>` — preserves right-click "open in new tab" affordance and browser history.
- Active item has `aria-current="page"` in addition to the visual active treatment (per WCAG 2.1 technique G128).
- In `collapsed` (icon-only) mode, nav item labels are visually hidden but must remain in the DOM as `sr-only` text (not removed) so screen reader users who navigate by tab still receive the label. The F4 Tooltip that appears on hover is supplementary for sighted users.
- **Touch tablet behavior at `md` (ADR-018, RESOLVED):** On `@media (pointer: coarse)` devices at `md`, tapping the collapsed sidebar opens it as a full-width (220px) drawer overlay (`slideInRight`, `--z-overlay: 300`). The drawer shows full icon + label nav items. Backdrop tap collapses the drawer. Screen reader users navigate the drawer the same as the expanded sidebar. Focus is moved to the first nav item on drawer open; focus returns to the trigger on close (standard drawer focus management).
- The "Recent Activity" list items are links (`<a>`) to the relevant preset or profile, not decorative text. Each must have a meaningful accessible label (e.g. `aria-label="@reza_edit liked a preset — 3 minutes ago"`).
- The Trending Tags are links to `/explore?tag=[name]`; the `#` hash symbol is decorative — screen readers should receive "velocity" not "hash velocity." Wrap the `#` in `aria-hidden="true"`.
- Skip link at the page level (per Design System §13) jumps to `#main-content`, bypassing the sidebar on every tab keypress.
- The profile mini-card area at the top is not interactive within the sidebar itself — clicking it navigates to `/u/[username]`. Render it as an `<a>` wrapping the avatar + name.

### Responsive Behavior — *[verbatim from Design System §17 O1 breakpoint table, expanded]*

| Breakpoint | Sidebar state | Width | Nav labels |
|---|---|---|---|
| `xs` (<480px) | Hidden | — | — (O2 Mobile Bottom Nav takes over) |
| `sm` (480–767px) | Hidden | — | — (O2 Mobile Bottom Nav takes over) |
| `md` — pointer device | Collapsed | 64px | Icon only; tooltip on hover |
| `md` — touch device (`pointer: coarse`) | Collapsed → Drawer on tap | 64px → 220px | Drawer shows icon + label (ADR-018, RESOLVED) |
| `lg` (1024–1279px) | Expanded | 220px | Icon + label |
| `xl` (1280–1535px) | Expanded | 220px | Icon + label |
| `2xl` (≥1536px) | Expanded | 220px | Icon + label |

- Sidebar is `position: fixed` on the left edge, full viewport height, `z-index: --z-sticky`. Main content has `padding-left: 220px` at `lg+` and `padding-left: 64px` at `md`. On `xs`/`sm` no padding offset is applied.
- The `md` collapsed state is a progressive disclosure, not a toggle — it happens automatically at the breakpoint, not via a user "collapse" button. On touch devices at `md`, the drawer pattern (ADR-018, RESOLVED) replaces the hover-tooltip affordance.

### Motion Behavior — *[GAP FILL]*

Tier 1 — Feedback (nav item hover/active), Tier 2 — Transition (breakpoint width change).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Nav item hover background | `background-color` | `--dur-fast` (150ms) | `--ease-out` |
| Active accent bar appear (route change) | `opacity` + `scaleY` 0→1 | `--dur-normal` (250ms) | `--ease-spring-sm` |
| Sidebar width change (`expanded` ↔ `collapsed`) | `width` transition — **[OPEN QUESTION → ADR-009 principle]:** width animation causes reflow; recommend `transform: translateX` on sidebar contents plus clipping on the sidebar container instead | `--dur-normal` (250ms) | `--ease-snap` |
| Recent activity item entrance | `opacity` 0→1 + `translateX(-8px→0)`, staggered | `--dur-fast` (150ms), 50ms stagger | `--ease-out` |

`prefers-reduced-motion`: width transition is instant (no intermediate states); hover background change still occurs as a static color swap.

### Design Tokens — *[GAP FILL]*

- Background: `--color-bg-surface`
- Border (right edge separator): `--color-border-subtle`, `1px`
- Active item background: `--color-bg-accent`
- Active item accent bar: `--color-interactive-primary`, width 2px
- Active item text/icon: `--color-text-accent`
- Hover item background: `--color-bg-elevated`
- Nav item typography: `label-md` (expanded), icon `icon-md` (20px)
- Section header labels ("Recent Activity," "Trending Tags"): `label-xs`, `text-tertiary`, uppercase, `letter-spacing: 0.06em`
- Width: 220px (expanded), 64px (collapsed) — these are layout constants, not spacing-scale tokens
- Z-index: `--z-sticky`
- Shadow (right edge): none at rest; may add `--shadow-sm` when content scrolls behind sidebar (glassmorphism is specified for Top Bar on scroll, but not sidebar — sidebar background is opaque)

### Composition Examples — *[GAP FILL]*

- **T1 AppLayout:** O1 is the left panel of the AppLayout shell, always present at `md+`. Renders A4 Avatar (size `md`), A6 Tags (Trending Tags, clickable), M5 NotificationItem-derived recent activity links.
- **Home Feed (§6.2):** sidebar shows "Following" recent activity feed — the `recentActivity` prop drives the list of events like "@reza_edit liked a preset."
- **All authenticated routes:** O1 + O2 are mutually exclusive by breakpoint (O1 at `md+`, O2 at `xs`/`sm`) — T1 AppLayout handles this switching.

---

## O2 — Mobile Bottom Navigation

### Purpose
*(verbatim)*

Primary navigation for mobile.

### Variants
*(verbatim)*

5 tabs: Home · Explore · Upload (FAB) · Challenges · Profile.

The Upload item is a floating action button (accent background, elevated) centered in the tab bar.

**Anatomy:**
```
┌─────────────────────────────────────────────┐
│  [⌂]   [🔍]   [⬆ FAB]   [🏆]   [👤]        │
│  Home  Explore  Upload  Challenge Profile    │
└─────────────────────────────────────────────┘
```

### Props — *[GAP FILL — not specified in source]*

```typescript
interface MobileBottomNavProps {
  activeRoute: string
  currentUser?: {
    avatarUrl?: string
    displayName: string
  }
  unreadNotificationCount?: number   // Shown as badge on Profile tab or as a separate bell icon
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Default tab | Icon + label, `text-secondary` |
| Active tab (current route) | Icon + label, `text-accent`, icon filled/accent variant |
| Upload FAB | Always accent background (`--color-interactive-primary`), white `Upload` icon, `shadow-glow-sm` — never has an "active" route state since `/upload` is a transient destination |
| FAB press | `scale(0.95)` + shadow reduces, 50ms `ease-out` |

### Accessibility — *[GAP FILL]*

- Renders as `<nav aria-label="Mobile navigation">`, inside which each tab is an `<a>` (navigates), not a `<button>`.
- Active tab has `aria-current="page"`.
- The Upload FAB, as the center element, must have `aria-label="Upload new preset"` since the icon-only convention is used here (the label below is visually small and may be omitted on very narrow viewports).
- The tab bar sits above the safe area on iOS (respects `env(safe-area-inset-bottom)` via `padding-bottom`). Tab targets must be at minimum 44×44px for comfortable touch operation (WCAG 2.1 AA target size guidance).
- Profile tab icon: when `currentUser.avatarUrl` is available, the tab icon shows the user's avatar (A4, size `xs`) rather than the generic `User` Lucide icon — the avatar `alt` text follows A4's rule: `alt="[Display Name]'s profile photo"`.
- If `unreadNotificationCount > 0` is surfaced on the Profile tab (rather than a dedicated Notifications tab, since the bottom nav has no Notifications slot as designed), the badge count follows Design System §13 ARIA pattern: `<span aria-label="[N] unread notifications">N</span>`.

### Responsive Behavior — *[GAP FILL]*

- Visible only at `xs`/`sm` (<768px). Hidden at `md+` where O1 Navigation Sidebar takes over.
- `position: fixed`, bottom 0, full viewport width, above safe area inset.
- `z-index: --z-sticky` — sits above page content but below modals and overlays.
- Tab labels may be omitted at very narrow viewports (`xs` < 360px) if space is insufficient — icons remain; this is an edge case for the smallest devices in the primary audience.

### Motion Behavior — *[GAP FILL]*

Tier 1 — Feedback.

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Tab active indicator (icon fill + color) | `color`, `fill` | `--dur-fast` (150ms) | `--ease-in-out` |
| FAB press | `transform: scale(0.95)` | `--dur-instant` (50ms) | `--ease-out` |
| Tab bar entrance (app first load) | `translateY(100%→0)` + `opacity` | `--dur-normal` (250ms) | `--ease-out` |

`prefers-reduced-motion`: entrance animation is instant; active tab switch is a static color change only.

### Design Tokens — *[GAP FILL]*

- Background: `--color-bg-surface`
- Border (top edge): `--color-border-subtle`, `1px`
- Active tab icon/label: `--color-text-accent`
- Default tab icon/label: `--color-text-secondary`
- FAB background: `--color-interactive-primary`
- FAB icon: white (`#FFFFFF`)
- FAB shadow: `--shadow-glow-sm`
- FAB radius: `--radius-full`
- FAB size: 56px diameter (larger than standard button sizes — this is the one FAB in the product, intentionally prominent)
- Tab typography: `label-sm` (12px)
- Tab icon: `icon-md` (20px)
- Z-index: `--z-sticky`

### Composition Examples — *[GAP FILL]*

- **T1 AppLayout:** O2 is rendered inside the layout shell, visible only at `xs`/`sm`. It is a sibling to O1, not a child — they share `activeRoute` from the layout's route context.
- **Upload FAB:** taps to `/upload`, opening O7 Upload Wizard. The FAB is the mobile entry point for the upload flow.

---

## O3 — Top Bar

### Purpose
*(verbatim)*

App-wide top bar for context, search, and global actions.

### Variants
*(no variants defined in source — single pattern with scroll behavior)*

**Anatomy:**
```
[logo / page-title]    [search-bar]    [notifications] [avatar-menu]
```

**Behavior** *(verbatim):*
- Sticky at top (z-index: sticky)
- Blurred backdrop on scroll (glassmorphism — used here intentionally because it communicates depth)
- Notification bell shows badge with unread count
- Avatar menu: dropdown with Profile · Dashboard · Settings · Sign out

### Props — *[GAP FILL — not specified in source]*

```typescript
interface TopBarProps {
  currentUser?: {
    username: string
    displayName: string
    avatarUrl?: string
    level: number
  }
  pageTitle?: string               // Overrides logo on inner pages (e.g. "Notifications")
  unreadNotificationCount: number
  isScrolled: boolean              // Drives the glassmorphism backdrop treatment
  onSearchSubmit: (query: string) => void
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Default (top of page) | `background: --color-bg-surface`, no blur |
| Scrolled (`isScrolled: true`) | `backdrop-filter: blur(12px)`, background shifts to `--color-bg-surface` at ~80% opacity — the glassmorphism per verbatim spec |
| Notification bell: unread | Red/accent badge dot with count; bell icon rings on new notification (per Product Spec §11 Animation Catalog: "rotate -15deg → 15deg → -10deg → 10deg → 0, 400ms") |
| Avatar menu open | Dropdown visible below the avatar (F3 Dropdown Menu pattern), avatar has focus ring |
| Search focused | On `md+`: SearchBar receives focus ring inline. On `xs`/`sm`: `Search` icon button tap opens full-width overlay (`fadeIn` + `scaleIn`, `--z-overlay: 300`) containing M6 SearchBar; overlay close restores focus to the icon button. *(ADR-019, RESOLVED)* |

### Accessibility — *[GAP FILL]*

- Renders as `<header role="banner">` — the page's primary banner landmark.
- Logo is an `<a href="/">` with `aria-label="PresetHub — Home"` (the logo image/wordmark alone is insufficient as link text for screen readers).
- Notification bell button follows Design System §13 ARIA Patterns exactly: `<button aria-label="[N] unread notifications"><Bell /><span aria-label="[N] unread notifications" className="notification-badge">[N]</span></button>` — the inner span carries the count, the button label includes it for full context.
- When `unreadNotificationCount === 0`, the badge is visually hidden and the button label reverts to `aria-label="Notifications"`.
- Avatar menu button (`aria-expanded`, `aria-controls`, `aria-haspopup="menu"`) follows Design System §13 expandable-section pattern. The dropdown (F3) traps focus and closes on Escape.
- `isScrolled` glassmorphism must maintain sufficient contrast: at 80% opacity over dark content scrolled behind it, `text-primary` remains readable (15:1 contrast against the base dark background is sufficient headroom for opacity reduction).
- Top Bar is `position: sticky` — it remains in the DOM and tab order whether scrolled or not, consistent with standard sticky-header patterns.
- **Mobile search (ADR-019, RESOLVED):** On `xs`/`sm`, the `Search` icon button (which opens the overlay) is in the tab order. The overlay itself uses `--z-overlay` (300) and traps focus while open; Escape closes it and returns focus to the icon button.

### Responsive Behavior — *[GAP FILL]*

| Breakpoint | Logo | SearchBar | Notifications | Avatar menu |
|---|---|---|---|---|
| `xs`/`sm` | Logo only (wordmark) | `Search` icon button → opens full-width overlay on tap *(ADR-019, RESOLVED)* | Bell icon only (no label) | Avatar only (no label) |
| `md` | Logo | Compact inline SearchBar | Bell + badge | Avatar |
| `lg+` | Logo + "PresetHub" wordmark | Full SearchBar (wider) | Bell + badge | Avatar + display name |

- Height: 64px at all breakpoints (per Design System §8 Grid System: "TOPBAR (64px height, sticky)").
- Z-index: `--z-sticky` (200) — above page content, below dropdowns and modals.

### Motion Behavior — *[GAP FILL, partially specified in Product Spec §11]*

Tier 4 — Ambient (glassmorphism scroll transition) / Tier 1 — Feedback (bell animation).

| Animation | Property | Duration | Easing | Source |
|---|---|---|---|---|
| Glassmorphism on scroll | `backdrop-filter` + `background-color` opacity | `--dur-fast` (150ms) | `--ease-out` | inferred; Product Spec §11 doesn't specify the scroll-trigger animation explicitly |
| Notification bell ring | `rotate -15deg → 15deg → -10deg → 10deg → 0` | 400ms | `--ease-in-out` (oscillating) | Product Spec §11 "Notification Bell" (verbatim) |
| Notification badge count pop | `scale` 1→1.5→1 | 300ms | `--ease-spring` | Product Spec §11 (verbatim) |
| Avatar menu dropdown open | `scaleIn` Framer Motion preset (scale 0.96→1 + opacity 0→1) | 250ms | `--ease-spring` | Design System §11 Framer Motion Presets |

`prefers-reduced-motion`: bell rotation is suppressed; badge count change is a static swap (no scale); glassmorphism transition is instant.

### Design Tokens — *[GAP FILL]*

- Background: `--color-bg-surface` (default), `--color-bg-surface` at 80% opacity (scrolled, with blur)
- Border (bottom edge): `--color-border-subtle`, visible only when scrolled
- Height: 64px (layout constant)
- Logo color: `--color-text-primary` (wordmark text), `--color-interactive-primary` (icon mark)
- Z-index: `--z-sticky`
- Glassmorphism: `backdrop-filter: blur(12px)` (scrolled only) — intentional exception to the "no decorative blur" convention, per Design System §17 O3 note: "used here intentionally because it communicates depth"

### Composition Examples — *[GAP FILL]*

- **T1 AppLayout:** O3 is the sticky header above the sidebar + content area. It spans full viewport width, sitting above the sidebar in z-order.
- **T2 PublicLayout:** A separate `PublicHeader` is used for public pages (per Design System §17 T2), distinct from O3 which is the authenticated app's Top Bar. Do not reuse O3 in public contexts.
- **Notification bell → F3 Dropdown / `/notifications` page:** clicking the bell shows a condensed notification dropdown (list of M5 NotificationItem) with "View all" link; on mobile, tapping the bell navigates directly to `/notifications` rather than opening a dropdown (due to the mobile viewport size constraint on dropdown panels).

---

## O4 — PresetGrid

### Purpose
*(verbatim)*

Masonry grid for displaying collections of preset cards.

### Variants
*(verbatim — via `variant` prop)*

- `masonry` — CSS `columns` or JS masonry; cards are variable height
- `equal` — CSS grid with equal-height rows

**Behaviors** *(verbatim):*
- Infinite scroll (IntersectionObserver at bottom sentinel)
- Skeleton cards shown during initial load (matches column count)
- Smooth card entrance with staggered fade-in-up
- Pull-to-refresh on mobile

### Props
*(verbatim)*

```typescript
interface PresetGridProps {
  presets: Preset[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  columns?: { xs: 1, sm: 1, md: 2, lg: 3, xl: 4, '2xl': 5 }
  variant?: 'masonry' | 'equal'
  emptyState?: React.ReactNode
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Loading (initial) | A7 Skeleton `variant="card"` placeholders, count matching current `columns` value so the skeleton layout matches the real layout exactly — prevents shift when content loads |
| Loading (pagination / infinite scroll) | Additional Skeleton cards appended below the existing content grid — not a full-page replacement |
| Loaded, has results | M1 PresetCard grid with staggered entrance animation |
| Loaded, empty | `emptyState` prop rendered — consuming page provides the empty-state node (e.g. "No presets found. Try different filters."). PresetGrid itself does not define an empty state — it defers to the caller. |
| Error | **[OPEN QUESTION]:** neither source doc specifies an error state for the grid (e.g. network failure on infinite scroll). Recommend an inline error row at the bottom of the grid with a "Retry" button — but this is not documented and should be confirmed before implementing. |
| Pull-to-refresh (mobile) | Standard pull-to-refresh indicator above the grid; triggers `onLoadMore` after returning to the first page. **[OPEN QUESTION]:** the prop contract only exposes `onLoadMore` (next page), not a `onRefresh` (reset to page 1) callback. A distinct `onRefresh?` prop may be needed. |

### Accessibility — *[GAP FILL]*

- The grid container has `role="feed"` (the ARIA feed role for infinite-scroll lists) with `aria-busy={isLoading}` to communicate loading state to assistive technologies.
- When new cards load via infinite scroll, `aria-busy` transitions from `true` to `false` — screen readers announcing this state change lets users know new content is available.
- `aria-label="Preset gallery"` on the `role="feed"` element (or a more specific label when the grid is filtered, e.g. "Velocity presets").
- Each M1 PresetCard within the feed is a `role="article"` element per the ARIA feed pattern (feed → articles), so screen reader users can navigate by article.
- The "load more" IntersectionObserver sentinel should be paired with a visually-hidden fallback `<button>` ("Load more presets") for users who have disabled JavaScript or whose scroll position doesn't naturally reach the sentinel. This is a resilience pattern, not strictly required by WCAG, but a professional quality signal.
- A7 Skeleton placeholders are `aria-hidden="true"` and wrapped in the single `aria-live="polite"` live region at the container level (per A7 Accessibility spec) — not individually announced.

### Responsive Behavior — *[verbatim from Design System §8 Preset Grid table]*

| Viewport | Columns | Gap |
|---|---|---|
| Mobile (<768px) | 1 | 16px |
| Tablet (768–1024px) | 2 | 20px |
| Desktop (1024–1280px) | 3 | 24px |
| Wide (>1280px) | 4 | 24px |
| Ultrawide (>1536px) | 5 | 24px |

- The `columns` prop allows consuming pages to override these defaults (e.g. the Preset Detail page's "More from creator" horizontal scroll section uses a different layout).
- Grid type: masonry (`CSS columns` property for the simpler implementation; JS masonry for the animated reflow variant where Framer Motion layout animations are needed). The `variant="masonry"` vs `variant="equal"` prop controls this.
- On `xs`/`sm` (1 column), the `masonry` vs `equal` distinction is irrelevant — single column means no reflow difference.

### Motion Behavior — *[GAP FILL, mostly specified in Product Spec §11 and Design System §11]*

Tier 3 — Entrance.

| Animation | Property | Duration | Easing | Source |
|---|---|---|---|---|
| Card entrance (initial load batch) | `opacity` 0→1 + `translateY(16px→0)` per card, staggered 40ms | 400ms | `--ease-out` | Product Spec §11 "Feed / Grid" (verbatim); Design System §11 `staggerContainer`/`staggerItem` variants |
| Card entrance (infinite scroll batch) | Same stagger pattern, but only applied to the new cards appended — existing cards do not re-animate | 400ms, 40ms stagger | `--ease-out` | inferred — consistent with initial load pattern |
| Skeleton → content crossfade (per card) | `opacity` 1→0 (skeleton) simultaneous with `opacity` 0→1 (card) | 200ms | `--ease-in-out` | Product Spec §11 "Skeleton → content: crossfade 200ms" |
| Stagger ceiling | Max stagger wait: 800ms (20 cards × 40ms) — per Design System §11 "Max wait: 800ms total" | — | — | Design System §11 Feed Card Entrance |
| Pull-to-refresh indicator | Standard platform pull-to-refresh visual; no custom animation specified | — | — | inferred |

`prefers-reduced-motion`: stagger animation collapses to simultaneous opacity-only fade (no translateY); skeleton → content crossfade is instant.

### Design Tokens — *[GAP FILL]*

- Grid gap: 16px (`xs`/`sm`), 20px (`md`), 24px (`lg`+) — per Design System §8
- Background: none (inherits page background `--color-bg-base`)
- No card-level tokens — those are M1 PresetCard's responsibility

### Composition Examples — *[GAP FILL]*

- **Home Feed (§6.2), Explore page (§6.7), Trending page:** primary use of O4 `variant="masonry"`, full column-count defaults, infinite scroll.
- **Profile page "Presets" tab:** O4 with `showFollow={false}` passed through to M1 PresetCard children (creator context is already established by the page).
- **Preset Detail page "Related presets" section (O5):** O4 with reduced column count, finite set (no infinite scroll in a secondary section).
- **Upload Wizard Step 3 preview:** a single M1 PresetCard (not wrapped in O4) — the wizard shows a single preview card, not a grid.

---

## O5 — Preset Detail

### Purpose
*(verbatim)*

Full preset information on the preset page.

### Variants
*(no variants — single layout pattern)*

**Layout** *(verbatim):*
```
HERO (sticky on scroll)
  ← 60% wide: video player
  → 40% wide: all metadata + actions

BELOW FOLD
  Comment thread
  More from creator (horizontal scroll)
  Related presets (masonry mini-grid)
```

**Page structure** *(from Product Spec §6.3):*
```
BREADCRUMB
  Home > [Category] > [Preset Title]

HERO SPLIT LAYOUT
  LEFT: M10 VideoPlayer (autoplay muted, loop, thumbnail fallback)
  RIGHT:
    A4 Avatar + creator name + follow button
    ─────────────────────
    Title (display-md)
    Description (collapsible at 3 lines)
    ─────────────────────
    Metadata pills: Category · Difficulty · Device Support · AM Version
    ─────────────────────
    A6 Tags
    ─────────────────────
    M11 DownloadButton (PRIMARY CTA)
    Like · Bookmark · Share (icon buttons)
    ─────────────────────
    Stats: [N] downloads · [N] views this week

BELOW FOLD
  O8 Comment Thread
  More from @creator (horizontal scroll rail of M1 PresetCard)
  Related presets (O4 PresetGrid, finite set)
```

### Props — *[GAP FILL — not specified in source, derived from Product Spec §4 presets table and §6.3 page spec]*

```typescript
interface PresetDetailProps {
  preset: {
    id: string
    slug: string
    title: string
    description?: string             // Markdown, rendered via react-markdown + DOMPurify
    thumbnailUrl: string
    previewVideoUrl?: string
    category: CategoryKey
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    tags: string[]
    amVersionMin?: string
    amVersionMax?: string
    deviceSupport: ('android' | 'ios' | 'both')[]
    fileType: 'xml' | 'qr' | 'link'
    downloadCount: number
    likeCount: number
    commentCount: number
    viewCount: number
    weeklyViews: number              // "892 views this week" in §6.3
    isFeatured: boolean
    creator: {
      username: string
      displayName: string
      avatarUrl?: string
      isVerified: boolean
      followerCount: number
    }
    createdAt: string
  }
  currentUser?: {
    id: string
    isAuthenticated: boolean
  }
  isLiked: boolean
  isBookmarked: boolean
  isFollowingCreator: boolean
  onLike: () => void
  onBookmark: () => void
  onShare: () => void
  onFollow: () => void
  relatedPresets: Preset[]
  creatorPresets: Preset[]         // "More from @creator" rail
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Default | Hero split layout visible; description collapsed at 3 lines if overflowing |
| Description expanded | Full description visible; "Show less" toggle appears |
| Like / Bookmark toggled | Optimistic update on icon buttons (fill change + A1 Button `aria-pressed` update); M11 DownloadButton is the primary action and not affected by like/bookmark state |
| Scrolled (below hero) | **Only the 40% metadata/CTA column sticks** (`position: sticky; top: 64px`). The video player (60% left) scrolls away normally. The download CTA and creator metadata remain in view throughout comments and related presets. Sticky applies at `md+` only; on `xs`/`sm` the stacked layout renders without sticky. *(ADR-020, RESOLVED)* |
| Loading (pre-data) | Hero left panel: A7 Skeleton `variant="thumbnail"` at the 60% width. Hero right panel: multiple A7 Skeleton `variant="text"` lines. M11 DownloadButton renders in loading state. |
| Error (preset not found) | Not in scope of this component — handled by the page's not-found route (`404`). |

### Accessibility — *[GAP FILL]*

- The page's `<h1>` is the preset title (`display-md`). All other headings (creator name section, comment thread section) use `<h2>` or lower.
- Breadcrumb is a `<nav aria-label="Breadcrumb">` wrapping an `<ol>` of `<li><a>` items, with the current page's `<li>` having `aria-current="page"`.
- The "collapsible at 3 lines" description uses `<button aria-expanded={isExpanded} aria-controls="preset-description">` to toggle. The description container has `id="preset-description"`.
- Like button: `<button aria-label="Like preset" aria-pressed={isLiked}>` — per M1 PresetCard's like-button pattern.
- Bookmark button: `<button aria-label="Bookmark preset" aria-pressed={isBookmarked}>`.
- Share button: `<button aria-label="Share preset">` (opens a native share sheet or a copy-link toast — no toggle state needed).
- Metadata pills (Category, Difficulty, Device, AM Version): rendered as `<dl>` (description list) in the accessibility tree, even if visually styled as pills — the pill design shows "Velocity" but the accessible pattern pairs "Category: Velocity" as term and definition.
- M11 DownloadButton is the one `primary` Button on the page — per A1's "max 1 primary per view" rule.
- **Sticky metadata column (ADR-020, RESOLVED):** The 40% metadata column is `position: sticky; top: 64px`. The comment thread anchor (`id="comments"`) and the "More from @creator" section must have `scroll-margin-top: 64px` to prevent the sticky column from obscuring these targets when navigated to via keyboard focus or anchor links.
- The "More from @creator" and "Related presets" sections should be `<section aria-label="More from [creator name]">` and `<section aria-label="Related presets">` respectively — named regions help screen reader users navigate the page structure.

### Responsive Behavior — *[GAP FILL]*

| Breakpoint | Hero layout | Notes |
|---|---|---|
| `xs`/`sm` | Stacked: video full-width on top, metadata below | 60/40 split is desktop-only; metadata column — **no sticky** |
| `md` | Stacked or narrow split (50/50) — **[OPEN QUESTION]:** neither doc explicitly states `md` treatment | Recommend stacked for readability; if split used, sticky applies |
| `lg+` | 60/40 split (per spec) | Metadata column `position: sticky; top: 64px` *(ADR-020, RESOLVED)* |

- Video player on `xs`/`sm`: full viewport width, maintains 4:3 ratio (inherits M10 VideoPlayer's responsive rule).
- Description "collapsible at 3 lines" behavior is consistent across breakpoints; on narrow viewports 3 lines is proportionally less text, so the collapsed state may show less content — this is acceptable given the interaction exists to reveal more.
- "More from @creator" horizontal scroll rail: all breakpoints (horizontal scroll is naturally responsive).
- Related presets grid: follows O4 PresetGrid column defaults but may use a reduced set (e.g. `{ md: 2, lg: 3 }`, no `xl`/`2xl` expansion) since this is a secondary section.

### Motion Behavior — *[GAP FILL]*

Tier 3 — Entrance (hero load), Tier 1 — Feedback (like/bookmark toggles).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Hero right panel entrance (staggered metadata elements) | `opacity` 0→1 + `translateY(8px→0)` per element, 30ms stagger | 300ms | `--ease-out` |
| Description expand/collapse | `max-height` transition — **[OPEN QUESTION → ADR-009 principle]:** height animation causes reflow; prefer `transform: scaleY()` or a clip-path approach | `--dur-normal` (250ms) | `--ease-in-out` |
| Like button toggle | Inherits M1 PresetCard's like animation: `scale` 1→1.3→1 + heart fill, 300ms `--ease-spring` | 300ms | `--ease-spring` |
| Bookmark toggle | icon fill + `scale`, 200ms | 200ms | `--ease-spring` |

`prefers-reduced-motion`: entrance stagger is instant opacity; like particle burst suppressed; description expand is instant.

### Design Tokens — *[GAP FILL]*

- Hero left (video): no additional tokens beyond M10 VideoPlayer's own
- Hero right background: inherits page `--color-bg-base` (not a card/panel — the metadata column is on the base layer, not elevated)
- A9 Divider between metadata sections: `--color-border-subtle`
- Title: `display-md` (Space Grotesk 600 / 32px)
- Stat row: `body-sm`, `text-secondary`, `tabular-nums`
- Description: `body-md` or `body-lg` (per Product Spec §6.3 — description field is prominent; `body-lg` preferred)
- Metadata pills: composite of A5 Badge (category, difficulty) + inline icon+text pairs for device/version

### Composition Examples — *[GAP FILL]*

- **`/preset/[slug]` page:** O5 is the page's primary organism, rendered within T2 PublicLayout.
- **Internal components:** M10 VideoPlayer (left), M11 DownloadButton (primary CTA), A4 Avatar (creator), A5 Badge (category/difficulty), A6 Tag (user tags), O8 Comment Thread (below fold), O4 PresetGrid (related presets).
- **OG image (Appendix A):** the preset's `thumbnailUrl`, title, creator avatar, and download count drive the dynamic OG image — these are the same fields in the `preset` prop.

---

## O6 — Profile Header

### Purpose
*(verbatim)*

Creator profile top section.

### Variants
*(no variants — single pattern; own profile vs. other profile differs by available actions, not layout)*

**Anatomy** *(verbatim):*
```
[banner image — 6:1 ratio, full bleed]
┌────────────────────────────────────────┐
│  [avatar-3xl] ← overlaps banner        │
│  [verified badge]                      │
│  Display Name                          │
│  @username · Joined [date]             │
│  [Bio]                                 │
│  [social links row]                    │
│                                        │
│  📦 124  ⬇ 89K  ❤ 12K  👥 3.2K        │
│                                        │
│  [Badge strip — horizontal scroll]     │
│                                        │
│  [Follow] [Share] [⋯ More]             │
└────────────────────────────────────────┘
```

### Props — *[GAP FILL — not specified in source, derived from Product Spec §4 users table and §6.4 Profile Page spec]*

```typescript
interface ProfileHeaderProps {
  user: {
    username: string
    displayName: string
    avatarUrl?: string
    bannerUrl?: string
    bio?: string
    websiteUrl?: string
    tiktokHandle?: string
    instagramHandle?: string
    discordHandle?: string
    youtubeUrl?: string
    isVerified: boolean
    level: number
    levelName: string
    currentXP: number
    nextLevelXP: number
    presetCount: number
    totalDownloads: number
    totalLikes: number
    followerCount: number
    followingCount: number
    joinedAt: string
    badges: {
      key: string
      name: string
      iconUrl?: string
      rarity: 'common' | 'rare' | 'epic' | 'legendary'
    }[]                              // Top 6 shown; "All Badges" expandable below
  }
  isOwnProfile: boolean
  isFollowing: boolean
  onFollow: () => void
  onShare: () => void
  onEditProfile?: () => void         // Only shown when isOwnProfile
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Default (viewing another's profile) | [Follow] [Share] [⋯ More] action row |
| Own profile (`isOwnProfile`) | [Edit Profile] button replaces Follow; Share and ⋯ More remain |
| Following state | Follow button label/state flips to "Following" (A1 Button toggle pattern) |
| No banner image (`bannerUrl` null) | Banner area shows a gradient fallback: `linear-gradient(135deg, --color-bg-elevated, --color-bg-surface)` — a neutral dark gradient that still creates visual depth under the avatar overflow |
| No bio (`bio` null) | Bio line is omitted; layout reflows without empty space |
| Loading | A7 Skeleton: `variant="avatar"` at `3xl` size + multiple `variant="text"` lines for name/bio/stats row — per A7 Composition Examples |

### Accessibility — *[GAP FILL]*

- Banner image: `<img alt="[Display Name]'s profile banner">` or `alt=""` if the banner is purely decorative (no meaningful content conveyed). Given creators choose their own banners, treat it as content-carrying: use the display name alt.
- A4 Avatar: `size="3xl"` `ring` `level={user.level}` `isVerified={user.isVerified}` — the avatar overlaps the banner's bottom edge. The overlap is visual only; in the DOM the avatar should follow the banner for correct reading order.
- The `@username · Joined [date]` line: the `·` separator is decorative — wrap in `aria-hidden="true"` or use CSS `::before` so screen readers receive "username" and "Joined [date]" as separate text nodes, not "username · Joined date" as a run-on.
- Stats row ("124 Presets · 89K Downloads · 12.4K Likes · 3.2K Followers"): render as a `<dl>` or at minimum ensure each stat is individually labeled — screen readers should hear "124 presets, 89 thousand downloads, 12.4 thousand likes, 3.2 thousand followers," not the formatted raw string with separators.
- Social links (website, TikTok, Instagram, Discord, YouTube): each is an `<a href="..." rel="noopener noreferrer" target="_blank">` with `aria-label="[Platform]: [Handle/URL]"` since the link text may be a bare icon.
- Badge strip: M9 BadgeChip with `showTooltip` — keyboard focus triggers the tooltip per F4 rules; the strip has `role="group" aria-label="Earned badges"`.
- **ADR-021 RESOLVED:** Banner uses responsive aspect ratios — `xs`/`sm`: **3:1** (sufficient visual presence without dominating narrow viewport), `md`: **4:1**, `lg+`: **6:1** (per Design System spec). Implemented via CSS `aspect-ratio` at each breakpoint. No new tokens required.
- M8 XPProgressBar should be present below the stats row if `isOwnProfile` (creators want to track their progress); for other users' profiles, the XP bar is typically omitted unless the level display is part of the public profile. **[OPEN QUESTION]:** neither doc explicitly states whether XP bar is public-visible on profile pages. Recommend asking before implementing.

### Responsive Behavior — *[GAP FILL]*

| Breakpoint | Banner | Avatar | Stats row | Action buttons |
|---|---|---|---|---|
| `xs`/`sm` | Full width, **3:1** aspect ratio *(ADR-021, RESOLVED)* | `size="xl"` (64px) — reduced from 3xl to avoid dominating narrow viewport | Wrap to 2×2 grid | Stack vertically, full-width |
| `md` | Full width, 4:1 | `size="2xl"` (96px) | Single row | Inline row |
| `lg+` | Full width, 6:1 | `size="3xl"` (128px) per spec | Single row | Inline row |

- The avatar overlaps the banner bottom by approximately 50% of its height at all breakpoints (the overlap amount scales with avatar size).
- Social links row wraps to a second line if all fields are populated — there is no truncation, since missing links simply don't render (fields are nullable in the `users` schema).
- Badge strip: horizontal scroll at all breakpoints (6 chips visible without scroll on `lg+`, fewer on narrow viewports).

### Motion Behavior — *[GAP FILL]*

Tier 3 — Entrance.

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Banner fade in | `opacity` 0→1 | `--dur-normal` (250ms) | `--ease-out` |
| Avatar fade in (after image load) | `opacity` 0→1 | `--dur-normal` (250ms) | `--ease-out` |
| Avatar level ring fill (on mount) | `stroke-dashoffset` | `--dur-xslow` (600ms) | `--ease-out` |
| Stats row count-up | `tabular-nums` count-up, per M3 StatCard pattern | `--dur-glacial` (1000ms) | `--ease-out` |
| XP bar fill (if shown) | Per M8 XPProgressBar: `scaleX` 0→target (ADR-009, RESOLVED) | 600ms | `--ease-out` |
| Badge strip entrance | Chips stagger-fade in from right | `--dur-fast` (150ms), 30ms stagger | `--ease-out` |

`prefers-reduced-motion`: all entrance animations collapse to instant opacity; count-up is skipped (number displays at final value immediately).

### Design Tokens — *[GAP FILL]*

- Banner: no border-radius at `lg+` (full bleed); `--radius-2xl` (24px) on the banner container at `xs`/`sm` if the banner is treated as a contained card rather than full-bleed — **[OPEN QUESTION]:** neither doc specifies banner edge treatment on mobile. Recommend full-bleed at all breakpoints for consistency with the "full-width" description in Product Spec §6.4.
- Banner fallback gradient: `linear-gradient(135deg, var(--color-bg-elevated), var(--color-bg-surface))`
- Avatar ring (profile header): `--color-border-accent`, width per A4 size ring-width table
- Stats row values: `display-sm` (Space Grotesk 600/24px), `tabular-nums`
- Stats row labels: `body-xs`, `text-secondary`
- Verified badge: A4 Avatar `isVerified` prop drives the `BadgeCheck` Lucide icon overlay

### Composition Examples — *[GAP FILL]*

- **`/u/[username]` Profile Page:** O6 is rendered within T2 PublicLayout as the page's header organism, above the content tabs (Presets / Collections / Liked / Activity per Product Spec §6.4).
- **`/u/[username]` own view:** `isOwnProfile` replaces Follow with Edit Profile button.
- **Components inside:** A4 Avatar, A5 Badge (verified), M8 XPProgressBar (own profile), M9 BadgeChip strip, A6 Tag (social links rendered as tag-like links).

---

## O7 — Upload Wizard

### Purpose
*(verbatim)*

Guide creators through uploading a preset in 3 steps.

### Variants
*(verbatim — by step)*

**Step indicator** *(verbatim):*
```
① Files  ──  ② Details  ──  ③ Preview
```

**Step 1 — Files** *(verbatim):*
- Drop zone for XML file or QR image (CC1 Preset Upload Drop Zone)
- OR paste Alight Motion link
- Thumbnail upload (required, cropped to 4:3 via CC5 Image Cropper)
- Preview video upload (optional)
- File validation inline

**Step 2 — Details** *(verbatim):*
- Title (required, A2 Input)
- Description (markdown, optional, CC4 Markdown Editor with live preview)
- Category (required, CC3 Category Picker)
- Tags (A6 Tag via CC2 Tag Input, max 10)
- Difficulty (segmented control / radio)
- AM Version minimum (dropdown)
- Device support (checkbox group: Android / iOS / Both)

**Step 3 — Preview** *(verbatim):*
- Full M1 PresetCard as it will appear in the grid
- Summary of all entered details
- [Publish] button with clear expectation ("Under review in 24h")

### Props — *[GAP FILL — not specified in source]*

```typescript
interface UploadWizardProps {
  currentStep: 1 | 2 | 3
  onStepChange: (step: 1 | 2 | 3) => void
  onPublish: (data: UploadFormData) => Promise<void>
  isPublishing: boolean
  formData: UploadFormData
  onFormDataChange: (data: Partial<UploadFormData>) => void
}

interface UploadFormData {
  // Step 1
  fileType?: 'xml' | 'qr' | 'link'
  fileUrl?: string
  amLink?: string
  thumbnailUrl?: string            // Cloudinary URL after upload
  previewVideoUrl?: string         // Cloudinary URL after upload
  // Step 2
  title?: string
  description?: string
  category?: CategoryKey
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  amVersionMin?: string
  deviceSupport?: ('android' | 'ios' | 'both')[]
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Step 1, idle | CC1 Drop Zone in idle state; thumbnail upload zone empty |
| Step 1, file valid | CC1 Drop Zone in valid state; thumbnail shows preview via CC5 |
| Step 1, file invalid | CC1 Drop Zone in error state; inline error message |
| Step 2, validation errors | A2 Input error states on required fields; scroll to first error on attempted advance |
| Step 3, pre-publish | Live M1 PresetCard preview from `formData`; all fields summary |
| Publishing (Step 3) | Publish button enters loading state (`isPublishing`); form fields disabled |
| Published (success) | Navigate away from wizard to the new preset page (or to a success screen — **[OPEN QUESTION]:** neither doc specifies the post-publish UX. Recommend navigating to the new preset page at `/preset/[slug]` with a success Toast (F1). |

### Accessibility — *[GAP FILL]*

- Step indicator is a `<ol>` of steps, with current step having `aria-current="step"`. Completed steps are not links (users should use the Back button to navigate backwards, not click steps arbitrarily — prevents accidental data loss).
- Each step's content area is a `<section aria-labelledby="step-[N]-heading">` with a visually-hidden `<h2 id="step-[N]-heading">` naming the step (e.g. "Step 1: Upload Files").
- "Back" and "Next" / "Publish" buttons: "Back" is `variant="ghost"`, "Next"/"Publish" is `variant="primary"` — per A1 composition example: `variant="ghost"` ("← Back") + `variant="primary" fullWidth` ("Publish Preset") on `xs`/`sm`.
- Step transition (slide animation) should not disorient keyboard users — when a step change occurs, focus moves to the top of the new step's content area (the step's `<section>` or its first focusable element), not left at the triggering button.
- Progress bar at the top of the wizard (step indicator line) is decorative; the `<ol>` step list provides semantic progress information to screen readers — no additional `role="progressbar"` needed on the visual line itself.
- All form fields within each step follow A2 Input, A3 Textarea, CC2–CC5 compound component accessibility rules.
- Upload file validation errors appear inline (per CC1 Drop Zone states), not as page-level alerts — this is appropriate since they're scoped to a specific input field.

### Responsive Behavior — *[GAP FILL, with reference to Design System §8 Upload Wizard grid spec]*

Per Design System §8: "Single column centered (max-width: 640px)" for the Upload Wizard.

| Breakpoint | Layout |
|---|---|
| All (`xs`–`2xl`) | Centered single column, `max-width: 640px` (the `--max-w-upload` token) |

- The wizard is intentionally single-column at all breakpoints — the narrowness focuses attention on each field and reduces cognitive load for creators doing their first upload.
- Step 3 PresetCard preview: M1 PresetCard in `default` variant, rendered at its natural card width within the 640px container (approximately 300–400px wide — wide enough to represent the real grid appearance accurately on desktop; on mobile the card spans the full container width as it would in the 1-column grid).
- "Back" and "Next" buttons: full-width (`fullWidth`) on `xs`/`sm`, inline (not full-width) at `md+` — per A1 Composition Examples.

### Motion Behavior — *[GAP FILL, specified in Product Spec §11]*

Tier 2 — Transition.

| Animation | Property | Duration | Easing | Source |
|---|---|---|---|---|
| Step forward transition | Current step: `translateX(0→-100%)` + `opacity` 1→0; next step: `translateX(100%→0)` + `opacity` 0→1 | 300ms | `--ease-in-out` | Product Spec §11 "Upload Wizard: Step transition: slide-out-left + slide-in-right, 300ms ease-in-out" (verbatim) |
| Step back transition | Reverse: current slides right-out, previous slides in from left | 300ms | `--ease-in-out` | inferred (reverse of forward) |
| Progress bar line advance | `width` transition on the connector line between steps | 400ms | `--ease-out` | Product Spec §11 "Progress bar fill: width transition, 400ms ease-out" (verbatim) |
| File upload progress (CC1) | Per CC1 Drop Zone's own states | — | — | CC1 |

`prefers-reduced-motion`: step transitions are instant (no slide); progress bar advance is instant.

### Design Tokens — *[GAP FILL]*

- Container max-width: `--max-w-upload` (640px per Design System §16 Tailwind config)
- Step indicator: completed steps use `--color-interactive-primary` (filled circle), current step uses `--color-interactive-primary` (ring), future steps use `--color-bg-elevated` (empty ring), connector line `--color-border-subtle` → `--color-interactive-primary` (filled on completion)
- Step connector typography: `label-sm`, `text-secondary` (step labels) → `text-accent` (active step)

### Composition Examples — *[GAP FILL]*

- **`/upload` page:** O7 is the sole organism on the page, rendered within T1 AppLayout (authenticated route only).
- **Internal components:** CC1 Preset Upload Drop Zone (Step 1), CC2 Tag Input (Step 2), CC3 Category Picker (Step 2), CC4 Markdown Editor (Step 2), CC5 Image Cropper (Step 1 thumbnail), M1 PresetCard (Step 3 preview), A1 Button (Back/Next/Publish), M8 XPProgressBar-like step indicator line.

---

## O8 — Comment Thread

### Purpose
*(verbatim)*

Nested comment system under preset pages.

### Variants
*(no variants — single pattern)*

**Features** *(verbatim):*
- Top-level comments sorted by: Newest / Top Liked
- Max 2 levels of nesting (reply to reply, no deeper)
- Pinned comment appears first with pin indicator
- Pagination (10 comments, load more)
- Real-time via Supabase subscriptions (new comments appear without refresh)

**Anatomy:**
```
[Sort: Newest ▾] [Top Liked]            [N comments]

[Comment composer — A3 Textarea + A1 Button "Post"]

── [Pinned ✦] ──────────────────────────────
M4 CommentItem (pinned)

──────────────────────────────────────────
M4 CommentItem
  ↳ M4 CommentItem (reply, depth=1)
  ↳ M4 CommentItem (reply, depth=1)
M4 CommentItem
...

[Load 10 more comments]
```

### Props — *[GAP FILL — not specified in source, derived from Product Spec §4 comments table and §13 API]*

```typescript
interface CommentThreadProps {
  presetId: string
  comments: CommentItemProps['comment'][]
  totalCount: number
  sort: 'newest' | 'top'
  onSortChange: (sort: 'newest' | 'top') => void
  hasMore: boolean
  onLoadMore: () => void
  isLoading: boolean
  currentUser?: {
    id: string
    username: string
    avatarUrl?: string
    displayName: string
  }
  presetOwnerId: string            // To determine isPresetOwner on each CommentItem
  onPostComment: (body: string) => Promise<void>
  onPostReply: (parentId: string, body: string) => Promise<void>
  onLikeComment: (commentId: string) => void
  onDeleteComment: (commentId: string) => void
  onPinComment: (commentId: string) => void
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Loading (initial) | A7 Skeleton `variant="text"` blocks at comment-like proportions (avatar circle + text lines), 3–5 placeholder items |
| Empty (no comments yet) | Empty state: "Be the first to comment" with A1 Button `variant="ghost"` pointing to the composer; the composer is still visible above the empty state |
| Loading more (pagination) | A8 Spinner `variant="dots"` below the last loaded comment |
| New real-time comment arrives | M4 CommentItem slides in from top (if sort is "newest") or is inserted at correct position (if sort is "top liked") — real-time via Supabase subscription |
| Comment composer, unauthenticated | Composer is replaced by a prompt: "Sign in to leave a comment" with A1 Button `variant="secondary"` linking to `/auth/login` |
| Comment submitted (loading) | Composer button enters loading state; optimistic update appends the new comment immediately |

### Accessibility — *[GAP FILL]*

- The thread is wrapped in `<section aria-labelledby="comments-heading">` with `<h2 id="comments-heading">[N] Comments</h2>`.
- Sort controls are `<button type="button" aria-pressed={sort === 'newest'}>Newest</button>` and `<button type="button" aria-pressed={sort === 'top'}>Top Liked</button>` — a toggle pair, not a select, since there are only two options. They can also be implemented as a `role="radiogroup"` with two `role="radio"` buttons per WCAG radiogroup pattern.
- The comment composer's Textarea (A3) has `aria-label="Write a comment"` (or a visually-visible label — preferred; see A3's accessibility note about placeholder-as-label being the one sanctioned exception, which applies here).
- "Post" button is `variant="primary"` only within the composer's own scope — the PresetDetail page's one `primary` button is M11 DownloadButton. The comment "Post" button should be `variant="secondary"` to avoid competing with the page-level primary CTA. **[OPEN QUESTION]:** neither doc explicitly states the comment post button's variant; this follows from A1's "max 1 primary per view" rule and should be confirmed.
- Real-time incoming comments: announced via `aria-live="polite"` on the thread container so screen reader users hear "New comment from @username" without being interrupted mid-reading.
- Pinned comment has a visible pin indicator ("Pinned ✦" or the `Pin` Lucide icon) with `aria-label="Pinned comment"` on that indicator element; the pin doesn't affect the CommentItem's own accessible structure.
- "Load more comments" trigger: explicit `<button>Load 10 more comments</button>` below the list as a fallback to IntersectionObserver-triggered pagination (same pattern as O4 PresetGrid's load-more fallback).
- Nested replies (depth=1) must not be indented via `padding-left` alone — that doesn't convey hierarchy to screen readers. Wrap in a `<div role="group" aria-label="Replies to [parent commenter name]">` so the grouping is semantically communicated.

### Responsive Behavior — *[GAP FILL]*

- Single-column at all breakpoints (comment threads are inherently linear — no grid behavior).
- On `xs`/`sm`, the composer Textarea auto-grows rather than having a resize handle (per A3 responsive rule).
- Nested reply indentation: `space-6` (24px) indent at `md+`; `space-4` (16px) at `xs`/`sm` (tighter indent to preserve readability on narrow viewports).
- Sort controls remain inline row at all breakpoints — two buttons, narrow enough to always fit.

### Motion Behavior — *[GAP FILL]*

Tier 3 — Entrance (new comments), Tier 1 — Feedback (like, post interactions).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| New comment entrance (real-time) | `opacity` 0→1 + `translateY(-8px→0)` (slides in from top for newest-sort) | `--dur-normal` (250ms) | `--ease-out` |
| Load-more batch entrance | Stagger fade-in-up, same pattern as O4 PresetGrid | 300ms, 30ms stagger | `--ease-out` |
| Comment like toggle | Per M4 CommentItem's like animation (inherits heart scale pattern at reduced intensity — a comment like is less significant than a preset like; `scale` 1→1.2→1 rather than 1→1.3→1) | 200ms | `--ease-spring-sm` |
| Comment composer submit → optimistic append | Composer clears + new CommentItem fades in | `--dur-fast` (150ms) clear, `--dur-normal` (250ms) entrance | `--ease-out` |

`prefers-reduced-motion`: all entrance animations are instant opacity; like scale is suppressed (fill change only).

### Design Tokens — *[GAP FILL]*

- Section background: none (inherits `--color-bg-base`)
- Sort controls: `label-md`, `--color-text-secondary` (default), `--color-text-accent` (active/pressed)
- Pinned badge: `--color-text-warning` icon, `body-xs` text, `--color-bg-warning` background pill
- Composer area: A3 Textarea tokens + A1 Button tokens
- Thread dividers between top-level comments: A9 Divider `variant="horizontal"` `--color-border-subtle`

### Composition Examples — *[GAP FILL]*

- **O5 Preset Detail below-fold:** O8 is the primary below-fold content after the hero section, rendered for all preset pages.
- **Internal components:** M4 CommentItem (top-level and nested), A3 Textarea (composer), A1 Button (post / load more), A7 Skeleton (loading state), A4 Avatar (composer avatar).

---

## O9 — Creator Dashboard

### Purpose
*(verbatim)*

Analytics and management center for creators.

### Variants
*(no structural variants — tab-based sub-sections are routes, not component variants)*

**Layout** *(verbatim):*
```
Header: greeting + quick stats sentence

Stats Row (4 cards):
  Total Downloads | Total Views | Followers | Likes

Chart Panel (8 cols + 4 cols):
  Downloads over time (area chart)
  | Top preset (mini card)
  | Recent activity feed

Presets Table (12 cols):
  Sortable table: Title | DLs | Views | Likes | Status | Date
  Row actions: Edit · Preview · Delete
```

**Header copy pattern** *(from Product Spec §6.6):*
```
"Good morning, [Display Name]. 👋"
"Your presets were downloaded [N] times today."
```

### Props — *[GAP FILL — not specified in source, derived from Product Spec §6.6 and §13 Analytics API]*

```typescript
interface CreatorDashboardProps {
  currentUser: {
    displayName: string
    username: string
  }
  stats: {
    totalDownloads: number
    totalViews: number
    followerCount: number
    totalLikes: number
    todayDownloads: number
    downloadsDelta?: number          // % change vs. prior period
    viewsDelta?: number
    followerDelta?: number
    likesDelta?: number
  }
  chartData: {
    period: '7d' | '30d' | '90d'
    points: { date: string; downloads: number }[]
  }
  onChartPeriodChange: (period: '7d' | '30d' | '90d') => void
  topPreset?: Preset                 // The single best-performing preset
  recentActivity: {
    type: 'download' | 'like' | 'comment' | 'follow'
    actor?: { username: string; displayName: string; avatarUrl?: string }
    preset?: { title: string; slug: string }
    createdAt: string
  }[]
  presets: {
    id: string
    slug: string
    title: string
    thumbnailUrl: string
    downloadCount: number
    likeCount: number
    viewCount: number
    status: 'pending' | 'published' | 'rejected' | 'removed'
    createdAt: string
  }[]
  isLoading: boolean
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Loading (initial) | M3 StatCard `isLoading` prop on all 4 stat cards; A7 Skeleton `variant="thumbnail"` at chart area dimensions; A7 Skeleton `variant="text"` rows in the table |
| Chart period toggle | Period buttons (7d / 30d / 90d) are a toggle group; selecting one re-fetches chart data and re-animates the chart draw |
| Preset table sort | Column header click triggers sort; active sort column shows a sort direction indicator (▲/▼) |
| Preset table row actions | ⋯ More button on each row opens F3 Dropdown with Edit · Preview · Delete. Delete opens F6 Confirmation Dialog before executing. |
| Empty state (no presets yet) | The Presets Table section is replaced by an empty state: "You haven't uploaded any presets yet" + A1 Button `variant="primary"` "Upload your first preset" linking to `/upload` |

### Accessibility — *[GAP FILL]*

- Page `<h1>` is the greeting text ("Good morning, [Name]").
- Stats Row: each M3 StatCard is individually announced with its full label and value — M3's own accessibility spec handles this.
- Chart: **Recharts** `AreaChart` *(ADR-022, RESOLVED)*. Uses `linearGradient` fill mapped to `--gradient-primary`. The chart must include a visually-hidden `<table>` or `<details>` element containing the raw data points for screen reader users. The chart container has `role="img" aria-label="Downloads over time chart, [period]"`. Add `recharts` to `package.json` dependencies.
- Period toggle (7d / 30d / 90d): `role="group" aria-label="Chart time period"` wrapping three `<button type="button" aria-pressed>` buttons.
- Preset table: a semantic `<table>` with `<caption>Your Presets</caption>`, `<th scope="col">` for each column, and `<th scope="row">` for the preset title column. Sortable columns have `aria-sort="ascending|descending|none"` per ARIA table patterns.
- Row actions dropdown (F3): triggered by `<button aria-label="Actions for [Preset Title]">` (not a generic "More" label, since users may navigate a list of these buttons).
- Quick Stats sentence ("Your presets were downloaded N times today"): renders as a `<p>`, not a heading. `N` should use `tabular-nums` and be a live region if it auto-updates (`aria-live="polite"`).

### Responsive Behavior — *[GAP FILL, with reference to Design System §8 Dashboard Layout]*

Per Design System §8:
```
Stats row:  4 cards × (3 cols each) = 12 cols
Charts:     8 cols (left) + 4 cols (right sidebar)
Tables:     12 cols
```

| Breakpoint | Stats row | Chart panel | Table |
|---|---|---|---|
| `xs`/`sm` | 2 cards per row (2×2 grid) | Chart full-width, top preset/activity below | Horizontal scroll or simplified columns |
| `md` | 2 cards per row | Chart (8 cols) + panel (4 cols) — may need to stack | Full table |
| `lg+` | 4 cards in one row | 8 cols + 4 cols per spec | Full table with row actions |

- On `xs`/`sm`, the Presets Table may collapse to a card-list layout (one M1 PresetCard-compact per row with stat chips) rather than a full horizontal table — full tables with 6 columns are not usable on narrow viewports. **[OPEN QUESTION]:** neither doc specifies the mobile table treatment; recommend card-list fallback with essential columns only (Title, Downloads, Status), but confirm before implementing.

### Motion Behavior — *[GAP FILL, specified in Product Spec §11]*

Tier 3 — Entrance (stat count-up, chart draw).

| Animation | Property | Duration | Easing | Source |
|---|---|---|---|---|
| Stat count-up (M3 StatCards on mount) | count-up `0 → value` | 1000ms | `--ease-out` | Product Spec §11 "Dashboard: Stat number: count-up animation on mount, 1000ms ease-out" (verbatim) |
| Chart line/area draw | Left-to-right reveal | 800ms | `--ease-out` | Product Spec §11 "Dashboard: Chart: line draws left-to-right, 800ms ease-out" (verbatim) |
| Chart period change | Chart fades out (150ms), new data fades in + redraws (800ms) | 150ms + 800ms | `--ease-in` then `--ease-out` | inferred |
| Stats Row entrance | M3 StatCards stagger-fade in, 40ms apart | 400ms | `--ease-out` | inferred from general stagger convention |

`prefers-reduced-motion`: count-up skipped (values render at final state immediately); chart draws without animation (data points appear at final positions).

### Design Tokens — *[GAP FILL]*

- Page background: `--color-bg-base`
- Chart area background: `--color-bg-surface`, `--radius-lg`
- Chart fill gradient: `linear-gradient(180deg, rgba(124,58,237,0.3), rgba(124,58,237,0))` for the area fill (top to transparent) — derived from `--color-interactive-primary` (`#7C3AED`) at varying opacity, not the `--gradient-primary` token (ADR-010, RESOLVED) since this is a vertical fade-to-transparent effect rather than the diagonal two-color primary gradient.
- Table: `--color-bg-surface` background, `--color-border-subtle` row dividers
- Table row hover: `--color-bg-elevated`
- Greeting: `display-md`, `text-primary`
- Quick stats sentence: `body-lg`, `text-secondary`

### Composition Examples — *[GAP FILL]*

- **`/dashboard` page:** O9 is the primary organism, rendered within T1 AppLayout (authenticated, creator role required).
- **Internal components:** M3 StatCard ×4 (stats row), Recharts `AreaChart` *(ADR-022, RESOLVED)*, M1 PresetCard `variant="compact"` (top preset mini-card), M5 NotificationItem-derived recent activity feed, A5 Badge `variant="status"` (preset status in table), F3 Dropdown (row actions), F6 Confirmation Dialog (delete confirm).
- **Dashboard sub-routes** (per Product Spec §3 Site Map): `/dashboard/analytics`, `/dashboard/presets`, `/dashboard/settings` are distinct pages — O9 covers only the `/dashboard` overview page, not the sub-route pages.

---

## O10 — Challenge Card (Hero)

### Purpose
*(verbatim)*

Feature the active weekly challenge prominently.

### Variants
*(verbatim — by challenge status)*

**Anatomy** *(verbatim):*
```
┌─────────────────────────────────────────────┐
│  [Challenge Banner Image]                   │
│  WEEKLY CHALLENGE                           │
│  "Best Summer Velocity Edit"                │
│                                             │
│  Ends in: [03d] [14h] [22m]  (countdown)   │
│  Prize: 500 XP + Featured Spot             │
│                                             │
│  [Submit Entry]  [Browse 127 Entries →]     │
└─────────────────────────────────────────────┘
```

Challenge statuses (per Product Spec §4 `challenges.status`): `upcoming` · `active` · `judging` · `ended`.

| Status | Layout difference |
|---|---|
| `upcoming` | Countdown shows time until start; CTA is disabled / "Coming Soon" |
| `active` | Full layout per anatomy above |
| `judging` | "Submission closed — voting in progress"; countdown shows judging period end |
| `ended` | Winners displayed; CTAs replaced with "View Results" |

### Props — *[GAP FILL — not specified in source, derived from Product Spec §4 challenges table and §6.8 Challenges Page]*

```typescript
interface ChallengeCardHeroProps {
  challenge: {
    id: string
    slug: string
    title: string
    description?: string
    bannerUrl?: string
    theme: string
    startsAt: string
    endsAt: string
    status: 'upcoming' | 'active' | 'judging' | 'ended'
    prizeXP: number
    entryCount: number
    winners?: {
      rank: 1 | 2 | 3
      preset: Preset
      voteCount: number
    }[]
  }
  currentUser?: {
    id: string
    isAuthenticated: boolean
    hasEntered: boolean              // Has the current user already submitted an entry?
  }
  onSubmitEntry: () => void
  onBrowseEntries: () => void
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| `status: active`, not entered | [Submit Entry] CTA enabled, [Browse Entries] secondary |
| `status: active`, already entered | [Submit Entry] replaced by "✓ Entry submitted" (success state, non-interactive); [Browse Entries] remains |
| `status: upcoming` | Countdown shows time until `startsAt`; [Submit Entry] disabled with tooltip "Opens [date]" |
| `status: judging` | Submission period over; countdown shows judging end; "Voting in progress" label |
| `status: ended`, winners set | Winners podium (1st/2nd/3rd place preset thumbnails + creator names) replaces countdown + CTAs |
| No banner image (`bannerUrl` null) | Fallback: gradient banner using the challenge's category color or the accent gradient |
| Loading | A7 Skeleton covering the banner + text lines |

### Accessibility — *[GAP FILL]*

- The challenge card is a `<section aria-labelledby="challenge-title">` with `<h2 id="challenge-title">` for the challenge name (not `<h1>` — the page's `<h1>` is "Challenges" or the page title; the active challenge card is a prominent section within that page).
- "WEEKLY CHALLENGE" overline label is decorative context — renders as `<p>` or `<span>`, not a heading.
- Countdown timer: **ADR-023 RESOLVED — Hybrid countdown.** Default display is `dd:hh:mm`, updating every 60 seconds. When `timeRemaining < 600s` (final 10 minutes), the format switches to `mm:ss` and updates every second — at this point days/hours are zero and are hidden. Accessibility: `role="timer"` on the countdown container; `aria-live="off"` at all times (avoids disruptive screen reader announcements on every tick); render as a `<time>` element with `datetime` attribute (machine-readable ISO timestamp); provide a visually-hidden `<span className="sr-only">Challenge ends [formatted date]</span>` as the static text alternative.
- "Submit Entry" CTA: `variant="primary"` Button. When disabled (`status: upcoming`), include a tooltip (F4) explaining when it opens, and ensure the disabled button has an accessible reason via `aria-describedby` pointing to a visually-hidden note ("Opens [date]").
- "Already entered" state: announces the state change via a polite live region.
- Banner image: `alt="[Challenge title] challenge banner"`.
- Entry count: "127 Entries" — the number is live but only needs `aria-live` if it auto-updates without user interaction.
- `shadow-glow-lg` per Design System §6 Usage Rules ("shadow-glow-lg on the active challenge card hero") — this is the only component that uses the largest glow token.

### Responsive Behavior — *[GAP FILL]*

| Breakpoint | Layout |
|---|---|
| `xs`/`sm` | Full width, stacked: banner top, text/countdown/CTAs below |
| `md+` | Full-width card with banner as background or left panel + right content |

- Banner aspect ratio: **[OPEN QUESTION]:** not specified. Recommend 16:9 (wide format appropriate for a hero banner) or 3:1 (panoramic, matching the Home Feed right sidebar context). Needs design confirmation.
- Countdown timer unit boxes (`[03d] [14h] [22m]`): flex row at all breakpoints; on `xs`, each unit box shrinks slightly but remains readable.
- CTAs: stacked full-width on `xs`/`sm`; inline on `md+`.

### Motion Behavior — *[GAP FILL]*

Tier 4 — Ambient (countdown tick) / Tier 3 — Entrance (banner load).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Banner entrance | `opacity` 0→1 | `--dur-normal` (250ms) | `--ease-out` |
| Countdown unit digit change | Digit flips (a brief `scale(1→0.8→1)` or a card-flip effect on the unit) — **[OPEN QUESTION]:** neither doc specifies the countdown unit animation | `--dur-fast` (150ms) | `--ease-in-out` |
| Submit Entry button → "✓ Entry submitted" state | Success state transition per M11 DownloadButton's success animation pattern | `--dur-normal` (250ms) | `--ease-out` |

`prefers-reduced-motion`: countdown digit change is instant; banner entrance is instant.

### Design Tokens — *[GAP FILL]*

- Card background: `--color-bg-surface`
- Card shadow: `--shadow-glow-lg` (the largest glow token, reserved for this component per Design System §6)
- Card radius: `--radius-xl` (16px)
- Banner fallback gradient: `linear-gradient(135deg, var(--color-interactive-primary), var(--color-accent-400))`
- Overline ("WEEKLY CHALLENGE"): `label-xs`, `text-accent`, uppercase, `letter-spacing: 0.06em`
- Challenge title: `display-md` or `display-lg` depending on title length
- Countdown unit boxes: `display-md` (number), `label-xs` (unit label: "d" / "h" / "m"), `--color-bg-elevated` box background, `--radius-md`
- Prize text: `body-sm`, `text-secondary`
- Entry count: `body-sm`, `text-tertiary`

### Composition Examples — *[GAP FILL]*

- **`/challenges` page hero (§6.8):** O10 at full width above the "Past Challenges" and "Upcoming Challenges" sections.
- **Home Feed right sidebar (§6.2):** O10 in a condensed form within the 280px right panel at `xl+` — this condensed usage may warrant a separate `compact` variant in a future iteration, but is not specified in the current source docs. **[OPEN QUESTION]:** the Home Feed sidebar spec says "Active Challenge card" but the Design System only defines one anatomy for O10. Whether the sidebar shows a condensed version or the full card (which would overflow a 280px column) is unresolved.

---

## O11 — Leaderboard Panel

### Purpose
*(verbatim)*

Show top creators by XP or downloads.

### Variants
*(verbatim — by type toggle)*

- Global: top 50 by XP all-time
- Monthly: top 20 by downloads this month
- Category: top 10 in each category by downloads

**Anatomy** *(verbatim):*
```
🏆 Leaderboard                    [Monthly ▾]

#1  [avatar] CreatorName   89.4K DLs
#2  [avatar] CreatorName   72.1K DLs
#3  [avatar] CreatorName   61.8K DLs
[...more collapsed]
[View Full Leaderboard →]
```

### Props — *[GAP FILL — not specified in source, derived from Product Spec §19 Leaderboard spec]*

```typescript
interface LeaderboardPanelProps {
  entries: {
    rank: number
    creator: {
      username: string
      displayName: string
      avatarUrl?: string
      isVerified: boolean
    }
    score: number                    // Downloads count or XP depending on mode
    scoreLabel: string               // e.g. "89.4K DLs" | "12,450 XP"
    delta?: number                   // Position change from previous period (+ up, - down, 0 same)
  }[]
  mode: 'global-xp' | 'monthly-downloads' | 'category-downloads'
  category?: CategoryKey             // Required when mode="category-downloads"
  period?: string                    // e.g. "June 2026" for monthly display
  onModeChange: (mode: LeaderboardPanelProps['mode']) => void
  viewAllHref: string                // Link to the full leaderboard page
  maxVisible?: number                // Default: 5 (condensed panel context)
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Default | Top `maxVisible` entries shown (default 5), "View Full Leaderboard →" link below |
| Loading | A7 Skeleton: avatar circles + text lines for each entry row |
| Mode change | Entries crossfade (old list fades out, new list fades in) rather than a hard swap |
| Rank change (live update, per Product Spec §19 "animated positions") | Entry rows animate to their new positions via `translateY` — the reorder animation (per M2 CreatorCard `leaderboard` variant motion spec: "position reorder via `translateY`, 400ms, `--ease-in-out`") |
| Current user in leaderboard | Their entry is highlighted: `--color-bg-accent` background, left accent bar |

### Accessibility — *[GAP FILL]*

- Renders as `<section aria-labelledby="leaderboard-heading">` with `<h2 id="leaderboard-heading">Leaderboard</h2>`.
- The list of entries is an `<ol>` (ordered list) since rank is meaningful — each `<li>` begins with the rank number as visible text, not just visual styling.
- Mode selector (`[Monthly ▾]` dropdown): `<button aria-haspopup="listbox" aria-expanded>` triggering an F3 Dropdown pattern, or a native `<select>` for simplicity. The mode is conveyed in the heading or as a visually-adjacent label.
- Each entry row: `<li>` containing a link to `/u/[username]` for the creator's profile. The full accessible label of each entry includes rank + name + score, e.g. `aria-label="Rank 1: CreatorName, 89,400 downloads"` on the `<a>` element.
- Delta (position change) indicator (▲+2, ▼-1, —): `aria-label="Up 2 positions"` / `aria-label="Down 1 position"` / `aria-label="No change"` on the delta element, which is otherwise `aria-hidden` if adjacent visible text already conveys it.
- "View Full Leaderboard →" is an `<a>` link, not a button.
- Current-user highlight: `aria-label="Your position"` or a visually-hidden "(You)" suffix after the display name — color alone is insufficient.

### Responsive Behavior — *[GAP FILL]*

- In the Home Feed right sidebar context (`xl+`, 280px column): `maxVisible={5}`, compact layout with A4 Avatar `size="sm"`, abbreviated score label. This is the primary designed context.
- On `/leaderboard` full page (if it exists — it is referenced in Product Spec §19 but has no corresponding route in the Site Map §3): O11 at `maxVisible={50}` with full-width rows. **[OPEN QUESTION]:** the Site Map does not list a `/leaderboard` route despite the panel having a "View Full Leaderboard →" link. This destination page is unspecified.
- The panel adapts gracefully at any container width — it is a column-filling component, not a fixed-width one.

### Motion Behavior — *[GAP FILL, partially specified in Product Spec §19 and M2 CreatorCard motion spec]*

Tier 3 — Entrance (initial load), Tier 4 — Ambient (live rank updates).

| Animation | Property | Duration | Easing | Source |
|---|---|---|---|---|
| Entry list entrance | `opacity` 0→1 + `translateY(8px→0)`, staggered 30ms | 300ms | `--ease-out` | inferred from general list-entrance convention |
| Rank position change (live) | `translateY` to new position (layout animation) | 400ms | `--ease-in-out` | M2 CreatorCard `leaderboard` variant motion spec (verbatim): "position reorder via translateY, 400ms" |
| Mode crossfade | old list `opacity` 1→0 (150ms), new list `opacity` 0→1 (250ms) | 150ms + 250ms | `--ease-in` then `--ease-out` | inferred |

`prefers-reduced-motion`: entrance stagger collapses to instant; rank-change reorder is instant position swap; mode crossfade is instant.

### Design Tokens — *[GAP FILL]*

- Panel background: `--color-bg-surface`
- Panel radius: `--radius-lg` (12px)
- Panel shadow: `--shadow-card`
- Rank number: `display-sm` (24px) for top 3; `heading-md` (16px) for ranks 4+
- Score label: `mono-sm` (`JetBrains Mono`), `tabular-nums`, `text-secondary`
- Creator name: `heading-sm`, `text-primary`
- Current-user row background: `--color-bg-accent`
- Delta increase: `--color-text-success`, `TrendingUp` Lucide icon
- Delta decrease: `--color-text-error`, `TrendingDown` Lucide icon
- Delta neutral: `--color-text-tertiary`, `Minus` Lucide icon

### Composition Examples — *[GAP FILL]*

- **Home Feed right sidebar (§6.2, `xl+` only):** O11 `maxVisible={5}` `mode="monthly-downloads"` — the default mode for the sidebar context per Home Feed spec's "Leaderboard top 5."
- **`/challenges` page sidebar or section:** O11 for challenge-period rankings.
- **Internal components:** M2 CreatorCard `variant="leaderboard"` for each row entry; mode selector via F3 Dropdown or `<select>`.

---

*End of Organisms — continued in `04-templates.md`*
