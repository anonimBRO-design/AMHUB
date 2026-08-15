-- AMHUB Database Migration: Performance Indexes for Explore Creators

-- 1. Performance index for case-insensitive display_name search
CREATE INDEX IF NOT EXISTS users_display_name_lower_idx ON public.users (lower(display_name));

-- 2. Performance index for verified users filter
CREATE INDEX IF NOT EXISTS users_is_verified_idx ON public.users (is_verified) WHERE is_verified = true;
