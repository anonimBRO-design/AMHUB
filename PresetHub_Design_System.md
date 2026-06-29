# PresetHub Design System
### Motion Studio — v1.0

**Classification:** Internal Design Reference  
**Status:** Canonical — do not alter without design review  
**Audience:** Product Design, Frontend Engineering, Brand

---

## TABLE OF CONTENTS

1. Design Principles
2. 8pt Spacing System
3. Typography Scale
4. Color Tokens
5. Border Radius
6. Shadows & Elevation
7. Iconography
8. Grid System
9. Responsive Breakpoints
10. Motion Guidelines
11. Animation Durations & Easings
12. Component States
13. Accessibility Rules
14. Theme Tokens (Light & Dark)
15. CSS Variable Naming Conventions
16. Tailwind Token Mapping
17. Component Library

---

# 1. DESIGN PRINCIPLES

These five principles govern every decision in the design system. When in doubt, return to them. If a proposed component, token, or pattern violates any of these, it should not ship.

---

### 1.1 Content First

The preset thumbnails, video previews, and creator work are the product. Interface chrome must recede. No UI element should compete visually with content.

**In practice:**
- Background surfaces are dark and unsaturated
- Navigation is compact and stays out of the way
- Primary accent color appears sparingly — never as background decoration
- Borders are hairline (0.5px), not structural — implemented as `1px` (`--space-px`) for cross-browser reliability; "hairline" describes visual weight, not a literal pixel value (ADR-015, RESOLVED)

---

### 1.2 Earned Color

Color is a signal, not decoration. When a color appears, it means something. The primary accent (violet) is used only for interactive affordances, CTAs, and active states — never as a styling choice.

**In practice:**
- Accent color = interactive or important
- Semantic colors (red, green, amber) = status only
- Category colors = content classification only
- Everything else = neutral scale

---

### 1.3 Precision Spacing

The 8pt grid is not a suggestion. Inconsistent spacing is the most visible sign of a low-quality product. Every margin, padding, gap, and size must be a multiple of 4px, and preferably 8px.

**In practice:**
- Spacing values come only from the spacing scale
- No custom pixel values outside the scale (no `margin: 11px`)
- Optical exceptions (fine-tuning icon alignment) use 2px steps

---

### 1.4 Tactile Feedback

Every interactive element communicates its state. Nothing is ambiguous. Hover, focus, active, disabled — each state is distinct and immediate. Feedback should feel physical, not digital.

**In practice:**
- Hover: always a visible change (color, translation, or shadow)
- Focus: always a 2px ring in accent color
- Active: always a scale or color shift
- Disabled: always reduced opacity + no cursor interaction

---

### 1.5 Purposeful Motion

Animations communicate state changes and guide attention. They are never decorative. An animation that a user never consciously notices is a success. An animation that delays a user or distracts them is a failure.

**In practice:**
- Duration scales with the distance or complexity of the change
- Nothing loops unless it communicates live state (loading, streaming)
- Motion respects `prefers-reduced-motion` at all times
- Stagger animations guide the eye, never overwhelm it

---

# 2. 8PT SPACING SYSTEM

All spacing values derive from a base unit of **8px**. Minor increments use 4px. No values outside this scale are permitted in component code.

## Scale

| Token | Value | Usage |
|---|---|---|
| `space-px` | 1px | Hairline separators only |
| `space-0.5` | 2px | Micro-adjustments (icon optical alignment) |
| `space-1` | 4px | Tight internal gaps (icon to label) |
| `space-1.5` | 6px | Badge internal padding (horizontal) |
| `space-2` | 8px | Default internal padding, small gaps |
| `space-3` | 12px | Component internal padding |
| `space-4` | 16px | Standard gap between elements |
| `space-5` | 20px | Slightly relaxed padding |
| `space-6` | 24px | Card padding, section internal spacing |
| `space-8` | 32px | Between card and next element |
| `space-10` | 40px | Section top/bottom padding |
| `space-12` | 48px | Large section gaps |
| `space-16` | 64px | Page section separators |
| `space-20` | 80px | Hero section padding |
| `space-24` | 96px | Maximum page-level spacing |

## Common Applications

```
Component padding:        space-3 (12px) to space-6 (24px)
Gap between components:   space-4 (16px) to space-8 (32px)
Section padding (y):      space-10 (40px) to space-16 (64px)
Page max-width padding:   space-6 (24px) to space-8 (32px)
Icon to label gap:        space-1 (4px) to space-2 (8px)
Form field gap:           space-4 (16px)
Navigation item gap:      space-1 (4px)
```

## Inset vs. Squish vs. Stack

Three padding patterns cover most component needs:

- **Inset** (equal on all sides): `padding: space-4` → cards, modals
- **Squish** (more horizontal than vertical): `padding: space-2 space-4` → buttons, tags
- **Stack** (vertical rhythm): `gap: space-4` → form fields, list items

---

# 3. TYPOGRAPHY SCALE

## Typefaces

### Display — Space Grotesk
Geometric variable-weight sans. Used for all hero content, display numbers, and headings where personality matters. Its slight technical character references the motion/code craft of the product.

- Import: Google Fonts (`Space+Grotesk:wght@400;500;600;700`)
- Variable axes: weight (400–700)
- Optical size: works at 24px and above only; below that, use Inter

### Body — Inter
The standard for UI legibility. Used for all body copy, labels, navigation, form elements, and any text below 20px. Optimized for screen at all sizes.

- Import: Google Fonts (`Inter:wght@400;500;600`)
- Subset: latin + latin-ext
- Feature settings: `"cv11", "ss01"` (disambiguation glyphs)

### Monospace — JetBrains Mono
Used exclusively for version numbers, file sizes, download counts in tabular contexts, and any displayed code or XML content.

- Import: Google Fonts (`JetBrains+Mono:wght@400;500`)

## Type Scale

### Display Styles (Space Grotesk)

| Token | Family | Weight | Size | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| `display-2xl` | Space Grotesk | 700 | 72px | 80px (1.11) | -0.04em | Landing hero headline |
| `display-xl` | Space Grotesk | 700 | 56px | 64px (1.14) | -0.03em | Major page heroes |
| `display-lg` | Space Grotesk | 600 | 40px | 48px (1.2) | -0.02em | Section heroes |
| `display-md` | Space Grotesk | 600 | 32px | 40px (1.25) | -0.02em | Page titles |
| `display-sm` | Space Grotesk | 600 | 24px | 32px (1.33) | -0.01em | Card section headings |

### Heading Styles (Inter)

| Token | Family | Weight | Size | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| `heading-xl` | Inter | 600 | 20px | 28px (1.4) | -0.01em | Sidebar section titles |
| `heading-lg` | Inter | 600 | 18px | 26px (1.44) | -0.01em | Card titles, modal titles |
| `heading-md` | Inter | 600 | 16px | 24px (1.5) | 0 | Sub-section headings |
| `heading-sm` | Inter | 600 | 14px | 20px (1.43) | 0 | Label groups |

### Body Styles (Inter)

| Token | Family | Weight | Size | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| `body-lg` | Inter | 400 | 18px | 28px (1.56) | 0.01em | Preset descriptions, feature copy |
| `body-md` | Inter | 400 | 16px | 24px (1.5) | 0.01em | Default body text |
| `body-sm` | Inter | 400 | 14px | 20px (1.43) | 0.01em | Secondary information, meta |
| `body-xs` | Inter | 400 | 12px | 16px (1.33) | 0.02em | Captions, footnotes |

### Label Styles (Inter)

| Token | Family | Weight | Size | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| `label-lg` | Inter | 500 | 16px | 24px | 0 | Large button labels |
| `label-md` | Inter | 500 | 14px | 20px | 0.025em | Standard button labels, nav items |
| `label-sm` | Inter | 500 | 12px | 16px | 0.04em | Badges, tags, small CTAs |
| `label-xs` | Inter | 500 | 11px | 16px | 0.06em | Overlines, tiny labels |

### Monospace Styles (JetBrains Mono)

| Token | Family | Weight | Size | Line Height | Usage |
|---|---|---|---|---|---|
| `mono-md` | JetBrains Mono | 400 | 14px | 20px | Version numbers, file sizes |
| `mono-sm` | JetBrains Mono | 400 | 12px | 16px | Download counts in tables |
| `mono-code` | JetBrains Mono | 400 | 13px | 20px | XML/code display |

## Special Treatments

### Gradient Text
Applied sparingly to hero headlines and the "legendary" badge name. Never on body text.

