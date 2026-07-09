-- Run once in Supabase SQL Editor (Project > SQL Editor > New query).
-- Adds stock tracking to products (in_stock becomes derived from
-- stock_quantity instead of a manually-set flag), and creates the storage
-- bucket the new /admin panel uploads product photos to.

alter table products add column if not exists stock_quantity integer not null default 20;

alter table products drop column if exists in_stock;
alter table products add column in_stock boolean generated always as (stock_quantity > 0) stored;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
