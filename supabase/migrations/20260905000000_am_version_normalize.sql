-- Normalize stored Alight Motion versions to zero-padded comparable form (NNN.NNN.NNN)
-- so plain lexicographic comparison matches semantic version ordering.
-- Invalid / free-form values are nulled (treated as "compatible with all").

CREATE OR REPLACE FUNCTION public.normalize_am_version(v text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
	SELECT CASE
		WHEN v IS NULL OR btrim(v) = '' THEN NULL
		WHEN btrim(v) ~ '^\d{1,3}(\.\d{1,3}){0,2}$' THEN (
			SELECT string_agg(lpad(p, 3, '0'), '.' ORDER BY ord)
			FROM unnest(string_to_array(btrim(v), '.')) WITH ORDINALITY AS u(p, ord)
		) || repeat('.000', 3 - array_length(string_to_array(btrim(v), '.'), 1))
		ELSE NULL
	END
$$;

UPDATE public.presets
SET am_version_min = public.normalize_am_version(am_version_min)
WHERE am_version_min IS NOT NULL;

UPDATE public.presets
SET am_version_max = public.normalize_am_version(am_version_max)
WHERE am_version_max IS NOT NULL;
