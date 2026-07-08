-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- No auth is used anywhere: products are public-read, orders/order_items are public-insert only.

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null,
  image_url text not null,
  sizes text[] not null default '{}',
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  notes text,
  total numeric(10,2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  size text,
  quantity int not null,
  unit_price numeric(10,2) not null
);

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Anyone can browse the catalog.
create policy "products are publicly readable"
  on products for select
  using (true);

-- Anyone can place an order, but no one (besides the dashboard/service role) can read, edit, or delete orders.
create policy "anyone can create an order"
  on orders for insert
  with check (true);

create policy "anyone can create order items"
  on order_items for insert
  with check (true);

-- Sample products so the shop isn't empty. Swap image_url for your own product photos.
insert into products (name, description, price, image_url, sizes) values
  ('Oversized Cotton Tee', 'A relaxed, heavyweight cotton t-shirt with a boxy fit. Garment-dyed for a soft, lived-in feel.', 15000, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', array['S','M','L','XL']),
  ('Straight Leg Denim', 'Mid-rise straight leg jeans in rigid indigo denim. Built to fade with wear.', 28000, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800', array['28','30','32','34','36']),
  ('Utility Overshirt', 'A sturdy cotton-twill overshirt with chest pockets. Layer it open or buttoned up.', 32000, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800', array['S','M','L','XL']),
  ('Ribbed Knit Sweater', 'Soft ribbed-knit sweater with a crew neck. Runs true to size.', 24000, 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800', array['S','M','L']),
  ('Track Pants', 'Tapered track pants in brushed-back fleece with side stripes.', 19000, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800', array['S','M','L','XL']),
  ('Canvas Bucket Hat', 'Sturdy cotton canvas bucket hat with a wide brim.', 8000, 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800', array['One Size']);
