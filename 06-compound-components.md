# PresetHub Component Library — 06. Compound Components

**Source of truth for existing specs:** `PresetHub_Design_System.md` §"COMPOUND COMPONENTS" (CC1–CC7)
**This file:** preserves those specs verbatim, appends Accessibility / Responsive / Motion / Composition where the source was silent.

---

## What Compound Components Are

Compound components are multi-part, stateful UI assemblies built from atoms and molecules already defined in `01-atoms.md` and `02-molecules.md`, but that don't reduce to a single atom or molecule themselves — they combine several interactive pieces (a field plus a suggestions panel, a canvas plus zoom controls, a toolbar plus two content panes) into one functional unit with its own internal state machine.

Six of the seven compound components (CC1–CC6) exist almost entirely to serve **O7 Upload Wizard** (`03-organisms.md`) and **O6 Profile Header** (`03-organisms.md`) — they are the actual interactive guts behind fields that O7 and O6 only reference by name. CC7 Search Results is the odd one out: it is not an Upload Wizard or Profile Header dependency, but a page-level result-listing pattern referenced by the Explore page and the Search API.

**Component IDs CC1–CC7** are inherited from Design System §"COMPOUND COMPONENTS" to keep cross-references stable. All seven are defined there at the level of Purpose + States/Behavior/Appearance only — this file fills in the remaining seven-to-eight dimensions of the standard nine-part template using only:

- Tokens defined in Design System §2–6, §14–16
- Icons defined in Design System §7
- Motion primitives defined in Design System §10–11
- A11y rules defined in Design System §13
- Breakpoints defined in Design System §9
- Data shapes defined in Product Specification §4 (Database Schema) and §12 (Upload Architecture)
- Existing atoms/molecules/organisms/overlays already documented in `01`–`05`

Where a decision isn't traceable to one of those sources, it's flagged inline as **[OPEN QUESTION]** and recorded as a new ADR in `ARCHITECTURE_DECISIONS.md` rather than invented.

---

## CC1 — Preset Upload Drop Zone

### Purpose
*(verbatim)*

Drag-and-drop area in Step 1 of upload wizard.

### Variants
*(verbatim — by state, since this component is essentially a stateful drop target)*

**States** *(verbatim):*
- Idle: Dashed border, centered instructions
- Drag over: Accent border, background shifts to `bg-accent`, instructions update
- Processing: Spinner + "Reading file..."
- Valid: Green border, file name + size
- Invalid: Red border, error message

