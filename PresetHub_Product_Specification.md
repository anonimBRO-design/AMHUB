# PresetHub — Complete Product Specification
### "The home of Alight Motion creators."

**Version:** 1.0 — June 2026  
**Classification:** Internal Product Bible  
**Audience:** Founder, Engineering, Design, Product

---

## TABLE OF CONTENTS

1. Product Vision
2. User Personas & Journey Maps
3. Information Architecture
4. Database Schema
5. Feature Roadmap
6. UI Pages
7. Component Architecture
8. Design System
9. Color Palette
10. Typography System
11. Animation System
12. Folder Structure
13. API Architecture
14. Security Architecture
15. Moderation System
16. Upload Workflow
17. Recommendation Algorithm
18. Trending Algorithm
19. Gamification System
20. Creator Economy
21. Future Roadmap

---

# 1. PRODUCT VISION

## The Problem

Alight Motion creators today share their work across fragmented, inadequate channels: Discord servers with no discovery, Google Drive links buried in TikTok bios, Telegram groups with zero curation. There's no place that makes a creator feel *proud* to post their work. There's no stage.

## The Opportunity

The Alight Motion creator ecosystem is real, large, and underserved. These are people who spend hours crafting motion presets — color grades, velocity edits, anime transitions — and they share them in places that don't honor the craft. The moment you give them a beautiful home, they will move in.

## The Mission

**PresetHub is not a download site. It is a creative network.**

Like GitHub for developers, Dribbble for designers — PresetHub becomes the professional address of every Alight Motion creator. When someone is serious about the craft, they have a PresetHub profile.

## The Promise

- **To creators:** "Your work deserves a stage. PresetHub is the biggest audience you'll ever have."
- **To users:** "Stop scrolling Discord at 2am looking for the right preset. Everything worth finding is here."

## Design Philosophy

Every decision is held against three filters:

1. **Does this make creators proud?** If uploading feels like publishing, creators invest in quality.
2. **Does this make users come back tomorrow?** Discovery must feel infinite and always fresh.
3. **Does this feel premium?** One moment of jank or cheapness breaks trust permanently.

The product must feel like Apple designed a creative community and Discord made it social.

---

# 2. USER PERSONAS & JOURNEY MAPS

## Persona 1 — Reza, The Velocity Editor (Creator)

- 19 years old, Indonesian
- Makes velocity edits for TikTok, 50K followers
- Currently shares presets in his Discord server (400 members)
- Frustration: "I spend 3 hours on a preset and share it in a Drive link. It dies in 2 days."
- Goal: Recognition, community, something to point to on his bio

**Journey:**
```
Discovers PresetHub → Creates profile (5 min onboarding) 
→ Uploads his best velocity preset with thumbnail + video preview
→ Gets notified: 200 downloads in 24h, 47 likes
→ Checks his analytics dashboard
→ Earns "Rising Creator" badge
→ Shares his PresetHub profile on TikTok
→ Returns daily to check comments and discover other creators
```

## Persona 2 — Dinda, The Beginner (Consumer)

- 15 years old, wants to make anime edits
- Has Alight Motion installed but doesn't know where to start
- Currently watches YouTube tutorials and begs in Discord servers for presets
- Frustration: "I never know if a preset will work on my version of Alight Motion"
- Goal: Find quality presets that actually work, learn the craft

**Journey:**
```
Finds PresetHub via TikTok → Lands on trending page
→ Sees a beautiful anime transition with preview video
→ Version compatibility badge says "AM 5.0+" — she has 5.1, good
→ One-tap download via QR code
→ Creates account to bookmark more presets
→ Starts following 3 creators
→ Returns next week for the Weekly Challenge results
```

## Persona 3 — Malik, The Motion Graphics Creator (Power User)

- 24 years old, freelancer
- Creates high-quality professional presets, sells some privately
- Frustrated that his work looks the same as a 13-year-old's basic upload
- Goal: Differentiation, visibility, potential income

**Journey:**
```
Joins PresetHub → Sees "Verified Creator" program
→ Uploads 10 carefully documented presets
→ Dashboard shows 5K downloads, analytics by country
→ Joins Weekly Challenge — wins Featured Creator spot
→ Sees "Creator Monetization" coming soon → signs up for waitlist
→ PresetHub becomes his portfolio, replaces his Carrd site
```

---

# 3. INFORMATION ARCHITECTURE

## Site Map

```
PresetHub
│
├── /                          → Landing Page (logged out) / Home Feed (logged in)
├── /explore                   → Browse all presets
├── /trending                  → Trending presets
├── /challenges                → Weekly challenges & contests
├── /creators                  → Creator directory
│
├── /preset/:slug              → Single preset page
├── /collection/:slug          → Curated collection page
│
├── /u/:username               → Public profile
├── /u/:username/presets       → Creator's presets
├── /u/:username/collections   → Creator's collections
│
├── /upload                    → Upload wizard (auth required)
│
├── /dashboard                 → Creator dashboard (auth required)
│   ├── /dashboard/analytics   → Stats + charts
│   ├── /dashboard/presets     → Manage uploads
│   ├── /dashboard/collections → Manage collections
│   └── /dashboard/settings    → Profile settings
│
├── /notifications             → Notification feed
├── /bookmarks                 → Saved presets
│
├── /auth/login                → Sign in
├── /auth/register             → Sign up
├── /auth/callback             → OAuth callback
│
├── /settings                  → Account settings
│   ├── /settings/profile
│   ├── /settings/account
│   ├── /settings/notifications
│   └── /settings/privacy
│
└── /admin                     → Admin panel (staff only)
    ├── /admin/moderation
    ├── /admin/reports
    └── /admin/featured
```

## Navigation Structure

**Primary Nav (Authenticated):**
- Home (feed) · Explore · Trending · Challenges

**Secondary Nav:**
- Notifications · Bookmarks · Upload · Profile menu

**Mobile Nav:**
- Bottom tab bar: Home · Explore · [Upload FAB] · Challenges · Profile

---

# 4. DATABASE SCHEMA

## Technology: PostgreSQL via Supabase

All tables use `uuid` primary keys. `created_at` and `updated_at` timestamps on all records.

---

### users
```sql
users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username        text UNIQUE NOT NULL,          -- @handle
  display_name    text NOT NULL,
  email           text UNIQUE NOT NULL,
  avatar_url      text,
  banner_url      text,
  bio             text,                           -- max 280 chars
  website_url     text,
  tiktok_handle   text,
  instagram_handle text,
  discord_handle  text,
  youtube_url     text,
  xp              integer DEFAULT 0,
  level           integer DEFAULT 1,
  is_verified     boolean DEFAULT false,
  is_staff        boolean DEFAULT false,
  country_code    char(2),                        -- ISO 3166-1
  auth_provider   text,                           -- email|google|discord
  last_active_at  timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)
```

