# PresetHub Component Library — 01. Atoms

**Source of truth for existing specs:** `PresetHub_Design_System.md` §17 "ATOMS"
**This file:** preserves those specs verbatim, appends Accessibility / Responsive / Motion / Composition where the source was silent.

---

## A1 — Button

### Purpose
*(verbatim from Design System)*

Trigger actions. The primary affordance for user intent.

### Variants
*(verbatim)*

| Variant | When to use |
|---|---|
| `primary` | One per view. The main action. |
| `secondary` | Alternative or supporting actions |
| `ghost` | Low-priority actions, repeated actions in lists |
| `danger` | Destructive actions (delete, remove) |
| `icon` | Single icon with no label (use sparingly) |
| `link` | Inline text action, navigational |

**Sizes:**

| Size | Height | Padding | Font |
|---|---|---|---|
| `sm` | 32px | `px-3 py-1.5` | `label-sm` |
| `md` (default) | 40px | `px-4 py-2` | `label-md` |
| `lg` | 48px | `px-6 py-3` | `label-lg` |

**Anatomy:**
```
[leading-icon?] [label] [trailing-icon?]
[loading-spinner?]
```

### Props
*(verbatim)*

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon' | 'link'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  isDisabled?: boolean
  leadingIcon?: LucideIcon
  trailingIcon?: LucideIcon
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  children: React.ReactNode
  'aria-label'?: string
}
```

### States
*(verbatim list, expanded against Design System §12 Button-Specific States table)*

Default · Hover · Focus · Active · Loading · Disabled

| State | Background | Text | Border | Shadow |
|---|---|---|---|---|
| Default | `accent-600` | white | none | none |
| Hover | `accent-500` | white | none | `shadow-glow-xs` |
| Focus | `accent-600` | white | none | `shadow-focus` |
| Active | `accent-700` | white | none | none |
| Loading | `accent-700` | white | none | none |
| Disabled | `accent-600` @ 40% | white @ 60% | none | none |

**Usage Rules** *(verbatim):*
- Maximum 1 `primary` button per view
- Loading state maintains exact button dimensions (never resizes)
- Icon buttons always require `aria-label`
- Danger buttons always use a confirmation dialog before executing (see F6 Confirmation Dialog)

### Accessibility — *[GAP FILL]*

- Renders as a native `<button>` element. Never a styled `<div>`.
- `type="button"` explicitly set unless inside a `<form>` and intended to submit.
- Icon-only (`variant="icon"`) buttons **require** `aria-label`; the visible icon is `aria-hidden="true"` (per Design System §13 ARIA Patterns).
- Loading state sets `aria-busy="true"` and updates the accessible label, per Design System §13:
  ```html
  <button aria-busy={isLoading} aria-label={isLoading ? "Saving..." : "Save"}>
  ```
- Disabled buttons use the native `disabled` attribute (not just `aria-disabled`) so they're removed from the tab order automatically.
- Focus ring: 2px ring using `--shadow-focus`, visible only via `:focus-visible` (no ring on mouse click — Design System §13 "Focus Visible Only").
- Minimum hit target 40×40px even for `sm` size buttons that are icon-only — pad the hit area with invisible padding if the visual button is smaller (WCAG 2.1 AA target-size guidance).
- Danger-variant buttons must be announced clearly: label text should name the destructive action ("Delete Preset," not just "Delete") since screen reader users may navigate by button list without surrounding context.

### Responsive Behavior — *[GAP FILL]*

Button does not change variant or visual treatment across breakpoints. The only responsive behavior is sizing context, not the component itself:

- On `xs`/`sm`, prefer `size="lg"` (48px) for primary CTAs to meet comfortable touch-target size; `size="sm"`/`md` remain available for dense UI (e.g. card actions, table rows).
- `fullWidth` is commonly applied on `xs`/`sm` for primary actions (e.g. "Publish Preset" in the Upload Wizard) and unset at `md+` where the button sits inline with other controls.

### Motion Behavior — *[GAP FILL]*

Tier 1 — Feedback (Design System §10).

| Transition | Property | Duration | Easing |
|---|---|---|---|
| Hover in/out | `background-color`, `box-shadow` | `--dur-fast` (150ms) | `--ease-out` |
| Active / press | `transform: scale(0.97)` + background darken | `--dur-instant` (50ms) | `--ease-out` |
| Loading spinner enter | `opacity` 0→1 (label fades out simultaneously) | `--dur-fast` (150ms) | `--ease-in-out` |

`prefers-reduced-motion`: scale-on-press and hover transition durations collapse to `0.01ms` per Design System §13; the state change itself (color, spinner) still occurs, just without animated interpolation.

### Design Tokens — *[GAP FILL]*

- Background: `--color-interactive-primary`, `--color-interactive-primary-hover`, `--color-interactive-primary-active` (primary) / `--color-interactive-secondary` + hover (secondary) / `--color-interactive-danger` + hover (danger)
- Text: `--color-text-inverse` (on filled buttons), `--color-text-accent` (link variant)
- Radius: `--radius-md` (8px)
- Shadow: `--shadow-glow-xs` (hover), `--shadow-focus`
- Typography: `label-sm` / `label-md` / `label-lg` per size
- Duration/easing: `--dur-instant`, `--dur-fast`, `--ease-out`

### Composition Examples — *[GAP FILL]*

- **Preset Page primary CTA:** `<Button variant="primary" size="lg" leadingIcon={Download}>Download Preset</Button>` — the one `primary` button on the page, per the "max 1 primary per view" rule.
- **PresetCard stat row:** `variant="icon"` buttons for Like/Bookmark/Share, each with required `aria-label`.
- **Confirmation Dialog (F6):** `variant="danger"` button paired with `variant="ghost"` (Cancel) — danger button never appears alone without a ghost/secondary escape action.
- **Upload Wizard Step 3:** `variant="ghost"` ("← Back") + `variant="primary" fullWidth` ("Publish Preset") side by side on `md+`, stacked full-width on `xs`/`sm`.

---

## A2 — Input

### Purpose
*(verbatim)*

Single-line text entry.

### Variants
*(verbatim)*

- `default` — Standard text field
- `search` — With search icon, clear button when filled
- `password` — With show/hide toggle
- `prefix` — With prefix text (e.g. "presethub.com/")
- `suffix` — With suffix text (e.g. ".xml")

**Anatomy:**
```
[label (above)]
[leading-icon?] [value-text] [trailing-icon/action?]
[hint-text or error-text (below)]
```

### Props
*(verbatim)*

```typescript
interface InputProps {
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  leadingIcon?: LucideIcon
  trailingIcon?: LucideIcon
  prefix?: string
  suffix?: string
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  maxLength?: number
  showCount?: boolean      // Character counter
  type?: 'text' | 'email' | 'password' | 'url' | 'search'
  value: string
  onChange: (value: string) => void
}
```

### States
*(verbatim list, expanded against Design System §12 Input-Specific States table)*

Default · Hover · Focus · Filled · Error · Disabled · Read-only

| State | Border | Background | Label |
|---|---|---|---|
| Default | `border-default` | `bg-input` | `text-secondary` |
| Hover | `border-strong` | `bg-input` | `text-secondary` |
| Focus | `accent-600` + ring | `bg-input` | `accent-400` |
| Filled | `border-default` | `bg-input` | `text-secondary` (small) |
| Error | `red-400` + ring | `bg-input` | `red-400` |
| Disabled | `border-subtle` | `bg-surface` @ 50% | `text-tertiary` |
| Read-only | `border-subtle` | `bg-surface` | `text-secondary` |

**Usage Rules** *(verbatim):*
- Labels are always visible. Never use placeholder as label.
- Error messages describe the problem and how to fix it.
- Character count shows `{count}/{max}` when within 20% of max.

### Accessibility — *[GAP FILL]*

- Every input has a programmatically associated `<label>` via `htmlFor`/`id`, even when visually styled as a floating label — per Design System §13 "Form inputs always have associated `<label>`."
- `aria-required="true"` when `isRequired`.
- `aria-invalid="true"` and `aria-describedby` pointing to the error message `id` when in Error state.
- Hint text, when present, is also referenced via `aria-describedby` (combine with error id using a space-separated list if both exist).
- Character counter (`showCount`) is **not** announced on every keystroke (would be disruptive); use `aria-live="off"` on the counter and let users check it visually or via explicit navigation, not a live region — live announcements are reserved for content updates per Design System §13's "Live regions for dynamic content," not micro-feedback like a counter.
- Clear button (`search` variant) requires `aria-label="Clear search"`.
- Password show/hide toggle requires `aria-label` that reflects state: "Show password" / "Hide password," and `aria-pressed` to reflect toggle state.

### Responsive Behavior — *[GAP FILL]*

- Full width (`100%` of parent) at all breakpoints by default — Input does not have a fixed width; it inherits from its container (form field stack, modal body, etc.).
- On `xs`, font size for the value text does not shrink below `body-md` (16px) to prevent iOS Safari's automatic zoom-on-focus behavior.
- Prefix/suffix text truncates with ellipsis on narrow containers rather than wrapping.

### Motion Behavior — *[GAP FILL]*

Tier 1 — Feedback.

| Transition | Property | Duration | Easing |
|---|---|---|---|
| Focus ring appear | `box-shadow` | `--dur-fast` (150ms) | `--ease-out` |
| Border color change (hover/error) | `border-color` | `--dur-fast` (150ms) | `--ease-out` |
| Error message appear | `opacity` + `translateY(-4px→0)` | `--dur-normal` (250ms) | `--ease-out` |

No animation on value text itself (per Design System §10 "What NOT to Animate" — avoid anything causing reflow).

### Design Tokens — *[GAP FILL]*

- Background: `--color-bg-input`
- Border: `--color-border-default`, `--color-border-strong` (hover), `--color-border-accent` (focus), `--color-border-error`
- Text: `--color-text-primary` (value), `--color-text-secondary` (label/hint), `--color-text-error`
- Radius: `--radius-sm` (4px)
- Shadow: `--shadow-focus`, `--shadow-focus-error`
- Typography: `body-md` (value), `label-md` (label), `body-xs` (hint/error/counter)

### Composition Examples — *[GAP FILL]*

- **SearchBar (M6):** wraps Input `variant="search"` with a suggestions dropdown anchored below.
- **Upload Wizard Step 2:** Input `variant="default" isRequired maxLength={100} showCount` for Title. Max 100 chars per ADR-017 (RESOLVED) — enforced in DB schema (`CHECK (char_length(title) <= 100)`), API Zod schema (`.max(100)`), and this UI field.
- **Settings → Profile:** Input `variant="prefix"` for custom profile URL (`presethub.com/`) once Phase 3 "Custom profile URL" ships (per Product Spec §20 Phase 4 Creator Pro tier).

---

## A3 — Textarea

### Purpose
*(verbatim)*

Multi-line text entry (descriptions, bios, comments).

### Variants

Extends Input's `default` variant only — no search/password/prefix/suffix variants apply to multi-line text.

### Props
*(verbatim)*

```typescript
interface TextareaProps extends Omit<InputProps, 'type' | 'prefix' | 'suffix'> {
  rows?: number         // Default: 4
  resize?: 'none' | 'vertical'  // Default: vertical
  autoGrow?: boolean    // Expands to content height
}
```

### States

Inherits all states from A2 Input (Default · Hover · Focus · Filled · Error · Disabled · Read-only) with identical visual treatment per the Input-Specific States table.

### Accessibility — *[GAP FILL]*

- Same labeling, `aria-invalid`, `aria-describedby` rules as Input (A2).
- When `autoGrow` is enabled, the resize must not move focus or scroll position unexpectedly; height changes should not trigger any `aria-live` announcement (purely visual).
- `maxLength` + `showCount` follows the same "announce only when within 20% of max" guidance as Input — but for Textarea this is more likely to be reached (e.g. preset description at 2000 chars, bio at 280 chars per Product Spec §4 `users.bio` and `presets.description`), so the counter should be visually persistent once within threshold, not just on focus.

### Responsive Behavior — *[GAP FILL]*

- `rows` default of 4 holds across all breakpoints; `autoGrow` is preferred on `xs`/`sm` where vertical space for a resize handle is harder to use precisely (touch dragging a resize handle is error-prone).
- Manual `resize: vertical` handle is hidden on touch devices in favor of `autoGrow`. **[OPEN QUESTION]:** Design System doesn't explicitly state per-device resize-handle behavior; this follows from §1.4 Tactile Feedback's general principle that touch interactions should feel physical/forgiving, not from an explicit rule.

### Motion Behavior — *[GAP FILL]*

Identical to Input (A2): Tier 1 feedback for border/focus/error states. `autoGrow` height changes use:

| Transition | Property | Duration | Easing |
|---|---|---|---|
| Auto-grow height change | `height` (via `max-height` + `transform` preferred over raw `height` per §10 "What NOT to Animate") | `--dur-normal` (250ms) | `--ease-out` |

### Design Tokens

Identical token set to A2 Input.

### Composition Examples — *[GAP FILL]*

- **CC4 Markdown Editor:** the "Write" tab of the Markdown Editor compound component wraps a Textarea with `autoGrow` and no fixed `rows`, since preset descriptions vary widely in length (up to 2000 chars per Product Spec §4).
- **Settings → Profile bio field:** Textarea with `maxLength={280}` `showCount` — directly maps to `users.bio` constraint in Product Spec §4.
- **CommentItem reply composer:** Textarea `rows={2}` `autoGrow`, no visible label — placeholder text ("Reply to @username") serves as visible prompt, but a visually-hidden `<label>` must still exist for screen readers; this is the one sanctioned exception to "never use placeholder as label" because the surrounding context already names the field's purpose.

---

## A4 — Avatar

### Purpose
*(verbatim)*

Visual representation of a user.

### Variants
*(verbatim — by size)*

| Size | Dimensions | Font | Ring width |
|---|---|---|---|
| `xs` | 20×20px | 8px | 1px |
| `sm` | 28px | 11px | 1.5px |
| `md` (default) | 36px | 14px | 2px |
| `lg` | 48px | 18px | 2px |
| `xl` | 64px | 24px | 3px |
| `2xl` | 96px | 36px | 3px |
| `3xl` | 128px | 48px | 4px |

**Anatomy:**
```
[image or initials] [status-dot?]
```

### Props
*(verbatim)*

```typescript
interface AvatarProps {
  src?: string
  alt: string
  displayName: string     // Used for initials fallback
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  status?: 'online' | 'offline' | undefined   // ADR-001 (RESOLVED): kept for forward compatibility; do not render until a presence feature exists
  level?: number          // Shows XP level ring with color gradient — mapping per ADR-002 (RESOLVED), see Design Tokens below
  isVerified?: boolean    // Shows verification checkmark badge
  ring?: boolean          // Shows accent ring (used in profile headers)
}
```

**Fallback behavior** *(verbatim):*
- Image loads: show image
- Image fails: show initials (first letter of each word in displayName, max 2)
- Initials bg: seeded from username (consistent per user, not random) — dedicated seed palette per ADR-003 (RESOLVED), see Design Tokens below

### States — *[GAP FILL]*

Avatar is primarily a display component, not interactive by itself, but is frequently wrapped in a link/button:

| State | Treatment |
|---|---|
| Default | Image or initials, optional status dot, optional level ring |
| Hover (when wrapped in link) | Subtle ring brightness increase (`ring` accent → `accent-400`), no scale change on the avatar itself (scale changes belong to the wrapping card, not the avatar) |
| Loading | `A7 Skeleton` `variant="avatar"` at matching size, never the Avatar component itself in a "loading" prop state |
| Focus (when wrapped in link) | `--shadow-focus` ring around the wrapping element |

### Accessibility — *[GAP FILL]*

- `alt` is **required** in the props contract (not optional) and must follow Design System §13 Image Alt Text rule: `alt="[Creator Name]'s profile photo"`, or `alt=""` only when the avatar is purely decorative (e.g. duplicated next to a text username that already names the person).
- When `isVerified`, the checkmark badge is `aria-hidden="true"` if a text "Verified" label exists elsewhere in the same component (e.g. CreatorCard already shows a verified badge with text); if the avatar's checkmark is the *only* indicator of verification, it needs `aria-label="Verified creator"` or equivalent `sr-only` text.
- `status` dot (`online`/`offline`) is decorative + supplementary; do not rely on it alone to convey status — pair with text where status matters functionally.
- Level ring color/gradient must not be the *only* way level is conveyed — level number should be available as text nearby (e.g. Profile Header shows "Level 4 — Artist" in text per M8 XPProgressBar), satisfying WCAG's "don't rely on color alone."

**ADR-001 (RESOLVED):** The `status` prop is kept in the Avatar props contract for forward compatibility with a possible future DM/presence feature. No status dot renders until a real presence feature exists — there is currently no real-time presence concept (the `last_active_at` timestamp does not substitute for live presence). See ARCHITECTURE_DECISIONS.md ADR-001.

### Responsive Behavior — *[GAP FILL]*

- Avatar sizing is explicit via the `size` prop, not breakpoint-driven — the *consuming* component decides which size to request at which breakpoint.
- Recommended size-per-breakpoint mapping for Profile Header avatar specifically: `xl` (64px) on `xs`/`sm`, `2xl` (96px) on `md`/`lg`, `3xl` (128px) on `xl`/`2xl` — derived from the banner height table in Design System §9, not separately specified for Avatar. **[OPEN QUESTION]:** this is an inference, not a stated rule; flagged for design confirmation.

### Motion Behavior — *[GAP FILL]*

Tier 3 — Entrance (only on initial image load, not on every render).

| Transition | Property | Duration | Easing |
|---|---|---|---|
| Image fade-in after load | `opacity` 0→1 | `--dur-normal` (250ms) | `--ease-out` |
| Status dot appear | `scale` 0→1 | `--dur-fast` (150ms) | `--ease-spring-sm` |
| Level ring fill (on profile mount) | `stroke-dashoffset` animation | `--dur-xslow` (600ms) | `--ease-out` |

No hover animation on the Avatar image itself (per "What NOT to Animate" guidance against decorative motion); any hover feedback belongs to the wrapping interactive element.

### Design Tokens — *[GAP FILL]*

- Ring: `--color-border-accent` (when `ring` true).
- Level ring color (ADR-002, RESOLVED): mapped onto existing rarity tiers — Lvl 1–2 → `--color-rarity-common`, Lvl 3–4 → `--color-rarity-rare`, Lvl 5–6 → `--color-rarity-epic`, Lvl 7 → `--color-rarity-legendary` (standard), Lvl 8 → `--color-rarity-legendary` (enhanced treatment — e.g. animated shimmer sweep or added outer glow — to stay visually distinct from Lvl 7). No new `--color-level-ring-*` token family. See Design System §17 and ARCHITECTURE_DECISIONS.md ADR-002.
- Initials background (ADR-003, RESOLVED): seeded from a dedicated `--color-avatar-seed-1` through `-10` palette, kept separate from Category and Rarity color sets to avoid visual confusion with category badges. Selection: hash `username` mod 10 → palette index. See Design System §17 and ARCHITECTURE_DECISIONS.md ADR-003.
- Radius: `--radius-full`
- Status dot: `--color-text-success` (online) / `--color-text-tertiary` (offline)

### Composition Examples — *[GAP FILL]*

- **PresetCard creator row:** Avatar `size="sm"`, no ring, `isVerified` passed through from `preset.creator.isVerified`.
- **Profile Header:** Avatar `size="3xl"` `ring` `level={user.level}` `isVerified` — the canonical "full-featured" usage.
- **CommentItem:** Avatar `size="sm"` for top-level, `size="xs"` for nested replies (matches the depth-based sizing implied by M4's anatomy diagram).
- **Navigation Sidebar profile mini-card (O1):** Avatar `size="md"`.

---

## A5 — Badge

### Purpose
*(verbatim)*

Compact status or metadata label.

### Variants
*(verbatim)*

- `category` — Preset category (velocity, anime, etc.)
- `difficulty` — Beginner / Intermediate / Advanced
- `status` — Published, Pending, Rejected
- `rarity` — Common, Rare, Epic, Legendary
- `count` — Numeric count (download count, follower count)
- `new` — "New" indicator

### Props
*(verbatim)*

```typescript
interface BadgeProps {
  variant: 'category' | 'difficulty' | 'status' | 'rarity' | 'count' | 'new'
  value: string | number
  size?: 'sm' | 'md'
  icon?: LucideIcon
}
```

**Visual Spec** *(verbatim):*

| Variant | Background | Text color | Border radius |
|---|---|---|---|
| category | `--cat-[name]` @ 15% | `--cat-[name]` | `radius-full` |
| difficulty: beginner | `color-bg-success` | `color-text-success` | `radius-md` |
| difficulty: intermediate | `color-bg-warning` | `color-text-warning` | `radius-md` |
| difficulty: advanced | `color-bg-error` | `color-text-error` | `radius-md` |
| rarity: legendary | gradient bg | white | `radius-md` |
| status: published | `color-bg-success` | `color-text-success` | `radius-md` |
| status: pending | `color-bg-warning` | `color-text-warning` | `radius-md` |
| status: rejected / removed | `color-bg-error` | `color-text-error` | `radius-md` |
| rarity: common | `--color-rarity-common` @ 15% | `--color-rarity-common` | `radius-md` |
| rarity: rare | `--color-rarity-rare` @ 15% | `--color-rarity-rare` | `radius-md` |
| rarity: epic | `--color-rarity-epic` @ 15% | `--color-rarity-epic` | `radius-md` |
| count | `transparent` or `color-bg-surface` | `text-secondary` | `radius-full` |
| new | `color-bg-accent` | `color-text-accent` | `radius-full` |

*(Full table approved per ADR-004, RESOLVED — see ARCHITECTURE_DECISIONS.md.)*

### States — *[GAP FILL]*

Badge is non-interactive by default (a label, not a control). The exception is when a `category` badge is rendered as a link (per M1 PresetCard's rule: "Category badge links to `/explore?category=[name]`") — in that case it inherits Tag-like interactive states (see A6).

| State | Treatment |
|---|---|
| Default (static label) | As specified in Visual Spec table |
| Default (clickable, category only) | Same visual + `cursor: pointer` |
| Hover (clickable only) | Background opacity increases (15%→25%) |
| Focus (clickable only) | `--shadow-focus` ring |

### Accessibility — *[GAP FILL]*

- Static badges render as `<span>`, not `<button>`/`<a>`, since they convey state rather than trigger action.
- Clickable category badges (used as filter links) render as `<a>` and need accessible text beyond the category name alone if context isn't obvious — e.g. `aria-label="Filter by Velocity category"` rather than relying on visual-only context.
- Rarity and difficulty badges must not rely on color alone: the `value` text (e.g. "Intermediate," "Epic") is always rendered alongside the color, never color-only chips — already implied by the props contract (`value: string | number` is required), but worth stating explicitly as an accessibility rule, not just a content rule.
- `legendary` rarity badges use a gradient background; ensure the white text still meets 4.5:1 contrast against the *darkest* point of the gradient (`#F97316`), not just the lightest (`#FBBF24`) — verify before shipping, since gradients can fail contrast at one end even if they pass at the other.

