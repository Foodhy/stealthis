-- 1) Enrollment count per course
select
  c.slug,
  c.title,
  count(e.id) as enrolled_students
from courses c
left join enrollments e on e.course_id = c.id and e.status <> 'cancelled'
group by c.id
order by enrolled_students desc;

-- 2) Student completion rate in a course
select
  e.id as enrollment_id,
  u.email as student_email,
  round(avg(lp.progress_percent)::numeric, 2) as avg_progress
from enrollments e
join users u on u.id = e.student_id
left join lesson_progress lp on lp.enrollment_id = e.id
where e.course_id = 1
group by e.id, u.email
order by avg_progress desc;

-- 3) Lessons with lowest completion
select
  l.slug,
  l.title,
  round(avg(lp.progress_percent)::numeric, 2) as avg_progress
from lesson_progress lp
join lessons l on l.id = lp.lesson_id
group by l.id
order by avg_progress asc;
