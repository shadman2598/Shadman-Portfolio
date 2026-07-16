-- Supabase Storage setup for Shadman Portfolio
-- Run this in: Supabase Dashboard → SQL Editor → New query

-- Public buckets for portfolio media
insert into storage.buckets (id, name, public)
values
  ('photos', 'photos', true),
  ('scripts', 'scripts', true)
on conflict (id) do update set public = true;

-- Allow anyone to view files (needed for GitHub Pages visitors)
create policy "Public read photos"
on storage.objects for select
using (bucket_id = 'photos');

create policy "Public read scripts"
on storage.objects for select
using (bucket_id = 'scripts');

-- Allow uploads via the anon key from your portfolio site
-- Note: anyone with your public site can upload. Tighten later with auth if needed.
create policy "Public upload photos"
on storage.objects for insert
with check (bucket_id = 'photos');

create policy "Public upload scripts"
on storage.objects for insert
with check (bucket_id = 'scripts');

-- Allow deletes from the portfolio UI
create policy "Public delete photos"
on storage.objects for delete
using (bucket_id = 'photos');

create policy "Public delete scripts"
on storage.objects for delete
using (bucket_id = 'scripts');
