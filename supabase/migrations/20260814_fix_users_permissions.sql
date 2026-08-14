-- AMHUB Database Migration: Fix PostgreSQL 42501 Permission Denied & RLS Policy on public.users

-- 1. Grant explicit table privileges to service_role and authenticated roles
GRANT ALL ON TABLE public.users TO service_role;
GRANT SELECT ON TABLE public.users TO service_role;
GRANT SELECT ON TABLE public.users TO authenticated;

-- 2. Drop any legacy/recursive policies causing 42501 permission issues
DROP POLICY IF EXISTS "Admins can manage user profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.users;
DROP POLICY IF EXISTS "Service role full access on users" ON public.users;

-- 3. Ensure service_role has explicit full RLS policy on public.users
CREATE POLICY "Service role full access on users"
ON public.users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Create public profile select policy (allows reading profiles on Home / /u/username)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.users FOR SELECT
TO public
USING (true);

-- 5. Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Admins can manage all profiles using non-recursive auth.jwt() app_metadata check
CREATE POLICY "Admins can manage all profiles"
ON public.users FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR auth.uid() = id
);
