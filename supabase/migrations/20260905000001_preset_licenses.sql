-- License tiers: creators can offer a Commercial license upgrade on paid presets.
-- Personal license = base price. Commercial license = commercial_price (0 = not offered).
-- Orders record which license was purchased.

ALTER TABLE public.presets
	ADD COLUMN IF NOT EXISTS commercial_price integer NOT NULL DEFAULT 0
		CHECK (commercial_price >= 0);

ALTER TABLE public.preset_orders
	ADD COLUMN IF NOT EXISTS license_type text NOT NULL DEFAULT 'personal'
		CHECK (license_type IN ('personal', 'commercial'));

CREATE INDEX IF NOT EXISTS presets_commercial_price_idx
	ON public.presets (commercial_price DESC)
	WHERE commercial_price > 0;
