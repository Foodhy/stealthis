-- 1) Pipeline value by stage
select
  stage,
  count(*) as deals,
  sum(amount_cents) / 100.0 as amount_usd
from deals
group by stage
order by amount_usd desc;

-- 2) Activity volume per rep (last 30 days)
select
  u.email,
  count(a.id) as activities_30d
from users u
left join activities a
  on a.user_id = u.id
 and a.happened_at >= now() - interval '30 days'
group by u.id
order by activities_30d desc;

-- 3) Open deals ordered by expected close date
select
  d.id,
  d.name,
  d.stage,
  d.expected_close_date,
  a.name as account_name
from deals d
join accounts a on a.id = d.account_id
where d.stage not in ('won', 'lost')
order by d.expected_close_date nulls last;
