create table resources (
  id bigint primary key generated always as identity,
  name text not null,
  kind text not null check (kind in ('room','seat','vehicle','service')),
  timezone text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table customers (
  id bigint primary key generated always as identity,
  email text not null unique,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table availability_slots (
  id bigint primary key generated always as identity,
  resource_id bigint not null references resources(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null default 1 check (capacity > 0),
  check (ends_at > starts_at),
  unique (resource_id, starts_at, ends_at)
);

create table reservations (
  id bigint primary key generated always as identity,
  slot_id bigint not null references availability_slots(id) on delete cascade,
  customer_id bigint not null references customers(id),
  quantity integer not null default 1 check (quantity > 0),
  status text not null check (status in ('pending','confirmed','cancelled','no_show')),
  created_at timestamptz not null default now()
);

create table reservation_payments (
  id bigint primary key generated always as identity,
  reservation_id bigint not null unique references reservations(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null check (status in ('authorized','captured','failed','refunded')),
  provider text not null,
  created_at timestamptz not null default now()
);

create index idx_slots_resource_start on availability_slots(resource_id, starts_at);
create index idx_reservations_customer_created on reservations(customer_id, created_at desc);