**Anatomy** *(derived from the state list + O7 Step 1 spec: "Drop zone for XML file or QR image" + "OR paste Alight Motion link"):*
```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│         [UploadCloud]       │
│   Drop your .xml or QR      │
│   image here, or click      │
│   to browse                 │
│                              │
│   — or paste an AM link —   │
│   [______________________]  │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### Props — *[GAP FILL — not specified in source, derived from O7 UploadFormData + Product Spec §4 `presets.file_type`]*

```typescript
interface PresetUploadDropZoneProps {
  value?: {
    fileType: 'xml' | 'qr'
    file: File
  } | null
  amLink?: string                          // Populated instead of `value` when the user pastes a link
  onFileAccepted: (file: File, fileType: 'xml' | 'qr') => void
  onAmLinkChange: (link: string) => void
  onClear: () => void
  status: 'idle' | 'drag-over' | 'processing' | 'valid' | 'invalid'
  errorMessage?: string                    // Required when status="invalid"
  acceptedFileTypes?: string[]             // Default: ['.xml', 'image/png', 'image/jpeg'] (QR as image)
  maxFileSizeMb?: number                   // **[OPEN QUESTION]** — see Architecture Decisions
}
```

**[OPEN QUESTION]:** Neither the Product Specification nor the Design System states a maximum file size for the XML/QR upload, nor the accepted QR image MIME types beyond "QR code image." A `.xml` preset file is typically tiny (KBs), but no explicit ceiling is documented anywhere, including the Upload Architecture (§12) step-by-step, which only names the Supabase Storage destination, not a size limit. Recorded as a new ADR below.

### States
*(verbatim list, expanded into full visual treatment)*

| State | Border | Background | Content |
|---|---|---|---|
| Idle | `1px dashed --color-border-default` | `--color-bg-surface` | `UploadCloud` icon (Lucide), "Drop your .xml or QR image here, or click to browse," AM-link input below |
| Drag over | `2px dashed --color-interactive-primary` | `--color-bg-accent` | Instructions update to "Drop to upload" (verbatim Design System §"COMPOUND COMPONENTS" CC1: "instructions update") |
| Processing | `1px solid --color-border-default` (drag styling clears) | `--color-bg-surface` | A8 Spinner `variant="ring"` + "Reading file..." (verbatim) |
| Valid | `1px solid --color-border-success` (green) | `--color-bg-success` (subtle tint) | `CheckCircle` icon, file name + formatted size (e.g. "preset.xml · 4.2 KB"), `[✕ Remove]` ghost action |
| Invalid | `1px solid --color-border-error` (red) | `--color-bg-error` (subtle tint) | `XCircle` icon, inline error message (e.g. "File must be .xml or an image (QR code)."), `[Try again]` ghost action |

**AM-link path:** when the user types into the "paste an AM link" field instead of dropping a file, the drop-zone visual area itself stays in `idle` styling (it isn't a drag target for text input) while the link input below it gets A2 Input's own `default`/`error` states. Per Product Spec §4 `presets.file_type`, only one of `fileType="xml"`, `fileType="qr"`, or `amLink` populates `file_url`/`am_link` — entering a link should visually disable (not hide) the drop zone above it, and vice versa, since a preset has exactly one file-delivery mechanism, never two.

### Accessibility — *[GAP FILL]*

- The drop zone renders as a `<div role="button" tabIndex={0} aria-label="Upload preset file. Drag and drop, or press Enter to browse.">` so keyboard users can activate the native file picker via Enter/Space, in addition to the visible "click to browse" affordance.
- A visually-hidden `<input type="file" accept={acceptedFileTypes} aria-hidden="false">` backs the drop zone — drag-and-drop is a progressive enhancement over this native input, never a replacement for it, so keyboard-only and assistive-tech users always have a working file picker.
- State changes (Processing → Valid / Invalid) are announced via a polite live region scoped to the drop zone: `<div aria-live="polite" className="sr-only">` updated with "Reading file…", "preset.xml uploaded successfully," or the error message — mirroring A7 Skeleton's container-level live-region pattern (`01-atoms.md` A7 Accessibility) rather than announcing per visual element.
- The `invalid` state's error message is connected via `aria-describedby` on the drop zone's root element, per Design System §13's general error-association pattern for form fields (same convention as A2 Input's `error` prop).
- `[✕ Remove]` (valid state) and `[Try again]` (invalid state) are real `<button type="button">` elements with explicit labels — not the drop zone container itself being re-clickable for these recovery actions, since a sighted user's instinct to "click the file name to remove it" is not reliable for screen reader or keyboard users.
- The AM-link input (A2 Input, `variant="default"`) carries its own label ("Or paste an Alight Motion link") — not a placeholder-only field, per Design System §13's general rule that placeholder text is not an accessible label substitute.

### Responsive Behavior — *[GAP FILL]*

- Per O7 Upload Wizard's single-column, `max-width: 640px` (`--max-w-upload`) container (`03-organisms.md` O7 Responsive Behavior), CC1 always renders at the container's full width — there is no breakpoint-specific layout change to the drop zone itself.
- Minimum height: `160px` at all breakpoints — tall enough to be a comfortable touch/drop target on mobile, where drag-and-drop from the OS file system is less common than tap-to-browse.
- On touch devices, "Drop your .xml or QR image here" instruction text is misleading (no drag-and-drop gesture exists on most mobile browsers for local files) — copy should conditionally read "Tap to upload your .xml or QR image" when a touch-primary input is detected (`pointer: coarse` media feature), rather than always showing desktop-oriented drag language. **[OPEN QUESTION]** — recorded below, since neither source doc addresses touch-specific copy for this component.

### Motion Behavior — *[GAP FILL]*

Tier 1 — Feedback (drag-over border/background) / Tier 2 — Transition (state change).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Idle → Drag over | `border-color`, `background-color` | `--dur-fast` (150ms) | `--ease-out` |
| Drag over → Idle (drag leaves without drop) | `border-color`, `background-color` reverse | `--dur-fast` (150ms) | `--ease-out` |
| → Processing | Spinner fades in (`opacity` 0→1) replacing the drop-zone icon | `--dur-fast` (150ms) | `--ease-in-out` |
| Processing → Valid / Invalid | Border + background color crossfade, file-info or error content fades in | `--dur-normal` (250ms) | `--ease-out` |
| Invalid shake (on rejected file) | `translateX` micro-shake, `0 → -4px → 4px → 0` | `--dur-fast` (150ms) | `--ease-out` |

`prefers-reduced-motion`: the invalid-state shake is suppressed entirely (decorative emphasis, not state-communicating — the red border + icon + message already convey the error); all color-state transitions collapse to instant per the universal reduced-motion rule (Design System §13).

### Design Tokens — *[GAP FILL]*

- Border: `--color-border-default` (idle), `--color-interactive-primary` (drag-over), `--color-border-success` (valid), `--color-border-error` (invalid)
- Background: `--color-bg-surface` (idle/processing), `--color-bg-accent` (drag-over), `--color-bg-success` (valid), `--color-bg-error` (invalid)
- Radius: `--radius-lg` (12px), matching other large surface containers
- Icon: `icon-lg` (24px) — `UploadCloud` (idle/drag-over), `CheckCircle` (valid, `--color-text-success`), `XCircle` (invalid, `--color-text-error`)
- Instruction text: `body-md`, `--color-text-secondary`
- File name (valid state): `body-sm`, `--color-text-primary`; file size: `body-xs`, `--color-text-tertiary`
- Error message (invalid state): `body-sm`, `--color-text-error`
- Spinner: per A8 Spinner tokens, `variant="ring"`, `color="accent"`

### Composition Examples — *[GAP FILL]*

- **O7 Upload Wizard, Step 1:** the primary file-input mechanism for the preset's deliverable, per O7's spec ("Drop zone for XML file or QR image (CC1 Preset Upload Drop Zone)") and Composition Examples ("CC1 Preset Upload Drop Zone (Step 1)").
- **A8 Spinner:** nested during the `processing` state, per A8's own Composition Examples reference (`01-atoms.md` A8: "any drop-zone or file-processing context" is implied by its general-purpose role, used explicitly here).
- **A2 Input:** the AM-link alternate path reuses A2 Input `variant="default"`, not a CC1-specific text field — CC1 owns the drop target and delegates plain text entry to the existing atom rather than reimplementing it.

---

## CC2 — Tag Input

### Purpose
*(verbatim)*

Multi-tag entry with suggestions.

### Variants
*(verbatim — by behavior, since this component has no visual variants, only a single canonical pattern)*

**Behavior** *(verbatim):*
- Type and press Enter or comma to add tag
- Shows suggestions dropdown from existing tags
- Each tag appears as a chip with × remove button
- Max tags enforced with counter display

**Anatomy** *(derived from the behavior list + A6 Tag's existing chip treatment, referenced by O7 Step 2: "Tags (A6 Tag via CC2 Tag Input, max 10)"):*
```
┌──────────────────────────────────────┐
│ [velocity ×] [smooth ×] [fast cut ×]  │
│ type to add...               3 / 10  │
├──────────────────────────────────────┤
│ Suggestions: ▾ vhs   ▾ slowmo  ▾ glow │ ← dropdown, filtered as user types
└──────────────────────────────────────┘
```

### Props — *[GAP FILL — not specified in source, derived from anatomy + Product Spec §4 `presets.tags`]*

```typescript
interface TagInputProps {
  value: string[]                          // Current tags, max 10
  onChange: (tags: string[]) => void
  suggestions?: string[]                   // Existing platform tags, filtered live against current input
  onSuggestionsQuery?: (query: string) => void  // Debounced fetch as the user types, if suggestions are server-sourced
  maxTags?: number                         // Default: 10, per Product Spec §6.5 "Tags (tag input, max 10)"
  placeholder?: string                     // Default: "Type to add..."
  error?: string                           // E.g. "Maximum 10 tags"
}
```

**[OPEN QUESTION]:** The Product Specification's `presets` table (§4) defines **two** separate array columns — `tags text[]` and `style text[]` ("multi-tag style array") — but every page-level and component-level spec (Upload Wizard §6.5, Design System CC2, this library's O7 cross-reference) describes only a single tag-entry control, capped at 10. It's unclear whether `style` is: (a) a second, currently-undocumented Tag-Input-like field the Upload Wizard is missing entirely, (b) a deprecated/legacy column no longer driven by any UI, or (c) a column CC2 is meant to silently dual-write to under the hood (e.g. splitting freeform tags into "style" tags vs. general tags via some heuristic). This component's props contract above assumes CC2 only ever writes to `tags`, leaving `style` unaddressed — recorded as a new ADR below, since the answer affects the Upload Wizard's Step 2 field list, not just this component's internals.

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Empty | Placeholder text only ("Type to add..."), counter shows `0 / 10` |
| Typing (below max) | Text input active, suggestions dropdown opens beneath if `suggestions` match the current query (case-insensitive substring match, per the anatomy diagram's filtered list) |
| Tag added (Enter / comma) | New A6 Tag chip appears at the end of the chip row; input clears; counter increments |
| At max (`value.length === maxTags`) | Text input becomes disabled (`isDisabled`-style treatment, not removed), counter shows `10 / 10` in `--color-text-warning`, typing further has no effect until a tag is removed |
| Duplicate tag attempted | Input shake (shares CC1's invalid-shake motion token) momentarily; no new chip added; existing chip briefly highlights to indicate "already added" |
| Suggestion selected (click/Enter on dropdown item) | Behaves identically to typing the suggestion's full text and pressing Enter — adds the chip, clears input, closes dropdown |
| Chip remove (`×` click) | Chip removed from the row with an exit animation; counter decrements; if the input was disabled at max, it re-enables |
| Error (e.g. attempted to exceed max via paste of comma-separated text) | `error` prop populated, e.g. "Maximum 10 tags" — rendered below the chip row like A2 Input's `hint`/`error` slot |

### Accessibility — *[GAP FILL]*

- The chip row + text input together form a single `<div role="group" aria-label="Tags">`. Each chip is `<span>` containing the tag text plus a nested `<button aria-label="Remove tag: [tag name]" type="button">` for the `×` — following the same nested-interactive pattern used by M1 PresetCard's stat-row icon buttons (`02-molecules.md` M1 Accessibility), so the chip's text isn't itself a click target that could be confused with the remove action.
- The text input has an associated `<label>` ("Tags") that is visually present above the whole component (per A2 Input's general labeling convention), not just a placeholder — placeholder text ("Type to add...") supplements but never replaces the label.
- The suggestions dropdown follows F3 Dropdown Menu's keyboard pattern (`05-overlays-feedback.md` F3 Accessibility): `ArrowDown`/`ArrowUp` move through suggestions, `Enter` selects the highlighted suggestion (or, if none is highlighted, adds the literal typed text as a new tag), `Escape` closes the dropdown without adding a tag and returns focus to the text input.
- The live tag counter (`3 / 10`) is connected to the input via `aria-describedby`, so screen reader users hear the remaining capacity without needing to count visible chips.
- When the max is reached, the disabled input state is announced: `aria-disabled="true"` plus an `aria-live="polite"` update ("Maximum 10 tags reached") fired once, not on every subsequent keystroke attempt — repeating the announcement on every blocked keypress would be noisy.
- Removing a chip moves focus back to the text input (not to the next/previous chip's remove button), so a screen reader or keyboard user can immediately continue typing — consistent with the general principle that destructive/removal actions shouldn't leave focus stranded (same rationale as F2 Modal's focus-return-to-trigger rule, `05-overlays-feedback.md` F2 Accessibility, applied here at the micro-interaction level).

### Responsive Behavior — *[GAP FILL]*

- Chip row wraps naturally (`flex-wrap: wrap`) at all breakpoints — no breakpoint-specific layout change, since the component already handles overflow via wrapping rather than horizontal scroll or truncation.
- On `xs`/`sm`, the suggestions dropdown should render as a simple inline panel directly beneath the input (full component width) rather than F3 Dropdown Menu's floating/anchored positioning — there is no off-screen risk to mitigate at full container width, so the `flip`/anchor logic F3 needs for icon-trigger menus (`05-overlays-feedback.md` F3 Responsive Behavior) isn't necessary here.
- Touch keyboards: the "Enter" key on most mobile soft keyboards submits a form by default rather than firing a `keydown` for "Enter" in the way desktop expects. CC2 must call `event.preventDefault()` on the underlying `<input>`'s `keydown`/`submit` handling so mobile users can add tags without accidentally submitting the surrounding O7 Upload Wizard step. **[OPEN QUESTION]** — neither source doc addresses mobile soft-keyboard "Enter" behavior; flagged as an implementation risk rather than a design ambiguity, so not escalated to a formal ADR.

### Motion Behavior — *[GAP FILL]*

Tier 1 — Feedback.

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Tag chip add | `scale(0.9→1)` + `opacity(0→1)` | `--dur-fast` (150ms) | `--ease-spring-sm` |
| Tag chip remove | `scale(1→0.9)` + `opacity(1→0)`, row reflows | `--dur-fast` (150ms) | `--ease-in` |
| Duplicate-tag shake | `translateX` micro-shake on the input, `0 → -4px → 4px → 0` | `--dur-fast` (150ms) | `--ease-out` (shares CC1's invalid-shake pattern) |
| Suggestions dropdown open/close | Inherits F3 Dropdown Menu's `scale(0.95→1)` + `opacity` open / `scale(1→0.95)` + `opacity` close | `--dur-normal` (250ms) open / `--dur-fast` (150ms) close | `--ease-spring` open / `--ease-in` close |

`prefers-reduced-motion`: chip add/remove collapse to instant `opacity` only (no `scale`); the duplicate-tag shake is suppressed entirely, consistent with CC1's reduced-motion treatment of the same shake pattern.

### Design Tokens — *[GAP FILL]*

- Container border: `--color-border-default` (default), `--color-interactive-primary` (focus-within)
- Container radius: `--radius-md` (8px), matching A2 Input
- Container padding: `--space-2` (8px)
- Chip: reuses A6 Tag's existing tokens in full (`01-atoms.md` A6 Design Tokens) — CC2 does not introduce a new chip style, only the removable `×` affordance on top of the existing Tag visual
- Counter text: `body-xs`, `--color-text-tertiary` (default), `--color-text-warning` (at max)
- Suggestions dropdown: inherits F3 Dropdown Menu's panel tokens in full (`--color-bg-elevated` background, `--shadow-dropdown`, `--radius-lg`)

### Composition Examples — *[GAP FILL]*

- **O7 Upload Wizard, Step 2:** the sole consumer, per O7's spec ("Tags (A6 Tag via CC2 Tag Input, max 10)") and Composition Examples ("CC2 Tag Input (Step 2)"). `suggestions` would plausibly be sourced from a platform-wide distinct-tags query, though no such endpoint is named in Product Spec §16 API Reference — **[OPEN QUESTION]**, recorded below, since "existing tags" (verbatim CC2 purpose) implies a data source this component depends on but that isn't specified anywhere.
- **A6 Tag:** every chip rendered inside CC2 is an A6 Tag instance with an added remove button — CC2 is additive to A6, not a replacement for it.
- **F3 Dropdown Menu:** the suggestions panel reuses F3's visual and motion language (not its exact component, since F3 is trigger-anchored and CC2's suggestions are input-anchored, but the same panel styling).

---

## CC3 — Category Picker

### Purpose
*(verbatim)*

Select a preset category.

### Variants
*(verbatim — appearance, single pattern)*

**Appearance** *(verbatim)*:

```
[Zap]     [Arrow]   [Palette]  [Sparkles]
Velocity  Transition  Color      Anime

