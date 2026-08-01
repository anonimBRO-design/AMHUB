-- PresetHub database foundation.
-- Scope: core content, social graph, comments, notifications, RLS, and storage.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create table public.users (
	id uuid primary key references auth.users(id) on delete cascade,
	username text not null,
	display_name text not null,
	email text not null,
	avatar_url text,
	banner_url text,
	bio text,
	website_url text,
	tiktok_handle text,
	instagram_handle text,
	discord_handle text,
	youtube_url text,
	xp integer not null default 0 check (xp >= 0),
	level integer not null default 1 check (level >= 1),
	is_verified boolean not null default false,
	is_staff boolean not null default false,
	country_code char(2),
	auth_provider text,
	last_active_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint users_username_format check (username ~ '^[a-z0-9_]{3,24}$'),
	constraint users_display_name_length check (char_length(display_name) between 1 and 80),
	constraint users_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
	constraint users_bio_length check (bio is null or char_length(bio) <= 280),
	constraint users_country_code_upper check (country_code is null or country_code = upper(country_code))
);

create unique index users_username_lower_key on public.users (lower(username));
create unique index users_email_lower_key on public.users (lower(email));
create index users_last_active_idx on public.users (last_active_at desc);

create trigger users_set_updated_at
	before update on public.users
	for each row
	execute function public.set_updated_at();

