-- Targeted RLS patch for the remaining public tables still exposed in
-- project tkvgrurwlgfutqmixzyx as of 2026-04-03:
--   - public.courses
--   - public.media_library
--   - public.promo_codes

begin;

revoke all on table public.courses from anon;
grant select on table public.courses to anon, authenticated;
grant select, insert, update, delete on table public.courses to authenticated;

revoke all on table public.media_library from anon;
revoke all on table public.media_library from authenticated;
grant select, insert, update, delete on table public.media_library to authenticated;

revoke all on table public.promo_codes from anon;
grant select on table public.promo_codes to authenticated;

alter table public.courses enable row level security;
alter table public.media_library enable row level security;
alter table public.promo_codes enable row level security;

drop policy if exists "courses_select_public" on public.courses;
create policy "courses_select_public"
on public.courses
for select
to anon, authenticated
using (true);

drop policy if exists "courses_admin_insert" on public.courses;
create policy "courses_admin_insert"
on public.courses
for insert
to authenticated
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'vipulkumar.quant@gmail.com'
);

drop policy if exists "courses_admin_update" on public.courses;
create policy "courses_admin_update"
on public.courses
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'vipulkumar.quant@gmail.com'
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'vipulkumar.quant@gmail.com'
);

drop policy if exists "courses_admin_delete" on public.courses;
create policy "courses_admin_delete"
on public.courses
for delete
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'vipulkumar.quant@gmail.com'
);

drop policy if exists "media_library_admin_select" on public.media_library;
create policy "media_library_admin_select"
on public.media_library
for select
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'vipulkumar.quant@gmail.com'
);

drop policy if exists "media_library_admin_insert" on public.media_library;
create policy "media_library_admin_insert"
on public.media_library
for insert
to authenticated
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'vipulkumar.quant@gmail.com'
);

drop policy if exists "media_library_admin_update" on public.media_library;
create policy "media_library_admin_update"
on public.media_library
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'vipulkumar.quant@gmail.com'
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'vipulkumar.quant@gmail.com'
);

drop policy if exists "media_library_admin_delete" on public.media_library;
create policy "media_library_admin_delete"
on public.media_library
for delete
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'vipulkumar.quant@gmail.com'
);

drop policy if exists "promo_codes_select_active_for_authenticated" on public.promo_codes;
create policy "promo_codes_select_active_for_authenticated"
on public.promo_codes
for select
to authenticated
using (
  is_active = true
  or lower(coalesce(auth.jwt() ->> 'email', '')) = 'vipulkumar.quant@gmail.com'
);

commit;
