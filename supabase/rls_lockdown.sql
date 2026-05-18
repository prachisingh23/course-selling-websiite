-- Supabase security hardening for project: lifelapss_user_data (tkvgrurwlgfutqmixzyx)
-- Apply this in the Supabase SQL Editor for the target project.
-- This file enables RLS on the public tables used by the app and adds the
-- minimum policies needed for the current frontend/admin flows.

begin;

create or replace function public.is_admin_email()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'vipulkumar.quant@gmail.com';
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin_email()
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    );
$$;

create or replace function public.get_profile_names(user_ids uuid[])
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name
  from public.profiles p
  where p.id = any(coalesce(user_ids, array[]::uuid[]));
$$;

grant execute on function public.is_admin_email() to anon, authenticated;
grant execute on function public.is_admin_user() to anon, authenticated;
grant execute on function public.get_profile_names(uuid[]) to anon, authenticated;

create or replace view public.public_donations as
select
  id,
  donor_name,
  amount,
  message,
  created_at
from public.donations
where is_anonymous = false;

grant select on public.public_donations to anon, authenticated;

revoke all on table public.profiles from anon;
grant select, insert, update, delete on table public.profiles to authenticated;

revoke all on table public.articles from anon;
grant select on table public.articles to anon;
grant select, insert, update, delete on table public.articles to authenticated;

revoke all on table public.images from anon;
grant select on table public.images to anon;
grant select, insert, update, delete on table public.images to authenticated;

revoke all on table public.videos from anon;
grant select on table public.videos to anon;
grant select, insert, update, delete on table public.videos to authenticated;

revoke all on table public.products from anon;
grant select, insert, update, delete on table public.products to authenticated;

do $$
begin
  if to_regclass('public.courses') is not null then
    execute 'revoke all on table public.courses from anon';
    execute 'grant select on table public.courses to anon, authenticated';
    execute 'grant select, insert, update, delete on table public.courses to authenticated';
  end if;
end
$$;

revoke all on table public.enrollments from anon;
grant select, insert on table public.enrollments to authenticated;

revoke all on table public.sales from anon;
grant select, insert, update on table public.sales to authenticated;

revoke all on table public.donations from anon;
revoke all on table public.donations from authenticated;
grant insert on table public.donations to anon;
grant select, insert on table public.donations to authenticated;

do $$
begin
  if to_regclass('public.media_library') is not null then
    execute 'revoke all on table public.media_library from anon';
    execute 'revoke all on table public.media_library from authenticated';
    execute 'grant select, insert, update, delete on table public.media_library to authenticated';
  end if;
end
$$;

revoke all on table public.promo_codes from anon;
grant select on table public.promo_codes to authenticated;

alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.images enable row level security;
alter table public.videos enable row level security;
alter table public.products enable row level security;
alter table if exists public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.sales enable row level security;
alter table public.donations enable row level security;
alter table if exists public.media_library enable row level security;
alter table public.promo_codes enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or public.is_admin_user()
);

drop policy if exists "profiles_insert_self_or_admin" on public.profiles;
create policy "profiles_insert_self_or_admin"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
  or public.is_admin_user()
);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
  or public.is_admin_user()
)
with check (
  auth.uid() = id
  or public.is_admin_user()
);

drop policy if exists "profiles_delete_self_or_admin" on public.profiles;
create policy "profiles_delete_self_or_admin"
on public.profiles
for delete
to authenticated
using (
  auth.uid() = id
  or public.is_admin_user()
);

drop policy if exists "articles_select_public_or_owner_or_admin" on public.articles;
create policy "articles_select_public_or_owner_or_admin"
on public.articles
for select
to anon, authenticated
using (
  status = 'published'
  or auth.uid() = user_id
  or public.is_admin_user()
);

drop policy if exists "articles_insert_owner_or_admin" on public.articles;
create policy "articles_insert_owner_or_admin"
on public.articles
for insert
to authenticated
with check (
  auth.uid() = user_id
  or public.is_admin_user()
);

drop policy if exists "articles_update_owner_or_admin" on public.articles;
create policy "articles_update_owner_or_admin"
on public.articles
for update
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin_user()
)
with check (
  auth.uid() = user_id
  or public.is_admin_user()
);

drop policy if exists "articles_delete_owner_or_admin" on public.articles;
create policy "articles_delete_owner_or_admin"
on public.articles
for delete
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin_user()
);

drop policy if exists "images_select_approved_or_admin" on public.images;
create policy "images_select_approved_or_admin"
on public.images
for select
to anon, authenticated
using (
  status = 'approved'
  or public.is_admin_user()
);

