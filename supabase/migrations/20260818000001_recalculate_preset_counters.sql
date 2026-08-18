-- Migration: Recalculate preset counters and establish triggers for bookmark/like syncing
-- Run this in Supabase SQL Editor to instantly fix and sync existing bookmark counts

-- 1. Recalculate existing counts across all presets
UPDATE public.presets p
SET bookmark_count = COALESCE((
    SELECT COUNT(*)::int
    FROM public.preset_bookmarks pb
    WHERE pb.preset_id = p.id
), 0),
like_count = COALESCE((
    SELECT COUNT(*)::int
    FROM public.preset_likes pl
    WHERE pl.preset_id = p.id
), 0);

-- 2. Trigger function to maintain bookmark_count atomically
CREATE OR REPLACE FUNCTION public.sync_preset_bookmark_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.presets
        SET bookmark_count = (
            SELECT COUNT(*)::int FROM public.preset_bookmarks WHERE preset_id = NEW.preset_id
        )
        WHERE id = NEW.preset_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.presets
        SET bookmark_count = (
            SELECT COUNT(*)::int FROM public.preset_bookmarks WHERE preset_id = OLD.preset_id
        )
        WHERE id = OLD.preset_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_preset_bookmark_count ON public.preset_bookmarks;
CREATE TRIGGER trigger_sync_preset_bookmark_count
AFTER INSERT OR DELETE ON public.preset_bookmarks
FOR EACH ROW EXECUTE FUNCTION public.sync_preset_bookmark_count();

-- 3. Trigger function to maintain like_count atomically
CREATE OR REPLACE FUNCTION public.sync_preset_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.presets
        SET like_count = (
            SELECT COUNT(*)::int FROM public.preset_likes WHERE preset_id = NEW.preset_id
        )
        WHERE id = NEW.preset_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.presets
        SET like_count = (
            SELECT COUNT(*)::int FROM public.preset_likes WHERE preset_id = OLD.preset_id
        )
        WHERE id = OLD.preset_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_preset_like_count ON public.preset_likes;
CREATE TRIGGER trigger_sync_preset_like_count
AFTER INSERT OR DELETE ON public.preset_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_preset_like_count();

NOTIFY pgrst, 'reload schema';