### presets
```sql
presets (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,           -- url-safe name
  creator_id       uuid REFERENCES users(id) ON DELETE CASCADE,
  title            text NOT NULL CHECK (char_length(title) <= 100),  -- max 100 chars (ADR-017)
  description      text,                           -- markdown, max 2000 chars
  thumbnail_url    text NOT NULL,
  preview_video_url text,
  
  -- Upload format
  file_type        text NOT NULL,                  -- xml|qr|link
  file_url         text,                           -- XML file or QR image
  am_link          text,                           -- alight motion deep link
  
  -- Metadata
  category         text NOT NULL,                  -- velocity|transition|color|anime|gaming|lyric|etc
  style            text[],                         -- multi-tag style array
  tags             text[],
  difficulty       text DEFAULT 'beginner',        -- beginner|intermediate|advanced
  am_version_min   text,                           -- e.g. "4.0"
  am_version_max   text,                           -- null = all future
  device_support   text[],                         -- android|ios|both
  
  -- Stats (denormalized for performance)
  download_count   integer DEFAULT 0,
  view_count       integer DEFAULT 0,
  like_count       integer DEFAULT 0,
  bookmark_count   integer DEFAULT 0,
  comment_count    integer DEFAULT 0,
  
  -- Scoring
  trending_score   float DEFAULT 0,
  quality_score    float DEFAULT 0,               -- computed by algo
  
  -- Moderation
  status           text DEFAULT 'pending',         -- pending|published|rejected|removed
  is_featured      boolean DEFAULT false,
  featured_at      timestamptz,
  rejection_reason text,
  
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
)
```

### preset_likes
```sql
preset_likes (
  preset_id   uuid REFERENCES presets(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  PRIMARY KEY (preset_id, user_id)
)
```

### preset_bookmarks
```sql
preset_bookmarks (
  preset_id      uuid REFERENCES presets(id) ON DELETE CASCADE,
  user_id        uuid REFERENCES users(id) ON DELETE CASCADE,
  collection_id  uuid REFERENCES collections(id) ON DELETE SET NULL,
  created_at     timestamptz DEFAULT now(),
  PRIMARY KEY (preset_id, user_id)
)
```

### preset_downloads
```sql
preset_downloads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_id   uuid REFERENCES presets(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,  -- null = guest
  ip_hash     text,                                           -- hashed for dedup
  country     char(2),
  created_at  timestamptz DEFAULT now()
)
```

### comments
```sql
comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_id   uuid REFERENCES presets(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  parent_id   uuid REFERENCES comments(id) ON DELETE CASCADE, -- for replies
  body        text NOT NULL,                                   -- max 500 chars
  like_count  integer DEFAULT 0,
  is_pinned   boolean DEFAULT false,
  is_removed  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
)
```

### comment_likes
```sql
comment_likes (
  comment_id  uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (comment_id, user_id)
)
```

### follows
```sql
follows (
  follower_id  uuid REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
)
```

### collections
```sql
collections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  owner_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  cover_url    text,
  is_public    boolean DEFAULT true,
  preset_count integer DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
)
```

### collection_items
```sql
collection_items (
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  preset_id     uuid REFERENCES presets(id) ON DELETE CASCADE,
  added_at      timestamptz DEFAULT now(),
  sort_order    integer DEFAULT 0,
  PRIMARY KEY (collection_id, preset_id)
)
```

### badges
```sql
badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,                -- e.g. "first_upload"
  name        text NOT NULL,
  description text,
  icon_url    text,
  rarity      text DEFAULT 'common',               -- common|rare|epic|legendary
  xp_reward   integer DEFAULT 0
)
```

### user_badges
```sql
user_badges (
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE,
  badge_id   uuid REFERENCES badges(id) ON DELETE CASCADE,
  earned_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
)
```

### challenges
```sql
challenges (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  description  text,
  banner_url   text,
  theme        text,                               -- e.g. "Velocity Summer"
  starts_at    timestamptz NOT NULL,
  ends_at      timestamptz NOT NULL,
  status       text DEFAULT 'upcoming',            -- upcoming|active|judging|ended
  prize_xp     integer DEFAULT 500,
  entry_count  integer DEFAULT 0,
  created_at   timestamptz DEFAULT now()
)
```

### challenge_entries
```sql
challenge_entries (
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  preset_id    uuid REFERENCES presets(id) ON DELETE CASCADE,
  user_id      uuid REFERENCES users(id) ON DELETE CASCADE,
  vote_count   integer DEFAULT 0,
  rank         integer,
  submitted_at timestamptz DEFAULT now(),
  PRIMARY KEY (challenge_id, preset_id)
)
```

### notifications
```sql
notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  type        text NOT NULL,                       -- like|comment|follow|download|badge|challenge|system
  actor_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  preset_id   uuid REFERENCES presets(id) ON DELETE SET NULL,
  badge_id    uuid REFERENCES badges(id) ON DELETE SET NULL,
  message     text,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
)
```

### reports
```sql
reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  uuid REFERENCES users(id) ON DELETE CASCADE,
  preset_id    uuid REFERENCES presets(id) ON DELETE CASCADE,
  comment_id   uuid REFERENCES comments(id) ON DELETE SET NULL,
  reason       text NOT NULL,                      -- spam|stolen|inappropriate|misleading
  details      text,
  status       text DEFAULT 'open',                -- open|reviewed|resolved
  reviewed_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now()
)
```

### analytics_events
```sql
analytics_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event      text NOT NULL,                        -- page_view|preset_view|download|search
  user_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  preset_id  uuid REFERENCES presets(id) ON DELETE SET NULL,
  session_id text,
  properties jsonb,
  country    char(2),
  created_at timestamptz DEFAULT now()
)
-- Partition by created_at monthly for performance
```

---

### Key Indexes
```sql
-- Performance critical
CREATE INDEX idx_presets_creator ON presets(creator_id);
CREATE INDEX idx_presets_status_trending ON presets(status, trending_score DESC);
CREATE INDEX idx_presets_category ON presets(category) WHERE status = 'published';
CREATE INDEX idx_presets_tags ON presets USING GIN(tags);
CREATE INDEX idx_downloads_preset ON preset_downloads(preset_id, created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_analytics_preset ON analytics_events(preset_id, created_at);
```

---

# 5. FEATURE ROADMAP

## Phase 0 — Foundation (Weeks 1–6)
*Ship a product that is already better than anything that exists*

- [ ] Auth (email + Google + Discord)
- [ ] User profiles (avatar, banner, bio, social links)
- [ ] Preset upload (XML + QR + AM link)
- [ ] Preset page (thumbnail, video, download, metadata)
- [ ] Like, Bookmark, Share
- [ ] Basic explore & search
- [ ] Trending algorithm (v1)
- [ ] Comment system
- [ ] Follow system
- [ ] Email notifications
- [ ] Moderation admin panel

## Phase 1 — Community (Weeks 7–12)
*Make people come back every day*

- [ ] In-app notifications
- [ ] Following feed
- [ ] Collections (saved playlists)
- [ ] Creator dashboard + analytics
- [ ] Badges + XP system
- [ ] Weekly Challenges (v1)
- [ ] Creator Leaderboard
- [ ] Featured presets (editorial)
- [ ] Advanced search filters
- [ ] Mobile-optimized experience

