-- AMHUB Database Migration: Restore GRANT DELETE ON TABLE public.users TO service_role

-- 1. Grant explicit DELETE table privileges to service_role on users and dependent tables
GRANT DELETE ON TABLE public.users TO service_role;
GRANT DELETE ON TABLE public.notifications TO service_role;
GRANT DELETE ON TABLE public.preset_likes TO service_role;
GRANT DELETE ON TABLE public.preset_bookmarks TO service_role;
GRANT DELETE ON TABLE public.follows TO service_role;
GRANT DELETE ON TABLE public.comments TO service_role;
GRANT DELETE ON TABLE public.presets TO service_role;
GRANT DELETE ON TABLE public.preset_tags TO service_role;
GRANT DELETE ON TABLE public.collection_items TO service_role;
GRANT DELETE ON TABLE public.collections TO service_role;

-- 2. Create RLS DELETE policy for service_role on public.users
DROP POLICY IF EXISTS "Service role delete access on users" ON public.users;
CREATE POLICY "Service role delete access on users"
ON public.users FOR DELETE
TO service_role
USING (true);
