-- AMHUB Migration: Fix P0 Security Issues (SEC-1 and SEC-2)

-- [SEC-1] Restrict PII exposure on public.users table (email, auth_provider, last_active_at)
REVOKE SELECT ON public.users FROM anon, authenticated, public;

GRANT SELECT (
  id,
  username,
  display_name,
  avatar_url,
  banner_url,
  bio,
  website_url,
  tiktok_handle,
  instagram_handle,
  discord_handle,
  youtube_url,
  xp,
  level,
  is_verified,
  is_staff,
  country_code,
  created_at,
  updated_at,
  role
) ON public.users TO anon, authenticated, public;

GRANT SELECT ON public.users TO service_role;

-- [SEC-2] Restrict unauthenticated social graph enumeration on follows and preset_likes
DROP POLICY IF EXISTS follows_select_public ON public.follows;
CREATE POLICY follows_select_authenticated ON public.follows
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS preset_likes_select_public ON public.preset_likes;
CREATE POLICY preset_likes_select_authenticated ON public.preset_likes
  FOR SELECT TO authenticated
  USING (true);
