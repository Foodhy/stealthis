insert into resources (name, kind, timezone)
values
  ('Room A', 'room', 'UTC'),
  ('Room B', 'room', 'UTC');

insert into customers (email, full_name, phone)
values
  ('elena@book.dev', 'Elena Ruiz', '+57-301-000-1000'),
  ('marco@book.dev', 'Marco Silva', '+57-301-000-1001');

insert into availability_slots (resource_id, starts_at, ends_at, capacity)
values
  (1, now() + interval '1 day', now() + interval '1 day 1 hour', 4),
  (1, now() + interval '1 day 2 hours', now() + interval '1 day 3 hours', 4),
  (2, now() + interval '1 day', now() + interval '1 day 1 hour', 2);

insert into reservations (slot_id, customer_id, quantity, status)
values
  (1, 1, 2, 'confirmed'),
  (3, 2, 1, 'pending');

insert into reservation_payments (reservation_id, amount_cents, status, provider)
values
  (1, 5000, 'captured', 'stripe');
