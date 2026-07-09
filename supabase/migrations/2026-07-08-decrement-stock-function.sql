-- Run once in Supabase SQL Editor (Project > SQL Editor > New query).
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
