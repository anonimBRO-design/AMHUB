-- Migration: Recalculate preset comment counters and establish trigger for comment syncing
-- Run this in Supabase SQL Editor to sync existing comment counts atomically

-- 1. Recalculate existing comment_count across all presets
UPDATE public.presets p
SET comment_count = COALESCE((
    SELECT COUNT(*)::int
    FROM public.comments c
    WHERE c.preset_id = p.id AND c.is_removed = false
), 0);

-- 2. Trigger function to maintain comment_count atomically
CREATE OR REPLACE FUNCTION public.sync_preset_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.presets
        SET comment_count = (
            SELECT COUNT(*)::int FROM public.comments WHERE preset_id = NEW.preset_id AND is_removed = false
        )
        WHERE id = NEW.preset_id;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (NEW.is_removed <> OLD.is_removed OR NEW.preset_id <> OLD.preset_id) THEN
            UPDATE public.presets
            SET comment_count = (
                SELECT COUNT(*)::int FROM public.comments WHERE preset_id = NEW.preset_id AND is_removed = false
            )
            WHERE id = NEW.preset_id;

            IF (NEW.preset_id <> OLD.preset_id) THEN
                UPDATE public.presets
                SET comment_count = (
                    SELECT COUNT(*)::int FROM public.comments WHERE preset_id = OLD.preset_id AND is_removed = false
                )
                WHERE id = OLD.preset_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.presets
        SET comment_count = (
            SELECT COUNT(*)::int FROM public.comments WHERE preset_id = OLD.preset_id AND is_removed = false
        )
        WHERE id = OLD.preset_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_preset_comment_count ON public.comments;
CREATE TRIGGER trigger_sync_preset_comment_count
AFTER INSERT OR UPDATE OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.sync_preset_comment_count();

NOTIFY pgrst, 'reload schema';
