-- AMHUB Database Migration: Admin Role System & @afgan Assignment

-- 1. Add role column to public.users table if it does not already exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Set user @afgan to admin role and enable staff privileges
UPDATE public.users 
SET role = 'admin', is_staff = true 
WHERE LOWER(username) = 'afgan';

-- 3. Set app_metadata.role = 'admin' on Supabase auth.users for @afgan
UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE id IN (
  SELECT id FROM public.users WHERE LOWER(username) = 'afgan'
);

-- 4. Enable admin RLS policy on public.users
DROP POLICY IF EXISTS "Admins can manage user profiles" ON public.users;
CREATE POLICY "Admins can manage user profiles"
ON public.users FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  OR (SELECT is_staff FROM public.users WHERE id = auth.uid()) = true
);
