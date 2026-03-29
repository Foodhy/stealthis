create table users (
  id bigint primary key generated always as identity,
  email text not null unique,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table seller_profiles (
  id bigint primary key generated always as identity,
  user_id bigint not null unique references users(id) on delete cascade,
  store_name text not null,
  status text not null check (status in ('active','suspended','pending')),
  created_at timestamptz not null default now()
);

create table listings (
  id bigint primary key generated always as identity,
  seller_id bigint not null references seller_profiles(id) on delete cascade,
  title text not null,
  price_cents integer not null check (price_cents >= 0),
  quantity_available integer not null default 0 check (quantity_available >= 0),
  status text not null check (status in ('draft','active','archived')),
  created_at timestamptz not null default now()
);

create table orders (
  id bigint primary key generated always as identity,
  buyer_id bigint not null references users(id),
  status text not null check (status in ('pending','paid','fulfilled','cancelled')),
  total_cents integer not null default 0 check (total_cents >= 0),
  created_at timestamptz not null default now()
);

create table order_items (
  id bigint primary key generated always as identity,
  order_id bigint not null references orders(id) on delete cascade,
  listing_id bigint not null references listings(id),
  seller_id bigint not null references seller_profiles(id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);

create table payouts (
  id bigint primary key generated always as identity,
  seller_id bigint not null references seller_profiles(id),
  amount_cents integer not null check (amount_cents >= 0),
  status text not null check (status in ('pending','paid','failed')),
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now()
);

create index idx_listings_seller_status on listings(seller_id, status);
create index idx_orders_buyer_created on orders(buyer_id, created_at desc);
create index idx_order_items_seller on order_items(seller_id);
