insert into users (email, full_name)
values
  ('sales1@crm.dev', 'Sales Rep 1'),
  ('sales2@crm.dev', 'Sales Rep 2');

insert into leads (source, full_name, email, company_name, status, owner_id)
values
  ('linkedin', 'Mia Ortiz', 'mia@northwind.com', 'Northwind', 'qualified', 1),
  ('webinar', 'Ivan Lee', 'ivan@globex.com', 'Globex', 'new', 2);

insert into accounts (name, industry, owner_id)
values
  ('Northwind', 'Logistics', 1),
  ('Globex', 'Manufacturing', 2);

insert into contacts (account_id, full_name, email, title)
values
  (1, 'Mia Ortiz', 'mia@northwind.com', 'Head of Ops'),
  (2, 'Ivan Lee', 'ivan@globex.com', 'CTO');

insert into deals (account_id, owner_id, name, stage, amount_cents, expected_close_date)
values
  (1, 1, 'Northwind Annual Plan', 'proposal', 240000, current_date + 20),
  (2, 2, 'Globex Pilot', 'prospecting', 60000, current_date + 35);

insert into activities (deal_id, user_id, type, summary, happened_at)
values
  (1, 1, 'meeting', 'Proposal walkthrough completed', now() - interval '2 days'),
  (2, 2, 'call', 'Qualification call done', now() - interval '1 day');
