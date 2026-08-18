-- Migration: Creator Permission and Outreach Pipeline (Phase 1)
-- Scope: Structured tracking of external/TikTok creator permission requests, licensing terms, and approval records.

create table if not exists public.creator_permissions (
	id uuid primary key default gen_random_uuid(),
	platform text not null default 'tiktok' check (platform in ('tiktok', 'instagram', 'youtube', 'other')),
	creator_username text not null,
	creator_display_name text,
	profile_url text not null,
	avatar_url text,
	status text not null default 'pending' check (status in ('pending', 'contacted', 'approved', 'rejected')),
	drafted_message text,
	contacted_at timestamptz,
	responded_at timestamptz,
	credit_display_name text,
	max_allowed_presets integer default 1 check (max_allowed_presets >= 0),
	used_presets_count integer not null default 0 check (used_presets_count >= 0),
	notes_conditions text,
	proof_image_url text,
	created_by uuid references public.users(id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

-- Unique constraint to prevent duplicate outreach entries for the same creator on a platform
create unique index if not exists creator_permissions_platform_username_idx 
	on public.creator_permissions (platform, lower(creator_username));

-- Performance indexes for querying and status filtering
create index if not exists creator_permissions_status_idx on public.creator_permissions (status);
create index if not exists creator_permissions_created_at_idx on public.creator_permissions (created_at desc);

-- Trigger for auto-updating updated_at timestamp
create trigger creator_permissions_set_updated_at
	before update on public.creator_permissions
	for each row
	execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.creator_permissions enable row level security;

-- RLS Policies: Staff / Admins can perform all operations
create policy "Staff members can manage creator permissions"
	on public.creator_permissions
	for all
	to authenticated
	using (
		public.is_staff(auth.uid()) 
		or exists (
			select 1 from public.users 
			where id = auth.uid() and (is_staff = true or lower(username) = 'afgan')
		)
	)
	with check (
		public.is_staff(auth.uid()) 
		or exists (
			select 1 from public.users 
			where id = auth.uid() and (is_staff = true or lower(username) = 'afgan')
		)
	);

-- Grant full access to service_role and authenticated users
grant all on public.creator_permissions to service_role;
grant select, insert, update, delete on public.creator_permissions to authenticated;
