-- 1) Gross merchandise value by seller
select
  sp.store_name,
  sum(oi.quantity * oi.unit_price_cents) / 100.0 as gmv_usd
from order_items oi
join seller_profiles sp on sp.id = oi.seller_id
join orders o on o.id = oi.order_id
where o.status in ('paid', 'fulfilled')
group by sp.id
order by gmv_usd desc;

-- 2) Top listings by units sold
select
  l.id,
  l.title,
  sum(oi.quantity) as units_sold
from order_items oi
join listings l on l.id = oi.listing_id
group by l.id
order by units_sold desc;

-- 3) Pending payouts
select
  sp.store_name,
  p.amount_cents / 100.0 as amount_usd,
  p.period_start,
  p.period_end
from payouts p
join seller_profiles sp on sp.id = p.seller_id
where p.status = 'pending'
order by p.created_at desc;
