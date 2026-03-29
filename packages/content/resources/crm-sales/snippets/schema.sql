create table users (
  id bigint primary key generated always as identity,
  email text not null unique,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table leads (
  id bigint primary key generated always as identity,
  source text not null,
  full_name text not null,
  email text,
  company_name text,
  status text not null check (status in ('new','qualified','disqualified')),
  owner_id bigint references users(id),
  created_at timestamptz not null default now()
);

create table accounts (
  id bigint primary key generated always as identity,
  name text not null,
  industry text,
  owner_id bigint references users(id),
  created_at timestamptz not null default now()
);

create table contacts (
  id bigint primary key generated always as identity,
  account_id bigint not null references accounts(id) on delete cascade,
  full_name text not null,
  email text,
  title text,
  created_at timestamptz not null default now()
);

create table deals (
  id bigint primary key generated always as identity,
  account_id bigint not null references accounts(id),
  owner_id bigint not null references users(id),
  name text not null,
  stage text not null check (stage in ('prospecting','proposal','negotiation','won','lost')),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  expected_close_date date,
  created_at timestamptz not null default now()
);

create table activities (
  id bigint primary key generated always as identity,
  deal_id bigint references deals(id) on delete cascade,
  lead_id bigint references leads(id) on delete cascade,
  user_id bigint not null references users(id),
  type text not null check (type in ('call','email','meeting','note')),
  summary text not null,
  happened_at timestamptz not null,
  created_at timestamptz not null default now(),
  check ((deal_id is not null) or (lead_id is not null))
);

create index idx_leads_owner_status on leads(owner_id, status);
create index idx_deals_owner_stage on deals(owner_id, stage);
create index idx_activities_happened_at on activities(happened_at desc);
