create table users (
  id bigint primary key generated always as identity,
  email text not null unique,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table organizations (
  id bigint primary key generated always as identity,
  slug text not null unique,
  name text not null,
  plan text not null check (plan in ('free','pro','enterprise')),
  created_at timestamptz not null default now()
);

create table organization_members (
  id bigint primary key generated always as identity,
  organization_id bigint not null references organizations(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table roles (
  id bigint primary key generated always as identity,
  organization_id bigint not null references organizations(id) on delete cascade,
  key text not null,
  description text,
  unique (organization_id, key)
);

create table member_roles (
  member_id bigint not null references organization_members(id) on delete cascade,
  role_id bigint not null references roles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (member_id, role_id)
);

create table subscriptions (
  id bigint primary key generated always as identity,
  organization_id bigint not null unique references organizations(id) on delete cascade,
  provider text not null,
  provider_ref text not null,
  status text not null check (status in ('trialing','active','past_due','cancelled')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table invoices (
  id bigint primary key generated always as identity,
  subscription_id bigint not null references subscriptions(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null check (status in ('open','paid','failed','void')),
  issued_at timestamptz not null default now(),
  paid_at timestamptz
);

create index idx_org_members_user on organization_members(user_id);
create index idx_invoices_subscription_issued on invoices(subscription_id, issued_at desc);
