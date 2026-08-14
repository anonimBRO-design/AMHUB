-- ─────────────────────────────────────────────────────────────────────────────
-- Grant minimum necessary privileges to service_role on public.categories
-- ─────────────────────────────────────────────────────────────────────────────

grant select, insert on table public.categories to service_role;
