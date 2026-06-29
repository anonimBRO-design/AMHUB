# PresetHub Component Library — 05. Overlays & Feedback

**Source of truth for existing specs:** `PresetHub_Design_System.md` §17 "OVERLAYS & FEEDBACK"  
**This file:** preserves those specs verbatim, appends Accessibility / Responsive / Motion / Composition where the source was silent.

---

## What Overlays & Feedback Are

Overlays and feedback components render above the page z-stack. They are never structural layout elements — they float over whatever template and organism is currently active, summoned by user actions or system events, and dismissed without triggering a route change.

The z-index ladder for this layer (from Design System §15 CSS Variable Naming Conventions):

```
--z-base:           0     ← Page background
--z-raised:         10    ← Cards, panels
--z-dropdown:       100   ← F3 Dropdown Menu
--z-sticky:         200   ← Navigation, TopBar
--z-overlay:        300   ← F2 Modal backdrop, F5 Badge Unlock backdrop
--z-modal:          400   ← F2 Modal panel, F5 Badge Unlock panel, F6 Confirmation Dialog
--z-notification:   500   ← F1 Toast
--z-tooltip:        600   ← F4 Tooltip (always on top — never obscured by a modal or toast)
```

No component in this file may render at a z-index below `--z-dropdown`. Every component here dismisses on `Escape` unless otherwise specified. Every backdrop that blocks the page must have `aria-hidden="true"` on the page content behind it (or use the `inert` attribute on the non-modal DOM) while the overlay is open.

**Component IDs F1–F6** are inherited from Design System §17. All six are defined there; this file fills the missing nine-part template dimensions.

---

## F1 — Toast

### Purpose
*(verbatim from Design System §17)*

Non-blocking feedback for completed actions.

### Variants
*(verbatim)*

| Variant | Icon | Use case |
|---|---|---|
| `success` | `CheckCircle` (Lucide) | Action completed: preset published, profile saved, download started |
| `error` | `XCircle` (Lucide) | Action failed: upload error, network failure, permission denied |
| `warning` | `AlertTriangle` (Lucide) | Caution: file too large, AM version mismatch, rate limit approaching |
| `info` | `Info` (Lucide) | Neutral information: feature announcement, status update |

**Anatomy** *(verbatim):*
```
[icon]  Message text              [action?]  [✕]
```

- `[icon]`: 20px (`icon-md`), colored per variant
- `Message text`: up to ~80 characters; longer messages wrap to a second line within the toast body
- `[action?]`: optional inline text link or ghost button (e.g. "View preset", "Retry", "Undo") — one action maximum per toast
- `[✕]`: always present — A1 Button `variant="icon"` `size="sm"` with `aria-label="Dismiss notification"`

**Behavior** *(verbatim):*
- Appears at top-right (bottom-center on mobile)
- Auto-dismisses after 4s
- Pause dismissal on hover
- Maximum 3 toasts stacked (oldest dismisses if more arrive)
- Entrance: slide-in from right + fade, 250ms
- Exit: slide-out right + fade, 200ms

### Props — *[GAP FILL — not specified in source]*

```typescript
interface ToastProps {
  id: string                                          // Unique identifier for queue management
  variant: 'success' | 'error' | 'warning' | 'info'
  message: string                                     // Max ~80 chars before wrapping
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number                                   // Default: 4000ms; set to Infinity for persistent toasts
  onDismiss: (id: string) => void
}

// Toast queue management lives in a singleton store (Zustand notificationStore),
// not in individual toast instances. The store exposes:
interface ToastStore {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => void
  dismissToast: (id: string) => void
  dismissAll: () => void
}
```

The `<ToastContainer>` component renders at the root layout level (inside T1 AppLayout and T2 PublicLayout), not at the page level. Pages and organisms call `addToast()` from the store — they never render `<Toast>` directly.

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Entering | Slides in from right (top-right position) or up from bottom (mobile, bottom-center) — see Motion Behavior |
| Resting (auto-dismiss running) | Full opacity; progress indicator optional — **[OPEN QUESTION → ADR-027]:** neither source doc specifies a visible countdown/progress bar on the toast. See ADR-027. |
| Hover (auto-dismiss paused) | No visual change to the toast itself; the pause is silent. The 4s timer suspends while the pointer remains within the toast bounds. |
| Dismiss button focus | A1 Button `variant="icon"` standard focus ring (`--shadow-focus`) |
| Exiting | Slides out to right (desktop) or down (mobile) — see Motion Behavior |
| Queue full (4th toast arrives) | Oldest toast triggers its exit animation immediately; new toast enters. The queue never exceeds 3 visible items. |

### Accessibility — *[GAP FILL]*

- The `<ToastContainer>` renders as `<div role="region" aria-label="Notifications" aria-live="polite" aria-atomic="false">`. Using `aria-live="polite"` ensures screen readers announce toasts without interrupting the user's current action.
- **Exception for `error` variant:** use `aria-live="assertive"` on error toasts — errors require immediate attention and should interrupt the current screen reader flow. This means the `<ToastContainer>` itself cannot be a single live region with one `aria-live` value; instead, maintain two sibling containers: one `polite` (success, warning, info) and one `assertive` (error). Both are visually the same position.
- `aria-atomic="false"` is correct: each toast is an independent announcement. If three toasts are queued and the oldest is replaced, the screen reader should not re-announce the remaining two.
- The dismiss button (`[✕]`): `<button aria-label="Dismiss notification" type="button">`. If the toast has a specific subject (e.g. "Preset published"), a more specific label is preferred: `aria-label="Dismiss: Preset published"`.
- When a toast auto-dismisses, no screen reader announcement is needed for the removal — absence of an element is not announced in most screen readers. No additional ARIA is needed for auto-dismiss.
- When the optional `action` is present (e.g. "Retry"), it is a `<button type="button">` with clear label text. It is the last focusable element inside the toast (DOM order: icon → message → action → dismiss). Tab order within the toast follows DOM order.
- Keyboard: `Tab` moves between toasts in the stack. `Enter` or `Space` on the dismiss button dismisses that toast. `Escape` dismisses the most recently added toast (consistent with the escape-closes pattern for overlays).
- Toasts must not receive automatic focus on entrance — focus stays where it was before the toast appeared. The user chooses whether to interact with the toast.
- Color is not the only differentiator between variants: each variant has a distinct icon (CheckCircle, XCircle, AlertTriangle, Info) in addition to its color treatment.

### Responsive Behavior — *[GAP FILL]*

| Breakpoint | Position | Width | Stacking direction |
|---|---|---|---|
| `xs`/`sm` | Bottom-center, above O2 MobileNav (if present) | `calc(100vw - 2 × --space-4)`, max 400px | Stacks upward (newest toast above) |
| `md+` | Top-right, `--space-6` (24px) from viewport edge, below O3 TopBar | `360px` fixed | Stacks downward (newest toast below, oldest at top) |