```css
.text-gradient {
  background: linear-gradient(135deg, #C084FC 0%, #7C3AED 50%, #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Tabular Numbers
Use `font-variant-numeric: tabular-nums` on all stat displays, counters, and any number that changes over time. Prevents layout shift.

```css
.stat-number {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```

---

# 4. COLOR TOKENS

## Base Palette

### Neutral Scale (Background & Surface)

```
neutral-50:   #FAF9FC   ← Light mode: surface elevated
neutral-100:  #F0EEF5   ← Light mode: surface base
neutral-200:  #E2DFF0   ← Light mode: border default
neutral-300:  #C8C3DE   ← Light mode: border strong
neutral-400:  #9990B0   ← Light mode: text muted
neutral-500:  #6B6080   ← Dark mode: text muted
neutral-600:  #4A4260   ← Dark mode: border strong
neutral-700:  #2A2733   ← Dark mode: border default
neutral-800:  #1C1A22   ← Dark mode: surface elevated
neutral-850:  #141218   ← Dark mode: surface base
neutral-900:  #0C0B0F   ← Dark mode: background
neutral-950:  #080608   ← Dark mode: depth
```

### Accent — Violet

```
violet-200:   #DDD6FE   ← Light accent: backgrounds
violet-300:   #C4B5FD   ← Light accent: borders
violet-400:   #A78BFA   ← Light mode: primary
violet-500:   #8B5CF6   ← Light mode: hover
violet-600:   #7C3AED   ← Primary accent (both modes)
violet-700:   #6D28D9   ← Active / pressed
violet-800:   #5B21B6   ← Deep accent
violet-glow:  rgba(124, 58, 237, 0.25)   ← Glow shadow
violet-glow-strong: rgba(124, 58, 237, 0.45)
```

### Semantic

```
green-400:    #4ADE80   ← Success foreground
green-500:    #22C55E   ← Success primary
green-bg:     rgba(74, 222, 128, 0.12)   ← Success background

amber-400:    #FBBF24   ← Warning foreground
amber-500:    #F59E0B   ← Warning primary
amber-bg:     rgba(251, 191, 36, 0.12)   ← Warning background

red-400:      #F87171   ← Error foreground
red-500:      #EF4444   ← Error primary
red-bg:       rgba(248, 113, 113, 0.12)   ← Error background

blue-400:     #60A5FA   ← Info foreground
blue-500:     #3B82F6   ← Info primary
blue-bg:      rgba(96, 165, 250, 0.12)   ← Info background
```

### Category Colors

Each preset category has a fixed color. Used for category badges only.

```
cat-velocity:    #F87171   (red-400)
cat-transition:  #60A5FA   (blue-400)
cat-color:       #4ADE80   (green-400)
cat-anime:       #F472B6   (pink-400)
cat-gaming:      #34D399   (emerald-400)
cat-lyric:       #FBBF24   (amber-400)
cat-3d:          #A78BFA   (violet-400)
cat-other:       #94A3B8   (slate-400)
```

### Rarity Colors (Badge System)

```
rarity-common:    #94A3B8              ← Slate
rarity-rare:      #60A5FA              ← Blue
rarity-epic:      #A78BFA              ← Violet
rarity-legendary: linear-gradient(135deg, #FBBF24, #F59E0B, #F97316)
```

---

# 5. BORDER RADIUS

```
radius-none:  0px      ← Hard edges — table cells, flush components
radius-xs:    2px      ← Micro elements — divider caps
radius-sm:    4px      ← Inputs (interior corners), small tags
radius-md:    8px      ← Buttons, badges, standard chips
radius-lg:    12px     ← Cards, dropdowns, popovers
radius-xl:    16px     ← Modals, panels, sidesheets
radius-2xl:   24px     ← Profile cards, hero banners
radius-full:  9999px   ← Avatars, pill badges, toggle tracks
```

## When to Use Each

| Element | Radius Token |
|---|---|
| Buttons | `radius-md` (8px) |
| Input fields | `radius-sm` (4px) |
| Preset cards | `radius-lg` (12px) |
| Modal / dialog | `radius-xl` (16px) |
| Profile banner | `radius-2xl` (24px) |
| Avatar | `radius-full` |
| Category badge | `radius-full` |
| Difficulty badge | `radius-md` (8px) |
| Tooltip | `radius-md` (8px) |
| Dropdown | `radius-lg` (12px) |
| Tag chip | `radius-full` |
| Notification dot | `radius-full` |

---

# 6. SHADOWS & ELEVATION

## Elevation Concept

PresetHub uses a four-level elevation system. Higher elevation = closer to the user = lighter surface in dark mode (like physical materials catching ambient light).

| Level | Name | Surface Color | Description |
|---|---|---|---|
| 0 | Ground | `neutral-900` (#0C0B0F) | Page background |
| 1 | Base | `neutral-850` (#141218) | Cards, panels |
| 2 | Raised | `neutral-800` (#1C1A22) | Dropdowns, tooltips |
| 3 | Floating | `neutral-800` + shadow | Modals, command palette |

## Shadow Tokens

```css
/* Structural shadows — depth without glow */
--shadow-xs:    0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-sm:    0 2px 8px rgba(0, 0, 0, 0.35);
--shadow-md:    0 4px 16px rgba(0, 0, 0, 0.4);
--shadow-lg:    0 8px 32px rgba(0, 0, 0, 0.5);
--shadow-xl:    0 16px 64px rgba(0, 0, 0, 0.6);

/* Accent glow shadows — used on interactive + featured elements */
--shadow-glow-xs:   0 0 8px rgba(124, 58, 237, 0.15);
--shadow-glow-sm:   0 0 16px rgba(124, 58, 237, 0.2);
--shadow-glow-md:   0 0 32px rgba(124, 58, 237, 0.3);
--shadow-glow-lg:   0 0 56px rgba(124, 58, 237, 0.4);
--shadow-glow-xl:   0 0 96px rgba(124, 58, 237, 0.5);

/* Combined card shadows */
--shadow-card:         0 4px 24px rgba(0, 0, 0, 0.4);
--shadow-card-hover:   0 8px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(124, 58, 237, 0.2);
--shadow-modal:        0 24px 64px rgba(0, 0, 0, 0.7), 0 0 48px rgba(0, 0, 0, 0.3);
--shadow-dropdown:     0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-tooltip:      0 4px 12px rgba(0, 0, 0, 0.4);

/* Focus ring */
--shadow-focus:        0 0 0 3px rgba(124, 58, 237, 0.5);
--shadow-focus-error:  0 0 0 3px rgba(239, 68, 68, 0.4);
```

## Usage Rules

- `shadow-card` on all cards at rest
- `shadow-card-hover` on cards on hover (with translateY -4px)
- `shadow-glow-md` on featured/highlighted presets
- `shadow-glow-lg` on the active challenge card hero
- `shadow-modal` on all modals and dialogs
- `shadow-focus` on all focused interactive elements (no exceptions)
- Never use glow shadows as background decoration — only on elevated elements

---

# 7. ICONOGRAPHY

## Icon Library — Lucide Icons

All icons come from Lucide React (`lucide-react`). Do not use any other icon source or create custom SVG icons unless building a brand mark.

### Rationale
Lucide has the best stroke consistency at small sizes. Icons maintain the same optical weight across the range of sizes PresetHub uses. The 2px stroke width matches our border and line visual language.

## Icon Sizes

| Token | Size | Context |
|---|---|---|
| `icon-xs` | 14px | Inline icons within text (badge indicators) |
| `icon-sm` | 16px | Small buttons, compact navigation |
| `icon-md` | 20px | Standard buttons, navigation items, card actions |
| `icon-lg` | 24px | Section headers, empty state illustrations |
| `icon-xl` | 32px | Hero icons, feature illustrations |
| `icon-2xl` | 48px | Empty states, onboarding illustrations |

## Icon Usage Rules

1. **Never use icons without labels** in primary navigation. Icons are supplementary, not primary wayfinding.
2. **Exception:** Icon-only buttons must have `aria-label` and a tooltip.
3. **Stroke width:** All icons use `strokeWidth={1.5}`. The default (2px) is too heavy at small sizes.
4. **Color:** Icons inherit color from their container. Use `currentColor`. Never hardcode icon colors.
5. **Alignment:** Icons sit at `vertical-align: middle` when inline. Use a flex container with `gap` to align icon + label properly.

## Standard Icon Assignments

| Action / Concept | Lucide Icon |
|---|---|
| Upload | `Upload` |
| Download | `Download` |
| Like / Heart | `Heart` / `HeartFilled` |
| Bookmark | `Bookmark` / `BookmarkCheck` |
| Share | `Share2` |
| Follow | `UserPlus` / `UserCheck` |
| Comment | `MessageCircle` |
| Search | `Search` |
| Filter | `SlidersHorizontal` |
| Trending | `TrendingUp` |
| New | `Sparkles` |
| Featured | `Star` |
| Badge | `Award` |
| Challenge | `Trophy` |
| Settings | `Settings` |
| Profile | `User` |
| Notifications | `Bell` |
| Dashboard | `BarChart2` |
| Analytics | `LineChart` |
| Collections | `FolderOpen` |
| Category: Velocity | `Zap` |
| Category: Transition | `ArrowLeftRight` |
| Category: Color | `Palette` |
| Category: Anime | `Sparkles` |
| Category: Gaming | `Gamepad2` |
| Category: Lyric | `Music` |
| Category: 3D | `Box` |
| Difficulty: Beginner | `GraduationCap` |
| Difficulty: Intermediate | `Layers` |
| Difficulty: Advanced | `FlaskConical` |
| View count | `Eye` |
| XP / Level | `Flame` |
| Verified | `BadgeCheck` |
| Report | `Flag` |

---

# 8. GRID SYSTEM

## Layout Grid

PresetHub uses a 12-column fluid grid with fixed gutters and responsive max-widths.

```
Max content width: 1440px
Columns: 12
Gutter: 24px (desktop) / 16px (tablet) / 12px (mobile)
Margin: 32px (desktop) / 24px (tablet) / 16px (mobile)
```

## Standard Layout Regions

### Full App Layout (Authenticated)
```
┌──────────────────────────────────────────────────────┐
│  TOPBAR (64px height, sticky)                        │
├───────────┬──────────────────────────┬───────────────┤
│           │                          │               │
│ LEFT NAV  │     MAIN CONTENT         │  RIGHT PANEL  │
│ (240px)   │     (fluid)              │  (280px)      │
│  fixed    │                          │  (desktop xl) │
│           │                          │               │
└───────────┴──────────────────────────┴───────────────┘
```

### Preset Grid

| Viewport | Columns | Card Width |
|---|---|---|
| Mobile (< 768px) | 1 | Full width |
| Tablet (768–1024px) | 2 | ~50% minus gap |
| Desktop (1024–1280px) | 3 | ~33% minus gap |
| Wide (> 1280px) | 4 | ~25% minus gap |
| Ultrawide (> 1536px) | 5 | ~20% minus gap |

Grid type: **Masonry** (CSS `columns` property, or JS masonry for animation).  
Gap: 16px on mobile, 20px on tablet, 24px on desktop.

### Dashboard Layout
```
Stats row:  4 cards × (cols 3 each) = 12 cols
Charts:     8 cols (left) + 4 cols (right sidebar)
Tables:     12 cols
```

### Upload Wizard
Single-column, centered, max-width 640px.

### Profile Page
Banner: 12 cols, full bleed  
Content: 12 cols with internal regions  
Preset grid: 3–4 columns

## Column Span Shorthand

```
1/12:   one column
2/12:   two columns
3/12:   quarter
4/12:   third
6/12:   half
8/12:   two-thirds
12/12:  full
```

---

# 9. RESPONSIVE BREAKPOINTS

## Breakpoint Scale

```
xs:   < 480px     ← Small phones
sm:   480px–767px ← Large phones
md:   768px–1023px ← Tablets
lg:   1024px–1279px ← Small desktops, laptops
xl:   1280px–1535px ← Standard desktops
2xl:  ≥ 1536px     ← Wide monitors
```

## Tailwind Configuration

```javascript
screens: {
  'xs':  '480px',
  'sm':  '640px',   // Tailwind default sm
  'md':  '768px',   // Tailwind default md
  'lg':  '1024px',  // Tailwind default lg
  'xl':  '1280px',  // Tailwind default xl
  '2xl': '1536px',  // Tailwind default 2xl
}
```

## Navigation Behavior Per Breakpoint

| Breakpoint | Navigation Pattern |
|---|---|
| xs, sm | Bottom tab bar (5 items) + slide-up drawer |
| md | Collapsible sidebar (icons only, tooltip labels) |
| lg | Sidebar expanded (icons + labels, 220px) |
| xl, 2xl | Sidebar + right panel visible |

## Typography Scaling

Fluid typography scales between breakpoints for hero text:

```css
/* Landing hero - scales from 40px (mobile) to 72px (desktop) */
.hero-headline {
  font-size: clamp(40px, 5vw + 1rem, 72px);
}

/* Preset card title - fixed at 16px, no scaling */
.card-title {
  font-size: 16px;
}
```

## Layout Decisions Per Breakpoint

| Feature | xs/sm | md | lg | xl/2xl |
|---|---|---|---|---|
| Preset grid cols | 1 | 2 | 3 | 4–5 |
| Sidebar | Hidden | Icons only | Icons + Labels | Full |
| Right panel | Hidden | Hidden | Hidden | Visible |
| Dashboard stats | 2×2 grid | 4×1 row | 4×1 row | 4×1 row |
| Profile banner height | 120px | 160px | 200px | 240px |
| Upload wizard width | 100% | 100% | 640px centered | 640px centered |

---

# 10. MOTION GUIDELINES

## Motion Philosophy

Every animation serves communication. Before adding any motion, answer: "What state change does this communicate?" If the answer is "nothing," remove the animation.

## Motion Taxonomy

### Tier 1 — Feedback
Immediate response to user interaction. Must be instant or near-instant. User should feel that the interface responds to them.

- Examples: button press, like animation, input focus ring
- Duration: 50–150ms

### Tier 2 — Transition
Moving between states or views. User needs to understand where they came from and where they're going.

- Examples: modal open, page change, panel slide
- Duration: 200–350ms

### Tier 3 — Entrance / Exit
Content entering or leaving the viewport. Guide the eye, don't overwhelm.

- Examples: card load, notification appear, toast
- Duration: 300–500ms

### Tier 4 — Ambient
Continuous motion that communicates live state. Used extremely rarely.

- Examples: loading spinner, streaming indicator
- Duration: loop, 800ms–2000ms

## Motion Patterns

### Card Hover
```
translateY: 0 → -4px
shadow:     --shadow-card → --shadow-card-hover
duration:   200ms
easing:     ease-out
```

### Like Animation (Heart)
```
1. Scale: 1 → 1.4 → 1 (300ms, ease-spring)
2. Color: neutral → red-400 (150ms, ease-out)
3. Particle burst: 6 particles, 400ms, ease-out
```

### Page Transition
```
exit:  opacity 1→0 + translateY 0→-8px, 200ms ease-in
enter: opacity 0→1 + translateY 8px→0, 250ms ease-out
```

### Modal Open
```
backdrop: opacity 0→1, 200ms ease-out
panel:    scale 0.96→1 + opacity 0→1, 250ms ease-spring
```

### Modal Close
```
panel:    scale 1→0.96 + opacity 1→0, 150ms ease-in
backdrop: opacity 1→0, 200ms ease-out (delayed 50ms)
```

### Feed Card Entrance (Staggered)
```
Per card: opacity 0→1 + translateY 16px→0
Duration: 400ms ease-out
Stagger:  40ms between cards
Max wait: 800ms total (20 cards shown, stagger ends)
```

### XP Bar Fill
```
width: 0%→target%, 600ms ease-out
shimmer overlay: runs once, 300ms, 200ms delay
```

### Badge Unlock
```
1. Modal overlay: opacity 0→1, 200ms
2. Badge icon: scale 0→1.3→1, 500ms ease-spring
3. Glow pulse: 3 × (opacity 0.5→0, 400ms)
4. Particle burst: 12 particles, 600ms ease-out
```

### Notification Bell
```
On new notification: rotate -15deg → 15deg → -10deg → 10deg → 0, 400ms
Badge count pop: scale 1→1.5→1, 300ms ease-spring
```

## What NOT to Animate

- Background colors (jarring in dark mode)
- Font size (causes layout shift)
- Width/height (use transform + clip instead)
- Box-shadow alone on cards (too subtle, use with translateY)
- Any property that causes reflow: top, left, margin, padding (use transform)

---

# 11. ANIMATION DURATIONS & EASINGS

## Duration Tokens

```css
:root {
  /* Durations */
  --dur-instant:  50ms;    ← Feedback: ripple, press
  --dur-fast:    150ms;    ← Feedback: color change, icon swap
  --dur-normal:  250ms;    ← Transition: most UI state changes
  --dur-slow:    400ms;    ← Transition: page, complex state
  --dur-xslow:   600ms;    ← Entrance: XP bar, chart draw
  --dur-glacial: 1000ms;   ← Ambient: count-up, dashboard load
  --dur-loop:    2000ms;   ← Ambient: loading, streaming

  /* Easings */
  --ease-linear:     linear;
  --ease-in:         cubic-bezier(0.4, 0.0, 1.0, 1.0);
  --ease-out:        cubic-bezier(0.0, 0.0, 0.2, 1.0);
  --ease-in-out:     cubic-bezier(0.4, 0.0, 0.2, 1.0);
  --ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1.0);
  --ease-spring-sm:  cubic-bezier(0.34, 1.3, 0.64, 1.0);
  --ease-bounce:     cubic-bezier(0.34, 1.8, 0.64, 1.0);
  --ease-snap:       cubic-bezier(0.2, 0.0, 0.0, 1.0);
}
```

## Easing Decision Guide

| Situation | Easing | Why |
|---|---|---|
| Thing appears / enters | `ease-out` | Decelerates into place, feels controlled |
| Thing disappears / exits | `ease-in` | Accelerates away, feels intentional |
| State change (toggle) | `ease-in-out` | Symmetric, predictable |
| Interactive feedback (like, bounce) | `ease-spring` | Slight overshoot = physical energy |
| Drawer / panel slide | `ease-snap` | Fast start, sharp settle |
| Loading / ambient | `linear` | Looping should be consistent |

## Framer Motion Presets

```typescript
// Shared animation variants for consistency across components

export const fadeInUp = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0,  transition: { duration: 0.4, ease: [0, 0, 0.2, 1] } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
}

