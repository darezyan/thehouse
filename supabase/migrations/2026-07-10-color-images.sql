-- Run once in Supabase SQL Editor (Project > SQL Editor > New query).
-- Adds one required photo per color, e.g. {"Black": "https://...jpg"}.

alter table products add column if not exists color_images jsonb not null default '{}';
