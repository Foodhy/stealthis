insert into users (email, full_name)
values
  ('ana@example.com', 'Ana Gomez'),
  ('leo@example.com', 'Leo Cruz');

insert into products (sku, name, price_cents)
values
  ('TSHIRT-BLK-M', 'Black T-Shirt M', 2599),
  ('HOODIE-NVY-L', 'Navy Hoodie L', 4999),
  ('CAP-GRY-ONE', 'Grey Cap', 1899);

insert into inventories (product_id, quantity)
values
  (1, 42),
  (2, 18),
  (3, 70);

insert into orders (user_id, status, total_cents)
values
  (1, 'paid', 7598),
  (2, 'pending', 1899);

insert into order_items (order_id, product_id, quantity, unit_price_cents)
values
  (1, 1, 1, 2599),
  (1, 2, 1, 4999),
  (2, 3, 1, 1899);

insert into payments (order_id, provider, provider_ref, amount_cents, status)
values
  (1, 'stripe', 'pi_001', 7598, 'captured');