### Responsive Behavior — *[GAP FILL]*

- `size="sm"` is the default in dense contexts (PresetCard, table rows) at all breakpoints; `size="md"` is used in headers and detail pages (e.g. Preset Page metadata pills).
- No breakpoint-driven variant change — Badge is small enough to not require responsive adaptation beyond standard text reflow.

### Motion Behavior — *[GAP FILL]*

Tier 1 — Feedback, only for `legendary` rarity and only in the F5 Badge Unlock Overlay context (not on every render of a legendary badge chip elsewhere in the UI — a shimmer running constantly on every badge mention would violate §1.5 "nothing loops unless it communicates live state").

| Context | Animation | Duration | Easing |
|---|---|---|---|
| Static legendary badge (in lists, profile strip) | None — gradient is static | — | — |
| Legendary badge in Badge Unlock Overlay (F5) | Shimmer sweep, runs once on reveal | per F5 spec | `--ease-out` |
| New badge entrance (`new` variant appearing) | `opacity` 0→1 + `scale` 0.9→1 | `--dur-fast` (150ms) | `--ease-spring-sm` |

### Design Tokens — *[GAP FILL]*

- Category: `--color-category-velocity`, `-transition`, `-color`, `-anime`, `-gaming`, `-lyric`, `-3d`, `-other` (Tailwind `category.*` scale)
- Rarity: `--color-rarity-common`, `-rare`, `-epic`, `-legendary-start`, `-legendary-end`
- Semantic backgrounds: `--color-bg-success`, `--color-bg-warning`, `--color-bg-error`
- Radius: `--radius-full` (category, count, new), `--radius-md` (difficulty, status, rarity)
- Typography: `label-sm` (size `sm`), `label-md` (size `md`)

