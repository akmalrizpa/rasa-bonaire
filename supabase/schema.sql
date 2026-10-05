-- Rasa Bonaire — database schema for Supabase (free plan is enough).
--
-- How to use: Supabase dashboard -> SQL Editor -> New query -> paste this whole
-- file -> Run. It is safe to run more than once.
--
-- The app writes through the server with SUPABASE_SERVICE_ROLE_KEY (never in the
-- browser). Row level security is still switched on so the public anon key can
-- only read the menu, never orders, accounts or settings.

create table if not exists categories (
  id text primary key,
  name text not null,
  blurb text default '',
  sort integer default 0
);

create table if not exists products (
  id text primary key,
  slug text not null unique,
  category_id text not null,
  name text not null,
  description text default '',
  price_cents integer not null,
  unit text default '',
  art text default 'plate',
  badge text,
  prep_minutes integer default 10,
  rating numeric(2,1) default 4.5,
  sold integer default 0,
  sold_out boolean default false,
  is_active boolean default true,
  option_groups jsonb default '[]'::jsonb
);

create table if not exists users (
  id text primary key,
  username text not null unique,
  name text not null,
  email text default '',
  phone text default '',
  role text not null default 'customer' check (role in ('admin', 'customer')),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  ref text not null unique,
  user_id text references users (id) on delete set null,
  customer_name text not null,
  customer_phone text default '',
  customer_email text default '',
  fulfilment text not null default 'pickup' check (fulfilment in ('pickup', 'delivery')),
  address text default '',
  zone text default '',
  note text default '',
  slot text default '',
  service_date text default '',
  items jsonb not null default '[]'::jsonb,
  subtotal_cents integer not null default 0,
  delivery_cents integer not null default 0,
  discount_cents integer not null default 0,
  total_cents integer not null default 0,
  promo_code text,
  payment_method text not null default 'qris',
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  paid_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cooking', 'ready', 'completed', 'cancelled')),
  invoice_no text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  events jsonb not null default '[]'::jsonb
);

create table if not exists settings (
  key text primary key,
  value jsonb not null
);

create index if not exists orders_user_idx on orders (user_id);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists products_category_idx on products (category_id);

alter table categories enable row level security;
alter table products enable row level security;
alter table users enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;

-- The menu is public information. Orders, accounts and settings stay closed:
-- only the server (service role key) can read or write those tables.
drop policy if exists "menu is readable by everyone" on categories;
create policy "menu is readable by everyone" on categories for select using (true);

drop policy if exists "products are readable by everyone" on products;
create policy "products are readable by everyone" on products for select using (true);

-- The menu, demo accounts and default settings are seeded by the app itself on
-- the first request, using the same content as src/data/catalog.ts.
