-- Affiliate referrals: orders attributed to a referrer earn 5% of net
-- (deducted from the platform share, recorded at order creation).

ALTER TABLE public.preset_orders
	ADD COLUMN IF NOT EXISTS referrer_id uuid
		REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.preset_orders
	ADD COLUMN IF NOT EXISTS referrer_commission numeric(12, 2) NOT NULL DEFAULT 0.00
		CHECK (referrer_commission >= 0);

CREATE INDEX IF NOT EXISTS preset_orders_referrer_idx
	ON public.preset_orders (referrer_id, payment_status);

-- Referrers may read orders attributed to them (for affiliate stats)
DROP POLICY IF EXISTS preset_orders_select_parties ON public.preset_orders;
CREATE POLICY preset_orders_select_parties ON public.preset_orders
  FOR SELECT TO authenticated
  USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR referrer_id = auth.uid()
    OR public.is_staff()
  );