## Phase 2 — Growth (Weeks 13–20)
*Virality and creator investment*

- [ ] Creator verification program
- [ ] Embed widget (share preset to external sites)
- [ ] Preset version history
- [ ] Collaborator credits
- [ ] Challenge voting system
- [ ] Creator spotlight blog/posts
- [ ] PWA (installable)
- [ ] Push notifications
- [ ] API for third-party tools

## Phase 3 — Economy (Months 6–12)
*Sustainable ecosystem*

- [ ] Premium presets (paid downloads)
- [ ] Creator tips / support
- [ ] Subscription tiers
- [ ] Creator payouts
- [ ] Affiliate / referral system
- [ ] Brand partnerships portal

---

# 6. UI PAGES

## 6.1 Landing Page (Logged Out)

**Purpose:** Convert visitors into believers in 8 seconds.

**Structure:**
```
HERO
  Full-width video loop — actual Alight Motion edits made with site presets
  Headline: "The home of Alight Motion creators."
  Subline: "Discover, share, and download motion presets. Join 50,000+ creators."
  CTA: [Get Started Free] [Browse Presets →]
  
SOCIAL PROOF BAR
  "10,000+ Presets · 50,000+ Creators · 2M+ Downloads"
  
TRENDING STRIP (live, scrollable)
  5 trending preset cards, auto-scrolling
  
FEATURE SECTIONS (alternating)
  - Upload in 3 steps / Beautiful profiles
  - Discover by mood / Weekly challenges
  
CREATOR SPOTLIGHT
  3 featured creator cards
  
FOOTER CTA
  "Start uploading your presets today."
  [Join PresetHub]
```

## 6.2 Home Feed (Logged In)

**Purpose:** The daily destination. Always fresh.

**Layout:** Masonry grid (Pinterest-style) with a left sidebar on desktop.

```
LEFT SIDEBAR (desktop only)
  Profile mini-card (avatar, username, level)
  ─────────────────────
  Navigation
  • Home
  • Explore
  • Trending
  • Challenges
  • Bookmarks
  ─────────────────────
  Following (recent activity)
  @reza_edit liked a preset
  @dinda uploaded new preset
  ─────────────────────
  Trending Tags
  #velocity #anime #coloring

MAIN CONTENT
  Tab bar: [For You] [Following] [New] [Trending]
  
  Masonry preset cards — 3 cols desktop, 2 cols tablet, 1 col mobile

RIGHT SIDEBAR (desktop only)
  Active Challenge card
  Leaderboard top 5
  Creator of the Week
```

## 6.3 Preset Page

**Purpose:** The moment of discovery that leads to download.

**Structure:**
```
BREADCRUMB
  Home > Velocity > Summer Glitch Pack

HERO SPLIT LAYOUT
  LEFT: Video preview player (autoplay, muted, loop)
         — thumbnail fallback
  RIGHT: 
    Creator avatar + name + follow button
    ──────────────
    Title (large)
    Description (collapsible at 3 lines)
    ──────────────
    Metadata pills:
    📁 Category: Velocity
    ⭐ Difficulty: Intermediate
    📱 Supports: Android + iOS
    📦 AM Version: 4.0+
    ──────────────
    Tags: #velocity #glitch #summer
    ──────────────
    [⬇ Download Preset] ← PRIMARY CTA
    [❤ Like 2.4K] [🔖 Save] [↗ Share]
    ──────────────
    Stats: 12.4K downloads · 892 views this week
    
BELOW FOLD
  Comments section (threaded, 2 levels)
  
  More from @creator (horizontal scroll)
  
  Related presets (recommendation engine output)
```

## 6.4 Profile Page

**Purpose:** A creator's portfolio and social address.

```
BANNER (full-width, blurred glow effect at edge)

PROFILE HEADER
  Avatar (floated over banner bottom edge)
  Display name + @username
  Bio
  Social links row
  [Follow 2.3K] [Message] [Share Profile]
  
STATS ROW
  📦 124 Presets · ⬇ 89K Downloads · ❤ 12.4K Likes · 👥 3.2K Followers

BADGES ROW (scrollable chips)
  🔥 Trending Creator · ⚡ Velocity Expert · 🏆 Challenge Winner

CONTENT TABS
  [Presets] [Collections] [Liked] [Activity]
  
  Content grid below tabs
```

## 6.5 Upload Wizard

**Purpose:** Make uploading feel like publishing on Medium.

**Step 1 — Files**
```
Drag + drop zone, or click to upload
Accepts: .xml file OR QR code image OR Alight Motion link paste

Upload thumbnail (required — cropped to 4:3)
Upload preview video (optional, recommended)
```

**Step 2 — Details**
```
Title (required, max 100 chars)
Description (markdown editor, optional)
Category (dropdown)
Tags (tag input, max 10)
Difficulty (radio: Beginner / Intermediate / Advanced)
AM Version (min version selector)
Device (Android / iOS / Both)
```

**Step 3 — Preview & Publish**
```
Card preview — exactly how it will look in the grid
"Looks good?" [← Back] [Publish Preset]
Note: "Your preset will be reviewed within 24 hours."
```

## 6.6 Creator Dashboard

**Purpose:** Make creators feel like professionals.

```
HEADER
  "Good morning, Reza. 👋"
  "Your presets were downloaded 247 times today."

STATS CARDS (animated count-up on load)
  Total Downloads | Total Views | Followers | Likes

CHART
  Downloads over time (7d / 30d / 90d toggle)
  Area chart, gradient fill

PRESET PERFORMANCE TABLE
  Sortable: Name | Downloads | Likes | Views | Status | Date
  
RECENT ACTIVITY
  Last 20 interactions (download, like, comment, follow)
  
QUICK ACTIONS
  [+ Upload New Preset] [Edit Profile] [View Public Profile]
```

## 6.7 Explore Page

**Purpose:** Discovery that feels infinite.

```
HERO SEARCH BAR
  Giant, centered, autofocused on load
  "Search 10,000+ presets..."
  
FILTER BAR (horizontal scroll, pill chips)
  All · Velocity · Transition · Color · Anime · Gaming · Lyric · 3D

SORT BAR
  [Trending] [Most Downloaded] [Newest] [Top Rated]

SECONDARY FILTERS (expandable panel)
  Difficulty: [Beginner] [Intermediate] [Advanced]
  Device: [Android] [iOS] [Both]
  AM Version: [3.x] [4.x] [5.x]
  
MASONRY GRID
  Infinite scroll with skeleton loading
```

## 6.8 Challenges Page

```
ACTIVE CHALLENGE HERO
  Countdown timer (days:hours:min)
  Theme banner
  Prize info
  [Submit Entry] [Browse Entries]

PAST CHALLENGES
  Winners gallery (3-up layout)
  Challenge name, winner, winning entry preview

UPCOMING CHALLENGES
  Calendar preview
```

