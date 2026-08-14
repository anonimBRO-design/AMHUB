-- AMHUB Database Migration: Grant full table privileges to service_role across all public tables

-- 1. Grant explicit privileges to service_role on all public schema tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 2. Ensure future tables created in public schema also grant ALL to service_role
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- 3. Ensure service_role has explicit RLS bypass policies for data cleanup
DROP POLICY IF EXISTS "Service role full access on notifications" ON public.notifications;
CREATE POLICY "Service role full access on notifications"
ON public.notifications FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on comments" ON public.comments;
CREATE POLICY "Service role full access on comments"
ON public.comments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on presets" ON public.presets;
CREATE POLICY "Service role full access on presets"
ON public.presets FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on collections" ON public.collections;
CREATE POLICY "Service role full access on collections"
ON public.collections FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
