# Supabase Schema

## Importation
1. Ouvrir Supabase Dashboard
2. SQL Editor → New Query
3. Copier le contenu de `schema.sql`
4. Exécuter

## Sécurité
⚠️ Actuellement, les politiques RLS autorisent `anon` (public). 
À modifier en production pour utiliser `authenticated`.

## Structure
- `documents` : Stockage des documents avec ID unique
- `content` : Contenu encodé en Base64 (ou texte)
- `created_at` / `updated_at` : Timestamps automatiques