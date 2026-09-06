-- AMHUB Security Hardening v2
-- Fixes (from security audit):
--   CRIT-01: admin_update_user_role treated NULL auth.uid() as admin -> anon could become admin.
--   CRIT-02: admin_verify_user / admin_delete_user same fail-open pattern + GRANT EXECUTE to anon.
--   CRIT-03: users table allowed authenticated UPDATE on role/is_staff/is_verified/xp/level columns,
--            so any user could escalate to admin via direct REST.
--   HIGH-02: presets self-publish (status='published') via owner update bypassing moderation;
--            users could also rewrite admin-only counters (is_featured, quality_score, etc.).
--   MED-01 : preset_downloads insert policy `with check (true)` let anyone fabricate download records.
--   LOW    : reserved usernames (admin, afgan, ...) were only blocked in-app, not at DB level.

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Helper: is the caller a trusted admin? (used by admin RPCs)
--    service_role bypasses; authenticated callers must have a real uid AND be
--    admin/moderator, unless they are a staff member.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.is_admin_caller(caller_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select
		auth.role() = 'service_role'
	or (
		caller_id is not null
		and exists (
			select 1
			from public.users
			where id = caller_id
				and (username = 'afgan' or role = 'admin' or is_staff = true)
		)
	);
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Fix CRIT-01: admin_update_user_role
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.admin_update_user_role(
	target_user_id uuid,
	target_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
	caller_id uuid := auth.uid();
	target_username text;
begin
	-- Fail-closed: only real admins (or service_role) may proceed. An anonymous
	-- caller has auth.uid() = NULL and role 'anon', so this raises FORBIDDEN.
	if not public.is_admin_caller(caller_id) then
		raise exception 'FORBIDDEN: Admin access required';
	end if;

	if caller_id is not null and target_user_id = caller_id and target_role <> 'admin' then
		raise exception 'BAD_REQUEST: Cannot demote yourself from admin';
	end if;

	select username into target_username from public.users where id = target_user_id;

	if not found then
		raise exception 'NOT_FOUND: User not found';
	end if;

	if lower(target_username) = 'afgan' and target_role <> 'admin' then
		raise exception 'BAD_REQUEST: Founder @afgan cannot be demoted from admin';
	end if;

	update public.users
	set role = target_role,
		is_staff = (target_role = 'admin'),
		updated_at = now()
	where id = target_user_id;

	return jsonb_build_object(
		'success', true,
		'id', target_user_id,
		'username', target_username,
		'role', target_role,
		'is_staff', (target_role = 'admin')
	);
end;
$$;

revoke all on function public.admin_update_user_role(uuid, text) from public, anon;
grant execute on function public.admin_update_user_role(uuid, text) to authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Fix CRIT-02: admin_verify_user + admin_delete_user
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.admin_verify_user(
	target_user_id uuid,
	target_status boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
	caller_id uuid := auth.uid();
	target_username text;
begin
	if not public.is_admin_caller(caller_id) then
		raise exception 'FORBIDDEN: Admin access required';
	end if;

	update public.users
	set is_verified = target_status,
		updated_at = now()
	where id = target_user_id
	returning username into target_username;

	if not found then
		raise exception 'NOT_FOUND: Target user not found';
	end if;

	return jsonb_build_object(
		'success', true,
		'id', target_user_id,
		'username', target_username,
		'is_verified', target_status
	);
end;
$$;

create or replace function public.admin_delete_user(
	target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
	caller_id uuid := auth.uid();
	target_username text;
	target_role text;
	target_is_staff boolean;
	preset_rec record;
	coll_rec record;
begin
	if not public.is_admin_caller(caller_id) then
		raise exception 'FORBIDDEN: Admin access required';
	end if;

	if caller_id is not null and target_user_id = caller_id then
		raise exception 'BAD_REQUEST: Cannot delete your own admin account';
	end if;

	select username, role, is_staff
	into target_username, target_role, target_is_staff
	from public.users
	where id = target_user_id;

	if not found then
		raise exception 'NOT_FOUND: User not found';
	end if;

	if lower(target_username) = 'afgan' or target_role = 'admin' or coalesce(target_is_staff, false) = true then
		raise exception 'BAD_REQUEST: Cannot delete an admin user';
	end if;

	delete from public.notifications where user_id = target_user_id or actor_id = target_user_id;
	delete from public.preset_likes where user_id = target_user_id;
	delete from public.preset_bookmarks where user_id = target_user_id;
	delete from public.follows where follower_id = target_user_id or following_id = target_user_id;
	delete from public.comments where user_id = target_user_id;
	delete from public.preset_downloads where user_id = target_user_id;
	delete from public.challenge_votes where voter_id = target_user_id;
	delete from public.challenge_entries where creator_id = target_user_id;

	for preset_rec in select id from public.presets where creator_id = target_user_id loop
		delete from public.preset_tags where preset_id = preset_rec.id;
		delete from public.preset_likes where preset_id = preset_rec.id;
		delete from public.preset_bookmarks where preset_id = preset_rec.id;
		delete from public.collection_items where preset_id = preset_rec.id;
		delete from public.comments where preset_id = preset_rec.id;
		delete from public.notifications where preset_id = preset_rec.id;
		delete from public.preset_downloads where preset_id = preset_rec.id;
		delete from public.preset_orders where preset_id = preset_rec.id or buyer_id = target_user_id or seller_id = target_user_id;
	end loop;
	delete from public.presets where creator_id = target_user_id;

	for coll_rec in select id from public.collections where owner_id = target_user_id loop
		delete from public.collection_items where collection_id = coll_rec.id;
	end loop;
	delete from public.collections where owner_id = target_user_id;

	delete from public.users where id = target_user_id;

	return jsonb_build_object(
		'success', true,
		'id', target_user_id,
		'username', target_username
	);
end;
$$;

revoke all on function public.admin_verify_user(uuid, boolean), public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_verify_user(uuid, boolean) to authenticated, service_role;
grant execute on function public.admin_delete_user(uuid) to authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Fix CRIT-03: column-level grants on public.users
--    Authenticated users may only update their own profile fields. role,
--    is_staff, is_verified, xp, level, email, auth_provider and timestamps
--    guarded in app code become non-writable via REST.
-- ─────────────────────────────────────────────────────────────────────────────
revoke update, delete on table public.users from authenticated;
revoke update, delete on table public.users from anon;

grant insert (
	id,
	username,
	display_name,
	avatar_url,
	email,
	auth_provider,
	last_active_at,
	created_at,
	updated_at
) on table public.users to authenticated;

grant update (
	username,
	display_name,
	avatar_url,
	banner_url,
	bio,
	website_url,
	tiktok_handle,
	instagram_handle,
	discord_handle,
	youtube_url,
	country_code,
	updated_at
) on table public.users to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Reserved username enforcement at DB level (LOW)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.protect_reserved_username()
returns trigger
language plpgsql
set search_path = public
as $$
begin
	if lower(trim(new.username)) in (
		'admin', 'administrator', 'afgan', 'root', 'staff', 'moderator', 'mod',
		'official', 'amhub', 'system', 'guest', 'anonymous', 'support', 'help',
		'security', 'api', 'settings', 'profile', 'me', 'home', 'explore',
		'upload', 'dashboard', 'notifications', 'bookmarks', 'likes', 'login',
		'register', 'auth', 'credits'
	) then
		raise exception 'USERNAME_RESERVED: This username is reserved and cannot be claimed.';
	end if;
	return new;
end;
$$;

drop trigger if exists users_protect_reserved_username on public.users;
create trigger users_protect_reserved_username
	before insert or update of username on public.users
	for each row
	execute function public.protect_reserved_username();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Fix MED-01: preset_downloads insert policy
--    Anonymous visitors may only insert their own (user_id IS NULL) downloads of
--    published presets; authenticated users may only insert their own downloads.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists preset_downloads_insert on public.preset_downloads;

create policy preset_downloads_insert_anon
	on public.preset_downloads for insert to anon
	with check (
		user_id is null
		and exists (
			select 1 from public.presets p
			where p.id = preset_downloads.preset_id
				and p.status = 'published'
		)
	);

create policy preset_downloads_insert_auth
	on public.preset_downloads for insert to authenticated
	with check (
		user_id = auth.uid()
		and exists (
			select 1 from public.presets p
			where p.id = preset_downloads.preset_id
				and p.status = 'published'
		)
	);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Fix HIGH-02: presets moderation + admin-only column protection
--    Non-staff users cannot:
--      - insert presets with status != 'pending' (self-publish blocked)
--      - set status to 'published' on update (moderation required)
--      - modify counters / featured flags (is_featured, featured_at,
--        trending_score, quality_score, download_count, unique_download_count,
--        like_count, bookmark_count, comment_count)
--      - inflate view_count beyond a tiny increment
--    service_role and staff still bypass (covers syncPresetCounter, admin
--    moderation, and the download counter service path).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.guard_presets_moderation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
	if auth.role() in ('service_role', 'supabase_admin') or public.is_staff(auth.uid()) then
		return new;
	end if;

	if tg_op = 'INSERT' then
		-- Cannot self-publish; force moderation queue
		if new.status is distinct from 'pending' then
			new.status := 'pending';
		end if;
		-- Never allow users to seed admin-only fields
		new.is_featured := false;
		new.featured_at := null;
		new.trending_score := 0;
		new.quality_score := 0;
		new.download_count := 0;
		new.unique_download_count := 0;
		new.view_count := 0;
		new.like_count := 0;
		new.bookmark_count := 0;
		new.comment_count := 0;
		return new;
	end if;

	-- UPDATE
	if new.status = 'published' and old.status is distinct from 'published' then
		raise exception 'FORBIDDEN: Moderation required to publish presets.';
	end if;

	if new.is_featured is distinct from old.is_featured
		or new.featured_at is distinct from old.featured_at
		or new.trending_score is distinct from old.trending_score
		or new.quality_score is distinct from old.quality_score
		or new.download_count is distinct from old.download_count
		or new.unique_download_count is distinct from old.unique_download_count
		or new.like_count is distinct from old.like_count
		or new.bookmark_count is distinct from old.bookmark_count
		or new.comment_count is distinct from old.comment_count
	then
		raise exception 'FORBIDDEN: Counter or admin-only fields cannot be modified by users.';
	end if;

	if new.view_count < old.view_count or new.view_count > old.view_count + 5 then
		raise exception 'FORBIDDEN: Invalid view_count update.';
	end if;

	return new;
end;
$$;

drop trigger if exists presets_guard_moderation on public.presets;
create trigger presets_guard_moderation
	before insert or update on public.presets
	for each row
	execute function public.guard_presets_moderation();