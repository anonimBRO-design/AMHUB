-- AMHUB Database Migration: Admin Users RPC & Table Grants

-- 1. Explicitly grant ALL table privileges on public.users and schema to service_role and authenticated
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public.users TO service_role;
GRANT SELECT, UPDATE, DELETE ON TABLE public.users TO authenticated;

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
  is_caller_admin boolean := false;
  target_username text;
BEGIN
  -- If caller_id is null (e.g. service_role client), treat as trusted admin execution
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

-- 4. Security Definer RPC function for deleting user profile and dependent DB records
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id uuid
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
  target_role text;
  target_is_staff boolean;
  preset_rec record;
  coll_rec record;
BEGIN
  -- If caller_id is null (e.g. service_role client), treat as trusted admin execution
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

  IF caller_id IS NOT NULL AND target_user_id = caller_id THEN
    RAISE EXCEPTION 'BAD_REQUEST: Cannot delete your own admin account';
  END IF;

  SELECT username, role, is_staff
  INTO target_username, target_role, target_is_staff
  FROM public.users
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: User not found';
  END IF;

  IF lower(target_username) = 'afgan' OR target_role = 'admin' OR coalesce(target_is_staff, false) = true THEN
    RAISE EXCEPTION 'BAD_REQUEST: Cannot delete an admin user';
  END IF;

  DELETE FROM public.notifications WHERE user_id = target_user_id OR actor_id = target_user_id;
  DELETE FROM public.preset_likes WHERE user_id = target_user_id;
  DELETE FROM public.preset_bookmarks WHERE user_id = target_user_id;
  DELETE FROM public.follows WHERE follower_id = target_user_id OR following_id = target_user_id;
  DELETE FROM public.comments WHERE user_id = target_user_id;

  FOR preset_rec IN SELECT id FROM public.presets WHERE creator_id = target_user_id LOOP
    DELETE FROM public.preset_tags WHERE preset_id = preset_rec.id;
    DELETE FROM public.preset_likes WHERE preset_id = preset_rec.id;
    DELETE FROM public.preset_bookmarks WHERE preset_id = preset_rec.id;
    DELETE FROM public.collection_items WHERE preset_id = preset_rec.id;
    DELETE FROM public.comments WHERE preset_id = preset_rec.id;
    DELETE FROM public.notifications WHERE preset_id = preset_rec.id;
  END LOOP;
  DELETE FROM public.presets WHERE creator_id = target_user_id;

  FOR coll_rec IN SELECT id FROM public.collections WHERE owner_id = target_user_id LOOP
    DELETE FROM public.collection_items WHERE collection_id = coll_rec.id;
  END LOOP;
  DELETE FROM public.collections WHERE owner_id = target_user_id;

  DELETE FROM public.users WHERE id = target_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'id', target_user_id,
    'username', target_username
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_verify_user(uuid, boolean) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated, service_role, anon;
