-- Add aspect_ratios column to presets table
-- Supports multiple canvas ratios per preset (e.g. 9:16 + 1:1)
ALTER TABLE public.presets
  ADD COLUMN IF NOT EXISTS aspect_ratios text[] DEFAULT '{9:16}';

COMMENT ON COLUMN public.presets.aspect_ratios
  IS 'Supported aspect ratios for this preset, e.g. {"9:16","16:9","1:1"}';
