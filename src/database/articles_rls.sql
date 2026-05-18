alter table public.articles enable row level security;

drop policy if exists "articles_select_public_or_owner_or_admin" on public.articles;
create policy "articles_select_public_or_owner_or_admin"
on public.articles
for select
using (
  status = 'published'
  or auth.uid() = user_id
  or (auth.jwt() ->> 'email') = 'vipulkumar.quant@gmail.com'
);

drop policy if exists "articles_insert_owner_or_admin" on public.articles;
create policy "articles_insert_owner_or_admin"
on public.articles
for insert
with check (
  auth.uid() = user_id
  or (auth.jwt() ->> 'email') = 'vipulkumar.quant@gmail.com'
);

drop policy if exists "articles_update_owner_or_admin" on public.articles;
create policy "articles_update_owner_or_admin"
on public.articles
for update
using (
  auth.uid() = user_id
  or (auth.jwt() ->> 'email') = 'vipulkumar.quant@gmail.com'
)
with check (
  auth.uid() = user_id
  or (auth.jwt() ->> 'email') = 'vipulkumar.quant@gmail.com'
);

drop policy if exists "articles_delete_owner_or_admin" on public.articles;
create policy "articles_delete_owner_or_admin"
on public.articles
for delete
using (
  auth.uid() = user_id
  or (auth.jwt() ->> 'email') = 'vipulkumar.quant@gmail.com'
);
