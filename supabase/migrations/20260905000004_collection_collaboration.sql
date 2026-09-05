-- Collaborative collections: owners can invite collaborators (by user id)
-- who may add/remove items. Editors can also view private collections.

CREATE TABLE IF NOT EXISTS public.collection_collaborators (
	collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
	user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	added_at timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY (collection_id, user_id)
);

CREATE INDEX IF NOT EXISTS collection_collaborators_user_idx
	ON public.collection_collaborators (user_id, added_at DESC);

-- Helper: owner, collaborator, or staff (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_collection_editor(p_collection_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
	SELECT EXISTS (
		SELECT 1 FROM public.collections c
		WHERE c.id = p_collection_id
			AND (c.owner_id = auth.uid() OR public.is_staff())
	)
	OR EXISTS (
		SELECT 1 FROM public.collection_collaborators cc
		WHERE cc.collection_id = p_collection_id
			AND cc.user_id = auth.uid()
	);
$$;

ALTER TABLE public.collection_collaborators ENABLE ROW LEVEL SECURITY;

-- Collaborators visible to anyone who can see the collection
CREATE POLICY collection_collaborators_select_visible
	ON public.collection_collaborators FOR SELECT
	USING (
		EXISTS (
			SELECT 1 FROM public.collections c
			WHERE c.id = collection_collaborators.collection_id
				AND (c.is_public OR c.owner_id = auth.uid() OR public.is_staff())
		)
		OR user_id = auth.uid()
	);

-- Only owner/staff can manage collaborators
CREATE POLICY collection_collaborators_manage_owner
	ON public.collection_collaborators FOR ALL
	USING (
		EXISTS (
			SELECT 1 FROM public.collections c
			WHERE c.id = collection_collaborators.collection_id
				AND (c.owner_id = auth.uid() OR public.is_staff())
		)
	)
	WITH CHECK (
		EXISTS (
			SELECT 1 FROM public.collections c
			WHERE c.id = collection_collaborators.collection_id
				AND (c.owner_id = auth.uid() OR public.is_staff())
		)
	);

-- Private collections visible to collaborators
DROP POLICY IF EXISTS collections_select_visible ON public.collections;
CREATE POLICY collections_select_visible
	ON public.collections FOR SELECT
	USING (
		is_public
		OR owner_id = auth.uid()
		OR public.is_staff()
		OR EXISTS (
			SELECT 1 FROM public.collection_collaborators cc
			WHERE cc.collection_id = collections.id
				AND cc.user_id = auth.uid()
		)
	);

-- Collection items manageable by editors (owner/collaborator/staff)
DROP POLICY IF EXISTS collection_items_manage_own_collection ON public.collection_items;
CREATE POLICY collection_items_manage_editors
	ON public.collection_items FOR ALL
	USING (
		EXISTS (
			SELECT 1 FROM public.collections c
			WHERE c.id = collection_items.collection_id
				AND (
					c.owner_id = auth.uid()
					OR public.is_staff()
					OR EXISTS (
						SELECT 1 FROM public.collection_collaborators cc
						WHERE cc.collection_id = c.id
							AND cc.user_id = auth.uid()
					)
				)
		)
	)
	WITH CHECK (
		EXISTS (
			SELECT 1 FROM public.collections c
			WHERE c.id = collection_items.collection_id
				AND (
					c.owner_id = auth.uid()
					OR public.is_staff()
					OR EXISTS (
						SELECT 1 FROM public.collection_collaborators cc
						WHERE cc.collection_id = c.id
							AND cc.user_id = auth.uid()
					)
				)
		)
	);
