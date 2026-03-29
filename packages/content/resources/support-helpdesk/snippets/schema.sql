create table users (
  id bigint primary key generated always as identity,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('customer','agent','admin')),
  created_at timestamptz not null default now()
);

create table sla_policies (
  id bigint primary key generated always as identity,
  name text not null unique,
  first_response_minutes integer not null check (first_response_minutes > 0),
  resolution_minutes integer not null check (resolution_minutes > 0)
);

create table tickets (
  id bigint primary key generated always as identity,
  customer_id bigint not null references users(id),
  assignee_id bigint references users(id),
  sla_policy_id bigint references sla_policies(id),
  subject text not null,
  priority text not null check (priority in ('low','med','high','urgent')),
  status text not null check (status in ('new','open','pending','resolved','closed')),
  first_response_due_at timestamptz,
  resolution_due_at timestamptz,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table ticket_comments (
  id bigint primary key generated always as identity,
  ticket_id bigint not null references tickets(id) on delete cascade,
  author_id bigint not null references users(id),
  body text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table ticket_status_history (
  id bigint primary key generated always as identity,
  ticket_id bigint not null references tickets(id) on delete cascade,
  changed_by bigint not null references users(id),
  old_status text,
  new_status text not null,
  changed_at timestamptz not null default now()
);

create index idx_tickets_assignee_status on tickets(assignee_id, status);
create index idx_tickets_priority_due on tickets(priority, resolution_due_at);
create index idx_ticket_comments_ticket_created on ticket_comments(ticket_id, created_at);
