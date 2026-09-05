-- Weekly creator challenges with community voting.
-- One vote per user per challenge (changeable). Entries reference published presets.

CREATE TABLE IF NOT EXISTS public.challenges (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	title text NOT NULL,
	description text,
	theme text,
	cover_url text,
	prize_text text,
	starts_at timestamptz NOT NULL DEFAULT now(),
	ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
	is_active boolean NOT NULL DEFAULT true,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenge_entries (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
	preset_id uuid NOT NULL REFERENCES public.presets(id) ON DELETE CASCADE,
	creator_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT challenge_entries_unique_preset UNIQUE (challenge_id, preset_id)
);

CREATE TABLE IF NOT EXISTS public.challenge_votes (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
	preset_id uuid NOT NULL REFERENCES public.presets(id) ON DELETE CASCADE,
	voter_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT challenge_votes_one_per_user UNIQUE (challenge_id, voter_id)
);

CREATE INDEX IF NOT EXISTS challenges_active_idx
	ON public.challenges (is_active, ends_at DESC);
CREATE INDEX IF NOT EXISTS challenge_entries_challenge_idx
	ON public.challenge_entries (challenge_id, created_at DESC);
CREATE INDEX IF NOT EXISTS challenge_votes_challenge_preset_idx
	ON public.challenge_votes (challenge_id, preset_id);

CREATE TRIGGER challenges_set_updated_at
	BEFORE UPDATE ON public.challenges
	FOR EACH ROW
	EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_votes ENABLE ROW LEVEL SECURITY;

-- Challenges: public read, staff write
CREATE POLICY challenges_select_public
	ON public.challenges FOR SELECT
	USING (true);

CREATE POLICY challenges_staff_write
	ON public.challenges FOR ALL
	USING (public.is_staff())
	WITH CHECK (public.is_staff());

-- Entries: public read, users submit own presets, owners/staff delete
CREATE POLICY challenge_entries_select_public
	ON public.challenge_entries FOR SELECT
	USING (true);

CREATE POLICY challenge_entries_insert_own
	ON public.challenge_entries FOR INSERT
	WITH CHECK (creator_id = auth.uid());

CREATE POLICY challenge_entries_delete_own
	ON public.challenge_entries FOR DELETE
	USING (creator_id = auth.uid() OR public.is_staff());

-- Votes: public read, users vote as themselves
CREATE POLICY challenge_votes_select_public
	ON public.challenge_votes FOR SELECT
	USING (true);

CREATE POLICY challenge_votes_insert_own
	ON public.challenge_votes FOR INSERT
	WITH CHECK (voter_id = auth.uid());

CREATE POLICY challenge_votes_update_own
	ON public.challenge_votes FOR UPDATE
	USING (voter_id = auth.uid())
	WITH CHECK (voter_id = auth.uid());

CREATE POLICY challenge_votes_delete_own
	ON public.challenge_votes FOR DELETE
	USING (voter_id = auth.uid());

-- Seed: first weekly challenge (active 7 days)
INSERT INTO public.challenges (title, description, theme, prize_text, ends_at, is_active)
VALUES (
	'Challenge Mingguan #1: Velocity Edit',
	'Upload preset velocity terbaikmu dan kumpulkan vote dari komunitas. Pemenang tampil di halaman utama.',
	'velocity',
	'Featured di homepage + 500 XP',
	now() + interval '7 days',
	true
)
ON CONFLICT DO NOTHING;
