-- Run once in Supabase SQL Editor (Project > SQL Editor > New query).
-- Reverts payment tracking back to Flutterwave: undoes the rename made in
-- 2026-08-06-paystack-payments.sql.

alter table orders rename column paystack_transaction_id to flw_transaction_id;
