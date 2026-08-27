-- AMHUB Migration: Security Hardening & Creator Withdrawals Foundation (2026-08-28)

-- 1. Tighten RLS on preset_orders table
ALTER TABLE IF EXISTS public.preset_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS preset_orders_select_parties ON public.preset_orders;
CREATE POLICY preset_orders_select_parties ON public.preset_orders
  FOR SELECT TO authenticated
  USING (
    buyer_id = auth.uid() 
    OR seller_id = auth.uid() 
    OR public.is_staff()
  );

DROP POLICY IF EXISTS preset_orders_staff_all ON public.preset_orders;
CREATE POLICY preset_orders_staff_all ON public.preset_orders
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- 2. Creator Withdrawals Table
CREATE TABLE IF NOT EXISTS public.creator_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 20000), -- Minimum withdrawal Rp 20.000
  payment_method TEXT NOT NULL CHECK (payment_method IN ('dana', 'gopay', 'ovo', 'bca', 'bri', 'mandiri')),
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  rejection_reason TEXT,
  payout_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_creator_withdrawals_creator_id ON public.creator_withdrawals(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_withdrawals_status ON public.creator_withdrawals(status);

ALTER TABLE public.creator_withdrawals ENABLE ROW LEVEL SECURITY;

-- Creator can view their own withdrawals
DROP POLICY IF EXISTS creator_withdrawals_select_own ON public.creator_withdrawals;
CREATE POLICY creator_withdrawals_select_own ON public.creator_withdrawals
  FOR SELECT TO authenticated
  USING (creator_id = auth.uid() OR public.is_staff());

-- Creator can submit a withdrawal request for themselves
DROP POLICY IF EXISTS creator_withdrawals_insert_own ON public.creator_withdrawals;
CREATE POLICY creator_withdrawals_insert_own ON public.creator_withdrawals
  FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Only staff can update withdrawal status
DROP POLICY IF EXISTS creator_withdrawals_staff_update ON public.creator_withdrawals;
CREATE POLICY creator_withdrawals_staff_update ON public.creator_withdrawals
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Grant table access
GRANT SELECT, INSERT ON public.creator_withdrawals TO authenticated;
GRANT ALL ON public.creator_withdrawals TO service_role;
