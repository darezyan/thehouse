-- Run once in Supabase SQL Editor (Project > SQL Editor > New query).
-- Adds Flutterwave payment tracking to orders: an order starts 'pending' and
-- moves to 'paid'/'failed' once the checkout callback page or the
-- Flutterwave webhook verifies the transaction server-side.

alter table orders add column if not exists email text not null default '';
alter table orders add column if not exists payment_status text not null default 'pending';
alter table orders add column if not exists payment_ref text;
alter table orders add column if not exists flw_transaction_id text;
