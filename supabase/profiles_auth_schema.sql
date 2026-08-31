-- ==============================================================================
-- ATHAR (أثر) - Pure Phone & Password Profiles Schema Migration
-- ==============================================================================
-- This script configures the `profiles` table WITHOUT any foreign key reference
-- to `auth.users`, enabling pure Phone Number + Password authentication.
--
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 2. Drop old triggers that depended on auth.users if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop trigger if exists trg_profiles_phone_constraints on public.profiles;
drop function if exists public.ensure_profiles_phone_constraints();

-- 3. Drop existing foreign key constraint referencing auth.users if present
do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where constraint_type = 'FOREIGN KEY'
      and table_schema = 'public'
      and table_name = 'profiles'
      and constraint_name = 'profiles_id_fkey'
  ) then
    alter table public.profiles drop constraint profiles_id_fkey;
  end if;
end $$;

-- 4. Create or update the public.profiles table (No foreign key on id)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  password text not null,
  full_name text not null,
  governorate text,
  address text
);

-- Ensure all expected columns exist
alter table public.profiles
  add column if not exists id uuid primary key default gen_random_uuid(),
  add column if not exists phone text,
  add column if not exists password text,
  add column if not exists full_name text,
  add column if not exists governorate text,
  add column if not exists address text;

-- Set default id generator if not already set
alter table public.profiles
  alter column id set default gen_random_uuid();

-- 5. Enforce unique index on normalized phone numbers
-- Only the profiles table should enforce phone uniqueness for account registration.
-- Guest orders remain separate and are not blocked by profile uniqueness checks.
drop index if exists idx_profiles_phone_unique;
drop index if exists profiles_phone_unique_idx;

create unique index if not exists idx_profiles_phone_unique
  on public.profiles (lower(regexp_replace(phone, '[^0-9]', '', 'g')));

create index if not exists idx_profiles_phone_lookup
  on public.profiles (phone);

create or replace function public.normalize_phone_value(raw_phone text)
returns text
language sql
stable
as $$
  select regexp_replace(coalesce(raw_phone, ''), '[^0-9]', '', 'g');
$$;

create or replace function public.ensure_profiles_phone_constraints()
returns trigger
language plpgsql
as $$
begin
  new.phone = public.normalize_phone_value(new.phone);

  if new.phone is null or trim(new.phone) = '' then
    raise exception 'Phone number is required';
  end if;

  if exists (
    select 1
    from public.profiles p
    where lower(regexp_replace(p.phone, '[^0-9]', '', 'g')) = lower(new.phone)
      and p.id <> new.id
  ) then
    raise exception 'رقم الهاتف مسجل بالفعل. يرجى تسجيل الدخول أو استخدام رقم آخر.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_phone_constraints on public.profiles;
create trigger trg_profiles_phone_constraints
before insert or update on public.profiles
for each row
execute function public.ensure_profiles_phone_constraints();

-- 6. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Drop existing policies to prevent conflicts
drop policy if exists "Allow public select on profiles" on public.profiles;
drop policy if exists "Allow public insert on profiles" on public.profiles;
drop policy if exists "Allow public update on profiles" on public.profiles;
drop policy if exists "Allow public delete on profiles" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;

-- Policy 1: Allow reading profile (for login validation and user profile loading)
create policy "Allow public select on profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- Policy 2: Allow user registration (inserting new profile)
create policy "Allow public insert on profiles"
  on public.profiles for insert
  to anon, authenticated
  with check (true);

-- Policy 3: Allow users to update their profile
create policy "Allow public update on profiles"
  on public.profiles for update
  to anon, authenticated
  using (true)
  with check (true);

-- ==============================================================================
-- Done! The `profiles` table is now completely independent of auth.users.
-- ==============================================================================
