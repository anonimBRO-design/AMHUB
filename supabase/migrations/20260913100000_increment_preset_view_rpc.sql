-- Migration: Increment preset view & download counts via SECURITY DEFINER RPC
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/cfcxybmmwbxdowqycwvc/sql
--
-- Why: public.presets has RLS enabled. Anonymous guests (anon role) only have SELECT permissions,
-- so direct UPDATE queries by guests are blocked by PostgreSQL RLS.
-- This SECURITY DEFINER RPC runs with elevated privileges to increment view_count atomically
-- and safely without exposing any sensitive table columns or requiring SUPABASE_SERVICE_ROLE_KEY.

-- 1. Function: increment_preset_view
CREATE OR REPLACE FUNCTION public.increment_preset_view(p_preset_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_views integer;
BEGIN
  UPDATE public.presets
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_preset_id
  RETURNING view_count INTO v_new_views;

  RETURN COALESCE(v_new_views, 0);
END;
$$;

-- Grant execute permissions to all roles (anon, authenticated, service_role)
GRANT EXECUTE ON FUNCTION public.increment_preset_view(uuid) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.increment_preset_view(uuid) IS
  'Atomically increments view_count for a preset. Runs as SECURITY DEFINER so anonymous guests can record views safely.';

-- 2. Function: increment_preset_download
CREATE OR REPLACE FUNCTION public.increment_preset_download(
  p_preset_id uuid,
  p_is_unique boolean DEFAULT false
)
RETURNS TABLE (
  total_downloads integer,
  unique_downloads integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total integer;
  v_unique integer;
BEGIN
  UPDATE public.presets
  SET 
    download_count = COALESCE(download_count, 0) + 1,
    unique_download_count = COALESCE(unique_download_count, 0) + (CASE WHEN p_is_unique THEN 1 ELSE 0 END)
  WHERE id = p_preset_id
  RETURNING download_count, COALESCE(unique_download_count, 0) INTO v_total, v_unique;

  RETURN QUERY SELECT COALESCE(v_total, 0), COALESCE(v_unique, 0);
END;
$$;

-- Grant execute permissions to all roles (anon, authenticated, service_role)
GRANT EXECUTE ON FUNCTION public.increment_preset_download(uuid, boolean) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.increment_preset_download(uuid, boolean) IS
  'Atomically increments download_count and optionally unique_download_count. Runs as SECURITY DEFINER so anonymous guest downloads are recorded.';

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
