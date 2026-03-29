-- 1) Members and roles in a tenant
select
  o.slug as org,
  u.email,
  r.key as role
from organization_members om
join organizations o on o.id = om.organization_id
join users u on u.id = om.user_id
left join member_roles mr on mr.member_id = om.id
left join roles r on r.id = mr.role_id
where o.slug = 'acme'
order by u.email;

-- 2) Open invoices per organization
select
  o.name,
  count(i.id) as open_invoices,
  coalesce(sum(i.amount_cents), 0) / 100.0 as open_amount
from organizations o
join subscriptions s on s.organization_id = o.id
left join invoices i on i.subscription_id = s.id and i.status = 'open'
group by o.id
order by open_amount desc;

-- 3) Active subscriptions with next renewal date
select
  o.slug,
  s.status,
  s.current_period_end
from subscriptions s
join organizations o on o.id = s.organization_id
where s.status in ('trialing', 'active')
order by s.current_period_end;
