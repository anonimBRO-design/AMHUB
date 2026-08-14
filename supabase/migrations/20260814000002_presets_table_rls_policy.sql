-- ─────────────────────────────────────────────────────────────────────────────
-- Fix RLS Policies for public.presets table
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists presets_insert_own on public.presets;

create policy presets_insert_own
	on public.presets for insert
	with check (
		auth.role() = 'service_role'
		or (
			auth.role() = 'authenticated'
			and auth.uid() = creator_id
		)
	);
