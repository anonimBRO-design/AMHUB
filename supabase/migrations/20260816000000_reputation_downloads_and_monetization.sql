-- AMHUB: Anti-Abuse, Reputation Scoring, Unique Download Tracking, and Monetization Architecture
-- Scope:
--   1. preset_downloads table for multi-layer unique download tracking (user, anon token, ip_hash)
--   2. presets table enhancements (unique_download_count, price, is_paid, currency)
--   3. preset_orders table for 90:10 monetization workflow and purchase state management
--   4. Performance indexes, trigger updates, and strict RLS policies

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Presets table extensions
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.presets
	add column if not exists unique_download_count integer not null default 0 check (unique_download_count >= 0),
	add column if not exists price numeric(12, 2) not null default 0.00 check (price >= 0),
	add column if not exists is_paid boolean not null default false,
	add column if not exists currency text not null default 'IDR';

create index if not exists presets_is_paid_idx on public.presets (is_paid) where is_paid = true;
create index if not exists presets_unique_downloads_idx on public.presets (unique_download_count desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. preset_downloads Table
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.preset_downloads (
	id uuid primary key default gen_random_uuid(),
	preset_id uuid not null references public.presets(id) on delete cascade,
	user_id uuid references public.users(id) on delete set null,
	anonymous_token text,
	ip_hash text not null,
	user_agent_hash text,
	created_at timestamptz not null default now()
);

-- Fast lookup indexes for deduplication sliding windows & analytics
create index if not exists preset_downloads_preset_created_idx
	on public.preset_downloads (preset_id, created_at desc);

create index if not exists preset_downloads_user_preset_idx
	on public.preset_downloads (preset_id, user_id)
	where user_id is not null;

create index if not exists preset_downloads_anon_preset_idx
	on public.preset_downloads (preset_id, anonymous_token)
	where anonymous_token is not null;

create index if not exists preset_downloads_ip_preset_idx
	on public.preset_downloads (preset_id, ip_hash, created_at desc);

create index if not exists preset_downloads_user_history_idx
	on public.preset_downloads (user_id, created_at desc)
	where user_id is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. preset_orders Table (Monetization & Purchases)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.preset_orders (
	id uuid primary key default gen_random_uuid(),
	order_number text not null unique,
	preset_id uuid not null references public.presets(id) on delete restrict,
	buyer_id uuid not null references public.users(id) on delete restrict,
	seller_id uuid not null references public.users(id) on delete restrict,
	gross_amount numeric(12, 2) not null check (gross_amount >= 0),
	currency text not null default 'IDR',
	payment_provider text not null default 'manual',
	payment_reference text,
	payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
	processor_fee numeric(12, 2) not null default 0.00 check (processor_fee >= 0),
	net_amount numeric(12, 2) not null default 0.00 check (net_amount >= 0),
	creator_payout_amount numeric(12, 2) not null default 0.00 check (creator_payout_amount >= 0),
	platform_fee_amount numeric(12, 2) not null default 0.00 check (platform_fee_amount >= 0),
	paid_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists preset_orders_buyer_idx on public.preset_orders (buyer_id, created_at desc);
create index if not exists preset_orders_seller_idx on public.preset_orders (seller_id, created_at desc);
create index if not exists preset_orders_preset_status_idx on public.preset_orders (preset_id, payment_status);
create index if not exists preset_orders_status_created_idx on public.preset_orders (payment_status, created_at desc);

create trigger preset_orders_set_updated_at
	before update on public.preset_orders
	for each row
	execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Row Level Security (RLS) & Permissions
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.preset_downloads enable row level security;
alter table public.preset_orders enable row level security;

-- preset_downloads RLS
drop policy if exists preset_downloads_select on public.preset_downloads;
create policy preset_downloads_select
	on public.preset_downloads for select
	using (
		auth.uid() = user_id
		or public.is_staff()
		or exists (
			select 1
			from public.presets
			where presets.id = preset_downloads.preset_id
				and presets.creator_id = auth.uid()
		)
	);

drop policy if exists preset_downloads_insert on public.preset_downloads;
create policy preset_downloads_insert
	on public.preset_downloads for insert
	with check (true);

-- preset_orders RLS
drop policy if exists preset_orders_select on public.preset_orders;
create policy preset_orders_select
	on public.preset_orders for select
	using (
		buyer_id = auth.uid()
		or seller_id = auth.uid()
		or public.is_staff()
	);

drop policy if exists preset_orders_insert on public.preset_orders;
create policy preset_orders_insert
	on public.preset_orders for insert
	with check (
		buyer_id = auth.uid()
		or public.is_staff()
	);

drop policy if exists preset_orders_update on public.preset_orders;
create policy preset_orders_update
	on public.preset_orders for update
	using (public.is_staff())
	with check (public.is_staff());

-- Grant table permissions to authenticated, anon, and service_role
grant select, insert on public.preset_downloads to authenticated, anon;
grant all on public.preset_downloads to service_role;

grant select, insert on public.preset_orders to authenticated;
grant all on public.preset_orders to service_role;
