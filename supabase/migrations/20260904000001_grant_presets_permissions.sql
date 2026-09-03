-- AMHUB Database Migration: Grant table permissions on public.presets and dependent tables
-- Fixes: PostgreSQL 42501 Permission denied for table presets

-- 1. Grant table privileges on public.presets
GRANT SELECT, INSERT, UPDATE, DELETE ON public.presets TO authenticated;
GRANT SELECT ON public.presets TO anon;
GRANT ALL ON public.presets TO service_role;

-- 2. Grant table privileges on public.preset_tags
GRANT SELECT, INSERT, UPDATE, DELETE ON public.preset_tags TO authenticated;
GRANT SELECT ON public.preset_tags TO anon;
GRANT ALL ON public.preset_tags TO service_role;

-- 3. Grant table privileges on public.creator_withdrawals
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_withdrawals TO authenticated;
GRANT ALL ON public.creator_withdrawals TO service_role;

-- 4. Grant table privileges on public.categories & tags
GRANT SELECT ON public.categories TO authenticated, anon;
GRANT ALL ON public.categories TO service_role;
GRANT SELECT ON public.tags TO authenticated, anon;
GRANT ALL ON public.tags TO service_role;
