-- 📁 supabase/schema.sql

-- 1. Création de la table
-- Version simplifiée sans conversion
create table documents (
    id text primary key,
    content text not null,  -- Directement en text
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Ajout d'un trigger pour mettre à jour updated_at automatiquement
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_documents_updated_at
before update on documents
for each row
execute function update_updated_at_column();

-- 3. Activation RLS
alter table documents enable row level security;

-- 4. Politiques de sécurité (ANON = public)
-- Pour utilisateurs authentifiés uniquement
create policy "allow auth users select documents"
on public.documents
as permissive
for select
to authenticated  -- au lieu de "anon"
using (true);

-- create policy "allow anon insert documents"
-- on public.documents
-- as permissive
-- for insert
-- to anon
-- with check (true);

-- create policy "allow anon update documents"
-- on public.documents
-- as permissive
-- for update
-- to anon
-- using (true)
-- with check (true);

-- create policy "allow anon select documents"
-- on public.documents
-- as permissive
-- for select
-- to anon
-- using (true);