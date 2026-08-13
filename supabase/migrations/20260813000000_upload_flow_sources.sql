-- AMHUB upload flow: preset source types, preview video, and category seed.
-- Scope:
--   1. Seed the categories table (incl. the new "JJ" category) so the
--      presets.category foreign key resolves for every wizard slug.
--   2. Add the preview_video_url column to presets (already referenced by
--      the hand-written Database types but missing from the schema).
--   3. Extend the presets file_type check + file_location check to support
--      google_drive and alight_creative preset sources alongside xml/qr/link.
--   4. Create a public preset-videos storage bucket for preview videos.
-- Idempotent: safe to re-run against a database that already ran the
-- 20260728000000_database_foundation migration.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Categories seed
-- ─────────────────────────────────────────────────────────────────────────────
-- Slugs match the ids used across the app
-- (CategoryScroller, FilterSheet, DetailsStep): velocity, transition, color,
-- anime, gaming, lyric, 3d, slowmo. "jj" is the new category mandated by the
-- upload-flow spec and follows the existing single-token lowercase convention.
insert into public.categories (slug, label, color_token, sort_order, is_active)
values
	('velocity',    'Velocity',     'amber',  1,  true),
	('transition',  'Transition',   'sky',    2,  true),
	('color',       'Color Grading','violet', 3,  true),
	('anime',       'Anime',        'rose',   4,  true),
	('gaming',      'Gaming',       'emerald',5,  true),
	('lyric',       'Lyric',        'fuchsia',6,  true),
	('3d',          '3D Motion',     'indigo', 7,  true),
	('slowmo',      'Slow Motion',  'cyan',   8,  true),
	('jj',          'JJ',           'purple', 9,  true)
on conflict (slug) do update
set
	label       = excluded.label,
	color_token = excluded.color_token,
	sort_order  = excluded.sort_order,
	is_active   = excluded.is_active;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Preview video column
-- ─────────────────────────────────────────────────────────────────────────────
-- preview_video_url was already present in packages/types/src/database.ts and
-- selected by the DAL, but absent from the physical schema. Add it here.
alter table public.presets
	add column if not exists preview_video_url text;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Preset source types
-- ─────────────────────────────────────────────────────────────────────────────
-- file_type is the preset source discriminator. Extend it beyond the original
-- ('xml','qr','link') to include 'google_drive' and 'alight_creative'.
-- Storage layout stays the same: uploaded XML/QR file references go in
-- file_url; external source URLs (alightcreative / drive / legacy link) go in
-- am_link. Exactly one of file_url / am_link is required depending on type.
alter table public.presets
	drop constraint if exists presets_file_type_check;

alter table public.presets
	add constraint presets_file_type_check check (
		file_type in ('xml', 'qr', 'link', 'google_drive', 'alight_creative')
	);

alter table public.presets
	drop constraint if exists presets_file_location_check;

alter table public.presets
	add constraint presets_file_location_check check (
		-- Uploaded sources: a stored file reference is required, no external link.
		(file_type in ('xml', 'qr') and file_url is not null and am_link is null)
		-- External sources: a link is required, no uploaded file reference.
		or (file_type in ('link', 'google_drive', 'alight_creative') and am_link is not null and file_url is null)
	);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Preview-video storage bucket
-- ─────────────────────────────────────────────────────────────────────────────
-- Public-read so preview videos can be streamed in the <video> element without
-- signed URLs. Writes are still owner-scoped via RLS (foldername = auth.uid()).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
	('preset-videos', 'preset-videos', true, 104857600,
		array['video/mp4', 'video/webm'])
on conflict (id) do update
set
	public           = excluded.public,
	file_size_limit   = excluded.file_size_limit,
	allowed_mime_types = excluded.allowed_mime_types;

create policy preset_videos_public_read
	on storage.objects for select
	using (bucket_id = 'preset-videos');

create policy preset_videos_owner_insert
	on storage.objects for insert
	with check (
		bucket_id = 'preset-videos'
		and auth.role() = 'authenticated'
		and (storage.foldername(name))[1] = auth.uid()::text
	);

create policy preset_videos_owner_update
	on storage.objects for update
	using (
		bucket_id = 'preset-videos'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	)
	with check (
		bucket_id = 'preset-videos'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	);

create policy preset_videos_owner_delete
	on storage.objects for delete
	using (
		bucket_id = 'preset-videos'
		and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
	);
