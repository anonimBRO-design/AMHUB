-- ─────────────────────────────────────────────────────────────────────────────
-- Multi-Source Presets Support
-- ─────────────────────────────────────────────────────────────────────────────
-- Allow presets to have multiple sources (e.g. XML file + AM link + Google Drive link).
-- Relax file_location_check so that file_url, am_link, or both can be present.

alter table public.presets
	drop constraint if exists presets_file_location_check;

alter table public.presets
	add constraint presets_file_location_check check (
		file_url is not null or am_link is not null
	);
