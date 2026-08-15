-- AMHUB Database Migration: Admin Users RPC & Service Role Permissions

-- 1. Explicitly grant all privileges on public.users to service_role
GRANT ALL ON TABLE public.users TO service_role;

-- 2. Ensure RLS Policy for service_role on public.users
DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
CREATE POLICY "Service role full access on users"
ON public.users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Security Definer RPC function for verifying / unverifying users
CREATE OR REPLACE FUNCTION public.admin_verify_user(
  target_user_id uuid,
  target_status boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid := auth.uid();
  is_caller_admin boolean;
  target_username text;
BEGIN
  -- Verify caller is admin or staff or afgan
  SELECT (username = 'afgan' OR role = 'admin' OR is_staff = true)
  INTO is_caller_admin
  FROM public.users
  WHERE id = caller_id;

  IF NOT coalesce(is_caller_admin, false) THEN
    RAISE EXCEPTION 'FORBIDDEN: Admin access required';
  END IF;

  -- Update verification status
  UPDATE public.users
  SET is_verified = target_status,
      updated_at = now()
  WHERE id = target_user_id
  RETURNING username INTO target_username;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: Target user not found';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'id', target_user_id,
    'username', target_username,
    'is_verified', target_status
  );
END;
$$;

-- Grant execution to authenticated users (function performs internal admin security check)
GRANT EXECUTE ON FUNCTION public.admin_verify_user(uuid, boolean) TO authenticated, service_role;