drop policy if exists "images_admin_insert" on public.images;
create policy "images_admin_insert"
on public.images
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "images_admin_update" on public.images;
create policy "images_admin_update"
on public.images
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "images_admin_delete" on public.images;
create policy "images_admin_delete"
on public.images
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "videos_select_approved_or_admin" on public.videos;
create policy "videos_select_approved_or_admin"
on public.videos
for select
to anon, authenticated
using (
  status = 'approved'
  or public.is_admin_user()
);

drop policy if exists "videos_admin_insert" on public.videos;
create policy "videos_admin_insert"
on public.videos
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "videos_admin_update" on public.videos;
create policy "videos_admin_update"
on public.videos
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "videos_admin_delete" on public.videos;
create policy "videos_admin_delete"
on public.videos
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "products_admin_select" on public.products;
create policy "products_admin_select"
on public.products
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
on public.products
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
on public.products
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
on public.products
for delete
to authenticated
using (public.is_admin_user());

do $$
begin
  if to_regclass('public.courses') is not null then
    execute 'drop policy if exists "courses_select_public" on public.courses';
    execute 'create policy "courses_select_public"
      on public.courses
      for select
      to anon, authenticated
      using (true)';

    execute 'drop policy if exists "courses_admin_insert" on public.courses';
    execute 'create policy "courses_admin_insert"
      on public.courses
      for insert
      to authenticated
      with check (public.is_admin_user())';

    execute 'drop policy if exists "courses_admin_update" on public.courses';
    execute 'create policy "courses_admin_update"
      on public.courses
      for update
      to authenticated
      using (public.is_admin_user())
      with check (public.is_admin_user())';

    execute 'drop policy if exists "courses_admin_delete" on public.courses';
    execute 'create policy "courses_admin_delete"
      on public.courses
      for delete
      to authenticated
      using (public.is_admin_user())';
  end if;
end
$$;

drop policy if exists "enrollments_select_owner_or_admin" on public.enrollments;
create policy "enrollments_select_owner_or_admin"
on public.enrollments
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin_user()
);

drop policy if exists "enrollments_insert_owner_or_admin" on public.enrollments;
create policy "enrollments_insert_owner_or_admin"
on public.enrollments
for insert
to authenticated
with check (
  auth.uid() = user_id
  or public.is_admin_user()
);

drop policy if exists "sales_select_related_or_admin" on public.sales;
create policy "sales_select_related_or_admin"
on public.sales
for select
to authenticated
using (
  auth.uid() = buyer_id
  or auth.uid() = creator_id
  or public.is_admin_user()
);

drop policy if exists "sales_insert_buyer_or_admin" on public.sales;
create policy "sales_insert_buyer_or_admin"
on public.sales
for insert
to authenticated
with check (
  auth.uid() = buyer_id
  or public.is_admin_user()
);

drop policy if exists "sales_admin_update" on public.sales;
create policy "sales_admin_update"
on public.sales
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "donations_select_owner_or_admin" on public.donations;
create policy "donations_select_owner_or_admin"
on public.donations
for select
to authenticated
using (
  donor_id = auth.uid()
  or public.is_admin_user()
);

drop policy if exists "donations_insert_public" on public.donations;
create policy "donations_insert_public"
on public.donations
for insert
to anon, authenticated
with check (
  (auth.uid() is null and donor_id is null)
  or (auth.uid() is not null and donor_id = auth.uid())
  or public.is_admin_user()
);

do $$
begin
  if to_regclass('public.media_library') is not null then
    execute 'drop policy if exists "media_library_admin_select" on public.media_library';
    execute 'create policy "media_library_admin_select"
      on public.media_library
      for select
      to authenticated
      using (public.is_admin_user())';

    execute 'drop policy if exists "media_library_admin_insert" on public.media_library';
    execute 'create policy "media_library_admin_insert"
      on public.media_library
      for insert
      to authenticated
      with check (public.is_admin_user())';

    execute 'drop policy if exists "media_library_admin_update" on public.media_library';
    execute 'create policy "media_library_admin_update"
      on public.media_library
      for update
      to authenticated
      using (public.is_admin_user())
      with check (public.is_admin_user())';

    execute 'drop policy if exists "media_library_admin_delete" on public.media_library';
    execute 'create policy "media_library_admin_delete"
      on public.media_library
      for delete
      to authenticated
      using (public.is_admin_user())';
  end if;
end
$$;

drop policy if exists "promo_codes_select_active_for_authenticated" on public.promo_codes;
create policy "promo_codes_select_active_for_authenticated"
on public.promo_codes
for select
to authenticated
using (
  is_active = true
  or public.is_admin_user()
);

commit;
