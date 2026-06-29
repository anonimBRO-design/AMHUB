# PresetHub — Architecture Decisions Backlog

**Classification:** Internal Engineering Reference  
**Status:** Open questions requiring product/design/engineering resolution before implementation  
**Source:** Surfaced during Component Library documentation (01-atoms.md, 02-molecules.md, 03-organisms.md, 04-templates.md, 05-overlays-feedback.md, 06-compound-components.md)  
**Rule:** If an implementation step depends on any of these decisions, stop and ask — do not assume.

---

## How to Use This Document

Each entry records:
- **ID** — Stable reference for cross-linking
- **Component(s) affected** — Which component(s) block on this
- **Question** — The unresolved decision
- **Source** — Where it was flagged in the docs
- **Options** — Known candidate answers (not a recommendation, just what's on the table)
- **Status** — `OPEN` until resolved; update to `RESOLVED: [decision]` when closed

---

## ADR-001

**Component(s):** A4 Avatar  
**Question:** The `status` prop (`'online' | 'offline'`) is defined in the Design System §17 but has no specified consumer in any page spec or database schema. The `users` table only has `last_active_at` (a timestamp), not a real-time presence field. Is `status` intentionally forward-looking (reserved for a future DM or presence feature), or should it be removed from the props contract until a feature requires it?  
**Source:** `01-atoms.md` A4 Accessibility section  
**Options:**
1. Keep `status` prop, implement `last_active_at`-derived "online if active within 5 min" logic at the consumer level — low cost, forward-compatible
2. Remove `status` from props now; add back when a presence feature is scoped
3. Keep `status` as a typed prop but render nothing — no visible status dot until a feature drives it  
**Status:** OPEN

---

## ADR-002

**Component(s):** A4 Avatar  
**Question:** The XP level ring requires a gradient mapped to the user's level (levels 1–8 per Product Spec §19). No level-to-gradient mapping is defined in the Design System's color tokens. Should the level ring reuse the existing rarity gradient tokens (`--color-rarity-legendary-start/end` for high levels) or introduce a dedicated `--color-level-ring-*` token series?  
**Source:** `01-atoms.md` A4 Design Tokens section  
**Options:**
1. Single accent ring (`--color-interactive-primary`) for all levels — simplest, no new tokens needed
2. Map level ranges to existing rarity colors (e.g. level 1–3 = common slate, 4–5 = rare blue, 6–7 = epic violet, 8 = legendary gradient)
3. New dedicated `--color-level-ring-[1-8]` token series — most expressive, most token overhead  
**Status:** OPEN

---

## ADR-003

**Component(s):** A4 Avatar  
**Question:** Initials fallback uses a "seeded from username" background color for consistency, but no specific seeded-color palette is defined in either source doc. What palette should be used?  
**Source:** `01-atoms.md` A4 Design Tokens section  
**Options:**
1. Derive from existing category color set (`cat-velocity`, `cat-transition`, etc.) — hashed by username, no new colors introduced
2. Define a dedicated initials palette (8–10 muted colors separate from category colors) — avoids visual confusion between "this avatar is red" and "this is a velocity preset"
3. Use a subset of the neutral-to-accent scale  
**Status:** OPEN

---

## ADR-004

**Component(s):** A5 Badge  
**Question:** The Design System §17 Badge Visual Spec table is incomplete: it specifies treatment only for `difficulty: beginner/intermediate/advanced` and `rarity: legendary`. It does not specify `status: published/pending/rejected/removed` or `rarity: common/rare/epic`. The `01-atoms.md` file filled these in by inference from existing semantic/rarity tokens — are those inferred treatments approved?  
**Source:** `01-atoms.md` A5 Variants section (marked `[OPEN QUESTION]` in source)  
**Inferred treatments pending approval:**

| Variant | Background | Text color |
|---|---|---|
| status: published | `color-bg-success` | `color-text-success` |
| status: pending | `color-bg-warning` | `color-text-warning` |
| status: rejected / removed | `color-bg-error` | `color-text-error` |
| rarity: common | `--color-rarity-common` @ 15% | `--color-rarity-common` |
| rarity: rare | `--color-rarity-rare` @ 15% | `--color-rarity-rare` |
| rarity: epic | `--color-rarity-epic` @ 15% | `--color-rarity-epic` |
| count | transparent / `color-bg-surface` | `text-secondary` |
| new | `color-bg-accent` | `color-text-accent` |

**Status:** OPEN — requires design review before implementation

---

## ADR-005

**Component(s):** A8 Spinner  
**Question:** Design System §11 defines `--dur-loop: 2000ms` as the generic looping ambient token. For a `ring` spinner, a 2-second rotation would read as sluggish (standard UI spinners rotate in 600–1000ms). Should a faster, spinner-specific loop duration be introduced, or should `--dur-loop` be confirmed as intentionally covering only large ambient effects (e.g. streaming indicators)?  
**Source:** `01-atoms.md` A8 Motion Behavior section  
**Options:**
1. Introduce `--dur-loop-fast: 800ms` specifically for ring spinners
2. Use an ad-hoc `750ms` without a named token (acceptable for a single component, but inconsistent with the token-first approach)
3. Confirm `--dur-loop` is for large ambient only; define spinner rotation separately  
**Status:** RESOLVED: Option 1. Introduced `--dur-loop-fast: 800ms` specifically for ring spinners. `--dur-loop` (2000ms) remains reserved for large ambient effects (e.g. streaming indicators). `--dur-loop-fast` is formally defined in Design System §11 and used by A8 Spinner `ring` variant.

---

## ADR-006

**Component(s):** M1 PresetCard  
**Question:** On touch devices there is no hover state. The video-autoplay-on-hover behavior is desktop-only. What is the touch-device equivalent? Two options surface:  
(a) Autoplay video as soon as card scrolls into viewport (IntersectionObserver), or  
(b) Keep static thumbnail until card is explicitly tapped (tap navigates to preset page anyway, so the video would play on the preset page instead).  
Option (a) carries a data-usage cost that is material to the Indonesian primary audience (Persona: Dinda, 15yo, mobile, data-conscious). Option (b) is more conservative.  
**Source:** `02-molecules.md` M1 Responsive Behavior section  
**Options:**
1. Autoplay-on-viewport-entry (mobile, muted, loop) — matches desktop richness, data cost
2. Static thumbnail only until tap — conservative, data-friendly
3. Autoplay only on WiFi (via Network Information API, with a graceful fallback for unsupported browsers)  
**Status:** RESOLVED: Option 2. Static thumbnail only until tap on touch devices; video plays on the preset detail page once tapped. No autoplay-on-viewport-entry, avoiding added data cost for the mobile, data-conscious primary audience.

---

## ADR-007

**Component(s):** M1 PresetCard  
**Question:** Does the mobile layout automatically switch PresetCard to `compact` (horizontal) variant? Neither source doc states this. The `compact` variant exists and is documented as "list view," but no breakpoint rule forces it.  
**Source:** `02-molecules.md` M1 Responsive Behavior section  
**Options:**
1. No automatic breakpoint switch — `compact` is opt-in by the consuming page/organism, never automatic
2. `xs`/`sm` automatically renders `compact` to conserve vertical space on small screens  
**Status:** RESOLVED: Option 1. No automatic breakpoint switch — `compact` stays an explicit, page/context-level choice by the consuming component, never triggered implicitly by viewport size.

---

## ADR-008

**Component(s):** M2 CreatorCard  
**Question:** The Product Spec §3 Site Map lists `/creators` as a route, but §6 UI Pages never specifies the `/creators` page layout. What is the grid structure of the Creator Directory page?  
**Source:** `02-molecules.md` M2 Responsive Behavior section  
**Options:**
1. Add a `/creators` page spec to the Product Specification before this is implementable (preferred — it's a missing page spec, not a component decision)
2. Infer: standard 2–4 column grid matching the general preset grid column counts, with `CreatorCard variant="card"` — document as an assumption  
**Status:** OPEN — missing page spec in Product Specification §6. **Decision (kept OPEN):** this is a Product Specification gap, not a Component Library issue — do not infer a `/creators` layout in the Component Library. Action item: Product Specification §6 UI Pages needs a new `/creators` page entry added (grid structure, column density, CreatorCard variant used, any filter/sort controls) before M2's Responsive Behavior section can be completed. Tracked as a pending Product Spec addition; revisit this ADR once that section exists.

---

## ADR-009

**Component(s):** M8 XPProgressBar  
**Question:** Design System §10 "What NOT to Animate" explicitly lists "Width/height (use transform + clip instead)" as a property to avoid (reflow cost). Yet both source docs specify the XP bar fill as a `width` transition ("XP bar fill: slow fill + shimmer, 600ms ease-out"). This is a direct conflict between the motion rule and the explicitly specified behavior. Which takes precedence?  
**Source:** `02-molecules.md` M8 Motion Behavior section  
**Options:**
1. Honor the explicit behavior spec: animate `width` as stated — accept minor reflow cost given the XP bar is a single isolated element
2. Honor the general rule: implement via `transform: scaleX()` + `transform-origin: left` — achieves the same visual fill without reflow, but slightly distorts border-radius at the fill's leading edge (requires an inner wrapper to clip correctly)
3. Implement via CSS clip-path animation — no reflow, preserves radius, slightly more complex  
**Status:** RESOLVED: Option 2. XP bar fill implemented via `transform: scaleX()` + `transform-origin: left` (with an inner wrapper to preserve border-radius at the leading edge), not literal `width` animation — honors the Design System's "What NOT to Animate" rule while preserving the same visual fill behavior described in the Product Specification.

---

## ADR-010

**Component(s):** M8 XPProgressBar, (any component using the primary gradient fill)  
**Question:** The gradient fill (`linear-gradient(135deg, #7C3AED, #9D6FFF)`) used for the XP bar only appears in Product Spec §9 Color Palette. It is not formalized as a named CSS custom property in the Design System §14–15 token definitions. Should `--gradient-primary` be added as an official token?  
**Source:** `02-molecules.md` M8 Design Tokens section  
**Options:**
1. Add `--gradient-primary: linear-gradient(135deg, #7C3AED, #9D6FFF)` to the Design System token file — preferred, creates a single source of truth
2. Reference the two endpoint tokens in component code: `linear-gradient(135deg, var(--color-interactive-primary), var(--accent-400))` — no new token, but more verbose  
**Status:** RESOLVED: Option 1. Added `--gradient-primary: linear-gradient(135deg, #7C3AED, #9D6FFF)` as an official Design System token. Also formally defined `--color-accent-400: #9D6FFF` in the token list (previously referenced in component tables but never declared).

---

## ADR-011

**Component(s):** M10 VideoPlayer  
**Question:** The play button's exact visual treatment in the detail-context paused state is unspecified. The Design System and Product Spec describe the VideoPlayer's behavior and controls but not the specific visual design of the play overlay button.  
**Source:** `02-molecules.md` M10 Design Tokens section  
**Options:**
1. Semi-transparent dark circle with white icon — standard video player convention, consistent with `--color-bg-overlay`
2. Accent-colored (`accent-600`) solid circle with white icon — on-brand, stands out more
3. Fullscreen semi-transparent overlay with a large centered white icon — more immersive  
**Status:** RESOLVED: Option 1. Semi-transparent dark circle with white icon, using the existing `--color-bg-overlay` token. Consistent with standard video-player convention and Design Principle §1.2 (accent color reserved for interactive affordances, not decorative chrome).

---

## ADR-012

**Component(s):** M10 VideoPlayer  
**Question:** Do any preset preview videos include voiceover, narration, or spoken instruction? If creators narrate tutorials within their preview videos, real captions (not just an `aria-label`) are required for WCAG 2.1 AA compliance. If videos are silent visual demonstrations only, an `aria-label` on the player is sufficient.  
**Source:** `02-molecules.md` M10 Accessibility section  
**Options:**
1. Silent-only by platform policy — spec/enforce at upload time that preview videos may not include audio; `aria-label` sufficient
2. Narrated videos allowed — require caption upload alongside preview video (significant upload UX impact)
3. Auto-caption via Cloudinary or a third-party service for any video with audio  
**Status:** RESOLVED: Option 1. Preview videos are silent-only by platform policy, enforced at upload time. An `aria-label` text description on the player satisfies accessibility requirements; no caption upload flow needed.

---

## ADR-013

**Component(s):** M11 DownloadButton  
**Question:** The Design System §17 specifies state 4 as "Login required: Redirects to auth." However, Product Spec §4 `preset_downloads.user_id` is nullable (`ON DELETE SET NULL`) with the inline comment `-- null = guest`, explicitly supporting anonymous/guest downloads. These two specs conflict. Are guest downloads allowed?  
**Source:** `02-molecules.md` M11 States section  
**Most likely resolution (not a confirmed decision):** Guest downloads are tracked (hence the nullable column) but certain downstream features — like XP gain, download history, bookmark-to-collection — require authentication. The download file delivery itself may be guest-accessible.  
**Status:** RESOLVED: Guest downloads remain allowed and are tracked via the nullable `user_id` / `ip_hash` columns. Authentication ("Login required: Redirects to auth") is only required for user-specific features — bookmarks, collections, download history, and any future personalized features — not for the download/file-delivery action itself.

---

## ADR-014

**Component(s):** M11 DownloadButton  
**Question:** The button label is specified as "Download Preset" regardless of `file_type`. However:
- `file_type: "xml"` → triggers a file download (label accurate)
- `file_type: "qr"` → shows a QR code image (label "Download Preset" is misleading — user isn't downloading a file)
- `file_type: "link"` → opens an Alight Motion deep link (label "Download Preset" is ambiguous)

Should the button label adapt per `file_type`?  
**Source:** `02-molecules.md` M11 Accessibility section  
**Proposed per-type labels (pending approval):**
- `xml`: "Download Preset" (current)
- `qr`: "Get QR Code"
- `link`: "Open in Alight Motion"  
**Status:** RESOLVED: Per-`file_type` labels approved as proposed. `xml` → "Download Preset", `qr` → "Get QR Code", `link` → "Open in Alight Motion".

---

## ADR-015

**Component(s):** A9 Divider  
**Question:** Design Principle §1.1 ("Borders are hairline (0.5px), not structural") and the Spacing System's `space-px: 1px` token are in tension. `0.5px` borders render inconsistently on non-Retina displays. Should Dividers render at `1px` (reliable cross-browser) or `0.5px` (per design principle, unreliable on older/non-Retina screens)?  
**Source:** `01-atoms.md` A9 Design Tokens section  
**Options:**
1. `1px` for cross-browser reliability — the "hairline" principle is about visual weight, not a literal 0.5px requirement
2. `0.5px` strictly, accepting inconsistency on non-Retina — most of the primary audience (Indonesian mobile users) likely uses mid-range Android devices, many non-Retina  
**Status:** RESOLVED: Option 1. Dividers render at `1px` (`--space-px`). Design Principle §1.1's "hairline (0.5px)" wording is a visual-weight description, not a literal pixel mandate — consistent with the Spacing System's own `space-px: 1px` token, already labeled "Hairline separators only."

---

## ADR-016

**Component(s):** M5 NotificationItem  
**Question:** The Product Spec API §13 describes the notifications endpoint as returning a "list, paginated" but gives no detail about whether the `/notifications` page groups items by date (e.g. "Today," "This Week," "Earlier"). Is date-grouping desired?  
**Source:** `02-molecules.md` M5 Composition Examples section  
**Options:**
1. No grouping — flat paginated list, newest first
2. Date-grouped sections ("Today" / "This Week" / "Earlier") — better scannability, more complex rendering  
**Status:** RESOLVED: Option 2. The `/notifications` page groups items by date using section headers: "Today" / "This Week" / "Earlier". Grouping is derived client-side from the existing `created_at` timestamps returned by the paginated `GET /api/notifications` endpoint — no API change required. Section headers render using A9 Divider + `label-sm` text style. The flat API response remains unchanged; bucketing logic lives in a client-side utility.

---

## ADR-017

**Component(s):** A2 Input, A3 Textarea  
**Question:** Product Spec §4 defines `presets.description` max 2000 chars and `users.bio` max 280 chars. No `presets.title` max length is defined anywhere in the Product Spec or Design System.  
**Source:** `01-atoms.md` A2 Composition Examples section  
**Options:**
1. 100 chars — allows full title to appear in card view (PresetCard `heading-md`, 2-line clamp)
2. 150 chars — more generous, still reasonable
3. No server-enforced max — leave to UI validation only  
**Status:** RESOLVED: Option 1. `presets.title` max length is **100 characters**. Rationale: at `heading-md` (16px Inter 600) on a standard card width (~280px), approximately 38–42 chars fit per line; 100 chars fills the 2-line clamp comfortably and matches the constraint discipline of `users.bio` (280) and `comments.body` (500). Required changes: (1) DB schema — add `CHECK (char_length(title) <= 100)` to `presets.title`; (2) API — Zod schema for `POST /api/presets` gains `.max(100)` on title; (3) O7 Upload Wizard Step 2 title field — `maxLength={100}` + `showCount={true}`.

---

## ADR-018 *(added during 03-organisms.md authoring)*

**Component(s):** O1 Navigation Sidebar  
**Question:** At the `md` breakpoint (768–1023px), the Design System §17 specifies the sidebar collapses to "icon-only (64px), hover tooltip for labels." On touch-capable tablets at `md`, hover tooltips are inaccessible (no hover state). What is the interaction model for icon-only sidebar items on touch tablets?  
**Source:** Design System §17 O1, inferred during organism documentation  
**Options:**
1. Tap shows a temporary label overlay (like a brief toast near the icon)
2. Icon-only sidebar is never shown on touch devices — tablet touch uses the mobile bottom nav instead
3. Tap opens the full sidebar as a drawer  
**Status:** RESOLVED: Option 3. On touch-capable devices at `md` (detected via `@media (pointer: coarse)`), tapping the collapsed icon-only sidebar opens it as a full-width (220px) drawer overlay — same slide-in-right motion as other drawers in the system (`slideInRight` Framer Motion variant, `--z-overlay: 300`). A backdrop tap collapses it. The drawer shows full icon + label nav items. On pointer-capable (mouse) devices at `md`, the existing hover-tooltip behaviour is retained unchanged. No new component pattern required; detection and conditional rendering live in T1 AppLayout.

**Component(s):** O3 Top Bar  
**Question:** The Product Spec §6.2 Home Feed layout shows the SearchBar in the Top Bar as always visible at desktop sizes, but M6 SearchBar's responsive section (in `02-molecules.md`) infers it collapses to an icon-only trigger on `xs`/`sm`. Neither source doc explicitly states the Top Bar's mobile search behavior.  
**Source:** Design System §17 O3, cross-referenced with M6 SearchBar  
**Options:**
1. SearchBar collapses to a `Search` icon button on `xs`/`sm`; tapping expands to full-width overlay search
2. SearchBar is removed from Top Bar entirely on mobile (users use the Explore page's hero SearchBar instead)
3. SearchBar remains inline but shrinks to a compact width  
**Status:** RESOLVED: Option 1. On `xs`/`sm`, the SearchBar in O3 Top Bar is replaced by a `Search` (Lucide) icon button. Tapping it opens a full-width search overlay using the existing `fadeIn` + `scaleIn` motion variants at `--z-overlay` (300). The overlay contains an M6 SearchBar in a dedicated mobile context; submitting routes to `/explore?q=`. On `md+`, the SearchBar remains inline as specified. Detection is purely breakpoint-based (no pointer media query needed for this ADR).

**Component(s):** O5 Preset Detail  
**Question:** Product Spec §6.3 describes the Preset Page hero as a "HERO SPLIT LAYOUT" (60% video, 40% metadata). The Design System §17 O5 says "HERO (sticky on scroll)." Does the entire hero split stick, or only the metadata column (so the video scrolls away but the download CTA remains visible)?  
**Source:** Product Spec §6.3, Design System §17 O5  
**Options:**
1. Entire hero (both video + metadata) sticks as a unit on scroll — user can always see the video
2. Only the metadata/CTA column sticks — video scrolls away, download button stays in view
3. Neither sticks — standard scroll behavior, user scrolls past the hero to comments  
**Status:** RESOLVED: Option 2. "HERO (sticky on scroll)" means only the **40% metadata/CTA column** is `position: sticky; top: 64px` (Top Bar height). The video player (60% left column) scrolls away normally once the user has seen it. The download CTA and creator metadata remain in view throughout comments and related-presets reading. Sticky behaviour applies at `md+` only — on `xs`/`sm` the stacked single-column layout renders metadata below the video and sticky is not applied. The comments `id="comments"` anchor requires `scroll-margin-top: 64px` to avoid the sticky column obscuring focus on keyboard navigation.

**Component(s):** O6 Profile Header  
**Question:** The banner ratio is specified as "6:1" in Design System §17 O6, but the Product Spec §6.4 Profile Page describes it only as "full-width." The Design System §9 Responsive Breakpoints section references banner height in a table (inferred during atom documentation) but this was not confirmed in the truncated section. Is the 6:1 banner ratio correct and responsive (does it change at mobile breakpoints)?  
**Source:** Design System §17 O6  
**Options:**
1. Fixed 6:1 at all breakpoints — banner is very short on mobile (e.g. at 375px wide, banner is only 62px tall)
2. 6:1 desktop, 4:1 tablet, 3:1 mobile — scales the banner height for mobile legibility
3. Fixed height (e.g. 200px desktop, 140px mobile) rather than aspect ratio  
**Status:** OPEN

---

## ADR-021 *(added during 03-organisms.md authoring)*

**Component(s):** O6 Profile Header  
**Question:** The banner ratio is specified as "6:1" in Design System §17 O6, but the Product Spec §6.4 Profile Page describes it only as "full-width." Is the 6:1 banner ratio correct and responsive (does it change at mobile breakpoints)? A 6:1 ratio at 375px wide produces a banner only 62px tall — very short on mobile.  
**Source:** Design System §17 O6, `03-organisms.md` O6 Responsive Behavior section  
**Options:**
1. Fixed 6:1 at all breakpoints — banner is very short on mobile
2. 6:1 desktop, 4:1 tablet, 3:1 mobile — scales the banner height for mobile legibility
3. Fixed height (e.g. 200px desktop, 140px mobile) rather than aspect ratio  
**Status:** RESOLVED: Option 2. Banner uses responsive aspect ratios: `xs`/`sm` → **3:1** (125px at 375px wide), `md` → **4:1** (192px at 768px wide), `lg+` → **6:1** (per Design System spec). Rationale: 3:1 on mobile gives enough visual presence for the creator banner without dominating the narrow viewport; 4:1 at tablet is a natural intermediate step. Implemented via CSS `aspect-ratio` property on the banner container at each breakpoint. No new design tokens required.

---

## ADR-022 *(added during 03-organisms.md authoring)*

**Component(s):** O9 Creator Dashboard  
**Question:** The area chart (Downloads over time) is specified in Product Spec §6.6 and Design System §17 O9, but the exact chart library is not named. Product Spec §12 Folder Structure shows no charting library in `package.json`. What charting library should be used?  
**Source:** Product Spec §6.6, §11 Animation Catalog ("Chart: line draws left-to-right, 800ms ease-out")  
**Options:**
1. Recharts — most popular React charting library, easy to style with CSS variables
2. Victory — more composable, slightly heavier
3. Chart.js (via react-chartjs-2) — highly capable, requires canvas
4. Custom SVG — full control, significant build cost  
**Status:** RESOLVED: Option 1. **Recharts** is the charting library for O9 Creator Dashboard. Rationale: best balance of React-native API, CSS variable compatibility for the design token system, broad community, and lightest runtime footprint for the mobile-primary audience. The `AreaChart` component handles the "Downloads over time" chart with `linearGradient` fill matching `--gradient-primary`. Required change: add `recharts` to `package.json` dependencies. The chart must include a visually-hidden `<table>` or `<details>` alternative for screen reader users, and `role="img" aria-label="Downloads over time chart, [period]"` on the chart container.

---

## ADR-023 *(added during 03-organisms.md authoring)*

**Component(s):** O10 Challenge Card (Hero)  
**Question:** The countdown timer shows `[03d] [14h] [22m]`. Does it include seconds? Live-updating seconds would cause a constant re-render that may be distracting (violation of DS §1.5 "nothing loops unless it communicates live state"). Days + hours + minutes updating once per minute seems appropriate.  
**Source:** Design System §17 O10  
**Options:**
1. `dd:hh:mm` only, updates every 60 seconds — calm, accurate enough
2. `dd:hh:mm:ss` — live, exact, potentially distracting
3. Hybrid: show seconds only in the final hour  
**Status:** RESOLVED: Hybrid countdown — **`dd:hh:mm` updating every 60 seconds by default; seconds (`ss`) unit appears and updates every second only during the final 10 minutes before the challenge ends.** Rationale: matches the approved hybrid spirit while using 10 minutes (not 1 hour) as the threshold — tight enough that seconds are meaningful urgency signals, not a constant distraction. Implementation: the countdown component tracks remaining time in state; when `timeRemaining < 600s`, it switches the display format to `mm:ss` (at under 10 min, days/hours are zero, so they are hidden automatically) and changes the update interval from 60s to 1s. Accessibility: `role="timer"` on the container; `aria-live="off"` at all times to avoid disruptive screen reader announcements; a visually-hidden `<span>` provides the static human-readable end date.

---

---

## ADR-024 *(added during 04-templates.md authoring)*

**Component(s):** T2 PublicLayout — Footer  
**Question:** The Footer is not specified in either the Product Specification or the Design System. The Site Map (§3) ends at routes without mentioning a Footer. A footer anatomy was inferred for `04-templates.md` based on standard creative-platform conventions (logo + tagline, Explore/Creator/Company link columns, copyright, social links). Are the inferred footer structure and content approved?  
**Source:** `04-templates.md` T2 PublicLayout, inferred during template documentation  
**Inferred anatomy pending approval:**
```
[PresetHub logo]   "The home of Alight Motion creators."

Links:             Explore · Trending · Challenges · Creators
Creators:          Upload · Dashboard · Docs (future)
Company:           About · Blog (future) · Contact

© 2026 PresetHub. All rights reserved.   [TikTok] [Discord] [Instagram]
```
**Options:**
1. Approve the inferred footer structure as documented
2. Specify a different footer structure (simpler, or with additional sections)
3. Defer footer entirely — ship Phase 0 without a footer, add later  
**Status:** RESOLVED: Option 1. The inferred footer structure is approved as documented in `04-templates.md` T2 PublicLayout. Footer anatomy:
```
[PresetHub logo]   "The home of Alight Motion creators."

Links:             Explore · Trending · Challenges · Creators
Creators:          Upload · Dashboard · Docs (future)
Company:           About · Blog (future) · Contact

© 2026 PresetHub. All rights reserved.   [TikTok] [Discord] [Instagram]
```
Responsive layout: 4-column grid at `lg+`; 2-column grid at `md`; single-column stacked at `xs`/`sm`. The footer is ready for implementation as specified in T2.

---

## ADR-025 *(added during 04-templates.md authoring)*

**Component(s):** T2 PublicLayout — PublicHeader (mobile)  
**Question:** Neither source doc specifies the PublicHeader's mobile navigation pattern. On `xs`/`sm`, there is insufficient horizontal space for all nav links (Browse Presets, Trending, Challenges) plus "Log In" and "Get Started" CTAs in a single header row. A hamburger-menu drawer is the standard convention but is not defined in the source documents.  
**Source:** `04-templates.md` T2 PublicLayout Accessibility and Responsive Behavior sections  
**Options:**
1. Hamburger icon opens a full-screen or slide-in drawer containing all nav links + auth CTAs — most common pattern, requires a drawer overlay component
2. Simplified header: only the logo + "Get Started" CTA on mobile, no navigation links (visitors on mobile either sign up or browse, not navigate)
3. Bottom tab bar equivalent for public mobile (Home · Explore · Trending · Log In) — mirrors the O2 MobileNav convention from T1  
**Status:** RESOLVED: Option 1. On `xs`/`sm`, the PublicHeader collapses to **Logo + Hamburger icon button + "Get Started" CTA**. Tapping the hamburger opens a full-screen slide-in drawer from the right containing all nav links (Browse Presets, Trending, Challenges) plus the "Log In" and "Get Started" auth CTAs, stacked vertically as full-width tap targets. The drawer uses the existing `slideInRight` motion variant at `--z-overlay` (300), matching the O1 sidebar drawer pattern established in ADR-018. A backdrop tap or the `×` close button collapses it. Focus is trapped within the drawer while open; Escape closes it and restores focus to the hamburger button. The "Get Started" CTA remains pinned in the header row (not only inside the drawer) as the primary conversion trigger on mobile — it is the most important element on a marketing page and must always be visible.

---

## ADR-026 *(added during 04-templates.md authoring)*

**Component(s):** T4 AdminLayout — AdminSidebar (mobile)  
**Question:** Neither source doc specifies a mobile navigation pattern for the admin panel. Admin usage is expected to be primarily desktop (moderation is a desk task), but the layout must degrade gracefully on mobile. Several options exist, ranging from a minimal hamburger drawer to simply declaring the admin panel desktop-only.  
**Source:** `04-templates.md` T4 AdminLayout Responsive Behavior section  
**Options:**
1. Hamburger icon opens a full-width drawer with the AdminSidebar contents on `xs`/`sm` — standard pattern, low cost
2. Admin panel is explicitly desktop-only: a full-screen "Please use a desktop browser for moderation tasks" message replaces the layout on `xs`/`sm` — acceptable given the use case
3. AdminSidebar collapses to a top-positioned tab row (3 tabs: Moderation · Reports · Featured) on mobile — compact and functional for the small admin nav  
**Status:** RESOLVED: Option 2. The admin panel is explicitly **desktop-only**. On `xs`/`sm`, T4 AdminLayout renders a full-screen interstitial message replacing the layout: "Moderation tools are designed for desktop. Please switch to a desktop browser to access the admin panel." The interstitial shows the PresetHub logo, the message, and a link back to `/`. Rationale: admin moderation is a desk task; forcing it onto mobile would produce a degraded, unusable experience. This is a documented, intentional constraint — not a gap. No mobile implementation of AdminSidebar is required. The desktop-only restriction is enforced at the T4 template level via a CSS `@media (max-width: 767px)` rule that renders the interstitial and hides the admin layout.

---

## ADR-027 *(added during 05-overlays-feedback.md authoring)*

**Component(s):** F1 Toast  
**Question:** Neither source doc specifies whether a Toast shows a visible countdown or progress indicator for its 4s auto-dismiss timer (e.g. a thin depleting bar along one edge, similar to the pattern used by many toast libraries). The "pause on hover" behavior (verbatim Design System §17 F1) is more discoverable to sighted users if the remaining time is visible.  
**Source:** `05-overlays-feedback.md` F1 Toast States section  
**Options:**
1. No visible timer — current spec as written; auto-dismiss is silent, hover-pause is a quiet affordance for users who notice it
2. Thin progress bar along the toast's bottom or top edge, depleting over 4s, pausing in sync with hover-pause — adds a small amount of visual complexity but makes the timing behavior legible
3. Progress indicator only on `error`/`warning` variants (where the message matters most) — `success`/`info` remain timer-less  
**Status:** OPEN

---

## ADR-028 *(added during 05-overlays-feedback.md authoring)*

**Component(s):** F1 Toast  
**Question:** On `xs`/`sm`, the maximum-3-toasts stack grows upward from the bottom (above O2 MobileNav). On small viewports, three stacked toasts could occupy a significant fraction of the screen and may overlap key interactive elements (e.g. a form's submit button sitting low on the page). Neither source doc addresses this mobile overflow scenario or specifies whether the oldest toast should be force-dismissed earlier than usual to protect underlying UI.  
**Source:** `05-overlays-feedback.md` F1 Toast Responsive Behavior section  
**Options:**
1. No special handling — accept that 3 stacked toasts may occasionally overlap mobile UI; this matches desktop's blanket "max 3" rule with no exceptions
2. Reduce the mobile maximum to 2 visible toasts (still queuing up to 3, but rendering fewer at once) to reduce screen coverage on small viewports
3. Detect overlap with focusable elements at render time and force-dismiss the oldest toast early if a collision is detected — more correct, meaningfully higher implementation cost for a rare scenario  
**Status:** OPEN

---

## ADR-029 *(added during 05-overlays-feedback.md authoring)*

**Component(s):** F1 Toast  
**Question:** The `warning` variant's border is specified as `--color-border-error`-equivalent treatment for `error`, and `--color-border-success` for `success`, but no `--color-border-warning` token exists in the Design System's semantic token map (§14–16). `warning` currently falls back to the neutral `--color-border-default`, which makes the `warning` toast's border visually indistinguishable from the `info` toast's border (`info` also uses `--color-border-default`) — even though `warning` and `info` have different icon colors and meanings. Should a dedicated `--color-border-warning` token be added?  
**Source:** `05-overlays-feedback.md` F1 Toast Design Tokens section  
**Options:**
1. Add `--color-border-warning` (likely derived from the existing `--color-text-warning` / `#FBBF24` amber) to the Design System's semantic token map — preferred, restores visual parity across all four variants
2. Keep `--color-border-default` for both `warning` and `info` — accept that border color alone doesn't differentiate them, since the icon (`AlertTriangle` vs `Info`) and icon color already do
3. Use `--color-border-warning` derived ad-hoc in component code (`#FBBF24` at reduced opacity) without formalizing it as a named token — inconsistent with the token-first approach used elsewhere  
**Status:** OPEN

---

## ADR-030 *(added during 05-overlays-feedback.md authoring)*

**Component(s):** F2 Modal / Dialog (and F5 Badge Unlock Overlay, F6 Confirmation Dialog, which inherit F2's responsive behavior)  
**Question:** On `xs`/`sm`, this documentation set assumes a bottom-sheet pattern for Modal (`size="sm"`/`"md"`/`"lg"`): full-width, sliding up from the bottom of the viewport, rounded top corners only. This is a common and idiomatic mobile pattern and aligns with the Design System's "Tactile Feedback" design principle, but neither the Product Specification nor the Design System explicitly specifies a bottom-sheet treatment for modals on mobile — the alternative is a conventional centered floating panel at a reduced width (e.g. `90vw × auto`, vertically centered like desktop just narrower). For `size="lg"` specifically, a full-height bottom sheet with a drag-handle indicator was also assumed without confirmation.  
**Source:** `05-overlays-feedback.md` F2 Modal Responsive Behavior section  
**Options:**
1. Confirm the bottom-sheet pattern as documented (slide up from bottom, rounded top corners, drag-handle + near-full-height for `size="lg"`) — matches mobile platform conventions (iOS action sheets, Android bottom sheets)
2. Centered floating panel at reduced width on `xs`/`sm` for all sizes — simpler to implement (one positioning scheme across all breakpoints), less "native-feeling" on mobile
3. Bottom-sheet for `sm`/`md` sizes only; `lg` and `fullscreen` always behave as documented (full-height / full-viewport) regardless of breakpoint — a hybrid  
**Status:** OPEN — affects F2, F5, and F6 simultaneously since all three share F2's responsive behavior

---

## ADR-031 *(added during 05-overlays-feedback.md authoring)*

**Component(s):** F4 Tooltip, M9 BadgeChip  
**Question:** The Design System §17 F4 spec states tooltips support "Max 80 characters (longer → use Popover)," but no Popover component is defined anywhere in the Product Specification, Design System, or this Component Library set. This creates a real gap: M9 BadgeChip's tooltip (per Product Spec §19, badges should have a description that "explains how to earn them") may need to show a badge name plus an earning-condition sentence that plausibly exceeds 80 characters for some badges (e.g. multi-step Skill or Loyalty badges). Without a Popover component, BadgeChip's tooltip has nowhere to go once it outgrows Tooltip's stated limit.  
**Source:** `05-overlays-feedback.md` F4 Tooltip Accessibility and Composition Examples sections  
**Options:**
1. Define a new F7 Popover component (richer content, optional close button, can contain more than 80 characters of text, but still non-modal) — closes the gap properly but introduces a net-new overlay component not in Design System §17, requiring design review before it could be added to the system
2. Relax the 80-character guidance specifically for M9 BadgeChip's tooltip on a case-by-case basis, treating it as a documented exception rather than building a new component
3. Keep tooltips strictly at 80 characters and require all badge descriptions to be authored/truncated to fit — pushes the constraint to content/copy rather than UI  
**Status:** OPEN — requires design decision on whether a Popover component is in scope

---

## ADR-032 *(added during 05-overlays-feedback.md authoring)*

**Component(s):** F5 Badge Unlock Overlay  
**Question:** A single user action can trigger more than one badge unlock in the same moment (e.g. uploading a preset for the first time may simultaneously satisfy "First Upload" and, once it receives its first download shortly after, "First Download" — or multiple milestone thresholds crossed in one event). Neither source doc specifies how F5 should behave when multiple badges are earned at once: shown one at a time in sequence, combined into a single multi-badge overlay, or something else.  
**Source:** `05-overlays-feedback.md` F5 Badge Unlock Overlay Composition Examples / States section  
**Options:**
1. Queue overlays and show them one at a time in sequence with a brief pause between each (as currently assumed in `05-overlays-feedback.md`) — consistent, reuses the single-badge overlay design unmodified, but can feel repetitive if 3+ badges unlock at once
2. A dedicated multi-badge variant of F5 that shows all newly-earned badges in a single overlay (e.g. a small grid or carousel of badge icons) — better for simultaneous unlocks, but is a new visual variant not specified anywhere in the source docs
3. Cap the sequential queue at 2 overlays; any additional simultaneous badges are summarized in a single F1 Toast ("+ 2 more badges earned") instead of full overlays — balances ceremony against modal fatigue  
**Status:** OPEN

---

## ADR-033 *(added during 05-overlays-feedback.md authoring)*

**Component(s):** F6 Confirmation Dialog (Unfollow context)  
**Question:** The Design System §17 lists "Unfollow" as one of F6's four use-case contexts, alongside genuinely irreversible actions (delete preset, account deletion). Unfollowing is fully reversible — the user can follow again immediately with no data loss — which puts it in a different risk category than the dialog's other use cases. Whether a full modal confirmation is the right friction level for Unfollow, versus a lighter-weight pattern (e.g. the Follow/Following button itself handling an inline confirm-on-click, similar to a "press again to confirm" affordance), is unresolved.  
**Source:** `05-overlays-feedback.md` F6 Confirmation Dialog Props section  
**Options:**
1. Keep Unfollow on F6 as documented, using `severity="warning"` (already differentiated visually from `severity="danger"` delete flows) — simplest, one confirmation pattern for all four contexts, consistent user mental model
2. Remove Unfollow from F6 entirely; the Follow/Following toggle button (per M2 CreatorCard's Follow button states) handles its own lightweight confirm pattern — less friction for a fully-reversible action, but introduces a second, divergent confirmation pattern in the system
3. Make F6's appearance for Unfollow conditional: skip the dialog for users who unfollow rarely-engaged accounts, but still show it when unfollowing someone the user has high interaction history with — clever but unspecified anywhere and adds meaningful logic complexity for a low-stakes action  
**Status:** OPEN

---

## ADR-034 *(added during 05-overlays-feedback.md authoring)*

**Component(s):** F6 Confirmation Dialog (Account Deletion context)  
**Question:** Account deletion is F6's most severe use case (Design System §17: "permanently deleted" presets, downloads, and profile). Neither source doc specifies whether this particular destructive action warrants an additional friction layer beyond the standard Cancel/Confirm pattern — e.g. requiring the user to type "DELETE" or their own username into a text field before the destructive Confirm button becomes enabled, a common pattern for the most irreversible actions in software.  
**Source:** `05-overlays-feedback.md` F6 Confirmation Dialog Responsive Behavior section  
**Options:**
1. Add a typed-confirmation step (type "DELETE" or username) specifically for the Account Deletion variant only — F6 gains an optional `requireTypedConfirmation?: { phrase: string }` prop used solely by this one context; Confirm button stays disabled until the input matches
2. No typed confirmation — standard Cancel/Confirm F6 pattern suffices for all contexts including account deletion, relying on the existing "This cannot be undone." copy and `severity="danger"` styling as sufficient friction
3. Typed confirmation plus a secondary step: after typing the confirmation phrase, a follow-up email link must be clicked to finalize deletion — maximum safety, but introduces an asynchronous multi-step flow not described anywhere in the Product Specification's account settings flow  
**Status:** OPEN — highest severity of any open ADR; recommend resolving before `/settings/account` deletion flow is implemented

---

## ADR-035 *(added during 06-compound-components.md authoring)*

**Component(s):** CC1 Preset Upload Drop Zone  
**Question:** Neither the Product Specification nor the Design System states a maximum file size for the `.xml` preset file or QR code image upload, nor the precise accepted MIME types beyond the general description "QR code image." The Upload Architecture (§12) step-by-step names Supabase Storage as the destination for the XML/QR file but doesn't constrain its size. Without a documented ceiling, CC1's `invalid` state (and any user-facing error copy like "File too large") has nothing concrete to validate against.  
**Source:** `06-compound-components.md` CC1 Props section  
**Options:**
1. Set a conservative, generous ceiling (e.g. 5MB) sufficient for any realistic `.xml` preset file or QR image, enforced client-side in CC1 before upload and server-side at the Supabase Storage layer — standard belt-and-suspenders validation
2. No client-side limit at all; rely entirely on Supabase Storage's own bucket-level size policy and surface whatever error it returns — simpler to implement, but produces a less specific/helpful error message for the user
3. Different limits per file type — a tighter cap for QR images (which are small, simple images) than `.xml` files (which could theoretically be larger depending on preset complexity)  
**Status:** OPEN

---

## ADR-036 *(added during 06-compound-components.md authoring)*

**Component(s):** CC2 Tag Input  
**Question:** The Product Specification's `presets` table (§4) defines two separate array columns — `tags text[]` and `style text[]` ("multi-tag style array") — but every page-level and component-level spec describing tag entry (Upload Wizard §6.5, Design System CC2, this library's O7 cross-reference) describes only a single tag-entry control capped at 10 tags. It's unresolved whether `style` is a second, currently-undocumented field the Upload Wizard is missing, a deprecated/legacy column no longer driven by any UI, or something CC2 is meant to dual-write to under some heuristic.  
**Source:** `06-compound-components.md` CC2 Props section  
**Options:**
1. `style` is a legacy/deprecated column, no longer written to by any current UI — confirm and consider flagging for removal in a future schema migration (out of scope for this documentation set, but worth noting to engineering)
2. `style` is a second, currently-missing Upload Wizard field (e.g. a smaller, curated style-tag picker distinct from freeform `tags`) — Step 2 needs an additional field added to its spec, and a new CC component (or a CC3-Category-Picker-style fixed-option control) to back it
3. `tags` and `style` are meant to be populated from the same single CC2 input, split by some rule (e.g. tags matching a known "style" vocabulary list go to `style`, everything else to `tags`) — technically possible but adds hidden complexity to what the UI presents as one simple field  
**Status:** OPEN — affects whether O7 Upload Wizard's Step 2 field list (`03-organisms.md`) is complete as currently documented

---

## ADR-037 *(added during 06-compound-components.md authoring)*

**Component(s):** CC2 Tag Input  
**Question:** CC2's verbatim Design System purpose statement is "Multi-tag entry with suggestions," and its behavior list states it "shows suggestions dropdown from existing tags." No endpoint for retrieving the platform's existing/distinct tag set is named anywhere in Product Spec §16 API Reference. Without a data source, the `suggestions` prop in CC2's contract has nothing to be populated from.  
**Source:** `06-compound-components.md` CC2 Composition Examples section  
**Options:**
1. Add a new endpoint (e.g. `GET /api/tags?q=` returning the most popular/matching existing tags) to the Product Specification's API Reference — closes the gap directly, but is a new API surface requiring backend work
2. Derive suggestions client-side from a static, curated starter list (e.g. genre/style terms common to Alight Motion presets) shipped with the app rather than a live "existing platform tags" query — simpler, but doesn't fulfill the verbatim "existing tags" framing, since it wouldn't reflect tags creators have actually used
3. Suggestions are sourced from `presets.tags` via a lightweight distinct-values query exposed through an existing endpoint's query parameter rather than a dedicated new route — minimal API surface change  
**Status:** OPEN

---

## ADR-038 *(added during 06-compound-components.md authoring)*

**Component(s):** CC5 Image Cropper  
**Question:** Product Spec §12 "Cloudinary Transformations" shows fixed transform strings (e.g. `/upload/w_800,h_600,c_fill,q_auto,f_webp/{public_id}`) applied to an uploaded image, where `c_fill` is Cloudinary's own automatic center-weighted crop. This doesn't obviously account for an arbitrary, user-chosen crop region selected inside CC5 (drag-to-reposition + zoom). It's unresolved whether CC5 (a) uploads the raw source image and sends crop coordinates as separate metadata for a custom server-side transform, (b) renders the crop client-side onto a canvas and uploads only the already-cropped result (making Cloudinary's `c_fill` just a safety-net resize, not the "real" crop), or (c) some other handoff entirely.  
**Source:** `06-compound-components.md` CC5 Props section  
**Options:**
1. Client-side canvas crop + upload of the final cropped image only — Cloudinary's `c_fill`/`g_auto` transforms become a no-op safety net (the image is already 4:3), simplest to reconcile with the existing fixed transform strings, no new API surface
2. Upload the raw source image plus crop coordinates as upload metadata; have the API apply a custom Cloudinary transform using `x_`, `y_`, `w_`, `h_` (Cloudinary's manual-crop parameters) instead of `c_fill` for thumbnail uploads specifically — preserves full source-image quality server-side but requires changing the documented transform strings
3. Hybrid: client-side crop preview only (what the user sees in CC5's live Preview), but the actual upload still sends the full source image and lets Cloudinary's `c_fill`/`g_auto` (gravity: auto, face/subject-aware) make the final call — CC5's crop becomes advisory rather than authoritative, which may visually mismatch what the user approved  
**Status:** OPEN — blocks a confident implementation of CC5's upload step

---

## ADR-039 *(added during 06-compound-components.md authoring)*

**Component(s):** CC7 Search Results  
**Question:** The Site Map (Product Spec §3) lists `/explore` ("Browse all presets") as a route, and §6.7 "Explore Page" describes a hero search bar, filter bar, sort bar, and masonry grid — a structure nearly identical to CC7's own verbatim spec ("Query display + result count," "Filter bar," "Sort," "Masonry grid of results," "Empty state"). A `GET /api/search` endpoint exists (§16), but no dedicated `/search` route appears anywhere in the Site Map. It's unresolved whether CC7 (a) is simply the Explore Page itself once a query is present (`/explore?q=...`), with no separate component needed, (b) is a distinct, currently-unlisted `/search` page that the persistent Top Bar SearchBar (M6) navigates to, kept separate from `/explore`'s category-driven browsing, or (c) some hybrid split between filter-driven browsing and free-text query results.  
**Source:** `06-compound-components.md` CC7 Props section  
**Options:**
1. CC7 **is** the Explore Page's query-populated state — no new route; add a note to Product Spec §6.7 clarifying that the hero search bar, when submitted, doesn't navigate anywhere, it just re-renders the same page with `?q=` populated and the masonry grid filtered to matches. Site Map needs no change.
2. CC7 is a distinct `/search` route, separate from `/explore` — add `/search` to the Site Map (§3) as a new entry, and clarify how/when each entry point (Top Bar SearchBar vs. Explore Page's own hero search) is used so they aren't two competing front doors to the same data
3. Merge the two specs formally: retire `06-compound-components.md`'s standalone CC7 entry as effectively a documentation note on top of `03-organisms.md`'s (currently nonexistent) Explore Page organism — would require adding an Explore Page organism to `03-organisms.md` that this file then cross-references, rather than documenting CC7 as if it were independent  
**Status:** OPEN — the most structurally significant open question in this documentation set; affects the Site Map itself, not just a single component's internals

---

*PresetHub Architecture Decisions Backlog v1.0*  
*Prepared June 2026*  
*Update status fields as decisions are made; do not delete resolved entries.*