export const fadeIn = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1, transition: { duration: 0.25 } },
  exit:     { opacity: 0, transition: { duration: 0.15 } },
}

export const scaleIn = {
  initial:  { scale: 0.96, opacity: 0 },
  animate:  { scale: 1, opacity: 1, transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] } },
  exit:     { scale: 0.96, opacity: 0, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
}

export const slideInRight = {
  initial:  { x: '100%', opacity: 0 },
  animate:  { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.2, 0, 0, 1] } },
  exit:     { x: '100%', opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
}

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 }
  }
}

export const staggerItem = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] } },
}

export const cardHover = {
  rest:  { y: 0,  transition: { duration: 0.2, ease: [0, 0, 0.2, 1] } },
  hover: { y: -4, transition: { duration: 0.2, ease: [0, 0, 0.2, 1] } },
}

export const springPop = {
  initial:  { scale: 0, opacity: 0 },
  animate:  { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 25 } },
  exit:     { scale: 0, opacity: 0, transition: { duration: 0.15 } },
}
```

---

# 12. COMPONENT STATES

Every interactive component must implement all applicable states. Missing states are bugs.

## Universal States

### Default
The resting state of a component with no user interaction.

### Hover
Triggered when the pointer enters the component bounds. Must be visually distinct from default. Rules:
- Buttons: background lightens 10%
- Cards: translateY -4px + shadow increase
- Links: underline appears or color shifts
- All: cursor changes appropriately

### Focus (Keyboard)
Triggered when the component receives keyboard focus. **Never hide or remove focus styles.** Rules:
- Always: 2px ring using `--shadow-focus`
- Ring color: `rgba(124, 58, 237, 0.5)` (violet)
- Ring offset: 2px (inside component)
- Must be visible on all background colors

### Active / Pressed
Triggered on mousedown or touch. Communicates that the action is registering.
- Buttons: scale(0.97) + background darkens
- Cards: scale(0.99)
- Duration: 100ms

### Disabled
The component exists but cannot be interacted with.
- Opacity: 40%
- Cursor: `not-allowed`
- Pointer events: none
- No hover or focus styles
- Never use only color to indicate disabled state

### Loading
The component is waiting for an async action.
- Buttons: text replaced with spinner, same dimensions maintained
- Cards: skeleton overlay
- Width/height should not change during loading

### Error
The component contains or is in an error state.
- Input borders: red-400
- Focus ring: `--shadow-focus-error`
- Error message appears below in red-400
- Icon: `AlertCircle` icon at input trailing position

### Success
The component has completed an action successfully.
- Input borders: green-400 (validation)
- Button: brief green flash then returns to default

## Input-Specific States

| State | Border | Background | Label |
|---|---|---|---|
| Default | `border-default` | `bg-input` | `text-secondary` |
| Hover | `border-strong` | `bg-input` | `text-secondary` |
| Focus | `accent-600` + ring | `bg-input` | `accent-400` |
| Filled | `border-default` | `bg-input` | `text-secondary` (small) |
| Error | `red-400` + ring | `bg-input` | `red-400` |
| Disabled | `border-subtle` | `bg-surface` @ 50% | `text-tertiary` |
| Read-only | `border-subtle` | `bg-surface` | `text-secondary` |

## Button-Specific States

| State | Background | Text | Border | Shadow |
|---|---|---|---|---|
| Default | `accent-600` | white | none | none |
| Hover | `accent-500` | white | none | `shadow-glow-xs` |
| Focus | `accent-600` | white | none | `shadow-focus` |
| Active | `accent-700` | white | none | none |
| Loading | `accent-700` | white | none | none |
| Disabled | `accent-600` @ 40% | white @ 60% | none | none |

---

# 13. ACCESSIBILITY RULES

## Standard

PresetHub targets **WCAG 2.1 AA** compliance as a minimum. AA is the legal standard in most markets and the baseline for a professional product.

## Color Contrast Requirements

| Context | Minimum Ratio | Our Tokens |
|---|---|---|
| Normal text (< 18px) | 4.5:1 | `text-primary` on `bg-base` = 15.2:1 ✓ |
| Large text (≥ 18px or 14px bold) | 3:1 | `text-secondary` on `bg-surface` = 5.8:1 ✓ |
| UI components & icons | 3:1 | All category colors on dark bg ≥ 3.8:1 ✓ |
| Focus rings | 3:1 | Violet ring on dark bg = 4.2:1 ✓ |

**Never use `text-tertiary` on `bg-base` for informational text.** That combination is 2.8:1 — use `text-secondary` minimum.

## Keyboard Navigation

Every interactive element must be reachable and operable by keyboard alone.

```
Tab:        Move between interactive elements (in DOM order)
Shift+Tab:  Move backwards
Enter:      Activate buttons, links, submit forms
Space:      Activate buttons, toggle checkboxes, open selects
Escape:     Close modals, dropdowns, dismiss overlays
Arrow keys: Navigate within menus, radio groups, carousels
Home/End:   Jump to first/last in a list
```

### Focus Trap
Modals and dialogs must trap focus. When a modal opens:
1. Move focus to the first focusable element inside the modal
2. Tab/Shift+Tab cycle only within the modal
3. On close, return focus to the element that opened the modal

### Skip Link
The first focusable element on every page is a visually-hidden skip link:
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-accent-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md">
  Skip to main content
</a>
```

