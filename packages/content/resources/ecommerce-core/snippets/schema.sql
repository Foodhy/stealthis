create table users (
  id bigint primary key generated always as identity,
  email text not null unique,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table products (
  id bigint primary key generated always as identity,
  sku text not null unique,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table inventories (
  product_id bigint primary key references products(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now()
);

create table orders (
  id bigint primary key generated always as identity,
  user_id bigint not null references users(id),
  status text not null check (status in ('pending','paid','shipped','cancelled')),
  total_cents integer not null default 0 check (total_cents >= 0),
  created_at timestamptz not null default now()
);

create table order_items (
  id bigint primary key generated always as identity,
  order_id bigint not null references orders(id) on delete cascade,
  product_id bigint not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  unique (order_id, product_id)
);

create table payments (
  id bigint primary key generated always as identity,
  order_id bigint not null unique references orders(id) on delete cascade,
  provider text not null,
  provider_ref text not null,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null check (status in ('authorized','captured','failed','refunded')),
  created_at timestamptz not null default now()
);

create index idx_orders_user_id_created_at on orders(user_id, created_at desc);
create index idx_order_items_product_id on order_items(product_id);
create index idx_payments_status on payments(status);
