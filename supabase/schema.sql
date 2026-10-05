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

alter table public.posts drop constraint if exists posts_title_length;
alter table public.posts add constraint posts_title_length check (char_length(title) between 10 and 160) not valid;
alter table public.posts drop constraint if exists posts_lead_length;
alter table public.posts add constraint posts_lead_length check (char_length(lead) between 1 and 300) not valid;
alter table public.posts drop constraint if exists posts_body_length;
alter table public.posts add constraint posts_body_length check (char_length(body) between 1 and 60000) not valid;
alter table public.posts drop constraint if exists posts_cover_alt_length;
alter table public.posts add constraint posts_cover_alt_length check (char_length(cover_alt) between 1 and 200) not valid;
alter table public.posts drop constraint if exists posts_category_allowed;
alter table public.posts add constraint posts_category_allowed check (category in ('Aktualności', 'Podatki', 'Księgowość', 'Kadry i płace', 'Poradnik')) not valid;
alter table public.posts drop constraint if exists posts_slug_shape;
alter table public.posts add constraint posts_slug_shape check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 90) not valid;

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

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  business_form text,
  scope text,
  message text,
  source text not null default 'kontakt',
  created_at timestamptz not null default now(),
  constraint leads_name_length check (char_length(name) between 2 and 120),
  constraint leads_phone_length check (char_length(phone) between 6 and 40),
  constraint leads_email_shape check (char_length(email) between 5 and 160 and position('@' in email) > 1),
  constraint leads_business_form_length check (business_form is null or char_length(business_form) <= 120),
  constraint leads_scope_length check (scope is null or char_length(scope) <= 300),
  constraint leads_message_length check (message is null or char_length(message) <= 2000),
  constraint leads_source_allowed check (source in ('panel', 'kontakt'))
);

alter table public.leads enable row level security;

revoke all on table public.leads from anon, authenticated;
grant insert (name, phone, email, business_form, scope, message, source) on table public.leads to anon, authenticated;
grant select on table public.leads to authenticated;

drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert
  on public.leads for insert
  to anon, authenticated
  with check (true);

drop policy if exists leads_staff_read on public.leads;
create policy leads_staff_read
  on public.leads for select
  to authenticated
  using (true);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

create or replace function private.notify_new_lead()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook text;
begin
  select value into webhook from private.app_settings where key = 'teams_webhook_url';

  if webhook is null then
    return null;
  end if;

  perform net.http_post(
    url := webhook,
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'type', 'message',
      'attachments', jsonb_build_array(jsonb_build_object(
        'contentType', 'application/vnd.microsoft.card.adaptive',
        'contentUrl', null,
        'content', jsonb_build_object(
          '$schema', 'http://adaptivecards.io/schemas/adaptive-card.json',
          'type', 'AdaptiveCard',
          'version', '1.4',
          'body', jsonb_build_array(
            jsonb_build_object(
              'type', 'TextBlock',
              'size', 'Medium',
              'weight', 'Bolder',
              'text', 'Nowe zgłoszenie ze strony'
            ),
            jsonb_build_object(
              'type', 'TextBlock',
              'isSubtle', true,
              'spacing', 'None',
              'text', to_char(new.created_at at time zone 'Europe/Warsaw', 'DD.MM.YYYY, HH24:MI')
                || ' | formularz: ' || new.source
            ),
            jsonb_build_object(
              'type', 'FactSet',
              'facts', jsonb_build_array(
                jsonb_build_object('title', 'Imię i nazwisko', 'value', new.name),
                jsonb_build_object('title', 'Telefon', 'value', new.phone),
                jsonb_build_object('title', 'E-mail', 'value', new.email),
                jsonb_build_object('title', 'Forma działalności', 'value', coalesce(nullif(new.business_form, ''), '—')),
                jsonb_build_object('title', 'Czego potrzebuje', 'value', coalesce(nullif(new.scope, ''), '—'))
              )
            ),
            jsonb_build_object(
              'type', 'TextBlock',
              'wrap', true,
              'text', coalesce(nullif(new.message, ''), '_bez wiadomości_')
            )
          )
        )
      ))
    )
  );

  return null;
end;
$$;

revoke all on function private.notify_new_lead() from public, anon, authenticated;

drop trigger if exists leads_notify_teams on public.leads;
create trigger leads_notify_teams
  after insert on public.leads
  for each row execute function private.notify_new_lead();

revoke all on all functions in schema net from anon, authenticated, public;

revoke usage on schema net from anon, authenticated;