---

# 7. COMPONENT ARCHITECTURE

## Atomic Design System

### Atoms
- `Button` (primary, secondary, ghost, danger, icon)
- `Input` (text, search, textarea)
- `Badge` (category, difficulty, rarity)
- `Avatar` (sizes: xs, sm, md, lg, xl)
- `Tag` (clickable, removable)
- `Icon` (wraps Lucide icons)
- `Spinner` / `Skeleton`

### Molecules
- `PresetCard` — The most important component in the app
- `CreatorCard` — Profile mini-card
- `CommentItem` — Comment + reply
- `StatCard` — Dashboard metric card
- `NotificationItem`
- `SearchBar`
- `FilterChip`
- `ProgressBar` (XP progress)
- `BadgeChip` (earned badge display)

### Organisms
- `PresetGrid` — Masonry layout, handles infinite scroll
- `PresetDetail` — Full preset page content
- `ProfileHeader` — Banner + avatar + stats
- `Navigation` — Desktop sidebar + mobile bottom bar
- `UploadWizard` — Multi-step upload form
- `Dashboard` — Stats + charts
- `CommentThread` — Nested comments
- `ChallengeCard` — Active challenge hero
- `LeaderboardPanel`
- `NotificationDropdown`

### Templates
- `AppLayout` — Auth'd layout with navigation
- `PublicLayout` — Landing + public pages
- `AuthLayout` — Login / register
- `AdminLayout` — Admin panel

## PresetCard — Detailed Spec

The most rendered component. Must be perfect.

```
┌─────────────────────────────────┐
│  [Thumbnail / Video Preview]    │
│  Hover: video autoplays (muted) │
│  Top-left: Category badge       │
│  Top-right: Difficulty pip      │
│                                 │
├─────────────────────────────────┤
│  [Avatar] Creator Name          │
│                                 │
│  Preset Title                   │
│  Short description excerpt      │
│                                 │
│  ❤ 2.4K  ⬇ 12K  💬 89         │
└─────────────────────────────────┘

States: default | hover | loading (skeleton) | featured (glow border)
```

---

# 8. DESIGN SYSTEM

## Design Language: "Motion Studio"

PresetHub's visual identity is built around the feeling of a professional studio at night. Dark, deliberate, warm-accented. The interface recedes so content can breathe.

**Aesthetic pillars:**
1. **Content-first** — The preset thumbnails and videos are the stars. UI chrome is minimal.
2. **Warm dark** — Not cold pitch-black. Warm near-blacks with purple-tinted shadows.
3. **Precision spacing** — 8px base grid, generous whitespace. Nothing feels cramped.
4. **Earned color** — Primary accent used sparingly. When it appears, it commands attention.
5. **Tactile feedback** — Every interactive element has a clear hover + active state.

## Spacing Scale (8px base)
```
0px  → space-0
4px  → space-1
8px  → space-2
12px → space-3
16px → space-4
24px → space-6
32px → space-8
40px → space-10
48px → space-12
64px → space-16
96px → space-24
128px → space-32
```

## Border Radius
```
4px  → rounded-sm    (inputs, small chips)
8px  → rounded       (buttons, badges)
12px → rounded-md    (cards)
16px → rounded-lg    (modals, panels)
24px → rounded-xl    (profile cards)
full → rounded-full  (avatars, pills)
```

## Elevation / Shadow System
```
shadow-glow-sm:   0 0 12px rgba(124, 58, 237, 0.15)
shadow-glow-md:   0 0 24px rgba(124, 58, 237, 0.25)
shadow-glow-lg:   0 0 48px rgba(124, 58, 237, 0.35)
shadow-card:      0 4px 24px rgba(0, 0, 0, 0.4)
shadow-modal:     0 24px 64px rgba(0, 0, 0, 0.6)
```

---

# 9. COLOR PALETTE

## Rationale

The palette is chosen to complement Alight Motion content (vivid, colorful thumbnails and videos). The background must be dark enough to make any color thumbnail pop. The accent (violet-to-purple gradient) references the motion/energy of animations without competing with content.

## Base Colors
```
background-base:     #0C0B0F   ← Near-black, warm purple tint
background-surface:  #141218   ← Card backgrounds
background-elevated: #1C1A22   ← Modals, dropdowns
background-input:    #1E1C25   ← Input fields

border-subtle:       #2A2733   ← Dividers, card borders
border-default:      #3D394A   ← Active borders
border-strong:       #5A5468   ← Focused inputs
```

## Text Colors
```
text-primary:    #F2EFF9   ← Main headings and body
text-secondary:  #A89CC0   ← Subtitles, meta
text-tertiary:   #6B6080   ← Placeholders, disabled
text-inverse:    #0C0B0F   ← Text on light buttons
```

## Accent — Violet Gradient (Primary)
```
accent-400:  #9D6FFF   ← Light variant (hover states)
accent-500:  #7C3AED   ← Primary (CTAs, focus rings)
accent-600:  #6D28D9   ← Pressed state
accent-glow: rgba(124, 58, 237, 0.3) ← Glow effects

Gradient primary: linear-gradient(135deg, #7C3AED, #9D6FFF)
Gradient hero:    linear-gradient(135deg, #4F1C99, #7C3AED, #C084FC)
```

## Semantic Colors
```
success-400: #4ADE80
success-bg:  rgba(74, 222, 128, 0.1)

warning-400: #FBBF24
warning-bg:  rgba(251, 191, 36, 0.1)

error-400:   #F87171
error-bg:    rgba(248, 113, 113, 0.1)

info-400:    #60A5FA
info-bg:     rgba(96, 165, 250, 0.1)
```

## Rarity Colors (for badges)
```
common:    #94A3B8   ← Slate
rare:      #60A5FA   ← Blue
epic:      #A78BFA   ← Violet
legendary: linear-gradient(135deg, #FBBF24, #F59E0B, #F97316)
```

## Category Colors (accent pills on cards)
```
velocity:    #F87171   ← Red
transition:  #60A5FA   ← Blue
color:       #4ADE80   ← Green
anime:       #F472B6   ← Pink
gaming:      #34D399   ← Emerald
lyric:       #FBBF24   ← Amber
3d:          #A78BFA   ← Purple
other:       #94A3B8   ← Gray
```

---

# 10. TYPOGRAPHY SYSTEM

## Typeface Selection

**Display / Hero:** `Space Grotesk`
- Variable weight, geometric, modern, slightly technical
- Used for: Hero headlines, stat numbers, badge names
- Weights: 500, 600, 700

**Body / UI:** `Inter`
- The gold standard for UI readability
- Used for: Body text, labels, navigation, inputs
- Weights: 400, 500, 600

**Monospace / Code/Metadata:** `JetBrains Mono`
- Used for: Version numbers, download counts in monospaced contexts, any code/XML display
- Weight: 400, 500