[Gamepad] [Music]   [Box]      [More...]
Gaming    Lyric      3D         Other
```

Each item has icon + label. Selected item: accent background.

### Props — *[GAP FILL — not specified in source, derived from anatomy + Product Spec §4 `presets.category` and §9 Category Colors]*

```typescript
type CategoryKey = 'velocity' | 'transition' | 'color' | 'anime' | 'gaming' | 'lyric' | '3d' | 'other'

interface CategoryPickerProps {
  value?: CategoryKey
  onChange: (category: CategoryKey) => void
  error?: string                           // E.g. "Please select a category" if submitted empty
}

// Static, not passed as a prop — the 8 categories, their icons, and colors
// are a fixed platform-wide set per Product Spec §9 "Category Colors":
const CATEGORY_CONFIG: Record<CategoryKey, { icon: LucideIcon; label: string; color: string }> = {
  velocity:   { icon: Zap,       label: 'Velocity',   color: '#F87171' },
  transition: { icon: ArrowRight,label: 'Transition', color: '#60A5FA' },
  color:      { icon: Palette,   label: 'Color',       color: '#4ADE80' },
  anime:      { icon: Sparkles,  label: 'Anime',       color: '#F472B6' },
  gaming:     { icon: Gamepad2,  label: 'Gaming',      color: '#34D399' },
  lyric:      { icon: Music,     label: 'Lyric',       color: '#FBBF24' },
  '3d':       { icon: Box,       label: '3D',          color: '#A78BFA' },
  other:      { icon: MoreHorizontal, label: 'Other',  color: '#94A3B8' },
}
```

**[OPEN QUESTION]:** The anatomy diagram's 8th tile reads "More..." with label "Other," which is ambiguous between two different UI patterns: (a) "Other" is simply the 8th and final fixed category (matching Product Spec §9's 8-color list exactly, where "other" is itself a real `CategoryKey` value), or (b) "More..." is a meta-action that expands to reveal additional categories beyond a base 7, with "Other" being one of several hidden options. Product Spec §9 Category Colors lists exactly 8 named values including `other` — which supports reading (a) — but the anatomy's "More..." label (rather than just "Other" with the same `Box`/icon-and-label treatment as every other tile) suggests the component's original author may have intended an expandable affordance. This documentation assumes (a): "Other" is a normal, 8th, always-visible category tile, and "More..." is incidental wording in the anatomy diagram rather than a distinct interaction — but this should be confirmed.

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Default (unselected tile) | Icon `--color-text-secondary`, label `--color-text-secondary`, background `--color-bg-surface`, border `--color-border-subtle` |
| Hover | Background `--color-bg-elevated`, border `--color-border-default` |
| Selected | Background tinted with the category's own color at 15% opacity (matching A5 Badge's `rarity`/`category` treatment pattern, `01-atoms.md` A5), icon + label rendered in the category's full-strength color, `2px` border in the same color |
| Focus (keyboard) | `--shadow-focus` ring on the focused tile, in addition to any hover/selected treatment |
| Error (no category selected on attempted advance) | All 8 tiles get a subtle `--color-border-error` outline collectively, plus `error` message below the grid — mirrors O7 Upload Wizard's general "scroll to first error on attempted advance" rule (`03-organisms.md` O7 States) |

### Accessibility — *[GAP FILL]*

- The grid renders as `<div role="radiogroup" aria-label="Category">`, with each tile as `<button role="radio" aria-checked={isSelected} type="button">` — category selection is single-choice, mutually exclusive, which is exactly what the ARIA `radiogroup`/`radio` pattern models, rather than `role="listbox"`/`option` (which implies a different, list-style selection convention) or a bare set of toggle buttons (which would not communicate mutual exclusivity to screen readers).
- Each tile's accessible name is the label text only ("Velocity," "Transition," etc.) — the icon is `aria-hidden="true"`, matching the icon-decorates-text convention used throughout this library (e.g. A1 Button, M1 PresetCard stat row).
- Keyboard navigation follows the native `radiogroup` pattern: `ArrowRight`/`ArrowDown` move to the next tile and select it immediately (radio-group semantics select on arrow-key movement, not just on Enter/Space — this matches native `<input type="radio">` behavior that screen reader users expect); `ArrowLeft`/`ArrowUp` move to the previous tile. `Tab` moves focus into and out of the group as a single stop (focus lands on the currently-selected tile, or the first tile if none is selected yet), not through all 8 tiles individually.
- The grid's `2×4` layout order (per the anatomy diagram: Velocity, Transition, Color, Anime / Gaming, Lyric, 3D, Other) is also the DOM order and the arrow-key traversal order — visual and logical order match, so no `aria-flowto` or other order-override is needed.
- If submitted with no category selected, the `error` message is connected to the radiogroup via `aria-describedby`, and focus moves to the radiogroup itself (the first tile) on validation failure, consistent with O7's general "scroll to first error" accessibility rule.

### Responsive Behavior — *[GAP FILL]*

Per the anatomy diagram's fixed `4-column × 2-row` grid and O7 Upload Wizard's single-column `640px`-max container:

| Breakpoint | Grid columns | Tile size |
|---|---|---|
| `xs`/`sm` (<768px) | 2 | Larger tap targets (~140px wide) to suit the narrower 640px-max (often full-viewport on mobile) container |
| `md`+ (≥768px) | 4 | As drawn in the anatomy diagram (~150px wide within the 640px container) |

- The 2-column mobile fallback keeps each tile's hit area generous on small touch screens rather than cramming 4 narrow columns into a sub-400px viewport — this is an inferred responsive rule, since neither source doc states a mobile column count for CC3 specifically. **[OPEN QUESTION]** — recorded below alongside related Upload Wizard field responsive gaps.
- Tile icon size and label typography do not scale across breakpoints — only the grid's column count changes.

### Motion Behavior — *[GAP FILL]*

Tier 1 — Feedback.

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Tile hover | `background-color`, `border-color` | `--dur-fast` (150ms) | `--ease-out` |
| Tile select | `background-color` (to category tint) + `border-color` + icon/label color | `--dur-fast` (150ms) | `--ease-out` |
| Tile press (active) | `scale(0.97)` momentary, matching A1 Button's press convention (`01-atoms.md` A1 Motion Behavior) | `--dur-instant` (50ms) | `--ease-out` |
| Selection indicator (if a checkmark or border-thickness change accompanies the color shift) | `opacity` 0→1 | `--dur-fast` (150ms) | `--ease-out` |

`prefers-reduced-motion`: color and scale transitions collapse to instant per the universal rule; selection state itself is unaffected (just rendered without animated interpolation).

### Design Tokens — *[GAP FILL]*

- Tile background: `--color-bg-surface` (default), `--color-bg-elevated` (hover), category color @ 15% opacity (selected) — same opacity convention as A5 Badge's `rarity`/category treatments (`01-atoms.md` A5 Variants)
- Tile border: `--color-border-subtle` (default), `--color-border-default` (hover), category color at full strength, `2px` (selected)
- Tile radius: `--radius-md` (8px)
- Icon size: `icon-lg` (24px), category color at full strength when selected, `--color-text-secondary` otherwise
- Label: `label-sm`, category color at full strength when selected, `--color-text-secondary` otherwise
- Category colors: the 8 values are pulled verbatim from Product Spec §9 "Category Colors" (`#F87171` velocity, `#60A5FA` transition, `#4ADE80` color, `#F472B6` anime, `#34D399` gaming, `#FBBF24` lyric, `#A78BFA` 3d, `#94A3B8` other) — these are the same raw values A5 Badge's category variant already references (`01-atoms.md` A5 Design Tokens), so CC3 introduces no new color tokens, only reuses the existing category palette.