## Screen Reader Requirements

### Semantic HTML
- Use correct elements: `<button>` for buttons, `<a>` for links, `<nav>` for navigation
- Never use `<div>` as a clickable element without `role="button"` and keyboard handler
- Form inputs always have associated `<label>` (even if visually hidden)
- Tables have `<caption>` and column headers with `<th scope="col">`

### ARIA Patterns

```typescript
// Icon-only buttons
<button aria-label="Download preset">
  <Download size={20} />
</button>

// Loading states
<button aria-busy={isLoading} aria-label={isLoading ? "Saving..." : "Save"}>

// Modals
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Upload Preset</h2>

// Expandable sections
<button aria-expanded={isOpen} aria-controls="section-id">

// Notification badge
<button>
  <Bell />
  <span aria-label="3 unread notifications" className="notification-badge">3</span>
</button>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {/* Download count updates */}
</div>
```

### Image Alt Text
- Preset thumbnails: `alt="[Preset Name] by [Creator Name] — [Category] preset"`
- Creator avatars: `alt="[Creator Name]'s profile photo"` or `alt=""` if decorative
- Category icons: `aria-hidden="true"` (label provides context)
- Preview videos: provide captions or text description

## Reduced Motion

All animations must respect the user's motion preference:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

In Framer Motion:
```typescript
const shouldReduceMotion = useReducedMotion();
const animation = shouldReduceMotion ? {} : fadeInUp;
```

## Focus Visible Only

Don't show focus rings on mouse clicks — only on keyboard navigation:
```css
:focus:not(:focus-visible) { outline: none; box-shadow: none; }
:focus-visible { /* focus ring styles */ }
```

---

# 14. THEME TOKENS (LIGHT & DARK)

PresetHub is dark-first. The dark theme is the primary experience. The light theme is provided for accessibility and future use.

## Semantic Token Map

These are the tokens that components reference. They resolve to different values per theme.

### Background

| Token | Dark Value | Light Value |
|---|---|---|
| `--color-bg-base` | `#0C0B0F` | `#F8F7FC` |
| `--color-bg-surface` | `#141218` | `#FFFFFF` |
| `--color-bg-elevated` | `#1C1A22` | `#F0EEF5` |
| `--color-bg-overlay` | `rgba(0,0,0,0.75)` | `rgba(0,0,0,0.5)` |
| `--color-bg-input` | `#1E1C25` | `#FFFFFF` |
| `--color-bg-accent` | `rgba(124,58,237,0.15)` | `rgba(124,58,237,0.08)` |
| `--color-bg-success` | `rgba(74,222,128,0.12)` | `rgba(34,197,94,0.1)` |
| `--color-bg-warning` | `rgba(251,191,36,0.12)` | `rgba(245,158,11,0.1)` |
| `--color-bg-error` | `rgba(248,113,113,0.12)` | `rgba(239,68,68,0.1)` |
| `--color-bg-info` | `rgba(96,165,250,0.12)` | `rgba(59,130,246,0.1)` |

### Text

| Token | Dark Value | Light Value |
|---|---|---|
| `--color-text-primary` | `#F2EFF9` | `#0C0B0F` |
| `--color-text-secondary` | `#A89CC0` | `#4A4260` |
| `--color-text-tertiary` | `#6B6080` | `#8878A0` |
| `--color-text-disabled` | `#3D394A` | `#C8C3DE` |
| `--color-text-inverse` | `#0C0B0F` | `#F2EFF9` |
| `--color-text-accent` | `#A78BFA` | `#7C3AED` |
| `--color-text-success` | `#4ADE80` | `#16A34A` |
| `--color-text-warning` | `#FBBF24` | `#D97706` |
| `--color-text-error` | `#F87171` | `#DC2626` |
| `--color-text-info` | `#60A5FA` | `#2563EB` |

