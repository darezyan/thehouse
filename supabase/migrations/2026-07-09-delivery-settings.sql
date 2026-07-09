-- Run once in Supabase SQL Editor (Project > SQL Editor > New query).
-- Makes delivery fees editable from /nimda/delivery instead of hardcoded.
-- Seeded with the current values (5000 for Lagos, 10000 elsewhere) so this
-- is a no-op for pricing until an admin changes it.

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

alter table delivery_settings enable row level security;

create policy "delivery settings are publicly readable"
  on delivery_settings for select
  using (true);
