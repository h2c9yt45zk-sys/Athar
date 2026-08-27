-- =========================================================
-- ATHAR: delivered orders cleanup and archive retention
-- =========================================================
-- Purpose:
--   1) ensure every delivered order has a valid delivered_at timestamp
--   2) permanently delete orders older than 7 full days after delivery
--   3) keep the admin and tracking queries aligned with backend state

-- Create the orders table if it does not exist.
-- Adjust types to match the app if your schema already exists.
create table if not exists public.orders (
  id text primary key,
  order_code text not null unique,
  customer_name text not null,
  phone text,
  address text,
  notes text,
  total numeric(12,2) not null default 0,
  status text not null default 'جاري التأكيد',
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  items jsonb not null default '[]'::jsonb,
  payment_method text,
  electronic_method text,
  screenshot_url text,
  payment_status text default 'جاري الفحص',
  updated_at timestamptz not null default now()
);

-- Make sure delivered_at is present for existing rows.
alter table public.orders
  add column if not exists delivered_at timestamptz,
  add column if not exists updated_at timestamptz default now();

-- Keep updated_at fresh on edits.
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

-- Optional: if status is changed to delivered, ensure a valid timestamp is stored.
create or replace function public.set_delivered_timestamp()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'تم التوصيل' and (new.delivered_at is null or new.delivered_at > now()) then
    new.delivered_at = now();
  end if;

  if new.status <> 'تم التوصيل' then
    new.delivered_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_orders_delivery_timestamp on public.orders;
create trigger trg_orders_delivery_timestamp
before insert or update on public.orders
for each row
execute function public.set_delivered_timestamp();

-- Function to permanently remove delivered orders after 7 full days.
create or replace function public.prune_expired_delivered_orders()
returns integer
language plpgsql
as $$
declare
  deleted_count integer;
begin
  delete from public.orders
  where status = 'تم التوصيل'
    and delivered_at is not null
    and delivered_at < now() - interval '7 days';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Recommended: run cleanup every hour.
create extension if not exists pg_cron;

select cron.schedule(
  'purge_expired_delivered_orders',
  '0 * * * *',
  $$ select public.prune_expired_delivered_orders(); $$
);

-- Safe admin query: show only active orders + recent delivered archive only.
-- select *
-- from public.orders
-- where status <> 'تم التوصيل'
--    or (status = 'تم التوصيل' and delivered_at is not null and delivered_at >= now() - interval '7 days')
-- order by created_at desc;

-- Public tracking query: hide delivered orders immediately.
-- select *
-- from public.orders
-- where status <> 'تم التوصيل'
--   and order_code = 'ATHAR-1234';

-- Optional: if you want the archive visible only for the first 7 full days,
-- use this stricter rule as well:
-- delivered_at >= now() - interval '7 days'
-- and delivered_at < now() - interval '6 days'  -- if you want a strict window
