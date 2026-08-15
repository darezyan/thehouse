-- Run once in Supabase SQL Editor (Project > SQL Editor > New query).
-- Switches payment tracking from Flutterwave to Paystack: payment_ref
-- already holds our own reference (used as-is by Paystack), so only the
-- gateway's own transaction id column needs renaming.

alter table orders rename column flw_transaction_id to paystack_transaction_id;
