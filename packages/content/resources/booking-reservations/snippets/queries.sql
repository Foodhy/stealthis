-- 1) Slot occupancy
select
  s.id as slot_id,
  r.name as resource_name,
  s.capacity,
  coalesce(sum(case when rv.status in ('pending', 'confirmed') then rv.quantity else 0 end), 0) as reserved_qty,
  s.capacity - coalesce(sum(case when rv.status in ('pending', 'confirmed') then rv.quantity else 0 end), 0) as available_qty
from availability_slots s
join resources r on r.id = s.resource_id
left join reservations rv on rv.slot_id = s.id
group by s.id, r.name
order by s.starts_at;

-- 2) Customer reservation history
select
  rv.id,
  rv.status,
  s.starts_at,
  s.ends_at,
  r.name as resource_name
from reservations rv
join availability_slots s on s.id = rv.slot_id
join resources r on r.id = s.resource_id
where rv.customer_id = 1
order by rv.created_at desc;

-- 3) Revenue captured by day
select
  date_trunc('day', rp.created_at) as day,
  sum(rp.amount_cents) / 100.0 as captured_usd
from reservation_payments rp
where rp.status = 'captured'
group by day
order by day desc;