### Composition Examples — *[GAP FILL]*

- **O7 Upload Wizard, Step 2:** the sole consumer, per O7's spec ("Category (required, CC3 Category Picker)") and Composition Examples ("CC3 Category Picker (Step 2)").
- **A5 Badge category variant:** once a preset is published, its chosen category renders elsewhere in the product (M1 PresetCard's category badge, the Explore page's filter pills) via A5 Badge — CC3 is the input-time equivalent of the same 8-category taxonomy A5 displays read-only.
- **CC7 Search Results / Explore filter bar:** the Explore page's category filter pills (Product Spec §6.7: "All · Velocity · Transition · Color · Anime · Gaming · Lyric · 3D") use the same 8-category set and color tokens as CC3, but as a horizontal-scroll pill row (FilterChip molecule) rather than a 2D icon grid — same taxonomy, different input pattern for a filter-vs-assignment context.

---

## CC4 — Markdown Editor

### Purpose
*(verbatim)*

Rich text entry for preset descriptions.

### Variants
*(verbatim)*

**Toolbar** *(verbatim):* Bold · Italic · Link · Unordered list · Ordered list

**Tabs** *(verbatim):* Write | Preview (live rendered markdown)

**Output** *(verbatim):* Stored as markdown, rendered via `react-markdown` + `remark-gfm`.

**Security** *(verbatim):* Rendered markdown sanitized via DOMPurify.

