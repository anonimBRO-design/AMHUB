# Supabase & PostgreSQL RLS Hardening Reference

## 1. Column-Level Permission Lockdown

In Supabase, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` protects rows, but `SELECT *` can still expose sensitive columns if column-level grants are too broad.

### Anti-Pattern: Exposing Public Users Table

```sql
-- DANGEROUS: allows anyone to scrape emails, phone numbers, auth providers
CREATE POLICY users_select_public ON public.users FOR SELECT USING (true);
```

### Best Practice: Column Grant Restriction

```sql
-- 1. Revoke raw table SELECT from public and authenticated roles
REVOKE SELECT ON public.users FROM anon, authenticated, public;

-- 2. Grant only safe public columns to public/anon
GRANT SELECT (
  id, username, display_name, avatar_url, banner_url,
  bio, website_url, tiktok_handle, instagram_handle,
  discord_handle, youtube_url, xp, level, is_verified,
  is_staff, country_code, created_at, updated_at, role
) ON public.users TO anon, authenticated, public;

-- 3. Service role maintains full select access for server operations
GRANT SELECT ON public.users TO service_role;
```

---

## 2. Order & Financial Isolation (IDOR Prevention)

```sql
-- Secure Policy for preset_orders: Only buyers, sellers, or staff can read
CREATE POLICY preset_orders_select_parties ON public.preset_orders
  FOR SELECT TO authenticated
  USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR public.is_staff()
  );

-- Only staff or service_role can update or delete orders
CREATE POLICY preset_orders_staff_all ON public.preset_orders
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());
```

---

## 3. Storage Bucket Policy Verification

Ensure private presets are not placed in public buckets:

```sql
-- Public presets: Anyone can read
CREATE POLICY "Public Presets Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'presets');

-- Secure Assets: Only verified purchasers can download
CREATE POLICY "Paid Presets Access" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'paid-presets'
    AND EXISTS (
      SELECT 1 FROM public.preset_orders
      WHERE buyer_id = auth.uid()
      AND payment_status = 'paid'
      AND storage_path = name
    )
  );
```
