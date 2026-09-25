-- LivingYuji portfolio database setup.
-- 1) Create a Supabase project.
-- 2) Create your admin user in Authentication > Users.
-- 3) Replace YOUR_ADMIN_USER_UUID below with that user's UUID.
-- 4) Run this entire file in the SQL Editor.

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "public can read site content" on public.site_content;
drop policy if exists "authenticated admins can insert site content" on public.site_content;
drop policy if exists "authenticated admins can update site content" on public.site_content;

drop policy if exists "admins can read admin users" on public.admin_users;

create policy "public can read site content"
on public.site_content for select using (true);

create policy "admins can insert site content"
on public.site_content for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "admins can update site content"
on public.site_content for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "admins can read admin users"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

insert into public.admin_users (user_id, role)
values ('YOUR_ADMIN_USER_UUID', 'owner')
on conflict (user_id) do nothing;

insert into public.site_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
