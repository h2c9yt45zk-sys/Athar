-- =========================================================
-- ATHAR: auth-linked profiles table with enforced unique phone
-- =========================================================

-- 1) Profiles table linked to Supabase Auth
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null,
  governorate text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Enforce unique normalized phone values
create unique index if not exists profiles_phone_unique_idx
  on public.profiles (lower(phone));

alter table public.profiles
  alter column phone set not null;

-- 3) Normalization helper
create or replace function public.normalize_phone(raw_phone text)
returns text
language plpgsql
as $$
begin
  if raw_phone is null then
    return null;
  end if;

  return regexp_replace(raw_phone, '[^0-9+]', '', 'g');
end;
$$;

-- 4) Validate and enforce uniqueness on every insert/update
create or replace function public.ensure_profiles_phone_constraints()
returns trigger
language plpgsql
as $$
begin
  new.phone = public.normalize_phone(new.phone);

  if new.phone is null or trim(new.phone) = '' then
    raise exception 'Phone number is required';
  end if;

  if new.phone !~ '^\+?[0-9]{8,15}$' then
    raise exception 'Phone number must contain only English digits and optional leading +';
  end if;

  if exists (
    select 1
    from public.profiles p
    where lower(p.phone) = lower(new.phone)
      and p.id <> new.id
  ) then
    raise exception 'تم إنشاء حساب بهذا الرقم من قبل';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_phone_constraints on public.profiles;
create trigger trg_profiles_phone_constraints
before insert or update on public.profiles
for each row
execute function public.ensure_profiles_phone_constraints();

-- 5) Auto-create a profile row whenever a user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  phone_value text;
begin
  phone_value := coalesce(new.phone, new.raw_user_meta_data->>'phone', '');
  phone_value := public.normalize_phone(phone_value);

  if phone_value is null or trim(phone_value) = '' then
    raise exception 'Phone number is required for profile creation';
  end if;

  insert into public.profiles (id, full_name, phone, governorate, address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    phone_value,
    new.raw_user_meta_data->>'governorate',
    new.raw_user_meta_data->>'address'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    governorate = excluded.governorate,
    address = excluded.address,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- 6) Enable RLS and basic access policies for the authenticated user
alter table public.profiles enable row level security;

create policy if not exists "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy if not exists "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy if not exists "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Use this SQL in Supabase SQL Editor or via the Supabase CLI.
-- If the project already has a profiles/users table, do not create a second copy; instead add the unique index and trigger to the existing table.
