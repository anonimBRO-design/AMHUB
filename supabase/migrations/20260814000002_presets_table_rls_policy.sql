-- ─────────────────────────────────────────────────────────────────────────────
-- Fix RLS Policies for public.presets table
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists presets_insert_own on public.presets;

create policy presets_insert_own
	on public.presets
	for insert
	to authenticated
	with check (
		auth.uid() = creator_id
	);
