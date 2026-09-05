-- Remix tree: presets can declare the published preset they were remixed from.
-- Attribution is automatic; children are listed on the parent detail page.

ALTER TABLE public.presets
	ADD COLUMN IF NOT EXISTS remixed_from_id uuid
		REFERENCES public.presets(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS presets_remixed_from_idx
	ON public.presets (remixed_from_id)
	WHERE remixed_from_id IS NOT NULL;
