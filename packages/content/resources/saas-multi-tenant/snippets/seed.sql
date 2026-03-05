insert into users (email, full_name)
values
  ('owner@acme.dev', 'Acme Owner'),
  ('admin@acme.dev', 'Acme Admin'),
  ('analyst@acme.dev', 'Acme Analyst');

insert into organizations (slug, name, plan)
values
  ('acme', 'Acme Inc', 'pro');

insert into organization_members (organization_id, user_id)
values
  (1, 1),
  (1, 2),
  (1, 3);

insert into roles (organization_id, key, description)
values
  (1, 'owner', 'Organization owner'),
  (1, 'admin', 'Workspace administrator'),
  (1, 'viewer', 'Read only access');

insert into member_roles (member_id, role_id)
values
  (1, 1),
  (2, 2),
  (3, 3);

insert into subscriptions (organization_id, provider, provider_ref, status, current_period_end)
values
  (1, 'stripe', 'sub_001', 'active', now() + interval '30 days');

insert into invoices (subscription_id, amount_cents, status, issued_at, paid_at)
values
  (1, 9900, 'paid', now() - interval '10 days', now() - interval '9 days'),
  (1, 9900, 'open', now(), null);