- On mobile (`xs`/`sm`), the toast must clear O2 MobileNav: `bottom` position = MobileNav height (≈ 64px) + `env(safe-area-inset-bottom)` + `--space-4` (16px) gap.
- The stacking direction reversal between mobile and desktop is intentional and matches the convention from source: desktop top-right stack grows down (toward the user's reading path); mobile bottom-center stack grows up (away from the MobileNav).
- On `xs`/`sm`, the toast width fills the viewport minus horizontal margin (`--space-4` each side), capped at 400px to avoid ultra-wide toasts on large phones in landscape.
- Maximum 3 toasts: at `xs`/`sm`, 3 stacked toasts upward from the bottom may reach a significant portion of the screen. If the 3-toast stack would overlap key interactive elements (e.g. a form submit button), the oldest toast should be dismissed early. **[OPEN QUESTION → ADR-028]:** the source docs do not address this mobile overflow scenario. See ADR-028.

### Motion Behavior — *[GAP FILL, partially specified in Design System §17 F1 and Product Spec §11]*

Tier 3 — Entrance / Exit.

| Animation | Property | Duration | Easing | Source |
|---|---|---|---|---|
| Entrance (desktop, top-right) | `translateX(100% → 0)` + `opacity(0 → 1)` | 250ms | `--ease-out` | Design System §17 F1 "Entrance: slide-in from right + fade, 250ms" (verbatim) |
| Entrance (mobile, bottom-center) | `translateY(100% → 0)` + `opacity(0 → 1)` | 250ms | `--ease-out` | Inferred from mobile bottom position; direction matches Product Spec §11 "Notification slide-in: right-to-0, 250ms ease-out" principle |
| Exit (desktop) | `translateX(0 → 100%)` + `opacity(1 → 0)` | 200ms | `--ease-in` | Design System §17 F1 "Exit: slide-out right + fade, 200ms" (verbatim) |
| Exit (mobile) | `translateY(0 → 100%)` + `opacity(1 → 0)` | 200ms | `--ease-in` | Inferred — mirrors entrance axis |
| Stack reflow (when a toast is dismissed mid-stack) | Remaining toasts translate to their new positions | 200ms | `--ease-in-out` | Inferred from general transition convention |

`prefers-reduced-motion`: entrance and exit are instant `opacity` only — no `translateX`/`translateY`. Stack reflow is instant.

### Design Tokens — *[GAP FILL]*

- Background: `--color-bg-elevated` — Level 2 surface (Raised), above cards and panels
- Border: `1px solid` per variant:
  - `success`: `--color-border-success`
  - `error`: `--color-border-error`
  - `warning`: `--color-border-default` (no `--color-border-warning` token defined; `--color-border-default` is the nearest neutral; **[OPEN QUESTION → ADR-029]:** no warning border token exists — see ADR-029)
  - `info`: `--color-border-default`
- Shadow: `--shadow-dropdown` (0 8px 24px rgba(0,0,0,0.5)) — appropriate for a floating notification that sits above most page content
- Border radius: `--radius-lg` (12px) — matches cards and dropdowns per Design System §5
- Padding: `--space-4` (16px) vertical and horizontal
- Icon size: `icon-md` (20px)
- Icon color per variant:
  - `success`: `--color-text-success` (`#4ADE80`)
  - `error`: `--color-text-error` (`#F87171`)
  - `warning`: `--color-text-warning` (`#FBBF24`)
  - `info`: `--color-text-info` (`#60A5FA`)
- Message text: `body-sm` (Inter 400 / 14px), `--color-text-primary`
- Action text: `label-sm` (Inter 500 / 12px), `--color-text-accent` (functions as an inline link)
- Dismiss button: A1 Button `variant="icon"` `size="sm"`, icon `X` (Lucide), `--color-text-secondary`
- Width (desktop): 360px (fixed)
- Z-index: `--z-notification` (500)
- Gap between stacked toasts: `--space-2` (8px)

### Composition Examples — *[GAP FILL]*

The `<ToastContainer>` is composed into both T1 AppLayout and T2 PublicLayout at the root level. Individual organisms and pages call `addToast()` from the store.

| Trigger | Variant | Message example |
|---|---|---|
| Preset published successfully | `success` | "Preset published. It's under review." |
| Upload fails (network error) | `error` | "Upload failed. Check your connection and try again." · action: "Retry" |
| Post-upload moderation notice | `info` | "Your preset is pending review (up to 24h)." |
| Preset copied to clipboard (Share) | `success` | "Link copied to clipboard." |
| Like toggled (optimistic, then server error) | `error` | "Couldn't save your like. Try again." |
| Badge unlocked (supplementary, post F5) | `success` | "You earned the 'First Upload' badge!" — shown after F5 overlay dismisses |
| Download recorded | `success` | "Downloading preset…" · action: "View preset" |
| Comment posted | `success` | "Comment posted." |
| Collection saved | `success` | "Added to collection." |
| Report submitted | `info` | "Report submitted. Our team will review it." |
| Account settings saved | `success` | "Profile updated." |

---

## F2 — Modal / Dialog

### Purpose
*(verbatim from Design System §17)*

Content that requires dedicated focus and user decision.

### Variants
*(verbatim)*

**Sizes:**

| Size | Max-width | When to use |
|---|---|---|
| `sm` | 480px | Simple confirmations, single-field forms, short messages |
| `md` | 600px | Medium-complexity content, multi-field short forms |
| `lg` | 800px | Rich content — image previews, longer forms, embedded media |
| `fullscreen` | 100vw × 100vh | Immersive content — image cropper (CC5), badge unlock (F5) |

**Structure** *(verbatim):*
```
[Backdrop — click to close]
┌────────────────────────────────┐
│  Modal Header                  │
│  Title                [Close ✕]│
├────────────────────────────────┤
│                                │
│  Modal Body                    │
│  {children}                    │
│                                │
├────────────────────────────────┤
│  [Cancel]     [Confirm Action] │  ← Modal Footer (optional)
└────────────────────────────────┘
```

**Rules** *(verbatim):*
- Always have a close button (keyboard: Escape)
- Destructive modals: danger button + description of consequence
- Focus trapped inside while open
- Scroll lock on body while open

### Props — *[GAP FILL — not specified in source]*

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'           // Default: 'md'
  title: string                                        // Required — populates aria-labelledby
  description?: string                                 // Optional subtitle in header; also used as aria-describedby
  closeOnBackdropClick?: boolean                       // Default: true; set false for destructive flows
  closeOnEscape?: boolean                              // Default: true
  footer?: React.ReactNode                             // Renders below modal body; typically Cancel + Confirm buttons
  children: React.ReactNode                            // Modal body content
  initialFocusRef?: React.RefObject<HTMLElement>       // Element to receive focus on open; defaults to first focusable
  returnFocusRef?: React.RefObject<HTMLElement>        // Element to return focus to on close; defaults to trigger element
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Closed | Not rendered in DOM (unmounted, not just hidden — avoids inert DOM and stale focus state) |
| Opening | Backdrop fades in; panel scales in — see Motion Behavior |
| Open (default) | Backdrop at `--color-bg-overlay`, panel fully visible, focus trapped inside |
| Open (scrollable body) | Modal body scrolls independently when content overflows `max-height`; header and footer remain fixed within the panel. `max-height` for scrollable body: `calc(100vh - 12rem)` to ensure header/footer are always visible |
| Closing | Panel scales out; backdrop fades out — see Motion Behavior |
| Destructive (`footer` contains `danger` button) | The `danger` button uses A1 Button `variant="danger"`; a descriptive consequence sentence appears in the body above the footer (per Design System §17: "Destructive modals: danger button + description of consequence") |

### Accessibility — *[GAP FILL]*

- Modal panel: `<div role="dialog" aria-modal="true" aria-labelledby="modal-title-[id]" aria-describedby="modal-desc-[id]?">`. The `[id]` suffix is generated per instance to avoid collisions when nested modals exist (rare but possible — e.g. a confirmation dialog triggered from within a larger modal).
- Title: `<h2 id="modal-title-[id]">` — always `<h2>` regardless of page heading hierarchy. Modals are heading-level independent; `<h1>` is reserved for the page content behind the modal.
- Description: `<p id="modal-desc-[id]">` — connected via `aria-describedby`. When `description` is absent, omit `aria-describedby`.
- **Focus trap**: when the modal opens, focus moves to `initialFocusRef` if provided, otherwise to the first focusable element inside the panel (the close button in the header, since it is in the header and DOM-first). Tab and Shift+Tab cycle only within the modal. On close, focus returns to `returnFocusRef` if provided, otherwise to the element that triggered the modal open.
- **Focus trap implementation note:** Do not use `display:none` or `visibility:hidden` to trap focus — use the `inert` attribute on the root content behind the modal, or a focus-trap library. `inert` makes the background content non-focusable and non-readable to screen readers without requiring `aria-hidden="true"` on every ancestor.
- Close button: `<button type="button" aria-label="Close modal">` — not "Close" alone, since the modal title gives more context than a bare label. Full label: `aria-label="Close [modal title]"` (e.g. `aria-label="Close Delete Preset dialog"`).
- Backdrop: `<div aria-hidden="true">` — it is a visual and interactive target but conveys no semantic information.
- Scroll lock: apply `overflow: hidden` to `<body>` while open. On iOS Safari, `overflow: hidden` alone does not prevent body scroll; additionally apply `position: fixed; width: 100%` with the scroll position captured and restored on close.
- Escape key: handled on `keydown` (not `keyup`) — matches browser and screen reader convention.
- When `closeOnBackdropClick: false` (used for destructive flows): the backdrop click behavior is suppressed, but Escape still closes unless `closeOnEscape: false` is also set. The combination of `closeOnBackdropClick: false` + `closeOnEscape: false` should be used only when the modal is truly blocking — e.g. while a destructive server action is in progress and cannot be interrupted. In that state, the Close button in the header should also be removed or disabled, and `aria-busy="true"` should be set on the dialog element.
- `prefers-reduced-motion`: backdrop and panel animation (see Motion Behavior) collapses to instant opacity; focus management is unchanged.

### Responsive Behavior — *[GAP FILL]*

| Breakpoint | Panel behavior | Max-width |
|---|---|---|
| `xs`/`sm` | Full-width, anchored at bottom of viewport (bottom sheet pattern) — slides up from bottom | `100vw`, no horizontal margin |
| `md` | Centered, floating over backdrop | `min(600px, 90vw)` — adapts to tablet viewport |
| `lg+` | Centered per size prop | `sm`: 480px · `md`: 600px · `lg`: 800px |
| `fullscreen` (all breakpoints) | No backdrop click-to-close; full viewport | `100vw × 100svh` |

**[OPEN QUESTION → ADR-030]:** The bottom-sheet pattern on `xs`/`sm` (full-width, slides up from bottom) is derived from standard mobile modal conventions and aligns with the "Tactile Feedback" design principle — sliding up from the bottom feels native on mobile. However, the source docs do not explicitly specify a bottom-sheet pattern for modals on mobile. The alternative is a centered floating panel at reduced size (e.g. `90vw × auto`). See ADR-030.

- For `size="sm"` and `size="md"` on `xs`/`sm`, the bottom-sheet pattern has `border-radius: --radius-xl --radius-xl 0 0` (rounded top corners only, flush with bottom of viewport).
- For `size="lg"` on `xs`/`sm`, a full-height bottom sheet is more appropriate (panel extends to near the top of the viewport with a handle indicator for drag-to-dismiss). **[OPEN QUESTION → ADR-030]** covers this.
- `size="fullscreen"` is identical across all breakpoints.

### Motion Behavior — *[GAP FILL, specified in Product Spec §11 and Design System §10]*

Tier 2 — Transition.

| Animation | Property | Duration | Easing | Source |
|---|---|---|---|---|
| Backdrop entrance | `opacity` 0→1 | 200ms | `--ease-out` | Design System §10 "Modal Open: backdrop: opacity 0→1, 200ms ease-out" (verbatim) |
| Panel entrance (desktop, centered) | `scale(0.96→1)` + `opacity(0→1)` | 250ms | `--ease-spring` | Product Spec §11 "Modal open: scale 0.95→1 + fade, 200ms ease-spring" (verbatim; minor spec discrepancy: Product Spec says 0.95 scale start, Design System says 0.96 — use Design System §11 Framer Motion `scaleIn` preset: `scale: 0.96`) |
| Panel entrance (mobile, bottom sheet) | `translateY(100%→0)` | 350ms | `--ease-snap` | Inferred: bottom-sheet slide-up follows `ease-snap` per Design System §11 easing guide "Drawer/panel slide: ease-snap — fast start, sharp settle" |
| Panel exit (desktop) | `scale(1→0.96)` + `opacity(1→0)` | 150ms | `--ease-in` | Product Spec §11 "Modal close: scale 1→0.95 + fade, 150ms ease-in" (verbatim) |
| Panel exit (mobile, bottom sheet) | `translateY(0→100%)` | 250ms | `--ease-in` | Inferred: reverse of entrance axis |
| Backdrop exit | `opacity(1→0)` | 200ms | `--ease-out`, delayed 50ms after panel exit begins | Design System §10 "Modal Close: backdrop: opacity 1→0, 200ms ease-out (delayed 50ms)" (verbatim) |

`prefers-reduced-motion`: all entrance/exit is instant `opacity` only. No scale or translate.

### Design Tokens — *[GAP FILL]*

- Backdrop: `--color-bg-overlay` (`rgba(0,0,0,0.75)` dark theme, `rgba(0,0,0,0.5)` light theme) — defined in Design System §14
- Panel background: `--color-bg-elevated`
- Panel shadow: `--shadow-modal` (`0 24px 64px rgba(0,0,0,0.7), 0 0 48px rgba(0,0,0,0.3)`)
- Panel border radius: `--radius-xl` (16px) desktop; `--radius-xl --radius-xl 0 0` mobile (bottom sheet)
- Panel border: `1px solid --color-border-subtle` — hairline border helps the panel read as distinct from the backdrop
- Header padding: `--space-6` (24px) horizontal, `--space-4` (16px) vertical
- Body padding: `--space-6` (24px) horizontal, `--space-4` (16px) vertical; `overflow-y: auto` when content exceeds `max-height`
- Footer padding: `--space-4` (16px) horizontal, `--space-4` (16px) vertical; `border-top: 1px solid --color-border-subtle`
- Title: `heading-xl` (Inter 600 / 20px)
- Description (subtitle): `body-sm`, `--color-text-secondary`
- Close button: A1 Button `variant="icon"` `size="sm"`, icon `X` (Lucide)
- Z-index: backdrop at `--z-overlay` (300); panel at `--z-modal` (400)

### Composition Examples — *[GAP FILL]*

F2 Modal is the generic modal primitive. Specialized modals (F5 Badge Unlock Overlay, F6 Confirmation Dialog) are distinct components that share the backdrop pattern but not the F2 shell.

| Context | Size | Contents |
|---|---|---|
| CC5 Image Cropper (thumbnail upload) | `fullscreen` | CC5 Image Cropper component, no standard header/footer |
| QR Code reveal (after download click for `file_type: "qr"`) | `sm` | QR code image + "Scan with Alight Motion" instructions + Close |
| Follower/Following list (profile page) | `md` | CC6 Follower/Following List |
| Share preset (native share not available) | `sm` | Copy link input + social share links |
| Collection picker (bookmark to collection) | `sm` | Collection list with add/create option |
| Edit preset metadata | `lg` | Form with A2 Input, A3 Textarea, CC2–CC3 compound components |

---

## F3 — Dropdown Menu

### Purpose
*(verbatim from Design System §17)*

Contextual actions for a specific item.

### Variants
*(no variants defined in source — single pattern with context-specific item sets)*

**Trigger** *(verbatim):* Appears at the `⋯` (`MoreHorizontal` Lucide icon) button on cards and items.

**Anatomy** *(verbatim):*
```
┌──────────────────┐
│  ✏  Edit         │
│  🔗  Copy Link   │
│  📤  Share       │
│  ─────────────   │  ← Divider between groups
│  🚩  Report      │
│  ─────────────   │
│  🗑  Delete      │  ← Danger item (red text)
└──────────────────┘
```

**Behavior** *(verbatim):* Closes on Escape, click outside, or item selection.

The item set in the anatomy above is the full set for M1 PresetCard (creator-owned). Other contexts (comment items, dashboard table rows, admin queue) use a subset of these items or a different set entirely — specified in Composition Examples below.

### Props — *[GAP FILL — not specified in source]*

```typescript
interface DropdownMenuProps {
  trigger: React.ReactNode             // The ⋯ button or any other trigger element
  items: DropdownMenuItem[]
  placement?: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'
                                       // Default: 'bottom-end' (aligns to right edge of trigger)
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

interface DropdownMenuItem {
  type: 'item' | 'separator'
}

interface DropdownMenuActionItem extends DropdownMenuItem {
  type: 'item'
  label: string
  icon?: LucideIcon
  variant?: 'default' | 'danger'      // Default: 'default'; danger = red label + icon
  isDisabled?: boolean
  onClick: () => void
}

interface DropdownMenuSeparator extends DropdownMenuItem {
  type: 'separator'
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Closed | Not rendered in DOM (unmounted) |
| Open | Panel visible below/above trigger (per `placement`), backdrop invisible (click-outside closes without a visible overlay) |
| Item default | `--color-text-primary`, icon `--color-text-secondary` |
| Item hover | Background `--color-bg-surface` (one level up from `--color-bg-elevated` panel), text `--color-text-primary` |
| Item focus (keyboard) | Background `--color-bg-surface`, `--shadow-focus` ring inside the item row |
| Item `variant="danger"` default | Label and icon: `--color-text-error` |
| Item `variant="danger"` hover | Background `--color-bg-error` (subtle red tint), label and icon: `--color-text-error` |
| Item `isDisabled` | `opacity: 0.4`, `cursor: not-allowed`, no hover treatment |
| Separator | `<hr>` styled as `1px solid --color-border-subtle`, `margin: --space-1` (4px) vertical, no horizontal padding |

### Accessibility — *[GAP FILL]*

- The trigger button: `<button type="button" aria-haspopup="menu" aria-expanded={isOpen} aria-controls="dropdown-[id]">`. The `aria-label` on the trigger must identify the target item — not a generic "More options" — so screen reader users understand which item's menu they are opening. Pattern: `aria-label="More options for [Preset Title]"` or `aria-label="Actions for [Creator Name]"`.
- Dropdown panel: `<div role="menu" id="dropdown-[id]">`. Each item: `<div role="menuitem" tabIndex={-1}>` (or `role="menuitemradio"` / `role="menuitemcheckbox"` if applicable — not used in current PresetHub scope). Danger items retain `role="menuitem"`, not a special role.
- Keyboard navigation within the open dropdown:
  - `ArrowDown`: move focus to next item (wraps from last to first)
  - `ArrowUp`: move focus to previous item (wraps from first to last)
  - `Home`: focus first item
  - `End`: focus last item
  - `Enter` / `Space`: activate focused item
  - `Escape`: close menu, return focus to trigger
  - Tab: close menu, move focus to next focusable element in the page (does not navigate within the dropdown — per ARIA `menu` widget pattern, menus use arrow keys for internal navigation, not Tab)
- When the dropdown opens, focus moves to the first non-disabled item. If the first item is disabled, focus moves to the first non-disabled item in the list.
- Separator items (`role="separator"`) are not focusable and not announced individually by screen readers when navigating with arrow keys.
- Disabled items (`isDisabled`): include in the DOM with `aria-disabled="true"` (not the HTML `disabled` attribute — `aria-disabled` keeps the element in the focus order so keyboard users can hear it is there but disabled, per ARIA best practice for menus). `onClick` is suppressed programmatically.
- **Click-outside close**: implemented via a transparent background overlay at `--z-dropdown - 1` (or via `useEffect` with document `mousedown` listener) — no visible backdrop. The dropdown itself sits at `--z-dropdown` (100).
- When a danger item ("Delete") triggers a destructive action, F6 Confirmation Dialog opens — the dropdown closes first, returning focus to the trigger, then the confirmation dialog opens and captures focus. The sequence: item click → dropdown close (focus returns to trigger) → F6 opens (focus moves to Cancel button in F6) → action confirmed/cancelled → F6 closes (focus returns to trigger).

### Responsive Behavior — *[GAP FILL]*

- The dropdown panel renders in the same position at all breakpoints (anchored to the trigger via floating-ui / Popper.js or equivalent). No breakpoint-specific behavior.
- On `xs`/`sm`, if the standard `placement="bottom-end"` would push the panel off-screen (e.g. trigger is near the right viewport edge and the panel is 180px wide), the placement flips to `bottom-start`. This flip logic is handled by the floating positioning library (`flip` middleware), not custom code.
- On touch devices: items respond to `touchstart` (not hover). No hover state on touch — only default and active/pressed states are visible.
- Minimum panel width: `160px`. Maximum: `220px`. Items that exceed the width truncate with `text-overflow: ellipsis` and a full-text tooltip (F4) on hover/focus — though item labels should be short enough that truncation is rare in practice.

### Motion Behavior — *[GAP FILL]*

Tier 2 — Transition.

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Open | `scale(0.95→1)` + `opacity(0→1)`, origin at trigger | `--dur-normal` (250ms) | `--ease-spring` |
| Close | `scale(1→0.95)` + `opacity(1→0)` | `--dur-fast` (150ms) | `--ease-in` |
| Item hover background | `background-color` | `--dur-instant` (50ms) | `--ease-out` |

`prefers-reduced-motion`: open and close are instant opacity only — no scale.

### Design Tokens — *[GAP FILL]*

- Panel background: `--color-bg-elevated` — Level 2 surface
- Panel shadow: `--shadow-dropdown` (`0 8px 24px rgba(0,0,0,0.5)`)
- Panel border: `1px solid --color-border-subtle`
- Panel border radius: `--radius-lg` (12px)
- Panel padding: `--space-1` (4px) vertical, `0` horizontal (items have their own padding)
- Item padding: `--space-2` (8px) vertical, `--space-3` (12px) horizontal
- Item min-height: `36px` (touch-friendly)
- Item icon size: `icon-sm` (16px)
- Item gap (icon + label): `--space-2` (8px)
- Item label: `body-sm` (Inter 400 / 14px)
- Danger item label/icon: `--color-text-error`
- Danger item hover background: `--color-bg-error`
- Separator: `1px solid --color-border-subtle`
- Z-index: `--z-dropdown` (100)

### Composition Examples — *[GAP FILL]*

F3 is used wherever the `⋯` MoreHorizontal pattern appears:

| Consumer | Trigger | Item set |
|---|---|---|
| M1 PresetCard (creator-owned) | `⋯` on card | Edit · Copy Link · Share · — · Report · — · Delete |
| M1 PresetCard (not creator-owned) | `⋯` on card | Copy Link · Share · — · Report |
| M4 CommentItem (own comment) | `⋯` on comment | Edit · Delete |
| M4 CommentItem (other's comment) | `⋯` on comment | Report |
| M4 CommentItem (creator's own preset, any comment) | `⋯` on comment | Pin · Delete |
| O9 Creator Dashboard preset table row | `⋯` action | Edit · Preview · — · Delete |
| T4 AdminLayout moderation queue row | `⋯` action | Approve · Reject · Ask for Changes |
| O3 TopBar avatar | Avatar click | Profile · Dashboard · Settings · — · Sign out |

The O3 TopBar avatar dropdown reuses F3's item + separator pattern and visual style, but its trigger is the user's avatar (A4 Avatar `size="sm"`) rather than the `⋯` MoreHorizontal button. The F3 component is flexible enough to support any trigger element — the `⋯` convention is the primary usage, not a hard constraint.

---

## F4 — Tooltip

### Purpose
*(verbatim from Design System §17)*

Brief explanation for icon buttons and abbreviated content.

### Variants
*(no variants defined in source — single pattern; placement is configurable)*

**Anatomy** *(verbatim):* Text label above/below the element.

**Behavior** *(verbatim):*
- Appears after 500ms hover delay
- Disappears immediately on mouse leave
- Never on touch devices
- Max 80 characters (longer → use Popover)

### Props — *[GAP FILL — not specified in source]*

```typescript
interface TooltipProps {
  content: string                      // Max 80 characters
  placement?: 'top' | 'bottom' | 'left' | 'right'
                                       // Default: 'top'
  delayMs?: number                     // Default: 500ms (verbatim spec); can be reduced for
                                       // icon-only nav items where discovery is important
  isDisabled?: boolean                 // Suppress tooltip (e.g. when a label is already visible)
  children: React.ReactElement         // The element the tooltip is attached to
}
```

**[OPEN QUESTION → ADR-031]:** The source docs do not specify whether Tooltip supports rich content (e.g. badge name + description as a two-line tooltip used in M9 BadgeChip). The Design System §17 says "Max 80 characters (longer → use Popover)" — but no Popover component is defined. This creates a gap for the BadgeChip tooltip which, per Product Spec §19, should "explain how to earn them" — a sentence that may exceed 80 characters. See ADR-031.

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Default (hidden) | Not rendered, or rendered with `display:none` / `visibility:hidden` + `pointer-events:none` |
| Hover delay active (0–500ms) | Still hidden; delay timer counting |
| Visible | Tooltip panel appears at `placement`, with pointer/arrow indicating the source element |
| Mouse leave | Disappears immediately (no exit delay, per verbatim spec "Disappears immediately on mouse leave") |
| Keyboard focus on trigger | Tooltip appears immediately (no 500ms delay) — keyboard users should not have to wait for discovery |
| Keyboard blur on trigger | Tooltip disappears immediately |

### Accessibility — *[GAP FILL]*

- Tooltip attaches to its trigger via `aria-describedby` on the trigger element: `<button aria-describedby="tooltip-[id]">`. The tooltip panel: `<div role="tooltip" id="tooltip-[id]">`.
- `role="tooltip"` causes screen readers to announce the tooltip content automatically when the trigger receives focus — without needing `aria-live`. This is the correct ARIA pattern for supplementary descriptions.
- The trigger element's own accessible name (its `aria-label` or text content) must still be meaningful without the tooltip. Tooltip content is supplementary — a trigger with only a tooltip and no `aria-label` fails WCAG 2.1 Success Criterion 4.1.2 (Name, Role, Value). Example: O1 Sidebar icon-only items in collapsed mode have `sr-only` labels as the primary accessible name; the tooltip is additional context for sighted users.
- **"Never on touch devices"** *(verbatim):* on touch-only devices, tooltips must not interfere with interaction. The hover-trigger path is naturally absent. For keyboard access via an attached Bluetooth keyboard on a touch device, the `focus` trigger still applies. The `delayMs` on focus trigger is `0` (immediate) — keyboard users should not experience the hover delay.
- Tooltip content should not duplicate the trigger's accessible name — it should add new information. E.g. for an icon button `aria-label="Download preset"`, the tooltip adding "Download preset" is redundant. Instead the tooltip might clarify file format: "Downloads as XML file."
- Tooltip `max-width: 240px` with text wrapping — avoids single-line tooltips exceeding the 80-character max-width at small font sizes.
- Tooltip must not contain interactive elements (links, buttons). If interactive content is needed, use a Popover (not yet defined in this library — see ADR-031).
- Tooltip must not be the sole mechanism for conveying critical information — it is hidden on touch, hidden until hover/focus, and not announced on mobile screen readers without focus. Important information must be in the main UI.

### Responsive Behavior — *[GAP FILL]*

- `xs`/`sm` (touch primary): Tooltips are `display:none` on touch-primary viewports. They may still trigger via keyboard focus if a Bluetooth keyboard is connected — the 0ms focus-trigger delay is acceptable in this case.
- `md+` (pointer primary): Standard hover + focus behavior.
- **Placement auto-flip**: if the preferred placement would cause the tooltip to overflow the viewport, the floating positioning library flips to the opposite side. No manual breakpoint overrides needed.

### Motion Behavior — *[GAP FILL]*

Tier 1 — Feedback (near-instant appearance on focus), Tier 2 — Transition (delayed hover appearance).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Appear (hover, after 500ms delay) | `opacity` 0→1 + `scale(0.95→1)`, origin at arrow/anchor | `--dur-fast` (150ms) | `--ease-out` |
| Appear (focus, no delay) | `opacity` 0→1 | `--dur-instant` (50ms) | `--ease-out` |
| Disappear | `opacity` 1→0 | Instant (0ms) | — |

`prefers-reduced-motion`: appear is instant opacity; scale suppressed.

### Design Tokens — *[GAP FILL]*

- Background: `--color-bg-elevated` — same as Dropdown, one level above page surface
- Shadow: `--shadow-tooltip` (`0 4px 12px rgba(0,0,0,0.4)`)
- Border: `1px solid --color-border-subtle`
- Border radius: `--radius-md` (8px) — per Design System §5 "Tooltip: radius-md (8px)" (verbatim)
- Padding: `--space-1` (4px) vertical, `--space-2` (8px) horizontal
- Typography: `label-sm` (Inter 500 / 12px), `--color-text-primary`
- Max-width: `240px`
- Arrow/pointer: a 6×6px rotated square matching the panel background and border, positioned at the anchor edge
- Z-index: `--z-tooltip` (600) — highest in the z-stack; always above modals, dropdowns, and toasts

### Composition Examples — *[GAP FILL]*

| Consumer | Trigger | Tooltip content |
|---|---|---|
| O1 Navigation Sidebar (collapsed, `md` breakpoint) | Icon-only nav item | Nav item label ("Home", "Explore", "Trending", etc.) |
| A1 Button `variant="icon"` (all icon buttons) | Icon button | Button action description |
| M9 BadgeChip `showTooltip` | Badge chip | Badge name + how-to-earn description — **[OPEN QUESTION → ADR-031]:** may exceed 80 chars |
| M11 DownloadButton `file_type: "qr"` | Download button | "Tap to reveal QR code" — supplementary |
| O9 Dashboard table sortable column header | Column header | Sort instructions ("Click to sort ascending") |
| A4 Avatar `isVerified` badge indicator | Verified `BadgeCheck` icon | "Verified Creator" |

---

## F5 — Badge Unlock Overlay

### Purpose
*(verbatim from Design System §17)*

Celebrate an earned badge. Full-screen moment.

### Variants
*(verbatim — by badge rarity, which affects the animation intensity)*

| Rarity | Visual treatment |
|---|---|
| `common` | Standard sequence (per verbatim spec below) |
| `rare` | Standard sequence + shimmer on badge icon (per Product Spec §19: "Rare/Legendary badges have animated shimmer effect") |
| `epic` | Standard sequence + shimmer |
| `legendary` | Standard sequence + shimmer + extended glow pulse (glow color matches legendary gradient: `#FBBF24 → #F97316`) |

**Animation sequence** *(verbatim from Design System §17 F5):*
1. Dark overlay fades in (200ms)
2. Badge icon scales in with spring (500ms)
3. Glow pulses 3× (400ms each)
4. 12 particle burst (600ms)
5. Badge name and description appear (300ms fade)
6. "View all badges →" and "Continue" buttons appear
7. Auto-dismisses after 8s or on click anywhere

### Props — *[GAP FILL — not specified in source]*

```typescript
interface BadgeUnlockOverlayProps {
  badge: {
    key: string
    name: string
    description: string                // "Earned by uploading your first preset"
    iconUrl?: string                   // Custom badge icon; falls back to Award (Lucide) if absent
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    xpReward: number                   // "+100 XP" displayed below badge name
  }
  isOpen: boolean
  onContinue: () => void               // Dismiss and continue
  onViewAllBadges: () => void          // Navigate to profile badges section
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Closed | Not rendered in DOM |
| Opening sequence (steps 1–4) | Animated sequence per verbatim spec; interactive elements (buttons) not yet interactive |
| Readable (steps 5–6) | Badge name, description, XP reward, and action buttons visible and interactive |
| Auto-dismiss countdown (step 7) | 8s timer running; any click on the overlay also dismisses |
| `legendary` rarity additional | Glow color uses `--color-rarity-legendary-start/end` gradient instead of the standard `--color-interactive-primary` glow |

### Accessibility — *[GAP FILL]*

- F5 is a full-screen modal experience. It uses `role="dialog" aria-modal="true" aria-labelledby="badge-name-[id]" aria-describedby="badge-desc-[id]"` — same ARIA pattern as F2 Modal.
- On open, focus moves to the "Continue" button (the primary dismiss action). The "View all badges →" link is also focusable. No other elements in the overlay are interactive.
- **Do not move focus during steps 1–4** (the animation sequence, ~1.6s). Focus should arrive at the "Continue" button only after step 6 (when the buttons appear). If focus is placed immediately on open, screen reader users hear "Continue button" before the badge name is visible — which is confusing. Instead, delay focus movement to after step 5 (badge name appears), timed to match the 300ms fade of step 5.
- Screen reader announcement: after the overlay opens and the badge name/description become visible (step 5), an `aria-live="polite"` region should announce: "Badge unlocked: [Badge Name]. [Description]. You earned [N] XP." This provides the equivalent of the visual animation sequence as a single coherent announcement.
- Keyboard: `Escape` dismisses (calls `onContinue`). `Enter` / `Space` on "Continue" dismisses. `Enter` on "View all badges →" navigates.
- Auto-dismiss at 8s: when the overlay auto-dismisses, focus returns to the element that triggered the badge unlock (e.g. the page that was active when the badge was earned). If that element is no longer available, focus returns to `<body>` or `#main-content`.
- The 12-particle burst (CSS animation, step 4) is `aria-hidden="true"` — purely decorative.
- Glow pulse animation (step 3) and shimmer (rare/legendary): both are `aria-hidden` decorative animations.
- `prefers-reduced-motion`: the entire animation sequence (steps 1–4) collapses to instant. Steps 5–6 still animate at reduced opacity (instant); the overlay appears with badge name, description, and buttons already visible. The XP reward and badge are present immediately. Auto-dismiss timer still runs.

### Responsive Behavior — *[GAP FILL]*

- `fullscreen` at all breakpoints — same dimensions as F2 `size="fullscreen"`. The badge icon, name, and description are center-aligned vertically and horizontally within the overlay.
- Badge icon size: `96px` on `xs`/`sm`; `128px` on `md+` — the icon is the hero of this moment and should feel large but not overwhelming on mobile.
- Typography scale for the badge name: `display-md` (32px) on `md+`; `display-sm` (24px) on `xs`/`sm`.
- Action buttons: stacked vertically, full-width on `xs`/`sm`; inline centered on `md+`. "Continue" is A1 Button `variant="primary"`; "View all badges →" is A1 Button `variant="ghost"`.
- The 12-particle burst radius should scale with viewport: `120px radius` on `md+`, `80px radius` on `xs`/`sm` — ensures particles don't travel off-screen on narrow viewports.

### Motion Behavior — *[verbatim from Design System §17 F5 and cross-referenced with Product Spec §11 and Design System §10]*

Tier 4 — Ambient (glow pulse, shimmer), Tier 3 — Entrance (panel + badge), Tier 2 — Transition (text/button appearance).

Full animation sequence with exact timings:

| Step | Element | Animation | Duration | Easing | Source |
|---|---|---|---|---|---|
| 1 | Dark overlay | `opacity` 0→1 | 200ms | `--ease-out` | Design System §17 F5 (verbatim); Design System §10 "Badge Unlock: overlay opacity 0→1, 200ms" (verbatim) |
| 2 | Badge icon | `scale(0→1.3→1)` + `opacity(0→1)` | 500ms | `--ease-spring` | Design System §17 F5 "Badge icon scales in with spring (500ms)" (verbatim); Design System §10 "Badge Unlock: badge icon scale 0→1.3→1, 500ms ease-spring" (verbatim) |
| 3 | Glow ring (3× pulse) | `opacity(0.5→0)` × 3 | 400ms × 3 = 1200ms total | `--ease-out` | Design System §17 F5 "Glow pulses 3× (400ms each)" (verbatim); Design System §10 "Glow pulse: 3 × (opacity 0.5→0, 400ms)" (verbatim) |
| 4 | 12 particles | Radial burst: `translateX/Y` outward + `opacity(1→0)` | 600ms | `--ease-out` | Design System §17 F5 "12 particle burst (600ms)" (verbatim); Product Spec §11 "particle burst (CSS only, 12 particles)" (verbatim) |
| 5 | Badge name + description | `opacity(0→1)` | 300ms | `--ease-out` | Design System §17 F5 "Badge name and description appear (300ms fade)" (verbatim) |
| 6 | Action buttons | `opacity(0→1)` + `translateY(8px→0)` | 250ms | `--ease-out` | Inferred: follows `fadeInUp` variant from Design System §11 Framer Motion presets |
| Shimmer (rare/epic/legendary, runs once after step 2) | Badge icon overlay | Shimmer sweep left-to-right | 600ms | `--ease-in-out` | Product Spec §19 "Rare/Legendary badges have animated shimmer effect" (verbatim) |

Total duration before auto-dismiss: approximately 2.5–3s for the full sequence to complete (steps 1–6). Steps 3 and 4 run partially overlapping. Auto-dismiss fires 8s after the overlay first opens (not after the animation ends), per verbatim spec.

`prefers-reduced-motion`:
- Steps 1–4 are instant (overlay appears with badge already at full scale, no glow, no particles)
- Steps 5–6 are instant opacity reveals
- Shimmer is suppressed entirely
- Auto-dismiss timer still runs at 8s

### Design Tokens — *[GAP FILL]*

- Overlay backdrop: `--color-bg-base` at 92% opacity — darker than the standard `--color-bg-overlay` (75%) because this is a full-screen celebratory moment; the world behind it should feel completely receded
- Badge icon size: `96px` mobile, `128px` desktop
- Badge glow radius: `--shadow-glow-xl` (`0 0 96px rgba(124,58,237,0.5)`) for common/rare/epic; for legendary, replace glow color: `rgba(251,191,36,0.5)` (matches `--color-rarity-legendary-start`)
- Badge name: `display-lg` (Space Grotesk 600 / 40px) on `md+`; `display-md` (32px) on `xs`/`sm`
- Badge description: `body-md` (Inter 400 / 16px), `--color-text-secondary`
- XP reward: `display-sm` (Space Grotesk 600 / 24px), `.gradient-text` (per Design System §10 Typography: "gradient text used sparingly: hero headline, user level, legendary badge names") — the XP reward line (e.g. "+100 XP") is one of the approved gradient-text contexts
- Particle colors: `--color-interactive-primary` for common/rare/epic; `--color-rarity-legendary-start` through `--color-rarity-legendary-end` for legendary
- Z-index: `--z-overlay` (300) backdrop; `--z-modal` (400) content panel

### Composition Examples — *[GAP FILL]*

- **Triggered from any authenticated page:** the badge unlock system is event-driven. When the server notifies the client that a badge has been earned (via Supabase Realtime or polling the notifications endpoint), the `notificationStore` queues the badge for display. F5 renders above whatever page the user is currently on, inside T1 AppLayout.
- **Post-dismiss:** "Continue" dismisses and returns to the current page. "View all badges →" navigates to `/u/[username]#badges` (the badges section of the user's profile).
- **Multiple badges earned simultaneously** (e.g. uploading a preset earns both "First Upload" and "First Download" — the download is recorded immediately): queue overlays and show them in sequence, with a brief pause between. The queue is managed in `notificationStore`. **[OPEN QUESTION → ADR-032]:** the source docs do not specify the behavior when multiple badges are earned in the same action. See ADR-032.
- **Internal composition:** A7 Skeleton (while badge data loads if there's a brief async fetch), M9 BadgeChip (the badge icon/rarity token treatment is shared), A1 Button (action buttons).

---

## F6 — Confirmation Dialog

### Purpose
*(verbatim from Design System §17)*

Prevent accidental destructive actions.

### Variants
*(verbatim — used before: Delete preset · Remove from collection · Unfollow · Account deletion)*

The Design System lists four contexts. The same component serves all of them with different copy:

| Destructive action | Copy pattern |
|---|---|
| Delete preset | See verbatim copy pattern below |
| Remove from collection | "Remove "[Preset Title]" from [Collection Name]?" + consequence + "This cannot be undone." |
| Unfollow | "Unfollow @[username]?" + brief consequence ("Their presets will no longer appear in your feed.") — lower severity; no permanent data loss |
| Account deletion | "Delete your account?" + severe consequence ("All your presets, [N] downloads, and your profile will be permanently deleted. This cannot be undone.") |

**Copy pattern** *(verbatim from Design System §17 F6):*
```
Delete "Summer Velocity Pack"?

This preset will be permanently deleted and all 
4,200 downloads will be removed from your stats.
This cannot be undone.

[Cancel]  [Delete Preset]
```

**Rule** *(verbatim):* The dangerous action button uses `danger` variant.

### Props — *[GAP FILL — not specified in source]*

```typescript
interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void                  // Cancel action — no state change
  onConfirm: () => Promise<void>       // Destructive action — async, may show loading state
  title: string                        // E.g. 'Delete "Summer Velocity Pack"?'
  description: string                  // Consequence sentence(s); plain text or minimal HTML
  confirmLabel: string                 // E.g. "Delete Preset", "Remove", "Unfollow", "Delete Account"
  cancelLabel?: string                 // Default: "Cancel"
  severity: 'danger' | 'warning'      // 'danger': red confirm button; 'warning': standard accent confirm button
                                       // Unfollow uses 'warning' (reversible); Delete uses 'danger' (irreversible)
  isConfirming?: boolean               // While onConfirm() is in progress — shows loading state on confirm button
}
```

**[OPEN QUESTION → ADR-033]:** The Design System lists "Unfollow" as a use case for F6. Unfollow is reversible (the user can follow again immediately) — it is arguably not a "destructive" action in the same category as delete. Whether F6 (a modal requiring explicit confirmation) is the right pattern for Unfollow, or whether a simpler inline toggle (the Follow button itself switching to "Unfollow" with a confirm-on-click pattern) is more appropriate, is unresolved. See ADR-033.

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Closed | Not rendered in DOM |
| Open (default) | F2 Modal `size="sm"` with title, description, and footer buttons |
| Confirming (`isConfirming: true`) | Confirm button enters A1 Button `isLoading` state (spinner, dimensions held); Cancel button is disabled (`isDisabled`); close button is disabled; `closeOnBackdropClick: false`; `closeOnEscape: false` — the action cannot be interrupted once started |
| Confirmed (success) | `onConfirm()` resolves → dialog closes via `onClose()` → F1 Toast appears confirming the action (e.g. "Preset deleted.") |
| Confirmed (error) | `onConfirm()` rejects → dialog remains open; confirm button returns to active state; F1 Toast `variant="error"` appears with the error message; user can retry or cancel |

### Accessibility — *[GAP FILL]*

- F6 is a specialized F2 Modal at `size="sm"`. It uses all of F2's ARIA structure (`role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`, focus trap, Escape, scroll lock) — F6 does not reimplement these; it is a configured instance of F2 (or a thin wrapper around F2's panel structure).
- **Initial focus on open:** focus moves to the Cancel button (the safe action), not the Confirm/danger button. This is the standard pattern for destructive confirmation dialogs per WCAG Technique G99 and the ARIA Authoring Practices Guide — users should not accidentally trigger the destructive action by pressing Enter immediately after the dialog opens.
- `aria-describedby` points to the consequence description paragraph (e.g. "This preset will be permanently deleted…"). Screen reader users hear the full consequence before activating either button.
- The "This cannot be undone." sentence is critical — it must be in the `description` field (and thus in `aria-describedby`), not hidden in the title.
- Confirm button: `<button type="button" aria-label="[confirmLabel]">` — the label is already descriptive ("Delete Preset", "Delete Account") so no additional `aria-label` is needed beyond the button's text content.
- `isConfirming` state: confirm button gets `aria-busy="true"` (not just visual spinner) and `aria-label="[confirmLabel], in progress"` so screen readers convey that the action is executing.
- When `isConfirming: true`, Cancel button `aria-disabled="true"` and close button `aria-disabled="true"` — keyboard users hear the buttons exist but are told they are currently inactive, preventing confusion about why Tab navigation seems different.
- After close (whether by Cancel or successful Confirm), focus returns to the trigger element that opened the dialog (per F2 focus management rules).

### Responsive Behavior — *[GAP FILL]*

- F6 is always `size="sm"` (480px max-width). It follows F2 Modal's responsive behavior for `size="sm"`:
  - `xs`/`sm`: bottom-sheet pattern (pending ADR-030 resolution)
  - `md+`: centered, floating, 480px max-width

**Additional note for Account Deletion:** The Account Deletion variant is the most severe. On `xs`/`sm`, it may be appropriate to require a typed confirmation (user types "DELETE" or their username to confirm) as an additional friction layer. **[OPEN QUESTION → ADR-034]:** the source docs do not specify a typed confirmation pattern for account deletion. See ADR-034.

### Motion Behavior — *[GAP FILL]*

F6 inherits all motion behavior from F2 Modal (`size="sm"`):
- Backdrop: `opacity` 0→1 at 200ms `--ease-out`
- Panel entrance (desktop): `scale(0.96→1)` + `opacity(0→1)` at 250ms `--ease-spring`
- Panel entrance (mobile): `translateY(100%→0)` at 350ms `--ease-snap`
- Panel exit (desktop): `scale(1→0.96)` + `opacity(1→0)` at 150ms `--ease-in`
- Panel exit (mobile): `translateY(0→100%)` at 250ms `--ease-in`

No additional animations within F6 beyond the standard F2 entrance/exit and A1 Button loading spinner.

`prefers-reduced-motion`: inherits F2 reduced-motion behavior (instant opacity).

### Design Tokens — *[GAP FILL]*

F6 inherits all tokens from F2 Modal. Specific additions:

- Confirm button (`severity="danger"`): A1 Button `variant="danger"` — `--color-interactive-danger` background, white text
- Confirm button (`severity="warning"`): A1 Button `variant="primary"` — standard accent
- Cancel button: A1 Button `variant="ghost"`
- Footer button order: `[Cancel]` left, `[Confirm]` right — matches the verbatim copy pattern. On `xs`/`sm` (full-width stacked), Cancel is on top (reads first), Confirm (danger) below — safer spatial arrangement for touch targets
- "This cannot be undone." sentence: `body-sm`, `--color-text-error` — the severity colour reinforces the permanence without requiring a red header or icon
- Title: `heading-xl` (Inter 600 / 20px), `--color-text-primary` — same as F2

### Composition Examples — *[GAP FILL]*

| Trigger | `severity` | `title` | `confirmLabel` |
|---|---|---|---|
| A1 Button `variant="danger"` "Delete Preset" on preset edit page | `danger` | `Delete "[Preset Title]"?` | "Delete Preset" |
| O9 Dashboard preset table row ⋯ → Delete | `danger` | `Delete "[Preset Title]"?` | "Delete Preset" |
| Bookmark → Remove from collection | `danger` | `Remove from "[Collection Name]"?` | "Remove" |
| Profile Header ⋯ → Unfollow | `warning` | `Unfollow @[username]?` | "Unfollow" |
| Settings → Account → Delete Account | `danger` | "Delete your account?" | "Delete Account" |
| T4 AdminLayout → Reject preset | `danger` | `Reject "[Preset Title]"?` | "Reject Preset" |
| T4 AdminLayout → Remove preset | `danger` | `Remove "[Preset Title]"?` | "Remove Preset" |

---

*End of Overlays & Feedback — continued in `06-compound-components.md`*
