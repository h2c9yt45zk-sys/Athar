-- ==============================================================================
-- ATHAR (أثر) - Guest Checkout & Order Tracking Schema Migration
-- ==============================================================================
-- This script creates the self-contained guest orders and order_items tables
-- with foreign key cascades, performance indexes, and anonymous access RLS policies.
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Enable pgcrypto / uuid generation extension
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 2. Create or recreate public.orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  governorate text,
  address text not null,
  notes text,
  total_amount numeric(12, 2) not null default 0,
  status text not null default 'جاري التأكيد',
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure all expected columns exist if the table was already partially created
alter table public.orders
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists governorate text,
  add column if not exists address text,
  add column if not exists notes text,
  add column if not exists total_amount numeric(12, 2) default 0,
  add column if not exists status text default 'جاري التأكيد',
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- 3. Create or recreate public.order_items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  size text default 'M',
  quantity integer not null default 1,
  price numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- Ensure all expected columns exist on order_items
alter table public.order_items
  add column if not exists order_id uuid references public.orders(id) on delete cascade,
  add column if not exists product_id text,
  add column if not exists product_name text,
  add column if not exists size text default 'M',
  add column if not exists quantity integer default 1,
  add column if not exists price numeric(12, 2) default 0,
  add column if not exists created_at timestamptz default now();

-- 4. Create performance indexes for guest lookups and dashboard sorting
create index if not exists idx_orders_phone on public.orders(phone);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- 5. Auto-update updated_at timestamp trigger
create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_orders_updated_at();

-- 6. Enable Row Level Security (RLS)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Drop existing policies if they conflict
drop policy if exists "Allow guest insert on orders" on public.orders;
drop policy if exists "Allow guest insert on order_items" on public.order_items;
drop policy if exists "Allow public select on orders" on public.orders;
drop policy if exists "Allow public select on order_items" on public.order_items;
drop policy if exists "Allow status update on orders" on public.orders;

-- Policy 1: Anyone (anonymous guest & authenticated) can place orders
create policy "Allow guest insert on orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- Policy 2: Anyone can insert ordered items
create policy "Allow guest insert on order_items"
  on public.order_items for insert
  to anon, authenticated
  with check (true);

-- Policy 3: Anyone can lookup orders by phone number
create policy "Allow public select on orders"
  on public.orders for select
  to anon, authenticated
  using (true);

-- Policy 4: Anyone can read line items for tracked orders
create policy "Allow public select on order_items"
  on public.order_items for select
  to anon, authenticated
  using (true);

-- Policy 5: Allow status and record updates
create policy "Allow status update on orders"
  on public.orders for update
  to anon, authenticated
  using (true)
  with check (true);