### Border

| Token | Dark Value | Light Value |
|---|---|---|
| `--color-border-subtle` | `#2A2733` | `#E2DFF0` |
| `--color-border-default` | `#3D394A` | `#C8C3DE` |
| `--color-border-strong` | `#5A5468` | `#9990B0` |
| `--color-border-accent` | `#7C3AED` | `#7C3AED` |
| `--color-border-error` | `#F87171` | `#DC2626` |
| `--color-border-success` | `#4ADE80` | `#16A34A` |

### Interactive

| Token | Dark Value | Light Value |
|---|---|---|
| `--color-interactive-primary` | `#7C3AED` | `#7C3AED` |
| `--color-interactive-primary-hover` | `#8B5CF6` | `#6D28D9` |
| `--color-interactive-primary-active` | `#6D28D9` | `#5B21B6` |
| `--color-accent-400` | `#9D6FFF` | `#9D6FFF` |
| `--color-interactive-secondary` | `#1C1A22` | `#F0EEF5` |
| `--color-interactive-secondary-hover` | `#2A2733` | `#E2DFF0` |
| `--color-interactive-danger` | `#EF4444` | `#EF4444` |
| `--color-interactive-danger-hover` | `#F87171` | `#DC2626` |

### Rarity (Invariant — same in both themes)

| Token | Value |
|---|---|
| `--color-rarity-common` | `#94A3B8` |
| `--color-rarity-rare` | `#60A5FA` |
| `--color-rarity-epic` | `#A78BFA` |
| `--color-rarity-legendary-start` | `#FBBF24` |
| `--color-rarity-legendary-end` | `#F97316` |

### Gradients (Invariant — same in both themes)

| Token | Value |
|---|---|
| `--gradient-primary` | `linear-gradient(135deg, #7C3AED, #9D6FFF)` |

*(ADR-010, RESOLVED — formalizes the gradient previously only described in Product Spec §9; uses `--color-interactive-primary` and `--color-accent-400` as its endpoints.)*

## Theme Implementation

```css
/* _tokens.css */

:root {
  /* Default: dark theme */
  --color-bg-base: #0C0B0F;
  --color-bg-surface: #141218;
  /* ... all dark tokens ... */
}

[data-theme="light"] {
  --color-bg-base: #F8F7FC;
  --color-bg-surface: #FFFFFF;
  /* ... all light tokens ... */
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    --color-bg-base: #F8F7FC;
    /* ... light tokens as fallback if no theme set ... */
  }
}
```

---

# 15. CSS VARIABLE NAMING CONVENTIONS

## Naming Pattern

```
--[category]-[property]-[variant]-[state]
```

All four segments are optional. Use only as many as needed for clarity.

### Categories

| Prefix | Domain |
|---|---|
| `--color-` | All color values |
| `--space-` | Spacing values |
| `--font-` | Typography: family, size, weight, leading |
| `--radius-` | Border radius |
| `--shadow-` | Box shadows |
| `--duration-` | Animation durations |
| `--ease-` | Animation easings |
| `--z-` | Z-index values |

### Examples

```css
/* Colors */
--color-bg-base
--color-bg-surface
--color-text-primary
--color-text-accent
--color-border-default
--color-border-accent
--color-interactive-primary
--color-interactive-primary-hover

/* Spacing */
--space-1      → 4px
--space-2      → 8px
--space-4      → 16px

/* Typography */
--font-family-display
--font-family-body
--font-family-mono
--font-size-display-xl
--font-weight-display
--font-leading-body-md

/* Radius */
--radius-sm    → 4px
--radius-md    → 8px
--radius-lg    → 12px
--radius-full  → 9999px

/* Shadows */
--shadow-card
--shadow-card-hover
--shadow-glow-md
--shadow-focus
--shadow-focus-error

/* Animation */
--dur-fast     → 150ms
--dur-normal   → 250ms
--ease-out
--ease-spring

/* Z-index */
--z-base:       0
--z-raised:     10
--z-dropdown:   100
--z-sticky:     200
--z-overlay:    300
--z-modal:      400
--z-notification: 500
--z-tooltip:    600
```

### Anti-Patterns

```css
/* ❌ Avoid — too generic */
--primary
--bg
--text

/* ❌ Avoid — includes implementation details */
--purple-700
--card-background-color

/* ❌ Avoid — inconsistent prefix */
--textPrimary
--text_primary
--TEXT-PRIMARY

/* ✓ Correct */
--color-text-primary
--color-bg-surface
--color-interactive-primary
```

---

# 16. TAILWIND TOKEN MAPPING

## tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {

      // ─── COLORS ────────────────────────────────────
      colors: {
        // Backgrounds
        background: {
          base:     'var(--color-bg-base)',
          surface:  'var(--color-bg-surface)',
          elevated: 'var(--color-bg-elevated)',
          input:    'var(--color-bg-input)',
          overlay:  'var(--color-bg-overlay)',
          accent:   'var(--color-bg-accent)',
          success:  'var(--color-bg-success)',
          warning:  'var(--color-bg-warning)',
          error:    'var(--color-bg-error)',
          info:     'var(--color-bg-info)',
        },

        // Text
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary:  'var(--color-text-tertiary)',
          disabled:  'var(--color-text-disabled)',
          inverse:   'var(--color-text-inverse)',
          accent:    'var(--color-text-accent)',
          success:   'var(--color-text-success)',
          warning:   'var(--color-text-warning)',
          error:     'var(--color-text-error)',
          info:      'var(--color-text-info)',
        },

        // Borders
        border: {
          subtle:  'var(--color-border-subtle)',
          default: 'var(--color-border-default)',
          strong:  'var(--color-border-strong)',
          accent:  'var(--color-border-accent)',
          error:   'var(--color-border-error)',
          success: 'var(--color-border-success)',
        },

        // Interactive
        interactive: {
          primary:       'var(--color-interactive-primary)',
          'primary-hover':  'var(--color-interactive-primary-hover)',
          'primary-active': 'var(--color-interactive-primary-active)',
          secondary:        'var(--color-interactive-secondary)',
          'secondary-hover':'var(--color-interactive-secondary-hover)',
          danger:           'var(--color-interactive-danger)',
          'danger-hover':   'var(--color-interactive-danger-hover)',
        },

        // Categories (invariant)
        category: {
          velocity:   '#F87171',
          transition: '#60A5FA',
          color:      '#4ADE80',
          anime:      '#F472B6',
          gaming:     '#34D399',
          lyric:      '#FBBF24',
          '3d':       '#A78BFA',
          other:      '#94A3B8',
        },

        // Rarity (invariant)
        rarity: {
          common:    '#94A3B8',
          rare:      '#60A5FA',
          epic:      '#A78BFA',
        },

        // Accent raw scale (for specific use cases)
        // NOTE: accent.400 matches --color-accent-400 (#9D6FFF) from DS §14.
        // violet-400 (#A78BFA) is a separate raw-palette entry in DS §4 used only
        // for rarity-epic; it is NOT the same color as accent-400.
        accent: {
          400: '#9D6FFF',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
        },
      },

      // ─── SPACING ────────────────────────────────────
      spacing: {
        '0.5':  '2px',
        '1':    '4px',
        '1.5':  '6px',
        '2':    '8px',
        '3':    '12px',
        '4':    '16px',
        '5':    '20px',
        '6':    '24px',
        '8':    '32px',
        '10':   '40px',
        '12':   '48px',
        '14':   '56px',
        '16':   '64px',
        '20':   '80px',
        '24':   '96px',
        '32':   '128px',
        '40':   '160px',
        '48':   '192px',
        '64':   '256px',
      },

      // ─── TYPOGRAPHY ────────────────────────────────
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Menlo', 'monospace'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'display-2xl': ['72px', { lineHeight: '80px', letterSpacing: '-0.04em' }],
        'display-xl':  ['56px', { lineHeight: '64px', letterSpacing: '-0.03em' }],
        'display-lg':  ['40px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
        'display-md':  ['32px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        'display-sm':  ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        'heading-xl':  ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'heading-lg':  ['18px', { lineHeight: '26px', letterSpacing: '-0.01em' }],
        'heading-md':  ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'heading-sm':  ['14px', { lineHeight: '20px', letterSpacing: '0' }],
        'body-lg':     ['18px', { lineHeight: '28px', letterSpacing: '0.01em' }],
        'body-md':     ['16px', { lineHeight: '24px', letterSpacing: '0.01em' }],
        'body-sm':     ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'body-xs':     ['12px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        'label-lg':    ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'label-md':    ['14px', { lineHeight: '20px', letterSpacing: '0.025em' }],
        'label-sm':    ['12px', { lineHeight: '16px', letterSpacing: '0.04em' }],
        'label-xs':    ['11px', { lineHeight: '16px', letterSpacing: '0.06em' }],
        'mono-md':     ['14px', { lineHeight: '20px', letterSpacing: '0' }],
        'mono-sm':     ['12px', { lineHeight: '16px', letterSpacing: '0' }],
        'mono-code':   ['13px', { lineHeight: '20px', letterSpacing: '0' }],
      },

      // ─── BORDER RADIUS ────────────────────────────
      borderRadius: {
        'none':  '0px',
        'xs':    '2px',
        'sm':    '4px',
        DEFAULT: '8px',
        'md':    '8px',
        'lg':    '12px',
        'xl':    '16px',
        '2xl':   '24px',
        'full':  '9999px',
      },

      // ─── BOX SHADOWS ──────────────────────────────
      boxShadow: {
        'xs':          '0 1px 2px rgba(0,0,0,0.3)',
        'sm':          '0 2px 8px rgba(0,0,0,0.35)',
        'md':          '0 4px 16px rgba(0,0,0,0.4)',
        'lg':          '0 8px 32px rgba(0,0,0,0.5)',
        'xl':          '0 16px 64px rgba(0,0,0,0.6)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':  '0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(124,58,237,0.2)',
        'modal':       '0 24px 64px rgba(0,0,0,0.7)',
        'dropdown':    '0 8px 24px rgba(0,0,0,0.5)',
        'glow-xs':     '0 0 8px rgba(124,58,237,0.15)',
        'glow-sm':     '0 0 16px rgba(124,58,237,0.2)',
        'glow-md':     '0 0 32px rgba(124,58,237,0.3)',
        'glow-lg':     '0 0 56px rgba(124,58,237,0.4)',
        'focus':       '0 0 0 3px rgba(124,58,237,0.5)',
        'focus-error': '0 0 0 3px rgba(239,68,68,0.4)',
        'none':        'none',
      },

      // ─── Z-INDEX ──────────────────────────────────
      zIndex: {
        'base':         '0',
        'raised':       '10',
        'dropdown':     '100',
        'sticky':       '200',
        'overlay':      '300',
        'modal':        '400',
        'notification': '500',
        'tooltip':      '600',
        'max':          '9999',
      },

      // ─── TRANSITIONS ──────────────────────────────
      transitionDuration: {
        'instant': '50ms',
        'fast':    '150ms',
        'normal':  '250ms',
        'slow':    '400ms',
        'xslow':   '600ms',
        'glacial': '1000ms',
      },

      transitionTimingFunction: {
        'ease-out':    'cubic-bezier(0,0,0.2,1)',
        'ease-in':     'cubic-bezier(0.4,0,1,1)',
        'ease-in-out': 'cubic-bezier(0.4,0,0.2,1)',
        'spring':      'cubic-bezier(0.34,1.56,0.64,1)',
        'spring-sm':   'cubic-bezier(0.34,1.3,0.64,1)',
        'snap':        'cubic-bezier(0.2,0,0,1)',
      },

      // ─── BREAKPOINTS ──────────────────────────────
      screens: {
        'xs':  '480px',
        'sm':  '640px',
        'md':  '768px',
        'lg':  '1024px',
        'xl':  '1280px',
        '2xl': '1536px',
      },

      // ─── MAX WIDTH ────────────────────────────────
      maxWidth: {
        'content':   '1440px',
        'prose':     '72ch',
        'upload':    '640px',
        'modal-sm':  '480px',
        'modal-md':  '600px',
        'modal-lg':  '800px',
      },

    },
  },
  plugins: [],
}

