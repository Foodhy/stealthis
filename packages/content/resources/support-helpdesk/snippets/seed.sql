insert into users (email, full_name, role)
values
  ('customer1@help.dev', 'Customer One', 'customer'),
  ('agent1@help.dev', 'Agent One', 'agent'),
  ('agent2@help.dev', 'Agent Two', 'agent');

insert into sla_policies (name, first_response_minutes, resolution_minutes)
values
  ('Standard', 240, 2880),
  ('Priority', 60, 720);

insert into tickets (
  customer_id,
  assignee_id,
  sla_policy_id,
  subject,
  priority,
  status,
  first_response_due_at,
  resolution_due_at
)
values
  (1, 2, 2, 'Cannot complete checkout', 'urgent', 'open', now() + interval '1 hour', now() + interval '12 hours'),
  (1, 3, 1, 'Invoice PDF is blank', 'med', 'pending', now() + interval '4 hours', now() + interval '2 days');

insert into ticket_comments (ticket_id, author_id, body, is_internal)
values
  (1, 1, 'Checkout fails after card submission.', false),
  (1, 2, 'Investigating payment gateway logs.', true),
  (2, 1, 'Attached screenshot with issue.', false);

insert into ticket_status_history (ticket_id, changed_by, old_status, new_status)
values
  (1, 2, 'new', 'open'),
  (2, 3, 'new', 'pending');
