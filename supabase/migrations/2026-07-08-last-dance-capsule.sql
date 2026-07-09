-- Run once in Supabase SQL Editor (Project > SQL Editor > New query).
-- Adds state/delivery_fee to orders, and swaps the placeholder catalog
-- for the real "Last Dance" World Cup capsule products.

alter table orders add column if not exists state text not null default '';
alter table orders add column if not exists delivery_fee numeric(10,2) not null default 0;

delete from products;

insert into products (name, description, price, image_url, sizes) values
  ('Last Dance Graphic Tee', 'Inspired by the players who shaped a generation''s football experience: Messi, Ronaldo, and Neymar. This is their last World Cup, and the end of an illustrious career.', 15000, '/products/last-dance-graphic-tee.jpg', array['S','M','L','XL','2XL']),
  ('Portugal B&W Ringer Tee (LD-01)', 'Inspired by the greatest goalscorer of all time, Cristiano Ronaldo, marking his last World Cup.', 17000, '/products/portugal-bw-ringer-tee.jpg', array['S','M','L','XL','2XL']),
  ('Argentina Ringer Tee (LD-02)', 'Inspired by the GOAT, Lionel Messi, and the legends before him. The dates signify Argentina''s World Cup win years.', 17000, '/products/argentina-ringer-tee.jpg', array['M','L','XL','2XL']),
  ('Brasil Ringer Tee (LD-03)', 'Inspired by the prince who never became king, Neymar Jr., as this might mark his last World Cup.', 17000, '/products/brasil-ringer-tee.jpg', array['M','L','XL','2XL']);
