-- AMHUB Database Migration: Admin Update User Role RPC & Column Assurance

-- 1. Ensure role column exists on public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Security Definer RPC function for updating user role (promotes/demotes admin)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id uuid,
  target_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid := auth.uid();
  is_caller_admin boolean := false;
  target_username text;
BEGIN
  -- If caller_id is null (service_role client), treat as admin
  IF caller_id IS NULL THEN
    is_caller_admin := true;
  ELSE
    SELECT (username = 'afgan' OR role = 'admin' OR is_staff = true)
    INTO is_caller_admin
    FROM public.users
    WHERE id = caller_id;
  END IF;

  IF NOT coalesce(is_caller_admin, false) THEN
    RAISE EXCEPTION 'FORBIDDEN: Admin access required';
  END IF;

  IF caller_id IS NOT NULL AND target_user_id = caller_id AND target_role <> 'admin' THEN
    RAISE EXCEPTION 'BAD_REQUEST: Cannot demote yourself from admin';
  END IF;

  SELECT username INTO target_username FROM public.users WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: User not found';
  END IF;

  IF lower(target_username) = 'afgan' AND target_role <> 'admin' THEN
    RAISE EXCEPTION 'BAD_REQUEST: Founder @afgan cannot be demoted from admin';
  END IF;

  -- Update role and is_staff
  UPDATE public.users
  SET role = target_role,
      is_staff = (target_role = 'admin'),
      updated_at = now()
  WHERE id = target_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'id', target_user_id,
    'username', target_username,
    'role', target_role,
    'is_staff', (target_role = 'admin')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_role(uuid, text) TO authenticated, service_role, anon;