## Type Scale
```
display-2xl: Space Grotesk 700 / 72px / -0.04em  ← Hero headline
display-xl:  Space Grotesk 700 / 56px / -0.03em
display-lg:  Space Grotesk 600 / 40px / -0.02em
display-md:  Space Grotesk 600 / 32px / -0.02em
display-sm:  Space Grotesk 600 / 24px / -0.01em

heading-xl:  Inter 600 / 20px / -0.01em
heading-lg:  Inter 600 / 18px / -0.01em
heading-md:  Inter 600 / 16px / 0
heading-sm:  Inter 600 / 14px / 0

body-lg:     Inter 400 / 18px / 0.01em  ← Preset descriptions
body-md:     Inter 400 / 16px / 0.01em  ← Default body
body-sm:     Inter 400 / 14px / 0.01em  ← Secondary info

label-lg:    Inter 500 / 14px / 0.05em  ← Button labels
label-sm:    Inter 500 / 12px / 0.05em  ← Meta / captions

mono-md:     JetBrains Mono 400 / 14px / 0  ← Version numbers
mono-sm:     JetBrains Mono 400 / 12px / 0
```

## Gradient Text (for key headings)
```css
.gradient-text {
  background: linear-gradient(135deg, #C084FC, #7C3AED, #60A5FA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

Used sparingly: hero headline, user level, legendary badge names.

---

# 11. ANIMATION SYSTEM

## Philosophy

Animations serve one purpose: to communicate state changes and guide attention. They are not decoration. Every animation must pass the test: "If this animation didn't exist, would the user be confused?"

## Global Settings

> **Implementation note:** Use the canonical `--dur-*` token names defined in the Design System §11.
> The authoritative token file is `PresetHub_Design_System.md §11`. The values below are kept
> in sync with that file. Do not introduce `--duration-*` aliases in component code.

```css
:root {
  /* Durations — canonical names: --dur-* (Design System §11) */
  --dur-instant:  50ms;    /* Feedback: ripple, press          */
  --dur-fast:    150ms;    /* Feedback: color change, icon swap */
  --dur-normal:  250ms;    /* Transition: most UI state changes */
  --dur-slow:    400ms;    /* Transition: page, complex state   */
  --dur-xslow:   600ms;    /* Entrance: XP bar, chart draw      */
  --dur-glacial: 1000ms;   /* Ambient: count-up, dashboard load */
  --dur-loop:    2000ms;   /* Ambient: loading, streaming       */

  --ease-linear:    linear;
  --ease-out:       cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in:        cubic-bezier(0.4, 0.0, 1.0, 1.0);
  --ease-in-out:    cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);  /* slight overshoot */
  --ease-spring-sm: cubic-bezier(0.34, 1.3,  0.64, 1);
  --ease-bounce:    cubic-bezier(0.34, 1.8,  0.64, 1);
  --ease-snap:      cubic-bezier(0.2,  0.0,  0.0,  1.0);
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

## Animation Catalog

### Page Transitions
```
Route change: fade + translate-y 8px → 0, 250ms ease-out
Modal open:   scale 0.95 → 1 + fade, 200ms ease-spring
Modal close:  scale 1 → 0.95 + fade, 150ms ease-in
```

### Preset Card
```
Card hover:   translateY(-4px) + shadow glow, 200ms ease-out
Thumbnail hover → video: crossfade, 300ms
Like button:  heart scale 1 → 1.3 → 1, 300ms ease-spring + particle burst
Bookmark:     bookmark icon fill + scale, 200ms ease-spring
```

### Feed / Grid
```
Cards enter: staggered fade-in + translateY 16px → 0
             Stagger: 40ms between cards
             Duration: 400ms ease-out
Skeleton → content: crossfade 200ms
```

### Dashboard
```
Stat number: count-up animation on mount, 1000ms ease-out
Chart: line draws left-to-right, 800ms ease-out
```

### Upload Wizard
```
Step transition: slide-out-left + slide-in-right, 300ms ease-in-out
Progress bar fill: width transition, 400ms ease-out
```

### Notifications
```
Badge count: pop scale 1.5 → 1, 300ms ease-spring
Notification slide-in: right-to-0, 250ms ease-out
```

### XP / Badge
```
XP bar fill: slow fill + shimmer, 600ms ease-out
Badge unlock: scale 0 → 1.2 → 1 + glow pulse, 500ms ease-spring
             + particle burst (CSS only, 12 particles)
```

## Framer Motion Variants (exported constants)

```typescript
export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.04 } }
}

export const cardHover = {
  rest: { y: 0, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" },
  hover: { y: -4, boxShadow: "0 0 32px rgba(124,58,237,0.3)" }
}

export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 }
}
```

---

# 12. FOLDER STRUCTURE

```
presethub/
├── app/                          ← Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── page.tsx
│   ├── (app)/                    ← Authenticated routes
│   │   ├── layout.tsx            ← AppLayout
│   │   ├── page.tsx              ← Home Feed
│   │   ├── explore/
│   │   │   └── page.tsx
│   │   ├── trending/
│   │   │   └── page.tsx
│   │   ├── challenges/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── bookmarks/
│   │   │   └── page.tsx
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── analytics/
│   │   │   ├── presets/
│   │   │   └── settings/
│   │   └── settings/
│   │       └── page.tsx
│   ├── (public)/                 ← Public routes
│   │   ├── layout.tsx
│   │   ├── page.tsx              ← Landing
│   │   ├── preset/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── u/
│   │   │   └── [username]/
│   │   │       └── page.tsx
│   │   └── collection/
│   │       └── [slug]/
│   │           └── page.tsx
│   ├── admin/
│   │   └── ...
│   ├── api/
│   │   ├── presets/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── upload/
│   │   │   └── route.ts
│   │   ├── users/
│   │   │   └── [username]/
│   │   │       └── route.ts
│   │   ├── comments/
│   │   ├── follows/
│   │   ├── likes/
│   │   ├── bookmarks/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   └── admin/
│   ├── layout.tsx                ← Root layout
│   └── globals.css
│
├── components/
│   ├── atoms/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Tag.tsx
│   │   ├── Icon.tsx
│   │   ├── Spinner.tsx
│   │   └── Skeleton.tsx
│   ├── molecules/
│   │   ├── PresetCard/
│   │   │   ├── PresetCard.tsx
│   │   │   ├── PresetCard.types.ts
│   │   │   └── PresetCard.stories.tsx
│   │   ├── CreatorCard.tsx
│   │   ├── CommentItem.tsx
│   │   ├── StatCard.tsx
│   │   ├── NotificationItem.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterChip.tsx
│   │   ├── ProgressBar.tsx
│   │   └── BadgeChip.tsx
│   ├── organisms/
│   │   ├── PresetGrid.tsx
│   │   ├── PresetDetail.tsx
│   │   ├── ProfileHeader.tsx
│   │   ├── Navigation/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── UploadWizard/
│   │   │   ├── UploadWizard.tsx
│   │   │   ├── StepFiles.tsx
│   │   │   ├── StepDetails.tsx
│   │   │   └── StepPreview.tsx
│   │   ├── Dashboard/
│   │   │   ├── StatsRow.tsx
│   │   │   ├── DownloadsChart.tsx
│   │   │   └── PresetTable.tsx
│   │   ├── CommentThread.tsx
│   │   ├── ChallengeCard.tsx
│   │   └── LeaderboardPanel.tsx
│   └── templates/
│       ├── AppLayout.tsx
│       ├── PublicLayout.tsx
│       ├── AuthLayout.tsx
│       └── AdminLayout.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── cloudinary/
│   │   └── client.ts
│   ├── auth/
│   │   └── config.ts
│   ├── algorithms/
│   │   ├── trending.ts
│   │   └── recommendation.ts
│   ├── utils/
│   │   ├── format.ts           ← formatNumber, formatDate, formatFileSize
│   │   ├── slug.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   └── hooks/
│       ├── usePresets.ts
│       ├── useUser.ts
│       ├── useFollow.ts
│       ├── useLike.ts
│       ├── useInfiniteScroll.ts
│       └── useNotifications.ts
│
├── stores/
│   ├── authStore.ts             ← Zustand
│   ├── uiStore.ts
│   └── notificationStore.ts
│
├── types/
│   ├── database.ts              ← Supabase generated types
│   ├── preset.ts
│   ├── user.ts
│   ├── comment.ts
│   └── api.ts
│
├── styles/
│   └── globals.css
│
├── public/
│   ├── fonts/
│   ├── icons/
│   └── og/                      ← OG image templates
│
├── scripts/
│   ├── seed.ts
│   ├── trending-cron.ts
│   └── migrate.ts
│
├── middleware.ts                 ← Route protection
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

# 13. API ARCHITECTURE

## Design Principles

- **REST-first** — Simple, predictable, cacheable
- **Supabase RLS** — Row-level security as primary guard
- **Edge caching** — Vercel Edge for read-heavy endpoints
- **Optimistic UI** — Client updates immediately, reconciles on response
- **Rate limiting** — Per-IP and per-user, via Upstash Redis

## Core Endpoints

### Presets
```
GET    /api/presets              → list (paginated, filterable)
POST   /api/presets              → create (auth required)
GET    /api/presets/:id          → get single
PATCH  /api/presets/:id          → update (owner only)
DELETE /api/presets/:id          → delete (owner or admin)