**Anatomy** *(derived from the toolbar + tabs spec, cross-referenced with A3 Textarea's existing markdown note: "`description?: string // Markdown, rendered via react-markdown + DOMPurify`" in `02-molecules.md` M5 NotificationItem props)*:
```
┌──────────────────────────────────────────┐
│ [Write] [Preview]                          │
├──────────────────────────────────────────┤
│ [B] [I] [🔗] [• List] [1. List]            │
├──────────────────────────────────────────┤
│                                            │
│  (A3 Textarea — markdown source)          │
│                                            │
├──────────────────────────────────────────┤
│ 0 / 2000                                  │
└──────────────────────────────────────────┘
```

### Props — *[GAP FILL — not specified in source, derived from anatomy + Product Spec §4 `presets.description` (markdown, max 2000 chars)]*

```typescript
interface MarkdownEditorProps {
  value: string                            // Raw markdown source, max 2000 chars per Product Spec §4
  onChange: (markdown: string) => void
  maxLength?: number                       // Default: 2000, per Product Spec §4 presets.description
  placeholder?: string                     // Default: "Describe your preset... (markdown supported)"
  activeTab?: 'write' | 'preview'          // Default: 'write'
  onTabChange?: (tab: 'write' | 'preview') => void
  error?: string
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Write tab active (default) | Toolbar + A3 Textarea visible; Preview tab inactive styling |
| Preview tab active | Toolbar hidden (formatting buttons have no function over rendered output); sanitized, rendered markdown shown in a read-only content area styled with the same `body-md` prose tokens used for M4 CommentItem bodies (`02-molecules.md` M4 Design Tokens) |
| Toolbar button click (Write tab only) | Wraps the current text-selection in the corresponding markdown syntax (e.g. selecting text + clicking Bold wraps it in `**...**`) and returns focus to the textarea at the new cursor position — standard rich-text-toolbar-over-plaintext behavior |
| Empty | Placeholder text shown in A3 Textarea; character counter shows `0 / 2000` |
| Near limit (e.g. ≥ 1800/2000) | Counter color shifts to `--color-text-warning`, matching the general "approaching limit" convention implied by A2 Input/A3 Textarea's character-counter pattern (`01-atoms.md` A2/A3) |
| At limit | Counter shows `2000 / 2000` in `--color-text-error`; further typing is blocked (input truncates at 2000, doesn't silently drop characters being typed mid-string) |
| Preview with empty source | Preview tab shows a muted placeholder ("Nothing to preview yet") rather than a blank area, so switching tabs on an empty draft isn't confusing |
| Preview render error (malformed markdown that `react-markdown` can't parse — rare, since markdown degrades gracefully by design) | Falls back to showing the raw text as plain text rather than a broken render or error message — consistent with M10 VideoPlayer's "silent degradation" philosophy for non-critical render failures (`02-molecules.md` M10 States) |

### Accessibility — *[GAP FILL]*

- Write/Preview tabs follow the standard ARIA tabs pattern: `<div role="tablist" aria-label="Description editor mode">`, each tab `<button role="tab" aria-selected={isActive} aria-controls="panel-[write|preview]">`, each panel `<div role="tabpanel" id="panel-[write|preview]">`. `ArrowLeft`/`ArrowRight` move between tabs; activation follows the "automatic" tabs convention (moving focus to a tab also activates it), since switching between Write and Preview has no destructive consequence worth gating behind a separate activation step.
- Toolbar buttons (Bold, Italic, Link, lists) are `<button type="button" aria-label="Bold">` etc. — icon-only buttons, following A1 Button's icon-button rule that `aria-label` is required (`01-atoms.md` A1 Accessibility).
- The toolbar operates on the textarea's current text selection. If no text is selected when a toolbar button is pressed, the corresponding markdown syntax is inserted at the cursor position as an empty wrapper (e.g. `**|**` with cursor placed between the asterisks) so keyboard-only users aren't required to make a mouse-drag selection to use the toolbar at all.
- The underlying text-entry element is a standard A3 Textarea, inheriting its accessibility treatment in full (`01-atoms.md` A3 Accessibility) — label, character-counter `aria-describedby`, and error association all apply unchanged.
- The Preview panel's rendered markdown is real semantic HTML (`<strong>`, `<em>`, `<a>`, `<ul>`/`<ol>`) produced by `react-markdown` — not an `dangerouslySetInnerHTML` dump of unstructured text — so headings, lists, and links remain navigable by screen reader the same way they would on the published preset page where this same markdown renders.
- Links inserted via the toolbar's Link button must produce `<a href="..." rel="noopener noreferrer">` in the rendered Preview and final published output — per general web security practice for user-generated link content, reinforced by this component's own "Security: sanitized via DOMPurify" verbatim note.

### Responsive Behavior — *[GAP FILL]*

- Toolbar buttons remain a single horizontal row at all breakpoints — 5 icon buttons (Bold, Italic, Link, 2 list types) comfortably fit even at `xs` widths within the 640px-max Upload Wizard container; no overflow/wrapping behavior is needed.
- A3 Textarea's own responsive sizing rules apply unchanged (`01-atoms.md` A3 Responsive Behavior) — height/min-height does not change by breakpoint, only by content (auto-grow, if A3 supports it) or a fixed row count.
- On `xs`/`sm`, toolbar buttons should meet the same 40×40px minimum touch-target size as A1 Button's icon variant (`01-atoms.md` A1 Accessibility "Minimum hit target 40×40px"), even though the visible icon is smaller — invisible padding extends the hit area, consistent with that existing rule.

### Motion Behavior — *[GAP FILL]*

Tier 2 — Transition.

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Write ↔ Preview tab switch | `opacity` crossfade between the two panels (textarea fades out, rendered preview fades in, or vice versa) | `--dur-normal` (250ms) | `--ease-in-out` |
| Toolbar button press | `scale(0.95)` momentary, matching A1 Button icon-variant press convention | `--dur-instant` (50ms) | `--ease-out` |
| Character counter color shift (approaching/at limit) | `color` | `--dur-fast` (150ms) | `--ease-out` |

`prefers-reduced-motion`: tab-switch crossfade collapses to an instant panel swap; all other transitions collapse per the universal rule.

### Design Tokens — *[GAP FILL]*

- Tab bar: reuses the same underline/active-indicator convention as other tabbed UI in the system — active tab `--color-text-accent` with a `2px` bottom border in `--color-interactive-primary`; inactive tab `--color-text-secondary`
- Toolbar background: `--color-bg-elevated`, separated from the textarea below by a `1px solid --color-border-subtle` divider (A9 Divider's `horizontal` variant, per `01-atoms.md` A9 Composition Examples' general role of separating UI sections)
- Toolbar button: icon `icon-sm` (16px), `--color-text-secondary` default / `--color-text-primary` hover — matches F3 Dropdown Menu item icon sizing for visual consistency across small inline icon buttons (`05-overlays-feedback.md` F3 Design Tokens)
- Textarea: inherits A3 Textarea tokens unchanged
- Preview panel: `body-md` prose styling — paragraph `--color-text-primary`, links `--color-text-accent` with underline, list markers `--color-text-secondary`, matching the typographic scale used in M4 CommentItem bodies
- Character counter: `body-xs`, `--color-text-tertiary` (default) / `--color-text-warning` (near limit) / `--color-text-error` (at limit)

### Composition Examples — *[GAP FILL]*

- **O7 Upload Wizard, Step 2:** the sole consumer, per O7's spec ("Description (markdown, optional, CC4 Markdown Editor with live preview)") and Composition Examples ("CC4 Markdown Editor (Step 2)"). `value` maps directly to `UploadFormData.description` and ultimately `presets.description`.
- **Preset Page (O5 Preset Detail):** the markdown a creator writes in CC4 is what eventually renders, via the same `react-markdown` + `remark-gfm` + DOMPurify pipeline, in the preset's public description area — CC4's Preview tab is a true 1:1 preview of that final rendering, not an approximation.
- **A3 Textarea:** CC4 wraps a single A3 Textarea instance for the Write-mode source input; CC4 owns the toolbar, tabs, and character counter as compound behavior layered on top.

---

## CC5 — Image Cropper

### Purpose
*(verbatim)*

Enforce 4:3 ratio for thumbnails.

### Variants
*(verbatim — features list, single pattern)*

**Features** *(verbatim):*
- Drag to reposition
- Pinch or scroll to zoom
- Real-time preview at target dimensions
- Submit crops to Cloudinary for server-side final crop

**Anatomy** *(derived from the features list + F2 Modal's `fullscreen` size, which Design System §17 F2 explicitly names this component as an example of: "Immersive content — image cropper (CC5)"):*
```
┌──────────────────────────────────────────┐
│  Crop Thumbnail                  [✕]      │
├──────────────────────────────────────────┤
│                                            │
│        ┌──────────────────┐               │
│        │                  │  ← 4:3 crop   │
│        │   (source image, │     frame,    │
│        │    draggable)    │     fixed     │
│        │                  │     aspect    │
│        └──────────────────┘               │
│                                            │
│   [−] ──────●────── [+]    ← zoom slider  │
│                                            │
│   Preview:  [ small 4:3 thumb ]            │
│                                            │
│              [Cancel]  [Apply Crop]        │
└──────────────────────────────────────────┘
```

### Props — *[GAP FILL — not specified in source, derived from anatomy + Product Spec §12 Upload Architecture / Cloudinary Transformations]*

```typescript
interface ImageCropperProps {
  isOpen: boolean
  onClose: () => void
  sourceImageUrl: string                   // Local object URL or already-uploaded source image
  aspectRatio?: number                     // Default: 4 / 3, per Product Spec §9 "cropped to 4:3"
  minZoom?: number                         // Default: 1 (fit-to-frame)
  maxZoom?: number                         // Default: 3
  onApply: (cropData: CropData) => void
  isSubmitting?: boolean                   // While the crop is being sent to Cloudinary for server-side final crop
}

interface CropData {
  x: number                                // Crop frame offset, in source-image pixel coordinates
  y: number
  zoom: number
  // The client sends these coordinates (or an already-cropped canvas export) to the signed
  // Cloudinary upload endpoint; Cloudinary performs the authoritative final crop server-side
  // per Product Spec §12 Cloudinary Transformations (w_800,h_600,c_fill).
}
```

**[OPEN QUESTION]:** Neither source doc specifies the exact handoff format between the client-side crop interaction and the server-side Cloudinary transform. Product Spec §12 "Cloudinary Transformations" shows fixed transform strings (`/upload/w_800,h_600,c_fill,q_auto,f_webp/{public_id}`) applied to whatever image was uploaded — but `c_fill` is Cloudinary's own automatic center-weighted crop, which doesn't obviously consume an arbitrary client-chosen `(x, y, zoom)` crop region. It's unclear whether CC5 (a) uploads the raw source image and sends crop coordinates as a separate metadata field for a custom server-side transform, (b) renders the crop client-side onto a canvas and uploads only the already-cropped result (in which case Cloudinary's `c_fill` is just a safety-net resize, not the "real" crop), or (c) something else. This affects whether `CropData` above is the right shape at all. Recorded as a new ADR below.

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Open (default) | F2 Modal `size="fullscreen"`, source image loaded and centered within the 4:3 crop frame at `zoom: 1` (fit-to-frame) |
| Dragging | Source image translates under the cursor/finger within the crop frame's bounds; image cannot be dragged so far that the crop frame would show empty space beyond the image edges (standard clamp-to-bounds behavior) |
| Zooming (scroll/pinch/slider) | Source image scales around the crop frame's center; `minZoom`–`maxZoom` clamps prevent zooming out past fit-to-frame or zooming in so far the image becomes unacceptably pixelated — **[OPEN QUESTION]**, neither doc specifies the actual `maxZoom` ceiling; `3` above is a reasonable assumed default, not a confirmed value, recorded below |
| Submitting (`isSubmitting: true`) | "Apply Crop" button enters A1 Button `isLoading` state; Cancel disabled; drag/zoom interactions disabled — mirrors O7 Upload Wizard's "Publishing" state pattern (form fields disabled during an in-flight async submission) |
| Error (crop submission fails) | F1 Toast `variant="error"` appears (e.g. "Couldn't process image. Try again."); modal remains open so the user doesn't lose their crop position and can retry |
| Applied (success) | Modal closes via `onClose()`; the resulting cropped thumbnail URL populates `UploadFormData.thumbnailUrl` in O7 Upload Wizard, and the small Preview thumbnail shown inside CC5 itself is what the user sees reflected in O7 Step 1's thumbnail slot |

### Accessibility — *[GAP FILL]*

- CC5 is an F2 Modal instance at `size="fullscreen"` — it inherits F2's full ARIA dialog structure (`role="dialog"`, `aria-modal`, focus trap, Escape-to-close unless an upload is in-flight) verbatim (`05-overlays-feedback.md` F2 Accessibility), the same way F6 Confirmation Dialog is a configured F2 instance rather than a reimplementation.
- The core drag-to-reposition and pinch/scroll-to-zoom interactions are inherently pointer/gesture-based and have no fully equivalent keyboard interaction model in most cropper implementations. To meet WCAG 2.1 keyboard-operability requirements, CC5 must provide keyboard alternatives: with the crop frame focused, `ArrowUp/Down/Left/Right` nudge the image position by a fixed increment (e.g. 8px per press, larger with Shift held), and `+`/`-` keys (or a focusable zoom slider, which is itself a native `<input type="range">` and therefore keyboard-operable by default) adjust zoom. The zoom slider drawn in the anatomy diagram should be a real `<input type="range" aria-label="Zoom">`, not a custom drag-only control, specifically so it's keyboard- and screen-reader-operable without any additional custom logic.
- The small live Preview thumbnail should have an `aria-live="polite"` wrapper announcing only once when the crop changes meaningfully (not on every pixel of drag movement, which would flood a screen reader) — e.g. debounced to announce "Preview updated" after drag/zoom interaction settles, mirroring CC1's debounced-state-announcement philosophy.
- "Apply Crop" and "Cancel" follow F2 Modal's standard footer button pattern; "Apply Crop" is the modal's primary action and should be `variant="primary"`, "Cancel" `variant="ghost"` — same pairing convention as every other modal footer in this system (e.g. F6 Confirmation Dialog's Cancel/Confirm pairing, `05-overlays-feedback.md` F6 Design Tokens).
- Close button (`✕`) in the header follows F2's standard `aria-label="Close [modal title]"` pattern → `aria-label="Close Crop Thumbnail dialog"`.

### Responsive Behavior — *[GAP FILL]*

- `size="fullscreen"` is identical across all breakpoints per F2 Modal's own Responsive Behavior table (`05-overlays-feedback.md` F2: "`fullscreen` (all breakpoints) — No backdrop click-to-close; full viewport"), so CC5 has no separate mobile-vs-desktop layout split at the modal level.
- On `xs`/`sm`, the crop frame should occupy the majority of the available vertical space (the image is the primary content of a fullscreen modal), with the zoom slider and Preview thumbnail compressed into a single row beneath it rather than the more generously-spaced desktop layout implied by the anatomy diagram.
- Pinch-to-zoom (a native touch gesture) and the zoom slider both drive the same underlying `zoom` value — on touch devices, the slider remains present (for accessibility, per above) even though pinch is the primary expected interaction.
- Drag-to-reposition uses `touchmove`/`pointermove` (not `mousemove`-only) so the same interaction works identically across mouse, trackpad, and touch input without separate code paths.

### Motion Behavior — *[GAP FILL]*

Tier 1 — Feedback (drag/zoom) / Tier 2 — Transition (modal open/close, inherited from F2).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Modal open/close | Inherits F2 Modal's `fullscreen` entrance/exit (`05-overlays-feedback.md` F2 Motion Behavior) | per F2 | per F2 |
| Drag reposition | Direct 1:1 `transform: translate()` tracking pointer/touch position — no eased lag, since cropper drag must feel immediate and 1:1 with input | — (instantaneous, input-driven) | — |
| Zoom (slider or pinch) | Direct 1:1 `transform: scale()` tracking input value | — (instantaneous, input-driven) | — |
| Snap-back if dragged out of bounds | `transform` corrects to the nearest valid position | `--dur-fast` (150ms) | `--ease-out` |
| Apply → Submitting transition | "Apply Crop" button label/spinner crossfade, per A1 Button's loading-state motion (`01-atoms.md` A1 Motion Behavior) | `--dur-fast` (150ms) | `--ease-in-out` |

`prefers-reduced-motion`: drag and zoom remain 1:1 with input regardless (they are not ambient or decorative motion — they are the core interaction and must stay responsive); only the snap-back correction and modal open/close collapse to instant, per the universal rule.

### Design Tokens — *[GAP FILL]*

- Modal: inherits F2 Modal `fullscreen` tokens in full (backdrop, header, footer treatment)
- Crop frame outline: `2px solid --color-interactive-primary`, with the area outside the frame dimmed via a semi-transparent `--color-bg-overlay` mask so the to-be-cropped region is visually obvious
- Zoom slider: native `<input type="range">` styled with `--color-interactive-primary` track-fill, matching the general accent-color convention for interactive controls
- Preview thumbnail: `--radius-md` (8px), `1px solid --color-border-subtle`, sized to visually represent the 4:3 output ratio at a small scale (e.g. 120×90px)
- Footer buttons: A1 Button `variant="primary"` (Apply Crop), `variant="ghost"` (Cancel) — standard modal footer pairing

### Composition Examples — *[GAP FILL]*

- **O7 Upload Wizard, Step 1:** the sole consumer, per O7's spec ("Thumbnail upload (required, cropped to 4:3 via CC5 Image Cropper)") and Composition Examples ("CC5 Image Cropper (Step 1 thumbnail)"). Opens after the user selects a raw thumbnail image; on Apply, the cropped result populates `UploadFormData.thumbnailUrl`.
- **F2 Modal:** CC5 is a configured `size="fullscreen"` instance of F2, the same relationship F5 Badge Unlock Overlay and F6 Confirmation Dialog have to F2 at their respective sizes.
- **A1 Button:** "Apply Crop" / "Cancel" footer buttons and the loading-state pattern during submission both reuse A1 Button unchanged.

---

## CC6 — Follower / Following List

### Purpose
*(verbatim)*

Paginated list of a user's followers or following.

### Variants
*(verbatim — layout, single pattern, by mode)*

**Layout** *(verbatim):* Stack of `mini` CreatorCards, load more at bottom.

**Modes** *(derived from the Purpose statement "followers or following" + Product Spec §4 `follows` table, which is symmetric — the same list UI serves both directions):*
- `followers` — users who follow the profile being viewed
- `following` — users the profile being viewed follows

### Props — *[GAP FILL — not specified in source, derived from anatomy + Product Spec §4 `follows` table]*

```typescript
interface FollowerFollowingListProps {
  profileUsername: string                  // Whose followers/following is being shown
  mode: 'followers' | 'following'
  entries: {
    username: string
    displayName: string
    avatarUrl?: string
    bio?: string
    isVerified: boolean
    presetCount: number
    followerCount: number
    totalDownloads: number
    isFollowing?: boolean                  // Whether the *current viewer* follows this entry — drives the Follow button
  }[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  emptyStateMessage?: string                // E.g. "No followers yet." / "Not following anyone yet."
}
```

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Loading (initial) | Stack of M2 CreatorCard `variant="mini"` skeleton composites (A7 Skeleton: `variant="avatar"` `size="sm"` + `variant="text"` lines), per M2's own Loading state spec (`02-molecules.md` M2 States: "Skeleton composite: `variant="avatar"` + multiple `variant="text"` lines") |
| Loaded (default) | Vertical stack of M2 CreatorCard `variant="mini"`, one per entry |
| Loading more (`onLoadMore` in flight) | Existing entries remain visible; 2–3 additional skeleton `mini` cards append below while the next page loads, then crossfade to real content on arrival — same append-then-replace pattern used by O4 PresetGrid's infinite-scroll loading (referenced via A7 Skeleton's PresetGrid composition note, `01-atoms.md` A7) |
| Empty (`entries.length === 0`, not loading) | Centered empty state: an icon (`Users`, Lucide) + `emptyStateMessage` text, no skeleton, no "load more" affordance |
| End of list (`hasMore: false`) | "Load more" control is simply absent — not shown disabled, since there's nothing more to load and a disabled control would be confusing dead UI |

### Accessibility — *[GAP FILL]*

- The list renders as `<div role="list" aria-label="[Followers|Following] of @[profileUsername]">` (or a real `<ul>`, which natively conveys list semantics without needing `role="list"` — either is acceptable, but the accessible name must distinguish `followers` from `following` mode, since both render the identical visual pattern and a screen reader user switching between the two tabs/views needs the label to confirm which one they're now in).
- Each entry is a `<li>` wrapping an M2 CreatorCard `variant="mini"` instance — inherits M2's own accessibility treatment in full (`02-molecules.md` M2 Accessibility: card-as-link pattern, Follow button `stopPropagation` + `aria-pressed`, stat-row accessible labeling).
- The "Load more" trigger is most appropriately an infinite-scroll `IntersectionObserver` (consistent with this product's general infinite-scroll pattern for feeds, e.g. O4 PresetGrid) rather than a manual button, but if implemented as IntersectionObserver, a visually-hidden `<div aria-live="polite" className="sr-only">` should announce "Loading more…" / "[N] more loaded" so screen reader users — who don't benefit from incidental scroll-triggered loading the way sighted users do — know new content has appeared without having to discover it by chance.
- The empty state's icon is `aria-hidden="true"`; the message text alone is the accessible content.

### Responsive Behavior — *[GAP FILL]*

- Per M2 CreatorCard's own Responsive Behavior (`02-molecules.md` M2: "`mini` variant: fixed compact width... used inline in Navigation Sidebar... and CC6 Follower/Following List — does not reflow at different breakpoints since it's always in a fixed-width sidebar/panel context"), CC6 itself does not need to manage column counts or grid reflow — it's a single-column vertical stack at every breakpoint, full-width within whatever container hosts it (most likely the Profile Page's main content column).
- On `xs`/`sm`, the stack's per-row tap target (the whole `mini` card) should remain comfortably touch-sized; M2's own `mini` variant dimensions already account for this, so CC6 adds no additional mobile-specific sizing.

### Motion Behavior — *[GAP FILL]*

Tier 3 — Entrance (initial load, pagination).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Initial list entrance | `opacity` 0→1 + `translateY(8px→0)`, staggered per row (matching O11 Leaderboard Panel's "Entry list entrance" pattern, `03-organisms.md` O11 Motion Behavior, since both are vertical lists of creator-identity rows) | 300ms, 30ms stagger | `--ease-out` |
| New page appended (load more) | New rows fade/slide in with the same entrance treatment as initial load; existing rows above do not re-animate | 300ms, 30ms stagger | `--ease-out` |
| Skeleton → real content crossfade | `opacity` swap, per A7 Skeleton's general exit pattern (`01-atoms.md` A7 Motion Behavior) | `--dur-normal` (200ms) | `--ease-in-out` |

`prefers-reduced-motion`: entrance stagger collapses to instant; skeleton crossfade is unaffected (already a simple opacity swap, not a motion effect requiring suppression).

### Design Tokens — *[GAP FILL]*

CC6 introduces no new tokens — it is purely a layout/pagination wrapper around M2 CreatorCard `variant="mini"`, and inherits that component's tokens in full (`02-molecules.md` M2 Design Tokens).

- List vertical gap between entries: `--space-2` (8px), consistent with other dense vertical lists in the system (e.g. F3 Dropdown Menu's item spacing convention, scaled up slightly since `mini` CreatorCards are taller than dropdown items)
- Empty-state icon: `icon-xl` (32px or larger), `--color-text-tertiary`
- Empty-state message: `body-md`, `--color-text-secondary`

### Composition Examples — *[GAP FILL]*

- **Profile Page (`/u/:username`):** the primary context, surfaced from follower/following counts shown in O6 Profile Header — clicking either count opens CC6 in the relevant `mode`. Neither Product Spec §6.4 nor the Design System specifies whether this opens as its own route, an F2 Modal, or an inline expanding section on the profile page itself. **[OPEN QUESTION]** — recorded below.
- **M2 CreatorCard:** every row is a `variant="mini"` CreatorCard instance, per M2's own Composition Examples ("CC6 Follower/Following List: stack of CreatorCard `variant="mini"`, load more at bottom").
- **A7 Skeleton:** loading and loading-more states reuse the `avatar` + `text` skeleton composite already specified for M2's own Loading state.

---

## CC7 — Search Results

### Purpose
*(verbatim)*

Full-page results for a query.

### Variants
*(verbatim — structure, single pattern)*

**Structure** *(verbatim):*
- Query display + result count
- Filter bar (category, difficulty, device, version)
- Sort: Relevance · Downloads · Newest · Top Liked
- Masonry grid of results
- Empty state with suggestions if no results

**Anatomy** *(derived from the structure list + Product Spec §6.7 Explore Page, which shares most of the same elements):*
```
Results for "velocity transitions"          1,284 results

[All] [Velocity] [Transition] [Color] [Anime] [Gaming] [Lyric] [3D]   ← Filter bar
[Difficulty ▾] [Device ▾] [AM Version ▾]                              ← Secondary filters
[Relevance ▾]                                                         ← Sort

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ M1     │ │ M1     │ │ M1     │ │ M1     │   ← Masonry grid (O4 PresetGrid)
└────────┘ └────────┘ └────────┘ └────────┘

— or, if no results —

  No presets found for "asdkfj zzqx"
  Try: checking spelling · fewer filters · broader terms
  [Browse all velocity presets →]
```

### Props — *[GAP FILL — not specified in source, derived from anatomy + Product Spec §16 Search endpoint]*

```typescript
interface SearchResultsProps {
  query: string
  resultCount: number
  results: PresetCardProps['preset'][]      // Same shape as M1 PresetCard's preset prop
  filters: {
    category?: CategoryKey
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    device?: 'android' | 'ios' | 'both'
    amVersion?: string                      // e.g. "4.x"
  }
  onFiltersChange: (filters: SearchResultsProps['filters']) => void
  sort: 'relevance' | 'downloads' | 'newest' | 'top-liked'
  onSortChange: (sort: SearchResultsProps['sort']) => void
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
}
```

**[OPEN QUESTION]:** The Product Specification's Site Map (§3) lists `/explore` (Browse all presets) as a route, and §6.7 "Explore Page" describes a hero search bar + filter bar + sort bar + masonry grid that is structurally almost identical to CC7's own spec. There is a `GET /api/search?q=&category=&difficulty=&device=&version=&sort=` endpoint (§16 API Reference), but **no dedicated `/search` route appears anywhere in the Site Map**. This leaves it genuinely ambiguous whether CC7 Search Results: (a) **is** the Explore page itself once a query is typed into its hero search bar (i.e. `/explore?q=...` reuses the same page, with CC7 simply being "Explore page, query-populated state" rather than a separate component/route), (b) is a distinct, currently-unlisted `/search` results page that the Top Bar's SearchBar (M6, referenced in `02-molecules.md` and ADR-019) navigates to on submit, separate from `/explore`'s own browsing experience, or (c) some hybrid where `/explore` handles category/filter-driven browsing and a separate `/search` handles free-text query results. This is the single largest structural ambiguity in this file, since it determines whether CC7 is a new page-level route needing its own entry in the Site Map, or simply a state of the already-specified Explore Page. Recorded as the most significant new ADR below.

### States — *[GAP FILL]*

| State | Treatment |
|---|---|
| Loading (initial query submit) | A7 Skeleton `variant="card"` grid matching the current breakpoint's column count, per A7's PresetGrid composition pattern (`01-atoms.md` A7 Composition Examples) — query text and result count are not shown until the count is known, to avoid a "0 results" flash before data arrives |
| Loaded (results found) | Query display + count, filter bar, sort bar, masonry grid of M1 PresetCard `variant="default"` — per the Structure spec verbatim |
| Loading more (infinite scroll) | Existing grid remains; skeleton cards append at the bottom and crossfade to real cards on arrival, identical pattern to O4 PresetGrid's own infinite-scroll loading state |
| Filter/sort changed | Grid crossfades (old results fade out briefly, new results fade in) rather than an abrupt content swap, consistent with O11 Leaderboard Panel's "Mode change" crossfade treatment (`03-organisms.md` O11 States) for a comparable filtered-list-refresh interaction |
| Empty (zero results) | Centered empty state per the Structure spec verbatim: message naming the query, suggestions ("checking spelling · fewer filters · broader terms"), and a recovery CTA linking to a broader, filter-free view of the nearest matching category |
| Error (search API failure) | F1 Toast `variant="error"` ("Search is having trouble right now. Try again.") plus the grid area shows a lightweight inline retry affordance — not a full-page error state, since search failure is recoverable and shouldn't feel as severe as e.g. a 404 |

### Accessibility — *[GAP FILL]*

- The page region renders as `<main>` containing a `<h1>` with the query, e.g. `<h1>Results for "velocity transitions"</h1>` — the result count ("1,284 results") is adjacent text, not baked into the heading itself, so screen reader users hear the query clearly as the page's primary heading.
- Result-count updates (after a filter/sort change re-queries) are announced via a polite live region — `<div aria-live="polite" className="sr-only">1,284 results</div>` updated on each change — so screen reader users get the same "results changed" feedback sighted users get from watching the count update visually.
- The filter bar's category pills reuse FilterChip (per `02-molecules.md`'s file index, FilterChip is a defined molecule) in its existing toggle-button pattern; the secondary filters (`Difficulty ▾`, `Device ▾`, `AM Version ▾`) follow F3 Dropdown Menu's trigger/panel/keyboard pattern verbatim (`05-overlays-feedback.md` F3 Accessibility).
- The Sort control (`Relevance ▾` etc.) is a single F3-style dropdown, not a set of toggle buttons, since exactly one sort mode is active at a time — same `aria-haspopup="menu"`/`aria-expanded` trigger pattern.
- The masonry grid of results is itself O4 PresetGrid, inheriting that organism's existing accessibility treatment (live-region item-count announcement, skeleton `aria-hidden`, etc. — cross-referenced from `03-organisms.md` O4) rather than CC7 re-specifying grid-level a11y from scratch.
- The empty state's recovery link ("Browse all velocity presets →") is a real `<a>`, not a button triggering client-side-only filter changes, so it's bookmarkable/shareable and works with browser back/forward.

### Responsive Behavior — *[GAP FILL]*

Per Design System §9 "Layout Decisions Per Breakpoint" (Preset grid cols: 1 / 2 / 3 / 4–5) and the Explore Page's own filter-bar pattern (§6.7: "FILTER BAR (horizontal scroll, pill chips)"):

| Breakpoint | Filter bar | Secondary filters | Grid columns |
|---|---|---|---|
| `xs`/`sm` | Horizontal-scroll pill row (no wrap) | Collapsed into a single "Filters" trigger opening an F2 Modal bottom-sheet containing all secondary filter controls | 1 |
| `md` | Horizontal-scroll pill row | Inline dropdowns, may wrap to a second row if space is tight | 2 |
| `lg`+ | Full pill row, no scroll needed at typical category-count | Inline dropdowns, single row | 3–5 per breakpoint |

- The `xs`/`sm` "collapse secondary filters into a modal" pattern is an inferred convention (matching how dense filter UIs are commonly handled on narrow viewports) rather than something stated in either source doc — **[OPEN QUESTION]**, recorded below, grouped with the other Upload-Wizard-adjacent and filter-related responsive gaps already on the backlog (e.g. ADR-008's similar "missing page-level responsive spec" pattern for `/creators`).
- Sort control remains a single dropdown trigger at all breakpoints — it's compact enough not to need its own mobile collapse treatment the way the secondary filter set does.

### Motion Behavior — *[GAP FILL]*

Tier 3 — Entrance (initial results, pagination) / Tier 2 — Transition (filter/sort change).

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Initial grid entrance | Inherits O4 PresetGrid / M1 PresetCard's staggered grid-entrance pattern (`02-molecules.md` M1 Motion Behavior: "Grid entrance... staggered 40ms/card") | 400ms, 40ms stagger | `--ease-out` |
| Filter/sort change crossfade | Old grid `opacity` 1→0 (150ms), new grid `opacity` 0→1 (250ms) — same two-phase crossfade as O11 Leaderboard Panel's mode change (`03-organisms.md` O11 Motion Behavior) | 150ms + 250ms | `--ease-in` then `--ease-out` |
| Load more (infinite scroll) | New cards append with the same staggered entrance as initial load, existing cards unaffected | 400ms, 40ms stagger | `--ease-out` |
| Empty-state entrance | `opacity` 0→1, no stagger (single block of content, not a grid) | `--dur-normal` (250ms) | `--ease-out` |

`prefers-reduced-motion`: all entrance staggers collapse to instant; filter/sort crossfade becomes an instant content swap.

### Design Tokens — *[GAP FILL]*

CC7 is primarily a composition of existing tokens already defined for its constituent parts — it introduces no new color, spacing, or typography tokens of its own:

- Query heading: `display-sm` or `heading-xl`, `--color-text-primary`
- Result count: `body-md`, `--color-text-secondary`, adjacent to the heading
- Filter bar: FilterChip's existing tokens (per `02-molecules.md` file index)
- Secondary filter dropdowns + Sort dropdown: F3 Dropdown Menu's existing tokens, unchanged
- Grid: O4 PresetGrid's existing layout tokens, unchanged
- Empty-state icon: `icon-xl`, `--color-text-tertiary`; message `body-md`, `--color-text-secondary`; suggestions list `body-sm`, `--color-text-tertiary`

### Composition Examples — *[GAP FILL]*

- **Top Bar SearchBar (M6, per `02-molecules.md` and the responsive cross-reference in ADR-019):** submitting a query from the persistent Top Bar search field is the most likely entry point into CC7, regardless of how the open route-vs-Explore-state ambiguity above is ultimately resolved.
- **O4 PresetGrid:** CC7's results grid is a direct instance of O4, not a reimplementation — CC7 supplies the query/filter/sort chrome around an otherwise-standard PresetGrid.
- **M1 PresetCard:** each result tile, `variant="default"`, identical to every other masonry-grid context in the product.
- **§6.7 Explore Page:** structurally near-identical to CC7 (hero search, filter bar, sort bar, masonry grid) — see the Open Question above on whether these are the same component in two states or two distinct things.

---

## Ambiguities Surfaced During This File's Authoring

The following ambiguities were identified while writing CC1–CC7 above. Each has been recorded as a new entry in `ARCHITECTURE_DECISIONS.md` (ADR-035 through ADR-039), appended after ADR-034:

| ADR | Component(s) | One-line summary |
|---|---|---|
| ADR-035 | CC1 Preset Upload Drop Zone | No max file size or precise accepted MIME types specified for the XML/QR upload |
| ADR-036 | CC2 Tag Input | `presets.tags` vs. `presets.style` — two array columns, only one documented UI control |
| ADR-037 | CC2 Tag Input | No specified data source/endpoint for the "existing tags" suggestions list |
| ADR-038 | CC5 Image Cropper | Unclear handoff format between client-side crop region and Cloudinary's server-side `c_fill` transform |
| ADR-039 | CC7 Search Results | No `/search` route in the Site Map — unclear whether CC7 is its own page or a state of the Explore Page (§6.7) |

A sixth, lower-priority item — CC3 Category Picker's 2-column mobile grid fallback and CC7's mobile "collapse secondary filters into a modal" pattern — were both inferred responsive conventions rather than documented ones, but are minor enough (and similar enough to already-open ADR-007/ADR-008's "no documented mobile pattern" shape) that they're noted inline in their respective sections rather than spawning two more standalone ADRs.

---

*End of Compound Components — this is the final file in the PresetHub UI Component Library set (`00`–`06`).*
