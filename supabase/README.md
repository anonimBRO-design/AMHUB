# PresetHub Supabase Database

This directory contains the database foundation for PresetHub.

## Contents

- `migrations/20260728000000_database_foundation.sql` creates the core schema, constraints, indexes, timestamp triggers, RLS policies, and storage buckets/policies.
- `seed.sql` seeds stable taxonomy rows for categories and starter tags.

## Apply Locally

Run migrations with the Supabase CLI from the repository root:

```sh
supabase db reset
```

Apply only new migrations against an existing local database:

```sh
supabase migration up
```

## Generate Types

After applying migrations, regenerate database types:

```sh
supabase gen types typescript --local > packages/types/src/database.ts
```

The checked-in `packages/types/src/database.ts` is kept aligned with this migration for the tables used by the app.

## Storage Path Convention

Storage policies expect authenticated uploads to be scoped by user id as the first path segment:

```txt
avatars/{user_id}/avatar.webp
thumbnails/{user_id}/{preset_id}.webp
preset-files/{user_id}/{preset_id}.xml
```

`avatars` and `thumbnails` are public-read buckets. `preset-files` is private; file delivery should go through a future API route that records/downloads and returns a signed URL.