POST   /api/presets/:id/like     → toggle like
POST   /api/presets/:id/bookmark → toggle bookmark
POST   /api/presets/:id/download → record download, return file URL
GET    /api/presets/:id/comments → list comments
POST   /api/presets/:id/comments → add comment
```

### Users
```
GET    /api/users/:username       → public profile
GET    /api/users/:username/presets
GET    /api/users/:username/collections
POST   /api/users/:username/follow → toggle follow
GET    /api/users/me              → authenticated user
PATCH  /api/users/me              → update profile
```

### Feed
```
GET /api/feed/home       → personalized feed (auth)
GET /api/feed/trending   → trending presets
GET /api/feed/new        → chronological
GET /api/feed/following  → following feed (auth)
```

### Search
```
GET /api/search?q=&category=&difficulty=&device=&version=&sort=
```

### Upload
```
POST /api/upload/image    → Cloudinary signed upload URL
POST /api/upload/video    → Cloudinary signed upload URL
POST /api/upload/file     → Store XML/QR in Supabase Storage
```

### Notifications
```
GET    /api/notifications           → list, paginated
POST   /api/notifications/read-all  → mark all read
PATCH  /api/notifications/:id       → mark single read
```

### Challenges
```
GET  /api/challenges             → list
GET  /api/challenges/:slug       → single
POST /api/challenges/:slug/enter → submit entry (auth)
POST /api/challenges/:slug/vote/:presetId → vote (auth)
```

### Analytics (creator only)
```
GET /api/analytics/overview
GET /api/analytics/downloads?period=7d|30d|90d
GET /api/analytics/presets/:id
GET /api/analytics/countries
```

## Pagination Pattern
```typescript
// Cursor-based pagination for feeds (performance at scale)
GET /api/feed/trending?cursor=<encoded_cursor>&limit=20

// Offset for search/explore (user-navigable pages)
GET /api/presets?page=2&limit=24
```

## Response Format
```typescript
// Success
{ data: T, meta?: { total, page, cursor } }

// Error
{ error: { code: string, message: string, details?: any } }
```

---

# 14. SECURITY ARCHITECTURE

## Authentication

- **Supabase Auth** handles sessions, JWTs, OAuth providers
- **Session duration:** 7 days (auto-refresh)
- **OAuth providers:** Google, Discord (via Supabase OAuth)
- **Email verification:** Required before posting
- **Rate limits on auth:** 5 failed attempts → 15 min lockout

## Row Level Security (Critical)

Every table has RLS policies. Examples:

```sql
-- Users can only update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Only published presets visible to public
CREATE POLICY "presets_public_read" ON presets
  FOR SELECT USING (status = 'published' OR creator_id = auth.uid());

-- Users can only delete their own comments
CREATE POLICY "comments_delete_own" ON comments
  FOR DELETE USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_staff = true));
```

## Upload Security

- **File validation:** Server-side, MIME type + magic bytes check
- **XML scan:** Parse and validate structure before accepting
- **File size limits:** XML: 5MB, Thumbnail: 10MB, Video: 100MB
- **Virus scan:** ClamAV integration via background job
- **Cloudinary transformation:** Thumbnails resized to 800x600 server-side, stripping metadata

## API Security

- **Rate limiting:** via Upstash Redis
  - Guest: 60 req/min
  - Authenticated: 300 req/min
  - Upload: 5 req/hour per user
- **CORS:** Restricted to presethub.com + localhost in dev
- **Input validation:** Zod schemas on all POST/PATCH endpoints
- **SQL injection:** Prevented by Supabase parameterized queries
- **XSS:** Content Security Policy headers, no innerHTML
- **Markdown rendering:** Sanitized via DOMPurify before render

## Content Security Policy
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{NONCE}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' res.cloudinary.com data:;
  media-src 'self' res.cloudinary.com;
  connect-src 'self' *.supabase.co;
  frame-ancestors 'none';
```

---

# 15. MODERATION SYSTEM

## Philosophy

Moderation must be fast (creators deserve rapid review), accurate (no false rejections), and scalable (volume will grow). Human-in-the-loop for phase 1, AI-augmented in phase 2.

## Upload Review Flow

```
User submits preset
  ↓
Automated checks (instant):
  • File size OK?
  • Valid XML structure?
  • Thumbnail present?
  • No prohibited keywords in title/description?
  ↓
Auto-approve? (if creator is verified + trust score high)
  YES → Published immediately
  NO → Queue for review
  ↓
Moderator queue (target: <24h)
  Moderator sees: thumbnail, video, title, description, creator history
  Actions: [Approve] [Reject: Reason] [Ask Creator for Changes]
  ↓
Creator notified via notification + email
```

## Moderation Dashboard

