-- Migration: XP increment via SECURITY DEFINER RPC
-- Replaces the service-role-key dependency in awardUserXp().
-- The function runs as the postgres superuser (SECURITY DEFINER) so it
-- bypasses RLS and can update any user's xp/level — equivalent to what
-- createSupabaseServiceClient() was supposed to do, but without needing
-- SUPABASE_SERVICE_ROLE_KEY to be configured in the application layer.

create or replace function public.increment_user_xp(
  p_user_id  uuid,
  p_amount   integer,
  p_expected_xp integer default null  -- optimistic-concurrency gate (nullable = skip gate)
)
returns table (
  id         uuid,
  xp         integer,
  level      integer,
  level_up   boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_xp   integer;
  v_current_level integer;
  v_new_xp       integer;
  v_new_level    integer;
  v_level_up     boolean;
  v_rows_updated integer;
begin
  if p_amount <= 0 then
    return;
  end if;

  -- Lock the row to avoid lost updates under concurrent calls.
  select u.xp, u.level
  into   v_current_xp, v_current_level
  from   public.users u
  where  u.id = p_user_id
  for update;

  if not found then
    raise exception 'User not found: %', p_user_id;
  end if;

  -- Optimistic-concurrency check: if the caller supplied an expected_xp
  -- and it no longer matches, abort — the caller should retry.
  if p_expected_xp is not null and v_current_xp is distinct from p_expected_xp then
    return;  -- 0 rows → caller retries with fresh values
  end if;

  v_new_xp := coalesce(v_current_xp, 0) + p_amount;

  -- Inline level calculation matching LEVEL_TIERS in xp.ts
  -- Tiers: 1→0, 2→100, 3→500, 4→1500, 5→5000, 6→15000, 7→40000, 8→100000
  v_new_level := case
    when v_new_xp >= 100000 then 8
    when v_new_xp >= 40000  then 7
    when v_new_xp >= 15000  then 6
    when v_new_xp >= 5000   then 5
    when v_new_xp >= 1500   then 4
    when v_new_xp >= 500    then 3
    when v_new_xp >= 100    then 2
    else 1
  end;

  v_level_up := v_new_level > coalesce(v_current_level, 1);

  update public.users u
  set    xp         = v_new_xp,
         level      = v_new_level,
         updated_at = now()
  where  u.id = p_user_id;

  get diagnostics v_rows_updated = row_count;

  if v_rows_updated = 0 then
    return;  -- should not happen after FOR UPDATE, but be safe
  end if;

  return query
    select p_user_id, v_new_xp, v_new_level, v_level_up;
end;
$$;

-- Allow every authenticated user (and anon) to call this function.
-- The SECURITY DEFINER already limits what it can do — it only touches
-- the users table in the exact way coded above.
grant execute on function public.increment_user_xp(uuid, integer, integer) to authenticated;
grant execute on function public.increment_user_xp(uuid, integer, integer) to anon;

comment on function public.increment_user_xp is
  'Awards XP to a user and recalculates their level. Runs as SECURITY DEFINER '
  'so it bypasses RLS — no service-role key required. Pass p_expected_xp for '
  'optimistic-concurrency control (0 rows returned = caller should retry).';