### Composition Examples — *[GAP FILL]*

- **PresetCard:** `variant="category"` top-left of thumbnail, `variant="difficulty"` top-right (per M1 anatomy diagram) — both `size="sm"`.
- **Preset Page metadata pills:** `variant="category"`, `variant="difficulty"` at `size="md"` alongside plain-text pills for device/version (those aren't Badge instances per the Preset Page spec — they're inline icon+text pairs, not chips).
- **Moderation Dashboard (Admin):** `variant="status"` for queue items (pending/reported/auto-flagged).
- **Profile Header badge strip:** uses M9 BadgeChip, not A5 Badge — Badge (A5) is for *content metadata*, BadgeChip (M9) is for *earned achievement badges*. Do not conflate the two; they share visual DNA but serve different data (preset attributes vs. user achievements).

---

## A6 — Tag

### Purpose
*(verbatim)*

User-applied content label. Clickable for filtering.

### Variants
*(verbatim)*

- `default` — Browseable, clickable filter
- `removable` — In upload form, has × button
- `active` — Currently filtering by this tag

**Anatomy:**
```
# [label] [remove-button?]
```

### Props
*(verbatim)*

```typescript
interface TagProps {
  label: string
  isActive?: boolean
  isRemovable?: boolean
  onRemove?: () => void
  onClick?: () => void
  size?: 'sm' | 'md'
}
```

