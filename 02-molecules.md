# PresetHub Component Library — 02. Molecules

**Source of truth for existing specs:** `PresetHub_Design_System.md` §17 "MOLECULES"
**This file:** preserves those specs verbatim, appends Accessibility / Responsive / Motion / Composition where the source was silent.

---

## M1 — PresetCard

### Purpose

_(verbatim)_

The primary content unit. Every preset appears as this card in grids. Must work in masonry, equal-height, and list layouts.

### Variants

_(verbatim)_

**Anatomy:**

```
┌─────────────────────────────────┐
│  THUMBNAIL                      │ ← 4:3 ratio image/video
│  [category-badge]  [diff-badge] │ ← Positioned absolute, top of thumb
│                                 │
│  ─ ─ hover: video autoplay ─ ─ │
├─────────────────────────────────┤
│  [avatar] @creator    [follow?] │ ← Creator row
│                                 │
│  Preset Title                   │ ← heading-md, max 2 lines
│  Short description...           │ ← body-sm, 1 line, text-secondary
│                                 │
│  ❤ 2.4K    ⬇ 12K    💬 89     │ ← Stat row
└─────────────────────────────────┘
```

**Card Variants:**

| Variant    | When            | Difference                           |
| ---------- | --------------- | ------------------------------------ |
| `default`  | Standard grid   | No additional treatment              |
| `featured` | Editorial pick  | Violet glow border, "Featured" badge |
| `trending` | Top of trending | Rank number (#1, #2) top-left        |
| `compact`  | List view       | Horizontal layout, smaller thumb     |
| `skeleton` | Loading         | Full skeleton                        |

### Props

_(verbatim)_

```typescript
interface PresetCardProps {
  preset: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    thumbnailUrl: string;
    previewVideoUrl?: string;
    category: CategoryKey;
    difficulty: "beginner" | "intermediate" | "advanced";
    downloadCount: number;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    creator: {
      username: string;
      displayName: string;
      avatarUrl?: string;
      isVerified: boolean;
    };
    isFeatured?: boolean;
    trendingRank?: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    createdAt: string;
  };
  variant?: "default" | "featured" | "trending" | "compact";
  showFollow?: boolean;
  onLike?: (presetId: string) => void;
  onBookmark?: (presetId: string) => void;
  onShare?: (presetId: string) => void;
}
```

### States

_(verbatim, expanded)_

States: default | hover | loading (skeleton) | featured (glow border)

| State                         | Treatment                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Default                       | `--shadow-card`, static thumbnail                                                              |
| Hover                         | `translateY(-4px)`, `--shadow-card-hover`, video autoplays (muted, loop) in place of thumbnail |
| Active / pressed (mobile tap) | `scale(0.99)`                                                                                  |
| Loading                       | `variant="skeleton"` — full Skeleton `card` replacement, not a partial overlay                 |
| Featured                      | persistent `--shadow-glow-md` border treatment, independent of hover state                     |
| Focus (keyboard)              | `--shadow-focus` ring around the entire card boundary                                          |

**Behavior** _(verbatim):_

- Video autoplays on hover (muted, loop)
- Video pauses and thumbnail shows on mouse leave
- Clicking anywhere goes to `/preset/[slug]`
- Like/bookmark buttons have optimistic updates
- Category badge links to `/explore?category=[name]`

### Accessibility — _[GAP FILL]_

- The card's primary click target ("clicking anywhere goes to `/preset/[slug]`") is implemented as the _entire card_ being a single `<a href="/preset/[slug]">` wrapping non-interactive content, with the Like/Bookmark/Share buttons and Category badge link rendered as nested interactive elements that **stop propagation** so they don't also trigger the card-level navigation. This is the standard "card with nested interactive elements" pattern — without stopPropagation, clicking "Like" would both like the preset _and_ navigate away, which is broken behavior.
- Alt text on the thumbnail follows Design System §13 exactly: `alt="[Preset Name] by [Creator Name] — [Category] preset"`.
- The autoplay-on-hover video must **never autoplay with sound** (always muted, per spec) and must respect `prefers-reduced-motion`: when reduced motion is enabled, do not autoplay video on hover at all — show only the static thumbnail, since autoplaying motion content is exactly the kind of thing `prefers-reduced-motion` exists to suppress, independent of whether it's framed as a "transition."
- Stat row icons (❤ ⬇ 💬) are `aria-hidden="true"`; the surrounding text (e.g. "2.4K likes") is the accessible content, not the emoji/icon glyph.
- `trendingRank` (e.g. "#1") must be announced as part of the accessible name when present — e.g. `aria-label="#1 trending: [Preset Title] by [Creator Name]"` on the card link, so screen reader users get the same context sighted users get from the visual rank badge.
- Like/Bookmark icon buttons toggle `aria-pressed` to reflect `isLiked`/`isBookmarked` state, in addition to the visual fill/outline icon change.

### Responsive Behavior — _[GAP FILL]_

Per Design System §8 Grid System "Preset Grid" table and §9 "Layout Decisions Per Breakpoint":

| Breakpoint         | Columns | Card width     | Notes                                                                                                  |
| ------------------ | ------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `xs`/`sm` (<768px) | 1       | Full width     | `compact` variant not used here by default — full card width comfortably fits the full vertical layout |
| `md` (768–1023px)  | 2       | ~50% minus gap |                                                                                                        |
| `lg` (1024–1279px) | 3       | ~33% minus gap |                                                                                                        |
| `xl` (1280–1535px) | 4       | ~25% minus gap |                                                                                                        |
| `2xl` (≥1536px)    | 5       | ~20% minus gap |                                                                                                        |

- `compact` variant (horizontal layout, smaller thumbnail) is reserved for explicit list-view contexts rather than being the automatic mobile layout. The default masonry `default` variant remains vertical at all breakpoints. **ADR-007 (RESOLVED):** confirmed — no automatic breakpoint switch to `compact`; it stays opt-in by the consuming page/organism. See ARCHITECTURE_DECISIONS.md ADR-007.
- Video-autoplay-on-hover is a desktop-only behavior in practice (no hover state exists on touch devices). **ADR-006 (RESOLVED):** on touch devices, the card shows the static thumbnail until tapped — no autoplay-on-viewport-entry. Tap navigates to the preset detail page, where the video plays via M10 VideoPlayer's `context="detail"` behavior. This avoids the data cost of autoplaying video for every card scrolled past, given the mobile, data-conscious primary audience (§2 personas). See ARCHITECTURE_DECISIONS.md ADR-006.

### Motion Behavior — _[GAP FILL, partially specified in Product Spec §11]_

Tier 2 — Transition (hover state) / Tier 3 — Entrance (grid mount).

| Animation                            | Property                                                  | Duration | Easing          | Source                                       |
| ------------------------------------ | --------------------------------------------------------- | -------- | --------------- | -------------------------------------------- |
| Card hover                           | `translateY(-4px)` + shadow swap                          | 200ms    | `--ease-out`    | Product Spec §11 "Preset Card" (verbatim)    |
| Thumbnail → video crossfade          | `opacity`                                                 | 300ms    | —               | Product Spec §11 (verbatim)                  |
| Like button                          | `scale` 1→1.3→1                                           | 300ms    | `--ease-spring` | Product Spec §11 (verbatim) + particle burst |
| Bookmark                             | icon fill + `scale`                                       | 200ms    | `--ease-spring` | Product Spec §11 (verbatim)                  |
| Grid entrance (within O4 PresetGrid) | `opacity` 0→1 + `translateY(16px→0)`, staggered 40ms/card | 400ms    | `--ease-out`    | Product Spec §11 "Feed / Grid" (verbatim)    |

`prefers-reduced-motion`: hover translateY and entrance stagger collapse to instant opacity-only changes; the Like particle burst is suppressed entirely (decorative, not state-communicating) while the heart's fill-color change (the actual state indicator) still occurs instantly.

### Design Tokens — _[GAP FILL]_

- Card background: `--color-bg-surface`
- Card border (featured): violet glow via `--shadow-glow-md`
- Card radius: `--radius-lg` (12px), per Design System §5 "Preset cards → radius-lg"
- Shadow: `--shadow-card` (default), `--shadow-card-hover` (hover)
- Category badge: see A5 Badge category variant tokens
- Difficulty badge: see A5 Badge difficulty variant tokens
- Creator row text: `heading-sm` (creator name), `body-sm` `text-secondary` (description excerpt)
- Title: `heading-md`, `text-primary`, max 2 lines (`-webkit-line-clamp: 2`)
- Stat row: `body-sm`, `text-secondary`, `font-variant-numeric: tabular-nums`

### Composition Examples — _[GAP FILL]_

- **O4 PresetGrid:** renders an array of PresetCard `variant="default"`, staggered entrance.
- **Home Feed "Trending" tab:** PresetCard `variant="trending"` with `trendingRank` set 1–N.
- **Landing Page trending strip:** PresetCard `variant="default"` in an auto-scrolling horizontal rail (Product Spec §6.1).
- **Editorial / homepage featured section:** PresetCard `variant="featured"`.
- **Profile page "Presets" tab grid:** PresetCard `variant="default"`, `showFollow={false}` (creator is already established by the page context — a redundant follow button on every card on the creator's own profile would be noisy).

---

## M2 — CreatorCard

### Purpose

_(verbatim)_

Preview of a creator. Used in creator directory and recommendation panels.

### Variants

_(verbatim, anatomy + variant list)_

**Anatomy:**

```
┌──────────────────────────────────────┐
│  [avatar-xl]  [verified-badge]       │
│  Display Name                        │
│  @username                           │
│                                      │
│  [bio excerpt — 1 line]              │
│                                      │
│  📦 48 presets · 👥 3.2K · ⬇ 89K   │
│                                      │
│  [Follow button]  [View Profile]     │
└──────────────────────────────────────┘
```

- `card` — Standalone card (creator directory)
- `mini` — Compact horizontal (sidebar, following list)
- `leaderboard` — With rank number

### Props — _[GAP FILL — not specified in source, derived from anatomy + Product Spec `users` table]_

```typescript
interface CreatorCardProps {
  creator: {
    username: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    isVerified: boolean;
    presetCount: number;
    followerCount: number;
    totalDownloads: number;
    level?: number;
    isFollowing?: boolean;
  };
  variant?: "card" | "mini" | "leaderboard";
  rank?: number; // Required when variant="leaderboard"
  onFollow?: (username: string) => void;
}
```

### States — _[GAP FILL]_

| State                              | Treatment                                                                                                                                                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                            | `--shadow-card`, static                                                                                                                                                                                                    |
| Hover                              | `translateY(-4px)` + `--shadow-card-hover` (same card-hover pattern as PresetCard, per Design System §10 Motion Patterns "Card Hover" — this pattern is universal to all card-shaped components, not PresetCard-exclusive) |
| Loading                            | Skeleton composite: `variant="avatar"` + multiple `variant="text"` lines                                                                                                                                                   |
| Follow button pressed (optimistic) | Button immediately flips to "Following" state before server confirms; reverts on error                                                                                                                                     |

### Accessibility — _[GAP FILL]_

- Entire card (except the Follow button) is a single link to `/u/[username]`, following the same nested-interactive-element pattern as PresetCard (M1) — Follow button stops click propagation.
- Follow button toggles `aria-pressed` and its visible label, per Design System §13's general toggle-button pattern: "Follow" ⇄ "Following."
- Stat row ("📦 48 presets · 👥 3.2K · ⬇ 89K") icons are `aria-hidden="true"`; the numbers + their unit context (presets/followers/downloads) form the accessible text, e.g. `aria-label="48 presets, 3,200 followers, 89,000 downloads"` on the row, or individually labeled if each stat is a separate element.
- `leaderboard` variant's `rank` number must be in the accessible name, not purely visual styling — e.g. `aria-label="Rank #3: [Display Name]"`.

### Responsive Behavior — _[GAP FILL]_

- `card` variant: used in Creator Directory grid (`/creators` route per Product Spec §3 Site Map), follows a simpler grid than PresetCard's masonry — likely 2–4 columns depending on breakpoint. **[OPEN QUESTION]:** the Product Spec's Site Map lists `/creators` as a route but never details its page layout in §6 UI Pages — recommend adding a `/creators` page spec to the Product Specification before this card's grid context is fully implementable.
- `mini` variant: fixed compact width, used inline in Navigation Sidebar's "Recent Activity" / "Following" list (O1) and CC6 Follower/Following List — does not reflow at different breakpoints since it's always in a fixed-width sidebar/panel context.
- `leaderboard` variant: full-width row inside O11 Leaderboard Panel, stacks naturally; on `xs`/`sm`, the stat row may need to abbreviate (e.g. "89K DLs" instead of full stat row). Design System doesn't specify this explicitly, but O11's own anatomy diagram already shows abbreviated single-stat display ("89.4K DLs"), suggesting `leaderboard` variant is inherently more compact than `card`/`mini` by design, not just responsively.

### Motion Behavior — _[GAP FILL]_

Tier 2 — Transition (hover) / Tier 1 — Feedback (follow toggle).

| Animation                                                                   | Property                                 | Duration | Easing          |
| --------------------------------------------------------------------------- | ---------------------------------------- | -------- | --------------- |
| Card hover (`card` variant only — `mini`/`leaderboard` are denser, no lift) | `translateY(-4px)` + shadow              | 200ms    | `--ease-out`    |
| Follow → Following toggle                                                   | `background-color`, label text crossfade | 150ms    | `--ease-in-out` |
| Leaderboard rank change (if live-updating)                                  | position reorder via `translateY`        | 400ms    | `--ease-in-out` |

### Design Tokens — _[GAP FILL]_

- Card background: `--color-bg-surface`
- Radius: `--radius-lg` (12px) for `card`; `--radius-md` (8px) for `mini` row item
- Avatar: per A4 Avatar tokens, size `xl` (`card`), `sm` (`mini`), `md` (`leaderboard`)
- Stat text: `body-sm`, `text-secondary`, `tabular-nums`
- Display name: `heading-md`

### Composition Examples — _[GAP FILL]_

- **`/creators` directory page:** grid of CreatorCard `variant="card"`.
- **O1 Navigation Sidebar "Following" activity list:** CreatorCard `variant="mini"`.
- **O11 Leaderboard Panel:** CreatorCard `variant="leaderboard"` with `rank` 1–5 inline, "View Full Leaderboard →" link below.
- **CC6 Follower/Following List:** stack of CreatorCard `variant="mini"`, per CC6's own spec ("Stack of mini CreatorCards, load more at bottom").

---

## M3 — StatCard

### Purpose

_(verbatim)_

Display a single metric prominently. Used in creator dashboard header.

### Variants

_(verbatim, anatomy)_

**Anatomy:**

```
┌─────────────────────────┐
│  Icon                   │
│                         │
│  12,458                 │ ← display-md, tabular-nums
│  Total Downloads        │ ← label-sm, text-secondary
│  ▲ +12% this week       │ ← body-xs, success or error color
└─────────────────────────┘
```

### Props

_(verbatim)_

```typescript
interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  delta?: number; // Percentage change
  deltaPeriod?: string; // e.g. "this week"
  format?: "number" | "compact" | "percentage";
  isLoading?: boolean;
}
```

**Animation** _(verbatim):_ Count-up animation on mount (`0 → value`, 1000ms ease-out).

### States — _[GAP FILL]_

| State                  | Treatment                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                | static display                                                                                                                                     |
| Loading (`isLoading`)  | Skeleton `variant="text"` replaces the value number; icon and label remain visible (only the number, which requires a data fetch, is skeletonized) |
| Delta positive         | `▲` glyph + `--color-text-success`                                                                                                                 |
| Delta negative         | `▼` glyph + `--color-text-error`                                                                                                                   |
| Delta zero / undefined | delta row omitted entirely (not shown as "0%" or "—")                                                                                              |

### Accessibility — _[GAP FILL]_

- The count-up animation is purely visual; the **final** value must be what's exposed to assistive technology immediately (don't let a screen reader read out interim animated values) — implement via `aria-live="off"` on the animating number with the final value set directly in the DOM, or simply ensure the live region isn't triggered until animation completes.
- Icon is `aria-hidden="true"`; label text carries the meaning.
- Delta arrow (▲/▼) glyphs are supplemented with text, not color/glyph alone: "+12% this week" already includes the sign, satisfying the "don't rely on color alone" rule, but the ▲/▼ glyph itself should also be `aria-hidden="true"` since the "+"/"−" sign in the text is the redundant-but-accessible version of the same information.
- `font-variant-numeric: tabular-nums` (per Design System §3 "Tabular Numbers") prevents layout shift as the count-up animates — this is a functional accessibility/stability concern, not just visual polish, since shifting layout during animation can disorient users with vestibular sensitivity even when the motion itself is small.

### Responsive Behavior — _[GAP FILL]_

Per Design System §9 "Dashboard stats: 2×2 grid (xs/sm) → 4×1 row (md+)":

- `xs`/`sm`: 2 StatCards per row (2×2 grid for the standard 4-card dashboard header)
- `md`/`lg`/`xl`/`2xl`: 4 StatCards in a single row

Internal card layout (icon/value/label/delta stack) doesn't change shape across breakpoints — only the grid arrangement around it does.

### Motion Behavior — _[GAP FILL, count-up partially specified]_

Tier 4 — Ambient (count-up is a one-time mount animation, categorized here because Design System §10 explicitly places "Stat number: count-up" under its Dashboard motion patterns, distinct from Tier 1–3 interaction-driven motion).

| Animation          | Property                                          | Duration | Easing       |
| ------------------ | ------------------------------------------------- | -------- | ------------ |
| Count-up on mount  | numeric value interpolation                       | 1000ms   | `--ease-out` |
| Delta row entrance | `opacity` 0→1, slight delay after count-up starts | 250ms    | `--ease-out` |

`prefers-reduced-motion`: count-up animation is skipped entirely — the final value renders immediately rather than playing a reduced-duration version, since a numeric count-up is purely decorative motion with no functional state to communicate (unlike a spinner).

### Design Tokens — _[GAP FILL]_

- Card background: `--color-bg-surface`
- Radius: `--radius-lg` (12px)
- Value: `display-md`, `text-primary`, `tabular-nums`
- Label: `label-sm`, `text-secondary`
- Delta: `body-xs`, `text-success` or `text-error`
- Icon: `icon-lg` (24px) per Design System §7

### Composition Examples — _[GAP FILL]_

- **O9 Creator Dashboard stats row:** 4× StatCard — Total Downloads, Total Views, Followers, Likes — per O9's layout spec.
- **Future Analytics deep-dive (Product Spec §20 Phase 4):** StatCard reused for additional metrics once "Analytics deep-dive" ships for PresetHub Pro creators.

---

## M4 — CommentItem

### Purpose

_(verbatim)_

Display a single comment with interaction controls.

### Variants

_(verbatim, anatomy)_

**Anatomy:**

```
[avatar-sm] [username] · [time-ago]
            [comment body text]
            [❤ 12] [↩ Reply] [... More]

            ↳ [avatar-xs] [reply...]   ← Nested reply
```

### Props

_(verbatim)_

```typescript
interface CommentItemProps {
  comment: {
    id: string;
    body: string;
    author: UserMini;
    likeCount: number;
    isLiked: boolean;
    isPinned: boolean;
    createdAt: string;
    replies?: CommentItemProps["comment"][];
  };
  isOwner: boolean; // Can delete
  isPresetOwner: boolean; // Can pin
  onLike: (id: string) => void;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  depth?: 0 | 1; // Max 2 levels
}
```

### States — _[GAP FILL]_

| State                                                            | Treatment                                                                                                                                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                                                          | as anatomy diagram                                                                                                                                                         |
| Pinned (`isPinned`)                                              | pin icon indicator next to username, sorts first per O8 Comment Thread rules                                                                                               |
| Hover                                                            | "More" (`⋯`) action becomes visible/emphasized (can be hidden by default on desktop, always visible on touch since there's no hover)                                       |
| Like pressed                                                     | optimistic like-count increment + heart fill, consistent with the PresetCard/global Like Animation pattern (Design System §10: scale 1→1.4→1, color shift, particle burst) |
| Deleted (soft-delete, per Product Spec §4 `comments.is_removed`) | body text replaced with "[comment removed]" placeholder in `text-tertiary`, reply thread (if any) remains visible beneath it                                               |
| Reply composer open                                              | inline Textarea (A3) appears beneath the comment, per A3's "CommentItem reply composer" composition note                                                                   |

### Accessibility — _[GAP FILL]_

- Each comment is a discrete region; consider `<article>` semantics per comment for clear screen-reader landmark navigation in long threads.
- "More" (`⋯`) action opens an F3 Dropdown Menu containing Delete (if `isOwner`) and Pin (if `isPresetOwner`) — menu items are conditionally rendered, not disabled-but-visible, since an owner shouldn't see a "Delete" option for someone else's comment at all (per Product Spec §14 RLS: "Users can only delete their own comments").
- Like button: `aria-pressed={isLiked}`, accessible label includes the count: `aria-label={isLiked ? "Unlike comment (12 likes)" : "Like comment (12 likes)"}`.
- Nested reply depth is capped at 2 levels (per props `depth?: 0 | 1`) — this cap exists partly _for_ accessibility/readability, since deeply nested threads become very difficult to navigate via screen reader; do not allow a "Reply" action to appear on `depth={1}` comments, since that would attempt a third level the UI intentionally doesn't support cleanly (though the database schema itself permits arbitrary `parent_id` nesting — the UI deliberately flattens beyond 2 levels).
- Time-ago text (`createdAt`) should have a `title` attribute or equivalent with the full absolute timestamp for users who need precise timing, since relative time ("2h ago") is inherently approximate and not useful to compare against other timestamps.

### Responsive Behavior — _[GAP FILL]_

- Avatar size step-down on narrow viewports isn't specified, but the nesting indentation (`↳`) for `depth=1` replies must shrink on `xs` to avoid excessive horizontal compression of the reply's text column — recommend a smaller left-indent on `xs`/`sm` (e.g. 24px instead of 40px) while keeping the same avatar-size relationship (`sm` top-level / `xs` reply per A4 composition notes).
- "More" (`⋯`) action is always visible on touch breakpoints (no hover state exists) rather than hover-revealed, consistent with the general pattern that hover-only affordances need a touch-visible equivalent.

### Motion Behavior — _[GAP FILL]_

Tier 1 — Feedback (like) / Tier 3 — Entrance (new comment arriving via real-time subscription).

| Animation                                         | Property                                                                                                | Duration | Easing          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- | --------------- |
| Like                                              | `scale` 1→1.4→1 + color shift + particle burst                                                          | 300ms    | `--ease-spring` |
| New comment arrival (O8's real-time subscription) | `opacity` 0→1 + `translateY(8px→0)`                                                                     | 400ms    | `--ease-out`    |
| Reply composer expand                             | `height`/`opacity` reveal (prefer `max-height` + `opacity` over raw `height` per "What NOT to Animate") | 250ms    | `--ease-out`    |
| Comment delete (optimistic)                       | `opacity` fade to placeholder state                                                                     | 200ms    | `--ease-in-out` |

### Design Tokens — _[GAP FILL]_

- Body text: `body-md`, `text-primary`
- Username: `heading-sm`, `text-primary`
- Timestamp: `body-xs`, `text-tertiary`
- Pinned indicator: `--color-text-accent`
- Removed placeholder: `body-md`, `text-tertiary`, italic

### Composition Examples — _[GAP FILL]_

- **O8 Comment Thread:** renders a list of top-level CommentItem (`depth={0}`), each optionally rendering nested CommentItem (`depth={1}`) for replies.
- **Pinned comment:** rendered first regardless of sort order (Newest/Top Liked), per O8's "Pinned comment appears first with pin indicator."

---

## M5 — NotificationItem

### Purpose

_(verbatim)_

Single notification in the notification feed.

### Variants

_(verbatim — by type)_

| Type        | Template                                                 |
| ----------- | -------------------------------------------------------- |
| `like`      | `[user]` liked your preset **[preset-name]**             |
| `comment`   | `[user]` commented on **[preset-name]**                  |
| `follow`    | `[user]` started following you                           |
| `download`  | Your preset **[name]** reached **[milestone]** downloads |
| `badge`     | You earned the **[badge-name]** badge                    |
| `challenge` | Challenge **[name]** has started — submit your entry     |
| `featured`  | Your preset **[name]** was featured!                     |
| `system`    | Custom message                                           |

**Anatomy:**

```
[actor-avatar] [message text]
               [time-ago]
[preset-thumb?]
```

### Props — _[GAP FILL — not specified in source, derived from Product Spec §4 `notifications` table]_

```typescript
interface NotificationItemProps {
  notification: {
    id: string;
    type:
      | "like"
      | "comment"
      | "follow"
      | "download"
      | "badge"
      | "challenge"
      | "featured"
      | "system";
    actor?: { username: string; displayName: string; avatarUrl?: string };
    preset?: { slug: string; title: string; thumbnailUrl?: string };
    badge?: {
      name: string;
      iconUrl?: string;
      rarity: "common" | "rare" | "epic" | "legendary";
    };
    message?: string; // For type="system" or templated fallback
    isRead: boolean;
    createdAt: string;
  };
  onClick: (notification: NotificationItemProps["notification"]) => void;
  onMarkRead?: (id: string) => void;
}
```

### States — _[GAP FILL]_

| State              | Treatment                                                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unread (`!isRead`) | left accent bar or dot indicator in `--color-interactive-primary`, background tinted `--color-bg-accent`                                                                                                                                             |
| Read               | no accent bar, default `--color-bg-surface` (or transparent, if the notification list itself sits on `bg-base`)                                                                                                                                      |
| Hover              | background lightens to `--color-bg-elevated`                                                                                                                                                                                                         |
| Clicked            | marks as read (if not already) and navigates per type: `like`/`comment`/`featured` → `/preset/[slug]`; `follow` → `/u/[username]`; `badge` → opens F5 Badge Unlock Overlay or navigates to profile badge section; `challenge` → `/challenges/[slug]` |

### Accessibility — _[GAP FILL]_

- Each notification is a single clickable region (`<a>` or `<button>` depending on whether it navigates or triggers an in-page action), not a `<div onClick>`.
- Unread state must not rely on the accent-bar color alone — pair with an `aria-label` prefix like "Unread: " or expose unread count at the list level via `aria-live="polite"` region (per Design System §13's Notification Badge ARIA pattern: `<span aria-label="3 unread notifications">`).
- `actor` avatar `alt` text follows the standard Avatar a11y rule (A4): `alt="[Display Name]'s profile photo"`.
- For `badge` type notifications referencing a `legendary`-rarity badge, ensure the notification text itself states the badge name in plain text (it does, per the template), so the achievement is communicated even if the visual badge icon/shimmer doesn't render or load.
- Time-ago text needs a `title`/full-timestamp fallback, same as M4 CommentItem.

### Responsive Behavior — _[GAP FILL]_

- Identical layout at all breakpoints — the notification feed (`/notifications` route) is a simple vertical list; no column-count changes apply since this isn't a grid component.
- `preset-thumb` (optional thumbnail shown for preset-related notification types) may be omitted entirely on `xs` if width is too constrained to show actor avatar + message + thumbnail without cramping. **[OPEN QUESTION]:** neither doc specifies this; recommend testing against the smallest supported viewport (`xs`, <480px) before deciding whether to drop the thumbnail or shrink it further.

### Motion Behavior — _[GAP FILL, partially specified in Product Spec §11]_

Tier 3 — Entrance.

| Animation                                                           | Property                                                     | Duration             | Easing          | Source                                                                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------- |
| New notification slide-in (in-app toast context, not the feed list) | `right: 100%→0`                                              | 250ms                | `--ease-out`    | Product Spec §11 "Notifications" (verbatim)                                                                      |
| Badge count pop (on the bell icon, not this component)              | `scale` 1.5→1                                                | 300ms                | `--ease-spring` | Product Spec §11 (verbatim) — belongs to O3 Top Bar's notification bell, documented there                        |
| Mark-as-read transition                                             | unread accent bar fades out                                  | `--dur-fast` (150ms) | `--ease-out`    | inferred from general state-change conventions                                                                   |
| Feed list entrance (scrolling into `/notifications` page)           | staggered `opacity`+`translateY`, same pattern as PresetGrid | 400ms, 40ms stagger  | `--ease-out`    | inferred — consistent with the rest of the system's list-entrance convention rather than independently specified |

### Design Tokens — _[GAP FILL]_

- Unread background: `--color-bg-accent`
- Unread accent bar: `--color-interactive-primary`
- Message text: `body-md`, `text-primary` (with bolded interpolated names/titles per the type templates)
- Timestamp: `body-xs`, `text-tertiary`

### Composition Examples — _[GAP FILL]_

- **`/notifications` page:** vertical list of NotificationItem, grouped by date using section headers: **"Today" / "This Week" / "Earlier"** _(ADR-016, RESOLVED)_. Grouping is derived client-side from `created_at` timestamps returned by `GET /api/notifications` — no API change required. Section headers use A9 Divider + `label-sm` text style. The paginated API response remains a flat list; date-bucketing is a client-side rendering concern.
- **O3 Top Bar Notification Dropdown:** a condensed list of the most recent NotificationItem instances inside a dropdown panel, with "View all" linking to the full `/notifications` page.

---

## M6 — SearchBar

### Purpose

_(verbatim)_

Universal search entry point.

### Variants

_(verbatim, anatomy + behavior)_

**Anatomy:**

```
[search-icon] [query input] [clear-button?] [filter-icon?]
─────────────────────────────────────────────────────────
[suggestion-dropdown]
  → Recent searches
  → Trending: velocity · anime · coloring
  → Suggested presets
```

**Behavior** _(verbatim):_

- Dropdown appears on focus (shows recents and trending)
- Updates suggestions on keystrokes with 150ms debounce
- Escape clears and blurs
- Enter navigates to `/explore?q=[query]`

### Props — _[GAP FILL — not specified in source]_

```typescript
interface SearchBarProps {
  placeholder?: string; // e.g. "Search 10,000+ presets..."
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  recentSearches?: string[];
  trendingTags?: string[];
  suggestedPresets?: PresetCardProps["preset"][];
  showFilterIcon?: boolean;
  size?: "default" | "hero"; // 'hero' = large centered variant for Explore page
}
```

### States — _[GAP FILL]_

Inherits A2 Input `variant="search"` states (Default · Hover · Focus · Filled · Disabled), plus:

| State                              | Treatment                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| Dropdown open                      | suggestion panel visible below, input retains focus ring                       |
| Loading suggestions (mid-debounce) | small inline Spinner (A8, `size="sm"`) replaces or sits beside the search icon |
| No results in suggestions          | dropdown shows an empty state message rather than closing                      |

### Accessibility — _[GAP FILL]_

- Implements the ARIA combobox pattern: input has `role="combobox"`, `aria-expanded`, `aria-controls` pointing to the suggestion listbox `id`, `aria-activedescendant` tracking the currently highlighted suggestion via arrow keys.
- Suggestion list is `role="listbox"`, each item `role="option"`.
- Arrow Up/Down navigate suggestions per Design System §13 Keyboard Navigation ("Arrow keys: Navigate within menus, radio groups, carousels"); Enter selects the highlighted suggestion or submits the typed query if none is highlighted; Escape clears and blurs (per the verbatim behavior spec).
- Clear button: `aria-label="Clear search"`.
- Filter icon (when `showFilterIcon`) opens the Explore page's secondary filters panel — needs `aria-expanded` if it toggles an attached panel, `aria-label="Show filters"`.

### Responsive Behavior — _[GAP FILL]_

- `size="hero"` variant (per Product Spec §6.7 Explore page: "Giant, centered, autofocused on load") scales down its font size and padding on `xs`/`sm` to avoid overwhelming small viewports, while remaining visually dominant relative to surrounding content at every breakpoint. Exact scale isn't specified; recommend fluid sizing similar to the hero headline's `clamp()` pattern in Design System §9.
- `size="default"` (used in O3 Top Bar) collapses to a `Search` icon button on `xs`/`sm`; tapping opens a full-width search overlay (`fadeIn` + `scaleIn`, `--z-overlay: 300`) containing M6 SearchBar in mobile context, routing to `/explore?q=` on submit. _(ADR-019, RESOLVED)_
- Suggestion dropdown is full-width and may become a full-screen overlay on `xs` rather than a small anchored panel, to give suggestions enough room to be legible/tappable.

### Motion Behavior — _[GAP FILL]_

Tier 2 — Transition.

| Animation                                | Property                                                                                             | Duration               | Easing          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------- | --------------- |
| Dropdown open                            | `opacity` 0→1 + `scale` 0.98→1 (consistent with `scaleIn` Framer Motion preset in Design System §11) | 250ms                  | `--ease-spring` |
| Dropdown close                           | reverse of open                                                                                      | 150ms                  | `--ease-in`     |
| Suggestion item highlight (keyboard nav) | `background-color`                                                                                   | `--dur-instant` (50ms) | `--ease-out`    |
| Clear button appear                      | `opacity` 0→1                                                                                        | `--dur-fast` (150ms)   | `--ease-out`    |

### Design Tokens — _[GAP FILL]_

Inherits A2 Input tokens for the field itself. Dropdown panel:

- Background: `--color-bg-elevated`
- Shadow: `--shadow-dropdown`
- Radius: `--radius-lg` (12px)
- Section labels ("Recent," "Trending"): `label-xs`, `text-tertiary`, uppercase tracking

### Composition Examples — _[GAP FILL]_

- **Explore page hero (§6.7):** SearchBar `size="hero"`, autofocused on mount.
- **O3 Top Bar:** SearchBar `size="default"`, always visible at `md+`; replaced by `Search` icon button at `xs`/`sm` which opens full-width overlay (ADR-019, RESOLVED).

---

## M7 — FilterChip

### Purpose

_(verbatim)_

Toggleable category/filter pill in the explore bar.

### Variants

_(verbatim, anatomy)_

**Anatomy:**

```
[icon] Category Name [active-indicator?]
```

**States** _(verbatim list, treatment derived from Tag/Badge conventions since FilterChip shares their visual DNA):_ Default · Active (accent bg) · Hover · Disabled

### Props — _[GAP FILL — not specified in source]_

```typescript
interface FilterChipProps {
  label: string;
  icon?: LucideIcon;
  isActive: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  count?: number; // Optional result count, e.g. "Velocity (412)"
}
```

### States — _[GAP FILL on visual treatment, list itself verbatim]_

| State    | Background                             | Text             | Border           |
| -------- | -------------------------------------- | ---------------- | ---------------- |
| Default  | `bg-surface`                           | `text-secondary` | `border-subtle`  |
| Hover    | `bg-elevated`                          | `text-primary`   | `border-default` |
| Active   | `bg-accent` (per verbatim "accent bg") | `text-accent`    | `border-accent`  |
| Disabled | `bg-surface` @ 40% opacity             | `text-disabled`  | `border-subtle`  |

### Accessibility — _[GAP FILL]_

- Renders as `<button type="button" aria-pressed={isActive}>` — filter chips toggle in place (don't navigate), so `<button>` is correct, not `<a>` (contrast with A6 Tag's default variant, which often navigates).
- Icon `aria-hidden="true"`; label text is the accessible name.
- When chips are part of a horizontally-scrolling row (Explore page filter bar, per Product Spec §6.7), wrap the row in `role="group"` with `aria-label="Filter by category"` and ensure the scroll container is keyboard-scrollable (native `<div tabindex="0">` with overflow, or arrow-key scroll support) since horizontal-scroll regions are easy to strand keyboard users in if not handled.
- `count` (e.g. "(412)") is part of the visible label and accessible name together — not a separate visually-hidden-only addition, since sighted users benefit from seeing the count too, per Design System §6.7's filter bar concept.

### Responsive Behavior — _[GAP FILL]_

- Horizontal scroll row at all breakpoints per Product Spec §6.7 ("FILTER BAR (horizontal scroll, pill chips)") — this is one of the few list-of-chips contexts that intentionally does _not_ wrap, unlike A6 Tag's general wrapping default.
- Chip padding/font-size remain constant across breakpoints (no need to shrink — horizontal scroll already handles overflow).

### Motion Behavior — _[GAP FILL]_

Tier 1 — Feedback.

| Animation                                                                                                | Property                                    | Duration                           | Easing          |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------- | --------------- |
| Active toggle                                                                                            | `background-color`, `color`, `border-color` | `--dur-fast` (150ms)               | `--ease-in-out` |
| Scroll-into-view on selection (if chip is off-screen when selected programmatically, e.g. via URL param) | smooth scroll                               | n/a (browser-native smooth scroll) | n/a             |

### Design Tokens — _[GAP FILL]_

Identical to A6 Tag's token set (Background/Text/Border/Radius `--radius-full`/Typography `label-sm`/`label-md`) — FilterChip and Tag are visually near-identical; the distinction is purely semantic (Tag = content label, can navigate; FilterChip = in-page filter toggle, never navigates).

### Composition Examples — _[GAP FILL]_

- **Explore page filter bar (§6.7):** row of FilterChip — All · Velocity · Transition · Color · Anime · Gaming · Lyric · 3D — each with its category `icon` per Design System §7's icon assignment table.
- **Explore page secondary filters panel:** FilterChip used for Difficulty (Beginner/Intermediate/Advanced), Device (Android/iOS/Both), AM Version (3.x/4.x/5.x), per §6.7's "SECONDARY FILTERS (expandable panel)."

---

## M8 — XPProgressBar

### Purpose

_(verbatim)_

Shows current XP progress toward next level.

### Variants

_(verbatim, anatomy)_

**Anatomy:**

```
Level 4 — Artist                    1,250 / 1,500 XP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░
```

### Props

_(verbatim)_

```typescript
interface XPProgressBarProps {
  currentXP: number;
  nextLevelXP: number;
  currentLevel: number;
  currentLevelName: string;
  nextLevelName: string;
  showNumbers?: boolean;
  animate?: boolean; // Animate fill on mount
}
```

### States — _[GAP FILL]_

| State                                                                    | Treatment                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                                                                  | static fill at current progress percentage                                                                                                                                                                                                                                                                                   |
| Animating (`animate`)                                                    | fill grows from 0 to current percentage on mount, with shimmer overlay (per Product Spec §11 "XP / Badge" → "XP bar fill: slow fill + shimmer, 600ms ease-out")                                                                                                                                                              |
| Max level (`currentLevel` = 8 "Icon," per Product Spec §19 Levels table) | bar shows full, "next level" row is omitted or replaced with a "Max Level" indicator. **[OPEN QUESTION]:** neither doc specifies max-level display treatment; recommend the bar render at 100% with the label changed to something like "Max Level Reached" rather than attempting to show a non-existent "next level" name. |

### Accessibility — _[GAP FILL]_

- Implements `role="progressbar"` with `aria-valuenow={currentXP}`, `aria-valuemin={0}`, `aria-valuemax={nextLevelXP}`, and `aria-valuetext="1,250 of 1,500 XP toward Professional"` (a human-readable string is more useful here than the raw numeric value alone, since the unit—XP—and target level name carry meaning).
- The level name/number text ("Level 4 — Artist") must be present even if `showNumbers` is false, since the level itself (not just XP progress) is core identity information per Product Spec §2 personas (e.g. Malik's "Verified Creator" pride, badge/level visibility tying into "does this make creators proud?" per §1 Design Philosophy) — `showNumbers` should only toggle the numeric `1,250 / 1,500 XP` portion, not the level name.

### Responsive Behavior — _[GAP FILL]_

- Bar remains full-width of its container at all breakpoints; on `xs`, the level-name row and numeric XP row may stack vertically instead of sitting on one line if horizontal space is tight (per the anatomy diagram's single-line layout being the `md+` default).

### Motion Behavior — _[GAP FILL, mostly specified in Product Spec §11]_

Tier 3 — Entrance.

| Animation                 | Property                                                 | Duration | Easing       | Source                                                                              |
| ------------------------- | -------------------------------------------------------- | -------- | ------------ | ----------------------------------------------------------------------------------- |
| Fill on mount (`animate`) | `transform: scaleX()` 0→target, `transform-origin: left` | 600ms    | `--ease-out` | Product Spec §11 "XP / Badge" (visual outcome verbatim; implementation per ADR-009) |
| Shimmer overlay           | runs once, 200ms delay then plays                        | 300ms    | —            | Product Spec §11 (verbatim)                                                         |

**ADR-009 (RESOLVED):** implemented via `transform: scaleX()` + `transform-origin: left`, with an inner wrapper to preserve border-radius at the fill's leading edge — not a literal `width` transition. This honors Design System §10's "What NOT to Animate" rule (avoid `width`/`height` animation due to reflow cost) while reproducing the same visual fill behavior described in the Product Specification. See ARCHITECTURE_DECISIONS.md ADR-009.

### Design Tokens — _[GAP FILL]_

- Track background: `--color-bg-elevated`
- Fill: gradient `var(--gradient-primary)` (`linear-gradient(135deg, #7C3AED, #9D6FFF)`). **ADR-010 (RESOLVED):** formalized as a Design System token — see Design System §14 Gradients. See ARCHITECTURE_DECISIONS.md ADR-010.
- Level name: `heading-sm`, `text-primary`, optionally `gradient-text` treatment for high levels (per Design System §3 "Gradient Text... user level" usage)
- XP numbers: `mono-sm`, `tabular-nums`, `text-secondary`

### Composition Examples — _[GAP FILL]_

- **Profile Header:** XPProgressBar beneath the stats row, `animate` on first mount.
- **Navigation Sidebar profile mini-card (O1):** a condensed version — likely just the bar without full numbers (`showNumbers={false}`), given the mini-card's limited space; level number/name still shown via the avatar's level ring + adjacent text per A4 composition notes.

---

## M9 — BadgeChip

### Purpose

_(verbatim)_

Display an earned badge in compact form.

### Variants

_(verbatim, anatomy)_

**Anatomy:**

```
[icon] Badge Name  ← common/rare/epic
✦ [icon] BADGE ✦  ← legendary (animated shimmer)
```

### Props — _[GAP FILL — not specified in source, derived from Product Spec §4 `badges` table]_

```typescript
interface BadgeChipProps {
  badge: {
    key: string;
    name: string;
    description?: string;
    iconUrl?: string;
    rarity: "common" | "rare" | "epic" | "legendary";
  };
  earnedAt?: string; // ISO date; omit for "locked/unearned" display contexts
  size?: "sm" | "md";
  showTooltip?: boolean; // Per Design System §17 "Badge tooltips on hover explain how to earn them"
}
```

### States — _[GAP FILL]_

| State                                                   | Treatment                                                                                                                                                                                     |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Earned, common/rare/epic                                | static chip, rarity-colored icon/border per A5 Badge rarity tokens                                                                                                                            |
| Earned, legendary                                       | animated shimmer sweep (continuous, low-intensity — distinct from the one-time shimmer in F5 Badge Unlock Overlay), per Product Spec §19 "Rare/Legendary badges have animated shimmer effect" |
| Unearned/locked (shown in "All Badges" expandable view) | desaturated/greyscale treatment, reduced opacity, per the general pattern of showing locked achievements as a goal-state rather than hiding them entirely                                     |
| Hover                                                   | tooltip appears showing earn condition, per Product Spec §19 "Badge tooltips on hover explain how to earn them"                                                                               |
| Focus (keyboard)                                        | same tooltip appears (tooltip triggers must work via focus, not hover alone — see F4 Tooltip a11y notes)                                                                                      |

### Accessibility — _[GAP FILL]_

- Each BadgeChip is a focusable element (`<button>` or `<div tabindex="0">` if non-interactive beyond showing a tooltip) so the F4 Tooltip can be triggered via keyboard focus, not just mouse hover — per F4's own spec, tooltips "never on touch devices," so touch users need an alternate way to see the description (e.g. tapping opens a small popover/modal instead of a hover tooltip, consistent with F4's stated "longer → use Popover" guidance).
- Legendary shimmer animation must respect `prefers-reduced-motion` — becomes a static gradient fill with no sweep.
- Locked/unearned badges should still be in the accessible tree with their name and earn condition available (not just greyed out visually) so users can learn what to do next — this directly supports Product Spec §19's stated philosophy: "Gamification must feel earned, not manufactured... users should feel pride," which requires visibility into _how_ to earn what they don't have yet.
- `rarity` must be conveyed via text (e.g. visually-hidden "Legendary badge:" prefix), not the shimmer/gradient effect alone.

### Responsive Behavior — _[GAP FILL]_

- `size="sm"` is used in the Profile Header's "top 6 badges" horizontal scroll strip (Product Spec §19 "Profile shows top 6 badges, rest in 'All Badges' expandable"); `size="md"` is used in the expanded "All Badges" grid view.
- The top-6 strip scrolls horizontally on all breakpoints (consistent with other horizontal-scroll chip rows like the Explore filter bar) rather than wrapping, to preserve the "top 6" curated feel without it becoming a multi-row block.

### Motion Behavior — _[GAP FILL, partially specified in Product Spec §19]_

Tier 4 — Ambient (legendary shimmer, continuous) / Tier 3 — Entrance (badge unlock, documented separately under F5).

| Animation                            | Property                       | Duration                                                                                            | Easing          | Source                                                                                                          |
| ------------------------------------ | ------------------------------ | --------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------- |
| Legendary shimmer (ambient, in-list) | gradient sweep across the chip | continuous loop, ~2s                                                                                | `--ease-linear` | inferred from Product Spec §19's "animated shimmer effect" + general shimmer convention shared with A7 Skeleton |
| Hover/focus tooltip reveal           | `opacity` 0→1                  | 200ms (per F4's "appears after 500ms hover delay" — the 200ms is the fade-in itself once triggered) | `--ease-out`    | F4 Tooltip spec                                                                                                 |

### Design Tokens — _[GAP FILL]_

Identical rarity token set to A5 Badge (`--color-rarity-common/rare/epic`, `--color-rarity-legendary-start/end`). Locked state: `--color-text-tertiary` icon tint, `40%` opacity overlay.

### Composition Examples — _[GAP FILL]_

- **Profile Header badges row:** horizontal scroll of BadgeChip `size="sm"`, top 6 only.
- **Dashboard / Settings "All Badges" expandable section:** grid of BadgeChip `size="md"`, including locked/unearned badges shown desaturated.
- **F5 Badge Unlock Overlay:** displays a single large BadgeChip-like presentation at unlock time — distinct component scale, but shares the same rarity token system (documented fully under F5 in `05-overlays-feedback.md`).

---

## M10 — VideoPlayer

### Purpose

_(verbatim)_

Preset preview video with controls.

### Variants

_(verbatim — by context)_

**Features** _(verbatim):_

- Autoplay muted on hover in card context
- Full controls in preset detail page
- Thumbnail fallback before video loads
- Loading spinner during buffering
- Volume control (remembers preference in localStorage)

### Props — _[GAP FILL — not specified in source]_

```typescript
interface VideoPlayerProps {
  src: string;
  thumbnailUrl: string;
  context: "card" | "detail"; // Determines control visibility + autoplay behavior
  autoplayOnHover?: boolean; // Only meaningful when context="card"
  loop?: boolean;
  className?: string;
}
```

### States — _[GAP FILL]_

| State                         | Treatment                                                                                                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Idle (card context, no hover) | static thumbnail shown, video not loaded/playing                                                                                                                                                      |
| Hover (card context)          | video begins playing, muted, looped, crossfades in over thumbnail                                                                                                                                     |
| Buffering                     | Spinner (A8) overlay on top of the last-known frame/thumbnail                                                                                                                                         |
| Playing (detail context)      | full native-style controls: play/pause, scrub bar, volume, fullscreen                                                                                                                                 |
| Paused (detail context)       | thumbnail-like paused frame with a centered play button overlay                                                                                                                                       |
| Error (video fails to load)   | falls back to static thumbnail permanently, no error message shown to end users (silent degradation — a failed preview video shouldn't block someone from still seeing the preset and downloading it) |

### Accessibility — _[GAP FILL]_

- Card-context autoplay is **always muted** (never autoplay with sound) and must pause immediately if `prefers-reduced-motion` is set, per the same rule as M1 PresetCard's hover-video behavior (this component is, in fact, what M1 wraps internally).
- Detail-context player uses native `<video controls>` semantics (or a fully keyboard-operable custom control set if custom-styled) — every control (play/pause, scrub, volume, fullscreen) must be reachable via Tab and operable via Enter/Space/Arrow keys, per Design System §13 Keyboard Navigation.
- Per Design System §13 Image Alt Text: "Preview videos: provide captions or text description." **ADR-012 (RESOLVED):** preview videos are silent-only by platform policy (enforced at upload time), so a short `aria-label` text description (e.g. "Preview of [Preset Title] applied to a sample video") satisfies this requirement — no caption upload flow is needed. See ARCHITECTURE_DECISIONS.md ADR-012.
- Play/pause button (detail context) needs `aria-label` that reflects current state ("Play video" / "Pause video"), not a static label.

### Responsive Behavior — _[GAP FILL]_

- Card context: always 4:3 aspect ratio matching the thumbnail (per M1's anatomy), regardless of breakpoint.
- Detail context: per Product Spec §6.3 Preset Page, occupies the "LEFT" 60% of the hero split layout on desktop; on `xs`/`sm` where the hero split presumably stacks vertically (not explicitly stated, but implied by general responsive page-layout conventions and the breakpoint table's general "stack on mobile" pattern), the video player takes full width at the top, with metadata stacking below.
- Controls (detail context) should not shrink below a usable touch-target size on mobile — scrub bar, in particular, needs sufficient height/hit-area for thumb dragging.

### Motion Behavior — _[GAP FILL, partially specified]_

Tier 2 — Transition (card hover crossfade, explicitly specified) / Tier 1 — Feedback (play/pause button).

| Animation                                      | Property                 | Duration               | Easing       | Source                                                                      |
| ---------------------------------------------- | ------------------------ | ---------------------- | ------------ | --------------------------------------------------------------------------- |
| Thumbnail → video crossfade (card)             | `opacity`                | 300ms                  | —            | Product Spec §11 "Preset Card" (verbatim)                                   |
| Buffering spinner appear                       | `opacity` 0→1            | `--dur-fast` (150ms)   | `--ease-out` | inferred                                                                    |
| Play/pause button press                        | `scale` 0.95 momentary   | `--dur-instant` (50ms) | `--ease-out` | inferred from general button press convention                               |
| Controls bar show/hide (detail, on mouse idle) | `opacity` + `translateY` | `--dur-normal` (250ms) | `--ease-out` | inferred from standard video-player UX convention, not explicitly specified |

### Design Tokens — _[GAP FILL]_

- Controls bar background: `--color-bg-overlay` (semi-transparent scrim over video)
- Play button: `--color-bg-overlay` semi-transparent dark circle with white icon. **ADR-011 (RESOLVED).** See ARCHITECTURE_DECISIONS.md ADR-011.
- Buffering spinner: per A8 Spinner tokens, `color="white"` (sits over video content, not a surface background).

### Composition Examples — _[GAP FILL]_

- **M1 PresetCard:** VideoPlayer `context="card"` `autoplayOnHover` — the internal implementation of M1's "video autoplays on hover" behavior.
- **O5 Preset Detail hero:** VideoPlayer `context="detail"`, full controls, sticky on scroll per O5's layout spec ("HERO (sticky on scroll)").

---

## M11 — DownloadButton

### Purpose

_(verbatim)_

Primary CTA on preset pages. Handles the download flow.

### Variants

_(verbatim — by state, since this component is essentially a stateful button)_

**States** _(verbatim):_

1. Default: "Download Preset"
2. Loading: Spinner + "Getting your file..."
3. Success: "✓ Downloaded"
4. Login required: Redirects to auth

**Behavior** _(verbatim):_ On click → records download → returns signed URL → triggers browser download or redirects to AM link.

### Props — _[GAP FILL — not specified in source]_

```typescript
interface DownloadButtonProps {
  presetId: string;
  fileType: "xml" | "qr" | "link"; // Per Product Spec §4 presets.file_type
  isAuthenticated: boolean; // ADR-013 (RESOLVED): does not gate the download action itself; used by the button to determine whether post-download features (bookmark, save to collection, history) are offered
  onDownloadStart?: (presetId: string) => void;
  onDownloadComplete?: (presetId: string) => void;
  size?: "md" | "lg";
}
```

### States — _[GAP FILL on visual treatment; list itself verbatim]_

| State          | Button Label                     | Treatment                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default        | Per `fileType` (see below)       | `variant="primary"`, leading `Download` icon                                                                                                                                                                                                                                                                                                                                                                                 |
| Loading        | "Getting your file..."           | Spinner replaces leading icon, button dimensions unchanged (per A1 Button's "Loading state maintains exact button dimensions" rule)                                                                                                                                                                                                                                                                                          |
| Success        | "✓ Downloaded"                   | brief `success-400` tinted state, then reverts to default label after a few seconds (re-downloading the same preset should remain possible)                                                                                                                                                                                                                                                                                  |
| Login required | n/a (intercepted before request) | **ADR-013 (RESOLVED):** guest downloads remain allowed — the download/file-delivery action itself is guest-accessible, tracked via `preset_downloads.user_id` (nullable) and `ip_hash`. "Login required: Redirects to auth" applies only to user-specific features: bookmarks, collections, download history, and any future personalized features — not to clicking Download itself. See ARCHITECTURE_DECISIONS.md ADR-013. |

**Default label by `fileType` (ADR-014, RESOLVED):**

| `fileType` | Label                   |
| ---------- | ----------------------- |
| `xml`      | "Download Preset"       |
| `qr`       | "Get QR Code"           |
| `link`     | "Open in Alight Motion" |

See ARCHITECTURE_DECISIONS.md ADR-014.

### Accessibility — _[GAP FILL]_

- `aria-busy="true"` during Loading state, matching A1 Button's general loading pattern.
- Success state change should be announced via a polite live region (e.g. a visually-hidden `aria-live="polite"` sibling announcing "Download started" or "Preset downloaded") since the label change alone may not be noticed by screen reader users who've already moved focus elsewhere after clicking.
- For `fileType="qr"` and `fileType="link"` presets, the button label already adapts per the table above (ADR-014, RESOLVED) — "Get QR Code" and "Open in Alight Motion" respectively — so the label accurately reflects each delivery mechanism rather than implying a file transfer that isn't happening.

### Responsive Behavior — _[GAP FILL]_

- `size="lg"` (48px) by default on the Preset Page per its role as the primary CTA (consistent with A1's composition example); remains `size="lg"` across all breakpoints rather than shrinking, since this is the page's single most important action and should stay prominent even on mobile.
- `fullWidth` likely applies on `xs`/`sm` where the metadata column stacks full-width beneath the video player.

### Motion Behavior — _[GAP FILL]_

Tier 1 — Feedback, inherits A1 Button's hover/press motion, plus:

| Animation                   | Property                                                    | Duration                                          | Easing          |
| --------------------------- | ----------------------------------------------------------- | ------------------------------------------------- | --------------- |
| Label → Loading crossfade   | `opacity` swap between label text and spinner+text          | `--dur-fast` (150ms)                              | `--ease-in-out` |
| Loading → Success crossfade | `opacity` swap + background tint shift toward `success-400` | `--dur-normal` (250ms)                            | `--ease-out`    |
| Success → Default revert    | `opacity` swap back                                         | `--dur-normal` (250ms), after a few seconds' hold | `--ease-in-out` |

### Design Tokens — _[GAP FILL]_

Inherits A1 Button `primary` variant tokens, with the Success state additionally referencing `--color-text-success` / `--color-bg-success` for the brief confirmation tint.

### Composition Examples — _[GAP FILL]_

- **O5 Preset Detail / Product Spec §6.3 Preset Page:** the one `primary` Button on the page — `[⬇ Download Preset] ← PRIMARY CTA`, exactly as called out in the page spec.

---

_End of Molecules — continued in `03-organisms.md`_
