-- ─────────────────────────────────────────────────────────────────────────────
-- Fix Storage Bucket & RLS Policies for preset-videos
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Ensure preset-videos storage bucket allows all supported video MIME types.
-- 2. Ensure RLS policies on storage.objects allow public read and authenticated owner insert/update/delete.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
	('preset-videos', 'preset-videos', true, 104857600,
		array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/m4v', 'video/x-matroska'])
on conflict (id) do update
set
	public           = excluded.public,
	file_size_limit   = excluded.file_size_limit,
	allowed_mime_types = excluded.allowed_mime_types;

-- Drop existing policies if any to prevent duplicates
drop policy if exists preset_videos_public_read on storage.objects;
drop policy if exists preset_videos_owner_insert on storage.objects;
drop policy if exists preset_videos_owner_update on storage.objects;
drop policy if exists preset_videos_owner_delete on storage.objects;

-- 1. Public Read Policy: Allow anyone to view preview videos
create policy preset_videos_public_read
	on storage.objects for select
	using (bucket_id = 'preset-videos');

-- 2. Owner Insert Policy: Allow authenticated users to insert objects into their own folder
create policy preset_videos_owner_insert
	on storage.objects for insert
	with check (
		bucket_id = 'preset-videos'
		and (
			auth.role() = 'service_role'
			or (
				auth.role() = 'authenticated'
				and (storage.foldername(name))[1] = auth.uid()::text
			)
		)
	);

-- 3. Owner Update Policy
create policy preset_videos_owner_update
	on storage.objects for update
	using (
		bucket_id = 'preset-videos'
		and (
			auth.role() = 'service_role'
			or (storage.foldername(name))[1] = auth.uid()::text
			or public.is_staff()
		)
	)
	with check (
		bucket_id = 'preset-videos'
		and (
			auth.role() = 'service_role'
			or (storage.foldername(name))[1] = auth.uid()::text
			or public.is_staff()
		)
	);

-- 4. Owner Delete Policy
create policy preset_videos_owner_delete
	on storage.objects for delete
	using (
		bucket_id = 'preset-videos'
		and (
			auth.role() = 'service_role'
			or (storage.foldername(name))[1] = auth.uid()::text
			or public.is_staff()
		)
	);
