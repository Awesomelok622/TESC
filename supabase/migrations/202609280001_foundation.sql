-- Reproducible Supabase schema. UTC publication; no cron required.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in ('super_admin','editor')),
 display_name text not null default '', created_at timestamptz not null default now()
);
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from profiles where id=auth.uid())$$;
create function public.is_super_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from profiles where id=auth.uid() and role='super_admin')$$;
create table public.content_entries (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('page','person','ministry','video','course','course_category','project','project_section','project_document','prayer','resource_category','contact','donation','settings')),
 slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title jsonb not null default '{}', description jsonb not null default '{}', body jsonb not null default '{}', data jsonb not null default '{}',
 status text not null default 'draft' check(status in ('draft','published','archived')),
 published_at timestamptz, display_order integer not null default 0 check(display_order>=0), featured boolean not null default false,
 is_demo boolean not null default false, deleted_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 created_by uuid references auth.users(id) on delete set null, updated_by uuid references auth.users(id) on delete set null,
 unique(kind,slug), check(jsonb_typeof(title)='object' and jsonb_typeof(description)='object' and jsonb_typeof(body)='object' and jsonb_typeof(data)='object')
);
create index content_public_idx on public.content_entries(kind,status,published_at,display_order) where deleted_at is null;
create table public.media_items (
 id uuid primary key default gen_random_uuid(), original_name text not null, bucket text not null default 'admin-media' check(bucket in ('admin-media','public-assets','public-resources')),
 path text not null unique, mime_type text not null check(mime_type in ('application/pdf','image/jpeg','image/png','image/webp','video/mp4')),
 file_size bigint not null check(file_size>0), category text not null default '', published boolean not null default false,
 scan_status text not null default 'pending' check(scan_status in ('pending','clean','infected','error')),
 created_at timestamptz not null default now(), created_by uuid references auth.users(id) on delete set null
);
create table public.community_resources (
 id uuid primary key default gen_random_uuid(), title jsonb not null, description jsonb not null, category text not null default '',
 media_id uuid not null references public.media_items(id), file_size bigint not null, mime_type text not null default 'application/pdf',
 contributor_name text not null default '', contributor_email text not null default '',
 status text not null default 'pending' check(status in ('pending','approved','rejected','hidden')), published boolean not null default false,
 scan_status text not null default 'pending' check(scan_status in ('pending','clean','infected','error')),
 approved_at timestamptz, approved_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 check(status!='approved' or scan_status='clean')
);
create index resources_public_idx on public.community_resources(status,published,created_at) where deleted_at is null;
-- Only a safe projection is exposed. Never grant anonymous access to private contributor data.
create view public.public_resources with (security_barrier=true) as select id,title,description,category,media_id,file_size,mime_type,status,published,scan_status,created_at from public.community_resources where status='approved' and published and scan_status='clean' and deleted_at is null;
create table public.contact_submissions (
 id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text not null default '', subject text not null, message text not null,
 consent boolean not null check(consent), delivery_status text not null default 'pending' check(delivery_status in ('pending','sent','failed','unconfigured')), resolved boolean not null default false, created_at timestamptz not null default now()
);
create table public.audit_events (
 id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id) on delete set null, entity text not null, entity_id uuid, action text not null, created_at timestamptz not null default now()
);
create table public.rate_limits (key text primary key, hits integer not null default 0, bytes bigint not null default 0, expires_at timestamptz not null);
create function public.consume_limit(p_key text,p_limit integer,p_window integer,p_bytes bigint default 0,p_quota bigint default 52428800) returns boolean language plpgsql security definer set search_path=public as $$
declare row_count integer;
begin
 insert into rate_limits(key,hits,bytes,expires_at) values(p_key,1,p_bytes,now()+make_interval(secs=>p_window))
 on conflict(key) do update set hits=case when rate_limits.expires_at<=now() then 1 else rate_limits.hits+1 end,bytes=case when rate_limits.expires_at<=now() then p_bytes else rate_limits.bytes+p_bytes end,expires_at=case when rate_limits.expires_at<=now() then now()+make_interval(secs=>p_window) else rate_limits.expires_at end
 where rate_limits.expires_at<=now() or (rate_limits.hits<p_limit and rate_limits.bytes+p_bytes<=p_quota);
 get diagnostics row_count=ROW_COUNT; return row_count=1 and p_bytes<=p_quota;
