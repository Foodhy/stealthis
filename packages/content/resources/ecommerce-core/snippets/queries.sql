-- 1) Top selling products by quantity
select
  p.sku,
  p.name,
  sum(oi.quantity) as units_sold
from order_items oi
join products p on p.id = oi.product_id
join orders o on o.id = oi.order_id
where o.status in ('paid', 'shipped')
group by p.id
order by units_sold desc;

-- 2) Revenue by day
select
  date_trunc('day', o.created_at) as day,
  sum(o.total_cents) / 100.0 as revenue_usd
from orders o
where o.status in ('paid', 'shipped')
group by day
order by day desc;

-- 3) User purchase history
select
  o.id as order_id,
  o.status,
  o.total_cents,
  o.created_at
from orders o
where o.user_id = 1
order by o.created_at desc;