export default config
```

---

# 17. COMPONENT LIBRARY

## How to Read This Section

Each component entry includes:
- **Purpose** — What problem it solves
- **Anatomy** — Visual structure and named parts
- **Variants** — All visual variations
- **Props** — Configurable properties
- **States** — All interactive states
- **Usage Rules** — When to use / not use
- **Accessibility** — Required a11y attributes

---

## ATOMS

---

### A1 — Button

**Purpose:** Trigger actions. The primary affordance for user intent.

**Anatomy:**
```
[leading-icon?] [label] [trailing-icon?]
[loading-spinner?]
```

**Variants:**

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

**Props:**
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

**States:** Default · Hover · Focus · Active · Loading · Disabled

**Usage Rules:**
- Maximum 1 `primary` button per view
- Loading state maintains exact button dimensions (never resizes)
- Icon buttons always require `aria-label`
- Danger buttons always use a confirmation dialog before executing

---

### A2 — Input

**Purpose:** Single-line text entry.

**Anatomy:**
```
[label (above)]
[leading-icon?] [value-text] [trailing-icon/action?]
[hint-text or error-text (below)]
```

**Variants:**
- `default` — Standard text field
- `search` — With search icon, clear button when filled
- `password` — With show/hide toggle
- `prefix` — With prefix text (e.g. "presethub.com/")
- `suffix` — With suffix text (e.g. ".xml")

**Props:**
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

**States:** Default · Hover · Focus · Filled · Error · Disabled · Read-only

**Usage Rules:**
- Labels are always visible. Never use placeholder as label.
- Error messages describe the problem and how to fix it.
- Character count shows `{count}/{max}` when within 20% of max.

---

### A3 — Textarea

**Purpose:** Multi-line text entry (descriptions, bios, comments).

**Extends Input** with:
```typescript
interface TextareaProps extends Omit<InputProps, 'type' | 'prefix' | 'suffix'> {
  rows?: number         // Default: 4
  resize?: 'none' | 'vertical'  // Default: vertical
  autoGrow?: boolean    // Expands to content height
}
```

---

### A4 — Avatar

**Purpose:** Visual representation of a user.

**Anatomy:**
```
[image or initials] [status-dot?]
```

**Sizes:**

| Size | Dimensions | Font | Ring width |
|---|---|---|---|
| `xs` | 20×20px | 8px | 1px |
| `sm` | 28px | 11px | 1.5px |
| `md` (default) | 36px | 14px | 2px |
| `lg` | 48px | 18px | 2px |
| `xl` | 64px | 24px | 3px |
| `2xl` | 96px | 36px | 3px |
| `3xl` | 128px | 48px | 4px |

**Props:**
```typescript
interface AvatarProps {
  src?: string
  alt: string
  displayName: string     // Used for initials fallback
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  status?: 'online' | 'offline' | undefined
  level?: number          // Shows XP level ring with color gradient
  isVerified?: boolean    // Shows verification checkmark badge
  ring?: boolean          // Shows accent ring (used in profile headers)
}
```

**Fallback behavior:**
- Image loads: show image
- Image fails: show initials (first letter of each word in displayName, max 2)
- Initials bg: seeded from username (consistent per user, not random)

---

### A5 — Badge

**Purpose:** Compact status or metadata label.

**Variants by role:**
- `category` — Preset category (velocity, anime, etc.)
- `difficulty` — Beginner / Intermediate / Advanced
- `status` — Published, Pending, Rejected
- `rarity` — Common, Rare, Epic, Legendary
- `count` — Numeric count (download count, follower count)
- `new` — "New" indicator

**Props:**
```typescript
interface BadgeProps {
  variant: 'category' | 'difficulty' | 'status' | 'rarity' | 'count' | 'new'
  value: string | number
  size?: 'sm' | 'md'
  icon?: LucideIcon
}
```

**Visual Spec:**

| Variant | Background | Text color | Border radius |
|---|---|---|---|
| category | `--cat-[name]` @ 15% | `--cat-[name]` | `radius-full` |
| difficulty: beginner | `color-bg-success` | `color-text-success` | `radius-md` |
| difficulty: intermediate | `color-bg-warning` | `color-text-warning` | `radius-md` |
| difficulty: advanced | `color-bg-error` | `color-text-error` | `radius-md` |
| rarity: legendary | gradient bg | white | `radius-md` |

---

### A6 — Tag

**Purpose:** User-applied content label. Clickable for filtering.

**Anatomy:**
```
# [label] [remove-button?]
```

**Variants:**
- `default` — Browseable, clickable filter
- `removable` — In upload form, has × button
- `active` — Currently filtering by this tag

**Props:**
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

---

### A7 — Skeleton

**Purpose:** Placeholder for loading content.

**Variants:**
- `text` — Simulates text lines (varied widths)
- `avatar` — Circular placeholder
- `card` — Full preset card placeholder
- `thumbnail` — 4:3 ratio placeholder

**Props:**
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

**Animation:** Shimmer sweep, 1.5s linear loop. 200ms stagger if multiple skeletons in group.

---

### A8 — Spinner

**Purpose:** Indicates in-progress async operation.

**Sizes:** `sm` (16px) · `md` (24px) · `lg` (32px)

**Variants:**
- `ring` — Circular border with gap (default, used in buttons)
- `dots` — Three dots pulsing (used in full-page loading)

**Props:**
```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ring' | 'dots'
  label?: string          // For aria-label (defaults to "Loading")
  color?: 'accent' | 'white' | 'current'
}
```

---

### A9 — Divider

**Purpose:** Visual separation between content groups.

**Variants:**
- `horizontal` (default) — Full-width line
- `vertical` — In flex rows
- `text` — With centered label text ("or", "members")

---

## MOLECULES

---

### M1 — PresetCard

**Purpose:** The primary content unit. Every preset appears as this card in grids. Must work in masonry, equal-height, and list layouts.

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

| Variant | When | Difference |
|---|---|---|
| `default` | Standard grid | No additional treatment |
| `featured` | Editorial pick | Violet glow border, "Featured" badge |
| `trending` | Top of trending | Rank number (#1, #2) top-left |
| `compact` | List view | Horizontal layout, smaller thumb |
| `skeleton` | Loading | Full skeleton |

**Props:**
```typescript
interface PresetCardProps {
  preset: {
    id: string
    slug: string
    title: string
    description?: string
    thumbnailUrl: string
    previewVideoUrl?: string
    category: CategoryKey
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    downloadCount: number
    likeCount: number
    commentCount: number
    viewCount: number
    creator: {
      username: string
      displayName: string
      avatarUrl?: string
      isVerified: boolean
    }
    isFeatured?: boolean
    trendingRank?: number
    isLiked?: boolean
    isBookmarked?: boolean
    createdAt: string
  }
  variant?: 'default' | 'featured' | 'trending' | 'compact'
  showFollow?: boolean
  onLike?: (presetId: string) => void
  onBookmark?: (presetId: string) => void
  onShare?: (presetId: string) => void
}
```

**Behavior:**
- Video autoplays on hover (muted, loop)
- Video pauses and thumbnail shows on mouse leave
- Clicking anywhere goes to `/preset/[slug]`
- Like/bookmark buttons have optimistic updates
- Category badge links to `/explore?category=[name]`

---

### M2 — CreatorCard

**Purpose:** Preview of a creator. Used in creator directory and recommendation panels.

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

**Variants:**
- `card` — Standalone card (creator directory)
- `mini` — Compact horizontal (sidebar, following list)
- `leaderboard` — With rank number

---

### M3 — StatCard

**Purpose:** Display a single metric prominently. Used in creator dashboard header.

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

**Props:**
```typescript
interface StatCardProps {
  icon: LucideIcon
  value: number
  label: string
  delta?: number          // Percentage change
  deltaPeriod?: string    // e.g. "this week"
  format?: 'number' | 'compact' | 'percentage'
  isLoading?: boolean
}
```

**Animation:** Count-up animation on mount (`0 → value`, 1000ms ease-out).

---

### M4 — CommentItem

**Purpose:** Display a single comment with interaction controls.

**Anatomy:**
```
[avatar-sm] [username] · [time-ago]
            [comment body text]
            [❤ 12] [↩ Reply] [... More]
            
            ↳ [avatar-xs] [reply...]   ← Nested reply
