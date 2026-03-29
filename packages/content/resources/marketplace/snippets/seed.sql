insert into users (email, full_name)
values
  ('buyer1@market.dev', 'Buyer One'),
  ('seller1@market.dev', 'Seller One'),
  ('seller2@market.dev', 'Seller Two');

insert into seller_profiles (user_id, store_name, status)
values
  (2, 'One Crafts', 'active'),
  (3, 'Two Studio', 'active');

insert into listings (seller_id, title, price_cents, quantity_available, status)
values
  (1, 'Handmade Desk Lamp', 8900, 12, 'active'),
  (2, 'Ceramic Coffee Mug', 2400, 40, 'active');

insert into orders (buyer_id, status, total_cents)
values
  (1, 'paid', 11300);

insert into order_items (order_id, listing_id, seller_id, quantity, unit_price_cents)
values
  (1, 1, 1, 1, 8900),
  (1, 2, 2, 1, 2400);

insert into payouts (seller_id, amount_cents, status, period_start, period_end)
values
  (1, 7800, 'pending', current_date - 7, current_date),
  (2, 2000, 'pending', current_date - 7, current_date);