end $$;
revoke all on function public.consume_limit(text,integer,integer,bigint,bigint) from public,anon,authenticated;
grant execute on function public.consume_limit(text,integer,integer,bigint,bigint) to service_role;
create function public.track_change() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if TG_OP='UPDATE' then new.updated_at=now(); end if;
 insert into audit_events(actor_id,entity,entity_id,action) values(auth.uid(),TG_TABLE_NAME,coalesce(new.id,old.id),TG_OP);
 if TG_OP='DELETE' then return old; end if; return new;
end $$;
create trigger audit_content before insert or update or delete on public.content_entries for each row execute function public.track_change();
create trigger audit_resources before insert or update or delete on public.community_resources for each row execute function public.track_change();
create function public.guard_resource() returns trigger language plpgsql as $$begin
 if new.status='approved' and not exists(select 1 from public.media_items where id=new.media_id and scan_status='clean') then raise exception 'Clean scan required';end if;
 if new.status='approved' and (TG_OP='INSERT' or old.status!='approved') then new.approved_at=now();new.approved_by=auth.uid();end if;
 return new;end $$;
create trigger guard_resource before insert or update on public.community_resources for each row execute function public.guard_resource();
alter table public.profiles enable row level security;
alter table public.content_entries enable row level security;
alter table public.media_items enable row level security;
alter table public.community_resources enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.audit_events enable row level security;
alter table public.rate_limits enable row level security;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() or public.is_super_admin());
create policy profile_manage on public.profiles for all to authenticated using(public.is_super_admin()) with check(public.is_super_admin());
create policy content_read on public.content_entries for select to anon,authenticated using((deleted_at is null and status='published' and published_at<=now()) or public.is_admin());
create policy content_insert on public.content_entries for insert to authenticated with check(public.is_admin() and (kind!='settings' or public.is_super_admin()));
create policy content_update on public.content_entries for update to authenticated using(public.is_admin() and (kind!='settings' or public.is_super_admin())) with check(public.is_admin() and (kind!='settings' or public.is_super_admin()));
create policy content_delete on public.content_entries for delete to authenticated using(public.is_admin() and (kind!='settings' or public.is_super_admin()));
create policy media_read on public.media_items for select to authenticated using(public.is_admin());
-- Media writes use server service credentials after authorization and validation; editors cannot forge scan results.
create policy resource_read on public.community_resources for select to authenticated using(public.is_admin());
create policy resource_moderate on public.community_resources for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy contact_read on public.contact_submissions for select to authenticated using(public.is_admin());
create policy contact_update on public.contact_submissions for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy audit_read on public.audit_events for select to authenticated using(public.is_super_admin());
grant select on public.public_resources to anon,authenticated;
grant select on public.content_entries to anon;
grant select,insert,update,delete on public.content_entries,public.profiles to authenticated;
grant select on public.media_items,public.audit_events to authenticated;
grant select,update on public.community_resources,public.contact_submissions to authenticated;
revoke all on public.community_resources,public.contact_submissions,public.media_items,public.profiles,public.audit_events,public.rate_limits from anon;
revoke all on public.rate_limits from authenticated;
grant all on all tables in schema public to service_role;
-- Buckets are private, including approved resources. Every file request checks current visibility.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('public-assets','public-assets',false,20971520,array['image/jpeg','image/png','image/webp']),
 ('public-resources','public-resources',false,20971520,array['application/pdf']),
 ('admin-media','admin-media',false,262144000,array['application/pdf','image/jpeg','image/png','image/webp','video/mp4']) on conflict(id) do nothing;
-- No anonymous/authenticated object writes or reads: server issues short-lived URLs after checks.
-- Restrictive policy also blocks any pre-existing broad permissive policy for our buckets.
create policy tesc_private_objects on storage.objects as restrictive for all to anon,authenticated
 using(bucket_id not in ('public-assets','public-resources','admin-media'))
 with check(bucket_id not in ('public-assets','public-resources','admin-media'));
