-- Run once in Supabase SQL Editor (Project > SQL Editor > New query).
-- Adds: multi-image galleries (image_urls[] replacing image_url), a
-- discount_percent field, and optional per-product colors[]. Also adds a
-- color column to order_items so admin can see what color was ordered.

alter table products add column if not exists image_urls text[] not null default '{}';

update products
set image_urls = array[image_url]
where image_urls = '{}' and image_url is not null;

alter table products drop column if exists image_url;

alter table products add column if not exists discount_percent int not null default 0;
alter table products add constraint products_discount_percent_range
  check (discount_percent >= 0 and discount_percent <= 100);

alter table products add column if not exists colors text[] not null default '{}';

alter table order_items add column if not exists color text;