```
Queue view: sorted by wait time
Filters: pending | reported | auto-flagged
Each item shows: preset preview + creator trust score + flag reason
Bulk actions: approve batch, reject batch
```

## Trust Score

Every creator has a trust score (0–100) that determines:
- Auto-approval eligibility (score ≥ 80)
- Appeal fast-track (score ≥ 60)
- Account restrictions (score < 20)

Score components:
- Account age (+20 points for 3+ months)
- Upload history (no rejections = +30)
- Community reports (each valid report = -10)
- Engagement rate (high = +20)
- Verified status (+30)

## Report System

- Any user can report any preset or comment
- Report reasons: Spam · Stolen Work · Inappropriate · Misleading · Broken File
- Reports auto-flag if: 3+ unique users report same item within 24h
- Auto-remove threshold: 10+ reports in 1 hour (with instant admin alert)

## Appeals

- Creator can appeal rejection once per preset
- Appeal goes to senior moderator
- Decision within 48h, final

---

# 16. UPLOAD WORKFLOW

## Upload Architecture

```
Client → Cloudinary (direct upload, signed URL)
       → Supabase Storage (XML/QR file)
Client → API (metadata + file URLs)
API    → Supabase DB (preset record, status: pending)
API    → Moderation queue
```

## Step-by-Step

**1. Client requests signed URLs**
```typescript
POST /api/upload/image
POST /api/upload/video  
→ Returns: { cloudinary_url, signature, timestamp }
```

**2. Client uploads directly to Cloudinary**
- Thumbnail → Cloudinary (transformed to 800×600 WebP)
- Preview video → Cloudinary (transcoded to H.264 720p)
- XML/QR → Supabase Storage (private bucket, signed for download)

**3. Client submits metadata**
```typescript
POST /api/presets
{
  title, description, category, tags, difficulty,
  am_version_min, device_support,
  thumbnail_url, preview_video_url,  // Cloudinary URLs
  file_type: "xml",
  file_url: "supabase-storage-path"  // or am_link
}
```

**4. API creates preset (status: pending)**

**5. Moderation review → Published**

**6. Creator receives notification**

## Cloudinary Transformations

```
Thumbnail: 
  /upload/w_800,h_600,c_fill,q_auto,f_webp/{public_id}

Thumbnail small (card grid):
  /upload/w_400,h_300,c_fill,q_auto,f_webp/{public_id}

Thumbnail blur (before download, teaser):
  /upload/w_400,h_300,c_fill,e_blur:800,q_auto/{public_id}

Video preview (autoplay in card):
  /upload/w_400,h_300,c_fill,q_auto,vc_h264,f_mp4/{public_id}
```

---

# 17. RECOMMENDATION ALGORITHM

## Goal

Show users presets they'll download and come back for. Not just popular, but *right for them*.

## Input Signals

**Strong signals (high weight):**
- Categories the user has downloaded before
- Tags overlapping with past engagement
- Creators they follow
- Presets they've spent >5s viewing

**Medium signals:**
- Device type (Android vs iOS)
- AM version they appear to use
- Time of day (different engagement patterns)
- Bookmarks (stronger intent than like)

**Weak signals:**
- Country/language (Indonesian creators visible to Indonesian users first)
- Account age (newer users see beginner-tagged presets more)

## Algorithm

```
For each candidate preset:
  score = (
    creator_follow_bonus * 3.0
    + category_match * 2.0
    + tag_match * 1.5
    + creator_quality_score * 1.2
    + diversity_bonus * 1.0     ← avoid showing same creator 3x in a row
    + freshness_bonus * 0.8     ← newer presets get a boost
    - already_downloaded * 999  ← never show what they have
  )
  
Sort by score, inject 1 "discovery" preset per 8 (outside user's usual categories)
```

## Cold Start (New Users)

- Show trending presets
- After first download, ask: "What kind of edits do you make?" (onboarding question, 3-tap UX)
- Use those answers to seed recommendations immediately

---

# 18. TRENDING ALGORITHM

## Goal

Trending must feel *real*. Users should trust that trending = actually good and popular right now, not gamed.

## Formula

```
trending_score = (
  D * 4.0         ← downloads in last 24h (strongest signal)
  + L * 2.0       ← likes in last 24h
  + C * 1.5       ← comments in last 24h
  + B * 3.0       ← bookmarks in last 24h (high intent)
  + V * 0.5       ← views in last 24h
) / time_decay

time_decay = (hours_since_publish + 2) ^ 1.5
```

The `+2` prevents brand-new posts from going infinitely viral from a single engagement.

## Anti-Gaming Protections

- IP deduplication on downloads (same IP = 1 count per 24h per preset)
- Self-downloads don't count
- Suspicious burst detection: >50 downloads in 5 min from different IPs → flag for review
- Creator's social media share bonus (one-time +50 points if preset link is shared externally — detected via referrer)

## Score Update Schedule

- Cron job every 15 minutes via Vercel Cron
- Trending scores recalculated for all presets modified in last 7 days
- Scores decay to 0 after 7 days of no engagement

## Trending Categories

Each category has its own trending chart (not just global):
- Trending → Velocity this week
- Trending → Anime this week
- etc.

---

# 19. GAMIFICATION SYSTEM

## Philosophy

Gamification must feel earned, not manufactured. Users should feel pride when they get a badge, not feel like they're playing a mobile game.

## XP System

### Earning XP

| Action | XP |
|---|---|
| Upload preset (published) | +100 |
| Get 10 downloads | +25 |
| Get 100 downloads | +100 |
| Get 1K downloads | +300 |
| Get 10K downloads | +1000 |
| Get a like | +5 |
| Get a comment | +10 |
| Win weekly challenge | +500 |
| Profile complete | +50 |
| First upload | +50 |
| Streak (upload weekly for 4 weeks) | +200 |

### Levels

| Level | XP Required | Title |
|---|---|---|
| 1 | 0 | Newcomer |
| 2 | 100 | Creator |
| 3 | 500 | Editor |
| 4 | 1,500 | Artist |
| 5 | 5,000 | Professional |
| 6 | 15,000 | Expert |
| 7 | 40,000 | Legend |
| 8 | 100,000 | Icon |

Level displayed on profile with animated glow ring around avatar.

## Badge System

### Milestone Badges
| Badge | Condition | Rarity |
|---|---|---|
| First Upload | Upload 1 preset | Common |
| Pack Builder | Upload 10 presets | Rare |
| Content Creator | Upload 50 presets | Epic |
| Library | Upload 100 presets | Legendary |
| First Download | Receive 1 download | Common |
| Viral | 10K downloads in 24h | Legendary |
| 100K Club | Total 100K downloads | Legendary |

### Skill Badges
| Badge | Condition | Rarity |
|---|---|---|
| Velocity Expert | 20+ velocity presets | Rare |
| Anime Specialist | 20+ anime presets | Rare |
| Color Master | 20+ color presets | Rare |
| Transition Pro | 20+ transition presets | Rare |

