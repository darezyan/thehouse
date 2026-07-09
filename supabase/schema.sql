-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- No auth is used anywhere: products are public-read, orders/order_items are public-insert only.

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null,
  image_url text not null,
  -- e.g. {"S": 5, "M": 10, "L": 0}. A size is only shown to customers when
  -- its quantity is > 0; the whole product is out of stock when every size is.
  size_quantities jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null default '',
  phone text not null,
  address text not null,
  city text not null,
  state text not null default '',
  delivery_fee numeric(10,2) not null default 0,
  notes text,
  total numeric(10,2) not null,
  status text not null default 'pending',
  -- Flutterwave payment tracking. payment_status moves pending -> paid/failed
  -- once the callback page or webhook verifies the transaction server-side.
  payment_status text not null default 'pending',
  payment_ref text,
  flw_transaction_id text,
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

-- Single-row settings table (id is pinned to 1) so the delivery fees are
-- editable from /nimda/delivery instead of being hardcoded.
create table if not exists delivery_settings (
  id int primary key default 1,
  lagos_fee numeric(10,2) not null default 5000,
  other_states_fee numeric(10,2) not null default 10000,
  updated_at timestamptz not null default now(),
  constraint delivery_settings_single_row check (id = 1)
);

insert into delivery_settings (id, lagos_fee, other_states_fee)
values (1, 5000, 10000)
on conflict (id) do nothing;

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table delivery_settings enable row level security;

-- Anyone can read the current delivery fees (needed to show them at checkout).
create policy "delivery settings are publicly readable"
  on delivery_settings for select
  using (true);

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

-- Storage bucket for admin-uploaded product photos (public read; writes go
-- through the service role key only, from the /admin panel).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Atomically decrements one size's stock when an order is confirmed paid.
-- Doing the arithmetic inside the UPDATE (rather than reading the value in
-- application code, then writing it back) means concurrent decrements for
-- the same product can't race each other and clobber one another's result.
create or replace function decrement_size_stock(p_product_id uuid, p_size text, p_quantity int)
returns void
language sql
as $$
  update products
  set size_quantities = jsonb_set(
    coalesce(size_quantities, '{}'::jsonb),
    array[p_size],
    to_jsonb(greatest(0, coalesce((size_quantities->>p_size)::int, 0) - p_quantity))
  )
  where id = p_product_id;
$$;

-- "Last Dance" World Cup capsule. image_url paths are served from /public/products.
insert into products (name, description, price, image_url, size_quantities) values
  ('Last Dance Graphic Tee', 'Inspired by the players who shaped a generation''s football experience: Messi, Ronaldo, and Neymar. This is their last World Cup, and the end of an illustrious career.', 15000, '/products/last-dance-graphic-tee.jpg', '{"S":20,"M":20,"L":20,"XL":20,"2XL":20}'),
  ('Portugal B&W Ringer Tee (LD-01)', 'Inspired by the greatest goalscorer of all time, Cristiano Ronaldo, marking his last World Cup.', 17000, '/products/portugal-bw-ringer-tee.jpg', '{"S":20,"M":20,"L":20,"XL":20,"2XL":20}'),
  ('Argentina Ringer Tee (LD-02)', 'Inspired by the GOAT, Lionel Messi, and the legends before him. The dates signify Argentina''s World Cup win years.', 17000, '/products/argentina-ringer-tee.jpg', '{"M":20,"L":20,"XL":20,"2XL":20}'),
  ('Brasil Ringer Tee (LD-03)', 'Inspired by the prince who never became king, Neymar Jr., as this might mark his last World Cup.', 17000, '/products/brasil-ringer-tee.jpg', '{"M":20,"L":20,"XL":20,"2XL":20}');
