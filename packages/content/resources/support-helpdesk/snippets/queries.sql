-- 1) Open tickets breaching first response SLA
select
  t.id,
  t.subject,
  t.priority,
  t.first_response_due_at,
  u.email as assignee_email
from tickets t
left join users u on u.id = t.assignee_id
where t.status in ('new', 'open')
  and t.first_response_due_at is not null
  and t.first_response_due_at < now()
order by t.first_response_due_at;

-- 2) Agent workload by status
select
  u.email,
  t.status,
  count(*) as ticket_count
from tickets t
join users u on u.id = t.assignee_id
group by u.email, t.status
order by u.email, t.status;

-- 3) Average resolution time for resolved tickets
select
  round(avg(extract(epoch from (t.resolved_at - t.created_at)) / 3600)::numeric, 2) as avg_resolution_hours
from tickets t
where t.status in ('resolved', 'closed')
  and t.resolved_at is not null;
