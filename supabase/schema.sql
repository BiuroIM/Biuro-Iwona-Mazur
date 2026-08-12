create extension if not exists pg_net;

create schema if not exists private;

revoke all on schema private from anon, authenticated;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  lead text not null,
  body text not null,
  category text not null default 'Aktualności',
  cover_url text not null,
  cover_alt text not null,
  published boolean not null default true,
  author_email text,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists posts_public_read on public.posts;
create policy posts_public_read
  on public.posts for select
  to anon
  using (published = true);

drop policy if exists posts_staff_read on public.posts;
create policy posts_staff_read
  on public.posts for select
  to authenticated
  using (true);

drop policy if exists posts_staff_insert on public.posts;
create policy posts_staff_insert
  on public.posts for insert
  to authenticated
  with check (true);

drop policy if exists posts_staff_update on public.posts;
create policy posts_staff_update
  on public.posts for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists posts_staff_delete on public.posts;
create policy posts_staff_delete
  on public.posts for delete
  to authenticated
  using (true);

create table if not exists private.app_settings (
  key text primary key,
  value text not null
);

alter table private.app_settings enable row level security;

revoke all on table private.app_settings from anon, authenticated;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.request_site_rebuild()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  repo text;
  token text;
begin
  select value into repo from private.app_settings where key = 'github_repo';
  select value into token from private.app_settings where key = 'github_token';

  if repo is null or token is null then
    return null;
  end if;

  perform net.http_post(
    url := 'https://api.github.com/repos/' || repo || '/dispatches',
    body := jsonb_build_object('event_type', 'blog-updated'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Accept', 'application/vnd.github+json',
      'User-Agent', 'biuro-mazur-blog-panel',
      'Authorization', 'Bearer ' || token
    )
  );

  return null;
end;
$$;

revoke all on function private.touch_updated_at() from public, anon, authenticated;
revoke all on function private.request_site_rebuild() from public, anon, authenticated;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function private.touch_updated_at();

drop trigger if exists posts_request_rebuild on public.posts;
create trigger posts_request_rebuild
  after insert or update or delete on public.posts
  for each statement execute function private.request_site_rebuild();

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists covers_public_read on storage.objects;
create policy covers_public_read
  on storage.objects for select
  using (bucket_id = 'covers');

drop policy if exists covers_staff_insert on storage.objects;
create policy covers_staff_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'covers');

drop policy if exists covers_staff_update on storage.objects;
create policy covers_staff_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'covers')
  with check (bucket_id = 'covers');

drop policy if exists covers_staff_delete on storage.objects;
create policy covers_staff_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'covers');

revoke all on all functions in schema net from anon, authenticated, public;

revoke usage on schema net from anon, authenticated;
