-- Custom preset requests: users post a brief + budget, creators bid with offers.
-- Accepting an offer moves the request to in_progress and rejects other offers.

CREATE TABLE IF NOT EXISTS public.custom_requests (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	requester_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
	description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 2000),
	budget_min integer NOT NULL DEFAULT 0 CHECK (budget_min >= 0),
	budget_max integer NOT NULL CHECK (budget_max >= 1000),
	deadline_at timestamptz,
	status text NOT NULL DEFAULT 'open'
		CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now(),
	CHECK (budget_max >= budget_min)
);

CREATE TABLE IF NOT EXISTS public.request_offers (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	request_id uuid NOT NULL REFERENCES public.custom_requests(id) ON DELETE CASCADE,
	creator_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	price integer NOT NULL CHECK (price >= 1000),
	message text CHECK (message IS NULL OR char_length(message) <= 1000),
	eta_days integer CHECK (eta_days IS NULL OR eta_days BETWEEN 1 AND 90),
	status text NOT NULL DEFAULT 'pending'
		CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT request_offers_one_per_creator UNIQUE (request_id, creator_id)
);

CREATE INDEX IF NOT EXISTS custom_requests_status_idx
	ON public.custom_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS request_offers_request_idx
	ON public.request_offers (request_id, created_at ASC);

CREATE TRIGGER custom_requests_set_updated_at
	BEFORE UPDATE ON public.custom_requests
	FOR EACH ROW
	EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER request_offers_set_updated_at
	BEFORE UPDATE ON public.request_offers
	FOR EACH ROW
	EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_offers ENABLE ROW LEVEL SECURITY;

-- Requests: public read, owner/staff write
CREATE POLICY custom_requests_select_public
	ON public.custom_requests FOR SELECT
	USING (true);

CREATE POLICY custom_requests_insert_own
	ON public.custom_requests FOR INSERT
	WITH CHECK (requester_id = auth.uid());

CREATE POLICY custom_requests_update_own
	ON public.custom_requests FOR UPDATE
	USING (requester_id = auth.uid() OR public.is_staff())
	WITH CHECK (requester_id = auth.uid() OR public.is_staff());

CREATE POLICY custom_requests_delete_own
	ON public.custom_requests FOR DELETE
	USING (requester_id = auth.uid() OR public.is_staff());

-- Offers: visible to request owner, offering creator, staff
CREATE POLICY request_offers_select_involved
	ON public.request_offers FOR SELECT
	USING (
		creator_id = auth.uid()
		OR public.is_staff()
		OR EXISTS (
			SELECT 1 FROM public.custom_requests r
			WHERE r.id = request_offers.request_id
				AND r.requester_id = auth.uid()
		)
	);

CREATE POLICY request_offers_insert_own
	ON public.request_offers FOR INSERT
	WITH CHECK (creator_id = auth.uid());

CREATE POLICY request_offers_update_involved
	ON public.request_offers FOR UPDATE
	USING (
		creator_id = auth.uid()
		OR public.is_staff()
		OR EXISTS (
			SELECT 1 FROM public.custom_requests r
			WHERE r.id = request_offers.request_id
				AND r.requester_id = auth.uid()
		)
	)
	WITH CHECK (
		creator_id = auth.uid()
		OR public.is_staff()
		OR EXISTS (
			SELECT 1 FROM public.custom_requests r
			WHERE r.id = request_offers.request_id
				AND r.requester_id = auth.uid()
		)
	);