```

**Props:**
```typescript
interface CommentItemProps {
  comment: {
    id: string
    body: string
    author: UserMini
    likeCount: number
    isLiked: boolean
    isPinned: boolean
    createdAt: string
    replies?: CommentItemProps['comment'][]
  }
  isOwner: boolean       // Can delete
  isPresetOwner: boolean // Can pin
  onLike: (id: string) => void
  onReply: (id: string) => void
  onDelete: (id: string) => void
  onPin: (id: string) => void
  depth?: 0 | 1         // Max 2 levels
}
```

---

### M5 — NotificationItem

**Purpose:** Single notification in the notification feed.

**Types:**

| Type | Template |
|---|---|
| `like` | `[user]` liked your preset **[preset-name]** |
| `comment` | `[user]` commented on **[preset-name]** |
| `follow` | `[user]` started following you |
| `download` | Your preset **[name]** reached **[milestone]** downloads |
| `badge` | You earned the **[badge-name]** badge |
| `challenge` | Challenge **[name]** has started — submit your entry |
| `featured` | Your preset **[name]** was featured! |
| `system` | Custom message |

**Anatomy:**
```
[actor-avatar] [message text]
               [time-ago]
[preset-thumb?]
```

---

### M6 — SearchBar

**Purpose:** Universal search entry point.

**Anatomy:**
```
[search-icon] [query input] [clear-button?] [filter-icon?]
─────────────────────────────────────────────────────────
[suggestion-dropdown]
  → Recent searches
  → Trending: velocity · anime · coloring
  → Suggested presets
