# PresetHub — UI Component Library

### Companion to: `PresetHub_Product_Specification.md` + `PresetHub_Design_System.md`

**Classification:** Internal Design + Engineering Reference
**Status:** Canonical — do not alter without design review
**Audience:** Product Design, Frontend Engineering
**Stage:** Documentation complete (`00`–`06`). No implementation code has been written against this library yet.

---

## Purpose of This Document Set

The Design System (`PresetHub_Design_System.md`, Section 17) defines every component PresetHub uses, but coverage is uneven: atoms like `Button` and molecules like `PresetCard` are specified in depth, while several molecules and most organisms are missing **Accessibility**, **Responsive behavior**, **Motion behavior**, and **Composition examples**.

This component library closes that gap. It is the single place engineering should look to build a component correctly the first time, without re-deriving behavior from the product spec or guessing at a pattern that "feels right."

**This is documentation only.** No React, Next.js, or Tailwind implementation code appears in this set. Code samples that exist are TypeScript interfaces (props contracts) and CSS/token references already established in the Design System — not component implementations.

## Governing Rule

**Nothing in this document set introduces a new visual language, a new component, or a new variant that isn't already implied by the Product Specification or Design System.**

Where the source docs already fully specify a component (e.g. A1 Button, M1 PresetCard), that specification is **preserved verbatim** below and only the missing dimensions are appended. Where the source docs only sketch a component (e.g. M5 NotificationItem, O9 Creator Dashboard), this document fills in the full nine-part template using only:

- Tokens defined in Design System §2–6, §14–16
- Icons defined in Design System §7
- Motion primitives defined in Design System §10–11
- A11y rules defined in Design System §13
- Breakpoints defined in Design System §9
- Data shapes defined in Product Specification §4 (Database Schema)

If a decision isn't traceable to one of those sources, it is flagged inline as **[OPEN QUESTION]** rather than invented.

## Per-Component Template

Every component entry follows this nine-part structure:

1. **Purpose** — What problem it solves, in one or two sentences
2. **Variants** — All visual/behavioral variations
3. **Props** — TypeScript interface (contract, not implementation)
4. **States** — Every interactive state and its visual treatment
5. **Accessibility** — Required ARIA, keyboard behavior, focus handling, contrast notes
6. **Responsive Behavior** — How the component changes across breakpoints (`xs`→`2xl`)
7. **Motion Behavior** — Which motion tier it belongs to, exact durations/easings, reduced-motion fallback
8. **Design Tokens** — Exact token names used (color, spacing, radius, shadow, font) — no raw hex/px in component code
9. **Composition Examples** — Where this component is used in the product, and which other components it's typically composed with

## File Index

| File | Contents |
|---|---|
| `01-atoms.md` | Button, Input, Textarea, Avatar, Badge, Tag, Icon, Skeleton, Spinner, Divider |
| `02-molecules.md` | PresetCard, CreatorCard, StatCard, CommentItem, NotificationItem, SearchBar, FilterChip, XPProgressBar, BadgeChip, VideoPlayer, DownloadButton |
| `03-organisms.md` | Navigation Sidebar, Mobile Bottom Nav, Top Bar, PresetGrid, Preset Detail, Profile Header, Upload Wizard, Comment Thread, Creator Dashboard, Challenge Card, Leaderboard Panel |
| `04-templates.md` | AppLayout, PublicLayout, AuthLayout, AdminLayout |
| `05-overlays-feedback.md` | Toast, Modal/Dialog, Dropdown Menu, Tooltip, Badge Unlock Overlay, Confirmation Dialog |
| `06-compound-components.md` | Preset Upload Drop Zone, Tag Input, Category Picker, Markdown Editor, Image Cropper, Follower/Following List, Search Results |

## Versioning Note

Component IDs (A1, M1, O1, T1, F1, CC1, …) are inherited from Design System §17 to keep cross-references stable. Any component added here that has **no** corresponding ID in the Design System is marked `[NEW — DOCUMENTATION GAP FILL]` and still requires design review before implementation, since by definition it wasn't pre-approved in the canonical spec.

## Open Questions

Every `[OPEN QUESTION]` flagged inline across `01`–`06` is tracked as a numbered entry in the companion file `ARCHITECTURE_DECISIONS.md` (currently ADR-001 through ADR-039). That file, not this one, is the place to check before assuming any gap-filled behavior is final.

---

*PresetHub UI Component Library v1.0*
*Companion to Motion Studio Design System v1.0*
*Prepared June 2026*