create or replace function public.is_staff(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists (
		select 1
		from public.users
		where id = user_id
			and is_staff = true
	);
$$;

create table public.categories (
	id uuid primary key default gen_random_uuid(),
	slug text not null unique,
	label text not null,
	description text,
	color_token text,
	sort_order integer not null default 0,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint categories_slug_format check (slug ~ '^[a-z0-9-]{2,40}$'),
	constraint categories_label_length check (char_length(label) between 1 and 80)
);

create index categories_active_sort_idx on public.categories (is_active, sort_order, label);

create trigger categories_set_updated_at
	before update on public.categories
	for each row
	execute function public.set_updated_at();

create table public.tags (
	id uuid primary key default gen_random_uuid(),
	slug text not null unique,
	label text not null,
	usage_count integer not null default 0 check (usage_count >= 0),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint tags_slug_format check (slug ~ '^[a-z0-9-]{2,40}$'),
	constraint tags_label_length check (char_length(label) between 1 and 40)
);

create index tags_usage_idx on public.tags (usage_count desc, label);

create trigger tags_set_updated_at
	before update on public.tags
	for each row
	execute function public.set_updated_at();

create table public.presets (
	id uuid primary key default gen_random_uuid(),
	slug text not null unique,
	creator_id uuid not null,
	title text not null,
	description text,
	thumbnail_url text not null,
	preview_video_url text,
	file_type text not null,
	file_url text,
	am_link text,
	category text not null,
	style text[] not null default '{}',
	tags text[] not null default '{}',
	difficulty text not null default 'beginner',
	am_version_min text,
	am_version_max text,
	device_support text[] not null default '{"both"}',
	download_count integer not null default 0 check (download_count >= 0),
	view_count integer not null default 0 check (view_count >= 0),
	like_count integer not null default 0 check (like_count >= 0),
	bookmark_count integer not null default 0 check (bookmark_count >= 0),
	comment_count integer not null default 0 check (comment_count >= 0),
	trending_score double precision not null default 0,
	quality_score double precision not null default 0,
	status text not null default 'pending',
	is_featured boolean not null default false,
	featured_at timestamptz,
	rejection_reason text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint presets_creator_id_fkey foreign key (creator_id) references public.users(id) on delete cascade,
	constraint presets_category_fkey foreign key (category) references public.categories(slug) on update cascade,
	constraint presets_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
	constraint presets_title_length check (char_length(title) between 1 and 100),
	constraint presets_description_length check (description is null or char_length(description) <= 2000),
	constraint presets_file_type_check check (file_type in ('xml', 'qr', 'link')),
	constraint presets_file_location_check check (
		(file_type in ('xml', 'qr') and file_url is not null and am_link is null)
		or (file_type = 'link' and am_link is not null)
	),
	constraint presets_difficulty_check check (difficulty in ('beginner', 'intermediate', 'advanced')),
	constraint presets_device_support_check check (device_support <@ array['android', 'ios', 'both']::text[]),
	constraint presets_status_check check (status in ('pending', 'published', 'rejected', 'removed')),
	constraint presets_tags_limit check (cardinality(tags) <= 10),
	constraint presets_style_limit check (cardinality(style) <= 10)
);

create index presets_creator_idx on public.presets (creator_id);
create index presets_status_created_idx on public.presets (status, created_at desc);
create index presets_status_trending_idx on public.presets (status, trending_score desc);
create index presets_category_idx on public.presets (category) where status = 'published';
create index presets_tags_gin_idx on public.presets using gin (tags);
create index presets_device_support_gin_idx on public.presets using gin (device_support);

create trigger presets_set_updated_at
	before update on public.presets
	for each row
	execute function public.set_updated_at();

create table public.preset_tags (
	preset_id uuid not null references public.presets(id) on delete cascade,
	tag_id uuid not null references public.tags(id) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (preset_id, tag_id)
);

create index preset_tags_tag_idx on public.preset_tags (tag_id);

create table public.collections (
	id uuid primary key default gen_random_uuid(),
	slug text not null,
	owner_id uuid not null references public.users(id) on delete cascade,
	title text not null,
	description text,
	cover_url text,
	is_public boolean not null default true,
	preset_count integer not null default 0 check (preset_count >= 0),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint collections_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
	constraint collections_title_length check (char_length(title) between 1 and 100),
	constraint collections_description_length check (description is null or char_length(description) <= 500),
	constraint collections_owner_slug_key unique (owner_id, slug)
);

create index collections_owner_idx on public.collections (owner_id, created_at desc);
create index collections_public_idx on public.collections (is_public, created_at desc);

create trigger collections_set_updated_at
	before update on public.collections
	for each row
	execute function public.set_updated_at();

create table public.collection_items (
	collection_id uuid not null references public.collections(id) on delete cascade,
	preset_id uuid not null references public.presets(id) on delete cascade,
	added_at timestamptz not null default now(),
	sort_order integer not null default 0,
	primary key (collection_id, preset_id)
);

create index collection_items_preset_idx on public.collection_items (preset_id);

create table public.follows (
	follower_id uuid not null references public.users(id) on delete cascade,
	following_id uuid not null references public.users(id) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (follower_id, following_id),
	constraint follows_no_self_follow check (follower_id <> following_id)
);

create index follows_following_idx on public.follows (following_id, created_at desc);

create table public.preset_likes (
	preset_id uuid not null references public.presets(id) on delete cascade,
	user_id uuid not null references public.users(id) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (preset_id, user_id)
);

create index preset_likes_user_idx on public.preset_likes (user_id, created_at desc);

create table public.preset_bookmarks (
	preset_id uuid not null references public.presets(id) on delete cascade,
	user_id uuid not null references public.users(id) on delete cascade,
	collection_id uuid references public.collections(id) on delete set null,
	created_at timestamptz not null default now(),
	primary key (preset_id, user_id)
);

create index preset_bookmarks_user_idx on public.preset_bookmarks (user_id, created_at desc);
create index preset_bookmarks_collection_idx on public.preset_bookmarks (collection_id);

create table public.comments (
	id uuid primary key default gen_random_uuid(),
	preset_id uuid not null references public.presets(id) on delete cascade,
	user_id uuid not null references public.users(id) on delete cascade,
	parent_id uuid references public.comments(id) on delete cascade,
	body text not null,
	like_count integer not null default 0 check (like_count >= 0),
	is_pinned boolean not null default false,
	is_removed boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint comments_body_length check (char_length(body) between 1 and 500)
);

create index comments_preset_created_idx on public.comments (preset_id, created_at desc);
create index comments_parent_idx on public.comments (parent_id);
create index comments_user_idx on public.comments (user_id, created_at desc);

create trigger comments_set_updated_at
	before update on public.comments
	for each row
	execute function public.set_updated_at();

create or replace function public.validate_comment_parent()
returns trigger
language plpgsql
as $$
declare
	parent_preset_id uuid;
	parent_parent_id uuid;
begin
	if new.parent_id is null then
		return new;
	end if;

	select preset_id, parent_id
	into parent_preset_id, parent_parent_id
	from public.comments
	where id = new.parent_id;

	if parent_preset_id is null then
		raise exception 'Parent comment does not exist';
	end if;

	if parent_preset_id <> new.preset_id then
		raise exception 'Replies must belong to the same preset as their parent comment';
	end if;

	if parent_parent_id is not null then
		raise exception 'Comments support only one reply level';
	end if;

	return new;
end;
$$;

create trigger comments_validate_parent
	before insert or update of parent_id, preset_id on public.comments
	for each row
	execute function public.validate_comment_parent();

create table public.notifications (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.users(id) on delete cascade,
	type text not null,
	actor_id uuid references public.users(id) on delete set null,
	preset_id uuid references public.presets(id) on delete set null,
	message text,
	is_read boolean not null default false,
	created_at timestamptz not null default now(),
	constraint notifications_type_check check (type in ('like', 'comment', 'follow', 'download', 'system')),
	constraint notifications_message_length check (message is null or char_length(message) <= 500)
);

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index notifications_user_unread_idx on public.notifications (user_id, is_read, created_at desc);

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.presets enable row level security;
alter table public.preset_tags enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.follows enable row level security;
alter table public.preset_likes enable row level security;
alter table public.preset_bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;

create policy users_select_public
	on public.users for select
	using (true);

create policy users_insert_own
	on public.users for insert
	with check (
		auth.uid() = id
		and lower(email) = lower(auth.jwt() ->> 'email')
	);

create policy users_update_own
	on public.users for update
	using (auth.uid() = id)
	with check (
		auth.uid() = id
		and lower(email) = lower(auth.jwt() ->> 'email')
	);

create policy categories_select_active
	on public.categories for select
	using (is_active or public.is_staff());

create policy categories_staff_write
	on public.categories for all
	using (public.is_staff())
	with check (public.is_staff());

create policy tags_select_public
	on public.tags for select
	using (true);

create policy tags_staff_write
	on public.tags for all
	using (public.is_staff())
	with check (public.is_staff());

create policy presets_select_visible
	on public.presets for select
	using (
		status = 'published'
		or creator_id = auth.uid()
		or public.is_staff()
	);

create policy presets_insert_own
	on public.presets for insert
	with check (
		auth.uid() = creator_id
		and exists (
			select 1
			from public.categories
			where slug = category
				and is_active = true
		)
	);

create policy presets_update_own_or_staff
	on public.presets for update
	using (creator_id = auth.uid() or public.is_staff())
	with check (creator_id = auth.uid() or public.is_staff());

create policy presets_delete_own_or_staff
	on public.presets for delete
	using (creator_id = auth.uid() or public.is_staff());

create policy preset_tags_select_visible
	on public.preset_tags for select
	using (
		exists (
			select 1
			from public.presets
			where presets.id = preset_tags.preset_id
				and (presets.status = 'published' or presets.creator_id = auth.uid() or public.is_staff())
		)
	);

create policy preset_tags_manage_own_preset
	on public.preset_tags for all
	using (
		exists (
			select 1
			from public.presets
			where presets.id = preset_tags.preset_id
				and (presets.creator_id = auth.uid() or public.is_staff())
		)
	)
	with check (
		exists (
			select 1
			from public.presets
			where presets.id = preset_tags.preset_id
				and (presets.creator_id = auth.uid() or public.is_staff())
		)
	);

create policy collections_select_visible
	on public.collections for select
	using (is_public or owner_id = auth.uid() or public.is_staff());

create policy collections_insert_own
	on public.collections for insert
	with check (owner_id = auth.uid());

create policy collections_update_own
	on public.collections for update
	using (owner_id = auth.uid() or public.is_staff())
	with check (owner_id = auth.uid() or public.is_staff());

create policy collections_delete_own
	on public.collections for delete
	using (owner_id = auth.uid() or public.is_staff());

create policy collection_items_select_visible
	on public.collection_items for select
	using (
		exists (
			select 1
			from public.collections
			where collections.id = collection_items.collection_id
				and (collections.is_public or collections.owner_id = auth.uid() or public.is_staff())
		)
	);

create policy collection_items_manage_own_collection
	on public.collection_items for all
	using (
		exists (
			select 1
			from public.collections
			where collections.id = collection_items.collection_id
				and (collections.owner_id = auth.uid() or public.is_staff())
		)
	)
	with check (
		exists (
			select 1
			from public.collections
			where collections.id = collection_items.collection_id
				and (collections.owner_id = auth.uid() or public.is_staff())
		)
	);

create policy follows_select_public
	on public.follows for select
	using (true);

create policy follows_insert_own
	on public.follows for insert
	with check (follower_id = auth.uid());

create policy follows_delete_own
	on public.follows for delete
	using (follower_id = auth.uid() or public.is_staff());

create policy preset_likes_select_public
	on public.preset_likes for select
	using (true);

create policy preset_likes_insert_own
	on public.preset_likes for insert
	with check (
		user_id = auth.uid()
		and exists (
			select 1
			from public.presets
			where presets.id = preset_likes.preset_id
				and presets.status = 'published'
		)
	);

create policy preset_likes_delete_own
	on public.preset_likes for delete
	using (user_id = auth.uid() or public.is_staff());

create policy preset_bookmarks_select_own
	on public.preset_bookmarks for select
	using (user_id = auth.uid() or public.is_staff());

create policy preset_bookmarks_insert_own
	on public.preset_bookmarks for insert
	with check (
		user_id = auth.uid()
		and exists (
			select 1
			from public.presets
			where presets.id = preset_bookmarks.preset_id
				and presets.status = 'published'
		)
	);

create policy preset_bookmarks_delete_own
	on public.preset_bookmarks for delete
	using (user_id = auth.uid() or public.is_staff());

create policy comments_select_visible
	on public.comments for select
	using (
		(not is_removed and exists (
			select 1
			from public.presets
			where presets.id = comments.preset_id
				and presets.status = 'published'
		))
		or user_id = auth.uid()
		or public.is_staff()
	);

create policy comments_insert_own
	on public.comments for insert
	with check (
		user_id = auth.uid()
		and not is_removed
		and exists (
			select 1
			from public.presets
			where presets.id = comments.preset_id
				and presets.status = 'published'
		)
	);

create policy comments_update_own
	on public.comments for update
	using (user_id = auth.uid() or public.is_staff())
	with check (user_id = auth.uid() or public.is_staff());

create policy comments_delete_own
	on public.comments for delete
	using (user_id = auth.uid() or public.is_staff());

create policy notifications_select_own
	on public.notifications for select
	using (user_id = auth.uid() or public.is_staff());

create policy notifications_update_own
	on public.notifications for update
	using (user_id = auth.uid() or public.is_staff())
	with check (user_id = auth.uid() or public.is_staff());

create policy notifications_staff_insert
	on public.notifications for insert
	with check (public.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
	('thumbnails', 'thumbnails', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
	('preset-files', 'preset-files', false, 5242880, array['application/xml', 'text/xml', 'image/png', 'image/jpeg', 'image/webp']),
	('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
	public = excluded.public,
	file_size_limit = excluded.file_size_limit,
	allowed_mime_types = excluded.allowed_mime_types;

create policy thumbnails_public_read
	on storage.objects for select
	using (bucket_id = 'thumbnails');

create policy thumbnails_owner_insert
	on storage.objects for insert
	with check (
		bucket_id = 'thumbnails'
		and auth.role() = 'authenticated'
		and (storage.foldername(name))[1] = auth.uid()::text
	);

create policy thumbnails_owner_update
	on storage.objects for update
	using (
		bucket_id = 'thumbnails'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	)
	with check (
		bucket_id = 'thumbnails'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	);

create policy thumbnails_owner_delete
	on storage.objects for delete
	using (
		bucket_id = 'thumbnails'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	);

create policy avatars_public_read
	on storage.objects for select
	using (bucket_id = 'avatars');

create policy avatars_owner_insert
	on storage.objects for insert
	with check (
		bucket_id = 'avatars'
		and auth.role() = 'authenticated'
		and (storage.foldername(name))[1] = auth.uid()::text
	);

create policy avatars_owner_update
	on storage.objects for update
	using (
		bucket_id = 'avatars'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	)
	with check (
		bucket_id = 'avatars'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	);

create policy avatars_owner_delete
	on storage.objects for delete
	using (
		bucket_id = 'avatars'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	);

create policy preset_files_owner_select
	on storage.objects for select
	using (
		bucket_id = 'preset-files'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	);

create policy preset_files_owner_insert
	on storage.objects for insert
	with check (
		bucket_id = 'preset-files'
		and auth.role() = 'authenticated'
		and (storage.foldername(name))[1] = auth.uid()::text
	);

create policy preset_files_owner_update
	on storage.objects for update
	using (
		bucket_id = 'preset-files'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	)
	with check (
		bucket_id = 'preset-files'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	);

create policy preset_files_owner_delete
	on storage.objects for delete
	using (
		bucket_id = 'preset-files'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	);
