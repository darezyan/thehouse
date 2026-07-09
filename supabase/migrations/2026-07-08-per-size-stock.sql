-- Run once in Supabase SQL Editor (Project > SQL Editor > New query).
-- Replaces the single stock_quantity/sizes[] pair with one size_quantities
-- jsonb column (e.g. {"S": 5, "M": 10, "L": 0}), so each size can be tracked
-- and go out of stock independently.

alter table products add column if not exists size_quantities jsonb not null default '{}';

-- Backfill: every currently-listed size gets the product's existing total
-- quantity. Edit real per-size counts afterwards from /nimda/products.
update products
set size_quantities = (
  select coalesce(jsonb_object_agg(s, stock_quantity), '{}'::jsonb)
  from unnest(sizes) as s
)
where size_quantities = '{}'::jsonb;

alter table products drop column if exists in_stock;
alter table products drop column if exists stock_quantity;
alter table products drop column if exists sizes;