### States — *[GAP FILL]*

| State | Background | Text | Border |
|---|---|---|---|
| Default | `bg-surface` | `text-secondary` | `border-subtle` |
| Hover (clickable) | `bg-elevated` | `text-primary` | `border-default` |
| Active (`isActive`) | `bg-accent` | `text-accent` | `border-accent` |
| Focus | as default/active + `--shadow-focus` | — | — |
| Removable, hover on × | `×` icon background `bg-error` @ 15%, icon color `text-error` | — | — |

### Accessibility — *[GAP FILL]*

- Clickable tags (`onClick` present, not removable) render as `<button type="button">`, not `<a>`, since clicking applies a filter in-page rather than navigating to a new resource in most contexts — **exception:** if a tag click triggers full navigation (e.g. `/explore?tag=velocity`), use `<a>` instead, consistent with the category badge link behavior in M1.
- Remove button (`×`) is a separate focusable `<button aria-label="Remove tag: {label}">`, nested but independently tabbable — never a single click target that both navigates and removes depending on click position.
- `isActive` state is conveyed via `aria-pressed="true"` in addition to the visual treatment (color alone is insufficient per WCAG).
- In a tag *group* (e.g. CC2 Tag Input's chip list, or a filter bar), wrap in `role="group"` with an `aria-label` describing the group's purpose (e.g. "Selected tags," "Active filters").

### Responsive Behavior — *[GAP FILL]*

- `size="sm"` default in dense contexts (PresetCard tag row, CC2 Tag Input); `size="md"` in the Explore page filter bar.
- Tag groups wrap onto multiple lines on narrow viewports rather than horizontally scrolling, **except** the Explore page's category filter bar, which the Product Spec (§6.7) explicitly calls out as "horizontal scroll, pill chips" — that specific instance overrides the general wrapping default.

### Motion Behavior — *[GAP FILL]*

Tier 1 — Feedback.

| Transition | Property | Duration | Easing |
|---|---|---|---|
| Active toggle | `background-color`, `color`, `border-color` | `--dur-fast` (150ms) | `--ease-in-out` |
| Remove (×) | tag scales/fades out before removal from DOM: `opacity` 1→0 + `scale` 1→0.9 | `--dur-fast` (150ms) | `--ease-in` |
| New tag add (CC2 context) | `opacity` 0→1 + `scale` 0.9→1 | `--dur-fast` (150ms) | `--ease-spring-sm` |

### Design Tokens — *[GAP FILL]*

- Background: `--color-bg-surface`, `--color-bg-elevated` (hover), `--color-bg-accent` (active)
- Text: `--color-text-secondary`, `--color-text-primary` (hover), `--color-text-accent` (active)
- Border: `--color-border-subtle`, `--color-border-default`, `--color-border-accent`
- Radius: `--radius-full`
- Typography: `label-sm` / `label-md`

### Composition Examples — *[GAP FILL]*

- **PresetCard / Preset Page:** `variant="default"` tags, clickable, link to `/explore?tag=[name]`.
- **CC2 Tag Input (Upload Wizard Step 2):** `variant="removable"` chips, max 10 enforced with counter, per Product Spec §6.5.
- **Explore page filter bar:** `variant="active"` for the currently selected category/filter, `variant="default"` for the rest.

---

## A7 — Skeleton

### Purpose
*(verbatim)*

Placeholder for loading content.

### Variants
*(verbatim)*

- `text` — Simulates text lines (varied widths)
- `avatar` — Circular placeholder
- `card` — Full preset card placeholder
- `thumbnail` — 4:3 ratio placeholder

### Props
*(verbatim)*

```typescript
interface SkeletonProps {
  variant: 'text' | 'avatar' | 'card' | 'thumbnail' | 'custom'
  width?: string | number
  height?: string | number
  rounded?: keyof typeof borderRadius
  lines?: number          // For text variant: number of lines
  lastLineWidth?: string  // For text variant: last line shorter
}
```

**Animation** *(verbatim):* Shimmer sweep, 1.5s linear loop. 200ms stagger if multiple skeletons in group.

### States — *[GAP FILL]*

Skeleton has a single state by definition (loading) — it has no hover/focus/active states since it's never interactive. Its only "transition" is its own removal once content arrives:

| Transition | Treatment |
|---|---|
| Skeleton → loaded content | Crossfade, 200ms (per Product Spec §11 Animation Catalog "Skeleton → content: crossfade 200ms") |

### Accessibility — *[GAP FILL]*

- Skeleton elements are `aria-hidden="true"` — they convey no information to screen reader users and must not be announced as content.
- The loading state itself should be announced once via a visually-hidden live region at the container level (not per-skeleton): `<div aria-live="polite" className="sr-only">Loading presets…</div>`, updated/removed once real content mounts.
- The shimmer animation must respect `prefers-reduced-motion` — when reduced motion is on, show a static (non-animated) skeleton fill rather than disabling the skeleton outright, per Design System §13's blanket reduced-motion rule.

### Responsive Behavior — *[GAP FILL]*

- `card` and `thumbnail` variants size themselves to match the grid column width at the current breakpoint — i.e., skeleton dimensions must mirror O4 PresetGrid's responsive column count (1 col `xs/sm`, 2 `md`, 3 `lg`, 4–5 `xl/2xl`) exactly, so layout doesn't shift when real cards replace skeletons.
- `text` variant line widths (`lastLineWidth`) stay proportionally consistent regardless of container width — percentage-based, not fixed px, so they don't overflow on narrow viewports.

### Motion Behavior — *[GAP FILL]*

Tier 4 — Ambient (per Design System §10 Motion Taxonomy, since it's a continuous loop communicating live "still loading" state).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Shimmer sweep | `background-position` gradient sweep | 1.5s, loops | `--ease-linear` |
| Multi-skeleton stagger | `animation-delay` per item | 200ms increments | — |
| Exit crossfade to content | `opacity` 1→0 (skeleton) simultaneous with content `opacity` 0→1 | `--dur-normal` (200ms per Product Spec) | `--ease-in-out` |

`prefers-reduced-motion`: shimmer sweep becomes a static semi-transparent fill (no motion), per the universal reduced-motion rule in Design System §13.

### Design Tokens — *[GAP FILL]*

- Base fill: `--color-bg-elevated`
- Shimmer highlight: `--color-bg-surface` (lighter sweep band)
- Radius: matches the component it's standing in for (`radius-full` for avatar, `radius-lg` for card/thumbnail, `radius-sm` for text lines)

### Composition Examples — *[GAP FILL]*

- **O4 PresetGrid initial load:** renders `variant="card"` skeletons matching the current breakpoint's column count, per O4's stated behavior "Skeleton cards shown during initial load (matches column count)."
- **M3 StatCard loading:** `isLoading` prop on StatCard internally renders Skeleton `variant="text"` in place of the number, per M3's props contract.
- **Profile page before data loads:** `variant="avatar"` at `3xl` + multiple `variant="text"` lines for name/bio/stats row.

---

## A8 — Spinner

### Purpose
*(verbatim)*

Indicates in-progress async operation.

### Variants
*(verbatim)*

**Sizes:** `sm` (16px) · `md` (24px) · `lg` (32px)

- `ring` — Circular border with gap (default, used in buttons)
- `dots` — Three dots pulsing (used in full-page loading)

### Props
*(verbatim)*

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ring' | 'dots'
  label?: string          // For aria-label (defaults to "Loading")
  color?: 'accent' | 'white' | 'current'
}
```

### States — *[GAP FILL]*

Single-purpose component, always "active" while rendered. No interactive states. The only state transition is mount/unmount, typically crossfaded with the content it represents (consistent with A7 Skeleton's exit pattern, though Spinner more often simply unmounts rather than crossfading, since it usually occupies a small inline space like inside a Button).

### Accessibility — *[GAP FILL]*

- `role="status"` and `aria-label={label ?? "Loading"}` on the spinner's container, per Design System §13 ARIA Patterns convention (mirrors the `aria-busy` pattern shown for buttons).
- When nested inside a Button in its Loading state, the Spinner's own `aria-label` is redundant with the Button's `aria-busy`/`aria-label` combo — suppress the Spinner's individual label in that context (`aria-hidden="true"` on the spinner icon itself) so screen readers don't announce "Loading" twice.
- For full-page loading (`dots` variant), the `role="status"` region should be the sole live announcement; avoid pairing with a separate `aria-live` region that duplicates the message.

### Responsive Behavior — *[GAP FILL]*

- No breakpoint-specific behavior — Spinner's size is chosen by the consuming component (e.g. `sm` inside a `size="sm"` Button, `lg` for full-page loading states) rather than by viewport.

### Motion Behavior — *[GAP FILL]*

Tier 4 — Ambient.

| Variant | Animation | Duration | Easing |
|---|---|---|---|
| `ring` | Continuous rotation | `--dur-loop-fast` (800ms) | `--ease-linear` |
| `dots` | Sequential opacity/scale pulse per dot, staggered | ~1200ms full cycle | `--ease-in-out` |

**ADR-005 (RESOLVED):** `ring` spinner uses the dedicated `--dur-loop-fast: 800ms` token, added specifically for ring/icon spinners. `--dur-loop` (2000ms) remains reserved for large ambient effects (e.g. streaming indicators). See Design System §11 and ARCHITECTURE_DECISIONS.md ADR-005.

`prefers-reduced-motion`: per Design System §13, this is one of the few animations that **should not** be fully disabled (a frozen spinner gives no loading feedback at all) — instead, reduce to a simple opacity pulse rather than rotation/motion, since loading spinners are functional, not decorative. This is a deliberate exception to the blanket "animation-duration: 0.01ms" rule and should be implemented as a distinct reduced-motion variant, not the default media query override.

### Design Tokens — *[GAP FILL]*

- Color: `--color-interactive-primary` (`accent`), `#FFFFFF` (`white`), `currentColor` (`current`)
- Stroke width: matches icon stroke convention, 1.5–2px depending on size

### Composition Examples — *[GAP FILL]*

- **Button loading state:** Spinner `variant="ring" size="sm" color="current"`, replaces label text, dimensions of button unchanged (per A1's usage rule).
- **Full-page route loading:** Spinner `variant="dots" size="lg" color="accent"`.
- **M11 DownloadButton "Getting your file..." state:** Spinner `variant="ring"` alongside the status text.

---

## A9 — Divider

### Purpose
*(verbatim)*

Visual separation between content groups.

### Variants
*(verbatim)*

- `horizontal` (default) — Full-width line
- `vertical` — In flex rows
- `text` — With centered label text ("or", "members")

### Props — *[GAP FILL — not specified in source]*

```typescript
interface DividerProps {
  variant?: 'horizontal' | 'vertical' | 'text'
  label?: string          // Required when variant="text"
  spacing?: 'sm' | 'md' | 'lg'  // Margin around the divider
}
```

### States

Non-interactive; no states apply.

### Accessibility — *[GAP FILL]*

- Renders as `<hr>` for `horizontal`/`vertical` variants when used as a true thematic break (e.g. between dropdown menu sections per F3); renders as a styled `<div role="separator" aria-orientation="horizontal|vertical">` when used purely decoratively within a single semantic section.
- `text` variant: the label is real text content (not an image or decorative pseudo-element with text baked in), so it's read naturally by screen readers without extra ARIA.
- Decorative-only dividers (pure visual rhythm, not separating distinct sections) should be `aria-hidden="true"` to avoid unnecessary noise in the accessibility tree — per Design System §1.1 "borders are hairline, not structural," the line itself carries no semantic weight unless explicitly marking a content boundary.

### Responsive Behavior — *[GAP FILL]*

- `vertical` dividers (used in flex rows, e.g. separating stat values like "12.4K downloads · 892 views") collapse to `horizontal` or are hidden entirely on `xs` where the row itself typically wraps to stacked layout — the consuming component decides this, not Divider itself.

### Motion Behavior — *[GAP FILL]*

None. Dividers are static structural elements; per Design System §1.5 "an animation that a user never consciously notices is a success" — for a pure visual rule line, the correct outcome is *no animation at all*, not a subtle one.

### Design Tokens — *[GAP FILL]*

- Color: `--color-border-subtle`
- Thickness: `--space-px` (1px). **ADR-015 (RESOLVED):** confirmed `1px`. Design Principle §1.1's "hairline (0.5px)" wording is a visual-weight description, not a literal pixel mandate — consistent with the Spacing System's own `space-px: 1px` token, already labeled "Hairline separators only." Also more reliable cross-browser on non-Retina displays. See ARCHITECTURE_DECISIONS.md ADR-015.
- Text (text variant): `body-xs`, `--color-text-tertiary`

### Composition Examples — *[GAP FILL]*

- **F3 Dropdown Menu:** `variant="horizontal"` between action groups (e.g. between Edit/Copy/Share and Report/Delete), per F3's anatomy diagram showing separator lines.
- **AuthLayout:** `variant="text"` with `label="or"` between "Continue with Google" and email/password form.
- **Preset Page metadata column:** `variant="horizontal"` between Title/Description, Metadata pills, Tags, and CTA sections, per §6.3's section separators in the page structure.

---

*End of Atoms — continued in `02-molecules.md`*