### Social Badges
| Badge | Condition | Rarity |
|---|---|---|
| Community Builder | 500 followers | Rare |
| Influential | 5K followers | Epic |
| Trendsetter | #1 on trending | Legendary |
| Challenge Winner | Win weekly challenge | Epic |
| 3x Champion | Win 3 challenges | Legendary |

### Loyalty Badges
| Badge | Condition | Rarity |
|---|---|---|
| OG Creator | Joined in first month | Legendary |
| Consistent | Upload every week for 3 months | Epic |
| Veteran | 1 year account age | Rare |

## Badge Display

- Profile shows top 6 badges, rest in "All Badges" expandable
- Badge unlock animation: full-screen modal with glow + particle burst
- Rare/Legendary badges have animated shimmer effect
- Badge tooltips on hover explain how to earn them

## Weekly Challenges

**Structure:**
- New challenge every Monday 00:00 UTC
- Theme: e.g., "Best Summer Velocity Edit", "Anime Transition Week"
- Submit any preset (new or existing) that fits the theme
- Community votes (3 days judging after submission closes)
- Winners: 1st/2nd/3rd place + Feature + XP

**Challenge Types:**
- **Open theme** — Any preset in a category
- **Constraint** — "Presets with max 5 effects only"
- **Collab** — Partners submit together
- **Beginner-only** — First 20 presets on platform

## Leaderboard

- Global: Top 50 by XP all-time
- Monthly: Top 20 by downloads this month
- Category: Top 10 in each category by downloads
- Resets: Monthly leaderboard resets on 1st of each month
- Featured on homepage sidebar, animated positions

---

# 20. CREATOR ECONOMY

## Philosophy

PresetHub's goal is to eventually return value to its best creators — the people who make the platform worth visiting.

## Phase 1 — Recognition (Launch)
*No money yet, but the foundation of value*

- Featured Creator spotlight (homepage)
- Verified badge (trust signal)
- Analytics (know your value)
- Leaderboard fame
- Badge system (social currency)

## Phase 2 — Support (6–12 months)
*Community-powered revenue, minimal friction*

**Tip Jar**
- Users can send tips to creators (IDR 5K / 10K / 25K / 50K)
- Payment via GoPay, OVO, Dana, credit card
- Platform takes 10%
- Creator receives weekly payout

**Supporter Badge**
- Users who tip any creator get "Supporter" badge
- Creates social incentive to tip

## Phase 3 — Premium Presets (12–24 months)
*Creator-set pricing, marketplace model*

- Creators can mark presets as "Premium" (paid)
- Price range: IDR 5,000 – IDR 50,000 per preset
- Creator gets 80% revenue share (best in class)
- Buyers get receipt + license
- Platform escrow + dispute system

**Free tier protections:**
- Creators must keep ≥50% of their uploads free
- Top 100 most-downloaded presets always free (platform editorial picks)

## Phase 4 — Subscription (18–36 months)
*PresetHub Pro*

**For creators:**
- Analytics deep-dive
- A/B test thumbnails
- Scheduled uploads
- Priority moderation
- Custom profile URL
- Collab tools
- IDR 50,000/month

**For collectors:**
- Ad-free experience
- Unlimited bookmarks
- Early access to featured packs
- Exclusive Challenge categories
- IDR 25,000/month

## Creator Verification Program

Eligibility:
- 500+ followers OR 10K+ downloads
- Account 30+ days old
- No active moderation strikes
- ID verification (optional, for monetization)

Benefits:
- Blue checkmark on profile
- Auto-approve uploads
- Priority support
- Creator newsletter feature
- Beta feature access

---

# 21. FUTURE ROADMAP

## Year 1 Milestones

**Q1 (Months 1–3)**
- MVP launch (Phase 0 + Phase 1 features)
- 1,000 presets
- 10,000 registered users
- First Weekly Challenge

**Q2 (Months 4–6)**
- Creator verification launch
- Collections launch
- Embed widget
- 5,000 presets
- 50,000 users

**Q3 (Months 7–9)**
- Creator Dashboard v2 (advanced analytics)
- PWA launch
- Push notifications
- Tip system beta
- 15,000 presets
- 150,000 users

**Q4 (Months 10–12)**
- Tip system public
- Premium presets beta
- Creator API v1
- 30,000 presets
- 300,000 users

## Year 2 Innovations

**PresetHub Studio (In-browser editor)**
- Preview how a preset looks on your own video
- Requires WebAssembly/Canvas — ambitious, but creates deep moat
- "Try before you download"

**Preset Packs**
- Creators bundle multiple presets as a pack
- Single download, single page
- Great for "Complete Velocity Pack" launches

**Creator Mentorship**
- Experienced creators can take on mentees
- Mentee gets faster badge progression
- Mentor gets "Mentor" badge + XP bonus

**PresetHub Discover App (Mobile)**
- Native iOS + Android app
- Deep link opens preset directly in Alight Motion
- Push notifications for following feed
- This is the 10x UX moment

**AI-Powered Features**
- "Find me a preset that looks like this" (image-to-preset search)
- Auto-tag suggestions on upload
- Thumbnail quality scoring (blurry = warn before publish)
- Spam/copy detection via ML

**International Expansion**
- Localization: Bahasa Indonesia, English, Spanish, Portuguese, Thai
- Regional challenges
- Regional leaderboards (Top Creator in Indonesia, etc.)

**PresetHub for Teams**
- Groups of creators under one org
- Shared upload analytics
- Collab on preset packs
- Great for YouTube/TikTok creator houses

---

# APPENDIX A — OG Image Strategy

Every preset page generates a dynamic OG image:
- Background: preset thumbnail (blurred)
- Center: preset title (large)
- Creator avatar + name
- Download count
- PresetHub logo + URL

Enables rich previews when shared on Discord, TikTok bio, Twitter.

# APPENDIX B — SEO Strategy

- Static page generation for all preset pages (Next.js SSG)
- Structured data: `SoftwareApplication` schema for presets
- Sitemap auto-generated, pinged to Google on new publish
- Target keywords: "alight motion preset download", "velocity preset AM", "anime transition preset"
- Creator pages indexed: `/u/username` ranks for creator names

# APPENDIX C — Monitoring & Observability

- **Error tracking:** Sentry
- **Performance:** Vercel Analytics + Core Web Vitals
- **Uptime:** Better Uptime
- **Logging:** Supabase logs + Vercel logs
- **Alerts:** Slack channel for errors, spike in reports, payment failures

# APPENDIX D — Launch Strategy

**Pre-launch (2–3 weeks before):**
- Personal outreach to 20 known Alight Motion creators
- Offer them "Founding Creator" status + OG badge
- Get 100 presets seeded before doors open
- Waitlist landing page, collect 1,000 emails

**Launch day:**
- Post on r/AlightMotion
- Creator partners post on TikTok on same day
- Post on Indonesian Discord servers
- Product Hunt launch

**Week 1 goal:** 500 registered users, 200 presets, 5,000 downloads

---

*PresetHub Product Specification v1.0*  
*Prepared June 2026*  
*"The home of Alight Motion creators."*
