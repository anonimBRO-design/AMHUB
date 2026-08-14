-- ─────────────────────────────────────────────────────────────────────────────
-- Debug helper function to inspect Postgres RLS auth.uid() and auth.role()
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.get_auth_context()
returns jsonb
language sql
stable
security invoker
as $$
  select jsonb_build_object(
    'uid', auth.uid(),
    'role', auth.role()
  );
$$;

grant execute on function public.get_auth_context() to authenticated, anon, service_role;