```

**Behavior:**
- Dropdown appears on focus (shows recents and trending)
- Updates suggestions on keystrokes with 150ms debounce
- Escape clears and blurs
- Enter navigates to `/explore?q=[query]`

---

### M7 — FilterChip

**Purpose:** Toggleable category/filter pill in the explore bar.

**Anatomy:**
```
[icon] Category Name [active-indicator?]
```

**States:** Default · Active (accent bg) · Hover · Disabled

---

### M8 — XPProgressBar

**Purpose:** Shows current XP progress toward next level.

**Anatomy:**
```
Level 4 — Artist                    1,250 / 1,500 XP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░
```

**Props:**
```typescript
interface XPProgressBarProps {
  currentXP: number
  nextLevelXP: number
  currentLevel: number
  currentLevelName: string
  nextLevelName: string
  showNumbers?: boolean
  animate?: boolean     // Animate fill on mount
}
```

---

### M9 — BadgeChip

**Purpose:** Display an earned badge in compact form.

**Anatomy:**
```
[icon] Badge Name  ← common/rare/epic
✦ [icon] BADGE ✦  ← legendary (animated shimmer)
```

---

### M10 — VideoPlayer

**Purpose:** Preset preview video with controls.

**Features:**
- Autoplay muted on hover in card context
- Full controls in preset detail page
- Thumbnail fallback before video loads
- Loading spinner during buffering
- Volume control (remembers preference in localStorage)

---

### M11 — DownloadButton

**Purpose:** Primary CTA on preset pages. Handles the download flow.

**States:**
1. Default: label per `fileType` (ADR-014, RESOLVED) — `xml`: "Download Preset", `qr`: "Get QR Code", `link`: "Open in Alight Motion"
2. Loading: Spinner + "Getting your file..."
3. Success: "✓ Downloaded"
4. Login required: Redirects to auth — applies only to user-specific features (bookmarks, collections, download history); the download action itself remains guest-accessible (ADR-013, RESOLVED)

**Behavior:** On click → records download → returns signed URL → triggers browser download or redirects to AM link.

---

## ORGANISMS

---

### O1 — Navigation Sidebar

**Purpose:** Primary navigation for authenticated users (desktop).

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

**Breakpoint behavior:**
- `lg+`: Full sidebar (220px), always visible
- `md` (pointer device): Icon-only (64px), hover tooltip for labels
- `md` (touch device, `@media (pointer: coarse)`): Icon-only sidebar collapsed; tap opens full-width (220px) sidebar as a drawer overlay (`slideInRight`, `--z-overlay: 300`). Backdrop tap collapses. Detection and conditional rendering handled in T1 AppLayout. *(ADR-018, RESOLVED)*
- `xs/sm`: Hidden, replaced by bottom tab bar

---

### O2 — Mobile Bottom Navigation

**Purpose:** Primary navigation for mobile.

**5 Tabs:** Home · Explore · Upload (FAB) · Challenges · Profile

The Upload item is a floating action button (accent background, elevated) centered in the tab bar.

---

### O3 — Top Bar

**Purpose:** App-wide top bar for context, search, and global actions.

**Anatomy:**
```
[logo / page-title]    [search-bar]    [notifications] [avatar-menu]
```

**Behavior:**
- Sticky at top (z-index: sticky)
- Blurred backdrop on scroll (glassmorphism — used here intentionally because it communicates depth)
- Notification bell shows badge with unread count
- Avatar menu: dropdown with Profile · Dashboard · Settings · Sign out

**Mobile search behavior (`xs`/`sm`):** *(ADR-019, RESOLVED)*
- The SearchBar is replaced by a `Search` (Lucide) icon button in the Top Bar row.
- Tapping the icon opens a full-width search overlay (`fadeIn` + `scaleIn`, `--z-overlay: 300`).
- The overlay contains M6 SearchBar in mobile context; submitting routes to `/explore?q=`.
- On `md+`, SearchBar renders inline as in the standard anatomy above.

---

### O4 — PresetGrid

**Purpose:** Masonry grid for displaying collections of preset cards.

**Props:**
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

**Behaviors:**
- Infinite scroll (IntersectionObserver at bottom sentinel)
- Skeleton cards shown during initial load (matches column count)
- Smooth card entrance with staggered fade-in-up
- Pull-to-refresh on mobile

---

### O5 — Preset Detail

**Purpose:** Full preset information on the preset page.

**Layout:**
```
HERO
  ← 60% wide: video player  [scrolls normally]
  → 40% wide: all metadata + actions  [position: sticky; top: 64px — sticks on scroll at md+]

  Note (ADR-020, RESOLVED): "sticky on scroll" applies to the 40% metadata/CTA column only.
  The video player scrolls away once the user moves past the hero.
  The download CTA and creator metadata remain in view throughout comments and related presets.
  Sticky is inactive on xs/sm (stacked single-column layout; sticky not applied).
  The comments anchor (#comments) requires scroll-margin-top: 64px (Top Bar height) to prevent
  the sticky metadata column from obscuring keyboard focus targets.

BELOW FOLD
  Comment thread
  More from creator (horizontal scroll)
  Related presets (masonry mini-grid)
```

---

### O6 — Profile Header

**Purpose:** Creator profile top section.

**Anatomy:**
```
[banner image — 6:1 ratio at lg+, 4:1 at md, 3:1 at xs/sm — full bleed] *(ADR-021, RESOLVED)*
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

---

### O7 — Upload Wizard

**Purpose:** Guide creators through uploading a preset in 3 steps.

**Step indicator:**
```
① Files  ──  ② Details  ──  ③ Preview
```

**Step 1 — Files:**
- Drop zone for XML file or QR image
- OR paste Alight Motion link
- Thumbnail upload (required, cropped to 4:3)
- Preview video upload (optional)
- File validation inline

**Step 2 — Details:**
- Title (required)
- Description (markdown, optional, live preview)
- Category (dropdown, required)
- Tags (tag input, max 10)
- Difficulty (segmented control)
- AM Version minimum (dropdown)
- Device support (checkbox group)

**Step 3 — Preview:**
- Full PresetCard as it will appear in the grid
- Summary of all details
- [Publish] button with clear expectation ("Under review in 24h")

**Transitions:** Step slides out left, next slides in right. Progress bar advances.

---

### O8 — Comment Thread

**Purpose:** Nested comment system under preset pages.

**Features:**
- Top-level comments sorted by: Newest / Top Liked
- Max 2 levels of nesting (reply to reply, no deeper)
- Pinned comment appears first with pin indicator
- Pagination (10 comments, load more)
- Real-time via Supabase subscriptions (new comments appear without refresh)

---

### O9 — Creator Dashboard

**Purpose:** Analytics and management center for creators.

**Layout:**
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

---

### O10 — Challenge Card (Hero)

**Purpose:** Feature the active weekly challenge prominently.

**Anatomy:**
```
┌─────────────────────────────────────────────┐
│  [Challenge Banner Image]                   │
│  WEEKLY CHALLENGE                           │
│  "Best Summer Velocity Edit"                │
│                                             │
│  Ends in: [03d] [14h] [22m]  (countdown)   │
│  Prize: 500 XP + Featured Spot              │
│                                             │
│  [Submit Entry]  [Browse 127 Entries →]     │
└─────────────────────────────────────────────┘
```

---

### O11 — Leaderboard Panel

**Purpose:** Show top creators by XP or downloads.

**Anatomy:**
```
🏆 Leaderboard                    [Monthly ▾]

#1  [avatar] CreatorName   89.4K DLs
#2  [avatar] CreatorName   72.1K DLs
#3  [avatar] CreatorName   61.8K DLs
[...more collapsed]
[View Full Leaderboard →]
```

---

## TEMPLATES

---

### T1 — AppLayout

**Purpose:** Wraps all authenticated routes.

```
<AppLayout>
  <TopBar />
  <div className="flex">
    <Sidebar />                    ← hidden xs/sm
    <main id="main-content">
      {children}
    </main>
    <RightPanel />                 ← visible xl+ only
  </div>
  <MobileNav />                    ← visible xs/sm only
</AppLayout>
```

---

### T2 — PublicLayout

**Purpose:** Wraps public pages (landing, preset page, profile).

```
<PublicLayout>
  <PublicHeader />                 ← Logo + Nav + Auth buttons
  <main id="main-content">
    {children}
  </main>
  <Footer />
</PublicLayout>
```

---

### T3 — AuthLayout

**Purpose:** Wraps login/register pages.

```
<AuthLayout>
  <div className="split-layout">
    <AuthPanel>                    ← Left: form
      {children}
    </AuthPanel>
    <VisualPanel />                ← Right: animated preset showcase
  </div>
</AuthLayout>
```

---

## OVERLAYS & FEEDBACK

---

### F1 — Toast / Notification

**Purpose:** Non-blocking feedback for completed actions.

**Variants:** `success` · `error` · `warning` · `info`

**Anatomy:**
```
[icon] Message text    [action?]  [✕]
```

**Behavior:**
- Appears at top-right (bottom-center on mobile)
- Auto-dismisses after 4s
- Pause dismissal on hover
- Maximum 3 toasts stacked (oldest dismisses if more arrive)
- Entrance: slide-in from right + fade, 250ms
- Exit: slide-out right + fade, 200ms

---

### F2 — Modal / Dialog

**Purpose:** Content that requires dedicated focus and user decision.

**Sizes:** `sm` (480px) · `md` (600px) · `lg` (800px) · `fullscreen`

**Structure:**
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
│  [Cancel]     [Confirm Action] │ ← Modal Footer
└────────────────────────────────┘
```

**Rules:**
- Always have a close button (keyboard: Escape)
- Destructive modals: danger button + description of consequence
- Focus trapped inside while open
- Scroll lock on body while open

---

### F3 — Dropdown Menu

**Purpose:** Contextual actions for a specific item.

**Trigger:** Appears at the `⋯` (MoreHorizontal) button on cards and items.

**Anatomy:**
```
┌──────────────────┐
│  ✏ Edit          │
│  🔗 Copy Link    │
│  📤 Share        │
│  ─────────────   │
│  🚩 Report       │
│  ────────────    │
│  🗑 Delete      │ ← danger
└──────────────────┘
```

**Behavior:** Closes on Escape, click outside, or item selection.

---

### F4 — Tooltip

**Purpose:** Brief explanation for icon buttons and abbreviated content.

**Anatomy:** Text label above/below the element.

**Behavior:**
- Appears after 500ms hover delay
- Disappears immediately on mouse leave
- Never on touch devices
- Max 80 characters (longer → use Popover)

---

### F5 — Badge Unlock Overlay

**Purpose:** Celebrate an earned badge. Full-screen moment.

**Animation sequence:**
1. Dark overlay fades in (200ms)
2. Badge icon scales in with spring (500ms)
3. Glow pulses 3× (400ms each)
4. 12 particle burst (600ms)
5. Badge name and description appear (300ms fade)
6. "View all badges →" and "Continue" buttons appear
7. Auto-dismisses after 8s or on click anywhere

---

### F6 — Confirmation Dialog

**Purpose:** Prevent accidental destructive actions.

Used before: Delete preset · Remove from collection · Unfollow · Account deletion.

**Copy pattern:**
```
Delete "Summer Velocity Pack"?

This preset will be permanently deleted and all 
4,200 downloads will be removed from your stats.
This cannot be undone.

[Cancel]  [Delete Preset]
```

The dangerous action button uses `danger` variant.

---

## COMPOUND COMPONENTS

---

### CC1 — Preset Upload Drop Zone

**Purpose:** Drag-and-drop area in Step 1 of upload wizard.

**States:**
- Idle: Dashed border, centered instructions
- Drag over: Accent border, background shifts to `bg-accent`, instructions update
- Processing: Spinner + "Reading file..."
- Valid: Green border, file name + size
- Invalid: Red border, error message

---

### CC2 — Tag Input

**Purpose:** Multi-tag entry with suggestions.

**Behavior:**
- Type and press Enter or comma to add tag
- Shows suggestions dropdown from existing tags
- Each tag appears as a chip with × remove button
- Max tags enforced with counter display

---

### CC3 — Category Picker

**Purpose:** Select a preset category.

**Appearance:** Icon grid, one selection at a time.

```
[Zap]     [Arrow]   [Palette]  [Sparkles]
Velocity  Transition  Color      Anime

[Gamepad] [Music]   [Box]      [More...]
Gaming    Lyric      3D         Other
```

Each item has icon + label. Selected item: accent background.

---

### CC4 — Markdown Editor

**Purpose:** Rich text entry for preset descriptions.

**Toolbar:** Bold · Italic · Link · Unordered list · Ordered list

**Tabs:** Write | Preview (live rendered markdown)

**Output:** Stored as markdown, rendered via `react-markdown` + `remark-gfm`.

**Security:** Rendered markdown sanitized via DOMPurify.

---

### CC5 — Image Cropper

**Purpose:** Enforce 4:3 ratio for thumbnails.

**Features:**
- Drag to reposition
- Pinch or scroll to zoom
- Real-time preview at target dimensions
- Submit crops to Cloudinary for server-side final crop

---

### CC6 — Follower / Following List

**Purpose:** Paginated list of a user's followers or following.

**Layout:** Stack of `mini` CreatorCards, load more at bottom.

---

### CC7 — Search Results

**Purpose:** Full-page results for a query.

**Structure:**
- Query display + result count
- Filter bar (category, difficulty, device, version)
- Sort: Relevance · Downloads · Newest · Top Liked
- Masonry grid of results
- Empty state with suggestions if no results

---

*PresetHub Design System — Motion Studio v1.0*  
*Do not alter tokens or component specs without design team review.*  
*Last updated: June 2026*
