-- Musashi Supabase schema
-- Includes 3 core tables:
-- 1) user_accounts
-- 2) plugin_usage_records
-- 3) orders_subscriptions

create extension if not exists pgcrypto;

-- 1. User account information: ID, email, role, subscription status
create table if not exists public.user_accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  subscription_status text not null default 'free'
    check (subscription_status in ('free', 'trial', 'active', 'canceled', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Extension install/activate/usage records
create table if not exists public.plugin_usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_accounts(id) on delete cascade,
  extension_version text not null,
  device_id text not null,
  event_type text not null check (event_type in ('install', 'activate', 'usage')),
  is_active boolean not null default true,
  activity_at timestamptz not null default now(),
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- 3. Orders and subscription details
create table if not exists public.orders_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_accounts(id) on delete cascade,
  amount_usd numeric(10, 2) not null check (amount_usd >= 0),
  payment_method text not null
    check (payment_method in ('card', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'other')),
  subscription_status text not null default 'pending'
    check (subscription_status in ('pending', 'active', 'canceled', 'expired', 'refunded')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_plugin_usage_user_id on public.plugin_usage_records(user_id);
create index if not exists idx_plugin_usage_activity_at on public.plugin_usage_records(activity_at desc);
create index if not exists idx_orders_user_id on public.orders_subscriptions(user_id);
create index if not exists idx_orders_expires_at on public.orders_subscriptions(expires_at);

-- Optional: keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_accounts_updated_at on public.user_accounts;
create trigger trg_user_accounts_updated_at
before update on public.user_accounts
for each row
execute function public.set_updated_at();

drop trigger if exists trg_orders_subscriptions_updated_at on public.orders_subscriptions;
create trigger trg_orders_subscriptions_updated_at
before update on public.orders_subscriptions
for each row
execute function public.set_updated_at();
